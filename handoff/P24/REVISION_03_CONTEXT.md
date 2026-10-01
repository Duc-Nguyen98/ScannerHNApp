# P24 r03 — audit và sửa lỗi tái hiện

User yêu cầu rà kỹ UI/UX và khắc phục lỗi còn lại; giữ sáu cải tiến r02. Scope P24 và dependency trực tiếp P19/P20/P04/P05/P23, không redesign toàn app. Baseline B24 + các chuẩn khóa UI_STANDARD; nghiệp vụ HANDOFF. P23 r03 vẫn tạm chốt lịch sử, không tự chốt P24 hoặc production.

| Nguồn | Phạm vi kiểm |
|---|---|
| S01 sheet P19 | Focus stepper ở giới hạn, input/IME/validation, context dài trong body cuộn |
| S02 rejection P19 | Cuộn riêng màn lỗi/scan, route và Back khi rời module, mã/context nguyên vẹn |
| S03 owner record | CTA phiếu đúng ID, Back phục hồi focus/cuộn, state UNKNOWN giữ nguyên |
| S04 P20/P23 | Footer ổn định lúc load, context đọc lại, thời gian dài, cache/caller khi đi qua timeline |

Trước sửa lưu working source tại evidence/revision-03/before/source; audit mỗi ca trên trang/phiên riêng, cùng Chromium494×950/DPR1/font local/timezone VN. Dữ liệu dài/depleted/response chậm dùng fixture có tên trong script, không sửa production. Ghi PASS/FAIL của cùng ca trước–sau; không tính nghi ngờ không tái hiện là lỗi đã sửa. Ngoài các ca lỗi còn chạy regression/35layout/footer hiện có. Target44px/494×950/footerLOCK/4 ID/24board91panel được giữ.
