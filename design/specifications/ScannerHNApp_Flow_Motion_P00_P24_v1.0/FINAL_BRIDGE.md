# FINAL_BRIDGE — Gửi cùng prompt FINAL đã đính kèm

Yêu cầu bổ sung cho lần chạy FINAL này: tôi đã chạy bước FLOW_LINK_GATE và bộ MOTION_P00–P24. Hãy đọc `handoff/flow/FLOW_GATE.json`, `handoff/motion/MOTION_RELEASE_GATE.json`, các coverage/báo cáo và source hiện hành để xác minh thực tế; không coi lời nói này là bằng chứng PASS.

Thực thi file `ScannerHNApp_FINAL_Noi_Luong_Public_Preview_v1.0.md` đi kèm trên chính kết quả đó. Giữ nguyên routing, seed/scenario, motion tokens/owner, reduced-motion và primitive đã kiểm. Phần nối luồng/fixture của FINAL dùng lại kết quả đã đạt; chỉ sửa thiếu sót hoặc regression có bằng chứng, không lặp lại toàn bộ quá trình dựng24board hay cài engine khác. Điều này vẫn giữ đầy đủ nghĩa vụ kiểm tra và công khai giới hạn của FINAL.

Review Mode ngoài khung app bổ sung lựa chọn auto/reduced/off để QA đối chiếu; auto tôn trọng OS, không bật full bất chấp OS reduced. Hiển thị fixture/build/token version và link scene/panel; không đưa thông tin kỹ thuật vào các màn nghiệp vụ. Các state mới ở Review Mode tái sử dụng domain fixture/adapter đã có.

Nếu FINAL làm thay đổi router, primitive, fixture hoặc guard, vô hiệu evidence cũ ở phần bị ảnh hưởng và kiểm lại các cạnh/state liên quan. Chạy kiểm tra end-to-end và visual hiện hành đủ để bàn giao; không coi PASS build trước là PASS bản deploy mới.

Xuất bản public theo quyền/phạm vi đã ghi trong FINAL gốc. Kiểm URL app, Review Mode, deep link, refresh, assets, dữ liệu mẫu và reduced/off trong phiên không đăng nhập. Chỉ báo đầy đủ khi coverage/gates đáp ứng; nếu INCOMPLETE nêu rõ. Không đổi gallery gốc và không gọi backend/hardware đã tích hợp chỉ từ mock.
