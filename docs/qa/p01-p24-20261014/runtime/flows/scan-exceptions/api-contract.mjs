import {projectReservation,reasonText,relatedDocumentPresentation} from './reservation-projection.mjs';
export {projectReservation,reasonText,relatedDocumentPresentation} from './reservation-projection.mjs';
import {buildOwnerRead,parseOwnerRead,safeOwnerReference} from '../system/api-contract.mjs';

export const P17_RELEASE=Object.freeze({commit:'ea7944e6b6e61b48edd8721419dabc816397a859',contract:'p17-owner-scan-exceptions-v1',sourceRevision:'073ea02503287adcbfb76ef1edd2f23d52572aa2',status:'PENDING_OWNER_CONTRACT_AND_LIVE_TEST',productionActivation:false,liveVerified:false,deviceUatVerified:false});
export const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
const integer=(v,min=0)=>Number.isSafeInteger(v)&&v>=min;
const code=v=>typeof v==='string'&&/^[A-Z][A-Z0-9_]{0,99}$/.test(v)?v:null;
const text=v=>typeof v==='string'?v:null;
export class P17OwnerError extends Error{
 constructor(value='INVALID_OWNER_RESPONSE',status=null,{panel=null,traceId=null,provenance='local-contract',reservation=null}={}){super('Nguồn nghiệp vụ chưa được xác minh.');this.name='P17OwnerError';this.code=code(value)||'INVALID_OWNER_RESPONSE';this.status=status;this.panel=panel;this.traceId=uuid(traceId)?traceId:null;this.provenance=provenance;this.reservation=reservation;this.nativeOutcome='UNKNOWN';this.mayCreateNewRequest=false;}
}
export const requireP17=(ok,c='INVALID_OWNER_RESPONSE')=>{if(!ok)throw new P17OwnerError(c);};
export function contextKey(c){
 requireP17(c?.trusted===true&&c.actor_status==='ACTIVE'&&c.warehouse_status==='ACTIVE'&&c.warehouse_context==='READY'&&uuid(c.actor_id)&&uuid(c.auth_session_id)&&uuid(c.warehouse_id)&&integer(c.generation)&&Array.isArray(c.permissions)&&c.permissions.every(p=>typeof p==='string'),'AUTH_CONTEXT_REQUIRED');
 if(c.warehouse_scope_ids!==undefined)requireP17(Array.isArray(c.warehouse_scope_ids)&&c.warehouse_scope_ids.every(uuid),'WAREHOUSE_SCOPE_INVALID');
 return JSON.stringify([c.actor_id,c.auth_session_id,c.warehouse_id,c.generation,[...c.permissions].sort(),c.warehouse_scope_ids?[...c.warehouse_scope_ids].sort():null,c.owner_gates?.P07===true]);
}
const spec=(owner,method,path,kind,contract=null)=>Object.freeze({owner,method,path,kind,contract});
export const P17_OPERATIONS=Object.freeze({
 P04_VALIDATE:spec('P04','POST','/api/v1/mini-app/inbound/drafts/{draft_id}/validate-code','validate','mini-app-p04-v1'),
 P04_REVIEW:spec('P04','POST','/api/v1/mini-app/inbound/drafts/{draft_id}/review','review','mini-app-p04-v1'),
 P05_RESOLVE:spec('P05','POST','/api/v1/mini-app/outbound/resolve-code','resolve'),
 P04_RECONCILE:spec('P04','GET','/api/v1/mini-app/inbound/drafts/{draft_id}/requests/{operation_key}','reconcile','mini-app-p04-v1'),
 P05_LINKED_RECONCILE:spec('P05','GET','/api/v1/mini-app/drafts/{draft_id}/requests/{operation_key}','reconcile','mini-app-p03-v1'),
 P07_TAG_DETAIL:spec('P07','GET','/api/v1/mini-app/nfc-tags/{physical_code_id}','tag','mini-app-p07-v1'),
 P05_RELATED_RESERVATION_DOCUMENT:spec('P05','GET','/api/v1/mini-app/outbound-documents/{related_document_id}','related'),
});
export function safeReference(v){
 const r={...safeOwnerReference(v)};
 for(const k of ['client_event_id','related_document_id'])if(Object.hasOwn(v,k)){requireP17(uuid(v[k]),'CANONICAL_ID_REQUIRED');r[k]=v[k];}
 return Object.freeze(r);
}
export function buildOwnerOperation(id,value,ctx,{body,allowChecks=false,reservation=null}={}){
 contextKey(ctx);requireP17(Object.hasOwn(P17_OPERATIONS,id),'OPERATION_NOT_APPROVED');const s=P17_OPERATIONS[id],r=safeReference(value);
 requireP17(r.owner===s.owner&&r.actor_id===ctx.actor_id&&r.auth_session_id===ctx.auth_session_id&&r.warehouse_id===ctx.warehouse_id,'OWNER_CONTEXT_MISMATCH');
 const has=p=>ctx.permissions.includes(p);
 if(id==='P04_RECONCILE'||id==='P05_LINKED_RECONCILE'){
  const sharedId=id==='P04_RECONCILE'?id:'P05_RECONCILE',b=buildOwnerRead(sharedId,r,ctx);
  requireP17(body===undefined,'GET_BODY_FORBIDDEN');return {id,spec:s,reference:r,path:b.path,query:b.query,headers:{},sharedRead:b};
 }
 const query={},headers={};let payload;
 if(s.method==='POST'){
  requireP17(allowChecks===true,'OWNER_CHECKS_DISABLED');requireP17(object(body),'TYPED_BODY_REQUIRED');
  const keys=Object.keys(body).sort().join(',');
  if(s.owner==='P04'){
   requireP17(r.mode==='SCOPED'&&uuid(r.draft_id)&&uuid(r.scan_session_id)&&integer(r.original_version,1),'SCOPED_DRAFT_REQUIRED');
   requireP17(has('inbound.create')&&has('inbound.scan'),'OWNER_CHECK_PERMISSION_REQUIRED');
   headers['If-Match']='"'+r.original_version+'"';
   requireP17(body.warehouse_id===r.warehouse_id&&body.scan_session_id===r.scan_session_id,'CHECK_BODY_IDENTITY_MISMATCH');
   if(id==='P04_VALIDATE'){
    requireP17(keys==='client_event_id,item,scan_session_id,warehouse_id'&&uuid(r.client_event_id)&&body.client_event_id===r.client_event_id,'VALIDATE_BODY_INVALID');const i=body.item;
    const allowed=['raw_code','quantity','scan_source','item_type','box_number','new_sku_type'];
    requireP17(object(i)&&Object.keys(i).every(k=>allowed.includes(k))&&typeof i.raw_code==='string'&&i.raw_code.trim()&&Array.from(i.raw_code).length<=512,'ITEM_BODY_INVALID');
    if(i.quantity!==undefined)requireP17(integer(i.quantity,1)&&i.quantity<=100000,'ITEM_QUANTITY_INVALID');
    if(i.scan_source!==undefined)requireP17(['CAMERA','MANUAL','SCANNER','HARDWARE'].includes(i.scan_source),'SCAN_SOURCE_INVALID');
    if(i.item_type!==undefined)requireP17(['ITEM','BOX'].includes(i.item_type),'ITEM_TYPE_INVALID');
    if(i.box_number!==undefined)requireP17(typeof i.box_number==='string'&&/^[0-9]{1,20}$/.test(i.box_number),'BOX_METADATA_INVALID');
    if(i.new_sku_type!==undefined)requireP17(['PRODUCT','COMPONENT'].includes(i.new_sku_type),'SKU_TYPE_INVALID');
   }else requireP17(keys==='scan_session_id,warehouse_id','REVIEW_BODY_INVALID');
  }else{
   requireP17(['RESOLVE','SOURCE_LINKED'].includes(r.mode)&&has('outbound.scan'),'RESOLVER_PERMISSION_REQUIRED');
   requireP17(keys==='raw_code,warehouse_id'&&body.warehouse_id===r.warehouse_id&&typeof body.raw_code==='string'&&body.raw_code.trim()&&body.raw_code.length<=512,'RESOLVE_BODY_INVALID');
  }
  payload=structuredClone(body);
 }else{
  requireP17(body===undefined,'GET_BODY_FORBIDDEN');
  if(id==='P07_TAG_DETAIL'){requireP17(r.mode==='READ'&&ctx.owner_gates?.P07===true,'P07_OWNER_GATE_PENDING');requireP17(has('inventory.trace')||has('physical_code.assign_rfid'),'TAG_READ_PERMISSION_REQUIRED');requireP17(uuid(r.physical_code_id),'TAG_ID_REQUIRED');query.warehouse_id=r.warehouse_id;}
  else{
   requireP17(has('outbound.view'),'DOCUMENT_READ_PERMISSION_REQUIRED');const p=projectReservation(reservation,ctx);
   requireP17(p?.can_open===true&&p.redacted===false&&p.document_id===r.related_document_id,'VISIBLE_RESERVATION_REQUIRED');
  }
 }
 const path=s.path.replace(/\{([^}]+)\}/g,(_,k)=>{requireP17(uuid(r[k]),'CANONICAL_ID_REQUIRED');return encodeURIComponent(r[k]);});
 return {id,spec:s,reference:r,path,query,headers,...(payload?{body:payload}:{})};
}
const denied=new Set(['ACCESS_DENIED','WAREHOUSE_ACCESS_DENIED','P04_OPERATION_DENIED','P03_OPERATION_DENIED','FORBIDDEN','PERMISSION_DENIED']);
export function parseOwnerError(status,b,built,ctx,traceId){
 const trusted=object(b)&&b.success===false&&object(b.error)&&code(b.error.code)&&b.meta?.request_id===traceId;
 const reservation=trusted&&object(b.error.details)&&Object.hasOwn(b.error.details,'reserved_by')?projectReservation(b.error.details.reserved_by,ctx):null;
 return new P17OwnerError(trusted?b.error.code:'HTTP_UNCLASSIFIED',status,{traceId,panel:status===401?'expired':trusted&&status===403&&denied.has(b.error.code)?'forbidden':null,provenance:trusted?'trusted-owner-json':'transport-unclassified',reservation});
}
function resolvedProjection(v,warehouse){
 requireP17(object(v),'RESOLVED_SCHEMA_INVALID');const r={};
 for(const k of ['sku_id','item_id'])if(Object.hasOwn(v,k)){requireP17(v[k]===null||uuid(v[k]),'RESOLVED_ID_INVALID');r[k]=v[k];}
 for(const k of ['sku_code','sku_name','item_unique','serial_number','box_number','unit'])if(Object.hasOwn(v,k)){requireP17(v[k]===null||typeof v[k]==='string','RESOLVED_TEXT_INVALID');r[k]=v[k];}
 for(const k of ['item_type','sku_type','item_status'])if(Object.hasOwn(v,k))r[k]=text(v[k]);
 if(v.warehouse_id!==undefined)requireP17(v.warehouse_id===warehouse,'WAREHOUSE_MISMATCH');
 if(v.stock_effect!==undefined)requireP17(v.stock_effect==='NONE','STOCK_EFFECT_MISMATCH');
 return r;
}
export function parseValidationRow(v,r){
 requireP17(object(v)&&typeof v.raw_code==='string'&&['ACCEPTED','DUPLICATE','REJECTED'].includes(v.outcome)&&(v.reason_code===null||code(v.reason_code)),'VALIDATE_ROW_INVALID');
 const row={raw_code:v.raw_code,outcome:v.outcome,reason_code:v.reason_code};
 if(v.message!==undefined){requireP17(typeof v.message==='string','ROW_MESSAGE_INVALID');row.message=v.message;}
 if(v.resolved!==undefined&&v.resolved!==null)row.resolved=resolvedProjection(v.resolved,r.warehouse_id);
 if(v.quantity!==undefined){requireP17(integer(v.quantity,1),'ROW_QUANTITY_INVALID');row.quantity=v.quantity;}
 return row;
}
export function parseOwnerObservation(b,built,ctx){
 const {spec:s,reference:r,id}=built;
 requireP17(object(b)&&b.success===true&&object(b.data)&&object(b.meta)&&uuid(b.meta.request_id),'OWNER_ENVELOPE_INVALID');
 if(s.contract)requireP17(b.meta.contract===s.contract,'OWNER_CONTRACT_MISMATCH');
 const d=b.data;
 if(s.kind==='reconcile'){
  const observed=parseOwnerRead(b,built.sharedRead,ctx);
  // This is an observation for the writer owner to consume, never a P17
  // command or a claim about today's posted status from a historical receipt.
  return {...observed,kind:'reconcile',id,recordVerified:r.command==='RECORD'&&observed.resolvesOperation===true,mayResend:false,postedCurrently:null};
 }
 if(s.kind==='validate'){
  requireP17(d.document_id===r.draft_id&&d.scan_session_id===r.scan_session_id&&d.client_event_id===r.client_event_id&&d.version===r.original_version&&d.event_persisted===false&&d.stock_effect==='NONE','VALIDATE_IDENTITY_MISMATCH');
  if(d.scan_evidence_created!==undefined)requireP17(d.scan_evidence_created===false,'CHECK_CREATED_EVIDENCE');
  const row=parseValidationRow(d.result,r);requireP17(row.raw_code===built.body.item.raw_code,'RAW_CODE_MISMATCH');
  return {kind:'validate',id,version:d.version,row,changesAccepted:false,stock_effect:'NONE',traceId:b.meta.request_id};
 }
 if(s.kind==='review'){
  const doc=d.document;requireP17(object(doc)&&doc.document_id===r.draft_id&&doc.scan_session_id===r.scan_session_id&&doc.auth_session_id===r.auth_session_id&&doc.warehouse_id===r.warehouse_id&&doc.operation==='INBOUND'&&doc.version===r.original_version&&doc.status==='DRAFT'&&(!Object.hasOwn(doc,'actor_id')||doc.actor_id===r.actor_id)&&d.stock_effect==='NONE'&&d.scan_evidence_created===false&&d.revalidation_policy==='AGAIN_AT_RECORD'&&typeof d.can_record==='boolean'&&Array.isArray(d.items),'REVIEW_SCHEMA_MISMATCH');
  return {kind:'review',id,version:doc.version,rows:d.items.map(v=>parseValidationRow(v,r)),can_record:d.can_record,changesAccepted:false,stock_effect:'NONE',traceId:b.meta.request_id};
 }
 if(s.kind==='resolve'){
  requireP17(d.raw_code===built.body.raw_code&&d.warehouse_id===r.warehouse_id&&typeof d.eligible_for_outbound==='boolean'&&code(d.eligibility_code)&&Object.hasOwn(d,'reservation')&&d.stock_effect==='NONE'&&['movement_created','match_created','scan_evidence_created','wms_document_created'].every(k=>d[k]===false),'RESOLVER_SCHEMA_INVALID');
  const reservation=projectReservation(d.reservation,ctx);
  requireP17(!(d.eligible_for_outbound&&reservation!==null),'ELIGIBILITY_RESERVATION_CONFLICT');
  if(d.eligibility_code==='ALREADY_MATCHED')throw new P17OwnerError('OWNER_CODE_ALIAS_REJECTED');
  const product=resolvedProjection(d,r.warehouse_id);
  if(d.available_qty!==undefined)requireP17(Number.isFinite(d.available_qty)&&d.available_qty>=0,'AVAILABLE_QTY_INVALID');
  return {kind:'resolve',id,raw_code:d.raw_code,eligible:d.eligible_for_outbound,reason_code:d.eligibility_code,reservation,product,...(d.available_qty!==undefined?{available_qty:d.available_qty}:{}),stock_effect:'NONE',changesAccepted:false,traceId:b.meta.request_id};
 }
 if(s.kind==='related'){
  requireP17(d.id===r.related_document_id&&d.doc_type==='issue'&&uuid(d.src_warehouse_id)&&Array.isArray(ctx.warehouse_scope_ids)&&ctx.warehouse_scope_ids.includes(d.src_warehouse_id)&&typeof d.doc_no==='string'&&code(d.status),'RESERVING_DOCUMENT_SCOPE_INVALID');
  return {kind:'related',id,document:{document_id:d.id,doc_no:d.doc_no,status:d.status},traceId:b.meta.request_id};
 }
 requireP17(d.physical_code_id===r.physical_code_id&&b.meta.warehouse_id===r.warehouse_id&&typeof d.raw_status==='string'&&Object.hasOwn(d,'tab_status')&&Object.hasOwn(d,'status_label')&&Object.hasOwn(d,'linker')&&Object.hasOwn(d,'assigned_warehouse')&&['NFC_ASSIGNMENT','NOT_RECORDED'].includes(d.assigned_warehouse_source),'TAG_SCHEMA_INVALID');
 if(r.hardware_uid!==undefined)requireP17(d.hardware_uid===r.hardware_uid,'TAG_UID_MISMATCH');
 requireP17(d.item_id===null||uuid(d.item_id),'TAG_ITEM_ID_INVALID');requireP17(d.sku_id===null||uuid(d.sku_id),'TAG_SKU_ID_INVALID');
 const tag={physical_code_id:d.physical_code_id,hardware_uid:text(d.hardware_uid),item_id:d.item_id,sku_id:d.sku_id,raw_status:d.raw_status,tab_status:text(d.tab_status),status_label:text(d.status_label),serial_number:text(d.serial_number),sku_code:text(d.sku_code),sku_name:text(d.sku_name),assigned_at:text(d.assigned_at),linker:null,assigned_warehouse:null,assigned_warehouse_source:d.assigned_warehouse_source};
 if(d.linker!==null){requireP17(object(d.linker)&&uuid(d.linker.user_id)&&typeof d.linker.display_name==='string','LINKER_INVALID');tag.linker={user_id:d.linker.user_id,display_name:d.linker.display_name};}
 if(d.assigned_warehouse!==null){requireP17(object(d.assigned_warehouse)&&uuid(d.assigned_warehouse.warehouse_id)&&typeof d.assigned_warehouse.code==='string'&&typeof d.assigned_warehouse.name==='string','ASSIGNED_WAREHOUSE_INVALID');tag.assigned_warehouse={warehouse_id:d.assigned_warehouse.warehouse_id,code:d.assigned_warehouse.code,name:d.assigned_warehouse.name};}
 return {kind:'tag',id,tag,isReceipt:false,traceId:b.meta.request_id};
}
export function exceptionPresentation(observation,ctx){
 if(observation.kind==='resolve')return observation.eligible?null:{panel:observation.reservation!==null||['ITEM_NOT_AVAILABLE','INSUFFICIENT_STOCK','ITEM_ALREADY_MATCHED'].includes(observation.reason_code)?'P17.S02':'P17.S01',raw:observation.raw_code,reason:reasonText(observation.reason_code),reasonCode:observation.reason_code,reservation:observation.reservation,product:{code:observation.product.item_unique,name:observation.product.sku_name,sku:observation.product.sku_code,unit:observation.product.unit},relatedDocument:relatedDocumentPresentation(observation.reservation,ctx),prepared:true};
 if(observation.kind==='validate'&&observation.row.outcome==='REJECTED')return {panel:'P17.S01',raw:observation.row.raw_code,reason:observation.row.message??reasonText(observation.row.reason_code),reasonCode:observation.row.reason_code,prepared:true};
 return null;
}
export function safeCheckpoint(reference){const r=safeReference(reference);return Object.fromEntries(['owner','mode','command','operation_key','draft_id','scan_session_id','original_version','source_document_id','source_version'].filter(k=>Object.hasOwn(r,k)).map(k=>[k,r[k]]));}
