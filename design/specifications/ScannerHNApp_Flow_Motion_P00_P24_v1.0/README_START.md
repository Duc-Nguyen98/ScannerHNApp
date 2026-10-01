# ScannerHNApp — Nối luồng trước, thêm motion sau, cuối cùng public preview

Bộ bổ sung v1.0 · 30/09/2026. Không thay thế 24 prompt dựng UI đã chốt.

## Chọn cách chạy

Đề xuất dùng **bộ prompt chi tiết theo từng board**. Mỗi prompt có phạm vi nhỏ, mapping state, hiệu ứng, guard và ca kiểm riêng. Không dùng một lệnh chung “thêm tất cả animation” cho cả app.

| Thứ tự | File/lượt chạy | Kết quả cần có |
|---|---|---|
| 1 | P00/contract + P01–P24 dựng UI cũ | Dùng lại code đã chạy; nếu đã xong không chạy lại. |
| 2 | `01_FLOW_LINK_GATE.md` | Nối/kiểm toàn bộ luồng trước motion; FLOW_GATE READY_FOR_MOTION. |
| 3 | `MOTION_P00_Setup.md` | Chọn engine theo source, token và primitive chung; baseline/perf evidence. |
| 4 | MOTION_P01→MOTION_P24 | Thêm motion theo24board, kiểm full/reduced/off; M24 tổng hợp gate. |
| 5 | FINAL gốc + `FINAL_BRIDGE.md` cùng lượt | Giữ kết quả flow/motion, hoàn thiện Review Mode và deploy public. |

P00 nền tảng không phải board; MOTION_P01 không thay P01 cũ. Tổng lượt motion gồm1setup+24board. FLOW và FINAL là bước tích hợp trước/sau do người dùng bổ sung, không làm thay đổi danh mục24board.

Mỗi lần chạy: cung cấp `00_CONTRACT_CHUNG.md` gốc + `MOTION_CONTRACT.md` + file prompt đang chạy, quyền đọc/sửa source và reports gần nhất. Nếu các file đã có trong workspace, yêu cầu AI đọc trực tiếp; không dán toàn bộ pack vào mỗi lượt. Ảnh nguồn có link trong mỗi prompt, dùng ảnh baseline đã tải nếu môi trường không đọc được link. Không cần đính hai bản FINAL trùng nhau.

Trong chat mới, gửi gate/report và checkpoint của phần đang làm cùng source, không chỉ lịch sử chat. Có thể checkpoint trong cùng prompt nhưng không bỏ panel hoặc buộc người dùng tạo prompt con.

## Quyết định công nghệ đề xuất

**React:** CSS + một Motion/framer-motion engine + native scroll; TanStack Virtual chỉ thêm nơi profile chứng minh cần. **Vanilla:** CSS/WAAPI phù hợp source; không migrate để lấy thư viện. SmoothUI chỉ chọn pattern phù hợp baseline; GSAP, Lenis và Locomotive Scroll chưa thêm cho scope này. Nếu đã có dependency, kiểm dùng ở đâu trước khi loại khỏi app; không gỡ mù.

“Mượt” ở app scanner là thao tác nhanh, phản hồi rõ, không mất focus/context/dữ liệu và cuộn ổn định. Không phải mọi thành phần đều chuyển động. Tokens100–220ms trong contract là giá trị đề xuất có thể tinh chỉnh dựa evidence, không được mô tả là thông số ảnh gốc.

## Danh mục motion

| Prompt | Board | Panel | File |
|---|---|---:|---|
| MOTION_P00 | Setup dùng chung | — | [MOTION_P00_Setup.md](MOTION_P00_Setup.md) |
| MOTION_P01 | Đăng nhập & Xác nhận phiên | 2 | [MOTION_P01_Dang_nhap_Xac_nhan_phien.md](MOTION_P01_Dang_nhap_Xac_nhan_phien.md) |
| MOTION_P02 | Trang chủ đã khóa | 1 | [MOTION_P02_Trang_chu.md](MOTION_P02_Trang_chu.md) |
| MOTION_P03 | Dialog cố định | 4 | [MOTION_P03_Dialog_co_dinh.md](MOTION_P03_Dialog_co_dinh.md) |
| MOTION_P04 | Nhập kho | 4 | [MOTION_P04_Nhap_kho.md](MOTION_P04_Nhap_kho.md) |
| MOTION_P05 | Xuất kho | 4 | [MOTION_P05_Xuat_kho.md](MOTION_P05_Xuat_kho.md) |
| MOTION_P06 | Tra cứu | 4 | [MOTION_P06_Tra_cuu.md](MOTION_P06_Tra_cuu.md) |
| MOTION_P07 | NFC | 4 | [MOTION_P07_The_NFC.md](MOTION_P07_The_NFC.md) |
| MOTION_P08 | Lịch sử | 4 | [MOTION_P08_Lich_su.md](MOTION_P08_Lich_su.md) |
| MOTION_P09 | Bảo hành | 4 | [MOTION_P09_Bao_hanh.md](MOTION_P09_Bao_hanh.md) |
| MOTION_P10 | Cá nhân | 4 | [MOTION_P10_Ca_nhan.md](MOTION_P10_Ca_nhan.md) |
| MOTION_P11 | Bảo mật | 4 | [MOTION_P11_Bao_mat.md](MOTION_P11_Bao_mat.md) |
| MOTION_P12 | Chứng từ | 4 | [MOTION_P12_Chung_tu.md](MOTION_P12_Chung_tu.md) |
| MOTION_P13 | Thông báo phê duyệt | 4 | [MOTION_P13_Thong_bao_Phe_duyet.md](MOTION_P13_Thong_bao_Phe_duyet.md) |
| MOTION_P14 | Khôi phục ca | 4 | [MOTION_P14_Khoi_phuc_Ca_lam_viec.md](MOTION_P14_Khoi_phuc_Ca_lam_viec.md) |
| MOTION_P15 | Hệ thống | 4 | [MOTION_P15_He_thong.md](MOTION_P15_He_thong.md) |
| MOTION_P16 | Dữ liệu quyết lỗi | 4 | [MOTION_P16_Du_lieu_Trang_thai.md](MOTION_P16_Du_lieu_Trang_thai.md) |
| MOTION_P17 | Ngoại lệ quét | 4 | [MOTION_P17_Ngoai_le_quet.md](MOTION_P17_Ngoai_le_quet.md) |
| MOTION_P18 | Đính kèm bàn giao | 4 | [MOTION_P18_Dinh_kem_Ban_giao.md](MOTION_P18_Dinh_kem_Ban_giao.md) |
| MOTION_P19 | 17 · Xuất linh kiện bảo hành | 4 | [MOTION_P19_Xuat_linh_kien_bao_hanh.md](MOTION_P19_Xuat_linh_kien_bao_hanh.md) |
| MOTION_P20 | 18 · Lịch sử linh kiện | 4 | [MOTION_P20_Lich_su_linh_kien.md](MOTION_P20_Lich_su_linh_kien.md) |
| MOTION_P21 | 19 · Tiếp tục phiếu linh kiện | 4 | [MOTION_P21_Tiep_tuc_phieu_linh_kien.md](MOTION_P21_Tiep_tuc_phieu_linh_kien.md) |
| MOTION_P22 | 20 · Lịch sử thao tác & NFC | 4 | [MOTION_P22_Lich_su_thao_tac_NFC.md](MOTION_P22_Lich_su_thao_tac_NFC.md) |
| MOTION_P23 | 21 · Bảo hành & phiên quét | 4 | [MOTION_P23_Bao_hanh_Phien_quet.md](MOTION_P23_Bao_hanh_Phien_quet.md) |
| MOTION_P24 | 22 · Trạng thái Scanner | 4 | [MOTION_P24_Trang_thai_Scanner.md](MOTION_P24_Trang_thai_Scanner.md) |

## Nội dung hỗ trợ

- `FLOW_PANEL_MATRIX.csv`:91panel với hành vi/ngữ cảnh đối chiếu, các cột route/evidence dành cho agent điền theo code thật.
- `MOTION_COVERAGE.csv`:91panel, kết quả3mode và regression riêng; ban đầu NOT_STARTED cho lượt motion này.
- `SOURCES_AND_STACK.md`: lý do chọn/bỏ thư viện, link docs chính thức.
- File FINAL gốc đi kèm giữ nguyên nội dung; gửi thêm FINAL_BRIDGE để kế thừa kết quả mới. Không cần sửa bản gốc trong Library.

Bộ file này mới là prompt triển khai. Chưa sửa code app, chạy benchmark hoặc deploy chỉ bằng việc tạo tài liệu. Mốc nguồn/thông số đo khi chạy phải lấy thực tế, không kế thừa thành PASS giả.
