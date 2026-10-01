# P14 r05 · Tổng kết → Lịch sử / Đăng xuất

Đã triển khai proposal user duyệt. **Đăng xuất là action chính, Xem lịch sử là action phụ** trên S04. Giữ4panel/24board/91panel, footerLOCK, ca khác phiên auth. Visual chờ user review; behavior PASS prototype; integration production BLOCKED.

## Luồng đã nối

- Dock gồm Xem lịch sử outline56px và Đăng xuất56px, gap12/lề24. Dùng `profile/logout-button.mjs` tách từ markup P10 và cùng CSS P10 (đỏ#b42318/chữtrắng/font19/icon24); không tạo mẫu logout riêng. P10 vẫn giữ selector ưu tiên cũ để không đổi style.
- Lịch sử mở P08 danh sách hiện có, không giả lọc riêng theo ca. Drilldown và Back trở về đúng S04 với snapshot/count/scroll/focus nútLịch sử. Tab Lịch sử chung vẫn dùng đường hiện hành.
- Logout chỉ có ở S04 sau receipt end. Một dialog: “Đăng xuất tài khoản?” / “Ca làm việc đã kết thúc. Bạn sẽ trở về màn hình đăng nhập.” / Hủy–Đăng xuất. Cancel/Escape/Back giữ màn, backdrop không đóng, trap/focus trong app.
- Confirm logout gọi P01 teardown, về Login; không dialog success trùng, Back không phục hồi phiên. Sửa thiếu `shift.dispose()` ở Home cleanup để không còn listener/feedback P14 sau logout.

## Giữ nháp trong preview

Kiểm source cho thấy owner P04/P05 bị dispose khi logout, checkpoint r03 chỉ trong controller. Vì vậy r05 bổ sung `draft-retention.mjs` page-memory do auth adapter sở hữu:

1. Trước logout P14, chụp toàn bộ draft owner hiện có, kiểm namespace/actor/kho/busy/UNKNOWN. Không có token/password, không localStorage, không gửi network.
2. Lưu theo namespace+actor+kho; không trộn tài khoản hoặc kho khác. Lưu lỗi/chưa đối chiếu thì giữ phiên, báo Chưa thể đăng xuất; không tự retry/request mới.
3. Login lại cùng trang/tài khoản: P04/P05 `restorePreview` khôi phục documentId/scanSessionId/version/note/accepted/attempts/request. Adapter giữ bộ đếm ID/request để phiếu mới không trùng phiếu vừa phục hồi. P03 dùng loadFixtureDocument hiện có. Chỉ xóa bản checkpoint sau khi các owner đã phục hồi thành công; phục hồi lỗi giữ bản cũ và chặn logoutP14 ghi đè.
4. Reload hoặc Đặt lại fixture tạo store mới, đúng contract dữ liệu thử ban đầu. Cơ chế này phục vụ đường logout từ Tổng kết, không chứng nhận persistence cho mọi logout/forced-expiry ngoài phạm vi.

**Không phải lưu bền vững WMS.** Dialog logout không hứa nháp đã được lưu trên server. Kênh auth/revoke, persistence/shift/aggregate thật và P21 vẫn cần contract/backend. Không tự bàn giao, cấp quyền hoặc đăng xuất tự động ngay khi end shift.

## Source / UI evidence

HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; prototype docs/flows HTML/CSS/JS. [Quyết định trước code](UI_UX_REVISION_05.md), [review r05](REVIEW_05.html). Before/after494×950 CSSpx/DPR1/Arial/minhanh/clock2026-09-29T08:30+07. Không sửa baseline B14, dist/gallery hoặc công việc chat khác.

S04 có thêm một nút56px+gap12, nên vùng nội dung627px cho726px nội dung mẫu; cuộn99px để đọc hết nháp. Hai CTA/menu luôn cố định, không nén chữ. [Ảnh đầu](evidence/revision-05/after/P14-S04.png), [ảnh cuối nội dung](evidence/revision-05/after/S04-bottom.png), [geometry](evidence/revision-05/after/final-summary-layout.json).

## Kiểm chứng

- `node --test tests/p14-logout-retention.test.mjs tests/recovery-shift.test.mjs tests/auth-session.test.mjs tests/profile.test.mjs`: **41/41 PASS**; gồm restoreInbound/Outbound đúngID/note/codes, clone/scope, blockedbusy/UNKNOWN, resetstore, quyền, ID mới không trùng. [Log](evidence/revision-05/node-tests.txt).
- `node --test tests/inbound.test.mjs tests/outbound.test.mjs tests/outbound-geography.test.mjs`: **58/58 PASS** hồi quy owner/geo sau thêm restore. [Log](evidence/revision-05/owner-tests.txt).
- `node scripts/check_p14_logout.cjs`: **7/7 nhóm PASS**;6viewport/đúng styleP10; history detail/Back/scroll/focus; cancel/escape/back/backdrop/one-modal; logout/login/back; restoreID/ghi chú; reloadreset; retention failure giữ session. [Results](evidence/revision-05/logout-results.json).
- `P14_EVIDENCE_DIR=…/revision-05/regression node scripts/check_recovery_shift.cjs`: **16/16 nhóm PASS** bốn panel/A01–A05/sáu viewport/guard/UNKNOWN/draft/header/footer/late-result. [Results](evidence/revision-05/regression/browser-results.json).
- `PROFILE_EVIDENCE_DIR=…/revision-05/profile-regression node scripts/check_profile.cjs`: **12/12 nhóm PASS** P10/P11/P14/logout/readonly/dirtyguard/authtie. [Results](evidence/revision-05/profile-regression/browser-results.json). Kiểm computed color/font/size logoutP10 bổ sung ở suite r05 sau giữ selector specificity.

Tổng **99 Node +35 nhóm browser**. Chromiumheadless/DPR1/zoom1;494×950,360×800,430×932,1440×900,340×420,1869×940. Không pageerror trong suite đạt. Clipboard/hardware/keyboard thiết bị thật/backend không được nghiệm thu bởi các ca này. No package build pipeline trong target; syntax các module đã kiểm.

## File / tiến độ

Mới: recovery-shift/draft-retention.mjs, profile/logout-button.mjs, test retention và browser logout. Sửa: P14 view/style, auth fixture adapter/app bridge, Home history/logout/restore/dispose, P04/P05 owner flow/fixture ID reservation, P10 markup/style shared. Model P14 và lịch sửP08 source không sửa. Evidence/source-manifest theo r05; coverage/RUN_STATE cập nhật, status visual pending. Không push/merge/deploy; P15–P24 chưa hoàn tất.
