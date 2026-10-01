# P01 — Context v2.0 và số đo trước triển khai

> Lịch sử trước triển khai. Các quyết định dùng icon/asset fallback ở dưới đã bị người dùng phản hồi là lệch LOCKED; KHÔNG tái sử dụng chúng như phê duyệt. Xem REVISION_02.md và ../CONTRACT_CONTEXT.md cho authority, phép sửa trước và trạng thái hiện hành.

Ngày 2026-09-25. Yêu cầu hiện hành: áp dụng contract v2.0 rồi thực thi đúng P01, không tự chạy P02–P24. Tài liệu là specification trong phạm vi được người dùng yêu cầu; các chỉ thị publish cũ/đề xuất API không cấp quyền thực thi ngoài phạm vi.

## Nguồn và target

- `source_commit=da9f623a19d0359c3e80c14f8cc612636ec6ab78`, workspace `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`, `target_kind=prototype`.
- VERIFIED_SOURCE: source editable HTML/CSS/JS trong docs/flows; không có manifest/source production ngoài dependencies theo audit cũ đã kiểm. Không sửa dist, gallery hoặc ảnh baseline.
- Giữ nguyên thay đổi có trước: docs/flows/warranty-components/flow.js và tests/warranty-component-history.test.cjs. Hồ sơ cũ tại ../contract-work giữ nguyên, không lấy các PASS cũ làm nghiệm thu P20 mới.
- Không thấy AGENTS.md áp dụng trong workspace/tổ tiên hoặc audit cây repo. README/HANDOFF/asset README đã đọc; DEV_PROPOSAL là PROPOSED, không phải auth contract.
- OBSERVED_IMAGE: B01 đính kèm và ảnh LOCKED_ORIGINALS có SHA256 `260e483a6447af2fb84cd5c1a5c5f5d75bd1a756ec6e37d69e0743aea5bd5853`.
- Gallery live đã chọn Tất cả 24 và xác minh Đăng nhập & Xác nhận phiên đứng đầu; deployed commit UNKNOWN.
- Entrypoint mới: docs/flows/auth-session/index.html. Chạy từ repo: `python -m http.server 8765 --bind 127.0.0.1 --directory docs`. Không có build/lint/typecheck configured; dùng node --check, node --test và trình duyệt local.
- Cập nhật sau kiểm tra: lệnh http.server ban đầu có MIME `.mjs=text/plain` do Windows; dùng `python scripts/serve_preview.py` tại port8766. Xem REPORT cho kết quả thật.

## Số đo OBSERVED_IMAGE / estimated (không phải CSS gốc)

Ảnh B01 1448×1086 px là board, không phải viewport. Crop chữ nhật nội dung đề xuất: S01 (211,114,438,834), S02 (800,114,438,834), bỏ status bar/island/home indicator/caption. Do ảnh phối cảnh, không có DPR/zoom/font nguồn gốc được xác minh; crop dùng đối chiếu định tính, không pixel PASS.

| Hạng mục | Estimated từ B01 | Độ chắc chắn / triển khai |
| --- | --- | --- |
| Vùng nội dung | 438×834 mỗi panel | Trung bình; reference chẩn đoán, không áp 390×844 của board 17–22 |
| Brand | x26/y10; logo khoảng56×58; text16/14 | Trung bình; thiếu logo gốc; dùng scan SVG có sẵn và ghi sai khác |
| Hero | S01 card y285; S02 card y276; ảnh kéo dưới card | Trung bình; giữ thứ tự và tỷ lệ |
| Heading | Login 34/36; greeting22/26, name36/40; body18/25 | Thấp; font original UNKNOWN; dùng Arial hệ thống đã có trong source fallback |
| Card | x14, width410; S01 height470; S02 height482; radius15 | Trung bình; shadow nhẹ estimated |
| Padding/gap | card20, top28 login; field gap20; CTA gap22–24 | Trung bình |
| Controls | input56; CTA66; logout58; radius11 | Trung bình |
| Colors | primary khoảng#005676; ink#083653; muted#627f94; field#f6fafb | Thấp; riêng P01, không copy palette 17–22 |
| Icons | fields24; logo42; avatar68; warehouse28 | Trung bình; tái sử dụng SVG source, không tracing |
| Footer | khoảng y787–815, text12/11, line hai bên | Trung bình |
| Crop ảnh | kho sâu/nhân sự phía phải | Thấp: approved asset pack không cùng bố cục exact B01 |

## Quyết định

1. UI là control/text thật, không ảnh board làm app. Không device shell/status bar giả. Mobile cuộn tự nhiên, safe-area; desktop chỉ căn giữa reference.
2. Fixture tách namespace module `hn-scanner-auth-preview-v1`, chỉ trong bộ nhớ; không đọc/ghi token/localStorage production, không HTTP auth. Username/password gửi nguyên văn vào adapter; không trim/lowercase/normalize/min/max tự đặt. Demo credentials công khai chỉ là fixture.
3. Session/danh tính/kho/quyền lấy từ adapter fixture; role chỉ hiển thị. Start kiểm lại session và quyền; UNKNOWN không thành công và không cho retry mù. Logout hủy phiên và loại kết quả pending cũ; guard history/hash/pageshow.
4. P02/P14 chưa có route editable. Dùng sự kiện navigation nội bộ PROPOSED cho future integration, hiển thị pending rõ trong preview; không tạo Home hay recovery giả.
5. Duy trì đủ 91 panel trong SCREEN_COVERAGE.csv theo BOARD_INDEX, các P chưa làm là NOT_STARTED. Không coi metadata CSV này là công việc spreadsheet/phân tích bảng tính.

## Blocker / sai khác được biết trước

- UNKNOWN: source auth production, username/password policy, phiên/ca hợp lệ và endpoint revoke/start/reconcile. Integration BLOCKED.
- UNKNOWN: logo gốc, user/eye/shield/play/logout SVG của B01. Reuse scan/lock/info/warehouse/arrow từ flow.js; nút mắt dùng ký tự mắt font hệ thống; không tạo bộ icon mới. Các khác biệt này cần tài nguyên gốc trước visual PASS.
- Asset staff_warehouse là close-up khác B01; không sinh ảnh/cắt screenshot thành asset chuẩn. Crop CSS tối ưu trong giới hạn asset được cung cấp.
