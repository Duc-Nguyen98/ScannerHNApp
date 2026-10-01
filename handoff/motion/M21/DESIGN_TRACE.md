# M21 — nguồn và quyết định trước nghiệm thu

- Input: MOTION_P21 + MOTION_CONTRACT 1.0 (bản sao trong inputs), Contract thiết kế 2.0, AGENTS/UI_STANDARD, P21 r03 hiện hành. P21 r03 đã được tạm chấp nhận tại P22 request theo TEMPORARY_ACCEPTANCE.md; giữ trace này, motion mới chưa tự nghiệm thu.
- FLOW_GATE.json = PASS UI_FIXTURE, không có blocker; M00 primitives đã promoted vào shared/motion và được M01–M20 dùng. Gate là bằng chứng fixture lịch sử; lượt này kiểm cạnh trực tiếp trên working tree hiện tại, không nâng backend thành PASS.
- HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78 + working tree đang có; không reset hoặc thay file của chat khác. Native HTML/CSS/ES modules; không cài thư viện.

| Owner | Thực thi | Nguồn |
|---|---|---|
| DraftList | M00 pressFeedback 100 ms opacity, background transition dùng cùng token; ID/status/order hiện ngay, không row entrance | MOTION_P21.S01 + M00 |
| ResumeFeedback | AppShell M02 routeTransition hiện hành 180 ms, reduced/off static; nội dung cập nhật cùng module giữ static, store P19 không remount | MOTION_P21.S02 + home/motion |
| ReconcileNotice | Icon descendant opacity 140 ms / reduced 80 ms / off 0 sau kết quả đọc chưa xác minh; dedup checkpoint + nguyên nhân, không replay Back | MOTION_P21.S03 + M00 noticeFeedback |
| Status check | Spinner trong ô glyph 38×38 đã có, chỉ khi lệnh đối chiếu đang chờ; reduced/off tĩnh, hidden/overlay pause, hide/security cancel | MOTION_P21.S04; CSS consumer pattern M20 |
| Form/ID/version/counters/recorded rows | STATIC_BY_DESIGN, kết quả và guard tức thì | Motion contract + HANDOFF |
| Scroll/virtualization | Native scroller hiện có; không thêm virtualizer. M00 chưa có quyết định profile cho P21, không suy profile P20 thành policy P21 | M00 LIST_AUDIT/OWNERSHIP |

Nguồn trước sửa và ảnh 4 panel × 3 mode tại before/. Ảnh thực tế sau settle phải giữ geometry tương đương, trace thật dùng chứng minh motion. Thời gian/longtask chỉ là Chromium local emulation, không cam kết FPS thiết bị hoặc production. Dữ liệu fixture cũ giữ nguyên; mô phỏng network rejection chỉ qua interception trong test, không sửa adapter chạy thật.
