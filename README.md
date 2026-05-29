# KnowGod.com embedable web app

This is an Angular 17 project created with TypeScript.

## Development

These instructions are written for **macOS** and walk through setting up the
project from a clean machine. By the end you'll have the app running locally at
[`http://localhost:4200/en`](http://localhost:4200/en).

### Prerequisites

| Tool       | Version    | Why                                        |
| ---------- | ---------- | ------------------------------------------ |
| Node.js    | `20.17.0`  | Defined in [`.tool-versions`](.tool-versions) |
| Yarn       | `4.7.0`    | Package manager (bundled via `.yarn/releases`) |
| Git        | any recent | Cloning the repo and deploying             |
| Homebrew   | any recent | Installing asdf                            |

This project pins exact tool versions, so matching them avoids hard-to-debug
issues. Node is managed with [asdf](https://asdf-vm.com/) and Yarn is committed
into the repo, so once Node is correct there's nothing extra to install for Yarn.

If you don't already have **Homebrew**, install it first:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 1 — Clone the repository

```bash
git clone https://github.com/CruGlobal/know-god-web.git
cd know-god-web
```

### Step 2 — Install the correct Node version with asdf

This project requires Node `20.17.0`. Check what you have with `node --version`.
If it doesn't match, install the pinned version with asdf.

```bash
# Install asdf and the Node plugin
brew install asdf
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git

# Integrate asdf with your shell.
# ZSH is shown here (the macOS default). For other shells see
# https://asdf-vm.com/guide/getting-started.html#_3-install-asdf
echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc
```

> **Important:** Close that terminal tab/window and open a new one so the shell
> picks up the asdf configuration before continuing.

```bash
# From inside the repo, install the Node version defined in .tool-versions
asdf install nodejs

# Confirm you're now on the right version
node --version   # should print v20.17.0
```

Because the version is pinned in `.tool-versions`, asdf automatically switches to
`20.17.0` whenever you `cd` into this project.

### Step 3 — Verify Yarn

Yarn `4.7.0` ships with the repo (see [`.yarnrc.yml`](.yarnrc.yml)), so you don't
need to install it separately. Confirm it resolves:

```bash
yarn --version   # should print 4.7.0
```

If `yarn` isn't found, enable Corepack (included with Node) and retry:

```bash
corepack enable
```

### Step 4 — Install dependencies

```bash
yarn
```

This installs all packages and runs the `postinstall` hook, which sets up Husky
git hooks (used for pre-commit formatting).

### Step 5 — Run the development server

```bash
yarn start
```

`yarn start` serves the **production** configuration. By default the dev server
proxies API requests (languages, translations, resources, assets) to Cru's
production backends — see [`proxy.conf.json`](proxy.conf.json) for the mappings.

If you'd rather pull data from the **staging** database, run:

```bash
yarn start:dev
```

Once the build finishes, open
[`http://localhost:4200/en`](http://localhost:4200/en) in your browser to view
the site. The server hot-reloads as you edit files.

### Useful scripts

| Command               | What it does                                            |
| --------------------- | ------------------------------------------------------- |
| `yarn start`          | Dev server, production configuration                    |
| `yarn start:dev`      | Dev server, development configuration (staging data)    |
| `yarn build`          | Production build                                         |
| `yarn build:dev`      | Development build                                        |
| `yarn test`           | Run unit tests once (Karma + Jasmine)                   |
| `yarn lint`           | Lint and auto-fix `src/**/*.{js,ts,html}`               |
| `yarn prettier:check` | Report files that aren't formatted                      |
| `yarn prettier:write` | Format all files                                        |

### Troubleshooting

- **`node --version` doesn't show `20.17.0`** — Make sure you opened a new
  terminal after the asdf shell integration step, and that you're inside the
  repo directory so asdf reads `.tool-versions`.
- **`command not found: yarn`** — Run `corepack enable`, then retry. Yarn is
  driven by the `yarnPath` in `.yarnrc.yml`, so it only works once Corepack is on.
- **Install fails on peer-dependency errors** — The repo sets
  `legacy-peer-deps=true` in `.npmrc`; if you see peer warnings they're expected
  and non-fatal.
- **API requests fail locally** — Confirm you started the app with `yarn start`
  or `yarn start:dev` (not a bare `ng serve`), since the proxy config is wired
  through those scripts.

## Directory Structure

This is a standard [Angular CLI](https://angular.dev/tools/cli) project, so most
application code lives under `src/`. The pieces specific to Know God are:

```
src/
  app/                 Application root module and components
    app.module.ts      Root NgModule wiring up the app
    app.component.*     Root component
    page/              The main tool renderer — turns a resource into pages
      component/        Per-content-type components (tract pages, CYOA pages,
                        cards, paragraphs, links, spacers, etc.)
      model/            View models for page rendering
      service/          Page-scoped services
    dashboard/          Landing/index view
    services/           App-wide services (analytics, common, loader,
                        xml-parser) — the XML parser turns GodTools resource
                        files into renderable content
    shared/             Reusable helpers and components (loader, sharing modal,
                        URL/event helpers)
    api/                API URL definitions (url.ts)
    _tests/             Shared test mocks (mocks.ts)
  assets/              Static CSS, fonts (FontAwesome), images, sitemap
  environments/        Per-environment config (see below)
  index.html           Host page; contains the embed iframe height-posting script
  main.ts              Application bootstrap
  styles.css           Global styles

embed/                 The embeddable loader (embed.js) and a usage example
mobile/                Mobile deep-linking association files served at
                       /.well-known/ (Apple app site association, Android assetlinks)
proxy.conf.json        Dev-server proxy mapping API paths to mobile-content-api
```

### Configuration & environments

Environment config lives in `src/environments/` rather than a `.env` file:

- `environment.ts` / `environment.development.ts` — local/dev defaults; point at
  the **staging** mobile-content-api.
- `environment.prod.ts` — production; points at the production mobile-content-api.

Angular swaps these via the `fileReplacements` in `angular.json` depending on the
build configuration. During local development, API calls are additionally routed
through the dev-server proxy defined in `proxy.conf.json`.

## Testing

Unit tests run on [Karma](https://karma-runner.github.io/) with
[Jasmine](https://jasmine.github.io/), the Angular CLI default. Run the full
suite once with:

```bash
yarn test
```

This executes `ng test --watch=false`, so it runs a single pass and exits — which
is also what CI runs. To iterate locally with the watcher and the in-browser
Jasmine HTML reporter, run `yarn ng test` directly.

### Where tests live

Test files sit **next to the code they test**, using the `.spec.ts` suffix. For
example, the spec for `src/app/services/analytics.service.ts` is
`src/app/services/analytics.service.spec.ts`, and component specs live alongside
their components throughout `src/app/page/component/`. Shared test mocks live in
[`src/app/_tests/mocks.ts`](src/app/_tests/mocks.ts).

### Test runner setup

The runner is configured in [`src/karma.conf.cjs`](src/karma.conf.cjs). A few
things worth knowing:

- **Headless Chrome.** Tests run in a `ChromeHeadlessNoSandbox` launcher (headless
  Chrome started with `--no-sandbox`) so they work in CI containers as well as
  locally. This requires Chrome/Chromium to be installed.
- **Single run by default.** `singleRun: true` matches the `yarn test` behavior.
- **Coverage.** A `karma-coverage-istanbul-reporter` writes HTML and `lcov`
  reports to `coverage/`.
- **Asset proxy.** Requests to `/assets/` are proxied to `/base/src/assets/` so
  components that reference static assets resolve correctly under the test server.

### Writing a test

A minimal Angular component spec looks like this:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

Use Angular's `TestBed` to configure a testing module and render the component,
then assert against the rendered DOM or the component instance.

## Embed

Add the following snippet to any HTML page to embed a KnowGod.com gospel presentation:

```html
<div id="knowGodEmbed" data-book="kgp-us" data-lang="en" data-ministry="your-ministry-name"></div>
<script src="https://knowgod.com/embed.js"></script>
```

### Data Attributes

| Attribute | Required | Description |
|---|---|---|
| `data-book` | Yes | The book/resource identifier (e.g. `kgp-us`, `satisfied`) |
| `data-lang` | Yes | Language code (e.g. `en`, `es`, `fr`) |
| `data-ministry` | No | Your ministry identifier. Used for analytics to track which ministries are embedding content. |

The script creates an iframe pointing to `https://knowgod.com/#/{lang}/{book}?embedded=true`. When `data-ministry` is provided, a `&ministry={value}` parameter is appended to the URL so the analytics service can attribute embeds to specific ministries.

### Testing the Embed Locally

A test page is available at `embed/test.html` to verify the embed script works correctly. Start the dev server and open the test page:

```bash
yarn start
# then open http://localhost:4200/embed/test.html
```

The test page uses `window.location.origin` to dynamically point the iframe at the current host, so it works in any environment without needing the `{appDomain}` placeholder that CI/CD replaces in the production `embed.js`.

You can change the `data-book`, `data-lang`, and `data-ministry` values and click **Reload Embed** to test different configurations. The log panel at the bottom shows the generated iframe URL and any `postMessage` height updates received from the embedded content.

## Environments

A working example lives in [`embed/example.html`](embed/example.html).

### How the embed link works

The `embed.js` script is a small, dependency-free loader. The actual app is
never injected into the host page directly — instead it runs inside an iframe,
which keeps Know God's styles and scripts isolated from the host site. Here's the
full flow:

1. **Find the mount point.** On `window.onload`, the script looks for the
   `#knowGodEmbed` element. If it isn't found, it logs a message and stops.

2. **Read the attributes.** It pulls `data-book` and `data-lang` off that element.

3. **Build the iframe URL.** It constructs a hash-based URL in the form
   `{appDomain}/#/{lang}/{book}?embedded=true` and points an iframe at it. The
   iframe is styled to span 100% width, have no border, and start at a 450px
   minimum height. The `?embedded=true` query param tells the Angular app it's
   running embedded (see `page.component.ts`, which sets an `embedded` flag, and
   `analytics.service.ts`, which tags events as embedded).

4. **`{appDomain}` is environment-specific.** In the repo, `embed.js` ships with
   a literal `{appDomain}` placeholder. During deploy (see
   [`.github/workflows/node.js.yml`](.github/workflows/node.js.yml)), the CI
   pipeline copies `embed/embed.js` into the build output and runs a `sed`
   replacement that swaps `{appDomain}` for the real host (e.g.
   `https://knowgod.com`) before uploading it to S3. That's why the production
   embed script always points at the matching environment.

5. **Auto-resizing (iframe → parent).** Because the app lives in an iframe, the
   host page can't know how tall the content is. The app handles this from inside
   the iframe (`src/index.html`): it detects it's embedded (`window.location !==
   window.parent.location`), then uses a `MutationObserver` to watch for content
   changes and calls `parent.postMessage(document.body.offsetHeight, '*')`
   whenever the height changes (with a few delayed re-sends to account for images
   loading).

6. **Receiving the height (parent → iframe).** `embed.js` registers a `message`
   listener on the host page. When it receives a numeric height message it sets
   the iframe's height accordingly, and — if the user has scrolled past the top of
   the iframe — scrolls back up to keep the tool in view. A `previousHeight` guard
   prevents redundant updates.

In short: `embed.js` is the lightweight bridge that the host site loads, and the
real app runs sandboxed in an iframe. The two communicate via `postMessage` so
the embed grows and shrinks to fit its content automatically.

## Translations (i18n & Crowdin)

> **Status:** This translation tooling is being rolled out. If the files,
> scripts, or workflows referenced below aren't present in your checkout yet,
> they're still landing — this section documents the intended workflow.

UI strings are translated with [i18next](https://www.i18next.com/) and managed in
[Crowdin](https://crowdin.com/). Developers only ever write **English** strings in
templates; everything else (extraction, upload, translator hand-off, and the
return PR) is automated.

### Main flow

1. A developer writes a string in a template using the `i18next` pipe:
   `{{ 'Tools' | i18next }}`.
2. `yarn extract` scans the code and writes the keys into
   `src/assets/locales/en/translation.json`.
3. When changes are merged to `main`, the English strings are uploaded to
   Crowdin for translators.
4. Every **Monday at 5:50am EST**, translations are downloaded from Crowdin,
   sorted, and a PR titled **"Update translations"** is opened automatically.
5. The UI team reviews and approves that PR.

### One-time setup (installing the tooling)

This repo uses **Yarn** — use the `yarn add` commands below (the `npm` equivalents
are shown for reference only; don't run `npm install` here, as it would create a
conflicting `package-lock.json`).

```bash
# Runtime dependencies
yarn add i18next i18next-browser-languagedetector i18next-http-backend angular-i18next
# Dev dependency: the extractor
yarn add --dev i18next-parser
# Crowdin CLI
yarn add crowdin @crowdin/cli

# npm equivalents (reference only):
#   npm install i18next i18next-browser-languagedetector i18next-http-backend angular-i18next
#   npm install --save-dev i18next-parser
#   npm install crowdin @crowdin/cli
```

### Crowdin project

- **Project ID:** `897600` _(temporary — to be migrated to a new project owned by
  Sway Ciaramello)._
- **`CROWDIN_API_TOKEN`** is created in the Crowdin project and stored as a GitHub
  Actions repository secret at
  [Settings → Secrets → Actions](https://github.com/CruGlobal/know-god-web/settings/secrets/actions).

### Files and what they do

| File | Purpose |
| --- | --- |
| `src/app/i18n.ts` | Starts up i18next when the app loads |
| `src/app/app.module.ts` | Registers i18next with Angular so the `i18next` pipe works in templates |
| `i18next-parser.config.cjs` | Config for `yarn extract`; a custom lexer matches the `'key' \| i18next` pattern in HTML and extracts the key |
| `crowdin/sort-translations.cjs` | Alphabetically sorts every locale's `translation.json` |
| `src/assets/locales/en/translation.json` | The generated English source file |
| `crowdin.yml` | Crowdin project config — which file is the source, where translations go, and who reviews the auto-PRs |
| `.github/workflows/node.js.yml` | Adds a translation job to CI so every PR runs `yarn extract` |
| `.github/workflows/crowdin.yml` | Scheduled job that extracts, downloads translations from Crowdin, sorts them, and opens the "Update translations" PR |

### Using it in templates

The key **is the full English string**. Simple string:

```html
{{ 'Tools' | i18next }}
```

String with a dynamic value:

```html
{{ '1994-{{ year }} Cru. All Rights Reserved.' | i18next: { year: currentYear } }}
```

These produce the following entries in `translation.json` (keys are the full
English text):

```json
{
  "Tools": "Tools",
  "1994-{{ year }} Cru. All Rights Reserved.": "1994-{{ year }} Cru. All Rights Reserved."
}
```

After adding or changing strings, run `yarn extract` and commit the updated
`translation.json` along with your change.

## Continuous Integration

CI is defined in [`.github/workflows`](.github/workflows). There are two
workflows.

### `node.js.yml` (CI)

Runs on pushes to `staging`, `development`, and `main`, and on pull requests
targeting `staging` or `main`. Every job installs dependencies first (Node
version comes from `.tool-versions`). The four jobs are:

| Job                      | What it checks                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| 🧹 **Lint & Prettier**   | Runs `yarn prettier:check` then `yarn lint` — fails if anything is unformatted or violates lint rules. |
| ✅ **Tests**             | Runs `yarn test --no-watch` (Karma + Jasmine unit tests, single run).          |
| 🏗️ **Build app**         | Runs `yarn build` to confirm a production build compiles.                      |
| 🚀 **Deploy app**        | Only on pushes (not PRs) to `main`/`staging`/`development`. Waits for the three jobs above to pass, builds with the env-matched configuration, injects the host into `embed.js`, copies the `mobile/` directory, and syncs everything to S3. |

The deploy job picks its target environment from the branch: `main` → prod,
`staging` → stage, `development` → dev. PRs never deploy — they only run lint,
test, and build.

### `update-staging.yml` (Pipeline)

Automates branch promotion via PR labels (using `devmasx/merge-branch`):

- Add the **`On Staging`** label to a PR to auto-merge that branch into both
  `staging` and `development`.
- Add the **`On Development`** label to auto-merge it into `development` only.

This lets you get a branch onto a deployed environment for testing without
manually merging.

## Before creating a PR

CI will reject unformatted code, lint errors, failing tests, or a broken build,
so run these locally first to catch problems before pushing. They mirror the CI
jobs:

```bash
yarn prettier:write   # auto-format (or `yarn prettier:check` to only report)
yarn lint             # lint and auto-fix
yarn test --no-watch  # run unit tests once
yarn build            # confirm a production build compiles
```

> A Husky pre-commit hook runs `pretty-quick` on staged files automatically, so
> formatting is partially enforced on commit — but running the full set above
> still saves a round-trip with CI.

Open your PR against `staging` or `main` (those are the branches CI runs PR
checks on). If you want it deployed to a test environment, add the `On Staging`
or `On Development` label.

## Code review

You don't need to figure out who to tag — a [`.github/CODEOWNERS`](.github/CODEOWNERS)
file lists the maintainers, and GitHub automatically requests a review from them
when you open a PR. The current owners are:

- [@kegrimes](https://github.com/kegrimes)
- [@wjames111](https://github.com/wjames111)
- [@dr-bizz](https://github.com/dr-bizz)
- [@canac](https://github.com/canac)
- [@zweatshirt](https://github.com/zweatshirt)

Merges into `main` are protected: at least **one approving review** is required
and all CI checks must pass before the PR can merge (this is enforced via branch
protection managed in the `cru-terraform` repo). If you're a contractor or new
contributor, just open the PR — the right reviewers are requested automatically.
To update who the owners are, edit `.github/CODEOWNERS`.

## Environments at a glance

| Environment | URL                            | Deploys from |
| ----------- | ------------------------------ | ------------ |
| Production  | https://knowgod.com/en         | `main`       |
| Staging     | https://stage.knowgod.com/en   | `staging`    |
| Development | https://dev.knowgod.com/en     | —            |
| Local       | http://localhost:4200/en       | —            |

### Deploy

- Push to `staging` to auto-deploy to stage.knowgod.com
- Push to `main` to auto-deploy to knowgod.com

## Documentation

Additional documentation can be found in the `docs/` directory.
