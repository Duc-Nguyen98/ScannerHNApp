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

The M00 harness contains contract tokens and six named cancellable WAAPI primitives in `harness/`. Flow blockers are now resolved in the UI fixture scope. Primitives remain unimported by app routes until each board consumer is verified in its own motion prompt.

## Guardrails

`auto`, `reduced`, and `off` are explicit modes. Reduced mode honors the OS signal in test harnesses; off removes motion without removing content, focus, or feedback. No `transition: all`, global smooth scrolling, route-level AppShell transform animation, security exit fade, or animation callback may mutate domain state.

## Evidence

- `handoff/flow/FLOW_GATE.json`: current flow acceptance; previous blockers retained in `history/pre-repair/`.
- `handoff/motion/M00/before-evidence/flow-repaired-guard-final/baseline.json`: 24 settled captures (12 representative states x normal/reduced), zero page errors and zero external requests, source identity and traces.
- `handoff/motion/M00/verification/results.json`: nine harness mode/viewport cases, source-byte measurements and lifecycle assertions.
- `scripts/motion_p00_baseline.cjs`: reproducible Playwright/emulation capture command.
