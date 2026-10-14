import {DATA} from './history-model.mjs';

export const receiptHistoryId = documentId => `receipt:${documentId}`;

// Only P04/P05's verified receipt projection enters this adapter. B08 scan
// sessions and B22 audit events remain separate sources, never inferred here.
export function receiptHistoryRows(documents = []) {
  return [...new Map(documents.filter(d => ['inbound', 'outbound'].includes(d.type) && d.status === 'waiting' &&
    d.id && d.events?.some(e => e.id === d.id + ':receipt')).map(d => {
    const event = d.events.find(e => e.id === d.id + ':receipt');
    const id = receiptHistoryId(d.id);
    return [id, {id, activityId: id, namespace: 'verified-stock-receipt',
      type: d.type, label: event.label, documentId: d.number, sourceDocumentId: d.id,
      day: event.day, time: event.time, occurredAt: `${event.day}T${event.time}`,
      status: 'waiting', actor: d.actor, warehouse: d.warehouse, note: d.note,
      events: [event], attachments: d.attachments || [], sessionId: null}];
  })).values()];
}

export function historyRows(receipts = [], documentReferences = []) {
  const live = receiptHistoryRows(receipts);
  const liveIds = new Set(live.map(r => r.sourceDocumentId));
  // P12 overlays its baseline by exact document identity. Do not keep that
  // document's earlier B08 scene in the current aggregate as a second receipt.
  const replaced = new Set(documentReferences.filter(d => liveIds.has(d.id) && d.historyRecordId).map(d => d.historyRecordId));
  return [...live, ...DATA.records.filter(r => !replaced.has(r.id))];
}

export function linkedHistoryDocument(record, documents = []) {
  if (!record) return null;
  const matches = documents.filter(d => record.sourceDocumentId
    ? d.id === record.sourceDocumentId
    : d.historyRecordId === record.id);
  return matches.length === 1 ? matches[0] : null;
}
