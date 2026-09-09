# P17 — FINAL OPERATIONAL PRO SYSTEM AUDIT

Precondition:
P16 PASS.

KHÔNG redesign thêm trừ fix inconsistency/bug cần thiết.

Đính kèm:
- Positive Operational Pro reference
- Negative modal-overflow reference

## AUDIT ALL

- Login
- Forgot Password
- Start Shift
- Home
- Global Scanner
- Inbound
- Outbound
- Lookup
- Product
- Warranty
- Intake
- Warranty Case
- Warranty Parts
- NFC
- Documents
- History
- Profile
- Security
- Help
- Support

## GLOBAL STATES

- Loading
- Skeleton
- Empty
- Search empty
- Offline
- Reconnect
- Permission denied
- Warehouse paused
- Server error
- Duplicate
- Invalid scan
- Draft exists
- Unsaved changes
- Session expired
- Success
- Warning
- Danger
- Disabled
- Retry

## OVERLAY AUDIT

100%:
- Bottom Sheet
- Dialog
- Confirm
- Popup
- Toast
- Avatar crop
- Manual input
- Filters

phải nằm trong app viewport.

## VISUAL AUDIT

Không còn:
- excessive cards
- excessive radius
- plastic appearance
- generic template sections
- inconsistent spacing/icons/status
- duplicate CTA
- random gradients
- desktop-style modal

## MOBILE

- 360×800
- 390×844
- 430×932
- short height ~390×640

## BUSINESS REGRESSION

Xác nhận:
- Scan != stock mutation
- Stock only on Post
- RBAC
- Viewer no write
- Paused blocks write
- Lookup read only
- Warranty eligibility
- Warranty Parts require case
- NFC unchanged
- Draft protection
- Route guard

## FINAL SCORE

Chấm:
- Visual maturity
- Information hierarchy
- Enterprise feeling
- Mobile efficiency
- Consistency
- Accessibility
- Error prevention
- Business usability

Target:
**UI/UX DESIGN ≥93/100**

Không đổi rubric để PASS.

Output:
`SCANNER_P17_FINAL_OPERATIONAL_PRO_AUDIT.md`

Final:
`P17 PASS — OPERATIONAL PRO APPROVED`
hoặc
`P17 FAIL — FIX REQUIRED`
