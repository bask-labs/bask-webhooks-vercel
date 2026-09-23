# Agent rules

- Commit messages follow Conventional Commits: `type(scope): subject`, types `feat fix docs chore refactor test ci build perf revert`, subject 72 chars max.
- Never add a `Co-Authored-By` trailer for yourself or any coding agent.
- `.githooks/commit-msg` enforces both locally and `.github/workflows/commits.yml` enforces them in CI. Do not bypass with `--no-verify`.
- Keep the two functions thin. Business logic goes in `api/queues.ts`, nothing else changes shape without a docs update at docs.bask.health/platform/webhooks/vercel.
