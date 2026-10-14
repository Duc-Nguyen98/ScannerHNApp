import {clone,P19_LINKED_MODE} from './linked-contract.mjs';
import {P21_LINKED_RESUME_MODE,ResumeReadError,resumeScope,resumeFamily,validateResumeBusinessTarget} from './resume-linked-contract.mjs';
import {prepareP21LinkedResume,linkedResumeDisposition,linkedResumeInfo} from './resume-linked-preparation.mjs';

// Explicit local injection only. The UI consumes read projections and the same
// retained P19 owner; this bridge never creates or mutates a business owner.
export function createLinkedResumeView({reader,getScope,getRetainedOwner,getPendingOwners=()=>[],getCasePresentation=()=>null,onOwner=()=>{},onBusiness=()=>{}}){
 if(reader.snapshot().mode!==P21_LINKED_RESUME_MODE||reader.gate.activation!==false)throw new ResumeReadError('P21_OFFLINE_READER_REQUIRED');
 const preparation=prepareP21LinkedResume(),wrappers=new Map();
 const owned=id=>getRetainedOwner(id);
 const local=owner=>{const s=owner?.snapshot();try{const scope=resumeScope(getScope());return s?.mode===P19_LINKED_MODE&&resumeFamily(s.scope||{})===resumeFamily(scope)?s:null;}catch{return null;}};
 const taskFor=id=>{const s=reader.snapshot();return s.selected?.document_id===id?s.selected:s.items?.find(t=>t.document_id===id)||null;};
 function project(task,owner){
  const r=reader.snapshot(),s=local(owner),pending=s?.pending,caseId=pending?.caseId||task?.warranty_case_id||s?.caseRow?.warranty_case_id||null,c=getCasePresentation(caseId);
  // S04 represents the frozen operation, even if a newer current task has
  // another quantity/case. Keep its values separate from current projection.
  const originalCodes=pending?.command==='SAVE'?pending.body?.codes:pending?.command==='RECORD'?pending.body?.items:null;
  const codes=originalCodes||task?.codes||s?.rows?.map(row=>({raw_code:row.raw_code,quantity:row.quantity,scan_source:row.scan_source}))||[];
  const summary=originalCodes?{code_count:codes.length,quantity_total:codes.every(x=>Number.isSafeInteger(x.quantity))?codes.reduce((n,c)=>n+c.quantity,0):null}:task?.summary||{code_count:codes.length,quantity_total:codes.every(x=>Number.isSafeInteger(x.quantity))?codes.reduce((n,c)=>n+c.quantity,0):null};
  const lines=codes.map(row=>{const resolved=s?.rows?.find(x=>x.raw_code===row?.raw_code)?.resolved;return {code:row?.raw_code??null,sku:resolved?.sku_code??null,name:resolved?.sku_name??null,quantity:row?.quantity??null,scanSource:row?.scan_source??null,kind:resolved?.item_type==='BOX'?'BOX':'UNIT',recorded:false};});
  let disposition;try{disposition=task?linkedResumeDisposition(task,{owner,scope:resumeScope(getScope()),approvedOrigin:reader.approvedOrigin}):{action:pending?'CHECK_ORIGINAL':'READ_ONLY'};}catch{disposition={action:'READ_ONLY',reason:'P21_BUSINESS_READ_FORBIDDEN'};}
  const verifiedRecovery=r.result?.outcome==='SUCCEEDED'&&pending&&r.originalRef?.key===pending.key&&r.originalRef.command===pending.command;
  return {mode:P21_LINKED_RESUME_MODE,caseId,caseLabel:c?.id??caseId,document:{documentId:task?.document_id||s?.draftId,version:task?.version??s?.draftVersion??null},scanSessionId:task?.scan_session_id||s?.scanSessionId,lines,counts:{codes:summary.code_count,quantity:summary.quantity_total},checkpoint:{savedAt:task?.updated_at??null},verification:r.busy?'loading':task?'verified':'unverified',resumeBlocked:disposition.action==='OWNER_PREFLIGHT_REQUIRED'?'':disposition.reason||task?.resume_policy||'Chưa xác minh checkpoint.',readIssue:r.error?'load':task?.resume_policy==='OWNER_PREFLIGHT_REQUIRED'?null:'mismatch',busy:r.busy,unknown:!!pending||!!s?.unknown,request:pending?{id:pending.key,command:pending.command,version:pending.draftVersion}:null,receipt:null,task:task||null,localPendingOnly:!task&&!!pending,policy:task?.resume_policy??null,canResume:disposition.action==='OWNER_PREFLIGHT_REQUIRED',canOpenBusiness:disposition.action==='OPEN_P20'||!!verifiedRecovery&&r.result?.command==='RECORD'&&task?.can_open_business,recordLimitBlocked:codes.length>500,recoveryReady:!!verifiedRecovery,recoveryCommand:r.result?.command??null,caseData:c||null};
 }
 function wrapper(id){if(wrappers.has(id))return wrappers.get(id);const w={
  snapshot:()=>project(taskFor(id),owned(id)),resumeGuard:()=>reader.guard()?'':'Phiên hoặc kho không còn khớp.',
  writeGuard(){const s=this.snapshot();return s.unknown?'Giữ yêu cầu gốc để đối chiếu.':!s.canResume?'Chỉ xem dữ liệu; '+(s.resumeBlocked||'chưa xác minh điều kiện.') :'';},
  async verify(){const t=taskFor(id),o=local(owned(id)),ref=t||{document_id:o?.draftId,scan_session_id:o?.scanSessionId,warranty_case_id:o?.caseRow?.warranty_case_id};if(!ref.document_id)return {kind:'invalid'};if(!await reader.detail(ref))return {kind:'unverified'};const s=this.snapshot();return {kind:s.unknown?'unknown':s.canResume||s.canOpenBusiness?'verified':'unverified'};},
  async reconcile(){const o=owned(id);if(!o||!local(o))return {kind:'unknown',error:'Không tìm thấy đúng yêu cầu gốc trong phiên.'};if(!await reader.check(o))return {kind:'unknown',error:reader.snapshot().error?.message||'Chưa xác định kết quả. Giữ nguyên yêu cầu gốc.'};const r=reader.snapshot().result;if(r.outcome==='UNKNOWN')return {kind:'unknown',error:'Chưa xác định kết quả. Giữ nguyên yêu cầu gốc.'};return {kind:r.command==='SAVE'?'saved':r.command==='CANCEL'?'cancelled':this.snapshot().canOpenBusiness?'posted':'recorded-unavailable',command:r.command};},
  subscribe:fn=>reader.subscribe(fn),cancelVerification:()=>reader.cancel(),
 };wrappers.set(id,w);return w;}
 return {kind:'P21_OFFLINE_LINKED_VIEW',reader,gate:reader.gate,
  getOwner:id=>taskFor(id)||local(owned(id))?wrapper(id):null,getCase:getCasePresentation,guard:()=>reader.guard()?'':'Phiên hoặc kho không còn khớp.',subscribe:fn=>reader.subscribe(fn),
  getPending(){const r=reader.snapshot();if(r.privateUnavailable)return [];const data=(r.items||[]).map(t=>project(t,owned(t.document_id)));for(const o of getPendingOwners()){const s=local(o);if(s?.pending&&!data.some(x=>x.document.documentId===s.draftId))data.push(project(null,o));}return data;},
  listState:()=>reader.snapshot(),load:()=>reader.load(reader.snapshot().query||{}),refresh:()=>reader.load({...reader.snapshot().query,page:1}),loadMore:()=>reader.load({...reader.snapshot().query,page:(reader.snapshot().meta?.page||1)+1},{append:true}),
  activate:()=>reader.resume(),async show(){reader.resume();if(!reader.snapshot().loaded&&!reader.snapshot().busy)await reader.load();},
  hide:()=>reader.leave(),
  info:id=>{const s=project(taskFor(id),owned(id)),pending=local(owned(id))?.pending;const base=linkedResumeInfo(s.task,pending);return base+(pending?'\nHồ sơ yêu cầu gốc: '+pending.caseId:'')+'\nMã gốc:\n'+s.lines.map(l=>l.code??'Chưa xác minh').join('\n');},
  async openOwner(id){const t=taskFor(id),o=owned(id);if(!o||!local(o))return false;const read=reader.snapshot();if(read.result?.outcome==='SUCCEEDED')return preparation.handoffRecovery({reader,owner:o,onOwner});if(!t)return false;const d=preparation.navigate({task:t,owner:o,getScope,approvedOrigin:reader.approvedOrigin,onOwner});return d.action==='OWNER_PREFLIGHT_REQUIRED';},
  async openBusiness(id){const t=taskFor(id),o=owned(id);if(!t||!reader.guard())return false;const s=local(o);if(s?.pending){const proof=await reader.recoveryHandoff(o);if(!proof||proof.proof.read.command!=='RECORD')return false;}
   const scope=resumeScope(getScope());validateResumeBusinessTarget(t,scope,reader.approvedOrigin);onBusiness({businessId:t.business_document_id,caseId:t.warranty_case_id,path:t.business_detail_path,headerOwner:'P20',permissionRecheck:true});return true;},
  dispose(){reader.dispose();wrappers.clear();},
 };
}
