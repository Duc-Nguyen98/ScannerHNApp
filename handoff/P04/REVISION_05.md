# P04 revision05 — đồng bộ UX từ Xuất kho hiện hành

Yêu cầu27/09/2026: xem các cải thiện user đã sửa ở Xuất kho và áp dụng phần phù hợp sang Nhập kho. Source thực tế đã có P05–P08; giữ nguyên công việc đó và checkpoint P08. Đối chiếu `handoff/P05/REVISION_02.md` đến `REVISION_08.md`, source/outbound hiện hành và capture [Xuất kho](evidence/revision-05/P05-reference-current.png). HEAD vẫn da9f623; target prototype, không thay baseline.

| Cải thiện Xuất kho | Áp dụng Nhập kho |
|---|---|
| r02 newAttempt từ Home/picker | Cả hai đường truyền intent; chọn lại nghiệp vụ khi còn màn kết quả cũng bắt đầu lượt sạch. Chỉ outcome đã xác định; repaint/đóng dialog không reset. Nháp/đang gửi/UNKNOWN/resume đúng ID giữ nguyên. |
| r03 validation tại flow và inline | Metadata số phiếu/loại nhập/NCC không chấp nhận trắng; note tối đa200, giữ raw dài để báo lỗi, không cắt âm thầm. Kiểm trước next/scan/send. Mã trắng không tạo lượt quét, novalidate tránh bubble native. |
| r04 thẻ nhập tay | Header Nhập mã sản phẩm/Thu gọn, input52px + CTA126px; status xanh/vàng/đỏ ngay dưới; valid xóa ô, duplicate/invalid giữ nguyên mã và chọn nội dung để sửa. Enter, Escape, tránh IME Enter; giữ mã chưa gửi khi thu gọn. |
| r04 camera/list/footer | Camera128px khi nhập tay; đèn disabled khi chưa có camera. Danh sách4 lượt mới nhất, mở tất cả; reason từng dòng, trùng màu vàng. Không mã hợp lệ thì khóa review có lý do; CTA kiểm tra/tiếp tục rõ ràng. |
| r06–07 focus/dropdown | Không viền xanh vuông trong field S01; focus ngoài trầm, lỗi đỏ. Popup nổi trong app, không đẩy form/footer; keyboard/selected/Escape/click ngoài/cleanup như P05. |
| r08 khoảng cách/nhãn form | Margin14px, palette form hiện có; không thêm hướng dẫn kỹ thuật địa giới vào Nhập kho. |
| review điều hướng | Thêm Quay lại quét mã cạnh Gửi phiếu lên Web; UNKNOWN khóa mọi nút back, giữ request. |

Các phần **không chuyển nghiệp vụ**: phone/recipient/walk-in/address/province/district, planned1–99/default1, chọn nguồn xuất/nhóm hàng, điều kiện soạn đủ, exception hàng không thể xuất. P04 không có nguồn chốt các trường đó. Giữ 12 lượt=11 hợp lệ+1 trùng, 5+4+2=11; không tạo progress “đủ kế hoạch” bịa. Thay bằng tổng sản phẩm hợp lệ và sẵn sàng kiểm tra. PN-0005 readonly, không cho sửa/sinh mã server. Dropdown loại nhập/NCC vẫn chỉ có dữ liệu fixture hiện có (Nhập hàng/Minh Phát), không bịa nhà cung cấp mới hoặc API CRUD.

## Cấu trúc và dữ liệu

- Scoped port `inbound/select-control.mjs` kế thừa trực tiếp P05 r07, đổi namespace p04; source P05 không bị sửa. CSS được port có scope P04; giữ shared app-surfaces và khung Home494×950, nội dung cuộn riêng.
- `inbound/validation.mjs` chỉ có validator P04; flow vẫn không Post/đổi tồn, receipt phải khớp. `newAttempt` chỉ áp cho terminal có tên cụ thể, không mọi message/error.
- UI state codeValue/error/tone/touched/expanded được reset theo documentId mới, không reset nháp khi chỉ mở lại. Nguyên raw mã lưu trong attempt; lý do lỗi được giữ trong audit, copy UI dễ hiểu hơn.
- Import/CSS version p04-sync-r05 từ auth→home→inbound→flow. Không sửa module/outbound/geography/source fixture/history/nfc/lookup. Không reload tab nháp người dùng trong quá trình kiểm tra.

## Kiểm tra và ảnh

- `node --test tests/*.mjs tests/*.cjs`: **133/133 PASS**, gồm3 test P04 mới về note không truncate, mã trắng, newAttempt terminal/pending/UNKNOWN và metadata malformed. [Output](evidence/revision-05/node-tests.txt).
- `node scripts/check_inbound_sync.cjs`: **8 nhóm PASS**,6 viewport340×420/390×844/494×1000/768×1024/1440×1000/1869×940. Popup không đẩy footer, focus S01, empty/valid/duplicate/invalid/raw safety, Escape/unsent value, camera compact, frame/footer, review/back, picker tại kết quả, 12/11, UNKNOWN/check. [Kết quả](evidence/revision-05/browser-results.json).
- `OUTBOUND_EVIDENCE_DIR=handoff/P04/evidence/revision-05/outbound node scripts/check_outbound_ux.cjs`: **8 nhóm PASS**,6 viewport. [Kết quả](evidence/revision-05/outbound/ux-results.json).
- Home lần đầu14 nhóm hành vi xong nhưng assertion network thất bại: P05 r07 có GET provinces.open-api.vn trong khi test cũ yêu cầu không request ngoài. Đã giới hạn ngoại lệ đúng GET `/api/v1/`, giữ reject nguồn ngoài khác; kết quả lần chạy lại ghi ở `home-final/browser-results.json`.
- Hồi quy Home lần cuối **14/14 PASS**: [kết quả](evidence/revision-05/home-final/browser-results.json). Hồi quy Nhập kho đầy đủ **11/11 PASS**: [kết quả](evidence/revision-05/inbound-regression/browser-results.json). Tổng41 nhóm browser PASS ở4 suite, không pageerror. `check_inbound.cjs` chọn back đầu tiên (header) khi S03 có thêm back footer; không bỏ assertion giữ phiếu/timeout/logout.
- Test popup lần đầu đếm2 listbox nhưng role query chỉ thấy1 đang mở: sửa expected1; giữ log thất bại cũ `failure.json`; kết quả hiện hành là `browser-results.json`.
- Actual đã xem: [S01/dropdown](evidence/revision-05/S01-supplier.png), [mã hợp lệ](evidence/revision-05/S02-valid.png), [trùng](evidence/revision-05/S02-duplicate.png), [lỗi](evidence/revision-05/S02-invalid.png), [review](evidence/revision-05/S03.png), [kết quả](evidence/revision-05/S04.png).

UI mới cần user review; không tuyên bố pixel-perfect B04. Behavior kiểm bằng fixture, WMS/camera/bàn phím thiết bị thật chưa kiểm chứng. Giữ91 panel, không mở prompt mới, không push/merge/deploy.
