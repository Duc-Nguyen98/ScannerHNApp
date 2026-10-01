# P07 r11 — Rà soát ổn định và đồng bộ UI/UX

28/09/2026. Phạm vi cuộc trao đổi: rà P07 và các điểm nối Home/P03/P06/chuẩn icon chung. Workspace hiện có công việc P08/P09 và các sửa P04/P05 từ luồng khác; giữ nguyên checkpoint và các thay đổi đó. Không coi báo cáo này là nghiệm thu mọi module.

## Lỗi đã sửa

1. Đối chiếu UNKNOWN nhận failed/denied/conflict/locked/already-linked nhưng cờ UNKNOWN không được gỡ, khiến khóa thao tác kéo dài. Nay chỉ kết quả đã xác định mới mở đường phục hồi; UNKNOWN tiếp tục giữ request.
2. Nút đối chiếu và đường vào NFC bị chặn bởi điều kiện ghi kho. Nay phiên hợp lệ có thể xem/đối chiếu khi kho dừng; tạo liên kết vẫn kiểm kho/quyền ở handler. Không thêm capability/API mới. P01 start và quyền phiên vẫn giữ guard.
3. Mở lượt mới sau thất bại đã xác định còn mang request/read cũ. Nay begin từ danh sách reset lượt; retry tại bước xác minh vẫn dùng request cũ. Busy/UNKNOWN được giữ nguyên.
4. Lưu về muộn khi người dùng đã Back tới danh sách có thể kéo màn về Hoàn tất. Nay cập nhật receipt/mapping nhưng không cướp màn danh sách. Khi người dùng vẫn ở bước xác minh, receipt hợp lệ mới mở Hoàn tất.
5. Tăng kiểm chứng receipt: actor.id bên trong phải khớp actorId của phiên; reconcile về muộn sau đổi actor/kho không được chấp nhận hoặc xóa UNKNOWN.
6. Tìm NFC theo mã sản phẩm và chữ Đ viết hoa; không tái dựng input trong lúc IME đang composition, giữ quá trình gõ dấu. Reset cờ composition khi rời module.
7. Nút chọn sản phẩm thực sự disabled trong lúc đọc/UNKNOWN, bên cạnh guard handler.
8. Sao chép UID có thông báo thành công/thất bại trong app, chỉ một vùng status được cập nhật. Không chèn lặp thông báo hoặc cập nhật DOM đã đóng khi clipboard trả muộn.
9. Khi lỗi mới xuất hiện sau cuộn, đưa vùng nội dung về đầu để thấy phản hồi; cuộn bình thường/bộ lọc danh sách vẫn được giữ theo luồng hiện có.

## UI/UX và phương án nâng cấp

Đã áp dụng các cải thiện thao tác nhỏ ở trên. Giữ toàn bộ CSS/geometry P07 r10, artwork B07, infinite waves, layering và reduced-motion. Không thiết kế lại màn đã duyệt.

Chuẩn icon từ `shared/UI_STANDARD.md` và `operation-icons.css` được giữ: NFC tím pastel, metadata trung tính, severity/success riêng. Kiểm chéo Home/P03/P04/P05/P06/P07/history hub đạt; không tô lại artwork/ảnh sản phẩm.

Đề xuất bước sau: chỉ mở rộng bộ lọc NFC khi có tiêu chí nghiệp vụ được chốt; khi có nguồn production, nối capability/đọc NFC/đối chiếu vào adapter và kiểm thiết bị thật. Không thêm API/quyền/field hoặc giả lập sản phẩm production để che các chỗ chưa có contract. Không cần thay bố cục hiện tại để sửa các lỗi tìm thấy.

## Kiểm chứng

- **195/195 Node PASS** tại snapshot lần chạy cuối: [node-tests-final.txt](evidence/revision-11/node-tests-final.txt). Thêm6 ca model P07 và1 ca route Home. Số test toàn repo tăng trong lúc có công việc khác; đây là kết quả tại thời điểm log, không phải toàn bộ195 test do revision này thêm.
- **11 nhóm NFC PASS**: danh sách/search/tab, dialog/focus/clipboard, đọc/xác minh/receipt, picker P06, lỗi/UNKNOWN, kho dừng, Back/Forward, chuỗi dài, logout. [Kết quả](evidence/revision-11/nfc-isolated/browser-results.json).
- **4 nhóm repeat PASS**:5 mã liên tiếp, thay UID, UNKNOWN giữ request, chuỗi dài/cuộn cuối. [Kết quả](evidence/revision-11/repeat-final/results.json).
- **5 nhóm ổn định mới PASS**: IME tổng hợp, clipboard bị từ chối/retry, busy/read + Back trong khi lưu, đối chiếu khi kho dừng, lỗi sau khi cuộn. [Kết quả](evidence/revision-11/stability/results.json). IME được kiểm bằng CompositionEvent, chưa là kiểm bộ gõ/thiết bị thật.
- **33 ảnh alignment PASS**,6 viewport,4 panel +read states/dialog/stress; [metrics](evidence/revision-11/alignment/metrics.json).
- **14 nhóm Home PASS**, [kết quả](evidence/revision-11/home/browser-results.json).
- **6 nhóm chuẩn icon chung PASS**, [kết quả](evidence/revision-11/system-icons/system-icon-results.json).
- Đã xem S02 và dialog sau sao chép. Các bộ browser trên không ghi nhận pageerror ở lần đạt cuối.

Các lượt đầu trên preview8766 gặp timeout login/mất kết nối; bằng chứng lỗi được giữ tại baseline/nfc/nfc-final. Dùng server audit riêng8777 cùng source để tránh gián đoạn từ preview dùng chung; script hỗ trợ PREVIEW_ORIGIN, mặc định vẫn8766. Không bỏ assertion/retry âm thầm để ghi PASS. Không chỉnh server preview trong revision này; source server đã có thay đổi từ công việc khác.

Test snapshot P08 từng đóng băng hash toàn file nfc.mjs của r10; cập nhật hash sau sửa P07 đã được user yêu cầu. Hash baseline B08, fixture history và CSS P07 giữ nguyên. Test route kho dừng đổi kỳ vọng riêng NFC thành route xem/đối chiếu, bổ sung ca xác nhận quyền phiên và guard ghi vẫn được kiểm.

## Bàn giao

Visual: giữ bố cục đã duyệt; phản hồi mới chờ user xem. Behavior: PASS fixture trong phạm vi trên. Integration: BLOCKED/NOT_RUN cho API/capability/NFC thật; không tuyên bố ổn định production.

Files chức năng: nfc/nfc.mjs, nfc/nfc-flow.mjs, nfc/fixture-adapter.mjs, home/home.mjs, home/home-flow.mjs. Tests: nfc/home/history/scanner-dialogs và script stability; các script hồi quy thêm origin override để lưu evidence riêng. Giữ91 panel, không sửa baseline/dist/gallery, không push/merge/deploy.
