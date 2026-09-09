# Active navigation — nền viên thuốc

Chỉ thay trạng thái active của footer Scanner theo yêu cầu đã duyệt; không đổi route hay nghiệp vụ.

- Bỏ chấm active bên dưới tab.
- Tab thường: nền viên thuốc #EAF3F6 ôm icon + nhãn; active #0C6286, semibold 600. Tab còn lại #526F7C.
- Nút QR 54px/đường cong giữ nguyên; chỉ ở lookup/product mới có viền sáng inset #C8E4EE và nhãn đậm. Không thay kích thước khi chuyển active.
- Transition 180ms, tắt khi reduced-motion (bao gồm pseudo-element).
- `scripts/qa-scanner-active-nav.mjs`: 5 tab × 3 viewport 360×800/390×844/430×932, một aria-current tại mỗi tab, active background/ring đúng; profile-edit kế thừa active Cá nhân; chiều cao footer không đổi; hit area ≥44px; không overflow/pageerror.
- `scripts/qa-scanner-footer.mjs`: giữ 54px, QR trắng, nút dẫn lookup, CTA không chồng nav/orb, phần tử cuối cuộn trên CTA.
- Ảnh `*-home/docs/lookup/history/profile.png` và `qa.json` là runtime từ static build. Không thay đổi kết luận nghiệm thu tổng thể P05.
