# FINAL — Nối luồng ScannerHNApp và xuất bản Public UI/UX Preview

Chạy sau khi thực hiện P01–P24. File `00_CONTRACT_CHUNG.md` là contract chung, có thể được người dùng gọi tắt là P00. FINAL là bước tích hợp và phát hành preview theo yêu cầu bổ sung; không đổi phạm vi 24 board hay tạo board thứ 25.

## Đầu vào

- Contract chung: `00_CONTRACT_CHUNG.md` phiên bản 2.0.
- Source kết quả thực thi P01–P24 trong workspace/repo, các thay đổi chưa commit có liên quan, fixture đã thiết lập và asset đã duyệt.
- `BOARD_INDEX.csv`, `SCREEN_COVERAGE.csv`, `RUN_STATE.json` và `handoff/P01` đến `handoff/P24` nếu đã có.
- Repo mục tiêu: https://github.com/Duc-Nguyen98/ScannerHNApp
- Gallery tham chiếu: https://duc-nguyen98.github.io/ScannerHNApp/

Không yêu cầu tôi đính lại 24 prompt/ảnh nếu chúng đã đọc được trong workspace. Nếu chỉ có bộ prompt mà chưa có code đã thực thi, báo đúng phần thiếu; không coi tài liệu hoặc gallery ảnh là app đã hoàn thành.

## Nhiệm vụ được giao

Bạn là Frontend Integration Lead phụ trách bản UI/UX review của ScannerHNApp. Hãy thực hiện nối luồng, chuẩn hóa dữ liệu mẫu liên màn, kiểm tra và xuất bản một bản preview online công khai để DEV, Test và QA/QC có thể mở link và đánh giá trực tiếp.

Tôi cho phép thực hiện commit/push/deploy các thay đổi cần thiết cho bản preview này trong repo/môi trường preview đã nêu bằng quyền truy cập hiện có. Chỉ đưa các file liên quan vào commit; tuân thủ branch protection và quy trình triển khai hiện hành, không force-push hoặc sửa production. Đây là yêu cầu xuất bản preview bổ sung cho điều khoản contract chỉ deploy khi được yêu cầu. Không tự gửi tin nhắn hay mời thành viên.

Giữ baseline đã khóa và nghiệp vụ đã chốt. Không dựng lại toàn bộ, đổi framework, thay toàn bộ token hoặc redesign các màn đã đạt. Sửa lỗi tích hợp và hoàn thiện các thiếu sót trong phạm vi 24 board; không mở module mới. Nếu quyền hoặc quyết định nghiệp vụ còn thiếu, làm hết phần độc lập rồi báo đúng blocker.

## 1. Xác nhận bản thực thi cần tích hợp

- Đọc hướng dẫn dự án, git status, source entrypoint, build/deploy config và báo cáo đã có. Xác định source hiện hành, branch/commit và target prototype hay app thật. Không checkout bản snapshot cũ đè lên công việc mới.
- Đối chiếu đủ P01–P24 và 91 panel tham chiếu trong coverage; giữ panel MIGRATED với trace. Đây không phải 91 route bắt buộc hoặc tổng state runtime.
- Lập danh sách ngắn lỗi cần xử lý: route thiếu, nút chưa nối, context bị mất, fixture lệch, state không mở được. Ưu tiên thực thi, không dừng sau kiểm kê/kế hoạch và không quét lại toàn repo khi bằng chứng đã đủ.

## 2. Nối luồng thành app tương tác liên tục

Nối các điểm vào/ra, Back/Home, tab, modal, filter và CTA theo quyền/nghiệp vụ hiện hành. Giữ đúng document ID, case ID, serial, SKU/BOX quantity, scan session và trạng thái khi chuyển màn. ID không tồn tại phải ra state phù hợp, không tự mở phần tử đầu tiên.

Kiểm tra tối thiểu các hành trình sau; các state còn lại vẫn được truy cập qua bộ chọn review ở phần 4:

| Hành trình | Kết quả bắt buộc |
|---|---|
| Đăng nhập demo → Xác nhận phiên → Home → Cá nhân → Đăng xuất | Đúng trạng thái phiên mô phỏng; không dùng tài khoản thật; giữ nguyên thiết kế các màn đã khóa. |
| Home → Nhập kho → Quét → Kiểm tra → Gửi phiếu → Lịch sử/Chứng từ | Chờ xử lý trên Web; chưa ghi sổ; không đổi tồn hoặc xuất hiện action duyệt/Post nhập kho trên App. |
| Home → Xuất kho → Quét → Kiểm tra → Gửi phiếu → Lịch sử/Chứng từ | Đúng quy tắc số lượng và trạng thái chờ Web; không tự cho phép gửi thiếu nếu chưa chốt. |
| Tra cứu → Sản phẩm → Vị trí/tồn → Lịch sử | Cùng đối tượng và dữ liệu nhất quán, theo quyền đọc. |
| NFC → Đọc/nhập mã mô phỏng → Xác minh/liên kết → Lịch sử NFC | Phân biệt đọc UID, mapping và event; thể hiện conflict, không ghi đè liên kết tùy ý. |
| Bảo hành → Hồ sơ → Xuất linh kiện → Quantity → Kiểm tra → Post mô phỏng → Lịch sử | Chỉ ledger POSTED của đúng case; fixture chuyển trạng thái theo nghiệp vụ; không áp chờ Web cho linh kiện. |
| Phiếu linh kiện đang làm → Tiếp tục → Đối chiếu/UNKNOWN → Kiểm tra kết quả | Giữ định danh và mã đã ghi nhận; không resend mù hoặc tạo phiếu trùng. |
| Home/Xem tất cả → Hub lịch sử → NFC/Bảo hành/Phiên quét → Chi tiết | Đúng ID, filter, load-more và Back; lịch sử không phát sinh chỉ từ current status. |
| Thông báo → Chứng từ; Tệp → Viewer; Bảo hành → Bàn giao | Đúng context; phần proposal được đánh dấu riêng; không thực hiện nghiệp vụ chưa chốt như thật. |
| Mất mạng/lỗi/quyền hạn/kho tạm dừng/hồ sơ đã trả khách | Guard và recovery hoạt động; không chỉ ẩn nút trong khi handler/deep link vẫn cho ghi. |

## 3. Giữ và đồng bộ toàn bộ dữ liệu mẫu đã thiết lập

- Kiểm kê và tái sử dụng fixture hiện có, giữ ID, nội dung, ảnh và quan hệ đã dùng. Không xóa về danh sách rỗng, thay bằng vài dòng Lorem ipsum hoặc sinh lại ngẫu nhiên mỗi lần render.
- Tạo nguồn fixture dùng chung cho các màn có quan hệ. Cùng một phiếu/case/sản phẩm trong cùng kịch bản phải có cùng dữ liệu; card tổng hợp, badge, quantity và lịch sử phải suy ra từ nguồn này.
- Nếu các board cố ý minh họa dữ liệu khác nhau hoặc các thời điểm khác nhau, tách thành kịch bản có tên/ID và seed riêng. Không ép các số liệu khác nhau vào một record rồi làm sai quan hệ. Ghi correction map khi phải sửa fixture mâu thuẫn.
- Chỉ bổ sung fixture tổng hợp tối thiểu cho state đã yêu cầu nhưng đang thiếu; ghi rõ bổ sung và nguồn requirement. Dữ liệu tổng hợp không xác nhận schema/API hay nghiệp vụ còn PROPOSED.
- Các thao tác demo thay đổi state trong sandbox riêng của trình duyệt/người đánh giá; không để tester này sửa dữ liệu của tester khác. Có chức năng “Khôi phục dữ liệu mẫu” chỉ reset đúng namespace preview và xác nhận trước khi mất draft demo. Khi đổi scenario, không trộn state của hai scenario.
- Giữ dữ liệu qua refresh nếu luồng cần; xử lý đổi phiên bản seed để state cũ không làm hỏng bản mới. Deep link kịch bản phải tái lập được trạng thái đã công bố.
- Preview công khai chỉ chứa dữ liệu mẫu đã kiểm tra phù hợp công khai. Thay thông tin cá nhân thật nếu có bằng dữ liệu tổng hợp, giữ quan hệ; không xuất secret/token, cấu hình bí mật, session thật hoặc endpoint ghi production. Không gọi API production, gửi email/SMS, đổi mật khẩu thật hoặc ghi tồn thật.
- Camera/NFC/upload/backend có thể dùng adapter mô phỏng để review. Chỉ rõ trong hướng dẫn/Review Mode phần nào mô phỏng và phần nào đã kiểm thiết bị thật; không báo hardware/backend PASS từ fixture. Không bắt người xem cấp quyền camera để vào demo.

## 4. Thêm Review Mode cho DEV/Test/QA, giữ nguyên giao diện sản phẩm

Cung cấp hai cách xem trên cùng bản build:

1. **App Preview:** trải nghiệm app liên tục theo luồng thông thường bằng dữ liệu mẫu; có cách đăng nhập demo rõ ràng, không yêu cầu tài khoản công ty thật. Không thêm thông tin kỹ thuật vào nội dung nghiệp vụ của các màn.
2. **Review Mode:** công cụ đánh giá tách khỏi khung app, có thể đóng/ẩn trên mobile; danh mục đúng 24 board và toàn bộ panel/state theo coverage. Mỗi mục mở đúng màn + fixture/kịch bản, có link sao chép và ID `Pxx.Sxx`. Với panel đã chuyển nghiệp vụ, hiển thị phiên bản hiện hành và lý do MIGRATED.

Review Mode cho phép chọn các kịch bản có sẵn: default/loading/empty/error, vai trò/quyền đã xác minh, kho tạm dừng, UNKNOWN, closed và các ngoại lệ tương ứng. Đây là điều khiển test riêng của preview, không phải quyền quản trị thật hay chức năng mới của sản phẩm. Không tự phát minh vai trò/enum.

Hiển thị thông tin build/fixture version ở Review Mode và hướng dẫn. Cung cấp mẫu ghi lỗi: build, panel/state ID, scenario/link, viewport, bước tái hiện, mong đợi, thực tế, ảnh. Chỉ tạo khả năng sao chép mẫu, không tự tích hợp dịch vụ gửi phản hồi hoặc gửi thông báo.

## 5. Kiểm tra trước và sau xuất bản

- Chạy build và các kiểm tra sẵn có phù hợp. Kiểm tra không còn lỗi chặn render, asset/font thiếu, CTA chủ chốt không làm gì, route vòng lặp hoặc sai base path.
- Test liên màn với dữ liệu dùng chung, Back/Forward, refresh/deep link, trạng thái phiên demo, reset seed và tránh duplicate khi nhấn nhiều lần. Guard phải đúng ngay cả khi mở route trực tiếp.
- Mở từng mục coverage bằng render thật hoặc kiểm tra tự động phù hợp; không suy PASS từ việc route tồn tại. Giữ visual/behavior/integration riêng theo enum contract. Chưa chạy thì NOT_RUN; chưa tích hợp thật không gán integration PASS.
- Đối chiếu visual theo baseline và viewport hợp lệ; kiểm mobile 360/390/430 CSS px và desktop theo contract, không tạo layout tablet mới. Kiểm keyboard/scroll/safe area/CTA không bị che. Không tuyên bố giống 100% khi chưa có bằng chứng.
- Lỗi nhỏ không chặn đánh giá có thể được đưa vào known issues. Nếu một luồng chính bị gãy hoặc màn thiết yếu chưa dựng, phải sửa hoặc gắn bản phát hành INCOMPLETE; không gọi là “preview đầy đủ” chỉ vì deploy thành công. Backend thật chưa nối có thể được ghi giới hạn riêng trong bản UI review hoàn chỉnh bằng fixture.

## 6. Xuất bản public preview

- Ưu tiên cơ chế hosting đang dùng của repo. Kiểm tra cấu hình hiện hành trước khi chọn cách build/publish; không giả định framework, branch hoặc thư mục xuất bản.
- Với bản browser/static preview, dự kiến đặt ở đường dẫn con `/ScannerHNApp/review/` để giữ gallery tại URL gốc. Đây là đường dẫn mục tiêu, CHƯA phải link đã hoạt động. Nếu repo đã có đường dẫn preview phù hợp thì dùng lại và báo URL thực tế; không tự ghi đè một ứng dụng khác ở đó.
- Cấu hình base path, asset URLs, route/deep link và refresh phù hợp hosting. Chỉ xuất bản build cùng tài nguyên cần thiết; không đưa toàn workspace, log riêng tư, node_modules hoặc thông tin đăng nhập vào artifact.
- Nếu target native không có bản browser tương đương, báo rõ giới hạn; không đặt gallery ảnh rồi gọi là app tương tác. Tái sử dụng web prototype hiện có nếu đáp ứng scope, ghi đúng target; không tự đổi công nghệ production.
- Thực hiện deploy theo quyền đã cấp. Không vượt quyền, bỏ branch protection hoặc tự chuyển sang nhà cung cấp tính phí. Nếu bị chặn, vẫn hoàn thiện build/báo cáo và nêu đúng thao tác còn thiếu; không bịa URL hoặc báo đã public.
- Sau deploy, mở URL public trong phiên không đăng nhập và kiểm app entry, Review Mode, deep link đại diện, refresh, assets và dữ liệu mẫu. Đối chiếu build hiển thị với source commit/build đã deploy để tránh đánh giá bản cache cũ. Lưu URL/build ID/thời điểm kiểm tra thực tế.

## 7. Bàn giao cuối cùng

Tạo/cập nhật các file trong `handoff/FINAL/`:

- `FINAL_REPORT.md`: phạm vi đã nối, file thay đổi, source/build identity, lệnh và kết quả, coverage tổng hợp, known issues, giới hạn hardware/backend.
- `REVIEW_GUIDE.md`: link app, link Review Mode, cách vào demo, kịch bản, reset dữ liệu và mẫu ghi lỗi.
- `FLOW_MATRIX.csv`: hành trình, context/dữ liệu, link mở, kết quả kiểm, bằng chứng và blocker.
- `FIXTURE_MANIFEST.json`: nguồn/phiên bản seed, scenario IDs, quan hệ dữ liệu, thay đổi fixture và cơ chế reset; không chứa bí mật.
- `DEPLOYMENT.md`: môi trường/path, source commit, build ID, URL public thực, thời điểm kiểm tra và cách khôi phục bản preview trước nếu cần.

Cập nhật `SCREEN_COVERAGE.csv` chung, giữ đủ 24 board và 91 panel gốc, bổ sung runtime states bằng ID thuộc prompt tương ứng. Chỉ đính ảnh/log thực sự tạo được.

Phản hồi cuối ngắn gọn gồm: **link app**, **link Review Mode**, cách dùng dữ liệu mẫu, số board/panel đã kiểm, các hạn chế còn lại và link báo cáo. Chỉ gọi “đã public” sau khi kiểm URL không đăng nhập. Không dừng ở “tôi có thể làm” hoặc yêu cầu tôi viết thêm prompt con. Nếu gián đoạn, lưu checkpoint và tiếp tục cùng FINAL.
