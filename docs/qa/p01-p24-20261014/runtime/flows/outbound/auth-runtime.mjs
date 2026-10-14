import {UUID,P05ApiError} from './api-adapter.mjs';
// Existing ACCESS token supplied by P01 owner or explicitly by a DEV reviewer.
// No login/switch-context, credential discovery, token persistence or first-warehouse selection.
export async function verifyP05Session({baseUrl,getAccessToken,fetcher=(...args)=>fetch(...args),storage=sessionStorage}){
  const origin=new URL(baseUrl);if(origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password||origin.protocol!=='https:'&&origin.hostname!=='127.0.0.1')throw Error('Base DEV không hợp lệ.');
  const presentedToken=getAccessToken();if(!presentedToken)throw new P05ApiError('AUTH_CONTEXT_REQUIRED','Cần ACCESS token từ phiên được phép.');
  async function read(path){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const response=await fetcher(new URL(path,origin).href,{method:'GET',signal:controller.signal,credentials:'omit',cache:'no-store',headers:{Accept:'application/json',Authorization:'Bearer '+presentedToken}});const b=await response.json();if(!response.ok||b.success!==true)throw new P05ApiError(b.error?.code||'AUTH_READ_FAILED',b.message||'Chưa xác minh phiên.');if(getAccessToken()!==presentedToken)throw new P05ApiError('OWNER_CHANGED','Phiên đã thay đổi.');return b;}finally{clearTimeout(timer);}}
  const me=(await read('/api/v1/auth/me')).data,raw=await read('/api/v1/mini-app/p03/context'),ctx=raw.data;
  const actorId=me?.user_id;
  if(!UUID.test(actorId||'')||!UUID.test(ctx?.auth_session_id||'')||!UUID.test(ctx?.active_warehouse_id||'')||me.status!=='ACTIVE'||raw.meta?.contract!=='mini-app-p03-v1'||ctx.warehouse_context?.status!=='READY'||me.auth_session_id!==ctx.auth_session_id||me.active_warehouse_id!==ctx.active_warehouse_id)throw new P05ApiError('AUTH_CONTEXT_REQUIRED','P01/P03 chưa xác minh actor/stable session/kho.');
  const warehouse=ctx.available_warehouses?.find(w=>w.warehouse_id===ctx.active_warehouse_id);if(!warehouse||warehouse.status!=='ACTIVE'||ctx.permissions?.OUTBOUND?.read!==true)throw new P05ApiError('P05_OPERATION_DENIED','Không có kho ACTIVE/quyền đọc nguồn.');
  const scope={actorId,authSessionId:ctx.auth_session_id,warehouseId:ctx.active_warehouse_id};
  const state={previewReady:true,session:{namespace:'p05-verified-dev',authSessionId:scope.authSessionId,actor:{id:actorId,name:me.display_name||'Người thao tác'},warehouse:{id:scope.warehouseId,name:warehouse.name||'Chưa xác minh',active:true},permissions:{warehouseOperations:ctx.permissions.OUTBOUND.read===true}}};
  return {getState:()=>state,runtime:{baseUrl:origin.origin,getAccessToken,getScope:()=>scope,storage,fetcher}};
}
