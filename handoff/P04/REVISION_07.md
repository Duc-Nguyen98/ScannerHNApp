# P04 r07 — rà soát ổn định và sửa lỗi UI/UX nhỏ

Phạm vi yêu cầu28/09/2026: luồng Nhập kho hiện tại và điểm nối Home/P03. HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; target prototype. Đã đọc AGENTS.md và `shared/UI_STANDARD.md`: icon nét mảnh/pastel lấy palette `operation-icons.css`, giữ shell494×950 và91 panel. Workspace có công việc đồng thời trên P01/P06/P07/P08/P09; không ghi đè tiến độ đó.

## Lỗi tái hiện và bản sửa

| Trước sửa | Sau sửa |
|---|---|
| End từ trigger NCC focus mục cuối nhưng mục nằm dưới vùng nhìn thấy (y1417 so với list bottom846) | Cuộn đúng option vào danh sách khi mở bằng End; giữ focus và popup trong app. |
| Đang chọn NCC-008, mở search rồi Enter rỗng lại chọn NCC-001 | Query rỗng giữ mục đang chọn; query có chữ vẫn chọn kết quả đầu theo thao tác Enter. Không còn đổi NCC ngoài ý muốn. |
| Tab từ search đóng ngay popup, không tới nút × | Tab tới Xóa tìm kiếm khi có query; Shift+Tab quay lại search; Tab tiếp theo rời popup. Không trap focus hoặc tự chọn NCC. |
| Thu gọn ô mã sai hiện lý do chứa fixture/P06/P17 trong app | Hiển thị copy dễ hiểu ở inline lẫn feedback; raw/reason gốc vẫn giữ trong audit. |
| Sau gửi bị từ chối, Back cho tới form/quét nhưng request đã khóa nên nhập không có tác dụng | Giữ ở Review sau mọi request, khóa Back ở controller và UI. Gửi lại phiếu dùng nguyên request; Về Trang chủ cho lần mới sau kết quả đã xác định. UNKNOWN vẫn chỉ đối chiếu, không retry mù. |
| Note bị chặn bởi kho dừng có thể để lại nội dung vừa gõ trên UI dù flow không nhận | Khôi phục input/counter về giá trị được giữ; P03 giữ focus. Snapshot công cụ cập nhật từ state thật sau input, không hiển thị note cũ. |
| Adapter kiểm mã trả null/throw/sai raw/SKU/quantity có thể crash hoặc tạo dòng hỏng | Fail closed: không thêm accepted; giữ raw trong lượt lỗi và báo chưa xác minh. Chặn NaN/âm/thập phân/chuỗi/overflow, không tự sửa số lượng. |

Bằng chứng trước sửa: [before/results.json](evidence/revision-07/before/results.json),5 lỗi UI được bắt; không gộp chúng thành một PASS giả. Các case trước–sau tương ứng nằm trong cùng script stability.

## UI/UX bổ sung

- Thông báo rõ phiếu đã gửi đang giữ nguyên để retry; đổi CTA thành **Gửi lại phiếu** sau từ chối xác định. Dùng tokens metadata trung tính của hệ thống, không lẫn màu nhận diện nhập với màu trạng thái.
- Ghi chú Review giữ xuống dòng như người dùng nhập.
- Không thêm modal/board, không đổi type/NCC15 mẫu, không thêm planned/giao hàng. Màu icon hiện có được kiểm ở S04; layout/header/footer giữ nguyên trên6 viewport.
- Cách gửi vẫn record→chờ Web, không Post hoặc thay đổi tồn. Mã test và schema production không thay đổi. Các loại Nhập linh kiện/Khác vẫn là metadata fixture, chưa có catalogue kiểm mã production theo loại.

## Kiểm chứng trong phạm vi P04

- `node --test tests/inbound.test.mjs`: **26/26 PASS**. [Log](evidence/revision-07/inbound-node-tests.txt). Thêm3 tests về frozen request, phản hồi kiểm mã bất thường, receipt muộn/dispose.
- `node scripts/check_inbound_stability.cjs`: **12/12 nhóm PASS**,6 viewport. [Kết quả](evidence/revision-07/final/results.json). Bao gồm phiếu mới, retry cùng payload, nháp, IME, kho dừng/P03 focus, UNKNOWN→Back/picker/check, ghi chú bị chặn và palette chung.
- Catalogue **6/6 PASS**,6 viewport: [kết quả](evidence/revision-07/catalogue-final/browser-results.json). Test có đợi2 animation frames sau đổi viewport trước đo, vì resize observer cập nhật scale; không nới assertion vị trí popup/footer.
- Đồng bộ UX **8/8 PASS**,6 viewport: [kết quả](evidence/revision-07/sync/browser-results.json).
- Hồi quy Nhập kho đầy đủ **11/11 PASS** trên server riêng: [kết quả](evidence/revision-07/inbound-final/browser-results.json). Tổng **37 nhóm browser PASS** ở4 suite; không tính lại các suite lịch sử chưa chạy lần này.
- Ảnh đã xem: [End focus đúng](evidence/revision-07/final/01-keyboard-end.png), [mã sai](evidence/revision-07/final/02-invalid.png), [gửi thất bại/retry](evidence/revision-07/final/03-rejected.png), [UNKNOWN](evidence/revision-07/final/04-unknown.png), [kết quả nhỏ](evidence/revision-07/final/05-result-340x420.png).

Không pageerror trong các kết quả PASS. Ma trận340×420,390×844,494×1000,768×1024,1440×1000,1869×940. Bàn phím thiết bị/hardware/backend thật NOT_RUN.

## Quan sát ngoài phạm vi và môi trường kiểm thử

- Hai lượt toàn repo trong lúc các chat khác đang sửa: [lượt đầu](evidence/revision-07/node-initial.txt)188/189 PASS,1 lỗi checksum bảo vệ NFC trong test P08; [lượt sau](evidence/revision-07/node-tests.txt)189/190 PASS,1 assertion route NFC khi kho dừng trong test P03 không còn khớp source NFC mới. Không sửa source/test NFC/P08 để làm xanh kết quả; đây không phải xác nhận toàn app đạt. Cần lượt tổng hợp sau khi công việc đồng thời ổn định.
- Preview8766 gián đoạn trong một lượt hồi quy (ERR_CONNECTION_REFUSED). Chạy server kiểm thử riêng trên loopback8774 bằng `python scripts/serve_preview.py --port 8774`; thêm `INBOUND_PREVIEW_URL` cho stability/full-inbound scripts để không restart/ảnh hưởng tab user. Các file thất bại trước đó giữ nguyên để truy vết.
- Test note lúc đầu đọc snapshot công cụ cũ; phát hiện và sửa việc cập nhật snapshot ở input (state thực không mất note). Bản kiểm cuối đo cả input, snapshot, focus và mở lại phiếu đều PASS.

## File và việc còn lại

Sửa `inbound/select-control.mjs`, `inbound-flow.mjs`, `inbound.mjs`, `style.css`; version import liên quan; thêm stability script/tests, điều kiện output/viewport trong test catalogue. Giữ source các màn khác và styles chung.

Đề xuất tiếp theo cần nguồn tích hợp: adapter catalogue sản phẩm/linh kiện theo loại nhập; lưu nháp bền theo auth/document/version; record/status/idempotency thật và đích P12. Không triển khai API hoặc thêm quy tắc chưa được chốt để che các thiếu hụt này. Visual mới chờ user review; behavior P04 PASS fixture; integration BLOCKED. Không push/merge/deploy.
