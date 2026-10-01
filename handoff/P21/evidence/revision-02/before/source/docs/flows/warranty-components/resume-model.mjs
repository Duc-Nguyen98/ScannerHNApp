import {createIssueFlow} from './issue-model.mjs';
import {scopeGuard} from '../attachments/model.mjs';
import {caseDetails} from '../warranty/warranty-model.mjs';

const clone=v=>structuredClone(v);
// An independent, page-memory fixture source. This is NOT a server API or durable save.
export function createCheckpointFixture({delay=220}={}){
 const records=new Map();let mode='ready',reads=0;
 return {setMode:v=>{mode=v;},getMode:()=>mode,metrics:()=>({reads}),
  save(record){records.set(record.document.documentId,clone(record));},
  async read(id){reads++;const selected=mode,record=clone(records.get(id));
   if(selected==='hanging')return new Promise(()=>{});
   await new Promise(r=>setTimeout(r,delay));
   if(selected==='error')throw Error('Nguồn đọc chưa khả dụng.');
   if(!record)return {kind:'missing'};
   if(selected==='conflict')record.document.version++;
   return {kind:selected==='unknown'?'unknown':'verified',record};
  },
 };
}
function reference(s){return {document:clone(s.document),scope:clone(s.scope),caseId:s.caseId,scanSessionId:s.scanSessionId,lines:clone(s.lines),request:clone(s.request),unknown:s.unknown,receipt:clone(s.receipt)};}
// Wrap the P19 owner, never reconstruct a new flow when opening a draft.
export function createRetainedIssue({source=createCheckpointFixture(),readTimeout=15000,now=()=>new Date().toISOString(),...options}){
 let block='',verification='unverified',epoch=0,timer=null,cancelRead=null,checkpoint=null,signature='',disposed=false;
 const flow=createIssueFlow({...options,extraWriteGuard:()=>block});
 const originalSnapshot=flow.snapshot,flowDispose=flow.dispose;
 const listeners=new Set(),notify=()=>{for(const fn of listeners)fn();};
 function retain(){const s=originalSnapshot(),ref=reference(s),next=JSON.stringify(ref);if(next===signature)return;signature=next;verification='unverified';
  checkpoint={...ref,caseVersion:caseDetails(s.caseId)?.version,checkpointId:crypto.randomUUID(),savedAt:now()};source.save(checkpoint);
 }
 retain();
 for(const name of ['scan','quantity','remove','restoreRecorded','post','reconcile']){
  const original=flow[name];flow[name]=(...args)=>{const result=original(...args);if(result?.then){notify();return result.then(r=>{retain();notify();return r;});}retain();notify();return result;};
 }
 const readGuard=()=>disposed?'Phiên thao tác đã đóng.':options.getState()?.sessionExpired?'Phiên đã hết hạn.':scopeGuard(options.getState(),originalSnapshot().scope);
 function cancel(){epoch++;clearTimeout(timer);cancelRead?.({kind:'cancelled'});cancelRead=null;if(verification==='loading'){verification='unverified';block='Chưa xác minh phiếu. Mở lại phần tiếp tục phiếu để kiểm tra.';}}
 return Object.assign(flow,{
  snapshot:()=>({...originalSnapshot(),checkpoint:clone(checkpoint),verification,resumeBlocked:block}),
  resumeGuard:readGuard,
  source,
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
  async verify(){if(readGuard())return {kind:'invalid',error:readGuard()};if(verification==='loading')return {kind:'busy'};
   const before=originalSnapshot();if(before.receipt)return {kind:'posted',receipt:before.receipt};if(before.unknown||before.busy)return {kind:'unknown'};
   const expected=clone(checkpoint),token=++epoch;block='Đang xác minh dữ liệu phiếu.';verification='loading';
   let result;try{result=await Promise.race([source.read(before.document.documentId),new Promise(resolve=>{cancelRead=resolve;timer=setTimeout(()=>resolve({kind:'timeout'}),readTimeout);})]);}catch{result={kind:'error'};}
   if(token!==epoch||disposed)return {kind:'cancelled'};clearTimeout(timer);cancelRead=null;
   const now=originalSnapshot(),record=result?.record;
   const matched=result?.kind==='verified'&&record&&JSON.stringify(record)===JSON.stringify(expected)&&JSON.stringify(reference(now))===JSON.stringify(reference(before))&&record.caseVersion===caseDetails(now.caseId)?.version;
   if(readGuard()){verification='blocked';block=readGuard();return {kind:'invalid',error:block};}
   if(matched){verification='verified';block='';return {kind:'verified'};}
   verification='unverified';block=result?.kind==='timeout'||result?.kind==='error'?'Chưa tải được dữ liệu để xác minh. Giữ nguyên phiếu và thử tải lại.':'Dữ liệu hoặc version chưa khớp. Giữ nguyên phiếu để đối chiếu trên Web.';
   return {kind:'unverified',error:block};
  },
  cancelVerification:cancel,
  dispose(){disposed=true;cancel();listeners.clear();flowDispose();},
 });
}
