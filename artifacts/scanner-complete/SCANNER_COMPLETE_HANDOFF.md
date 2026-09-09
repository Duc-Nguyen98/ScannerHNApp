# Hoa Nam Scanner — preview nghiệp vụ tích hợp

## Mở preview

Chạy `npm run dev:local`, mở `http://127.0.0.1:3000/scanner`.

Đây là preview tương tác cho DEV, **không phải app production và chưa gọi API/DB thật**. Mọi chứng từ, trạng thái thành công, thao tác NFC và media chỉ thuộc dữ liệu mock cục bộ. Khung “Điều khiển xem thiết kế” không thuộc UI production.

Phạm vi lượt này: ghép các nghiệp vụ phía APP; không chỉnh Dashboard, danh mục hoặc quản trị WEB. Route `/scanner` dùng component mới `scanner-preview.tsx`, không còn dùng luồng linh kiện đơn lẻ cũ. Các file bàn giao WI trước đây được giữ để truy vết, không còn là mô tả cuối cùng của route này.

## Phân chia WEB / APP

| WEB — quản lý thông tin | APP Scanner — vận hành |
|---|---|
| Danh mục SKU, linh kiện, kho, khách hàng | Tra cứu mã, xem tồn và chứng từ liên quan |
| Tài khoản, vai trò, cấu hình nghiệp vụ | Nhập kho: thông tin → quét → kiểm tra → gửi phiếu |
| Quản lý thông tin và báo cáo tập trung | Xuất kho: giao hàng → quét đủ → kiểm tra → gửi phiếu |
| Theo dõi thông tin hồ sơ, sổ giao dịch | Tiếp nhận, kiểm tra, sửa chữa, trả bảo hành |
| Không cần mở đồng thời với APP | Xuất linh kiện cho bảo hành; NFC; chứng từ; lịch sử |

Thiết kế tích hợp thực tế: APP và WEB là hai client độc lập truy cập dịch vụ nghiệp vụ dùng chung DB. Client không kết nối DB trực tiếp. Preview này chỉ có **một store trong trình duyệt**, không giả định đã có đồng bộ WEB/APP thật.

## Màn hình đã ghép

| ID | Màn/nhánh | Entry / action | Kết quả |
|---|---|---|---|
| SCN-01 | Trang chủ | Bottom nav; mở ca | Tổng quan, 4 tác vụ, tra cứu, chứng từ gần đây |
| SCN-02 | Tra cứu | Home / bottom nav | Nhập QR, barcode, serial, SKU; chọn mã nhanh |
| SCN-03 | Chi tiết sản phẩm | Tra cứu | Tên, SKU, kho, tồn, loại, phiếu và bảo hành liên quan |
| SCN-04 | Không tìm thấy | Mã không có | Lời nhắc sửa mã và CTA tra cứu khác |
| SCN-05 | Tạo phiếu nhập | Home → Nhập | Tên phiếu, kho, ghi chú |
| SCN-06 | Tạo phiếu xuất | Home → Xuất | Nhóm nhận, tên, SĐT, địa chỉ, số lượng |
| SCN-07 | Scanner nhập/xuất | Bắt đầu quét | Nhập mã, lựa chọn mã fixture, counter, danh sách mã |
| SCN-08 | Kiểm tra phiếu | Scan đủ điều kiện | Toàn bộ mã và số lượng, ngữ cảnh kho/hồ sơ/người nhận |
| SCN-09 | Kết quả lập phiếu | Submit mock thành công | Mã phiếu chờ duyệt, link chứng từ/hồ sơ |
| SCN-10 | Chứng từ | Home / nav | Search, trạng thái, danh sách phiếu liên thông |
| SCN-11 | Chi tiết chứng từ | Chọn phiếu | Dòng hàng, chờ duyệt/đã ghi sổ/đã huỷ; ghi sổ theo quyền |
| SCN-12 | Bảo hành | Home | Tìm hồ sơ, 6 trạng thái, tiếp nhận |
| SCN-13 | Tiếp nhận có mã | Tiếp nhận | Chỉ nhận hiện vật đã xuất, không tự đổi mã sai thành mất tem |
| SCN-14 | Tiếp nhận mất tem | Chuyển nhánh | Mô tả sản phẩm và lý do, khách hàng, lỗi, phụ kiện |
| SCN-15 | Chi tiết bảo hành | Chọn hồ sơ | Thông tin, Linh kiện, Ảnh & video, Diễn biến |
| SCN-16 | Cập nhật bảo hành | Chi tiết → kết quả/ghi chú | State machine, confirmation, timeline |
| WI-01 | Entry xuất linh kiện | BH đang kiểm tra/sửa chữa | Giữ đúng case ID; **không ép chọn SKU trước quét** |
| WI-02A | Linh kiện có mã | Quét LK-xxx | Mỗi hiện vật 1 cái, chặn lặp |
| WI-02B | Hộp linh kiện | Quét BOX-xxx | Modal quantity, nguyên dương, không vượt khả dụng |
| WI-03 | Kiểm tra linh kiện | Danh sách hỗn hợp | Cùng một phiếu có mã linh kiện + hộp/số lượng |
| WI-04 | Xác nhận xuất linh kiện | Review → dialog | Kiểm tra hồ sơ, kho, số mã và tổng số lượng |
| WI-05 | Kết quả / liên kết ngược | Gửi phiếu → result | XLK trong chứng từ và tab Linh kiện hồ sơ |
| SCN-17 | NFC danh sách | Home | Search, 5 bộ lọc trạng thái, hiện vật liên kết |
| SCN-18 | Gán thẻ | NFC | Nhận diện → ghi → đọc lại → xác nhận liên kết |
| SCN-19 | Tra cứu NFC | Chọn thẻ / sản phẩm liên kết | Về chi tiết sản phẩm |
| SCN-20 | Thu hồi NFC | Chip đang dùng | UID + hiện vật + lý do + xác nhận |
| SCN-21 | Lịch sử | Bottom nav | Nhật ký phiếu, NFC, bảo hành; link chứng từ |
| SCN-22 | Cá nhân | Nav | Kho, vai trò, hướng dẫn, đăng xuất |
| SCN-23 | Vào ca | Đăng xuất mock | Mở lại ca, không dùng tài khoản/mật khẩu thật |

Các biến thể trong bảng không tương đương số route độc lập; nhiều trạng thái sử dụng cùng component/state machine.

## Modal / dialog

1. Nhập mã thủ công.
2. Camera chưa bật → chọn nhập mã (camera thật chưa tích hợp).
3. Số lượng linh kiện trong hộp, có validation inline.
4. Xác nhận gửi duyệt phiếu nhập/xuất.
5. Xác nhận xuất linh kiện cho hồ sơ bảo hành.
6. Xác nhận ghi sổ: mã phiếu, kho, nghiệp vụ và tổng số lượng.
7. Huỷ phiếu chờ duyệt.
8. Chuyển trạng thái bảo hành và ghi chú.
9. Xác nhận tiếp nhận bảo hành.
10. Thêm/xem thông tin ảnh hồ sơ (fixture metadata, chưa phải file upload).
11. Hướng dẫn tra cứu NFC.
12. Thu hồi thẻ với UID/hiện vật/lý do.
13. Rời phiếu đang soạn, giữ draft trong phiên.
14. Đăng xuất mock.
15. Khôi phục dữ liệu thử (chỉ công cụ review, không thuộc app production).

Dialog dùng native `<dialog>`, modal focus, Escape, nút đóng và disabled lúc đang xử lý. Bộ lọc và ID được giữ khi quay lại qua stack. Draft scan giữ trong lần mở; chứng từ đã lập, tồn và hồ sơ lưu localStorage.

## Dữ liệu dùng thử

| Mã | Nội dung ban đầu | Dùng để thử |
|---|---|---|
| NEW-001 | Máy chờ nhập | Nhập → ghi sổ → xuất → ghi sổ → bảo hành |
| NEW-002 | Chờ nhập, đã thuộc PN-0001 | Chặn mã đang nằm trên phiếu chờ duyệt |
| NEW-LK-001 | Linh kiện chờ nhập | Nhập linh kiện |
| MAY-001, MAY-002 | Máy trong kho | Xuất kho / liên kết NFC |
| MAY-003…MAY-008 | Máy đã xuất | Các hồ sơ bảo hành seed |
| LK-001, LK-002, LK-003 | Linh kiện có mã, mỗi mã 1 cái | Xuất linh kiện, chống trùng |
| BOX-001 | Gioăng, 20 cái | Quantity 3 → còn 17 sau ghi sổ |
| BOX-002 | Ốc M8, 40 cái | Quantity validation |
| BH-001 | Đang kiểm tra | Có CTA Xuất linh kiện |
| BH-002 | Đang sửa chữa | Có CTA Xuất linh kiện |
| BH-003…BH-006 | Các trạng thái khác | Không có CTA xuất linh kiện |
| NFC-001 | Liên kết MAY-003 | Tra cứu NFC |
| NFC-002 | Chưa liên kết | Thử gán cho MAY-001 |

Mã/khách hàng trong seed là fixture phục vụ UI, không xác nhận tồn, danh mục hay thông tin khách thật. Store key: `hoanam-scanner-preview-v2`.

## Luồng E2E đã kiểm thử trực tiếp trên preview

| Flow | Evidence thực tế | Kết quả mock |
|---|---|---|
| BH-001 → LK-001 → quét lại LK-001 | Chặn trùng, counter không tăng | PASS |
| BH-001 → BOX-001 → 21 cái | Tồn 20 → lỗi vượt tồn | PASS |
| LK-001 + BOX-001 × 3 → review → confirm | 2 mã, tổng 4 cái, XLK-0002 chờ duyệt | PASS |
| XLK-0002 → quyền Nhân viên kho | Nút ghi sổ khoá | PASS |
| Đổi vai trò review sang Người duyệt → ghi sổ XLK | BOX-001 còn 17, LK-001 đã xuất; hồ sơ có phiếu XLK | PASS |
| NEW-001 → nhập → PN-0003 | Chờ duyệt, tồn chưa tăng | PASS |
| PN-0003 + ngoại tuyến → ghi sổ | Giữ phiếu, không đổi tồn; dialog báo chưa gửi | PASS |
| Trở về bình thường → ghi sổ PN-0003 | Thành công cục bộ | PASS |
| Xuất NEW-001 → PX-0004 → ghi sổ → tra cứu | Đã xuất, khả dụng 0, liên kết cả PN và PX | PASS |
| NEW-001 → tiếp nhận → BH-007 → Đang kiểm tra | Có hồ sơ, CTA linh kiện xuất hiện ở đúng trạng thái | PASS |
| MAY-001 + NFC-002 → nhận diện → ghi → đọc lại → confirm | Kết quả liên kết và event trong lịch sử | PASS giao diện, hardware MOCK |
| Home 320 và 430 | Grid hai cột, không bị cột nửa trang như audit cũ | Đã quan sát |

Ảnh trực tiếp: `artifacts/scanner-complete/screenshots/01…30`. Không dùng kết quả mock để nâng các ca NOT VERIFIED của audit production thành PASS.

## Giả định thiết kế — BA phải phê duyệt

- Mọi phiếu nhập/xuất/linh kiện qua Chờ duyệt trước ghi sổ. Ảnh BA chỉ xác nhận xuất linh kiện; **chưa chốt xuất ngay hay phải duyệt**. Preview chọn phương án an toàn để xem, không khẳng định API web hiện tại có bước này.
- Quyền trong preview chỉ 3 persona; không thay thế permission matrix thật. Quyền `warranty.component_issue`, nhập/xuất và Post cần map với hệ thống.
- Pending document giữ toàn bộ mã/hộp trong preview (kể cả hộp còn dư); cần chốt reservation theo số lượng cho thực tế.
- Ghi sổ kiểm tra lại toàn bộ, thất bại một dòng thì không đổi tồn dòng nào. Cần xác nhận all-or-nothing hay partial theo contract.
- Đóng bảo hành bị chặn nếu còn phiếu linh kiện chờ duyệt. Cần BA xác nhận.
- Không cho một mã mở nhiều hồ sơ bảo hành đồng thời. Cần xác nhận ngoại lệ.
- Hồ sơ đã đóng không thêm media trong preview. Cần chốt quyền bổ sung evidence muộn.

## Chưa triển khai, không được hiểu là hoàn chỉnh production

- Camera/QR decoder, file picker/upload/video, NFC phần cứng và read-back thực tế: chưa kết nối. Nút media thêm metadata fixture; NFC di chuyển state mock.
- Login chỉ là mở/đóng ca mock, chưa có auth/refresh token/RBAC backend.
- Address nhập một trường; chưa ghép danh mục tỉnh/xã chính thức và sheet search địa chỉ.
- Chưa có OCR, SKU mới, BOX nhập mới, scanner USB/Bluetooth, in nhãn, duyệt hàng loạt hoặc đơn xuất do WEB khởi tạo.
- Chưa có queue bền vững tự gửi/retry nền; offline/error giữ draft trong phiên và cho thử lại thủ công. Chưa persist draft khi reload.
- Chưa đồng bộ nhiều thiết bị/client, version conflict/server concurrency; localStorage không phải DB dùng chung.
- Chưa có API success/error contract thật. Không thể cam kết “99% nghiệp vụ / 100% yêu cầu” trước khi BA duyệt các điều trên.

## Hướng triển khai DEV tiếp theo

1. Dùng preview để duyệt screen/flow với BA; giữ phân chia WEB quản lý, APP vận hành.
2. Tách store và handlers thành adapter API. Không cho UI tự tăng giảm tồn khi chưa có server acknowledgement.
3. Backend kiểm tra quyền, case status, warehouse, stock, reservation, idempotency; ghi chứng từ + ledger + audit atomically.
4. APP và WEB đọc trạng thái chung qua API; refresh/subscription có version/ETag. Không cần một client mở để client kia chạy.
5. Gắn scan provider thực (camera/hardware/manual) vào một pipeline validate code; NFC reserve/write/read-back/confirm có recovery.
6. Bổ sung auth, address catalogue, upload/media progress, outbox, conflicts và test sandbox bằng tài khoản đúng quyền.
7. Acceptance test bắt buộc: nhận NEW → xuất cùng mã → bảo hành → xuất hỗn hợp mã + hộp → post → đối soát tồn và audit; lỗi/timeout/retry không tạo phiếu trùng.

## Kiểm tra code

- `node --test tests/scanner-model.test.mjs`: 8/8 PASS.
- `node node_modules/typescript/bin/tsc --project tsconfig.scanner.json --noEmit`: PASS.
- Lint scoped Scanner: PASS; file UI opt-out React Compiler lint vì callback renderer dùng ref trong event handler, không dùng React Compiler.
- Lint/typecheck toàn repo không được báo PASS: có source clone, bundle và thay đổi không thuộc lượt này trong artifacts/docs/work.
- Local Vite đã phục vụ `/scanner`, đã kiểm thử browser; không deploy public hoặc đổi hosting.
