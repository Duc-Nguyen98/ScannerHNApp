# ScannerHNApp — báo cáo source tích hợp P01–P24

Ngày kiểm tra: 30/09/2026 (Asia/Ho_Chi_Minh)

## 1. Phạm vi và cách đọc tài liệu

`00_CONTRACT_CHUNG.md` là contract thực thi: khóa đúng 24 board, 91 panel, quy tắc nghiệp vụ, target prototype/production, cách ghi coverage và nguyên tắc không tự merge/deploy. Đây là căn cứ kiểm kê, không phải bằng chứng rằng production đã có.

`MOTION_CONTRACT.md` là đề xuất cho giai đoạn sau FLOW: nó đặt thứ tự source P01–P24 → `01_FLOW_LINK_GATE.md` → motion. Nó không phải kết quả triển khai và không được áp dụng ở lượt này. Theo yêu cầu hiện tại, source tích hợp **chưa thêm animation và chưa deploy**.

## 2. Vị trí source và trạng thái Git

- Source thực thi: `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`.
- Git branch duy nhất truy cập được: `main`.
- HEAD/baseline: `da9f623a19d0359c3e80c14f8cc612636ec6ab78` (`origin/main` cùng commit).
- Working tree có các thay đổi P01–P24, shared components, tests, scripts, handoff và coverage chưa commit; đây là bản tích hợp được bàn giao. Không reset hoặc loại bỏ các thay đổi đó.
- `git worktree list` chỉ trả về worktree hiện tại. Không có branch khác hoặc worktree riêng để merge.
- `C:/Users/TAN MIE/Downloads/app_Scanner/contract-work` không phải Git repository; chỉ có hồ sơ/evidence của chuỗi công việc cũ, không phải source branch để hợp nhất.
- Index không có trạng thái unmerged (`UU/AA/DD/AU/UA/DU`); không có marker `<<<<<<<`, `=======`, `>>>>>>>` trong source. Xung đột tích hợp hiện không còn ở mức Git.

## 3. Coverage 24 board

`SCREEN_COVERAGE.csv` có 91 dòng panel, 24 `prompt_id` duy nhất, 91 `panel_id` duy nhất và không trùng panel. Công thức đúng theo contract là P01=2, P02=1, P03–P24=88, tổng 91.

| Prompt | Source tích hợp hiện hành | Panel | Visual | Behavior | Integration |
|---|---|---:|---|---|---|
| P01 | `docs/flows/auth-session/` | 2 | IN_PROGRESS | PASS | BLOCKED |
| P02 | `docs/flows/home/` | 1 | IN_PROGRESS | PASS | BLOCKED |
| P03 | `docs/flows/scanner-dialogs/` + shared dialog | 4 | IN_PROGRESS | PASS | BLOCKED |
| P04 | `docs/flows/inbound/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P05 | `docs/flows/outbound/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P06 | `docs/flows/lookup/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P07 | `docs/flows/nfc/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P08 | `docs/flows/history/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P09 | `docs/flows/warranty/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P10 | `docs/flows/profile/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P11 | `docs/flows/security/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P12 | `docs/flows/documents/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P13 | `docs/flows/notifications/` | 4 | USER_TEMPORARILY_ACCEPTED | PASS | BLOCKED |
| P14 | `docs/flows/recovery-shift/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P15 | `docs/flows/system/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P16 | `docs/flows/data-states/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P17 | `docs/flows/scan-exceptions/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P18 | `docs/flows/attachments/` | 4 | IN_PROGRESS | PASS | BLOCKED |
| P19 | `docs/flows/warranty-components/issue-*` | 4 | IN_PROGRESS/PASS | PASS | BLOCKED |
| P20 | `docs/flows/warranty-components/history-*` | 4 | IN_PROGRESS/PASS | PASS | BLOCKED |
| P21 | `docs/flows/warranty-components/resume-*` | 4 | PASS | PASS | BLOCKED |
| P22 | `docs/flows/history/nfc-audit-*` | 4 | PASS | PASS | BLOCKED |
| P23 | `docs/flows/history/warranty-session-*` | 4 | IN_PROGRESS/PASS | PASS | BLOCKED |
| P24 | shared P04/P05/P19/P20/P21/P23 + `warranty-components/flow.js` | 4 | IN_PROGRESS | PASS | BLOCKED |

Tổng trạng thái từ coverage hiện tại: visual `70 IN_PROGRESS`, `17 PASS`, `4 USER_TEMPORARILY_ACCEPTED`; behavior `91 PASS`; integration `91 BLOCKED`. `PASS` ở đây là behavior trong prototype/fixture, không phải backend, phần cứng hay visual sign-off.

## 4. Nguồn còn thiếu hoặc kết quả chưa thể xác nhận

Không có panel nào bị mất khỏi coverage hoặc không có hồ sơ P tương ứng. Các mục dưới đây là **nguồn cần cung cấp để đóng phần đang thiếu**, không phải lỗi cần tự bịa bằng fixture:

| Board | Kết quả hiện có | Nguồn/kết quả còn thiếu cần cung cấp |
|---|---|---|
| P01 | 2 panel prototype, behavior PASS | Logo/font/texture/icon đúng baseline locked; auth/session/revoke/start contract; keyboard/thiết bị thật. |
| P02 | Home prototype, route/fixture PASS | Asset/typography exact của B02; Home/session/permission API thật. |
| P03 | 4 panel dialog, behavior PASS | Font/texture exact và integration modal/router thật. |
| P04 | 4 panel inbound, fixture PASS | Font/camera/box imagery; catalog/stock/metadata/record/status và P12/P17 production adapters. |
| P05 | 4 panel outbound, fixture PASS | Font/icon/camera/product assets; create/record/status/permission/catalog contract và camera thật. |
| P06 | 4 panel lookup, fixture PASS | Product/gallery assets chính thức; catalog/stock/event/capability backend và P09/P12/print source. |
| P07 | 4 panel NFC, fixture PASS | Mapping/list/link/audit/capability contract, NFC event source và thiết bị thật. |
| P08 | 4 panel history, fixture PASS | History endpoint/envelope/cursor/scope/permission và artwork/font exact. |
| P09 | 4 panel warranty, fixture PASS | Intake/update/ledger/permission backend, camera và đồng bộ P18–P24. |
| P10 | 4 panel profile, fixture PASS | Profile/upload/permission contract và keyboard/touch thật. |
| P11 | 4 panel security, fixture PASS | Designer font/pixel source; password/session policy/change/revoke API thật. |
| P12 | 4 panel documents, fixture PASS | Backend document/date contract, artwork/font và file/print source. |
| P13 | 4 panel notifications, fixture PASS; tạm chốt visual | Notification/read/mark-read/list cursor/scope contract và vận hành URL Web. |
| P14 | 4 panel recovery/shift, fixture PASS | Recovery/end-shift/session retention/aggregate contract và backend. |
| P15 | 4 panel system, fixture PASS | System status/read contract, native hardware và production permission source. |
| P16 | 4 panel data states, fixture PASS | Production data-state/transport contract và runtime source. |
| P17 | 4 panel exception, fixture PASS | Status/record/retry/permission contract; camera/NFC/scanner thật. |
| P18 | 4 panel attachments, fixture PASS; tạm chốt visual | Upload/handoff/location policy, schema, adapters, storage và permission thật. |
| P19 | 4 panel issue, fixture PASS; tạm chốt lịch sử | Post/status/stock contract, camera/hardware và synchronized states. |
| P20 | 4 panel history component, fixture PASS; tạm chốt lịch sử | Pagination/scope/API/durable persistence và hardware. |
| P21 | 4 panel resume, fixture PASS; visual đã tạm chốt | Checkpoint/recorded-lines/version/status API, durable retention, WMS URL, camera/NFC/keyboard. |
| P22 | 4 panel NFC audit, fixture PASS; visual đã tạm chốt | Real NFC events, authorization/mapping và durable persistence. |
| P23 | 4 panel warranty/session history, fixture PASS; tạm chốt trong P24 | Production event/backend contract, hardware và persistence. |
| P24 | 4 panel cross-owner states, fixture PASS | Auth/stock/validate/record/Post/status/cursor contracts, camera/NFC/keyboard và durable persistence; B24 chỉ là fixture opt-in. |

## 5. Kiểm tra đã chạy trong lượt tích hợp

- `node --test tests/*.mjs`: **653/653 PASS**, 0 fail, 0 cancelled.
- `node --check` toàn bộ 136 file `.mjs/.js` dưới `docs/flows`: **136/136 hợp lệ**.
- `git diff --check`: PASS.
- Kiểm tra marker conflict và index unmerged: PASS.
- Coverage audit: 24 prompt, 91 panel, 0 duplicate panel, không thiếu P01–P24.
- Handoff audit: 24/24 `handoff/Pxx/REPORT.md` tồn tại; evidence đầu tiên của 91/91 panel trỏ tới artifact tồn tại.
- Không chạy lại animation suite, không thêm motion dependency, không deploy/public preview. Các ảnh/log browser trong từng `handoff/Pxx` được giữ nguyên làm evidence lịch sử/scoped; không nâng chúng thành nghiệm thu toàn app.

## 6. Bàn giao cho `01_FLOW_LINK_GATE.md`

Bản cần dùng là working tree hiện tại tại `ScannerHNApp`, cùng `SCREEN_COVERAGE.csv`, `RUN_STATE.json`, các module dưới `docs/flows/` và hồ sơ `handoff/P01`–`handoff/P24`. Báo cáo này là chỉ mục tích hợp; không thay thế các report P riêng.

Điểm xuất phát cho FLOW gate: navigation/component prototype đã được nối trong cùng source; mọi integration production đều đang BLOCKED và phải giữ trạng thái đó cho tới khi có contract/backend/hardware tương ứng. Giữ nguyên các trạng thái tạm chốt và phần deferred đã ghi trong handoff; không chạy MOTION ở bước này.
