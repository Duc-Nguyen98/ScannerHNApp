# P02 r16 — rà soát UI/UX (29/09/2026)

Phạm vi: Trang chủ và đường đi từ Trang chủ tới chứng từ, bảo hành, tra cứu, NFC, lịch sử, thông báo, quét mã/phiếu nhập–xuất. Không phải nghiệm thu tất cả 24 prompt. [Nguồn và quyết định trước sửa](REVISION_16_CONTEXT.md).

## Lỗi và xử lý

| Vấn đề | Xử lý và kiểm chứng |
| --- | --- |
| Recent đổi nhãn ngày làm mất focus về body | Thay DOM giữ current focus và saved Back target theo ID; mất dòng thì về heading. Giữ scroll; không lấy focus khỏi dialog/control khác. Áp dụng cùng helper cho shortcut phiếu dở. |
| Kho tạm dừng/chưa xác minh vẫn xanh hoạt động | Gắn trạng thái nguồn vào badge: active xanh, stopped vàng nâu, unknown trung tính; giữ nhãn chữ. Kiểm write guard vẫn chặn nhập khi stopped. |
| KPI UNKNOWN tiếng Anh, mờ và accessible label vẫn mời mở danh sách | Hiện “Chưa xác minh”, chữ trung tính đủ đọc, không kế thừa opacity .6; disabled thật, aria/title không mời thao tác không khả dụng. Ca xác nhận vẫn giữ nguyên. |
| Xem tất cả chỉ có vùng bấm cao 24px | Cao 44px trong frame494, giữ baseline chữ/vị trí danh sách bằng margin; hover/press nền nhẹ, không gạch chân. Preview vẫn scale toàn khung nên không tuyên bố vùng chạm44px thực ở mọi thiết bị. |
| Mã chứng từ liền dài tràn sang metadata | Wrap trong cột text; dữ liệu không cắt/lưu đè. Kiểm mã83 ký tự giữ nguyên, không đè ngày/status; toàn hàng vẫn mở đúng ID. Thêm bo đủ4góc khi danh sách chỉ còn1dòng. |
| Chữ phụ/status Home thiếu tương phản | Chữ phụ4.22→4.87; green3.46→5.61; amber3.80→6.17; blue3.92→5.18. Chỉ đậm chữ, giữ nền/icon nghiệp vụ và footerLOCK. |

## Kiểm chạy thật

- `check_home_audit.cjs`: **10 nhóm PASS**. Gồm cập nhật ngày/focus, dòng biến mất, không cướp focus, dialog Tab/Escape/Back, kho3 trạng thái, UNKNOWN, tên ngắn/bình thường/liền dài, chứng từ dài, phiếu dở/cuộn/Back, tương phản. Viewport320×568,360×800,494×950,1264×712 cho nhánh cuộn.
- `check_home_ux.cjs`: **11 nhóm PASS**: nhập mã liên tục/trùng/lỗi, resume đúng document/session/request, UNKNOWN đối chiếu không gửi mù, phục hồi lọc rỗng ở các module,2nháp360px, logout/Back.
- Recent regression: **6 nhóm PASS**; KPI regression: **6 nhóm PASS**; FooterLOCK: **4 viewport PASS**, Home/P03 cùng paint/geometry và thời điểm ca không đổi.
- Node suite: **422/422 PASS tại snapshot chạy**. Syntax Home/script và `git diff --check`: exit0.
- Đã mở preview chính8766 trong in-app browser, đăng nhập và xác nhận ca fixture; Trang chủ r16 hiển thị được. Không reload tab cũ hoặc xóa bản nhập của user.

Evidence: [Kết quả audit](evidence/revision-16-audit/results.json), [UX regression](evidence/revision-16-audit/ux-regression/results.json), [Recent](evidence/revision-16-audit/recent-regression/results.json), [KPI](evidence/revision-16-audit/kpi-regression/results.json), [Footer](evidence/revision-16-audit/footer-regression/results.json), [Node log](evidence/revision-16-audit/node-tests.txt).

## Visual

QA before/after: cùng494×950,DPR1, fixture clock28/09/2026 08:15:20 VN. [Before](evidence/revision-16-audit/before-home.png) / [After](evidence/revision-16-audit/after-home.png). [Preview thực](evidence/revision-16-audit/preview-in-app.png). [Kho tạm dừng](evidence/revision-16-audit/warehouse-stopped.png), [Chưa xác minh](evidence/revision-16-audit/unknown-kpis.png), [Mã dài](evidence/revision-16-audit/long-document.png), [Cuộn màn320](evidence/revision-16-audit/draft-320.png).

Đã xem ảnh actual Home/UNKNOWN/stopped/in-app, kiểm số đo các nhánh. Đây là bugfix/adaptation cần user review hình thức, không tuyên bố khớp B02 100%. Không thay footer, thương hiệu, asset gốc; nguồn hero/font tuyệt đối vẫn chưa xác minh.

## Ghi chú chạy và phạm vi tích hợp

Workspace có công việc P04/P05/P12/P16–P19 diễn ra đồng thời. Giữ nguyên phần đó; không nhận là thay đổi của r16. Bộ UX cũ phải cập nhật theo P17.S01/S04 và nút Xóa bộ lọc của P16: test cũ chờ input/dialog/class đã được thay bằng panel/control mới. Không sửa nghiệp vụ để ép test qua. Failure artifacts giữ lại là lịch sử lần chạy; results.json cuối là kết quả hoàn tất.

Lần probe qua8766 có một timeout tải username; kiểm biệt lập bằng server cùng source8767, cuối lượt xác minh8766 hoạt động trong browser. Server QA riêng chỉ phục vụ kiểm tra; không thay server của các task khác. Không có xác minh WMS/API thật, camera/NFC/máy quét hoặc bàn phím điện thoại thật. Không thể suy từ các test này rằng toàn APP hết mọi lỗi.

File chức năng r16: `home/home.mjs`, `home/style.css`, cache revision ở auth entry. Test bổ sung `scripts/check_home_audit.cjs`; test cũ thêm env baseURL/evidence và cập nhật đường đi theo owner hiện tại. Không sửa dist/gallery/baseline hoặc push/merge/deploy.
