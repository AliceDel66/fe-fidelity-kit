# Fidelity Profile — Nuxt 3 + Vue + Nuxt UI (framework-paradigm proof)

> A third, deliberately **non-React** stack — to prove the kit is *framework-paradigm*-neutral, not merely CSS-framework-neutral. The two React profiles already vary the CSS layer (emotion vs Tailwind); this one varies the **framework paradigm itself** (React → Vue) and the **icon paradigm**. The edges the schema must handle here:
>
> - **Cross-paradigm component map** — the source is React/shadcn, the target is Vue/Nuxt UI, so the map is a *real translation* (children → named slots, controlled props → `v-model`, `<Pascal>` → `<U…>`), **NOT** the *same-dialect collapse* the Vite/Radix example shows.
> - **Iconify icon paradigm** — Nuxt UI icons are *string names* (`i-lucide-bar-chart-3`), so Zone 1's algorithm flips to **"prefix `i-lucide-` + keep kebab"**, NOT the kebab→PascalCase *named import* both React profiles use. This is the proof that `profile.icon_lib` + the `## Icon map` can express an icon system that isn't import-based at all.

```yaml
profile_version: 1
generated_by: hand
generated_against:
  ui_lib: "@nuxt/ui@3"
  framework: "nuxt@3"

stack:
  framework: "Nuxt 3 (Nitro; file-based routing; components auto-imported by path)"
  ui_lib: "Nuxt UI v3 (built on Reka UI unstyled primitives + Tailwind v4)"
  styling: "Tailwind v4 utilities in the SFC <template>; <style scoped> only for hand-built bits"
  icon_lib: "Nuxt Icon (Iconify) — STRING names like i-lucide-*, not named imports"
  chart_lib: "(none — this app has no charts; Zone 3 skipped)"
  copy_language: "en"
  i18n: false

paths:
  import_alias: "~/* and @/* (both map to the Nuxt srcDir; ~~/ @@/ map to rootDir)"
  token_sot: "app.config.ts (ui.colors semantic→palette map + per-component defaults) + assets/css/main.css (@theme + the --ui-* CSS vars)"
  token_access: "Tailwind utility classes; raw tokens via var(--ui-primary) / var(--ui-bg) / var(--ui-text); component variants via color/variant/size props or the :ui per-slot prop"
  style_override_mechanism: "Nuxt UI :ui prop (per-slot class overrides) + class/:class BEFORE hand-wrapping; drop to the Reka UI unstyled primitive only if a slot can't get there"
  shared_components_dir: "app/components/"
  page_components_pattern: "app/pages/<route>/ (colocated) or app/components/<Route>/ (Nuxt auto-imports by path)"
  promote_to_shared_after_uses: 2

context:
  memory_backend: "builtin"
  memory_path: ".claude/fidelity-memory.md"
  memory_query: "(n/a)"
  harness_backend: "none"
  harness_artifact_root: "(n/a)"
  reuse_packet_limit: 5
  privacy: "memory is advisory; repo/mockup/render wins; never include secrets or private unrelated chat"

mockup:
  render: "../oa-mockup/index.html (static export of the design)"
  render_kind: "static-html"
  styles: "../oa-mockup/styles.css"
  token_source: "../oa-mockup/design-system.md"
  spec: "../oa-mockup/spec.md"
  # source is React/shadcn, target is Vue/Nuxt UI → CROSS-PARADIGM map (NOT same-dialect collapse; contrast the Vite/Radix example)
  dialect: "shadcn/ui (React; Tailwind + Radix vocabulary) — target paradigm differs"
  refresh_cmd: "git -C ../oa-mockup pull"
  mockup_serve_url: "http://localhost:4173"

commands:
  install: "pnpm install"
  dev: "pnpm dev"
  dev_url: "http://localhost:3000"
  lint: "pnpm lint"              # @nuxt/eslint
  typecheck: "pnpm nuxi typecheck"   # vue-tsc under the hood
  test: "pnpm vitest run"
  build: "pnpm build"           # nuxi build

verify:
  runtime_tool: "Playwright MCP"
  measure_capable: true         # Playwright getComputedStyle/boundingClientRect works on Vue-rendered DOM exactly the same — measurement is framework-agnostic
  state_drivable: true          # Playwright browser_hover / browser_click drives Zone-5 states, then screenshot
  viewports: ["1440x900", "375x812"]
  evidence_dir: ".claude/.fidelity-evidence/"
  recipe:
    load: "playwright: browser_navigate http://localhost:3000<route>"
    screenshot: "playwright: browser_take_screenshot"
    box: "playwright: browser_evaluate 'getComputedStyle($el)' / el.getBoundingClientRect()"
    console: "playwright: browser_console_messages (filter error)"
    network: "playwright: browser_network_requests (filter failed)"
    responsive: "playwright: browser_resize per viewport then screenshot"
    drive_state: "playwright: browser_hover / browser_click to open, then screenshot"

gate:
  reviewer_host: "Claude /fidelity-review; cross-model via codex-review; or same-model two-pass if no second host"
  reviewer_cmd:
    label: "Codex read-only review"
    cmd: "codex exec --skip-git-repo-check --sandbox read-only <prompt>"
    sandbox: "read-only"
    expected_tail: ["Gate:", "Recommendation:"]
    fallback: "Emit fidelity-page-handoff Template C prompt for manual paste"
  report_path: ".claude/review/report/<name>.md"
  p1_blocks: true
  p2_blocks_only_if_breaks_ui_goal: true
```

## Component map  (shadcn/React → Nuxt UI/Vue — CROSS-PARADIGM, a real translation)

> Unlike the Vite/Radix example (same dialect → near-identity), here the source vocabulary (React/shadcn) and the target (Vue/Nuxt UI) genuinely differ. The translation pattern: React **children** → Vue **named slots**; React **controlled props** (`open`/`onOpenChange`) → Vue **`v-model`**; `<PascalCase>` → `<U…>`. Token-by-value + box-model (Zone 4) still apply fully.

| source (shadcn / React) | target native (Nuxt UI / Vue) | notes |
|---|---|---|
| `<Button variant="destructive">` | `<UButton color="error" variant="solid">` | variant vocab differs: shadcn `destructive` → `color="error"` |
| `<Dialog>` (`open` / `onOpenChange`) | `<UModal v-model:open>` | controlled props → `v-model:open` |
| `<Tabs>` (child `<TabsTrigger>`) | `<UTabs :items>` | children → an `items` array |
| `<Card><CardHeader>…` | `<UCard>` + `#header` / `#footer` slots | React children → Vue **named slots** |
| `<Table>` | `<UTable :columns :data>` | columns/data props, not JSX rows |
| `<Select>` | `<USelect>` / `<USelectMenu :items>` | |
| `<Badge>` / `<Input>` | `<UBadge>` / `<UInput v-model>` | |
| `<Avatar>` / `<Tooltip>` | `<UAvatar>` / `<UTooltip>` | |
| `<Separator>` | `<USeparator>` | |
<!-- hand-built (no Nuxt UI native): stats card, approval-flow node, hero gradient → app/components/ or page-local -->

## Icon map  (★ the paradigm flip — Iconify string names, NOT named imports)

- Source (shadcn) uses lucide **named imports**: `import { BarChart3 } from 'lucide-react'` → `<BarChart3 class="size-4" />`.
- Target (Nuxt UI / Nuxt Icon) uses **Iconify string names**, so the algorithm is **NOT** kebab→Pascal — it is **`i-lucide-` prefix + keep the kebab id**:
  - `data-lucide="bar-chart-3"` (or `<BarChart3 />`) → `<UIcon name="i-lucide-bar-chart-3" />`, and on a slot prop: `<UButton icon="i-lucide-plus">`.
- size/color: Tailwind on the icon (`size-4`, `text-(--ui-primary)`) or `currentColor` — same concept as the React stacks, different syntax.
- Same set both sides (lucide ↔ lucide via Iconify) → algorithmic, no table. Different sets → record exceptions here.
- ❌ never swap the icon family for app/nav glyphs. ✅ Nuxt UI's own built-in glyphs (USelect chevron, UModal ✕) stay native.

## Token traps (by VALUE, never by NAME)

- shadcn `--radius-md: 8px` → confirm the **8px** binding in Nuxt UI's `--ui-radius` scale / Tailwind `rounded-lg` (=0.5rem=8px) — **not** the utility merely named "md". Check the px in `main.css` first.
- shadcn primary (Indigo-600) → `app.config.ts` `ui.colors.primary: 'indigo'`; confirm `var(--ui-primary)` actually resolves to Indigo-600, not a neighboring shade.
- shadcn `--border: #e2e8f0` → the Tailwind/`--ui` color whose value **equals** `#e2e8f0` (slate-200), bound by value.

## Project notes

- **Cross-paradigm, NOT same-dialect collapse**: the source is React/shadcn, the target is Vue/Nuxt UI — translate the vocabulary (children→slots, controlled props→`v-model`); do not copy JSX shape verbatim.
- **Icon paradigm flip (Z1)**: Iconify string names — algorithm is `i-lucide-` + kebab, not kebab→Pascal. The single most "non-React" thing to get right.
- **Headings (Z2)**: no AntD-style `Typography.Title` primitive — render headings through semantic `<h1>`–`<h4>` + the type-ramp tokens (Tailwind `text-*` / `var(--ui-text)`); never a bare `<div>` font-size.
- **Zone 4 in an SFC**: hand-built containers live in the `<template>` (Tailwind utilities; write exact px as `p-[14px]` when no token matches) or `<style scoped>` — grep `../oa-mockup/styles.css` and align digit-by-digit exactly as on the React stacks.
- **File-based routing + auto-import**: pages under `app/pages/<route>/`; components under `app/components/` are auto-imported by path — placement follows the Nuxt convention, no manual import wiring.
- **measure_capable stays true**: Playwright measures Vue-rendered DOM identically — the gate's box-model verification is framework-agnostic.
