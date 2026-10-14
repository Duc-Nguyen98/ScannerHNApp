// Pinned owner READ contract only. Flags never activate production or hardware.
export const P15_RELEASE=Object.freeze({commit:'b972e6a6c05e665b98beaf390db999e9a70c5393',contract:'p15-owner-read-v1',sourceRevision:'47636e0a3fc688be07071e2d2af5508b226e8805',status:'PENDING_OWNER_CONTRACT_AND_LIVE_TEST',productionActivation:false,liveVerified:false,hardwareVerified:false});
export const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const integer=(v,min=0)=>Number.isSafeInteger(v)&&v>=min;
const code=v=>typeof v==='string'&&/^[A-Z][A-Z0-9_]{0,99}$/.test(v)?v:null;
export class P15ReadError extends Error {
  constructor(codeValue,status=null,meta={}) {super('Nguồn đọc chưa được xác minh.');this.name='P15ReadError';this.code=codeValue;this.status=status;this.ownerCode=code(meta.ownerCode);this.traceId=uuid(meta.traceId)?meta.traceId:null;this.requestTraceId=uuid(meta.requestTraceId)?meta.requestTraceId:null;this.provenance=meta.provenance||'local-contract';this.nativeOutcome='UNKNOWN';this.mayCreateNewRequest=false;}
}
export function requireP15(ok,c='INVALID_RESPONSE'){if(!ok)throw new P15ReadError(c);}
const spec=(owner,mode,path,query,kind,contract=null,permission=null)=>Object.freeze({owner,mode,path,query:Object.freeze([...query]),kind,contract,permission});
export const P15_READS=Object.freeze({
 P01_ME:spec('P01',null,'/api/v1/auth/me',[],'session'),
 P03_CONTEXT:spec('P03',null,'/api/v1/mini-app/p03/context',[],'support','mini-app-p03-v1'),
 P04_RECONCILE:spec('P04','SCOPED','/api/v1/mini-app/inbound/drafts/{draft_id}/requests/{operation_key}',['warehouse_id','scan_session_id','command'],'reconcile','mini-app-p04-v1','inbound.view'),
 P04_CURRENT_DRAFT:spec('P04','SCOPED','/api/v1/mini-app/inbound/drafts/{draft_id}',['warehouse_id','scan_session_id'],'current-draft','mini-app-p04-v1','inbound.view'),
 P04_CURRENT_DOCUMENT:spec('P04','SCOPED','/api/v1/mini-app/inbound/documents/{business_document_id}',['warehouse_id'],'current-document','mini-app-p04-v1','inbound.view'),
 P05_RECONCILE:spec('P05','SOURCE_LINKED','/api/v1/mini-app/drafts/{draft_id}/requests/{operation_key}',['warehouse_id','operation','scan_session_id','command'],'reconcile','mini-app-p03-v1','outbound.view'),
 P05_CURRENT_DRAFT:spec('P05','SOURCE_LINKED','/api/v1/mini-app/drafts/{draft_id}',['warehouse_id','operation','scan_session_id'],'current-draft','mini-app-p03-v1','outbound.view'),
 P05_CURRENT_DOCUMENT:spec('P05','SOURCE_LINKED','/api/v1/mini-app/outbound/documents/{business_document_id}',['warehouse_id'],'current-document','mini-app-p05-v1','outbound.view'),
 P07_CONFIRMATION:spec('P07','CONFIRM','/api/v1/mini-app/items/{item_id}/nfc/confirmation',['warehouse_id'],'reconcile','mini-app-p07-v1','physical_code.assign_rfid'),
 P07_CURRENT_TAG:spec('P07','CONFIRM','/api/v1/mini-app/nfc-tags/{physical_code_id}',['warehouse_id'],'current-mapping','mini-app-p07-v1','physical_code.assign_rfid|inventory.trace'),
});
const referenceKeys=['owner','mode','command','operation_key','actor_id','auth_session_id','warehouse_id','scan_session_id','draft_id','original_version','source_document_id','source_version','business_document_id','item_id','physical_code_id','hardware_uid'];
export const CHECKPOINT_ALLOWLIST=Object.freeze(['owner','mode','command','operation_key','actor_id','auth_session_id','warehouse_id','scan_session_id','draft_id','original_version','business_document_id','source_document_id','item_id','physical_code_id','caller','scroll_offset','outcome']);
// A small ephemeral reference, not a second request journal. Never read a full body.
export function safeOwnerReference(value){requireP15(object(value),'OWNER_REFERENCE_REQUIRED');const copy={};for(const k of referenceKeys)if(Object.hasOwn(value,k)){requireP15(['string','number'].includes(typeof value[k]),'INVALID_REFERENCE_FIELD');copy[k]=value[k];}return Object.freeze(copy);}
export function safeCheckpoint(value){const copy={};for(const k of CHECKPOINT_ALLOWLIST)if(Object.hasOwn(value||{},k)&&['string','number'].includes(typeof value[k]))copy[k]=value[k];return copy;}
export function contextKey(ctx){requireP15(ctx?.trusted===true&&uuid(ctx.actor_id)&&uuid(ctx.auth_session_id)&&(ctx.warehouse_id===null||uuid(ctx.warehouse_id))&&integer(ctx.generation)&&Array.isArray(ctx.permissions)&&ctx.permissions.every(p=>typeof p==='string'),'AUTH_CONTEXT_REQUIRED');return JSON.stringify([ctx.actor_id,ctx.auth_session_id,ctx.warehouse_id,ctx.generation,[...ctx.permissions].sort(),ctx.owner_gates?.P07===true]);}
export function buildOwnerRead(readId,value,ctx){
 contextKey(ctx);requireP15(Object.hasOwn(P15_READS,readId),'READ_NOT_APPROVED');const s=P15_READS[readId],r=safeOwnerReference(value);
 requireP15(r.owner===s.owner&&(s.mode===null||r.mode===s.mode),'OWNER_MODE_NOT_SUPPORTED');
 requireP15(r.actor_id===ctx.actor_id&&r.auth_session_id===ctx.auth_session_id&&(s.owner==='P01'||s.owner==='P03'||r.warehouse_id===ctx.warehouse_id),'OWNER_CONTEXT_MISMATCH');
 if(s.permission)requireP15(s.permission.split('|').some(p=>ctx.permissions.includes(p)),'OWNER_READ_PERMISSION_REQUIRED');
 if(s.owner==='P07')requireP15(ctx.owner_gates?.P07===true,'P07_OWNER_GATE_PENDING');
 if(s.owner==='P05'){requireP15(uuid(r.source_document_id)&&integer(r.source_version,1),'SOURCE_LINK_EVIDENCE_REQUIRED');if(r.business_document_id!==undefined)requireP15(r.business_document_id===r.source_document_id,'SOURCE_ID_MISMATCH');}
 let path=s.path.replace(/\{([^}]+)\}/g,(_,key)=>{requireP15(uuid(r[key]),'CANONICAL_ID_REQUIRED');return encodeURIComponent(r[key]);});
 const query={};for(const k of s.query){const v=k==='operation'?'OUTBOUND':r[k];if(k==='command')requireP15(['SAVE','CANCEL','RECORD'].includes(v),'ORIGINAL_COMMAND_REQUIRED');else if(k!=='operation')requireP15(uuid(v),'CANONICAL_ID_REQUIRED');query[k]=v;}
 const headers={};
 if(readId==='P07_CONFIRMATION'){requireP15(typeof r.operation_key==='string'&&r.operation_key.trim().length>=8&&r.operation_key.trim().length<=100&&!/[\r\n]/.test(r.operation_key),'ORIGINAL_PATCH_KEY_REQUIRED');headers['Idempotency-Key']=r.operation_key;}
 if(s.kind==='reconcile'&&s.owner!=='P07')requireP15(integer(r.original_version),'ORIGINAL_VERSION_REQUIRED');
 return {readId,spec:s,reference:r,path,query,headers};
}
const denialCodes=new Set(['ACCESS_DENIED','WAREHOUSE_ACCESS_DENIED','P03_OPERATION_DENIED','P04_OPERATION_DENIED','FORBIDDEN','PERMISSION_DENIED']);
export function ownerError(status,body,{readId,traceId}={}){
 const valid=object(body)&&body.success===false&&object(body.error)&&code(body.error.code)&&uuid(body.meta?.request_id)&&(!traceId||body.meta.request_id===traceId);
 const error=new P15ReadError(valid?body.error.code:'HTTP_UNCLASSIFIED',status,{ownerCode:valid?body.error_code:null,traceId:body?.meta?.request_id,requestTraceId:traceId,provenance:valid?'trusted-owner-json':'transport-unclassified'});
 if(valid&&status===401)error.panel='expired';
 if(valid&&status===403&&Object.hasOwn(P15_READS,readId)&&denialCodes.has(body.error.code))error.panel='forbidden';
 return error;
}
export function parseOwnerRead(body,built,ctx){
 const {spec:s,reference:r,readId}=built;
 requireP15(object(body)&&body.success===true&&object(body.data)&&object(body.meta)&&uuid(body.meta.request_id),'INVALID_OWNER_ENVELOPE');
 if(s.contract)requireP15(body.meta.contract===s.contract,'OWNER_CONTRACT_MISMATCH');
 if(s.owner==='P07')requireP15(body.meta.warehouse_id===r.warehouse_id,'WAREHOUSE_MISMATCH');
 const d=body.data,operation=s.owner==='P04'?'INBOUND':'OUTBOUND';
 const result={kind:'owner-observation',readId,owner:s.owner,observation:s.kind,nativeOutcome:null,resolvesOperation:false,mayCreateNewRequest:false,traceId:body.meta.request_id};
 function draft(value){
  requireP15(object(value)&&value.document_id===r.draft_id&&value.scan_session_id===r.scan_session_id&&value.warehouse_id===r.warehouse_id&&value.operation===operation&&value.auth_session_id===r.auth_session_id&&integer(value.version,1)&&['DRAFT','CANCELLED','RECORDED'].includes(value.status),'DRAFT_IDENTITY_MISMATCH');
  if(Object.hasOwn(value,'actor_id'))requireP15(value.actor_id===r.actor_id,'ACTOR_MISMATCH'); // Optional, absent in P03 projection.
  if(value.business_document_id!==null&&value.business_document_id!==undefined)requireP15(uuid(value.business_document_id),'BUSINESS_ID_MISMATCH');
  if(s.owner==='P05'){const src=value.form?.p05_source;requireP15(src?.document_id===r.source_document_id&&src?.version===r.source_version,'SOURCE_LINK_MISMATCH');if(value.business_document_id)requireP15(value.business_document_id===r.source_document_id,'SOURCE_ID_MISMATCH');}
  return {document_id:value.document_id,scan_session_id:value.scan_session_id,auth_session_id:value.auth_session_id,warehouse_id:value.warehouse_id,operation:value.operation,version:value.version,status:value.status,business_document_id:value.business_document_id??null};
 }
 const identity={request_id:r.operation_key,document_id:r.draft_id,scan_session_id:r.scan_session_id,warehouse_id:r.warehouse_id,operation,command:r.command};
 function receipt(value){requireP15(object(value)&&Object.entries(identity).every(([k,v])=>value[k]===v)&&value.outcome==='SUCCEEDED'&&value.version===r.original_version+1&&typeof value.committed_at==='string'&&Number.isFinite(Date.parse(value.committed_at)),'RECEIPT_IDENTITY_MISMATCH');return {...identity,outcome:'SUCCEEDED',version:value.version,committed_at:value.committed_at};}
 if(s.kind==='reconcile'&&s.owner!=='P07'){
  requireP15(Object.entries(identity).every(([k,v])=>d[k]===v)&&['SUCCEEDED','UNKNOWN'].includes(d.outcome)&&d.new_document_allowed===false,'OPERATION_IDENTITY_MISMATCH');
  if(d.document!==null)result.current=draft(d.document);
  result.command=r.command;result.nativeOutcome=d.outcome;
  if(s.owner==='P04'){requireP15(d.state===null||['UNKNOWN','DRAFT','CANCELLED','RECORDED','POSTED'].includes(d.state),'CURRENT_STATE_SCHEMA_MISMATCH');result.currentState=d.state;}
  if(d.outcome==='UNKNOWN'){requireP15(d.receipt===null&&d.response===null&&d.retry==='SAME_REQUEST_ONLY','UNKNOWN_SCHEMA_MISMATCH');return result;}
  result.receipt=receipt(d.receipt);requireP15(d.retry==='NONE'&&d.response?.success===true&&object(d.response.data),'HISTORICAL_RESPONSE_REQUIRED');
  const historical=d.response;
  if(['SAVE','CANCEL'].includes(r.command)){
   const rr=receipt(historical.data.receipt);const doc=draft(historical.data.document);requireP15(rr.version===doc.version,'HISTORICAL_VERSION_MISMATCH');result.historicalDocument=doc;
  }else{
   const rr=receipt(historical.meta?.p03_draft?.receipt),doc=draft(historical.meta?.p03_draft?.document);requireP15(doc.version===rr.version&&uuid(doc.business_document_id),'HISTORICAL_VERSION_MISMATCH');
   requireP15(historical.data.document_id===doc.business_document_id,'BUSINESS_ID_MISMATCH');
   if(s.owner==='P05')requireP15(historical.data.document_id===r.source_document_id&&historical.data.source_document_id===r.source_document_id&&historical.data.source_version===r.source_version,'SOURCE_ID_MISMATCH');
   result.historicalDocument=doc;
  }
  result.resolvesOperation=true;return result;
 }
 if(readId==='P07_CONFIRMATION'){
  requireP15(['SUCCEEDED','PROCESSING','UNKNOWN'].includes(d.state)&&d.may_create_new_request===false,'NFC_STATE_SCHEMA_MISMATCH');result.nativeOutcome=d.state;
  if(d.state!=='SUCCEEDED'){requireP15(d.response===null,'UNKNOWN_SCHEMA_MISMATCH');return result;}
  const confirmation=d.response?.data?.confirmation,nfc=d.response?.data?.nfc;
  requireP15(d.response?.success===true&&confirmation?.state==='SUCCEEDED'&&['actor_id','auth_session_id','warehouse_id','item_id'].every(k=>confirmation[k]===r[k]),'NFC_CONFIRMATION_CONTEXT_MISMATCH');
  requireP15(uuid(confirmation.physical_code_id)&&(!r.physical_code_id||confirmation.physical_code_id===r.physical_code_id),'TAG_ID_MISMATCH');
  if(r.hardware_uid!==undefined)requireP15(nfc?.hardware_uid===r.hardware_uid.trim().toUpperCase(),'UID_MISMATCH');
  // No request/key/version echo exists on this receipt. Do not manufacture it.
  result.confirmation=Object.fromEntries(['state','actor_id','auth_session_id','warehouse_id','item_id','physical_code_id'].map(k=>[k,confirmation[k]]));result.resolvesOperation=true;return result;
 }
 if(s.kind==='current-draft'){result.current=draft(d.document??d);return result;}
 if(s.kind==='current-document'){
  const doc=d.document;requireP15(object(doc)&&doc.id===r.business_document_id&&doc[s.owner==='P04'?'dst_warehouse_id':'src_warehouse_id']===r.warehouse_id&&integer(doc.version,1)&&typeof d.status==='string'&&d.status===doc.status&&typeof d.posted==='boolean','CURRENT_DOCUMENT_MISMATCH');
  requireP15(['DRAFT','SCANNING','POSTED','CANCELLED','REVERSED'].includes(d.status)&&d.posted===(d.status==='POSTED'),'CURRENT_STATE_SCHEMA_MISMATCH');result.current={document_id:doc.id,version:doc.version,status:d.status,posted:d.posted};return result;
 }
 if(readId==='P07_CURRENT_TAG'){
  requireP15(d.physical_code_id===r.physical_code_id&&body.meta.warehouse_id===r.warehouse_id&&['ACTIVE','INACTIVE','LOST','DAMAGED'].includes(d.raw_status),'CURRENT_TAG_MISMATCH');
  result.current={physical_code_id:d.physical_code_id,raw_status:d.raw_status,item_id:uuid(d.item_id)?d.item_id:null};return result;
 }
 if(readId==='P03_CONTEXT'){
  requireP15(d.auth_session_id===ctx.auth_session_id&&d.active_warehouse_id===ctx.warehouse_id&&d.admin_contact?.status==='NOT_CONFIGURED'&&Array.isArray(d.admin_contact.channels)&&d.admin_contact.channels.length===0,'SUPPORT_OWNER_SCHEMA_PENDING');
  result.support={status:'NOT_CONFIGURED',channels:[]};return result;
 }
 if(readId==='P01_ME'){
  requireP15(d.user_id===ctx.actor_id&&d.auth_session_id===ctx.auth_session_id&&Array.isArray(d.permissions)&&d.permissions.every(p=>typeof p==='string'),'AUTH_READ_CONTEXT_MISMATCH');
  result.session={actor_id:d.user_id,auth_session_id:d.auth_session_id,permissions:[...d.permissions]};return result;
 }
 throw new P15ReadError('READ_NOT_APPROVED');
}
