# AGENTS.md

Fresh Vite + React 19 SPA (JavaScript, not TypeScript). No router, state library, test runner, or backend yet.

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm run lint     # eslint . (flat config, ignores dist/)
```

There is no test script and no test files — do not invent one unless asked.

## Tailwind

- Tailwind v4 is wired through `@tailwindcss/vite` in `vite.config.js`.
- The only stylesheet entry is `src/index.css`, which is just `@import 'tailwindcss';`.
- No `tailwind.config.js` — v4 config is CSS-based. Don't add the old config file.
- Use utilities from `tailwindcss`. The `tailwind` and `css` packages in `package.json` are stray installs, not the source of Tailwind; don't import from them.

## Layout

- Entry chain: `index.html` -> `src/main.jsx` -> `src/App.jsx`.
- `src/App.css` holds hand-written component styles; Tailwind utilities are used inline in JSX.
- Static assets in `public/` are served from `/` (e.g. `/icons.svg`); imported assets live in `src/assets/`.

## Conventions

- ES modules (`"type": "module"`), function components, hooks, single quotes, no semicolons.
- Keep JSX lint-clean: `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` are enforced.

## Git

Repo has no commits yet and the workspace root (`/home/francojc`) is also the git root; `git status` shows unrelated home-directory files. Stage only paths inside `machapp-fronten/` when committing.
