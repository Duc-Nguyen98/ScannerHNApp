# P01 r08 Kiểm tra tiếp vòng đời giao diện và phiên

Theo yêu cầu tiếp tục xử lý, lượt này kiểm các tình huống kết hợp ở P01, Khôi phục và điểm nối Home. Đã sửa năm lỗi có bằng chứng tái hiện. Không đổi CSS, SVG, artwork, footerLOCK hoặc nghiệp vụ; không mở rộng sang P05.

## Lỗi đã sửa

| Lỗi | Bằng chứng trước sửa | Khắc phục |
|---|---|---|
| Quyền hoặc kho đổi khi start đang chờ làm mất khóa đối chiếu | Bốn test với kết quả unknown/preview-ready và permission/warehouse đổi đều nhận startUnknown=false | Nếu nguồn không trả denied rõ ràng, giữ khóa đối chiếu. Không mở Home, không gửi lại sau khi quyền được khôi phục |
| Tải Home đã hủy vẫn gọi import ở microtask tiếp theo | Test reset ngay sau load ghi nhận importCalls=1 | Kiểm epoch trước khi gọi import; không chỉ kiểm sau kết quả |
| Tái xác minh phiên ghi đè tên màn hiện tại | P12 Chứng từ bị đổi document.title thành P02 sau pageshow mô phỏng | Router Home sở hữu tiêu đề; P01 không ghi đè khi Home đang hoạt động |
| Home giữ giờ ca cũ khi cùng người đăng nhập lại | Receipt mới21:33:38.223Z nhưng datetime hiển thị21:33:35.037Z | Cập nhật node time từ receipt hiện hành khi refreshKpis, không dùng giờ máy hay thay owner |
| Bấm nút lúc bàn phím mở không chuyển màn | 360×800→360×400, focus password, click Quên mật khẩu: vẫn login, focus forgot | Giữ input focus ở pointerdown nút trong form; submit/chuyển màn xử lý blur sau click. Không đổi Tab/Enter |

Đây là sửa hành vi theo contract đã có. Bảng đối chiếu nguồn: strict guard/UNKNOWN từ auth-flow; timestamp từ shiftStartedAt và test vietnam-clock; pointer/keyboard theo P01 r06; giữ visual P01 r07. Không tạo state/API production mới. CSS P01 và Home không bị sửa trong r08.

## Kiểm chứng

- Tám test mới tại `tests/auth-session-lifecycle-r08.test.mjs`. Lần tái hiện đầu:6test,5FAIL/1PASS; sau sửa và bổ sung kiểm clock/pointer đều đạt.
- Bộ auth/Home/clock tập trung:70/70đạt. Syntax và git diff --check đạt.
- Snapshot toàn repo cuối:655test,654đạt,1lỗi P05 được mô tả dưới đây; số test tăng có cả công việc đồng thời.
- Chín nhóm kiểm trình duyệt: tiêu đề P12 sau revalidation; hết phiên buộc xác nhận lại; cùng người trở lại Home; Forward recovery cũ không phục hồi form đã bỏ; giờ ca mới khớp receipt; khôi phục quyền sau UNKNOWN chỉ mở thông tin với startCalls=1; input vẫn thấy khi giả lập bàn phím; Quên mật khẩu mở được; submit mở đúng xác nhận phiên.
- Sau sửa clock: source và datetime cùng `2026-09-29T21:34:54.274Z`. Adapter/flow wrapper dùng để quan sát chỉ được thay response trong tab kiểm tra, không ghi credential vào evidence; đã gỡ interception và reload.
- Input tại viewport360×400: top332.88,bottom368.15. Giả lập viewport không thay thế kiểm bàn phím thật. Ca xoay long dialog sang844×390 giữ top9.85/bottom380.15; không cần sửa thêm.
- Browser tab API có lúc giữ title P14 sau Forward, nhưng DOM document.title là P01 và màn login đúng. Không sửa app theo riêng giá trị cache của công cụ.

## Phần ngoài phạm vi còn lỗi

Bộ test toàn repo chưa xanh. Chạy lại và chạy riêng đều tái hiện `tests/outbound-source-review.test.mjs:6`: test hardcode ID thứ4, nhưng OUTBOUND_SOURCES hiện có4nguồn (gồm b24-0004), vòng lặp đã tạo4phiếu nên lần tiếp theo là5. Đây là kỳ vọng test không còn khớp bộ fixture hiện tại; chưa phải bằng chứng UI P05 lỗi hoặc ID production sai. Không sửa nguồn/test P05 trong lượt này vì có công việc khác đang bổ sung dữ liệu. Tổng kết lần chạy lưu tại evidence/revision-08-lifecycle/node-tests-summary.txt.

## Giới hạn

Không tuyên bố toàn APP không lỗi, visual100%, backend hay thiết bị thật đạt. Không sửa code P03–P23 khác ngoài cập nhật time node trong Home. Auth/start/reconcile thật vẫn chưa tích hợp. Tình huống start race dùng adapter mô phỏng trong tab và tests, không gửi WMS. Ảnh `evidence/revision-08-lifecycle/after-race.png` minh họa trạng thái giữ khóa; `login.png` xác nhận nhận diện không đổi.
