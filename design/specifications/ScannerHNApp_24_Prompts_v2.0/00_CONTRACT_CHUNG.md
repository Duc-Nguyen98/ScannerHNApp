# ScannerHNApp — Contract chung cho 24 prompt triển khai

Phiên bản 2.0 · 24/09/2026 · Phạm vi tổ chức đã được Đức chốt: **01 contract chung + đúng 24 prompt, tương ứng 24 board của tab Tất cả**.

## 1. Cách dùng và ý nghĩa của bộ bàn giao

Đính kèm file này một lần ở đầu cuộc trò chuyện thực thi, rồi gửi từng file P01 → P24. Mỗi P là một yêu cầu triển khai trọn board: đọc nguồn → dựng UI → nối state/hành vi → kiểm tra → bàn giao. Không yêu cầu người dùng tự viết prompt con, không thay thế 24 prompt bằng 5 prompt quy trình. Có thể chạy P đã chỉ định riêng nếu dependency đã sẵn sàng; giữ nguyên ID và phạm vi. Các thao tác nền tảng dùng chung thực hiện ngay trong P đầu tiên cần chúng, không tạo P00/P25 như prompt triển khai mới.

Nếu chuỗi 5 prompt cũ đã được chạy, đọc lại báo cáo/source/checkpoint đã có và giữ phần còn đúng. Không buộc dựng lại hay duyệt lại thiết kế. Bản này thay cách tổ chức công việc, không xóa thành quả trước.

Checkpoint chỉ là dữ liệu tiến độ do agent tự ghi. Nếu phiên bị ngắt, tiếp tục đúng P đang mở bằng kết quả chưa xong; không rút gọn nội dung chi tiết của P, không tự tạo prompt khác để thay nó. Không tự dừng một P sau một màn nếu vẫn còn khả năng làm các màn còn lại an toàn trong phiên. Hoàn thành toàn bộ phần không bị chặn trong P rồi mới báo cáo.

## 2. Danh mục bất biến và nguồn

- Repo: https://github.com/Duc-Nguyen98/ScannerHNApp
- Preview chính đã quan sát tab Tất cả: https://duc-nguyen98.github.io/ScannerHNApp/
- Snapshot đã đối chiếu: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`.
- Danh mục gốc: https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/index.html
- README: https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/README.md
- HANDOFF hiện hành cho board 17–22: https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/HANDOFF.md
- DEV_PROPOSAL, còn là đề xuất: https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/DEV_PROPOSAL.md
- Source prototype mới: https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/flow.js
- CSS prototype mới: https://github.com/Duc-Nguyen98/ScannerHNApp/blob/da9f623a19d0359c3e80c14f8cc612636ec6ab78/docs/flows/warranty-components/style.css

Phân nhóm chính xác: 2 original + 10 updated + 6 new + 6 current = 24 board. P01–P24 là số thứ tự trong **tab Tất cả**, không phải số đầu file ảnh. Do hai ảnh original đứng trước board đánh số 01–22, P19 tương ứng board gốc17, P20→18, P21→19, P22→20, P23→21, P24→22. Xem `BOARD_INDEX.csv`; không tự suy mapping từ số file.

Đã xem trực quan cả 24 ảnh. Có **91 vị trí màn/panel tham chiếu**: P01 có2, P02 có1, P03–P24 mỗi bộ4. Đây không phải 91 route độc lập, không phải tổng state runtime, và không phải xác nhận 91 màn đều còn nguyên nghiệp vụ. Panel cũ được chuyển đổi vẫn giữ ID và lý do trong coverage.

Trang phụ `docs/flows/scanner-screens/app.js` có danh sách22 mục, thiếu Ngoại lệ quét và Đính kèm bàn giao. Không dùng nó để giảm phạm vi24 đã chốt. Asset pack nền riêng không phải board thứ25 trở đi.

## 3. Nguồn quyết định theo từng loại yêu cầu

1. Chỉ thị rõ và mới nhất của người dùng áp dụng đúng phạm vi được nêu. Cấu trúc24 prompt đã khóa; không tự gộp/tách/bỏ prompt.
2. Hình thức: ảnh baseline được duyệt đúng màn/state + nguồn component/style tương ứng. Hai original Login/Xác nhận phiên và Home phải giữ nguyên; không sửa file ảnh gốc, không tự redesign.
3. Nghiệp vụ: HANDOFF chốt mới được ưu tiên hơn board cũ ở chỗ tài liệu chỉ rõ thay đổi. Giữ phần giao diện không bị ảnh hưởng; không xem các nhãn cũ là quyền tạo lại action đã bỏ.
4. `DEV_PROPOSAL.md` mô tả phương án chờ DEV/BA chốt, không tự trở thành API hoặc quy tắc đã được phê duyệt. Prototype source chứng minh UI/fixture, không chứng minh backend thật.
5. Khi nguồn mâu thuẫn nhưng chưa có quyết định ưu tiên: ghi câu hỏi cụ thể, phần bị chặn và tiếp tục phần độc lập. Không bịa câu trả lời, không hỏi lại điều đã chốt. Gom tối đa ba nhóm câu hỏi quan trọng trong báo cáo.

Gắn nguồn cho quyết định: OBSERVED_IMAGE / VERIFIED_SOURCE / CONFIRMED_HANDOFF / PROPOSED / UNKNOWN / CONFLICT. Source đọc được không tự đồng nghĩa business-approved. Giá trị đo từ ảnh phải ghi estimated; không khẳng định là CSS gốc.

Các thay đổi bắt buộc có trace: nhập/xuất cũ Gửi duyệt → Gửi phiếu lên Web và Chờ xử lý trên Web; P13 phần approval → theo dõi/đối chiếu Web; Home Xem tất cả → Lịch sử. Copy Home đã khóa có chỗ chưa rõ thì báo riêng, không đổi toàn bộ Home.

## 4. Target triển khai và ranh giới thật/preview

Lần đầu cần sửa code, đọc AGENTS/hướng dẫn áp dụng, trạng thái git và source entrypoint. Ghi `source_commit`, thư mục làm việc, target_kind, cách chạy/build. Các giá trị này phải là kết quả kiểm tra, không suy React/Vite chỉ từ bundle có React. Snapshot hiện có gallery HTML/CSS/JS, prototype editable, dist build và node_modules; lần kiểm tra trước chưa thấy src/package.json ở gốc. Điều đó không chứng minh source không tồn tại ở nơi khác.

Nếu người dùng cung cấp source app thật, sửa tại source đó theo cấu trúc sẵn có. Nếu chỉ có source prototype editable trong repo này và nhiệm vụ là dựng UI/UX, thực hiện bản UI tương tác trong khu vực prototype thích hợp, ghi rõ `target_kind=prototype`; không thay trang gallery chính thành app, không làm hỏng các link ảnh/bàn giao. Không reverse-engineer rồi chỉnh minified dist để giả vờ source đã được sửa. Nếu mục tiêu được chỉ định là production mà thiếu source, phần đó bị BLOCKED; không tự đổi sang dự án/app khác.

Prototype có thể dùng fixtures rõ ràng để dựng đủ state, tách namespace với dữ liệu thật. Production dùng contract/adapter thật. Đừng báo auth, camera/NFC, API ghi, upload, notifications hay backend PASS chỉ từ fixture. UI hoàn thành và tích hợp hoàn thành là hai trạng thái khác nhau.

Không push/merge/deploy hoặc gửi thông báo thật trong quá trình thực thi các P trừ khi người dùng yêu cầu rõ. Giữ nguyên thay đổi ngoài phạm vi trong working copy; không reset/clean để tiện triển khai.

## 5. Quy tắc nghiệp vụ dùng chung

- App nhập/xuất chính: quét/validate → kiểm tra → record/gửi Web → Chờ xử lý trên Web. Không có UI Duyệt/Post nhập/xuất chính. Gửi phiếu chưa ghi sổ, không tự thay đổi tồn.
- Ngoại lệ xuất linh kiện bảo hành: quét → kiểm tra → xác nhận Post trực tiếp → Đã xuất sau backend xác nhận. Không đổi luồng này thành gửi Web.
- Một kho Hoa Nam trong phạm vi; kho/quyền/actor từ phiên hợp lệ. Không thêm đa kho; khóa kho sau mã đầu. Không dùng role label thay permission guard.
- Tem linh kiện đơn quantity1; mã hộp nhận số nguyên dương theo tồn khả dụng và contract. Số lượt, số mã, số hộp, số SKU và tổng quantity phải tách biệt.
- Resume giữ đúng phiếu/version/mã; mã server đã ghi nhận không xóa tùy ý. UNKNOWN không được coi success, không tạo phiếu bù, không gửi lại mù. Kiểm tra trạng thái/đối chiếu theo contract trước retry có side effect.
- Lịch sử linh kiện chỉ POSTED của đúng case; DRAFT ở phần tiếp tục riêng. Tải thêm giữ dữ liệu/scroll, dedup bằng ID và giữ trang cũ khi lỗi.
- Lịch sử NFC dùng event nguồn thật; current tag status không đủ dựng lịch sử. Scan session khác auth session; không tự nhóm các lần quét theo thời gian để bịa phiên.
- Hồ sơ đã trả khách chỉ đọc, vẫn truy vết lịch sử theo quyền, không xuất thêm linh kiện bằng deep link/handler cũ.
- Khôi phục tài khoản, phiên đăng nhập, kết thúc ca, điều kiện đóng hồ sơ, capacity/vị trí và API event chưa chốt: dựng UI/fixture có nguồn, đánh dấu tích hợp chưa xác minh. Không tự thêm OTP/2FA, đổi quyền, tự chuyển tồn, auto-notify hoặc CRUD chỉ vì ứng dụng scanner khác thường có.

## 6. Visual contract và token

Không áp toàn cục #0066FF, max-width480px, spacing bội8, button8/card16 như prompt cũ. Chúng chưa phải baseline được xác minh. Lấy token/component đúng màn; không lấy style trang gallery hoặc review shell áp lên app.

Riêng prototype board gốc17–22 có bằng chứng trong style.css: Public Sans local; primary#0c6286, dark#0c5d7d, support#5e93a7, near#fafcfc, ink#12384e, muted#527186, line#dce9ef; header gradient110deg #073b52→#0c5d7d; phone reference390×844 CSS px; card radius12px/padding15px; body gap14px; icon21×21/stroke1.8. Giá trị này chỉ có hiệu lực cho nguồn prototype đó, phải kiểm override/media query/component trước khi tái sử dụng, không áp bừa lên hai original hoặc board cũ.

Mỗi P phải lập bảng số đo ngắn trước khi code: vùng nội dung màn, header/footer, container, padding/gap, control, font metrics, radius/border/shadow, icon/crop. Ghi file/class hoặc ảnh/crop và độ chắc chắn. Dùng token đang có nếu đã đáp ứng; không đo lại mọi màn đã hoàn thành. Đừng biến kích thước board ảnh thành viewport app.

Chỉ dùng font/icon/image đã có trong repo/component hệ thống đã được cho phép. Có thể tái sử dụng SVG inline trong source dù không nằm trong /assets. Thiếu icon/ảnh phải báo rõ; không sinh ảnh, không tải icon/font bên ngoài, không tracing screenshot thành asset mới mà tự coi là chuẩn.

Background pack: `assets/scanner-approved/`; board ảnh dùng tham chiếu; UI thực phải là control/text có tương tác, không đặt cả ảnh board làm màn hình. Không render caption, khung máy, dynamic island/status bar giả vào sản phẩm nếu AppShell/platform không yêu cầu.

Responsive: mobile-first theo nền tảng hiện có; giữ preview căn giữa khi baseline/source quy định. Mốc390×844 chỉ là reference xác minh cho prototype mới. Các mốc360×800,430×932 và desktop1440×900 là ma trận kiểm tra đề xuất mặc định cho overflow/căn giữa, không phải thiết kế mới đã khóa và không bắt tạo tablet layout khác. Ghi CSS px, DPR, zoom, font và điều kiện capture. Dùng viewport khác nếu dự án đã có chuẩn được duyệt.

Nếu chữ trong ảnh tạo sinh bị sai/nhòe hoặc số liệu fixture không tự nhất quán, ưu tiên nội dung nghiệp vụ có nguồn; ghi correction map, không sao chép lỗi và không tự sửa số liệu sản phẩm thật để khớp ảnh. Không tự tuyên bố pixel-perfect khi chưa có baseline crop/viewport/ngưỡng nghiệm thu hợp lệ.

## 7. State, data và component ownership

Các bảng state trong P là danh sách tối thiểu từ board đã nhìn thấy, không cho phép bỏ bất kỳ panel nào. Những panel bị supersede giữ ID với disposition=MIGRATED và trace rõ. Extra runtime states cần cho action hiện có như submitting/focus/error phải map component có sẵn và requirement; không phát minh cả bộ P00–P20 cho mọi màn.

Hover khi có pointer hỗ trợ; pressed khác selected; focus-visible/keyboard/semantics đúng loại control. Modal/sheet quản lý focus, backdrop/escape theo policy, safe area/keyboard không che CTA. Chỉ test/phát triển behavior liên quan, không dựng hệ thống accessibility khác để mở rộng scope.

Chủ sở hữu dùng chung: P01 auth; P02 AppShell/Home; P03 dialog; P04/P05 record nhập/xuất; P06 tra cứu; P07 NFC mapping; P08 lịch sử chung; P09 warranty workflow; P10 profile; P11 account security; P12 chứng từ; P13 notification/theo dõi Web; P14 recovery/shift; P15 system states; P16 data states; P17 scan exceptions; P18 attachments/handoff/location; P19 component issue; P20 POSTED history; P21 resume; P22 hub/NFC audit; P23 warranty/session history; P24 terminal/validation states. Ownership không bắt tạo24 AppShell/24 bản copy dữ liệu. Phần trùng dùng một component/state machine và ghi evidence cho mọi panel tương ứng.

Trong P sớm nếu route đích của P sau chưa có: nối hợp đồng navigation/context, dựng đủ phần độc lập, ghi integration pending, không mở chức năng thành công giả. Khi P đích hoàn thành, kiểm lại các edge phụ thuộc trực tiếp; không cần viết prompt con. Không làm lại màn đã đạt nếu source/dependency không thay đổi.

## 8. Nghiệm thu, báo cáo và tiến độ

Với mỗi P, kiểm visual ở reference viewport, hành vi/validation riêng được liệt kê và hồi quy component chung thực sự bị chạm. Chạy build/lint/typecheck/test có sẵn khi áp dụng; không bịa command package.json hoặc báo test đã chạy khi chỉ đọc code. Test phần cứng thật cần bằng chứng riêng; mock không thay E2E.

So sánh baseline/actual cùng crop, viewport, DPR, font, fixture, zoom và animation/time ổn định. Có thể tạo side-by-side/overlay/diff để định vị lỗi; không resize méo baseline hoặc mask lỗi. Ngưỡng sai khác phải có nguồn/được duyệt; chưa có thì báo số đo và review-needed, không tự đặt1% rồi tự PASS. Nghiệp vụ sai vẫn FAIL dù ảnh gần giống.

Mỗi P xuất `handoff/Pxx/REPORT.md`, bảng state acceptance, actual screenshots có thật nếu render được, file/patch đã sửa và lệnh/kết quả kiểm tra. Không tạo log/ảnh trống để đủ danh sách. Lưu artifact theo khả năng môi trường; nếu không tạo được file nói rõ và cung cấp nội dung, không đưa link giả.

Theo dõi chung trong `SCREEN_COVERAGE.csv`: prompt_id, board_path, panel_id, title, disposition, visual_status, behavior_status, integration_status, evidence, blocker. Đủ91 panel tối thiểu; các state runtime mở rộng ghi thêm dòng con đúng P, không tạo prompt mới. Status: NOT_STARTED / IN_PROGRESS / PASS / FAIL / BLOCKED / NOT_RUN; disposition riêng ORIGINAL / CURRENT / LEGACY_ADAPTED / MIGRATED. Không dùng một PASS chung để che phần tích hợp chưa kiểm.

`RUN_STATE.json` của agent: contract_version, source_commit, target_kind, current_prompt, completed_panel_ids, remaining_panel_ids, shared_components_changed, blockers, artifact_paths, next_action. Dữ liệu này chỉ phục vụ tiến độ triển khai, không phải checkpoint phiếu scanner của người dùng.

Ưu tiên hoàn thành P hiện tại; đọc đúng ảnh/source/dependency, không quét lại toàn repo, không tải node_modules/bundle lớn khi không cần. Sau khi có bằng chứng đủ thì dừng kiểm tra tùy chọn. Nếu gần giới hạn phiên lưu phần đã làm và phần còn lại, không báo hoàn thành giả. Không đặt quota cứng hai vòng sửa khiến cố tình bỏ việc có thể hoàn tất.

Kết luận mỗi P: hoàn thành UI đến đâu, behavior đến đâu, integration đến đâu, lỗi/điểm chưa rõ và link bằng chứng, khoảng250–400 từ. Không xuất suy luận nội bộ dài. P24 tổng hợp coverage toàn bộ dựa trên báo cáo thật, không thay công việc kiểm tra của P01–P23.

## 9. Giới hạn và phê duyệt

Cấu trúc24 prompt được người dùng chốt; không tự gộp, tách hoặc bỏ. Việc chốt cấu trúc không biến đề xuất nghiệp vụ/API trong tài liệu thành phê duyệt mới. Không cần xin duyệt lại hình thức đã chốt; chỉ hỏi quyết định còn thiếu ảnh hưởng phần đang làm. Không thay baseline để hợp thức hóa actual, không công bố đã triển khai toàn bộ app chỉ vì đã tạo đủ file prompt.

File này cùng24 P là **bộ lệnh thực thi** được soạn từ nguồn đã kiểm. Code ứng dụng chưa được sửa và các ca nghiệm thu trong P chưa được thực thi chỉ bằng việc tạo bộ tài liệu này.
