import {P20_HISTORY_CONTRACT,P20_HISTORY_GATE,HistoryReadError,HISTORY_UUID,historyObject,historyScope,historyClone,validateHistoryDetailTarget,parseHistoryCase,parseHistoryPage,parseHistoryDetail} from './history-api-contract.mjs';

// Intentionally no fetch, credential storage or live activation. Only the
// explicitly injected offline transport can consume these bodyless GETs.
export function createP20HistoryAdapter({offlineRequest=null,approvedApiOrigin='',getAccessToken=()=>null,timeoutMs=15000}={}){
 const api='/api/v1/mini-app';let calls=0;
 function origin(){let u;try{u=new URL(approvedApiOrigin);}catch{throw new HistoryReadError('P20_ORIGIN_UNAPPROVED');}if(u.protocol!=='https:'||u.origin!==approvedApiOrigin||u.username||u.password)throw new HistoryReadError('P20_ORIGIN_UNAPPROVED');return u.origin;}
 function id(v){if(!HISTORY_UUID.test(v||''))throw new HistoryReadError('P20_CANONICAL_ID_REQUIRED');}
 async function request(path,query,{p20=false,signal}={}){
  if(typeof offlineRequest!=='function')throw new HistoryReadError('P20_ACTIVATION_OFF');
  const token=getAccessToken();if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw new HistoryReadError('P20_ACCESS_TOKEN_UNAVAILABLE','Chưa có ACCESS token của phiên.',{status:401});
  const headers={Accept:'application/json',Authorization:'Bearer '+token,...(p20?{'X-Component-History-Contract':P20_HISTORY_CONTRACT}:{})};
  const url=new URL(path,origin());for(const [key,value]of Object.entries(query))url.searchParams.set(key,String(value));
  const controller=new AbortController();let timer,listener;
  const stop=new Promise((_,reject)=>{listener=()=>{reject(new DOMException('Aborted','AbortError'));controller.abort();};if(signal?.aborted)listener();else signal?.addEventListener('abort',listener,{once:true});timer=setTimeout(()=>{reject(new HistoryReadError('P20_READ_TIMEOUT','Tải dữ liệu quá lâu. Có thể thử lại đúng yêu cầu GET.'));controller.abort();},timeoutMs);});
  try{
   if(signal?.aborted)throw new DOMException('Aborted','AbortError');calls++;
   const response=await Promise.race([offlineRequest({method:'GET',url:url.href,path,query:historyClone(query),headers,cache:'no-store',credentials:'omit',redirect:'error',live:false,signal:controller.signal}),stop]);
   if(!response||!Number.isInteger(response.status))throw new HistoryReadError('P20_TRANSPORT_UNVERIFIED');
   if(response.redirected||response.url&&new URL(response.url).origin!==origin())throw new HistoryReadError('P20_REDIRECT_REJECTED');
   if(response.status!==200){const b=response.body,trusted=historyObject(b)&&b.success===false&&historyObject(b.error)&&typeof b.error.code==='string';const code=trusted?b.error.code:'P20_UNTRUSTED_HTTP_'+response.status;throw new HistoryReadError(code,trusted?b.error.message||b.message||code:'Chưa xác minh phản hồi của nguồn đọc.',{status:response.status,trusted,restart:trusted&&response.status===422&&['WARRANTY_CURSOR_INVALID','WARRANTY_CURSOR_SCOPE_MISMATCH','WARRANTY_PAGING_CONFLICT'].includes(code)});}
   return response;
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',listener);}
 }
 return {gate:P20_HISTORY_GATE,offlineOnly:true,contract:P20_HISTORY_CONTRACT,get calls(){return calls;},get approvedOrigin(){return origin();},
  async case(scope,caseId,{signal}={}){historyScope(scope,{caseOnly:true});id(caseId);return parseHistoryCase(await request(api+'/warranty-cases/'+caseId,{warehouse_id:scope.warehouseId},{signal}),scope,caseId);},
  async list(scope,caseId,paging,{signal}={}){
   historyScope(scope);id(caseId);if(!historyObject(paging)||Object.keys(paging).some(k=>!['perPage','pagination','page','cursor'].includes(k))||!Number.isInteger(paging.perPage)||paging.perPage<1||paging.perPage>100||!['KEYSET','OFFSET'].includes(paging.pagination)||paging.page!=null&&paging.cursor!=null)throw new HistoryReadError('P20_QUERY_INVALID');
   const q={warehouse_id:scope.warehouseId,per_page:paging.perPage};
   if(paging.pagination==='OFFSET'){if(!Number.isInteger(paging.page)||paging.page<1||paging.page>100000||paging.cursor!=null)throw new HistoryReadError('P20_QUERY_INVALID');q.page=paging.page;}
   else{if(paging.page!=null)throw new HistoryReadError('P20_QUERY_INVALID');if(paging.cursor!=null){if(typeof paging.cursor!=='string'||!paging.cursor||paging.cursor==='start'||paging.cursor.length>4096)throw new HistoryReadError('P20_CURSOR_INVALID');q.cursor=paging.cursor;}}
   return parseHistoryPage(await request(api+'/warranty-cases/'+caseId+'/component-issues',q,{p20:true,signal}),scope,caseId,{...paging,approvedOrigin:origin()});
  },
  async detail(scope,link,{signal}={}){historyScope(scope);id(link.component_issue_document_id);const path=validateHistoryDetailTarget(link,scope,origin());return parseHistoryDetail(await request(path,{warehouse_id:scope.warehouseId},{p20:true,signal}),scope,link);},
 };
}
