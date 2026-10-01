# P12 r03 · Đồng bộ tab và sửa luồng xem chứng từ

**Đã triển khai theo yêu cầu và4 ảnh user cung cấp ngày2026-09-28.** Mẫu tab đã có trong `shared/detail-tabs.css` và P09; không cần xác nhận một thiết kế mới. [Đề xuất và quyết định](UI_UX_REVISION_03.md).

## Vấn đề và cách sửa

| Phần | Thay đổi |
|---|---|
| Sản phẩm mất tab | S02/S03 dùng chung phần đầu và thanh4 tab; Sản phẩm vẫn giữ ID **P12.S03** và URL panel3. Header thống nhất **Chi tiết chứng từ**; không gộp/bỏ panel. |
| Tab nhảy khi đổi nội dung | Context/tab nằm ngoài scroller nội dung; cùng padding, cao tab48 và badge riêng theo P09. Nhãn Sản phẩm được cấp đủ độ rộng để không xuống dòng khi selected/bold. |
| Điều hướng | Mọi tab đều chuyển trực tiếp sang ba tab còn lại. Tab hiện tại không push history trùng. Left/Right/Home/End, selected focus và aria-controls/tabpanel đúng, kể cả panel3 và link cũ panel2&tab=products. |
| Giữ trạng thái | Query sản phẩm theo document ID; scroll theo document+tab. Back/Forward giữ đúng tab/phiếu. Tab vẫn hiện khi cuộn nội dung dài; dialog dùng Back trước route. |
| Tài liệu0 | Empty card có icon, tiêu đề, mô tả đúng mã phiếu theo P09. Thông tin không còn nút Xem tất cả vô nghĩa khi0 file. Phân biệt không có file với chưa có nguồn. Tệp sẵn có vẫn xem/tải thật. |
| Lịch sử | Timeline quiet card/dot marker theo P09, không dùng danh sách số thứ tự mặc định; có ngày giờ, người thao tác, mô tả, số sự kiện. Chỉ đọc event nguồn, không phát sinh sự kiện nghiệp vụ mới. |
| Danh sách/Tạo | Rà soát và giữ bộ lọc, query, draft/validation, luồng P04/P05/P09 đã có. Icon Sắp xếp dùng mũi tên theo chiều chọn, thay icon filter gây nhầm. Không redesign các P khác. |

## Kết quả kiểm chứng

- **9/9 nhóm browser cho tab/navigation PASS**: `node scripts/check_documents_tabs.cjs`. [Log](evidence/revision-03/tabs-log.txt), [metrics và kết quả](evidence/revision-03/tabs-results.json). Kiểm24 tab×viewport, header/context/tab/nav không đổi tọa độ khi chuyển tab; nội dung mẫu vừa khung; long-content vẫn cuộn; nhớ query/scroll; bàn phím; Back/Forward; PDF dialog; deep link.
- **12/12 nhóm hồi quy dữ liệu P12 PASS**: `DOCUMENTS_DATA_EVIDENCE_DIR=handoff/P12/evidence/revision-03/data-regression node scripts/check_documents_data.cjs`. [Kết quả](evidence/revision-03/data-regression/browser-results.json). Giữ24 chứng từ, serial, tệp PDF download thực,404, trạng thái P09, gửi P04/mở đúng ID, logout/Back và24 panel×viewport.
- **Tổng21 nhóm browser PASS**,0 pageerror. `node --check docs/flows/documents/documents.mjs` PASS. Model dữ liệu/validation không đổi;59 ca Node r02 giữ bằng chứng cũ, không báo đã chạy lại ở r03.
- Sáu viewport:494×950,360×800,430×932,1440×900,340×420,1869×940; Chromium headless/DPR1/zoom1. Lượt đầu thực sự phát hiện padding context khác6px và nhãn Sản phẩm xuống dòng; đã sửa, chạy lại đạt. Failure artifact cũ giữ làm lịch sử.

## Actual để nghiệm thu

- [Thông tin](evidence/revision-03/info-494x950.png)
- [Sản phẩm có đủ4 tab](evidence/revision-03/products-494x950.png)
- [Tài liệu rỗng](evidence/revision-03/files-494x950.png)
- [Lịch sử](evidence/revision-03/events-494x950.png)
- [Nội dung dài, tab vẫn cố định](evidence/revision-03/long-events-fixed-tabs.png)

## Phạm vi và giới hạn

Thay đổi: documents.mjs/style.css, shared/detail-tabs.css chỉ mở rộng selector flex cho P12, script kiểm chứng và handoff/checkpoint. Giữ nguyên dữ liệu r02, P04/P05 owners, P09 store, backend/API,24 board/91 panel và công việc chat khác. Bốn ảnh user là evidence vấn đề, không bị sửa.

**Visual:** đã trực tiếp kiểm actual và geometry, chờ user nghiệm thu. **Behavior:** PASS cho21 nhóm nêu trên. **Integration:** vẫn local test data; WMS/hardware/P18 backend chưa xác minh. Không tuyên bố toàn app/production đã ổn định hay mọi lỗi có thể xảy ra đều được loại bỏ.
