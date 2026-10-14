import {P22_CONTRACT,NfcHistoryError,p22Scope,p22Filters,uuid,identity,parseP22Page,parseP22Detail,parseP22Summary} from './nfc-audit-api-contract.mjs';
const BASE='/api/v1/mini-app/history';
export function createP22AuditAdapter({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs=15000,timePolicy={}}={}){
 if(typeof offlineRequest!=='function'||typeof getAccessToken!=='function')throw new NfcHistoryError('P22_ACTIVATION_OFF','blocked');
 let origin;try{const u=new URL(approvedApiOrigin);if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error();origin=u.origin;}catch{throw new NfcHistoryError('P22_ORIGIN_UNCONFIRMED','blocked');}
 if(!Number.isFinite(timeoutMs)||timeoutMs<=0)throw new NfcHistoryError('P22_TIMEOUT_INVALID');
 async function read(path,query,context,signal){
  const scope=p22Scope(context),token=getAccessToken();if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw new NfcHistoryError('P22_ACCESS_REQUIRED','auth');
  if(signal?.aborted)throw new NfcHistoryError('P22_READ_CANCELLED','cancelled');
  const c=new AbortController();let timer,removeAbort;
  const aborted=new Promise((_,reject)=>{const stop=()=>{c.abort();reject(new NfcHistoryError('P22_READ_CANCELLED','cancelled'));};if(signal?.aborted)stop();else if(signal){signal.addEventListener('abort',stop,{once:true});removeAbort=()=>signal.removeEventListener('abort',stop);}timer=setTimeout(()=>{c.abort();reject(new NfcHistoryError('P22_READ_TIMEOUT','error'));},timeoutMs);});
  const descriptor={method:'GET',path,url:origin+path+'?'+new URLSearchParams(query),query:{...query},headers:{Accept:'application/json',Authorization:'Bearer '+token,'X-NFC-History-Contract':P22_CONTRACT},cache:'no-store',redirect:'error',signal:c.signal};
  try{if(signal?.aborted)throw new NfcHistoryError('P22_READ_CANCELLED','cancelled');return await Promise.race([Promise.resolve().then(()=>{if(c.signal.aborted)throw new NfcHistoryError('P22_READ_CANCELLED','cancelled');return offlineRequest(descriptor);}),aborted]);}
  catch(e){if(e instanceof NfcHistoryError)throw e;throw new NfcHistoryError('P22_NETWORK_ERROR','error');}
  finally{clearTimeout(timer);removeAbort?.();}
 }
 const base=c=>({warehouse_id:p22Scope(c).warehouseId,source:'NFC'});
 return Object.freeze({
  async list(context,filters={},cursor=null,{signal}={}){const f=p22Filters(filters);if(cursor!==null&&(typeof cursor!=='string'||!cursor||cursor.length>4096))throw new NfcHistoryError('P22_CURSOR_INVALID');const q={...base(context),...f,...(cursor===null?{}:{cursor})};const r=await read(BASE+'/records',q,context,signal);return parseP22Page(r,p22Scope(context),{limit:f.limit,timePolicy});},
  async lookup(context,eventId,{signal}={}){if(!uuid(eventId))throw new NfcHistoryError('P22_EVENT_ID_INVALID');const r=await read(BASE+'/records',{...base(context),event_id:eventId},context,signal);return parseP22Page(r,p22Scope(context),{lookupEventId:eventId,limit:20,timePolicy}).items[0];},
  async detail(context,ref,{signal}={}){if(!identity(ref?.recordId)||!identity(ref?.activityId)||ref.eventId!==undefined&&!uuid(ref.eventId))throw new NfcHistoryError('P22_DETAIL_ID_INVALID');const r=await read(BASE+'/records/'+encodeURIComponent(ref.recordId),{...base(context),activityId:ref.activityId},context,signal);return parseP22Detail(r,p22Scope(context),ref,timePolicy);},
  async summary(context,filters={}, {signal}={}){const f=p22Filters(filters);delete f.limit;return parseP22Summary(await read(BASE+'/summary',{...base(context),...f},context,signal),p22Scope(context));},
 });
}
