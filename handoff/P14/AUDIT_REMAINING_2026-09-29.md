# P14 · Audit ba màn còn lại · 2026-09-29

**Đã kiểm tra P14.S01/S03/S04; chỉ audit và đề xuất, chưa sửa source app.** Bản đang chạy P14-r02. Phát hiện lỗi ngoài coverage happy path r01/r02; không suy các kết quả PASS lịch sử bao phủ những ca mới này. S02 r02 giữ nguyên.

## Phương pháp và giới hạn

Chromium headless, app localhost8766, dữ liệu phiên preview minhanh; đọc source view/model/Home bridge và chụp actual. Kiểm mặc định, recovery UNKNOWN, lưu nháp, end timeout rồi đối chiếu, mở chi tiết nháp trước/sau tạo phiếu mới, date/nav, stress mã dài và Back. 494×950 CSS px/DPR1; S04 kiểm thêm360×800/430×932/340×420. Dữ liệu dài chỉ inject fixture trong browser cô lập, không sửa code adapter hoặc dữ liệu người dùng. Không kiểm bàn phím thiết bị thật, API/WMS. Bộ r02 trước đó có đủ4panel×6viewport, không chạy lại toàn bộ suite cho audit này.

[Observations](evidence/audit-remaining-2026-09-29/observations.json) · [Long/Back metrics](evidence/audit-remaining-2026-09-29/long-and-back.json). Lần đầu script audit gọi menu đang ẩn tại P05 nên timeout; đã sửa kịch bản đi Back bằng control thật rồi chạy lại. Lần đầu interceptor long fixture bỏ query string nên không tác động; đã thêm wildcard và assertion độ dài để bảo đảm ca stress thực sự chạy. Không tính các lần setup sai này là lỗi sản phẩm.

## Lỗi quan sát được

| ID | Màn | Bằng chứng | Khắc phục đề xuất |
|---|---|---|---|
| F01 | S03 | Sau lưu nháp thành công → end timeout-recorded → đóng dialog: banner xanh vẫn nói Có thể xác nhận kết thúc ca, nút End disabled, phía dưới báo Cần đối chiếu. | Một trạng thái trình bày chung cho banner, lời hướng dẫn, nhãn/disabled/action. Pending/UNKNOWN ưu tiên hơn saved. |
| F02 | S04 | Kết thúc với1nháp; Home → mở phiếu xuất mới → Back → mở lại Tổng kết. Count vẫn1nhưng Xem chi tiết có PN-0005 và PX-0005. | Summary count/list/details cùng lấy snapshot request.records của receipt kết thúc; không đọc current records cho lịch sử ca cũ. |
| F03 | S03 | Mã dài stress làm row cao546px, không marker reader; nội dung1049px trong vùng787px. | Nhãn/mã tối đa2dòng + reader shared, giữ nguyên chuỗi; bố trí row co giãn đúng cột, icon/action không co. |
| F04 | S03 | Scroll262px → Tiếp tục phiếu → Back: trở về0px. | Lưu scroll và focus theo panel/phiên; phục hồi sau render. Guard đúng ownerID/phiên/version, không tái tạo phiếu. |
| F05 | S01 | Pending recovery dùng copy chung Giữ nguyên yêu cầu và phiếu dù không có phiếu kho trong luồng recovery. | Nội dung riêng theo action: yêu cầu khôi phục / lưu nháp / kết thúc ca. Giữ cùng request, không tự retry. |

F01 vàF02 ưu tiên sửa trước phần trang trí. F03/F04 là state dài/giữ ngữ cảnh chưa được kiểm bởi suite happy path cũ. Hình mặc định S01/S03/S04 không thấy tràn ngang ở các mẫu đã đo; header/footer ổn định. Không xem khoảng trắng hoặc title lặp từ B14 là lỗi cần tự redesign.

## Đề xuất nâng cấp UI/UX

### S01 · Khôi phục tài khoản

- Đồng bộ dock hành động56px/lề24 vớiS02; normal=Gửi yêu cầu hỗ trợ, pending=Đối chiếu kết quả, busy=Đang gửi/Đang đối chiếu. Form+hint cuộn, header/dock cố định.
- Dùng liên kết form attribute hoặc handler owner để Enter vẫn submit và validation focus đúng field. Không thêm field, regex username, OTP/reset hay sửa policy.
- Cảnh báo UNKNOWN chỉ nói yêu cầu khôi phục; không để hai CTA khác nhau khiến người dùng phải đoán bước tiếp. Back khi busy giữ lifecycle chống receipt muộn, không báo thành công nếu đã rời.
- Default hiện không bị tràn; dock là cải thiện nhất quán, không phải sửa lỗi overlap đã chứng minh. Keyboard thật cần kiểm riêng.

### S03 · Kết thúc ca

- Dùng state presentation chung: đang xử lý → cần đối chiếu → bị chặn bởi phiên/quyền/kho → còn phiếu chưa lưu → sẵn sàng kết thúc. UNKNOWN không mang banner xanh ready.
- Giữ cả hành động Tiếp tục/Lưu nháp/Kết thúc nhưng nhấn rõ bước hiện hành. Một phiếu thì ghi rõ mã trên action; nhiều phiếu cho chọn đúng dòng, không gọi Tiếp tục phiếu mà âm thầm chọn một đối tượng.
- Nút hành động chính trong dock phía trên footer đã khóa. Không nhét cả ba nút lớn vào dock nếu che phần danh sách; lưu/tiếp tục là context action theo trạng thái. End disabled phải có lý do đúng, busy có nhãn cụ thể.
- Xem tất cả hiện chỉ mở dialog văn bản gồm ID nội bộ/phiên quét/version. Đổi thành danh sách nghiệp vụ: mã, loại, trạng thái và action mở đúng phiếu. Thông tin kỹ thuật thu gọn có nhãn khi cần đối chiếu. Dùng overlay hiện có, không tạo panel thứ5 hoặc chồng modal.
- Reader2dòng, lưu scroll/focus, giữ fullIDs; nguồn UNKNOWN chuyển về owner đối chiếu. Không cho thao tác lưu làm giải quyết giả một UNKNOWN của owner.

### S04 · Tổng kết ca

- Count và Xem chi tiết cùng dùng danh sách tại thời điểm kết thúc; ghi rõ phạm vi này. Phiếu mới sau đó không tự xuất hiện trong tổng kết cũ.
- Xem chi tiết dùng card/danh sách nghiệp vụ của cùng snapshot. Có thể xem metadata; đường tiếp tục chỉ chạy sau khi kiểm đúng owner/current version/quyền, nếu chưa có contract thì trình bày pending, không tự bàn giao.
- Tăng vùng bấm link Xem chi tiết từ36px hiện tại lên44px; có thể biến cả thẻ Phiếu nháp thành cùng một action rõ ràng, không lồng button.
- Ngày đầy đủdd/MM/yyyy giốngS02; ca qua đêm thể hiện mốc bắt đầu/kết thúc có ngày, không chỉ hai giờ dễ hiểu nhầm. Dùng biến thể metadata2cột khi không có action, không chừa cộtcopy trống.
- Giữ gridKPI, header và dock Về Trang chủ đang ổn. KPI tiếp tục là aggregatefixture có định nghĩa, không cộng từ số row. Tối ưu spacing có nguồn khi tăng vùng bấm; không nén leading hoặc sửa footerLOCK.

## Tiêu chí nghiệm thu đề xuất P14 r03

1. Normal/busy/error/UNKNOWN/verified: banner, CTA, lý do khóa nhất quán; không hiện receipt/success trước xác nhận.
2. S01 Enter/validation/Back/keyboard; duy nhất action phù hợp, không gửi lại UNKNOWN.
3. S03 0/1/nhiều phiếu; mã/tên250/2000ký tự, reader nguyên văn, mở đúngID; Back giữ scroll/focus; save/error/ownerUNKNOWN không mất dữ liệu.
4. S04 count=list=details tại cùng thời điểm chốt; tạo/chỉnh phiếu sau ca không đổi tổng kết. Kiểm ca qua đêm, tên dài, count0 và thiếu aggregate.
5. Sáu viewport, không tràn ngang; header/CTA/footer không dịch; dialog trap/Back/Escape/đóng nền đúngcontract.
6. Giữ4panel và24board/91panel. Tách visualuserreview / behaviorfixture / integrationbackend. Chưa tự định nghĩa policy bắt đầu ca mới hay khóa thao tác sau ca.

## File nguồn liên quan

`recovery-shift/view.mjs`: form/end/summary/showRecords/render; `style.css`: scroll/record/metadata/actions; `model.mjs`: snapshot nguồn hiện tại và summary receipt; `home/home.mjs`: onBack/onContinue/getRecords. Chưa sửa các file này trong lượt audit. Source hashes lưu kèm evidence.
