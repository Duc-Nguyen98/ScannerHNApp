import {need,scopeKey,uuid,handoverProjection,unavailableLocation} from './api-contract.mjs';
// Fresh owner metadata and binary ACL on each open. No receipt/cache fallback.
export function createAttachmentReadOwner({client,getContext}){need(client?.mode==='MOCK_PREPARATION','ACTIVATION_OFF');let epoch=0,controller=null,disposed=false;
 function cancel(){epoch++;controller?.abort();controller=null;}
 return {async open(parent,fileId,{userAction=false,pageInput={}}={}){need(!disposed,'DISPOSED');need(userAction&&uuid(fileId),'USER_ACTION_REQUIRED');parent=structuredClone(parent);pageInput=structuredClone(pageInput);cancel();const ticket=epoch,identity=scopeKey(getContext());const ctl=new AbortController();controller=ctl;const current=()=>{try{return !disposed&&ticket===epoch&&identity===scopeKey(getContext())&&!ctl.signal.aborted;}catch{return false;}};
  const page=await client.files(parent,pageInput, {signal:ctl.signal});need(current(),'STALE_CONTEXT');const file=page.items.find(f=>f.id===fileId);need(file,'EXACT_FILE_NOT_IN_PAGE');/* no whole-list lookup by filename/hash; paged caller may supply its exact page */
  const result=await client.binary(parent,file,{userAction:true,signal:ctl.signal});need(current(),'STALE_CONTEXT');return {...result,file};},cancel,dispose(){cancel();disposed=true;}};
}
// Prepared policy projection only; no PATCH/POST writer or note concatenation.
export function projectPreparedHandoff({current,context,caseId,components=[],events=[]}){const view=handoverProjection(current,context,caseId);need(Array.isArray(components)&&components.every(d=>d.warranty_case_id===caseId&&d.warehouse_id===context.warehouseId&&d.status==='POSTED'),'POSTED_CASE_COMPONENTS_REQUIRED');need(Array.isArray(events)&&events.every(e=>e.warranty_case_id===caseId),'CASE_EVENTS_REQUIRED');return {...view,components:structuredClone(components),events:structuredClone(events),location:unavailableLocation()};}
