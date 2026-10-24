// Zero-dependency static site builder for the Prosun Energy website.
//
//   node build.mjs           → builds src/ + public/ into dist/
//   node build.mjs --serve   → builds, then serves dist/ on http://localhost:8080
//
// Page files live in src/pages. Each starts with a metadata comment:
//   <!--page {"title": "...", "description": "...", "nav": "services"} -->
// Partials live in src/partials and are included with {{> name key="value"}}.
// Responsive images are written as <x-img name="file-stem" alt="..." sizes="..."> and
// expanded to <picture> elements using dimensions from src/images.json.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist');

// Canonical production origin. Change this if the new site launches on a different domain.
const SITE_URL = (process.env.SITE_URL || 'https://prosunindia.com').replace(/\/$/, '');

const images = JSON.parse(readFileSync(join(SRC, 'images.json'), 'utf8'));
const partials = Object.fromEntries(
  readdirSync(join(SRC, 'partials'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace(/\.html$/, ''), readFileSync(join(SRC, 'partials', f), 'utf8')])
);

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function parseAttrs(str) {
  const attrs = {};
  for (const m of str.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[m[1]] = m[2] ?? true;
  return attrs;
}

function fill(template, vars) {
  // {{#key}}…{{/key}} renders only when key has a value.
  template = template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, k, inner) => (vars[k] ? inner : ''));
  // {{year}} is resolved once at the end of the build.
  return template.replace(/\{\{(\w+)\}\}/g, (match, k) => (k === 'year' ? match : vars[k] ?? ''));
}

function includePartials(html, depth = 0) {
  if (depth > 5) throw new Error('Partial nesting too deep');
  return html.replace(/\{\{>\s*([\w-]+)([^}]*)\}\}/g, (_, name, rest) => {
    if (!(name in partials)) throw new Error(`Unknown partial: ${name}`);
    return includePartials(fill(partials[name], parseAttrs(rest)), depth + 1);
  });
}

function expandImages(html) {
  return html.replace(/<x-img\s([^>]*?)\/?>/g, (_, rest) => {
    const a = parseAttrs(rest);
    const img = images[a.name];
    if (!img) throw new Error(`Unknown image: ${a.name}`);
    const eager = a.loading === 'eager';
    const base = `/assets/img/${a.name}`;
    return `<picture${a.pclass ? ` class="${a.pclass}"` : ''}>` +
      `<source type="image/webp" srcset="${base}-800.webp 800w, ${base}.webp ${img.w}w" sizes="${a.sizes || '100vw'}">` +
      `<img src="${base}.jpg" width="${img.w}" height="${img.h}" alt="${escapeAttr(a.alt ?? '')}"` +
      `${a.class ? ` class="${a.class}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async"` +
      `${eager ? ' fetchpriority="high"' : ''}>` +
      `</picture>`;
  });
}

function outPathFor(file) {
  const rel = relative(join(SRC, 'pages'), file).replace(/\\/g, '/');
  if (rel === 'index.html' || rel === '404.html') return { out: rel, url: rel === 'index.html' ? '/' : '/404.html' };
  if (rel.endsWith('/index.html')) return { out: rel, url: '/' + rel.replace(/index\.html$/, '') };
  const stem = rel.replace(/\.html$/, '');
  return { out: `${stem}/index.html`, url: `/${stem}/` };
}

// Verified details only. Items marked "Needs company confirmation" in IMPLEMENTATION-NOTES.md
// are intentionally left out of structured data.
const organisationLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#organization`,
  name: 'Prosun Energy Pvt Ltd',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/assets/img/prosun-logo.png`,
  image: `${SITE_URL}/assets/img/og-prosun.jpg`,
  description:
    'Solar EPC company in Coimbatore, Tamil Nadu, delivering solar power projects from engineering and construction to commissioning and operations & maintenance.',
  telephone: '+91-1800-102-3317',
  email: 'info@psun.in',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'No. 116A, Madukkarai Road, Industrial Estate, Kurichi',
    addressLocality: 'Coimbatore',
    addressRegion: 'Tamil Nadu',
    postalCode: '641021',
    addressCountry: 'IN',
  },
  areaServed: { '@type': 'State', name: 'Tamil Nadu' },
  sameAs: [
    'https://www.linkedin.com/company/prosun-energy-private-ltd/',
    'https://www.facebook.com/Prosun-Energy-105173765682306',
  ],
};

function breadcrumbLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE_URL + c.url })),
  };
}

function build() {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true });
  mkdirSync(OUT, { recursive: true });
  cpSync(join(ROOT, 'public'), OUT, { recursive: true });

  const sitemap = [];
  for (const file of walk(join(SRC, 'pages')).filter((f) => f.endsWith('.html'))) {
    const raw = readFileSync(file, 'utf8');
    const m = raw.match(/^<!--page\s+(\{[\s\S]*?\})\s*-->/);
    if (!m) throw new Error(`Missing page metadata in ${file}`);
    const meta = JSON.parse(m[1]);
    const { out, url } = outPathFor(file);

    const jsonld = [organisationLd];
    if (meta.crumbs) jsonld.push(breadcrumbLd([{ name: 'Home', url: '/' }, ...meta.crumbs]));
    if (meta.faq) {
      jsonld.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: meta.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      });
    }

    let header = partials.header;
    if (meta.nav) header = header.replace(`data-nav="${meta.nav}"`, `data-nav="${meta.nav}" aria-current="page"`);
    header = header.replace(`href="${url}" data-sub`, `href="${url}" data-sub aria-current="page"`);

    let html = fill(partials.layout, {
      title: meta.title,
      description: escapeAttr(meta.description),
      canonical: SITE_URL + url,
      ogImage: `${SITE_URL}/assets/img/${meta.ogImage || 'og-prosun.jpg'}`,
      ogType: url === '/' ? 'website' : 'article',
      bodyClass: meta.bodyClass || '',
      robots: meta.noindex ? 'noindex, follow' : 'index, follow',
      jsonld: jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n  '),
      header,
      content: raw.slice(m[0].length),
    });
    if (meta.faq) {
      const faqHtml = meta.faq
        .map(([q, a]) => `<details><summary>${q}</summary><div><p>${a}</p></div></details>`)
        .join('\n          ');
      html = html.replace('{{faq}}', `<div class="faq">\n          ${faqHtml}\n        </div>`);
    }
    html = includePartials(html);
    html = expandImages(html);
    html = html.replace(/\{\{year\}\}/g, String(new Date().getFullYear()));
    // Editorial notes (<!-- VERIFY: ... -->) stay in the source but never ship.
    html = html.replace(/<!--(?!\[)[\s\S]*?-->\n?/g, '');

    const dest = join(OUT, out);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, html);
    if (!meta.noindex) sitemap.push(url);
  }

  writeFileSync(
    join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      sitemap.sort().map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n') +
      `\n</urlset>\n`
  );
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log(`Built ${sitemap.length + 1} pages into dist/`);
}

build();

if (process.argv.includes('--serve')) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml',
    '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
  const port = Number(process.env.PORT || 8080);
  createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = join(OUT, p);
    if (!file.startsWith(OUT)) { res.writeHead(403); return res.end(); }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      if (!p.endsWith('/') && !extname(p) && existsSync(join(OUT, p, 'index.html'))) {
        res.writeHead(301, { Location: p + '/' });
        return res.end();
      }
      res.writeHead(404, { 'Content-Type': types['.html'] });
      return res.end(readFileSync(join(OUT, '404.html')));
    }
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  }).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
}
