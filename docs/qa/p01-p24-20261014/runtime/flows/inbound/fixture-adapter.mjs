// PREVIEW ONLY. This is not a proposed WMS API/schema or permission model.
export const INBOUND_NAMESPACE = 'hn-inbound-preview-v1';
import { INBOUND_TYPES, INBOUND_SUPPLIERS } from './catalogue.mjs';
export const BOARD_CODES = ['HN12345', 'HN12348', 'HN12349', 'HN12350', 'HN12351', 'HN12352', 'HN12353', 'HN12354', 'HN12355', 'HN12347', 'HN12345', 'HN12346'];
const serials = [...new Set(BOARD_CODES)];
export function createInboundFixtureAdapter({ delay = 350, sample = null } = {}) {
  const codes=sample==='b24'?[...serials,'B24-HN12356']:BOARD_CODES;
  let outcome = 'confirmed', calls = 0, generation = 0;
  const receipts = new Map();
  const wait = () => new Promise(resolve => setTimeout(resolve, delay));
  return {
    namespace: INBOUND_NAMESPACE, fixture: true, boardCodes:codes,
    reserveDocumentIdentity(doc){const m=/^fixture-inbound-0005(?:-run-(\d+))?$/.exec(doc?.documentId||'');if(m)generation=Math.max(generation,Number(m[1]||1));},
    setOutcome(value) { outcome = value; },
    canCheck() { return outcome !== 'status-unavailable'; },
    metrics() { return { recordCalls: calls, inventoryDelta: 0 }; },
    makeDocument(session) {
      // Unique local run identities; PN-0005 remains the B04 display sample.
      // Production must obtain document IDs/numbers from its approved adapter.
      const suffix = ++generation === 1 ? '' : `-run-${generation}`;
      return { namespace: INBOUND_NAMESPACE, documentId: `fixture-inbound-0005${suffix}`, number: 'PN-0005', scanSessionId: `fixture-inbound-scan-0005${suffix}`, version: 1,
        actorId: session.actor.id, actorName: session.actor.name, actorRole: session.actor.role, warehouseId: session.warehouse.id, warehouseName: session.warehouse.name,
        createdAt: '09/09/2026 08:32', typeId: INBOUND_TYPES[0].id, type: INBOUND_TYPES[0].name,
        supplierId: INBOUND_SUPPLIERS[0].id, supplier: INBOUND_SUPPLIERS[0].name, supplierCode: INBOUND_SUPPLIERS[0].code, note: '' };
    },
    validate(raw) {
      const index = (sample==='b24'?codes:serials).indexOf(raw);
      return index < 0 ? { kind: 'invalid', reason: 'Không tìm thấy mã trong danh mục sản phẩm đang dùng.' }
        : { kind: 'valid', raw, serial: serials[index], sku: index < 5 ? 'XP-420B' : index < 9 ? 'ZD421' : 'DS2208', quantity: 1 };
    },
    async record(request) {
      calls++; const selected = outcome; await wait();
      if (selected === 'failed') return {kind:'rejected',request:structuredClone(request),retryAllowed:true};
      if (['unknown','status-unavailable','not-recorded'].includes(selected)) return { kind: 'unknown' };
      const receipt = { kind: 'recorded', sentAt:'10/09/2026 11:25', request: structuredClone(request) };
      receipts.set(request.requestId, receipt);
      return selected === 'timeout-recorded' ? { kind: 'unknown' } : structuredClone(receipt);
    },
    async check(request) {
      await wait();
      const receipt = receipts.get(request.requestId);
      if (receipt) return structuredClone(receipt);
      return { kind: outcome === 'not-recorded' ? 'not-recorded' : 'unknown', request:structuredClone(request), retryAllowed:outcome === 'not-recorded' };
    },
  };
}
