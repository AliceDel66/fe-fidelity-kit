# Fidelity Profile — React + Tailwind + Radix + Vite (genericity proof)

> A second, deliberately different stack to prove the kit is not AntD-shaped. Surfaces two edges the schema must handle: **same-dialect collapse** (source dialect == target vocabulary → component map ≈ identity) and **figma-inspect render** (no live DOM → degraded-but-still-measurable verify).

```yaml
profile_version: 1
generated_by: hand
generated_against:
  ui_lib: "radix-ui@1"
  framework: "vite@6"

stack:
  framework: "Vite 6 + React 19 + React Router 7"
  ui_lib: "Radix UI primitives (unstyled) — styling is yours"
  styling: "Tailwind CSS v4"
  icon_lib: "lucide-react"
  chart_lib: "(none — this app has no charts; Zone 3 skipped)"
  copy_language: "en"
  i18n: true                  # react-intl — reproduce copy via message keys, not literals

paths:
  import_alias: "~/* (maps to src/)"
  token_sot: "tailwind.config.ts (theme.extend) + src/styles/tokens.css (CSS custom props)"
  token_access: "Tailwind utility classes; raw values via var(--token) in arbitrary values"
  style_override_mechanism: "Tailwind className on the Radix primitive (Radix is unstyled)"
  shared_components_dir: "src/components/"
  page_components_pattern: "src/routes/<route>/components/"
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
  render: "https://www.figma.com/file/<id>?node-id=<frame> (Dev Mode inspect)"
  render_kind: "figma-inspect"
  styles: "(n/a — no CSS file; read box-model from Figma inspect panel)"
  token_source: "Figma Variables export → src/styles/tokens.json"
  spec: "Linear ticket NEX-1234"
  dialect: "shadcn/ui (Tailwind + Radix)"     # SAME vocabulary as target → map ≈ identity
  refresh_cmd: "(n/a — Figma is the live source)"
  mockup_serve_url: "(n/a — compare against Figma frame screenshots)"

commands:
  install: "npm install"
  dev: "npm run dev"
  dev_url: "http://localhost:5173"
  lint: "npm run lint"
  typecheck: "npm run typecheck"
  test: "vitest run"
  build: "vite build"

verify:
  runtime_tool: "Playwright MCP"
  measure_capable: true       # Playwright can getComputedStyle/boundingClientRect on the TARGET; SOURCE (Figma) is measured by hand from inspect → partial-degrade
  state_drivable: true        # Playwright browser_hover / browser_click drives Zone-5 states on the target (Figma source has no live states to drive)
  viewports: ["1280x800", "390x844"]
  evidence_dir: ".claude/.fidelity-evidence/"
  recipe:
    load: "playwright: browser_navigate <url>"
    screenshot: "playwright: browser_take_screenshot"
    box: "playwright: browser_evaluate 'getComputedStyle($el)' / 'el.getBoundingClientRect()'"
    console: "playwright: browser_console_messages (filter error)"
    network: "playwright: browser_network_requests (filter failed)"
    responsive: "playwright: browser_resize then screenshot per viewport"
    drive_state: "playwright: browser_hover / browser_click to open, then screenshot"

gate:
  reviewer_host: "Claude /fidelity-review; or same-model two-pass if no second host"
  reviewer_cmd:
    label: "(n/a)"
    cmd: "(n/a)"
    sandbox: "(n/a)"
    expected_tail: ["Gate:", "Recommendation:"]
    fallback: "Emit fidelity-page-handoff Template C prompt for manual paste"
  report_path: ".claude/review/report/<name>.md"
  p1_blocks: true
  p2_blocks_only_if_breaks_ui_goal: true
```

## Component map  (shadcn → Radix + Tailwind)

> **Same-dialect collapse**: the source IS shadcn (Radix + Tailwind), so this is near-identity — copy the shadcn component as-is. Keep this table thin; do NOT invent re-mappings. Token-by-value + box-model (Zone 4) still apply fully.

| source (shadcn) | target native | notes |
|---|---|---|
| Dialog | Radix `Dialog` (shadcn copy) | identity |
| Tabs | Radix `Tabs` | identity |
| Button | shadcn `Button` (cva variants) | identity |
<!-- near-identity; add a row only if the source uses something not yet in the project -->

## Icon map

- Same set (lucide ↔ lucide-react) → ALGORITHMIC (kebab→Pascal). Exceptions: none.

## Token traps (by VALUE, never by NAME)

- Figma var `radius/md = 8` → Tailwind `rounded-lg` (=0.5rem=8px), NOT `rounded-md` (=6px) if the project's scale differs. Confirm the px in tokens.css before choosing a utility.
- Figma `border/subtle = #e2e8f0` → `border-slate-200` only if that's the configured value; otherwise `border-[var(--border-subtle)]`.

## Project notes

- **Tailwind JIT only sees complete class literals.** A *dynamically assembled* arbitrary value — `shadow-[${x}]`, `text-[${n}px]`, `bg-${c}-500` — is never generated (the scanner sees the template literal, not the resolved class), so the style silently vanishes with no error. Put the WHOLE class in the data (`shadow: 'shadow-[0_30px_60px_rgba(0,0,0,0.5)]'` — string literals in an array/map ARE scanned) or move the dynamic value to inline `style`. Bites hardest in Zone 4, where exact px are written as arbitrary values.
- **`border` is 1px; `border-transparent` ≠ `border:none`.** The `border` utility sets `border-width:1px`, and `border-transparent` keeps that 1px border (just makes it see-through) — it is NOT `border:none`. Put `border` on a shared/base class and vary only the color per variant (`border-transparent` vs `border-white/20`) and you silently add a 1px border everywhere the mockup is `border:none`; under `box-sizing:border-box` an auto-width element then renders ~2px wider/taller — invisible (transparent) yet a real Zone-4 drift. If the mockup is `border:none`, omit the utility; add `border` only on the variants that actually have one. Surfaced by the image-plus / PicPop dogfood — a cross-model Codex review flagged it `[P1]` where the single-model pass had rated Zone 4 PASS.
- render_kind = figma-inspect: measure the SOURCE box-model by hand from Figma Dev Mode (px shown in inspect), measure the TARGET via Playwright getComputedStyle, compare digit-by-digit. measure_capable stays true (target is measurable) but source side is manual — note any uncertainty in the gate.
- i18n true: reproduce copy as message keys (react-intl), not literal English strings.
