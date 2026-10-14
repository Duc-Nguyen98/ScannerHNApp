// mini-app-p05-v1 source-linked only. No legacy create/Post fallback.
export const P05_CONTRACT='mini-app-p05-v1',P03_CONTRACT='mini-app-p03-v1';
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export class P05ApiError extends Error {
  constructor(code,message=code,{status=0,unknown=false,traceId=null}={}){super(message);this.code=code;this.status=status;this.unknown=unknown;this.traceId=traceId;}
}
const fail=message=>{throw new P05ApiError('CONTRACT_INVALID',message,{unknown:true});};
export const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const integer=v=>Number.isSafeInteger(v)&&v>0;
// Validate response metadata only; request If-Match stays strong and explicit.
export function draftEtagMatches(etag,version){if(!integer(version))return false;if(etag===undefined||etag===null)return true;if(typeof etag!=='string')return false;const match=/^(?:W\/)?"([1-9][0-9]*)"$/.exec(etag.trim());return !!match&&match[1]===String(version);}
export function envelope(response,contract,statuses=[200]){
  const b=response.body;if(!statuses.includes(response.status)||!obj(b)||b.success!==true||!obj(b.meta)||b.meta.contract!==contract||!Object.hasOwn(b,'data'))fail('Phản hồi không khớp contract '+contract);return b;
}
export function parseContext(b,scope){
  const d=b.data;if(!obj(d)||d.actor_id!==scope.actorId||d.auth_session_id!==scope.authSessionId||!obj(d.warehouse_context)||!obj(d.permissions)||!['read','save','cancel','record'].every(k=>typeof d.permissions[k]==='boolean')||!Array.isArray(d.available_warehouses))fail('Context chưa xác minh đúng actor/phiên.');
  if(d.warehouse_context.status!=='READY'||d.active_warehouse_id!==scope.warehouseId)throw new P05ApiError('WAREHOUSE_CONTEXT_REQUIRED','Kho chưa READY hoặc không khớp phiên.');
  const w=d.available_warehouses.find(w=>w.warehouse_id===scope.warehouseId);if(!w||w.status!=='ACTIVE')throw new P05ApiError('WAREHOUSE_INACTIVE','Kho chưa xác nhận ACTIVE.');
  if(!d.permissions.read)throw new P05ApiError('P05_OPERATION_DENIED','Không có quyền đọc nguồn xuất kho.');
  if(d.record?.reconcile_mode!=='P03_LINKED'||d.address_contract?.format!=='TEXT'||d.address_contract.structured_codes_supported!==false)fail('Context P05 không hỗ trợ source-linked/TEXT.');return structuredClone(d);
}
export function parseSource(d,scope,now=Date.now()){
  if(!obj(d)||d.source_kind!=='WMS_OUTBOUND_DOCUMENT'||!UUID.test(d.source_document_id||'')||d.document_id!==d.source_document_id||!integer(d.source_version)||d.warehouse_id!==scope.warehouseId||!UUID.test(d.outbound_request_id||'')||d.status!=='DRAFT'||!integer(d.planned_total_qty)||d.planned_total_qty>1000||!Array.isArray(d.lines)||!d.lines.length||!obj(d.recipient)||typeof d.doc_no!=='string'||!d.doc_no||d.address_format!=='TEXT'||d.address_dataset_version!==null)fail('Phiếu nguồn không khớp contract.');
  const expiry=Date.parse(d.expires_at),created=Date.parse(d.created_at);if(!Number.isFinite(expiry)||!Number.isFinite(created)||expiry<=now)throw new P05ApiError('OUTBOUND_SOURCE_NOT_SELECTABLE','Phiếu nguồn đã hết hạn hoặc chưa xác minh thời hạn.');
  if(d.lines.some(l=>!obj(l)||!UUID.test(l.line_id||'')||!UUID.test(l.sku_id||'')||!integer(l.planned_qty)||l.scanned_qty!==0||typeof l.sku_code!=='string'||!l.sku_code||typeof l.sku_name!=='string')||new Set(d.lines.map(l=>l.line_id)).size!==d.lines.length||d.lines.reduce((n,l)=>n+l.planned_qty,0)!==d.planned_total_qty)fail('Kế hoạch nguồn không hợp lệ.');
  for(const key of ['name','address','phone'])if(d.recipient[key]!==null&&typeof d.recipient[key]!=='string')fail('Metadata người nhận không hợp lệ.');return structuredClone(d);
}
export function parseDraft(d,scope,id,scan){
  if(!obj(d)||d.document_kind!=='STAGING_DRAFT'||d.document_id!==id||d.scan_session_id!==scan||d.auth_session_id!==scope.authSessionId||d.warehouse_id!==scope.warehouseId||d.operation!=='OUTBOUND'||!integer(d.version)||!['DRAFT','CANCELLED','RECORDED'].includes(d.status)||d.stock_effect!=='NONE'||d.codes_validated!==false||!Array.isArray(d.codes)||d.codes.some(c=>!obj(c)||typeof c.raw_code!=='string'||!c.raw_code.trim()||!['MANUAL','CAMERA','SCANNER','HARDWARE'].includes(c.scan_source)||c.quantity!==undefined&&c.quantity!==1)||!obj(d.form))fail('Nháp P03 sai identity/scope.');return structuredClone(d);
}
export function parseReceipt(r,request){
  if(!obj(r)||r.request_id!==request.key||r.document_id!==request.draftId||r.scan_session_id!==request.scanSessionId||r.warehouse_id!==request.body.warehouse_id||r.operation!=='OUTBOUND'||r.command!==request.command||r.outcome!=='SUCCEEDED'||!integer(r.version)||!Number.isFinite(Date.parse(r.committed_at)))fail('Receipt không khớp thao tác đã gửi.');return structuredClone(r);
}
export function verifyRecord(b,request,scope){
  const d=b.data,linked=b.meta?.p03_draft;
  if(!obj(d)||d.document_id!==request.body.source_document_id||d.source_document_id!==d.document_id||d.source_version!==request.body.source_version||d.src_warehouse_id!==scope.warehouseId||d.status!=='SCANNING'||d.record_status!=='RECORDED'||d.posted!==false||d.source_created!==false||d.wms_document_created!==false||d.movement_created!==false||d.stock_effect!=='NONE'||d.expected_total_qty!==request.body.expected_total_qty||d.scanned_total_qty!==request.body.items.length||!integer(d.version)||!obj(linked))fail('Chưa xác minh được record đúng source, chưa ghi sổ.');
  const receipt=parseReceipt(linked.receipt,request),draft=parseDraft(linked.document,scope,request.draftId,request.scanSessionId);
  if(draft.status!=='RECORDED'||draft.business_document_id!==d.document_id||draft.form.p05_source?.document_id!==d.document_id||draft.form.p05_source?.version!==request.body.source_version||JSON.stringify(draft.codes.map(c=>({raw_code:c.raw_code,scan_source:c.scan_source})))!==JSON.stringify(request.body.items)||draft.codes.some(c=>c.quantity!==undefined&&c.quantity!==1)||draft.version!==receipt.version)fail('Nháp chưa được liên kết RECORDED.');return {result:structuredClone(d),receipt,draft};
}
export function createP05ApiAdapter({baseUrl='https://khohoanamdev.lptech.info.vn',getAccessToken,getScope,fetcher=(...a)=>fetch(...a),timeoutMs=15000,now=Date.now}){
  const origin=new URL(baseUrl);if(!['https:','http:'].includes(origin.protocol)||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password)throw Error('Base API phải là origin.');
  async function request(path,{method='GET',query={},body,headers={},signal}={}){
    const scope=structuredClone(getScope()),token=getAccessToken();if(!token||!UUID.test(scope.actorId||'')||!UUID.test(scope.authSessionId||'')||!UUID.test(scope.warehouseId||''))throw new P05ApiError('AUTH_CONTEXT_REQUIRED','Cần phiên ACCESS và kho đã xác minh.');
    const url=new URL(path,origin);for(const [k,v]of Object.entries(query))if(v!==undefined)url.searchParams.set(k,String(v));if(method==='GET'&&body!==undefined||method!=='GET'&&url.search)throw Error('Sai request contract.');
    const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,timeoutMs);
    try{const response=await fetcher(url.href,{method,signal:controller.signal,credentials:'omit',cache:'no-store',headers:{Accept:'application/json',Authorization:'Bearer '+token,...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});
      if(JSON.stringify(scope)!==JSON.stringify(getScope()))throw new P05ApiError('OWNER_CHANGED','Phiên đã thay đổi; giữ journal của phiên trước.',{unknown:method!=='GET'});
      let b;try{b=await response.json();}catch{throw new P05ApiError('INVALID_RESPONSE','Không đọc được response.',{status:response.status,unknown:true});}
      if(!response.ok||b?.success===false)throw new P05ApiError(b?.error?.code||b?.error_code||b?.code||'HTTP_ERROR',b?.error?.message||b?.message||'Yêu cầu bị từ chối.',{status:response.status,unknown:response.status>=500,traceId:b?.meta?.request_id||null});
      return {status:response.status,body:b,etag:response.headers.get('ETag'),traceId:b?.meta?.request_id||null};
    }catch(e){if(e instanceof P05ApiError)throw e;throw new P05ApiError('NETWORK_UNKNOWN','Không nhận được kết quả; cần đối chiếu.',{unknown:true});}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  const p05='/api/v1/mini-app/outbound',p03='/api/v1/mini-app/drafts';
  return {fixture:false,baseUrl:origin.origin,now,
    async context(){return parseContext(envelope(await request(p05+'/context'),P05_CONTRACT),getScope());},
    async sources({q='',page=1,perPage=20,signal}={}){const b=envelope(await request(p05+'/sources',{query:{warehouse_id:getScope().warehouseId,q:q.trim()?q:undefined,page,per_page:perPage},signal}),P05_CONTRACT),m=b.meta;if(!Array.isArray(b.data)||m.warehouse_id!==getScope().warehouseId||m.source_kind!=='WMS_OUTBOUND_DOCUMENT'||m.page!==page||m.per_page!==perPage||!Number.isSafeInteger(m.total)||m.total<0||!integer(m.last_page)||m.last_page!==Math.max(1,Math.ceil(m.total/perPage))||b.data.length>perPage)fail('Phân trang nguồn không hợp lệ.');return {items:b.data.map(d=>parseSource(d,getScope(),now())),meta:structuredClone(m)};},
    async source(id){const d=parseSource(envelope(await request(p05+'/sources/'+id,{query:{warehouse_id:getScope().warehouseId}}),P05_CONTRACT).data,getScope(),now());if(d.source_document_id!==id)fail('Detail sai source ID.');return d;},
    async resolve(raw){const r=await request(p05+'/resolve-code',{method:'POST',body:{raw_code:raw,warehouse_id:getScope().warehouseId}});const d=r.body?.data;if(r.body?.success!==true||!obj(d))fail('Resolve không hợp lệ.');return structuredClone(d);},
    async execute(frozen){
      const {command,draftId,scanSessionId,key,body,headers}=frozen;
      if(!UUID.test(draftId||'')||!UUID.test(scanSessionId||'')||!UUID.test(key||'')||headers?.['Idempotency-Key']!==key||body?.warehouse_id!==getScope().warehouseId)fail('Frozen request identity không hợp lệ.');
      const expected=command==='RECORD'?p05+'/record':p03+'/'+draftId+(command==='CANCEL'?'/cancel':'');
      const allowed=command==='RECORD'?['warehouse_id','source_document_id','source_version','expected_total_qty','items']:command==='SAVE'?['warehouse_id','operation','scan_session_id','title','codes','form']:command==='CANCEL'?['warehouse_id','operation','scan_session_id','confirmed_request_id','reason']:[];
      if(!allowed.length||frozen.path!==expected||frozen.method!==(command==='SAVE'?'PUT':'POST')||Object.keys(body).some(k=>!allowed.includes(k)))fail('Frozen request sai route hoặc trường body.');
      const allowedHeaders=command==='RECORD'?['Idempotency-Key','X-Draft-ID','X-Draft-Scan-Session-ID','X-Draft-Version']:['Idempotency-Key','If-Match'];if(Object.keys(headers).some(k=>!allowedHeaders.includes(k)))fail('Header ngoài contract.');
      if(command==='RECORD'){if(body.source_document_id!==frozen.sourceId||body.source_version!==frozen.sourceVersion)fail('Body RECORD sai source/version frozen.');if(headers['X-Draft-ID']!==draftId||headers['X-Draft-Scan-Session-ID']!==scanSessionId||!/^\d+$/.test(headers['X-Draft-Version']||'')||Number(headers['X-Draft-Version'])<1||headers['If-Match']||!UUID.test(body.source_document_id||'')||!integer(body.source_version)||!integer(body.expected_total_qty)||!Array.isArray(body.items)||body.items.some(c=>Object.keys(c).some(k=>!['raw_code','scan_source'].includes(k))))fail('RECORD headers không hợp lệ.');}
      else{if(!/^"\d+"$/.test(headers['If-Match']||'')||body.operation!=='OUTBOUND'||body.scan_session_id!==scanSessionId)fail('SAVE/CANCEL version hoặc scan-group không hợp lệ.');if(command==='SAVE'&&(!Array.isArray(body.codes)||!obj(body.form)||body.form.p05_source?.document_id!==frozen.sourceId||body.form.p05_source?.version!==frozen.sourceVersion))fail('SAVE thiếu full snapshot/source link.');if(command==='CANCEL'&&(!UUID.test(body.confirmed_request_id||'')||Number(headers['If-Match'].slice(1,-1))<1))fail('CANCEL chưa có confirmed SAVE/version.');}
      const codes=command==='RECORD'?body.items:command==='SAVE'?body.codes:[];if(codes.some(c=>!obj(c)||typeof c.raw_code!=='string'||!c.raw_code.trim()||!['MANUAL','CAMERA','SCANNER','HARDWARE'].includes(c.scan_source)||c.quantity!==undefined&&c.quantity!==1))fail('Batch không khớp PRODUCT quantity1.');
      return request(frozen.path,{method:frozen.method,body,headers});
    },
    async reconcile(frozen){return envelope(await request(p03+'/'+frozen.draftId+'/requests/'+frozen.key,{query:{warehouse_id:getScope().warehouseId,operation:'OUTBOUND',scan_session_id:frozen.scanSessionId,command:frozen.command}}),P03_CONTRACT);},
    async draft(id,scan){const r=await request(p03+'/'+id,{query:{warehouse_id:getScope().warehouseId,operation:'OUTBOUND',scan_session_id:scan}}),d=parseDraft(envelope(r,P03_CONTRACT).data,getScope(),id,scan);if(!draftEtagMatches(r.etag,d.version))fail('ETag không khớp nháp.');return d;},
    async current(id){const b=envelope(await request(p05+'/documents/'+id,{query:{warehouse_id:getScope().warehouseId}}),P05_CONTRACT),d=b.data;if(!obj(d)||!obj(d.document)||d.document.id!==id||d.document.src_warehouse_id!==getScope().warehouseId||d.document.status!==d.status||!integer(d.document.version)||!['DRAFT','SCANNING','POSTED','CANCELLED','REVERSED'].includes(d.status)||d.posted!==(d.status==='POSTED')||!Array.isArray(d.history)||d.history.some(e=>!obj(e)||!UUID.test(e.id||'')||e.stock_document_id!==id||!Number.isFinite(Date.parse(e.created_at)))||new Set(d.history.map(e=>e.id)).size!==d.history.length||!Number.isFinite(Date.parse(d.observed_at)))fail('Trạng thái chứng từ chưa xác minh.');return structuredClone(d);},
  };
}
