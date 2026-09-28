# Review lessons (evidence)

Real reviewer feedback from CruGlobal/know-god-web PRs, Oct 2025 to Sep 2026,
grouped by theme. Use it to predict what a reviewer will say about your diff.
PR numbers are in `CruGlobal/know-god-web`.

## 1. Tests are expected and block approval

- #313 zweatshirt (changes requested): "Would we also be able to add a few
  tests? ... a couple might be good even just as self documentation of
  behavior for future devs ... Happy to approve once we have some tests!"
- #315 zweatshirt (x3): a test named "events only" also hit the url path
  without asserting it. "I'd either delete this test or preferably test the
  'events only' and 'url only' paths." Final: one spec per branch, each
  asserting DOM and spies.
- #313 zweatshirt: `expect(x.size).toBe(1)` became `expect(x).toHaveSize(1)`.
  Inline mock data was moved to `mocks.ts` (`mockBooksData`).
- #306 canac: "Thanks for the cleanup and the verification test cases!"
  A spec was added for the new shared class.
- #328: `/agent-review` flagged new orchestration as untested, so 4 specs were
  added.

## 2. But not low-value tests

- #350 canac: "I'd remove this spec" (a test that Google+ is no longer
  rendered).
- #309 zweatshirt: "Not sure how helpful the tests in this block are as they
  seem to be mostly just testing browser API functionality directly." Block
  removed before approval.
- #333 self-review: keep ICU/CLDR-dependent assertions out of component specs.
  Use app-controlled mock data. Keep ICU checks in the helper's own spec.
- #317 zweatshirt: "What do you think of removing this assertion? the
  assertions beneath it seem sufficient".

## 3. Types: no `any`, no needless casts

- #308 canac on `let component: any;`: "Does this have to be `any`?" Fixed
  with a typed component plus `component['privateMember']`.
- #306 canac: "Unnecessary type cast" (removed `as ContentItems`).
- #292 canac: "Thanks for giving `anim` a type! This cast isn't needed now."
- #306 fork review: replace `state: any` with `ParserState`, add local
  interfaces. A later commit had to "Add back fallback value" (`|| 0`) that
  the typing refactor dropped.
- #313: `availableLangs: []` became `{ code: string; name: string }[]`.
- #309 zweatshirt: "Optional but I would type these as well" (test vars).
- #317 zweatshirt asked to avoid `as unknown as XmlParserData`. The author
  cited precedent in another spec and it was accepted.

## 4. Reuse, do not duplicate

- #306 canac: "This section shows up in a lot of components. Is there a way to
  extract it into one place instead of having to copy/paste?" Result:
  `VisibilityWatchers`. canac: "I like how we use a service for the logic now!"
- #292 canac: "This is now the third copy of these buttons ... good candidate
  for a reusable component." Result: `PageNavigationComponent`.
- #292 canac: "This looks similar to `hasPreviousVisiblePage`. Could the
  logic be reused?"
- #290 canac: "There's already a loading spinner component: `<app-loader>`."
- #315: per-component click logic replaced with
  `PageService.handleClickable`.
- #334 to #340: the third copy of the image URL fallback was moved into
  `PageService.getResourceUrl`.
- #335: reused and renamed `button-white` to `button-outline` instead of
  adding a class.

## 5. Match the schema, the mobile app and the public parser API

- #334 frett (changes requested): "buttons don't need to support start/end
  images on the child text nodes, they only need to support icon & icon
  gravity defined on the button itself." He linked `content.xsd`.
- #334 canac: "Is support for `startImgResource` and `endImgResource` needed
  for the web?"
- #292 frett on `e31_1`: "those internal properties could change on a whim
  when publishing a new build, so it's highly brittle poking at an internal
  property like that."
- #292 frett: "it is possible for a 'State' event to resolve to multiple
  actual events" and "also possible for a state event to resolve to 0".
- #334 / #340 frett: images must come from the published content location,
  not the attachments table.
- #291: do not ship `main` on a `-SNAPSHOT` godtools-shared version.
- #314 zweatshirt: move the inline `org.cru...Multiselect.Option.Style` enum
  into `xml-parser.service.ts` and export it: "This is the pattern the app
  uses for stuff like this from the godtools module."

## 6. Dead code and simplification

- #333 canac: "Is this method used? It looks like dead code."
- #333 canac: "Does this need to be optional? It is always passed a value."
- #292 canac: "Won't the `.has()` always return false because we just cleared
  the set?"
- #292 canac: "What is this check for `'content' in this._page`? TypeScript
  thinks that `content` is always a property".
- #292 canac: "Why do we need to hardcode the function name?"
- #292 canac: "This style file is intentionally empty, right?" (removed).
- #292 canac: single ternary instead of a second `isLesson` check;
  destructuring `const [langId, toolTypeParam, ...rest] = segments;`
  ("Definitely much nicer").
- #313 zweatshirt: collapse `if/else if/else` navigate calls into one call
  with a computed segment. Named boolean const for a filter.
- #306 canac: arrow callbacks should be blocks. "Can we make this a block
  too?"
- #309 zweatshirt: "Can we use `const` here instead of `var`?"

## 7. Runtime behavior the reviewer sees in the browser

canac and zweatshirt run the branch and compare to production.

- #333 canac: "I'm seeing a TypeError in DevTools ... `Cannot read properties
  of undefined (reading 'filter')`". Fixed with a guard and a regression test.
- #333 canac: "No languages found" showed while loading, and aria-live
  announced it. Gate empty states on loaded data.
- #333 canac: "I see some layout shift when filtering. Can we fix that?"
  (with video). Took four commits.
- #333 canac: "`filteredLangs` is evaluated three times per change-detection
  cycle ... getters are not memoized." Changed to a field.
- #333 canac: an eager `Intl.DisplayNames` per language on every emission.
  Made lazy with a cache. The cache check `if (!searchKey)` treats `''` as a
  miss, so use `=== undefined`.
- #333 canac: "Should we autofocus the search input when it becomes visible?"
- #317 zweatshirt (changes requested): images broke on
  `/en/tool/v1/poweroverfear/1` compared to prod. Skipping `addAttachment`
  also emptied a lookup table other pages used. Check side effects of any
  call you skip.
- #292 canac: "View All Tools" linked to `/tools` instead of `/en/tools`.

## 8. DOM, CSS and the embed

- #306 canac: "Does this need to be two separate elements? Can we combine
  them?" Plus a long warning that a new wrapper `div` breaks
  `.flow-item app-content-repeater app-content-card > a` (global CSS via
  `ViewEncapsulation.None`) and counts toward the embed iframe height.
- #306 canac: "Does this component need an `isInvisible` check?" Be
  consistent across sibling components.
- #314 (Claude "must fix" relayed by zweatshirt): `.card` and `.selected`
  had equal specificity and `.card` came later, so it overrode the selected
  style. New margin was scoped with `:has(.multiselect-option.card)`.
- #315 zweatshirt: "`href="javascript:void(0)"` is an accessibility
  anti-pattern and we also lose benefits like the ability to open links in a
  new tab". Use `<a [href] target="_blank" rel="noopener noreferrer">` or
  `<button type="button">`.
- #292 canac: "Would it work to use real buttons instead of `<a>` elements?"
- #334: decorative `alt=""` with a text label, fallback alt when icon-only
  (WCAG 4.1.2). RTL-safe `margin-inline-*`.
- #310: follow-up PR because embed attribute docs were missed in #309.

## 9. Scope and hygiene

- #306 canac: "I think we can revert this change" (unrelated edit).
- #318 dr-bizz: "Did the linter just update this? Seems like nothing
  changed." Unexplained formatter churn gets questioned.
- #318 dr-bizz: "do we need yarn cache clean?" (copied from another repo).
- #292 frett: "I'm guessing you didn't want to actually add
  `package-lock.json`". canac: "This lockfile seems different from what is
  in `package.json`."
- #306: a conflict resolution regenerated `yarn.lock`, bumped TypeScript and
  broke the build.
- #334: a local launch config was committed by accident, twice.
- #313: extra scope was checked with the product owner in Jira first. The
  author: "I don't want to do unnecessary code if it is not needed."
- #315: making cards keyboard-tabbable was deferred as out of scope.

## 10. Comments and docs

- #292 canac: comments should help "future devs and LLMs", and explain
  "why" when the reason is not obvious (why `cyoa-page` cannot use
  `PageNavigationComponent`).
- #331 canac: "I don't know if we need the history here."
- #374 canac: "Can we remove references to the proxy now that it doesn't
  exist anymore? I don't think we need that historical context."
- #319 dr-bizz: "It feels like AI wrote it ... it seems to repeat itself a
  lot." Also: wrong Node version in many places. Verify versions against the
  repo.
- #295: AI-written docs were accepted because the author said so and frett
  fact-checked them.

## 11. Security and CI

- #331 canac: "Are you positive this is safe? I know that
  `pull_request_target` is a good way to get a repo compromised." Switched
  to `pull_request`.
- #380: shipped with `event_name == 'pull_request'` checks after moving to
  `pull_request_target`, so the job never ran. Fixed later on `main`.
- #375 (open): share URLs were built by string replacement without encoding,
  so Facebook only got `https://knowgod.com/`. Encode interpolated values.

## What fast approvals looked like

- #307: one-line fix plus one regression test, root cause linked. Approved by
  two reviewers the same day.
- #335: 1 commit, Jira link, before/after screenshots, a one-line testing
  route, 3 focused specs. Approved the same day with no comments.
- #328: 1 commit, template filled, reproduction URL, `/agent-review` run
  first. canac: "tests great too! Thanks for the reproduction URL!"
