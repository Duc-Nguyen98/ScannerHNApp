# P08 r18 — Hôm nay chỉ điều hướng lịch, màu nút chủ đạo

User xác định lại mục đích Hôm nay: quay về ngày hiện tại trong lịch, không thay cả2input. Áp dụng giải pháp navigation-only đã nêu trong commentary.

## Thay đổi
- Bỏ Hôm nay cấpform. Chỉ có Hôm nay trongcalendarfooter.
- Click Hôm nay đặt cursor về tháng của ngày Việt Nam hiện tại, giữviewcalendar, không đổi dates.from/to/status, khôngcommit.
- aria-current=date + viền nhận diện ngày hôm nay; aria-pressed vẫn chỉ ngàyđãchọn. Chỉ bấm ngày hợp lệ mới điền dates[field] đangmở.
- Calendar được duyệt các tháng trongglobal90-day window; relativebounds vẫn khóa từngngày theo đầu còn lại. Vì vậy Todaycóthểđưa về tháng hiện tại dù cảtháng bịkhóa bởiĐếnngày.
- Nếu hôm nay sauĐếnngày khi chọnTừngày: không tựđổiĐếnngày, vẫndisabled và thông báo ngắn theo tình huống. Bypass disabled bằngDOM vẫn bịhandler từchối.
- Reset vàToday dùng chính#006d91/chữtrắng của ngàyselected. Cancel/Back giữsecondary; màu/nghiệp vụkhác khôngđổi.
- Reset vẫn xóa2date/status trongdraft và chờApply. Không thay semantics đãchốt.

## Kiểm chứngr18
- Today suite3/3 nhóm PASS, cả6history filters. Chụp selected28/08 vàTodaynavigation27/09.
- Reset/Today/selectedday actualbackground bằngnhau; khôngcóTodayởform.
- Back sauToday xácnhận2inputkhôngđổi. To chọn27/09 chỉ đổiTo, From01/08 giữnguyên. From bịblocked nếuToday>To; sửaTo trước thì được chọnFrom trongmiền hợp lệ.
- TestVietnam midnight: Todaymarker chuyển28/09, inputs giữcũ.6viewport calendar/notice nằmtrongapp, khôngoverflow.
- Shared regression7/7 PASS; Node toànworkspace148/148 PASS.
- Đãxem actualcalendar trước/sauToday vàblockedcase. Visualuserreviewpending; integrationNOT_RUN.

## Evidence
evidence/revision-18/today-results.json; nfc-calendar-before.png; nfc-calendar-today.png; today-blocked-by-end.png; end-only-updated.png;6viewport; unified-regression/browser-results.json; node-tests.txt.
Giữ24prompt/91panel/dataset/baseline; khôngpush/merge/deploy.
