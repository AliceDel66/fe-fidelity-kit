---
name: fidelity-plan
description: Analyze the WHOLE mockup up-front (before building any page) — read the design patterns, run an optional memory/harness preflight for prior gate failures and fidelity traps, classify every recurring component as shared-common vs page-local (AHA via cross-page survey), and emit a phased, dependency-ordered build plan into .claude/fidelity-plan.md with a LIVING progress tracker that fidelity-build-from-mockup / fidelity-page-handoff keep in sync. Stack-neutral; reads .claude/fidelity-profile.md. Run after fidelity-adopt and before building, whenever the mockup has more than one page/screen. Triggers: analyze the mockup, plan the build, fidelity-plan, which components are shared, component inventory, development plan, build order, design pattern analysis.
---

# Analyze the mockup → a shared/local component plan + a phased build order

> **Phase 0 of reproduction.** Before reproducing any single page, look at the *whole* mockup once and decide the shape: what design patterns recur, which components are genuinely shared vs page-local, and in what order to build. The output is **one living file** — `.claude/fidelity-plan.md` — that the build skills read (for placement decisions) and update (progress) as they go.
>
> **Why first?** Building page-by-page without this survey produces either (a) duplicated near-identical components, or (b) premature shared abstractions. An up-front cross-page survey detects real reuse *as evidence*, so the shared/local call is grounded, not guessed.
>
> **Boundary vs the build skills**: this skill *plans* (read-only on code; writes only the plan file). `fidelity-build-from-mockup` *builds a page* against the plan. `fidelity-page-handoff` *emits a prompt* for another host to build against the plan.

## 0. Load context (read-only)

- **Read `./.claude/fidelity-profile.md`.** Missing → STOP and run `fidelity-adopt` first. Every `profile.X` below comes from there.
- **Read `../../rules/fidelity-visual.md`** (§3 native-first, §4 AHA placement) and **`../../rules/fidelity-gate.md`** (the verdict vocab Part B logs). These are the SoT; this skill is the procedure.
- If `profile.context.memory_backend != "none"` or `profile.context.harness_backend != "none"`, read `../../references/memory-harness-interop.md` and follow its bounded reuse-packet rules.
- This is a survey, not a build: do not write code, do not edit source. The only write is `.claude/fidelity-plan.md`.

## 1. Memory / harness preflight (advisory)

Do this before the mockup survey only when a context backend is configured:

- Query by the current project, `profile.mockup.render`, `profile.mockup.spec`, `profile.ui_lib`, `profile.icon_lib`, and likely route/page names.
- Look specifically for old `Gate: FAIL`, `[P1]`, `token trap`, `box-model`, icon/font/state drift, stale plan rows, and missing evidence.
- Extract at most `profile.context.reuse_packet_limit` facts using the reuse packet format from `memory-harness-interop.md`.
- Treat the packet as stale until the current render, profile, and repo confirm it. Never let memory override visual truth.
- If nothing relevant is found, record `Reuse packet: none`.

## 2. Survey the WHOLE mockup (every screen, not one page)

Per `fidelity-visual.md §1` the render is visual truth. Enumerate the full surface before judging anything:

- Refresh the source (`profile.mockup.refresh_cmd` if set).
- **List every page / route / screen** the mockup contains (walk `profile.mockup.render` + the spec's heading index `profile.mockup.spec`). You are inventorying the whole app, not the first page.
- Note the **dialect** (`profile.mockup.dialect`) and the design-system source (`profile.mockup.token_source`).

## 3. Read the design patterns (what recurs across pages)

Looking across all screens, name the patterns — this is what makes components shareable:

- **Shells / frames**: a persistent app shell (sidebar + header + work area)? auth/legal frame?
- **Recurring blocks**: page header, section header, stat card, data table, filter bar, empty/loading/error states, pagination, month/period nav…
- **Recurring interactions**: modal create/view/review, batch-select + undo, drawer, wizard, inline edit…
- **Native vs hand-built**: which patterns map to a `profile.ui_lib` **native** component (per the profile's `## Component map`), and which are genuinely hand-built design-language pieces (no native equivalent).

## 4. ★ Component inventory — classify shared vs page-local (AHA via cross-page survey)

This is the core deliverable and the answer to "which components should be common, which stay single-page." For each recurring component, **count the pages that actually use it in the mockup** — that count is the evidence.

**Classification rule (this IS AHA, just surveyed up front — consistent with `fidelity-visual.md §4`):**
- **Shared** → used on **≥ `profile.promote_to_shared_after_uses`** pages (default 2), **OR** it guards a cross-module invariant (one status-color scale, one date format). Place in `profile.shared_components_dir`.
- **Page-local** → used on exactly one page. Place in `profile.page_components_pattern`. **Do not pre-share it.**
- **Watch** → single-use now but likely to recur — keep page-local, but list it so the build loop promotes it on the real 2nd use.

Resolve each shared component to its `profile.ui_lib` native base first (native-first, `§3`); only the genuinely hand-built ones are new code. **Never fabricate components the mockup doesn't show.**

## 5. State / data & structure (light — bind specifics to the profile / project)

Keep this stack-neutral; the profile and the project's own conventions own the specifics:
- **State boundaries**: server state vs shared-client state vs local state — which recurring component owns which.
- **Placement**: shared → `profile.shared_components_dir`; page-local → `profile.page_components_pattern`.
- Skip anything the mockup doesn't determine; don't design a backend contract here.

## 6. Build order — phased by dependency

Order so each shared piece converges **once**, before the pages that need it:

1. **Engineering base** (theme/registry/request layer/global empty-loading-error) — whatever `profile` implies isn't there yet.
2. **App shell + global shared primitives** (the §4 shared components most pages depend on).
3. **Pages, grouped so pages that share a component land in the same phase** (e.g. the two pages that share a review modal build together, so the shared modal is settled once).

Each phase states **deliverables · why grouped · verification** (the `profile.commands` + runtime checks from `fidelity-gate.md`).

## 7. Write `.claude/fidelity-plan.md` (non-destructive)

Write the skeleton below, filled from §1–§6. **If it already exists: do NOT overwrite** — write `.claude/fidelity-plan.review.md`, show the diff, ask the user to merge. Use `TODO(plan: …)` for anything the mockup didn't settle; never guess. Mark Part B all `not-started` (it's the build loop's job to advance it).

```markdown
# Fidelity Plan — <mockup / app name>

> Up-front analysis + living build plan for reproducing <mockup> at 1:1.
> Produced by fidelity-plan. fidelity-build-from-mockup / fidelity-page-handoff keep **Part B — Progress** in sync.
> Bindings: .claude/fidelity-profile.md · Methodology: rules/fidelity-visual.md (§3 native-first, §4 AHA).

## Part A — Analysis & plan (stable)

### A1. Source & scope
- Render: <profile.mockup.render> · tokens: <profile.mockup.token_source> · spec: <profile.mockup.spec> · dialect: <profile.mockup.dialect>
- Screens / routes in scope: <list EVERY page/route>
- Out of scope: <...>

### A1.5 Reuse packet (advisory; verify against current render)
- <3-5 prior facts from profile.context memory/harness backends, or `Reuse packet: none`>

### A2. Design patterns
- Shells/frames: <...> · Recurring blocks: <...> · Recurring interactions: <...>
- Native (map to profile.ui_lib) vs hand-built: <...>

### A3. Component inventory — shared vs page-local  (classify by cross-page usage; AHA §4)
#### Shared (build as common components — ≥N pages or cross-module invariant)
| component | native base (profile.ui_lib) | placement (profile.shared_components_dir) | pages using (evidence) | notes |
|---|---|---|---|---|
| FILL | | | | |

#### Page-local (do NOT pre-share)
| component | page/route | placement (profile.page_components_pattern) | watch-to-promote? |
|---|---|---|---|
| FILL | | | |

> Promote page-local → shared only on the real 2nd use, or to guard a cross-module invariant. Don't pre-generalize.

### A4. State / data & placement (bind specifics to profile / project)
- State boundaries: server / shared-client / local — <which component owns which>.
- Placement: shared → profile.shared_components_dir · page-local → profile.page_components_pattern.

### A5. Build order (dependency-ordered; each shared piece converges once)
- **Phase 0 — base**: <deliverables> · verify: profile.commands.lint + typecheck + test (+ build)
- **Phase 1 — shell + first page**: <deliverables> · verify: <...>
- **Phase 2 — <group>**: <pages that share X> — grouped because: <shared convergence> · verify: <...>
- **Phase N — …**

## Part B — Progress (LIVING — update after EVERY page; see the sync contract)

### Status vocab
- build: `not-started` / `in-progress` / `built-pending-review` / `done` / `blocked`
- gate: `not-run` / `FAIL` / `PASS` / `PASS(visual-only)`
- verify: `none` / `lint` / `typecheck` / `test` / `runtime(browser)` — record the REAL highest level actually reached

### B1. Overview
| phase | scope | build | gate | verify | last-updated | notes |
|---|---|---|---|---|---|---|
| Phase 0 | base | not-started | not-run | none | - | |

### B2. Pages / routes
| page (route) | planned components | build | gate | verify | last-updated | notes |
|---|---|---|---|---|---|---|
| FILL | | not-started | not-run | none | - | |

### B3. Shared components
| component | extracted? | 1st use (page) | 2nd use (promote trigger) | done | last-updated |
|---|---|---|---|---|---|
| FILL | no | | | no | - |

### B4. Verification log  (real commands / results ONLY — "should work" is banned)
- YYYY-MM-DD <page> — <commands run + outcome + gate verdict + evidence path>

### B5. Changelog
- YYYY-MM-DD — <what changed>

### B6. Current blocker & next slice
- Blocker: <none / …>
- Next slice (下一刀): <one concrete next page or component> — why — entry (route / file)
```

## 8. The sync contract (how the plan stays alive)

State this back to the user, and it is enforced by the build skills:
- **After each page clears the gate**, `fidelity-build-from-mockup` (or the orchestrator of `fidelity-page-handoff`) updates **Part B**: the page row, any shared-component row, the verification log (real result), the changelog, and the next slice.
- **Promotion**: when a `watch`/page-local component reaches its real **2nd use**, move it from A3 page-local → A3 shared, extract it to `profile.shared_components_dir`, and update B3. This is the AHA trigger firing — recorded, not guessed.
- **Drift is a gate finding**: a component the plan calls shared but built page-local (or vice-versa), or a page built while Part B was left stale, is something `/fidelity-review` flags.

## Hard guarantees
- Reads everything; writes only `./.claude/fidelity-plan.md` (or `.review.md` if one exists). Never touches source, configs, or the profile.
- Classifies shared vs local by **observed cross-page usage**, never speculation; respects AHA (`fidelity-visual.md §4`).

## Checklist
- [ ] Loaded profile + both rules; resolved/blocked any `TODO`
- [ ] Ran memory/harness preflight when `profile.context.*` enabled; kept it to 3-5 advisory facts
- [ ] Surveyed EVERY screen (not one page); named the dialect + design-system source
- [ ] Read the recurring design patterns (shells / blocks / interactions / native-vs-hand-built)
- [ ] Built the component inventory: shared (≥N pages or invariant) vs page-local vs watch — each with page-evidence and a native base
- [ ] Phased build order, dependency-first, grouping pages by shared-component convergence
- [ ] Wrote `.claude/fidelity-plan.md` (or `.review.md`); Part B seeded `not-started`
- [ ] Stated the sync contract (build loop updates Part B; promote on real 2nd use)
