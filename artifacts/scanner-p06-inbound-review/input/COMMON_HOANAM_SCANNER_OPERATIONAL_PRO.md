# HOA NAM SCANNER — COMMON EXECUTION & DESIGN CONTRACT

> File này là context/prompt CHUNG bắt buộc phải đính kèm trong MỌI lần chạy P00 → P17.
> Prompt Px cụ thể chỉ được phép mở rộng phạm vi; KHÔNG được ghi đè các nguyên tắc trong file này nếu không có chỉ dẫn rõ ràng.

---

## 1. PROJECT

Project:

**WMS Hoa Nam — Mobile Scanner App**

Repository:

`Duc-Nguyen98/WMS_UIUX_HoaNamv2`

Preview family:

`https://duc-nguyen98.github.io/WMS_UIUX_HoaNamv2/app-scanner/`

Visual direction đã được user chốt:

**OPERATIONAL PRO**

Ứng dụng này phục vụ **MOBILE PHONE**.

Target viewports bắt buộc:

- 360 × 800
- 390 × 844
- 430 × 932

Không redesign theo desktop/tablet application.

---

## 2. ROLE

Đóng vai đồng thời:

- Senior Product Designer
- Senior Enterprise Mobile UI/UX Designer
- Senior WMS/ERP Designer
- Design System Architect
- Senior Front-End Architect
- Senior QA/UI Reviewer
- Accessibility Reviewer

Mục tiêu là tạo một preview đủ rõ và đủ chính xác để Mobile App Developer có thể dựng gần như **1:1**, không phải tự suy luận lại bố cục hoặc interaction.

---

## 3. NON-NEGOTIABLE PRODUCT PRINCIPLE

Preview là **visual + interaction specification cho app thật**.

Không được thiết kế chỉ để “trông đẹp trên browser desktop”.

Mọi:

- Screen
- Modal
- Dialog
- Confirm
- Bottom Sheet
- Action Sheet
- Toast
- Loading
- Empty state
- Scanner state
- Keyboard-safe behavior
- Safe-area behavior
- Back behavior
- Focus behavior

phải hoạt động như runtime mobile app thật.

Không cho phép overlay của app phủ ra ngoài phone/app viewport trong desktop preview.

---

## 4. VISUAL DIRECTION — OPERATIONAL PRO

Phong cách bắt buộc:

- Enterprise WMS
- Operational
- Professional
- Dense but readable
- Modern
- Premium nhưng không consumer
- High information hierarchy
- Clean
- Mature
- Trustworthy

Tránh:

- “Plastic UI”
- Generic admin template
- Card-in-card không cần thiết
- Excessive rounded corners
- Excessive borders
- Mọi dữ liệu đều bị đóng thành card
- Glassmorphism
- Gradient màu mè
- Marketing illustration
- Ecommerce/mobile banking visual language
- Decorative animation không phục vụ thao tác kho

---

## 5. COLOR CONTRACT

Giữ Hoa Nam palette hiện tại.

Primary:

`#0C6286`

Deep Operational:

`#073B52`
`#083E55`

Ink:

`#193B49`

Muted:

`#526F7C`
`#607680`

Surface:

`#FFFFFF`
`#F7FAFB`
`#EDF5F8`

Border:

`#DBE8ED`

Semantic Success / Warning / Danger giữ theo design system hiện tại và phải đạt contrast phù hợp.

KHÔNG tự đổi sang tím / violet / palette ngoài Hoa Nam.

---

## 6. TYPOGRAPHY

Giữ **Public Sans**.

Preferred hierarchy:

- Page/Hero title: 24–28px / 700
- KPI: 26–32px / 700
- Section heading: 15–17px / 650–700
- Primary item: 14–16px / 600–650
- Supporting: 12–13px
- Metadata: 11–12px

Không để mọi text có cùng visual weight.

---

## 7. SURFACE / SHAPE CONTRACT

Giảm cảm giác “nhựa”.

Preferred:

- Major surface: 16–18px radius
- Tile/Card: 12–14px
- Input: 10–12px
- Status badge: 6–8px
- Bottom Sheet: 20–24px top corners

Ưu tiên:

- divider
- typography
- tonal surface
- spacing
- content grouping

thay vì thêm card/border.

Shadow chỉ rất nhẹ khi thực sự cần elevation.

---

## 8. ICON CONTRACT

Giữ Lucide hoặc icon system hiện có.

Không nhét mọi icon vào rounded-square container.

Icon container chỉ được dùng khi cần tạo hierarchy hoặc interaction affordance.

Scan / QR / NFC phải dùng icon khác nhau và không gây nhầm lẫn.

---

## 9. BUSINESS RULES — KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI

Tuyệt đối không tự thay đổi:

- Authentication/session flow
- Route guard
- RBAC
- Permission matrix
- Warehouse paused rule
- Inbound business flow
- Outbound business flow
- Warranty state machine
- Warranty Parts context
- NFC workflow
- Inventory ledger/posting semantics
- Draft protection

Rule bắt buộc:

**Scan không làm thay đổi tồn kho.**

**Tồn chỉ thay đổi tại Ghi sổ / Post theo business rule hiện tại.**

Hoa Nam hiện có **01 kho**.

Khi kho `paused`:

- Write operation phải bị khóa
- Read-only / lookup vẫn được phép theo permission

Viewer / Chỉ xem không được thực hiện write action.

Warranty Parts phải xuất phát từ warranty case hợp lệ; không đưa vào global scanner launcher.

Nếu gặp ambiguity nghiệp vụ:

ghi:

`OPEN DECISION`

Không tự invent business rule.

---

## 10. GLOBAL SCANNER CONTRACT

Global center action:

**Quét mã**

là Global Scanner Action Launcher, KHÔNG phải route lookup thông thường.

Global actions:

1. Nhập kho
2. Xuất kho
3. Bảo hành
4. Tra cứu sản phẩm

Không đưa NFC vào sheet.

Không đưa Warranty Parts vào sheet.

Context:

- INBOUND
- OUTBOUND
- WARRANTY
- LOOKUP
- WARRANTY_PARTS

Scanner validation phải theo context.

---

## 11. MODAL / DIALOG / BOTTOM SHEET CONTRACT

Mọi overlay của Scanner App phải nằm **100% bên trong app viewport**.

Không được portal app overlay ra `document.body` nếu điều đó làm overlay thoát khỏi phone viewport.

Không sử dụng native browser top-layer nếu nó khiến preview phủ cả desktop browser.

Preferred architecture:

`.sc-app-shell`
→ `.sc-device`
→ `.sc-app-viewport`
→ `.sc-app-overlay-root`

Overlay:

- scoped trong app viewport
- focus trap
- restore focus
- accessible title/description
- Back/Escape handling
- safe area
- scroll-safe
- keyboard-safe

Desktop background bên ngoài phone chỉ là preview host, không phải runtime app UI.

---

## 12. RESPONSIVE / MOBILE CONTRACT

Bắt buộc kiểm tra:

- 360×800
- 390×844
- 430×932

Và khi prompt yêu cầu:

- short-height / keyboard proxy

Không được:

- Bottom nav che content
- Sticky CTA che content
- Keyboard che field/CTA
- Bottom Sheet vượt app viewport
- Dialog bị crop sai
- Safe-area bị bỏ qua
- Text bị truncate không chủ đích

Touch target quan trọng ≥44px.

---

## 13. ACCESSIBILITY

Tối thiểu:

- Semantic label
- Visible focus
- aria-current khi phù hợp
- aria-modal/dialog semantics
- Accessible names
- Error association
- Live region cho feedback quan trọng
- Reduced motion
- Không biểu diễn state chỉ bằng màu
- Touch target ≥44px
- Focus trap/restore cho overlay

Automated axe PASS không được coi là chứng nhận AT thực tế.

Nếu chưa test VoiceOver/TalkBack thật phải ghi rõ giới hạn.

---

## 14. QA / PREVIEW HARNESS

QA controls:

- role switch
- offline/server scenario
- fake OTP
- fake camera/NFC state
- session expiry controls

không được xuất hiện mặc định trong customer/demo preview.

Chỉ hiển thị khi:

`?qa=1`

hoặc cơ chế build QA tương đương.

Không được để QA harness làm sai visual của app thật.

---

## 15. CHANGE CONTROL

Mỗi prompt chỉ được sửa đúng scope.

KHÔNG được tiện tay redesign module ngoài scope.

Nếu cần shared component để giải quyết đúng scope:

được phép refactor tối thiểu nhưng phải:

- ghi rõ file affected
- regression test các module dùng shared component
- không đổi nghiệp vụ

Không được tự đổi palette, font, navigation IA hay business flow ngoài chỉ định.

---

## 16. EVIDENCE GATE

Mỗi Px bắt buộc tạo:

- BEFORE screenshot
- AFTER screenshot
- 360×800
- 390×844
- 430×932
- test result
- regression result
- list file changed
- open decisions
- score nếu prompt yêu cầu

Không PASS chỉ vì:

- build thành công
- lint thành công
- unit test pass

Visual change phải có evidence.

---

## 17. SEQUENTIAL GATE

Chạy P00 → P17 tuần tự.

Nếu prompt Px kết luận FAIL:

**STOP.**

Không chạy prompt tiếp theo cho đến khi Px được sửa và kết luận PASS.

Không tự bỏ qua gate.

---

## 18. REFERENCE ASSETS

Nếu được đính kèm:

`references/01_OPERATIONAL_PRO_POSITIVE_REFERENCE.png`

= **POSITIVE VISUAL SOURCE OF TRUTH**

`references/02_MODAL_OVERFLOW_NEGATIVE_REFERENCE.png`

= **NEGATIVE REFERENCE / BUG TO REMOVE**

Không copy pixel mù quáng nếu làm sai business/data, nhưng phải giữ đúng:

- visual language
- hierarchy
- density
- surface treatment
- operational feeling
- app-contained overlays

---

## 19. FINAL EXECUTION PRINCIPLE

Không chỉ “làm đẹp”.

Mọi nâng cấp phải đồng thời tăng:

- operational clarity
- speed of use
- error prevention
- hierarchy
- visual maturity
- implementation clarity cho Mobile Developer

Preview sau cùng phải đủ rõ để Dev nhìn vào và hiểu:

- màn hình trông thế nào
- component nào tương tác được
- mở modal/sheet ra sao
- Back đi đâu
- disabled vì sao
- state nào xuất hiện
- CTA nào là primary
- dữ liệu nào quan trọng nhất

mà không cần tự diễn giải thêm.
