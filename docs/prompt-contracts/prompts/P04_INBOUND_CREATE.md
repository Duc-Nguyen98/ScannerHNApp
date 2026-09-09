# P04 — INBOUND CREATE

Precondition:
P03 PASS.

Scope:
Nhập kho → Thông tin phiếu.

## UI

Enterprise warehouse form.

Không card hóa từng field.

Structure:
- Header: Nhập kho
- Workflow progress phù hợp
- Kho Hoa Nam / status
- Logical form groups
- Tên/lô phiếu
- Existing business fields
- Note
- Draft indicator

Sticky CTA:
`Tiếp tục quét mã`

Không thay business validation.

## PASS

- Clear form hierarchy.
- No content/footer overlap.
- Keyboard-safe.
- Draft preserved.
- RBAC/paused.
- 360/390/430.

Output:
`SCANNER_P04_INBOUND_CREATE_REPORT.md`

Final:
`P04 PASS — READY FOR P05`
