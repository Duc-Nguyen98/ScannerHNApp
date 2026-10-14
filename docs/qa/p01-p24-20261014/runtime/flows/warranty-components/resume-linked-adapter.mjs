import {LINKED_UUID,clone} from './linked-contract.mjs';
import {P21_LINKED_RESUME_GATE,P21_LINKED_RESUME_MODE,P21_LINKED_RESUME_CONTRACT,ResumeReadError,resumeScope,linkedResumeQuery,linkedResumeList,linkedResumeDraft,originalResumeRequest,linkedResumeRequest} from './resume-linked-contract.mjs';

// Only an explicitly injected offline transport is available. Authentication
// comes from the auth owner at the boundary and never enters task/checkpoint.
export function createP21LinkedResumeAdapter({offlineRequest=null,approvedApiOrigin='',getAccessToken=()=>null,mode=P21_LINKED_RESUME_MODE,timeoutMs=15000}={}){
 let calls=0;
 const id=v=>{if(!LINKED_UUID.test(v||''))throw new ResumeReadError('P21_ID_INVALID');};
 function origin(){let u;try{u=new URL(approvedApiOrigin);}catch{throw new ResumeReadError('P21_ORIGIN_UNAPPROVED');}if(u.protocol!=='https:'||u.origin!==approvedApiOrigin||u.username||u.password)throw new ResumeReadError('P21_ORIGIN_UNAPPROVED');return u.origin;}
 async function read(path,query,{signal}={}){
  if(mode!==P21_LINKED_RESUME_MODE)throw new ResumeReadError('P21_MODE_UNSUPPORTED');
  if(typeof offlineRequest!=='function')throw new ResumeReadError('P21_ACTIVATION_OFF');
  const token=getAccessToken();if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw new ResumeReadError('P21_ACCESS_UNAVAILABLE','ACCESS của phiên chưa có.',{status:401});
  const url=new URL(path,origin());for(const [k,v]of Object.entries(query))url.searchParams.set(k,String(v));
  const controller=new AbortController();let timer,listener;
  const interrupted=new Promise((_,reject)=>{listener=()=>{controller.abort();reject(new DOMException('Aborted','AbortError'));};if(signal?.aborted)listener();else signal?.addEventListener('abort',listener,{once:true});timer=setTimeout(()=>{controller.abort();reject(new ResumeReadError('P21_READ_TIMEOUT','Chưa đọc được dữ liệu; giữ yêu cầu gốc để đối chiếu.'));},timeoutMs);});
  try{
   if(signal?.aborted)throw new DOMException('Aborted','AbortError');calls++;
   const response=await Promise.race([offlineRequest({method:'GET',path,url:url.href,query:clone(query),headers:{Accept:'application/json',Authorization:'Bearer '+token,'X-Component-Resume-Contract':P21_LINKED_RESUME_CONTRACT},signal:controller.signal,credentials:'omit',cache:'no-store',redirect:'error',live:false}),interrupted]);
   if(!response||!Number.isInteger(response.status))throw new ResumeReadError('P21_TRANSPORT_UNVERIFIED');
   if(response.redirected||response.url&&new URL(response.url).href!==url.href)throw new ResumeReadError('P21_REDIRECT_REJECTED');
   if(response.status!==200){const b=response.body,trusted=b&&b.success===false&&typeof b.error?.code==='string';throw new ResumeReadError(trusted?b.error.code:'P21_UNTRUSTED_HTTP_'+response.status,trusted?b.error.message||b.message||b.error.code:'Chưa xác minh phản hồi HTTP.',{status:response.status,trusted});}
   return response;
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',listener);}
 }
 return {gate:P21_LINKED_RESUME_GATE,mode,offlineOnly:true,contract:P21_LINKED_RESUME_CONTRACT,get calls(){return calls;},get approvedOrigin(){return origin();},
  async list(input,options={},controls={}){const s=resumeScope(input);if(Object.keys(options).some(k=>!['page','perPage','status','warrantyCaseId'].includes(k)))throw new ResumeReadError('P21_QUERY_INVALID');const q=linkedResumeQuery({warehouseId:s.warehouseId,...options});return linkedResumeList(await read('/api/v1/mini-app/drafts',q,controls),s,q);},
  async draft(input,reference,controls={}){const s=resumeScope(input);id(reference?.document_id);id(reference?.scan_session_id);if(reference.warranty_case_id!==undefined)id(reference.warranty_case_id);const q={warehouse_id:s.warehouseId,operation:'COMPONENT_ISSUE',scan_session_id:reference.scan_session_id};return linkedResumeDraft(await read('/api/v1/mini-app/drafts/'+reference.document_id,q,controls),s,reference);},
  async request(input,original,controls={}){const s=resumeScope(input);originalResumeRequest(original,s);const q={warehouse_id:s.warehouseId,operation:'COMPONENT_ISSUE',scan_session_id:original.scanSessionId,command:original.command};return linkedResumeRequest(await read('/api/v1/mini-app/drafts/'+original.draftId+'/requests/'+original.key,q,controls),s,original);},
 };
}
