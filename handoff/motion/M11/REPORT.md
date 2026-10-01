# MOTION_P11 — Bảo mật

2026-10-01 · **PASS_SCOPED_UI_FIXTURE**, 4/4 panel ở auto, OS reduced và off. Hình thức actual chờ user review; không deploy hoặc nghiệm thu backend thật. [Review](REVIEW.html) · [Kết quả](SUMMARY.json).

## Source / gate / ownership

Đã đọc MOTION_P11_Bao_mat và MOTION_CONTRACT v1.0 từ bộ user cung cấp, Contract gốc v2.0, FLOW_GATE PASS và M00 REPORT/OWNERSHIP/stack. Source editable là HTML/CSS/ES modules, HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Không cài thư viện. Giữ bản P11 r03 cân kết quả + UX audit r02; [quyết định trước sửa](DECISIONS.md), [source manifest](SOURCE_MANIFEST.json), [diff](changes.patch).

M00 `pressFeedback`, `noticeFeedback`, `rowFeedback`, token/mode/OS/hidden/cancel/dispose được reuse nguyên vẹn. Consumer mới `security/motion.mjs` chỉ sở hữu **SecureFormFeedback / SettingsRows**. M02 vẫn sở hữu route và giữ P11 security route static; overlay/native scroll/auth/domain owners không thay. Home thêm fan-out mode/cancel cho P11. Không có completion/timer motion gọi đổi mật khẩu, revoke, tạo request hoặc điều hướng.

Fixture B11 và shared-account preview giữ nguyên seed, IDs và policy: adapter/model hash trước/sau bằng nhau. Tài khoản chỉ là fixture được cấp; không đổi tài khoản cá nhân thật. UI có2 dòng phiên /86 descendant nodes trong ca profile; **virtualization NOT_NEEDED**, không dùng entrance hàng, exit row hoặc animate height.

## Mapping panel

| Panel | Áp dụng | Auto | OS reduced | Off |
|---|---|---|---|---|
| P11.S01 | Focus label140ms; press action100ms. Input/password/outline/geometry tĩnh, toggle giữ DOM/focus/caret | PASS | Focus80 / press0 |0, semantics đầy đủ |
| P11.S02 | Lỗi text/aria hiện ngay; opacity140ms trên nội dung lỗi mới, không shake/remount/xóa password hoặc phát lại mỗi sync | PASS |80ms |0, cùng lỗi |
| P11.S03 | Check icon fade160ms chỉ sau kết quả changed đã xác minh. Không replay khi Back/re-entry/mode change | PASS | STATIC_BY_DESIGN0ms | STATIC_BY_DESIGN0ms |
| P11.S04 | SettingsRows press100ms; list ID, pending/error và removal tĩnh. Chỉ revoke confirmed + kiểm danh sách mới bỏ đúng phiên | PASS | STATIC_BY_DESIGN0ms | STATIC_BY_DESIGN0ms |

Nội dung, quyền và operation count giống nhau: mỗi mode **2 password calls,3 revoke calls,6 list reads,1 reconcile** trong cùng chuỗi kiểm; các result signatures bằng nhau. Ba lệnh revoke tương ứng confirmed/failed/unknown; các nhánh Hủy/Back phát0 lệnh. Không tính pointer/animation là mutation. Error fields áp ngay, success không suy từ timeout. Consumer không đọc/lưu/log giá trị password.

## Sửa flow/lifecycle phát hiện trong nghiệm thu

P15 expiry đã ẩn P11 nhưng DOM còn giá trị đang nhập. [Before](preflight/expiry-before.json) `fieldsEmpty:false`; [after](preflight/expiry-after.json) `fieldsEmpty:true`, content hidden và0 animation. P11 `cancelMotion` kiểm guard owner để clear secrets + release consumer khi phiên không hợp lệ; ordinary overlay/mode cancel không xóa bản nhập. RAF phục hồi caret hiện có được theo dõi/hủy khi clear/hide/dispose. Không đổi auth/API hoặc hủy mutation domain bằng animation.

Hành vi P15 giữ Home để phục hồi phiếu vẫn giữ nguyên: sau hết phiên, subtree P11 có thể còn trong Home đã ẩn, nhưng input được xóa và không có hiệu ứng; Back không làm hiện nội dung protected. Không sửa cơ chế giữ phiếu để thỏa một assertion yêu cầu DOM bị xóa hoàn toàn.

## Kiểm chứng và bằng chứng

| Bộ kiểm | Kết quả |
|---|---|
| `check_motion_p11.cjs --before` |12 capture4panel×3mode, source snapshot gốc; [baseline hoàn chỉnh](before-complete/results.json) |
| `M11_OUT=handoff/motion/M11/verified-05 node scripts/check_motion_p11.cjs` |**21/21 nhóm PASS**,7/mode;12 geometry/DOM/text equality với bản trước;3 compact captures và3 trace |
| `MOTION_PRIVATE_TRACE=1 MOTION_P02_EVIDENCE_DIR=handoff/motion/M11/shell-final node scripts/check_motion_p02.cjs` |**36/36 nhóm PASS**,12/mode; AppShell/focus/native scroll/footer/security guards |
| `node --test tests/motion-p11.test.mjs tests/security.test.mjs tests/security-shared-preview.test.mjs tests/dialog-route.test.mjs tests/motion-p01.test.mjs tests/motion-p02.test.mjs` |**68/68 PASS**, gồm3 test M11 mới; [log](node-tests-verified.txt) |
| `node scripts/check_m11_expiry.cjs --before` / không flag |Reproduce và verify clear secrets khi P15 hết phiên, chỉ ghi boolean |

Kiểm submit trùng và navigate-away khi pending chỉ phát1 command cho lần đó; Cancel/native Back không revoke; lỗi revoke giữ IDs; UNKNOWN đối chiếu cùng yêu cầu, không lặp revoke. Input toggle dùng chính node đang nhập; caret và focus được giữ.10 vòng hide/show mỗi mode không tăng visibility listeners; OS/mode/hidden/cancel và logout/hết phiên bỏ WAAPI. Camera calls0; không gọi camera/NFC thật.

Actual494×950 và360×420,DPR1,zoom1, fixture clock cố định. Sau settle geometry/content bằng source trước; không phải chứng minh pixel-perfect với Designer. Đã trực tiếp xem bốn ảnh auto. CSS P11, model, adapter và M00 primitives/tokens **không đổi**. Source delta xem SUMMARY; là plain source bytes, không phải production bundle. Có WAAPI durations/keyframes và RAF opacity samples thật trong results; không đo FPS/dropped frames/latency thiết bị nên **không tuyên bố60fps**.

## Privacy / provenance / giới hạn

Ảnh form che riêng vùng input bằng mask tím trước khi ghi file để không capture password; không phải redesign hoặc che lỗi. Traces P11 không có DOM snapshot/screenshots/source và bắt đầu sau thao tác nhập, dừng trước toggle/nhập tiếp. Chỉ ghi operation counts/result kinds và geometry, không payload credential. [Kiểm trace](TRACE_PRIVACY_CHECK.json) không thấy chuỗi secret fixture kiểm tra. Shell runner hỗ trợ private trace sau login; không đổi assertions.

Lượt baseline đầu dừng ở selector mode trong details đóng; auto/reduced và source gốc được giữ. `before-complete` render lại từ snapshot gốc bằng route fulfillment chỉ trong browser test, không rollback live source. Metadata source-before được giữ nguyên. Những lượt thử còn dùng Home nav ẩn ở password form, hoặc dùng nút logout fixture khi session đã expired đều được sửa harness theo route thật, không sửa app để ép test qua.

Ổ C hết dung lượng làm gián đoạn lưu evidence. Chỉ hai trace hồi quy **do M11 tạo từ lượt chưa hoàn tất** được xóa sau xác minh path để có chỗ chạy lại; manifest tại FAILED_TRACE_CLEANUP.json. Trace shell QA cũ được thay bằng trace không ghi login trong TRACE_PRIVACY_REPLACEMENT.json; result logs và ảnh còn nguyên. Evidence cuối là **verified-05 / shell-final**, không dùng các thư mục thất bại để báo PASS.

Production password policy/API/session effects, thiết bị/IME/keyboard/touch thật **NOT_RUN/BLOCKED**. Không thêm persistence, không deploy, không sửa business `RUN_STATE.json`/`SCREEN_COVERAGE.csv`. Chỉ cập nhật MOTION_COVERAGE, MOTION_RUN_STATE và ownership M00. Phần tiếp theo MOTION_P12 chờ yêu cầu; toàn motion rollout chưa hoàn tất.
