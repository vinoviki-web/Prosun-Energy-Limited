/*
 * Site configuration — edit these values, rebuild, and deploy.
 * Nothing here is secret: it is all visible to visitors. Never put API keys
 * or passwords in this file. Use a form service or serverless function that
 * keeps credentials on the server side.
 */
window.PROSUN_CONFIG = {
  // Where enquiries are sent. Leave empty until a real endpoint exists.
  // While empty, the form falls back to opening a pre-filled email to info@psun.in.
  // Examples of what can go here (see IMPLEMENTATION-NOTES.md):
  //   - Zoho Forms / Zoho CRM webhook URL
  //   - Formspree / Basin / Getform endpoint
  //   - Your own serverless function (Netlify, Vercel, Cloudflare)
  formEndpoint: '',

  // 'json' sends application/json; 'form' sends multipart/form-data
  // (most hosted form services accept either; check yours).
  formEncoding: 'json',

  // Fallback inbox used when formEndpoint is empty.
  fallbackEmail: 'info@psun.in',

  // Analytics. Leave empty until Prosun creates real properties.
  // Set ONE of these. Events are pushed to window.dataLayer either way.
  gtmId: '',   // e.g. 'GTM-XXXXXXX'
  ga4Id: '',   // e.g. 'G-XXXXXXXXXX'

  // WhatsApp number in international format, digits only (e.g. '9198xxxxxxxx').
  // Leave empty until Prosun confirms the correct business number.
  // When set, WhatsApp links appear in the footer and enquiry sections.
  whatsappNumber: '',
};
