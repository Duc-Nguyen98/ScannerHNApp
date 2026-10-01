# P06 — sản phẩm vừa xem và khoảng ngày nhanh

Đã triển khai đề xuất3 và5 được user yêu cầu áp dụng30/09/2026. **Visual: AWAITING_USER_REVIEW. Behavior: PASS_PROTOTYPE theo các ca dưới. Integration: chưa kết nối production.** Giữ4panelP06,24board/91panel,494×950 và footerLOCK.

## Thay đổi

- Khi query trống, nhóm **Vừa xem** hiển thị tối đa3 hàng, mới nhất trước. Hai danh mục Sản phẩm/Linh kiện có danh sách riêng. Chỉ giữID trong bộ nhớ, theo authSessionId/actor/kho; logout/dispose hoặc scope đổi xóa lịch sử gần đây. Không cólocalStorage/API/lưu bền.
- Tên, ảnh, mã và chi tiết luôn lấy từ nguồn đọc hiện tại; không nhớ bản sao tên/tồn/serial. Nguồn lỗi thì nhóm gần đây ẩn, lỗi đọc vẫn phân biệt với không có kết quả. Bấm hàng thường/gần đây/Enter và pickerNFC cùng đi qua một đường kiểm nguồn+ID+category+kho. Nguồn lỗi/mất dòng/chi tiết không khớp không mở hoặc chọn; thông báo dùng dialog chung. Deep link cũng không mở chi tiết khi nguồn chưa xác minh.
- Hàng vừa xem mở lại trong1lần chạm, Back giữquery/category/cuộn và đúng hàng focus. Count bên dưới vẫn chỉ số kết quả nguồn đã tải, không cộng trùng nhóm gần đây. Tên dài wrap trong scroller, không cắt string nguồn hoặc lồng button.
- Lịch sửP06 opt-in `quickRanges:true` của bộ chọnP08: **Hôm nay /7ngày /30ngày /90ngày**. Chỉ sửa draft; **Áp dụng** mới lưu. Hủy/Escape/Back giữ bộ lọc cũ; Đặt lại về hôm nay/Tất cả; Hôm nay trong lịch con chỉ điều hướng tháng.
- Sửa một lệch contract đã tồn tại: initial filtersP06 còn hardcode mẫu01–09/09; nay mặc định **Tất cả ngày**, đúng chốt toàn hệ thống. Không đổi36giao dịch/nguồn/tổng tồn hoặc giới hạn chọn90ngày Việt Nam.

## Nguồn hình thức và review

[DESIGN_TRACE.md](DESIGN_TRACE.md) và [REVIEW.html](REVIEW.html) phân biệt B06/component đã có, user-change và adaptation. Nguồn trước sửa lưu nguyên tại `source-before/`; ảnh trước ở `before/`, ảnh sau cuối ở `final-touch/after/` cùng viewport494×1000/360×800,DPR1,clock30/09/2026 và chuỗi tương tác.

Nhóm Vừa xem là bố cục mới trong phạm vi đề xuất, chưa có rasterDesigner để gọi pixel-perfect. Nó tăng vùng cuộn của danh sách; header/nav giữ nguyên, không ép toàn bộ danh sách vào khung hoặc che thẻ để hếtcuộn. Ảnh sau cũng gồm touch controls của taskcha, được triển khai đồng thời trong phạm vi đề xuất1; P06 không sửashared CSS.

## Kiểm chứng

| Bộ kiểm tra | Kết quả / evidence |
|---|---|
|`node --test tests/lookup.test.mjs tests/lookup-recent.test.mjs`|**23/23 PASS**, [node-tests.txt](node-tests.txt).9ca mới gồmMRU/scope/current source/deleted/error/exactID/guard/open/default.|
|`node --test tests/history-ux.test.mjs`|**4/4 PASS**, [history-policy-node.txt](history-policy-node.txt).KhoảngNngày tính cả hôm nay, nửa đêmVN,năm mới,nămnhuận/90ngày.|
|`scripts/check_lookup_recent_upgrade.cjs`|**10/10 nhóm PASS**, [final-touch/after/results.json](final-touch/after/results.json).Query/category/IME/MRU/focus/error/retry/default/filterApply/Cancel/Back/reset/6viewport/P10logout/login/NFCpicker exactID.|
|`scripts/check_lookup_recent_edges.cjs`|**2/2 nhóm PASS**, [recent-edges/results.json](recent-edges/results.json).Mock response trongbrowser cho tên nguồnUnicode/newline/2000+từliền;3viewport, footer ổn định,ảnh lỗi giữ ô40px. Không sửafixture nguồn.|
|`scripts/check_lookup_ux_upgrade.cjs`|**10/10 nhóm hồi quy PASS**, [lookup-regression/results.json](lookup-regression/results.json).Gallery/stock/history/datevalidation/sourceerror/focus/footer/logout. Chỉ cập nhật selector nguồn list để phân biệt hàng recent cùngID.|
|`scripts/check_warranty_navigation.cjs`|**11/11 nhóm PASS**, [warranty-regression/navigation-results.json](warranty-regression/navigation-results.json).Caller/intake/tab/draft/serial/UNKNOWN/request/version/BackForward/logout.|

Tổng riêng bàn giao này: **27 Node, 33 nhóm browser**, không có pageerror ở các suite cuối. 27 Node có thể trùng với workspace suite của task cha, không cộng chồng. Geometry PASS không đồng nghĩa nghiệm thu visual; production/camera/NFC thật vẫn NOT_RUN.

Bộ mới 10 nhóm đã được chạy lại sau thay đổi cuối của task cha cho vùng bấm nút Bộ lọc lịch sử/Xóa bộ lọc; kết quả và ảnh hiện tại ở `final-touch/after/`. Lần chạy lại đạt 10/10, không cộng thêm vào tổng 33 nhóm. Hash nguồn gồm cả `shared/priority-touch.css` và `.mjs` để nhận diện đúng snapshot hình thức đã kiểm.

Lầnchạy đầu `after/failure.json` là lỗi test harness yêu cầu confirm trên nút **Đăng xuất fixture** ngoài app trong khi đường đó hiệnlogout trực tiếp. Nguồn sản phẩm không đổi để ép test; bộkiểm được chuyển sang nút **Đăng xuấtP10** thực tế và xác nhận đúngdialog. Log cũ giữ nguyên; chỉ `final-touch/after/results.json` là bộkiểm cuối. `verified-02/03` là checkpoint trước chỉnhadapterselector placeholder; không dùng thay kết quảcuối.

## File và giới hạn

- Mới: `docs/flows/lookup/recent-items.mjs`, `tests/lookup-recent.test.mjs`, `scripts/check_lookup_recent_upgrade.cjs`, `scripts/check_lookup_recent_edges.cjs`, evidence/report này.
- Sửa: `docs/flows/lookup/lookup-flow.mjs`, `lookup.mjs`, `style.css`; selector trong `scripts/check_lookup_ux_upgrade.cjs`.
- Không cần sửa Home integration: mountLookup đã được dispose tronglogout; bộnhớ bổsung còn tự kiểmauthSessionId/actor/kho.
- Không thayAuth/shared/P07/P09source,footer,baseline,dist/gallery,RUN_STATE/coverage. Taskcha cập nhậttracking chung. Khôngpush/merge/deploy.
- Backendcatalog/authorization thật chưa cócontract. Missing từ nguồn đã tải không được gọi làđãxóa trênserver; sourcepartial vẫn giữ nghĩa đó. Reload cũng xóa recent trong bộnhớ nhưlogout; không hứa khôi phụcphiếudở.
