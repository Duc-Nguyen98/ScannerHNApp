# Rà soát luồng P06 và các điểm nối trong hệ thống — 28/09/2026

## Phạm vi thực tế

Repo hiện có P01–P09, mới hơn tóm tắt P06 của cuộc chat. Đã đọc AGENTS.md, shared/UI_STANDARD.md, RUN_STATE và P09-r07; giữ các cập nhật đang có P04/P05/P07/P08/P09. Source HEAD da9f623…, target prototype HTML/CSS/JS. Giữ24 prompt/91 panel, khung494×950 và chuẩn icon pastel đã duyệt; không đổi baseline, dist/gallery hoặc push/merge/deploy.

Workspace có các cập nhật ổn định module đồng thời. Báo cáo này nhận phần sửa P06, đường Back P03/Home và các kiểm tra trực tiếp dưới đây; không ghi đè tiến độ P09 hoặc báo cáo/module khác.

## Lỗi và phương án đã thực hiện

| Lỗi xác minh | Cách xử lý | Kết quả |
|---|---|---|
| P09 → P06 → dialog P03 → browser Back làm mất marker quay về P09 | Dialog có history entry tạm, giữ nguyên state/hash của màn gọi; khi chọn nghiệp vụ, chờ entry dialog được đóng rồi mới điều hướng | PASS: đóng dialog rồi Back P06 về đúng intake P09 |
| Bấm đóng và mở lại dialog liên tiếp có nguy cơ mất entry | Controller có bước chờ đóng, re-arm đúng1 marker khi mở lại; dispose giải phóng phần đang chờ | PASS unit; giữ nguyên guard busy/stopped, không xóa phiếu |
| P06 nhận khoảng ngày đảo nhưng Apply vẫn sáng | Validate draft bằng shared/query-date-policy, khóa Apply trước submit, báo đúng endpoint; committed filters/events không bị thay | PASS |
| Sửa ngày đúng nhưng lỗi cũ còn hiện | Xóa aria-invalid/thông báo ngay khi draft hợp lệ | PASS |
| Escape đóng date editor nhưng giữ giá trị chưa áp dụng | Escape trả draft về committed filters, trả focus về summary | PASS |
| Tests P03 dùng tọa độ385px dù app đã scale360px; chặn cả nguồn địa lý đã được duyệt | Tính điểm bấm thực từ bounding box; cho phép đúng GET nguồn địa lý P05 như Home test, các request khác vẫn bị kiểm | Full P03 PASS; không force-click/relax behavior assertion |

[Trước sửa](evidence/before-flow-results.json):4 FAIL về ngày/Back; title Home đã PASS theo cập nhật khác trong workspace. [Sau sửa](evidence/after-flow-results.json):7 ca PASS, có thêm cutoff90 ngày/hôm nay theo Việt Nam và bỏ lọc ngày.

## Phần hệ thống đã đối chiếu

- Auth: lần đọc đầu có7 lỗi ổn định trong test về malformed payload, literal permission true, thu hồi quyền trong lúc start, adapter exception, logout/reset và navigation. Bản cập nhật auth xuất hiện trong workspace khi đang rà; giữ bản đó và kiểm lại bằng full Node suite, không ghi đè. Bản nguồn cuối có196/196 PASS.
- NFC/history: source/test có cập nhật tìm kiếm tiếng Việt và baseline hash theo revision được duyệt. Các bản cập nhật này được giữ; không tự thay mapping nghiệp vụ hoặc nguồn lịch sử. Không dùng pass của unit tests để suy phần cứng NFC thật hoạt động.
- Đồng bộ hình thức: P06 timeline dùng hn-operation-icon/data-hn-operation và palette duy nhất shared/operation-icons.css. Không đổi màu quantity/status để làm màu nghiệp vụ. Header, nav, scroll và 4 panel giữ nguyên; trường thiếu vẫn khác0; in/camera/ghi WMS không được bật.
- Luồng nhập/xuất/UNKNOWN: full Node suite hiện tại bao gồm các test P04/P05/P07/P09. Riêng browser trong lượt này tập trung Home/P03/P06/P08/P09 navigation; không gọi đó là chạy toàn bộ browser mọi module.

## Kiểm chứng thực chạy

| Lệnh / suite | Kết quả | Bằng chứng |
|---|---|---|
| node --test tests/*.mjs tests/*.cjs |196/196 PASS|[node-final.txt](evidence/node-final.txt)|
| check_lookup_flow_audit.cjs |7/7 PASS|[flow](evidence/after-flow-results.json)|
| check_lookup.cjs |11 nhóm PASS|[P06](evidence/lookup/browser-results.json)|
| check_dialogs.cjs |16 nhóm PASS,29 capture|[P03](evidence/dialogs/browser-results.json)|
| check_home.cjs |14 nhóm PASS|[Home](evidence/home/browser-results.json)|
| check_warranty_navigation.cjs |11 nhóm PASS|[P09 Back](evidence/warranty-navigation/navigation-results.json)|
| check_history_reset_r19.cjs |5 nhóm PASS, phiên bản test hiện hành|[P08 evidence](evidence/history-current/)|

Các suite có env output trỏ riêng vào thư mục evidence của báo cáo này. Browser console error rỗng trong các kết quả PASS. Date test cố định28/09/2026 tại Việt Nam; P08 reset test dùng27/09/2026 và kiểm chuyển ngày. Các suite responsive dùng ma trận có494×1000,360×800,430×932,1440×900,340×420,1869×940 và các mốcP03 riêng, DPR1/zoom1. [Ảnh validation đã sửa](evidence/after-date-validation.png); đã xem ảnh actual và giữ trạng thái lỗi dễ đọc, không mất events.

Lượt đầu full Node177/186 chưa đạt (nguồn thay đổi đồng thời); chỉ log196/196 cuối được dùng kết luận. Test P03 đầu thất bại vì điểm click nằm ngoài khung scale và expectation chưa nhận nguồn địa lý đã duyệt; đã sửa test đúng thực tế và chạy lại PASS. Script cũ check_query_dates.cjs dừng ở expectation trướcP08-r16/r19 (cố click Apply disabled, Reset về rỗng); không sửa ứng dụng lùi về behavior cũ. Dùng check_history_reset_r19 và ca P06 cutoff90 ngày mới để kiểm contract hiện hành. Không báo legacy suite đó PASS.

## Đề xuất nâng cấp tiếp theo

| Ưu tiên | Phương án cụ thể | Vì sao / điều kiện |
|---|---|---|
|1|Dùng chung picker ngày P08 cho P06, giữ type/query/item và giới hạn90 ngày|P06 hiện là date input native trong details; behavior đã đồng bộ, hình thức còn khác. Cần duyệt đổi control/bố cục theo baselineP06 trước khi áp. Không tạo picker thứ ba.|
|1|Chốt bộ lọc catalog nâng cao: trường, option, count/paging và nút xóa lọc|Icon filter P06 hiện chỉ giải thích dependency; chưa đủ nguồn để tự thêm enum/trường. Cần Designer/BA/API cung cấp.|
|2|Dùng một mẫu UI cho trạng thái loading, rỗng, lỗi đọc và retry|Tái dùng component theo ownershipP15/P16 khi được triển khai; retry đọc không xóa dữ liệu cũ, error ghi vẫn giữ UNKNOWN/reconcile. Không nhân bản state theo từng màn.|
|2|Chuẩn hóa thông báo màn đích chưa tích hợp, có lối quay lại màn gọi|Giữ context/ID, không dẫn người dùng sang phiếu khác; bàn giaoP10/P12/P14 khi có prompt tương ứng.|
|3|Nối adapter thật và chuẩn hóa capability ở ranh giới module|Chốt response/schema/version/idempotency, phân biệt quyền xem với quyền ghi. Cần source/API được duyệt; không bịa quyền theo role và không suy success từ fixture.|

Phần áp ngay là sửa lỗi và đồng bộ validation/Back. Không tự áp đề xuất thay layout lên HomeLOCKED hoặc các panel đã chốt. Không thêm màn/prompt.

## Trạng thái và files

Behavior PASS cho các ca/suite ghi ở trên. Visual: chuẩn có sẵn được giữ, user review còn cần; chưa pixel-perfect toàn bộ. Integration: WMS/camera/NFC thiết bị thật chưa kiểm, fixture vẫn trong bộ nhớ.

Sửa trực tiếp: lookup/lookup.mjs; home/home.mjs (P03 route lifecycle); shared/dialog-route.mjs; tests/dialog-route.test.mjs; scripts/check_lookup_flow_audit.cjs,check_lookup.cjs,check_dialogs.cjs,check_query_dates.cjs. Tracking bổ sung vào RUN_STATE theo trường audit riêng để không thay current_promptP09. Coverage cập nhật evidenceP03/P06/P09, giữ91 dòng.
