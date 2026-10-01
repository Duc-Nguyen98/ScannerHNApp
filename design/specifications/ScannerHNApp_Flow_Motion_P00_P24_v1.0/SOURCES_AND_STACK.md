# Lựa chọn thư viện và nguồn chính thức

Đối chiếu ngày30/09/2026; version cụ thể phải kiểm lại package/lockfile khi thực thi. Đây là quyết định thiết kế cho ScannerHNApp, không phải kết luận các thư viện bị loại là kém chất lượng.

| Nguồn | Thông tin đã dùng | Áp dụng cho bộ prompt |
|---|---|---|
| https://motion.dev/docs/react | Motion for React là tên hiện hành của thư viện trước đây Framer Motion. | Ưu tiên một engine nếu React phù hợp. |
| https://motion.dev/docs/react-installation | Tài liệu cài đặt và yêu cầu tương thích React. | Kiểm stack/lockfile trước khi cài, không hardcode@latest. |
| https://motion.dev/docs/react-motion-config | Có policy reducedMotion; transform/layout được tắt khi reduced, opacity/background có thể tiếp tục. | Cấu hình user và xử lý loop/opacity/CSS riêng. |
| https://motion.dev/docs/react-use-reduced-motion | Hook nhận lựa chọn reduced motion. | Cùng UI/data, hiệu ứng nhẹ hơn hoặc tắt. |
| https://smoothui.dev/docs/guides | Collection component dùng React/Tailwind/Motion/GSAP. | Không cài cả bộ hoặc thay baseline; pattern chọn lọc khi thật cần. |
| https://gsap.com/docs/v3/ và https://github.com/greensock/react | GSAP có timeline/animation, React hook hỗ trợ cleanup qua context. | Không thêm engine thứ hai khi không có nhu cầu sequence; audit code đã có. |
| https://github.com/darkroomengineering/lenis | Smooth-scroll library, có yêu cầu tích hợp/lifecycle và giới hạn theo môi trường. | Scope scanner giữ native scroll, không thêm controller. |
| https://github.com/locomotivemtl/locomotive-scroll | Tài liệu hiện hành mô tả smooth scroll/parallax, xây trên Lenis. | Không dùng đồng thời hai lớp cuộn cho app; không suy phiên bản đang cài từ docs main. |
| https://tanstack.com/virtual/latest/docs/introduction | Headless virtualization cho danh sách dài. | Chỉ tối ưu list đo thấy cần, không dùng như animation package. |
| https://tanstack.com/virtual/latest/docs/api/virtualizer và https://github.com/TanStack/virtual/blob/main/docs/api/virtualizer.md | Keys, size estimation/measurement và scroll adapter. | Stable IDs, giữ anchor, tách transform positioning khỏi motion content. |

Repo dự án: https://github.com/Duc-Nguyen98/ScannerHNApp

Snapshot mapping24board kế thừa từ bộ prompt v2.0: `da9f623a19d0359c3e80c14f8cc612636ec6ab78`. Bộ này không xác nhận source app hiện tại đã thực thi hết24prompt; FLOW gate phải kiểm code và reports thật. Hai file FINAL người dùng đính kèm có cùng SHA-256; bản gốc được đóng kèm nguyên nội dung để chạy sau motion.
