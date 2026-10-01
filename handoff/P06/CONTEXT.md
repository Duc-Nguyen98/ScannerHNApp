# P06 — nguồn và quyết định trước triển khai

Ngày 2026-09-25. User tạm chốt P05 và chỉ định triển khai P06. HEAD thực tế da9f623a19d0359c3e80c14f8cc612636ec6ab78, working copy có P01–P05 và sửa warranty trước đó; giữ nguyên. Target=prototype, docs/flows/lookup; chạy python scripts/serve_preview.py. Không package.json/source production ở gốc; không sửa dist/gallery.

Đã đọc P06_Tra_cuu.md, BOARD_INDEX.csv từ bộ ScannerHNApp_24_Prompts_v2.0, C:/Users/TAN MIE/Downloads/00_CONTRACT_CHUNG.md, HANDOFF/DEV_PROPOSAL local. Gallery public không truy cập được bằng web tool; đối chiếu git index/object local. Proposal không thành API.

## Số đo trước code

OBSERVED_IMAGE, tất cả số đo B06 dưới đây **estimated**, ảnh 1536×1024. Bốn màn x≈33/409/781/1156, y≈32, rộng≈348/344/347/348, cao≈913. Content y≈132–875; header app y≈76–132 (status bar ảnh y≈32–76 không dựng); footer≈70. Padding≈13, gap≈8, search cao38, tab32, card≈122; radius card≈10, top content≈18, border≈1; font title≈18, item≈16, body≈14, metadata≈12; icon≈24; ảnh list≈78×86, hero≈114×102, gallery≈70×65, object-fit contain. Header xanh đậm gradient≈#05344c→#005375, ink≈#001866, blue≈#007aca, line≈#e4eff8, white/cool white. Font exact UNKNOWN.

VERIFIED_SOURCE: Home .hn-screen rộng494/min-height950, fitPreview scale min(1, viewportWidth/494, viewportHeight/screenHeight), nav75. Tiếp tục shell494×950 cố định, cuộn nội dung bên trong, header/nav ổn định. P06 CSS riêng: header92; padding18; search48/tab42; card≈151; image100; title24/body18/metadata16; radius14. Đây là adaptation estimated theo shell đã chốt, không kéo méo ảnh baseline. Arial từ Home; icon SVG existing repo; không status bar/caption giả.

## Quyết định

- OBSERVED_IMAGE: đủ4 panel, stock12/10/1/1; vị trí6+3+2+1; 7 event mẫu giữ signed quantity từng event, không tính event từ tồn.
- VERIFIED_SOURCE: không có ảnh sản phẩm rời trong asset index ở commit (chỉ background/staff/board/screens). Không cắt board, không ảnh/icon thay sản phẩm; giữ ô ảnh và nhãn thiếu ảnh. Gallery slot nguồn ảnh pending.
- UNKNOWN: schema filter nâng cao, API đọc catalog/stock/events và capability in/bảo hành chưa có. Filter mở thông báo giới hạn, không bịa enum. Search/category và type/date theo board chạy fixture riêng. Counts128/36 là metadata fixture từ board, không tính bằng số card5/1.
- P06 read-only. SKU/code/serial khác trường; null hiển thị “—”, zero giữ0. Capability fixture khai báo riêng, không suy role. In tem=false; warranty/document permission chưa xác nhận=false, guard trong handler; không dựng tính năng in hoặc mànP09/P12.
- Home CTA/P03 lookup nối P06; scan shortcut dùng P03 và mang item context; không mở camera. Điều hướng nội bộ giữ query/category/scroll và itemId. Không làm P07+.

Visual cần user duyệt; thiếu ảnh/font exact là khác biệt thật. Backend/hardware không xác minh bằng fixture.
