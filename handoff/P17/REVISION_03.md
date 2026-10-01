# P16/P17 — audit và sửa lỗi UI/UX r03

User yêu cầu rà soát kỹ và khắc phục lỗi phát sinh. Đã audit P17 r02, P16 hiện hành và dependency trực tiếp P04/P05/P07; **sửa7 lỗi tái hiện được**, giữ3 hạng mục P16 đã đạt trong source mới hơn. Không tuyên bố toàn bộ24board hay production hết lỗi.

**Behavior: PASS trong phạm vi prototype đã kiểm. Visual: chờ user review sửa đổi r03. Integration/hardware: chưa xác minh.** Giữ4panel P17 và4panel P16, shell494×950, footerLOCK, request/phiếu/accepted list và quyền của owner. Không sửa logic record/Post/mapping hoặc giả dữ liệu backend.

## Kết quả audit

| ID | Trước sửa | Khắc phục/kết quả |
|---|---|---|
| F01 | S04 thiếu nguồn status có hai nút disabled; thao tác đối chiếu nằm dưới vùng nhìn thấy | Dock có **Thông tin đối chiếu**; mở vùng định danh, đưa summary vào viewport và focus. Gửi lại vẫn khóa; không gọi record/read mới |
| F02 | Summary đối chiếu chỉ cao36px | Hit area tối thiểu44CSSpx, giữ dock và bố cục shell |
| F03 | Chọn Nhập mã khi đang cuối danh sách: ô nhập nhận focus nhưng ở ngoài viewport | Explicit Nhập mã chọn mã lỗi và đưa form/caret vào vùng nhìn thấy. Trở lại danh sách giữ scroll; nếu focus cũ nằm ngoài viewport thì focus vùng cuộn |
| F04 | Back trình duyệt rời owner trước khi đóng ngoại lệ | Entry UI tạm dùng component dialog-route; Back/Escape đóng ngoại lệ trước, giữ phiếu/mã. Dialog con đóng trước panel. Forward không replay scan/NFC |
| F05 | Clipboard chưa trả lời; rời màn và quay lại khiến lần copy tiếp theo bị chặn | Hủy phần chờ UI theo lifecycle; lượt mới độc lập; phản hồi muộn không hiện dialog sai màn |
| F06 | Clipboard không trả lời làm nút chờ vô hạn | Chờ tối đa8giây rồi mở dialog sao chép thủ công; không báo clipboard thành công. Nhãn Đang sao chép/aria-busy trong lúc chờ |
| F07 | Rà soát focus action toolbar khi async load hoàn tất | **Đã đạt từ source hiện hành**, không viết lại hoặc nhận là sửa mới |
| F08 | Rà soát dòng đang focus bị xóa khỏi nguồn khi refresh | **Đã đạt từ source hiện hành**: fallback vùng danh sách; giữ nguyên |
| F09 | Rà soát query dài/3dòng/Xem đầy đủ | **Đã đạt từ source hiện hành**. Lượt probe đầu dùng selector reader cũ; đã sửa selector và chạy lại, không tính false-positive thành lỗi ứng dụng |
| F10 | Nút Xem đầy đủ query dài dưới44px do style P12 thắng specificity | Override chỉ trong `.p16-state`, tối thiểu44px; không sửa source query hoặc các reader P12 khác |

[Before P17](evidence/revision-03/before/findings.json) · [P16 before kiểm lại đúng selector](evidence/revision-03/p16-before/findings.json) · [After](evidence/revision-03/after/findings.json) · [Review trước–sau](REVIEW_03.html).

## Thay đổi nguồn

- `scan-exceptions/experience.mjs`: lifecycle clipboard có timeout/cancel UI, phục hồi form/caret, mở thông tin đối chiếu và phối hợp navigation.
- `scan-exceptions/navigation.mjs`: component mới dùng `shared/dialog-route.mjs`, chỉ lưu entry UI tạm; không cấp quyền hoặc đổi dữ liệu nghiệp vụ.
- `shared/dialog-route.mjs`: thêm opt-in `adoptCurrent`; mặc định các caller cũ không đổi. Adopt marker khi quay lại để không push lặp cùng ngoại lệ.
- `scan-exceptions/view.mjs/style.css`: CTA/copy unavailable rõ nghĩa, disclosure44px, aria-controls và trạng thái chờ copy.
- P04/P05/P07 mount lifecycle nối Back/Escape. P16 chỉ tăng hit area reader trong `data-states/style.css`; giữ code nguồn đọc/danh sách/attachment và các cải tiến từ chat khác.

Nguồn chuẩn/commit `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target prototype tại `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp/docs/flows`. [Bảng nguồn trước sửa](REVISION_03_SOURCE_MAP.md), [patch/manifest](evidence/revision-03/manifest.json). Snapshot root đầu phiên ghi **P18 r03**; không kéo checkpoint chung về P17 hoặc sửa công việc P18. Tạm chốt P17 r02 trong repo được bảo toàn dưới dạng lịch sử, không suy user đã duyệt r03.

## Kiểm chứng thực chạy

- `node --test tests/exception-experience.test.mjs tests/scan-exceptions.test.mjs tests/inbound.test.mjs tests/outbound.test.mjs tests/nfc.test.mjs tests/data-states.test.mjs tests/documents.test.mjs tests/dialog-route.test.mjs`: **126/126 PASS**. [Log](evidence/revision-03/node-tests.txt).
- `$env:AUDIT_PHASE='after'; node scripts/audit_p17_r03.cjs`: **10/10 hạng mục đạt sau sửa**, gồm7defect và3regression đã đạt sẵn. Probe clipboard rút timeout xuống500ms bằng request interception, unit test thêm timeout/cancel/late settlement; code ứng dụng dùng8giây. [Kết quả](evidence/revision-03/after/findings.json).
- `$env:P17_EVIDENCE_DIR='handoff/P17/evidence/revision-03/regression'; $env:P17_FIT_DEFAULT='1'; node scripts/check_p17.cjs`: **6/6 nhóm PASS**,4panel×5viewport, default content vừa vùng cuộn và CTA trong khung; request/mapping/permission không bị đổi. [Kết quả](evidence/revision-03/regression/browser-results.json).
- `node scripts/check_p17_navigation_r03.cjs`: **5/5 nhóm PASS**: CTA đối chiếu, native Back/Forward/Escape, reader dài tại6viewport, P05 blocked và P07 detail→exception→owner. [Kết quả](evidence/revision-03/navigation/results.json).
- FooterLOCK: **4/4 viewport PASS** bằng suite hiện hữu, output riêng tại [footer](evidence/revision-03/footer/results.json).
- Syntax module và `git diff --check` đạt; source prototype phần lớn untracked nên dùng thêm manifest/patch so với snapshot đầu audit. Không pageerror trong các suite hoàn tất.

Ảnh before/after cùng Chromium headless, DPR1/zoom1/Arial, fixture và reference494×950. Matrix360×800,430×932,1440×900,340×420; reader thêm1869×940. Đã xem ảnh thật của các lỗi trước/sau; không dùng số test làm pixel acceptance. Log lỗi setup/selector/CSS intermediate được lưu diagnostics, báo cáo chỉ lấy kết quả cuối hoàn tất.

## Giới hạn

“Sửa triệt để” ở đây là xử lý nguyên nhân và bổ sung ca hồi quy cho các lỗi đã tái hiện trong phạm vi trên. WMS/API và camera/NFC/clipboard thiết bị, screen reader thật chưa được chứng minh bởi fixture. Cancel clipboard chỉ hủy phần chờ/phản hồi UI; không tuyên bố có thể hủy việc ghi clipboard đã được hệ điều hành nhận. Thiếu status vẫn không retry mutation hoặc tạo phiếu bù.

Không push/merge/deploy. [Mở ứng dụng](http://localhost:8766/flows/auth-session/?review=p17-r03), `minhanh / preview`; [mở review r03](REVIEW_03.html).
