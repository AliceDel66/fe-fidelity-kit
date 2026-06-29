---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.vue"
  - "**/*.svelte"
description: Stack-neutral discipline for reproducing a design mockup at 1:1 fidelity. Bindings live in .claude/fidelity-profile.md.
---

# Visual Fidelity: reproduce the mockup at 1:1

> The stack-neutral core of fe-fidelity-kit. Every concrete name below tagged **(illustrative, reference stack = Next 16 + AntD v6 + emotion + lucide)** is an example — the real binding comes from `profile.<field>` in `./.claude/fidelity-profile.md`. The numbers and named traps are kept verbatim on purpose: genericizing must not sand off the sharp edges.

## 0. Load context first (two anchors)

- **Profile = relative to the project root**: read `./.claude/fidelity-profile.md`. If it is missing, **stop** and run the `fidelity-adopt` skill — do not guess the stack.
- **Rules = relative to this file**: this file is `fidelity-visual.md`; its sibling is `fidelity-gate.md`.
- Any `profile.X` reference below resolves against the profile's YAML block or its markdown maps.

## 1. First principle: the RENDERED output is visual truth, not the spec text

The single most common way reproduction goes wrong: reading the spec/ticket text and **腦補 (imagining)** the result instead of looking at what the source actually renders. So:

- Open the **render** (`profile.mockup.render`, kind = `profile.mockup.render_kind`) and look at it. A spec doc (`profile.mockup.spec`) is secondary — when spec text and the render disagree, **the render wins**.
- Pull the latest source before starting (`profile.mockup.refresh_cmd` if the source is a repo, e.g. *(illustrative)* `git -C ../oa-mockup pull`).
- **Capability ladder** by `render_kind` — how strong your verification can be:
  | render_kind | render is… | box-model measurable? |
  |---|---|---|
  | `static-html` / `preview-url` / `storybook` | loadable in a browser | ✅ full (`getComputedStyle` on both sides) |
  | `figma-inspect` | inspectable, not a live DOM | ⚠️ source measured by hand from Figma inspect, target by tool |
  | `screenshots` | pixels only | ❌ degraded — measure target only, eyeball the source; gate is capped (see `fidelity-gate.md`) |
- **Two runtime capabilities, orthogonal.** The render_kind ladder above gauges **box-model measurability** (`profile.verify.measure_capable`, Zone 4). Whether the tool can **drive interactive states** (`profile.verify.state_drivable`, Zone 5) is a *separate* axis — a tool can measure `getComputedStyle` yet never fire `:hover` / `:focus` (e.g. a static preview). Either one being false caps the gate; see `fidelity-gate.md`.

## 2. The five disaster zones

These are where 1:1 reproduction dies. Zones 1–3 are "swapped the wrong thing"; zone 4 is "looks right, off by 4–8px" (the most insidious); zone 5 is "looks right, behaves wrong" (invisible in one static screenshot).

### Zone 1 — Icons: use the SOURCE's icon set, never re-draw

The mockup is built on a specific icon set (`profile.icon_lib` on the target side; the source declares its own, e.g. *(illustrative)* `data-lucide="..."` attributes). To be 1:1, use the same set.

- **Same set both sides → algorithmic, no lookup table.** Convert the source's icon id to the target's named import. *(illustrative: `data-lucide="bar-chart-3"` → `import { BarChart3 } from 'lucide-react'`, kebab→PascalCase.)* The general rule: `<source-icon-id>` → named import from `profile.icon_lib` using the profile's `## Icon map` naming rule (default kebab→Pascal).
- **Different sets → genuine lookup.** Record each mapping in the profile's `## Icon map` as you hit it (grown by `fidelity-build-from-mockup`'s discover-and-extend). Never invent a one-to-one mapping silently.
- **size**: read it from the render, do not guess. *(illustrative defaults: nav 18 / button 16 / large 20.)* color: inherit via `currentColor` so the parent's token color flows in — don't hardcode.
- **Exception**: a UI-library component's OWN built-in glyphs (Select chevron, Modal close ✕, checkbox tick, Table sort arrows) stay native — don't swap those.
- ❌ Never substitute a different icon family (e.g. *(illustrative)* `@ant-design/icons` for a lucide mockup) — different glyph geometry never aligns.

### Zone 2 — Fonts: use the type ramp / semantic headings, never a bare `div` font-size

The mockup's type scale (sizes, weights, families — `profile.mockup.token_source` §typography) is wired into the target via `profile.token_sot`. But you only inherit it if you use the **right element / accessor** (`profile.token_access`).

- **Headings** → the target's heading primitive or semantic tag. *(illustrative: AntD `<Typography.Title level={n}>` or an `<h1..h4>` that picks up the Inter Tight + heading tokens.)* Generic form: render headings through `profile.token_access` so they inherit the type ramp, not a hand-set px.
- **Body / caption** → the corresponding text primitive at the mapped scale step. *(illustrative type ramp, reference stack: h1 48 / h2 30 / h3 24 / h4 20 / body 16 / small 14 / mini 12; headings weight 600 — your project's ramp lives in `profile.mockup.token_source`.)*
- **Large numeric / display text** (e.g. *(illustrative)* `NT$4,280`) → if the mockup uses a display family, apply the matching heading level / display token, not just `bold`.
- ❌ Never set a heading with a bare `<div style={{ fontSize }}>` or a hardcoded px in CSS-in-JS — it falls back to the body/system font and looks "completely different" from the original.

### Zone 3 — Generated zero-semantic visuals (charts, sparklines, gauges, canvas): reproduce STRUCTURE + palette-by-token, add nothing

> Generalized from "charts". **Existence-conditional: only applies if the render actually contains one.** Skip if the page has none.

These are visuals with no inherent semantic element to lean on — you build them. The mockup usually draws them a specific way (often *(illustrative)* plain CSS bars with token colors `var(--primary)` / `var(--brand-violet)`).

- **Read how the mockup draws it first**: shape (radius, solid vs split), which element is highlighted, presence/absence of value labels, spacing. Reproduce that structure.
- Colors go through tokens (`profile.token_access`), via `profile.chart_lib` if one is configured.
- ❌ Don't add value labels the mockup lacks, don't re-palette to greyscale, don't change a flat bar into a two-stop gradient. If you use a chart library, **tune it to match** (token fills, matched radius, hide default grid/axis/tooltip down to what the mockup shows) — never ship library defaults.

### Zone 4 — ★ Container box-model: read the mockup's EXACT box-model, don't eyeball

Self-built containers (cards, panels — anything with **no** native equivalent in `profile.ui_lib`, that you hand-write in `profile.styling`) are where "looks right, actually off by 4–8px" lives. Root cause: approximating from a screenshot, or re-arranging the DOM. **The method is "measure", not "look":**

1. **Find the mockup's class and read its CSS rule** (grep `profile.mockup.styles` for the class), copy the box-model field by field: `padding` / `gap` / `margin` / `border` (width+color) / `border-radius` / `line-height` / each child's `font-size`. *(Inline-single-file source — a design-to-code export with no separate stylesheet: there is no class rule to grep; the box-model sits on each element's `style="…"`. Read the values straight off the element in `profile.mockup.styles`, same field by field.)*
2. **Map by VALUE, never by token NAME.** This is a procedure, not a lookup:
   - color / border-color / shadow → the token whose **value equals** the mockup's. *(illustrative: mockup `--card-border:#e2e8f0` = `colorBorderSecondary`.)*
   - **`border-radius` → the token whose NUMBER matches.** ⚠️ The classic trap: mockup `--radius-md: 8px` must bind to the token that **is 8** *(illustrative: `borderRadiusLG`)* — **NOT** the token that's merely *named* "md" *(illustrative: `borderRadius` = 6 in the reference stack)*. **Look up the actual number in `profile.token_sot` before choosing.**
   - `padding` / `gap` / `margin` / width / height → write the **exact px** (raw pixel values are allowed; only color/radius/shadow must be tokens).
3. **Copy the DOM structure too — changing structure changes spacing.**
   - Real bug (verbatim): a mockup `.dash-stat-value.lg` is **pure inline text** `NT$ 12,450<span>K</span>` (no flex, no gap — number and unit **touch**: `12,450K`). Reimplementing it as `display:flex; gap:4px` yields `12,450 ⎵ K` — an extra, barely-visible 4px. That is no longer 1:1. If it's inline, reproduce it inline.
4. ❌ Don't eyeball padding/height from a screenshot. ❌ Don't turn inline text into a flex row (phantom gap). ❌ Don't hardcode `height` — a container's height is `padding + children line-height`; get padding and type right and the height falls out.

> One line: for a self-built container, `grep` the mockup's class to copy every value, drop each onto a value-equal token / exact px, then verify with computed-style numbers (§4 of the gate), not stacked screenshots.

### Zone 5 — Interactive / stateful affordances: drive the states, don't trust the default shot

Hover / focus / active / disabled, transitions, and overlay z-index / stacking are fully cross-stack, and **invisible in a single default-state screenshot** — a classic "looks right, behaves wrong."

- Reproduce each interactive state the mockup defines (read `profile.mockup.styles` for `:hover` / `:focus` / `:active` / `[disabled]` / `.is-open` rules), including transition duration/easing (token via `profile.token_access` where available).
- Overlay layers (modal / drawer / popover / toast) must match the mockup's stacking order — bind z-index to tokens if the project has a z-scale (`profile.token_sot`).
- Verification means **driving the state** in the runtime tool (hover, focus, open), not just capturing the resting state. *(If `profile.verify.state_drivable: false` — the tool can't fire these — reproduce each state from the source's rules and confirm the state classes/handlers in code, but the gate carries `interaction UNDRIVEN` per `fidelity-gate.md`; never claim a driven state you couldn't actually fire.)*

## 3. Native-component-first (don't re-implement what the library already has)

Universal **method** (the per-(dialect→ui_lib) **table** lives in `profile`'s `## Component map`):

1. **Does `profile.ui_lib` already have this component?** Button / Table / Form / Modal / Drawer / Select / Tabs / Accordion / Tooltip / Badge / Tag / Steps / Upload / Pagination / Spin / Skeleton / Empty / notification… → use it.
2. **Can native props get there?** Try `size` / `type` / `variant` / `status` / `disabled` / slot/`styles`/`classNames` props first. Stop if they do.
3. **Native can't, need style overrides?** Prefer the library's component-level style slot (`profile.style_override_mechanism`) before hand-wrapping.
4. **Library genuinely lacks it AND it's specific to this design language** (e.g. *(illustrative)* a stats card, an approval-flow node, a hero gradient) → hand-build in `profile.styling`, place per §4 below.

- **Same-dialect collapse**: when the source's dialect (`profile.mockup.dialect`) equals the target library's vocabulary, the map is **near-identity** — don't invent needless re-mappings. Token-by-value (Zone 4) and box-model checks still apply fully.
- **discover-and-extend**: before coding a page, scan the render for components not yet in `profile`'s `## Component map`; resolve each to its `profile.ui_lib` native equivalent (consult the library's docs) and **append a row**. The map is a living, reused artifact — never an exhaustive upfront dump.

## 4. Component placement (AHA) — principle universal, paths bound

- **Page-specific** component → `profile.page_components_pattern` *(illustrative: `app/<route>/_components/Xxx`)*.
- **Shared** component → `profile.shared_components_dir` *(illustrative: `components/Xxx`)*, but **only promote on the Nth use** (`profile.promote_to_shared_after_uses`, default **2**) — don't pre-generalize (AHA).
- Default placement is page-specific; lift to shared the first time a **second** page needs it.
- **The plan settles this up front (not in tension with AHA).** `fidelity-plan` surveys every page once and records the shared/page-local split in `.claude/fidelity-plan.md` §A3 — classified by **observed** cross-page usage (≥ `profile.promote_to_shared_after_uses` pages) or a cross-module invariant, never speculation. That is AHA applied by survey (the Nth use is *detected* up front), not pre-generalization. Build skills follow §A3 and still promote a page-local component the moment its real 2nd use appears.

## 5. Copy / language — principle universal, specifics bound

- **Reproduce the copy verbatim** from the render. Don't translate, localize, or rewrite unless told.
- The concrete language and whether to route through i18n keys vs literals is `profile.copy_language` / `profile.i18n`. *(illustrative: zh-TW, no i18n → literal 繁中 strings.)*

## 6. Done means it passed BOTH gates (see fidelity-gate.md)

Reproduction is **not** "wrote the code." It must clear:
- **Runtime verification by the executor** (run the page, measure the box-model, drive states, check console/network/responsive) — the precondition.
- **Static review by the reviewer** (`fidelity-review` command) — the style-match + behavior gate.

Pre-completion check, on a measurable `render_kind`:
0. **Runtime preflight first** (see `fidelity-gate.md` §4): the tool is anchored at *this* project (not the session cwd), the page/mockup actually render, and `measure_capable` / `state_drivable` are known. A failed precondition is a stop, not a finding — evidence captured against the wrong target is worse than none.
1. Load your page and the mockup region at the **same viewport, 100% zoom** (different zoom misreads heights/spacing).
2. Compare item by item: icons (same set / size / color), fonts (heading ramp inherited, not bare px), generated visuals (palette / shape / no extra elements), spacing / radius / shadow, **and interactive states**.
3. **Box-model numbers**: pull your component's computed `padding` / `gap` / `border` / `border-radius` / `font-size` (via `profile.verify.recipe.box`) and compare **digit by digit** against the values you grepped from the mockup — catch the 4–8px drift screenshots hide.
4. Fix until they match before claiming done. (On a non-measurable `render_kind`, fall back to `token_source` + the mockup's CSS values item by item — but runtime health, console, responsive still must be actually run.)
