<!--
USAGE: /pr-review

You can also specify if the review is for a Senior or an Experienced engineer.
/pr-review senior
/pr-review experienced

-->

## Stage 0 — Confirm Developer Experience Level

**STOP HERE FIRST**

**IF $ARGUMENTS is empty or not "senior" or "experienced":**

**YOU MUST** ask this question and **WAIT FOR USER RESPONSE** before proceeding to any other stages.

**DO NOT** start Stage 1, git commands, or any review work until answered.

Ask exactly:

"What experience level should I tailor this review for?

- **Senior**: Concise feedback, focus on architecture/performance
- **Experienced**: Detailed explanations with mentoring notes"

**WAIT FOR ANSWER. DO NOT CONTINUE WITHOUT RESPONSE.**

**IF $ARGUMENTS is "senior" or "experienced":** Proceed directly to Stage 1 using that level.

---

Dev experience level: $ARGUMENTS

Before the review, print exactly: Operating in review-only mode (with .ai-review.json exception).

MODE

- REVIEW ONLY of the current PR diff; do NOT modify existing files or stage/commit.
- Single exception: you MAY create ONE untracked file at repo root: `.ai-review.json`. Do not modify other files; do not stage/commit.

---

=== Stage 1 — Setup Knowledge ===

First, read these files to understand project conventions:
- `CLAUDE.md` — architecture, coding standards, behavior instructions

Then use **concrete** search commands to build context for reuse analysis. Run these in parallel where possible:

```bash
# Understand existing patterns in areas relevant to the PR
ls src/app/services/                  # Existing services
ls src/app/page/component/            # Content components
ls src/app/page/service/              # Page services
ls src/app/shared/                    # Shared UI components
ls src/app/_tests/                    # Test mocks and fixtures
```

Additionally, based on what the PR touches:
- If PR touches components: Read the relevant component file(s) AND their specs to understand existing patterns
- If PR touches services: Read `src/app/page/service/page-service.service.ts` for core service patterns
- If PR touches routing: Read `src/app/app.module.ts` for routing and module configuration
- If PR touches API layer: Read `src/app/api/url.ts` for API endpoint patterns
- If PR touches shared components: Read similar shared components for UI patterns

Note common patterns for later reuse identification in Stages 4-5.

**Repo heuristics to enforce:**

_Architecture:_
- Components are focused; business logic belongs in services, not components
- Services use RxJS Subjects/BehaviorSubjects for state management (no NgRx)
- `PageService` is the central service managing page navigation, form/modal state, and content caching
- `XmlParserService` wraps `@cruglobal/godtools-shared` for manifest parsing
- Traditional NgModule architecture (not standalone components)

_Content Pipeline:_
- Content is fetched from mobile-content-api and parsed from XML manifests
- Components in `src/app/page/component/` render dynamically based on parsed content type
- API URLs are centralized in `src/app/api/url.ts`
- Environment-specific config in `src/environments/`

_Data integrity:_
- RxJS subscriptions must be properly unsubscribed (use `takeUntil`, `async` pipe, or explicit unsubscribe in `ngOnDestroy`)
- BehaviorSubject initial values should be sensible defaults
- HTTP error handling should use RxJS `catchError` operator
- Observable chains should handle error and completion states

_Testing:_
- Specs use Jasmine with Karma (`*.spec.ts` files adjacent to source)
- TestBed is used for component and service testing
- Mock data is centralized in `src/app/_tests/mocks.ts`
- Specs should properly initialize TestBed with required imports and providers

_Code quality:_
- ESLint compliance (`npm run lint`)
- Prettier compliance (`npm run prettier:check`)
- Component selectors use `app` prefix with kebab-case (elements) or camelCase (directives)
- Import order enforced: builtin > external > internal > parent > sibling > index
- Single quotes, no trailing commas

---

=== Stage 2 — File Index (completeness gate) ===

**IMPORTANT**: Before running ANY git commands, you MUST print this exact message:
"NOTE: The following git commands are read-only operations that will not modify your codebase.
They're being run to determine what code has changed so that the code review can apply to the changes"

**Step 1: Get the diff**

- `git branch --show-current` - Get current branch name
- `gh pr view --json baseRefName --jq '.baseRefName'` - Get the PR's actual base branch (may not be `main` for stacked PRs)
- `gh pr diff` - Get the actual diff as GitHub sees it (use this for file list, diff content, and position calculation — NOT `git diff`)
- `gh pr diff | grep '^diff --git' | sed 's|diff --git a/||;s| b/.*||'` - Get files changed in the PR

**IMPORTANT**: Always use `gh pr diff` instead of `git diff main...HEAD`. The PR may target a feature branch, not `main`. Using `git diff main...HEAD` would include changes from the parent branch that are NOT part of this PR.

**Step 2: File inventory**

List EVERY file changed in this PR (relative path). For each file, include:

- Kind: {component | service | module | directive | pipe | guard | interceptor | spec | mock | config | style | template | environment | asset | ci | other}
- Risk: {low | med | high}
- Why (1 sentence)

Do not skip any file. If any file can't be read, state it and continue.

---

=== Stage 3 — PR Risk Assessment ===

Analyze the PR changes and display a risk assessment report.

**Step 1: Calculate Risk Score**

Start with a base score of 0, then add points:

**Critical File Patterns (+3 points each):**
- `src/app/app.module.ts` — Root module (routing, providers, imports)
- `src/app/app.component.ts` — Root component
- `src/environments/environment.prod.ts` — Production environment config
- `.env*` — Environment files (automatic senior review)
- `package.json` — Dependency changes (new packages)
- `src/app/page/service/page-service.service.ts` — Core page state management service
- `src/app/services/xml-parser-service/` — XML parsing pipeline (core dependency)
- `.github/workflows/*.yml` — CI/CD workflows
- `.claude/commands/*.md` — Review process definitions (controls how AI reviews behave)

**High-Risk File Patterns (+2 points each):**
- `src/app/api/url.ts` — API endpoint configuration
- `src/app/services/analytics.service.ts` — Analytics/tracking integration
- `src/app/services/common.service.ts` — Shared service logic
- `src/app/page/component/**/*` — Content rendering components (any)
- `angular.json` — Build configuration
- `tsconfig*.json` — TypeScript configuration
- `eslint.config.js` — Linting rules
- `embed/embed.js` — Embed iframe script (affects all embedded consumers)
- `src/index.html` — Entry point HTML
- `src/main.ts` — Bootstrap entry point

**Medium-Risk File Patterns (+1 point each):**
- `src/app/header/` — Header component
- `src/app/shared/` — Shared UI components
- `src/app/page/model/` — Page parameter models
- `src/styles.css` — Global styles
- `src/polyfills.ts` — Browser polyfills

**Low-Risk Files (0 points):**
- `**/*.spec.ts` — Test files only
- `*.md` (not `.claude/commands/*.md`) — Documentation
- `src/assets/*` — Static assets (images, sitemap)
- `src/app/_tests/*` — Test mocks and fixtures

**Change Volume Modifier:**
- <50 lines total: +0
- 50-200 lines: +1
- 200-500 lines: +2
- 500+ lines: +3

**Scope Multiplier** (apply after base score):
- Single domain (e.g., only specs, or only one component): x1.0
- Multiple domains (e.g., component + service + module): x1.3
- Cross-cutting (e.g., API + services + components + config): x1.7

**Special Pattern Detection (additional points):**
- New npm package in `package.json`: +2
- Updated critical package (angular, rxjs, typescript, @cruglobal/godtools-shared): +3
- New file in `src/app/services/`: +1 (sets pattern for future services)
- New file in `src/app/shared/`: +1 (sets shared pattern)
- Changes to `angular.json` build config: +2

Cap the final score at 10.

**Risk Level Mapping (from final score):**
- **0-3**: LOW
- **4-6**: MEDIUM
- **7-8**: HIGH
- **9-10**: CRITICAL

**Step 2: Determine Day of Week**
```bash
date +%A
```

**Step 3: Determine Reviewer Level**

Monday-Thursday:
- Score 1-3: Any team member can review
- Score 4-6: Mid-level recommended, senior optional
- Score 7-8: Senior recommended
- Score 9-10: Senior required

Friday:
- Score 1-3: Any team member, but suggest waiting until Monday to merge
- Score 4-6: Senior recommended for Friday merge
- Score 7-10: Senior required, strongly suggest waiting until Monday

Saturday/Sunday:
- All scores: Treat as Friday + add weekend deployment warning

**Step 4: Display Risk Report**

Print this report before the deep review:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PR RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Score: [X]/10
Risk Level: [LOW | MEDIUM | HIGH | CRITICAL]

Files Changed: [N]
Lines Changed: +[X] -[Y]

Risk Factors Detected:
• [e.g., "Root module (src/app/app.module.ts): +3"]
• [e.g., "New npm package: +2"]
• [e.g., "Large changeset (350+ lines): +2"]
• [e.g., "Cross-cutting scope: x1.3"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 REVIEW RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Required Reviewer Level: [ANY | MID-LEVEL/SENIOR | SENIOR]

Reasoning: [1-2 sentence explanation]

[IF FRIDAY AND SCORE >= 4]
⚠️  FRIDAY DEPLOYMENT NOTICE
Consider waiting until Monday for safer deployment window.

[IF FRIDAY AND SCORE >= 7]
⚠️  HIGH-RISK FRIDAY DEPLOYMENT WARNING
Senior review required. Strongly consider waiting until Monday.

[IF WEEKEND]
⚠️  WEEKEND DEPLOYMENT WARNING
Consider waiting until Monday unless this is an urgent hotfix.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

=== Stage 4 — Deep Review (file-by-file) ===

IMPORTANT: Only review files that appear in the git diff from Stage 2. Do not review files that are not part of this PR.

**Issue Severity Guidelines:**
- **Must-fix**: Bugs, security issues, breaking changes, performance problems, memory leaks
- **Nice-to-have**: Style improvements, minor refactoring, following precedent patterns, better naming

For EACH changed file from Stage 2, review using the checklists below. Then document:

- Must-fix: file:line → issue → fix (unified diff if trivial)
    - Evidence (file:line-range quote)
    - Impact (correctness/perf/clarity)
- Nice-to-have (same format)
- Suggested tests (anchor to this file's code)
- Inline mentoring notes (only for Dev experience level: experienced)
- Quick patches (tiny unified diffs only; do not apply)

RULE: If no issues found for a file, state: "No issues found after deep check" AND explain the checks you ran.

**Review Checklists by File Type:**

_Components:_
- Proper lifecycle hook usage (`ngOnInit`, `ngOnDestroy`, `ngOnChanges`)
- RxJS subscriptions properly cleaned up (unsubscribe in `ngOnDestroy` or use `async` pipe)
- Input/Output decorators used correctly with proper types
- Change detection considerations (OnPush if appropriate)
- No business logic in templates — delegate to component class or service
- Template expressions are simple (no complex logic in templates)
- Component selector follows `app-` prefix convention

_Services:_
- Injectable decorator with proper `providedIn` or module-level provision
- RxJS operators used correctly (no nested subscribes, proper error handling)
- BehaviorSubject/Subject usage follows existing patterns in PageService
- HTTP calls use Angular HttpClient with proper typing
- Error handling with `catchError` operator
- No side effects in constructors — use initialization methods

_Templates (HTML):_
- No direct DOM manipulation — use Angular bindings
- Proper use of structural directives (`*ngIf`, `*ngFor` with `trackBy`)
- Event bindings use proper syntax `(event)="handler()"`
- No XSS risks from `[innerHTML]` without sanitization
- Accessibility: proper ARIA attributes, semantic HTML

_Modules:_
- Correct imports, declarations, exports, and providers arrays
- No circular dependencies between modules
- Lazy loading used where appropriate
- Services provided at the correct scope

_Specs:_
- TestBed properly configured with required imports and providers
- Mocks/stubs used for dependencies (not real HTTP calls)
- Uses mock data from `src/app/_tests/mocks.ts` where applicable
- Tests cover both happy path and error cases
- Async operations properly handled (`fakeAsync`/`tick` or `async`/`await`)
- New logic has corresponding spec coverage

_Styles (CSS):_
- No `!important` overrides unless absolutely necessary
- Follows existing style patterns in the project
- No hardcoded colors that should be variables
- Responsive design considerations

_Configuration:_
- `angular.json` changes are safe and intentional
- `tsconfig` changes don't break compilation
- ESLint rule changes have clear justification
- Environment files don't expose secrets

---

=== Stage 4.5 — Cross-Cutting Consistency Check ===

**This stage catches bugs that file-by-file review misses.** Do NOT skip this stage.

After completing Stage 4, step back and analyze the PR as a whole:

**Operation inventory:**
List every distinct operation the PR implements (e.g., "add new content component", "modify page navigation", "update API endpoint"). For each operation, identify ALL code paths involved — including components, services, templates, and specs.

**Safeguard parity check:**
For each operation with multiple code paths, build a comparison table:

| Code path | Error handling | Loading state | Unsubscribe | Input validation | Accessibility |
|-----------|---------------|---------------|-------------|-----------------|---------------|

Flag any row that is missing a safeguard present in another row for the same operation. These are must-fix — if one path protects an operation, all paths must.

**Common misses this stage should catch:**
- Components subscribing to observables without unsubscribing
- Services making HTTP calls without error handling in some code paths
- New components missing corresponding spec files
- Template bindings referencing properties that don't exist on the component class
- Route changes without updating navigation logic in services
- Missing or inconsistent loading states across related components

**"Fix one, fix all" check:**
If the PR fixes a pattern in one place (e.g., adding proper unsubscribe logic), search for ALL other instances of that same pattern in the PR. Flag any remaining instances.

---

=== Stage 5 — Reuse & Consistency Sweep (repo-wide) ===

Search for reuse opportunities in the PR changes.

**Targeted searches based on PR content:**

Run only the searches relevant to what the PR touches:

- If PR has content components: `Grep "Component" src/app/page/component/` and check for existing patterns
- If PR has service changes: `Grep "Injectable" src/app/services/` for consistent service patterns
- If PR has HTTP calls: `Grep "HttpClient\|http\." src/app/` for existing API patterns
- If PR has RxJS usage: `Grep "BehaviorSubject\|Subject\|Observable" src/app/` for existing reactive patterns
- If PR has shared components: `Grep "Component" src/app/shared/` for existing shared patterns
- If PR has routing changes: Read `src/app/app.module.ts` for existing route patterns

**Code Duplication Detection:**
- Look for similar code patterns across changed files that could be consolidated
- Identify repeated logic that could be extracted to a shared service or utility

**Behavioral Consistency Detection:**

This is different from code duplication. Look for multiple code paths that serve the same PURPOSE even if they share zero code. Verify they have equivalent:
- Error handling
- Loading state management
- Subscription cleanup
- Input validation
- User feedback (toastr notifications, etc.)

Flag inconsistencies as must-fix when one path has protections another lacks.

For each reuse/consistency candidate found:

- Evidence: existing method/logic location + where it applies in PR (file:line)
- Impact: consistency/maintainability
- Patch: minimal unified diff to adopt existing solution or create shared utility
- Consolidation opportunity: if creating new shared code, suggest location (src/app/services/, src/app/shared/, etc.)

---

=== Stage 6 — Pattern Sweep ===

Search ONLY the files changed in this PR (from Stage 2 git diff) for these patterns; for each hit, either propose a fix or mark "N/A" with reason. Cite exact lines.

**Angular-specific patterns:**
- Memory leaks: Subscriptions without unsubscribe, event listeners not removed
- Missing `trackBy` on `*ngFor` directives (performance impact)
- Nested subscribes: `subscribe()` inside another `subscribe()` — use `switchMap`/`mergeMap` instead
- Direct DOM manipulation: Using `document.` or `ElementRef.nativeElement` without Renderer2
- Unsafe innerHTML: Using `[innerHTML]` without DomSanitizer
- Missing error handling on HTTP observables
- Synchronous operations in constructors that should be in `ngOnInit`

**TypeScript patterns:**
- `any` type usage where a proper type could be defined
- Missing return types on public methods
- Unused imports or variables
- Non-null assertions (`!`) without justification
- Type assertions (`as`) that could hide bugs

**Security:**
- XSS: Unsafe use of `[innerHTML]`, `bypassSecurityTrust*` methods
- Hardcoded API keys, tokens, or secrets in code
- Sensitive data in environment files committed to repo

**Debug & cleanup:**
- `console.log` / `console.warn` / `console.error` — debug output left in production code
- `debugger` statements left in
- `TODO` / `FIXME` / `HACK` comments — should these be addressed before merge?
- Commented-out code blocks that should be removed

**Code smell patterns:**
- Empty catch blocks that silently swallow errors
- Hardcoded magic numbers/strings that should be constants
- Components with too many responsibilities (should be split)
- Services with circular dependencies
- Long method chains without intermediate error handling

---

=== Stage 6.5 — Deep Investigation (prove, don't speculate) ===

**This stage goes beyond surface-level pattern matching.** Stages 4-6 catch what's wrong in the diff. This stage catches what's wrong *about* the diff — assumptions the code makes about the rest of the system that may not hold.

**IMPORTANT:** Do not speculate. For every potential issue, read the actual source code to confirm or disprove it before reporting. A finding is only valid if you can cite the exact file and line that proves the problem.

Use subagents (Task tool with subagent_type=Explore) to investigate in parallel when multiple areas need checking.

**1. Import & dependency integrity:**
For every new import, service injection, or component reference added in the PR:
- Verify the imported class/module actually exists by reading its source file
- For service injections: verify the service is provided (in a module or `providedIn: 'root'`)
- For component usage in templates: verify the component is declared in the same module or an imported module
- For pipe usage: verify the pipe is declared/imported in the relevant module
- **Example catch:** PR uses `<app-new-component>` in a template but never declares `NewComponent` in the module's `declarations` array

**2. Observable & async correctness:**
For every new Observable chain or async operation in the PR:
- Verify subscriptions are cleaned up (check for `ngOnDestroy` implementation)
- Verify error handlers exist on HTTP calls
- Check for race conditions in concurrent observable chains
- Verify `async` pipe usage matches the Observable's emission pattern (hot vs cold)
- **Example catch:** PR adds a `subscribe()` in `ngOnInit` but the component has no `ngOnDestroy` to unsubscribe

**3. Template binding correctness:**
For every new template binding in the PR:
- Verify the bound property/method exists on the component class
- Verify `*ngIf` guards protect against null/undefined values from async data
- Check for missing null-safe navigation (`?.`) on potentially undefined objects
- **Example catch:** Template binds to `page.title` but the `page` object could be null before API response arrives

**4. Route & navigation integrity:**
For route or navigation changes:
- Verify new routes have corresponding components
- Verify route parameters match what components expect
- Check that navigation guards (if any) are properly configured
- Verify deep links still work with the embed system

**5. Removed/changed code ripple effects:**
For every method, property, service, or component that was removed or renamed:
- Search the entire codebase (not just changed files) for references to the old name
- Check templates, specs, other components, and services
- **Example catch:** PR removes a public method from a service, but a component template still calls it via the service injection

---

=== Stage 7 — Generate Review Report ===

Print a detailed report with findings count at the top, grouped by confidence level:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 REVIEW SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Must-fix: [X] issues
Nice-to-have: [Y] suggestions
Test suggestions: [Z] items

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Summary** (3-7 bullets covering key findings)

**High Confidence — Must Fix** (bugs, security issues, memory leaks — very likely needs to change)
For each issue:
- The concern
- The filename and line numbers
- Why the code is wrong/unsafe
- How to fix it

**High Confidence — Nice-to-Have** (clear improvements — should probably change)
For each issue:
- The suggestion
- The filename and line numbers
- Why it would be better
- How to change it

**Medium Confidence** (probably should be changed, but reviewer judgment needed)
For each issue:
- The concern
- The filename and line numbers
- Why the code might be suboptimal
- How to fix it

**Low Confidence** (consider changing — subjective or minor)
For each suggestion:
- The suggestion
- The filename and line numbers
- Why it might be better

**Architecture & Performance** (high-level concerns)

**Deep Investigation Findings** (from Stage 6.5 — proven issues beyond the diff surface)

**Cross-Cutting Consistency Issues** (from Stage 4.5 — safeguard parity failures)

**Reuse Opportunities** (existing utilities/components that could be used)

**Testing Suggestions** (missing tests, test improvements)

---

=== Stage 8 — Create `.ai-review.json` and Deliver ===

**Step 1: Get PR metadata**
```bash
COMMIT_SHA=$(gh pr view --json commits --jq '.commits[-1].oid' 2>/dev/null)
PR_NUM=$(gh pr view --json number --jq '.number' 2>/dev/null)
```

If no PR exists, skip to "Print to Terminal" delivery.

**Step 2: Create `.ai-review.json` in GitHub-compatible format**

Create a single new untracked file at repo root named `.ai-review.json`. Valid JSON only (no code fences). Include ALL findings as position-anchored comments.

**JSON Schema:**
```json
{
  "commit_id": "COMMIT_SHA_FROM_STEP_1",
  "event": "COMMENT",
  "body": "<Summary: 3-7 bullets covering key findings>",
  "comments": [
    {
      "path": "relative/path/to/file.ts",
      "line": 36,
      "side": "RIGHT",
      "body": "[Must-fix] <Issue>. Evidence: <frag>. Impact: <why>. Fix: <one-liner>."
    },
    {
      "path": "relative/path/to/file.ts",
      "line": 45,
      "side": "RIGHT",
      "body": "[Nice-to-have] <Issue>. Evidence: <frag>. Suggestion: <change>."
    }
  ]
}
```

**JSON Rules:**

- **commit_id**: REQUIRED — Use the commit SHA from Step 1
- **event**: Must be "COMMENT"
- **body**: Summary of review (3-7 bullets or short paragraph)
- **comments**: Array of all findings

**Comment Format:**
- **path**: Relative file path from repo root
- **line**: The actual line number in the file (NOT a diff position). Use the line number from the NEW version of the file for added/context lines, or the OLD version for deleted lines.
- **side**: `"RIGHT"` for added lines or context lines (commenting on the new version). `"LEFT"` for deleted lines (commenting on the old version).
  - **Validation**: Before finalizing the JSON, re-read the diff for each file and manually verify that each line number falls within a valid hunk range. This is the #1 cause of 422 errors.
- **body**: Comment text with label prefix
  - Start with: `[Must-fix]` | `[Nice-to-have]` | `[Deep]` | `[Suggested tests]` | `[Mentoring]` | `[Reuse]` | `[Pattern]` | `[Consistency]`
  - Keep to 1-2 sentences, <= 220 characters
  - Use collaborative phrasing: "Could we...", "Consider..."
  - Include tiny diff (<=5 lines) only if trivial

**Line Number Determination:**
Use the `+N` side of `@@` hunk headers from `gh pr diff` to determine line numbers. For example:
```
@@ -56,6 +57,7 @@ export class PageComponent    <- new file lines start at 57

   ngOnInit() {                                  <- line 58
     this.pageService.init();                     <- line 59
+    this.analyticsService.track('page_view');    <- line 60 (use line: 60, side: "RIGHT")
```
The `+57` means the new file starts this hunk at line 57. Count down from there.

**IMPORTANT**: The `line` must fall within the diff hunk range for that file. You can only comment on lines that appear in the diff output (added, removed, or context lines). You CANNOT comment on arbitrary lines that are outside the diff hunks.

For an existing file with context:
```
@@ -10,6 +10,8 @@
 unchanged line      <- line 10
 unchanged line      <- line 11
+new line            <- line 12 (use line: 12, side: "RIGHT")
+new line            <- line 13 (use line: 13, side: "RIGHT")
 unchanged line      <- line 14
```

**Content Requirements:**
- Every Must-fix, Nice-to-have, Deep, Suggested test, Mentoring, Reuse, Consistency, and Pattern Sweep finding MUST appear
- Only reference files and line numbers from the PR diff
- One issue per comment — be specific, actionable, kind
- No long praise, hedging, or walls of text

**Step 3: Select delivery method**
Ask "How would you like your feedback?"

- **Post to GitHub**: Comments will be left on your GitHub PR
- **Print to Terminal**: Comments will be printed here in terminal
- **Both**: Post to GitHub AND print to terminal

**Instructions for Post to GitHub:**
```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/CruGlobal/know-god-web/pulls/${PR_NUM}/reviews" \
  --input .ai-review.json || echo "Failed to post review"
```

**Instructions for Print to Terminal:**
Format and display all comments from the JSON file:
- Group comments by file path
- Show line numbers with each comment
- Display the review body/summary at the top
- Use clear formatting with markdown

**Step 4: Clean up**
```bash
rm .ai-review.json
```

If GitHub posting was selected:
```bash
echo "Review posted to PR #${PR_NUM}"
```

If Terminal printing was selected:
```bash
echo "Review completed for PR #${PR_NUM}"
```

**Troubleshooting:**
- **422 "Path could not be resolved"**: A file path in comments doesn't exist in the GitHub PR diff, or a line number is outside the diff hunk range. Verify all paths exist in `gh pr diff` output and all line numbers fall within diff hunks.
- **422 "Unprocessable Entity"**: Line numbers are outside the diff range — recheck line numbers against `gh pr diff` hunk headers
- **File creation blocked**: Print the JSON object to chat (no prose, no code fences)
- **Empty response**: Verify `gh` CLI is authenticated and PR exists
- **Stacked PRs**: If the PR targets a feature branch (not `main`), always use `gh pr diff` — never `git diff main...HEAD` which would include parent branch changes

**Action Items:**
- After creating `.ai-review.json`, print exactly: `Created .ai-review.json (untracked)`
- After posting review, print exactly: `Review posted to PR #${PR_NUM}`
