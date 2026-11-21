---
description: Pick the next coverage gap and run it through writer → reviewer
argument-hint: [backlog ID, or empty for the top P1 item]
---
1. If `docs/coverage-backlog.md` is missing or older than the last test change, run the
   `coverage-analyst` agent first.
2. Pick backlog item $ARGUMENTS (or the top open P1). Create a branch `test/<short-name>`.
3. Delegate to `api-test-writer` or `ui-test-writer` according to the item's layer. Pass the
   item ID, the gap description and the "Why this layer" note in the prompt.
4. Run `test-reviewer` on the result. If REQUEST CHANGES, send the blocking issues back to
   the same writer. Max 2 review rounds — then stop and report to me.
5. On APPROVE: mark the item done in the backlog, commit (`test: ...`), and show me the
   summary. Don't push or open a PR until I say so.
