> Bản mới nhất: [P16 r03 — rà soát/sửa lỗi](REVISION_03.md) · [Review r03](REVIEW_03.html). Các báo cáo trước giữ làm lịch sử.

> Kiểm tra hiện tại sau P17: [P16 r02 — 38 test logic / 15 nhóm browser](RECHECK_AFTER_P17.md). Source ứng dụng giữ nguyên; [xem actual mới](REVIEW_CURRENT.html).

> Bản mới nhất: [P16 r02 — sáu cải tiến UI/UX](REVISION_02.md) · [Review r02](REVIEW_02.html). Báo cáo r01 bên dưới giữ làm lịch sử.

# P16 · Trạng thái dữ liệu · r01

Triển khai **4/4 panel** trong owner Chứng từ P12. **Visual: chờ user review; behavior: PASS prototype; integration: BLOCKED production.** P15 được người dùng tạm chốt trong yêu cầu này, cho phép bổ sung state sau; [ghi nhận](../P15/USER_ACCEPTANCE_2026-09-29.md).

## Nguồn và triển khai

HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target HTML/CSS/JS trong `docs/flows/`, chạy server hiện có tại port8766. Đã đọc Contract2.0, P16, BOARD_INDEX, AGENTS/UI_STANDARD, HANDOFF và source liên quan. B16 đính kèm trùng SHA256 với blob HEAD: [xác minh](evidence/revision-01/baseline-verification.json). [Bảng nguồn/số đo](MEASUREMENTS.md).

Mới: `data-states/{model.mjs,view.mjs,style.css,README.md}`, test logic và hai script browser P16. Sửa giới hạn `documents/documents.mjs`, `documents/style.css`, một dependency callback trong `home/home.mjs`. Giữ các revision mới hơn của P12, source P15, footer khóa, dữ liệu/owner tạo phiếu. Không sửa dist/gallery/baseline hay push/merge/deploy.

## Bốn panel

| ID | Kết quả | Visual / Behavior / Integration |
|---|---|---|
| P16.S01 | Sáu skeleton, spinner, aria-busy/status; chưa xác định số lượng; timeout kết thúc chờ | IN_PROGRESS / PASS / BLOCKED |
| P16.S02 | Chỉ response thành công rỗng; CTA theo quyền vào P12 rồi owner P04/P05/P09 | IN_PROGRESS / PASS / BLOCKED |
| P16.S03 | Giữ query, Xóa bộ lọc phục hồi nguồn, Sửa từ khóa focus input | IN_PROGRESS / PASS / BLOCKED |
| P16.S04 | Retry cùng filter, single-flight; mã lỗi từ nguồn; lỗi giữ cache đúng context | IN_PROGRESS / PASS / BLOCKED |

[Review r01](REVIEW_01.html) · [Acceptance](STATE_ACCEPTANCE.csv).

## Kiểm chứng

- `node --test tests/data-states.test.mjs tests/documents.test.mjs tests/document-progress.test.mjs tests/flow-guidance.test.mjs tests/dialog-route.test.mjs`: **38/38 PASS**, trong đó8 ca P16. [Log](evidence/revision-01/node-tests.txt).
- `node scripts/check_p16.cjs`: **7 nhóm PASS**, bốn panel×5viewport, quyền/route, CTA owner, Back/cache. [Kết quả](evidence/revision-01/browser-results.json).
- `node scripts/check_p16_reads.cjs`: **6 nhóm PASS**, response A/B đảo thứ tự, retry, P15 network/401/403, query Unicode dài. [Kết quả](evidence/revision-01/reads/results.json).
- Hồi quy: footerLOCK **4viewport**, P12 tab/Back **9nhóm**, P12 guidance/create/resume/UNKNOWN **8nhóm**, đạt; lưu riêng trong evidence revision này. Tổng **34 nhóm/viewport browser**, không pageerror trong các suite đạt. Không có pipeline package/build riêng cho target.

Chromium headless, DPR1, zoom1, Arial; viewport494×950,360×800,430×932,1440×900,340×420; regression P12 thêm1869×940. Before dùng source snapshot qua request interception, không thay working copy. Diagnostics lúc phát triển giữ riêng: selector công cụ chưa mở, selector nav sai, assertion newline của input search được sửa theo giá trị trình duyệt thực tế; không tính là kết quả đạt.

## Khác biệt và giới hạn

Giữ date/count/sort từ P12 hiện hành; controls cố định trên vùng list cuộn. B16 không có các controls bổ sung này. Artwork dùng glyph nguồn sẵn có, khung494×950 và footer đã khóa; không status bar giả. Đây là adaptation cần review, chưa pixel-perfect hoặc visual sign-off. Loading8s là fixture hữu hạn; lỗi không tự đổi thành success sau bấm retry. Không dùng mã lỗi giả mặc định.

HTTP/WMS và permission contract thật chưa có; read-only fixture không chứng minh backend authorization. Read adapter trong suite là mock. Chưa xác minh native hardware/screen reader/keyboard thiết bị thật. Không sửa dữ liệu kho hoặc replay mutation. P17–P24 chưa hoàn tất.

Mở [preview](http://localhost:8766/flows/auth-session/), đăng nhập `minhanh / preview` → xác nhận → **Chứng từ** → mở **P16 · Trạng thái dữ liệu · r01** ngoài khung app.
