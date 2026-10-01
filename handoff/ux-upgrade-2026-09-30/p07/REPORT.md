# P07 — Tìm kiếm bằng Enter

30/09/2026; thực hiện đề xuất4 theo yêu cầu user áp dụng. Đã đọc AGENTS, UI_STANDARD, RUN_STATE và P07 r13; giữ tiến độ P23 của chat khác. [Nguồn và phạm vi](CONTEXT.md).

## Thay đổi

- Ô tìm kiếm có gợi ý phím Search trên bàn phím mobile. Query khác rỗng, nguồn đọc ready/đầy đủ và đúng1 kết quả: Enter mở **dialog thông tin thẻ hiện hữu**. Nhiều kết quả hoặc nguồn chỉ tải một phần: focus hàng đầu để người dùng chọn.
- Rỗng/không khớp, IME đang nhập, key229, Enter đang giữ, nguồn lỗi/cũ/chưa xác minh không tự mở. IME được reset khi DOM ô tìm bị thay, tránh chặn phím ở lượt tiếp theo.
- Back/Escape đóng dialog, trả focus về ô tìm và giữ query/tab/scroll. Enter chỉ đọc thông tin; không đọc NFC phần cứng, tạo request hoặc liên kết thẻ.
- Adapter fixture thêm `status: ready/denied` cục bộ để chứng minh lần đọc danh sách thành công; đây **không phải schema/enum backend**. Không đổi quyền, dữ liệu, mapping, request, storage hoặc xử lý UNKNOWN.

## Kiểm chứng

| Phạm vi | Kết quả | Evidence |
|---|---|---|
| Trước sửa,8 nhóm |5 FAIL tái hiện Enter chưa hoạt động;3 guard hiện hữu PASS |[before/results.json](before/results.json) |
| Sau sửa,10 nhóm mới |10 PASS; không pageerror |[verified/results.json](verified/results.json) |
| Node NFC + navigation |28/28 PASS, gồm6 test mới và22 hồi quy |[node-tests.txt](node-tests.txt) |
| Liên kết liên tiếp/UNKNOWN/nội dung dài |4/4 nhóm PASS |[repeat/results.json](repeat/results.json) |
| Hồi quy r13 picker/copy/dialog |6/6 PASS |[r13-verified/results.json](r13-verified/results.json) |

Tổng browser sau sửa: **20 nhóm** (10 mới +4 repeat +6 r13). Lượt đầu r13 có5 PASS,1 lỗi selector test vì thẻ vừa xem P06 mới và kết quả chính cùng ID. Đã giới hạn selector vào `.p06-card`, giữ nguyên kiểm tra Back sau3 vòng chọn; không sửa app để thỏa test. [Lượt thất bại được giữ](r13-regression/results.json). Lượt after đầu9 nhóm cũng được giữ, verified là lượt cuối gồm10 nhóm.

Trước/sau cùng viewport494×1000,DPR1, fixture ban đầu; đã xem ảnh thực. [Trước Enter](before/unique-enters-existing-detail.png) → [Sau Enter](verified/unique-enters-existing-detail.png). [Nhiều kết quả sau Enter](verified/multiple-focuses-first-row.png). CSS/artwork P07 không sửa; [hash trước/sau](source-sha256.json), [snapshot nguồn trước](source-before/nfc.mjs). Giao diện vẫn cần user review, các kiểm tra không tự chứng minh khớp toàn bộ Designer.

## Lệnh và files

```powershell
node --test tests/nfc.test.mjs tests/nfc-search-navigation.test.mjs
$env:NFC_ENTER_EVIDENCE_DIR='handoff/ux-upgrade-2026-09-30/p07/verified'
node scripts/check_nfc_enter_ux.cjs
$env:NFC_REPEAT_EVIDENCE_DIR='handoff/ux-upgrade-2026-09-30/p07/repeat'
node scripts/check_nfc_repeat.cjs
$env:NFC_R13_EVIDENCE_DIR='handoff/ux-upgrade-2026-09-30/p07/r13-verified'
node scripts/check_nfc_r13.cjs
```

Files chức năng: `docs/flows/nfc/nfc.mjs`, `nfc-flow.mjs`, `fixture-adapter.mjs`. Test mới: `tests/nfc-search-navigation.test.mjs`, `scripts/check_nfc_enter_ux.cjs`; selector test hiện hữu: `scripts/check_nfc_r13.cjs`. Evidence chỉ ở thư mục mới này; không ghi đè revision cũ. Không sửa shared/home/auth/standards/coverage/RUN_STATE trong tiểu tác vụ P07.

**Behavior: PASS_FIXTURE. Visual: AWAITING_USER_REVIEW. Integration: production/hardware NOT_RUN.** Kiểm bằng browser độc lập; không thay tab của user, không push/deploy.
