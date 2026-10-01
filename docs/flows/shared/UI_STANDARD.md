# Hoa Nam APP — chuẩn icon nghiệp vụ đã được user duyệt (v1)

## P24 r03 — audit theo yêu cầu user

Giữ sáu cải tiến r02; sửa14 ca tái hiện: footer closed không co khi load, context P20 phản ánh owner hiện tại, thời gian/ID dài đọc đủ và không tràn, Back từ phiếu/lịch sử phục hồi đúng result ID/focus/cuộn, timeline trở lại đúng nguồn P20, stepper giữ focus khi bị khóa ở biên, tem đơn không gọi nhầm hộp, lượt nhập mới thay đúng identity trong history entry. P04/P05 dùng createWaitingResultReturn chung; callback muộn không giành focus mới, không phục hồi result khác/UNKNOWN. P20 hoãn repaint dưới reader tới khi đóng, giữ một overlay; không tự tạo event/sync backend. Hình thức vẫn chờ user review; nguồn/evidence tại handoff/P24/REVISION_03.md và REVIEW_03.html. Không đổi footer Home/P03, policy Post, 24board/91panel hoặc suy fixture thành production acceptance.

## P24 r02 — sáu cải tiến được user yêu cầu triển khai

User yêu cầu áp dụng cả sáu đề xuất: S01 so sánh quantity dòng đang sửa trước→sau; S02 số mã/phiếu được giữ và Sửa mã vừa nhập; S03 CTA Xem phiếu theo documentId, hai mốc record đã xác minh/chờ Web và Chưa ghi sổ · Chưa đổi tồn; S04 một notice chỉ đọc dưới context và link P23 quá trình bảo hành. P20 giữ cache/cuộn/focus khi Back; caller P23 được tạo trong instance phiên theo case ID, không tin marker URL/history lạ. Không đổi guard/backend/UNKNOWN/Post hoặc footer Home/P03. Nhãn phiếu dài gọn2dòng, số đầy đủ xem qua reader trong summary. Hình thức mới chờ user review; evidence tại handoff/P24/REVISION_02.md và REVIEW_02.html. P23 r03 vẫn tạm chốt lịch sử; nhánh caller từ P24 là adaptation mới.

## P23 tạm chốt / P24 r01 — user30/09/2026

User tạm chốt P23 r03 khi chuyển P24; state đồng bộ bổ sung sau (handoff/P23/TEMPORARY_ACCEPTANCE.md). P24 giữ S01 validation số lượng của owner P19, S02 mã hộp chưa nhập không đổi accepted list, S03 record nhập/xuất chờ Web của owner P04/P05, S04 closed chỉ đọc của P20/P09. Tồn chưa xác minh không cho xác nhận số lượng/Post. UNKNOWN yêu cầu cũ được đối chiếu kể cả case đóng, không mở xuất mới. S03 dùng waiting-web chung: monitor pastel, badge amber, số mã khác tổng quantity, thời gian chỉ từ receipt; P19 success vẫn Đã xuất. Mẫu B24 nhập/xuất chỉ opt-in ngoài app, không đổi nguồn mặc định. Footer Home/P03 giữ nguyên; các actions kết quả P04/P05 còn truy cập được. P24 hình thức chờ user review, không tự nâng thành baseline đã duyệt; nguồn/evidence: handoff/P24/DESIGN_TRACE.md, REPORT.md và REVIEW.html.

## Audit sau sáu cải tiến — 30/09/2026 r02

Theo yêu cầu rà kỹ UI/UX, giữ các cải tiến trước và sửa các ca tái hiện tại `handoff/ux-audit-2026-09-30-r02/REPORT.md`. Dialog dài giữ đầy đủ tiêu đề/nội dung bằng vùng cuộn có thể focus; ngữ cảnh picker dài không tràn ngang. Dialog-route tiêu thụ Forward vào marker đã đóng bởi chính owner để không tạo trang trùng; không dùng marker lạ để đi Back. Vùng chạm cập nhật khi transform AppShell thay đổi. P06 reset IME khi thay DOM tìm kiếm, P07 chặn Back lặp và tách lỗi nguồn/cũ khỏi danh sách đã xác minh. Mắt mật khẩu P11 giữ focus/selection khi bấm và giữ Tab khi dùng bàn phím; không lưu mật khẩu. P05 metadata dài dùng reader chung. Đây là sửa trong prototype, hình thức chờ review; không suy backend/hardware đã đạt.

## P01 r08 Kiểm tiếp vòng đời theo yêu cầu user

Giữ khóa đối chiếu khi quyền/kho đổi trong lúc start đang chờ, trừ kết quả denied rõ ràng; không suy guard đổi là yêu cầu chưa ghi nhận. Hủy lazy load trước microtask không gọi import. Router Home sở hữu title module; time node cập nhật từ receipt shiftStartedAt hiện tại khi trở lại Home. Pointerdown nút form giữ focus input đến click để tránh keyboard/scale làm trượt đích; Tab/Enter giữ nguyên. Không đổi CSS/SVG/artwork/footerLOCK/API. Báo cáo `handoff/P01/REVISION_08_LIFECYCLE.md`;70test tập trung đạt, toàn repo còn lỗi kỳ vọng ID test P05 ngoài phạm vi. Không tự nâng thành nghiệm thu visual/production.

## P01 r07 — audit UI/UX theo yêu cầu user

Giữ r06; sửa IME hủy, Caps hint lifecycle, Back recovery tiêu thụ đúng entry caller, UNKNOWN mở lại thông tin đối chiếu (không start/API mới), đồng bộ metadata/badge nguồn tại chỗ, reader tên kho dài, focus heading khi mount Home, neo dialog P01 về vùng thấy được khi outer preview đã cuộn. Không sửa shared modal/priority-touch/owner/footerLOCK. Hình thức nhánh mới chờ review; `handoff/P01/REVISION_07_AUDIT.md` và `REVIEW_07.html`. Không suy prototype tests thành nghiệm thu production hay toàn APP không lỗi.

## P23 r03 — audit UI/UX theo yêu cầu user

Giữ sáu nâng cấp r02; sửa13 lỗi tái hiện về query/picker, dấu lọc, focus khi tải lại/đóng reader/debounce, nút Back đúng caller, nội dung sự kiện dài, null event và nhãn kết quả chưa xác minh. Dock/toolbar/footer giữ DOM khi đọc; reload dùng aria-disabled và guard hành động để vừa giữ focus vừa chặn đọc trùng. Reader phục hồi theo event ID và label sau khi được tạo lại; không lấy focus mới ngoài module. Không khẳng định nhập đã gửi khi kết quả chưa xác minh; dòng từ chối/đọc trùng không mang nhãn số lượng đã xuất. Chỉ adapter/model/experience/CSS P23, không đổi shared primitives/owner/footerLOCK/backend policy. 149logic/67nhóm trình duyệt/50layout/4footer đạt prototype; hình thức chờ user review. Nguồn/evidence tại handoff/P23/REVISION_03.md và REVIEW_03.html. Không suy kiểm thử fixture thành nghiệm thu production.

## P01 r06 — sáu đề xuất UX được yêu cầu triển khai 30/09/2026

P01 dùng Next/Go và guard IME, hint Caps Lock theo sự kiện hỗ trợ, mắt giữ selection, giữ input trong vùng nhìn thấy khi viewport bàn phím thu hẹp. Notice xác nhận diễn giải đúng warehouse/permission/UNKNOWN; không bỏ guard hoặc giả API. Home tải sau xác nhận, retry chỉ tải UI, không startShift lại; callback cũ bị bỏ khi logout và không giành focus khỏi dialog đang mở. P14 Back giữ tên đăng nhập/cuộn form trong cùng credential epoch, xóa password và trả focus về Quên mật khẩu. Giữ artwork/palette/SVG/header/footerLOCK, chiều cao ô nhập56px ở khung494×950; vùng bấm tái sử dụng priority-touch đang có. Hình thức phần mới chờ review, không tự coi là baseline Designer. Evidence/phạm vi/giới hạn: `handoff/P01/REVISION_06_UX.md`, `REVIEW_06.html`.

## Sáu cải tiến thao tác — user 30/09/2026

User yêu cầu áp dụng sáu đề xuất trong `handoff/ux-upgrade-2026-09-30/DESIGN_TRACE.md`. Hình thức mới chờ review, không tự nâng thành baseline Designer.

- P01–P11: `shared/priority-touch.mjs/.css` mở rộng helper P10 cho Back, tìm kiếm/xóa/lọc, copy và action dialog được chỉ định. Vùng bấm đo theo scale tối thiểu 44px; control và parent dành chỗ thật, không phủ sang control bên cạnh. P10 giữ controller riêng; footerLOCK, lịch 7 cột và các board sau không tự bị mở rộng.
- P04/P05: nhập tay thu phần camera minh họa xuống 40px; input giữ DOM/focus khi cập nhật lượt, không submit IME. Nội dung dài vẫn cuộn nội bộ. P05 đổi phiếu xem đủ giá trị trước→sau trong một dialog; chỉ confirm còn đúng bản nhập mới đổi dữ liệu, Hủy không cấp ID.
- P06: Vừa xem tối đa 3 ID theo phiên/tài khoản/kho/danh mục, xóa khi logout; đọc lại nguồn trước mở/chọn, không nhớ snapshot tồn. Khoảng ngày nhanh dùng picker chung, Apply-only, mặc định Tất cả ngày.
- P07: Enter với query khác rỗng và một kết quả đầy đủ đã xác minh mở chi tiết; nhiều/partial đưa focus vào danh sách. IME/nguồn lỗi không mở; không tự đọc thẻ hoặc liên kết.
- Các đổi mới giữ 24 board / 91 panel, 494×950, nghiệp vụ và UNKNOWN. Không suy lưu nháp bền từ bộ nhớ phiên; API/thiết bị thật chưa được xác minh. Nguồn, actual trước–sau và kết quả theo `handoff/ux-upgrade-2026-09-30/REPORT.md`.

## P23 r02 — sáu nâng cấp theo yêu cầu user

User yêu cầu áp dụng sáu đề xuất UI/UX: controls gọn và xóa riêng query/bộ lọc; phân cấp card/Vừa xem theo ID; timeline metadata gọn và mốc mới nhất chỉ khi timestamp xác minh; tách trạng thái phiên/kết quả chứng từ; liên kết case/receipt bằng ID explicit có guard owner; tải lại tại dock/toolbar với footer chỉ Back. Giữ khung494×950, bốn panel và footer Home/P03. Không suy Post từ phiên hoàn tất, thiếu count không thành0. Tham chiếu receipt là adapter preview, chưa phải schema backend; không liên kết từ mã hiển thị hoặc giả nguồn production. 141 logic/49 nhóm trình duyệt/40 layout/4 viewport footer đạt prototype. Hình thức chờ user review; evidence tại handoff/P23/REVISION_02.md và REVIEW_02.html. P22 r03 vẫn tạm chốt, state đồng bộ bổ sung sau.

## P22 tạm chốt / P23 đang triển khai — user30/09/2026

User tạm chốt P22 r03 khi chuyển P23; state đồng bộ bổ sung sau, không phải nghiệm thu production. Xem `handoff/P22/TEMPORARY_ACCEPTANCE.md`. P23 giữ frame494×950, bốn panel B23, nguồn warranty cùng P09, phiên quét riêng mặc định unavailable, mẫu B23 chỉ opt-in ngoài app. Không dùng auth session hoặc gom lần quét để dựng phiên. B08 legacy PQ-0001 và B23 PQ-0001 thuộc hai nguồn mẫu khác nhau, không liên kết chỉ bằng mã hiển thị. Hình thức P23 cần user review.

## P22 r03 — rà soát UI/UX theo yêu cầu user

Giữ sáu nâng cấp r02; sửa12ca tái hiện trước–sau: Back fallback không caller giả, phân biệt đọc bị ngắt với lỗi nguồn và giữ cảnh báo cache ở chi tiết, UID/serial riêng dòng, actor dài gọn2dòng và reader chi tiết, reset IME theo DOM, hoãn debounce dưới picker, giữ focus tải lại không giành focus mới, nguồn chưa đủ không giả empty, field sai kiểu không tạo mã/copy giả, dấu lọc và focus khi thay DOM. Chỉ adapter P22, không đổi shared implementation/footerLOCK/owner hoặc API. 90logic/43nhóm trình duyệt/40layout/4footer đạt prototype; hình thức chờ user review, production/hardware chưa xác minh. Evidence tại `handoff/P22/REVISION_03.md` và `REVIEW_03.html`; không tự nâng bản sửa thành baseline Designer.

## P22 r02 — sáu nâng cấp user yêu cầu

User yêu cầu áp dụng sáu đề xuất UI/UX: dock gọn/ngày+count, xóa riêng filter/query, thẻ dễ đọc và marker vừa xem, UID trước→thay thế/reason/đối chiếu mở rộng, copy allowlist raw, reload giữ cache/cuộn/focus khi lỗi. Giữ owner event-only/default unavailable/khung494×950/footerLOCK/no shortcutP22. Search không thay DOM khi IME; cache chỉ cùng nguồn/scope, có nhãn lần đọc trước, không bịa updatedAt. Copy dùng dialog chung, guard async scope/route/payload, không mở rộng ngoại lệ inline-copyP07. Reader cục bộP22 target44px. Hình thức r02 chờ user review; `handoff/P22/REVISION_02.md` và `REVIEW_02.html`, không tự nâng thành baseline Designer.

## P21 tạm chốt / P22 r01 — user30/09/2026

User tạm chốt P21 r03 trong yêu cầu triển khai P22; state đồng bộ bổ sung sau, không phải nghiệm thu production. Xem handoff/P21/TEMPORARY_ACCEPTANCE.md. P22 giữ hub6entry hiện có, không khôi phục shortcut phiếu dở; Home Xem tất cả vẫn P12. NFC dùng owner đọc event riêng, không dựng audit từ P07 tag status/read/prepare. Default unavailable; mẫu B22 opt-in ngoài khung app. Bốn panel giữ ID, S01 MIGRATED theo các chốt trên. Khung494×950, icon/dialog/reader/picker chung; backend mapping chưa chốt. Hình thức P22 r01 chờ user review, không tự coi là baseline đã duyệt; handoff/P22/DESIGN_TRACE.md và REPORT.md.

## P21 r01 — tiếp tục phiếu linh kiện

User29/09/2026 tạm chốt P20 r03 trong yêu cầu triển khai P21; state đồng bộ bổ sung sau, production chưa xác minh. P21 giữ bốn panel B21, khung494×950, icon/dialog/readable contracts. Owner P19 giữ nguyên document/session/version/request; mở lại P21 chỉ đọc checkpoint mô phỏng rồi mới mở quét, không create lại. Dòng recorded khóa trong resume/review. UNKNOWN Post dùng check cùng yêu cầu kể cả hồ sơ đóng; mã/version không khớp chỉ đọc/đối chiếu, không retry Post. Nguồn đọc preview timeout15giây không áp vào Post. Dữ liệu vẫn trong bộ nhớ trang, reload/logout mất; P14 không được coi là lưu bền. P21 r01 là bản triển khai chờ review hình thức, không tự nâng thành baseline Designer. Nguồn/bằng chứng: handoff/P21/DESIGN_TRACE.md, REPORT.md và REVIEW.html.

## P20 r03 — audit UI/UX theo yêu cầu user

Giữ 6 cải tiến r02; kiểm thao tác kết hợp expand/load/collapse, Back fallback không caller giả, focus theo ID phiếu và không dời nút đang focus trong lúc đọc thêm. Read timeout15giây chỉ áp nguồn đọc preview, giữ cursor/list và bỏ callback muộn; không áp vào Post UNKNOWN. Case đóng vẫn đọc được đối chiếu UNKNOWN của yêu cầu cũ, không xuất mới. Không thay footerLOCK/ID panel/API backend. 14 ca lỗi có evidence trước–sau tại handoff/P20/REVISION_03.md; visual chờ user review, production/hardware chưa xác minh.

## P20 r02 — sáu cải tiến UX được user yêu cầu

User yêu cầu áp dụng cả6 đề xuất: link thông tin hồ sơ ngay dưới context; summary/collapse phiếu nhiều dòng; dialog mã gốc chỉ đọc; highlight receipt P19 đã xác minh qua P09; footer pending lấy ID/counts owner; marker tải thêm theo ID sau dedup. Giữ frame494×950, ID4panel, footerLOCK và dialog/readable contracts. Chỉ đổi presentation/navigation; không phát minh backend API/policy P21. Mở rộng nhớ theo case/document trong phiên, UNKNOWN vẫn đối chiếu trước retry. Marker mới xuất chỉ focus1lần khi caller chủ động, không từ URL tự khai; không auto-scroll khi append. Hình thức r02 chờ user review; evidence: handoff/P20/REVISION_02.md và REVIEW_02.html.

## P02 r16 — sửa lỗi tương tác, hình thức chờ review

Theo yêu cầu rà soát UI/UX29/09/2026, Home giữ focus hiện tại và đích Back theo ID khi cập nhật recent/phiếu dở; không lấy focus khỏi dialog/control khác. Badge kho phản ánh đúng active/stopped/unknown; KPI chưa xác minh không giả số0 hoặc mời mở danh sách bị disabled. Xem tất cả có vùng bấm44px trong frame, text/status đủ tương phản, mã dài wrap giữ dữ liệu. FooterLOCK/icon nghiệp vụ không đổi. Đây là ghi chú triển khai r16, không tự nâng thành mẫu Designer đã duyệt. Nguồn và evidence: `handoff/P02/REVISION_16_CONTEXT.md`, `REVISION_16_AUDIT.md`.

## P18 r02 — sáu nâng cấp UX theo yêu cầu user

User yêu cầu áp dụng cả6 đề xuất trong chat: form bàn giao lên trước và kỹ thuật/linh kiện mở rộng; hướng dẫn theo điều kiện; tóm tắt/action tệp; zoom/fit tài liệu; grid vị trí có chữ/dấu chọn; Back giữ context và cảnh báo trước mất bản nhập khi logout. Nguồn/evidence: `handoff/P18/REVISION_02.md`, `REVIEW_02.html`. Đây là cho phép triển khai; hình thức r02 chờ review.

- Giữ frame494×950 và footerLOCK. Zoom chỉ trong viewport tài liệu, nhớ page/mode/zoom/pan theo file+document+nguồn trong phiên; không scale lại AppShell.
- Nguồn tệp P12 giữ ID/URL, fixture B18 opt-in riêng. Event upload chỉ cập nhật hàng đúng task và summary, không reorder hoặc mở UNKNOWN retry.
- Form giữ200ký tự ghi chú; validation cập nhật field/caret không thay DOM form. Backend bàn giao chưa khả dụng thì disabled; case đang xử lý có CTA về đúng owner P09. Grid thiếu schema không hiển thị số giả; selection không ghi location/tồn.
- P10/P14 nhận optional `logoutWarning` để thêm thông tin bản bàn giao chưa gửi vào dialog xác nhận hiện có; mặc định không đổi nội dung. Không thêm overlay/confirmation thứ hai, không giữ phiên đã hết hiệu lực. Nháp P18 chỉ giữ trong instance phiên preview, không hứa lưu bền qua reload.

## P16 r02 — cải tiến dữ liệu được user yêu cầu triển khai

- User yêu cầu áp dụng sáu đề xuất P16: bỏ riêng điều kiện, CTA theo nguyên nhân, cache rõ nghĩa, tìm kiếm250ms/Enter/IME, trạng thái tìm bằng mã và tải lại giữ vị trí. Phạm vi P12 danh sách/P16; không đổi footerLOCK hoặc các owner nghiệp vụ.
- Bỏ một chip chỉ sửa điều kiện tương ứng; Xóa bộ lọc giữ reset toàn bộ. CTA có query là Sửa từ khóa, không query là Điều chỉnh bộ lọc dùng picker hiện hữu. Hủy không commit.
- Không coi dữ liệu cũ là kết quả truy vấn mới; cache chỉ cùng scope/query. Giờ cập nhật chỉ khi nguồn cung cấp; hiện nguồn fixture không có nên không hiển thị.
- Tìm kiếm gom250ms, Enter ngay; chờ composition hoàn tất, hủy request/timer khi query hoặc route đổi. Reload cùng context giữ dòng/offset/focus theo ID khi còn tồn tại, không tự mở chi tiết.
- Bản hình thức r02 cần review, không suy nghiệm thu từ test. Nguồn/evidence: `handoff/P16/REVISION_02.md` và `REVIEW_02.html`.

## P02 r15 — UX được user yêu cầu triển khai

User2026-09-29 yêu cầu áp dụng6 đề xuất: tiếp tục phiếu dở, phản hồi toàn thẻ, Back giữ ngữ cảnh, nhập mã liên tục, phục hồi lọc rỗng, ngày Hôm nay/Hôm qua. Đây là yêu cầu chức năng/UX, chưa phải nghiệm thu raster của nhánh mới; nguồn/evidence tại `handoff/P02/REVISION_15_UX.md`.

- Shortcut chỉ từ snapshot owner hiện tại qua pendingStockRun, đúng actor/kho/document/scanSession/version; UNKNOWN/busy không được tạo run khác hoặc retry tự động. Có nháp thì nội dung có thể cuộn, không bớt3recent hoặc sửa footerLOCK.
- Tile feedback tái sử dụng `shared/list-actions.css`, không gạch chân nhãn, không scale geometry hoặc tô lại severity/icon/nav. Text link khác không bị ép thành tile.
- Clear action của filtered-empty là thao tác đọc; chỉ khi nguồn đã xác minh. Dùng lại handler reset của owner, không reset dữ liệu nghiệp vụ hoặc giả nguồn rỗng khi lỗi/UNKNOWN. Shared button mới: `shared/list-actions.mjs`.
- Nhãn ngày gọn dùng `shared/recent-time.mjs` theo Asia/Ho_Chi_Minh, giữ datetime/title đầy đủ. Back lưu cả scroll của container trong app; không chỉ window.scrollY.

## P06 — nâng cấp thao tác tra cứu được phép triển khai (user2026-09-29)

- User duyệt đề xuất đưa Xem tồn/Lịch sử lên dưới hero, tối ưu tìm bằng Enter/count/chips, giữ vị trí dòng và mở ảnh lớn. Phạm viP06; không cho phép đổi footerLOCK hoặc cấu trúc24board/91panel.
- P06 tái dùng `history/history-picker.mjs` cho ngày và loại giao dịch; `allStatusLabel` optional chỉ đổi nhãn lựa chọnAll theo nghĩa nghiệp vụ, mặc địnhP08 không đổi. Không sao chép controller calendar.
- Kết quả tìm kiếm hiển thị số dòng đã tải, không dùng số đó giả làm tổng server. Enter chỉ tự mở khi query khác rỗng và đúng1 kết quả nguồn đọc thành công; không mở trongIME/nguồn lỗi. Back giữquery/category/scroll.
- Phân biệt empty với lỗi nguồn đọc: lỗi giữ cache đúngactor/kho/query/item/filter, cho retry đọc; không suyUNKNOWN thànhsuccess hoặc tự retry mutation. Load/error-state inline là trạng thái nguồn, thông báo kết quả thao tác vẫn dùng dialog theoHN-action-feedback-v1.
- Gallery dùng overlay trong app, Back/Esc/Đóng và focus phục hồi, backdrop không đóng. Bố cục thực thi còn chờ visualuser review; xem `handoff/P06/ux-upgrade-2026-09-29/DECISIONS.md` và`REPORT.md` cho nguồn/before–after, không tự xem số test là nghiệm thu.

## HN-footer-locked-v1 — footer Home/P03

User nhắc lại khóa footer ngày2026-09-28 sau khi thay đổi nền Home r06 làm sai mẫu. Nguồn đã chốt: `handoff/P03/REVISION_04.md`, footer dùng chung `.hn-nav` trong `home/style.css`.

- Nền `#fffffffa`, radius góc trên23px, shadow `0 -5px 18px #17486005`, min-height75px, padding8px;5 mục theo thứ tự Trang chủ/Chứng từ/Quét mã/Lịch sử/Cá nhân.
- Tab chọn: nền `#eef9fb`, chữ `#005577`; không đổi thành ô trắng trên nền xanh xám. Icon25px, chữ12px/17px.
- Scan-circle62px, icon31px, border trắng3px, màu `#007399`, margin-top -31px. Giữ vị trí nhô lên và căn nhãn.
- P03 chỉ đổi vị trí neo đáy, không tạo mẫu footer riêng. Chỉnh card/KPI/surface ở Home không được override footer hay thay palette menu. Không đổi baseline raster. Nếu user yêu cầu mẫu footer mới phải ghi rõ phạm vi mới trước khi áp dụng.

Kiểm hồi quy bằng computed styles của footer Home và P03, màu/kích thước theo nguồn trên; kiểm cả phần chân trang nhìn thấy khi nội dung cuộn. Footer đạt kiểm tra component không đồng nghĩa pixel-perfect cả board.

## HN-action-feedback-v1 — contract dialog đã khóa

Ngoại lệ cục bộ P07 (user29/09/2026 áp dụng đề xuất UX, r12): **sao chép UID thành công** đổi icon sang dấu tích và hiện nhãn ngắn ngay tại nút trong khoảng2.2 giây, không thêm dòng vào body hoặc mở dialog trùng. Lỗi sao chép vẫn dùng action dialog. Không tự mở rộng ngoại lệ này sang các thao tác ghi hoặc module khác.

User chốt ngày 2026-09-28 khi chỉnh P11 r03: bỏ thông báo kết quả chèn vào nội dung trang, dùng dialog confirm nổi trên màn hình; **các màn triển khai sau bắt buộc áp dụng**. Đây là bổ sung được duyệt cho Contract v2.0, không phải đề xuất chờ duyệt.

User sau đó yêu cầu áp dụng ngược về **P01–P10**. Đã đồng bộ theo [báo cáo và mapping](../../../handoff/dialog-sync-2026-09-28/REPORT.md). Bản nền tạm chốt vẫn được lưu; thay đổi dialog/bố cục mới cần review hình thức. `createActionFeedback` trong `shared/action-feedback.mjs` bổ sung quản lý Back, queue không chồng overlay và hủy callback muộn; controller phải clear khi rời màn và dispose khi kết thúc phiên. Các form/picker dùng lựa chọn tạm không tự commit khi đóng, backdrop mặc định không dismiss.

- **Trước hành động cần xác nhận:** dialog nêu rõ đối tượng/hệ quả; nút **Hủy** và **tên hành động** (ví dụ Đăng xuất). Chỉ gọi mutation sau khi người dùng chọn hành động. Hủy, Escape, Back không gửi request.
- **Sau thành công đã xác minh:** dialog kết quả với **Đã hiểu** hoặc **Đóng**. Không dùng Hủy/Không cho thao tác đã hoàn tất, không giả hoàn tác. Trường hợp P11: xác nhận trước revoke → đối chiếu → dialog Đã đăng xuất thiết bị.
- **Thất bại/lỗi thao tác tổng quát:** dialog báo rõ kết quả; giữ dữ liệu và đối tượng. **UNKNOWN:** không báo thành công, dialog Để sau/Đối chiếu; giữ request và chặn retry trước đối chiếu.
- Không chèn toast, snackbar hoặc dòng thông báo kết quả vào body làm xê dịch bố cục. Validation cụ thể vẫn ngay field với focus/aria-invalid; hint tĩnh, trạng thái loading/empty, nút Đối chiếu pending là nội dung trạng thái, không phải thông báo kết quả tạm thời.
- Panel kết quả đã có ID/baseline (như P11.S03) vẫn được giữ, không thay bằng dialog rồi bỏ panel. Hành động đã đi đến panel kết quả đầy đủ không cần mở thêm dialog trùng lặp.
- Dùng `shared/action-dialog.mjs` + `shared/action-dialog.css`; caller nối `createDialogRoute` để Back đóng dialog trước. Helper tái sử dụng `openAppModal`, overlay trong AppShell, nền inert, focus trap; không dùng alert/confirm của browser, không chồng nhiều overlay.
- Bấm nền không tự đóng dialog; phải chọn nút, Escape hoặc Back. Hành động nguy hiểm dùng nút đỏ trầm; trạng thái success/error có màu riêng, không dùng màu nghiệp vụ thay thế. Focus ban đầu vào Hủy nếu có, nếu chỉ thông báo thì vào Đã hiểu; đóng trả focus về trigger còn tồn tại hoặc heading màn hiện tại.
- Header/footer/nav ổn định; các màn kết quả ngắn phải cân spacing để vừa khung 494×950, không tạo cuộn dư. Nội dung dài thực sự vẫn đọc được qua cuộn trong app; không cắt/ẩn dữ liệu chỉ để đạt “không scroll”.
- Áp dụng ngay trong P11 và cho phần mới/chỉnh sửa về sau. Không tự đổi hàng loạt các màn đã tạm chốt ngoài yêu cầu của user.

Kiểm bắt buộc: Hủy/confirm, chống submit trùng, backdrop, Escape/Back/Tab/Enter, focus phục hồi, dialog nằm trong app ở các viewport, nền không cuộn và không có thông báo inline thừa; success chỉ xuất hiện sau bằng chứng xác minh.

## Quyết định

User yêu cầu áp dụng ô icon được khoanh trong ảnh Lịch sử cho toàn APP và ghi nhớ cho các màn sau. Mẫu: icon dạng nét, màu đậm vừa đủ, trên nền pastel cùng tông, bo góc, không bóng đổ. Tham chiếu đã duyệt: `handoff/P08/evidence/revision-17/history-general.png`.

Đây là chuẩn về icon nhận diện nghiệp vụ, không phải yêu cầu thiết kế lại toàn màn, đổi nghiệp vụ hoặc biến màu nhận diện thành trạng thái.

## Palette duy nhất

Nguồn thực thi: `operation-icons.css`. Màn khác phải dùng tokens/component này, không chép mã màu trực tiếp sang CSS riêng.

| data-hn-operation | Nghiệp vụ | Nét/chữ | Nền | Viền nhẹ |
|---|---|---|---|---|
| inbound | Nhập kho | #0d6b60 | #eaf7f2 | #c7e8df |
| outbound | Xuất kho | #225fa2 | #edf4ff | #ccdef7 |
| warranty | Bảo hành | #95601a | #fff5e6 | #eedbbb |
| nfc | NFC | #7550a2 | #f3effb | #dfd2f0 |
| documents | Chứng từ/metadata trung tính | #466279 | #eef3f7 | #d2dfe8 |
| sessions | Phiên quét | #4e5da8 | #eff1fd | #d4daf7 |
| lookup | Tra cứu trung tính | dùng documents | dùng documents | dùng documents |

`data-history-tone` là alias tương thích cho component P08 hiện có. Palette của history lấy cùng tokens, không giữ một bản màu thứ hai.

## Màn mới

Tái sử dụng hình SVG có sẵn theo đúng nghĩa; stroke 1.8, fill none, currentColor. Icon là phụ trợ; luôn có nhãn văn bản tương ứng.

```html
<span class="hn-operation-icon" data-hn-operation="inbound" data-size="lg" aria-hidden="true">
  <!-- SVG icon có sẵn, viewBox 0 0 24 24 -->
</span>
```

| Biến thể | Ô | Icon | Radius |
|---|---|---|---|
| sm |32×32|20×20|8px|
| md |44×44|26×26|10px|
| lg (mẫu Lịch sử)|56×56|30×30|12px|

Giữ gap 12–16 px giữa ô icon và nội dung; căn giữa icon, không nhét chữ vào ô icon. Nền màn liền mạch; card trắng; không dùng gradient/bóng đậm cho ô icon. Mục đích là đọc nhanh nghiệp vụ, không trang trí mọi vùng.

## Màn hiện có

- Đồng bộ màu/nét, giữ kích thước ô và cấu trúc layout đã chốt. Không ép toàn bộ icon về 56 px.
- Home tác vụ/chứng từ gần đây, P03 chọn nghiệp vụ, P04/P05 summary, P06 lịch sử giao dịch, P07 NFC tiles, hub Lịch sử nhúng và P08 đã được nối vào bảng màu chung ở r20.
- Metadata (người/kho/ngày/điện thoại) dùng nhóm trung tính documents; mã phiếu/loại Nhập dùng inbound, mã phiếu/loại Xuất dùng outbound.
- P07 dùng adapter CSS cho class p07-nfc-tile để giữ nguyên source/artwork/motion r10.
- Không tô lại severity icons (cảnh báo/xóa/lỗi/thành công), badge trạng thái, inventory âm/dương, logo/artwork/ảnh hoặc nút nav.
- Standalone board preview không bị lớp màu chung tác động khi không nằm trong app hoặc history nhúng, baseline không sửa.

## Kiểm tra mỗi lần áp dụng

1. Nhóm cùng nghĩa dùng cùng nét/nền trên các màn.
2. Không overflow/đổi vị trí header-nav-control; kích thước hộp cũ không bị thay.
3. SVG còn nét mảnh, không fill solid hoặc nhuộm màu ảnh.
4. Icon có tương phản ít nhất 3:1 trên nền; text dùng cùng màu đạt 4.5:1.
5. Màu trạng thái và luồng thao tác không đổi; chạy regression liên quan và lưu evidence theo revision.
6. Quyết định user mới hơn chỉ thay đổi phạm vi họ yêu cầu; cập nhật tài liệu này khi user duyệt thay chuẩn.

## Tab chi tiết dùng chung

- Nguồn hình thức: tab của Chi tiết Lịch sử P08.S02 đã có; user yêu cầu dùng cùng mẫu cho Hồ sơ bảo hành P09.S03 ở r06.
- `shared/detail-tabs.css` là nguồn CSS chung cho P08/P09/P12: tab cao tối thiểu48px, font17px, tab được chọn có nền nhẹ và gạch chân teal. Không áp quy tắc này lên tab lọc loại nghiệp vụ của danh sách.
- P09 dùng badge số lượng riêng; count linh kiện là tổng quantity của phiếu POSTED đã tải, không phải số phiếu hoặc số mã. Thiếu dữ liệu hiển thị dấu gạch, không suy thành0.
- Dùng `countBadge` từ history-controls cho badge tóm tắt; icon nghiệp vụ vẫn theo operation-icons.css. Bố cục P09 r06 còn chờ user review, không suy ra nghiệm thu toàn board.


## HN-readable-content-v1 — contract nội dung dài đã khóa

User chốt ngày2026-09-28: áp dụng nâng cấp P12 r05 cho toàn bộ P01–P11 hiện có, bắt buộc cho P12 và các màn sau. Đây là yêu cầu hiện hành, không phải proposal cần hỏi lại.

1. **Tách input policy khỏi layout.** Giới hạn nhập theo owner/contract nghiệp vụ (hiện ghi chú P04/P05/P09/P12 là200), không tự đổi thành250 hoặc cắt dữ liệu nguồn để vừa màn. Trường mật khẩu không trim/normalize/đọc/log/persist bởi component nội dung dài.
2. **Đo theo dòng hiển thị.** Ghi chú xem trước tối đa2 dòng; mô tả/narrative lịch sử tối đa3. Chỉ hiện Xem đầy đủ khi thực sự bị rút gọn. Không dùng mỗi ngưỡng ký tự để đoán overflow. Component giữ nguyên string nguồn, newline và Unicode; đoạn đầy đủ không bị ellipsis.
3. **Đường đọc đầy đủ bắt buộc.** Nút mở dialog trong AppShell, nội dung cuộn và nút Đóng còn truy cập được. Không chồng overlay; nền inert, focus trap/return, Escape/Back đóng dialog trước route; bấm nền không đóng. Tên bị ellipsis trong card phải mở được full detail hoặc reader. Không nhét button bên trong button/link.
4. **Nội dung cần quyết định phải đọc đủ.** Không rút gọn hậu quả xác nhận, trạng thái UNKNOWN, validation hay thông tin lỗi cần xử lý trong dialog. Cho chúng cuộn ở dialog hiện có, không mở reader thứ hai. UID/serial/request/version phải có đường xem/copy nguyên vẹn.
5. **Nhịp đọc:** nội dung body line-height khoảng1.5; đoạn dài trong reader1.6. Ghi chú là khối riêng hoặc có nhãn rõ, cách nhóm kế tiếp16–24px. Không nén dòng chỉ để ép nhiều thông tin vào khung. Nội dung ngắn vừa khung; dữ liệu dài cuộn nội bộ, header/tab/footer giữ ổn định. Footer HN-footer-locked-v1 không bị đổi.
6. **Ô nhập:** chiều cao giới hạn theo mẫu màn, cuộn bên trong, không kéo giãn vô hạn. Giữ counter/aria/error và dữ liệu đang nhập. Không thêm trường giả vào màn không có ghi chú.
7. **Nguồn component:** `shared/readable-text.mjs` + `.css`. Mặc định gắn `data-hn-readable="Tên nội dung"` và `data-hn-lines="2|3"` trên node text thuần; mount controller tại root. `data-hn-readable-kind="value"` giữ leading của thông tin định danh. Nội dung trong card có action cần wrapper `data-hn-readable-group` và opt-in `data-hn-read-outside="true"` để đặt trigger ngoài nút. Không gắn lên input/password/textarea, HTML có controls, hoặc message xác nhận.
8. **Adapter đã có:** P02 giữ nút xem tên đầy đủ; P07 detail đọc trong dialog nguồn. P12 r05 giữ card/dialog đã kiểm và dùng `isTextTruncated` từ module chung. Không sao chép thêm controller riêng ở P13–P24; dùng marker/controller chung hoặc nối adapter vào primitive chung khi bảo toàn mẫu đã duyệt.
9. **Lifecycle:** sau render/query/route/resize phải đo lại overflow; gỡ observer/dialog khi node hoặc phiên bị thay. Không giữ reader cũ qua logout, không thay request/phiếu/session. Component presentation không có API ghi hoặc storage.
10. **Nghiệm thu:** rỗng, ngắn,250,2000+, từ liền, newline/Unicode/HTML; full string đúng nguyên văn; không tràn ngang; CTA/header/footer không bị che; close/Back/Escape/focus; input limit giữ nguyên; không làm lộ password. Tách visual/behavior/integration và lưu evidence theo revision.


## HN-visual-evidence-v1 — kiểm chứng nguồn thiết kế, không tự nghiệm thu

Bổ sung quy trình khắc phục sau phản hồi P12 của user2026-09-28, thực thi nguyên tắc visual/behavior/integration đã có trong Contract2.0:

- Phải chỉ ra nguồn cho phần thay đổi: baseline đúng panel, CSS/component đã có, chỉ thị user hoặc lựa chọn triển khai cần review. Số đo từ ảnh là estimated; số đo runtime không tự trở thành số đo Designer.
- Giữ tách biệt **assertion bố cục đạt**, **hành vi đạt**, **giao diện được user nghiệm thu** và **backend đã tích hợp**. Không lấy số test hoặc ảnh do app tự render để chứng minh nó khớp thiết kế.
- Mỗi revision sửa hình thức có before/after tại cùng CSS viewport/DPR/fixture và bảng khác biệt còn lại. Không kéo méo baseline, đổi ảnh baseline, che nội dung hoặc tự đặt ngưỡng pixel-diff để tự PASS.
- Phải chụp nhánh và trạng thái bị ảnh hưởng, gồm các lựa chọn trong form; không chỉ chụp default/happy path. Nếu thiếu baseline của nhánh, ghi rõ, ưu tiên reuse luồng có nguồn trong phạm vi được yêu cầu; không dựng form giả rồi gọi là đã chốt.
- Không dùng lời đề xuất/báo cáo/revision của agent làm bằng chứng user đã duyệt. Các pattern đã khóa (footer/icon/dialog/readable content) vẫn giữ; sửa phần đã có nguồn không cần hỏi lại. Lựa chọn mới còn thiếu căn cứ phải được trình bày riêng để user quyết định.
- Trạng thái P12-r06 hiện là **AWAITING_USER_REVIEW**, không phải visual PASS. Nguồn đối chiếu: handoff/P12/evidence/revision-06/design-trace.json và REVIEW.md.

## P12 r07 — dùng chung controls và điều hướng theo trang

Theo feedback user2026-09-29, Chứng từ dùng trực tiếp `history/history-controls.mjs` và CSS của History: tìm kiếm50px, tabs loại44px, ngày44px, bộ lọc ngày/trạng thái chung có Đặt lại–Hủy–Áp dụng, số kết quả và sort có nhãn. Module hỗ trợ namespace/input ID và shortcut scan; không nhân bản markup/palette cho P12. Sản phẩm dùng cùng search component. Việc chuyển shortcut scan xuống toolbar danh sách là adaptation trong phạm vi đồng bộ, ảnh r07 chờ review.

- Bốn tab chi tiết giữ nguyên P12.S02/S03, dùng dock cố định. Biến thể `.hn-counted-tabs` chia cột cố định theo label/count để chọn tab không đẩy ngang các tab còn lại; màu, font, cao48px vẫn từ CSS chung. Tỷ lệ cột là quyết định triển khai, không phải số đo Designer đã xác minh.
- Tab cùng chứng từ dùng replaceState, không tạo trang lịch sử riêng. Back một lần về caller đã xác minh hoặc danh sách nếu deep link cũ; giữ query/filter/scroll và focus. Back của dialog đóng dialog trước. `popstate`/`hashchange` của cùng entry không render hai lần. Không sửa caller/session/request của owner.
- Timeline dùng màu kèm chữ: warning + Bước hiện tại, success + Hoàn tất. Chỉ xác nhận hoàn tất khi trạng thái nguồn và sự kiện kết thúc cùng khớp. Nhập/xuất chờ Web chưa đổi tồn; Bảo hành Chờ bàn giao chưa hoàn tất; xuất linh kiện không đóng hồ sơ. Không tự dựng các mốc chưa xảy ra. Thiếu/mâu thuẫn dữ liệu hiển thị chưa xác minh/cần đối chiếu.
- Các adapter tiến trình là presentation cho nguồn preview hiện hữu, không bổ sung enum/API backend. Không suy diễn r07 đã được user nghiệm thu từ kết quả kiểm tra hành vi.

## P08 r22 — UX sáu trang Lịch sử (user duyệt triển khai29/09/2026)

- Nhớ query/ngày/trạng thái/sort/scroll riêng cho sáu trang trong phiên. Back giữ caller; drilldown Tổng quan không ghi đè trang Lịch sử chung. Không lưu vĩnh viễn, không mang cache sang phiên đăng nhập mới.
- Khoảng nhanh Hôm nay/7/30/90ngày: N ngày tính cả hôm nay, ngày VN lúc bấm; chỉ thay bản nháp, Apply mới commit. Today trong lịch con chỉ điều hướng tháng. Reset vẫn về hôm nay/statusAll; giới hạn ngày chung không đổi.
- Dấu lọc có aria-label; empty/no-match/error phân biệt, hành động bỏ điều kiện vẫn giữ nghiệp vụ. Kết quả thao tác tiếp tục dùng action dialog chung, không toast/banner làm đổi bố cục.
- `openHistoryPicker` hỗ trợ `quickRanges` opt-in; không đổi caller P12/P13 ngoài phạm vi. Hình thức mới r22 là adaptation chờ user review, không tự coi là mẫu đã nghiệm thu. Evidence/before-after: handoff/P08/REVISION_22.md và REVIEW_22.html.

## P12 r08 — form tạo và giới hạn chiều cao picker

User yêu cầu nâng cấp form tạo và sửa nút Hủy/Áp dụng bị cắt ngày2026-09-29. S04 r08 là bản thiết kế nâng cấp cần review: tile nghiệp vụ104px dùng icon md, selected nền nhẹ/viền/dấu chọn; kho và ngày thành metadata chỉ đọc; nhà cung cấp và ghi chú là vùng nhập chính, giữ200ký tự và owner flows hiện hữu. Không tự coi adaptation này là baseline đã được Designer duyệt.

- Dialog và form phải dùng cùng ràng buộc chiều cao trong AppShell. Không đặt form một `max-height` độc lập lớn hơn dialog rồi dùng `overflow:hidden` để che phần dư. Picker dùng flex với form `min-height:0`; header/footer `flex-shrink:0`, phần body là vùng cuộn.
- Supplier picker P12 dùng tùy chọn `fixedSearch`/`selectionSummary` của `openChoiceDialog`. Search và nhãn đang chọn luôn thấy; chỉ Apply commit, Cancel/Escape/Back giữ giá trị cũ. Không đổi mặc định commitOnChange của các caller khác.
- Kiểm geometry ở đầu/cuối danh sách, tên dài, tìm kiếm rỗng/không khớp, keyboard/focus,6viewport: toàn bộ footer/nút nằm trong dialog, row cuối đọc được, không overflow ngang hoặc cuộn nền. Không dùng số test làm bằng chứng user duyệt hình thức.

## P12 r09 — hướng dẫn và tiếp tục phiếu

User yêu cầu áp dụng5 đề xuất ngày2026-09-29. `shared/flow-guidance.mjs/.css` cung cấp progress3 bước và review quantity/SKU cho P12/P04/P05; giữ ID panel, không biến progress thành nút vượt validation. Kết quả nhập/xuất vẫn Chờ xử lý trên Web.

- Lịch sử NCC thuộc phiên Home, chỉ nhớ lựa chọn đã Apply/được sử dụng. Không storage hoặc singleton xuyên người dùng. `openChoiceDialog` có option priority/count; mặc định caller cũ giữ hành vi. Không reorder giữa lúc chọn và không tìm kiếm trên chữ badge.
- Thẻ phiếu dở lấy từ owner, cùng actor/kho. Resume truyền ID đã kiểm chứng và giữ marker qua Back/Forward. Không cấp draft mới cho UNKNOWN/not-recorded khi người dùng chọn tiếp tục; không suy ra gửi thành công chỉ vì navigation thành công.
- Trước gửi hiển thị quantity/SKU/loại và metadata đối tác; giữ CTA cụ thể và chống submit trùng. Validation ở field, focus lỗi đầu, giữ bản nhập. Không thêm xác nhận lặp khi panel Kiểm tra đã làm nhiệm vụ này.
- Các hình r09 cần user review; không coi việc chấp thuận triển khai proposal là nghiệm thu visual.

## P12 r10 — các guard chống lỗi lặt vặt tái diễn

- Picker có bước Apply: Enter ở ô tìm kiếm không được submit draft đang bị ẩn; Enter trên lựa chọn chỉ chọn draft. IME không bị chặn. Caller cố ý commitOnChange giữ nghiệp vụ của owner.
- Kiểm mã/tên dài không có khoảng trắng bằng bounding rect của card so với viewport/scroller; scrollWidth của inline node có thể bằng0 dù nội dung đã tràn. Grid chứa card cần track/min-width phù hợp; phần rút gọn phải có đường đọc đủ.
- Counter kết quả đọc tập đã lọc; quantity/SKU toàn chứng từ không tự đổi theo query. Giữ hai ý nghĩa rõ ràng.
- Truyền plain text vào dialog rồi escape ở renderer; không escape hai lần. Không biến mã `<`, `&` thành text entity hiển thị.
- Fetch tài liệu chỉ đọc phải có loading không đổi kích thước, timeout, hủy khi Back/đổi context và guard callback muộn. Giữ focus sau tải mà không giành focus của thao tác mới. Các guard này không tự áp quy tắc cancel vào request ghi UNKNOWN của owner.


## P17 r02 / P16 — sáu nâng cấp theo yêu cầu user

User đã yêu cầu áp dụng sáu đề xuất UX trong chat. P17 có context phiếu, CTA manual khi camera chưa khả dụng, phục hồi scroll/focus/selection theo owner, ba nhãn đối chiếu và copy định danh có guard. P16/P17 dùng live region bền và giữ vị trí focus khi tải/reconcile; không phát kết quả request cũ cho phiếu mới. Copy kết quả vẫn dùng action dialog; ngoại lệ inline-copy P07 không mở rộng. Xem handoff/P17/REVISION_02.md. Đây là feature được cho phép triển khai; hình thức r02 chưa user nghiệm thu, backend/hardware không tự thành PASS.


## P19 r02 — sáu cải tiến UX được user yêu cầu

User yêu cầu áp dụng đề xuất: nhập liên tục giữ DOM/focus, sửa BOX chưa ghi nhận bằng sheet hiện hữu, chọn toàn bộ và khóa stepper theo tồn đã biết, P09 tiếp tục đúng phiếu/phiên với tổng số mã và linh kiện, UNKNOWN hướng dẫn trước và chi tiết định danh mở rộng, quay về focus phiếu POSTED đã xác minh. Chỉ presentation/reuse owner, không thêm policy backend. Header Back sau thành công dùng cùng receipt ID như CTA. Nền tab P09 đặc khi cuộn; footer Home/P03 không thay đổi. Hình thức r02 chờ user review; xem handoff/P19/REVISION_02.md.


## P19 r03 — rà soát UI/UX theo yêu cầu user

Giữ focus/selection theo phiếu và reset IME theo DOM/route; Enter khi composition chưa xong không xác nhận số lượng. SKU dài dùng reader chung, sheet đọc đầy đủ trong vùng cuộn và đưa ô số lượng đang focus vào vùng nhìn thấy. Vùng bấm cục bộ44px. Mã rỗng validation tại field, kết quả vẫn dialog. BOX mới không mặc định vượt tồn đã biết; hết tồn không mở sheet; xác nhận số lượng không đổi giữ version/request sau kiểm tồn. Header P09 sau về từ P19 không dùng caller giả gây vòng lặp; native browser history vẫn xem lại được. Không thay footerLOCK, ID panel, production policy. Evidence và16 ca tái hiện: handoff/P19/REVISION_03.md; hình thức chờ review.

## P21 r02 — sáu cải tiến được user yêu cầu

User yêu cầu áp dụng cả6đề xuất: thẻ mở toàn vùng nhưng reader tách ngoài action; context gọn/ngày Việt Nam; readiness/counts gần CTA; phân biệt lỗi nguồn đọc với mã/version lệch và PostUNKNOWN; copy allowlist định danh; marker/focus đúng phiếu và receiptP20 sau đối chiếu. Không thay guard/backend policy/footerLOCK. Dialog copy dùng feedback chung; cancel/stale callback không báo thành công. Giữ dữ liệu trong phiên, không hứa lưu bền. Hình thức r02 chờ review: handoff/P21/REVISION_02.md, REVIEW_02.html.

## P21 r03 — rà soát UI/UX theo yêu cầu user

Giữ focus/cuộn người dùng đang thao tác khi dữ liệu trả về; không giành focus ngoài module. Hoãn repaint trong lúc reader/dialog mở, phục hồi reader sau khi shared component tạo trigger. Đóng thông báo đã đối chiếu chưa xuất bằng Đóng/Escape/Back có cùng hậu điều kiện đọc lại checkpoint, không tự Post. Header Back tiêu thụ đúng entry danh sách cùng scope khi có; chặn nhấn trùng. Copy kiểm lại payload sau Promise, không phát phản hồi cũ nếu owner đã thay đổi. Ngày sai/count thiếu hiển thị Chưa xác minh, không suy thành 0; số dài không tràn footer; clock chưa xuất giữ màu trung tính. Dialog đối chiếu/copy lỗi giữ nguyên xuống dòng và khoảng trắng, nội dung dài cuộn trong body. Giữ owner, request/version/phiếu, footerLOCK và 4 panel. 14 ca tái hiện trước–sau: handoff/P21/REVISION_03.md, REVIEW_03.html. Hình thức chờ user review; backend/thiết bị thật và lưu bền chưa xác minh.
