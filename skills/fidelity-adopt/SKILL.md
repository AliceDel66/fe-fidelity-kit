---
name: fidelity-adopt
description: Initialize fe-fidelity-kit for THIS project — detect the frontend stack (framework, UI lib, styling, icons, token source, placement dirs, mockup location, runtime tool) plus optional memory/harness context backends, ask only the gaps, and write a filled .claude/fidelity-profile.md + an idempotent pointer in CLAUDE.md. Non-destructive and re-runnable. Run this once before fidelity-plan / fidelity-build-from-mockup / fidelity-page-handoff / fidelity-review, or again to refresh after the stack changes. Triggers: adopt fidelity kit, set up fidelity profile, init fidelity, fidelity-adopt, refresh fidelity profile.
---

# Adopt fe-fidelity-kit (write the project profile)

> Turns the stack-neutral kit into a project-ready setup by producing **one** file the other skills read: `./.claude/fidelity-profile.md`. **Read everything, write almost nothing**: only the profile + one marked block in CLAUDE.md. Never clobber existing files.

## 0. Locate the template + rules

- The profile template lives at `../../profile/fidelity-profile.template.md` (relative to this skill file) — read it to know every field to fill.
- Sibling rules `../../rules/fidelity-visual.md` + `../../rules/fidelity-gate.md` define what the fields mean.
- Optional context bridge `../../references/memory-harness-interop.md` defines memory/harness backend detection and downgrade rules.
- Two filled examples are in `../../profile/examples/` — use them as the fill style.
- The kit manifest is `../../kit-manifest.json` — the cross-reference SoT (for `--verify`) and the kit version (for the `generated_by` stamp).

## 1. Detect (read-only — no writes)

Probe the project and record findings; do NOT guess past the evidence.

- **`package.json`**:
  - framework ← `next` / `vite` + `react-router` / `@remix-run/*` / `astro` / `nuxt`.
  - ui_lib ← (React) `antd` / `@mui/material` / `@radix-ui/*` / `@chakra-ui/react` / `@shadcn` patterns; (Vue) `@nuxt/ui` / `naive-ui` / `element-plus` / `vuetify` / `primevue`; or none.
  - icon_lib ← (React) `lucide-react` / `@ant-design/icons` / `react-icons` / `@heroicons/*`; (Vue/Iconify) `@nuxt/icon` / `@iconify/vue` / `unplugin-icons` / `lucide-vue-next` — note the Iconify *string-name* paradigm (`i-lucide-*`) vs named imports.
  - styling ← `@emotion/*` + `antd-style` / `tailwindcss` / `styled-components` / `*.module.css` usage / `@vanilla-extract/*`.
  - chart_lib ← `recharts` / `@visx/*` / `chart.js` / none.
  - scripts ← `dev` / `lint` / `test` (prefer a run-once variant) / `typecheck` / `build`.
- **Lockfile** → package manager: `pnpm-lock.yaml`→pnpm, `yarn.lock`→yarn, `package-lock.json`→npm, `bun.lockb`→bun.
- **`tsconfig.json`** → `compilerOptions.paths` → import alias + what it maps to (root vs `src/`).
- **Token SoT** candidates (search): `constants/theme.*`, `theme.ts`, `tailwind.config.*`, `tokens.*`, `**/*.css` containing `--` custom properties, `design-tokens*`.
- **Placement**: `app/` present (App Router) → `app/<route>/_components/` + `components/`; else `src/components/` + `src/routes/<route>/components/` (adjust to what actually exists).
- **Mockup source**: sibling dirs matching `../*mockup*` / `../*-design*`; any `spec.md` + `design-system.md` pair; a single self-contained design-to-code export (one inline-styled `.html`, often v0 / Figma Make / a "dc" export, may carry `<sc-if>`/`<sc-for>`/`{{ }}` placeholders) → point `mockup.styles`/`mockup.token_source`/`mockup.spec` at that same file; a Storybook config; a Figma link in README/docs; git submodules.
- **Runtime tool**: is a gstack `browse` skill available? `@playwright/test` / a Playwright MCP in deps? any configured browser MCP? → also decide `measure_capable` (can it return `getComputedStyle`/`getBoundingClientRect`? screenshot-only or Figma-only → false) **and `state_drivable`** (can it fire + capture `:hover`/`:focus`/`:active`/open? a measure-only preview that can't drive states → false — the two are orthogonal).
- **Context backends (optional; never blocking)**:
  - `memory_backend` ← `claude-mem` if an installed claude-mem MCP/CLI is visible; `codex-memory` if `$HOME/.codex/memories/MEMORY.md` exists and is relevant; `repo-harness` if repo-local harness artifacts are the only memory surface; `custom` only when the user provides a query path; otherwise `none`.
  - `harness_backend` ← `repo-harness` only when `.ai/harness/`, repo-harness task/check/review artifacts, or an explicit repo-harness config exists; otherwise `none`.
  - `harness_artifact_root` ← the detected repo-local root (e.g. `.ai/harness` or `tasks`) or `(n/a)`.
  - `memory_query` ← a concise query recipe using project name + mockup + route + ui_lib + `Gate: FAIL` + `token trap` + `box-model`; do not bake in user-private content.

> Use the available read tools (`package.json`, `tsconfig.json`, lockfile, dir listing). On a CodeGraph-indexed repo, a single `codegraph_explore "theme tokens token source"` can locate the token SoT fast.

## 2. Ask only the gaps / ambiguities (one batched round)

Confirm the detected summary, then ask only what detection couldn't settle:
- Detected stack summary — accept or edit (framework / ui_lib / styling / icon_lib / chart_lib).
- **Mockup**: `render` path/URL + `render_kind` + `dialect` (+ `styles` location, `refresh_cmd`, `mockup_serve_url`) if not detected.
- **Token SoT** if multiple candidates, and `token_access` (how a component reads a token).
- **Runtime tool** + **is it measure_capable?** + **is it state_drivable?** (these two orthogonal axes gate how strong the gate can be — see `fidelity-gate.md`).
- **copy_language** + `i18n`.
- Confirm placement pattern + AHA threshold (default 2).
- **Context backend** only if ambiguous: choose `memory_backend` / `harness_backend`, or confirm `none`. Missing backends are fine; never require installation during adopt.

Prefer the `AskUserQuestion` tool for these so the user picks from detected options.

## 3. Write (non-destructive)

- **`./.claude/fidelity-profile.md`** — copy the template, fill from detection + answers.
  - **If it already exists: do NOT overwrite.** Write `./.claude/fidelity-profile.review.md` instead, show the diff, and ask the user to merge. (Refresh mode = re-detect → diff → user merges.)
  - Seed `## Component map` with a few known rows for the detected `(dialect → ui_lib)` pair (or leave the same-dialect note if they match); seed `## Icon map` with the algorithmic rule (or a stub if the sets differ). Mark both "extend on first use." **Never fabricate an exhaustive table.**
  - Any field detection couldn't resolve → write `TODO(adopt: <hint>)`, never a guess. The other skills treat a `TODO(` field as "ask the user at point of use," so adopt never blocks downstream work.
  - Fill `context.*` with detected optional backends. If none are present, write `memory_backend: "none"` and `harness_backend: "none"`; this preserves the old workflow exactly. If a backend is present but query details are unclear, write `TODO(adopt: context query)` rather than guessing.
  - Stamp `generated_by: fidelity-adopt@<kit version from kit-manifest.json>` and `generated_against` (ui_lib + framework majors).
- **CLAUDE.md (or AGENTS.md) pointer** — append an **idempotent** block inside markers; re-running replaces only the marked block:
  ```
  <!-- fe-fidelity-kit:start -->
  This project uses fe-fidelity-kit for 1:1 mockup reproduction.
  Profile: .claude/fidelity-profile.md
  Plan a multi-page build → the `fidelity-plan` skill → .claude/fidelity-plan.md (design patterns, shared vs page-local components, phased order; kept synced).
  Reproduce a page → the `fidelity-build-from-mockup` skill (or `fidelity-page-handoff` to dispatch to another host).
  Review gate → `/fidelity-review`.
  <!-- fe-fidelity-kit:end -->
  ```
  If no CLAUDE.md exists, offer to create a minimal one — don't force it.

## 4. Self-check (`--verify`)

After writing (or when invoked as `fidelity-adopt --verify`), assert:
- `./.claude/fidelity-profile.md` exists and every `FILL:` is replaced (remaining `TODO(adopt:…)` are listed, not errors).
- `context.memory_backend` is one of `none | claude-mem | codex-memory | repo-harness | custom`; `context.harness_backend` is one of `none | repo-harness`; backend absence is informational, not an error.
- The kit's cross-references (the `cross_refs` list in `kit-manifest.json` is the SoT — don't hardcode a count) resolve **from their own locations**: `skills/*/SKILL.md → ../../rules/*.md` (and adopt → `../../profile/…`), `commands/fidelity-review.md → ../rules/*.md` (guards against a partial drop-in copy that omitted `rules/` or `profile/`). If the kit is installed as a plugin, this check is informational; in drop-in mode it catches a broken copy.
- `measure_capable: false` → print a loud note: the gate is capped to `PASS (visual-only — box-model UNVERIFIED)`; suggest installing a measurement-capable browser (a headless-browse skill / Playwright).
- `state_drivable: false` → print a loud note: Zone-5 interactive states can't be driven, so the gate carries `interaction UNDRIVEN` (states confirmed from the source's rules + code only, no driven screenshot); suggest a state-driving tool where hover/focus fidelity matters.

## Hard guarantees
- Reads everything; writes only `./.claude/fidelity-profile.md` (+ optional `.review.md`) and the marked CLAUDE.md block.
- Refuses to clobber an existing profile. Never touches source, configs, lockfiles, or the project's existing `.claude/` rules/skills/commands.

## Checklist
- [ ] Detected stack from package.json / lockfile / tsconfig / token candidates / placement / mockup / runtime tool
- [ ] Detected optional context backends (`memory_backend`, `harness_backend`) or explicitly set them to `none`
- [ ] Asked only the gaps (batched), preferring AskUserQuestion
- [ ] Wrote `.claude/fidelity-profile.md` (or `.review.md` if one existed), `TODO(adopt:…)` for unknowns, seeded maps non-exhaustively
- [ ] Idempotent CLAUDE.md marker block added
- [ ] `--verify` passed; measure_capable / state_drivable notes printed if either is false
