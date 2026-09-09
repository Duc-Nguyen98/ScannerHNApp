# P03 — GLOBAL NAVIGATION + SCANNER LAUNCHER

Precondition:
P02 PASS.

Scope:
- Bottom Navigation
- Center Scanner CTA
- Global Scanner Bottom Sheet

Áp dụng COMMON.

## NAV

Giữ:
- Trang chủ
- Chứng từ
- Quét mã
- Lịch sử
- Cá nhân

Center Quét mã:
- action button
- không phải navigation tab
- ScanQr affordance rõ

Đổi accessibility label cũ nếu còn:
`Quét mã — Hoa Nam Tool`

thành:
`Mở tác vụ quét mã`

## GLOBAL SHEET

Dùng AppBottomSheet từ P00.

Đúng 4 action:
1. Nhập kho
2. Xuất kho
3. Bảo hành
4. Tra cứu sản phẩm

Không NFC.
Không Warranty Parts.

Visual:
- Operational Pro
- compact rows
- ít border
- clear disabled reason
- accessible

Backdrop chỉ trong app.

## PASS

- Quét mã không route lookup trực tiếp.
- Sheet 4 actions.
- Active nav không sai ở create/scan/review.
- Back đóng sheet.
- Focus restore.
- 360/390/430 PASS.

Output:
`SCANNER_P03_GLOBAL_NAV_REPORT.md`

Final:
`P03 PASS — READY FOR P04`
