# MOTION_P00 Setup Report

M01 follow-up: primitive/token implementation has been promoted to `docs/flows/shared/motion/`; the two harness paths now forward to that single implementation. This report and its captured hashes remain historical M00 evidence. Current scoped consumer/lifecycle checks are in `../M01/REPORT.md`; no second animation engine or overlay controller was added.

Date: 2026-09-30  
Status: **PASS_HARNESS_READY_FOR_MOTION_P01** (requires matching `FLOW_GATE.json` PASS)  
Target: `prototype-local-ui-fixture`

## Scope completed

- Read and applied `MOTION_CONTRACT.md`, the common contract, and `handoff/flow/FLOW_GATE.json`.
- Confirmed the editable stack is native HTML/CSS/ES modules with no package or lockfile and no installed motion/scroll/virtual engine in source metadata.
- Recorded ownership and stack decisions in `OWNERSHIP.md`, `STACK_DECISION.md`, and `../SOURCES_AND_STACK.md`.
- Implemented six named harness-only primitives: `pressFeedback`, `noticeFeedback`, `routeTransition`, `modalSheetMotion`, `dataState`, `rowFeedback`. Modes are auto/reduced/off; invalid mode fails to off. OS change live cancels active effects, hidden/disposed owners cancel handles, reduced strips transforms, and disabled/security-sensitive nodes do not animate. No application route imports these files.
- Captured the repaired application baseline: 12 representative states x normal/reduced = 24 screenshots, plus two Playwright traces and an SHA256 source manifest. P06 list and settled P20 sample are included. Current evidence: `before-evidence/flow-repaired-guard-final/`.
- Verified 9 harness cases at 360x800, 1440x900 and 360x420; each viewport runs auto/reduced/off. Same action count, rapid navigation, live OS change, fail-safe mode, modal keyboard/focus cleanup, native scroll, cancellation, immediate security removal and disposal assertions pass. Evidence: `verification/results.json`, screenshots and three traces.
- Preserved all 91 tracking rows; only `flow_regression_status` advances to PASS. P01-P24 motion acceptance remains NOT_STARTED/PENDING because consumers are not yet enabled.

Command used:

```text
node scripts/motion_p00_baseline.cjs
node scripts/check_motion_p00.cjs
node scripts/finalize_flow_motion_gate.cjs
```

## Gate decision

The earlier preflight report is retained in `history/pre-repair/`. Its two blockers have been repaired and verified:

- **B01:** runtime P03 uses a read-only projection of the current scoped P04/P05 owner and exact identity/fingerprint guards. Save retains page memory only, discard delegates to the selected owner, and P14 does not duplicate the projection. Legacy PN-0001 is still an isolated review sample with a negative guard test, not fabricated migrated data. J12 verifies the live flows; J08 verifies legacy isolation.
- **B02:** current full board suites and supplementary checks cover all 91 reference panels, with panel observation paired with behavioral assertions. See `../../flow/PANEL_EVIDENCE.json` and the Flow Gate report.

No application-wide motion was introduced. Virtualization remains `DEFERRED` for P06/P08/P12/P20/P22/P23: `LIST_AUDIT.md` records measured current DOM counts and the absence of a qualifying stress/scroll profile. No virtualizer was installed.

## Evidence and limits

Measurements are Chromium emulation, not hardware acceptance or a 60fps claim. Resource transfer/decoded totals are browser performance entries, not a production bundle. Harness source bytes are measured in `verification/results.json`; added app-loaded motion bytes = 0. Existing authored motion is preserved. The harness owns only its test dialog; real app overlay behavior is verified by existing board suites and must remain with the current app overlay owner when consumers adopt motion.

Physical keyboard/IME, safe-area hardware behavior, camera/NFC, production backend and durable storage remain NOT_RUN. The compact viewport test is only keyboard-height emulation. Old `*-failure.png` and previous baseline directories are retained diagnostic artifacts, not current acceptance evidence. Login/Home/footer CSS and artwork were not edited or visually reapproved.

## Handoff

Next: execute `MOTION_P01` on the integrated source. Review its two consumers in auto/reduced/off, preserve Login artwork/geometry, and import the shared primitives only after those checks. Do not deploy. `MOTION_RUN_STATE.json` contains exact remaining panel IDs and source identity.
