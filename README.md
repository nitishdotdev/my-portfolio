# Nitish Kumar Singh — Portfolio

Personal portfolio for Nitish Kumar Singh, a CSE (AI & ML) student and full-stack developer.
Built with React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, and React Router.

## Quick start

Requires Node.js 18+.

```bash
npm install        # uses the committed package-lock.json
npm run dev        # http://localhost:3000
npm run build      # type-check (tsc) + production build into dist/
npm run preview    # serve the production build locally
```

## Editing content

Almost all content lives in one file: **`src/config/site.ts`**.

- `about`, `tldr`, `headlines`: hero and about copy
- `experience`, `collaboration`: independent work, campus roles, and hackathon entries
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
| Absolute site URL | `index.html` Open Graph `og:image` uses `/social-banner.png`; crawlers need an absolute URL once you deploy |
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

Display serif: **Instrument Serif** · Body: **Inter** · Labels: **JetBrains Mono**.
All three are Google Fonts under the SIL Open Font License and load from `index.html`.

## Deployment (Vercel)

1. Import the repository in Vercel.
2. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
3. `vercel.json` already rewrites all routes to `index.html` so deep links work.

Vercel Analytics is included and only reports when deployed on Vercel.

## Notes

- Visitor count uses a public counter service. If it is unreachable, the view count is hidden rather than shown as a placeholder.
- Keep unverified claims out of `site.ts`. Only publish facts you can back up.
