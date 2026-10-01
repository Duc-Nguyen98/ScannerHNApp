# P07 r09 — Chỉ khôi phục minh họa NFC theo B07

27/09/2026. User xác nhận các phần khác đã đạt và yêu cầu chỉ sửa vùng minh họa khoanh đỏ.

- Bỏ điện thoại SVG dựng lại ở r06 (biểu tượng thiếu nét N, điện thoại đóng đáy, vị trí/tỷ lệ và vòng sóng khác B07).
- Dùng lại chính artwork từ B07 đã xác minh: CSS crop x512,y383,w244,h191. Không lấy caption, heading, nút hoặc toàn board làm UI; source PNG không sửa.
- Điện thoại, ký hiệu NFC, các vòng đồng tâm và phần chân mờ lấy trực tiếp từ crop gốc. Animation tỏa mờ phía sau giữ cùng tâm, đường kính tối đa244px theo artwork; reduced-motion và giới hạn chu kỳ giữ nguyên.
- Khung minh họa ngoài194px, vị trí hướng dẫn và toàn bộ UI ngoài vùng khoanh giữ nguyên. CSS cache version p07-r09.

## Kiểm chứng

`check_nfc_motion.cjs` PASS: ba mốc animation, reduced-motion, nội dung không dịch, sáu viewport footer và Home action. Đã xem capture1300ms.

So sánh ảnh r08/r09 cùng viewport1869×940 (ảnh app489×940), loại trừ dải minh họa y410–610: **0 pixel khác ngoài vùng minh họa**. [Số đo phạm vi](evidence/revision-09/scope-comparison.json). Đây là kiểm chứng tại viewport/mốc capture này, không suy rộng thành mọi thiết bị.

[Ảnh sau sửa](evidence/revision-09/motion/read-1300.png) · [Motion](evidence/revision-09/motion/results.json).

Không chạy lại Node/luồng nghiệp vụ do chỉ thay artwork/CSS. Kết quả các suite khác giữ là lịch sử. Backend/hardware NOT_RUN. Không thay baseline, không chuyển P08, giữ91 panel, không push/merge/deploy.
