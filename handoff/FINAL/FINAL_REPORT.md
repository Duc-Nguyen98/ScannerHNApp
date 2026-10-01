# FINAL - ScannerHNApp

Date: 2026-10-01. Scope: public static UI fixture preview. Current release status and exact verification counts: `FINAL_GATE.json`.

## Source and Implementation

The existing M24 manifest was checked against all 224 recorded application files: no changes since the verified motion release. Original Flow Gate is PASS; Motion Gate is READY_FOR_FINAL across 24 boards / 91 panels. No original business owner, fixture, router, motion token or primitive was edited by FINAL.

New source files: `docs/review/index.html`, `review.css`, `review.mjs`, `scenes.mjs`; generated `catalog.json` and isolated `runtime/`. Build/check/publish helpers are under `scripts/*final*`. The deployed runtime is an editable, unminified copy, not a replacement app or image gallery.

Review Mode reconstructs each declared panel using existing UI commands and explicit board sample controls. It never writes directly into domain state. The 91 panel catalog comes from SCREEN_COVERAGE.csv; migrated IDs are retained. Runtime and state remain isolated per document/tab; switching samples and resetting are confirmed before reload. The URI restores the declared sample on refresh; it does not claim durable storage of later mutations.

App Preview supports ordinary demo login and continuous navigation. Both views keep tools outside the app. Mode changes use the already-verified auto/reduced/off owners. No engine, scroller, provider, board or business module was added.

## Packaging Changes

- Existing geography read adapter is bound to the same two-city fixture already used in tests. No external API request is needed in the public build. No domain validation is bypassed.
- The copied auth HTML hides its technical tool panels; the external Review Mode invokes those existing fixture commands. Product CSS/artwork/footer geometry is not redesigned.
- Same-origin CSP restricts network access, with no production writes. Camera/microphone are denied by the host iframe. Original fonts/images/PDFs and required licenses are packaged; reports/logs/workspace data are excluded.
- Source app hash remains `9138cf689297094c291963dfdf9c04041728c338e71691c84185d448cd1a2fe9`; packaged build is `final-2e8357d7f52d`. `BUILD_MANIFEST.json` records transforms and output file hashes.

## Verification

Local: 91 panels x auto/reduced/off = 273 successful actual render checks at desktop/390/430 widths; no page errors, external requests or HTTP failures. The final reset-cancel fix affects only the external confirmation and was rechecked separately. Eight review-control checks cover live modes/OS, data parity, reset/cancel/Escape, clipboard copy, deep-link refresh, 360/390/430/1440 layouts and manual login/profile/logout/Back. Existing 12 cross-owner journeys were replayed on the packaged runtime. All 765 source tests pass.

Screenshots are actual browser output; original per-board motion/behavior evidence remains linked, not silently upgraded. Public runs checked all 91 panels, 12 representative reduced and 12 off scenes, 12 cross-owner journeys and eight controls groups. One initial P19.S02 attempt exceeded the old 16-second Home startup deadline while network loading was still pending. The final build permits up to 45 seconds for this UI-module load, without delaying ready actions or domain commands. A controlled 17.5-second module delay passes. Seven public startup paths, P19.S02 reduced/off and the eight controls groups are rechecked against the final build. Initial failed evidence is retained; no failure is relabeled PASS.

`PUBLIC_VERIFICATION.json` and `FINAL_GATE.json` are authoritative for exact post-deploy counts, source continuity and scoped revalidation. The underlying 224-file M24 app source, all motion primitives/tokens, scene fixture commands and runtime assets remain unchanged by this final deadline fix.

No global acceptance is inferred solely from a build, route existence or panel count. Existing visual/business/backend statuses stay unchanged in SCREEN_COVERAGE; FINAL adds separate preview status/evidence columns.

## Limits and Known Issues

- UI fixture only: no production auth/permissions, WMS, durable storage, real camera/NFC, delivery, upload or hardware acceptance.
- Visual design approval remains pending. Emulated compact viewports are not proof of physical keyboard/safe-area behavior or device FPS.
- Runtime edits reset on refresh. Review links reconstruct the named seed; generated receipt/draft IDs from a later interaction are not durable links.
- B22/B23 samples and legacy B08 are deliberately separate. NFC mapping does not fabricate an audit trail. Legacy P03 sample IDs are not imported into P04/P05; runtime resume uses the verified live owner.
- Geography is a declared old-version fixture, not current administrative guidance.
- The original prompt's Home View all -> History wording is superseded by the later user decision: recent-document View all -> P12; History footer -> P22.

## Handoff

- App and Review links, demo credentials, scenarios/reset and bug template: `REVIEW_GUIDE.md`.
- Source/build/public commit, hosting and rollback: `DEPLOYMENT.md`.
- Shared fixture relationships and isolation: `FIXTURE_MANIFEST.json`.
- Current flow evidence: `FLOW_MATRIX.csv`.
- Original failures during launcher development remain in evidence directories and are not release results.
