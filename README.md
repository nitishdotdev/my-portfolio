# Nitish Kumar Singh — Portfolio

Personal portfolio for Nitish Kumar Singh, a CSE (AI & ML) student and full-stack developer.
Built with React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, and React Router.

## Quick start

Requires Node.js 22+ and Python 3 for the sitemap checks.

```bash
npm ci             # installs from the committed lockfile
npm run dev        # http://localhost:3000
npm run build      # type-check, compile assets, and prerender pages into dist/
npm run preview    # serve the production build locally
```

## Editing content

Almost all content lives in one file: **`src/config/site.ts`**.

- `about`, `tldr`, `headlines`: hero and about copy
- `experience`: independent work
- `projects`: project cards (`story` powers the "engineering details" drawer)
- `skillGroups`: the Tech Stack grid, grouped by category
- `socials`, `email`: contact links, including Instagram for the footer name (empty values hide the related UI)
- `writing`, `openSourceContributions`: leave empty to hide those sections
- `github.username`: drives the GitHub activity heatmap

Empty values hide their UI automatically, so unverified details never show up.

## Details still to add before publishing

These were not in the source brief, so they are intentionally empty:

| Item | Where |
|---|---|
| StudyKarle "50+ users" figure | Omitted. Add only after verifying analytics or records |
| Academic results (SGPA / percentage) | Omitted. Add only after verifying against marksheets |
| Experience dates | `site.experience[].period` is blank until confirmed |
| StudyCanvas status | Shown as "Earlier Project" with its live link; confirm the site is still live |

## Features

- Dark/light theme with persistence
- Command palette (`Ctrl+K` / `⌘K`) with navigation and actions
- Project search and category filtering (`/projects`)
- Responsive navigation and a desktop side index
- Scroll-reveal animations and a fading footer statement rotator
- GitHub contribution heatmap (live data from a public API; shows an honest message if unavailable)
- Keyboard easter egg: type `nitish` (or the Konami code)
- Pixel-cat cursor follower (`oneko.js`)
- Keyboard-operable command palette, theme toggle, and navigation
- Respects the OS reduced-motion setting for CSS and Framer Motion animations

## Project structure

```
src/
  config/site.ts        # all content
  App.tsx               # routes and layout
  sections/             # homepage sections (Hero, About, Projects, Experience, ...)
  pages/WritingPage.tsx # /writing
  components/           # nav, footer, command palette, side index, shared layout
  context/              # theme and visitor counter
  hooks/                # GitHub heatmap data
public/                 # static assets (favicon, social banner, oneko sprite)
```

Routes: `/` (home), `/projects`, `/experience`, `/contact`, `/writing`.

## Fonts

Display serif: **Instrument Serif** · Body: **Aileron** · Labels: **JetBrains Mono**.
The Google Fonts distributions of Instrument Serif and JetBrains Mono are served locally under their [Instrument Serif OFL](public/fonts/instrument-serif/OFL.txt) and [JetBrains Mono OFL](public/fonts/jetbrains-mono/OFL.txt).
[Aileron](https://dotcolon.net/font/aileron/) is served locally under [CC0](public/fonts/aileron/LICENSE.txt).

## Deployment (Vercel)

1. Import the repository in Vercel.
2. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
3. `vercel.json` maps each public URL to its generated HTML file. Unknown URLs fall through to Vercel’s static 404 handling.

Vercel Analytics is included and only reports when deployed on Vercel.

## Notes

- Visitor count uses a public counter service. If it is unreachable, the view count is hidden rather than shown as a placeholder.
- Keep unverified claims out of `site.ts`. Only publish facts you can back up.

## SEO

- Use `site.url` in `src/config/site.ts` for the production canonical base. Keep `robots.txt`, `sitemap.xml` and `llms.txt` aligned when changing domains.
- `src/config/seo.ts` and `src/config/structured-data.ts` supply the head for both prerendering and client navigation.
- Vite compiles a temporary SSR entry. React renders each known route with `StaticRouter` into the built Vite template. The browser hydrates the shared app with `BrowserRouter`. Vercel serves static files.
- Crawl files in `public/`: `robots.txt`, `sitemap.xml`, `llms.txt`, and `404.html` (served for unknown URLs with HTTP 404).
- Routing: `vercel.json` lists each legitimate route explicitly. There is no catch-all rewrite, so unknown URLs return a real 404 instead of the homepage.
- Writing page: returns `X-Robots-Tag: noindex, follow` and carries a matching robots meta tag. Remove both when articles exist, and add the route to the sitemap.
- Preview deployments use `VERCEL_ENV`. Each generated route has `noindex, nofollow` and a production canonical. The build blocks crawling in `robots.txt` and omits `sitemap.xml`. Keep Vercel deployment protection enabled.

### AI crawler policy

Crawler purposes were checked against each operator's documentation. The full rationale is in the comments of `public/robots.txt`.

- Search and retrieval crawlers are allowed: Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot and PerplexityBot. User-initiated fetchers (ChatGPT-User, Claude-User, Perplexity-User) are also allowed. Operators say robots.txt rules may not apply to these.
- Training crawlers are disallowed: GPTBot, ClaudeBot and Applebot-Extended. Applebot-Extended does not affect Siri or Spotlight search.
- Google-Extended is allowed for its documented training and grounding uses in Gemini Apps and Vertex AI. This setting is separate from Google Search indexing.
- Crawler compliance with `robots.txt` varies. `llms.txt` is an informational overview with no guarantee of AI discovery or citations.

### Verification

- `npm run lint`: TypeScript type-check.
- `npm test` builds both deployment environments in temporary directories. It runs regression mutations against real HTML and checks the HTTP status of routes and static files.
- `npm run verify:seo`: checks the source files.
- `npm run verify:seo:dist` checks production output in `dist/`. For a preview artifact, run `VERCEL_ENV=preview npm run build` followed by `node scripts/verify-seo.mjs --preview`.
- CI (`.github/workflows/ci.yml`) runs all of the above on pull requests and pushes to `main`.
