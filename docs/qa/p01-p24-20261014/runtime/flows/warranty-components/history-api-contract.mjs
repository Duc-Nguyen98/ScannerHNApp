// Read candidate for BE a467ab55. Activation and live transport stay OFF.
export const P20_HISTORY_CONTRACT='p20-component-history-v1';
export const P20_HISTORY_GATE=Object.freeze({status:'PENDING_CONTRACT_AND_LIVE_TEST',activation:false,live:'NOT_RUN',sourceSha:'a467ab55a164102bcd139bb79380abf5e4aa9cdb'});
export const HISTORY_UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const historyObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
export const historyClone=v=>structuredClone(v);
export const historyPositive=v=>Number.isSafeInteger(v)&&v>0;
const nonnegative=v=>Number.isSafeInteger(v)&&v>=0;
const text=v=>typeof v==='string';
const nullableText=v=>v==null||text(v);
const rawStatuses=['RECORDED','NOT_RECORDED','UNAVAILABLE','IDENTITY_MISMATCH'];
const qtyStatuses=['CONFIRMED','INCOMPLETE','MISMATCH'];
export class HistoryReadError extends Error{
 constructor(code,message=code,{status=0,trusted=false,restart=false}={}){super(message);this.name='HistoryReadError';this.code=code;this.status=status;this.trusted=trusted;this.restart=restart;}
}
export const historyError=e=>({code:e?.code||'P20_READ_FAILED',message:e?.message||'Chưa tải được lịch sử.',status:e?.status||0,trusted:e?.trusted===true,restartRequired:e?.restart===true});
const ensure=(condition,message)=>{if(!condition)throw new HistoryReadError('P20_RESPONSE_INVALID',message);};
export function historyScope(s,{caseOnly=false}={}){
 if(!historyObject(s)||!HISTORY_UUID.test(s.actorId||'')||!HISTORY_UUID.test(s.authSessionId||'')||!HISTORY_UUID.test(s.warehouseId||'')||s.authenticated!==true||s.contextConfirmed!==true||s.warehouseStatus!=='ACTIVE'||!Array.isArray(s.permissions))throw new HistoryReadError('P20_CONTEXT_UNVERIFIED','Phiên và kho chưa được xác nhận.');
 if(!s.permissions.some(p=>['warranty.view','warranty.manage'].includes(p))||!caseOnly&&(!s.permissions.includes('documents.read')||!s.permissions.includes('warranty.component_issue')))throw new HistoryReadError('P20_READ_FORBIDDEN','Chưa đủ quyền đọc lịch sử linh kiện.',{status:403});
 if(s.tenantResolved===false)throw new HistoryReadError('WARRANTY_TENANCY_UNRESOLVED','Chưa xác minh phạm vi tổ chức.',{status:503});
 return historyClone({actorId:s.actorId,authSessionId:s.authSessionId,warehouseId:s.warehouseId,authenticated:true,contextConfirmed:true,warehouseStatus:s.warehouseStatus,permissions:[...s.permissions].sort(),dimensions:s.dimensions??{},tenantResolved:s.tenantResolved??null,callerId:s.callerId??null});
}
export const historyScopeKey=s=>JSON.stringify(historyScope(s));
export function readEnvelope(response,scope,{p20=false}={}){
 const b=response?.body;
 ensure(response?.status===200&&historyObject(b)&&b.success===true&&historyObject(b.meta)&&Object.hasOwn(b,'data'),'Envelope đọc không hợp lệ.');
 ensure(b.meta.contract==='mini-app-p09-v1'&&b.meta.warehouse_id===scope.warehouseId&&b.meta.scope_policy==='PERSISTED_WARRANTY_OWNER_BEFORE_TOTAL','Scope hồ sơ/kho không khớp.');
 if(p20)ensure(b.meta.component_history_contract===P20_HISTORY_CONTRACT&&b.meta.read_only===true&&b.meta.operation_receipt===false,'Thiếu projection đọc P20; không dùng legacy hoặc receipt ghi.');
 return b;
}
export function parseHistoryCase(response,scope,id){
 const b=readEnvelope(response,scope),d=b.data;
 ensure(historyObject(d)&&d.warranty_case_id===id&&HISTORY_UUID.test(id)&&historyPositive(d.version)&&typeof d.status==='string'&&historyObject(d.capabilities),'Case identity/context không hợp lệ.');
 ensure(d.capabilities.posted_component_issues_read===true,'Case không cho phép đọc lịch sử linh kiện.');
 // Keep P09's permitted/masked customer values. No current actor/customer fill.
 return historyClone(d);
}
export function validateHistoryDetailTarget(link,scope,approvedOrigin){
 const expected='/api/v1/mini-app/warranty-component-issues/'+link.component_issue_document_id;
 ensure(text(link.detail_url)&&link.detail_url.length>0&&!link.detail_url.includes('\\'),'Thiếu đích detail hợp lệ.');
 let url;try{url=new URL(link.detail_url,approvedOrigin);}catch{throw new HistoryReadError('P20_DETAIL_TARGET_INVALID','Đích detail không hợp lệ.');}
 ensure(url.origin===approvedOrigin&&url.protocol==='https:'&&!url.username&&!url.password&&!url.hash&&url.pathname===expected,'Đích detail phải cùng approved API origin và đúng ID.');
 const params=[...url.searchParams];ensure(params.length===0||params.length===1&&params[0][0]==='warehouse_id'&&params[0][1]===scope.warehouseId,'Detail query không khớp kho.');
 return expected;
}
export function parseHistoryPage(response,scope,caseId,{perPage,pagination,approvedOrigin}){
 const b=readEnvelope(response,scope,{p20:true}),m=b.meta;
 ensure(Array.isArray(b.data)&&nonnegative(m.total)&&m.per_page===perPage&&m.pagination===pagination&&typeof m.hasMore==='boolean'&&m.consistency==='LIVE_READ_NOT_FROZEN_CROSS_REQUEST'&&historyObject(m.snapshot),'Thiếu metadata lịch sử/phân trang.');
 ensure(JSON.stringify(m.sort)===JSON.stringify(['posted_at DESC NULLS LAST','id DESC'])&&m.count_unit==='POSTED_DOCUMENT'&&m.list_has_lines===false,'Sort/count/projection P20 không khớp.');
 if(pagination==='KEYSET')ensure(m.page===null&&m.nextPage===null&&(m.hasMore?text(m.nextCursor)&&m.nextCursor.length>0&&m.nextCursor.length<=4096:m.nextCursor===null),'Cursor metadata không hợp lệ.');
 else ensure(historyPositive(m.page)&&m.nextCursor===null&&(m.hasMore?m.nextPage===m.page+1:m.nextPage===null),'Offset metadata không hợp lệ.');
 ensure(!(m.total===0&&(b.data.length||m.hasMore)),'Tổng0 mâu thuẫn với danh sách.');
 if(!b.data.length&&m.total>0)throw new HistoryReadError('P20_PAGING_INCONSISTENT','Trang rỗng nhưng nguồn vẫn có phiếu. Đọc lại từ đầu.',{restart:true});
 const links=b.data.map(l=>{
  ensure(historyObject(l)&&HISTORY_UUID.test(l.component_issue_document_id||'')&&l.warranty_case_id===caseId&&l.warehouse_id===scope.warehouseId&&l.status==='POSTED'&&historyPositive(l.version)&&nullableText(l.document_no)&&nullableText(l.posted_at)&&['SOURCE_TIMESTAMP','NOT_RECORDED'].includes(l.posted_time_status)&&typeof l.can_open==='boolean'&&!Object.hasOwn(l,'lines'),'Link phiếu không đúng case/kho/POSTED.');
  validateHistoryDetailTarget(l,scope,approvedOrigin);
  ensure(l.posted_time_status==='NOT_RECORDED'?l.posted_at===null:historyInstant(l.posted_at)!==null,'Thời điểm Post không hợp lệ.');
  return historyClone(l);
 });
 return {links,meta:historyClone(m)};
}
export function historyInstant(value){
 if(typeof value!=='string')return null;const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/.exec(value);if(!m||!Number.isFinite(Date.parse(value)))return null;
 const [y,month,day,h,min,sec]=m.slice(1,7).map(Number),calendar=new Date(0);calendar.setUTCFullYear(y,month-1,day);calendar.setUTCHours(h,min,sec,0);
 if(y<1||h>23||min>59||sec>59||Number(m[7]||0)>23||Number(m[8]||0)>59||calendar.getUTCFullYear()!==y||calendar.getUTCMonth()!==month-1||calendar.getUTCDate()!==day)return null;
 return value;
}
export function parseHistoryDetail(response,scope,link){
 const b=readEnvelope(response,scope,{p20:true}),data=b.data,d=data?.document,h=data?.history;
 ensure(historyObject(data)&&historyObject(d)&&d.id===link.component_issue_document_id&&d.warranty_case_id===link.warranty_case_id&&d.warehouse_id===scope.warehouseId&&d.status==='POSTED'&&historyPositive(d.version)&&Array.isArray(data.lines)&&historyObject(h),'Detail ID/case/kho/status không khớp link.');
 ensure(h.contract===P20_HISTORY_CONTRACT&&h.is_operation_receipt===false&&h.read_stock_effect==='NONE'&&data.stock_effect==='DECREASE'&&qtyStatuses.includes(h.quantity_status),'Detail không phải projection lịch sử GET.');
 const pii=scope.permissions.includes('warranty.pii.view'),doc=historyClone(d),lineIds=new Set(),itemIds=new Set(),movementIds=new Set();
 for(const key of ['note','cancel_reason','created_by','updated_by','posted_by','cancelled_by'])if(!pii||doc.notes_redacted===true)doc[key]=null;
 doc.notes_redacted=!pii||doc.notes_redacted===true;
 ensure(nullableText(doc.posted_at)&&['SOURCE_TIMESTAMP','NOT_RECORDED'].includes(doc.posted_time_status),'Metadata thời điểm Post không hợp lệ.');
 const lines=data.lines.map(l=>{
  ensure(historyObject(l)&&HISTORY_UUID.test(l.id||'')&&!lineIds.has(l.id)&&HISTORY_UUID.test(l.sku_id||'')&&Array.isArray(l.items)&&Array.isArray(l.movements)&&qtyStatuses.includes(l.quantity_status),'Line identity/evidence không hợp lệ.');lineIds.add(l.id);
  ensure(nullableText(l.sku_code)&&nullableText(l.sku_name)&&nullableText(l.unit)&&['CURRENT_SKU_CATALOG','NOT_RECORDED'].includes(l.unit_source),'SKU/unit metadata không hợp lệ.');
  const items=l.items.filter(i=>i?.status!=='REMOVED').map(i=>{
   ensure(historyObject(i)&&HISTORY_UUID.test(i.id||'')&&!itemIds.has(i.id)&&i.line_id===l.id&&i.sku_id===l.sku_id&&i.status==='POSTED'&&rawStatuses.includes(i.raw_code_status),'Selection item sai line/SKU/status.');itemIds.add(i.id);
   const x=historyClone(i);
   const target=i.target_type==='ITEM'?HISTORY_UUID.test(i.item_id||'')&&i.container_id===null:i.target_type==='BOX'?HISTORY_UUID.test(i.container_id||'')&&i.item_id===null:false;
   if(i.raw_code_status==='RECORDED'){
    const valid=target&&HISTORY_UUID.test(i.scan_event_id||'')&&HISTORY_UUID.test(i.scan_batch_id||'')&&i.scan_result_status==='VALID'&&typeof i.raw_code==='string'&&i.raw_code.length>0;
    if(!valid){x.raw_code=null;x.raw_code_status='IDENTITY_MISMATCH';x.raw_integrity='INVALID_RETURNED_EVIDENCE';}
   }else x.raw_code=null;
   return x;
  });
  let qty=l.quantity_status==='CONFIRMED'?l.issued_qty:null,qs=l.quantity_status;
  // Recheck the projected movement sign/line/SKU and POSTED selections. A raw
  // scan proof may be missing while the independent quantity proof is valid.
  if(qs==='CONFIRMED'){
   let moved=0,selected=0,ok=historyPositive(qty)&&l.movements.length>0&&items.length>0;
   for(const m of l.movements){ok&&=historyObject(m)&&HISTORY_UUID.test(m.movement_id||'')&&!movementIds.has(m.movement_id)&&m.line_id===l.id&&m.sku_id===l.sku_id&&Number.isSafeInteger(m.qty_delta)&&m.qty_delta<0;if(historyObject(m)){movementIds.add(m.movement_id);moved+=-m.qty_delta;}}
   for(const i of items){const target=i.target_type==='ITEM'?HISTORY_UUID.test(i.item_id||'')&&i.container_id===null:i.target_type==='BOX'?HISTORY_UUID.test(i.container_id||'')&&i.item_id===null:false;ok&&=historyPositive(i.quantity)&&target&&(i.target_type!=='ITEM'||i.quantity===1);selected+=i.quantity;}
   ok&&=Number.isSafeInteger(moved)&&Number.isSafeInteger(selected)&&qty===moved&&qty===selected&&qty===l.scanned_qty&&l.quantity_basis==='NEGATIVE_OWNER_MOVEMENTS_MATCH_POSTED_ITEMS_AND_SCANNED_QTY';
   if(!ok){qty=null;qs='MISMATCH';}
  }
  return {...historyClone(l),items,unit:l.unit??null,sku_code:l.sku_code??null,sku_name:l.sku_name??null,issued_qty:qty,quantity_status:qs,source_quantity_status:l.quantity_status,posted_item_count:nonnegative(l.posted_item_count)?l.posted_item_count:null,scan_event_count:nonnegative(l.scan_event_count)?l.scan_event_count:null,note:pii&&l.note_redacted!==true?l.note??null:null,note_redacted:!pii||l.note_redacted===true};
 });
 let total=h.quantity_status==='CONFIRMED'?h.quantity_total:null,status=h.quantity_status,units=h.quantity_status==='CONFIRMED'?h.totals_by_unit:null;
 if(status==='CONFIRMED'){
  const sum=lines.reduce((n,l)=>n+(l.issued_qty??0),0),groups=Object.create(null);let ok=lines.length>0&&lines.every(l=>l.quantity_status==='CONFIRMED')&&historyPositive(total)&&Number.isSafeInteger(sum)&&total===sum;
  for(const l of lines)if(l.unit!==null&&l.unit!==undefined)groups[l.unit]=(groups[l.unit]||0)+l.issued_qty;
  ok&&=historyObject(units)||Array.isArray(units)&&units.length===0;
  if(ok)ok=JSON.stringify(Object.entries(groups).sort())===JSON.stringify(Object.entries(units).sort());
  if(!ok){total=null;units=null;status='MISMATCH';}
 }
 return {document:doc,lines,history:{...historyClone(h),quantity_total:total,quantity_status:status,totals_by_unit:units},stock_effect:data.stock_effect,movement_created:data.movement_created??null};
}
