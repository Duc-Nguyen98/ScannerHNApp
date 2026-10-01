# P14 r06 · Rà soát lại UI/UX và sửa lỗi trạng thái

User yêu cầu rà soát kỹ và khắc phục lỗi phát sinh. Phạm vi: đủ4panel P14 r05 và các điểm nối trực tiếp auth/P08/P15/logout/P18. **Đã sửa các lỗi xác định dưới đây; không tuyên bố toàn bộ app/production hết lỗi.** Visual chờ user review; behavior PASS cho phạm vi kiểm thử; integration WMS/native còn BLOCKED.

## Kết quả audit có bằng chứng

| Điểm | Trước sửa | Khắc phục |
|---|---|---|
| Focus/caret form recovery | Enter gửi lỗi → Escape đóng dialog → focus không về username | Nhớ đúng field và selection; không ghi đè context bằng heading tạm; phục hồi input sau lỗi |
| Tương tác trong lúc restore | Restore sau reader measurement có thể đặt focus lần nữa | Deferred callback chỉ phục hồi scroll, bị hủy khi user Tab/click/wheel/touch hoặc rời render; không giành focus |
| Validation/copy lỗi | Viền input vẫn xanh khi required lỗi; recovery failure còn nhắc phiếu dở | Viền/outline lỗi theo màu trạng thái có sẵn; whitespace không xóa invalid; copy riêng recovery |
| Receipt fixture | Hai lần mở recovery mới có cùngRQ…001; prefix ngàyUTC khác thời gianVN | Counter page-level duy nhất, ngàyVN, dùng một timestamp adapter; production ID vẫn phải do backend trả |
| Keyboard disclosure | Read-only dialog chỉ có Close trong focus trap, Tab không tới Thông tin đối chiếu | Native summary tabindex0 vào vòng focus của shared modal; Enter/Space mở/đóng |
| Spacing dialog | CSS reset chung ghi đè khoảng cách intro/status thành0 | Selector scopedP14 có specificity đủ; intro16px/status12px, không sửa style các dialog khác |
| Hết phiên/đăng nhập lại | P15 giữ owner nhưng guardP14 giữ authSession cũ; bấm lưu không có kết quả | Home resume gọi rebind sau xác nhận cùng namespace/actor/kho; P14 hide/clear khi expire/suspend; không tự cấp quyền |
| Request về muộn khi hết phiên | Model trả stale và có thể mất request để kiểm tra lại | Giữ nguyên pending ID/scope/records. Sau reauth chỉ Check được phép; không replay mutation hay nhận success tự động |
| Nháp bị dirty vì đọc cache | Lưu xong → cache địa chỉ refresh → unsaved0 thành1 dù document không đổi | Chỉ loại read-cache geography khỏi fingerprint so sánh; document/version/note/codes/request vẫn được kiểm; snapshot vẫn giữ đầy đủ |

[Audit browser trước sửa](evidence/revision-06/before/audit-results.json): **4FAIL/1PASS** sau ổn định preview. Back thông thường PASS trong checkout hiện tại, nên không tự sửa caller/history đã được chat khác chỉnh. [Sau sửa](evidence/revision-06/after/audit-results.json): **5/5PASS**. [Chứng minh geography](evidence/revision-06/before/geography-checkpoint.txt): unsaved0→1 chỉ do cache đọc; regression Node kiểm đã sửa và vẫn khóa khi note thực đổi.

## Source và bảo toàn công việc khác

HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; target docs/flows HTML/CSS/ES modules. Giữ4ID/24board/tối thiểu91panel, B14, footerLOCK, layout r05, action/logout và cảnh báo bàn giaoP18. Không sửa dist/gallery, không push/merge/deploy. Không đổi contractbackend hoặc thêm quyền.

Source sửa: recovery-shift/{view,model,presentation,record-dialog}.mjs, style.css; Home chỉ hooks hide/resumeP14, giữ logicP15/P18/P19 hiện có. Scope chỉ rebind cho cùng owner sau P01 xác nhận; original request vẫn mang scope cũ khi đối chiếu. Summary đã chốt không bị viết lại. Draft-retention của r05 không đổi.

Các nguyên tắc hình thức giữ từ r05:494×950CSSpx, icon/palette shared, metadata label16/value18, nút56px, copy44px, nội dung cuộn, header/dock/footer cố định. Thay visual nhỏ r06 có nguồn: viền lỗi từ màu error đang có; khôi phục spacing16/12 vốn bị reset; các thay đổi focus/keyboard là sửa hành vi, không redesignpanel.

## Preview khởi động

Đầu audit có GET module local còn pending và màn app trống, không có pageerror; lưu riêng [startup failures](evidence/revision-06/startup-failures.json), không tính chúng là lỗi chức năng P14. Đã xác minh PID server8766 rồi khởi động lại đúng server stateless, redirect stdout/stderr vào file; serve_preview.py dùng HTTP/1.1 và không log mọi200 vào terminal pipe. Mục đích tránh quá nhiều kết nối/log của module graph; không khẳng định đã chứng minh một nguyên nhân duy nhất của độ trễ môi trường.

Trong lúc làm, bootstrap/index/Home/P15 tiếp tục được sửa ở chat khác. Giữ bản startup loading/retry mới của chat đó, **không nhận là thay đổi r06 này**, không cài lại/revert. Node/browsers kiểm trên source hiện tại; bản audit dùng timeout30s cho môi trường local, không hạ kỳ vọng functional. Server khác8774/8781 và các tiến trình chat khác được giữ.

## Kiểm chứng cuối

| Suite | Kết quả |
|---|---|
| tests/p14-audit-r06 + recovery-shift + p14-presentation + p14-logout-retention | **35/35 Node PASS** |
| check_p14_audit_r06.cjs (P14_AUDIT_STAGE=after) | **5/5 browser PASS** |
| check_p14_micro_r06.cjs | **4/4 PASS**, caret/validation/dialog6viewport/Tab không bị giành/expiry trong request |
| check_recovery_shift.cjs | **16/16 PASS**,4panel/6viewport và A01–A05 |
| check_p14_receipt.cjs | **6/6 PASS**, clipboard/reader250–2200/6viewport |
| check_p14_upgrade.cjs | **8/8 PASS**, snapshot/overnight/12phiếu/ownerUNKNOWN/Back |
| check_p14_logout.cjs | **7/7 PASS**, logout/history/retention/reset/blocked |
| Bản copy check_p15_navigation_r03.cjs chuyển output vào evidenceP14 | **4/4 PASS**, giữ sourceP15 |
| Bản copy check_p18_logout.cjs chuyển output vào evidenceP14 | **3/3 PASS**, giữ cảnh báo dirty và expiryP18 |

Tổng **53 nhóm browser +35 Node**. File kết quả trong evidence/revision-06/{after,regression,receipt-regression,upgrade-regression,logout-regression,p15-regression,p18-regression}. [Node log](evidence/revision-06/node-tests.txt), [micro](evidence/revision-06/after/micro-results.json), [logout](evidence/revision-06/logout-regression/logout-results.json).

Chromium headless, Arial/DPR1/zoom1; viewport494×950,360×800,430×932,1440×900,340×420,1869×940. Không pageerror trong các suite cuối. Browser expiry-in-flight dùng delay3500ms và capture request chỉ trong test; payload check phải trùng nguyên request. Các test dữ liệu dài/nhiều phiếu là fixtures browser riêng, không ghi nguồnWMS. Không kiểm bàn phím thiết bị thật/camera/NFC/backend auth.

Lần micro đầu còn FAIL spacing vì selector chung mạnh hơn; đã sửa specificity trong đúngP14, chạy lại4/4PASS. micro-failure.json giữ lịch sử, micro-results.json là kết quả cuối. Không dùng failurecũ làm kết quả hiện tại hoặc sửa baseline để che sai khác.

## Bàn giao / giới hạn

[Review r06](REVIEW_06.html), [S01](evidence/revision-06/after/P14-S01.png), [S02](evidence/revision-06/after/P14-S02.png), [S03](evidence/revision-06/after/P14-S03.png), [S04](evidence/revision-06/after/P14-S04.png). Các ảnh default trước–sau cùng clock08:30; audit receipt midnight dùng02:21 để kiểm ngàyVN. Coverage/RUN_STATE chỉ cập nhật P14, không đặt lùi tiến độ các prompt ở chat khác.

Nháp r05 vẫn chỉ giữ qua logout/login trong cùng trang preview, reload/reset đặt lại. Cơ chế khôi phục, lưu bền/auth/ca/WMS và thiết bị thật chưa nghiệm thu. Lần tạm chốt r05 trong metadata vẫn giữ như lịch sử; r06 chờ user review. Phần đã kiểm và giới hạn được tách rõ, không kết luận mọi trường hợp production đều đã PASS.
