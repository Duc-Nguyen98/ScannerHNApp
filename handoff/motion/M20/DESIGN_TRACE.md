# M20 — trước sửa

FLOW_GATE PASS UI_FIXTURE (24board/91panel); M00 PASS_HARNESS. Baseline commit da9f623 + working source hiện tại gồm P20 r03, các cải tiến P21/P24, FLOW_GATE và M01–M19. Không rollback theo báo cáo P20 cũ. Native HTML/CSS/ES modules; không cài lib/deploy.

Ownership: PostedHistoryViewport giữ native scroll và row DOM; LoadMoreFooter chỉ descendant trạng thái. M02 sở hữu route opacity; AppModal sở hữu dialog, không thêm effect lên viewport/row/header/footer. M00 dataState140/80/off dùng cho error và successful empty. Spinner trong skeleton hiện có (24px, absolute, không đổi geometry), chỉ loop khi pending thực tế, auto/visible/not-inert; reduced/off tĩnh. Không shimmer/count-up hoặc callback ghi dữ liệu.

Số đo từ source r03/P24 giữ: frame494×950, header86, scroll padding20/gap14, cardradius12; status/footer giữ shape hiện tại. 4panel×3mode chụp trước/sau cùng494×950/DPR1/seed/font. Core tokens/primitive không sửa. Motion là implementation theo MOTION_CONTRACT, không tự nghiệm thu hình thức mới.

Virtualization: M00 DEFERRED cho P20 (1phiếu/81nodes snapshot cũ). Giữ pagination; đo synthetic stress riêng trước/sau, không đổi seed/backend. Chỉ cân nhắc thêm virtualizer sau profile hợp lệ, không thêm vì load-more.
