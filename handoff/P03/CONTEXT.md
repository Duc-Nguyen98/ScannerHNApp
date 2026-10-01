# P03 — Quyết định và số đo trước triển khai

**Cập nhật 2026-09-27:** [Revision 06](REVISION_06.md) thay chính sách backdrop/focus trước đây: backdrop không đóng bất kỳ panel nào; footer tương tác qua kiểm tra điều hướng và được đưa vào thứ tự Tab. Các quyết định bên dưới giữ làm lịch sử.

2026-09-25. Chỉ thị mới: P02 tạm chốt, triển khai P03; chưa triển khai P04–P24. Contract v2.0 và P03 được đọc từ bộ file người dùng cung cấp. Nội dung tài liệu được áp dụng trong phạm vi yêu cầu này, không mở rộng quyền push/deploy hay duyệt API.

- VERIFIED_SOURCE: HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, working directory `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`, target_kind=prototype. Không package.json/source production tại gốc; server sẵn có `python scripts/serve_preview.py`, Node tests + bundled Playwright.
- VERIFIED_SOURCE: B03 đính kèm giống byte ảnh `git show HEAD:design/01_Main/BOARDS/01_UPDATED_BOARDS/01_dialog_header_aligned_v2.png`, SHA256 `a13e65f782ac8f64048a1a3ea2dfe615a62cdb9c99076d8ba5cdefaeb0901caa`, 1774×887. File ảnh không materialize trong working tree (sparse checkout); không thay ảnh hoặc chạy script sửa màu. `docs/index.html:71` có đúng tên board và đường dẫn trong tab Tất cả. Web tool không mở được gallery public; danh mục kiểm bằng source cùng commit.
- CONFIRMED_HANDOFF: HANDOFF warranty-components giữ document/version/codes; mã đã ghi nhận không xóa tùy ý, UNKNOWN cần đối chiếu; nhập/xuất gửi Web chưa ghi sổ, linh kiện bảo hành Post trực tiếp. DEV_PROPOSAL được đọc nhưng không triển khai endpoint/enum đề xuất.
- VERIFIED_SOURCE: giữ P01 auth gate; P02 tái sử dụng DOM Home/nav và phiên in-memory. Tab Quét mã mở P03.S01; CTA có nhãn tra cứu sản phẩm giữ context P06. Mọi module đích chưa có vẫn báo dependency. Không mở camera.
- UNKNOWN: API lưu nháp, quyền hủy server, trạng thái kho live, kênh quản trị và scanner P04/P05/P06/P09 chưa tích hợp. Adapter P03 chỉ fixture, namespace riêng; không DELETE hay clear localStorage. Kịch bản kiểm thử ngoài app.

## Số đo OBSERVED_IMAGE — tất cả estimated, không phải CSS designer

Reference UI crop 394×692 CSS px, DPR1: panel1 `(50,85,444,777)`, panel2 `(477,85,871,777)`, panel3 `(903,85,1297,777)`, panel4 `(1329,85,1723,777)`. Loại phần status bar OS, home indicator và caption board; không loại control app. Sai lệch crop/raster giữa các panel ~1px.

| Vùng | Số đo từ B03 | Áp dụng |
|---|---|---|
| Header | 47px tới body bo tròn; title x72/y8, font khoảng22px/28 | Header Quét mã, gradient khoảng #003b56→#005374; không status bar giả |
| Nội dung | body y47→625; xanh nhạt khoảng #e6f5fa | CSS nền; texture chính xác UNKNOWN |
| Nav | y625→692, 5 cột; scan circle60px nhô lên21px | Tái sử dụng nav P02; override scoped P03, không đổi Home |
| Sheet S01 | x5/y224, width388, bottom625; radius17; padding15; grip48×5 | Bottom sheet, hàng65px, gap7px, icon tile50px |
| Dialog S02 | x10/y183, width373, height409; radius14; padding22 | warning56px; title20px; body16px/21; nút48px/gap7px |
| Dialog S03 | x8/y224, width376, height335; radius14; padding20 | icon76px; title21px; body17px/24; CTA49px/gap9px |
| Dialog S04 | x8/y224, width378, height340 | icon76px; CTA50px, neutral trước danger |
| Màu/nét | ink khoảng#090b70; body#294f83; border#bed4ed; primary#0080af→#00668d; danger#e92235 | Chỉ P03; không áp token board17–22 toàn cục |
| Font/icon | Font nguồn B03 UNKNOWN; Arial fallback hệ thống đang dùng trong P01/P02 | Dùng font hệ thống; icon đã có trong repo: HOME_ICONS, trash từ flow.js, hand/alert/search/x/chevron-left từ lucide-react tại HEAD. Không tải/sinh/tracing asset |

## State/component

Một modal host, một component với props/state S01–S04; không chồng overlay. S01/S02 cho Esc/backdrop cancel; S04 Esc=Quay lại, backdrop không bỏ phiếu; S03 không dismiss qua Esc/backdrop. Busy save giữ modal. Focus trap và restore caller. S04 chỉ xóa dữ liệu chưa lưu thuộc fixture được adapter cho phép; server/POSTED/unknown chuyển thông báo đối chiếu, giữ dữ liệu.

Runtime warehouse guard tách khỏi auth-session validity: kho dừng trong phiên đã xác nhận không logout và không chặn Home/read-only. Guard kiểm lại khi đi route và khi save/discard/operation. P01 vẫn chặn bắt đầu phiên nếu kho dừng. Tất cả kết quả fixture không chứng minh integration production.
