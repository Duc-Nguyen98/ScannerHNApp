# P10 r05 — nguồn quyết định trước sửa

User 2026-09-29 yêu cầu áp dụng đề xuất cải thiện thao tác: vùng chạm sau scale; avatar/tên mở hồ sơ; keyboard form; kiểm hành trình và giữ ngữ cảnh; phản hồi gần thao tác và biết chức năng chưa sẵn sàng.

| Phần | Baseline/component | Thay đổi được yêu cầu | Lựa chọn triển khai cần review |
|---|---|---|---|
| Khung/footer | 494×950; footerLOCK mới nhất trong AGENTS/UI_STANDARD | Thao tác dễ trên màn hình hẹp | Giữ toàn bộ footer/kích thước khung; mở rộng hit area vô hình ở các nút P10, không tăng icon hay đổi nav |
| Hero | B10 + P10 hiện tại: avatar108, tên28px, gap22 | Avatar/tên là đường tắt sửa hồ sơ | Hai button semantic riêng; reader tên dài nằm ngoài button, không lồng button |
| Form | Input50px, back/clear44px source → khoảng32px rendered khi width360 | Keyboard số điện thoại, Next/Done, tránh che field | inputmode/enterkeyhint + Enter không auto-submit; cuộn đúng scroller; xử lý focus/visualViewport theo vòng đời module |
| Phản hồi | HN-action-feedback-v1 mới: action/result dùng dialog, validation tại field | Nhận biết chức năng chưa sẵn sàng trước khi bấm | Hint tĩnh cho avatar/lưu đang blocked; giữ dirty helper r04. Không tạo toast/result inline |
| Ngữ cảnh | P10 r03 focus/history; các owner P06/P08/P09/P12 đang có state riêng | Tiếp tục đúng nơi vừa thao tác | Kiểm hành trình trên nguồn hiện tại, không nhân bản state/đổi ID; không phát minh backend hoặc thông báo thành công |

Ảnh before ở `evidence/revision-05/before`, cùng viewport494×1000/360×1000, DPR1, fixture Minh Anh. B10 nguyên bản giữ trong evidence r01. Những tương tác mới không có raster baseline riêng; đây là adaptation được user cho phép triển khai, chưa phải visual acceptance.

Không reset/sửa việc P12–P14 hoặc đẩy code lên hosting. Global RUN_STATE thuộc P13/P14 hiện tại; chỉ thêm record P10 riêng.
