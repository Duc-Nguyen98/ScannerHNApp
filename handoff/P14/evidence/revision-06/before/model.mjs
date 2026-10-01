// Preview-only workflow. No production API, delivery channel or shift policy is implied.
export const NAMESPACE='hn-recovery-shift-preview-v1';
export const B14_AGGREGATE=Object.freeze({inbound:12,outbound:6,warranty:4,nfc:3,documents:5,total:30,definition:'Disjoint activity events by operation; documents are separate document-view events. Not inventory or loaded-row counts.'});
export const scopeOf=s=>s?.session?JSON.stringify([s.session.namespace,s.session.authSessionId,s.session.actor?.id,s.session.warehouse?.id]):null;
export const allowed=s=>!!scopeOf(s)&&s.previewReady===true&&!s.startUnknown&&s.session.permissions?.warehouseOperations===true&&s.session.warehouse?.active===true;
export const fingerprint=records=>JSON.stringify(records);
export function createPreviewAdapter({delay=450,now=()=>new Date().toISOString()}={}){
 let scenario='ready';const receipts=new Map(),calls={recovery:0,save:0,end:0,check:0};
 return {setScenario(v){scenario=v;},metrics:()=>({...calls}),async request(request){
  const mode=scenario;calls[request.action]++;await new Promise(r=>setTimeout(r,delay));
  if(mode==='blocked')return {kind:'blocked'};
  if(mode==='error')return {kind:'failed'};
  if(mode==='unknown')return {kind:'unknown'};
  const receipt={kind:'verified',namespace:NAMESPACE,request:structuredClone(request),id:'RQ-'+now().slice(0,10).replaceAll('-','')+'-'+String(calls[request.action]).padStart(3,'0'),time:now(),...(request.action==='end'?{aggregate:{...B14_AGGREGATE}}:{})};
  receipts.set(request.id,receipt);return mode==='timeout-recorded'?{kind:'unknown'}:structuredClone(receipt);
 },async check(request){calls.check++;await new Promise(r=>setTimeout(r,delay));return structuredClone(receipts.get(request.id)||{kind:'unknown'});}};
}
export function createWorkflow({adapter,getState=()=>null,getRecords=()=>[],id=()=>crypto.randomUUID()}){
 let disposed=false,busy=false,processing=null,pending=null,recovery=null,summary=null,saved=new Map();
 const scope=scopeOf(getState());
 const sessionOK=()=>!disposed&&scopeOf(getState())===scope&&allowed(getState())&&records().every(r=>r.document.actorId===getState().session.actor.id&&r.document.warehouseId===getState().session.warehouse.id);
 function records(){return getRecords().filter(r=>r.document&&r.outcome!=='recorded');}
 function unsaved(){return records().filter(r=>r.busy||r.unknown||r.saveUnknown||r.document.uncertain||saved.get(r.document.documentId)!==fingerprint(r));}
 function accept(result,request){
  if(disposed||request.action!=='recovery'&&!sessionOK())return {kind:'stale'};
  const valid=result?.kind==='verified'&&result.namespace===NAMESPACE&&fingerprint(result.request)===fingerprint(request)&&typeof result.id==='string'&&result.id.length>0&&Number.isFinite(Date.parse(result.time));
  if(valid&&request.action==='end'&&(!result.aggregate||!['inbound','outbound','warranty','nfc','documents','total'].every(k=>Number.isInteger(result.aggregate[k])&&result.aggregate[k]>=0)||['inbound','outbound','warranty','nfc','documents'].reduce((n,k)=>n+result.aggregate[k],0)!==result.aggregate.total))result={kind:'unknown'};
  else if(valid){
   if(request.action==='recovery')recovery=structuredClone(result);
   if(request.action==='save'){for(const r of request.records)saved.set(r.document.documentId,fingerprint(r));}
   if(request.action==='end'){
    if(unsaved().length||fingerprint(records())!==fingerprint(request.records)){pending=request;return {kind:'unknown'};}
    summary=structuredClone(result);
   }
   pending=null;return structuredClone(result);
  }
  if(['failed','blocked'].includes(result?.kind)){pending=null;return result;}
  pending=request;return {kind:'unknown'};
 }
 return {snapshot:()=>({busy,processing,pending:structuredClone(pending),recovery:structuredClone(recovery),summary:structuredClone(summary),records:structuredClone(records()),unsaved:structuredClone(unsaved())}),
 async run(action,username=''){
  if(disposed||busy||pending)return {kind:'guarded'};
  if(action==='recovery'&&!username.trim())return {kind:'invalid'};
  if(action!=='recovery'&&(!sessionOK()||summary))return {kind:'guarded'};
  if(action==='end'&&unsaved().length)return {kind:'guarded'};
  if(action==='save'&&records().some(r=>r.busy||r.unknown||r.saveUnknown||r.document.uncertain))return {kind:'source-unknown'};
  if(!['recovery','save','end'].includes(action))return {kind:'guarded'};
  const request={namespace:NAMESPACE,id:id(),action,scope, ...(action==='recovery'?{username:username.trim()}:{records:structuredClone(records()),...(action==='end'?{shift:{actor:structuredClone(getState().session.actor),warehouse:structuredClone(getState().session.warehouse),startedAt:getState().shiftStartedAt??null}}:{})})};
  busy=true;processing=action;let result;try{result=await adapter.request(request);}catch{result={kind:'unknown'};}finally{busy=false;processing=null;}
  return accept(result,request);
 },async check(){if(disposed||busy||!pending)return {kind:'guarded'};const request=pending;busy=true;processing='check';let result;try{result=await adapter.check(request);}catch{result={kind:'unknown'};}finally{busy=false;processing=null;}return accept(result,request);},
 dispose(){disposed=true;},};
}
