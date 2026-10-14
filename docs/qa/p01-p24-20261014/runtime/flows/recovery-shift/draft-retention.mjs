// Page-memory preview only. No credentials, storage, network or cross-account transfer.
const key=s=>s?.session?.namespace&&s.session.actor?.id&&s.session.warehouse?.id?JSON.stringify([s.session.namespace,s.session.actor.id,s.session.warehouse.id]):null;
export function canRestorePreview(run,s,namespace){const d=run?.document;return !!key(s)&&s.previewReady===true&&s.session.permissions?.warehouseOperations===true&&d?.namespace===namespace&&d.actorId===s.session.actor.id&&d.warehouseId===s.session.warehouse.id&&typeof d.documentId==='string'&&typeof d.scanSessionId==='string'&&d.version!=null&&!run.busy&&!run.unknown&&!run.saveUnknown&&!d.uncertain&&!run.recorded&&run.outcome!=='recorded';}
export function createDraftRetention(){const items=new Map();return {
 retain(s,records){const scope=key(s);if(!scope)return {kind:'blocked'};try{const copies=structuredClone(records);for(const r of copies){const ns=r.source==='P03'?'hn-scanner-dialog-preview-v1':r.operation==='inbound'?'hn-inbound-preview-v1':r.operation==='outbound'?'hn-outbound-preview-v1':null;if(!ns||!canRestorePreview(r,s,ns))return {kind:'blocked'};}items.set(scope,copies);return {kind:'retained',count:copies.length};}catch{return {kind:'blocked'};}},
 read(s){if(!s?.previewReady||s.session?.permissions?.warehouseOperations!==true)return [];return structuredClone(items.get(key(s))||[]);},
 acknowledge(s){items.delete(key(s));},
};}
