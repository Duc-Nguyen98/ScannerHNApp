# P10 r03 — rà soát ổn định và đồng bộ UI/UX

Yêu cầu: rà lại luồng, sửa lỗi lặt vặt, kiểm UI/UX và đề xuất nâng cấp phù hợp. Phạm vi thực hiện: P10 và điểm nối trực tiếp P01/Home/P03/P11/P14. Không đánh dấu toàn bộ 24 prompt đã nghiệm thu.

## Kết quả và cách sửa

Đã tái hiện **7 ca thất bại trong 8 ca audit mới** trước sửa, thuộc các nhóm dưới đây. Log trước sửa giữ tại `evidence/revision-03/before/results.json`; kết quả sau sửa `evidence/revision-03/stability/results.json` đạt **8/8**.

| Vấn đề | Cách xử lý đã áp dụng |
|---|---|
| Back trên header tự push thêm Cá nhân; browser Back lại mở form vừa rời | Mỗi màn con ghi caller/owner của hành trình; Back tiêu thụ entry màn con thay vì push màn cha. Deep-link không có caller dùng replace an toàn. Chặn Back lặp khi browser đang chuyển entry. |
| Hủy dirty Back rồi Forward trở lại marker dialog cũ, làm lặp form trong lịch sử | Nhận diện marker dialog thuộc P10 đã đóng, tiêu thụ entry đó; không biến marker thành một trang form mới. Giữ bản nhập cho tới khi user xác nhận bỏ. |
| Về màn cha mất focus nút đã mở màn con | Ghi focus/vị trí theo panel; khôi phục đúng menu/field còn hợp lệ sau khi trở về. |
| popstate/hashchange cùng entry dựng lại form, làm nhảy con trỏ/focus | Bỏ qua render trùng khi route và snapshot profile không đổi; đồng thời đọc lại identity có thẩm quyền khi source thực sự thay đổi. |
| Lưu sáng ngay cả khi chưa chỉnh gì hoặc đã trả về giá trị cũ | So sánh draft theo allowlist sẵn có; disable khi không thay đổi hoặc busy. Input/clear-phone đồng bộ CTA. Không thêm regex/validation nghiệp vụ khi chưa có contract. |
| P11 Back tạo thêm bản sao P10.S04 trong stack | Home giữ caller của lần mở P11; UI Back quay về entry caller thật. Direct-entry P11 dùng fallback như trước. Không chỉnh nội bộ module P11 đang có công việc khác. |

Ca chuyển hash sang Home khi dialog mở đã PASS trước sửa và giữ PASS sau sửa. Bộ audit gồm nhiều biến thể của cùng lỗi lịch sử, không diễn giải thành bảy lỗi nghiệp vụ độc lập.

## UI/UX

- Giữ layout r02: nhóm ba menu, hàng Kết thúc ca, nút logout đỏ trầm; không phục hồi footer/mô tả thừa đã bỏ.
- Nút Back và Xóa điện thoại đạt vùng bấm44×44 CSS px trong khung chuẩn. Không đổi icon/palette nghiệp vụ.
- Dialog bổ sung liên kết mô tả cho trình đọc màn hình; tiếp tục dùng shared app-modal và focus trap. Không thêm overlay hoặc kiểu dialog mới.
- CTA Lưu phân biệt disabled/no-change và busy; không dùng con trỏ chờ khi form đơn giản là chưa thay đổi.
- Đã xem ảnh [form chưa thay đổi](evidence/revision-03/editor-unchanged.png), [form đã thay đổi](evidence/revision-03/editor-dirty.png), [dirty dialog](evidence/revision-03/dirty-dialog.png), [Cá nhân](evidence/revision-03/profile.png). Header/nav/footer và form không tràn ngang ở các viewport đã kiểm.
- Đề xuất bổ sung tách riêng trong [UI_UX_PROPOSALS.md](UI_UX_PROPOSALS.md); không tự redesign phần đã chốt hoặc dựng thành công giả.

## Kiểm chứng

| Lệnh / phạm vi | Kết quả |
|---|---|
| `node scripts/check_profile_stability.cjs` | 8/8 nhóm audit PASS; trước sửa7 FAIL/1 PASS |
| `$env:PROFILE_EVIDENCE_DIR='handoff/P10/evidence/revision-03/regression'; node scripts/check_profile.cjs` | 12/12 nhóm, 24 trường hợp layout |
| `$env:HOME_EVIDENCE_DIR='handoff/P10/evidence/revision-03/home'; node scripts/check_home.cjs` | 14/14 nhóm |
| `$env:SECURITY_EVIDENCE_DIR='handoff/P10/evidence/revision-03/security-edge'; node scripts/check_security.cjs` | 20/20 nhóm P11 prototype, 24 trường hợp layout |
| `$env:DIALOG_EVIDENCE_DIR='handoff/P10/evidence/revision-03/dialogs'; node scripts/check_dialogs.cjs` | 16/16 nhóm |
| `node --test tests/profile.test.mjs tests/dialog-route.test.mjs tests/home.test.mjs tests/auth-session.test.mjs tests/scanner-dialogs.test.mjs` | 46/46 PASS; `evidence/revision-03/node-tests.txt` |

Tổng **70 nhóm browser PASS**. Ma trận P10:494×1000,360×800,430×932,1440×900,340×420,1869×940; shell494×950, DPR1, Arial, zoom1. Kiểm Back/Forward, dirty cancel/discard, focus, CTA, readonly, identity khác, dialog scoped, logout/bảo toàn phiếu fixture, kết nối P11 và UNKNOWN/reconcile fixture P11. Không coi viewport thấp là bằng chứng bàn phím thiết bị thật.

## Source và giới hạn

Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target `prototype`. Source hash và kiểm chứng lưu trong thư mục r03. Node/browser đều chạy trên working tree thực; P11 được chat khác bổ sung trong khi audit, đã giữ nguyên file security và checkpoint P11.

Thay đổi: `profile/profile.mjs`, `profile/style.css`, `profile/profile-model.mjs`, `home/home.mjs` tại callback P10/P11, `auth-session/index.html` version CSS; mới `scripts/check_profile_stability.cjs`; tài liệu/evidence/coverage. Không sửa shared dialog implementation, P09, dist/gallery, không push/deploy, gọi API hay phần cứng.

**Visual:** layout r02 giữ, minor states/vùng bấm đã kiểm; người dùng review r03. **Behavior:** PASS trong các ca đã chạy. **Integration:** profile PATCH/upload/avatar, quyền chi tiết, backend auth/security và P14 vẫn thiếu contract/kết nối; P11 hiện đã có UI prototype, không còn được gọi là màn thiếu. Không khẳng định hết mọi lỗi ngoài phạm vi và không ghi PASS production từ fixture.
