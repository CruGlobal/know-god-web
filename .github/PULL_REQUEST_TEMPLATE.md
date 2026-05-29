## Description

Please explain a bullet-point summary of the changes.
List any PRs that this PR is dependent on and any Jira tickets that this PR is related to.

For UI or tool-content changes, please include before/after screenshots or a short screen recording.

## Testing

<!--
Please provide instructions for the reviewer of how to test your changes. What steps should they take to prove that the code fixed the bug or to see the new feature added?

Tips:
- Run the app locally with `yarn start:dev` (or check the deployed staging build once the "On Staging" label is applied).
- If the change affects the embed, test it via `embed/example.html` and confirm the tool still loads inside the iframe.
- Note the relevant tool/language (e.g. `data-book=kgp-us`, `data-lang=en`) the reviewer should use.

Example:
- Go to /#/en/kgp-us
- Navigate to the next page of the tool
- Check that the page renders correctly
-->

- Go to ...
- Do ...
- Check that ...

## Checklist:

- [ ] I have opened this PR against `staging` or `main` (CI only runs PR checks on those branches)
- [ ] I have given my PR a title with the format "GT-(JIRA#) (summary sentence max 80 chars)" — the GT (GodTools) ticket prefix matches the Jira board; if there is no ticket, use a short descriptive title
- [ ] I have applied the appropriate labels — add **"On Staging"** to auto-merge this branch into `staging` and `development`, or **"On Development"** to merge into `development` only, so it deploys to a live test environment (see [`update-staging.yml`](workflows/update-staging.yml))
- [ ] I have run `yarn lint` and `yarn prettier:check` and fixed any issues
- [ ] `yarn test --no-watch` passes locally
- [ ] I have requested a review from another person on the project
- [ ] I have tested my changes on staging or development
- [ ] I have cleaned up my commit history
