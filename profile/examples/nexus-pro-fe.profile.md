# Fidelity Profile — nexus-pro-fe (reference stack, filled)

> The canonical filled profile: Next 16 App Router + AntD v6 + emotion/antd-style + lucide-react.
> Doubles as a worked example AND a drop-in for the nexus-pro-fe project itself (copy to `nexus-pro-fe/.claude/fidelity-profile.md`).

```yaml
profile_version: 1
generated_by: hand
generated_against:
  ui_lib: "antd@6"
  framework: "next@16"

stack:
  framework: "Next.js 16 (App Router, root-level app/, no src/)"
  ui_lib: "Ant Design v6"
  styling: "emotion + antd-style (setupStyled bridges AntD ThemeContext into styled)"
  icon_lib: "lucide-react"
  chart_lib: "Recharts (mockup mostly CSS bars — match structure, not Recharts defaults)"
  copy_language: "zh-TW"
  i18n: false                 # hardcode 繁中 literals

paths:
  import_alias: "@/* (maps to PROJECT ROOT, not src/)"
  token_sot: "constants/theme.ts (lightToken/darkToken + lightCustomToken/darkCustomToken + getAntdTheme/getCustomToken); customToken types in types/antd-style.d.ts"
  token_access: "emotion styled reads ({ theme }) => theme.colorPrimary etc; AntD-internal needs useTheme(); customToken is NOT emitted as CSS var (var(--ant-*) is design-token only)"
  style_override_mechanism: "AntD v6 styles={{…}} / classNames props first; then styled(AntdComp); avoid wrapping just to recolor — use tokens"
  shared_components_dir: "components/"
  page_components_pattern: "app/<route>/_components/"
  promote_to_shared_after_uses: 2

mockup:
  render: "../oa-mockup/index.html (switch to the target view)"
  render_kind: "static-html"
  styles: "../oa-mockup/styles.css"
  token_source: "../oa-mockup/design-system.md"
  spec: "../oa-mockup/spec.md"
  dialect: "shadcn/ui (Indigo-600 primary, Inter / Inter Tight)"
  refresh_cmd: "git -C ../oa-mockup pull"
  mockup_serve_url: "http://localhost:4173"

commands:
  install: "pnpm install"
  dev: "pnpm dev"
  dev_url: "http://localhost:3000"
  lint: "pnpm lint"
  typecheck: "pnpm tsc --noEmit"
  test: "pnpm test:run"
  build: "pnpm build"     # run after touching theme/cssVar/StyleRegistry/layout — SSR hydration is sensitive

verify:
  runtime_tool: "gstack browse skill (shared headless Chromium; do NOT install Playwright/puppeteer)"
  measure_capable: true
  viewports: ["1440x900", "375x812"]
  evidence_dir: ".claude/.fidelity-evidence/"
  recipe:
    load: "browse goto http://localhost:3000<route>"
    screenshot: "browse screenshot /tmp/<name>.png"
    box: "browse inspect '<sel>'   # full box model + computed; or: browse css '<sel>' <prop>"
    console: "browse console --errors"
    network: "browse network"
    responsive: "browse responsive /tmp/<name>"
    drive_state: "browse hover '<sel>'   # plus focus/open as needed"

gate:
  reviewer_host: "Claude /code-review (project) or fe-fidelity-kit /fidelity-review; cross-model via repo-harness claude-review"
  report_path: ".claude/review/report/<YYYY-MM-DD-kebab>.md"
  p1_blocks: true
  p2_blocks_only_if_breaks_ui_goal: true
```

## Component map  (shadcn → AntD v6)

| source (shadcn) | target native (AntD v6) | notes |
|---|---|---|
| Button / Icon Button / Ghost | `<Button type/variant/danger/icon>` | |
| Tabs (underline) | `<Tabs items>` | |
| Accordion | `<Collapse>` | |
| Resizable Panels | `<Splitter>` | |
| Data Table | `<Table columns dataSource>` | |
| Select / Date Range | `<Select>` / `<DatePicker.RangePicker>` | |
| Badge / Tag / pill | `<Badge>` / `<Tag>` | |
| Item (row) | `<List>/<List.Item>` or hand-built `_components` | |
| Card | `<Card>` or design-specific hand-built card | |
| Avatar / Modal | `<Avatar>` / `<Modal>` | |
| Empty / Spinner / Skeleton | `<Empty>` / `<Spin>` / `<Skeleton>` | |
| Separator | `<Divider>` | |
| Toast / notification | AntD `notification` / `message` (static API; deprecation warning accepted) | |
<!-- hand-built (no AntD native): StatsCard, approval-flow node, hero gradient, chat input → _components/ -->

## Icon map

- Same set (lucide ↔ lucide-react) → ALGORITHMIC: `data-lucide="bar-chart-3"` → `import { BarChart3 } from 'lucide-react'` (kebab→Pascal).
- size: nav 18 / button 16 / large 20. color: `currentColor` (active = colorPrimary, default = colorTextSecondary). strokeWidth 2.
- Exceptions (renamed/missing): none — same set.
- ❌ never `@ant-design/icons` for app/nav glyphs. ✅ AntD's own built-in glyphs (Select chevron, Modal ✕, sort arrows) stay native.

## Token traps (by VALUE, never by NAME)

- `--radius-md: 8px` → `borderRadiusLG` (=8), **NOT** `borderRadius` (=6) despite the "md" name. Check the number in constants/theme.ts first.
- mockup `--card-border: #e2e8f0` → `colorBorderSecondary` (value-equal).
- mockup "selected light violet" → check `colorPrimaryBg` (design token) before falling back to a customToken.

## Project notes

- Real box-model trap: `.dash-stat-value.lg` is pure inline text `NT$ 12,450<span>K</span>` (touching `12,450K`). Don't make it `display:flex; gap` (phantom 4px).
- Don't add a theme toggle UI (light/dark tokens exist, fixed light for now).
- Don't wrap an extra ConfigProvider outside Providers (antd-style ThemeProvider already includes it).
- Comments: no Simplified Chinese (use 繁中 or English).
