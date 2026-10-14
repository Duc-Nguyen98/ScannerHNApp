import {P16_RELEASE,p16ListQuery,withP16Evidence,p16HttpError} from '../data-states/api-contract.mjs';
import {P12_RELEASE,P12ReadError,requireValue,uuid,sourcePath,stockListQuery,evidenceQuery,attachmentQuery,supplierQuery,warrantyQuery,SOURCE_PATHS,parseStockList,parseStockDetail,parseScans,parseAttachments,parseSuppliers,parseWarranty,parseWarrantyReceipt,validateReadTarget} from './api-contract.mjs';

// No global fetch, DEV URL or activation flag. Only an injected mock transport is
// accepted during preparation; production use remains behind the release gap.
export function scopeKey(context){requireValue(context&&uuid(context.actorId)&&uuid(context.authSessionId)&&uuid(context.warehouseId)&&Array.isArray(context.rights)&&context.rights.every(p=>typeof p==='string')&&Number.isSafeInteger(context.generation),'CONTEXT_REQUIRED');return JSON.stringify([context.actorId,context.authSessionId,context.warehouseId,[...context.rights].sort(),context.generation]);}
const permissions={inbound:['inbound.view'],outbound:['outbound.view'],warranty:['warranty.view','warranty.manage']};
function allowed(context,type,extra=[]){scopeKey(context);requireValue(permissions[type]?.some(p=>context.rights.includes(p))&&extra.every(p=>context.rights.includes(p)),'READ_FORBIDDEN', 'Nguồn này chưa được cấp quyền đọc.');}
function getOptions(options){requireValue(options&&typeof options==='object'&&!Array.isArray(options),'GET_OPTIONS_REQUIRED');requireValue(!Object.hasOwn(options,'body'),'GET_BODY_PROHIBITED');return options;}
export function createP12ReadClient({transport,getContext,getAccessToken,baseUrl='https://p12.invalid',timeoutMs=12000}){
 requireValue(transport?.mockOnly===true&&typeof transport.request==='function','ACTIVATION_OFF','P12 chỉ được chuẩn bị bằng mock; chưa được kích hoạt production.');const origin=new URL(baseUrl);requireValue(!origin.username&&!origin.password&&!origin.search&&!origin.hash,'UNAPPROVED_ORIGIN');requireValue(origin.protocol==='https:'||['localhost','127.0.0.1'].includes(origin.hostname),'UNAPPROVED_ORIGIN');requireValue(origin.hostname.endsWith('.invalid')||['localhost','127.0.0.1'].includes(origin.hostname),'MOCK_ORIGIN_REQUIRED','Preparation chỉ nhận origin kiểm thử cô lập.');
 let disposed=false;const requests=new Set();
 async function request(path,query,parser,options={}){
  const {signal,binary=false,listStateContract=null}=getOptions(options);
  requireValue(!disposed,'DISPOSED');const ctx=getContext(),key=scopeKey(ctx),url=new URL(path,origin);requireValue(url.origin===origin.origin&&!url.username&&!url.password&&url.pathname.startsWith('/api/v1/mini-app/'),'UNAPPROVED_ORIGIN');
  for(const [k,v]of Object.entries(query||{}))if(v!==null&&v!==undefined)url.searchParams.set(k,String(v));const token=getAccessToken();requireValue(typeof token==='string'&&token.length>0,'AUTH_REQUIRED');
  const controller=new AbortController();requests.add(controller);let timedOut=false,timer;const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
  try{
   const perform=async()=>{
    requireValue(!controller.signal.aborted,'ABORTED');
    const response=await transport.request(url.href,{method:'GET',headers:{Authorization:'Bearer '+token,Accept:binary?'application/pdf,image/*':'application/json'},cache:'no-store',credentials:'omit',redirect:'error',signal:controller.signal});
    requireValue(!controller.signal.aborted&&!disposed&&key===scopeKey(getContext()),'STALE_CONTEXT');
    requireValue(!response.redirected&&(!response.url||response.url===url.href),'UNAPPROVED_REDIRECT');
    if(!response.ok&&listStateContract===P16_RELEASE.contract)throw await p16HttpError(response);
    if(!response.ok)throw new P12ReadError('HTTP_'+response.status,'Không đọc được nguồn dữ liệu.',response.status);
    const type=response.headers.get('content-type')?.split(';')[0].toLowerCase();
    // Revision2 metadata responses and binaries remain private/no-store.
    // Data and ETag are retained only within the verified owner scope.
    const mandated=binary||path.includes('/scan-entries')||path.includes('/attachments')||path.includes('/warranty-')||Object.values(SOURCE_PATHS).some(p=>path===p||path.startsWith(p+'/'));
    if(mandated)requireValue(response.headers.get('cache-control')?.includes('private')&&response.headers.get('cache-control')?.includes('no-store'),'PRIVATE_CACHE_REQUIRED');
    let result;
    if(binary){requireValue(['application/pdf','image/png','image/jpeg','image/webp'].includes(type)&&response.headers.get('x-content-type-options')==='nosniff','INVALID_BINARY_HEADERS');const bytes=new Uint8Array(await response.arrayBuffer());requireValue(bytes.length>0,'EMPTY_BINARY');
     const signature=type==='application/pdf'?new TextDecoder().decode(bytes.slice(0,5))==='%PDF-':type==='image/png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';requireValue(signature,'INVALID_BINARY');result={bytes,mime:type};}
    else{requireValue(type==='application/json','INVALID_JSON_CONTENT_TYPE');result=parser(await response.json());result.responseHeaders={etag:response.headers.get('etag'),cacheControl:response.headers.get('cache-control'),contentType:type};}
    requireValue(!controller.signal.aborted&&!disposed&&key===scopeKey(getContext()),'STALE_CONTEXT');return result;
   };
   return await Promise.race([perform(),new Promise((_,reject)=>{timer=setTimeout(()=>{timedOut=true;controller.abort();reject(new P12ReadError('READ_TIMEOUT','Yêu cầu đọc quá thời gian.'));},timeoutMs);controller.signal.addEventListener('abort',()=>{if(!timedOut)reject(new P12ReadError('ABORTED','Yêu cầu đọc đã hủy.'));},{once:true});})]);

  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);requests.delete(controller);}
 }
 return {
  mode:'MOCK_PREPARATION',release:P12_RELEASE,
  list(type,input={},options={}){const ctx=getContext();allowed(ctx,type);const p16=options.listStateContract===P16_RELEASE.contract;if(p16)requireValue(!Object.hasOwn(options,'body'),'GET_BODY_PROHIBITED');requireValue(options.listStateContract===undefined||p16,'UNKNOWN_STATE_CONTRACT');const q=p16?p16ListQuery(type,{warehouse_id:ctx.warehouseId,...input}):type==='warranty'?warrantyQuery('list',input):stockListQuery(type,input);if(q.warehouse_id!==undefined)requireValue(q.warehouse_id===ctx.warehouseId,'SCOPE_MISMATCH');return request(sourcePath(type),q,b=>{const page=type==='warranty'?parseWarranty(b,'list',null,ctx,{origin:origin.href}):parseStockList(b,type,q,{origin:origin.href});if(type!=='warranty')requireValue(page.items.every(d=>d.warehouseId===ctx.warehouseId),'SCOPE_MISMATCH');return p16?withP16Evidence(page,b,type,q,ctx):page;},options);},
  detail(type,id,options={}){const ctx=getContext();allowed(ctx,type);return request(sourcePath(type,id),type==='warranty'?{warehouse_id:ctx.warehouseId}:{},b=>type==='warranty'?parseWarranty(b,'detail',id,ctx,{origin:origin.href}):parseStockDetail(b,type,id,ctx.warehouseId,{origin:origin.href}),options);},
  scans(type,id,input={},options={}){requireValue(type!=='warranty','P09_SCAN_BRIDGE_PENDING');allowed(getContext(),type);const q=evidenceQuery(input);return request(sourcePath(type,id)+'/scan-entries',q,b=>parseScans(b,type,id,q),options);},
  files(type,id,input={},options={}){const ctx=getContext();allowed(ctx,type,type==='warranty'?['documents.read']:[]);const q=type==='warranty'?warrantyQuery('attachments',{warehouse_id:ctx.warehouseId,...input}):attachmentQuery(input);if(q.warehouse_id!==undefined)requireValue(q.warehouse_id===ctx.warehouseId,'SCOPE_MISMATCH');return request(sourcePath(type,id)+'/attachments',q,b=>type==='warranty'?parseWarranty(b,'attachments',id,ctx):parseAttachments(b,type,id,q),options);},
  events(id,input={},options={}){const ctx=getContext();allowed(ctx,'warranty');const q=warrantyQuery('events',{warehouse_id:ctx.warehouseId,...input});requireValue(q.warehouse_id===ctx.warehouseId,'SCOPE_MISMATCH');return request(sourcePath('warranty',id)+'/events',q,b=>parseWarranty(b,'events',id,ctx),options);},
  receipt(journal,options={}){const ctx=getContext();allowed(ctx,'warranty');requireValue(journal?.owner==='P09'&&uuid(journal.requestId)&&journal.actorId===ctx.actorId&&journal.authSessionId===ctx.authSessionId&&journal.warehouseId===ctx.warehouseId,'RECEIPT_OWNER_CONTEXT_REQUIRED');return request('/api/v1/mini-app/warranty-requests/'+journal.requestId,{warehouse_id:ctx.warehouseId},b=>({...parseWarrantyReceipt(b,journal.requestId,ctx,{origin:origin.href}),scopeFingerprint:scopeKey(ctx)}),options);},
  receiptDetail(receipt,options={}){const ctx=getContext();allowed(ctx,'warranty');requireValue(receipt?.scopeFingerprint===scopeKey(ctx)&&receipt.receipt?.state==='SUCCEEDED'&&uuid(receipt.caseId)&&receipt.caseId===receipt.receipt.warranty_case_id&&receipt.caseId===receipt.source?.warranty_case_id&&receipt.p12?.detail_required===true&&receipt.p12.receipt_is_detail===false&&receipt.p12.recovery_owner==='P09','RECEIPT_TARGET_NOT_READY');const target=validateReadTarget(receipt.readTarget,'warranty',receipt.caseId,ctx.warehouseId,{origin:origin.href,context:ctx});return request(target.path,target.query,b=>parseWarranty(b,'detail',receipt.caseId,ctx,{origin:origin.href}),options);},
  suppliers(input={},options={}){const ctx=getContext();scopeKey(ctx);requireValue(ctx.rights.some(p=>['inbound.view','inbound.create','inbound.scan'].includes(p)),'READ_FORBIDDEN');const q=supplierQuery(input);return request('/api/v1/mini-app/inbound/suppliers',q,b=>parseSuppliers(b,q),options);},
  download(parent,file,options={}){
   const {userAction=false,signal}=getOptions(options);
   requireValue(userAction===true&&uuid(parent?.id),'USER_ACTION_REQUIRED');const ctx=getContext();allowed(ctx,parent.type,parent.type==='warranty'?['documents.read','warranty.pii.view']:[]);requireValue(parent.warehouseId===ctx.warehouseId&&parent.deleted_at==null&&parent.source?.deleted_at==null,'SCOPE_MISMATCH');if(parent.type!=='warranty'&&parent.source)requireValue(parent.source.doc_type===(parent.type==='inbound'?'receipt':'issue'),'PARENT_MISMATCH');const id=file?.attachment_id||file?.id;requireValue(uuid(id)&&file.status==='ACTIVE','FILE_UNAVAILABLE');
   let path;if(parent.type==='warranty'){requireValue(file.warranty_case_id===parent.id&&file.can_download===true&&typeof file.download_url==='string','FILE_UNAVAILABLE');const url=new URL(file.download_url,origin);requireValue(url.origin===origin.origin&&url.pathname==='/api/v1/mini-app/warranty-attachments/'+id+'/download'&&!url.search&&!url.hash,'UNAPPROVED_ORIGIN');path=url.pathname;}
   else{requireValue(file.document_id===parent.id&&file.document_type===parent.type.toUpperCase(),'ATTACHMENT_PARENT_MISMATCH');path='/api/v1/mini-app/document-attachments/'+id+'/download';}
   return request(path,{},b=>b,{signal,binary:true}).then(result=>{requireValue(result.mime===file.content_type,'BINARY_MIME_MISMATCH');requireValue(file.file_size_bytes==null||file.file_size_bytes===result.bytes.length,'BINARY_SIZE_MISMATCH');return {...result,name:file.file_name??null,fileId:id,parentId:parent.id};});
  },
  cancel(){for(const r of requests)r.abort();},dispose(){disposed=true;for(const r of requests)r.abort();requests.clear();}
 };
}

export function createPrivateObjectUrls({urlApi=URL}={}){const urls=new Map();const release=url=>{if(urls.has(url)){clearTimeout(urls.get(url));urls.delete(url);urlApi.revokeObjectURL(url);}};return {create(result){const url=urlApi.createObjectURL(new Blob([result.bytes],{type:result.mime}));urls.set(url,null);return url;},release,releaseLater(url,ms=15000){if(urls.has(url)){clearTimeout(urls.get(url));urls.set(url,setTimeout(()=>release(url),ms));}},clear(){for(const url of [...urls.keys()])release(url);},get count(){return urls.size;}};}
