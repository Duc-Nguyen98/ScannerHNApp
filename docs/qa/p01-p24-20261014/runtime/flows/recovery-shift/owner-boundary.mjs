import {P14ApiError,P14_RELEASE,requireP14,record,uuid,scopeKey} from './api-contract.mjs';
export const REQUIRED_OWNER_INVENTORY=Object.freeze(['P03','P04','P05','P07','P09','P19']);
export const journalBlocks=j=>!!j&&(j.inflight===true||['UNKNOWN','INFLIGHT'].includes(j.outcome)||j.httpStatus===202||j.response_status===202||['PENDING_OWNER_RESULT','UNSUPPORTED_OWNER_SAVE'].includes(j.classification||j.operation));
function exactSaveProof(r,c){const p=r.nativeEvidence;if(r.owner==='P07'&&r.kind==='NFC_CONFIRMATION')return p?.verified===true&&p.protocol==='mini_app_nfc_confirm'&&p.command==='CONFIRM'&&p.outcome==='SUCCEEDED'&&p.actorId===c.actorId&&p.authSessionId===c.authSessionId&&p.warehouseId===c.warehouseId&&p.itemId===r.id&&p.physicalCodeId===r.snapshot.physical_code_id&&p.requestId===r.lastRequestId&&typeof p.requestId==='string'&&p.requestId.length>0&&p.requestId.length<=128&&!/[\x00-\x1f\x7f]/.test(p.requestId)&&typeof p.requestHash==='string'&&/^v2:[0-9a-f]{64}(?:\||$)/i.test(p.requestHash)&&p.requestHash===r.lastRequestHash&&p.httpStatus>=200&&p.httpStatus<300&&p.httpStatus!==202;return p?.verified===true&&p.protocol==='mini-app-p03-v1'&&JSON.stringify(r.snapshot)===JSON.stringify(r.savedSnapshot)&&p.command==='SAVE'&&p.outcome==='SUCCEEDED'&&p.actorId===c.actorId&&p.authSessionId===c.authSessionId&&p.warehouseId===c.warehouseId&&p.documentId===r.id&&p.scanSessionId===r.snapshot.scan_session_id&&p.operation===r.operation&&p.requestId===r.lastRequestId&&uuid(p.requestId)&&p.version===r.version&&Number.isInteger(p.httpStatus)&&p.httpStatus>=200&&p.httpStatus<300&&p.httpStatus!==202;}
const snapshotSignature=r=>JSON.stringify([r.owner,r.id,r.actorId,r.authSessionId,r.warehouseId,r.revision,r.version,r.confirmedVersion,r.receiptVerified,r.unsupported,r.state,r.snapshot,r.journal,r.nativeEvidence,r.lastRequestId,r.savedSnapshot]);
// Inventory must come from each owner's journal and saved-receipt projection.
// A missing adapter is a blocker, never evidence that the owner has no work.
export function inspectOwners(inventory,c){scopeKey(c);const blockers=[],rows=[];
 if(!record(inventory)||!Array.isArray(inventory.covered)||!Array.isArray(inventory.records))return {localState:'UNKNOWN',pendingRequestIds:[],blockers:['OWNER_INVENTORY_UNAVAILABLE'],revision:'unavailable',records:[]};
 for(const owner of REQUIRED_OWNER_INVENTORY)if(!inventory.covered.includes(owner))blockers.push('OWNER_INVENTORY_MISSING:'+owner);
 const identities=new Set();
 for(const r of inventory.records){
  requireP14(record(r)&&REQUIRED_OWNER_INVENTORY.includes(r.owner)&&uuid(r.id)&&typeof r.revision==='string'&&Number.isSafeInteger(r.version)&&r.version>=0&&['CLEAN','DIRTY','UNKNOWN','BUSY'].includes(r.state)&&record(r.snapshot)&&Array.isArray(r.journal),'INVALID_OWNER_INVENTORY');
  requireP14(!identities.has(r.id),'DUPLICATE_OWNER');identities.add(r.id);
  if(r.actorId!==c.actorId||r.authSessionId!==c.authSessionId||r.warehouseId!==c.warehouseId)blockers.push('OWNER_SCOPE_MISMATCH:'+r.owner);
  if(r.unsupported===true)blockers.push('OWNER_SCHEMA_UNSUPPORTED:'+r.owner);
  if(r.state==='UNKNOWN'||r.state==='BUSY'||r.journal.some(journalBlocks))blockers.push('OWNER_PENDING:'+r.owner);
  else if(r.state==='DIRTY')blockers.push('OWNER_DIRTY:'+r.owner);
  else if(r.confirmedVersion!==r.version||r.receiptVerified!==true||inventory.lifecycleEvidenceRequired===true&&!exactSaveProof(r,c))blockers.push('OWNER_RECEIPT_UNCONFIRMED:'+r.owner);
  rows.push(r);
 }
 const globalJournal=inventory.journal||[];requireP14(Array.isArray(globalJournal),'INVALID_OWNER_INVENTORY');for(const j of globalJournal)if(journalBlocks(j))blockers.push('OWNER_JOURNAL_PENDING:'+j.owner);const pending=[...new Set([...rows.flatMap(r=>r.journal),...globalJournal].filter(journalBlocks).map(j=>j.requestId).filter(x=>typeof x==='string'))];
 return {localState:blockers.length?'UNKNOWN':'CLEAN',pendingRequestIds:pending,blockers,revision:JSON.stringify([inventory.covered.slice().sort(),rows.map(snapshotSignature),globalJournal]),records:rows};
}
export async function saveDirtyOwners({getInventory,getContext,saveOwner}){const c=structuredClone(getContext()),scope=scopeKey(c),initial=inspectOwners(getInventory(),c),results=[];
 for(const r of initial.records.map(row=>structuredClone(row))){if(r.state!=='DIRTY')continue;if(r.unsupported||r.actorId!==c.actorId||r.authSessionId!==c.authSessionId||r.warehouseId!==c.warehouseId||r.journal.some(journalBlocks)){results.push({owner:r.owner,id:r.id,outcome:'BLOCKED'});continue;}
  const before=snapshotSignature(r),live=getInventory().records.find(x=>x.owner===r.owner&&x.id===r.id);if(!live||snapshotSignature(live)!==before){results.push({owner:r.owner,id:r.id,outcome:'UNCONFIRMED'});continue;}let receipt;try{requireP14(scopeKey(getContext())===scope,'STALE_CONTEXT');receipt=await saveOwner(r.owner,structuredClone(r));}catch{results.push({owner:r.owner,id:r.id,outcome:'UNKNOWN'});continue;}
  if(scopeKey(getContext())!==scope){results.push({owner:r.owner,id:r.id,outcome:'STALE'});continue;}
  const current=getInventory().records.find(x=>x.owner===r.owner&&x.id===r.id);
  // The owner, not this bridge, must verify its own receipt/header/version and
  // mark CLEAN. New edits/inflight always invalidate success for the close gate.
  const unchanged=current&&JSON.stringify([r.revision,r.snapshot])===JSON.stringify([current.revision,current.snapshot]);
  const clean=unchanged&&current.state==='CLEAN'&&current.receiptVerified===true&&current.confirmedVersion===current.version&&!current.journal.some(journalBlocks)&&receipt?.verified===true&&receipt.owner===r.owner&&receipt.id===r.id&&receipt.version===current.version;
  results.push({owner:r.owner,id:r.id,outcome:clean?'VERIFIED':'UNCONFIRMED',captured:before===snapshotSignature(r)});
 }
 return {results,inventory:inspectOwners(getInventory(),getContext())};
}
export function fenceRoute(method,path){requireP14(typeof method==='string'&&typeof path==='string'&&path.startsWith('/')&&!/[?#%\\]/.test(path),'INVALID_OWNER_ROUTE');const m=method.toUpperCase();requireP14(['GET','HEAD','OPTIONS','TRACE','POST','PUT','PATCH','DELETE'].includes(m),'INVALID_OWNER_ROUTE');const applies=!['GET','HEAD','OPTIONS','TRACE'].includes(m)&&path.startsWith('/api/v1/mini-app/')&&!path.startsWith('/api/v1/mini-app/work-shifts/');const unsupported=applies&&['PUT','PATCH'].includes(m)&&!path.startsWith('/api/v1/mini-app/drafts/');const explicit={'/api/v1/mini-app/inbound/record':'INBOUND','/api/v1/mini-app/outbound/record':'OUTBOUND','/api/v1/mini-app/warranty-cases':'WARRANTY','/api/v1/mini-app/warranty-component-issues/record':'COMPONENT_ISSUE','/api/v1/mini-app/component-issue-documents/record':'COMPONENT_ISSUE'};
 return {applies,saveUnsupported:unsupported,businessProjection:applies&&m==='POST'?explicit[path]||null:null};}
export function prepareOwnerCorrelation(request,c,{requestId,preparation=false}={}){requireP14(preparation===true&&P14_RELEASE.productionActivation===false,'ACTIVATION_OFF');const rule=fenceRoute(request.method,request.path);const copy=structuredClone(request);if(!rule.applies)return {request:copy,...rule};scopeKey(c);requireP14(uuid(requestId),'SHIFT_COMMAND_IDENTITY_REQUIRED');copy.headers||={};for(const k of Object.keys(copy.headers))if(/^(x-work-shift-id|x-request-id)$/i.test(k)){const expected=k.toLowerCase()==='x-work-shift-id'?c.shiftId:requestId;requireP14(copy.headers[k]===expected,'SHIFT_REQUEST_CONFLICT');delete copy.headers[k];}copy.headers['X-Work-Shift-ID']=c.shiftId;copy.headers['X-Request-ID']=requestId;return {request:copy,...rule};}
export function ownerFenceResult(status,code){return {requiresOwnerReconcile:status===409&&['OWNER_RECONCILE_REQUIRED','SHIFT_REQUEST_CONFLICT'].includes(code),blocksClose:status===202,retryAllowed:false};}
