import {P16_RELEASE,p16ListQuery} from '../data-states/api-contract.mjs';
import {P12_RELEASE,stockListQuery,warrantyQuery,evidenceQuery,attachmentQuery,supplierQuery,stockHistory,requireValue,P12ReadError} from './api-contract.mjs';
import {scopeKey} from './api-client.mjs';
const pending=()=>({status:'pending',data:null,error:null});
// One controller for prepared reads; no store writer, role policy or scroll owner.
export function createP12ReadOwner({client,getContext,onChange=()=>{},onInvalidate=()=>{},listStateContract=null,onReadFailure=()=>{}}){
 requireValue(client?.mode==='MOCK_PREPARATION','ACTIVATION_OFF');requireValue(listStateContract===null||listStateContract===P16_RELEASE.contract,'UNKNOWN_STATE_CONTRACT');let disposed=false,contextKey=null,generation=0;const slots=new Map(),viewMemory=new Map();
 function ensureScope(){let key;try{key=scopeKey(getContext());}catch(error){invalidate();throw error;}if(contextKey!==key){const existing=contextKey!==null;generation++;for(const slot of slots.values())slot.controller?.abort();slots.clear();viewMemory.clear();contextKey=key;if(existing)onInvalidate();}return key;}

 function snapshot(key){ensureScope();const s=slots.get(key);return s?{status:s.status,data:s.data?structuredClone(s.data):null,error:s.error,key:s.key,identityKey:s.identityKey,identity:s.identity?structuredClone(s.identity):null,append:s.append===true}:pending();}
 function identityKey(identity){const query={...identity.query};if(identity.type==='warranty'){delete query.page;delete query.cursor;}else query.page=1;return JSON.stringify({...identity,query});}
 async function load(slotName,identity,reader,{append=false}={}){
  requireValue(!disposed,'DISPOSED');const scope=ensureScope(),key=JSON.stringify(listStateContract&&slotName==='list'?{scope,...identity}:identity),previous=slots.get(slotName);
  if(listStateContract&&slotName==='list'&&previous?.status==='loading'&&previous.key===key)return previous.promise;
  previous?.controller?.abort();
  const base=append?previous?.data:listStateContract&&slotName==='list'&&previous?.key===key?previous.data:null;if(append)requireValue(base&&['ready','error'].includes(previous?.status)&&previous.identityKey===identityKey(identity),'PAGE_QUERY_CHANGED');
  const controller=new AbortController(),epoch=++generation,slot={status:'loading',data:base,error:null,key,epoch,controller,identityKey:identityKey(identity),identity:structuredClone(identity),append};slots.set(slotName,slot);onChange(slotName);
  const work=(async()=>{try{const result=await reader(controller.signal);if(disposed||scope!==ensureScope()||slots.get(slotName)!==slot||controller.signal.aborted)return false;
   if(append&&result.stateEvidence?.kind==='page-empty')throw new P12ReadError('PAGE_READ_REQUIRED','Trang mới rỗng dù tổng nguồn còn dữ liệu. Giữ hàng cũ; chỉ đọc lại theo yêu cầu.');
   if(append){const p=base.paging,next=result.paging;requireValue(next?.perPage===p?.perPage&&(identity.type==='warranty'?p.hasMore&&next.mode===p.mode&&(p.mode==='KEYSET'?identity.query.cursor===p.nextCursor&&next.page===null:identity.query.page===p.nextPage&&next.page===p.nextPage):next.page===p.page+1),'PAGE_QUERY_CHANGED');requireValue(!base.summary||JSON.stringify(base.summary)===JSON.stringify(result.summary),'SUMMARY_CHANGED_RELOAD','Nguồn scan đã thay đổi; đọc lại từ trang đầu.');const keyOf=d=>d.type?d.type+':'+d.id:slotName==='history'?d.event_id:slotName==='files'?d.attachment_id||d.id:d.id||d.warranty_case_id;const map=new Map(base.items.map(d=>[keyOf(d),d]));for(const d of result.items)map.set(keyOf(d),d);result.items=[...map.values()];}
   slot.status='ready';slot.data=result;slot.controller=null;onChange(slotName);return true;
  }catch(error){let sameScope=false;try{sameScope=scope===ensureScope();}catch{}if(disposed||!sameScope||slots.get(slotName)!==slot||controller.signal.aborted)return false;if(error.status===401){invalidate();onReadFailure(error);onChange('scope');return false;}const denial=listStateContract&&slotName==='list'?error.code==='READ_FORBIDDEN'||error.status===403&&error.provenance==='trusted-owner-json':error.status===403;
   const goneChild=error.status===404&&['scans','files','history','detail'].includes(slotName);
   const invalidScan=slotName==='scans'&&['SCAN_CONTRACT_MISMATCH','SCAN_PARENT_MISMATCH','INVALID_SCAN_SUMMARY','INVALID_RESPONSE','DUPLICATE_PAGE_ID','PRIVATE_CACHE_REQUIRED','INVALID_JSON_CONTENT_TYPE'].includes(error.code);
   slot.status=denial?'denied':'error';slot.data=denial||goneChild||invalidScan||error.code==='SUMMARY_CHANGED_RELOAD'?null:base;slot.error=error;slot.controller=null;onReadFailure(error);onChange(slotName);return false;}})();slot.promise=work;return work;
 }
 function invalidate(){for(const s of slots.values())s.controller?.abort();slots.clear();viewMemory.clear();contextKey=null;generation++;onInvalidate();}
 return {
  release:P12_RELEASE,mode:'MOCK_PREPARATION',snapshot,
  list(type,input={},append=false){if(type==='all'){ensureScope();slots.get('list')?.controller?.abort();slots.set('list',{status:'pending',data:null,error:new P12ReadError('ALL_POLICY_PENDING','Tab Tất cả đang chờ chốt cách tổng hợp/phân trang.'),key:'all'});onChange('list');return Promise.resolve(false);}const q=listStateContract?p16ListQuery(type,{warehouse_id:getContext().warehouseId,...input}):type==='warranty'?warrantyQuery('list',input):stockListQuery(type,input);return load('list',{type,query:q},signal=>client.list(type,q,{signal,...(listStateContract?{listStateContract}:{})}),{append});},
  cancelList(){const s=slots.get('list');s?.controller?.abort();if(s?.status==='loading'){s.status=s.data?'ready':'pending';s.controller=null;}},
  retryList(){const s=snapshot('list');requireValue(s.identity&&s.identity.type!=='all','ALL_POLICY_PENDING');return this.list(s.identity.type,s.identity.query,s.append);},
  detail(type,id){ensureScope();for(const name of ['detail','history','scans','files','receipt']){slots.get(name)?.controller?.abort();slots.delete(name);}return load('detail',{type,id},signal=>client.detail(type,id,{signal}));},
  receipt(journal){return load('receipt',{type:'warranty',requestId:journal?.requestId},signal=>client.receipt(journal,{signal}));},
  openReceipt(){const s=snapshot('receipt');requireValue(s.status==='ready'&&s.data.readTarget,'RECEIPT_TARGET_NOT_READY');for(const name of ['detail','history','scans','files']){slots.get(name)?.controller?.abort();slots.delete(name);}return load('detail',{type:'warranty',id:s.data.caseId},signal=>client.receiptDetail(s.data,{signal}));},
  history(type,id,input={},append=false){const d=snapshot('detail');requireValue(d.status==='ready'&&d.data.id===id&&d.data.type===type,'PARENT_NOT_READY');const q=type==='warranty'?warrantyQuery('events',{warehouse_id:getContext().warehouseId,...input}):null;return type==='warranty'?load('history',{type,id,query:q},signal=>client.events(id,q,{signal}),{append}):load('history',{type,id},()=>stockHistory(d.data));},
  scans(type,id,input={},append=false){const d=snapshot('detail');requireValue(d.status==='ready'&&d.data.id===id&&d.data.type===type,'PARENT_NOT_READY');const q=evidenceQuery(input);return load('scans',{type,id,query:q},signal=>client.scans(type,id,q,{signal}),{append});},
  files(type,id,input={},append=false){const d=snapshot('detail');requireValue(d.status==='ready'&&d.data.id===id&&d.data.type===type,'PARENT_NOT_READY');const q=type==='warranty'?warrantyQuery('attachments',input):attachmentQuery(input);return load('files',{type,id,query:q},signal=>client.files(type,id,q,{signal}),{append});},
  suppliers(input={},append=false){const q=supplierQuery(input);return load('suppliers',{query:q},signal=>client.suppliers(q,{signal}),{append});},
  rememberView(key,value){ensureScope();viewMemory.set(key,structuredClone(value));},view(key){ensureScope();return structuredClone(viewMemory.get(key)??null);},
  invalidate,cancel(){for(const s of slots.values()){s.controller?.abort();if(s.status==='loading'){s.status='pending';s.data=null;}s.controller=null;}generation++;},dispose(){disposed=true;invalidate();client.dispose();}
 };
}
