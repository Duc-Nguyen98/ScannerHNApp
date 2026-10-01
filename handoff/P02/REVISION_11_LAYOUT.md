# P02 r11 — căn hàng và nền trắng đồng bộ footer

User yêu cầu nâng cấp UI/UX, căn đều layout và đồng bộ nền với menu footer theo ảnh Desktop/1.png. Phạm vi: surface/gutter/content Home, giữ footerLOCK và các hành vi KPI/ca đã chốt.

## Phương án đã áp dụng

- Chọn **nền trắng cho vùng nội dung**, cùng tông nền menu footerLOCK. Không sửa bất kỳ rule footer/nav/scan-circle nào. Thẻ có border nhẹ dùng chung `--hn-home-line`, thay việc chia các mảng xanh xám khác nhau.
- Header, KPI, section tác vụ, CTA scanner, section gần đây và khối danh sách dùng chung `--hn-home-gutter:20px`. Main có width100%/min-width0; hai cột grid dùng minmax(0,1fr) để nội dung không đẩy rộng khung.
-3 ô KPI dùng grid2 hàng rõ ràng (36px số/icon,20px nhãn, gap5px), align-content:center. Điều này đồng bộ hai button KPI và div giờ; không phụ thuộc cơ chế căn giữa mặc định của button. Giờ xác nhận ca vẫn cố địnhHH:mm:ss UTC+7.
- Gom3 dòng gần đây trong một khối bo14px, divider nhẹ, icon nghiệp vụ giữ palettechung. Giữ thứ tự/nội dung/action, chỉ thay border/gap của nhóm. CTA vẫn là một điểm nhấn xanh, không nhuộm lại icon nghiệp vụ hoặc màu trạng thái.

## Chẩn đoán và kiểm chứng

Ảnh user thể hiện mép phải sát/cắt và hai dải nền khác màu. **Không tái hiện overflow ngang** trên source hiện tại trước sửa tại475×867: main clientWidth/scrollWidth đều494, nội dung456, x/right của các section đã bằng nhau. Vì vậy không khẳng định một lỗi overflow chưa đo được đã được sửa. Đã chuẩn hóa gutter với header (trước20vs19), alignment của button/div KPI và nền; bổ sung kiểm cả overflow bên trong containers, không chỉ document để tránh bỏ sót clipping.

- [Before metrics](evidence/revision-11-layout/before-metrics.json) · [Before](evidence/revision-11-layout/before.png).
- [After metrics](evidence/revision-11-layout/results.json):5 viewport494×950,475×867,360×800,430×932,1264×712 PASS. Chênh mép section và header<1px;3 KPI top/label y bằng nhau; không scrollWidth vượt clientWidth trong main/KPI/tasks/records/view-all; view-all không vượt mép; footer trọn viewport; content/margin trắng; no JS errors.
- `HOME_FOOTER_EVIDENCE_DIR=.../footer-regression node scripts/check_home_footer_locked.cjs`:4 viewport PASS, Home/P03 computed-style/HTML parity với sourceLOCK, thời điểm ca không đổi.
- `HOME_KPI_EVIDENCE_DIR=.../kpi-regression node scripts/check_home_kpi.cjs`:6 nhóm PASS, đúng danh sách/status/count, Back/normal entry/UNKNOWN/zero.
- P12 được cập nhật đồng thời: Tất cả(24) là tổng dữ liệu, toolbar mới **5 kết quả** là tổng saulọc. Assertion cũ Tất cả(5) không còn đúng vị trí chỉ số; đã chuyển test sang số kết quả và giữ kiểm5record/status. Không sửa moduleP12 hoặc nghiệp vụ vì thay đổi layoutHome này.
- `git diff --check`:exit0. Không chạy lại toàn bộ Node/business tests cho CSS-only thay đổi.

## Bằng chứng

[Home475](evidence/revision-11-layout/home-475.png) · [Home494](evidence/revision-11-layout/home-494.png) · [Home360](evidence/revision-11-layout/home-360.png) · [KPI regression](evidence/revision-11-layout/kpi-regression/results.json) · [FooterLOCK regression](evidence/revision-11-layout/footer-regression/results.json).

Files: Home style.css; stylesheet cache entry P01; evidence-directory options của scripts/check_home_kpi.cjs và check_home_footer_locked.cjs, cập nhật assertion P12 toolbar. Ghi audit/checkpoint riêng, giữ current_prompt. Không đổi sourceAPI, xác nhận ca, templateboard/dist/gallery hoặc deploy. Đây là layout mới theo yêu cầu user, chờ review cảm quan; không tuyên bố pixel-perfect B02 hoặc backendPASS.
