import {P15_RELEASE,P15ReadError,buildOwnerRead,parseOwnerRead,ownerError,contextKey,requireP15,uuid} from './api-contract.mjs';

// Preparation accepts an injected offline mock only. There is no DEV origin,
// global fetch, live enable flag, login/refresh or writer method in this client.
export function createP15OwnerReadClient({transport,getContext,getAccessToken,cryptoProvider=globalThis.crypto,timeoutMs=12000}){
 requireP15(transport?.mockOnly===true&&typeof transport.request==='function','ACTIVATION_OFF');
 requireP15(typeof getContext==='function'&&typeof getAccessToken==='function'&&typeof cryptoProvider?.randomUUID==='function','CLIENT_DEPENDENCY_REQUIRED');
 const origin='https://p15.invalid',pending=new Set(),traces=new Set();let disposed=false;
 async function read(readId,reference,{signal}={}){
  requireP15(!disposed,'DISPOSED');const ctx=getContext(),scope=contextKey(ctx),built=buildOwnerRead(readId,reference,ctx);
  const token=getAccessToken();requireP15(typeof token==='string'&&token.length>0&&!/[\r\n]/.test(token),'ACCESS_REQUIRED');
  const trace=cryptoProvider.randomUUID();requireP15(uuid(trace)&&trace!==reference.operation_key&&!traces.has(trace),'FRESH_TRACE_REQUIRED');traces.add(trace);
  const url=new URL(built.path,origin);for(const [k,v]of Object.entries(built.query))url.searchParams.set(k,v);
  const controller=new AbortController();pending.add(controller);const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
  const still=()=>!disposed&&!controller.signal.aborted&&scope===contextKey(getContext());
  let timer,status=null,timedOut=false;
  try{
   const work=async()=>{
    requireP15(still(),'STALE_CONTEXT');
    const response=await transport.request(url.href,{method:'GET',headers:{Accept:'application/json',Authorization:'Bearer '+token,'X-Request-ID':trace,...built.headers},credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});
    status=response.status;requireP15(still(),'STALE_CONTEXT');requireP15(!response.redirected&&(!response.url||response.url===url.href),'UNAPPROVED_REDIRECT');
    const type=response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if(type!=='application/json')throw new P15ReadError('INVALID_JSON_CONTENT_TYPE',status,{requestTraceId:trace,provenance:'transport-unclassified'});
    let body;try{body=await response.json();}catch{throw new P15ReadError('INVALID_JSON',status,{requestTraceId:trace,provenance:'transport-unclassified'});}
    requireP15(still(),'STALE_CONTEXT');
    if(status!==200||body?.success!==true)throw ownerError(status,body,{readId,traceId:trace});
    requireP15(body.meta?.request_id===trace,'TRACE_MISMATCH');
    const result=parseOwnerRead(body,built,ctx);requireP15(still(),'STALE_CONTEXT');return result;
   };
   return await Promise.race([work(),new Promise((_,reject)=>{timer=setTimeout(()=>{timedOut=true;controller.abort();reject(new P15ReadError('READ_TIMEOUT',status,{requestTraceId:trace}));},timeoutMs);controller.signal.addEventListener('abort',()=>{if(!timedOut)reject(new P15ReadError('READ_ABORTED',status,{requestTraceId:trace}));},{once:true});})]);
  }catch(error){
   if(error instanceof P15ReadError){if(error.status===null)error.status=status;if(!error.requestTraceId)error.requestTraceId=trace;throw error;}
   // Do not copy exception messages/request objects: they may contain credentials.
   throw new P15ReadError('READ_TRANSPORT_UNAVAILABLE',status,{requestTraceId:trace});
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);pending.delete(controller);}
 }
 return {mode:'MOCK_PREPARATION',release:P15_RELEASE,read,context:()=>getContext(),contextKey:()=>contextKey(getContext()),validate:(id,r)=>buildOwnerRead(id,r,getContext()),cancel(){for(const c of pending)c.abort();},dispose(){disposed=true;for(const c of pending)c.abort();pending.clear();traces.clear();}};
}
