# Contributing to know-god-web

Thanks for working on the Know God web app. This guide gets a new teammate or
contractor from zero to a merged PR. It intentionally stays short and links to
the [README](README.md) for the deep detail.

## 1. Get set up

Follow the **Getting started** steps in the [README](README.md): install the
pinned Node version with asdf (`.tool-versions` → Node 20.17.0), confirm Yarn
4.7.0 resolves (enable Corepack if not), run `yarn` to install, then `yarn start`
(production data) or `yarn start:dev` (staging data) and open
<http://localhost:4200/en>.

If anything misbehaves, check the README's **Troubleshooting** section first —
the common asdf / Corepack / proxy issues are covered there.

## 2. Understand the app

This is an Angular 17 app that is also **embeddable** in third-party sites via a
small `embed.js` loader that runs the app inside an iframe. If your change
touches the embed, read the README's **Embed** section and test against
[`embed/example.html`](embed/example.html). Tools are addressed by a hash route
in the form `/#/{lang}/{book}` (e.g. `/#/en/kgp-us` for "Knowing God Personally").

## 3. Branch and ticket conventions

- **Base branch:** open PRs against `staging` or `main`. CI only runs PR checks
  (lint, prettier, test, build) on those two branches — a PR against any other
  base will not be validated.
- **Title format:** `GT-(JIRA#) (summary, max 80 chars)`. `GT` is the GodTools
  Jira project prefix. If your work has no ticket, use a short descriptive title.
- **Commits:** clean up your commit history before requesting review.

## 4. Translations (i18n)

All UI strings are English-only in templates and translated via i18next +
Crowdin. When you add or change a user-facing string, write it with the `i18next`
pipe (e.g. `{{ 'Tools' | i18next }}`), run `yarn extract`, and commit the updated
`src/assets/locales/en/translation.json` with your change. Translators and the
weekly "Update translations" PR are handled automatically. See the
**[Translations (i18n & Crowdin)](README.md#translations-i18n--crowdin)** section
of the README for the full flow, setup, and template examples.

## 5. Before opening a PR

Run the same checks CI runs, so you don't round-trip with the pipeline:

```bash
yarn prettier:write   # auto-format (or prettier:check to only report)
yarn lint             # lint and auto-fix
yarn test --no-watch  # unit tests, single run (Karma + Jasmine)
yarn build            # confirm a production build compiles
```

If you touched user-facing strings, also run `yarn extract` and commit the
updated `translation.json`.

A Husky pre-commit hook runs `pretty-quick` on staged files, but running the
full set above is still the reliable way to match CI.

## 6. Deploying to a test environment

Branch promotion is driven by PR labels (see
[`.github/workflows/update-staging.yml`](.github/workflows/update-staging.yml)):

- **`On Staging`** — auto-merges your branch into both `staging` and
  `development`.
- **`On Development`** — auto-merges into `development` only.

| Environment | URL                          | Deploys from |
| ----------- | ---------------------------- | ------------ |
| Production  | https://knowgod.com/en       | `main`       |
| Staging     | https://stage.knowgod.com/en | `staging`    |
| Development | https://dev.knowgod.com/en   | `development`|
| Local       | http://localhost:4200/en     | —            |

## 7. Review

Request a review from another person on the project. There is no `CODEOWNERS`
file, so if you're new or external and don't know who to tag, ask the team lead
or whoever assigned you the ticket. For UI or tool-content changes, include
before/after screenshots or a short screen recording in the PR description so the
reviewer can verify the visual result quickly.

The PR template (`.github/PULL_REQUEST_TEMPLATE.md`) populates automatically when
you open a PR — fill out every section and tick the checklist.

## 8. Claude Code plugins (optional but recommended)

This repo ships the shared
[`CruGlobal/claude-code-plugins`](https://github.com/CruGlobal/claude-code-plugins)
marketplace in `.claude/settings.json`, so if you use Claude Code the `git`,
`quality`, `testing`, `admin`, and `figma` plugins are enabled for the project
automatically (run `/plugin marketplace update` if they don't appear). Useful
commands include `/quality:pr-review` before requesting review and
`/testing:test-writer` for new specs. These skills read `CLAUDE.md` in the repo
root to follow our Angular, testing, and embed conventions.
