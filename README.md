# Prosun Energy website

Static, responsive marketing and lead-generation website for **Prosun Energy Pvt Ltd**, Coimbatore. It is plain HTML, CSS and JavaScript assembled by a small Node build script, with no runtime dependencies and no npm packages to install.

Before launch, read **[IMPLEMENTATION-NOTES.md](IMPLEMENTATION-NOTES.md)**. It lists every fact and asset that still needs company confirmation, and explains how to connect the enquiry form.

## Quick start

Requires Node.js 18 or later.

```bash
npm run dev
```

Builds the site into `dist/` and serves it at <http://localhost:8080>. After editing files, run `npm run build` again and refresh the browser.

```bash
npm run build
```

Production build only. Upload the contents of `dist/` to any static host.

## Project structure

```
build.mjs                 Build script (templating, responsive images, sitemap, robots.txt, dev server)
src/
  pages/                  One file per page; the metadata comment at the top sets title, description, nav and FAQs
    services/             Service detail pages
  partials/               Shared header, footer, enquiry form, project card, icons, layout
  images.json             Image dimensions used to prevent layout shift
public/                   Copied as-is into dist/
  assets/css/styles.css   All styles (colour tokens at the top)
  assets/js/config.js     Form endpoint, analytics IDs, WhatsApp number  <- edit this to go live
  assets/js/main.js       Navigation, form validation and submission, project filters, analytics events
  assets/img/             Optimised images (WebP at 800px and full width, plus a JPEG fallback)
  _redirects              Old WordPress URLs -> new pages (Netlify / Cloudflare Pages)
originals/                Untouched source photos downloaded from prosunindia.com
```

### Editing content

- **Page text:** edit the file in `src/pages/`. Comments such as `<!-- VERIFY: ... -->` are editor notes. They are stripped from the build and never published.
- **Header, footer, contact details:** `src/partials/header.html`, `footer.html` and `enquiry-section.html`.
- **FAQs:** the `"faq"` array in a page's metadata. It renders the visible FAQ and the FAQPage structured data together, so they always match.
- **Adding an image:** put the optimised `name.jpg`, `name.webp` and `name-800.webp` in `public/assets/img/`, add its width and height to `src/images.json`, then use `<x-img name="name" alt="..." sizes="...">` in a page.

To regenerate the images from a new photo:

```bash
cwebp -q 74 photo.jpg -o public/assets/img/name.webp && cwebp -q 72 -resize 800 0 photo.jpg -o public/assets/img/name-800.webp
```

## Deployment

The output in `dist/` is static and works on any host that serves `index.html` for directory URLs: Netlify, Cloudflare Pages, Vercel, GitHub Pages (custom domain at the root), Apache or nginx.

| Host | Build command | Publish directory |
| --- | --- | --- |
| Netlify / Cloudflare Pages | `npm run build` | `dist` |
| Vercel | `npm run build` | `dist` (set "Output Directory") |
| Any web server | run `npm run build` locally | upload `dist/` |

The canonical URL, sitemap and structured data use `https://prosunindia.com`. To launch on a different domain, build with:

```bash
SITE_URL=https://www.example.com npm run build
```

After launch, submit `https://prosunindia.com/sitemap.xml` in Google Search Console.
