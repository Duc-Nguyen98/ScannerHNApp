# P10 r04 — áp dụng nâng cấp UI/UX đã được duyệt

User yêu cầu áp dụng các đề xuất tiếp theo của r03. Phạm vi: chỉ báo chưa lưu ở P10.S02 và nhóm menu P10.S04. Giữ đủ4 panel, bố cục S01 r02 và các sửa lỗi luồng r03.

## Đã áp dụng

- Chỉ báo **“Có thay đổi chưa lưu”** ngay trên CTA Lưu. Hiện khi name/nickname/phone khác nguồn, biến mất khi hoàn nguyên hoặc bỏ thay đổi; vẫn hiện sau khi đóng thông báo lưu chưa kết nối hoặc chọn tiếp tục chỉnh sửa.
- Dùng cùng `isProfileDirty` của guard/CTA; không nhân bản validation. Live region polite/atomic, chỉ cập nhật text khi trạng thái đổi; CTA liên kết mô tả khi dirty. Vùng thông báo giữ chỗ cố định để không nhảy form, footer hay con trỏ lúc gõ.
- P10.S04 dùng chính `p10-account-group` và `row` của S01: một card, ba hàng80px, divider nhẹ, icon44×44/icon26, gap16px, font20px, radius14px. Bỏ các dòng mô tả lặp nghĩa; giữ notice bảo vệ tài khoản, nav và ba điểm nối chức năng.
- Không chỉnh P11 hoặc Home trong revision này. Contract profile/upload/quyền thật vẫn chưa có; đề xuất tích hợp ở mục3 vẫn là phần có điều kiện, không giả lưu thành công hoặc bịa validation.

## Kiểm chứng

- `$env:PROFILE_EVIDENCE_DIR='handoff/P10/evidence/revision-04/regression'; node scripts/check_profile.cjs`: **12/12 nhóm PASS**,4 panel ×6 viewport, không lỗi JS/request ngoài localhost.
- `$env:PROFILE_STABILITY_EVIDENCE_DIR='handoff/P10/evidence/revision-04/stability'; node scripts/check_profile_stability.cjs`: **8/8 nhóm PASS**, gồm Back/Forward, dirty cancel/discard, không remount trùng, focus và P11 caller.
- Quan sát thực lưu trong `evidence/revision-04/ui-observations.json`: style nhóm S01/S04 bằng nhau; footer ở y833, cao117px trước/sau chỉnh/hoàn nguyên; field kho cuối vẫn hiện đầy đủ ở khung494×950. Trạng thái initial/reverted/discarded rỗng và CTA disabled; dirty/clear-phone/save-blocked/cancel-leave có chỉ báo và CTA enabled.
- Đã xem ảnh [form dirty](evidence/revision-04/editor-dirty.png), [form sạch](evidence/revision-04/editor-clean.png), [nhóm bảo mật](evidence/revision-04/security-group.png). Ma trận P10 gồm494×1000,360×800,430×932,1440×900,340×420,1869×940 CSS px; DPR1, Arial, zoom1. Không tràn ngang, footer/nav giữ vị trí.
- Không viết thêm test logic cho thay đổi UI nhỏ; không chạy lại full app. Evidence logic46/46 và hồi quy rộng70 nhóm của r03 được giữ dưới đúng revision, không tính là lần chạy mới.

**Visual:** hai nâng cấp đã duyệt được áp dụng, ảnh actual sẵn sàng review. **Behavior:**20 nhóm browser PASS trong prototype. **Integration:**BLOCKED backend profile/upload/permissions; các giới hạn production trước đó giữ nguyên.

## File và tiến độ

Sửa `docs/flows/profile/profile.mjs`, `style.css`, `profile-model.mjs` (metadata r04), `docs/flows/auth-session/index.html` (CSS revision). Bàn giao/coverage ghi r04; giữ checkpoint toàn cục của P11 đang có công việc khác. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; source checksum tại `evidence/revision-04/source-sha256.json`. Không sửa baseline/gallery/dist, không push/deploy hoặc gọi backend mới.
