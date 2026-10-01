# P08 r19 — Đặt lại về ngày hiện tại và rà luồng Lịch sử

User yêu cầu Reset không đểtrống/dd-mm placeholder mà vềngày hiện tại; ràlỗi/luồnglogic trongcác trangLịch sử và sửa lỗi thuộcphạmvi.

## Đặt lại
- todayRangeDraft lấy ngày click-time theo Asia/Ho_Chi_Minh, gán cảfrom/to bằng ngàyđó; không dùng ngày lúc mởdialog hoặc hardcode.
- Reset status=all, clear error/calendarNotice/touched, cursor hômnay. Form valid vàApplyenabled.
- Chỉ sửa draft: Cancel/Escape giữ committedfilters; Apply commit cặp ngàyhômnay. Xóa lọc ngoàilist vẫn trảTất cả ngày theo quy tắc cũ.
- CalendarToday vẫn navigation-onlyr18: không đổi2input, explicitdateclick chỉ đổi ôđangmở.90-day/dateorder vẫn giữ.
- Unit kiểm27→28/09 lúc0hVN và31/12→01/01.

## Lỗi tìm thấy và sửa
- Reproduction thực: mở detail NFC, bấm Copy nhưngclipboard vẫn before-copy thay vìNFC-8A2F. Handler còn gọi readRecord chỉđọc generalstore.
- Đổi sang currentRecord cùng nguồnrender cho general/NFC/warranty; giữ clipboarddenied feedback.
- Chặn latefeedback nếu viewkey đã đổi/disposed, không rerender/đưa focus sai sau khi người dùng đổi tab.
- Browser test actualclipboard đúng mã3nguồn; deniedclipboard và delayedresponse được mô phỏng rõ để kiểm UIerror/race path.
- failure.json/png trongrevision19 là lỗi tìm thấy trướcsửa; reset-results.json là kếtquả chạy cuối saufix.

## Kết quả
- Reset/audit suite5/5 groups PASS:6 màn Reset/Cancel/Apply/Clear; midnight;6viewport; copy/back; reverse/future/day91/submitguard.
- Shared regression7/7 PASS: filters/query/status, rangeaggregate/drilldown, sessiondata, sourceconfirm/locksP05, legacyroutes, unknownIDs, logoutBack.
- Node toànworkspace149/149 PASS.
- Đã xem actualreset General. Layout giữr18/r17, không thay thiết kếngoài request. Visualreviewpending; integrationNOT_RUN.

## Evidence
evidence/revision-19/reset-results.json; history-general-reset.png và5surface; reset-494x1000.png và5viewport; unified-regression/browser-results.json; node-tests.txt; failure.json(beforefix).
Giữ24prompt/91panel/source/baseline. Khôngpush/merge/deploy.
