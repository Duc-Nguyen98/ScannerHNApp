# P00 — REAL MOBILE APP PREVIEW SHELL

Áp dụng toàn bộ COMMON contract.

## MỤC TIÊU

Khắc phục kiến trúc preview khiến Modal/Dialog/Confirm/Bottom Sheet/Backdrop/Popup render vượt ra ngoài khung mobile và phủ browser desktop.

Preview phải hoạt động như app mobile thật.

Đính kèm:
- Positive Operational Pro reference
- Negative modal-overflow reference

## REQUIRED ARCHITECTURE

Chuẩn hóa:

`.sc-app-shell`
→ `.sc-device`
→ `.sc-app-viewport`
→ app content
→ `.sc-app-overlay-root`

Mọi app overlay mount trong `.sc-app-overlay-root`.

Không portal overlay của Scanner App ra `document.body` nếu làm mất clipping.

Không dùng native `dialog.showModal()` nếu top-layer browser làm overlay thoát khỏi app viewport.

Nếu cần:
thay bằng accessible custom Dialog/BottomSheet.

## OVERLAY CONTRACT

Backdrop:
- absolute
- inset: 0
- chỉ che app viewport

Bottom Sheet:
- absolute
- left/right/bottom = 0 trong app viewport
- safe-area bottom
- scrollable content
- không vượt phone

App viewport:
- position relative
- overflow hidden

Screen content:
- vùng scroll riêng

Khi chạy mobile thật:
- viewport = 100dvh/100vw
- dùng cùng overlay component

## REUSABLE COMPONENTS

Chuẩn hóa tối thiểu:

- AppModal
- AppDialog
- AppBottomSheet
- AppConfirmDialog
- AppActionSheet
- AppToast/feedback layer

## ACCESSIBILITY

- dialog semantics
- aria-modal
- title/description association
- focus trap
- restore focus
- Escape
- browser/Android Back
- close ≥44px
- backdrop close nếu được phép

## MUST TEST

1. Global Scanner Sheet
2. Discard draft confirm
3. Warehouse status dialog
4. Manual input sheet
5. NFC confirm
6. Warranty confirm
7. Logout confirm
8. Avatar/password related overlays nếu có

Viewport:
- 360×800
- 390×844
- 430×932

## ACCEPTANCE

- Không overlay nào vượt phone/app viewport.
- Không backdrop nào phủ desktop preview.
- Focus restore PASS.
- Back/Escape PASS.
- Safe-area PASS.
- Content cuối sheet truy cập được.
- Không regression business flow.

Output:
`SCANNER_P00_REAL_APP_SHELL_REPORT.md`

Final:
`P00 PASS — READY FOR P01`
hoặc
`P00 FAIL — FIX REQUIRED`
