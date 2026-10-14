import {P19_LINKED_MODE,P19_LINKED_CONTRACT,P19_LINKED_GATE,LINKED_UUID,clone,linkedObject,linkedCodes,linkedMetadata,linkedReceipt,linkedSave,linkedPostResult,linkedDraft,positive} from './linked-contract.mjs';
export const P21_LINKED_RESUME_CONTRACT='p21-component-resume-v1';
export const P21_LINKED_RESUME_MODE='P03_P19_LINKED_ONLY';
export const P21_LINKED_RESUME_GATE=Object.freeze({status:'PENDING_CONTRACT_AND_LIVE_TEST',activation:false,live:'NOT_RUN',readOnly:true,writer:false,sourceSha:'7a63571f2cf399ba0de7151475e72f37ffdc1822'});
export class ResumeReadError extends Error{constructor(code,message=code,{status=0,trusted=false}={}){super(message);this.name='ResumeReadError';this.code=code;this.status=status;this.trusted=trusted;this.unknown=true;}}
export const ensureResume=(yes,message)=>{if(!yes)throw new ResumeReadError('P21_RESPONSE_INVALID',message);};
export const resumeError=e=>({code:e?.code||'P21_READ_FAILED',message:e?.message||'Chưa xác minh dữ liệu.',status:e?.status||0,trusted:e?.trusted===true});
const uuid=v=>LINKED_UUID.test(v||''),nonnegative=v=>Number.isSafeInteger(v)&&v>=0,own=(v,k)=>Object.hasOwn(v,k),statuses=['DRAFT','RECORDED','CANCELLED'];
export const P21_RESUME_POLICIES=Object.freeze(['OWNER_PREFLIGHT_REQUIRED','READ_ONLY_CASE_STATE','READ_ONLY_INCOMPLETE_SNAPSHOT','READ_ONLY_LINK_CONFLICT','READ_ONLY_CANCELLED','OPEN_EXISTING_RESULT','RECORDED_RESULT_UNAVAILABLE']);
export function resumeScope(s){
 if(!linkedObject(s)||!['actorId','authSessionId','warehouseId'].every(k=>uuid(s[k]))||(s.authenticated!==true&&s.actorStatus!=='ACTIVE')||(s.contextConfirmed!==true&&s.warehouseConfirmed!==true)||s.warehouseStatus!=='ACTIVE'||s.actorStatus==='INACTIVE'||s.tenantResolved===false||!Array.isArray(s.permissions))throw new ResumeReadError('P21_CONTEXT_UNVERIFIED');
 if(!s.permissions.includes('warranty.component_issue')||!s.permissions.some(p=>['warranty.view','warranty.manage'].includes(p)))throw new ResumeReadError('P21_READ_FORBIDDEN','Không có quyền đọc task linh kiện.',{status:403});
 return clone({actorId:s.actorId,authSessionId:s.authSessionId,warehouseId:s.warehouseId,permissions:[...s.permissions].sort(),callerId:s.callerId??null,dimensions:s.dimensions??{},tenantResolved:s.tenantResolved??null});
}
export const resumeFamily=s=>JSON.stringify([s.actorId,s.authSessionId,s.warehouseId,'COMPONENT_ISSUE']);
export const resumeNamespace=(s,draft,scan)=>{if(!uuid(draft)||!uuid(scan))throw new ResumeReadError('P21_ID_INVALID');return JSON.stringify([s.actorId,s.authSessionId,s.warehouseId,'COMPONENT_ISSUE',draft,scan]);};
export function linkedResumeQuery(options={}){
 if(!linkedObject(options)||Object.keys(options).some(k=>!['warehouseId','page','perPage','status','warrantyCaseId'].includes(k)))throw new ResumeReadError('P21_QUERY_INVALID');
 const {warehouseId,page=1,perPage=20,status,warrantyCaseId}=options;
 if(!uuid(warehouseId)||!positive(page)||page>100000||!positive(perPage)||perPage>100||status!==undefined&&!statuses.includes(status)||warrantyCaseId!==undefined&&!uuid(warrantyCaseId))throw new ResumeReadError('P21_QUERY_INVALID');
 // Omit status to request the BE's DRAFT+RECORDED default; arrays are invalid.
 return {warehouse_id:warehouseId,operation:'COMPONENT_ISSUE',page,per_page:perPage,...(status!==undefined?{status}:{}),...(warrantyCaseId!==undefined?{warranty_case_id:warrantyCaseId}:{})};
}
// Preserve source fractions. Naive SQL timestamps require an explicit owner
// offset; P21 BE already normalizes owner timestamps to UTC before responding.
export function p21Instant(value,{sourceOffsetMinutes=null}={}){
 if(value===null||typeof value!=='string')return null;
 const m=/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?(Z|[+-]\d{2}(?::?\d{2})?)?$/.exec(value);if(!m)return null;
 const [year,month,day]=m[1].split('-').map(Number),hour=+m[2],minute=+m[3],second=+m[4],local=Date.UTC(year,month-1,day,hour,minute,second),date=new Date(local);
 if(year<100||date.getUTCFullYear()!==year||date.getUTCMonth()+1!==month||date.getUTCDate()!==day||hour>23||minute>59||second>59)return null;
 let offset=0;if(!m[6]){if(!Number.isInteger(sourceOffsetMinutes)||Math.abs(sourceOffsetMinutes)>840)return null;offset=sourceOffsetMinutes;}
 else if(m[6]!=='Z'){const z=/^([+-])(\d{2})(?::?(\d{2}))?$/.exec(m[6]);if(!z||+z[2]>14||+(z[3]||0)>59||+z[2]===14&&+(z[3]||0)!==0)return null;offset=(z[1]==='-'?-1:1)*(+z[2]*60+ +(z[3]||0));}
 return {raw:value,utc:new Date(local-offset*60000).toISOString().slice(0,19)+(m[5]||'')+'Z',epochMs:local-offset*60000+Number('0'+(m[5]||''))*1000};
}
export function resumeEnvelope(response,scope){
 const b=response?.body,m=b?.meta;
 ensureResume(response?.status===200&&linkedObject(b)&&b.success===true&&linkedObject(m)&&own(b,'data'),'P21 envelope không hợp lệ.');
 ensureResume(m.contract==='mini-app-p03-v1'&&m.resume_contract===P21_LINKED_RESUME_CONTRACT&&m.mode===P21_LINKED_RESUME_MODE&&m.count_unit==='STAGING_TASK'&&m.actor_id===scope.actorId&&m.auth_session_id===scope.authSessionId&&m.warehouse_id===scope.warehouseId&&m.scope_policy==='ACTOR_SESSION_WAREHOUSE_TENANT_PERSISTED_CASE_BEFORE_TOTAL'&&m.consistency==='LIVE_READ_NOT_FROZEN_CROSS_REQUEST'&&m.mutation_exposed===false,'P21 scope/mode/read contract không khớp.');
 ensureResume(['SINGLE_TENANT_DATABASE_REQUIRED','TRUSTED_ACTOR_WAREHOUSE_AND_SOURCE_COLUMNS'].includes(m.tenant_isolation),'Thiếu nguồn tenant isolation.');
 if(Object.keys(scope.dimensions||{}).length)ensureResume(m.tenant_isolation==='TRUSTED_ACTOR_WAREHOUSE_AND_SOURCE_COLUMNS','Tenant dimensions chưa được đối chiếu.');
 return b;
}
export function linkedResumeTask(d,scope,{caseId}={}){
 ensureResume(linkedObject(d)&&uuid(d.document_id)&&d.document_kind==='STAGING_DRAFT'&&d.actor_id===scope.actorId&&d.auth_session_id===scope.authSessionId&&d.warehouse_id===scope.warehouseId&&uuid(d.scan_session_id)&&d.operation==='COMPONENT_ISSUE'&&positive(d.version)&&statuses.includes(d.status)&&uuid(d.warranty_case_id)&&(!caseId||d.warranty_case_id===caseId)&&typeof d.case_status==='string','Task identity/scope/case không khớp.');
 ensureResume(linkedObject(d.form)&&Object.keys(d.form).join(',')==='p19','Task form không phải owner P19.');
 try{linkedMetadata(d.form.p19,d.warranty_case_id);}catch{throw new ResumeReadError('P21_RESPONSE_INVALID','Task form P19 không hợp lệ.');}
 ensureResume(Array.isArray(d.codes)&&d.codes.length<=P19_LINKED_GATE.maxSaveRows&&d.codes_validated===false&&d.scan_evidence_persisted===false&&typeof d.snapshot_shape_valid==='boolean'&&linkedObject(d.summary)&&d.summary.basis==='UNVALIDATED_PERSONAL_SNAPSHOT'&&d.summary.code_count===d.codes.length,'Snapshot không phải input cá nhân.');
 const shape=d.codes.every(c=>linkedObject(c)&&typeof c.raw_code==='string'&&c.raw_code!==''&&positive(c.quantity)&&c.quantity<=100000&&['CAMERA','SCANNER','HARDWARE','MANUAL'].includes(c.scan_source));
 ensureResume(d.snapshot_shape_valid===shape&&d.summary.quantity_total===(shape?d.codes.reduce((n,c)=>n+c.quantity,0):null),'Quantity/source bị mặc định hoặc summary không khớp.');
 for(const k of ['business_document_id','business_version','business_status','document_no','business_detail_path','posted_at','created_at','updated_at','last_request_id','last_command','last_receipt_version'])ensureResume(own(d,k),'Thiếu field '+k);
 ensureResume((d.business_document_id===null||uuid(d.business_document_id))&&(d.business_version===null||positive(d.business_version))&&(d.last_request_id===null||uuid(d.last_request_id))&&(d.last_receipt_version===null||positive(d.last_receipt_version))&&(d.last_command===null||['SAVE','RECORD','CANCEL'].includes(d.last_command))&&typeof d.business_link_present==='boolean'&&typeof d.can_open_business==='boolean'&&typeof d.resume_policy==='string'&&typeof d.case_allows_issue==='boolean'&&d.owner_revalidation_required===true&&d.mutation_exposed===false&&d.stock_effect==='NONE'&&d.read_stock_effect==='NONE','Task policy/version/effects không hợp lệ.');
 for(const k of ['created_at','updated_at','posted_at'])ensureResume(d[k]===null||p21Instant(d[k])!==null,'Thời điểm nguồn không hợp lệ: '+k);
 ensureResume(d.case_allows_issue===['CHECKING','REPAIRING'].includes(d.case_status),'Case state chưa khớp.');
 if(!d.can_open_business)ensureResume(['business_document_id','business_version','business_status','document_no','posted_at','business_detail_path'].every(k=>d[k]===null),'Projection không có quyền nhưng chứa business.');
 else ensureResume(d.business_link_present&&uuid(d.business_document_id)&&positive(d.business_version)&&typeof d.business_status==='string'&&(d.document_no===null||typeof d.document_no==='string')&&typeof d.business_detail_path==='string','Business projection không có identity.');
 const expected=d.status==='RECORDED'?(d.can_open_business?'OPEN_EXISTING_RESULT':'RECORDED_RESULT_UNAVAILABLE'):d.status==='CANCELLED'?'READ_ONLY_CANCELLED':!shape?'READ_ONLY_INCOMPLETE_SNAPSHOT':!d.case_allows_issue?'READ_ONLY_CASE_STATE':d.business_link_present?'READ_ONLY_LINK_CONFLICT':'OWNER_PREFLIGHT_REQUIRED';
 if(P21_RESUME_POLICIES.includes(d.resume_policy))ensureResume(d.resume_policy===expected,'Policy mâu thuẫn trạng thái task.');
 return clone(d);
}
export function linkedResumeList(response,scope,query){
 const b=resumeEnvelope(response,scope),m=b.meta,included=query.status?[query.status]:['DRAFT','RECORDED'];
 ensureResume(Array.isArray(b.data)&&m.page===query.page&&m.per_page===query.per_page&&nonnegative(m.total)&&positive(m.last_page)&&m.last_page===Math.max(1,Math.ceil(m.total/m.per_page))&&typeof m.has_more==='boolean'&&m.has_more===(m.page*m.per_page<m.total)&&JSON.stringify(m.included_statuses)===JSON.stringify(included)&&JSON.stringify(m.sort)===JSON.stringify(['updated_at:desc','document_id:desc'])&&b.data.length<=m.per_page,'P21 paging/default statuses không khớp.');
 ensureResume(linkedObject(m.status_totals)&&statuses.every(s=>nonnegative(m.status_totals[s]))&&included.reduce((n,s)=>n+m.status_totals[s],0)===m.total,'Tổng task/filter không hợp lệ.');
 if(!b.data.length&&m.total>0)throw new ResumeReadError('P21_PAGING_INCONSISTENT','Trang rỗng nhưng nguồn vẫn có task. Cần tải lại.');
 ensureResume(!(m.total===0&&b.data.length),'Nguồn total0 không phải empty.');
 const tasks=b.data.map(d=>linkedResumeTask(d,scope,{caseId:query.warranty_case_id}));ensureResume(tasks.every(d=>included.includes(d.status)),'Status ngoài bộ lọc.');
 return {tasks,meta:clone(m)};
}
export function linkedResumeDraft(response,scope,reference){
 const b=resumeEnvelope(response,scope),d=linkedResumeTask(b.data,scope);
 ensureResume(d.document_id===reference.document_id&&d.scan_session_id===reference.scan_session_id&&(!reference.warranty_case_id||d.warranty_case_id===reference.warranty_case_id),'Checkpoint khác task.');
 if(response.etag!=null)ensureResume(response.etag===`"${d.version}"`,'ETag khác current draft version.');
 return d;
}
export function originalResumeRequest(r,scope){
 ensureResume(linkedObject(r)&&r.mode===P19_LINKED_MODE&&uuid(r.draftId)&&uuid(r.scanSessionId)&&uuid(r.key)&&uuid(r.caseId)&&['SAVE','RECORD','CANCEL'].includes(r.command)&&nonnegative(r.draftVersion)&&linkedObject(r.scope)&&resumeFamily(r.scope)===resumeFamily(scope),'Original request không đúng owner/scope.');
 const h=r.headers,b=r.body;ensureResume(linkedObject(h)&&h['Idempotency-Key']===r.key&&linkedObject(b)&&h.Authorization===undefined&&h.Cookie===undefined&&h['X-Component-Resume-Contract']===undefined,'Request evidence chứa header sai.');
 const allowed=r.command==='RECORD'?['Accept','Content-Type','Idempotency-Key','X-Component-Issue-Contract','X-Draft-ID','X-Draft-Scan-Session-ID','X-Draft-Version']:['Accept','Content-Type','Idempotency-Key','If-Match'];
 ensureResume(Object.keys(h).every(k=>allowed.includes(k)),'Original request header không thuộc writer owner.');
 if(r.command==='SAVE'){
  ensureResume(r.method==='PUT'&&r.path==='/api/v1/mini-app/drafts/'+r.draftId&&h['If-Match']===`"${r.draftVersion}"`&&b.warehouse_id===scope.warehouseId&&b.operation==='COMPONENT_ISSUE'&&b.scan_session_id===r.scanSessionId,'Original SAVE identity/version.');linkedCodes(b.codes);linkedMetadata(b.form?.p19,r.caseId);
 }else if(r.command==='RECORD'){
  ensureResume(r.method==='POST'&&r.path==='/api/v1/mini-app/warranty-component-issues/record'&&h['X-Component-Issue-Contract']===P19_LINKED_CONTRACT&&h['X-Draft-ID']===r.draftId&&h['X-Draft-Scan-Session-ID']===r.scanSessionId&&h['X-Draft-Version']===String(r.draftVersion)&&h['If-Match']===undefined&&b.warehouse_id===scope.warehouseId&&b.warranty_case_id===r.caseId&&b.post_immediately===true&&linkedObject(r.savedSnapshot),'Original RECORD không linked.');linkedCodes(b.items,{empty:false});
 }else ensureResume(r.method==='POST'&&r.path==='/api/v1/mini-app/drafts/'+r.draftId+'/cancel'&&h['If-Match']===`"${r.draftVersion}"`&&b.warehouse_id===scope.warehouseId&&b.operation==='COMPONENT_ISSUE'&&b.scan_session_id===r.scanSessionId,'Original CANCEL identity.');
 return r;
}
export async function requestFingerprint(r){const bytes=new TextEncoder().encode(JSON.stringify([r.mode,r.command,r.key,r.draftId,r.scanSessionId,r.caseId,r.draftVersion,r.method,r.path,r.body]));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');}
const sameReceipt=(a,b)=>['request_id','document_id','scan_session_id','warehouse_id','operation','command','outcome','version','committed_at'].every(k=>a?.[k]===b?.[k]);
export function linkedResumeRequest(response,scope,original){
 originalResumeRequest(original,scope);const b=resumeEnvelope(response,scope),d=b.data;
 ensureResume(linkedObject(d)&&d.request_id===original.key&&d.document_id===original.draftId&&d.scan_session_id===original.scanSessionId&&d.warehouse_id===scope.warehouseId&&d.operation==='COMPONENT_ISSUE'&&d.command===original.command&&['SUCCEEDED','UNKNOWN'].includes(d.outcome)&&d.new_document_allowed===false&&d.may_create_new_request===false&&d.p21_recovery_policy==='CHECK_ONLY'&&d.cancel_allowed===false&&d.retry===(d.outcome==='UNKNOWN'?'SAME_REQUEST_ONLY':'NONE'),'Request key/command/recovery policy không khớp.');
 const current=d.document===null?null:linkedResumeTask(d.document,scope);
 if(current)ensureResume(current.document_id===original.draftId&&current.scan_session_id===original.scanSessionId,'Current task không đúng original draft/scan.');
 if(d.outcome==='UNKNOWN'){ensureResume(d.receipt===null&&d.response===null,'UNKNOWN không được có receipt thành công.');return {outcome:'UNKNOWN',current,receipt:null,historical:null};}
 ensureResume(current!==null&&linkedObject(d.response)&&d.response.success===true,'Thiếu current checkpoint/historical response.');
 let result;try{
  linkedReceipt(d.receipt,original);
  if(original.command!=='RECORD')ensureResume(d.response.meta?.contract==='mini-app-p03-v1','Historical P03 contract khác owner.');
  if(original.command==='RECORD')result=linkedPostResult(d.response,original);
  else if(original.command==='SAVE')result=linkedSave(d.response,original);
  else{const hd=linkedDraft(d.response.data?.document,original.scope,original.draftId,original.scanSessionId,original.caseId),receipt=linkedReceipt(d.response.data?.receipt,original);ensureResume(hd.status==='CANCELLED'&&hd.version===receipt.version,'Historical CANCEL không khớp.');result={draft:hd,receipt};}
 }catch{throw new ResumeReadError('P21_RECEIPT_INVALID','Receipt/historical response không khớp original request.');}
 ensureResume(sameReceipt(d.receipt,result.receipt)&&current.version>=result.receipt.version,'Receipt vs current version không hợp lệ.');
 if(original.command==='RECORD'){
  ensureResume(current.status==='RECORDED'&&current.business_link_present,'Post receipt không khớp current task.');
  if(current.can_open_business)ensureResume(current.business_document_id===result.result.business_document_id,'Current business ID khác historical receipt.');
  if(original.skuTotals)ensureResume(result.result.lines.length===Object.keys(original.skuTotals).length&&result.result.lines.every(l=>original.skuTotals[l.sku_id]===l.required_qty),'Historical SKU totals không khớp.');
 }
 return {outcome:'SUCCEEDED',command:original.command,current,receipt:clone(result.receipt),historical:clone(result)};
}
export function validateResumeBusinessTarget(task,scope,approvedOrigin){
 if(!scope.permissions.includes('documents.read')||task.resume_policy!=='OPEN_EXISTING_RESULT'||!task.can_open_business||!uuid(task.business_document_id))throw new ResumeReadError('P21_BUSINESS_READ_FORBIDDEN');
 const expected='/api/v1/mini-app/warranty-component-issues/'+task.business_document_id;let u;try{u=new URL(task.business_detail_path,approvedOrigin);}catch{throw new ResumeReadError('P21_TARGET_INVALID');}
 if(u.origin!==approvedOrigin||u.protocol!=='https:'||u.username||u.password||u.hash||u.search||u.pathname!==expected||task.business_detail_path.includes('\\'))throw new ResumeReadError('P21_TARGET_INVALID');return expected;
}
