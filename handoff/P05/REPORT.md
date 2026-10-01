# P05 — Xuất kho: bàn giao prototype

Cập nhật: [Revision11 — audit tương tác thực và sửa3 lỗi popup có tái hiện](REVISION_11.md). Popup search không nhảy/co khi lọc, ArrowUp/Home/End/reveal đúng; giữ các luồng form/quét/P17 hiện hành.418/418 Node và13 nhóm browser PASS tại lượt kiểm tra; hình thức chờ user review.

Cập nhật29/09/2026: [Revision10 —6 nâng cấp thao tác được user yêu cầu](REVISION_10.md). Card giao hàng, progress luôn thấy, clear mã, quickedit, scanfilters/detail và guard reload/đóng tab. Xem bảng nguồn/before–after và kiểm chứng trong báo cáo; visual mới chờ review, không tự nghiệm thu.

Cập nhật mới nhất28/09/2026: [Revision09 — audit ổn định/focus/tải địa giới/request và UI chung](REVISION_09.md). Sửa4 lỗi được tái hiện cùng các trạng thái thao tác liên quan; giữ nghiệp vụ và chuẩn icon/shared picker. Node cuối195/195 PASS; xem báo cáo riêng cho bằng chứng browser và giới hạn integration.

Cập nhật mới nhất: [Revision08 — tinh gọn cụm địa chỉ theo vùng khoanh đỏ](REVISION_08.md). Bỏ copy/khối tham khảo/số thứ tự, căn lề/khoảng cách và màu form.7 nhóm browser,30 case popup PASS; visual chờ duyệt.

Cập nhật mới nhất: [Revision07 — popup nổi không đẩy form và địa chỉ tỉnh/quận](REVISION_07.md).130/130 Node,59 nhóm browser và kiểm API địa giới thật PASS; v1 có Quận/Huyện trước07/2025. WMS vẫn chưa tích hợp. Select trong luồng cuộn r06 được thay bằng popup neo ngoài bố cục.

Cập nhật mới nhất: [Revision06 — focus S01 và custom select đồng bộ template](REVISION_06.md),122/122 Node và44 nhóm browser PASS; visual chờ review. Native select r05 được thay bằng listbox có cùng nghiệp vụ chọn.

Cập nhật mới nhất: [Revision05 — khách vãng lai, select và planned1–99](REVISION_05.md), theo yêu cầu user27/09/2026. Phiếu mới mặc định1; bộ B05 planned10 vẫn chọn được. 122/122 Node,44 nhóm browser PASS. Những mô tả kế hoạch cố định10 bên dưới là lịch sử, được thay trong phạm vi yêu cầu này.

Cập nhật mới nhất: [Revision 04 — cải thiện UX nhập tay và màn quét](REVISION_04.md), theo yêu cầu user ngày 27/09/2026. 118/118 Node và 36 nhóm browser PASS; giao diện mới chờ review.

Cập nhật 27/09/2026: [Revision 03 — validation phone/trường và mã nhập tay](REVISION_03.md). 116/116 Node, 8 nhóm validation, 8 nhóm lifecycle và 12 nhóm hồi quy browser PASS. Thông tin tiến độ bên dưới là bàn giao ban đầu; checkpoint workspace P08 được giữ nguyên.

## Kết quả

Đã dựng đủ **P05.S01–S04**, nối Home → Xuất kho và Quét mã → Xuất kho. Source commit thực tế: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; target `prototype`, tại `docs/flows/outbound/`. Working directory: `C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp`. P04 được người dùng tạm chốt ngày 25/09/2026; chưa chuyển P06. Mọi thay đổi P01–P04/warranty có trước được giữ; không push/merge/deploy.

| Panel | Kết quả triển khai | Visual | Behavior | Integration |
|---|---|---|---|---|
| P05.S01 | Form một cột; kho từ phiên; phiếu/người nhận/nhóm từ fixture; điện thoại, địa chỉ bắt buộc; giữ kế hoạch 10 và ghi chú | FAIL / chờ duyệt khác biệt | PASS fixture | BLOCKED |
| P05.S02 | 8 lượt = 7 hợp lệ + 1 trùng; camera minh họa, nhập tay, danh sách mở rộng; trùng không tăng quantity | FAIL / chờ duyệt khác biệt | PASS fixture | BLOCKED |
| P05.S03 | 7/10, còn thiếu 3, nhóm SKU 5+2; không thể gửi; quay lại bổ sung đủ | FAIL / chờ duyệt khác biệt | PASS fixture | BLOCKED |
| P05.S04 | Chỉ mở sau đủ 10/10 và receipt đúng yêu cầu; chờ xử lý Web, chưa ghi sổ; nav Home dùng chung | FAIL / chờ duyệt khác biệt | PASS fixture | BLOCKED |

S03/S04 disposition **MIGRATED** theo HANDOFF: Gửi duyệt → Gửi phiếu lên Web; Chờ duyệt → Chờ xử lý trên Web. Không có Post/giảm tồn. Nhánh thiếu metadata/kế hoạch trong DEV_PROPOSAL không được bật.

## Kiểm chứng thật đã chạy

- `node --test tests/*.mjs tests/*.cjs`: **75/75 PASS**, gồm 12 test P05 và 63 test có trước. [Log](evidence/node-tests.txt).
- `node scripts/check_outbound.cjs`: **12 nhóm PASS**, không lỗi JS/không request ngoài localhost. [Kết quả](evidence/browser-results.json).
- `HOME_EVIDENCE_DIR=handoff/P05/evidence/home-regression node scripts/check_home.cjs`: **14 nhóm PASS**. PowerShell dùng `$env:HOME_EVIDENCE_DIR=...`.
- `DIALOG_EVIDENCE_DIR=handoff/P05/evidence/dialog-regression node scripts/check_dialogs.cjs`: **14 nhóm PASS**. Các selector test đã cập nhật vì P05 nay có màn thật và tools riêng. Những lần đầu lỗi selector test được sửa, kết quả cuối PASS.
- Browser P05 đã kiểm hồi quy P04: 12/11+1, gửi receipt, copy kết quả nhập còn đúng; kho dừng qua P03; logout/Back; danh tính PX-0004 giữ nguyên pending, không thay bằng PX-0005.
- Viewport CSS: 494×1000 (shell 494×950), 360×800, 430×932, 1440×900, 340×420; DPR1, zoom1, Arial. Kiểm không overflow ngang, footer trong khung, cuộn nội dung/nhập bàn phím/focus. Bàn phím OS và phần cứng thật NOT_RUN. [Số đo](evidence/render-metrics.json).
- `python handoff/P05/compare_reference.py`: B05 cung cấp **khớp byte với ảnh ở commit**. [Nguồn và checksum](evidence/baseline-comparison.json). Public gallery không truy cập được bằng công cụ web; đối chiếu index và git object local tại đúng commit, không đổi baseline.

## P05.A01–A05

| Ca | Bằng chứng / kết quả |
|---|---|
| A01 | PASS: 7/10 còn thiếu 3; duplicate không đổi accepted/planned; gửi disabled và handler chặn |
| A02 | PASS: record chỉ hiện chờ Web/chưa ghi sổ, inventoryDelta=0; không có nhãn đã xuất trên kết quả |
| A03 | PASS: nhập riêng HN12352, HN12353, HN12354 → 10/10; step4 chỉ sau receipt khớp request |
| A04 | PASS fixture: HN99999 mở P17.S02, giữ nguyên document/session/version và accepted; Quét mã khác quay lại và trả focus |
| A05 | PASS: gửi đúp một record; timeout/UNKNOWN khóa retry, giữ request; check receipt hoặc xác nhận chưa record trước retry cùng request |

Phụ thuộc P17.S02 được dựng trong P05 theo đúng phạm vi direct dependency; nguyên nhân/sản phẩm/phiếu liên quan chỉ từ fixture, chỉ hiển thị phiếu nếu nguồn cho đọc. Ba panel P17 còn lại chưa triển khai; chưa tuyên bố hoàn tất P17. P17.S04 mới là điểm nối đối chiếu, chưa hoàn tất màn đó.

## Visual và ảnh

- [Tổng quan actual bốn panel](evidence/P05-actual-overview.png) · [B05 bất biến](evidence/B05-reference.png).
- [S01 đối chiếu](evidence/comparison-S01.png) · [S02 đối chiếu](evidence/comparison-S02.png) · [S03 đối chiếu](evidence/comparison-S03.png) · [S04 đối chiếu](evidence/comparison-S04.png).
- [Đủ hàng trước gửi](evidence/P05-S03-complete.png) · [UNKNOWN](evidence/P05-unknown.png) · [P17.S02](evidence/P17-S02-from-P05.png).

Đã xem actual cả bốn panel và P17.S02. Giữ shell 494×950 và tỷ lệ preview như Home, header/footer cố định, nội dung dài cuộn trong. Không thêm status bar giả/caption vào app. Native crops chỉ để duyệt cạnh nhau, không resize méo hoặc tuyên bố pixel-perfect: tỷ lệ ảnh B05 và shell hiện tại khác nhau, chưa có ngưỡng duyệt pixel. Khác biệt còn lại: ảnh camera dùng kho sẵn có thay thùng barcode B05, SKU dùng icon thay ảnh sản phẩm, font/icon/border chưa xác minh giống tuyệt đối. Copy Web là thay đổi có chủ đích; counter ghi chú là 59/200 theo chuỗi thực thay 0/200 sai trong ảnh; thứ tự/thời gian mã quét phản ánh pipeline thật của fixture. Review còn hiện ghi chú đã giữ, có thể cuộn xem.

## File và thành phần

- Mới: `docs/flows/outbound/{index.html,outbound.mjs,outbound-flow.mjs,fixture-adapter.mjs,style.css,icons.mjs}`; `tests/outbound.test.mjs`; `scripts/check_outbound.cjs`; `handoff/P05/`.
- Sửa dependency: `docs/flows/home/home.mjs` mount/routing/cleanup; `docs/flows/auth-session/index.html` thêm CSS scoped; `docs/flows/shared/waiting-web.mjs` tham số outbound, mặc định inbound giữ nguyên; `scripts/check_home.cjs`, `scripts/check_dialogs.cjs` kiểm đường mới; `SCREEN_COVERAGE.csv`, `RUN_STATE.json`.
- Tái dùng shell/nav Home, P03 kho dừng, icon repo (Lucide ISC), ảnh kho approved, copy waiting-Web chung. Không đổi UI Home/P04 hoặc bundle dist/gallery.

## Giới hạn và cách nghiệm thu

Chưa có contract backend được duyệt cho tạo/đọc phiếu nguồn, metadata, validation tồn/trạng thái mã, record/status, quyền module; camera/đèn, P06/P12 thật chưa tích hợp. Không gửi dữ liệu fixture ra server. PX-0005 và thời gian gửi là mẫu, không phải server tự sinh. Dữ liệu trong bộ nhớ phiên, reload/đóng tab mất nháp. API/phần cứng/production **NOT_RUN**, integration **BLOCKED**, không suy PASS từ fixture.

Mở [preview](http://127.0.0.1:8766/flows/auth-session/), đăng nhập `minhanh` / `preview`, xác nhận phiên → Xuất kho. Ở Bước2 mở **Kịch bản kiểm tra P05** bên ngoài app, bấm **Nạp 7/10 + 1 trùng**. Kiểm tra phiếu để xem thiếu3; quay lại nhập tay từng `HN12352`, `HN12353`, `HN12354`, rồi kiểm tra/gửi. `HN99999` kiểm ngoại lệ; selector kết quả gửi kiểm timeout/từ chối/UNKNOWN. Sau kết quả đã xác định, Home → mở lại tạo lượt sạch khác ID; phiếu dở/đang gửi/UNKNOWN vẫn giữ nguyên.

Bước kế tiếp: người dùng nghiệm thu visual P05; bổ sung contract/API khi có. Không cần mở nhánh gửi thiếu để hoàn thành prototype hiện tại.


Cập nhật vòng đời lượt xuất: [Revision02](REVISION_02.md) — 77/77 Node, 8 nhóm lifecycle PASS; explicit new-attempt cho cả Home và picker.
