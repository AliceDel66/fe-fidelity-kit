# Memory / Harness Interop

> Built-in memory plus optional external adapters. The mockup render, project code, profile, and fresh runtime evidence remain the source of truth. Memory and harness artifacts only reduce rediscovery.

## When to read this

Read this file when `profile.context.memory_backend != "none"` or `profile.context.harness_backend != "none"`, or when a skill needs to create a bounded reuse packet, append the built-in ledger, or map review evidence into repo-local workflow artifacts.

## Backend detection

- `memory_backend: "builtin"` — default. Read/write the project-local markdown ledger at `profile.context.memory_path` (normally `.claude/fidelity-memory.md`).
- `memory_backend: "none"` — explicit opt-out. Do not read or write fidelity memory.
- `memory_backend: "claude-mem"` — optional adapter. Use the installed claude-mem MCP/CLI if available, and still write the built-in ledger. Follow its progressive shape: search the index, inspect the relevant timeline, then read only the matching observations.
- `memory_backend: "codex-memory"` — optional adapter. Search the local Codex memory registry first, then open only the rollout summaries or skill notes it points to, and still write the built-in ledger.
- `memory_backend: "custom"` — optional adapter. Follow `profile.context.memory_query` exactly, and still write the built-in ledger.
- `harness_backend: "repo-harness"` — only when the target repo has repo-harness artifacts or the user explicitly configures it. Do not install or require repo-harness from this kit.

Detection is advisory. If multiple external backends are present, prefer repo-local fidelity artifacts first, then the configured memory adapter. If detection is ambiguous, write `TODO(adopt: context backend)` rather than guessing.

## Backend: builtin

`profile.context.memory_path` is an append-only markdown ledger. New records go at the top, directly under the header. Create the file if it does not exist.

```markdown
# Fidelity Memory — <project>
> Built-in cross-session fidelity memory. Append-only, newest on top.
> Advisory only: current render, code, profile, and runtime evidence always win.
> Never store raw chat, tokens, account data, credentials, or unrelated private context.

## 2026-06-30 · /landing · FAIL · cross-model
- trap · Button base class adds a transparent 1px border where the mockup is `border:none` · recheck: measure button border and total width, not only card/nav containers
- [P1] fixed · PillButton bordered all variants · avoid: border only on variants whose source CSS has a border
- evidence · .claude/.fidelity-evidence/landing-box.txt · .claude/review/report/landing-crossmodel-codex.md
- note · single-model two-pass missed it because the executor never measured button border
- signed · Codex · 2026-06-30
```

Rules:

- Store only review-grade facts: route/page, verdict/mode, trap, `[P1]` or `[P1] fixed`, evidence paths, short note, and signer.
- `signed · <host/model/person> · <date>` is audit metadata and a trust-weighting hint, not identity verification.
- Treat `cross-model FAIL` and `cross-model [P1]` as the strongest reuse signals. Treat `single-model PASS` as weak advisory and verify it against the current render.
- If the gate report lacks the exact `Gate:` / `Recommendation:` tail or required executor evidence is missing, do not write a clean PASS memory record; write a degraded/blocked note or skip with an explicit reason.
- External memory adapters may add candidate facts, but the built-in ledger remains the portable project-local fallback.

## Read order

1. Read current repo-local artifacts: `.claude/fidelity-profile.md`, `.claude/fidelity-plan.md`, existing `.claude/review/`, `profile.context.memory_path`, and executor evidence under `profile.verify.evidence_dir`.
2. If `harness_backend` is `repo-harness`, inspect `profile.context.harness_artifact_root` for plans, tasks, checks, reviews, and handoff/resume packets.
3. If an external `memory_backend` is configured, query by project name, mockup source, route/page, `profile.ui_lib`, `profile.icon_lib`, and the phrases `Gate: FAIL`, `[P1]`, `token trap`, `box-model`, `evidence`.
4. Open only the 1-3 most relevant external hits. Extract at most `profile.context.reuse_packet_limit` facts total across builtin + external sources.
5. Verify any drift-prone fact against the current repo or render before using it as an implementation constraint.

## Reuse packet format

Use this compact format in plans, build notes, handoff prompts, and review headers:

```markdown
### Reuse packet (advisory, verify against current render)
- Source: <memory/backend path or harness artifact> · Date: <if known>
- Known trap: <token/icon/font/box-model/state issue> · Current check: <what to verify now>
- Prior gate failure: <[P1] summary> · Avoid by: <specific action>
- Evidence to re-check: <screenshot/box/console/network path or expected artifact>
```

Rules:

- Keep 3-5 bullets maximum; never paste long transcripts.
- Treat memory as stale until checked against current files, render, and runtime evidence.
- Never include secrets, tokens, personal chat/account content, private credentials, or raw unrelated conversation.
- Cite local artifact paths where possible so another host can inspect them.
- If there are no relevant facts, say `Reuse packet: none`.

## Harness evidence bridge

When `harness_backend: "repo-harness"` and harness paths exist:

- Keep the canonical fidelity report at `profile.gate.report_path`.
- Also make the report discoverable from the harness review/check surface configured in `profile.context.harness_artifact_root` when that directory exists.
- Link, mirror, or summarize the same facts; do not fork the verdict.
- Reference executor evidence paths from `profile.verify.evidence_dir`, not screenshots hidden in chat.
- Keep the two-line gate tail unchanged: `Gate:` and `Recommendation:`.

When repo-harness is absent, skip the bridge silently and continue with `.claude/review/`.
