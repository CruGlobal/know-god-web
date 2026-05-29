# CLAUDE.md

Repo-specific context for Claude Code and the CruGlobal plugins
(`CruGlobal/claude-code-plugins`). The adaptive skills (`/quality:pr-review`,
`/quality:code-review`, `/quality:agent-review`, `/testing:test-writer`,
`/figma:*`) read this file to learn how this project works.

## Project overview

`know-god-web` (package name `knowgod`) is the **KnowGod.com embeddable web app**:
an Angular 17 + TypeScript single-page app that renders GodTools resources (e.g.
"Knowing God Personally", `kgp-us`). It also ships as an **embed** — third-party
sites load a small dependency-free `embed.js` loader that runs the app inside an
iframe and auto-resizes it via `postMessage`. See `README.md` for the full embed
flow and `embed/example.html` for a working example.

Tools are addressed by a hash route: `/#/{lang}/{book}` (e.g. `/#/en/kgp-us`).

## Tech stack

- **Framework:** Angular 17, TypeScript, RxJS.
- **Shared logic:** `@cruglobal/godtools-shared` (resource/tool parsing). Prefer
  it over re-implementing GodTools data handling.
- **Real-time / misc:** `@rails/actioncable`, `lottie-web` / `ngx-lottie`
  (animations), `ngx-toastr` (toasts).
- **Styling:** plain CSS. Global styles in `src/styles.css`; each component has a
  co-located `*.component.css`. There is **no** Tailwind, SCSS, or CSS-modules
  setup — match the existing component-CSS pattern.
- **Node:** pinned to 20.17.0 via `.tool-versions` (asdf). **Yarn 4.7.0** via
  Corepack (`.yarnrc.yml`); always use `yarn`, never `npm`.

## Directory structure

- `src/app/page/` — the tool/page rendering engine (components for paragraphs,
  links, tract pages, CYOA pages, etc.) under `page/component/...`.
- `src/app/services/` — app services.
- `src/app/shared/`, `src/app/dashboard/`, `src/app/api/` — supporting areas.
- `src/app/_tests/` — shared test helpers and mocks (`mocks.ts`, e.g.
  `mockLink(...)`).
- `src/environments/` — environment configs.
- `embed/` — the standalone `embed.js` loader and example.
- `mobile/` — JSON assets copied into the deploy output.

## Commands

| Command | Purpose |
| --- | --- |
| `yarn start` | Dev server, **production** config (proxies to prod backends) |
| `yarn start:dev` | Dev server, development config (staging data) |
| `yarn build` / `yarn build:dev` | Production / development build |
| `yarn test --no-watch` | Run unit tests once (Karma + Jasmine) |
| `yarn lint` | ESLint (`src/**/*.{js,ts,html}`) with `--fix` |
| `yarn prettier:check` / `yarn prettier:write` | Check / apply formatting |

Local app: <http://localhost:4200/en>.

## Testing conventions

- **Framework:** Karma + Jasmine. Run with `yarn test --no-watch`.
- **File naming/placement:** specs are co-located with the component as
  `*.component.spec.ts` (e.g. `content-link.component.spec.ts` next to
  `content-link.component.ts`).
- **Pattern:** use Angular's `TestBed` with `ComponentFixture`; declare the
  component, provide services via `{ provide: X, useValue: ... }`, call
  `fixture.detectChanges()`, and drive lifecycle hooks explicitly (e.g.
  `ngOnChanges({ item: new SimpleChange(null, value, true) })`).
- **Mocks:** import shared mocks/helpers from `src/app/_tests/` (e.g.
  `mockLink`) rather than hand-rolling fixtures. Use `spyOn(service, 'method')`
  for service interactions.

## Code review heuristics

- Keep components thin and presentational; put data/parsing logic in services or
  lean on `@cruglobal/godtools-shared`.
- Respect the **embed contract**: changes affecting layout/height must not break
  the iframe auto-resize (`postMessage` height messaging in `src/index.html` and
  `embed/embed.js`). The `embedded` flag (`page.component.ts`) and embedded
  analytics tagging (`analytics.service.ts`) should keep working.
- Don't bypass the proxy — API calls rely on `proxy.conf.json` wired through
  `yarn start` / `yarn start:dev`.
- New styles go in the component's co-located `.css` (or `src/styles.css` for
  globals); don't introduce a new styling system.
- Use `yarn`; never add `npm`/`package-lock.json` artifacts.

## Figma / design-to-code

- UI framework: **Angular 17** components (declared in modules; this repo is not
  standalone-component based).
- CSS: plain CSS, co-located per component + global `src/styles.css`. No design
  token file exists today — emit plain CSS matching neighboring components.

## Git / PR conventions

- **Branch targets:** open PRs against `staging` or `main` — CI PR checks (lint,
  prettier, test, build) only run on those branches.
- **PR title:** `GT-(JIRA#) (summary, max 80 chars)`. `GT` = GodTools Jira
  project; if there's no ticket, use a short descriptive title.
- **Deploy labels:** `On Staging` auto-merges the branch into `staging` and
  `development`; `On Development` merges into `development` only (see
  `.github/workflows/update-staging.yml`).
- Before opening a PR, run the four CI-mirroring checks: `yarn prettier:write`,
  `yarn lint`, `yarn test --no-watch`, `yarn build`. A Husky pre-commit hook runs
  `pretty-quick` on staged files.
- See `CONTRIBUTING.md` and `README.md` for the full workflow.
