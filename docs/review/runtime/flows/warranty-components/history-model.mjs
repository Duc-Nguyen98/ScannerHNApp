import {previewScope,scopeGuard} from '../attachments/model.mjs';
import {caseDetails} from '../warranty/warranty-model.mjs';

// Internal read-port, NOT a production API contract. The real adapter must map
// authenticated scope, immutable IDs and explicit pagination metadata here.
export function createComponentHistory({getState,adapter,onChange=()=>{},timeoutMs=15000}){
 const scope=previewScope(getState());
 let caseId=null,items=[],loaded=false,loading=false,error='',hasMore=null,nextCursor=null,controller=null,generation=0,disposed=false;
 const consumedCursors=new Set();
 const guard=()=>disposed?'Phiên xem đã đóng.':getState()?.sessionExpired?'Phiên đăng nhập đã hết hạn.':scopeGuard(getState(),scope)|| (scope.warehouseId!=='fixture-hoa-nam'?'Kho chưa được xác minh.':'');
 const snapshot=()=>structuredClone({caseId,items,loaded,loading,error,hasMore,nextCursor});
 const emit=()=>onChange(snapshot());
 function cancel(){generation++;controller?.abort();controller=null;loading=false;}
 function select(id){if(id===caseId)return;cancel();consumedCursors.clear();caseId=id;items=[];loaded=false;error='';hasMore=null;nextCursor=null;emit();}
 async function load(){
  if(loading||disposed||loaded&&hasMore===false)return false;
  const blocked=guard();if(blocked){cancel();items=[];loaded=false;error=blocked;emit();return false;}
  if(!caseDetails(caseId)){error='Không tìm thấy hồ sơ bảo hành.';emit();return false;}
  const token=++generation,id=caseId,cursor=nextCursor;controller=new AbortController();const requestController=controller;let timer,abortListener;loading=true;error='';emit();
  try{
   const interrupted=new Promise((_,reject)=>{abortListener=()=>reject(new DOMException('Aborted','AbortError'));requestController.signal.addEventListener('abort',abortListener,{once:true});timer=setTimeout(()=>{reject(Error('Tải lịch sử quá lâu. Thử tải lại; các phiếu đã tải được giữ nguyên.'));requestController.abort();},timeoutMs);});
   const page=await Promise.race([adapter.read({caseId:id,cursor,scope:structuredClone(scope),signal:requestController.signal}),interrupted]);
   if(token!==generation||disposed||caseId!==id)return false;
   const blockedAfter=guard();if(blockedAfter){items=[];loaded=false;throw Error(blockedAfter);}
   if(!page||page.caseId!==id||!Array.isArray(page.items)||typeof page.hasMore!=='boolean'||(page.hasMore&&(typeof page.nextCursor!=='string'||!page.nextCursor||page.nextCursor===cursor||consumedCursors.has(page.nextCursor))))throw Error('Chưa xác minh được dữ liệu hoặc phân trang.');
   const incoming=page.items.filter(r=>r?.caseId===id&&r.status==='POSTED');
   if(incoming.some(r=>typeof r.id!=='string'||!r.id.trim()||!Array.isArray(r.lines)||r.lines.some(l=>!l||typeof l!=='object')))throw Error('Phiếu chưa có định danh hoặc chi tiết hợp lệ.');
   const known=new Map(items.map(r=>[r.id,r]));
   // Overlap never adds quantities or replaces already-loaded rows implicitly.
   for(const row of incoming)if(!known.has(row.id))known.set(row.id,structuredClone(row));
   consumedCursors.add(cursor);items=[...known.values()];hasMore=page.hasMore;nextCursor=hasMore?page.nextCursor:null;loaded=true;error='';return true;
  }catch(e){if(token===generation&&!disposed&&e.name!=='AbortError')error=e.message||'Không tải được lịch sử.';return false;}
  finally{clearTimeout(timer);requestController.signal.removeEventListener('abort',abortListener);if(token===generation&&!disposed){loading=false;controller=null;emit();}}
 }
 return {select,load,snapshot,guard,cancel,
  addVerified(rows){if(guard())return;const known=new Map(items.map(r=>[r.id,r]));for(const r of rows)if(r.caseId===caseId&&r.status==='POSTED'&&typeof r.id==='string'&&r.id&&Array.isArray(r.lines)&&!known.has(r.id))known.set(r.id,structuredClone(r));items=[...known.values()];},
  dispose(){cancel();disposed=true;items=[];}
 };
}
