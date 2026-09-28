---
name: know-god-developer
description: Write code and open PRs for know-god-web the way this team does, so the PR gets approved on the first or second pass. Use when implementing a Jira ticket (GT-####), a bug fix, or a feature in this repo, or when preparing a branch for PR. Built from 12 months of merged PRs and review comments (Oct 2025 to Sep 2026).
---

# know-god-web developer

This skill encodes how the team actually writes and reviews code here. It was
built by reading the diffs, review threads and final merged code of every
human PR from Oct 2025 to Sep 2026 (45 PRs). Evidence for each rule lives in
`references/review-lessons.md`. Copyable code lives in
`references/code-patterns.md`. PR title/body/commit guidance lives in
`references/pr-writing.md`.

Read all three reference files before writing code for a non-trivial change.

## Facts that override older docs

Some repo docs are stale. Trust these (verified against the repo) and re-check
`package.json`, `.tool-versions` and `.yarnrc.yml` if in doubt:

- **Angular 19**, not 17 (upgraded in #390). TypeScript is capped at `~5.8`.
- **NgModule based.** Every component has `standalone: false` and is declared
  in `src/app/app.module.ts`. New components must do the same. Never remove
  `standalone: false` and never turn on `@angular-eslint/prefer-standalone`
  (its autofix strips the flag and breaks the build).
- **tsconfig target ES2022, lib ES2023.** Use `flatMap`, `flat`, `findLast`,
  `at` directly. No `[].concat(...)` workarounds (removed in #320).
- Node `24.21.0`, Yarn `4.18.0`. Always `yarn`, never `npm`. Never commit
  `package-lock.json`. Keep `yarn.lock` in sync with `package.json`.
- **i18n has landed.** User-facing strings use the English text as the key with
  the `i18nextEager` pipe: `{{ 'View All' | i18nextEager }}`. Run
  `yarn extract` and commit `src/assets/locales/en/translation.json`. Specs
  for components that use the pipe need `I18NextModule.forRoot()` in `imports`.

## Workflow

1. **Understand the ticket and the source of truth.**
   - Content features must match the content XSD
     (`mobile-content-api/public/xmlns`) and the mobile renderer (godtools
     Android/Kotlin). Do not render attributes the schema does not allow on
     that element (frett blocked #334 for this).
   - Use only the public `@cruglobal/godtools-shared` API. Never touch
     Kotlin-mangled fields like `e31_1` ("highly brittle", #292).
   - If scope is unclear, stop and ask. The team checks scope with the product
     owner in Jira rather than guessing, and pushes extras to follow-up PRs.
2. **Find the nearest existing example and copy its shape.** Look at a sibling
   component, service or spec first. Reuse what exists: `<app-loader>`,
   `PageNavigationComponent`, `VisibilityWatchers`,
   `PageService.handleClickable`, `PageService.getResourceUrl`, helpers in
   `src/app/shared/`, mocks in `src/app/_tests/mocks.ts`.
3. **Write the smallest change that does the job.** One concern per PR. No
   drive-by refactors, doc rewrites, formatter churn in untouched files, or
   local IDE/launch configs. Revert anything unrelated before opening the PR.
4. **Write tests with the code** (see Testing below). Missing tests is the most
   common reason for "changes requested".
5. **Run the CI checks locally** and fix everything:
   ```bash
   yarn prettier:write && yarn lint && yarn test --no-watch && yarn build
   ```
   Also `yarn extract` if you changed user-facing strings. Note the spec pass
   count (for example `211/211`) for the PR body.
6. **Self-review the diff** against the checklist at the end of this file, then
   run `/agent-review` and fix its findings before asking a human.
7. **Open the PR** against `main` using `references/pr-writing.md`. Only open a
   PR when the user asks for one.

## Code rules

### Components
- Follow the content-component shape: `@Input() item`, typed plain fields for
  derived view state, `ngOnChanges` that **resets every derived field** and
  then calls `private init()`, a `ready: boolean` gate in the template.
  Cleanup in `ngOnDestroy`. See `code-patterns.md`.
- Keep components thin. Parsing, URL building and shared click logic go in a
  service (`PageService`, `ResourceService`) or a pure helper in
  `src/app/shared/`. If the same logic or markup appears a third time,
  extract it (canac, #292, #306).
- Composition over inheritance for shared behavior (`VisibilityWatchers` is a
  plain class each component owns).
- Do not store state on parser model objects. Wrap them in a local `type`
  (`type FlowContent = { item: FlowItem; visibility?: VisibilityWatchers }`).
- Watchers and subscriptions are owned by the component, closed in
  `ngOnDestroy` and before re-init. Subscriptions use
  `takeUntil(this._unsubscribeAll)`.
- Re-export godtools-shared enums and types from
  `src/app/services/xml-parser-service/xml-parser.service.ts` and import them
  from there. Never write `org.cru.godtools...` paths inline in components.
- Prefer the model's own flags (`image.isClickable`) over re-deriving them.
- Click handling: one `onClick()` that calls
  `this.pageService.handleClickable(model.events)`.
- Resolve images and animations only through
  `this.pageService.getResourceUrl(resource)` (published files, not the
  attachments table, #340).
- Avoid template getters that do real work (filtering, building objects).
  They run on every change detection. Use a field updated on change, or
  memoize (canac, #333).

### TypeScript
- **No `any`**, including in specs ("Does this have to be `any`?"). Use real
  types, local interfaces, `ParserState`, or `unknown` with a narrow cast.
- No unneeded casts ("Unnecessary type cast"). Remove casts once a value is
  typed.
- Params that are always passed should be required, not optional.
- Handle 0..N results. `EventId.resolve()` can return zero or many events, so
  never take `[0]`.
- `const` over `let`, never `var` in app code.
- Explicit `null` returns (`string | null`), optional chaining, `?? ''`.
  Keep existing fallbacks (`|| 0`) when refactoring types.
- Cache misses: check `=== undefined` or `.has()`, not a falsy check.
- Readability the reviewers ask for: early returns, destructuring, a single
  ternary instead of repeated branches, named boolean consts
  (`const shouldFilterLanguages = ...`), module-level consts for regexes
  (`IMAGE_EXTENSIONS_REGEX`), one `navigate` call with a computed segment.
- Arrow callbacks that assign use a block body:
  `(value) => { this.isHidden = value; }`, not `(value) => (this.isHidden = value)`.
- Delete dead code: unused methods, checks TypeScript already guarantees,
  conditions that can never be true, empty stylesheets, hardcoded special
  cases. No `console.log`.
- Names describe every use (`getImageUrl` became `getResourceUrl` because
  animations use it too). Rename cryptic legacy names you touch
  (`pRouteLang` to `urlLanguageCode`).

### Templates, a11y and CSS
- Real `<button type="button">` for actions and real
  `<a [href] target="_blank" rel="noopener noreferrer">` for URLs. Never
  `href="javascript:void(0)"` or `window.open` for links. Choose with
  `*ngIf="x.url; else xTemplate"` and share inner markup with
  `*ngTemplateOutlet`.
- Images get `[alt]`. Use `alt=""` when a text label is next to it, and a
  non-empty fallback when the image is the only content.
- Dynamic empty states use `role="status" aria-live="polite"`, and must not
  show while data is still loading.
- Keep the DOM flat. Put `*ngIf` / `[style.visibility]` on an element that
  already exists and keep its class. A new wrapper can break direct-child
  selectors (`app-content-card > a`) and the embed iframe height (#306).
- Plain CSS in the component's co-located `.css`. Use logical properties
  (`margin-inline-start/end`) for RTL. Watch specificity and source order.
  Scope new rules so existing variants do not change (`:has(...)`). Reuse or
  rename an existing global class before adding a new one.
- Avoid layout shift (fixed heights, `scrollbar-gutter: stable`,
  `flex-shrink: 0`). canac tests with DevTools open and will send a video.
- Do not break the embed contract: `postMessage` height in `src/index.html`
  and `embed/embed.js`, the `embedded` flag, embedded analytics. If you change
  `embed.js` attributes, update `README.md` in the same PR (#310).

### Routes and URLs
- Endpoints live in `src/app/api/url.ts` built from
  `environment.mobileContentApiUrl`. No per-environment branching in
  components.
- Encode interpolated URL values (`URL`/`URLSearchParams`,
  `encodeURIComponent`).
- Route order: literal segments (`tool/`, `lesson/`) before param-only routes,
  legacy redirects last. In-app links include the language prefix
  (`/${lang}/tools`).

### Comments
- Short `//` comments that explain **why** when the code cannot ("Add all
  resources to the lookup table so they can be accessed by any page that needs
  them"). canac wants comments that help "future devs and LLMs".
- No history or backstory in comments or docs. Remove stale references
  instead of explaining them (#331, #374).

## Testing

- Karma + Jasmine, spec co-located as `*.component.spec.ts`. Extra focused
  specs may use suffixes (`-filtering.component.spec.ts`).
- `TestBed` with `declarations: [MyComponent]`, a real `PageService` (or
  `{ provide: PageService, useValue: pageService }`), then `spyOn` its methods.
- Drive lifecycle explicitly:
  `component.ngOnChanges({ item: new SimpleChange(null, item, true) })`, then
  `fixture.detectChanges()`.
- **One test per branch** (events only, url only, both, neither; START / END /
  CENTER; `<a>` vs `<button>`; null data). A test that does more than its
  name says gets flagged.
- Assert both the component field **and** the rendered DOM
  (`querySelector('a').getAttribute('href')`, `classList.contains(...)`,
  `style.visibility`).
- Fixtures and helpers go in `src/app/_tests/mocks.ts` (`mockButton`,
  `mockCard(hasEvents, hasUrl)`, `createResource`, `mockVisibilityWatchers`).
  Extend factories with optional, typed, defaulted params that use real
  godtools-shared enums. Update mocks when parser models change.
- Typed test variables (`let component: MyComponent`). Reach private members
  with `component['privateThing']` or `spyOn<any>(component, 'method')`, not
  `let component: any`. `as unknown as X` is tolerated in specs when there is
  precedent, but reviewers notice it.
- Names: `methodName() should ...` or a plain behavior sentence
  (`fires events only when clicked on with events`).
- Jasmine idioms: `toHaveSize`, `toBeTrue`, `fakeAsync`/`tick`,
  `await fixture.whenStable()`.
- **Do not write low-value tests**: tests that only exercise browser APIs
  (#309), tests that assert a removed thing is gone (#350 "I'd remove this
  spec"), or ICU/locale-dependent assertions in component specs (#333).
- Clean up globals you set (`delete window.x`, remove added `<link>` tags).

## Pre-PR self-review checklist

- [ ] Change matches the ticket, the XSD and the mobile renderer. No extra scope.
- [ ] No `any`, no unneeded casts, no dead code, no `console.log`, no `var`.
- [ ] Reused existing components, services, helpers and mocks.
- [ ] New components have `standalone: false` and are declared in a module.
- [ ] Every derived field is reset in `ngOnChanges`. Watchers/subscriptions
      closed in `ngOnDestroy`.
- [ ] Real `<a>`/`<button>`, `alt` set, RTL-safe CSS, no new wrapper elements.
- [ ] No expensive template getters. No empty state flashing while loading.
- [ ] Specs cover each branch and assert the DOM. Fixtures in `mocks.ts`.
- [ ] New user-facing strings use `i18nextEager` and `yarn extract` was run.
- [ ] `yarn prettier:write`, `yarn lint`, `yarn test --no-watch`, `yarn build`
      all pass. No unrelated files in the diff (`git diff --stat main...`).
- [ ] Manually checked in `yarn start:dev` at a real route, with the DevTools
      console clean. For embed changes, checked `embed/example.html`.
