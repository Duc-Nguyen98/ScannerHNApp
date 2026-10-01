# P09 r08 — rà soát ổn định và chỉnh các điểm UX nhỏ

> **Đính chính nguồn gốc bằng chứng — 28/09/2026:** Trong đợt đồng bộ dialog P01–P10, suite stability cũ còn hardcode thư mục r08 và đã ghi đè sáu file lúc18:52: `case-specific-draft.png`, `confirmed-result-retained.png`, `warehouse-read-only.png`, `intake-open-existing.png`, `unknown-340x420.png`, `stability-results.json`. Các file hiện có là kết quả **đợt đồng bộ mới**, không còn là bằng chứng r08 nguyên bản; bản sao đúng nguồn nằm trong [audit hiện tại](../dialog-sync-2026-09-28/p08-p09/REPORT.md).
>
> Chưa tìm được bản gốc byte-identical trong Git/stash, các bản sao ở Downloads/Desktop/.codex hoặc archive kiểm tra; không tái dựng/chụp lại để giả bằng chứng cũ. Các kết quả nêu bên dưới được giữ như **báo cáo lịch sử, chưa được tái xác minh trên source r08**. Những log/evidence khác không bị suite này ghi đè. [Danh sách chính xác, hash hiện tại và phạm vi tìm bản gốc](../dialog-sync-2026-09-28/p08-p09/EVIDENCE_PROVENANCE.json).

Phạm vi user yêu cầu: rà soát luồng Bảo hành, sửa lỗi lặt vặt, đồng bộ UI/UX và kiểm tra vận hành ổn định. Giữ4 panel P09 và các bố cục r06/r07, không mở rộng P10–P24 hoặc gọi API/hardware mới.

## Các vấn đề đã tái hiện và sửa

| Vấn đề | Cách xử lý |
|---|---|
| Đổi hồ sơ A → B → A làm mất nháp cập nhật A | Nháp chẩn đoán/kết quả được giữ riêng theo case ID trong phiên; không lẫn nội dung giữa hồ sơ. |
| Mở dialog chỉnh sửa mới xóa tham chiếu kết quả đã xác nhận | Tách receipt của lần thao tác hiện tại và kết quả đã xác nhận theo hồ sơ; nội dung chưa lưu không xuất hiện như kết quả thành công. UNKNOWN của cùng hồ sơ không được hiển thị thành công. |
| Thay nháp tiếp nhận không liên quan có thể đổi request ID khi retry sửa chữa | Payload của từng nghiệp vụ chỉ gồm dữ liệu liên quan; request thất bại được giữ theo case/serial và payload. |
| Ngoại lệ adapter làm Promise reject và để busy=true | Luôn giải phóng busy, chuyển về UNKNOWN và giữ request/session/version. Đối chiếu mới được tiếp tục. |
| Adapter có thể đã ghi nhưng mất phản hồi | Đối chiếu đúng event của request và version; không ghi lần hai. Nếu chưa có bằng chứng đã ghi thì tiếp tục UNKNOWN, không retry mù. Đây là kiểm tra fixture, không tự định nghĩa API backend. |
| Nháp cũ có nguy cơ ghi đè khi version nguồn đã thay đổi | Giữ version đã đọc cùng nháp. Chặn ghi khi version khác; không âm thầm đổi version để vượt validation. |
| Click nhanh/mở nhanh có thể xử lý event từ nút đã bị thay | Chặn event từ DOM cũ, khi đã có modal hoặc controller đã dispose. Đồng thời sửa lỗi focus ô tìm kiếm sau khi đã chuyển sang màn không có ô đó. |
| Mỗi ký tự tìm kiếm dựng lại input, ảnh hưởng IME/nhập tiếng Việt | Chỉ cập nhật kết quả và bộ đếm; giữ nguyên input, focus và composition. |
| Back về form đã tiếp nhận vẫn hiển thị CTA tiếp nhận rồi bị báo trùng | Hiện **Mở hồ sơ bảo hành** và thông tin đã tiếp nhận; mở lại đúng hồ sơ, không tạo request/write mới. |
| Kho tạm dừng chặn cả việc xem danh sách/hồ sơ | Cho phép xem trong phiên có quyền hợp lệ; vẫn chặn tiếp nhận/cập nhật ở UI và handler. Lối chọn nghiệp vụ quét P03 vẫn giữ write guard. |

Một số bằng chứng trước sửa nằm ở [before.json](evidence/revision-08/before.json). Lỗi focus được bắt bằng pageerror trong kiểm tra thao tác nhanh và đã sửa đúng nhánh khôi phục caret, không chỉ bỏ qua exception.

## UI/UX bổ sung có kiểm soát

- Giữ bố cục đã duyệt gần nhất, không redesign tiếp khi không cần thiết.
- Thêm tên truy cập rõ cho nút thêm và lọc; bỏ viền focus của heading chương trình đưa focus tới, giữ focus rõ trên control tương tác.
- Kho dừng có thông báo chỉ đọc. Thông báo UNKNOWN nêu đúng hồ sơ/serial và dùng nút đối chiếu cùng phong cách hệ thống.
- Giữ Back, tab, tìm kiếm, bộ lọc và lối Về danh sách r05–r07. Không tự đóng hồ sơ/đổi tồn; thiếu dữ liệu không thành0.

## Kết quả trong phạm vi P09

- **22/22 test logic P09 PASS**, gồm8 test ổn định mới: [p09-node-tests.txt](evidence/revision-08/p09-node-tests.txt).
- **7/7 nhóm browser ổn định PASS:** [stability-results.json](evidence/revision-08/stability-results.json). Kiểm input/IME, click nhanh, nháp theo case, kết quả đã lưu, đọc khi kho dừng, mở lại sau tiếp nhận và UNKNOWN ở viewport340×420.
- **10/10 full P09 regression PASS:** [browser-results.json](evidence/revision-08/regression/browser-results.json).
- **11/11 navigation regression PASS:** [navigation-results.json](evidence/revision-08/navigation-regression/navigation-results.json).
- **11/11 dialog/update/list-exit regression PASS:** [update-results.json](evidence/revision-08/update-regression/update-results.json).
- **14/14 Home regression PASS** ở lượt cuối: [browser-results.json](evidence/revision-08/home-regression/browser-results.json).
- Tổng **53 nhóm browser đạt**, không có pageerror trong các kết quả cuối. Các lượt lỗi ban đầu được giữ làm lịch sử kiểm tra; test không được nới để che lỗi. Một lượt stability test thiếu dữ liệu required đã được sửa setup; lỗi focus phát hiện trong lượt sau được sửa trong app.
- Kiểm tra tải trang độc lập12/12 lượt sẵn sàng, không có requestfailed/consoleerror: [preview-load-probe.json](evidence/revision-08/preview-load-probe.json).

## Lưu ý về repo đang có công việc đồng thời

Trong lúc rà soát, các chat Đăng nhập, Trang chủ, Tra cứu và NFC cũng đang sửa cùng workspace. Source/test Auth và NFC thay đổi ngay trong các lượt kiểm. Một lượt toàn repo đã ghi **177/186 PASS,9 FAIL** ở các test Auth/NFC và hash bảo vệ NFC; đây là quan sát trong lúc công việc đồng thời đang diễn ra, **không phải kết luận cuối cho toàn app**. [node-tests.txt](evidence/revision-08/node-tests.txt) giữ log quan sát đó. Trước khi các test khác được bổ sung, lượt toàn repo từng đạt173/173; báo cáo r08 chỉ chốt22 test P09 cùng các bộ browser nêu trên.

Không sửa/xóa test hoặc source Auth/NFC để làm xanh kết quả, không ghi đè công việc chat khác. Home/home-flow chỉ thay điều kiện route đọc Bảo hành; các thay đổi cùng file của chat khác được bảo toàn. Cần một lượt regression toàn repo sau khi các màn khác ổn định. R08 lưu trạng thái riêng tại [RUN_STATE.json](RUN_STATE.json) để không mất bàn giao nếu checkpoint chung được chat khác cập nhật.

## Bằng chứng UI

[Nháp đúng hồ sơ](evidence/revision-08/case-specific-draft.png) · [Kết quả đã lưu được giữ](evidence/revision-08/confirmed-result-retained.png) · [Kho dừng chỉ đọc](evidence/revision-08/warehouse-read-only.png) · [Mở lại hồ sơ đã tiếp nhận](evidence/revision-08/intake-open-existing.png) · [UNKNOWN ở khung nhỏ](evidence/revision-08/unknown-340x420.png).

## Phạm vi file và bàn giao

`warranty-model.mjs`, `warranty.mjs`, `style.css`, entry CSS version; hai điều kiện route đọc trong Home; test mới warranty-stability và browser stability; cập nhật assertion read/write P03 và thư mục evidence cho update regression; USER_FLOW/coverage/RUN_STATE/báo cáo.

Behavior P09 PASS fixture; visual IN_PROGRESS/chờ review; production integration BLOCKED như r07. Nháp và receipt chỉ trong bộ nhớ phiên prototype, không phải lưu bền. Không push/merge/deploy, không sửa dist/gallery/baseline; giữ91 ID.
