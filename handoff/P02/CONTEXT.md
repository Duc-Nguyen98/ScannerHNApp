# P02 — nguồn và số đo trước code

2026-09-25. Người dùng tạm chốt P01 và yêu cầu thực hiện P02; không mở phạm vi P03–P24. Contract/P02 là specification cho yêu cầu này, không cấp phép publish hoặc áp dụng API đề xuất.

- VERIFIED_SOURCE: HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target_kind=prototype; workspace `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. Không có AGENTS áp dụng. Chạy `python scripts/serve_preview.py`; không có package/build manifest app.
- B02 đính kèm và `design/01_Main/BOARDS/00_LOCKED_ORIGINALS/02_Trang_chu_ORIGINAL.jpg`: SHA256 `ed0d7b90fdb66778cab0ff53b9537785e55ec60227d7666e5d7693f42eb15ef8`.
- Giữ tất cả thay đổi có trước, nhất là P01 và `warranty-components/flow.js`. P01 chỉ nối dependency Home tại entrypoint; controller/auth adapter/CSS giữ nguyên.
- CONFIRMED_HANDOFF: `docs/flows/warranty-components/HANDOFF.md`: Home Xem tất cả → Lịch sử; không duyệt/Post nhập xuất. DEV_PROPOSAL chưa là API được duyệt.
- VERIFIED_SOURCE: `warranty-components/?mode=screen&scene=history-hub` có hub thật ở mức prototype. Các trang khác không có implementation đúng P/ID được yêu cầu: chỉ giữ navigation context và báo dependency, không chuyển sang scene có fixture khác ID.

## OBSERVED_IMAGE — số đo đều estimated, không phải CSS gốc

Board 1536×1024, vùng điện thoại x≈522..1015, rộng494px. Loại status bar hệ điều hành y0..47 và home indicator y998..1023 khỏi crop ứng dụng. Reference chẩn đoán: 494×950 CSS px, DPR1, zoom1; chưa có viewport/font/ngưỡng pixel được Designer xác nhận.

| Thành phần | Số đo estimated trong crop ứng dụng | Độ chắc chắn |
| --- | --- | --- |
| Header/hero | brand y10, avatar52; intro y89; KPI bắt đầu y183 | Vừa |
| Hero crop | nền kho sâu, trục phối cảnh giữa; kéo tới y≈242 | Thấp; exact asset UNKNOWN |
| Padding | nội dung19–20; gap grid14; khoảng section18–24 | Vừa |
| KPI | 456×98; radius14; cột≈156/160/140; số32/24, nhãn14 | Vừa |
| Heading | lời chào28/34; section20/24; body16/20; phụ13/18 | Thấp; font gốc UNKNOWN |
| Grid | x19/y338; 222×82; hàng gap13; radius14 | Vừa |
| Icon | tile44; glyph26–30; logo36; nav24; scan circle62 | Vừa; exact raster UNKNOWN |
| CTA scanner | x19/y525,456×82; radius14 | Vừa |
| Recent | heading y629; rows y658/725/792; mỗi hàng≈66 | Vừa |
| Footer | y875; vùng app≈75; 5 mục, scan nhô≈20 | Vừa |
| Color/shadow | ink≈#07334b; cyan/deep blue; near-white body, shadow nhẹ | Thấp; không áp token board17–22 |

## Quyết định kỹ thuật

- Home cùng document với P01 để giữ phiên chỉ trong bộ nhớ; không đưa session/token/password vào URL, history hoặc localStorage. Direct Home không có phiên → P01.
- Reuse quyền fixture duy nhất đã có `warehouseOperations`; không tự thêm quyền module. Route/action kiểm lại session, kho và permission, fail closed khi UNKNOWN. Quyền module/backend chưa biết → integration BLOCKED.
- KPI/badge tách data adapter fixture; số1/4/08:30/3 không suy từ danh sách. Nếu nguồn không xác minh, hiển thị UNKNOWN; giữ nhãn baseline. Không thêm approval action.
- P22 tái sử dụng source hub trong iframe chỉ ở phiên prototype đã qua guard, Back về Home giữ DOM/scroll/focus. Không viết lại hub/P22.
- Các đích khác có descriptor P04/P05/P06/P07/P09/P10/P12/P13 và documentId/caseId. Pending boundary là trạng thái của điều hướng, không coi là module đã hoàn thành.
- Đã hỏi quyền tạm dùng ảnh/font P01 và icon repo vì chưa xác minh khớp B02; chưa coi im lặng là chấp thuận. Tiếp tục logic và layout độc lập trong lúc chờ.
