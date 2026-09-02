# Rezyn — interface revision studio site

Build the uploaded Rezyn homepage design as a real multi-page site, with a working "Request an audit" form backed by Lovable Cloud.

## Design system

Port the uploaded design's tokens exactly into the project's global CSS as semantic tokens:

- Paper white background, near-black ink, warm muted grey, sand-colored rules
- Redline red accent (for markup/strike details) and green "revision" accent
- Newsreader serif headings (italic logo), Work Sans body, Caveat for handwritten margin notes
- Editorial rules, thin borders, no rounded cards — the "marked-up manuscript" look

Fonts load via a link tag in the root layout. All section styling (style-preview swatches, process cards, before/after markup, style/trend grids) becomes reusable React components using these tokens.

## Pages

- `/` — home: hero ("Your product doesn't need a rebuild / it needs a revision"), condensed services list, three-pass process, style-directory teaser, before/after preview, audit CTA
- `/services` — the five interface types (website, web app, mobile app, SaaS, e-commerce) in full
- `/process` — v1 Audit, v2 Redesign, v3 Handoff explained
- `/styles` — full style directory grouped by family (minimal, bold, glass, retro, tech, editorial) with the CSS mini-previews
- `/trends` — advanced pattern groups (architectural, backgrounds/cursor, heroes/nav, actions/inputs, data display, feedback/media/AI)
- `/work` — before/after revision comparisons
- `/contact` — request-an-audit form

Sticky header with nav across all pages plus footer, in the shared root layout. Each page gets its own title, description, and social preview metadata.

## Audit request form

Enable Lovable Cloud, then:

- Table `audit_requests`: name, email, company, product URL, product type (website / web app / mobile app / SaaS / e-commerce), budget range, message, created_at
- Anyone may submit (insert); nobody can read submissions from the browser — reads stay locked down
- Submissions go through a validated server function; the form shows inline validation errors and a success confirmation after submitting

## Technical notes

- TanStack Start file routes under `src/routes/`; shared chrome in `__root.tsx`
- Tokens in `src/styles.css` (oklch), no hardcoded color utilities in components
- Form submit via `createServerFn` with Zod validation, inserting into `audit_requests`
- Migration creates the table with explicit grants, RLS enabled, and an insert-only anon/authenticated policy
- Style and trend catalogs live in typed data modules so the grids stay data-driven
