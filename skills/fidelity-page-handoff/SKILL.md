---
name: fidelity-page-handoff
description: Produce a ready-to-paste prompt that hands a 1:1 mockup-reproduction page to a DIFFERENT model/host (e.g. Codex) as the executor — auto-filling the spec slice, the done-definition, the Loop Engineering pass, and the review-gate handshake from .claude/fidelity-profile.md. Use when you want another host to build/fix a page and you need the prompt. Triggers: hand off page, dispatch page, prompt for codex, give me an executor prompt.
---

# Hand a page to an executor (emit the prompt)

> Use when the **division of labor is cross-model**: another host (e.g. Codex) is the executor (writes code + runs the page), and you orchestrate + later review with `fidelity-review`. This skill makes you the **orchestrator**: you produce a prompt to paste — **you do not build the page yourself, do not edit code.**
>
> Boundary vs `fidelity-build-from-mockup`: that one = *you* build; this one = *emit a prompt for another host to build*.

## 0. Load context (read-only)

- Read `./.claude/fidelity-profile.md` (project root). Missing → tell the user to run `fidelity-adopt` first.
- Read `./.claude/fidelity-plan.md` if it exists — pull this page's planned components from §A3 (which are **shared** vs **page-local**) and inline them into the prompt below. The external executor can't see the plan file, so you carry the slice in. You (orchestrator) own the plan and **sync its Part B** after the handoff returns (see Wrap-up).
- Read `../../rules/fidelity-gate.md` for the gate vocabulary the prompt must hand-shake with. (You don't need to re-read `fidelity-visual.md` — the prompt points the executor at it.)
- You may read `profile.mockup.spec` **only** to resolve the right spec section. Do not pull, build, or edit anything.

## What you do (produce a prompt; don't build)

1. **Pick the mode**: brand-new page → Template A; fix an existing page → Template B. If unclear which page, ask first.
2. **Resolve the spec section**: read the heading index of `profile.mockup.spec`, map the user's page to its section, fill `<spec-section>`. If you can't map it, keep a placeholder and ask the user to confirm.
3. **Fill from profile**: substitute every `{{profile.*}}` placeholder below with the real value from `./.claude/fidelity-profile.md`. Fill `<page-name>` / `<route>` from the user.
4. **Output**: put the filled prompt in a single fenced code block, verbatim, nothing extra around it.

> The prompt already tells the executor to pull the source, run the page with `{{profile.verify.runtime_tool}}`, do Loop Engineering, and run the gate. Do not add steps.

---

## Template A — reproduce a NEW page (fill the `<…>` and `{{profile.*}}`, then output)

```
Task: reproduce the oa-mockup "<page-name>" page 1:1 as a {{profile.framework}} page (route: <route>).

Before you start (don't work from memory):
1. Refresh the source: {{profile.mockup.refresh_cmd}}
2. Read {{profile.mockup.spec}} section "<spec-section>" + {{profile.mockup.token_source}} for the relevant tokens.
3. Open the render {{profile.mockup.render}} ({{profile.mockup.render_kind}}) and look at the RENDERED result — not just the spec text. When they disagree, the render wins.
4. The fidelity rules are the SoT: read fidelity-visual.md (the five disaster zones) and fidelity-gate.md (the gate).

Reproduction constraints (the five places 1:1 dies):
- Icons: named import from {{profile.icon_lib}} (source icon id kebab→Pascal); do NOT substitute a different icon family for app/nav glyphs. The library's own built-in glyphs stay native.
- Fonts: headings via {{profile.token_access}} (heading primitive / semantic tag) so they inherit the type ramp — never a bare div font-size.
- Generated visuals (charts/sparklines/gauges) IF the render has any: reproduce structure + token palette via {{profile.chart_lib}}; add no labels, don't re-palette or reshape.
- Hand-built containers: grep {{profile.mockup.styles}} for the class and copy the EXACT box-model — padding/gap/border/border-radius to value-equal tokens (look up the number in {{profile.token_sot}}; radius by VALUE not by name) or exact px; copy the DOM structure (don't turn inline text into display:flex; gap and add phantom spacing).
- Interactive states: reproduce hover/focus/active/disabled/transition/overlay-z from the source's state rules.
- Native-first: map the source's components to {{profile.ui_lib}} native components (see the project's component map); only hand-build what the library lacks.
- Component placement (from the build plan): SHARED for this page → <plan §A3 shared components this page uses> in {{profile.shared_components_dir}} (reuse if already built; otherwise build there — do NOT duplicate a planned-shared component). Page-local → <plan §A3 page-local components> in {{profile.page_components_pattern}}.
- Copy: reproduce verbatim in {{profile.copy_language}}{{ (route through i18n keys if profile.i18n) }}.

Done-definition (all required — you are the executor; the reviewer gate does NOT exempt this):
- {{profile.commands.lint}} + {{profile.commands.typecheck}} + {{profile.commands.test}} green (skip typecheck only if the profile marks it n/a).
- Runtime verify with {{profile.verify.runtime_tool}} (do NOT install a separate browser):
  • load your page: {{profile.verify.recipe.load}} ; {{profile.verify.recipe.screenshot}} to keep evidence.
  • box-model digits (catch 4–8px drift): {{profile.verify.recipe.box}} on your container — compare each value against what you grepped from {{profile.mockup.styles}}.
  • mockup side-by-side: compare at the same viewport ({{profile.mockup.mockup_serve_url}} or the source render).
  • interactive states: {{profile.verify.recipe.drive_state}} for hover/focus/open.
  • runtime health: {{profile.verify.recipe.console}} , {{profile.verify.recipe.network}} , {{profile.verify.recipe.responsive}} across {{profile.verify.viewports}}.
- Fix until visuals + numbers match and console/network are clean. Attach the screenshots + console/inspect results in your handoff notes.

Loop Engineering (one self-refactor pass after the done-definition is green, before review):
- Only after everything above is green. The first version just needs to run; this pass rewrites it to the simplest shape.
- You're authorized to fully refactor THIS slice, but "elegant" = simpler & more idiomatic to the project, not cleverer:
  • native-first: swap any hand-roll the library already has / drop pointless style wrappers → native + tokens.
  • tokens: stray hex / magic numbers → {{profile.token_sot}} tokens.
  • placement: page-specific stays in {{profile.page_components_pattern}}; promote to {{profile.shared_components_dir}} only on the 2nd use (AHA).
  • DRY but not over-abstract; clear any/unsafe casts/dead code; split an over-large file by responsibility.
- Iron rule: behavior + rendered result must NOT change. After refactoring, RE-RUN the entire done-definition. Stop when the next change is only speculative polish.

Submit: run the review gate (fidelity-review / {{profile.gate.reviewer_host}}) and paste its [P1]/[P2] back verbatim. Any [P1] → fix then re-review until Gate: PASS. Gate: PASS = done.
```

## Template B — FIX the current page (fill, then output)

```
Task: bring the current "<page-name>" page (<route>) to 1:1 with the mockup. The working tree may have uncommitted changes — understand the current state before editing.

Before you start:
1. {{profile.mockup.refresh_cmd}} ; read {{profile.mockup.spec}} section "<spec-section>" + {{profile.mockup.token_source}} tokens.
2. Open the render {{profile.mockup.render}} and your page ({{profile.commands.dev}} → {{profile.commands.dev_url}}<route>) side by side.
3. The SoT is fidelity-visual.md (five disaster zones) + fidelity-gate.md (gate).

What to do: align the rendered result block by block — icons ({{profile.icon_lib}}), heading fonts (via {{profile.token_access}}, not bare div), generated visuals (structure + token palette, no re-palette/extra labels), hand-built container box-model (grep {{profile.mockup.styles}} for the class; padding/gap/border/border-radius to value-equal tokens or exact px; copy DOM structure, inline stays inline), interactive states. First list every mismatch, then fix item by item. Component placement follows the build plan (§A3): shared → {{profile.shared_components_dir}} (reuse, don't duplicate); page-local → {{profile.page_components_pattern}}.

Done-definition (same as fidelity-gate.md; runtime via {{profile.verify.runtime_tool}}, no separate browser):
{{profile.commands.lint}} + {{profile.commands.typecheck}} + {{profile.commands.test}} green → {{profile.verify.recipe.load}} screenshot → mockup same-viewport side-by-side → box-model digits with {{profile.verify.recipe.box}} vs the values grepped from {{profile.mockup.styles}} (catch 4–8px drift) → drive states → {{profile.verify.recipe.console}} / {{profile.verify.recipe.network}} / {{profile.verify.recipe.responsive}} → attach evidence.

Loop Engineering (after the done-definition is green, before review): refactor this slice to the simplest shape — native-first (back to native + tokens), values → {{profile.token_sot}} tokens, AHA placement, DRY-not-over-abstract, clear any/casts/dead code, split over-large files. "Elegant" = simpler not cleverer. Iron rule: behavior + rendered result unchanged; re-run the entire done-definition. Stop when the next change is only speculative polish.

Submit: run the review gate (fidelity-review / {{profile.gate.reviewer_host}}), paste [P1]/[P2] back verbatim, fix any [P1] then re-review until Gate: PASS.
```

---

## Wrap-up (remind the user)
- After pasting to the executor, it should: **run the page → Loop Engineering self-refactor (re-verify) → run the gate** (all three are already in the prompt).
- On gate **FAIL**: hand the `[P1]` section back to the executor verbatim — "fix these [P1], touch nothing else, re-run the gate until Gate: PASS."
- `Gate: PASS` (no P1) = done. `[P2]` → follow-up, **unless it breaks the current UI goal** → promote to `[P1]` and fix now.
- **Sync the plan** (you own it; the executor built elsewhere): on `Gate: PASS`, update `.claude/fidelity-plan.md` Part B — page row, shared-component rows, verification log (from the executor's evidence), changelog, next slice; promote any component that hit its real 2nd use. (Skip if there is no plan.)
