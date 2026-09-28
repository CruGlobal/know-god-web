# Branches, commits and PRs

Based on what got approved quickly between Oct 2025 and Sep 2026.

## Branch

- Name it after the ticket: `GT-2031-rebuild-image-prefetcher`, or just
  `GT-2972`. Without a ticket, a short kebab name (`fix-share-urls`).
- Branch from and target `main`. CI PR checks only run for `main` and
  `staging`. Do not target a short-lived feature branch unless told to (#301
  was auto-closed when its base branch was deleted).
- Big features may use a long-lived feature branch with small sub-PRs into
  it, then one umbrella PR to `main` (Lessons: #286, #288, #290, #292, then
  #291). Only do this when asked.

## Commits

- Small, imperative, sentence case, one concern each:
  `GT-3059 Rename getImageUrl to getResourceUrl`,
  `Add test for contentEvent in onFormAction method`.
- A body that says why is welcome for anything non-obvious.
- Review fixes: either one commit per thread
  (`fix: address review comment on <path>:<line>`) or one
  `Review suggestions` commit. The PR template asks you to clean up history
  before review, so squash WIP noise before requesting review.
- No emoji or marketing language ("Enterprise-grade reliability", #301).
- If a branch picked up unrelated commits, recreate it with only the right
  commits (#289 was closed and redone as the 1-commit #290).

## Title

- With a ticket: `GT-#### - Summary` (max 80 chars, imperative).
  `[GT-####] - Summary` and `GT-#### Summary` also appear and are accepted.
- Without a ticket: `[No Jira] - Summary` (the form in the PR template).
- Update the title if the scope changes during review (#334 was not updated
  and ended up misleading).

## Body

Fill `.github/PULL_REQUEST_TEMPLATE.md`. Keep it short and specific. dr-bizz
rejected docs that "feel like AI wrote it... repeats itself a lot" (#319).

What strong descriptions had in common:

- **Why**, in one or two sentences. For bugs: the root cause, and a link to
  the change that caused it if known (#307).
- Jira link: `[GT-####](https://jira.cru.org/browse/GT-####)`. Reviewers ask
  for it if it is missing (#313).
- Links to the source of truth when relevant: the XSD line in
  mobile-content-api, the mobile renderer file (#314, #334).
- Before/after screenshots for any UI change.
- Related or dependent PRs, and overlap with other open PRs (#340, #375).
- Honest scope notes and follow-ups ("This is a quick working solution",
  #308). Say what you did not test.
- **Testing** with real routes a reviewer can open locally. Reviewers praise
  reproduction URLs: "Thanks for the reproduction URL! That made it really
  easy to test." (#328). Examples: `/en/tool/v1/kgp/0`,
  `/en/lesson/lessondemogospel/6`, `/zh-hant/tool/v1/kgp?icid=gtshare`.
  Include RTL (`/ar/...`) or embed (`embed/example.html`) checks when
  relevant.
- The local check results, for example `yarn test --no-watch: 211/211 pass`.
- Checklist ticked **honestly**. Mark items N/A with a reason. Do not tick
  `/agent-review` unless it ran.

Example:

```markdown
## Description

- Buttons with `style="outlined"` rendered as solid. The component never read
  `button.style`, so it now sets `button-outline` when the style is OUTLINED.
- Renamed the global `button-white` class to `button-outline` and updated its
  two existing users, instead of adding a new class.
- [GT-3057](https://jira.cru.org/browse/GT-3057)

Before / After: (screenshots)

## Testing

- Run `yarn start:dev`
- Go to /en/tool/v1/emojitool2/10
- Check that "Learn More" is outlined and other buttons are unchanged
- `yarn test --no-watch`: N/N pass (use the real count)

## Checklist:
...
```

## Labels and review

- Add `On Staging` (merges into `staging` and `development`) and/or
  `On Development` so the product owner (Aaron) can QA on a live
  environment. The merge bot often reports "Merge conflict... Please fix
  manually". Fix it by merging `main` into your branch or resolving on the
  target branch; never force-push someone else's branch.
- Run `/agent-review` and address findings before asking a human.
- Add the `Review` label when ready. It requests one random member of the
  web team. Request individuals, not the whole "Web Engineering" team (it
  also pings Content Platform, #340).
- Who reviews what:
  - **canac**: code style, perf, a11y, runs it in the browser with DevTools.
  - **zweatshirt**: TypeScript, tests, a11y line comments.
  - **frett**: godtools-shared, parser, XSD and mobile parity, architecture.
    His approval alone does not satisfy the web review rule.
  - **dr-bizz**: tooling, CI, docs.
  - **aaronlaib**: product owner UAT on staging.
- Reply to every review thread. Say what changed and the commit sha, or why
  you are not changing it. Declining an optional or "very opinionated"
  comment is fine with a reason, and precedent in the repo or the actual
  error message is the most convincing reason (#317, #318).
- Authors merge their own PRs after approval.

## CI and workflow changes

- Only include steps you need. Do not copy config from other repos blindly
  (`yarn cache clean` from MPDX, #318).
- Avoid `pull_request_target`. If it is truly needed, add a Security
  Concerns section (#331, #380). When changing triggers, update every
  `github.event_name` check.
- Label-triggered workflows only run from `main`, so they cannot be tested
  inside the PR.
- Least-privilege `permissions`.
