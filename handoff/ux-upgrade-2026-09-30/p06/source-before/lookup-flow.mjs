import {validateQueryRange,resolveQueryRange,clampQueryDate} from '../shared/query-date-policy.mjs';
import { sessionGuard } from '../home/home-flow.mjs';
import { validateEventFilters } from './fixture-adapter.mjs';
export function createLookupFlow({adapter,getState}) {
  let state={panel:1,category:'products',query:'',itemId:null,listScroll:0,filters:{type:'all',from:clampQueryDate('2026-09-01'),to:clampQueryDate('2026-09-09')},message:''};
  const scope=()=> {const s=getState();return !sessionGuard(s)?{actorId:s.session.actor.id,warehouseId:s.session.warehouse.id}:null;};
  const allowed=()=>!!scope();
  return {
    snapshot:()=>structuredClone(state),
    list:()=>adapter.search(scope(),state),
    item:()=>adapter.item(scope(),state.itemId),
    history:()=>adapter.history(scope(),state.itemId,state.filters),
    capabilities:()=> allowed()?adapter.capabilities():{},
    search(query) {if(!allowed())return false;state.query=query;state.listScroll=0;return true;},
    category(category) {if(!allowed()||!['products','components'].includes(category))return false;state.category=category;state.listScroll=0;return true;},
    rememberScroll(top) {state.listScroll=top;},
    open(id) {if(!allowed()||!adapter.item(scope(),id))return false;state.itemId=id;state.panel=2;state.message='';return true;},
    panel(panel) {if(!allowed()||![1,2,3,4].includes(panel)||panel>1&&!adapter.item(scope(),state.itemId))return false;state.panel=panel;state.message='';return true;},
    filters(next) {
      if(!allowed())return false;
      const candidate={...state.filters,...next},error=validateEventFilters(candidate)||validateQueryRange(candidate);
      if(error){state.message=error;return false;}
      state.filters={...candidate,...resolveQueryRange(candidate)};state.message='';return true;
    },
    action(action,eventId) {
      if(!allowed())return {kind:'blocked',message:'Phiên chưa được xác nhận.'};
      const item=adapter.item(scope(),state.itemId);
      if(action==='print')return {kind:'blocked',message:adapter.capabilities().print===true?'Chức năng in tem chưa có contract được duyệt.':'Không có quyền in tem.'};
      if(action==='warranty')return adapter.capabilities().warranty===true&&item?{kind:'pending',target:'P09',itemId:item.id,message:'Bảo hành P09 chưa tích hợp cho sản phẩm này.'}:{kind:'blocked',message:'Chưa xác nhận quyền xem bảo hành sản phẩm.'};
      if(action==='document') {
        const event=adapter.history(scope(),state.itemId,state.filters).items.find(e=>e.id===eventId);
        return event?.canOpenDocument===true&&event.documentId?{kind:'pending',target:'P12',documentId:event.documentId,itemId:item.id,message:'Chứng từ P12 chưa tích hợp.'}:{kind:'blocked',message:'Chưa xác nhận quyền mở chứng từ liên quan.'};
      }
      if(action==='scan')return {kind:'scanner',context:{...scope(),itemId:state.panel===1?null:item?.id??null,returnTo:'P06',category:state.category,query:state.query}};
      return {kind:'blocked',message:'Hành động chưa được hỗ trợ.'};
    },
  };
}
