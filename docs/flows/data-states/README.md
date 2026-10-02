# P16 — trạng thái nguồn danh sách

`model.mjs` quản lý một request đọc hiện hành: loading/ready/error, cache đúng context, abort/epoch và timeout12s. `read` là dependency của owner, nhận scope/filters/signal và trả dataset array hoặc Promise. Đây là giao diện nội bộ prototype, chưa phải contract HTTP/backend. `null`, reject, timeout, response sai cấu trúc không thành mảng rỗng. Không có API ghi, localStorage, timer retry hoặc pagination.

`view.mjs` cung cấp P16.S01–S04 và biến thể refreshing/stale. Owner P12 giữ header, search/type/date/count/sort, nav và routes tạo; không tạo module dữ liệu chứng từ thứ hai. `documents.mjs` dùng `mergeDocuments(getRecorded())` hiện có làm nguồn fixture mặc định. `readList` cho phép tiêm nguồn đọc vào cùng lifecycle. Hủy khi hide/dispose; cache không sống qua owner/phiên mới. Không cấp quyền đọc mới cho tài khoản bị Home từ chối.

Bộ chọn P16 nằm ngoài AppShell, hiện khi mở Chứng từ. Loading8s rồi trả dữ liệu; error tiếp tục lỗi khi retry cho đến khi nguồn đổi. Read-only fixture chỉ thu hẹp quyền tạo của owner P12, không sửa quyền phiên hoặc backend enum. Retry nguồn network nối `showSystem` P15, trả `{kind:'verified'}` chỉ sau response đọc hợp lệ; auth/forbidden dùng guard P15. Mã lỗi chỉ khi source có code, không hard-code HN-ERR-01.

Icon cloud là geometry nguyên văn `HEAD:node_modules/lucide-react/dist/esm/icons/cloud.mjs`, lucide-react1.31.0/ISC, cùng hệ dependency hiện có; document/plus/refresh nguyên văn `warranty-components/flow.js`. Xem `../auth-session/ICONS-LICENSE.txt`. Không trace ảnh hay tải icon ngoài.

Kiểm: `node --test tests/data-states.test.mjs`; `node scripts/check_p16.cjs`; `node scripts/check_p16_reads.cjs`. Suite reads tiêm adapter kiểm thử qua dependency `readList` bằng request interception; không sửa source production để chạy. Backend và native hardware chưa được kiểm chứng.

## r02 UX

Owner P12 gom tìm kiếm250ms, Enter ngay, chờ IME và hủy timer khi rời route. View có chip bỏ riêng query/type/date/status và CTA theo nguyên nhân. Retry giữ anchor ID/offset và focus; scan unavailable có giải thích trước khi nhập. Cache chỉ cùng scope/query; không timestamp giả. Kiểm bằng `node scripts/check_p16_ux.cjs`; evidence tại `handoff/P16/evidence/revision-02`.
