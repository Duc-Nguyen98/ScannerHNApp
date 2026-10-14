import {sessionGuard} from '../home/home-flow.mjs';

const categories=new Set(['products','components']);
const validId=value=>typeof value==='string'&&value.length>0;

// Memory of IDs only. Labels, inventory and serials always come from a fresh read.
export function createRecentLookupItems({getState}) {
  let currentScope=null;
  const ids=new Map();
  function scope(){
    const state=getState(),session=state?.session;
    const key=!sessionGuard(state)&&validId(session.authSessionId)&&validId(session.actor?.id)&&validId(session.warehouse?.id)
      ?JSON.stringify([session.authSessionId,session.actor.id,session.warehouse.id]):null;
    if(key!==currentScope||key===null){ids.clear();currentScope=key;}
    return key?session:null;
  }
  return {
    remember(item){
      const session=scope();
      if(!session||!validId(item?.id)||!categories.has(item.category)||item.warehouseId!==session.warehouse.id)return false;
      ids.set(item.category,[item.id,...(ids.get(item.category)||[]).filter(id=>id!==item.id)].slice(0,3));return true;
    },
    items(category,source){
      const session=scope();
      if(!session||!categories.has(category)||source?.error||!Array.isArray(source?.items))return [];
      return (ids.get(category)||[]).map(id=>source.items.find(item=>item.id===id&&item.category===category&&item.warehouseId===session.warehouse.id)).filter(Boolean);
    },
    clear(){ids.clear();currentScope=null;},
  };
}

// Used by both ordinary product navigation and the NFC product picker. A cached
// row is never sufficient authority to open/select an item after a read failure.
export function resolveLookupSelection({adapter,scope,category,id}) {
  if(!scope||!validId(id)||!categories.has(category))return {kind:'blocked',message:'Chưa xác minh được phạm vi tra cứu.'};
  try {
    const source=adapter.search(scope,{category,query:''});
    if(source?.error||!Array.isArray(source?.items))return {kind:'unavailable',message:source?.error||'Chưa đọc được nguồn sản phẩm. Vui lòng thử tải lại.'};
    const listed=source.items.find(item=>item.id===id&&item.category===category&&item.warehouseId===scope.warehouseId);
    if(!listed)return {kind:'missing',message:'Sản phẩm không còn trong dữ liệu vừa tải hoặc chưa xác minh được quyền xem. Hãy tải lại danh sách.'};
    const item=adapter.item(scope,id);
    if(!item||item.id!==id||item.category!==category||item.warehouseId!==scope.warehouseId)return {kind:'missing',message:'Chưa xác minh được thông tin hiện tại của sản phẩm. Hãy tải lại danh sách.'};
    return {kind:'item',item};
  }catch{return {kind:'unavailable',message:'Chưa đọc được nguồn sản phẩm. Vui lòng thử tải lại.'};}
}
