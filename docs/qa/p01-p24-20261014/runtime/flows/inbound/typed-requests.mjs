import {requireP14,uuid,only,record} from '../recovery-shift/api-contract.mjs';
const clone=v=>structuredClone(v);
function identity(i){requireP14([i?.draftId,i?.scanSessionId,i?.warehouseId,i?.requestId].every(uuid)&&Number.isSafeInteger(i.version)&&i.version>=0,'P04_REQUEST_IDENTITY_REQUIRED');}
const headers=i=>({'Idempotency-Key':i.requestId,'If-Match':`"${i.version}"`});
// Typed P04 reuses its own persisted P03 row through the native controller.
// No generic /drafts projection, shadow draft or second document is created.
export function p04SaveRequest(snapshot,i){
 identity(i);only(snapshot,['inbound_type','supplier_id','name','note','doc_date','items']);
 requireP14(record(snapshot)&&Object.hasOwn(snapshot,'name')&&(snapshot.name===null||typeof snapshot.name==='string')&&snapshot.inbound_type==='receipt'&&Array.isArray(snapshot.items),'P04_FULL_SNAPSHOT_REQUIRED');
 return {method:'PUT',path:`/api/v1/mini-app/inbound/drafts/${i.draftId}`,headers:headers(i),body:{warehouse_id:i.warehouseId,scan_session_id:i.scanSessionId,...clone(snapshot)}};
}
export function p04RecordRequest(i,{clientRequestId}={}){
 identity(i);const r=i.saved,p=r?.nativeEvidence;
 requireP14(i.version>0&&r?.state==='CLEAN'&&r.id===i.draftId&&r.snapshot?.scan_session_id===i.scanSessionId&&r.warehouseId===i.warehouseId&&r.version===i.version&&r.confirmedVersion===i.version&&r.receiptVerified===true&&p?.verified===true&&p.protocol==='mini-app-p03-v1'&&p.actorId===r.actorId&&p.authSessionId===r.authSessionId&&p.operation==='INBOUND'&&p.requestId===r.lastRequestId&&uuid(p.requestId)&&p.requestId!==i.requestId&&p.command==='SAVE'&&p.outcome==='SUCCEEDED'&&p.documentId===i.draftId&&p.scanSessionId===i.scanSessionId&&p.warehouseId===i.warehouseId&&p.version===i.version&&p.httpStatus>=200&&p.httpStatus<300&&p.httpStatus!==202&&JSON.stringify(r.snapshot)===JSON.stringify(r.savedSnapshot),'P04_SAVE_RECEIPT_REQUIRED');
 requireP14(typeof r.snapshot.name==='string'&&r.snapshot.name.trim().length>0,'P04_SAVED_NAME_REQUIRED');
 if(clientRequestId!==undefined)requireP14(clientRequestId===i.requestId,'REQUEST_IDENTITY_MISMATCH');
 return {method:'POST',path:`/api/v1/mini-app/inbound/drafts/${i.draftId}/record`,headers:headers(i),body:{warehouse_id:i.warehouseId,scan_session_id:i.scanSessionId,...(clientRequestId!==undefined?{client_request_id:clientRequestId}:{})}};
}
