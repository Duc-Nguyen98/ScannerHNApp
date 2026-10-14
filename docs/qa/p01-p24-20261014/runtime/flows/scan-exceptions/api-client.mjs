import {P17_RELEASE,P17OwnerError,P17_OPERATIONS,requireP17,uuid,contextKey,buildOwnerOperation,parseOwnerObservation,parseOwnerError} from './api-contract.mjs';

// OFF by construction: injected protocol mocks only, no global fetch, runtime
// origin or activation flag. A later production client belongs to the owner.
export function createP17OwnerClient({transport,getContext,getAccessToken,allowChecks=false,cryptoProvider=globalThis.crypto,timeoutMs=12000}){
 requireP17(transport?.mockOnly===true&&typeof transport.request==='function','ACTIVATION_OFF');requireP17(typeof getContext==='function'&&typeof getAccessToken==='function'&&typeof cryptoProvider?.randomUUID==='function','CLIENT_DEPENDENCY_REQUIRED');
 const origin='https://p17.invalid',pending=new Set(),traces=new Set(),reservations=new WeakMap();let disposed=false;
 function validate(id,reference,options={}){
  if(id==='P05_RELATED_RESERVATION_DOCUMENT')requireP17(reservations.get(options.reservation)===contextKey(getContext()),'FRESH_RESERVATION_REQUIRED');
  return buildOwnerOperation(id,reference,getContext(),{...options,allowChecks});
 }
 async function inspect(id,reference,{body,reservation,signal}={}){
  requireP17(!disposed,'DISPOSED');const ctx=structuredClone(getContext()),scope=contextKey(ctx),built=validate(id,reference,{body,reservation});
  const token=getAccessToken();requireP17(typeof token==='string'&&token.length>0&&!/[\r\n]/.test(token),'ACCESS_REQUIRED');
  const trace=cryptoProvider.randomUUID();requireP17(uuid(trace)&&trace!==reference.operation_key&&trace!==reference.client_event_id&&!traces.has(trace),'FRESH_TRACE_REQUIRED');traces.add(trace);
  const url=new URL(built.path,origin);for(const [k,v]of Object.entries(built.query))url.searchParams.set(k,v);
  const controller=new AbortController();pending.add(controller);const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  const current=()=>!disposed&&!controller.signal.aborted&&contextKey(getContext())===scope;
  let timer,status=null,timedOut=false;
  try{
   const work=async()=>{
    requireP17(current(),'STALE_CONTEXT');
    const response=await transport.request(url.href,{method:built.spec.method,headers:{Accept:'application/json',Authorization:'Bearer '+token,'X-Request-ID':trace,...built.headers,...(built.body?{'Content-Type':'application/json'}:{})},...(built.body?{body:JSON.stringify(built.body)}:{}),credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});
    status=response.status;requireP17(current(),'STALE_CONTEXT');requireP17(!response.redirected&&(!response.url||response.url===url.href),'UNAPPROVED_REDIRECT');
    if(response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new P17OwnerError('INVALID_JSON_CONTENT_TYPE',status,{traceId:trace,provenance:'transport-unclassified'});
    let b;try{b=await response.json();}catch{throw new P17OwnerError('INVALID_JSON',status,{traceId:trace,provenance:'transport-unclassified'});}
    requireP17(current(),'STALE_CONTEXT');
    if(status!==200||b?.success!==true){const error=parseOwnerError(status,b,built,ctx,trace);if(error.reservation?.can_open===true)reservations.set(error.reservation,scope);throw error;}
    requireP17(b.meta?.request_id===trace,'TRACE_MISMATCH');
    if(id==='P05_RESOLVE'){
     const cache=(response.headers.get('cache-control')||'').toLowerCase().split(',').map(s=>s.trim());requireP17(cache.includes('private')&&cache.includes('no-store'),'RESOLVER_CACHE_POLICY_INVALID');
    }
    const result=parseOwnerObservation(b,built,ctx);requireP17(current(),'STALE_CONTEXT');
    if(result.reservation?.can_open===true)reservations.set(result.reservation,scope);
    return result;
   };
   return await Promise.race([work(),new Promise((_,reject)=>{timer=setTimeout(()=>{timedOut=true;controller.abort();reject(new P17OwnerError('OWNER_CHECK_TIMEOUT',status,{traceId:trace}));},timeoutMs);controller.signal.addEventListener('abort',()=>{if(!timedOut)reject(new P17OwnerError('OWNER_CHECK_ABORTED',status,{traceId:trace}));},{once:true});})]);
  }catch(e){
   if(e instanceof P17OwnerError){if(e.status===null)e.status=status;if(e.traceId===null)e.traceId=trace;throw e;}
   // Shared P15 parsers carry code-only failures; do not expose raw body/errors.
   if(e?.name==='P15ReadError')throw new P17OwnerError(e.code,status,{traceId:trace});
   throw new P17OwnerError('OWNER_TRANSPORT_UNAVAILABLE',status,{traceId:trace});
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);pending.delete(controller);}
 }
 return {mode:'MOCK_PREPARATION',release:P17_RELEASE,operations:P17_OPERATIONS,inspect,validate,context:()=>getContext(),contextKey:()=>contextKey(getContext()),cancel(){for(const c of pending)c.abort();},dispose(){disposed=true;for(const c of pending)c.abort();pending.clear();traces.clear();}};
}
