---
name: fidelity-adopt
description: Initialize fe-fidelity-kit for THIS project — detect the frontend stack (framework, UI lib, styling, icons, token source, placement dirs, mockup location, runtime tool), ask only the gaps, and write a filled .claude/fidelity-profile.md + an idempotent pointer in CLAUDE.md. Non-destructive and re-runnable. Run this once before fidelity-plan / fidelity-build-from-mockup / fidelity-page-handoff / fidelity-review, or again to refresh after the stack changes. Triggers: adopt fidelity kit, set up fidelity profile, init fidelity, fidelity-adopt, refresh fidelity profile.
---

# Adopt fe-fidelity-kit (write the project profile)

> Turns the stack-neutral kit into a project-ready setup by producing **one** file the other skills read: `./.claude/fidelity-profile.md`. **Read everything, write almost nothing**: only the profile + one marked block in CLAUDE.md. Never clobber existing files.

## 0. Locate the template + rules

- The profile template lives at `../../profile/fidelity-profile.template.md` (relative to this skill file) — read it to know every field to fill.
- Sibling rules `../../rules/fidelity-visual.md` + `../../rules/fidelity-gate.md` define what the fields mean.
- Two filled examples are in `../../profile/examples/` — use them as the fill style.
- The kit manifest is `../../kit-manifest.json` — the cross-reference SoT (for `--verify`) and the kit version (for the `generated_by` stamp).

## 1. Detect (read-only — no writes)

Probe the project and record findings; do NOT guess past the evidence.

- **`package.json`**:
  - framework ← `next` / `vite` + `react-router` / `@remix-run/*` / `astro` / `nuxt`.
  - ui_lib ← `antd` / `@mui/material` / `@radix-ui/*` / `@chakra-ui/react` / `@shadcn` patterns / none.
  - icon_lib ← `lucide-react` / `@ant-design/icons` / `react-icons` / `@heroicons/*`.
  - styling ← `@emotion/*` + `antd-style` / `tailwindcss` / `styled-components` / `*.module.css` usage / `@vanilla-extract/*`.
  - chart_lib ← `recharts` / `@visx/*` / `chart.js` / none.
  - scripts ← `dev` / `lint` / `test` (prefer a run-once variant) / `typecheck` / `build`.
- **Lockfile** → package manager: `pnpm-lock.yaml`→pnpm, `yarn.lock`→yarn, `package-lock.json`→npm, `bun.lockb`→bun.
- **`tsconfig.json`** → `compilerOptions.paths` → import alias + what it maps to (root vs `src/`).
- **Token SoT** candidates (search): `constants/theme.*`, `theme.ts`, `tailwind.config.*`, `tokens.*`, `**/*.css` containing `--` custom properties, `design-tokens*`.
- **Placement**: `app/` present (App Router) → `app/<route>/_components/` + `components/`; else `src/components/` + `src/routes/<route>/components/` (adjust to what actually exists).
- **Mockup source**: sibling dirs matching `../*mockup*` / `../*-design*`; any `spec.md` + `design-system.md` pair; a Storybook config; a Figma link in README/docs; git submodules.
- **Runtime tool**: is a gstack `browse` skill available? `@playwright/test` / a Playwright MCP in deps? any configured browser MCP? → also decide `measure_capable` (can it return `getComputedStyle`/`getBoundingClientRect`? screenshot-only or Figma-only → false).

> Use the available read tools (`package.json`, `tsconfig.json`, lockfile, dir listing). On a CodeGraph-indexed repo, a single `codegraph_explore "theme tokens token source"` can locate the token SoT fast.

## 2. Ask only the gaps / ambiguities (one batched round)

Confirm the detected summary, then ask only what detection couldn't settle:
- Detected stack summary — accept or edit (framework / ui_lib / styling / icon_lib / chart_lib).
- **Mockup**: `render` path/URL + `render_kind` + `dialect` (+ `styles` location, `refresh_cmd`, `mockup_serve_url`) if not detected.
- **Token SoT** if multiple candidates, and `token_access` (how a component reads a token).
- **Runtime tool** + **is it measure_capable?** (this gates how strong the gate can be — see `fidelity-gate.md`).
- **copy_language** + `i18n`.
- Confirm placement pattern + AHA threshold (default 2).

Prefer the `AskUserQuestion` tool for these so the user picks from detected options.

## 3. Write (non-destructive)

- **`./.claude/fidelity-profile.md`** — copy the template, fill from detection + answers.
  - **If it already exists: do NOT overwrite.** Write `./.claude/fidelity-profile.review.md` instead, show the diff, and ask the user to merge. (Refresh mode = re-detect → diff → user merges.)
  - Seed `## Component map` with a few known rows for the detected `(dialect → ui_lib)` pair (or leave the same-dialect note if they match); seed `## Icon map` with the algorithmic rule (or a stub if the sets differ). Mark both "extend on first use." **Never fabricate an exhaustive table.**
  - Any field detection couldn't resolve → write `TODO(adopt: <hint>)`, never a guess. The other skills treat a `TODO(` field as "ask the user at point of use," so adopt never blocks downstream work.
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
- The kit's cross-references (the `cross_refs` list in `kit-manifest.json` is the SoT — don't hardcode a count) resolve **from their own locations**: `skills/*/SKILL.md → ../../rules/*.md` (and adopt → `../../profile/…`), `commands/fidelity-review.md → ../rules/*.md` (guards against a partial drop-in copy that omitted `rules/` or `profile/`). If the kit is installed as a plugin, this check is informational; in drop-in mode it catches a broken copy.
- `measure_capable: false` → print a loud note: the gate is capped to `PASS (visual-only — box-model UNVERIFIED)`; suggest installing a measurement-capable browser (a headless-browse skill / Playwright).

## Hard guarantees
- Reads everything; writes only `./.claude/fidelity-profile.md` (+ optional `.review.md`) and the marked CLAUDE.md block.
- Refuses to clobber an existing profile. Never touches source, configs, lockfiles, or the project's existing `.claude/` rules/skills/commands.

## Checklist
- [ ] Detected stack from package.json / lockfile / tsconfig / token candidates / placement / mockup / runtime tool
- [ ] Asked only the gaps (batched), preferring AskUserQuestion
- [ ] Wrote `.claude/fidelity-profile.md` (or `.review.md` if one existed), `TODO(adopt:…)` for unknowns, seeded maps non-exhaustively
- [ ] Idempotent CLAUDE.md marker block added
- [ ] `--verify` passed; measure_capable note printed if false
