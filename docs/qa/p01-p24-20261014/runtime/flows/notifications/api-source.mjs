import {P13_RELEASE,P13ApiError,requireP13,uuid,cursorRestart} from './api-contract.mjs';

// Prepared source and cache live only in one authenticated owner. Read-state
// uncertainty is a latch, not permission to repeat a timed-out PATCH.
export function createP13PreparedSource({client,onChange=()=>{},onSystemError=()=>false}){
 requireP13(client?.mode==='MOCK_PREPARATION','ACTIVATION_OFF');
 let disposed=false,scope=null,count=null,countSequence=0,epoch=0,detailGeneration=0,blocked=false;
 const records=new Map(),details=new Map(),reads=new Map(),unknown=new Set();
 function key(){let next;try{next=client.contextKey();}catch(error){epoch++;detailGeneration++;countSequence++;count=null;scope=null;records.clear();details.clear();reads.clear();unknown.clear();client.cancel();throw error;}if(next!==scope){const previous=scope;scope=next;blocked=false;epoch++;detailGeneration++;countSequence++;count=null;records.clear();details.clear();reads.clear();unknown.clear();if(previous!==null)client.cancel();}return blocked?null:scope;}
 const still=(captured,ticket)=>{try{return !disposed&&captured===key()&&ticket===epoch;}catch{return false;}};
 function cache(recipient){const previous=records.get(recipient.id);requireP13(!previous?.read_at||recipient.read_at===previous.read_at,'READ_STATE_REGRESSION');records.set(recipient.id,recipient);return recipient;}
 function system(error){if([401,403].includes(error?.status)){blocked=true;epoch++;detailGeneration++;countSequence++;count=null;records.clear();details.clear();reads.clear();unknown.clear();client.cancel();onChange('count');onSystemError(error);}}
 async function refreshCount(){let captured;try{captured=key();}catch{return null;}if(!captured||disposed)return null;const ticket=epoch,sequence=++countSequence;
  try{const result=await client.count();if(!still(captured,ticket)||sequence!==countSequence)return null;count=result.count;onChange('count');return count;}
  catch(error){if(!still(captured,ticket)||sequence!==countSequence)return null;count=null;system(error);onChange('count');return null;}
 }
 async function detail(id,{signal}={}){if(!uuid(id)){const error=new P13ApiError('RECIPIENT_MISMATCH','Không tìm thấy thông báo.',404);details.set(id,{status:'error',error});return {kind:'error',error};}let captured;try{captured=key();}catch(error){return {kind:'error',error};}const ticket=epoch,generation=++detailGeneration;if(!captured||disposed)return {kind:'error',error:new P13ApiError('SOURCE_BLOCKED','Nguồn chưa được cấp lại quyền.',403)};
  details.set(id,{status:'loading',error:null});
  try{const result=await client.detail(id,{signal});if(!still(captured,ticket)||generation!==detailGeneration)return {kind:'stale'};cache(result.recipient);details.set(id,{status:'ready',error:null});return {kind:'verified',recipient:result.recipient,meta:result.meta};}
  catch(error){if(!still(captured,ticket)||generation!==detailGeneration)return {kind:'stale'};details.set(id,{status:'error',error});if(error.status===404)records.delete(id);system(error);return {kind:'error',error};}
 }
 function markRead(id,{intent}={}){
  requireP13(uuid(id)&&['open-recipient','retry-read'].includes(intent),'USER_INTENT_REQUIRED');const captured=key(),ticket=epoch;
  if(!captured||disposed)return Promise.resolve({kind:'error',error:new P13ApiError('SOURCE_BLOCKED','Nguồn chưa được cấp lại quyền.',403)});
  if(reads.has(id))return reads.get(id);
  if(unknown.has(id))return reconcile(id);
  const sequence=++countSequence;
  const task=(async()=>{try{
   const result=await client.read(id,{intent});if(!still(captured,ticket))return {kind:'stale'};
   cache(result.recipient);if(sequence===countSequence){count=result.unreadCount;onChange('count');}
   void refreshCount();return {kind:'verified',recipient:result.recipient,meta:result.meta,changed:result.changed,unreadCount:result.unreadCount};
  }catch(error){if(!still(captured,ticket))return {kind:'stale'};system(error);
   if(![401,403,404,422].includes(error.status)){unknown.add(id);return await reconcileRead(id,captured,ticket);}
   return {kind:'error',error};
  }finally{if(still(captured,ticket))reads.delete(id);}})();reads.set(id,task);return task;
 }
 async function reconcileRead(id,captured,ticket){
  try{const result=await client.detail(id);if(!still(captured,ticket))return {kind:'stale'};
   // null is not proof that the original PATCH did not happen. Do not clear latch.
   if(result.recipient.read_at===null){await refreshCount();if(!still(captured,ticket))return {kind:'stale'};return {kind:'unknown',error:new P13ApiError('READ_STATE_UNKNOWN','Trạng thái đọc chưa được xác minh; chỉ đối chiếu lại cùng thông báo.')};}
   cache(result.recipient);unknown.delete(id);await refreshCount();if(!still(captured,ticket))return {kind:'stale'};return {kind:'verified',recipient:result.recipient,meta:result.meta,reconciled:true};
  }catch(error){if(!still(captured,ticket))return {kind:'stale'};system(error);await refreshCount();if(!still(captured,ticket))return {kind:'stale'};return {kind:'unknown',error};}
 }
 function reconcile(id){const captured=key(),ticket=epoch;if(reads.has(id))return reads.get(id);const task=reconcileRead(id,captured,ticket).finally(()=>{if(still(captured,ticket))reads.delete(id);});reads.set(id,task);return task;}
 return {mode:'MOCK_PREPARATION',prepared:true,release:P13_RELEASE,canonicalPaging:true,
  scope:()=>{try{return key();}catch{count=null;records.clear();return null;}},available:()=>{try{return !disposed&&!!key();}catch{return false;}},
  unread:()=>{try{key();return count;}catch{return null;}},read:id=>{try{key();return records.has(id)?structuredClone(records.get(id)):null;}catch{return null;}},
  detailState:id=>{try{key();return details.get(id)||{status:'pending',error:null};}catch(error){return {status:'error',error};}},detail,markRead,refreshCount,
  needsReconcile:id=>{key();return unknown.has(id);},
  async page(query,options){const captured=key(),ticket=epoch;requireP13(captured&&!disposed,'AUTH_CONTEXT_REQUIRED');const result=await client.page(query,options);requireP13(still(captured,ticket),'STALE_CONTEXT');for(const item of result.items)cache(item);return result;},
  cancelDetail(){detailGeneration++;},cancel(){detailGeneration++;client.cancel();},
  systemError:system,
  dispose(){disposed=true;epoch++;client.dispose();records.clear();details.clear();reads.clear();unknown.clear();count=null;}
 };
}

export function createP13ApiPages({source,perPage=10,severity}){
 let context=source.scope(),generation=0,disposed=false;const tabs=new Map();
 const fresh=()=>({items:[],loadedIds:new Set(),cursor:'start',hasMore:false,total:null,loaded:false,busy:false,error:false,errorValue:null,restartRequired:false,promise:null,generation:++generation});
 function current(filter){const next=source.scope();if(next!==context){tabs.clear();context=next;}requireP13(['all','unread'].includes(filter),'INVALID_QUERY');if(!tabs.has(filter))tabs.set(filter,fresh());return tabs.get(filter);}
 const query=(filter,t)=>({cursor:t.cursor,per_page:perPage,...(filter==='unread'?{unread:1}:{}),...(severity===undefined?{}:{severity})});
 function load(filter){const t=current(filter),captured=context;
  if(disposed||!captured)return Promise.resolve({kind:'stale'});if(t.busy)return t.promise;if(t.restartRequired)return Promise.resolve({kind:'restart-required',error:t.errorValue});if(t.loaded&&!t.hasMore)return Promise.resolve({kind:'end'});
  t.busy=true;t.error=false;t.promise=(async()=>{try{const result=await source.page(query(filter,t));if(disposed||context!==source.scope()||captured!==context||tabs.get(filter)!==t)return {kind:'stale'};
   const seen=new Map(t.items.map(r=>[r.id,r]));for(const r of result.items){seen.set(r.id,r);t.loadedIds.add(r.id);}t.items=[...seen.values()];t.cursor=result.meta.next_cursor;t.hasMore=result.meta.has_more;t.total=result.meta.total;t.loaded=true;t.errorValue=null;t.restartRequired=false;
   return {kind:'page',items:result.items,meta:result.meta};
  }catch(error){if(disposed||captured!==source.scope()||tabs.get(filter)!==t)return {kind:'stale'};t.error=true;t.errorValue=error;t.restartRequired=cursorRestart(error);source.systemError(error);return {kind:'error',error,restartRequired:t.restartRequired};}
  finally{t.busy=false;t.promise=null;}})();return t.promise;
 }
 return {load,
  snapshot(filter){const t=current(filter);return {items:structuredClone(t.items),loadedCount:t.loadedIds.size,total:t.total,loaded:t.loaded,busy:t.busy,error:t.error,errorValue:t.errorValue,hasMore:t.hasMore,restartRequired:t.restartRequired};},
  markRead(id){for(const [filter,t]of tabs){const r=source.read(id);if(!r?.read)continue;t.items=t.items.map(item=>item.id===id?r:item);if(filter==='unread'){t.items=t.items.filter(item=>item.id!==id);t.total=null;}}},
  reset(filter){if(filter)tabs.set(filter,fresh());else tabs.clear();},
  configure(options){perPage=options.per_page??perPage;severity=options.severity;tabs.clear();},
  dispose(){disposed=true;tabs.clear();}
 };
}
