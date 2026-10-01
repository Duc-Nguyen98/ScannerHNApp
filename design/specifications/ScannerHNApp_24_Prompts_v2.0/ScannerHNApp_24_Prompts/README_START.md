# ScannerHNApp — 01 contract + 24 prompt triển khai chi tiết

Phiên bản 2.0 · 24/09/2026. Bộ này được viết từ 24 board trong tab Tất cả và nguồn repo tại commit `da9f623a19d0359c3e80c14f8cc612636ec6ab78`.

## Dùng ngay

1. Giải nén toàn bộ để giữ các link tương đối và ảnh tham chiếu.
2. Cung cấp `00_CONTRACT_CHUNG.md` cho AI code cùng quyền đọc/sửa source dự án. Có thể dùng lại source đã thực hiện sau chuỗi 5 prompt cũ.
3. Gửi nội dung P01 cùng ảnh B01; sau khi nhận bàn giao gửi P02 cùng B02, tiếp tục đến P24. Mỗi lượt chỉ cần contract, prompt đang làm, ảnh tương ứng và các dependency liên quan. Nếu dùng cuộc trò chuyện mới, gửi lại contract và báo cáo/tiến độ cần thiết.
4. Mỗi prompt đã nêu riêng toàn bộ màn/state trong board, bố cục, hành vi, dữ liệu, kiểm tra và đầu ra. Không cần tự soạn thêm prompt con. Bảng CSV theo dõi tiến độ được agent cập nhật trong quá trình triển khai.

**Đúng 24 prompt triển khai**, không phải 24 màn đơn lẻ: 24 board chứa 91 panel tham chiếu. Các panel có thể dùng chung route/component. Các bước trong từng prompt là công việc phải thực hiện, không phải yêu cầu tạo thêm prompt.

Hai board original giữ nguyên; 16 board cũ đối chiếu nghiệp vụ hiện hành; 6 board hiện hành có scene prototype liên kết. P19 tương ứng board gốc17, không phải board19. Danh mục sau giữ đúng thứ tự tab Tất cả.

## Danh mục 24 prompt

| Prompt | Board | Panel | File ảnh |
|---|---|---:|---|
| [P01 — Đăng nhập & Xác nhận phiên](P01_Dang_nhap_Xac_nhan_phien.md) | original | 2 | [B01.jpg](references/B01.jpg) |
| [P02 — Trang chủ đã khóa](P02_Trang_chu.md) | original | 1 | [B02.jpg](references/B02.jpg) |
| [P03 — Dialog cố định](P03_Dialog_co_dinh.md) | 01 | 4 | [B03.png](references/B03.png) |
| [P04 — Nhập kho](P04_Nhap_kho.md) | 02 | 4 | [B04.png](references/B04.png) |
| [P05 — Xuất kho](P05_Xuat_kho.md) | 03 | 4 | [B05.png](references/B05.png) |
| [P06 — Tra cứu](P06_Tra_cuu.md) | 04 | 4 | [B06.png](references/B06.png) |
| [P07 — NFC](P07_The_NFC.md) | 05 | 4 | [B07.png](references/B07.png) |
| [P08 — Lịch sử](P08_Lich_su.md) | 06 | 4 | [B08.png](references/B08.png) |
| [P09 — Bảo hành](P09_Bao_hanh.md) | 07 | 4 | [B09.png](references/B09.png) |
| [P10 — Cá nhân](P10_Ca_nhan.md) | 08 | 4 | [B10.png](references/B10.png) |
| [P11 — Bảo mật](P11_Bao_mat.md) | 09 | 4 | [B11.png](references/B11.png) |
| [P12 — Chứng từ](P12_Chung_tu.md) | 10 | 4 | [B12.png](references/B12.png) |
| [P13 — Thông báo phê duyệt](P13_Thong_bao_Phe_duyet.md) | 11 | 4 | [B13.png](references/B13.png) |
| [P14 — Khôi phục ca](P14_Khoi_phuc_Ca_lam_viec.md) | 12 | 4 | [B14.png](references/B14.png) |
| [P15 — Hệ thống](P15_He_thong.md) | 13 | 4 | [B15.png](references/B15.png) |
| [P16 — Dữ liệu quyết lỗi](P16_Du_lieu_Trang_thai.md) | 14 | 4 | [B16.png](references/B16.png) |
| [P17 — Ngoại lệ quét](P17_Ngoai_le_quet.md) | 15 | 4 | [B17.png](references/B17.png) |
| [P18 — Đính kèm bàn giao](P18_Dinh_kem_Ban_giao.md) | 16 | 4 | [B18.png](references/B18.png) |
| [P19 — 17 · Xuất linh kiện bảo hành](P19_Xuat_linh_kien_bao_hanh.md) | 17 | 4 | [B19.png](references/B19.png) |
| [P20 — 18 · Lịch sử linh kiện](P20_Lich_su_linh_kien.md) | 18 | 4 | [B20.png](references/B20.png) |
| [P21 — 19 · Tiếp tục phiếu linh kiện](P21_Tiep_tuc_phieu_linh_kien.md) | 19 | 4 | [B21.png](references/B21.png) |
| [P22 — 20 · Lịch sử thao tác & NFC](P22_Lich_su_thao_tac_NFC.md) | 20 | 4 | [B22.png](references/B22.png) |
| [P23 — 21 · Bảo hành & phiên quét](P23_Bao_hanh_Phien_quet.md) | 21 | 4 | [B23.png](references/B23.png) |
| [P24 — 22 · Trạng thái Scanner](P24_Trang_thai_Scanner.md) | 22 | 4 | [B24.png](references/B24.png) |

## File hỗ trợ

- `00_CONTRACT_CHUNG.md`: nguyên tắc chung, nguồn quyết định, token có bằng chứng, ranh giới prototype/production và nghiệm thu.
- `BOARD_INDEX.csv`: ánh xạ 24 prompt ↔ board ↔ ảnh ↔ commit.
- `SCREEN_COVERAGE.csv`: 91 dòng panel, tách visual/behavior/integration. Ban đầu NOT_STARTED vì đây là bộ prompt, chưa phải kết quả triển khai app.
- `references/`: đủ 24 ảnh gốc; README, HANDOFF và DEV_PROPOSAL tại snapshot. Proposal vẫn là đề xuất.
- `SOURCE_HASHES.json`: SHA-256 ảnh/tài liệu tham chiếu để phát hiện thay đổi; không phải tiêu chí đo độ giống UI.

Checkpoint chỉ là file tiến độ agent tự lưu khi gián đoạn. Nó không thay nội dung chi tiết và không làm phát sinh prompt triển khai ngoài 24 file.

Bộ tài liệu không thể bảo đảm AI tuân thủ 100% chỉ bằng lời cấm. Mỗi prompt yêu cầu kiểm chứng bằng code, ảnh render, hành vi và coverage; phần chưa xác minh phải được báo đúng.
