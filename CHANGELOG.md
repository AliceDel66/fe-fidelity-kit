# Changelog

All notable changes to **fe-fidelity-kit** are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project aims at [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Repository self-check** `scripts/verify-kit.mjs` (zero-dependency) plus a GitHub Actions workflow — validates the manifest dirs/components, that cross-references resolve from their own location, the **profile field contract** (every `profile.*` the rules/skills cite is defined in the template), bilingual README heading symmetry, and that examples carry no unfilled `FILL:`. Fills the gap that `fidelity-adopt --verify` only runs inside an *adopting* project, never on the kit repo itself.
- **Third profile example** `profile/examples/nuxt-vue-nuxtui.profile.md` — a deliberately non-React stack (Nuxt 3 + Vue + Nuxt UI) proving the kit is *framework-paradigm*-neutral, not just CSS-framework-neutral. Surfaces the cross-paradigm component map (React/shadcn → Vue/Nuxt UI) and the Iconify string-name icon paradigm (`i-lucide-*`, where Zone 1 flips from kebab→Pascal named import to "prefix + keep kebab").
- **Review handoff** — `fidelity-page-handoff` Template C emits a read-only *reviewer* prompt (diff locator + evidence dir + the five-zone style-match checklist + the `[P1]/[P2]` + `Gate:` verdict contract) for a different host. The reviewer-side counterpart of the build handoff, closing the cross-model gate's symmetry.
- **Evidence contract** in `fidelity-gate.md` — a naming convention for executor→reviewer evidence (`<route>-<state>-<viewport>.png`, `<route>-box.txt`, `<route>-console.txt` under `profile.verify.evidence_dir`) so a visual finding can cite a file the way a code finding cites `file:line`.
- `fidelity-adopt` stack detection extended to Vue UI/icon ecosystems (`@nuxt/ui`, `naive-ui`, `element-plus`, `vuetify`, `primevue`; `@nuxt/icon`, `@iconify/vue`, `unplugin-icons`, `lucide-vue-next`).

### Fixed
- Reference-convention blurb cited `profile.verify.box` where the real field path is `profile.verify.recipe.box` (template + both READMEs) — corrected so the kit's own docs match its field contract.

### Changed
- `Contributing` now points at `scripts/verify-kit.mjs` for kit-repo self-checking and clarifies its relationship to `fidelity-adopt --verify`.
- README examples section + FAQ updated from "two examples / not AntD-shaped" to "three examples / spans React and Vue".

## [0.1.0] — 2026-06-26

### Added
- Initial release: a stack-neutral 1:1 mockup-reproduction methodology — `rules/` (visual fidelity + the review gate), `skills/` (`fidelity-adopt`, `fidelity-plan`, `fidelity-build-from-mockup`, `fidelity-page-handoff`), the `/fidelity-review` command, the per-project `fidelity-profile` binding, two filled examples, the `kit-manifest.json` self-check manifest, and a bilingual (EN + 中文) README.
