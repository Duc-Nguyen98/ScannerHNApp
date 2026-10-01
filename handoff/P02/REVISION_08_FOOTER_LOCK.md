# P02 r08 — phục hồi footer LOCK và chỉnh khoảng đệm KPI

Phản hồi user: không hài lòng mẫu mới; footer bị mất mẫu LOCK. Đối chiếu ảnh Desktop/1.png và `handoff/P03/REVISION_04.md`. Phạm vi: phục hồi footer đã chốt và chỉnh cục bộ KPI, không redesign thêm toàn Home.

## Sửa lỗi

- Bỏ3 override sai ở r06: nền footer xanh xám/no shadow, ô tab chọn nền trắng, scan-circle màu/viền theo surface Home. Footer trở lại `.hn-nav` chung: `#fffffffa`, radius23px góc trên, shadow nhẹ đã có; selected `#eef9fb`/`#005577`; scan-circle62px màu`#007399`, border trắng3px, icon31px. Không đổi HTML, SVG,5 nhãn/thứ tự hoặc handler.
- Giữ neo đáy/chiều cao hiện có. P03 kế thừa đúng footer này; không dựng footer khác để che sai lệch.
- KPI giữ3 cột và chiều cao98px. Padding12→16px, clock icon19→18px; bỏ tiny UTC+7 cạnh nhãn để có khoảng thở và3 caption cùng cách căn. HH:mm:ss vẫn theo UTC+7, tooltip/aria-label giữ thông tin timezone. Giờ nhận từ receipt xác nhận ca r07, không chạy timer, không thay auth logic.
- Mẫu toàn màn chưa được user nghiệm thu; không tự đổi tiếp hero/tác vụ hoặc nói đã giống100%. Ghi thêm HN-footer-locked-v1 trong UI_STANDARD.md và nhắc lại ở AGENTS.md để lần chỉnh sau không override footer bằng lý do đồng bộ màu Home.

## Kiểm chứng thực

`node scripts/check_home_footer_locked.cjs`: **4 viewport PASS** (494×950,456×874 theo ảnh user gần tương ứng,360×800,1264×712). Kiểm giá trị LOCK cụ thể, innerHTML/computed styles Home↔P03 bằng nhau, scan-circle nhô trên nav, chân trang nhìn thấy, row cuối không bị che, giờ/icon không đè nhau và icon clock cách mép phải ít nhất15 CSSpx trong không gian thiết kế; shift receipt không đổi sau navigation. JS errors=[];8 screenshots. `git diff --check`:exit0.

[Kết quả/metrics](evidence/revision-08-footer/results.json) · [Home456](evidence/revision-08-footer/home-456.png) · [P03 cùng footer](evidence/revision-08-footer/p03-456.png) · [Home494](evidence/revision-08-footer/home-494.png).

Source sửa: home/style.css, home/home.mjs (chỉ caption timezone), cache entry P01; tài liệu LOCK và script kiểm footer. Không thay controllers nghiệp vụ, board, dist/gallery hay deploy. Không chạy lại unit tests nghiệp vụ cho thay đổi CSS/caption này. Nghiệm thu component footer là kết quả phạm vi nhỏ; visual toàn P02 vẫn chờ user review, integration giữ nguyên.
