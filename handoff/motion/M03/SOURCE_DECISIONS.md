# M03 — nguồn và quyết định

Yêu cầu: thực thi MOTION_P03_Dialog_co_dinh.md từ bộ file Desktop do user chỉ định ngày30/09/2026. Đọc MOTION_CONTRACT.md cùng thư mục, AGENTS.md/UI_STANDARD, context contract v2, FLOW_GATE.json, M00 REPORT/OWNERSHIP và M02 REPORT. FLOW_GATE.gate_status=PASS; M00 đã có primitive được promote sang shared/motion, M01/M02 đã dùng. Không cài thư viện/đổi stack.

| Nguồn | Quyết định áp dụng |
|---|---|
| Baseline board B03 tại snapshot da9f623…; ảnh lưu handoff/P03/evidence/B03-reference.png | Không thay ảnh, font, nội dung, lề hoặc hình thức để hợp thức hóa motion. Baseline lịch sử không tự ghi đè các sửa user sau đó. |
| User-change còn hiệu lực: khung494×950, footerLOCK, backdrop vuông80%, không click nền để đóng; S04 destructive trap từ bản dựng hiện tại | Giữ nguyên DOM/control/paint. Chụp actual bốn panel trước sửa cùng494×950,DPR1 làm đối chiếu sau settle; before-source lưu byte nguồn trước sửa. |
| MOTION_P03 / MOTION_CONTRACT | Backdrop140ms, enter220ms/translate≤8px, exit160ms; kho dừng chỉ fade. Guard/domain đồng bộ tức thì, callback motion không gọi save/discard/navigation. Focus đến lựa chọn hoặc action an toàn. |
| M00/M01/M02 source | Dùng createMotionController, modalSheetMotion và token hiện có. Thêm tùy chọn fadeOnly/backdrop vào chính primitive đó, không tạo engine thứ hai. Auto tôn trọng OS reduced; reduced panel0ms/backdrop≤80ms; off0ms. |
| Overlay owner hiện hữu P03 và shared/app-modal | Giữ owner focus/inert/routing riêng của component; dùng một hàm khóa trang có reference count theo Document cho cả hai. Owner bị inert nhường keyboard/focus cho lớp trên. Không thêm provider/scroller. |
| Implementation choice cho exit | Giữ đúng subtree hiện có tối đa160ms, inert/aria-hidden/pointer-none, bỏ ID và role của cây đi; không clone data. State/scroll lock/focus cập nhật ngay. Reopen/route/security/dispose hủy effect cũ. |
| Flow gate stock-owner adapter | Giữ projection vào owner P04/P05, document/session/version/codes/fingerprint. Không đổi fixture, request, DELETE hoặc backend contract. |

Source/UI trước–sau đã lưu trong evidence; thay đổi focus khi dùng bàn phím là yêu cầu motion, không redesign. Các kết quả visual chỉ chứng minh giữ actual hiện hành; thiếu nguồn font/texture Designer và review toàn board vẫn theo báo cáo cũ. Virtualization: NOT_NEEDED cho dialog ngắn; native overflow của dialog dài được giữ và hồi quy.
