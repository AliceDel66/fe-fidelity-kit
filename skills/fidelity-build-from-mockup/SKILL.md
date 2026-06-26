---
name: fidelity-build-from-mockup
description: Reproduce a design mockup (a render + design tokens + optional spec) into framework code at 1:1 fidelity — native-component-first, token-by-value, the five disaster zones, measured box-model verification. Stack-neutral; reads bindings from .claude/fidelity-profile.md. Use when implementing/reproducing a UI page or component FROM a design source. The model itself is the executor here (for handing the page to a different model/host, use fidelity-page-handoff instead).
---

# Reproduce a page from a mockup (1:1)

> The reproduction loop of fe-fidelity-kit. **First principle: the RENDERED output is visual truth, not the spec text.** Icons, fonts, generated visuals, container box-model, and interactive states are where 1:1 dies — this skill makes them mandatory steps.
>
> **You build, or you hand off?** This skill = *you* build the page (you are the executor; the gate runs after). To instead emit a ready-to-paste prompt for a different model/host (e.g. Codex), use `fidelity-page-handoff`.

## 0. Load context (do this first, every time)

- **Read `./.claude/fidelity-profile.md`** (relative to the project root). **Missing → STOP and run `fidelity-adopt`** — do not guess the stack. Every `profile.X` below comes from there.
- **Read `./.claude/fidelity-plan.md` if it exists** — its §A3 tells you this page's planned components and their **shared vs page-local** placement (from the up-front survey), and §A5 the build order. Absent + the mockup is multi-page → suggest running `fidelity-plan` first. You will also **sync its Part B** after the gate (§7).
- **Read `../../rules/fidelity-visual.md`** and **`../../rules/fidelity-gate.md`** (relative to this skill file). They are the methodology SoT; this skill is the procedure.
- If any `profile` field you need is `TODO(adopt:…)`, ask the user for it now rather than guessing.

## 1. Pull the source + look at the render (not just the text)

- If `profile.mockup.refresh_cmd` is set, run it (e.g. *(illustrative)* `git -C ../oa-mockup pull`).
- Read the **spec** (`profile.mockup.spec`) for the target page — layout, components, interactions, data, tokens. Items marked *(stub)* are not yet backend-wired.
- Read the **token source** (`profile.mockup.token_source`) for the relevant tokens / type scale / icon set.
- **Open the render** (`profile.mockup.render`, kind `profile.mockup.render_kind`) and SEE what it actually looks like — when text and render disagree, the render wins.

## 2. Map components — native-first + discover-and-extend

Per `fidelity-visual.md §3`:
1. For each component in the render, check `profile`'s `## Component map` for the source-dialect→`profile.ui_lib` mapping. Use the library's **native** component with native props.
2. **discover-and-extend**: if the render uses a component not yet in the map, resolve it to its `profile.ui_lib` native equivalent (consult the library's docs) and **append a row to the profile's `## Component map`** so the next page reuses it.
3. **same-dialect collapse**: if `profile.mockup.dialect` already equals `profile.ui_lib`'s vocabulary, copy near-identically — don't invent re-mappings.
4. Only hand-build (in `profile.styling`) what the library genuinely lacks and is specific to this design language.

## 3. ★ The five disaster zones (each is a hard step — see fidelity-visual.md §2)

- **Z1 Icons** — same set as the source via named import from `profile.icon_lib` (algorithmic kebab→Pascal); size/color read from the render (`currentColor`). Library's own built-in glyphs stay native. Cross-set mappings recorded in profile `## Icon map`.
- **Z2 Fonts** — headings through `profile.token_access` (heading primitive / semantic tag), never a bare `div` font-size. Match the type ramp in `profile.mockup.token_source`.
- **Z3 Generated visuals** *(only if the render has charts/sparklines/gauges/canvas)* — reproduce the mockup's structure + token palette via `profile.chart_lib`; add no labels, don't re-palette, don't reshape.
- **Z4 Container box-model** — for any hand-built container: `grep` `profile.mockup.styles` for the class, copy `padding`/`gap`/`border`/`border-radius`/`line-height`/child `font-size`; map color/radius/shadow to **value-equal** tokens (look up the number in `profile.token_sot` — the `--radius-md:8 → borderRadiusLG(8) not borderRadius(6)` trap), write spacing as exact px; **copy the DOM structure** (don't turn inline text into `flex; gap` and add phantom 4px).
- **Z5 Interactive states** — reproduce hover/focus/active/disabled/transition/overlay-z from the source's state rules; these are verified by *driving* the state, not the resting shot.

## 4. Placement + data + copy

- **Follow the plan's placement** (`.claude/fidelity-plan.md` §A3, if present): build A3-**shared** components in `profile.shared_components_dir`, **page-local** ones in `profile.page_components_pattern`. No plan → default page-local, promote to shared only on the `profile.promote_to_shared_after_uses`-th real use (AHA).
- Data: start with the spec's example data (mock/hardcode); swap to the real data layer when wiring the backend.
- Copy: reproduce verbatim in `profile.copy_language`; route through i18n keys iff `profile.i18n` is true.

## 5. ★ Verify — runtime (you) before review (the gate)

You are the executor — `fidelity-gate.md §3`: a reviewer PASS never exempts this. Run the done-definition:

1. `profile.commands.lint` + `profile.commands.typecheck` + `profile.commands.test` green (skip typecheck only if the profile marks it n/a — e.g. a plain-JS project).
2. Run the page with `profile.verify.runtime_tool` using `profile.verify.recipe`:
   - **load + screenshot** your page (`recipe.load` / `recipe.screenshot`); load the mockup region at the same viewport (`profile.mockup.mockup_serve_url` or compare to the source render) for side-by-side.
   - **box-model digits** (catch 4–8px drift): `recipe.box` on your container → compare each value against what you grepped from `profile.mockup.styles`.
   - **drive interactive states** (`recipe.drive_state`) for Z5.
   - **runtime health**: `recipe.console`, `recipe.network`, `recipe.responsive` across `profile.verify.viewports`.
3. Fix until visuals match, numbers match, and console/network are clean. Keep the evidence (screenshots / console / inspect) in `profile.verify.evidence_dir`.

> If `profile.verify.measure_capable` is false: you can't satisfy "measure not overlay" — fall back to `token_source` + the source's CSS values item by item, but STILL actually run console/responsive. The gate is capped to `PASS (visual-only — box-model UNVERIFIED)` (see `fidelity-gate.md §3`).

## 6. Loop Engineering — self-refactor before submitting (fidelity-gate.md §4.2)

Once the done-definition is green, refactor this slice to the simplest shape — **behavior and rendered result must not change**:
- native-first (drop any hand-roll the library has, remove pointless style wrappers);
- converge stray hex / magic numbers into `profile.token_sot` tokens;
- AHA placement; DRY but not over-abstract; clear `any` / unsafe casts / dead code; split an over-large file by responsibility.

"Elegant = simpler, not cleverer." After refactoring, **re-run the entire done-definition (§5)**. Stop when the next change is only speculative polish.

## 7. Submit to the gate

Run the reviewer gate (`fidelity-review` command, or `profile.gate.reviewer_host`). Paste back the `[P1]/[P2]` verbatim. Any `[P1]` → fix and re-review. **`Gate: PASS` = done.** `[P2]` → follow-up (promote to `[P1]` now if it breaks the current UI goal).

## 8. Sync the plan (if the project has one)

Once `Gate: PASS`, update `.claude/fidelity-plan.md` **Part B** (the sync contract): the page row, any shared-component row, the **verification log** (the real result + gate verdict + evidence path), the changelog, and the next slice. If a page-local/watch component just hit its real **2nd use**, **promote** it — move it to §A3 shared, extract to `profile.shared_components_dir`, and update B3. (Skip if there is no plan file.)

## Checklist
- [ ] Loaded `profile` + both rules; resolved any `TODO(adopt:…)` fields
- [ ] Pulled the source and **looked at the render** (not just spec text)
- [ ] Native-first via profile's component map; appended any newly-discovered component
- [ ] Z1 icons from `profile.icon_lib`; Z2 headings via `profile.token_access` (no bare-div px); Z3 generated visuals match structure (if present); Z4 box-model grepped + value-equal tokens + exact px + DOM copied; Z5 states reproduced
- [ ] Placement follows the plan's §A3 (shared vs page-local); no plan → AHA default
- [ ] Ran the page (`profile.verify`): side-by-side, box-model digits, states, console/network/responsive — evidence kept
- [ ] Loop Engineering pass done + done-definition re-run
- [ ] Submitted to the gate; `Gate: PASS`
- [ ] Synced `.claude/fidelity-plan.md` Part B (page/component rows, real verification log, next slice); promoted any component on its real 2nd use (if a plan exists)
