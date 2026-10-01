# P09 r03 — chọn lỗi có tìm kiếm và hoàn thiện form tiếp nhận

Yêu cầu user ngày2026-09-28: thay textarea Lỗi tiếp nhận bằng10–20 option có tìm kiếm; chọn Khác mở textarea; đề xuất và sửa giao diện đang đơn sơ/không đồng đều. Đã thực hiện trong **P09.S02**. Giữ24 board/91 panel, luồng quét r02 và nghiệp vụ bảo hành.

## Phương án đã triển khai

- **18 lựa chọn:**17 tình trạng thiết bị + Khác. Đây là lựa chọn tình trạng tiếp nhận ở UI, không phải enum trạng thái xử lý hồ sơ/backend. Không dùng lỗi được chọn để suy chẩn đoán hay quyền bảo hành.
- Dùng lại `shared/choice-dialog.mjs` + `openAppModal`: tìm theo tên có/không dấu, radio chọn một, Hủy/Áp dụng, Escape, focus trap/return. Áp dụng bị khóa khi chưa chọn; Cancel/search không thay giá trị đã lưu. Danh sách dài cuộn trong app, header/search vàfooter luôn truy cập được; không chồng overlay.
- **Khác:** hiện trường Mô tả tình trạng khác bắt buộc,200 ký tự theo policy fixture hiện có. Chưa báo đỏ ngay khi mới mở; báo khi nhập không hợp lệ/rời ô/submit. Chuỗi chỉ có khoảng trắng bị chặn ở UI và handler/model.
- Nháp Khác được giữ khi chọn option khác, khi Back và khi quay lại Khác. Chỉ gửi nhãn đang chọn hoặc nội dung Khác đang có hiệu lực. Mô tả Khác đang ẩn không đi vào request/record của lỗi có sẵn.
- Hai nhóm Thông tin sản phẩm/Thông tin bảo hành thành card trắng chung inset16px, radius12px, viền nhẹ, section heading17px + icon pastel size sm. Cùng nhãn14px, controlmin52px, textarea84px, radius8px, gap14–16px. Mô tả Khác có vùng phụ trợ riêng, ghi chú/phụ kiện ghi rõ Không bắt buộc và placeholder cụ thể.
- Giữ trường sản phẩm/khách/serial đúng nguồn, khung494×950, cuộn nội bộ, camera/manual r02, footer cố định và lý do khóa CTA. Card rỗng gọn, đường Tra cứu thành control rõ ràng. Không chỉnh các panel S01/S03/S04 ngoài dữ liệu lỗi được xác nhận đúng ở hồ sơ.

## Danh mục

1. Máy không lên nguồn
2. Nguồn chập chờn / Tự tắt máy
3. Không in được
4. Bản in mờ / Không rõ nét
5. Bản in bị sọc / Đứt nét
6. In lệch tem / Sai vị trí
7. Kẹt giấy / Kẹt tem
8. Không nhận giấy / Tem
9. Không cắt giấy / Lỗi dao cắt
10. Không quét được mã vạch
11. Quét mã chậm / Chập chờn
12. Không kết nối USB
13. Không kết nối mạng LAN
14. Không kết nối Bluetooth
15. Không kết nối Wi-Fi
16. Nút bấm không hoạt động
17. Hư vỏ máy / Cổng kết nối
18. Khác

Nguồn lựa chọn: user cho phép đề xuất10–20 trường hợp; danh mục tách ở `fault-options.mjs` để dễ chỉnh. Tên/ID này không tự thành schema của WMS.

## Kiểm chứng

- **164/164 Node PASS**, gồm5 test mới cho danh mục/Khác/canonical payload/UNKNOWN/guard. [node-tests.txt](evidence/revision-03/node-tests.txt).
- **6/6 nhóm browser mới PASS**:18option/searchkhôngdấu/rỗng/Cancel, chọn thường, Khác+nháp+Back,6viewport+focus/modal, required/200ký tự/escapeHTML/confirm, UNKNOWN+receipt đúng nội dung. [fault-results.json](evidence/revision-03/fault-results.json).
- **8/8 scan regression PASS**: geometry P04/P05 không đổi, nhập mã/Escape/IME/nháp/UNKNOWN vẫn đúng. [scan-results.json](evidence/revision-03/scan-regression/scan-results.json). Lượt đầu fail vì assertion vẫn tìm copy r02 “Chưa có sản phẩm”; sửa kỳ vọng sang empty state r03 “Chưa xác định sản phẩm”, giữ mọi guard/assertion khác; lượt cuối8/8PASS.
- **10/10 full P09 regression PASS**, [browser-results.json](evidence/revision-03/regression/browser-results.json). Test nhập lỗi chuyển từ filltextarea sang chọnoption, acceptance A01–A05 giữ nguyên.
- **7/7 shared dialog/history regression PASS**, [browser-results.json](evidence/revision-03/shared-dialog-regression/browser-results.json). Shared helper chỉ thêm config class/label/search/focus tùy chọn và khóa submit khi chưa chọn; caller trước giữ defaults.
- 6viewport494×1000,360×800,430×932,1440×900,340×420,1869×940, DPR1: không tràn ngang; dialog/footer trong khung; không chồngoverlay. [fault-metrics.json](evidence/revision-03/fault-metrics.json).
- Đã xem ảnh actual form thường, Khác, search, dialog desktop và340×420. Phát hiện footerdialog bị clip ở vòng đầu do maxheightform vượt host; đã sửa flex/minheight và bổ sung assertion footerInside. Ảnh cuối footer đầy đủ.

Ảnh: [form chọn lỗi thường](evidence/revision-03/standard-fault.png), [form Khác](evidence/revision-03/form-494x1000.png), [danh sách lỗi](evidence/revision-03/options-494x1000.png), [tìm không dấu](evidence/revision-03/search-nguon.png), [xác nhận đúng mô tả](evidence/revision-03/confirmation-other.png).

## Bàn giao

Visual: **IN_PROGRESS, chờ user review r03**. Behavior: **PASS fixture**. Integration: **BLOCKED** theo r01/r02; không gọi API/hardware mới, không tự đổi policy200 hoặc trạng thái hồ sơ. UNKNOWN khóa cả chọn lỗi và mô tả, giữrequest/session/version; reconcile dùng payload đã chốt. Tích hợpproduction phải mapdanh mục và policy theo contract thật.

Files: `warranty/fault-options.mjs` mới; `warranty-model.mjs`, `warranty.mjs`, `style.css`, `auth-session/index.html`; `shared/choice-dialog.mjs`; tests và scripts P09; coverage/RUN_STATE. Không đổi baseline/dist/gallery, không push/merge/deploy. Các thay đổi có trước và evidence r01/r02 được giữ.
