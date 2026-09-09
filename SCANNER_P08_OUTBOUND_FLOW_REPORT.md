# P08 Outbound Operation Flow

## Executive summary

P08 implements the outbound runtime from scanner context through compact review, confirmation and result. The existing auth, route guard, RBAC, paused-warehouse, draft, validation and posting semantics remain unchanged.

## Implemented

- `OUTBOUND` scanner with `Đã soạn / Yêu cầu` counter and restrained progress bar.
- Mock camera state plus manual QR/barcode entry.
- Existing domain validation preserved: available stock, reserved code, duplicate and over-target.
- Review uses a compact picking list, recipient, `Đã soạn`/`Yêu cầu` totals and `Gửi duyệt` primary CTA.
- Result explicitly states `Chờ duyệt`; stock is unchanged until existing Post/Ghi sổ.
- Outbound overlays are scoped to `.sc-app-overlay-root` inside the phone viewport.

## Evidence

- [P08 visual gallery](artifacts/scanner-p08-outbound-flow/index.html)
- [390px result capture](artifacts/scanner-p08-outbound-flow/after/manual-result.png)
- [QA capture set](artifacts/scanner-p08-outbound-flow/after/)

The capture set includes login, shift, home, P07 boundary, empty/partial/complete scanner, duplicate, unavailable, reserved, over-target, camera/manual, review, confirmation, draft, short-height, keyboard and safe-area states at 360, 390 and 430px.

## Validation and regression

| Area | Result |
|---|---|
|360×800 / 390×844 / 430×932|PASS — no horizontal overflow; sticky CTA and progress remain visible|
|Outbound E2E scanner → review → submit → result|PASS — manual runtime check; result is `#result` and shows `Đã gửi phiếu xuất`|
|Duplicate / unavailable / reserved / over target|PASS — inline business reasons; draft remains unchanged|
|Inventory semantics|PASS — scan and submit do not change item stock|
|Auth, Home, P07 create, inbound branches|PASS — build regression preserved|
|Overlay containment|PASS — outbound scan/review dialog bounded to app viewport|
|Accessibility|PASS — labels, live feedback, dialog labels, 44px controls, reduced-motion rules|
|Console/page errors|PASS — targeted runtime capture produced no page error|

## Open decisions

Camera remains the approved preview simulation until native hardware integration. Native TalkBack/VoiceOver and physical camera are outside browser QA.

## Acceptance

P08 scope is complete and does not execute P09.

**P08 PASS — READY FOR P09**
