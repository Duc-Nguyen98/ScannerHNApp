# M24 — preflight / ownership

FLOW_GATE PASS UI_FIXTURE, 24board/91panel; M00 PASS_HARNESS_READY; tracking M01–M23:87panel PASS cả3mode. Source HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78 + working copy motion M01–M23, chưa commit. Native HTML/CSS/ES modules; không cài engine/lib/provider/scroller/virtualizer.

| Panel | Nguồn / quyết định |
|---|---|
| P24.S01 | Giữ validation text tức thì và input đỏ; thêm viền lỗi tức thì theo MOTION_P24. STATIC_BY_DESIGN; sheet enter/exit dùng M19/AppModal, không shake/count-up |
| P24.S02 | B24 là panel kiểm tra mã riêng, không hiện camera trong panel này. M19 owner giữ accepted list; chỉ notice lỗi chạy M00 noticeFeedback140/OS-reduced80/off0. Không animate hoặc mở camera/NFC service |
| P24.S03 | REUSED M04/M05 shared scan-flow-feedback: hero160 sau record đã xác minh; reduced/off0 theo M00. Không controller thứ hai hoặc thay seed B24 PN12/PX10 |
| P24.S04 | STATIC_BY_DESIGN closed guard; REUSED M20 read state và M02 route. Mutation chặn ngay, chỉ lịch sử POSTED được đọc |

Số đo tĩnh theo source hiện tại và P24 r03; frame494×950, header/footer/native scroll giữ nguyên. S01 border đổi màu có nguồn từ prompt mới, không đổi border-width/layout. B24/P24 r03 là trace hình thức; không coi screenshot settle là chứng minh motion. Snapshot source trước ở before/source; capture5state (S03 hai biến thể)×3mode trước–sau, trace có thật, domain/operation parity.

Release gate M24 sẽ đọc đủ91 dòng motion, trạng thái runtime mở rộng có evidence trong các báo cáo M01–M23, chạy lại12 hành trình FLOW_GATE với auto/OS reduced/off. Gate chỉ UI_FIXTURE; business tracking/backend/hardware không nâng PASS. FINAL_BRIDGE/FINAL gốc chỉ bàn giao sau READY, không thực thi publish trong M24.
