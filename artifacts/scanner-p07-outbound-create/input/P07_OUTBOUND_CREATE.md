# P07 — OUTBOUND CREATE

Precondition:
P06 PASS.

Scope:
Xuất kho → Thông tin yêu cầu.

Giữ business fields:
- người nhận
- phone/address nếu có
- target quantity
- group
- notes

Visual hierarchy:
- Xuất kho
- Thông tin giao/nhận
- Số lượng cần soạn

Target quantity phải nổi bật.

CTA:
`Bắt đầu soạn hàng` / `Quét mã` theo wording hiện tại.

Không bypass recipient/quantity.

Output:
`SCANNER_P07_OUTBOUND_CREATE_REPORT.md`

Final:
`P07 PASS — READY FOR P08`
