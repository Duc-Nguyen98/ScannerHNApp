import {P24_OWNER_GATE,P19_COMMAND_CONTRACT,P19_COMMAND_HEADER,COMMAND_BASE,COMMAND_CHECK,UUID,ScannerOwnerError,ensure,scannerScope,scopeKey,copy,parseScannerResolve,parseCommandRecovery,currentDetailPath,parseCanonicalCurrent} from './scanner-owner-contract.mjs';
import {validateCommandCheckpoint} from './scanner-owner-checkpoint.mjs';
export function preparationOrigin(value){let u;try{u=new URL(value);}catch{throw new ScannerOwnerError('P24_ORIGIN_UNAPPROVED');}if(u.origin!==value||u.username||u.password||!['http:','https:'].includes(u.protocol)||!(u.hostname.endsWith('.invalid')||['localhost','127.0.0.1','[::1]'].includes(u.hostname)))throw new ScannerOwnerError('P24_OFFLINE_ORIGIN_REQUIRED');return u.origin;}
// Only dependency-injected reads. No default fetch or executable command method.
export function createScannerOwnerAdapter({offlineRequest=null,approvedApiOrigin='',getAccessToken=()=>null,timeoutMs=15000}={}){
 let calls=0;
 async function request(path,query,{body,signal,commandHeader=true,method='GET'}={}){
  if(typeof offlineRequest!=='function')throw new ScannerOwnerError('P24_ACTIVATION_OFF');const origin=preparationOrigin(approvedApiOrigin),token=getAccessToken();if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw new ScannerOwnerError('P24_ACCESS_UNAVAILABLE','Phiên chưa xác minh.',{status:401});
  if(method==='GET'&&body!==undefined)throw new ScannerOwnerError('P24_GET_BODY_FORBIDDEN');
  const url=new URL(path,origin);for(const [k,v]of Object.entries(query))url.searchParams.set(k,String(v));
  const headers={Accept:'application/json',Authorization:'Bearer '+token,...(commandHeader?{[P19_COMMAND_HEADER]:P19_COMMAND_CONTRACT}:{}),...(method==='POST'?{'Content-Type':'application/json'}:{})};
  const c=new AbortController();let timer,abort;
  const interrupted=new Promise((_,reject)=>{abort=()=>{c.abort();reject(new DOMException('Aborted','AbortError'));};if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>{c.abort();reject(new ScannerOwnerError('P24_READ_TIMEOUT','Chưa nhận kết quả nguồn đọc.'));},timeoutMs);});
  try{if(signal?.aborted)throw new DOMException('Aborted','AbortError');calls++;const descriptor={method,path,url:url.href,query:copy(query),headers,cache:'no-store',credentials:'omit',redirect:'error',live:false,signal:c.signal,...(body!==undefined?{body:copy(body)}:{})};const response=await Promise.race([offlineRequest(descriptor),interrupted]);
   ensure(response&&Number.isInteger(response.status),'Transport chưa xác minh.');if(response.redirected||response.url&&new URL(response.url).origin!==origin)throw new ScannerOwnerError('P24_REDIRECT_REJECTED');if(response.status!==200)throw new ScannerOwnerError(response.body?.error?.code||'P24_READ_HTTP_ERROR',response.body?.error?.message||'Chưa xác minh kết quả đọc.',{status:response.status});return response;
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }
 return {gate:P24_OWNER_GATE,offlineOnly:true,get calls(){return calls;},get approvedOrigin(){return preparationOrigin(approvedApiOrigin);},
  async resolve(scope,caseId,raw,{signal}={}){scannerScope(scope);ensure(UUID.test(caseId||'')&&typeof raw==='string'&&raw.trim()&&Array.from(raw).length<=512,'Resolve input/case sai.');return parseScannerResolve(await request(COMMAND_BASE+'/resolve-code',{}, {method:'POST',body:{raw_code:raw,warehouse_id:scope.warehouseId,warranty_case_id:caseId},signal}),scope,caseId,raw);},
  async check(journal,scope,{signal}={}){scannerScope(scope);validateCommandCheckpoint(journal);return parseCommandRecovery(await request(COMMAND_CHECK+journal.key,{operation:journal.operation},{signal}),journal,scope,this.approvedOrigin);},
  async current(journal,historical,scope,{signal}={}){scannerScope(scope);ensure(scopeKey(journal.scope)===scopeKey(scope)&&historical?.outcome==='SUCCEEDED','Current read phải có receipt đã xác minh và đúng family.');const path=currentDetailPath(historical.receipt.result.current_detail_url,this.approvedOrigin,historical.receipt.result.business_document_id);return parseCanonicalCurrent(await request(path,{}, {signal,commandHeader:false}),journal,historical);},
 };
}
