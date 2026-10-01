# P01 — Đăng nhập & Xác nhận phiên

## Tiếp tục xử lý r08

Đã sửa khóa UNKNOWN khi guard đổi trong request, import đã hủy, title module bị auth ghi đè, giờ ca cũ sau đăng nhập lại và click trượt lúc bàn phím mở. Không đổi CSS/icon/artwork/footer. Bộ tập trung70/70đạt,9nhóm browser đã kiểm; toàn repo còn lỗi test P05 hardcode thứ tự ID, chưa sửa ngoài phạm vi. [Chi tiết và giới hạn](REVISION_08_LIFECYCLE.md).

## Rà soát lại r07 · 2026-09-30

Sửa IME hủy bị kẹt, lifecycle Caps hint, Back recovery dư entry, UNKNOWN thiếu đường mở lại hướng dẫn, metadata/badge phiên bị cũ, reader tên kho dài, focus Home và dialog bị cắt do outer scroll. [Báo cáo r07](REVISION_07_AUDIT.md), [Review ảnh](REVIEW_07.html). 641/641 Node tại snapshot hiện hành, 6 test mới thuộc r07. Giữ LOCKED; hình thức nhánh mới chờ user review, chưa xác minh thiết bị/backend thật. Không suy audit P01 thành toàn bộ hệ thống đã hết lỗi.

## UX r06 — sáu đề xuất được yêu cầu triển khai · 2026-09-30

Đã bổ sung bàn phím Next/Go, Caps Lock/giữ selection, hướng dẫn xác nhận phiên, lazy-load Home/retry không start lại và phục hồi caller P14. Vùng bấm P01 dùng chung priority-touch đang được bổ sung đồng thời, giữ mã của công việc đó; không nhận phần shared là code của r06. Giữ artwork, màu, SVG, header/footer; không sửa board gốc. [REVISION_06_UX.md](REVISION_06_UX.md), [nguồn thay đổi](REVISION_06_CONTEXT.md), [ảnh trước–sau](REVIEW_06.html). 10 test mới; bộ test hiện tại 633/633 và 19 quan sát browser đạt; 8 layout không tràn ngang. Hình thức mới chờ user review; backend/thiết bị thật chưa xác minh.

## Audit ổn định 2026-09-28 — P01 r05

Đã sửa fail-closed session payload/permission, guard sau await, xử lý adapter exception, xóa mật khẩu khi reset cùng màn, P14 intent replay và khóa mắt khi submit; copy Home được cập nhật theo tích hợp hiện hành. CSS/icon/ảnh giữ nguyên. [REVISION_05_STABILITY.md](REVISION_05_STABILITY.md) có phương án, phạm vi, 7 test tái hiện trước sửa,195/195 Node sau sửa và20 quan sát browser. Đề xuất lazy-load Home/UX mới chưa triển khai vì cần phối hợp source đang sửa đồng thời và xác nhận UI. Không kết luận production hoặc toàn hệ thống đạt.

## Cập nhật revision04 — background header

Đã xác minh background cả2 màn vẫn hiện và asset tải200. Ảnh bàn giao revision03 chỉ chụp card nên cắt header; không phải background bị xóa. Đã bổ sung [ảnh đăng nhập đầy đủ](evidence/revision-04/S01-full.png), [ảnh xác nhận đầy đủ](evidence/revision-04/S02-full.png) và đưa preview về đầu trang. Màu/icon người dùng vừa xác nhận được giữ nguyên, không sửa app. Chi tiết [REVISION_04.md](REVISION_04.md).

## Cập nhật hiện hành — revision03: màu và độ đậm icon

Đã sửa theo phản hồi màu/icon nhợt: chuyển sắc xanh cyan về xanh dương sâu hơn, tăng stroke icon trong card, tăng độ rõ khiên/kho/status/Play/logout. Không đổi bố cục/geometry, hero/logo hoặc JS. [REVISION_03.md](REVISION_03.md) · [Ảnh card mới](evidence/revision-03/confirmation-card.png) · [Ảnh login mới](evidence/revision-03/login-card.png). 27/27 regression tests PASS; tab preview đã tải lại. Visual toàn P01 vẫn FAIL vì các khác biệt LOCKED khác chưa xử lý; integration vẫn BLOCKED. Các phần phía dưới lưu lịch sử revision02/lần đầu.

## Trạng thái hiện hành — revision02 sau phản hồi khoanh đỏ

**Đã sửa phần bố cục/icon có nguồn theo xác nhận người dùng. Visual toàn P01: FAIL (còn khác LOCKED); behavior fixture: PASS; integration production: BLOCKED. Không đạt100%.**

Nguồn/đo đạc/quyết định/kết quả mới nhất: [REVISION_02.md](REVISION_02.md). [S01 actual](evidence/revision-02/P01-S01-438.jpg) · [S02 actual](evidence/revision-02/P01-S02-438.jpg) · [So sánh S02 baseline/actual](evidence/revision-02/comparison-S02.png). 27/27 tests cấu trúc/hành vi/hồi quy PASS; không phải chứng nhận giao diện LOCKED. Hero/logo và font/texture vẫn chưa khớp; không tự thay khi thiếu nguồn.

Đính chính: trước đây dùng cùng arrow cho Play/logout/chevron và suy asset approved là phù hợp B01 là sai; việc ghi BLOCKED không thay thế FAIL cho khác biệt nhìn thấy. Source Lucide có trong Git tree giúp sửa6 loại icon, không phải tất cả icon đều thiếu như nhận định ban đầu. Capture cũ S01/438 có scroll lệch nên bị loại khỏi bằng chứng tương đương; bộ revision02 kiểm tra đầu trang trước capture.

Phần dưới là **báo cáo lần đầu được giữ làm lịch sử**, không ghi đè kết luận revision02 ở trên.

---

**Kết quả lần đầu (đã bị revision02 đính chính): đã triển khai cả hai panel ở mức prototype; hành vi fixture PASS; visual và integration từng ghi BLOCKED.**

## Context / source

- Contract v2.0, yêu cầu P01/24. [Context chung](../CONTRACT_CONTEXT.md); [số đo và nguồn trước code](CONTEXT.md).
- `source_commit=da9f623a19d0359c3e80c14f8cc612636ec6ab78`; repo `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`; `target_kind=prototype`.
- Source production/manifest/auth không tìm thấy trong target đã audit; có gallery và prototype editable. Không sửa dist hoặc dùng minified build làm source.
- File có trước được giữ: `docs/flows/warranty-components/flow.js`, `tests/warranty-component-history.test.cjs`; hồ sơ chuỗi5 ở `../contract-work` không bị ghi đè.
- Gallery live đã chọn Tất cả24, xác minh đúng board đầu. Không lấy gallery22 làm danh mục. [Baseline gốc](../../design/01_Main/BOARDS/00_LOCKED_ORIGINALS/01_Dang_nhap_va_Xac_nhan_phien_ORIGINAL.jpg).

## Chạy thử

Từ repo: `python scripts/serve_preview.py`, mở <http://127.0.0.1:8766/flows/auth-session/>. Fixture công khai: `minhanh` / `preview`; không nhập mật khẩu thật. Mở “Kịch bản kiểm tra” phía dưới để chọn thiếu quyền/kho dừng/danh tính khác/UNKNOWN/hết phiên.

Lệnh `python -m http.server ...` ban đầu trả `.mjs` là `text/plain` trên Windows này, khiến module không chạy; đã xử lý bằng server preview có MIME JavaScript rõ ràng. Server chỉ bind localhost. Không có build/lint/typecheck production configured; không cài npm hoặc bịa lệnh build.

## Coverage

| Panel | UI/visual | Behavior | Integration |
| --- | --- | --- | --- |
| P01.S01 | Form, hero, eye, quên mật khẩu, quyền/footer đã dựng; BLOCKED exact visual | PASS fixture: preserve credentials, lỗi, submitting/single-flight, focus, P14 pending | BLOCKED auth/recovery thật |
| P01.S02 | Session identity, kho/status, start/logout đã dựng; BLOCKED exact visual | PASS fixture: guard quyền/kho, expire, UNKNOWN, logout/Back, P02 pending | BLOCKED phiên/ca/revoke thật/P02 |

[State acceptance](STATE_ACCEPTANCE.csv) ghi 16 state/ca phụ. [SCREEN_COVERAGE.csv](../../SCREEN_COVERAGE.csv) có đủ91 panel; P01=2 đã triển khai, 89 panel khác NOT_STARTED trong chuỗi24 mới. Không gán P20 PASS từ hồ sơ cũ. [RUN_STATE.json](../../RUN_STATE.json) giữ P01 để tiếp phần bị chặn.

## Nghiệm thu P01.Axx

| Ca | Kết quả thật | Bằng chứng |
| --- | --- | --- |
| A01 | Checksum PASS; đã crop/đối chiếu cả hai; visual acceptance BLOCKED | [checksum/crop metadata](evidence/baseline-comparison.json), comparison-S01/S02 bên dưới |
| A02 | PASS trong prototype: mắt không đổi `Abc 123  ` kể cả hai dấu cách cuối; sai thông tin không vào Home; login/start single-flight | [browser](evidence/browser-results.json), [22 tests](evidence/test-output.txt) |
| A03 | PASS trong prototype: Minh Anh và Lan Nguyễn lấy từ adapter; logout rồi Back/ép hash không vào màn bảo vệ | browser-results; production session invalidation BLOCKED |
| A04 | PASS phần web focus/responsive, không status bar giả; input và CTA tiếp cận được bằng Tab ở360×400; keyboard thiết bị thật NOT_RUN | [keyboard](evidence/keyboard-360x400.png), render-metrics/browser-results |
| A05 | PASS fixture: thiếu quyền/kho dừng khóa CTA và controller; UNKNOWN khóa start retry và không success; expire về login | browser-results và unit tests; guard/backend thật BLOCKED |

12 unit tests P01 +10 tests history có trước = **22 PASS /0 FAIL**. `node --check` cả3 module và `git diff --check` exit0. Git chỉ cảnh báo LF/CRLF ở flow.js có trước. [Lệnh/kết quả](evidence/test-output.txt).

## Actual / đối chiếu

Reference diagnostic438×834 CSS px suy từ crop B01, không phải thiết kế viewport production đã được xác minh. Capture bằng Chromium trong Codex, DPR đo khoảng1.000000015, zoom visualViewport=1, font Arial hệ thống, fixture mặc định; không animation. Có fractional CSS metrics do host. Đã đồng bộ browser viewport và device metrics; loại ảnh capture trung gian sai tỷ lệ khỏi bằng chứng cuối bằng chụp lại, không resize ảnh để làm khớp.

- [S01 actual438](evidence/P01-S01-438.png) · [S02 actual438](evidence/P01-S02-438.png)
- [S01 baseline/actual cạnh nhau](evidence/comparison-S01.png) · [S02 baseline/actual cạnh nhau](evidence/comparison-S02.png)
- [S01 360](evidence/P01-S01-360.png) · [S02 360](evidence/P01-S02-360.png)
- [S01 430](evidence/P01-S01-430.png) · [S02 430](evidence/P01-S02-430.png)
- [S01 desktop1440](evidence/P01-S01-1440.png) · [S02 desktop1440](evidence/P01-S02-1440.png)
- [Số đo render](evidence/render-metrics.json): 8 captures/4 viewport, không horizontal overflow. Mobile360 nội dung dài hơn viewport, cuộn tự nhiên; desktop căn giữa content area, không layout tablet mới.

`compare_reference.py` chỉ tạo crop/chẩn đoán, không sửa baseline/assets và không stretch actual/reference. SHA256 B01 đính kèm và ảnh gốc trước/sau đều `260e483a6447af2fb84cd5c1a5c5f5d75bd1a756ec6e37d69e0743aea5bd5853`. Không có ngưỡng nghiệm thu pixel/DPR/font gốc, không tính % rồi tự PASS.

## Sai khác / correction map

- Cấu trúc, nội dung cố định, vị trí hero/card/CTA được giữ theo đo estimated. Actual438: card S01 y285/h463 so với estimated y285/h470; S02 y276/h487.6 so với estimated y276/h482. Chênh lệch typography/crop cần review, không redesign baseline.
- Logo scan có sẵn thay logo original chưa có file; info thay user; lock thay shield; glyph font `◉` thay mắt; arrow thay play/logout/chevron. Đây là **fallback được ghi nhận, không phải bộ icon original đã đạt**. Không thêm SVG tự vẽ/tracing/icon bên ngoài. Các SVG source có sẵn được tái sử dụng nguyên path.
- Asset kho/nhân sự trong pack được duyệt nhưng nhân sự close-up khác B01. Không thể tái tạo bố cục người nhỏ phía phải chỉ bằng crop; không sinh ảnh thay baseline. Font original UNKNOWN; Arial fallback khác font raster gốc. Avatar nền phẳng thay texture chưa có asset.
- Copy cố định giữ nguyên ý/text tiếng Việt; tên MA/Minh Anh chỉ fixture. Không thêm OTP/2FA/social login, kho khác, API hoặc thông báo thật.

## File mới / ranh giới tích hợp

`docs/flows/auth-session/{index.html,style.css,app.mjs,auth-flow.mjs,fixture-adapter.mjs}`; `tests/auth-session.test.mjs`; `scripts/serve_preview.py`; handoff/context/report/evidence; root coverage/checkpoint. Sparse checkout chỉ materialize4 asset đúng repo đã tồn tại, không sửa bytes hoặc tải font/icon mới.

Fixture ở namespace `hn-scanner-auth-preview-v1`, in-memory; không localStorage/token thật/network auth. `hn-scanner-preview:navigation` chỉ là sự kiện local PROPOSED nối P02/P14: target + context không chứa password/token. Không đồng nghĩa API/route production được duyệt. Start thành công fixture dừng ngay điểm pending P02, không thông báo “ca thật đã bắt đầu”. UNKNOWN không retry mù; chưa có cơ chế đối chiếu backend nên vẫn chặn.

## Những gì cần để đóng P01

1. Source app/auth adapter và contract hiện hành cho credential normalization, auth/session/revoke/start/reconcile; route P02/P14 và quyền/kho từ backend. Không cần quyết định API NFC ngoài phạm vi.
2. Logo/icon/font gốc và asset/crop chính xác B01 (hoặc chỉ thị rõ xử lý sai khác tài nguyên). Không yêu cầu duyệt lại bố cục original đã khóa.
3. Thiết bị/điều kiện capture và keyboard thật để kiểm platform; visual gate không được coi PASS từ fixture.

Không push/merge/deploy, không thay gallery, không sửa ảnh gốc. UI và behavior độc lập đã làm đủ cả2 panel; tiếp P01 khi có nguồn còn thiếu.
