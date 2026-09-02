# TaskFlow — Claude Code Practice Project Notes

## 1. Bootstrap

- `npx create-next-app@latest taskflow` → basic Next.js project scaffolded.

## 2. Explore → Plan

- Opened Claude Code in the project folder.
- Used **Plan Mode** (read-only) to have Claude explore the generated structure and propose a plan for a basic task list feature — no files touched yet at this stage.

## 3. Accept plan → Code

- Accepted the plan → Claude Code exited Plan Mode and switched into the execution mode chosen (**manual approval**) → began writing/editing files, pausing for approval before each edit.
- Built the **Tasks page + API route** (add / list / complete / delete tasks, in-memory array) — this is the actual "Code" step of Explore → Plan → Code → Commit.
- Committed the change locally with `git commit` (note: **commit ≠ push** — push to GitHub happened much later, in the GitHub Action step).

## 4. Set project rules

- Created **CLAUDE.md** via the `/init` command (scans the project and generates a first draft; reviewed/edited manually after).
- Created **.claude/settings.json** by prompting directly:
  > "Add a .claude/settings.json that auto-approves file edits but requires my approval before any git push."
- `settings.json` holds **permissions** (what Claude can/can't do without asking).

## 5. Context check

- Ran `/context` to check token usage for the session (system prompt, system tools, skills, messages, autocompact buffer, free space) — confirmed plenty of headroom, no `/compact` needed yet.

## 6. Hooks

- Added **PreToolUse** and **PostToolUse** hooks inside `settings.json` (e.g. auto-format on edit, block edits to `.env`).
- Note: hook changes are picked up on the **next new Claude Code session**, not the current one. Confirmed the same is true for project-level **subagents** (`.claude/agents/`) and newly-installed **plugins** — both showed up as "not found" until the session was restarted, then worked immediately.

## 7. Skills

- Created a custom skill: scaffold a new API route following project conventions (`.claude/skills/`).
- (Along the way, noticed Claude also uses **bundled/built-in skills** like `update-config` — shipped inside Claude Code itself, not something installed manually.)

## 8. Subagents

- Created a **code-reviewer** subagent (`.claude/agents/code-reviewer.md`) to review changes for security/style and report results back to the main session, keeping the main context clean.
- Subagents can be triggered automatically (based on the subagent's description matching the task) or explicitly, e.g. "Have the code-reviewer look at page.tsx" or `@agent-code-reviewer`.

## 9. MCP Server

- Connected the hosted **GitHub MCP server** (`https://api.githubcopilot.com/mcp/`) — scoped locally, private to this project, config stored in `~/.claude.json`, not committed to the repo.
- Auth: a GitHub PAT was used to connect it. ⚠️ **This token was pasted in plaintext during this chat — revoke/regenerate it in GitHub settings and reconnect the MCP server with the new token.**
- Gotcha hit when rotating it: the MCP server keeps the _old_ token until it's explicitly removed and re-added (`claude mcp remove github -s local` → `claude mcp add ...` with the new value) — updating GitHub's copy of the token doesn't propagate to Claude Code automatically.

## 10. Plugins

- Added the official **frontend-design** plugin (via the marketplace) and had Claude give the Tasks page a real visual/design pass.

## 11. Headless mode

- Ran Claude non-interactively for a scriptable check. The generic form is:
  ```
  claude -p "run tests and report pass/fail as JSON" --output-format json
  ```
- In practice this repo has **no test framework configured**, so the prompt had to name real, concrete commands (`npm run lint`, `npx tsc --noEmit`) instead of the vague "run tests" — an agent can't run a test suite that doesn't exist.
- Also needed `--allowedTools "Bash(npm run lint*)" "Bash(npx tsc --noEmit*)"` so the script doesn't block on an interactive permission prompt in a non-interactive context.
- `--output-format json` wraps the result in an envelope; the actual answer is a JSON _string_ inside the `result` field, so a script has to parse it twice (`jq -r '.result' | jq ...`).
- Verified this wasn't just rubber-stamping by deliberately breaking the build twice: an ESLint-only warning still correctly reported "pass" (matches the real exit code), and a genuine TypeScript type error correctly flipped the result to "fail" with the exact error message.

## 12. Routines

- Set up a recurring cron job (via the scheduling tool, `/schedule`-style) to scan the repo for TODO/FIXME comments and summarize them — first as a daily job, then changed to every 3 hours for one day (a second one-shot job was scheduled 24h later specifically to cancel the recurring one, since there's no built-in "run for N days" option).
- Cron expressions support sub-hourly intervals fine (e.g. every 3 or 5 minutes) — there's no "once per hour minimum." The real constraints are: **recurring jobs auto-expire after 7 days** regardless of durability, and **jobs only fire while Claude Code is actually open and idle on the machine** — durability just means the schedule survives an app restart, it does _not_ mean a server somewhere keeps running independently while Claude Code is fully closed. (Model inference runs on Anthropic's infra either way; the scheduler/clock does not.)
- Also had the routine append each run's summary to a log file in the repo (`.claude/todo-scan-log.md`), since relying on scrollback/session history to find results later is unreliable if you weren't watching when it fired.

## 13. GitHub Action — automated PR code review

- Pushed the repo to GitHub (first real `git push` of the project).
- Installed the **Claude GitHub App** on the repo (added under selected repos in the app's GitHub install settings) — this step needs a human in a browser; an agent can't complete GitHub App OAuth installs on its own.
- Generated a long-lived auth token for CI use via `claude setup-token` (an **OAuth token tied to a Pro/Max subscription**, not an Anthropic Console API key — the two are different credential types and are _not_ interchangeable in the workflow: the action has separate `anthropic_api_key` vs `claude_code_oauth_token` inputs, and passing the wrong one to the wrong input fails).
- Added that token as a **repo secret** under Settings → Secrets and variables → **Actions** (not Codespaces or Dependabot secrets — GitHub has three separate stores). Hit two real snags here worth remembering:
  - The secret's **name** has to match the workflow YAML's `secrets.<NAME>` reference exactly, case-sensitive — a mismatched name fails with no useful error beyond "environment variable validation failed."
  - GitHub secrets **can't be renamed**, only edited (same name, new value) or left in place while adding a new one with the correct name.
- Creating/editing the workflow file under `.github/workflows/` needed a broader token than the one used everywhere else: our fine-grained PAT was deliberately scoped to just `Contents` + `Pull requests` for security, and GitHub specifically rejects pushing to `.github/workflows/**` without an explicit `Workflows` scope on the token — regardless of the user's own admin role on the repo. Worked around it by pasting the YAML in via GitHub's web UI directly instead of widening the token.
- First PR's Action run reported `is_error: false` (a "successful" green check) but **never actually posted a review comment** — Claude's own attempts to call `gh pr comment` / the inline-comment tool were silently permission-denied inside the sandboxed CI run (`permission_denials_count: 7`), and nothing surfaced that failure to the UI. The PR got merged on the strength of the green check before this was caught.
- Fix: added `track_progress: true` to the workflow, which has the **action's own code** post the review comment directly, instead of relying on Claude successfully invoking a Bash/MCP tool from inside the run. Opened a second, smaller PR specifically to confirm a comment actually appeared — it did, with a full review (todo checklist, security/convention/correctness notes, and an honest note that it couldn't run `lint`/`tsc` itself in-sandbox).
- Takeaway: a green Action check is not proof the intended side effect happened — worth actually opening the PR and reading the comment, not just checking the run conclusion, especially the first time a new workflow is wired up.
