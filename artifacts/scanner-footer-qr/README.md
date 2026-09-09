# Footer cong nhẹ + QR trắng — bản được duyệt

Chỉ thay footer Scanner. Header Hoa Nam Scanner và navigation destinations được giữ nguyên.

- Nút tròn 54×54px, icon ScanQrCode trắng 27px, nhãn Quét mã 12px. Không còn HN/TOOL trong nút.
- Đường cong nhẹ ôm nút. Orb nằm trong bounding box navigation, cao hơn vai cong; ResizeObserver dự phòng đo cả envelope orb nếu nhô ngoài box khi kích thước thay đổi.
- Reserved space và bottom CTA vẫn lấy chiều cao đo thực tế, gồm safe-area. Không dùng padding chắp vá trên từng màn.
- `qa.json`: PASS cả 360×800,390×844,430×932; nút 54px, icon trắng, không HN/TOOL, bấm mở lookup, CTA không chồng nav/orb; dòng cuối đã quét cuộn lên phía trên CTA; không pageerror.
- `*-home.png`, `*-footer.png`, `*-scan.png`: ảnh runtime trên static artifact. QA script `scripts/qa-scanner-footer.mjs`.
- Scope TypeScript/lint đạt. Build static hoàn tất; Windows Node26 có assertion lúc đóng prerender server như trước, nên xác minh chính artifact static.

Không thay kết luận BLOCKED của nghiệm thu P05; đây là thay đổi footer và QA riêng. Không khẳng định kiểm thử keyboard OS/hardware thật.
