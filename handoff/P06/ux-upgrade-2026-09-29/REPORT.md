# P06 — nâng cấp trải nghiệm tra cứu theo đề xuất đã duyệt

Ngày29/09/2026. User đã yêu cầu áp dụng đề xuất trong chat. Target `prototype`, giữ4 panelP06 trong24board/91panel. Repo hiện đang triển khaiP13 và có các nâng cấp khác đồng thời; không đổi current_prompt, HomeLOCKED/footer, baseline, dist/gallery; không push/merge/deploy.

## Các đề xuất đã áp dụng

| Đề xuất đã duyệt | Kết quả triển khai |
|---|---|
|Tồn/Lịch sử dễ truy cập|Hai shortcut ngay dưới hero P06.S02, trước actions và thông tin cơ bản. Lịch sử không còn ở dưới gallery. Giữ section tổng tồn và đầy đủ4 panel.|
|Bộ chọn ngày dùng chung|Dùng trực tiếp openHistoryPicker củaP08 và policy90ngày Việt Nam. Calendar/nhập ngày/Reset/Hủy/Áp dụng/focus/Back cùng component; loại giao dịch dùng slot lựa chọn của component. Thêm optional allStatusLabel, defaultP08 giữ nguyên.|
|Tìm kiếm bằng bàn phím|Giữ tìm live theo query; Enter mở khi query khác rỗng và đúng1 kết quả đã đọc thành công; nhiều kết quả đưa focus tới danh sách. Enter trong IME không mở. Count ghi rõ dữ liệu đã tải, không giả total server.|
|Bộ lọc nhìn thấy và dễ bỏ|Query chip + Xóa từ khóa ở danh sách; type/date chips + Xóa bộ lọc bên ngoài dialog lịch sử. Clear query giữ category; Clear lịch sử bỏ type/date nhưng giữ item. Không bịa criteria bộ lọc catalog nâng cao.|
|Phản hồi ngay vị trí thao tác|P06 rỗng và lỗi đọc là2 trạng thái riêng; empty có hướng dẫn/xóa lọc; error có Thử lại. Lỗi đọc giữ các dòng cũ đúng scope/query/item và ghi rõ đó là dữ liệu đã tải. Enter không tự mở kết quả cũ khi nguồn lỗi. Action feedback vẫn dialog theo contract mới; validation field vẫn tại field.|
|Giữ vị trí làm việc|Query/category/scroll/ID giữ khi Back; card vừa xem có nhấn viền nhẹ. Modal không làm mất đường quay về NFC/Bảo hành. Sửa thêm focus nút Sao chépP08 sau dialog kết quả theo đúng caller key.|
|Xem ảnh lớn|Bấm thumbnail mở ảnh trong app; ảnh trước/sau, số thứ tự, tên; backdrop không đóng, Esc/Back/Đóng trả focus. Gallery và hero phản ánh ảnh đang chọn, không mở overlay thứ hai.|
|Bước tiếp theo rõ ràng|Tra cứu có shortcut và CTA empty/retry rõ nghĩa. P04/P05 hiện đã có bước/CTA, phản hồi code tại ô, guard mã trùng và đối chiếuUNKNOWN; giữ source hiện hành, không dựng lại mutation hoặc đổi status.|

Dữ liệu gốc và36event mẫu không thay đổi. Adapter có scenario `read-error` chỉ để kiểm lỗi đọc trong prototype; retry chuyển lỗi fixture này về demo, không gọi mutation/API. Cache đọc tối đa32 phạm vi, chỉ trong bộ nhớ, phân biệt actor/kho/query/item/filter, dispose xóa cache. Không hiện0 giao dịch thật khi nguồn chưa xác minh. Backend thật vẫn chưa nối.

## Nguồn hình thức và bằng chứng

[DECISIONS.md](DECISIONS.md) lập trước sửa, phân biệt B06/component/user-change/implementation-choice. User cho phép thay vị trí control trong phạm vi proposal; không lấy baseline cũ làm bằng chứng user đã nghiệm thu bản nâng cấp.

- [Danh sách trước/sau](evidence/compare-list.png)
- [Chi tiết trước/sau](evidence/compare-detail.png)
- [Lịch sử trước/sau](evidence/compare-history.png)
- [Bộ lọc đang áp dụng](evidence/active-filter.png), [ảnh lớn](evidence/image-dialog.png), [không có kết quả](evidence/search-empty.png), [lỗi đọc giữ dữ liệu](evidence/history-read-error.png).

So sánh native cùng494×1000 CSSviewport/shell494×950,DPR1,Arial,fixtureHN12346; không resize/mask. After-detail được mở bằng Enter nên có keyboard-focus indicator, before-detail mở bằng pointer. Bố cục mới là adaptation theo chỉ thị, chưa pixel-perfect hoặc visualuser acceptance. Hai shortcut đẩy metadata/gallery xuống; chúng vẫn cuộn trong shell để ưu tiên thao tác thường dùng. Status, icon nghiệp vụ và footer dùng chuẩn hiện có.

## Kiểm chứng

Xem [SUMMARY.json](SUMMARY.json) cho số cuối và đường dẫn.

- `node scripts/check_lookup_ux_upgrade.cjs`:10 nhómPASS:search/IME,shortcut,row highlight,shared picker/validation/apply/cancel/clear,empty/error/retry,viewer lifecycle,logout. Capture picker/calendar/image tại6viewport494×1000,360×800,430×932,1440×900,340×420,1869×940. [Kết quả](evidence/results.json), [metrics](evidence/metrics.json).
- Footer computed style so với Home: nềnrgba255/.98,radius23,padding8,min-height75,scan62 và màu giữ nguyên. Overlay trong app, focus trap, no horizontal overflow, không chồng overlay.
- Full Node suite nguồn cuối: [node-final.txt](evidence/node-final.txt). Test mới kiểm lỗi đọc/retry không đổi inventory/event và picker draft không commit trướcApply.
- `check_warranty_navigation.cjs`:11 nhómPASS, đúng caller/serial/draft/UNKNOWN qua P06. [Kết quả](evidence/warranty/navigation-results.json).
- `check_nfc.cjs`:11 nhómPASS gồm exact item selection qua P06, submit/UNKNOWN và logout. [Kết quả](evidence/nfc/browser-results.json).
- `check_history_reset_r19.cjs`:5 nhómPASS sau sửa focus sauCopy; defaultsP08/Reset/today/90ngày/Back/6viewport còn đúng. [Kết quả](evidence/history/reset-results.json).
- `check_dialog_sync_p06_p07.cjs`:4 nhóm P06 đầuPASS (4panel/6viewport,feedback/Back,validation), dừng ở assertionP07.S02 không được cuộn của script cũ trong lúcP07 đang có chỉnh UI đồng thời. Không báo full mixed-suite nàyPASS, không sửaP07 để ép theo expectation cũ. P07 functional suite riêng ở trênPASS.

TestUI lần đầu sai selector `dialog` vì Home có dialog tên đóng sẵn; đổi `dialog[open]`, chạy lại10/10PASS. CaCopyP08 từng mất focus sau disable/async; sửa callback chỉ trả đúng nút khi caller vẫn còn active, chạy lại5/5PASS. Log thất bại giữ để truy vết, không dùng làm bằng chứngPASS. Không có test camera/NFC thiết bị thật hoặc WMS production.

## Bàn giao

Mới: `scripts/check_lookup_ux_upgrade.cjs`, báo cáo/captures. SửaP06 UI/CSS/fixture adapter,2 testNode, versionCSS ởauth entry. Shared picker thêm nhãnAll optional, không thay mặc định; history copy-focus fix;2 script hồi quy cập nhật control/settlement mới. Tracking bổ sung field riêng, giữ progressP13 và công việc có trước.

BehaviorPASS theo các ca đã chạy; visual chờ bạn review; integrationBLOCKED như trước. Catalog advanced filter/API/capability không tự bổ sung. Phần ưu tiên1 và gallery/empty/retry/highlight đã triển khai; không triển khai prompt mới.

Preview: đăng nhập `minhanh` / `preview` → Tra cứu → tìm `HN12346` → Enter. XemTồn/Lịch sử ngay dưới hero; lịch sử có Bộ lọc vàXóa bộ lọc. Cuộn đến gallery, bấm ảnh để xem lớn. Công cụP06 ngoài app có lựa chọn Lỗi đọc dữ liệu tạm thời để demo retry; reload vẫn mất state phiên như trước.
