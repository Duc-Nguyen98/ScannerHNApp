# P06 — rà lại lỗi sau nâng cấp

User yêu cầu rà kỹ và sửa lỗi UI/UX. Trước sửa:6/6 ca mới FAIL trong evidence/before-results.json; ảnh before-long-query/before-image-error. Target prototype4 panelP06 và dependencies trực tiếp; giữ baseline, footerLOCK,24board/91panel, source tiến độ hiện có.

| Phần | Nguồn | Cách sửa dự kiến |
|---|---|---|
|Hai điểm mở stock|User đã duyệt shortcut + baseline section stock|Marker focus phân biệt từng trigger; không bỏ section hoặc đổi số tồn|
|Double Back|User yêu cầu Back giữ context|Khóa chuyển bước trong lúc history.back chưa hoàn tất, không throttle bằng số giây tùy ý|
|IME/search|User đã duyệt Enter/IME; no lost text|Không commit input trong composition; commit compositionend, Enter sau đó mới mở|
|Query dài|HN-readable-content-v1|Dùng marker readable2 dòng + Xem đầy đủ; giữ nguyên query, không giới hạn/cắt chuỗi để chữa layout|
|Ảnh cuối/focus|Shared modal keyboard/focus contract|Nếu trigger vừa disabled thì focus nút chuyển còn dùng được/Đóng, không rơi ra nền|
|Ảnh lỗi|User duyệt lỗi đọc/retry tách empty|Thông báo nguồn ảnh ngay trong viewer, Thử tải ảnh lại; không báo tải được trước load|

Visual: giữ shell494×950, ảnh trước/sau494×1000,DPR1,Arial; chỉ query excerpt/ảnh-error state là adaptation theo pattern chung. Chưa coi test đạt là visualuser acceptance. Không push/merge/deploy.
