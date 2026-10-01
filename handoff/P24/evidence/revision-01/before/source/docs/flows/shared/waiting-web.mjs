// P04 owns first implementation; P24.S03 may reuse this copy/component later.
// Source: confirmed HANDOFF, Quy tắc UI. UI label is not a server enum.
export const WAITING_WEB = Object.freeze({ title: 'Đã gửi phiếu nhập', status: 'Chờ xử lý trên Web', description: 'Phiếu đã gửi, chưa ghi sổ. Tồn kho chỉ cập nhật sau khi ghi sổ thành công trên Web.' });
export function waitingWebMarkup({kind = 'inbound', prefix = 'p04'} = {}) {
  return `<div class="${prefix}-success-mark" aria-hidden="true">✓</div><h2>${kind === 'outbound' ? 'Đã gửi phiếu xuất' : WAITING_WEB.title}</h2><p>${WAITING_WEB.description}</p>`;
}
