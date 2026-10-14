import {scopeKey as authenticatedScopeKey} from '../documents/api-client.mjs';
import {P13_RELEASE,P13ApiError,requireP13,integer,uuid,listQuery,parsePage,parseDetail,parseCount,parseRead} from './api-contract.mjs';

// Same authenticated transport/context injection used by P12. No global fetch,
// DEV origin, login or token storage; only mock preparation is permitted today.
export function p13ScopeKey(context){const key=authenticatedScopeKey(context);requireP13(integer(context.userVersion),'AUTH_CONTEXT_REQUIRED');return JSON.stringify([key,context.userVersion]);}
export function createP13ApiClient({transport,getContext,getAccessToken,baseUrl='https://p13.invalid',timeoutMs=12000}){
 requireP13(transport?.mockOnly===true&&typeof transport.request==='function','ACTIVATION_OFF');
 const origin=new URL(baseUrl);requireP13(origin.protocol==='https:'&&origin.pathname==='/'&&!origin.search&&!origin.hash&&!origin.username&&!origin.password,'UNAPPROVED_ORIGIN');
 requireP13(typeof getContext==='function'&&typeof getAccessToken==='function','AUTH_CONTEXT_REQUIRED');
 let disposed=false;const pending=new Set();
 async function request(path,method,query,parse,{signal}={}){
  requireP13(!disposed,'DISPOSED');const key=p13ScopeKey(getContext()),token=getAccessToken();requireP13(typeof token==='string'&&token.length>0,'AUTH_REQUIRED');
  const url=new URL(path,origin);for(const [k,v]of Object.entries(query||{}))url.searchParams.set(k,String(v));
  const controller=new AbortController();pending.add(controller);let timer,timedOut=false;
  const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
  const valid=()=>{try{return !disposed&&!controller.signal.aborted&&key===p13ScopeKey(getContext());}catch{return false;}};
  try{
   requireP13(valid(),'STALE_CONTEXT');
   const perform=async()=>{
    const response=await transport.request(url.href,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json'},cache:'no-store',credentials:'omit',redirect:'error',signal:controller.signal});
    requireP13(valid(),'STALE_CONTEXT');let body;try{body=await response.json();}catch{throw new P13ApiError('INVALID_RESPONSE');}
    requireP13(valid(),'STALE_CONTEXT');
    if(!response.ok||body?.success!==true)throw new P13ApiError(body?.error?.code||'HTTP_ERROR',body?.error?.message||'Nguồn thông báo chưa khả dụng.',response.status);
    requireP13(response.headers.get('content-type')?.split(';')[0]==='application/json'&&response.headers.get('cache-control')?.includes('private')&&response.headers.get('cache-control')?.includes('no-store'),'PRIVATE_RESPONSE_REQUIRED');
    return parse(body);
   };
   return await Promise.race([perform(),new Promise((_,reject)=>{timer=setTimeout(()=>{timedOut=true;controller.abort();reject(new P13ApiError(method==='PATCH'?'READ_STATE_UNKNOWN':'READ_TIMEOUT','Chưa nhận được kết quả xác minh.'));},timeoutMs);controller.signal.addEventListener('abort',()=>{if(!timedOut)reject(new P13ApiError('ABORTED'));},{once:true});})]);
  }catch(error){if(error instanceof P13ApiError)throw error;throw new P13ApiError(method==='PATCH'?'READ_STATE_UNKNOWN':'READ_NETWORK_ERROR');}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);pending.delete(controller);}
 }
 const idPath=id=>{requireP13(uuid(id),'RECIPIENT_MISMATCH');return '/api/v1/notifications/'+encodeURIComponent(id.toLowerCase());};
 return {mode:'MOCK_PREPARATION',release:P13_RELEASE,contextKey:()=>p13ScopeKey(getContext()),
  page(input={},options={}){const q=listQuery(input);return request('/api/v1/notifications','GET',q,b=>parsePage(b,q),options);},
  detail(id,options={}){return request(idPath(id),'GET',null,b=>parseDetail(b,id),options);},
  count(options={}){return request('/api/v1/notifications/unread-count','GET',null,parseCount,options);},
  read(id,{intent,...options}={}){requireP13(['open-recipient','retry-read'].includes(intent),'USER_INTENT_REQUIRED');return request(idPath(id)+'/read','PATCH',null,b=>parseRead(b,id),options);},
  cancel(){for(const controller of pending)controller.abort();},dispose(){disposed=true;for(const controller of pending)controller.abort();pending.clear();}
 };
}
