---
name: agent-review
description: Multi-agent PR review with smart selection, debate rounds, and consensus
approve_tools:
  - Bash(gh pr view:*)
  - Bash(gh pr diff:*)
  - Bash(gh api "/repos/CruGlobal/know-god-web/pulls:*)
  - Bash(git diff:*)
  - Bash(git branch:*)
  - Bash(git log:*)
  - Bash(date:*)
  - Bash(cat > .ai-review.json:*)
  - Bash(rm .ai-review.json)
---

# Multi-Agent PR Code Review

AI-powered code review with smart agent selection, cross-examination debate, and consensus-driven findings.

**Usage**:

```bash
/agent-review           # Standard mode (smart selection, recommended)
/agent-review quick     # Quick feedback for simple PRs
/agent-review deep      # Comprehensive analysis for critical changes
```

---

## Stage 0A — Parse Review Mode & Initialize

### Determine Review Mode

Check command argument to determine mode:

- **quick**: 3 agents (Testing, Standards, Architecture), model: sonnet
- **standard** (default): Smart agent selection based on changes + coverage gap review, model: opus
- **deep**: All 6 agents + coverage gap review (expanded), model: opus

Print the mode banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[MODE BANNER based on selection]

quick:
  🏃 QUICK REVIEW MODE
  • 3 agents (Testing, Standards, Architecture)
  • Model: sonnet (fast, cost-effective)
  • Estimated time: ~2-3 minutes

standard:
  ⚡ STANDARD REVIEW MODE (Recommended)
  • Smart agent selection based on changes + coverage gap review
  • Model: Opus
  • Estimated time: ~6-11 minutes

deep:
  🔬 DEEP REVIEW MODE
  • All 6 agents + expanded coverage gap review
  • Model: Opus (maximum quality)
  • Estimated time: ~12-18 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

MODE: REVIEW ONLY of the current PR diff. Do NOT modify existing files or stage/commit.

---

## Stage 0B — Context Gathering & Risk Assessment

### Gather PR Context

```bash
# Check if we're in a PR branch
gh pr view --json number,title,baseRefName,headRefName,additions,deletions,changedFiles 2>/dev/null || echo "Not in a PR branch, using main as base"

# Get the day of week for reviewer recommendations
date +%A
```

Get the diff using PR refs (with fallback):

```bash
BASE_REF=$(gh pr view --json baseRefOid -q .baseRefOid 2>/dev/null)
HEAD_REF=$(gh pr view --json headRefOid -q .headRefOid 2>/dev/null)

if [ -n "$BASE_REF" ] && [ -n "$HEAD_REF" ]; then
  git diff $BASE_REF..$HEAD_REF --name-only
  git diff $BASE_REF..$HEAD_REF --stat
  git diff $BASE_REF..$HEAD_REF
else
  # Fallback: use gh pr diff (handles stacked PRs correctly)
  # IMPORTANT: Do NOT use git diff main...HEAD — it includes parent branch changes for stacked PRs
  gh pr diff --name-only 2>/dev/null || git diff main...HEAD --name-only
  gh pr diff 2>/dev/null || git diff main...HEAD
fi
```

Store the changed file list and diff content for use by all agents.

### Read Project Standards

Read `CLAUDE.md` to understand the project's coding standards and conventions. This context will be shared with all agents.

### Calculate Risk Score

Start with a base score of 0, then add points.

**Dedup rule:** For each changed file, match against the highest-risk pattern first (Critical, then High, then Medium). Each file contributes points from at most one risk tier — do not double-count.

**Critical File Patterns (+3 points each):**
- `src/app/app.module.ts` — Root module (routing, providers, imports)
- `src/app/app.component.ts` — Root component
- `src/environments/environment.prod.ts` — Production environment config
- `.env*` — Environment files (automatic senior review)
- `package.json` — Dependency changes (new packages)
- `src/app/page/service/page-service.service.ts` — Core page state management service
- `src/app/services/xml-parser-service/` — XML parsing pipeline (core dependency)
- `.github/workflows/ai-review-auto-approve.yml` — AI auto-approval workflow (controls which PRs bypass human review)
- `.claude/commands/*.md` — Review process definitions (controls how AI reviews behave)

**High-Risk File Patterns (+2 points each):**
- `src/app/api/url.ts` — API endpoint configuration
- `src/app/services/analytics.service.ts` — Analytics/tracking integration
- `src/app/services/common.service.ts` — Shared service logic
- `src/app/page/component/**/*` — Content rendering components
- `angular.json` — Build configuration
- `tsconfig*.json` — TypeScript configuration
- `eslint.config.js` — Linting rules
- `embed/embed.js` — Embed iframe script (affects all embedded consumers)
- `src/index.html` — Entry point HTML
- `src/main.ts` — Bootstrap entry point
- `.github/workflows/*` (not already counted) — CI/CD workflows

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

**Change Volume Modifier** (exclude `*.spec.ts` files from line count and ignore whitespace only changes with `--ignore-all-space`):
- <50 lines: +0
- 50-200 lines: +1
- 200-250 lines: +2
- 300+ lines: +3

**Scope Multiplier** (apply after base score):
- Single domain (e.g., only specs, or only one component): x1.0
- Multiple domains (e.g., component + service + module): x1.3
- Cross-cutting (e.g., API + services + components + config): x1.7

**Special Pattern Detection (additional points):**
- New npm package in `package.json`: +2
- Updated critical package (angular, rxjs, typescript, @cruglobal/godtools-shared): +3
- New file in `src/app/services/`: +1 (sets pattern for future services)
- New file in `src/app/shared/`: +1 (sets shared pattern)
- Changes to `angular.json` build config without corresponding source changes: +3 (likely manual edit — red flag). If the PR includes both `angular.json` and source file changes, this is expected behavior (+0)

Cap the final score at 10.

**Risk Level Mapping:**
- **0-3**: LOW
- **4-6**: MEDIUM
- **7-8**: HIGH
- **9-10**: CRITICAL

Display the risk assessment:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PR RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Score: [X]/10
Risk Level: [LOW | MEDIUM | HIGH | CRITICAL]

Files Changed: [N]
Lines Changed: +[X] -[Y]

Risk Factors Detected:
• [specific factors with point values]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 REVIEW RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Required Reviewer Level: [ANY | MID-LEVEL/SENIOR | SENIOR]
Reasoning: [1-2 sentence explanation]

[Day-of-week warnings if applicable]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 0C — Smart Agent Selection

### Available Agents

This review system uses 6 specialized agents:

1. **Security** — XSS, unsafe innerHTML, secret exposure, sanitization, embed security
2. **Architecture** — Angular conventions, service patterns, module organization, component design
3. **Reactive & Async** — RxJS correctness, subscription lifecycle, memory leaks, observable patterns
4. **Testing** — Jasmine/Karma coverage, TestBed usage, mock patterns, code quality
5. **UX & Accessibility** — Templates, accessibility, responsive design, embed compatibility
6. **Standards** — CLAUDE.md compliance, ESLint/Prettier, Angular conventions, import ordering

### Selection Logic

**Quick mode**: Testing, Standards, Architecture (always these 3)

**Deep mode**: All 6 agents

**Standard mode**: Smart selection based on changed files:

Always include: Architecture, Testing, Standards

Conditionally include:

- **Security Agent** — if any of these patterns appear in changed files:
  - `src/app/api/` or API-related service files
  - `src/environments/` (environment configuration)
  - `.env` files
  - `embed/embed.js` (iframe security)
  - `src/index.html` (script injection surface)
  - `.github/workflows/` (CI/CD security controls)
  - `.claude/commands/` (review process definitions)

- **Reactive & Async Agent** — if any of these patterns appear:
  - `src/app/services/` (any service file)
  - `src/app/page/service/` (page services)
  - Files containing RxJS imports (`Observable`, `Subject`, `BehaviorSubject`, `subscribe`)
  - Files with HTTP calls (`HttpClient`, `http.get`, `http.post`)

- **UX & Accessibility Agent** — if any of these patterns appear:
  - `*.html` template files
  - `*.css` / `*.scss` style files
  - `src/app/page/component/` (content rendering components)
  - `src/app/shared/` (shared UI components)
  - `src/app/header/` (header component)
  - `embed/embed.js` (embed UX)

Display selection results:

```
🤖 Analyzing PR to select relevant agents...

✅ Architecture Agent — Always included
✅ Testing Agent — Always included
✅ Standards Agent — Always included
[✅/❌] Security Agent — [reason]
[✅/❌] Reactive & Async Agent — [reason]
[✅/❌] UX & Accessibility Agent — [reason]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Selected: [N] of 6 agents
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 0D — Load Dismissed Findings

Check for findings that the developer has previously dismissed via `/dismiss` replies on review comments. This only applies when re-running the review on a PR that already has a previous agent review.

**Step 1: Fetch PR review comments and replies**

```bash
PR_NUM=$(gh pr view --json number --jq '.number' 2>/dev/null)
PR_AUTHOR=$(gh pr view --json author --jq '.author.login' 2>/dev/null)

# Fetch all review comments (includes replies) on this PR
gh api "/repos/CruGlobal/know-god-web/pulls/${PR_NUM}/comments" --paginate
```

**Error handling:** If the `gh api` call fails (rate limiting, auth failure, network error), display a warning banner: "Warning: Could not load dismissed findings — all findings will be treated as new." Proceed with an empty dismissed list and set a flag so Stage 5 can note that dismissal matching was skipped.

**Note:** This only checks review comment threads (replies to inline code comments), NOT standalone PR comments. The `/dismiss` command must be used as a reply to the specific finding comment.

**Step 2: Identify dismissed findings**

For each review comment that is a reply (`in_reply_to_id` is set):
1. Check if its `body` starts with `/dismiss` (case-insensitive)
2. Verify the reply author (`user.login`) matches the PR author — only the PR author can dismiss findings
3. Look up the parent comment (by `in_reply_to_id`) to get the original finding
4. Parse the parent comment's `<!-- severity:X -->` tag
5. **Only allow dismissal if severity < 7** — findings with severity >= 7 (Important, High, Critical) cannot be dismissed. If someone tries to dismiss a severity >= 7 finding, ignore the dismissal and note it in the output
6. Extract the dismiss reason from the reply body (everything after `/dismiss:` or `/dismiss`)

**Step 3: Build the dismissed findings list**

For each valid dismissal, store:
- `path`: The file path from the parent comment
- `line`: The line number from the parent comment
- `body`: The finding body text (stripped of the `<!-- severity:X -->` tag)
- `reason`: The developer's dismiss reason
- `dismissed_by`: The developer's GitHub username

**Step 4: Display results**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DISMISSED FINDINGS CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[If dismissals found]:
Found [N] previously dismissed finding(s):
• src/app/services/foo.service.ts:42 — "Consider extracting..." (dismissed: "Intentional design choice")
• src/app/page/component/bar.component.ts:15 — "Add test for edge case" (dismissed: "Covered by integration test")

[If severity >= 7 dismissals attempted]:
⚠️  Ignored [N] invalid dismissal(s) (severity >= 7 findings cannot be dismissed):
• src/app/page/service/page-service.service.ts:88 — Severity 8.5/10 — cannot be dismissed

[If no dismissals found]:
No previously dismissed findings found.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Pass the dismissed findings list to Stage 5 for verdict calculation.

---

## Stage 1 — Launch Specialized Review Agents (Parallel)

**IMPORTANT:** Use a SINGLE message with multiple Task tool invocations to launch all selected agents in parallel. Each agent runs as a separate subagent.

Display: "🚀 Launching [N] specialized review agents in parallel..."

### Shared Context for All Agents

Every agent prompt MUST include:
1. The full diff content (from Stage 0B)
2. The list of changed files
3. The risk score and level
4. Instruction to read CLAUDE.md for project conventions
5. Instruction to read FULL file content (not just diff) for context
6. Instruction to search codebase before flagging issues (avoid false positives)
7. The scope rule below
8. The search boundary rule below
9. The noise filter rule below

**SEARCH BOUNDARY RULE — Excluded directories:**
Do NOT search in any of these directories: `node_modules/`, `dist/`, `.angular/`, `.vscode/`, `coverage/`, `docs/`, or package cache paths. Search everything else in the project. If you need to understand how an npm package works, rely on the project's own usage patterns and CLAUDE.md — do not read package source code.

**NOISE FILTER RULE — Ignore system artifacts:**
Strings matching `toolu_[a-zA-Z0-9]+` are internal system tool-call identifiers. They are NOT part of the codebase or the PR. Do NOT attempt to Read, Glob, Grep, or open any path containing `toolu_`. Do not reference, analyze, or comment on them in your review output. If you see a `toolu_` string anywhere in your context, skip it entirely — it is never a file, never a code reference, and never relevant to the review.

**SCOPE RULE — PR-only findings:**
Only flag issues in code that was **added or modified** in this PR diff — lines starting with `+` in the diff (added) or lines that were deleted/replaced (starting with `-`). Context lines (unchanged, starting with space) can be referenced only if the issue is directly caused by an adjacent change. You may READ surrounding code and the rest of the codebase for context, but every finding MUST reference a line that appears in the diff. The only exception is a HIGH or CRITICAL severity (8+) issue in a file that appears in the PR's changed file list (from Stage 0B) that is directly related to the changes — in that case, flag it but clearly label it as `[Pre-existing]` and do NOT count it as a blocker. Pre-existing issues are informational only; the developer is expected to address them in a separate PR. Cap at 2 pre-existing issues per file — if more exist, note "Additional pre-existing issues exist in this file — consider a dedicated cleanup PR" without listing them individually.

**LARGE PR CHUNKING RULE — For PRs with 500+ lines of diff:**
Instead of passing the entire diff to each agent, pass only the diff hunks relevant to that agent's specialization plus the full changed file list for context. For example, the Security agent receives diffs for API files, environment config, and embed scripts; the Reactive & Async agent receives diffs for services and files with RxJS imports. Each agent still sees the complete list of changed files and can request to read any file, but the diff in their prompt is focused on their domain. This prevents agents from skimming later files in a large diff.

### Agent 1: Security Review 🔒

**Task tool config:**
- description: "Security code review"
- subagent_type: "general-purpose"
- model: "opus" (or "sonnet" in quick mode)

**Prompt focus areas (prioritize based on what actually changed in the diff — spend 80% of effort on issues directly in the diff, 20% on systemic concerns triggered by the diff context; if few security-relevant changes exist, say so briefly rather than hunting for theoretical issues):**
- XSS: Unsafe use of `[innerHTML]`, `bypassSecurityTrustHtml`, `bypassSecurityTrustStyle`, `bypassSecurityTrustUrl` — verify DomSanitizer is used correctly
- Template injection: Dynamic template generation, unsafe string interpolation in templates
- Secret exposure: Hardcoded API keys, tokens, or credentials in source files or environment configs committed to repo
- Embed security: `embed/embed.js` iframe communication — verify `postMessage` uses proper origin checks
- HTTP security: API calls using HTTP instead of HTTPS, missing CORS considerations
- Dependency security: New packages in `package.json` — check for known vulnerabilities
- Script injection: Unsafe script loading in `index.html`, third-party script integrity
- Content Security Policy: Changes that could weaken CSP headers
- CI/CD workflow security: GitHub Actions workflow changes — verify permission scopes are minimal, secrets are not exposed in logs, trigger conditions cannot be manipulated
- Review process integrity: Changes to `.claude/commands/` review definitions — verify risk scoring is not weakened, severity thresholds are not lowered

**Output format:**
```
## 🔒 Security Agent Review

### Critical Security Issues (BLOCKING) — Severity: 10/10
- **File:Line** — Issue description
  - Severity: 10/10
  - Risk: What attack vector this enables
  - Impact: What could happen
  - Fix: Specific code change needed

### Security Concerns (IMPORTANT) — Severity: 6-9/10
[Same format with severity scores]

### Security Suggestions — Severity: 3-5/10
[Improvement suggestions]

### Questions for Other Agents
- **To [Agent]**: Question

### Confidence
- Overall: High/Medium/Low
- Areas needing deeper analysis: [list]
```

**CODEBASE CONTEXT SEARCH:** Before flagging a pattern as an issue, use Grep to search for at least 3 other instances of the same pattern in `src/app/`. If the pattern is used consistently in 3+ other locations, it is an established project convention — do NOT flag it. If it appears only in the current PR or in fewer than 3 places, flag it.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (TypeScript/HTML/CSS as appropriate). Only generate fixes where the correct solution is unambiguous. Label each fix with its severity and the issue it addresses.

---

### Agent 2: Architecture Review 🏗️

**Task tool config:**
- description: "Architecture code review"
- subagent_type: "general-purpose"
- model: "opus" (or "sonnet" in quick mode)

**Prompt focus areas:**
- Component design — focused components with single responsibility, no business logic in templates
- Service patterns — follows existing RxJS patterns in PageService (BehaviorSubjects, Observables)
- Module organization — correct imports, declarations, exports, providers arrays
- Dependency injection — services provided at correct scope (`providedIn: 'root'` vs module-level)
- Component communication — proper use of `@Input`/`@Output` decorators, service-based communication for unrelated components
- Separation of concerns — API calls in services (not components), presentation logic in components (not services)
- Routing consistency — follows existing route patterns in `app.module.ts`
- Embed compatibility — changes work in both standalone and iframe-embedded contexts
- Content pipeline integrity — XML parsing -> component rendering pipeline not broken
- Technical debt — created vs reduced by this PR
- Pattern consistency with CLAUDE.md conventions

**Output format:**
```
## 🏗️ Architecture Agent Review

### Critical Architecture Issues (BLOCKING) — Severity: 10/10
- **File:Line** — Issue
  - Severity: 10/10
  - Problem: What's architecturally wrong
  - Impact: Long-term consequences
  - Alternative: Better approach

### Architecture Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Architecture Suggestions — Severity: 3-5/10
[Better patterns and approaches]

### Technical Debt Analysis
- Debt Added: [what new debt]
- Debt Removed: [what debt fixed]
- Net Impact: Better/Worse/Neutral

### Pattern Compliance
- Follows CLAUDE.md standards: Yes/No/Partial
- Violations: [list]

### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging a pattern as an issue, use Grep to search for at least 3 other instances of the same pattern in `src/app/`. If the pattern is used consistently in 3+ other locations, it is an established project convention — do NOT flag it. If it appears only in the current PR or in fewer than 3 places, flag it.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 3: Reactive & Async Review 🔄

**Task tool config:**
- description: "Reactive and async review"
- subagent_type: "general-purpose"
- model: "opus"

**Prompt focus areas:**
- **Subscription lifecycle**: Every `subscribe()` call MUST have a corresponding unsubscribe mechanism — `takeUntil` with a destroy subject, `async` pipe in templates, or explicit unsubscribe in `ngOnDestroy`. Flag subscriptions without cleanup as memory leaks
- **Observable patterns**: No nested subscribes (`subscribe()` inside `subscribe()`) — use `switchMap`, `mergeMap`, `concatMap`, or `exhaustMap` instead
- **BehaviorSubject usage**: Initial values should be sensible defaults, `getValue()` usage should be minimized (prefer `asObservable()`)
- **Error handling**: Every HTTP observable chain should have `catchError` — unhandled errors will break the observable chain permanently
- **Hot vs Cold observables**: Verify shared observables use `shareReplay` or similar when multiple subscribers exist
- **Race conditions**: Concurrent HTTP calls or observable chains that could produce stale data — verify proper use of `switchMap` (cancel previous) vs `mergeMap` (allow concurrent)
- **Completion handling**: Observables from `HttpClient` auto-complete, but Subjects and BehaviorSubjects do not — verify `complete()` is called where appropriate
- **Subject exposure**: Services should expose Subjects as `Observable` (via `asObservable()`) — never expose the raw Subject to consumers
- **Memory leaks**: Event listeners added manually (e.g., `window.addEventListener`) must be removed in `ngOnDestroy`
- **Async pipe**: Prefer `async` pipe in templates over manual subscription when possible — it auto-unsubscribes

**Output format:**
```
## 🔄 Reactive & Async Agent Review

### Critical Reactive Issues (BLOCKING) — Severity: 10/10
- **File:Line** — Issue
  - Severity: 10/10
  - Problem: Reactive/async concern
  - Impact: What could go wrong (memory leak, stale data, broken observable chain)
  - Fix: Required action

### Reactive Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Reactive Suggestions — Severity: 3-5/10

### RxJS Specific Checks
- Subscription cleanup: [issues with missing unsubscribe]
- Observable chain safety: [error handling gaps]
- Memory leak risks: [leaked subscriptions, event listeners]
- Race condition risks: [concurrent operations without proper handling]

### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging a pattern as an issue, use Grep to search for at least 3 other instances of the same pattern in `src/app/`. If the pattern is used consistently in 3+ other locations, it is an established project convention — do NOT flag it. If it appears only in the current PR or in fewer than 3 places, flag it.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (TypeScript as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 4: Testing & Quality Review 🧪

**Task tool config:**
- description: "Testing and quality review"
- subagent_type: "general-purpose"
- model: "opus" (or "sonnet" in quick mode)

**Prompt focus areas:**
- **Test coverage**: Every new public method, component, and service that contains business logic must have specs. Do not flag missing specs for simple template-only changes or Angular lifecycle boilerplate
- **TestBed setup**: Properly configured with required imports, declarations, and providers
- **Mock usage**: Dependencies should be mocked/stubbed (not real HTTP calls). Use mock data from `src/app/_tests/mocks.ts` where applicable
- **Async test handling**: `fakeAsync`/`tick` for synchronous-style async testing, or `async`/`await` with `fixture.whenStable()`
- **Component testing**: Template bindings tested, user interactions simulated properly
- **Service testing**: Observable emissions verified, error paths tested
- **Edge cases**: Null/undefined values, empty arrays, error responses, boundary conditions
- **Error path testing**: Not just happy paths — test error handling, missing data, failed HTTP calls
- **Code quality issues**: Unused imports, debug output (`console.log`/`console.warn`/`debugger`)
- **Code smell patterns**: `any` type abuse, hardcoded magic numbers/strings, empty catch blocks, overly complex methods
- **ESLint/Prettier compliance**: Code should pass `npm run lint` and `npm run prettier:check`

**Output format:**
```
## 🧪 Testing & Quality Agent Review

### Critical Testing Gaps (BLOCKING) — Severity: 10/10
- **File:Line** — Gap
  - Severity: 10/10
  - Missing: What's not tested
  - Risk: Why it's critical
  - Required: What tests to add (with skeleton)

### Testing Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Code Quality Issues — Severity: varies
- Debug output left in: [file:line list]
- Unused variables/methods: [list]
- ESLint violations: [list]

### Testing Suggestions — Severity: 3-5/10

### Coverage Assessment
- New code tested: Yes/Partial/No
- Edge cases covered: [list]
- Error handling tested: Yes/Partial/No
- Missing critical tests: [list with skeletons]

### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging a pattern as an issue, use Grep to search for at least 3 other instances of the same pattern in `src/app/`. If the pattern is used consistently in 3+ other locations, it is an established project convention — do NOT flag it. If it appears only in the current PR or in fewer than 3 places, flag it.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (TypeScript as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 5: UX & Accessibility Review 👤

**Task tool config:**
- description: "UX and accessibility review"
- subagent_type: "general-purpose"
- model: "opus"

**Prompt focus areas:**
- **Template correctness**: Proper use of Angular structural directives, bindings, and event handlers
- **Accessibility**: ARIA attributes on interactive elements, semantic HTML, keyboard navigation support, alt text on images
- **Internationalization**: Content supports RTL/LTR direction (managed by PageService `_dir` BehaviorSubject), language parameter handling
- **Embed compatibility**: Changes work correctly in both standalone and iframe-embedded contexts. Verify `postMessage` communication for height sync
- **Loading states**: Async operations should show loading indicators (LoaderService integration)
- **Error display**: User-friendly error messages, proper use of toastr notifications
- **Responsive design**: Content renders properly at different viewport sizes
- **Content rendering**: Dynamic content components render correctly based on XML-parsed data types
- **Image/animation handling**: Proper loading of images and Lottie animations from content pipeline

**Output format:**
```
## 👤 UX & Accessibility Agent Review

### Critical UX Issues (BLOCKING) — Severity: 10/10
- **File:Line** — Issue
  - Severity: 10/10
  - Problem: UX concern
  - User Impact: How it affects users
  - Fix: Required action

### UX Concerns (IMPORTANT) — Severity: 6-9/10
[Same format]

### Accessibility Issues
- Missing ARIA labels: [file:line list]
- Keyboard navigation: [issues]
- Screen reader support: [concerns]

### Embed Compatibility
- Works in standalone: Yes/No
- Works in iframe embed: Yes/No
- PostMessage handling: Correct/Issues

### UX Suggestions — Severity: 3-5/10
### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging a pattern as an issue, use Grep to search for at least 3 other instances of the same pattern in `src/app/`. If the pattern is used consistently in 3+ other locations, it is an established project convention — do NOT flag it. If it appears only in the current PR or in fewer than 3 places, flag it.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (HTML/CSS/TypeScript as appropriate). Only generate fixes where the correct solution is unambiguous.

---

### Agent 6: Know God Web Standards Compliance Review 📋

**Task tool config:**
- description: "Know God Web standards compliance review"
- subagent_type: "general-purpose"
- model: "opus" (or "sonnet" in quick mode)

**Prompt focus areas:**

Read CLAUDE.md thoroughly, then check each standard:

**Architecture Standards:**
- [ ] Components are focused — business logic in services, not components
- [ ] Services use RxJS BehaviorSubjects/Subjects for state (no NgRx)
- [ ] Traditional NgModule architecture (not standalone components)
- [ ] Content pipeline integrity maintained (API -> XML parser -> components)

**Content Pipeline Standards:**
- [ ] API URLs centralized in `src/app/api/url.ts`
- [ ] XML parsing uses `XmlParserService` wrapping `@cruglobal/godtools-shared`
- [ ] Environment-specific config in `src/environments/`
- [ ] Content components handle parsed data types correctly

**Reactive Standards:**
- [ ] Subscriptions properly cleaned up (takeUntil, async pipe, or explicit unsubscribe)
- [ ] No nested subscribes — use RxJS operators
- [ ] BehaviorSubjects have sensible initial values
- [ ] HTTP error handling with catchError

**Testing Standards:**
- [ ] Jasmine specs with Karma (*.spec.ts adjacent to source)
- [ ] TestBed properly configured
- [ ] Mock data from `src/app/_tests/mocks.ts` where applicable
- [ ] Async operations properly handled in tests

**Code Quality Standards:**
- [ ] Passes `npm run lint` (ESLint)
- [ ] Passes `npm run prettier:check`
- [ ] Component selectors use `app-` prefix
- [ ] Import order: builtin > external > internal > parent > sibling > index
- [ ] Single quotes, no trailing commas
- [ ] No debug output (`console.log`/`console.warn`/`debugger`)
- [ ] No `TODO` without associated tracking ticket

**Output format:**
```
## 📋 Know God Web Standards Compliance Review

### Standards Violations (BLOCKING) — Severity: 8-10/10
- **File:Line** — Violation
  - Severity: [8-10]/10
  - Standard: What standard is violated
  - Issue: What's wrong
  - Fix: How to fix

### Standards Concerns (IMPORTANT) — Severity: 5-7/10
[Same format]

### Standards Checklist Results
**Architecture**: ✅/⚠️/❌
**Content Pipeline**: ✅/⚠️/❌ (or N/A)
**Reactive**: ✅/⚠️/❌
**Testing**: ✅/⚠️/❌
**Code Quality**: ✅/⚠️/❌

### Pattern Deviations
[List deviations from CLAUDE.md patterns]

### Questions for Other Agents
### Confidence
```

**CODEBASE CONTEXT SEARCH:** Before flagging a pattern as an issue, use Grep to search for at least 3 other instances of the same pattern in `src/app/`. If the pattern is used consistently in 3+ other locations, it is an established project convention — do NOT flag it. If it appears only in the current PR or in fewer than 3 places, flag it.

**AUTOMATED FIX GENERATION:** For every issue with a clear fix, generate a ready-to-apply code patch. Show the exact file path and line range. Provide a before/after code block (TypeScript/HTML as appropriate). Only generate fixes where the correct solution is unambiguous.

---

After launching all selected agents, display:

```
✅ All [N] agents launched in parallel
⏳ Waiting for agents to complete their reviews...
```

---

## Stage 1B — Dependency Impact Analysis (Parallel)

**IMPORTANT:** Launch this as an additional Task tool invocation in the **same message** as the Stage 1 agent launches. This ensures it runs truly in parallel with the review agents. Do NOT try to run this in the main context "while agents are running" — foreground Task calls block until completion.

Analyze dependency impact using Angular-specific patterns:

For each changed TypeScript file, search for dependents:

**Services:** Search for the service class name in `constructor` injections across all components, other services, and specs.

**Components:** Search for the component selector (e.g., `app-component-name`) across all template files. Search for the component class name in module declarations.

**Modules:** Search for `imports: [ModuleName]` across other modules.

**Models/Interfaces:** Search for the type name across all TypeScript files.

**Pipes/Directives:** Search for the pipe name or directive selector across template files.

For high-impact files (10+ dependents), flag as critical. Display:

```
📦 DEPENDENCY IMPACT ANALYSIS

🚨 CRITICAL IMPACT: src/app/page/service/page-service.service.ts — [N] dependents
⚠️  HIGH IMPACT: src/app/services/xml-parser-service/xml-parser.service.ts — [N] dependents
📊 MEDIUM IMPACT: src/app/services/common.service.ts — [N] dependents

Breaking Changes:
[List any removed methods, renamed properties, or deleted classes]
```

---

## Stage 2 — Collect Agent Reports

Wait for all agents to complete and display progress:

```
Agent Reviews Complete:
✅ 🔒 Security Agent — Found [X] critical, [Y] concerns
✅ 🏗️ Architecture Agent — Found [X] critical, [Y] concerns
✅ 🔄 Reactive & Async Agent — Found [X] critical, [Y] concerns
✅ 🧪 Testing Agent — Found [X] critical, [Y] concerns
✅ 👤 UX Agent — Found [X] critical, [Y] concerns
✅ 📋 Standards Agent — Found [X] violations, [Y] concerns
```

Parse each agent's output and extract:
- Critical issues with severity scores
- Important concerns with severity scores
- Suggestions
- Questions for other agents
- Confidence level

---

## Stage 2A — Coverage Gap Analysis (Standard & Deep Mode)

**Skip this stage if the review mode is `quick`.**

After collecting all agent reports, analyze which changed files received adequate review coverage and which were overlooked. This replaces self-verification (which suffers from confirmation bias — the same agent misses the same things twice).

### Step 1: Map findings to files

Parse every finding from all agent reports and extract the file path. Build a coverage map:

For each file in the changed file list (from Stage 0B):
- Count how many total findings reference that file (across all agents)
- Track which agents produced findings for that file

### Step 2: Categorize coverage

- **Well-covered**: 2+ agents produced findings for this file
- **Under-covered**: Exactly 1 agent produced findings for this file
- **Uncovered**: 0 agents produced any findings for this file

### Step 3: Determine which files need gap review

- **Standard mode**: Only uncovered files (0 findings) get gap review
- **Deep mode**: Both uncovered AND under-covered files get gap review

Exclude from gap review:
- Files that are test-only (`**/*.spec.ts`) with < 20 changed lines — these are low-risk
- Files that are documentation-only (`*.md`, `*.txt`) — these are low-risk
- Files where the only changes are whitespace, comments, or import reordering

### Step 4: Display coverage map

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗺️ COVERAGE GAP ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files with good coverage:
  ✅ src/app/page/component/content-text/content-text.component.ts — 4 findings (Security, Architecture, Testing, Standards)
  ✅ src/app/page/service/page-service.service.ts — 3 findings (Reactive, Architecture, Standards)

Files with thin coverage:
  ⚠️ src/app/page/component/content-text/content-text.component.spec.ts — 1 finding (Testing only)

Files with NO coverage:
  ❌ src/app/shared/new-component/new.component.ts — 0 findings
  ❌ src/app/services/new.service.ts — 0 findings

[If gap review needed]:
🔍 [N] file(s) need focused gap review — launching fresh agents...

[If no gaps]:
✅ All changed files received adequate review coverage.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 2B — Focused Gap Review (Standard & Deep Mode)

**Skip this stage if no files need gap review (from Stage 2A) or if the review mode is `quick`.**

For each file (or group of files) needing gap review, launch a **fresh** general-purpose agent. These agents use fresh context with NO knowledge of previous findings — this prevents the confirmation bias that makes self-verification ineffective.

**Design principles:**
- **Fresh agents** — NOT the same agents from Stage 1, and NOT resuming previous agents
- **No previous findings shared** — the agent reviews with completely fresh eyes
- **Narrow scope** — each agent reviews 1-3 files max for thorough line-by-line analysis
- **Cap at 5 gap-review agents** — if more than 5 file groups need review, combine smaller files together

### File grouping

If more than 5 files need gap review, group them by relatedness:
- Group component + its template + its spec together
- Group service + its spec together
- Group related shared components together
- Otherwise group by directory

### Agent prompt

Launch all gap-review agents in parallel using a SINGLE message with multiple Task tool invocations.

**Task tool config per gap agent:**
- description: "Gap review: [file names]"
- subagent_type: "general-purpose"
- model: "opus" (standard and deep modes)

**Prompt:**

```
You are a fresh code reviewer performing a focused, exhaustive review of specific files in a PR.

PROJECT CONTEXT:
Read CLAUDE.md to understand this project's coding standards and conventions.

FILES TO REVIEW (your PRIMARY focus — review every changed line):
[Paste ONLY the diff hunks for the assigned file(s)]

FULL FILE CONTENT (for surrounding context):
Read each file listed above in full using the Read tool.

FULL PR CONTEXT (for understanding how these files relate to the broader change):
Changed files in this PR: [list all changed files from Stage 0B]
PR title/description: [from Stage 0B]

MISSION: Perform an exhaustive, line-by-line review of the assigned files' changes. You are reviewing these files because they received insufficient coverage in the initial review pass. Be thorough — check every changed line for:

1. **Correctness** — Does the code do what it's supposed to? Logic errors, null handling, type safety
2. **Security** — XSS via innerHTML, unsafe sanitizer bypasses, secret exposure
3. **Reactive correctness** — Subscription cleanup, error handling, proper RxJS operator usage
4. **Testing** — Are the changes adequately tested? Missing edge cases?
5. **Standards** — Does it follow the patterns in CLAUDE.md?
6. **Architecture** — Is the code in the right place? Focused components, proper service usage?

IMPORTANT RULES:
- SCOPE RULE: Only flag issues in code that was added or modified in the diff. You may READ surrounding code for context, but every finding MUST reference a line that appears in the diff.
- SEARCH BOUNDARY RULE: Do NOT search in node_modules/, dist/, .angular/, .vscode/, coverage/, docs/, or package cache paths.
- NOISE FILTER RULE: Ignore toolu_[a-zA-Z0-9]+ strings — they are system artifacts, not code.
- CODEBASE CONTEXT: Before flagging an issue, search the codebase for how similar code is handled. Don't flag patterns used consistently across the codebase.
- PROVE DON'T SPECULATE: Read actual source code to confirm every finding. Only report issues you can cite with exact file and line.

OUTPUT FORMAT:
## 🔍 Gap Review — [file name(s)]

### Issues Found

For each issue:
- **File:Line** — Issue description
  - Severity: [1-10]/10
  - Category: [Security/Architecture/Reactive/Testing/Standards/UX]
  - Problem: What's wrong
  - Impact: What could happen
  - Fix: Specific code change needed (with before/after code block if applicable)

### No Issues
If the code looks correct after thorough review, respond with:
"Exhaustive review complete — no issues found in [file name(s)]."

This is a valid and expected outcome. Not every file has issues.
```

### After gap agents complete

Merge all gap-review findings into the main finding pool. These findings participate in:
- Stage 3 (cross-examination debate) — gap findings are attributed to "Gap Review Agent" and other agents can challenge/support them
- Stage 4B (automated fix extraction)
- Stage 5 (consensus synthesis)

**Gap finding rebuttal rule:** Gap review findings have no dedicated defender in Stage 4 (rebuttals). To compensate, gap findings are presumed valid and **stand unless a challenging agent provides concrete counter-evidence** (specific code references proving the finding is incorrect). A challenge based solely on "this is an established pattern" or "I don't think this is severe enough" is insufficient to overturn a gap finding — the challenger must cite the actual code that disproves the issue.

Display:

```
Gap Review Results:
✅ 🔍 Gap Agent 1 (new.component.ts) — Found [X] issues
✅ 🔍 Gap Agent 2 (new.service.ts) — No issues found
[...]

Total new findings from gap review: [N]
```

---

## Stage 3 — Cross-Examination Debate (Round 1)

**Skip condition:** Skip Stages 3, 4, and 4B entirely if ALL of the following are true:
- Total finding count (from all agents + gap review) is <= 3
- ALL findings have severity < 7.0

If skipped, display: "⏩ Skipping debate — [N] low-severity findings don't warrant cross-examination." Then jump directly to Stage 5, using the raw (pre-debate) severity scores as final scores.

**Also skip in quick mode** — quick mode never runs debate.

Display: "🗣️ Starting cross-examination debate round..."

For EACH agent, launch a NEW Task with their original findings PLUS all other agents' findings. All debate agents run in parallel.

**Debate prompt for each agent:**

```
You are the [Agent Name] in the cross-examination debate phase.

YOUR ORIGINAL FINDINGS:
[Paste that agent's original review output with severity scores]

OTHER AGENTS' FINDINGS:
[All other agents' findings with severity scores]

QUESTIONS DIRECTED AT YOU:
[Any "Questions for Other Agents" from other agents that are addressed to this agent. If none are directed at this agent, write "None."]

MISSION: Review other agents' findings from your specialized perspective.

DEBATE ACTIONS (use severity scores to prioritize):
1. **CHALLENGE** — Disagree with a finding (max 3 challenges, focus on severity 7+)
   - Cite your reasoning with evidence
   - Suggest revised severity score
2. **SUPPORT** — Strongly agree and add context (for severity 8+)
3. **EXPAND** — Build on a finding with additional concerns
4. **QUESTION** — Ask for clarification
5. **ANSWER** — Respond to questions directed at you from other agents

RULES:
- Maximum 3 challenges (focus on important disagreements)
- Provide specific reasoning and evidence
- Reference file:line when possible
- Suggest severity score adjustments (1-10)
- Be constructive, not combative
- IMPORTANT: Do not speculate. Only challenge or support with evidence from actual code.

OUTPUT FORMAT:

## [Agent Name] — Cross-Examination

### Challenges
- **Challenge to [Agent X] re: [finding]**
  - Original severity: [X]/10
  - Why I disagree: [reasoning with code evidence]
  - Revised severity: [Y]/10

### Strong Support
- **Support for [Agent X] re: [finding]**
  - Additional context: [your perspective]
  - Severity agreement: [X]/10 is correct

### Expansions
- **Building on [Agent X]'s [topic]**:
  - Additional severity: [+N] points
  - Reasoning: [why more severe]

### Questions
- **To [Agent X]**: [question]

### Answers to Questions
- **From [Agent X]**: "[their question]"
  - Answer: [your response with evidence]

### Summary
- Challenges: [N]
- Supports: [N]
- Key disagreements: [main contentions]
```

Launch all debate agents in parallel.

---

## Stage 4 — Rebuttals (Debate Round 2)

Collect all challenges from Stage 3 and give each challenged agent a chance to respond.

Display: "🔄 Starting rebuttal round..."

For each agent that received challenges, launch a new Task:

```
You are the [Agent Name] responding to challenges from debate round 1.

YOUR ORIGINAL FINDINGS:
[Their original findings with severity scores]

CHALLENGES RAISED AGAINST YOU:
[List each challenge with severity score adjustments]

MISSION: Respond to each challenge, adjusting severity scores based on evidence.

RESPONSE OPTIONS:
1. **DEFEND** — Additional evidence supports your finding (maintain severity)
2. **CONCEDE** — Acknowledge challenge, downgrade/remove finding
3. **REVISE** — Update finding based on new perspective
4. **ESCALATE** — Flag as unresolved, needs human senior review

OUTPUT FORMAT:

## [Agent Name] — Rebuttals

### Response to Challenge #1 from [Agent]
- Original Severity: [X]/10
- Decision: DEFEND/CONCEDE/REVISE/ESCALATE
- Reasoning: [explanation with code evidence]
- Final Severity: [Y]/10
- Updated Finding (if revised): [description]

### Summary
- Defended: [N]
- Conceded: [N]
- Revised: [N]
- Escalated: [N]
```

---

## Stage 4B — Extract & Organize Automated Fixes

**Note:** Fix extraction happens AFTER debate so that fix priorities reflect post-debate severity adjustments.

Parse agent outputs for automated fix patches:

**Process:**
1. Extract every before/after code patch from all agent reports
2. Group patches by file path
3. If multiple agents suggest fixes for the same file:line, merge or pick the highest-severity version
4. Deduplicate identical suggestions
5. Sort by **post-debate** severity (highest first)

**Display:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 AUTOMATED FIX PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[N] fixes across [M] files

Fix #1 — Severity [X]/10 — [Agent Name]
File: [path]:[line]
[before/after code block]

Fix #2 — ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Note: These fixes are for reference during the review. This command does NOT modify files.

---

## Stage 5 — Consensus Synthesis & Cross-Cutting Analysis

Analyze all findings, debates, and final severity scores to build consensus. Then perform a cross-cutting consistency check that no individual agent can do alone.

**Process:**
1. Collect all final findings. For each finding, the **final severity** is determined as follows:
   - If the finding went through debate AND the original agent issued a CONCEDE or REVISE in Stage 4: use the **revised severity** from the rebuttal
   - If the finding went through debate but the agent DEFENDED: use the **original severity**
   - If the finding was ESCALATED: use the **original severity** and flag as "needs human review"
   - If debate was skipped (per skip condition): use the **raw severity** from the original agent report
   - Gap review findings (from Stage 2B): use raw severity unless challenged and conceded in debate
2. Group by similarity (same file:line or same general issue)
3. For grouped findings, use the **highest final severity** among the group (not the average — averaging dilutes genuine blockers)
4. Count agent agreement (how many agents flagged the same or similar issue)

**Cross-Cutting Consistency Check (post-debate):**

This step catches bugs that individual agents miss because they review from a single perspective.

1. **Operation Inventory**: List every distinct operation the PR implements (e.g., "add content component", "modify page navigation", "update API endpoint"). For each operation, identify ALL code paths that perform it — including components, services, templates, and specs.

2. **Safeguard Parity Check**: For each operation with multiple code paths, verify they all have equivalent:

| Code path | Error handling | Loading state | Unsubscribe | Input validation | Accessibility |
|-----------|---------------|---------------|-------------|-----------------|---------------|

Flag any row that is missing a safeguard present in another row. These are must-fix (severity 9+).

3. **"Fix One, Fix All" Check**: If the PR fixes a pattern in one place (e.g., adding proper unsubscribe logic), search for ALL other instances of that same pattern in the PR. Flag remaining instances.

**Consensus Levels (use highest final severity per finding, not average):**

Classification is based on severity first. Agent count serves as a confidence signal but never downgrades the tier below one step from the severity-based classification.

- **Severity 9.0-10.0, 4+ agents (or all agents in quick mode)**: CRITICAL BLOCKER
- **Severity 9.0-10.0, fewer than above threshold**: HIGH PRIORITY BLOCKER
- **Severity 8.0-8.9, 3+ agents**: HIGH PRIORITY BLOCKER
- **Severity 8.0-8.9, 1-2 agents**: IMPORTANT (should fix before merge)
- **Severity 7.0-7.9, 3+ agents**: IMPORTANT (should fix before merge)
- **Severity 7.0-7.9, 1-2 agents**: MEDIUM PRIORITY
- **Severity 5.0-6.9, 2+ agents**: MEDIUM PRIORITY
- **Severity 5.0-6.9, 1 agent**: SUGGESTION
- **Severity < 5.0**: SUGGESTION
- **Agents differ by 4+ severity points**: NEEDS HUMAN REVIEW (see Severity Spread Escalation below)

**Severity Spread Escalation:** If any individual agent rates a finding at severity 9+ AND another agent rates the same finding (or challenges it to) severity 5 or below (a spread of 4+ points), do NOT simply average the scores. Instead:
1. Flag the finding as **"NEEDS HUMAN REVIEW"** regardless of the average
2. Display both severity assessments in the report with each agent's reasoning
3. This finding counts as a blocker for verdict purposes until a human adjudicates

**Dismissed Finding Matching (from Stage 0D):**

If the dismissed findings list from Stage 0D is non-empty, compare each consensus finding against it:

1. **Match criteria** (ALL must be true):
   - Same file path (exact match)
   - Line number within +-10 of the dismissed finding's line
   - Body text has substantial overlap — strip `<!-- severity:X -->` tags and label prefixes, then check if the core issue description shares key phrases with the dismissed finding

2. **Dismissal rules:**
   - Only findings with consensus severity < 7 can be dismissed
   - Findings with severity >= 7 are NEVER dismissed, even if a match exists
   - Each dismissed finding from Stage 0D can match at most one new finding

3. **Mark matched findings as "dismissed"** — they will appear in the report (Stage 6) under a dedicated section, but they do NOT count toward the verdict calculation

**Verdict Calculation:**

Use only **non-dismissed, non-pre-existing** findings to determine the verdict. Findings with severity < 5 (pure suggestions) are **informational only** and do not affect the verdict — they appear in the report but do not require `/dismiss` and do not block a CLEAN verdict.

- **BLOCKERS_FOUND**: Any non-dismissed critical (9-10) or high priority (8-9) findings, OR any finding flagged as NEEDS HUMAN REVIEW (from Severity Spread Escalation)
- **APPROVED_WITH_SUGGESTIONS**: No non-dismissed blockers, but has non-dismissed findings with severity **>= 5**
- **CLEAN**: No non-dismissed findings with severity **>= 5** (lower severity suggestions and pre-existing findings may exist but are informational only)

**Dead zone guidance (severity 7.0-7.9):** Findings in the "Important" tier (7.0-7.9) cannot be dismissed via `/dismiss` (the 7.0 threshold prevents it) but do not trigger BLOCKERS_FOUND by themselves. They DO prevent a CLEAN verdict (they're >= 5.0). When the report has Important-tier findings but no blockers, the verdict is APPROVED_WITH_SUGGESTIONS — but the report should include a note:

> ⚠️ **[N] Important findings (severity 7.0-7.9)** — These are strongly recommended fixes that don't block merge but can't be dismissed. Consider addressing them in this PR or creating follow-up tickets.

Display consensus summary:

```
📊 Consensus Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Critical Blockers (Severity 9.0-10.0): [N]
High Priority Blockers (Severity 8.0-8.9): [N]
Important Issues (Severity 7.0-7.9): [N]
Medium Priority (Severity 5.0-6.9): [N]
Suggestions (Severity < 5.0): [N] (informational — do not block verdict)
Pre-existing Issues: [N] (informational — do not block verdict)
Dismissed by Developer: [N]
Unresolved Debates: [N]

Total Findings: [N] ([M] active, [D] dismissed, [I] informational)
Average Confidence: [High/Medium/Low]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Stage 6 — Generate Review Report

Print the comprehensive review report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 MULTI-AGENT CODE REVIEW REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agents: [N] specialized reviewers with debate rounds
Mode: [quick/standard/deep]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Sections in order:**

### Verdict

Based on consensus:
- **BLOCKERS FOUND**: ❌ [N] critical + [N] high priority issues must be resolved before merge
- **APPROVED WITH SUGGESTIONS**: ⚠️ No blockers, but [N] improvements recommended (severity 5+)
- **CLEAN**: ✅ No significant issues found

[If BLOCKERS_FOUND, list the top 3 blocker summaries as one-liners here so the developer immediately knows what to fix]

### 📊 Risk Assessment
[From Stage 0B — risk score, level, reviewer recommendation]

### 📦 Dependency Impact
[From Stage 1B — high-impact files, breaking changes]

### 🚫 Critical Blockers (Severity 9.0-10.0)
For each:
- Severity: [X.X]/10 (Consensus from [N] agents)
- File: [file:line]
- Flagged by: [Agent 1 (score), Agent 2 (score), ...]
- Problem: [detailed description]
- Debate Summary: [challenges and resolutions]
- Required Action: [specific fix]

### 🔴 High Priority Blockers (Severity 8.0-8.9)
[Same format as critical]

### ⚠️ Important Issues (Severity 7.0-7.9)
Note: Important issues (7.0-7.9) are strongly recommended but don't block merge. They cannot be dismissed via `/dismiss`. Address them in this PR or create follow-up tickets.
For each:
- Severity: [X.X]/10
- File: [file:line]
- Flagged by: [Agents]
- Issue: [description]
- Recommended Fix: [how to address]

### 💡 Medium Priority (Severity 5.0-6.9)
[Bulleted list with file:line and brief description]

### 💭 Suggestions (Severity < 5.0)
[Grouped by category, bulleted list]

Note: Suggestions (severity < 5) are informational and do not require `/dismiss`. They do not block a CLEAN verdict.

### 🔎 Pre-existing Issues (Informational)
Only include this section if agents flagged pre-existing issues (labeled `[Pre-existing]`).

For each:
- Severity: [X.X]/10
- File: [file:line]
- Issue: [description]
- Note: This issue predates this PR. Consider addressing in a follow-up PR.

Pre-existing issues are informational only — they do not count toward the verdict and do not require `/dismiss`.

If no pre-existing issues exist, omit this section entirely.

### ✅ Dismissed Findings (Acknowledged by Developer)
Only include this section if there are dismissed findings from Stage 0D that matched new findings.

For each dismissed finding:
- Severity: [X.X]/10
- File: [file:line]
- Finding: [description]
- Dismissed by: @[developer] — "[reason]"

These findings were reviewed and acknowledged by the developer. They do not count toward the verdict.

If no dismissed findings exist, omit this section entirely.

### 🤔 Unresolved Debates
For each:
- Debate Topic: [what]
- Severity Range: [Low]-[High]/10
- Positions: [Agent A argues X, Agent B argues Y]
- Why unresolved: [explanation]
- Recommendation: Senior developer should decide

### 📝 Review Summary Table

| Agent | Critical | High | Important | Suggestions | Confidence |
|-------|----------|------|-----------|-------------|------------|
| 🔒 Security | [N] | [N] | [N] | [N] | [H/M/L] |
| 🏗️ Architecture | [N] | [N] | [N] | [N] | [H/M/L] |
| 🔄 Reactive & Async | [N] | [N] | [N] | [N] | [H/M/L] |
| 🧪 Testing | [N] | [N] | [N] | [N] | [H/M/L] |
| 👤 UX | [N] | [N] | [N] | [N] | [H/M/L] |
| 📋 Standards | [N] | [N] | [N] | [N] | [H/M/L] |
| **Total** | **[N]** | **[N]** | **[N]** | **[N]** | |

---

## Stage 7 — Deliver Results

**Step 1: Get PR metadata**
```bash
COMMIT_SHA=$(gh pr view --json commits --jq '.commits[-1].oid' 2>/dev/null)
PR_NUM=$(gh pr view --json number --jq '.number' 2>/dev/null)
```

If no PR exists, print to terminal only.

**Step 2: Ask delivery method**

"How would you like your feedback?"
- **Post to GitHub**: Comments will be left on your GitHub PR
- **Print to Terminal**: Comments will be printed here in terminal
- **Both**: Post to GitHub AND print to terminal

**For GitHub posting:**

**Step 2A: Validate findings against PR file list**

GitHub's PR review API only accepts line comments on files that are part of the PR diff. Before building `.ai-review.json`, validate each finding's file path:

```bash
# Get the authoritative list of files in this PR's diff
gh pr diff --name-only 2>/dev/null
```

For each finding with a file path and line number:
1. Check if the file path appears in the `gh pr diff --name-only` output
2. If **YES** -> include it as a normal line-anchored comment in the `comments` array
3. If **NO** -> this is a "related file finding" — do NOT include it in `comments` (GitHub will reject it with 422 "Path could not be resolved")

**Handling non-PR file findings:**

Findings on files not in the PR diff must be included in the review `body` text instead. Add a section in the body BEFORE the `AI_REVIEW_META` tag:

```markdown
---

### 📎 Findings on Related Files (Not in This PR)

These findings were identified during the review on files related to the changes but not directly modified in this PR. They cannot be posted as line comments.

**[Severity Label] file/path.ts:LINE** — Description of the finding
- Severity: X.X/10
- Flagged by: [Agent Name]
- Recommended Action: [what to do]

[Repeat for each non-PR finding]
```

Non-PR file findings:
- Are informational — they do NOT count toward the verdict or blocker count
- Cannot be dismissed via `/dismiss` (they aren't line comments)
- Should still be shown so the developer is aware of related issues
- Pre-existing issues (labeled `[Pre-existing]`) naturally fall here if they're on non-PR files

**IMPORTANT:** Always use `gh pr diff --name-only` (not `git diff $BASE_REF..$HEAD_REF --name-only`) for this check. The `git diff` version may include files from other PRs that have been merged between the base and head refs, while `gh pr diff` shows only files in THIS PR's diff.

Create `.ai-review.json` with validated findings as line-anchored comments using `line` + `side` fields (same format as `/pr-review` Stage 8).

**CRITICAL — event field must be "COMMENT":**

The `event` field in the review JSON MUST always be `"COMMENT"` — NEVER `"APPROVE"` or `"REQUEST_CHANGES"`. The agent review does NOT approve PRs. A separate GitHub Action (`ai-review-auto-approve`) reads the metadata from the review comment and handles approval automatically. Attempting to approve will fail (you can't approve your own PR via the API).

**Top-level JSON structure:**
```json
{
  "commit_id": "COMMIT_SHA",
  "event": "COMMENT",
  "body": "<review summary with AI_REVIEW_META>",
  "comments": [...]
}
```

**IMPORTANT — Severity tag in each comment body:**

Every comment in the `comments` array MUST start with a machine-readable severity tag. This enables the `/dismiss` feature to validate that only non-blocking findings (severity < 7) can be dismissed.

Format: `<!-- severity:X.X --> [Label] Description...`

Example:
```json
{
  "path": "src/app/services/foo.service.ts",
  "line": 42,
  "side": "RIGHT",
  "body": "<!-- severity:5.2 --> [Medium] Consider extracting this logic into a shared service for consistency with existing patterns."
}
```

Labels map to severity tiers (exclusive upper bounds — use the tier where the score falls):
- `[Critical]` — severity 9.0-10.0
- `[High]` — severity 8.0-8.9
- `[Important]` — severity 7.0-7.9
- `[Medium]` — severity 5.0-6.9
- `[Suggestion]` — severity < 5.0

**IMPORTANT — Machine-readable metadata for auto-approval:**

The review `body` in `.ai-review.json` MUST include this HTML comment at the very end, after all human-readable content:

```
<!-- AI_REVIEW_META: {"risk_level": "[LOW|MEDIUM|HIGH|CRITICAL]", "risk_score": [N], "blockers": [N], "verdict": "[CLEAN|APPROVED_WITH_SUGGESTIONS|BLOCKERS_FOUND]", "dismissed": [N]} -->
```

Where:
- `risk_level`: The risk level from Stage 0B (LOW, MEDIUM, HIGH, or CRITICAL)
- `risk_score`: The numeric risk score (0-10) from Stage 0B
- `blockers`: Total count of non-dismissed critical + high priority blocker findings from the verdict
- `verdict`: One of `CLEAN`, `APPROVED_WITH_SUGGESTIONS`, or `BLOCKERS_FOUND` — calculated using only non-dismissed findings (see Stage 5)
- `dismissed`: Count of findings that were dismissed by the developer via `/dismiss` replies (0 if none)

This metadata is invisible in the rendered review but enables the `ai-review-auto-approve` GitHub Action to automatically approve LOW/MEDIUM risk PRs with a CLEAN or APPROVED_WITH_SUGGESTIONS verdict — satisfying the required reviewer rule without human intervention. HIGH/CRITICAL risk PRs or PRs with BLOCKERS_FOUND still require human review. CI is enforced separately by branch protection rules.

**Step 2B: Validate JSON before posting**

Before posting, validate the JSON is well-formed:

```bash
jq . .ai-review.json > /dev/null 2>&1 || { echo "ERROR: .ai-review.json is malformed JSON. Dumping to terminal for manual review:"; cat .ai-review.json; exit 1; }
```

If validation fails, print the raw JSON to the terminal so the developer can salvage the review output. Do NOT attempt to post malformed JSON to the API.

Then post the review:

```bash
if gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/CruGlobal/know-god-web/pulls/${PR_NUM}/reviews" \
  --input .ai-review.json; then
  rm .ai-review.json
  echo "Review posted to PR #${PR_NUM}"
else
  echo "ERROR: Failed to post review to GitHub. The review file has been preserved at .ai-review.json for manual retry or inspection."
  echo "To retry: gh api --method POST -H 'Accept: application/vnd.github+json' '/repos/CruGlobal/know-god-web/pulls/${PR_NUM}/reviews' --input .ai-review.json"
fi
```

**After posting the review to GitHub**, if ALL of these conditions are met, trigger the auto-approve workflow:
- The review was posted to GitHub (not terminal-only)
- Risk level is LOW or MEDIUM
- Verdict is CLEAN or APPROVED_WITH_SUGGESTIONS

```bash
BRANCH=$(gh pr view ${PR_NUM} --json headRefName --jq '.headRefName')
if [ -n "$BRANCH" ]; then
  gh workflow run ai-review-auto-approve.yml -f head_branch="${BRANCH}" \
    && echo "Triggered auto-approve workflow for branch ${BRANCH}" \
    || echo "WARNING: Failed to trigger auto-approve workflow"
else
  echo "WARNING: Could not determine branch name, skipping auto-approve trigger"
fi
```

Do NOT trigger the workflow if any condition is not met (e.g., BLOCKERS_FOUND verdict or HIGH/CRITICAL risk). The auto-approve workflow does NOT check CI status — CI is enforced by the repo's branch protection rules (CI must pass before merging).

**Line number calculation rules** (same as `/pr-review`):
- Use `line` (actual file line number) + `side` (`"RIGHT"` for new/context lines, `"LEFT"` for deleted lines)
- Use the `+N` side of `@@` hunk headers to determine line numbers in the new file
- Before finalizing, re-read the diff and verify each line number falls within a valid hunk range

**For terminal printing:**
- Group comments by file path
- Show line numbers with each comment
- Display the review body/summary at the top

After delivery, print:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Multi-agent review complete for PR #[NUMBER]
   [N] agents | [N] findings | [N] blockers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If the review was posted to GitHub AND risk is LOW or MEDIUM**, also print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AUTO-APPROVAL ELIGIBLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This PR qualifies for auto-approval (LOW/MEDIUM risk).

[If CLEAN verdict]:
  ✅ No issues found — auto-approve workflow triggered.
     CI must still pass before the PR can be merged (branch protection).

[If APPROVED_WITH_SUGGESTIONS verdict]:
  ✅ Auto-approve workflow triggered.
     Suggestions have been posted as review comments for you to consider.
     These are non-blocking — address them at your discretion.
     CI must still pass before the PR can be merged (branch protection).

[If BLOCKERS_FOUND verdict]:
  🚫 Blockers were found — human review required.
  To resolve:
  1. Fix all severity >= 8 issues (blockers)
  2. For severity < 7 issues you disagree with, reply
     /dismiss: <reason> on the review comment in GitHub
  3. Push your fixes and re-run /agent-review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If the review was NOT posted to GitHub AND risk is LOW or MEDIUM**, print:
```
💡 TIP: Post this review to GitHub to enable auto-approval
   for LOW/MEDIUM risk PRs. Re-run with "Post to GitHub" or
   "Both" to activate.
```

**If risk is HIGH or CRITICAL**, print nothing extra (human review is always required).
