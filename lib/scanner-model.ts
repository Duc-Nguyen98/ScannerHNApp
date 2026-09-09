/** Local-only, deterministic preview domain. No production transport. */
import {assertWrite,documentPermission,type Actor,type WarehouseStatus} from './scanner-policy.ts';
export type Kind = 'in' | 'out' | 'parts';
export type CaseStatus =
  | 'Tiếp nhận'
  | 'Đang kiểm tra'
  | 'Đang sửa chữa'
  | 'Hoàn tất'
  | 'Đã trả'
  | 'Đã huỷ';
export type Item = {
  code: string;
  sku: string;
  name: string;
  type: 'machine' | 'part' | 'box';
  qty: number;
  status: 'Chờ nhập' | 'Trong kho' | 'Đã xuất';
  warehouse: string;
};
export type Line = { code: string; qty: number };
export type Doc = {
  id: string;
  kind: Kind;
  name: string;
  recipient: string;
  phone: string;
  address: string;
  group: string;
  caseId?: string;
  note: string;
  lines: Line[];
  status: 'Chờ duyệt' | 'Đã ghi sổ' | 'Đã huỷ';
  at: string;
  key: string;
};
export type Warranty = {
  id: string;
  code: string;
  product: string;
  customer: string;
  phone: string;
  address: string;
  fault: string;
  accessories: string;
  status: CaseStatus;
  timeline: { at: string; text: string }[];
  media: { name: string; category: string }[];
};
export type Tag = {
  uid: string;
  code: string;
  status: 'Đang dùng' | 'Ngừng dùng' | 'Thất lạc' | 'Hỏng';
  reason: string;
};
export type Store = {
  warehouseStatus?: WarehouseStatus;
  version: 1;
  items: Item[];
  docs: Doc[];
  cases: Warranty[];
  tags: Tag[];
  events: { at: string; text: string }[];
};
export const stamp = () => new Date().toLocaleString('vi-VN');
export const canIssueParts = (s: CaseStatus) =>
  s === 'Đang kiểm tra' || s === 'Đang sửa chữa';
export const transitions: Record<CaseStatus, CaseStatus[]> = {
  'Tiếp nhận': ['Đang kiểm tra', 'Đã huỷ'],
  'Đang kiểm tra': ['Đang sửa chữa', 'Hoàn tất', 'Đã huỷ'],
  'Đang sửa chữa': ['Hoàn tất', 'Đã huỷ'],
  'Hoàn tất': ['Đã trả'],
  'Đã trả': [],
  'Đã huỷ': [],
};
export function seedStore(): Store {
  const items: Item[] = [
    [
      'MAY-001',
      'HN-MCC-26',
      'Máy cắt cỏ Hoa Nam E26',
      'machine',
      1,
      'Trong kho',
    ],
    [
      'MAY-002',
      'HN-MCC-26',
      'Máy cắt cỏ Hoa Nam E26',
      'machine',
      1,
      'Trong kho',
    ],
    [
      'MAY-003',
      'HN-MBN-11',
      'Máy bơm nước Hoa Nam B11',
      'machine',
      1,
      'Đã xuất',
    ],
    ['MAY-004', 'HN-MCC-26', 'Máy cắt cỏ Hoa Nam E26', 'machine', 1, 'Đã xuất'],
    ['MAY-005', 'HN-MBN-11', 'Máy bơm nước Hoa Nam B11', 'machine', 1, 'Đã xuất'],
    ['MAY-006', 'HN-MCC-26', 'Máy cắt cỏ Hoa Nam E26', 'machine', 1, 'Đã xuất'],
    ['MAY-007', 'HN-MBN-11', 'Máy bơm nước Hoa Nam B11', 'machine', 1, 'Đã xuất'],
    ['MAY-008', 'HN-MCC-26', 'Máy cắt cỏ Hoa Nam E26', 'machine', 1, 'Đã xuất'],
    [
      'NEW-001',
      'HN-MCC-26',
      'Máy cắt cỏ Hoa Nam E26',
      'machine',
      1,
      'Chờ nhập',
    ],
    [
      'NEW-002',
      'HN-MBN-11',
      'Máy bơm nước Hoa Nam B11',
      'machine',
      1,
      'Chờ nhập',
    ],
    ['LK-001', 'HN-BUGI-01', 'Bugi đánh lửa', 'part', 1, 'Trong kho'],
    ['LK-002', 'HN-BUGI-01', 'Bugi đánh lửa', 'part', 1, 'Trong kho'],
    ['LK-003', 'HN-LOC-02', 'Bộ lọc nhiên liệu', 'part', 1, 'Trong kho'],
    ['BOX-001', 'HN-GIOANG-03', 'Gioăng cao su', 'box', 20, 'Trong kho'],
    ['BOX-002', 'HN-OC-04', 'Ốc lắp máy M8', 'box', 40, 'Trong kho'],
    ['NEW-LK-001', 'HN-LOC-02', 'Bộ lọc nhiên liệu', 'part', 1, 'Chờ nhập'],
  ].map(
    (r) =>
      ({
        code: r[0],
        sku: r[1],
        name: r[2],
        type: r[3],
        qty: r[4],
        status: r[5],
        warehouse: 'Kho Hoa Nam • Kệ A01',
      }) as Item,
  );
  const statuses: CaseStatus[] = [
    'Đang kiểm tra',
    'Đang sửa chữa',
    'Tiếp nhận',
    'Hoàn tất',
    'Đã trả',
    'Đã huỷ',
  ];
  return {
    version: 1,
    warehouseStatus: 'active',
    items,
    docs: [
      {
        id: 'PN-0001',
        kind: 'in',
        name: 'Lô máy đầu ca',
        recipient: 'Nhà cung cấp Hoa Nam',
        phone: '',
        address: '',
        group: '',
        note: 'Kiểm đếm theo mã hiện vật',
        lines: [{ code: 'NEW-002', qty: 1 }],
        status: 'Chờ duyệt',
        at: '08:10 08/09/2026',
        key: 'seed-in',
      },
    ],
    cases: statuses.map((status, i) => ({
      id: `BH-00${i + 1}`,
      code: `MAY-${String(i+3).padStart(3,'0')}`,
      product: i % 2 ? 'Máy cắt cỏ Hoa Nam E26' : 'Máy bơm nước Hoa Nam B11',
      customer: `Khách hàng ${i + 1}`,
      phone: '0900000000',
      address: 'Địa chỉ tiếp nhận đã ghi trên phiếu',
      fault: i % 2 ? 'Máy khó khởi động' : 'Rò nước tại đầu bơm',
      accessories: 'Dây nguồn, bộ dụng cụ',
      status,
      timeline: [
        { at: '08:30 08/09/2026', text: 'Tiếp nhận sản phẩm và phụ kiện' },
        { at: '09:00 08/09/2026', text: `Trạng thái hiện tại: ${status}` },
      ],
      media: [],
    })),
    tags: [
      { uid: 'NFC-001', code: 'MAY-003', status: 'Đang dùng', reason: '' },
    ],
    events: [
      { at: '08:10 08/09/2026', text: 'PN-0001 • chờ kiểm tra và duyệt' },
    ],
  };
}
export function validateLine(
  store: Store,
  kind: Kind,
  line: Line,
  existing: Line[],
  caseId?: string,
): string | null {
  const item = store.items.find((i) => i.code === line.code);
  if (!item) return 'Không tìm thấy mã. Kiểm tra tem hoặc nhập lại mã.';
  if (existing.some((l) => l.code === line.code))
    return 'Mã này đã có trong danh sách. Không cộng thêm lần thứ hai.';
  if (!Number.isSafeInteger(line.qty) || line.qty < 1)
    return 'Số lượng phải là số nguyên lớn hơn 0.';
  if (item.type !== 'box' && line.qty !== 1)
    return 'Mỗi mã hiện vật tương ứng 1 sản phẩm.';
  if (kind === 'parts') {
    const c = store.cases.find((c) => c.id === caseId);
    if (!c || !canIssueParts(c.status))
      return 'Hồ sơ không còn ở trạng thái được xuất linh kiện.';
    if (item.type === 'machine')
      return 'Đây là máy, không phải linh kiện. Vui lòng quét đúng mã linh kiện hoặc hộp.';
  }
  if (kind === 'in' && item.status !== 'Chờ nhập')
    return 'Mã đã nhập hoặc đã xuất. Không thể nhập lại hiện vật này.';
  if (kind !== 'in' && (item.status !== 'Trong kho' || line.qty > item.qty))
    return 'Không đủ tồn khả dụng trong kho xuất. Kiểm tra số lượng hoặc chọn mã khác.';
  const reserved = store.docs
    .filter((d) => d.status === 'Chờ duyệt')
    .flatMap((d) => d.lines)
    .some((l) => l.code === line.code);
  if (reserved)
    return 'Mã đang thuộc phiếu chờ duyệt. Hoàn tất phiếu đó trước khi tiếp tục.';
  return null;
}
export function createDocument(
  store: Store,
  input: Omit<Doc, 'id' | 'status' | 'at'>,
  actor?: Actor|null,
): Store {
  assertWrite(store,actor,documentPermission(input.kind,'create'));
  if (store.docs.some((d) => d.key === input.key)) return store;
  if (!input.lines.length) throw new Error('Cần ít nhất một mã hợp lệ.');
  input.lines.forEach((l, i) => {
    const e = validateLine(
      store,
      input.kind,
      l,
      input.lines.slice(0, i),
      input.caseId,
    );
    if (e) throw new Error(e);
  });
  // Imported/mock historical numbers may have gaps; never reuse an existing document ID.
  const sequence=Math.max(store.docs.length,...store.docs.map(d=>Number(d.id.match(/-(\d+)$/)?.[1])||0))+1;
  const id = `${input.kind === 'in' ? 'PN' : input.kind === 'parts' ? 'XLK' : 'PX'}-${String(sequence).padStart(4, '0')}`;
  const doc: Doc = { ...input, id, status: 'Chờ duyệt', at: stamp() };
  return {
    ...store,
    docs: [doc, ...store.docs],
    events: [
      {
        at: stamp(),
        text: `${id} • gửi duyệt${doc.caseId ? ` • ${doc.caseId}` : ''}`,
      },
      ...store.events,
    ],
  };
}
export function postDocument(store: Store, id: string, actor?:Actor|null): Store {
  const doc = store.docs.find((d) => d.id === id);
  if (!doc) throw new Error('Không tìm thấy phiếu.');
  assertWrite(store,actor,documentPermission(doc.kind,'post'));
  if (doc.status === 'Đã ghi sổ') return store;
  if (doc.status !== 'Chờ duyệt')
    throw new Error('Phiếu không ở trạng thái chờ duyệt.');
  const checkStore = { ...store, docs: store.docs.filter((d) => d.id !== id) };
  doc.lines.forEach((l, i) => {
    const e = validateLine(
      checkStore,
      doc.kind,
      l,
      doc.lines.slice(0, i),
      doc.caseId,
    );
    if (e) throw new Error(e);
  });
  return {
    ...store,
    items: store.items.map((item) => {
      const l = doc.lines.find((l) => l.code === item.code);
      if (!l) return item;
      if (doc.kind === 'in')
        return { ...item, status: 'Trong kho', qty: l.qty };
      return {
        ...item,
        qty: item.type === 'box' ? item.qty - l.qty : 0,
        status:
          item.type === 'box' && item.qty - l.qty > 0 ? 'Trong kho' : 'Đã xuất',
      };
    }),
    docs: store.docs.map((d) =>
      d.id === id ? { ...d, status: 'Đã ghi sổ' } : d,
    ),
    cases: store.cases.map((c) =>
      c.id === doc.caseId
        ? {
            ...c,
            timeline: [
              ...c.timeline,
              {
                at: stamp(),
                text: `Xuất linh kiện ${id} • ${doc.lines.reduce((s, l) => s + l.qty, 0)} cái`,
              },
            ],
          }
        : c,
    ),
    events: [
      {
        at: stamp(),
        text: `${id} • đã ghi sổ ${doc.kind === 'in' ? 'nhập' : 'xuất'}`,
      },
      ...store.events,
    ],
  };
}
export function changeCase(
  store: Store,
  id: string,
  status: CaseStatus,
  note: string,
  actor?:Actor|null,
): Store {
  assertWrite(store,actor,'warranty.manage');
  const c = store.cases.find((c) => c.id === id);
  if (!c || !transitions[c.status].includes(status))
    throw new Error('Chuyển trạng thái không hợp lệ.');
  if (!note.trim())
    throw new Error('Nhập kết quả xử lý hoặc lý do chuyển trạng thái.');
  if (
    ['Hoàn tất', 'Đã huỷ'].includes(status) &&
    store.docs.some((d) => d.caseId === id && d.status === 'Chờ duyệt')
  )
    throw new Error(
      'Còn phiếu linh kiện chờ duyệt. Xử lý phiếu trước khi đóng hồ sơ.',
    );
  return {
    ...store,
    events: [{at:stamp(),text:`${id} • ${status} • ${note}`},...store.events],
    cases: store.cases.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            timeline: [
              ...c.timeline,
              { at: stamp(), text: `${status} • ${note}` },
            ],
          }
        : c,
    ),
  };
}
