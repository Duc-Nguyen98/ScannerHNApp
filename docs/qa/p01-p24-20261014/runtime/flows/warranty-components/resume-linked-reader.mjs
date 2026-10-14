import {clone,P19_LINKED_MODE,LINKED_UUID} from './linked-contract.mjs';
import {P21_LINKED_RESUME_GATE,P21_LINKED_RESUME_MODE,ResumeReadError,resumeScope,resumeFamily,resumeNamespace,resumeError,originalResumeRequest,requestFingerprint} from './resume-linked-contract.mjs';

// A scoped read controller, not a new draft/journal/stock store. Private pending
// commands and all mutation methods remain solely on the retained P19 owner.
export function createLinkedResumeReader({adapter,getScope,getRetainedOwner=()=>null,onChange=()=>{}}){
 const initial=resumeScope(getScope()),initialKey=JSON.stringify(initial),tasks=new Map(),listeners=new Set(),memory=new Map(),flights=new Map();
 let generation=0,active=true,disposed=false,query={page:1,perPage:20},meta=null,loaded=false,selected=null,result=null,error=null,originalRef=null;
 const valid=()=>!disposed&&active&&JSON.stringify(resumeScope(getScope()))===initialKey;
 function guard(){try{return valid();}catch{return false;}}
 function emit(){if(active&&!disposed){const s=snapshot();onChange(s);for(const f of listeners)f(s);}}
 function snapshot(){if(!guard())return {mode:P21_LINKED_RESUME_MODE,gate:P21_LINKED_RESUME_GATE,privateUnavailable:true,logoutAllowed:true};return clone({mode:P21_LINKED_RESUME_MODE,gate:P21_LINKED_RESUME_GATE,items:[...tasks.values()],loadedCount:tasks.size,meta,loaded,selected,result,error,originalRef,query,busy:flights.size>0,logoutAllowed:true});}
 async function run(key,work,apply){
  if(!guard())return false;if(flights.has(key))return flights.get(key).promise;
  const controller=new AbortController(),ticket=generation,slot={controller,promise:null};flights.set(key,slot);
  slot.promise=Promise.resolve().then(()=>work(controller.signal)).then(value=>{if(!guard()||ticket!==generation)return false;apply(value);error=null;return true;}).catch(e=>{if(guard()&&ticket===generation&&e.name!=='AbortError')error=resumeError(e);return false;}).finally(()=>{if(flights.get(key)===slot)flights.delete(key);emit();});emit();return slot.promise;
 }
 const retained=task=>{const owner=getRetainedOwner(resumeNamespace(initial,task.document_id,task.scan_session_id)),s=owner?.snapshot();return s?.mode===P19_LINKED_MODE&&resumeFamily(s.scope||{})===resumeFamily(initial)&&s.draftId===task.document_id&&s.scanSessionId===task.scan_session_id?owner:null;};
 return {gate:P21_LINKED_RESUME_GATE,snapshot,guard,get approvedOrigin(){return adapter.approvedOrigin;},scope:()=>guard()?clone(initial):null,retainedOwner:task=>guard()?retained(task):null,
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
  load(options={}, {append=false}={}){
   if(!guard())return Promise.resolve(false);const signature=JSON.stringify(options),key='list:'+signature;
   if(flights.has(key))return flights.get(key).promise;
   if(append&&(!loaded||!meta?.has_more||options.page!==meta.page+1||(options.perPage??20)!==(query.perPage??20)||options.status!==query.status||options.warrantyCaseId!==query.warrantyCaseId))return Promise.resolve(false);
   if(!append)this.cancel();query=clone(options);
   return run(key,signal=>adapter.list(getScope(),options,{signal}),page=>{if(!append)tasks.clear();for(const t of page.tasks)if(!tasks.has(t.document_id))tasks.set(t.document_id,t);meta=page.meta;loaded=true;});
  },
  detail(reference){if(!guard())return Promise.resolve(false);const key='detail:'+resumeNamespace(initial,reference.document_id,reference.scan_session_id);return run(key,signal=>adapter.draft(getScope(),reference,{signal}),task=>{selected=task;result=null;});},
  check(owner){
   if(!guard())return Promise.resolve(false);const s=owner?.snapshot(),pending=s?.pending;
   if(s?.mode!==P19_LINKED_MODE||s.busy||!s.unknown||!pending||resumeFamily(s.scope||{})!==resumeFamily(initial))return Promise.resolve(false);
   const original=clone(pending);try{originalResumeRequest(original,initial);}catch(e){error=resumeError(e);emit();return Promise.resolve(false);}
   const key='check:'+resumeNamespace(initial,original.draftId,original.scanSessionId)+':'+original.key;
   if(flights.has(key))return flights.get(key).promise;
   result=null;
   return run(key,async signal=>{const fingerprint=await requestFingerprint(original);if(signal.aborted||!guard())throw new DOMException('Aborted','AbortError');
    // Capture before GET, so transport failure never loses the original read
    // identity. Only a hash/reference enters a checkpoint, never its raw body.
    originalRef={namespace:resumeNamespace(initial,original.draftId,original.scanSessionId),key:original.key,command:original.command,caseId:original.caseId,requestVersion:original.draftVersion,bodyFingerprint:fingerprint};emit();
    return {fingerprint,read:await adapter.request(getScope(),original,{signal})};},v=>{
    // Recheck the retained owner latch before publishing. Never resolve/reset it
    // from a latest task, last_request_id, timestamp or animation callback.
    const now=owner.snapshot();if(!now.pending||JSON.stringify(now.pending)!==JSON.stringify(pending))throw new ResumeReadError('P21_ORIGINAL_REQUEST_CHANGED');
    originalRef={namespace:resumeNamespace(initial,original.draftId,original.scanSessionId),key:original.key,command:original.command,caseId:original.caseId,requestVersion:original.draftVersion,bodyFingerprint:v.fingerprint};
    result=v.read;if(v.read.current)selected=v.read.current;
   });
  },
  remember(key,position){if(guard())memory.set(key,clone(position));},recall:key=>guard()?clone(memory.get(key)||null):null,
  async recoveryHandoff(owner){
   if(!guard()||result?.outcome!=='SUCCEEDED'||!originalRef)return null;const s=owner?.snapshot(),pending=s?.pending,ticket=generation;
   if(s?.mode!==P19_LINKED_MODE||!pending||resumeFamily(s.scope||{})!==resumeFamily(initial)||pending.key!==originalRef.key||pending.command!==originalRef.command)return null;
   if(await requestFingerprint(pending)!==originalRef.bodyFingerprint||!guard()||ticket!==generation||JSON.stringify(owner.snapshot().pending)!==JSON.stringify(pending))return null;
   return {owner,proof:clone({original:originalRef,read:result}),ownerRevalidationRequired:true,mutationExposed:false};
  },
  checkpoint(){return {schema:'p21-read-private-v1',namespace:resumeFamily(initial),originalRef:clone(originalRef)};},
  restoreCheckpoint(c){if(!guard()||c?.schema!=='p21-read-private-v1'||c.namespace!==resumeFamily(initial)||Object.keys(c).some(k=>!['schema','namespace','originalRef'].includes(k)))throw new ResumeReadError('P21_CHECKPOINT_ISOLATION');if(c.originalRef){const ref=c.originalRef;let ns;try{ns=JSON.parse(ref.namespace);}catch{throw new ResumeReadError('P21_CHECKPOINT_ISOLATION');}if(!/^[a-f0-9]{64}$/.test(ref.bodyFingerprint)||Object.keys(ref).some(k=>!['namespace','key','command','caseId','requestVersion','bodyFingerprint'].includes(k))||!LINKED_UUID.test(ref.key||'')||!LINKED_UUID.test(ref.caseId||'')||!['SAVE','RECORD','CANCEL'].includes(ref.command)||!Number.isSafeInteger(ref.requestVersion)||ref.requestVersion<0||!Array.isArray(ns)||ns.length!==6||ref.namespace!==resumeNamespace(initial,ns[4],ns[5]))throw new ResumeReadError('P21_CHECKPOINT_ISOLATION');}originalRef=clone(c.originalRef);},
  cancel(){generation++;for(const slot of flights.values())slot.controller.abort();flights.clear();},
  leave(){this.cancel();active=false;},
  resume(){if(disposed)return false;try{if(JSON.stringify(resumeScope(getScope()))!==initialKey)return false;}catch{return false;}active=true;return true;},
  logoutEvidence(){const c=this.checkpoint();this.leave();disposed=true;listeners.clear();return c;},
  dispose(){if(disposed)return;this.leave();disposed=true;listeners.clear();memory.clear();},
 };
}
