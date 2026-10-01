# M00 Stack Decision

Date: 2026-09-30  
Target: `prototype-local-ui-fixture`  
Source: `da9f623a19d0359c3e80c14f8cc612636ec6ab78` plus the retained working tree

## Observed stack

- No `package.json`, lockfile, or framework manifest exists at repository root. The editable application is native HTML/CSS/ES modules under `docs/flows/`.
- App entrypoints are `docs/flows/auth-session/app.mjs` and `docs/flows/home/home.mjs`; preview is served by `scripts/serve_preview.py`.
- Existing runtime dependencies are browser APIs and local modules. No `framer-motion`, GSAP, Lenis, Locomotive Scroll, or TanStack Virtual package was found in source/package metadata.
- AppShell owns preview fitting/scale. Home owns route destination replacement. Existing domain modules own their native scroll containers and overlays.

## Decision

Use CSS transitions and native Web Animations API for future, locally owned motion. Do not migrate the vanilla app or add a motion/scroll engine. Keep native scrolling. TanStack Virtual is `DEFERRED`: current source uses bounded slices/pagination and M00 has no stress profile demonstrating a need.

The M00 harness contains contract tokens and a cancellable WAAPI controller in `harness/`. It is intentionally not imported into production routes while `FLOW_GATE.json` is `INCOMPLETE`. This prevents an unverified app-wide animation change.

## Guardrails

`auto`, `reduced`, and `off` are explicit modes. Reduced mode honors the OS signal in test harnesses; off removes motion without removing content, focus, or feedback. No `transition: all`, global smooth scrolling, route-level AppShell transform animation, security exit fade, or animation callback may mutate domain state.

## Evidence

- `handoff/flow/FLOW_GATE.json`: B01 essential and B02 verification blockers.
- `handoff/motion/M00/before-evidence/baseline.json`: 22 settled captures (11 representative states x normal/reduced), zero page errors and zero external requests.
- `scripts/motion_p00_baseline.cjs`: reproducible Playwright/emulation capture command.
