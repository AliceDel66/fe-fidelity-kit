# Goal-mode Development Plan · vNext builtin memory + review recipe

> Copy this document into a long-running `/goal` task when implementing or auditing this upgrade.
> Signed: Codex · 2026-06-30

## Objective

Upgrade `fe-fidelity-kit` so a user only needs to install this kit to get the fidelity workflow that previously depended on repo-harness and claude-mem for reuse, review gating, and recoverable evidence.

The default path must be pure files inside the adopted project:

- `.claude/fidelity-profile.md` stores the project binding.
- `.claude/fidelity-plan.md` stores the shared/local build plan and progress.
- `.claude/fidelity-memory.md` stores append-only review-grade memory.
- `.claude/review/` and `profile.verify.evidence_dir` store review reports and executor evidence.

External tools are adapters only. `claude-mem`, `codex-memory`, `custom`, and `repo-harness` may enhance lookup or discoverability when already installed or explicitly configured, but they must not be required for the normal workflow.

## Non-goals

- Do not vendor, auto-install, or wrap installation for claude-mem or repo-harness.
- Do not add a worker, MCP service, SQLite, Chroma, queue, CI runner, worktree manager, or host-level hook as a default dependency.
- Do not write raw chat logs, secrets, account identifiers, tokens, or private context into project memory.
- Do not let memory or harness artifacts override the current render, code, profile, runtime evidence, or reviewer verdict.
- Do not make `reviewer_cmd` an orchestrator. It is only a reusable read-only recipe with a prompt fallback.

## Source of truth

Use these files as the implementation boundary:

- `profile/fidelity-profile.template.md`
- `profile/examples/*.profile.md`
- `references/memory-harness-interop.md`
- `rules/fidelity-gate.md`
- `commands/fidelity-review.md`
- `skills/fidelity-adopt/SKILL.md`
- `skills/fidelity-plan/SKILL.md`
- `skills/fidelity-build-from-mockup/SKILL.md`
- `skills/fidelity-page-handoff/SKILL.md`
- `scripts/verify-kit.mjs`
- `README.md`
- `README.zh.md`

## Required contract

`context.memory_backend` legal values:

```text
builtin | none | claude-mem | codex-memory | custom
```

`repo-harness` is not a legal memory backend. It is only legal as:

```text
context.harness_backend: repo-harness
```

Every shipped profile template and example must include:

```yaml
context:
  memory_backend: "builtin"
  memory_path: ".claude/fidelity-memory.md"
  harness_backend: "none"
  harness_artifact_root: "(n/a)"
  memory_query: "(n/a)"
  reuse_packet_limit: 5
```

The optional gate recipe shape is:

```yaml
gate:
  reviewer_cmd:
    label: "read-only cross-model fidelity review"
    cmd: "(n/a)"
    sandbox: "read-only"
    expected_tail: "Gate: PASS|FAIL + Recommendation: ..."
    fallback: "Use fidelity-page-handoff Template C reviewer prompt."
```

## P1 · Builtin memory closed loop

### P1.1 Profile contract

- Change the profile template default from `memory_backend: none` to `memory_backend: builtin`.
- Add required `context.memory_path`.
- Remove repo-harness from the legal memory backend values everywhere.
- Preserve `harness_backend: repo-harness` as an optional harness adapter.
- Update all profile examples to match the template.

Acceptance:

- `node scripts/verify-kit.mjs` passes.
- The forbidden memory-backend grep returns no matches.
- Every template/example contains `memory_backend: "builtin"` and `memory_path: ".claude/fidelity-memory.md"`.

### P1.2 Ledger format

Define builtin memory in `references/memory-harness-interop.md`.

Ledger requirements:

- Path comes from `profile.context.memory_path`.
- Default path is `.claude/fidelity-memory.md`.
- Format is append-only markdown with newest records first.
- Records contain only review-grade facts:
  - `date`
  - `route/page`
  - `verdict`
  - `mode`
  - `trap`
  - `[P1]` or `[P1] fixed`
  - `evidence`
  - `note`
  - `signed`
- `signed` is an audit hint, not authentication.
- Current render/code/profile/runtime evidence always wins over ledger content.

Acceptance:

- The reference explicitly forbids raw chat logs, secrets, account identifiers, tokens, and private context.
- The reference states that external memory adapters still write the same builtin ledger.

### P1.3 Gate writes memory

Update `rules/fidelity-gate.md` and `commands/fidelity-review.md`:

- After verdict production, append a ledger record when `profile.context.memory_backend != "none"`.
- Create `profile.context.memory_path` if missing, with a short file header.
- Write `degraded` or skip the append when evidence is missing or the required two-line tail is malformed.
- Do not let memory append failure change the gate verdict.

Acceptance:

- A PASS/FAIL review can produce a compliant ledger entry.
- The required final review tail remains exactly:

```text
Gate: PASS|FAIL
Recommendation: ...
```

### P1.4 Plan reads memory

Update `skills/fidelity-plan/SKILL.md`:

- Read `profile.context.memory_path` before optional external adapters.
- Filter by route/page/component and fidelity trap terms.
- Keep at most `profile.context.reuse_packet_limit` facts.
- Weight `cross-model [P1]` and `cross-model FAIL` highest.
- Treat `single-model PASS` as weak advisory only.
- Emit the packet into `.claude/fidelity-plan.md` `A1.5 Reuse packet`.

Acceptance:

- A relevant old trap appears in `A1.5` with source, current check, and evidence path.
- No relevant memory results in `Reuse packet: none`.

### P1.5 Build and handoff read memory

Update `skills/fidelity-build-from-mockup/SKILL.md` and `skills/fidelity-page-handoff/SKILL.md`:

- Read builtin memory first.
- Query optional external adapters only after builtin memory.
- Carry 3-5 advisory facts into build notes or handoff prompt.
- State that the packet cannot override current visual truth.

Acceptance:

- A second host receiving a handoff can see prior traps and evidence paths without chat history, claude-mem, or repo-harness.

### P1.6 Adopt defaults to zero external dependency

Update `skills/fidelity-adopt/SKILL.md`:

- Default to builtin memory.
- Only use `none` when the user explicitly opts out.
- Only use `claude-mem`, `codex-memory`, or `custom` when the user explicitly chooses an external memory adapter.
- Detect `repo-harness` only as `harness_backend`.
- Never require external installation during adopt.

Acceptance:

- A project with no repo-harness and no claude-mem still gets a complete profile and the full fidelity workflow.

## P2 · Reviewer command recipe

### P2.1 Profile recipe

- Add optional `gate.reviewer_cmd` to the template and examples.
- Include `label`, `cmd`, `sandbox`, `expected_tail`, and `fallback`.
- Require `expected_tail` to include `Gate:` and `Recommendation:`.

### P2.2 Handoff recipe use

- `fidelity-page-handoff` may print the reviewer command before Template C.
- The recipe must be read-only.
- If the command is unavailable, unsafe, or missing the expected tail, fall back to Template C prompt.
- Recipe failure must not fail the gate.

Acceptance:

- Handoff can offer a one-command review path while remaining copy/paste prompt compatible.

## P3 · Opt-in hooks

P3 is out of scope for this upgrade.

Only consider it after P1/P2 dogfood proves the file-only loop is insufficient. If added later:

- It must be profile opt-in.
- It may only inject a bounded reuse packet at session start or append review-grade facts at stop.
- It must be removable without changing P1 behavior.
- It must not modify user-level host hooks by default.

## README and manifest work

- Update `README.md` and `README.zh.md` workflow diagrams so builtin memory is visible.
- Update the architecture diagram so `.claude/fidelity-memory.md` is a first-class project artifact.
- Update Quickstart to state that repo-harness and claude-mem are not required.
- Update Profile and Memory/Harness sections to mention `memory_backend`, `memory_path`, builtin default, optional adapters, and `reviewer_cmd`.
- Add this file to the references list in `kit-manifest.json`.

Acceptance:

- README heading counts remain symmetric.
- `node scripts/verify-kit.mjs` passes.

## Dogfood acceptance

Use a real or simulated old fidelity trap.

Minimum dogfood:

- Create or locate a ledger entry for a prior page-level trap, for example `PillButton border` from an old landing page review.
- Dry-run or run `fidelity-plan` against a test/adopted project.
- Confirm the trap appears in `A1.5 Reuse packet` with:
  - source
  - current check
  - evidence path or expected regenerated artifact
- Confirm no external repo-harness or claude-mem command is needed for the packet.

## Final verification

Run:

```bash
node scripts/verify-kit.mjs
git diff --check
bad_a='memory_backend.*'
bad_b='allowedMemory.*'
bad_c='repo-harness'
! rg -n "${bad_a}${bad_c}|${bad_b}${bad_c}" profile references/memory-harness-interop.md skills rules commands README.md README.zh.md scripts kit-manifest.json
rg "memory_backend: \"builtin\"|memory_path|fidelity-memory.md|reviewer_cmd|expected_tail" profile references skills rules commands README.md README.zh.md
```

Expected result:

- `verify-kit` passes.
- `git diff --check` is clean.
- The `repo-harness` memory-backend grep has no matches.
- The builtin memory grep shows the template, examples, references, skills, commands, rules, and READMEs.

## Stop conditions

The goal is complete only when all are true:

- Users can adopt the kit with no repo-harness or claude-mem installed.
- repo-harness is removed from the memory backend contract.
- Builtin memory is documented, written by the gate, and read by plan/build/handoff.
- Optional external adapters are explicitly non-blocking.
- README English and Chinese are synchronized.
- `node scripts/verify-kit.mjs` passes.
