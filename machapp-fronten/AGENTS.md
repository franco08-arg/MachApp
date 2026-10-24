# AGENTS.md

Fresh Vite + React 19 SPA (JavaScript, not TypeScript). No router, state library, test runner, or backend yet.

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm run lint     # eslint . (flat config, ignores dist/)
```

- There is no test script and no test files — do not invent one unless asked.
- Run `npm run lint` and `npm run build` after code changes; they are the only verification steps.
- Run `npm ci` first in a fresh checkout. It prints unrelated EBADENGINE/deprecation warnings from the stray `tailwind`/`css` deps; ignore them.

## Tailwind

- Tailwind v4 is wired through `@tailwindcss/vite` in `vite.config.js`.
- The only stylesheet entry is `src/index.css`, which is just `@import 'tailwindcss';`.
- No `tailwind.config.js` — v4 config is CSS-based. Don't add the old config file.
- Use utilities from `tailwindcss`. The `tailwind` and `css` packages in `package.json` are stray installs, not the source of Tailwind; don't import from them.

## Layout

- Entry chain: `index.html` -> `src/main.jsx` -> `src/App.jsx`.
- `src/App.css` holds hand-written component styles; Tailwind utilities are used inline in JSX.
- Static assets in `public/` are served from `/` (e.g. `/icons.svg`); imported assets live in `src/assets/`.
- `src/page/` holds screen-level components. `src/page/Login.jsx` is not mounted yet; `src/App.jsx` still renders the Vite starter demo.
- Login has no backend: it authenticates against `DEMO_ACCOUNTS` in that file, then calls an `onSuccess` prop or redirects to `/descubrimiento` via `window.location.assign`. Replace with the real API when available.

## Conventions

- ES modules (`"type": "module"`), function components, hooks, single quotes, no semicolons.
- UI copy is Spanish (labels, validation errors, messages); keep new screens consistent.
- Keep JSX lint-clean: `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` are enforced.

## Git

The git root is `/home/francojc/Documentos/MachApp`, one level above this package. Stage only paths inside `machapp-fronten/` when committing.
