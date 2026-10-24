# Implementation notes: Prosun Energy website

Status as of 24 October 2026. Content and assets come from the current site, <https://prosunindia.com/>. Items marked **Needs company confirmation** appear on the current site but have not been confirmed by Prosun. Several conflict with each other on that site, so they need to be confirmed before launch.

---

## 1. What's built

### Pages

| Page | URL | Purpose |
| --- | --- | --- |
| Home | `/` | Hero, trust figures, business and home paths, services, featured projects, NLC PMC feature, process, reasons to choose Prosun, client names, enquiry form |
| About Prosun | `/about/` | Story, vision and mission, values, leadership and panel of experts, collaborations |
| Services overview | `/services/` | All five services with links |
| Solar EPC & industrial projects | `/services/solar-epc/` | EPC and PMC scope, who it's for, capacity, related projects, FAQ |
| Commercial & industrial solar | `/services/commercial-industrial/` | Approach, what to prepare, C&I projects, FAQ |
| Domestic rooftop solar | `/services/domestic-rooftop/` | Home process, system options, water heaters, FAQ (including PM Surya Ghar) |
| On-grid & off-grid solutions | `/services/on-grid-off-grid/` | Comparison table, component standards, benefits, FAQ |
| Operations & maintenance | `/services/operations-maintenance/` | O&M services, single-partner benefit, FAQ |
| Projects | `/projects/` | Eight projects with filters (ground-mounted/utility, C&I rooftop, PMC) |
| Contact / Request a consultation | `/contact/` | Enquiry form, phone, email, address, directions, what happens next |
| Privacy | `/privacy/` | Plain-language enquiry privacy notice (**needs company and legal review**) |
| 404 | `/404.html` | Helpful not-found page |

### Lead-generation features

- **"Request a Consultation" is always reachable:** header button on desktop, a button inside the mobile menu, a sticky Call / Request bar on phones (hidden while a form is on screen), the footer call-to-action band, and an enquiry section at the bottom of every main page.
- **Separate paths for businesses and homeowners** from the homepage hero and audience cards.
- **Click-to-call and email links** throughout: `tel:18001023317`, `tel:+919629635040` and `mailto:info@psun.in`.
- **Short enquiry form.** Only three fields are required: who the enquiry is for (one tap), name and phone. Location is optional. Email, project type, system size or monthly bill, and message sit under a collapsed "Add project details (optional)" panel.
- **Context-aware form.** Service pages pre-select the project type (for example, the home solar page pre-selects "Rooftop solar for my home" and "My home").
- **Validation and errors.** The form validates inline, with an error summary that links to each problem field and moves focus to it. Messages say exactly what's wrong and give an example.
- **Privacy reassurance** under the submit button, linked to the privacy page.
- **Success state.** After submitting, the visitor sees a personalised confirmation, the phone number we'll call, a three-step "what happens next" list, and phone numbers if they'd rather call. Focus moves to the confirmation for screen-reader users.
- **Failure handling.** If the endpoint fails, the visitor's details are kept and they're offered the phone and email instead.
- **Spam protection** with a honeypot field and no CAPTCHA, so there's no friction for real visitors.
- **Campaign attribution.** UTM parameters, `gclid`, the landing page and the form's page are captured and sent with each enquiry.
- **WhatsApp**, built but switched off until Prosun confirms a number (see section 4).

### Technical and SEO

- Unique title and meta description, canonical URL, Open Graph and Twitter card tags on every page.
- Structured data: `LocalBusiness` on every page (verified name, phone, email, address, logo and social profiles only), `BreadcrumbList` on inner pages, and `FAQPage` on service pages.
- `sitemap.xml`, `robots.txt` and a web manifest are generated at build time.
- `_redirects` maps the old WordPress URLs to the new pages, so existing search rankings and bookmarks aren't lost.
- Responsive WebP images at 800px and full width, with JPEG fallback, explicit dimensions (no layout shift), lazy loading below the fold and a high-priority hero image.
- **Accessibility:** skip link, semantic landmarks and headings (one `h1` per page), visible amber focus rings, keyboard-operable menus (Esc closes them), `aria-expanded` and `aria-current`, labelled form fields with `aria-invalid` and linked errors, descriptive alt text, colour contrast at WCAG AA or better, and `prefers-reduced-motion` support. A print stylesheet is included.
- Tested at 375px and 1024px+: no horizontal scrolling on any page, and no console errors.

---

## 2. Facts that need company confirmation

None of the items below has been invented. All come from prosunindia.com. Each still needs Prosun's sign-off. In the source files they're marked with `<!-- VERIFY -->` comments, which are stripped from the published site.

### Company figures (shown prominently on the homepage)

| Claim | Where used | Issue |
| --- | --- | --- |
| Established in **2003** | Home stats, About | The homepage of the current site says "more than 10 years"; the About page says "Established in 2003" and "more than 23 years". |
| **50+ MW** of projects completed | Home stats | Confirm the figure, and whether it includes the NLC projects where Prosun's role was PMC rather than EPC. |
| Capability **up to 100 MW** | Home stats, About, Solar EPC | The on/off-grid pages say "500 KW to 100 MW". The current site also says "anywhere globally"; the new site says Tamil Nadu and invites enquiries from elsewhere. |
| Approved vendor of **TEDA** | About | Confirm that the approval is current. |
| "MNRE-approved products" and "tied up with the world's best solar brands" | Not used | Left out because they're unverified. Add them back with specifics if Prosun can confirm. |

### Contact details

| Item | Status |
| --- | --- |
| 1800 102 3317 (toll-free) | Shown in the header of the current site. **Confirm it's current and staffed.** |
| +91 96296 35040 | From the Contact page of the current site. **Confirm.** |
| info@psun.in | Used on both. **Confirm the mailbox is monitored.** Note that the domain differs from the website domain. |
| No. 116A, Madukkarai Road, Industrial Estate, Kurichi, Coimbatore 641021 | From the Contact page. **Confirm.** |
| "000 8888 999 Free Call" | Placeholder text on the current site. **Not used.** |
| WhatsApp | No number found. **Not added.** |
| Facebook | The current site links two different pages (`/PROSUNGreenEnergy/` and `/Prosun-Energy-105173765682306`). The new site uses the second one, which appears in the site-wide footer. **Confirm which is official.** |
| LinkedIn | `linkedin.com/company/prosun-energy-private-ltd/`. **Confirm.** |
| Office hours | Not published. **Add them if Prosun wants.** |

### Projects

The current project pages contain copy-paste errors (several pages describe a different project in their body text). Values used on the new site, and what to check:

| Project | Shown as | Check |
| --- | --- | --- |
| 4 MW, Puliyampatti | Client: Prosun Green Energy Pvt Ltd; role: project execution | The client is taken from the Customers page. The project page lists "Gudimangalam" as the client. Confirm the client and Prosun's role. |
| Gudimangalam | Ground-mounted; size and client **omitted** | The source page says 200 kW and "Abirami Charitable Trust", both copied from another project. Provide the real size and client. |
| 500 kW, Karur | Client: SBM Spinners; design and installation | Size and location come from the page title and image filenames, because the body text describes another project. Confirm the size and role. |
| 300 kW, Coimbatore | Client: Karpagam Educational Trust; design and installation | Confirm the role. |
| 200 kW, Coimbatore | Client: Abirami Charitable Trust; design and installation | The page header also lists "SBM Spinners, Karur". Confirm. |
| 100 kW, Coimbatore | Client: GRD Educational Trust; project management consulting | The source page calls it "Utility Scale". The new site shows it as a rooftop. Confirm the type and role. |
| 100 MW NLC India & LNV, Tirunelveli | PMC, pre-bid and design engineering with ACE Renewtech; 370 acres; completed August 2019 | Confirm the role wording and the right to name NLC India and LNV. "Highest generation 6.3L units/day" was left out as an unverified performance claim. |
| 50 MW NLC India, Tirunelveli | PMC with ACE Renewtech; EPC Marine Electricals | Confirm. No photo is available. |

Also confirm that **Prosun may publicly name every client** listed on the homepage ("Organisations we've worked with include").

### People and partnerships (About page)

- Leadership names, titles and bios. Mr. Thirumoorthy is titled "Executive Director" on the current site, but his bio says "Advisor". The new site shows **Advisor**.
- ACE Renewtech collaboration since 2017; PSG College of Technology Centre of Excellence; MoU with Tamil Nadu Agricultural University; InfiniteERCAM tracking collaboration.

### Service claims

- The **component standards list** (IEC 61215, IEC 61683, etc.) is adapted from the current on/off-grid pages, with obvious typos corrected (for example "CIP65" became IP65). Confirm these are the standards Prosun specifies.
- **O&M for plants built by others.** The new site says O&M is offered after Prosun commissions a project, and invites owners of other plants to ask.
- The **PM Surya Ghar** FAQ on the home solar page. Confirm whether Prosun is a registered vendor, and adjust the wording if so.
- **Process steps** (site visit, proposal with expected generation and costs, help with grid-connection paperwork). Confirm they match how Prosun works.
- **Left out on purpose** because they're unverifiable or risky: "investment return 6 years", "100% quality", "worldwide first PID-free module" and specific module wattages. These are product-specific claims copied from manufacturer material.

### Privacy notice

`/privacy/` is a plain-language starting point, not legal advice. Prosun should review it, ideally with counsel and against India's Digital Personal Data Protection Act, 2023. Update it once the form service, CRM and analytics are chosen.

---

## 3. Images and brand assets

All photos were downloaded from prosunindia.com and stored locally, so the new site doesn't hotlink. Untouched originals are kept in `originals/`. Optimised versions are in `public/assets/img/`. Photos were resized and compressed only. None were edited in a way that changes what they show.

| File | Original on prosunindia.com | Used for | Confirm |
| --- | --- | --- | --- |
| `hero-aerial-solar-plant` | `2025/04/prosun-solar-plant.jpeg` | Home hero, Projects hero, OG image | **Which project is this?** Not captioned with a project name until confirmed. |
| `aerial-solar-plant-2` | `2025/11/prosun-solar-plant1.jpeg` | About hero (decorative) | Which project? |
| `puliyampatti-4mw-*` (3) | `2022/05/4-MW-Puliyampatti-project*.jpeg` | Several | |
| `gudimangalam-ground-array*` (2) | `2022/05/gudimangalam-solar-plant-1.jpeg`, `solar1.jpeg` | Projects, O&M | |
| `karur-500kw-*` (2) | `2022/05/500kw-solar-rooftop-sbmspinner-karur*.jpeg` | Home, C&I, on/off-grid | |
| `coimbatore-200kw-*` (2) | `2022/05/200kw-sola-abir*.jpeg` | Home, C&I, domestic hero | |
| `karpagam-300kw-rooftop-structures` | `2022/05/300kw-karpagam-education-coimbatore1.jpeg` | Projects, C&I | |
| `coimbatore-100kw-rooftop` | `2022/05/solar-grid-cbe4.jpeg` | Projects, on/off-grid | |
| `residential-rooftop` | `2025/04/gallery1.jpg` | Home, Services, domestic | **Confirm it's a Prosun installation.** It's from the gallery and is low resolution (838px). Replace it with a better home-rooftop photo if possible. |
| `solar-water-heater` | `2025/04/prosun-water-heater2.jpeg` | Domestic | Confirm it's a Prosun-supplied product. |
| `nlc-100mw-aerial` | `2018/12/solar-proj1.jpg` | Home feature band, Projects | **Confirm the source and reuse rights.** Prosun's role was PMC; NLC or the EPC contractor may own this photo. |
| `prosun-logo.png` | `2022/05/logo12.png` | Header | Only **200 × 83 px** is available, so it looks soft on high-density screens. **Please supply a vector (SVG) or high-resolution logo.** |
| Favicons | `2021/12/cropped-favicon.png` | Browser tab | |

**Deliberately not used:**

- **Client logos** (Karpagam, Ekki Pumps, Hindustan, Hyundai, Dinamalar, Ramco, TTDC, Bannari Amman). Client names are shown as text only until Prosun confirms it has permission to use each logo. Hyundai, Dinamalar, Ramco, TTDC and Bannari Amman appear only as logos, with no project information, so they aren't named at all.
- `beautiful-alternative-energy-plant-with-solar-panels.jpg`, `img-05.jpg`, `banner-1.jpg`, `slr2-1.jpg`. The filenames suggest stock or theme demo images.
- Leadership headshots. These could be added to the About page once approved.

---

## 4. How the enquiry form works now, and how to connect it

### Current behaviour

`public/assets/js/config.js` has `formEndpoint: ''` (empty), because no form backend exists yet. There is no invented or fake endpoint. While the endpoint is empty:

1. The form validates as normal.
2. On submit, it opens the visitor's **email app with a pre-filled message to info@psun.in**, containing all the form fields.
3. The success screen tells the visitor honestly that they need to press **Send** in their email app, and offers a button to open the email again plus both phone numbers.
4. On `localhost`, a developer note also explains that no endpoint is configured.

This works without a backend, but some visitors won't press Send, and visitors without a configured email app can't use it. **Connect a real endpoint before running paid campaigns.**

### Connecting to Prosun's inbox or CRM

Set `formEndpoint` in `public/assets/js/config.js`, rebuild and deploy. The form POSTs these fields:

```
customerType, name, phone, location, email, projectType, size, message,
formSource, pageUrl, landingPage, submittedAt, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid
```

`formEncoding: 'json'` sends JSON. `'form'` sends multipart form data. Any 2xx response counts as success. Anything else shows the error message and keeps the visitor's details.

Options, simplest first:

1. **Hosted form service** (Formspree, Getform, Basin and similar). Create a form, set it to email info@psun.in, and paste its endpoint URL into `formEndpoint`. Most accept JSON. No server code is needed.
2. **Netlify Forms** (if the site is hosted on Netlify). This needs a small change: Netlify detects forms from static HTML attributes and expects URL-encoded posts.
3. **Zoho CRM or Zoho Forms.** If Prosun uses Zoho, a small serverless function (Netlify, Vercel or Cloudflare) can receive the POST and create a Lead through the Zoho CRM API. Keep the API credentials in the function's environment variables, **never in `config.js`**, which is public.
4. **Other CRMs** (HubSpot, Salesforce, LeadSquared and others). Use the same serverless pattern, or the CRM's own form endpoint if it accepts cross-origin POSTs.

After connecting, submit a test enquiry from the live site and confirm it arrives in the inbox or CRM with all fields.

### Analytics and conversion tracking

No tracking is active, and no tracking IDs are included. `main.js` pushes these events to `window.dataLayer`:

| Event | When | Parameters |
| --- | --- | --- |
| `generate_lead` | Enquiry submitted successfully | `form_source`, `customer_type`, `project_type`, `delivery` (`endpoint` or `mailto_fallback`) |
| `form_start` | First interaction with a form | `form_source` |
| `form_validation_error` | Submit with errors | `fields`, `form_source` |
| `form_submit_error` | Endpoint failed | `form_source` |
| `phone_click`, `email_click`, `whatsapp_click`, `directions_click` | Contact link clicked | `label` (location on page), `link_url` |
| `cta_click` | Any main call-to-action clicked | `label`, `link_url` |
| `project_filter` | Projects page filter used | `filter` |

To activate tracking, create a Google Tag Manager container (or a GA4 property) and set **one** of `gtmId` or `ga4Id` in `config.js`. In GA4, mark `generate_lead` (and optionally `phone_click`) as key events. For Google Ads, import those conversions or trigger the Ads conversion tag from `generate_lead` in GTM.

If tracking is added, also add a cookie or consent notice where required, and update the privacy page.

### WhatsApp

Once Prosun confirms a business WhatsApp number, set `whatsappNumber` in `config.js` (digits only, with country code, for example `91XXXXXXXXXX`). WhatsApp links then appear in the footer, the enquiry sections and the contact page automatically.

---

## 5. Setup and deployment checklist

1. Get Prosun's sign-off on section 2 and update or remove anything not confirmed. Search `src/` for `VERIFY`.
2. Get a high-resolution or SVG logo, and confirm the image rights listed in section 3.
3. Connect the form endpoint (section 4), then send a test enquiry.
4. Optional: add GTM or GA4 IDs and the WhatsApp number.
5. Run `npm run build` and deploy `dist/` (see README).
6. **Redirects.** `_redirects` covers Netlify and Cloudflare Pages. On other hosts, add equivalent 301s, for example on nginx: `rewrite ^/about-us-2/?$ /about/ permanent;` and on Apache: `Redirect 301 /about-us-2/ /about/`.
7. Point the domain, enable HTTPS, then submit `sitemap.xml` in Google Search Console.
8. Update the Google Business Profile so it matches the phone, address and website on the new site.
9. **Optional performance step.** Self-host the Plus Jakarta Sans font instead of loading it from Google Fonts. This removes a third-party request and the font request privacy concern.
