---
name: review-and-fix
description: Iteratively run PR review and implement all suggestions until the review is clean
---

You are performing an iterative code review and fix cycle. You will repeatedly review the PR and implement fixes until no actionable suggestions remain.

## Configuration

- Dev experience level for reviews: **senior**
- Review output: **Terminal** (never post to GitHub during iterative review)
- Maximum iterations: **10** (safety limit to prevent infinite loops)

## Critical: Fresh Context Per Iteration

Each review iteration MUST run in a **fresh subagent** using the Task tool (subagent_type: "general-purpose"). This prevents focus bias — without fresh context, the reviewer pattern-locks on the issue categories it found in previous iterations and misses entirely different classes of bugs (e.g., finding authorization issues in iteration 1, then missing concurrency bugs in later iterations because it's still focused on authorization).

Do NOT run the review in the main conversation context. Do NOT resume a previous review agent. Each iteration = new agent = fresh eyes.

## Process

### For each iteration:

**Step 1: Run the review in a fresh subagent**

Launch a new subagent using the Task tool with subagent_type "general-purpose". Give it:
- The full `/pr-review` instructions (copy the pr-review skill content into the prompt)
- Argument: `experienced`
- Instruction to print results to terminal (not GitHub)
- Instruction to skip `.ai-review.json` creation
- Instruction to return ALL findings in its response (must-fix, nice-to-have, deep investigation, cross-cutting, suggested tests, reuse opportunities)

IMPORTANT: Do NOT pass any information about previous iterations' findings to the subagent. It must review with completely fresh eyes. The only context it needs is the pr-review instructions and the codebase.

**Step 2: Analyze the subagent's review results**

When the subagent returns, categorize all findings:
- **Must-fix**: Bugs, security issues, breaking changes, performance problems — ALWAYS implement these
- **Deep investigation findings**: Proven issues from Stage 6.5 — ALWAYS implement these
- **Cross-cutting consistency issues**: Safeguard parity failures — ALWAYS implement these
- **Nice-to-have**: Style improvements, minor refactoring — implement these too
- **Suggested tests**: Missing test coverage — implement these
- **Reuse opportunities**: Code that could use existing utilities — implement these

Before acting on findings, filter out false positives:
- Read the actual source code to verify each finding is real
- Discard findings that misread the code or don't apply
- Only implement fixes for confirmed issues

**If the review is clean** (no must-fix, no nice-to-have, no suggested tests, no reuse opportunities, no deep findings, no consistency issues — only praise or "no issues found" statements):
- Print: `✅ Code review passed — no remaining issues after N iteration(s).`
- Stop the cycle.

**If the review has actionable findings:**
- Print: `🔄 Iteration N: Found X actionable item(s). Implementing fixes...`
- List all items being addressed

**Step 3: Implement all fixes**

For each finding, make the code change:
- Fix bugs, security issues, and must-fix items first
- Then address nice-to-have improvements
- Then add suggested tests
- Then apply reuse opportunities

After all fixes are applied:
- Run dependency audit (`npm audit`) to check for known CVEs
- If npm audit reports issues, flag them to the user (these typically require package.json changes)
- Run the test suite (`npm test`) to verify nothing is broken
- If tests fail, fix the failures before proceeding
- Run the linter (`npm run lint`) to fix any lint issues
- Run the formatter (`npm run prettier:write`) to fix any formatting issues

**Step 4: Commit the fixes**

Commit all changes from this iteration. The commit message should reference the review iteration, e.g.:
- "Fix race condition in approval workflow (code review iteration 1)"
- "Add missing test coverage for edge cases (code review iteration 2)"

**Step 5: Loop back to Step 1**

Start the next iteration with a **new** fresh subagent. Do NOT resume the previous one.

## Important Rules

- NEVER run the review in the main conversation context — always use a fresh subagent
- NEVER pass previous iteration findings to the new subagent — fresh eyes every time
- NEVER post reviews to GitHub during the iterative cycle — always print to terminal
- NEVER skip running tests after implementing fixes
- NEVER continue to the next iteration if tests are failing
- If you hit the maximum iteration limit (10), stop and print:
  `⚠️ Reached maximum iterations (10). Remaining issues may need manual review.`
  Then list any remaining unresolved findings.
- Each iteration should make meaningful progress — if the same issue keeps appearing, investigate why the fix isn't working rather than blindly re-applying it
- After the final clean review, ask if the user wants to run `/pr-review` one more time with GitHub posting enabled
