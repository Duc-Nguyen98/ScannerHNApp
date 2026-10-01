// PREVIEW ONLY. Local fixtures; these are not WMS schemas or permissions.
import { GEOGRAPHY_VERSION } from './geography.mjs';
export const OUTBOUND_NAMESPACE = 'hn-outbound-preview-v1';
export const BOARD_CODES = ['HN12348','HN12349','HN12350','HN12351','HN12347','HN12345','HN12345','HN12346'];
export const EXTRA_CODES = ['HN12352','HN12353','HN12354'];
export const OUTBOUND_RECIPIENTS = [
  {id:'minh-phat',name:'Đại lý Minh Phát',phone:'0901 234 567',address:'123 Lê Lợi, Quận 1, TP. Hồ Chí Minh'},
  {id:'an-binh',name:'Cửa hàng An Bình',phone:'0912 345 678',address:'45 Nguyễn Trãi, TP. Hồ Chí Minh'},
];
export const OUTBOUND_GROUPS = [
  {id:'printers',name:'Máy in nhiệt',skus:['XP-420B','ZD421']},
  {id:'xp',name:'Máy in XP-420B',skus:['XP-420B']},
  {id:'zd',name:'Máy in ZD421',skus:['ZD421']},
];
export const OUTBOUND_SOURCES = [
  {id:'new',name:'Phiếu mới · PX-0005',number:'PX-0005',planned:1,recipientId:'minh-phat',groupId:'printers'},
  {id:'board-0005',name:'PX-0005 · Đại lý Minh Phát · 10 SP',number:'PX-0005',planned:10,recipientId:'minh-phat',groupId:'printers'},
  {id:'demo-0006',name:'PX-0006 · Cửa hàng An Bình · 2 SP',number:'PX-0006',planned:2,recipientId:'an-binh',groupId:'zd'},
];
const catalogue = new Map(['HN12345','HN12348','HN12349','HN12350','HN12351','HN12346','HN12347',...EXTRA_CODES].map((raw,i) => [raw, {sku:i<5?'XP-420B':'ZD421', quantity:1}]));
export function createOutboundFixtureAdapter({ delay = 350 } = {}) {
  let outcome = 'confirmed', calls = 0, generation = 0;
  const receipts = new Map();
  const wait = () => new Promise(resolve => setTimeout(resolve, delay));
  return {
    namespace: OUTBOUND_NAMESPACE, fixture: true,
    reserveDocumentIdentity(doc){const m=/^fixture-outbound-0005-(\d+)$/.exec(doc?.documentId||'');if(m)generation=Math.max(generation,Number(m[1]||1));},
    setOutcome(value) { outcome = value; },
    canCheck() { return outcome !== 'status-unavailable'; },
    metrics() { return { recordCalls:calls, inventoryDelta:0, records:receipts.size }; },
    makeDocument(session, sourceId = 'new') {
      const source = OUTBOUND_SOURCES.find(s => s.id === sourceId);
      if (!source) return null;
      const recipient = OUTBOUND_RECIPIENTS.find(r => r.id === source.recipientId), group = OUTBOUND_GROUPS.find(g => g.id === source.groupId);
      const suffix = `-${++generation}`;
      return { namespace:OUTBOUND_NAMESPACE, documentId:`fixture-outbound-0005${suffix}`, number:source.number, sourceId, scanSessionId:`fixture-outbound-scan-0005${suffix}`, version:1,
        actorId:session.actor.id, actorName:session.actor.name, warehouseId:session.warehouse.id, warehouseName:session.warehouse.name,
        recipient:recipient.name, recipientId:recipient.id, recipientType:'existing', phone:recipient.phone, address:'',addressSuggestion:recipient.address,provinceId:null,provinceName:'',districtId:null,districtName:'',geographyVersion:GEOGRAPHY_VERSION, planned:source.planned, plannedInput:String(source.planned), group:group.name, groupId:group.id,
        note:sourceId === 'board-0005' ? 'Xuất hàng theo đơn đặt hàng số\nDH-2026-0009 ngày 09/09/2026' : '' };
    },
    validate(raw, document) {
      if (raw === 'HN99999') return { kind:'blocked', reason:'Sản phẩm đã được xuất theo phiếu PX-0004.', product:{code:'HN99999',sku:'XP-420B',name:'Máy in nhiệt XP-420B',unit:'Cái'}, relatedDocument:{type:'Xuất kho',number:'PX-0004',status:'Đã ghi sổ',createdAt:'09/09/2026',readable:true} };
      if (raw === 'HN-WRONG-WAREHOUSE') return {kind:'invalid',reason:'Mã không thuộc kho đang thao tác (fixture).'};
      if (!document?.warehouseId || !catalogue.has(raw)) return {kind:'invalid',reason:'Không tìm thấy mã hợp lệ trong nguồn sản phẩm fixture.'};
      const group = OUTBOUND_GROUPS.find(g => g.id === document.groupId);
      if (!group?.skus.includes(catalogue.get(raw).sku)) return {kind:'invalid',reason:'Sản phẩm không thuộc nhóm hàng đã chọn.'};
      return {kind:'valid',raw,...catalogue.get(raw)};
    },
    async record(request) {
      calls++; const selected=outcome; await wait();
      if (receipts.has(request.requestId)) return structuredClone(receipts.get(request.requestId));
      if (selected === 'failed') return {kind:'rejected',request:structuredClone(request),retryAllowed:true};
      if (['unknown','status-unavailable','not-recorded'].includes(selected)) return {kind:'unknown'};
      const receipt={kind:'recorded',request:structuredClone(request), sentAt:'09/09/2026 14:32'};
      receipts.set(request.requestId,receipt);
      return selected === 'timeout-recorded' ? {kind:'unknown'} : structuredClone(receipt);
    },
    async check(request) {
      await wait(); return receipts.has(request.requestId) ? structuredClone(receipts.get(request.requestId)) : {kind:outcome==='not-recorded'?'not-recorded':'unknown',request:structuredClone(request),retryAllowed:outcome === 'not-recorded'};
    },
  };
}
