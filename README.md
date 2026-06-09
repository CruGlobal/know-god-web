# KnowGod.com embeddable web app

An Angular 17 + TypeScript single-page app that renders GodTools resources (e.g.
"Knowing God Personally", `kgp-us`). It also ships as an **embed**: third-party
sites load a small `embed.js` loader that runs the app inside an auto-resizing
iframe. Tools are addressed by hash route — `/#/{lang}/{book}` (e.g. `/#/en/kgp-us`).

## Quick start

If you already have Node `24.9.0` and Yarn (via Corepack) set up:

```bash
git clone https://github.com/CruGlobal/know-god-web.git
cd know-god-web
yarn          # install deps + set up Husky hooks
yarn start    # dev server, production data — http://localhost:4200/en
```

New to the project or starting from a clean machine? See
[Development setup](#development-setup) for the full macOS walkthrough.

## Development setup

These steps set up the project from a clean **macOS** machine. The app pins exact
tool versions, so matching them avoids hard-to-debug issues. Node is managed with
[asdf](https://asdf-vm.com/); Yarn is committed into the repo, so once Node is
correct there's nothing extra to install for Yarn — just
[enable Corepack](https://yarnpkg.com/corepack).

| Tool     | Version  | Why                                           |
| -------- | -------- | --------------------------------------------- |
| Node.js  | `24.9.0` | Defined in [`.tool-versions`](.tool-versions) |
| Yarn     | `4.7.0`  | Committed via `.yarn/releases`; run via Corepack |
| Git      | recent   | Cloning and deploying                         |
| Homebrew | recent   | Installs asdf                                 |

**1. Install Homebrew** (skip if you have it):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**2. Install Node `24.9.0` with asdf:**

```bash
brew install asdf
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git

# Integrate asdf with your shell (ZSH shown — the macOS default; for others see
# https://asdf-vm.com/guide/getting-started.html#_3-install-asdf)
echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc
```

Open a **new** terminal so the shell picks up asdf, then from inside the repo:

```bash
asdf install nodejs   # installs the version from .tool-versions
node --version        # should print v24.9.0
```

asdf auto-switches to `24.9.0` whenever you `cd` into the project.

**3. Enable Yarn and install dependencies:**

```bash
corepack enable   # turns on the repo's pinned Yarn 4.7.0
yarn --version    # should print 4.7.0
yarn              # installs packages + runs postinstall (Husky git hooks)
```

**4. Run the dev server:**

```bash
yarn start        # serves the PRODUCTION config (proxies to prod backends)
# or
yarn start:dev    # serves staging data
```

Open [`http://localhost:4200/en`](http://localhost:4200/en). The server
hot-reloads on edit. Local API calls are routed through the dev-server proxy in
[`proxy.conf.json`](proxy.conf.json) — so always start via `yarn start` /
`yarn start:dev`, never a bare `ng serve`.

### Scripts

| Command               | What it does                                         |
| --------------------- | ---------------------------------------------------- |
| `yarn start`          | Dev server, production config                        |
| `yarn start:dev`      | Dev server, development config (staging data)        |
| `yarn build`          | Production build                                     |
| `yarn build:dev`      | Development build                                    |
| `yarn test`           | Run unit tests once (Karma + Jasmine, single pass)   |
| `yarn lint`           | Lint and auto-fix `src/**/*.{js,ts,html}`            |
| `yarn prettier:check` | Report files that aren't formatted                   |
| `yarn prettier:write` | Format all files                                     |

### Troubleshooting

- **`node --version` isn't `24.9.0`** — Open a new terminal after the asdf shell
  integration step, and make sure you're inside the repo so asdf reads
  `.tool-versions`.
- **`command not found: yarn`** — Run `corepack enable`, then retry. Yarn is
  driven by `yarnPath` in [`.yarnrc.yml`](.yarnrc.yml) and only resolves once
  Corepack is on.
- **Peer-dependency errors on install** — `.npmrc` sets `legacy-peer-deps=true`;
  peer warnings are expected and non-fatal.
- **API requests fail locally** — Start via `yarn start` / `yarn start:dev` so the
  proxy config is loaded.

## Project structure

A standard [Angular CLI](https://angular.dev/tools/cli) project; most code lives
under `src/`. The Know God–specific pieces:

```
src/
  app/
    app.module.ts       Root NgModule (routing wired here; not standalone)
    page/               The tool renderer — turns a resource into pages
      component/         Per-content-type components (tract & CYOA pages, cards,
                         paragraphs, links, spacers, etc.)
      model/             View models for page rendering
      service/           Page-scoped services (e.g. PageService)
    dashboard/          Landing/index view
    services/           App-wide services (analytics, common, loader, xml-parser)
    shared/             Reusable helpers and components (loader, sharing modal)
    api/                API URL definitions (url.ts)
    _tests/             Shared test mocks (mocks.ts)
  assets/              Static CSS, fonts (FontAwesome), images, sitemap
  environments/        Per-environment config (see below)
  index.html           Host page; contains the embed iframe height-posting script
  main.ts              Application bootstrap
  styles.css           Global styles

embed/                 The embeddable loader (embed.js) and a usage example
mobile/                Deep-linking association files served at /.well-known/
proxy.conf.json        Dev-server proxy mapping API paths to mobile-content-api
```

**Environments.** Config lives in `src/environments/`, not a `.env` file.
`environment.ts` / `environment.development.ts` point at the **staging**
mobile-content-api; `environment.prod.ts` points at **production**. Angular swaps
them via `fileReplacements` in `angular.json` per build configuration. (Locally,
API calls also pass through the dev-server proxy.)

Content is parsed by `XmlParserService`, which wraps
`@cruglobal/godtools-shared` — see [`docs/parser.md`](docs/parser.md).

## Testing

Unit tests run on [Karma](https://karma-runner.github.io/) +
[Jasmine](https://jasmine.github.io/) in headless Chrome (the
`ChromeHeadlessNoSandbox` launcher, so they work in CI containers — Chrome must be
installed). Run the full suite once with `yarn test` (this is what CI runs). To
iterate with the watcher and Jasmine HTML reporter, run `yarn ng test` directly.

The runner is configured in [`src/karma.conf.cjs`](src/karma.conf.cjs) (single
run, Istanbul coverage to `coverage/`, `/assets/` proxied to `/base/src/assets/`).

Specs sit **next to the code they test** with a `.spec.ts` suffix (e.g.
`analytics.service.spec.ts` beside `analytics.service.ts`). Shared mocks live in
[`src/app/_tests/mocks.ts`](src/app/_tests/mocks.ts). A minimal component spec:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

## Embed

Add this snippet to any HTML page to embed a KnowGod.com gospel presentation. A
working example is in [`embed/example.html`](embed/example.html).

```html
<div
  id="knowGodEmbed"
  data-book="kgp-us"
  data-lang="en"
  data-ministry="your-ministry-name"
></div>
<script src="https://knowgod.com/embed.js"></script>
```

| Attribute       | Required | Description                                             |
| --------------- | -------- | ------------------------------------------------------- |
| `data-book`     | Yes      | Resource identifier (e.g. `kgp-us`, `satisfied`)        |
| `data-lang`     | Yes      | Language code (e.g. `en`, `es`, `fr`)                   |
| `data-ministry` | No       | Ministry identifier; used by analytics to attribute embeds |

### How it works

`embed.js` is a small, dependency-free loader. The app is **never** injected into
the host page — it runs inside an iframe so Know God's styles and scripts stay
isolated from the host site. They communicate via `postMessage`:

1. On `window.onload`, the loader finds `#knowGodEmbed` and reads its
   `data-*` attributes.
2. It builds the iframe URL `{appDomain}/#/{lang}/{book}?embedded=true` (plus
   `&ministry={value}` when supplied) and inserts an iframe styled to full width,
   no border, 450px minimum height. `?embedded=true` tells the app it's embedded —
   see the `embedded` flag in `page.component.ts` and the embedded tagging in
   `analytics.service.ts`.
3. `{appDomain}` is a placeholder in the repo; during deploy CI runs a `sed`
   replacement to point it at the matching host (e.g. `https://knowgod.com`).
4. **Auto-resize (iframe → parent):** the app detects it's embedded
   (`window.location !== window.parent.location`) and uses a `MutationObserver`
   to `parent.postMessage(document.body.offsetHeight, '*')` on height changes —
   see [`src/index.html`](src/index.html).
5. **Receiving height (parent → iframe):** `embed.js` listens for numeric height
   messages, sets the iframe height, and scrolls the tool back into view if
   needed (a `previousHeight` guard skips redundant updates).

### Testing the embed locally

```bash
yarn start
# then open http://localhost:4200/embed/test.html
```

[`embed/test.html`](embed/test.html) points the iframe at
`window.location.origin`, so it works in any environment without the `{appDomain}`
replacement. Change `data-book` / `data-lang` / `data-ministry` and click **Reload
Embed**; the log panel shows the generated URL and incoming height updates.

## Translations (i18n & Crowdin)

> **Status: not yet landed.** UI-string translation via
> [i18next](https://www.i18next.com/) + [Crowdin](https://crowdin.com/) is
> planned; the files and scripts below don't exist in the checkout yet. This
> documents the intended workflow.

Developers only write **English** strings in templates with the `i18next` pipe;
extraction, upload, and the translation-return PR are automated:

1. Write a string: `{{ 'Tools' | i18nextEager }}` (or with a value:
   `{{ '1994-{{ year }} Cru.' | i18nextEager: { year: currentYear } }}`). The
   key **is** the full English string.

   > **Use `i18nextEager`, not the bare `i18next` pipe.** `i18next` resolves
   > once and caches, so labels go stale when the in-app language selector
   > switches language without re-rendering. `i18nextEager` re-resolves on
   > language change, keeping persistent labels in sync.
2. `yarn extract` writes keys into `src/assets/locales/en/translation.json`;
   commit it with your change.
3. On merge to `main`, English strings upload to Crowdin.
4. A scheduled job downloads translations weekly and opens an **"Update
   translations"** PR for the UI team to review.

Crowdin project ID `897600` _(temporary)_; `CROWDIN_API_TOKEN` lives in the
repo's GitHub Actions secrets.

## CI, deployment & environments

CI is defined in [`.github/workflows`](.github/workflows).

**`node.js.yml`** runs on pushes to `staging` / `development` / `main` and on PRs
targeting `staging` or `main`. Every job installs deps first (Node from
`.tool-versions`):

| Job                  | Checks                                                              |
| -------------------- | ------------------------------------------------------------------ |
| 🧹 Lint & Prettier   | `yarn prettier:check` then `yarn lint`                             |
| ✅ Tests             | `yarn test` (single Karma + Jasmine run)                          |
| 🏗️ Build app         | `yarn build` — confirms a production build compiles                |
| 🚀 Deploy app        | Pushes only (never PRs). Builds the env-matched config, injects the host into `embed.js`, copies `mobile/`, and syncs to S3 |

**`update-staging.yml`** promotes branches via PR labels: **`On Staging`**
auto-merges into both `staging` and `development`; **`On Development`** merges into
`development` only.

Branch → environment:

| Environment | URL                          | Deploys from  |
| ----------- | ---------------------------- | ------------- |
| Production  | https://knowgod.com/en       | `main`        |
| Staging     | https://stage.knowgod.com/en | `staging`     |
| Development | https://dev.knowgod.com/en   | `development` |
| Local       | http://localhost:4200/en     | —            |

## Before creating a PR

Run the four checks that mirror CI to avoid a round-trip:

```bash
yarn prettier:write   # auto-format (or prettier:check to only report)
yarn lint             # lint and auto-fix
yarn test             # run unit tests once
yarn build            # confirm a production build compiles
```

A Husky pre-commit hook runs `yarn lint` and `yarn prettier:check`, but the full
set above still catches more. Open your PR against **`staging`** or **`main`** (the
branches CI runs PR checks on); add the `On Staging` / `On Development` label to
deploy it to a test environment.

### Code review

[`.github/CODEOWNERS`](.github/CODEOWNERS) lists the maintainers, and GitHub
auto-requests their review when you open a PR — you don't need to tag anyone.
Merges into `main` require at least **one approving review** and passing CI
(enforced via branch protection in `cru-terraform`). New contributors and
contractors: just open the PR; the right reviewers are requested automatically.

## Browser Support

Browser and device usage based on GA4 28-day active users for knowgod.com / GodTools (Apr 8 – May 5, 2026).

_Last updated: 2026-05-05; review annually._

**Targeted browsers** (`.browserslistrc`: `> 0.5%, last 2 versions, Firefox ESR, not dead`): the last 2 versions of Chrome, Edge, Firefox (and Firefox ESR), Safari (macOS & iOS), and other evergreen browsers above 0.5% global usage. Internet Explorer is not supported.

**By browser**

| Browser          | Share |
| :--------------- | :---- |
| Android Webview  | 50.5% |
| Chrome           | 36.2% |
| Safari           | 8.0%  |
| Samsung Internet | 2.5%  |
| Edge             | 1.1%  |
| Other            | <1%   |

**By device**

| Device  | Share |
| :------ | :---- |
| Mobile  | 86.5% |
| Desktop | 13.2% |
| Tablet  | 0.4%  |

## Documentation

Further docs live in [`docs/`](docs/) — see
[`docs/parser.md`](docs/parser.md) for the GodTools XML parser.
