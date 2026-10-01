# P07 r07 — Tăng bán kính sóng NFC

Theo yêu cầu user ngày 27/09/2026: sóng tỏa lớn hơn, gần bản thiết kế. Chỉ chỉnh trang trí S02.

- Đường kính sóng tối đa tăng từ 191.4 lên 264 CSS px (khoảng 38%); nền sáng tăng từ 186 lên 264px.
- Tâm sóng đặt thấp hơn phía sau điện thoại, tạo vòm lớn như bố cục tham chiếu; mép dưới chuyển mờ trong khung minh họa.
- Giữ vị trí/kích thước điện thoại, khung minh họa 194px, bố cục và nghiệp vụ. Giữ thời lượng/giới hạn chu kỳ và reduced-motion.
- CSS version p07-r07. Baseline không sửa.

Kiểm chứng: `NFC_MOTION_EVIDENCE_DIR=handoff/P07/evidence/revision-07/motion node scripts/check_nfc_motion.cjs` PASS: ba mốc animation, không dịch hướng dẫn, reduced-motion, sáu viewport footer và Home. Đã xem ảnh 1300ms. Các kết quả Node/alignment/repeat trước đây không chạy lại cho thay đổi CSS nhỏ này. Backend/hardware NOT_RUN; chưa tự nghiệm thu visual thay user.

[Ảnh sóng lớn](evidence/revision-07/motion/read-1300.png) · [Metrics](evidence/revision-07/motion/results.json).
