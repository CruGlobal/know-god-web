# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Know God Web is an Angular 17 application that renders GodTools religious content for web and embedded (iframe) contexts. Content is fetched from Cru Global's mobile-content-api and parsed from XML manifests using `@cruglobal/godtools-shared`.

**Live sites:** knowgod.com (prod/main), stage.knowgod.com (staging)

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `yarn install` |
| Dev server (localhost:4200) | `yarn start:dev` |
| Production build | `yarn build` |
| Run all tests | `yarn test --no-watch` |
| Lint (with autofix) | `yarn lint` |
| Format check | `yarn prettier:check` |
| Format fix | `yarn prettier:write` |

Always use `yarn`, never `npm` (Yarn 4.7.0 via Corepack; see the root `CLAUDE.md`).

Tests use Karma + Jasmine with ChromeHeadless. There is no single-test runner configured; all specs run together via `yarn test --no-watch`.

## Architecture

### Routing

Routes are defined in `src/app/app.module.ts` (traditional NgModule, not standalone):
- `/:langid/:bookid/:page` - main content page
- `/:langid/embed/:bookid` - embedded iframe variant
- `/:langid/:bookid` - redirects to page 0
- `/:langid` and `/` - header/landing

### State Management

RxJS Subjects/BehaviorSubjects directly in services (no NgRx):
- **PageService** (`src/app/page/service/page-service.service.ts`) - central service managing page navigation, form/modal state, image/animation URL caching, text direction (RTL/LTR)
- **LoaderService** - loading spinner visibility
- **AnalyticsService** - GTM integration and event tracking

### Content Pipeline

1. App fetches resource manifest from mobile-content-api (`src/app/api/url.ts`)
2. `XmlParserService` wraps `@cruglobal/godtools-shared` ManifestParser to parse XML
3. Parsed content flows to 20+ dynamic components in `src/app/page/component/` (text, image, video, form, button, animation, tabs, accordion, card, modal, etc.)

### API Environments

- **Production:** `https://mobile-content-api.cru.org`
- **Staging/Dev:** `https://mobile-content-api-stage.cru.org`
- WebSocket via ActionCable (`wss://` endpoints)
- Environment configs in `src/environments/`

### Embed System

`embed/embed.js` creates an iframe and communicates height via `postMessage`. The main `index.html` detects iframe context. Embed routes use `/embed/` path segment.

## Code Style

- **ESLint flat config** (`eslint.config.js`) with Angular ESLint, TypeScript ESLint, and Prettier integration
- **Prettier:** single quotes, no trailing commas (`.prettierrc`)
- **Component selectors:** prefix `app`, kebab-case for elements, camelCase for directive attributes
- **Import order enforced:** builtin > external > internal > parent > sibling > index
- **Pre-commit hook** (Husky): runs `yarn lint` and `yarn prettier:check`

## Build & Deploy

CI is GitHub Actions (`.github/workflows/node.js.yml`). Branches auto-deploy to AWS S3:
- `main` -> production
- `staging` -> stage
- `development` -> dev

The `update-staging.yml` workflow promotes work to lower environments via PR
labels: `On Staging` auto-merges the branch into `staging` and `development`,
`On Development` merges into `development` only. (Its legacy `push` trigger still
references the old `master` branch, which no longer exists.)

Build output goes to `dist/knowgod/`, plus `embed/embed.js` and `mobile/` are copied alongside.

## Key Dependencies

- **@cruglobal/godtools-shared** - core content parsing library (manifest models, XML parser)
- **ngx-lottie / lottie-web** - Lottie animations
- **@rails/actioncable** - WebSocket real-time data
- **Node 24.9.0** (`.tool-versions`)
- **Package manager:** Yarn
