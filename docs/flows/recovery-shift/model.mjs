// Preview-only workflow. No production API, delivery channel or shift policy is implied.
export const NAMESPACE='hn-recovery-shift-preview-v1';
export const B14_AGGREGATE=Object.freeze({inbound:12,outbound:6,warranty:4,nfc:3,documents:5,total:30,definition:'Disjoint activity events by operation; documents are separate document-view events. Not inventory or loaded-row counts.'});
export const scopeOf=s=>s?.session?JSON.stringify([s.session.namespace,s.session.authSessionId,s.session.actor?.id,s.session.warehouse?.id]):null;
export const allowed=s=>!!scopeOf(s)&&s.previewReady===true&&!s.startUnknown&&!s.sessionExpired&&s.session.permissions?.warehouseOperations===true&&s.session.warehouse?.active===true;
export const fingerprint=records=>JSON.stringify(records);
// The outbound geography catalogue is an asynchronous read cache, not draft
// content. Keep its snapshot for resume, but never dirty a saved draft for it.
const checkpointFingerprint=record=>{const {geography,...checkpoint}=record;return fingerprint(checkpoint);};
const recordSignature=records=>fingerprint(records.map(checkpointFingerprint));
const ownerOf=s=>s?.session?JSON.stringify([s.session.namespace,s.session.actor?.id,s.session.warehouse?.id]):null;
let receiptSequence=0;
function nextReceiptId(time){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(time)).map(p=>[p.type,p.value]));return `RQ-${p.year}${p.month}${p.day}-${String(++receiptSequence).padStart(3,'0')}`;}
export function createPreviewAdapter({delay=450,now=()=>new Date().toISOString()}={}){
 let scenario='ready';const receipts=new Map(),calls={recovery:0,save:0,end:0,check:0};
 return {setScenario(v){scenario=v;},metrics:()=>({...calls}),async request(request){
  const mode=scenario;calls[request.action]++;await new Promise(r=>setTimeout(r,delay));
  if(mode==='blocked')return {kind:'blocked'};
  if(mode==='error')return {kind:'failed'};
  if(mode==='unknown')return {kind:'unknown'};
  const issuedAt=now();
  const receipt={kind:'verified',namespace:NAMESPACE,request:structuredClone(request),id:nextReceiptId(issuedAt),time:issuedAt,...(request.action==='end'?{aggregate:{...B14_AGGREGATE}}:{})};
  receipts.set(request.id,receipt);return mode==='timeout-recorded'?{kind:'unknown'}:structuredClone(receipt);
 },async check(request){calls.check++;await new Promise(r=>setTimeout(r,delay));return structuredClone(receipts.get(request.id)||{kind:'unknown'});}};
}
export function createWorkflow({adapter,getState=()=>null,getRecords=()=>[],id=()=>crypto.randomUUID()}){
 let disposed=false,busy=false,processing=null,pending=null,inflight=null,recovery=null,summary=null,saved=new Map();
 let scope=scopeOf(getState());
 const owner=ownerOf(getState());
 const sessionOK=()=>!disposed&&scopeOf(getState())===scope&&allowed(getState())&&records().every(r=>r.document.actorId===getState().session.actor.id&&r.document.warehouseId===getState().session.warehouse.id);
 function records(){return getRecords().filter(r=>r.document&&r.outcome!=='recorded');}
 function unsaved(){return records().filter(r=>r.busy||r.unknown||r.saveUnknown||r.document.uncertain||saved.get(r.document.documentId)!==checkpointFingerprint(r));}
 function accept(result,request,checking=false){
  if(disposed)return {kind:'stale'};
  if(request.action!=='recovery'&&(!sessionOK()||!checking&&request.scope!==scope)){pending=structuredClone(request);return {kind:'stale'};}
  const valid=result?.kind==='verified'&&result.namespace===NAMESPACE&&fingerprint(result.request)===fingerprint(request)&&typeof result.id==='string'&&result.id.length>0&&Number.isFinite(Date.parse(result.time));
  if(valid&&request.action==='end'&&(!result.aggregate||!['inbound','outbound','warranty','nfc','documents','total'].every(k=>Number.isInteger(result.aggregate[k])&&result.aggregate[k]>=0)||['inbound','outbound','warranty','nfc','documents'].reduce((n,k)=>n+result.aggregate[k],0)!==result.aggregate.total))result={kind:'unknown'};
  else if(valid){
   if(request.action==='recovery')recovery=structuredClone(result);
   if(request.action==='save'){for(const r of request.records)saved.set(r.document.documentId,checkpointFingerprint(r));}
   if(request.action==='end'){
    if(unsaved().length||recordSignature(records())!==recordSignature(request.records)){pending=request;return {kind:'unknown'};}
    summary=structuredClone(result);
   }
   pending=null;return structuredClone(result);
  }
  if(['failed','blocked'].includes(result?.kind)){pending=null;return result;}
  pending=request;return {kind:'unknown'};
 }
 return {snapshot:()=>({busy,processing,scopeValid:sessionOK(),pending:structuredClone(pending),recovery:structuredClone(recovery),summary:structuredClone(summary),records:structuredClone(records()),unsaved:structuredClone(unsaved())}),
 // P15 has already authenticated and confirmed the same owner. Rebind the local
 // guard only; any old request keeps its original scope and requires a read/check.
 resumeSession(){const s=getState();if(disposed||!owner||ownerOf(s)!==owner||!allowed(s))return false;if(scopeOf(s)!==scope){if(inflight)pending=structuredClone(inflight);scope=scopeOf(s);}return true;},
 async run(action,username=''){
  if(disposed||busy||pending)return {kind:'guarded'};
  if(action==='recovery'&&!username.trim())return {kind:'invalid'};
  if(action!=='recovery'&&(!sessionOK()||summary))return {kind:'guarded'};
  if(action==='end'&&unsaved().length)return {kind:'guarded'};
  if(action==='save'&&records().some(r=>r.saveBlocked||r.busy||r.unknown||r.saveUnknown||r.document.uncertain))return {kind:'source-unknown'};
  if(!['recovery','save','end'].includes(action))return {kind:'guarded'};
  const request={namespace:NAMESPACE,id:id(),action,scope, ...(action==='recovery'?{username:username.trim()}:{records:structuredClone(records()),...(action==='end'?{shift:{actor:structuredClone(getState().session.actor),warehouse:structuredClone(getState().session.warehouse),startedAt:getState().shiftStartedAt??null}}:{})})};
  busy=true;processing=action;inflight=request;let result;try{result=await adapter.request(request);}catch{result={kind:'unknown'};}finally{busy=false;processing=null;inflight=null;}
  return accept(result,request);
 },async check(){if(disposed||busy||!pending||pending.action!=='recovery'&&!sessionOK())return {kind:'guarded'};const request=pending;busy=true;processing='check';let result;try{result=await adapter.check(request);}catch{result={kind:'unknown'};}finally{busy=false;processing=null;}return accept(result,request,true);},
 dispose(){disposed=true;},};
}
