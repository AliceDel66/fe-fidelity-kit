# Fidelity Profile — TEMPLATE

> **This is the template, not a live profile. Runtime never reads this file.**
> `fidelity-adopt` copies this into the target project as `./.claude/fidelity-profile.md` and fills it in.
> To fill by hand: replace every `FILL:` / `TODO(adopt:…)`, delete the `# guidance` comments, keep the section headings.
> All `profile.X` references in the kit's rules/skills/commands resolve against the YAML block + the markdown maps below.
> Reference convention: a **distinctive** leaf is written **bare** (`profile.token_sot`, `profile.ui_lib`, `profile.page_components_pattern`); a **generic** leaf keeps its **section prefix** (`profile.commands.lint`, `profile.verify.recipe.box`, `profile.mockup.styles`, `profile.gate.reviewer_host`).

```yaml
profile_version: 1
generated_by: hand            # or fidelity-adopt@<version>
generated_against:            # version stamp → skills warn on major drift (e.g. ui_lib v6 → v7)
  ui_lib: "FILL: e.g. antd@6"
  framework: "FILL: e.g. next@16"

stack:
  framework: "FILL: e.g. Next.js 16 (App Router) | Vite + React Router 7 | Remix | Astro | Nuxt"
  ui_lib: "FILL: component library, e.g. Ant Design v6 | MUI v6 | Radix primitives | Chakra | (none)"
  styling: "FILL: e.g. emotion + antd-style | Tailwind | styled-components | CSS Modules | vanilla-extract"
  icon_lib: "FILL: target icon package, e.g. lucide-react | @ant-design/icons | react-icons/*"
  chart_lib: "FILL: e.g. Recharts | visx | CSS-only | (none — page has no charts)"
  copy_language: "FILL: verbatim copy language, e.g. zh-TW | en | ja"
  i18n: false                 # true → reproduce copy via i18n keys, not literals

paths:
  import_alias: "FILL: e.g. @/* (maps to project root) | ~/* | src/*"
  token_sot: "FILL: in-code design-token source of truth, e.g. constants/theme.ts | tailwind.config.ts + tokens.css"
  token_access: "FILL: HOW a component reads a token, e.g. antd theme.useToken() + theme.ts exports | Tailwind classes / var(--x) | useTheme()"
  style_override_mechanism: "FILL: component-level style slot before hand-wrapping, e.g. AntD styles/classNames props | Tailwind className | (n/a)"
  shared_components_dir: "FILL: e.g. components/ | src/components/"
  page_components_pattern: "FILL: e.g. app/<route>/_components/ | src/routes/<route>/components/"
  promote_to_shared_after_uses: 2          # AHA threshold: lift page-local → shared on the Nth use

mockup:                       # the design SOURCE described by ROLE, not by a fixed repo shape
  render: "FILL: the loadable/inspectable visual truth, e.g. ../oa-mockup/index.html | http://localhost:4173 | figma-inspect-url"
  render_kind: "FILL: static-html | preview-url | storybook | figma-inspect | screenshots"
  styles: "FILL: where the source's exact CSS lives to grep box-model, e.g. ../oa-mockup/styles.css | (n/a for figma)"
  token_source: "FILL: source design-system / tokens, e.g. ../oa-mockup/design-system.md | Figma Variables export | tokens.json"
  spec: "FILL (optional; render dominates spec): ../oa-mockup/spec.md | Linear ticket | Figma frame notes"
  dialect: "FILL: the source's component vocabulary, e.g. shadcn/ui | Material | custom | unknown(discover from render)"
  refresh_cmd: "FILL (if source is a repo): e.g. git -C ../oa-mockup pull | (n/a)"
  mockup_serve_url: "FILL (if applicable): URL the rendered mockup is served at for side-by-side, e.g. http://localhost:4173"

commands:
  install: "FILL: e.g. pnpm install"
  dev: "FILL: e.g. pnpm dev"
  dev_url: "FILL: e.g. http://localhost:3000"
  lint: "FILL: e.g. pnpm lint"
  typecheck: "FILL: e.g. pnpm tsc --noEmit | (n/a) for a plain-JS project — done-definition then skips it"
  test: "FILL: run-once test cmd, e.g. pnpm test:run | vitest run"
  build: "FILL: e.g. pnpm build"

verify:
  runtime_tool: "FILL: the browser driver, e.g. gstack browse skill | Playwright MCP | (none)"
  measure_capable: true       # CAN it return getComputedStyle / getBoundingClientRect? false → gate capped to visual-only (see fidelity-gate.md)
  viewports: ["1440x900", "375x812"]   # FILL: viewports to verify
  evidence_dir: ".claude/.fidelity-evidence/"
  recipe:                     # HOW to run each measurement with runtime_tool (stack-neutral rule says WHAT, this says HOW)
    load: "FILL: e.g. browse goto <url>"
    screenshot: "FILL: e.g. browse screenshot <path>"
    box: "FILL: computed box-model, e.g. browse inspect '<sel>' | browse css '<sel>' <prop>"
    console: "FILL: e.g. browse console --errors"
    network: "FILL: e.g. browse network"
    responsive: "FILL: e.g. browse responsive <path>"
    drive_state: "FILL (optional): how to hover/focus/open for Zone-5 states, e.g. browse hover '<sel>'"

gate:
  reviewer_host: "FILL: who reviews, e.g. Claude /fidelity-review | repo-harness claude-review | same-model-two-pass"
  report_path: "FILL: e.g. .claude/review/report/<name>.md | stdout"
  p1_blocks: true
  p2_blocks_only_if_breaks_ui_goal: true
```

## Component map  (source dialect → target native)   [seeded by adopt, grows via discover-and-extend]

> Fill the first time a page uses an unmapped component. Same-dialect (source == ui_lib vocabulary) → near-identity, leave thin.

| source (`mockup.dialect`) | target native (`stack.ui_lib`) | notes |
|---|---|---|
| FILL: e.g. Button variant=default | FILL: e.g. `<Button type="primary">` | |
| FILL: e.g. Dialog | FILL: e.g. `<Modal>` | |
| FILL: e.g. Card / CardHeader / CardContent | FILL: e.g. `<Card>` + header/body slots | reuse slots, don't rebuild |
<!-- append a row the first time you meet an unmapped component -->

## Icon map

- **Same set both sides** → ALGORITHMIC, no table: `<source-icon-id>` (kebab) → named import from `stack.icon_lib` (kebab→Pascal). e.g. `data-lucide="arrow-right"` → `import { ArrowRight }`.
- size/color: read computed from the render; never guess. color inherits via `currentColor`.
- **Different sets / renamed / missing** → record EXCEPTIONS only here:
  | source id | target import | note |
  |---|---|---|
  | FILL (only if sets differ) | | |

## Token traps (by VALUE, never by NAME)   [grows as discovered]

> A token bound by name instead of value. Record each resolved value-match and each trap you hit.

- e.g. source `--radius-md: 8px` → bind to the token that **is 8** (not the one merely *named* "md"). Look up the number in `token_sot` first.
- FILL: <add each value-match + trap as you resolve it>

## Project notes

- FILL: e.g. copy reproduced verbatim from the render; any project-specific reproduction gotchas; out-of-scope areas.
