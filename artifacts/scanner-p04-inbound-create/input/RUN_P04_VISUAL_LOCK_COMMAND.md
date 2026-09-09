# RUN P04 — VISUAL LOCK ENFORCED EXECUTION COMMAND

Thực thi đúng prompt P04 được đính kèm.

COMMON_HOANAM_SCANNER_OPERATIONAL_PRO.md là contract bắt buộc và có ưu tiên cao hơn mọi suy luận hoặc quyết định thiết kế tự phát.

P01–P03 đã được Visual Lock theo bộ reference Operational Pro đã được phê duyệt.
Từ P04 trở đi, toàn bộ màn hình mới PHẢI kế thừa trực tiếp visual grammar đã Visual Lock PASS.

Không được quay về:
- generic card-based UI
- giao diện cũ của repository
- layout admin template cơ bản
- excessive rounded cards
- excessive borders
- plastic UI
- component styling khác với các màn đã được Visual Lock
- tự sáng tạo một design language mới

Các reference đã Visual Lock PASS là Visual Source of Truth về:
- màu sắc
- typography
- spacing
- radius
- surface treatment
- icon treatment
- header
- CTA
- form
- section hierarchy
- information density
- modal / dialog / bottom sheet
- overall Operational Pro feeling

Nếu có asset trong:
HoaNam_Scanner_Approved_Asset_Pack.zip

thì ưu tiên tái sử dụng đúng asset đã được phê duyệt.
Không tự thay bằng stock image hoặc asset có visual khác nếu không thật sự cần thiết.

---

CHỈ XỬ LÝ PHẠM VI P04.

Không tự mở rộng sang P05.
Không thực hiện trước các màn hoặc chức năng thuộc prompt tiếp theo.

Không tự redesign business flow.

Không tự thay đổi:
- Authentication / Session
- Route Guard
- RBAC
- Permission Matrix
- Inventory Ledger
- Post / Ghi sổ
- Inbound business rule
- Outbound business rule
- Warranty
- Warranty Parts
- NFC
- Warehouse Paused
- Draft Protection
- Scanner Context

Business logic và dữ liệu hiện tại phải được giữ nguyên.

Nếu phát hiện nghiệp vụ chưa rõ:
ghi OPEN DECISION.
Không tự suy luận nghiệp vụ mới.

---

PREVIEW CONTRACT

Preview phải được dựng như một Mobile App runtime thật và đồng thời là visual specification trực quan cho Mobile App Developer.

Dev phải có thể nhìn preview và dựng gần như 1:1 mà không cần tự suy luận lại:
- layout
- component hierarchy
- spacing
- CTA
- modal behavior
- navigation behavior
- error states
- disabled states
- responsive behavior

Mọi:
- Modal
- Dialog
- Bottom Sheet
- Confirm
- Toast
- Popup
- Overlay
- Loading Layer

phải nằm 100% BÊN TRONG app viewport.

Không được phủ ra ngoài khung mobile preview.
Không được sử dụng browser top-layer nếu làm overlay thoát khỏi app viewport.

---

VISUAL LOCK REQUIREMENT

P04 phải có cảm giác thuộc CÙNG MỘT APP với:

- Login
- Start Shift
- Home Operational Dashboard
- Global Scanner
- Modal / Dialog

đã được Visual Lock trước đó.

Khi đặt màn P04 cạnh các màn Visual Lock PASS, người xem phải nhận ra ngay:

“Đây là cùng một Design System.”

Không chấp nhận trường hợp:
Home rất premium nhưng P04 lại trở về giao diện form trắng generic.

Form P04 phải áp dụng Operational Pro:

- Strong page hierarchy
- Compact enterprise form
- Logical grouping
- Ít card hơn
- Ít border hơn
- Clear labels
- Clear field states
- Appropriate section dividers
- Professional density
- Primary CTA rõ
- Mobile one-hand usability
- Không decorative UI không cần thiết

---

TARGET VIEWPORT

Primary visual target:

390 × 844

Sau khi hoàn thiện 390×844, responsive có kiểm soát cho:

360 × 800
430 × 932

Không được tạo 3 layout khác nhau.

Chỉ được adapt:
- width
- spacing
- safe area
- scroll
- text wrapping cần thiết

---

SAU KHI IMPLEMENT BẮT BUỘC

1. Tạo BEFORE screenshot.
2. Tạo AFTER screenshot.
3. Capture:
   - 360×800
   - 390×844
   - 430×932
4. Tạo side-by-side visual evidence.
5. Test business regression.
6. Test RBAC.
7. Test warehouse active / paused nếu P04 liên quan.
8. Test draft preservation.
9. Test keyboard behavior.
10. Kiểm tra field/CTA không bị keyboard che.
11. Kiểm tra sticky CTA không che content.
12. Kiểm tra bottom navigation không che content.
13. Kiểm tra safe area.
14. Kiểm tra console error.
15. Kiểm tra page error / unhandled exception.
16. Kiểm tra accessibility liên quan.
17. Kiểm tra focus / labels / error association.
18. Tạo đúng report Markdown mà P04 yêu cầu.

Không được PASS chỉ vì:
- build thành công
- lint thành công
- unit test PASS

Phải có VISUAL EVIDENCE.

---

VISUAL QA

Bắt buộc tự đánh giá:

- Visual match với Operational Pro
- Typography consistency
- Color consistency
- Spacing consistency
- Radius consistency
- Form quality
- CTA consistency
- Information hierarchy
- Enterprise feeling
- Mobile usability

Không được tự nâng điểm để PASS.

Nếu giao diện vẫn có cảm giác:
- generic
- basic
- plastic
- card-heavy
- khác P01–P03

thì phải tiếp tục chỉnh sửa trong phạm vi P04.

---

PASS / FAIL GATE

Nếu bất kỳ Acceptance Criteria bắt buộc nào FAIL:

STOP.

Tạo report:

P04 FAIL — FIX REQUIRED

Nêu rõ:
- lỗi
- root cause
- evidence
- phương án sửa

Không chạy P05.

Nếu toàn bộ Acceptance Criteria PASS:

Tạo report kết luận:

P04 PASS — READY FOR P05

Sau đó STOP.

Không tự thực thi P05.

---

Thực thi đúng prompt P04 được đính kèm.

COMMON là contract bắt buộc.

P01–P03 Visual Lock PASS là visual baseline bắt buộc.

Chỉ xử lý phạm vi P04.

Tạo đầy đủ implementation, BEFORE/AFTER, mobile evidence, regression và report.

Dừng ngay sau PASS/FAIL.

Không tự chạy P05.
