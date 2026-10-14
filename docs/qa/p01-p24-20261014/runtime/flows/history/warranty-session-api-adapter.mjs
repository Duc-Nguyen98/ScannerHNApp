import {P23_ROUTES,P23ReadError,p23Scope,p23Query,uuid,parseCases,parseCase,parseTimeline,parseSessions,parseSessionEvents} from './warranty-session-api-contract.mjs';
// Explicit injected transport only. This module never calls global fetch or loads a fixture.
export function createP23ReadAdapter({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs=15000}={}){
 if(typeof offlineRequest!=='function'||typeof getAccessToken!=='function')throw new P23ReadError('P23_ACTIVATION_OFF','blocked');
 let origin;try{const u=new URL(approvedApiOrigin);if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error();origin=u.origin;}catch{throw new P23ReadError('P23_ORIGIN_UNCONFIRMED','blocked');}
 if(!Number.isFinite(timeoutMs)||timeoutMs<=0)throw new P23ReadError('P23_TIMEOUT_INVALID');
 async function read(lane,context,query={},id=null,{signal}={}){
  const family=['cases','case','timeline'].includes(lane)?'cases':'sessions',s=p23Scope(context,family);
  if(!Object.hasOwn(P23_ROUTES,lane))throw new P23ReadError('P23_ROUTE_INVALID');
  if(['case','timeline','events'].includes(lane)&&(!uuid(id)||id===s.authSessionId))throw new P23ReadError('P23_ENTITY_ID_INVALID','notfound',404);
  if(lane==='case'&&(query===null||typeof query!=='object'||Array.isArray(query)||Object.keys(query).length))throw new P23ReadError('P23_QUERY_INVALID');
  const q=lane==='case'?{}:p23Query(lane,query),path=P23_ROUTES[lane].replace('{id}',id).replace('{sessionId}',id),requestQuery={warehouse_id:s.warehouseId,...q};
  const token=getAccessToken();if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw new P23ReadError('P23_ACCESS_REQUIRED','auth',401);
  if(signal?.aborted)throw new P23ReadError('P23_READ_CANCELLED','cancelled');
  const controller=new AbortController();let timer,release;
  const interrupted=new Promise((_,reject)=>{const stop=()=>{controller.abort();reject(new P23ReadError('P23_READ_CANCELLED','cancelled'));};if(signal){signal.addEventListener('abort',stop,{once:true});release=()=>signal.removeEventListener('abort',stop);}timer=setTimeout(()=>{controller.abort();reject(new P23ReadError('P23_READ_TIMEOUT','error'));},timeoutMs);});
  const descriptor={method:'GET',path,url:origin+path+'?'+new URLSearchParams(requestQuery),query:requestQuery,headers:{Accept:'application/json',Authorization:'Bearer '+token},cache:'no-store',redirect:'error',signal:controller.signal};
  try{
   const response=await Promise.race([Promise.resolve().then(()=>{if(controller.signal.aborted||signal?.aborted)throw new P23ReadError('P23_READ_CANCELLED','cancelled');return offlineRequest(descriptor);}),interrupted]);
   if(signal?.aborted)throw new P23ReadError('P23_READ_CANCELLED','cancelled');
   if(lane==='cases')return parseCases(response,s,q);if(lane==='case')return parseCase(response,s,id);if(lane==='timeline')return parseTimeline(response,s,id,q);if(lane==='sessions')return parseSessions(response,s,q);return parseSessionEvents(response,s,id,q);
  }catch(e){if(e instanceof P23ReadError)throw e;throw new P23ReadError('P23_NETWORK_ERROR','error');}finally{clearTimeout(timer);release?.();}
 }
 return Object.freeze({read});
}
