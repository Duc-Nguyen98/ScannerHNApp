# MOTION_CONTRACT — ScannerHNApp

v1.0 · 30/09/2026 · Đề xuất triển khai cho bản UI/UX review.

## Phạm vi và trình tự

Contract này bổ sung `00_CONTRACT_CHUNG.md` v2.0; giữ nguyên 24 board, 91 panel tham chiếu và nghiệp vụ đã chốt. P00 cũ là cách gọi contract/nền tảng, không phải board thứ 25. Namespace mới MOTION_P00 là setup motion; MOTION_P01–P24 ánh xạ đúng P01–P24 cũ. Không chạy lại prompt dựng giao diện cũ nếu code đã có.

Thứ tự bắt buộc: source P01–P24 đã dựng → `01_FLOW_LINK_GATE.md` nối luồng toàn hệ thống và kiểm UI → MOTION_P00 → MOTION_P01–P24 → prompt FINAL gốc kèm `FINAL_BRIDGE.md` → public preview. Chưa thêm animation ở bước FLOW; chưa publish ở FLOW/MOTION. Mọi checkpoint tiếp tục đúng file đang chạy, không yêu cầu người dùng soạn prompt con.

Đây là bộ lệnh mới, không phải kết quả đo hay code đã thực thi. Các hàng NOT_STARTED không có nghĩa code cũ chưa dựng; chúng là trạng thái của lượt nâng cấp flow/motion này.

## Chọn công nghệ theo source thực tế

| Công nghệ | Quyết định đề xuất | Điều kiện áp dụng |
|---|---|---|
| CSS transition + native scroll | Dùng làm nền tảng | Phản hồi focus/hover/pressed; cuộn bằng trình duyệt, giữ hành vi bàn phím/chạm hiện có. |
| Motion for React, trước đây Framer Motion | Một engine chính nếu source là React tương thích | Đọc package/lockfile và docs phiên bản hiện dùng. Nếu đã có framer-motion phù hợp thì tái sử dụng; không cài thêm motion song song chỉ để đổi tên. |
| SmoothUI | Tham khảo có chọn lọc; không import cả bộ | Đây là thư viện component có motion, không phải công tắc làm mọi trang mượt. Chỉ lấy pattern/code khi cần, giữ token/DOM/semantics baseline và kiểm license/dependency. Không thêm component/icon/ảnh mới trái contract. |
| GSAP | Chưa thêm ở scope này | Chưa có sequence phức tạp cần engine thứ hai. Nếu đã dùng ở app, kiểm owner rồi giữ vùng cô lập hoặc thay tối thiểu; không xóa dependency còn dùng ngoài scope. Không hai engine cùng animate một property/element. |
| Lenis | Không thêm cho app scanner | Ưu tiên native scroll ở form, scan, modal, viewer và list. Không smooth-scroll toàn app. |
| Locomotive Scroll | Không thêm cho app scanner | Không cần parallax/scroll scene cho tác vụ kho; không chồng controller với Lenis/native restoration. Tài liệu hiện hành cho biết thư viện xây trên Lenis; không suy phiên bản đã cài từ tên package. |
| TanStack Virtual | Chỉ thêm khi profile chứng minh danh sách dài gây nghẽn | Tối ưu số node render, không phải thư viện animation. React dùng adapter phù hợp nếu stack tương thích; list ngắn/pagination hiện có chạy tốt thì ghi NOT_NEEDED. |

Nếu source là HTML/CSS/JS, dùng CSS và Web Animations API khi cần; không chuyển cả dự án sang React để dùng Motion. Nếu là Vue/native, kiểm cơ chế animation có sẵn và giữ cùng hợp đồng hành vi; không nhét thư viện DOM vào app native. Thiếu source thực thi thì báo BLOCKED, không sửa dist minified hoặc dựng app khác giả hoàn thành.

## Token motion đề xuất — giá trị triển khai, không phải CSS baseline đã đo

| Token | Mặc định | Phạm vi |
|---|---|---|
| press | 100ms | Màu/opacity; scale0.99 chỉ với nút không làm giảm độ chính xác thao tác; disabled không animate như enabled. |
| feedback | 140ms | Viền/focus/selected/error/notice; thông tin và guard có hiệu lực ngay. |
| rowFeedback | 160ms | Highlight cục bộ một event mới, không làm đổi thứ tự/height/quantity. |
| route | 180ms | Cross-fade vùng nội dung do shell sở hữu; không dịch toàn app/camera. |
| panelEnter | 220ms | Modal/sheet opacity + translateY tối đa8px, dùng primitive overlay chung. |
| panelExit | 160ms | Exit hiển thị; không trì hoãn domain action hoặc security guard. |
| easeStandard | cubic-bezier(0.2,0,0,1) | Cùng một easing nhẹ, không bounce/overshoot mặc định. |
| reduced/off | Transform/layout/trang trí0ms; opacity tối đa80ms hoặc tắt | Còn đầy đủ nội dung, focus, busy/error và phản hồi ngữ nghĩa. |

Không cố animate mọi thứ. Static-by-design là quyết định đạt khi có lý do: video/reticle, text đang nhập, counter số lượng, status guard, PDF, bảng số cần đọc chính xác. Không count-up tồn/quantity, typewriter mã/UID, parallax hero, cursor custom, confetti, shimmer trang trí, autoplay nền hoặc reveal làm nội dung chưa thấy khi chưa scroll.

## Ownership và vòng đời

- Router là nguồn sự thật cho navigation; AppShell có một RouteTransition. OverlayManager sở hữu modal/sheet/focus/body scroll-lock; mỗi domain adapter sở hữu mutation; scanner/NFC service sở hữu phần cứng. Component con dùng motion primitive đã có, không tạo24 provider/scroller.
- Business event đi theo data/command layer hiện hành. `onAnimationComplete`, `transitionend`, mount/unmount và timer trang trí tuyệt đối không submit, Post, approve, link NFC, xóa draft, đổi quyền hoặc thêm audit event. Không thêm thời gian đợi tối thiểu để spinner chạy đẹp.
- Một element/property chỉ có một owner. Không vừa CSS transition transform vừa Motion/GSAP transform trên cùng node; dùng wrapper phân tầng rõ nếu cần. Virtualizer sở hữu position/translate của row ngoài; animation nằm ở row content trong, không `layout`/height transition trên measured row.
- Không dùng random key/index cho record thay đổi; không key route theo toàn bộ query/field value gây remount form/camera. Key theo identity chuyển màn đã xác minh, query/filter giữ state đúng nghĩa.
- Outgoing subtree không còn pointer/focus hoặc semantics trùng; focus trap/restore/scroll-lock theo primitive có sẵn. Tránh unmount input đang IME, camera, store chỉ vì chạy exit. Dialog bị hủy giữa animation vẫn cleanup đầy đủ.
- Native Back/Forward, route mới, Back về list và đổi filter có policy scroll/focus riêng. Back khôi phục anchor itemID + offset khi phù hợp; router và virtualizer không tranh quyền restore. Không tự scroll-top mỗi render. Overlay không khóa cả trang sau đóng; visual viewport/keyboard/safe-area giữ CTA dùng được.
- Khi hết phiên/mất quyền/case closed, áp guard ngay; security-sensitive content phải mất ngay, không giữ snapshot qua exit fade. Chuyển nhanh nhiều route áp kết quả cuối hợp lệ; không queue cảnh cũ che cảnh mới.
- Cleanup animation/RAF/listeners/observers/timers khi unmount hoặc không còn cần; animation trang trí pause khi document hidden. Domain polling có lifecycle riêng, không để animation pause làm mất nghiệp vụ.
- Với Motion React: đặt policy `reducedMotion="user"`; dùng hook/CSS để quản lý phần còn lại. Policy này không tự tắt mọi opacity/background animation; phải tắt loop và điều chỉnh chúng riêng. Review mode có auto/reduced/off để test; không cho full mode vượt lựa chọn giảm chuyển động của OS trên sản phẩm.

## Virtualization và dữ liệu

Trước khi thêm TanStack Virtual, ghi list cần tối ưu, số record/DOM nodes, render time/scroll trace và thiết bị/viewport. Có thể tạo scenario stress riêng300/1000 hàng nếu phù hợp, seed cố định; không thay fixture chính hoặc tự coi số này là ngưỡng bắt buộc. Giữ pagination/server loading hiện có; virtualization không tải toàn bộ dữ liệu về máy.

Nếu cần: stable record key, estimate/measure theo source, overscan hữu hạn; preserve anchor khi append/filter/Back; không animate measurement height, không smooth scroll programmatic khi dynamic measurements chưa ổn định. Hàng recycled không replay entrance vì mount; focus/aria vị trí/count đúng, giữ hoặc chuyển focus có chủ đích khi hàng rời viewport. Search trên data/query, không dựa DOM visible. Không dùng virtualization để che màn/state chưa dựng.

Fixture, IDs, business status và quan hệ liên màn được giữ. Full/reduced/off phải cho cùng kết quả domain và operation count (bỏ khác biệt timestamp/ID ngẫu nhiên có chủ đích khi so); animation chỉ thay cách trình bày.

## Nghiệm thu và bằng chứng

FLOW_GATE chỉ PASS khi luồng UI fixture hoặc UI có backend đã kiểm đầy đủ theo phạm vi có nguồn, không còn blocker navigation/data/guard thiết yếu. Backend thật chưa có được tách thành giới hạn integration; không buộc có backend để review UI, cũng không báo backend PASS từ mock. Proposal còn thiếu không được chế luật để đạt gate; đánh dấu phần chưa thể kiểm, chỉ cho đi tiếp phần đã có contract và giữ release INCOMPLETE nếu thiếu scope thiết yếu.

MOTION_P00 chụp/đo baseline trước. Mỗi P kiểm tất cả panel của mình với full/auto, reduced và off; kiểm rapid input/navigation, focus, scroll, cleanup và dữ liệu. Một panel static vẫn có dòng evidence. Dùng các ca thật có ý nghĩa, không viết test chỉ kiểm tên class/token vừa thêm.

Mục tiêu trải nghiệm là tương tác phản hồi ngay và hướng tới60fps trên thiết bị mục tiêu; không hứa60/120fps mọi máy. So before/after cùng thiết bị/fixture/build mode: trace dropped frames/long tasks, input latency, DOM count và bundle delta liên quan. Nếu chưa có thiết bị thật, ghi browser/emulation và NOT_RUN phần hardware; không giả benchmark. Không lấy một Lighthouse score làm bằng chứng toàn app mượt. Không thêm will-change đại trà.

Giữ screenshot trạng thái tĩnh đã settle để so baseline; quay clip/trace đại diện cho route, modal, scan và long-list vì ảnh tĩnh không chứng minh motion. Chỉ lưu bằng chứng thật; không mask sai layout. Nếu có regression, sửa đúng owner và retest các consumer bị ảnh hưởng; không chạy lại toàn hệ thống sau mỗi thay đổi nhỏ. MOTION_P24 kiểm một lượt liên luồng và release readiness dựa evidence hiện hành.

## File tiến độ

Giữ `SCREEN_COVERAGE.csv` của bộ cũ. Bổ sung `handoff/motion/MOTION_COVERAGE.csv`: motion_prompt, panel_id, normal_status, reduced_status, off_status, flow_regression_status, decision, evidence, blocker. Status: NOT_STARTED/IN_PROGRESS/PASS/FAIL/BLOCKED/NOT_RUN. decision tách riêng APPLIED/STATIC_BY_DESIGN/REUSED/PENDING. Không dùng decision thay PASS.

Mỗi prompt xuất báo cáo tại `handoff/motion/Mxx/REPORT.md` gồm file sửa, owner, state, lệnh, kết quả, ảnh/clip/trace và vấn đề. Checkpoint lưu current_prompt/remaining_panel_ids/affected_dependencies/next_action. Không tạo prompt mới để tiếp tục và không hỏi xác nhận lại điều đã được giao.

Nguồn thư viện và rationale nằm trong `SOURCES_AND_STACK.md`. Chỉ pin phiên bản sau kiểm package/lockfile hiện hành; không cài @latest mù. Khi artifact/command không hỗ trợ, báo đúng giới hạn và tiếp tục phần làm được.
