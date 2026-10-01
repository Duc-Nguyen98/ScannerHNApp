# P07 r13 — Rà soát UI/UX và thao tác liên tiếp

29/09/2026. User yêu cầu rà lại lỗi phát sinh sau r12. Phạm vi P07, picker P06 và điểm điều hướng Home liên quan. Đã đọc AGENTS/UI_STANDARD; workspace hiện có P18 và P15/P17 tích hợp mới, giữ nguyên công việc đó.

## Nguồn và bằng chứng trước sửa

[Source map](REVISION_13_SOURCE_MAP.md). Giữ B07/artwork/sóng r10, các cải tiến r12 và footerLOCK. Cách đặt acknowledgement trong nút là lựa chọn thực thi cần user review.

[Probe trước sửa](evidence/revision-13/before/results.json) chạy4 ca ở494×1000,DPR1:
- PASS: dialog chi tiết từ P17 xung đột; UI Back sau chọn sản phẩm.
- FAIL thực tế: hủy picker không trả focus về Đổi sản phẩm; nhãn sao chép tràn ngoài nút và phủ hàng kế tiếp.

Không coi nhánh P17 là lỗi đã tái hiện: P17 đã mang class p07-app và modal mở được; đã giữ nguyên parent owner, kiểm lại làm hồi quy.

## Sửa

1. **Picker quay về đúng entry:** trước đây returnToNfc replace entry P06 thành một entry S02 khác. Nay entry picker mang marker phiên/nguồn; chọn hoặc hủy quay về entry S02 cũ bằng Back, áp product đã chọn đúng một lần. Guard return pending ngăn nhấn đúp. Có fallback cho caller không mang marker; không đổi router của module khác.
2. **Focus/scroll sau picker:** giữ nút gọi và vị trí cuộn lúc mở; khi về phục hồi bằng preventScroll. Không reset lastPanel vô điều kiện trên mỗi route notification, tránh popstate/hashchange dựng lại rồi làm mất focus vừa phục hồi.
3. **Copy không đè hàng bên dưới:** dấu tích và nhãn Đã chép ở trong nút44×44 thay cho tooltip nhô ra. Không thêm dòng/chiều cao; giữ aria-label đầy đủ, live region, timer2.2s và UID nguyên vẹn.
4. **Copy bàn phím:** dùng aria-busy và single-flight guard, không disabled nút đang focus khi chờ clipboard. Enter liên tiếp chỉ gọi một lần; đóng dialog trước khi promise xong không hồi sinh dialog hoặc giật focus.
5. **Dialog rõ ngữ cảnh:** nhãn Back là Quay lại màn trước, không nói sai là danh sách khi mở từ màn thành công/xung đột. Focus đầu vào nút Đóng ở footer. Giữ shared dialog-route, Esc/Back/backdrop policy hiện hành.

Không đổi layout tổng, palette, footer, dữ liệu fixture hoặc nghiệp vụ link/reconcile. CSS cache version p07-r13. Không push/merge/deploy.

## Kiểm chứng sau sửa

- **6/6 ca browser mới PASS**: P17 detail/Esc/focus; chọn sản phẩm/UI Back; hủy picker/focus; copy bounds; chọn sản phẩm3 lần rồi native Back một lần về danh sách; clipboard pending/Enter trùng/đóng trước phản hồi. [Kết quả](evidence/revision-13/after/results.json).
- **4/4 nhóm repeat PASS**:5 mã liên tiếp, giữ sản phẩm, ID request mới, đổi mã invalidates read, UNKNOWN giữ/đối chiếu, text dài/cuộn cuối. [Kết quả](evidence/revision-13/repeat/results.json).
- **33 capture alignment PASS**,6 viewport1869×940,1495×752,685×872,494×1000,360×800,340×420, đủ4panel +read states/dialog/chuỗi dài. Scope selector dialog sang `[open]` để không nhầm dialog tên Home đóng sẵn. [Metrics](evidence/revision-13/alignment/metrics.json).
- **416/416 Node PASS** ở snapshot lần chạy này, toàn workspace; không phải416 test do r13 viết. [Log](evidence/revision-13/node-tests.txt).
- FooterLOCK Home/P03 PASS ở4 viewport với script chuyên biệt; source footer không sửa. [Evidence](evidence/revision-13/footer).
- Đã xem ảnh copy sau sửa và S02 mobile; before/after cùng494×1000,DPR1, fixture. Visual tổng thể vẫn chờ user, không dùng test đạt để tự nghiệm thu Designer.

### Giới hạn bộ kiểm Home cũ

`check_home.cjs` chưa phù hợp toàn bộ workspace mới: còn kỳ vọng P13 chưa có, selector tools khớp thêm P15/P16/P18, và badge giả12345 ở kịch bản tên dài dù badge giờ lấy nguồn P13. Các lượt dừng tương ứng được lưu ở home/home-current; **không ghi PASS cho toàn bộ script này**. Đã thử cập nhật cục bộ để chẩn đoán, sau đó khôi phục các thay đổi test tạm trong lượt này, không đổi app để thỏa kỳ vọng cũ. Các điểm Home/P06/P07 thực sự sửa được kiểm riêng ở6 ca mới; footer có suite hiện hành riêng.

## Ảnh review

- [Copy trước](evidence/revision-13/before/copy-overlap.png) → [Copy sau](evidence/revision-13/after/copy-overlap.png).
- [Hủy picker trước](evidence/revision-13/before/picker-cancel-focus.png) → [Sau](evidence/revision-13/after/picker-cancel-focus.png).
- [S02 mobile](evidence/revision-13/alignment/S02-unread-360x800.png).

## Bàn giao

Files chức năng: nfc/nfc.mjs, nfc/style.css, home/home.mjs (chỉ đường về picker NFC), auth-session/index.html(cache). Model/adapter NFC không sửa. Script mới check_nfc_r13.cjs và cập nhật selector `[open]` trong alignment.

Behavior PASS trong phạm vi fixture đã kiểm; visual cần user review; production/hardware NOT_RUN. Giữ91 panel, current prompt P18 và các checkpoint khác; ghi báo cáo vào key p07_ui_audit_r13 riêng.
