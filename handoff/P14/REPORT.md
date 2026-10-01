# P14 · Khôi phục tài khoản / Ca làm việc · r01

**Mới nhất: [P14 r06 — audit UI/UX và trạng thái phiên](REVISION_06.md)**. Giữ lịch sử revision trước; r06 chờ user review.


> User ngày2026-09-29 tạm chốt P14 r05 khi yêu cầu triển khai P15; có thể bổ sung state sau. Các dòng chờ review dưới đây là lịch sử revision. Không suy thành nghiệm thu production.

**Mới nhất: [P14 r05 — Lịch sử/Đăng xuất từ Tổng kết](REVISION_05.md)**. Visual chờ user review.


**Mới nhất: [P14 r04 — bố cục ưu tiên thao tác](REVISION_04.md)**. Visual chờ user review.


**Mới nhất: [P14 r03 — khắc phục audit S01/S03/S04](REVISION_03.md)**. GiữS02 r02; visual chờ review.


**Mới nhất: [P14 r02 — căn chỉnh biên nhận](REVISION_02.md)**. User đã duyệt triển khai proposal; hình thức r02 chờ review. Nội dung r01 dưới đây được giữ làm lịch sử.


Đã triển khai **4/4 panel** trong prototype. **Visual chờ user review; behavior PASS fixture; integration production BLOCKED.** User tạm chốt P13 r06 ngày2026-09-29, có thể bổ sung state sau; không suy thành nghiệm thu WMS.

## Nguồn và thay đổi

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target `docs/flows/` HTML/CSS/JS trong working copy nhiều chat. Đọc Contract2.0, BOARD_INDEX, P14, B14, AGENTS/UI_STANDARD, README và HANDOFF. [Số đo trước code](MEASUREMENTS.md), [xác minh baseline](evidence/revision-01/baseline-verification.json). Bảo toàn P01–P13/dist/gallery/baseline; không push/merge/deploy. Home/P12 tiếp tục có sửa đồng thời ở chat khác, không gán chúng cho P14.

Mới: `recovery-shift/{model.mjs,view.mjs,style.css,README.md}`, tests và scripts P14. Điểm nối: auth-session app/index; home route/mount/dispose; P10 onShift. Dùng đường resume owner hiện hành `openPending`, không sao chép phiếu. Không đổi code shared dialog/readable/footer/palette. Sửa đúng assertion P10 từng kỳ vọng P14 pending.

## Coverage

| Panel | Kết quả | Visual / Behavior / Integration |
|---|---|---|
| P14.S01 | Một field username, validation, hỗ trợ quản trị, gửi/chặn/UNKNOWN | Chờ review / PASS fixture / BLOCKED |
| P14.S02 | Receipt verified, username đúng, ID/time adapter, sao chép, Về Đăng nhập | Chờ review / PASS fixture / BLOCKED |
| P14.S03 | Phiếu dở thật trong nguồn preview, tiếp tục đúng ID, lưu snapshot, guard End | Chờ review / PASS fixture / BLOCKED |
| P14.S04 | Identity phiên, giờ/ngày VN, aggregate30, nháp giữ nguyên, Home CTA cố định | Chờ review / PASS fixture / BLOCKED |

[Review baseline/actual](REVIEW.html) · [S01](evidence/revision-01/P14-S01.png) · [S02](evidence/revision-01/P14-S02.png) · [S03](evidence/revision-01/P14-S03.png) · [S04](evidence/revision-01/P14-S04.png).

Giữ shell494×950, scale đồng nhất; lề24, icon nét/pastel theo contract, thông báo hành động dùng dialog trong app. S01/S02 không footer theo B14; S03/S04 dùng nav chung, việc thêm menu S03 là adaptation cần review. Không status bar giả. B14 có kích thước/ratio khác shell đã khóa, chưa có ngưỡng pixel acceptance.

PN-0005 giữ theo P04 thay PN-0001 minh họa. Nếu chưa có phiếu, P14 seed một phiếu bằng owner P04 **chỉ trong preview**; nếu có, dùng lại. Username `minhanh` không dùng display name Minh Anh. Giờ/ngày thực của phiên thay 08:30–17:30/09-09 in cứng. KPI12+6+4+3+5=30 là aggregate fixture tách nhóm sự kiện, không là tồn kho hoặc số dòng tải. Bỏ lời hứa quản trị chủ động liên hệ và tự bàn giao ca sau; proposal ở tools/README. Chú thích proposal B14.S04 không biến thành notice sản phẩm.

## Kiểm chứng

- `node --test tests/recovery-shift.test.mjs tests/auth-session.test.mjs tests/profile.test.mjs tests/home.test.mjs tests/dialog-route.test.mjs`: **49/49 PASS**, trong đó19 ca P14. [Log](evidence/revision-01/node-tests.txt).
- `node scripts/check_recovery_shift.cjs`: **16/16 nhóm PASS**, 4 panel×6viewport; A01–A05, failure/blocked/timeout+đối chiếu, duplicate/guard, resume đúng ID/note, sửa sau lưu khóa lại, end-error, auth/logout/late response, Escape/Back/trap/focus/backdrop, nội dung250/2000 Unicode/HTML, fixed CTA/nav. [Kết quả](evidence/revision-01/browser-results.json).
- `PROFILE_EVIDENCE_DIR=… node scripts/check_profile.cjs`: **12/12 PASS**, gồm P10→P14 và quay lại. [Kết quả](evidence/revision-01/profile-regression/browser-results.json).
- `NOTIFICATIONS_EVIDENCE_DIR=… node scripts/check_notifications.cjs`: **14/14 PASS** hồi quy P13/P12/điều hướng sau thay Home mount. [Kết quả](evidence/revision-01/p13-regression/browser-results.json).
- `HOME_FOOTER_EVIDENCE_DIR=… node scripts/check_home_footer_locked.cjs`: **4/4 viewport PASS**, parity Home/P03 và footerLOCK. [Kết quả](evidence/revision-01/footer-regression/results.json).
- Bộ `check_home.cjs` cũ **FAIL do assertion lỗi thời**: còn đòi `P13 chưa có` khi chuông đã mở P13. Giữ source test đó, không coi là lỗi đã sửa hay toàn bộ Home PASS. [Failure](evidence/revision-01/home-regression/browser-failure.json). Đường Home/footer/P13 hiện hành đã kiểm ở các suite trên.
- `node scripts/capture_recovery_shift.cjs`: ảnh cuối4 panel sau chỉnh compact summary. [Geometry cuối](evidence/revision-01/final-summary-layout.json). Ảnh trước chỉnh ở `before-polish/` giữ để đối chiếu, không dùng làm baseline.

Chromium headless, DPR1, zoom1, Arial; viewport494×950,360×800,430×932,1440×900,340×420,1869×940 CSS px. Main suite timezone Asia/Ho_Chi_Minh; hiển thị app luôn UTC+7. Không pageerror trong suite đạt. Keyboard thiết bị thật/hardware/WMS NOT_RUN; 340×420 chỉ mô phỏng viewport thấp. Không package/build pipeline tại target; syntax/Node/browser trực tiếp. Số test không phải user visual acceptance.

## Giới hạn còn lại

Recovery channel/receipt/identity-policy thật; quyền/policy liệt kê–lưu–đối chiếu–kết thúc ca; aggregate backend; P21 resume linh kiện chưa chốt/tích hợp. P14 lưu trong bộ nhớ fixture; không bảo đảm persistence WMS hay tự khóa nghiệp vụ sau ca. UI không tự cấp quyền hoặc chuyển chủ sở hữu. Giữ rõ visual/behavior/integration trong [RUN_STATE](RUN_STATE.json) và coverage91panel; P15–P24 chưa hoàn tất.
