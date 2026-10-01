# P24 r03 — rà soát và khắc phục UI/UX

User yêu cầu rà soát kỹ và khắc phục lỗi còn lại. **14 ca lỗi tái hiện được đã sửa; cả16 ca audit đạt sau sửa.** A01/A02 đã đạt trước sửa, không tính là lỗi đã khắc phục. Hình thức **AWAITING_USER_REVIEW**, hành vi **PASS_PROTOTYPE**, tích hợp **BLOCKED_PRODUCTION**. Không khẳng định toàn app không còn mọi lỗi.

[Review r03](REVIEW_03.html) · [Nguồn/phạm vi](REVISION_03_CONTEXT.md) · [Audit trước](evidence/revision-03/before/audit.json) · [Audit sau](evidence/revision-03/after/audit.json) · [Manifest](SOURCE_MANIFEST_03.json) · [Preview](http://localhost:8766/flows/auth-session/?v=p24-r03)

## Ca lỗi trước–sau

| Ca | Trước sửa | Khắc phục |
|---|---|---|
| A03 | Footer closed co từ111px xuống87px khi tải thêm; nút Back đổi hình thức | CSS loading chỉ áp nút tải trang; footer giữ hình học hiện tại |
| A04 | Owner đã đóng hồ sơ nhưng badge/context vẫn Đang kiểm tra sau khi đọc thêm | Đồng bộ context, notice, liên kết và footer từ owner hiện tại; mutation guard vẫn giữ |
| A05 | Thời gian phiếu dài liền mạch tràn ngang, không đọc đủ | Wrap + reader chung2dòng, raw nguyên vẹn |
| A06 | Case ID dài đẩy context màn lỗi ra ngoài khung | Giữ2dòng và đường Xem đầy đủ bằng reader chung |
| A07 | Case ID dài trong hướng dẫn sheet làm body tràn ngang | Wrap đầy đủ trong vùng cuộn dialog, không mở overlay thứ hai |
| A08 | Back từ chứng từ nhập mất focus CTA kết quả | Controller return chung phục hồi đúng action theo documentId |
| A09 | Back từ chứng từ xuất mất focus CTA kết quả | Cùng controller; không giành focus nếu user đã chuyển sang chỗ khác |
| A10 | Back từ chứng từ xuất làm mất vị trí cuộn result dài | Lưu/khôi phục inner scroll của đúng result, sau khi DOM ổn định |
| A11 | P20→timeline→Linh kiện chuyển sang nguồn mặc định và mất trang mẫu đã tải | Caller đã xác minh trở lại chính entry P20; giữ source/cache/cursor/scroll |
| A12 | Tăng tới tồn12 làm nút disabled và mất focus khỏi sheet | Trả focus vào input khi stepper vừa chạm biên; kiểm cả giảm tới1 |
| A13 | Tem đơn hết tồn bị diễn giải thành lỗi của hộp | Nhãn lỗi theo UNIT/BOX; không đổi điều kiện số lượng/tồn |
| A14 | Nhập đã gửi→Lịch sử→Back lại mở bản nhập mới | Home lưu chính xác return documentId; Back vẫn result đã xác minh |
| A15 | Xuất đã gửi→Lịch sử→Back lại mở phiếu mới | Giữ identity result xuất và focus nút lịch sử |
| A16 | Sau Nhập lượt mới, Forward tới chứng từ cũ rồi Back làm form không thao tác được | Khi owner cấp lượt mới, cập nhật identity của history entry; phiếu mới tiếp tục được, phiếu cũ vẫn xem bằng ID riêng |

Mỗi ca có ảnh PNG cùng tên trong before/after. A01 kiểm vào màn lỗi sau khi cuộn và A02 kiểm rời màn lỗi sang Home đã đạt trước; giữ làm regression, không sửa dựa trên nghi ngờ. Các ca nội dung dài/thay đổi trạng thái/delay/depleted dùng source fixture rõ trong script, không biến dữ liệu giả lập thành bằng chứng WMS.

## Kiểm chứng

- **173/173 test logic**, thêm3 ca kiểm label UNIT/BOX và điều kiện phục hồi result.
- **70 nhóm trình duyệt**: audit16 + guard4 + P24 chính5 + cạnh biên6 + UX r02 5 + P19 9 + P20 7 + P21 9 + P23 9.
- **35 tổ hợp layout P24** kế thừa matrix r02 và chạy lại dưới r03; **4 viewport footer Home/P03**. Các case thời gian/ID dài trong audit là kiểm bổ sung tại494×950, không tự cộng vào35.
- Guard mới: nguồn đọc hoàn tất khi reader mở không đóng dialog/giành focus; context đổi mở/đóng không giữ footer cũ; steppermin không tự xác nhận; callback result chậm không giành focus mới.
- Các regression tiếp tục kiểm record không đổi tồn, Post có receipt khớp, UNKNOWN không retry mù, actor/kho/case guard, phân trang/dedup, Back/Escape/IME/reader/longtext, logout Back và4ID panel.
- Syntax/links/hash/coverage và git diff --check đạt. Không kiểm phần cứng thật hoặc backend thật.

Lệnh tại repo:
```text
node scripts/audit_p24_r03.cjs before
node scripts/audit_p24_r03.cjs after
node scripts/check_p24_r03_guards.cjs
node --test tests/scanner-states*.test.mjs tests/component-issue*.test.mjs tests/component-history*.test.mjs tests/component-resume*.test.mjs tests/inbound.test.mjs tests/outbound.test.mjs
node scripts/run_p24_r03.cjs check_p24.cjs after
node scripts/run_p24_r03.cjs check_p24_edges.cjs after
node scripts/run_p24_r03.cjs check_p24_r02.cjs
node scripts/run_p24_r03.cjs regression check_p19.cjs
node scripts/run_p24_r03.cjs regression check_p20.cjs
node scripts/run_p24_r03.cjs regression check_p21.cjs
node scripts/run_p24_r03.cjs regression check_p23.cjs
# Set HOME_FOOTER_EVIDENCE_DIR=handoff/P24/evidence/revision-03/footer
node scripts/check_home_footer_locked.cjs
node scripts/verify_p24_r03.cjs
git diff --check
```

Before có thể tái lập bằng cách phục vụ snapshot nguồn r02 qua interception chỉ trong browser test. Mỗi ca dùng trang/phiên riêng; viewport494×950, DPR1, font local, reduced-motion, timezone VN. Snapshot outbound fixture được bổ sung vì không có thay đổi runtime ở file này trong r03; không rollback working copy để chụp trước. A13 ban đầu chọn cả dialog ẩn đã được sửa selector thành dialog đang mở; lỗi copy được tái hiện riêng rồi chạy lại cùng bộ. A16 được bổ sung cuối audit; JSON tổng hợp lấy kết quả chạy riêng thật, không suy PASS từ code.

## Thay đổi và giới hạn

Giữ6 cải tiến r02, khung494×950, 24board/91panel, footerLOCK và các contract dialog/reader/icon. Sửa adapter/view/CSS P19/P20, controller result chung waiting-web và callbacks P04/P05/Home/P23. Model P19 chỉ bổ sung phân loại câu lỗi UNIT/BOX; không thay bounds, request, receipt hoặc policy Post. Không sửa shared dialog/reader primitive, gallery/dist hay ảnh baseline.

Working HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78`; source trước tại evidence/revision-03/before/source, file cuối/hash tại manifest. Giữ công việc chat khác và evidence r01/r02. Không push/merge/deploy.

Hành vi đạt trong prototype, hình thức cần user review. Production API/auth/permission/stock/status/event schema, camera/NFC/bàn phím ảo và lưu bền chưa xác minh; dữ liệu vẫn mất khi reload/logout. Cập nhật case ở đây phản ánh owner preview đang có khi render/read, không phải cơ chế subscription/sync WMS mới. Các state đồng bộ tương lai vẫn để sau; P23 r03 giữ tạm chốt lịch sử.
