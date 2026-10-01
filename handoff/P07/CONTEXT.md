# P07 — quyết định và số đo trước triển khai

2026-09-26. User tạm chốt P06, cho phép triển khai P07; các state đồng bộ có thể bổ sung sau. Target=prototype trong docs/flows/nfc. HEAD thực tế da9f623a19d0359c3e80c14f8cc612636ec6ab78; giữ toàn bộ working copy P01–P06 và warranty. Không AGENTS áp dụng tìm thấy. Không package.json ở root; chạy python scripts/serve_preview.py (server local 8766 đã có).

Đã đọc P07_The_NFC.md, BOARD_INDEX.csv, Contract v2.0 người dùng cung cấp, HANDOFF và DEV_PROPOSAL local, P06 REVISION_04 và controllers Home/P03/P06. Web tool không mở được gallery/ảnh remote; git object đúng commit đối chiếu byte với B07, evidence/baseline-source.json. Proposal không phải API được duyệt.

## Số đo trước code

OBSERVED_IMAGE — **estimated**, B07 1672×941. Bốn khung x42/452/853/1258, y17–886, rộng373/367/368/374. Status bar y17–60 bỏ vì shell không yêu cầu; header app khoảng48px; content bắt đầu y108; footer S01 y813–886 (~73), S02–S04 không footer nav. Padding14/gap10–12, card radius10, top content radius20, border1, bóng xanh rất nhẹ; search37/tab36/card94; CTA55; title22/body16/meta14; icon24; thumb56×64. Vùng phone artwork x513–756,y384–574 (chỉ artwork trang trí, không lấy chữ/control). Gradient #04334c→#00577c, ink#071568, line#e0effc, green#00ad61. Font exact UNKNOWN.

VERIFIED_SOURCE — Home shell494×950, fitPreview cùng P06; Arial local/system, footer75. Adaptation dự kiến: header76, padding18/gap14, search50/tab46, card128; font title26/body20/meta17; radius14/top24, icon28. S01 dùng nav chung; S02–S04 nav ẩn theo B07, cuộn nội bộ, CTA giữ dưới cùng. Không dựng status bar/caption.

## Quyết định có nguồn

- OBSERVED_IMAGE: 4 panel; count8/5/2 metadata của adapter fixture, 5 card được nhìn thấy chỉ là phần mẫu. Không cộng hai tab để sửa count8. Tạm khóa là trạng thái riêng có sẵn trong board.
- VERIFIED_SOURCE: tái sử dụng icon repo; artwork điện thoại chỉ lấy phần minh họa sẵn có của B07, không tracing/tạo ảnh mới/ảnh full-screen UI. Hình hộp dùng asset demo P06 đã được phép, ghi rõ chưa là ảnh Designer.
- OBSERVED_IMAGE: sản phẩm mặc định P07 là fixture serial riêng HN12345 từ B07; không sửa serial=null của item P06. Khi chọn qua P06, dùng nguyên id/code/SKU/serial P06, không tự suy serial từ code. Dữ liệu mặc định hai board chưa là mapping WMS chung.
- UNKNOWN: contract list/filter/status/capability/link/status-check/device/write/read-back chưa cung cấp. Adapter chỉ fixture nội bộ, không khai API/enum server, không gọi NFC thật. Success phải có receipt từ adapter được đánh dấu fixture; read/prepare không đủ. Chặn gửi trùng, conflict, UNKNOWN/retry mù; kho dừng chặn ghi và giữ context.
- CONFIRMED_HANDOFF: NFC audit cần nguồn event; không tạo P22 event từ trạng thái thẻ. P15/P17 route/context là pending dependency, hiển thị cảnh báo tại chỗ, không coi board đích đã hoàn thành.
- VERIFIED_SOURCE: picker P03 có đúng4 nghiệp vụ, không có NFC. Giữ picker nguyên, NFC vào từ Home; P03 vẫn dùng cho tab Quét mã. P06 chọn sản phẩm được nối trong chế độ chọn, không thêm panel baseline.
