import {P20_HISTORY_CONTRACT,P20_HISTORY_GATE,HistoryReadError,HISTORY_UUID,historyScope,historyScopeKey,historyClone,historyError} from './history-api-contract.mjs';

// A scoped GET-only owner. It never imports fixture, draft, Post or receipt code.
export function createP20HistoryOwner({adapter,getScope,onChange=()=>{},onAuthRequired=()=>{},concurrency=3,now=()=>Date.now(),freshnessMs=30000}={}){
 if(adapter?.offlineOnly!==true||adapter.contract!==P20_HISTORY_CONTRACT||typeof getScope!=='function')throw new HistoryReadError('P20_OFFLINE_OWNER_REQUIRED');
 if(!Number.isInteger(concurrency)||concurrency<1||concurrency>4)throw new HistoryReadError('P20_CONCURRENCY_INVALID');
 let disposed=false,epoch=0,listSequence=0,scope=null,key='',caseId=null,caseRow=null,meta=null,loaded=false,loading=false,error='',errorInfo=null,restartRequired=false,controller=null,paging=null,chainAt=null,validatedAt=null,activeDetails=0;
 const rows=new Map(),used=new Set(),queue=[],inflight=new Map(),listeners=new Set();
 const snapshot=()=>historyClone({namespace:P20_HISTORY_CONTRACT,offlineOnly:true,gate:P20_HISTORY_GATE,caseId,caseRow,items:[...rows.values()],loaded,loading,error,errorInfo,restartRequired,meta,total:meta?.total??null,hasMore:meta?.hasMore??null,nextCursor:meta?.nextCursor??null,nextPage:meta?.nextPage??null,query:paging,scopeKey:key,hydrating:[...rows.values()].filter(r=>r.hydration==='loading').length});
 const emit=()=>{if(!disposed){const value=snapshot();onChange(value);for(const fn of listeners)fn(value);}};
 function guard(){if(disposed)return 'Phiên xem đã đóng.';try{return scope&&historyScopeKey(getScope())===historyScopeKey(scope)?'':'Ngữ cảnh người thao tác, phiên, quyền hoặc kho đã thay đổi.';}catch(e){return e.message;}}
 function clear(){rows.clear();used.clear();caseRow=null;meta=null;loaded=false;error='';errorInfo=null;restartRequired=false;chainAt=null;validatedAt=null;}
 function cancel(){epoch++;controller?.abort();controller=null;loading=false;for(const task of queue.splice(0))task.resolve(false);inflight.clear();for(const row of rows.values())if(row.hydration==='loading')row.hydration='unavailable';}
 function fail(e){loading=false;errorInfo=historyError(e);error=e.message||'Chưa tải được lịch sử.';restartRequired=e.restart===true;
  if(e.status===401||e.status===403&&e.trusted||guard()){cancel();rows.clear();used.clear();caseRow=null;meta=null;loaded=false;chainAt=null;validatedAt=null;}
  if(e.status===401)onAuthRequired(historyError(e));emit();
 }
 function select(id,{perPage=20,pagination='KEYSET',callerId=null}={}){
  if(disposed)throw new HistoryReadError('P20_OWNER_DISPOSED');
  let fresh;try{fresh=historyScope(getScope());if(!HISTORY_UUID.test(id||''))throw new HistoryReadError('P20_CANONICAL_ID_REQUIRED');}catch(e){cancel();clear();scope=null;caseId=null;key='';fail(e);throw e;}
  if(!Number.isInteger(perPage)||perPage<1||perPage>100||!['KEYSET','OFFSET'].includes(pagination)){cancel();clear();throw new HistoryReadError('P20_QUERY_INVALID');}
  const next=JSON.stringify([historyScopeKey(fresh),id,perPage,pagination,P20_HISTORY_CONTRACT,callerId]);
  if(next===key)return;cancel();clear();scope=fresh;key=next;caseId=id;paging={perPage,pagination,...(pagination==='OFFSET'?{page:1}:{})};emit();
 }
 function current(token,capturedKey){return !disposed&&token===epoch&&capturedKey===key&&!guard();}
 async function withCase(signal,token,capturedKey){
  if(!caseRow||validatedAt===null||now()-validatedAt>=freshnessMs){const row=await adapter.case(scope,caseId,{signal});if(!current(token,capturedKey))return false;caseRow=row;validatedAt=now();}
  return true;
 }
 function detailTask(id){
  const row=rows.get(id);if(!row||!row.link.can_open)return Promise.resolve(false);
  const existing=inflight.get(id);if(existing&&existing.revision===row.readRevision)return existing.promise;
  row.hydration='loading';row.detailError=null;row.detail=null;row.readRevision=(row.readRevision||0)+1;
  const token=epoch,capturedKey=key,revision=row.readRevision,link=historyClone(row.link),signal=controller?.signal;
  const task={id,token,capturedKey,revision,link,signal,scope:historyClone(scope)};const promise=new Promise(resolve=>task.resolve=resolve);task.promise=promise;inflight.set(id,task);queue.push(task);emit();pump();return promise;
 }
 function pump(){while(activeDetails<concurrency&&queue.length){const task=queue.shift();if(!current(task.token,task.capturedKey)){task.resolve(false);continue;}activeDetails++;
  Promise.resolve().then(()=>adapter.detail(task.scope,task.link,{signal:task.signal})).then(detail=>{
   const row=rows.get(task.id);if(task.token===epoch&&guard()){fail(new HistoryReadError('P20_SCOPE_CHANGED',guard()));return false;}if(!current(task.token,task.capturedKey)||!row||row.readRevision!==task.revision)return false;
   row.detail=detail;row.hydration='ready';row.detailError=null;row.detailReadAt=now();emit();return true;
  },e=>{
   const row=rows.get(task.id);if(task.token===epoch&&guard()){fail(new HistoryReadError('P20_SCOPE_CHANGED',guard()));return false;}if(!current(task.token,task.capturedKey)||!row||row.readRevision!==task.revision)return false;
   row.detail=null;row.detailError=historyError(e);row.hydration=e.status===403?'denied':'error';if(e.status===401){fail(e);return false;}emit();return false;
  }).then(value=>task.resolve(value),e=>task.resolve(false)).finally(()=>{activeDetails--;if(inflight.get(task.id)===task)inflight.delete(task.id);pump();});
 }}
 async function load(){
  if(disposed||loading||loaded&&meta?.hasMore===false||restartRequired)return false;
  if(guard()){fail(new HistoryReadError('P20_SCOPE_CHANGED',guard()));return false;}
  if(chainAt!==null&&paging.pagination==='KEYSET'&&now()-chainAt>=900000){fail(new HistoryReadError('P20_CURSOR_CHAIN_EXPIRED','Chuỗi phân trang hết hiệu lực. Đọc lại từ đầu.',{restart:true}));return false;}
  const query=historyClone(paging),queryKey=JSON.stringify(query);if(used.has(queryKey)){fail(new HistoryReadError('P20_CURSOR_LOOP','Nguồn phân trang lặp. Đọc lại từ đầu.',{restart:true}));return false;}
  controller??=new AbortController();const signal=controller.signal,token=epoch,capturedKey=key,sequence=++listSequence;loading=true;error='';errorInfo=null;emit();
  try{
   if(!await withCase(signal,token,capturedKey))return false;
   const page=await adapter.list(scope,caseId,query,{signal});if(!current(token,capturedKey))return false;
   const next={perPage:query.perPage,pagination:query.pagination,...(query.pagination==='KEYSET'?(page.meta.hasMore?{cursor:page.meta.nextCursor}:{ }):{page:page.meta.nextPage??page.meta.page})};
   if(page.meta.hasMore&&(JSON.stringify(next)===queryKey||used.has(JSON.stringify(next))))throw new HistoryReadError('P20_CURSOR_LOOP','Cursor/page nguồn bị lặp. Đọc lại từ đầu.',{restart:true});
   if(query.pagination==='OFFSET'&&page.meta.page!==query.page)throw new HistoryReadError('P20_PAGE_MISMATCH','Response không phải trang đang yêu cầu.');
   const hydrate=[];for(const link of page.links){const id=link.component_issue_document_id,old=rows.get(id);if(old&&JSON.stringify(old.link)===JSON.stringify(link)&&old.hydration==='ready'&&now()-old.detailReadAt<freshnessMs)continue;
    rows.set(id,{id,caseId,status:'POSTED',link,detail:null,hydration:link.can_open?'unavailable':'denied',detailError:link.can_open?null:{code:'P20_LINK_CANNOT_OPEN',message:'Nguồn không cho phép mở chi tiết phiếu.',status:403},readRevision:(old?.readRevision||0)+1});if(link.can_open)hydrate.push(id);
   }
   if(page.meta.total===0&&rows.size>0)throw new HistoryReadError('P20_SOURCE_CHANGED','Nguồn đã thay đổi giữa các trang. Đọc lại từ đầu.',{restart:true});
   used.add(queryKey);meta=page.meta;paging=next;chainAt??=now();loaded=true;loading=false;emit();
   await Promise.all(hydrate.map(detailTask));return current(token,capturedKey);
  }catch(e){if(current(token,capturedKey)&&e.name!=='AbortError')fail(e);return false;}
  finally{if(token===epoch&&sequence===listSequence&&!disposed){loading=false;if(guard())fail(new HistoryReadError('P20_SCOPE_CHANGED',guard()));else emit();}}
 }
 return {namespace:P20_HISTORY_CONTRACT,offlineOnly:true,gate:P20_HISTORY_GATE,select,load,snapshot,guard,cancel,
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
  caseFor(id){return id===caseId&&!guard()?historyClone(caseRow):null;},
  async retryDetail(id){if(guard()){fail(new HistoryReadError('P20_SCOPE_CHANGED',guard()));return false;}const row=rows.get(id);if(!row||row.hydration==='loading'||!row.link.can_open)return false;controller??=new AbortController();try{if(!await withCase(controller.signal,epoch,key))return false;return await detailTask(id);}catch(e){fail(e);return false;}},
  restart(){cancel();clear();paging={perPage:paging.perPage,pagination:paging.pagination,...(paging.pagination==='OFFSET'?{page:1}:{})};emit();return load();},
  revalidate(){validatedAt=null;return this.restart();},
  resume(){if(guard()){fail(new HistoryReadError('P20_SCOPE_CHANGED',guard()));return Promise.resolve(false);}if(validatedAt!==null&&now()-validatedAt>=freshnessMs)return this.restart();controller??=new AbortController();return loaded?Promise.all([...rows.values()].filter(r=>r.hydration==='unavailable'&&r.link.can_open).map(r=>detailTask(r.id))):load();},
  dispose(){if(disposed)return;cancel();clear();disposed=true;scope=null;listeners.clear();},
 };
}
