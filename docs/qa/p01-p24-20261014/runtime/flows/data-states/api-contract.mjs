// Additive list-state seam. Keep the newer P12 serializers/detail/scan contract.
import {object,uuid,requireValue,P12ReadError,stockListQuery,warrantyQuery} from '../documents/api-contract.mjs';
export const P16_RELEASE=Object.freeze({commit:'073ea02503287adcbfb76ef1edd2f23d52572aa2',contract:'p16-documents-read-v1',status:'PENDING_OWNER_CONTRACT_AND_LIVE_TEST',productionActivation:false,liveVerified:false});
const count=n=>Number.isSafeInteger(n)&&n>=0;
export function p16ListQuery(type,input={}) {
 requireValue(object(input),'INVALID_QUERY');const supported=type==='warranty'?['warehouse_id','search','status','sort','cursor','page','per_page']:['warehouse_id','keyword','status','ready_for_post','ready_for_issue','date_from','date_to','timezone','sort_order','page','per_page'];requireValue(Object.keys(input).every(k=>supported.includes(k)),'UNSUPPORTED_QUERY');const clean={};
 for(const [key,value] of Object.entries(input))if(value!==null&&value!==undefined&&!(typeof value==='string'&&value.trim()===''))clean[key]=value;
 // Readiness zero/false is a filter, never absence. Normalization preserves that.
 for(const key of ['ready_for_post','ready_for_issue'])if(Object.hasOwn(clean,key)){
  requireValue([true,false,0,1,'0','1'].includes(clean[key]),'INVALID_QUERY');clean[key]=clean[key]===true||clean[key]===1||clean[key]==='1';
 }
 const query=type==='warranty'?warrantyQuery('list',clean):stockListQuery(type,clean);
 if(type==='warranty')requireValue(query.cursor!=='start','INVALID_QUERY','Không dùng cursor=start của nguồn khác.');
 requireValue(uuid(query.warehouse_id),'CONTEXT_REQUIRED','Cần kho đã được xác nhận từ owner phiên.');
 if(type!=='warranty')requireValue(query.timezone==='Asia/Ho_Chi_Minh','UNSUPPORTED_QUERY','P16 dùng múi giờ Việt Nam theo contract.');
 return query;
}
// Mirrors SourceCountEvidence at the pinned SHA; used only to verify evidence,
// never to generate or repair a server total/source_empty value.
export function isUnfilteredOwnerQuery(type,query,{body}={}) {
 if(body!==undefined)return false;
 const transport=type==='warranty'?['warehouse_id','page','per_page','cursor','sort']:['warehouse_id','page','per_page','page_size','sort_order','timezone'];
 return Object.entries(query).every(([key,value])=>transport.includes(key)||type==='warranty'&&key==='status'&&value==='ALL'||value===null||value===undefined||typeof value==='string'&&value.trim()==='');
}
export function parseP16CountEvidence(meta,type,query,request={}) {
 const e=meta?.count_evidence,total=meta?.total,unfiltered=isUnfilteredOwnerQuery(type,query,request);
 requireValue(count(total)&&object(e)&&e.contract==='authorized-source-count-v1'&&e.scope==='CURRENT_AUTHORIZED_ENDPOINT_QUERY'&&e.filtered_total===total&&typeof e.unfiltered_request==='boolean'&&e.unfiltered_request===unfiltered&&e.unfiltered_authorized_total===(unfiltered?total:null)&&e.source_empty===(unfiltered?total===0:null)&&e.all_sources_aggregate===false&&e.cross_request_snapshot===false,'COUNT_EVIDENCE_MISMATCH','Chưa xác minh được tổng và bằng chứng rỗng của nguồn hiện tại.');
 return structuredClone(e);
}
export function withP16Evidence(page,body,type,query,context) {
 requireValue(body?.success===true&&Array.isArray(body.data)&&page?.paging?.total===body.meta?.total,'INVALID_LIST_ENVELOPE');
 const evidence=parseP16CountEvidence(body.meta,type,query),total=body.meta.total;
 requireValue(body.data.length<=total&&(total!==0||body.data.length===0),'COUNT_ROWS_MISMATCH');
 if(type==='warranty'){
  const m=body.meta;requireValue(m.scope_policy==='PERSISTED_WARRANTY_OWNER_BEFORE_TOTAL','WARRANTY_SCOPE_MISMATCH');requireValue(m.per_page===query.per_page&&(Object.hasOwn(query,'page')?m.pagination==='OFFSET'&&m.page===query.page:m.pagination==='KEYSET'&&m.page===null),'WARRANTY_PAGING_MISMATCH');
  for(const row of body.data){
   requireValue(uuid(row.warranty_case_id)&&row.warehouse_id===context.warehouseId,'SCOPE_MISMATCH');requireValue(['RECEIVED','CHECKING','REPAIRING','COMPLETED','RETURNED','CANCELLED'].includes(row.status)&&count(row.version),'INVALID_DOCUMENT');
   for(const [flag,keys] of [['customer_name_redacted',['customer_name']],['customer_phone_redacted',['customer_phone']],['free_text_redacted',['note','description','customer_address','missing_code_reason','manual_product_description','repair_summary']]])
    if(row[flag]===true)requireValue(keys.every(k=>row[k]===null||row[k]===undefined),'PRIVACY_MISMATCH');
  }
 }
 if(type!=='warranty'){const m=body.meta,n=body.data.length;requireValue(n===0?m.from===null&&m.to===null:m.from===(query.page-1)*query.per_page+1&&m.to===m.from+n-1&&m.to<=total,'PAGING_METADATA_MISMATCH');}
 else requireValue(body.meta.consistency==='LIVE_READ_NOT_FROZEN_CROSS_REQUEST'&&(!body.meta.hasMore||total>body.data.length),'WARRANTY_PAGING_MISMATCH');
 const emptyPage=body.data.length===0&&total>0;
 return {...page,source:type,query:structuredClone(query),countEvidence:evidence,envelope:structuredClone(body),
  stateEvidence:{kind:emptyPage?'page-empty':total===0?(evidence.unfiltered_request?'empty':'no-results'):'ready',retryPolicy:emptyPage?'SAME_REQUEST_EXPLICIT':null},
  // Source timestamp retained, not refreshed with the client's wall clock.
  trace:{requestId:typeof body.meta.request_id==='string'?body.meta.request_id:null,timestamp:typeof body.meta.timestamp==='string'?body.meta.timestamp:null},crossRequestSnapshot:false};
}
export async function p16HttpError(response) {
 const type=response.headers?.get('content-type')?.split(';')[0].trim().toLowerCase();let body=null;
 if(type==='application/json')try{body=await response.json();}catch{}
 const trusted=object(body)&&body.success===false&&object(body.error)&&typeof body.error.code==='string'&&/^[A-Z0-9_]{1,100}$/.test(body.error.code);
 const error=new P12ReadError(trusted?body.error.code:'HTTP_'+response.status,trusted?'Nguồn đọc từ chối yêu cầu.':'Không đọc được nguồn dữ liệu đã xác minh.',response.status);
 error.provenance=trusted?'trusted-owner-json':'unverified-transport';
 error.panel=trusted?(response.status===401?'expired':response.status===403?'forbidden':null):null;
 error.trace={requestId:trusted&&typeof body.meta?.request_id==='string'?body.meta.request_id:response.headers?.get('x-request-id')??null,timestamp:trusted&&typeof body.meta?.timestamp==='string'?body.meta.timestamp:null};
 return error;
}
