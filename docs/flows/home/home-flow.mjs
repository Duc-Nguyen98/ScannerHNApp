// Local prototype navigation contract. These names are NOT backend permissions/APIs.
export const HOME_NAMESPACE = 'hn-scanner-home-preview-v1';
export const DESTINATIONS = Object.freeze({
  home: { target: 'P02', label: 'Trang chủ', tab: 'home' },
  inbound: { target: 'P04', label: 'Nhập kho', tab: 'home' },
  outbound: { target: 'P05', label: 'Xuất kho', tab: 'home' },
  lookup: { target: 'P06', label: 'Quét hoặc nhập mã sản phẩm', tab: 'lookup' },
  nfc: { target: 'P07', label: 'Thẻ NFC', tab: 'home' },
  warranty: { target: 'P09', label: 'Bảo hành', tab: 'home' },
  profile: { target: 'P10', label: 'Cá nhân', tab: 'profile' },
  security: { target: 'P11', label: 'Bảo mật', tab: 'profile' },
  documents: { target: 'P12', label: 'Chứng từ', tab: 'documents' },
  attachments: { target: 'P18', label: 'Tệp và bàn giao', tab: 'documents' },
  'component-issue': { target: 'P19', label: 'Xuất linh kiện bảo hành', tab: 'home' },
  'component-resume': { target: 'P21', label: 'Tiếp tục phiếu linh kiện', tab: 'history' },
  'component-history': { target: 'P20', label: 'Lịch sử linh kiện', tab: 'home' },
  shift: { target: 'P14', label: 'Kết thúc ca', tab: 'profile' },
  notifications: { target: 'P13', label: 'Thông báo', tab: 'home' },
  history: { target: 'P22', label: 'Lịch sử', tab: 'history', url: '../warranty-components/?mode=screen&scene=history-hub' },
  'history-list': { target: 'P08', label: 'Lịch sử chung', tab: 'history' },
});
export function sessionGuard(state) {
  if (!state?.session || !state.previewReady || state.startUnknown) return 'Phiên chưa được xác nhận. Vui lòng đăng nhập và xác nhận phiên.';
  // P01 already gates start. Runtime warehouse availability is a write guard,
  // not a reason to revoke an established session or its read-only routes.
  if (state.session.permissions?.warehouseOperations !== true) return 'Tài khoản chưa có quyền thao tác kho được xác nhận.';
  return '';
}
export function resolveNavigation(key, id, state) {
  const blocked = sessionGuard(state);
  if (blocked) return { kind: 'blocked', message: blocked };
  if (!Object.hasOwn(DESTINATIONS, key)) return { kind: 'blocked', message: 'Đường dẫn chưa được hỗ trợ.' };
  // Warranty and NFC expose read-only views/reconciliation; their handlers guard every write.
  if (['inbound', 'outbound'].includes(key) && state.session.warehouse?.active !== true) {
    return { kind: 'warehouse-stopped', target: 'P03', panel: 'P03.S03', message: 'Kho tạm dừng hoặc chưa xác minh. Thao tác ghi bị chặn.' };
  }
  const destination = DESTINATIONS[key];
  // Only known fixture rows have an ID-to-module mapping. No server ID is invented.
  const allowed = { inbound: 'PN-0001', outbound: 'PX-0004', warranty: 'BH-001' };
  if (id && (!Object.hasOwn(allowed, key) || allowed[key] !== id)) return { kind: 'blocked', message: 'Chưa xác minh được chứng từ hoặc hồ sơ này.' };
  const context = { namespace: HOME_NAMESPACE, actorId: state.session.actor.id, warehouseId: state.session.warehouse.id, returnTo: 'P02' };
  if (id) context[key === 'warranty' ? 'caseId' : 'documentId'] = id;
  return { kind: key === 'home' ? 'home' : destination.url ? 'available' : 'pending', key, ...destination, context };
}
export function routeHash(key, id) {
  return key === 'home' ? '#home' : `#p02/${encodeURIComponent(key)}${id ? `?id=${encodeURIComponent(id)}` : ''}`;
}
export function parseRoute(hash) {
  if (hash === '#home') return { key: 'home' };
  const match = /^#p02\/([^?]+)(?:\?(.*))?$/.exec(hash);
  if (!match) return { key: 'home' };
  try { return { key: decodeURIComponent(match[1]), id: new URLSearchParams(match[2]).get('id') || undefined }; }
  catch { return { key: 'invalid' }; }
}
