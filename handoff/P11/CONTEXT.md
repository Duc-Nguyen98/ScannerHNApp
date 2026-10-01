# P11 — nguồn, số đo và quyết định trước triển khai

2026-09-28. User tạm chốt P10 r02, các state đồng bộ bổ sung sau, yêu cầu triển khai P11.
Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target prototype editable trong `docs/flows/`.
Giữ mọi thay đổi đang có của chat khác. Không sửa dist/gallery/baseline. Không gọi API mới.

## Nguồn

- P11_Bao_mat.md, Contract v2.0, BOARD_INDEX.csv trong bộ user cung cấp; P11 = B11 = `09_bao_mat.png`, 4 panel.
- OBSERVED_IMAGE: B11.png 1536×1024, user đính kèm. Crop estimated: S01 (22,79)–(380,862); S02 (401,79)–(759,862); S03 (780,79)–(1136,862); S04 (1156,79)–(1516,862).
- VERIFIED_SOURCE: AGENTS.md; shared/UI_STANDARD.md; shared/operation-icons.css; profile, Home, auth-session, shared/app-modal.mjs và dialog-route.mjs.
- README.md dòng36: quản lý phiên còn cần chốt cơ chế. HANDOFF chỉ chốt nghiệp vụ linh kiện; DEV_PROPOSAL phân biệt auth_session và scan_session, không cấp API bảo mật.
- UNKNOWN: backend password policy, đổi mật khẩu/receipt, list/revoke/reconcile session, chính sách phiên sau đổi. Không đặt min8/regex/OTP/2FA. P15 chưa triển khai.

## Số đo B11 trước code (estimated từ raster, không phải CSS gốc)

| Hạng mục | B11 raster / ánh xạ khung app đã chốt |
|---|---|
| Phone | ~358×783; bỏ status bar giả, dùng AppShell 494×950 CSS px đã chốt |
| Header | vùng tiêu đề y125–184 (~59px), gradient navy–teal; dùng header88px như P10, body overlap12px |
| Nội dung | x45–358, padding ~23px trong phone; app padding24px, bề rộng446px |
| Heading/body | ~20/16px ảnh, app24/19px; Arial theo P10, font Designer chưa xác minh |
| Form | input ~314×48, radius8; app input64px/radius10, label18px, gap32px giữa field |
| Icons | lock/eye ~22px ảnh; app28px, eye hit area44px; icon có sẵn trong repo |
| Hint | y609–673, nền xanh nhẹ, radius10; app padding18px, gap16px |
| CTA | ~326×56 tại y778, radius10; app footer24px, CTA72px/radius12, luôn ngoài scroller |
| Success | vòng xanh ~112×112, heading hai dòng; app vòng140px, heading27px; CSS + check SVG có sẵn |
| Card metadata | ~320×196, separator mỗi hàng; app padding14px, rows82px; neutral pastel documents theo chuẩn mới |
| Sessions | hai card x1167–1503, gap18; app padding18px/gap20; current badge xanh và revoke viền đỏ riêng màu trạng thái |
| Nav | S04 giữ nav chung; S01–S03 ẩn nav theo baseline, không dựng nav thứ hai |

## Triển khai an toàn

- P10.S04 → P11.S01 hoặc S04; Back về P10.S04; giữ 4 ID, S02 là state lỗi của form.
- Default adapter blocked; không hiện thành công hoặc thiết bị giả như dữ liệu thật. Công cụ ngoài app bật fixture B11 có namespace riêng để review đủ panel. Fixture đổi credential chỉ trong bộ nhớ adapter thử, không đổi credential P01 hoặc tài khoản thật.
- Success chỉ sau receipt đã kiểm actor/kho/request/session và policy phiên rõ ràng của adapter thử. Policy backend vẫn BLOCKED, không suy giữ/xóa session production.
- Không persist/log/normalize mật khẩu. Clear khi rời/đăng xuất/dispose; response muộn không mở màn lại. UNKNOWN giữ request và chặn gửi lại cho đến đối chiếu.
- Revoke đúng ID do adapter trả, không dùng token/user-agent. Chỉ cập nhật dòng khi xác minh lại danh sách; current session không có CTA revoke.
