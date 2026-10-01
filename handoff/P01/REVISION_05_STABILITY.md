# P01 r05 — audit ổn định và đồng bộ UI/UX · 2026-09-28

## Kết quả / phạm vi

Đã sửa các lỗi tái hiện được trong P01 và kiểm tra điểm nối Home hiện hành. Không tuyên bố rà soát toàn bộ nghiệp vụ P03–P09 hay production. Giữ màu/icon/header/bố cục LOCKED hiện có; chưa áp dụng nâng cấp thiết kế mới.

Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`, target prototype; đã đọc AGENTS.md, shared/UI_STANDARD.md, checkpoint và báo cáo P09 r07. Source đã phát triển tới P09, không dùng context P01 cũ để kết luận P02 chưa tồn tại. Có công việc khác đồng thời sửa P03–P09/import/bootstrap và checkpoint; không ghi đè chúng hoặc nhận công việc đó là do audit này làm.

## Lỗi đã tái hiện và phương án đã áp dụng

| Lỗi trước sửa | Khắc phục | Kiểm chứng |
| --- | --- | --- |
| Adapter trả phiên thiếu actor/kho: throw, busy=true mãi | Kiểm cấu trúc local adapter trước bind UI; dữ liệu không hợp lệ giữ login và hiển thị chưa xác định | Test malformed, 3 payload |
| Quyền/kho `'false'` hoặc số1 bị coi là cho phép | Chỉ boolean true mới cho bắt đầu; UI/adapter/controller cùng fail-closed | Test4 giá trị ×2 cờ |
| Quyền/kho đổi trong lúc chờ start vẫn vào Home | Kiểm lại session và2 cờ sau await trước previewReady | Test revoke trong pending |
| isValid hoặc logout adapter throw làm hỏng flow | Bọc validation; luôn xóa session local khi cleanup lỗi, thông báo chưa xác minh nguồn thay vì báo logout remote thành công | 2 test exception |
| Rời trang khi còn ở login: mật khẩu đang hiện được giữ lại trong DOM | credentialEpoch buộc dựng lại form khi logout/reset dù screen không đổi; trả type=password/aria-pressed=false | Browser trước length19/type=text; sau length0/type=password; test lifecycle giả lập |
| Hash/Back revalidate phát lại intent Quên mật khẩu | P14 là intent một lần; enforce không phát lại, P02 durable handoff được giữ | Test và browser replayed=0 |
| Khi submit, nút mắt vẫn thao tác trên input đang khóa | Khóa cùng form trong pending; mở lại khi kết thúc | Browser đọc busy=true/eyeDisabled=true trong cùng tick submit |
| Copy controller vẫn nói Home chưa tích hợp | Đổi sang phiên fixture sẵn sàng mở Trang chủ, vẫn nói chưa tạo ca thật | Unit và browser login→confirmation→Home |

7 regression tests mới ban đầu **7 FAIL**, sau sửa PASS; [before-regressions.txt](evidence/revision-05-stability/before-regressions.txt). Không đổi trim/case/Unicode/password policy, không thêm API/timeout nghiệp vụ/OTP/quyền. Không lưu mật khẩu/token vào storage/log. Chỉ log độ dài/kiểu ở ca bảo mật, không ghi giá trị mật khẩu.

Guard trên hash/Back kiểm lại auth trước guard Home. Kho tạm dừng sau khi đã vào ca vẫn theo chính sách read-only/writes của từng module hiện hành; không tự logout chỉ vì kho dừng. P01 chỉ kiểm cờ khi bắt đầu ca.

## Kiểm thử sau sửa

- `node --test tests/*.mjs tests/*.cjs`: **195/195 PASS, 0 FAIL** ở snapshot cuối đã lưu. Ban đầu có173tests; số lượng tăng cả do7 test P01 và công việc khác đang cập nhật. Không nhận toàn bộ test mới là do P01. [node-tests.txt](evidence/revision-05-stability/node-tests.txt).
- `node --check` app.mjs/auth-flow.mjs/fixture-adapter.mjs exit0; `git diff --check` exit0. Whole-file hash của auth cũ được thay bằng test hành vi vì đây là sửa auth được yêu cầu; checksum board vẫn giữ nguyên và vẫn được test.
- **20 quan sát browser** trong [browser-checks.json](evidence/revision-05-stability/browser-checks.json): lifecycle reset, eye giá trị nguyên văn, P14 không replay, confirmation trước Home, denied/kho dừng/auth UNKNOWN/start UNKNOWN/expired/other-user, rời trang khi đang login,5 route smoke Home, Back sau logout và startup/retry.
- Các lối vào Nhập/Xuất/Tra cứu/NFC/Bảo hành mở và trở về Home. Đây là smoke navigation, không thay full regression riêng từng nghiệp vụ. Không mở camera/NFC thật, không ghi WMS.
- 6 case layout: S01/S02 tại360×800,430×932,1440×900, không tràn ngang. [render-metrics.json](evidence/revision-05-stability/render-metrics.json). 2 ảnh S01 có hover theo vị trí con trỏ (màu #034667); đã ghi màu thực, không gọi chúng là baseline idle. DPR/scroll/header/background lưu trong metrics.
- [S02 mobile360](evidence/revision-05-stability/S02-360.jpg), [S01 mobile360](evidence/revision-05-stability/S01-360.jpg). Actual được chụp từ browser, không tạo ảnh mock để báo PASS. Không có pixel acceptance mới.
- Cổng8771 là server kiểm thử localhost riêng vì8766 đang được các lượt khác sử dụng. Network blocking chỉ trong tab test để mô phỏng lỗi module, đã bỏ chặn; không chỉnh hệ thống network. Viewport tạm đã reset.

## UI/UX đồng bộ — kết luận

- CSS P01 không đổi: SHA256 `CC18C8BDA0A09805EDE17C37E3C7C6B0B79E8C2839043FDEDA0B2E77223DEEA7`; icon source không đổi `E40F728522EFA29582D165AB5458918A02B797CF60978AC3F84C9E347A1C9833`.
- B01 checksum vẫn `260e483a6447af2fb84cd5c1a5c5f5d75bd1a756ec6e37d69e0743aea5bd5853`. Không sửa ảnh gốc, dist, gallery hoặc asset.
- UI_STANDARD.md quy định nét/pastel cho **icon nhận diện nghiệp vụ**, không đổi logo/artwork/security/status. P01 không bị ép palette nghiệp vụ hoặc đổi độ đậm đã được user chốt.
- Giữ nhãn/chức năng keyboard, aria-pressed mắt, aria-busy pending, focus lỗi, disabled khác enabled. P14 tiếp tục nói chưa gửi yêu cầu thật. Error mới chỉ dùng message component hiện có, không thêm dialog/style hệ thống riêng.

## Phát hiện khởi động / phần chưa áp dụng

Tái hiện bằng chặn tải home.mjs: static import Home kéo tất cả module khiến P01 không dựng form. Trong khi audit, công việc khác đã bổ sung bootstrap.mjs + cảnh báo và nút **Tải lại preview**. Đã kiểm lại: thông báo xuất hiện và bỏ chặn→nhấn nút→login phục hồi. [Startup error](evidence/revision-05-stability/startup-error.jpg). Không nhận đây là code do audit P01 viết.

Đề xuất lazy-load Home sau xác nhận phiên sẽ cách ly lỗi tốt hơn, nhưng **chưa áp dụng**: dòng import đang được công việc khác đổi liên tục (p04-catalogue-r06 → p04-stability-r07 → p05-stability-r09). Hai patch dự định đều bị precondition từ chối, không tạo lazy-module hoặc sửa mountHome. Không ghi đè import mới. Cần một lượt phối hợp riêng sau khi source ổn định; bootstrap hiện đã cung cấp lối khôi phục, nhưng không bảo đảm đăng nhập độc lập khi module nghiệp vụ lỗi.

## Đề xuất bổ sung, CHƯA thực hiện để chờ xác nhận

1. **Ưu tiên kỹ thuật:** tách tải Home khỏi P01; màn chờ/lỗi tải có retry UI nhưng không start ca lại; test logout trong lúc import chờ. Giữ nguyên Home/import nghiệp vụ mới nhất.
2. **UX form:** lỗi thiếu username/password ngay dưới trường, focus trường đầu sai; cần chốt copy/hiển thị vì B01 LOCKED chưa có state này. Không đặt min/max/trim tự suy.
3. **Tên dài/khung preview:** thống nhất cách chào tên P01 với quy tắc P02 đã duyệt và hành vi xem tên đầy đủ; hoặc giữ P01 hiện tại. Không tự áp ellipsis/last-two-words lên danh tính.
4. **Production gate:** source auth/session/revoke/expiry/start/reconcile, thời gian timeout được chốt và thiết bị/keyboard thật. Fixture tests không xác nhận auth/backend đã ổn định production.

## Files thuộc audit này

`auth-flow.mjs`, `fixture-adapter.mjs`, các nhánh guard/reset/disabled của `app.mjs`, `tests/auth-session-stability.test.mjs`, cập nhật test invariant auth, report/evidence. Không sửa CSS/SVG hoặc source P03–P09; giữ import version cập nhật bởi công việc khác. Checkpoint chung được bổ sung field P01 audit, không thay current_prompt/revision P09.
