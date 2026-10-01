// Per-tab page cache for the preview adapter, not a server contract.
export function createNotificationPages({source}) {
 let scope=source.scope(),disposed=false;
 const settledReads=new Set();
 const fresh=()=>({items:[],cursor:null,total:null,loaded:false,busy:false,error:false,promise:null});
 let tabs={unread:fresh(),all:fresh()};
 function current(){const next=source.scope();if(next!==scope){scope=next;tabs={unread:fresh(),all:fresh()};settledReads.clear();}return scope;}
 const read=filter=>{current();if(!Object.hasOwn(tabs,filter))throw new Error('Invalid notification filter');return tabs[filter];};
 function snapshot(filter){const t=read(filter);return {items:t.items.map(r=>({...r})),total:t.total,loaded:t.loaded,busy:t.busy,error:t.error,hasMore:t.loaded&&t.cursor!==null};}
 function load(filter,{fail=false}={}){
  const t=read(filter),requestScope=scope;
  if(disposed||!requestScope)return Promise.resolve({kind:'stale'});
  if(t.busy)return t.promise;
  if(t.loaded&&t.cursor===null)return Promise.resolve({kind:'end'});
  t.busy=true;t.error=false;
  t.promise=(async()=>{
   let result;try{result=await source.loadPage({filter,cursor:t.cursor,fail});}catch{result={kind:'error'};}
   if(disposed||current()!==requestScope||tabs[filter]!==t)return {kind:'stale'};
   t.busy=false;t.promise=null;
   if(result.kind!=='page'){t.error=result.kind!=='stale';return result;}
   // ID merge retains order and updates overlapping rows without duplicate cards.
   const known=new Map(t.items.map(r=>[r.id,r]));
   for(const r of result.items)known.set(r.id,{...r});
   t.items=[...known.values()];t.cursor=result.nextCursor;t.total=result.total;t.loaded=true;t.error=false;
   return {kind:'page',items:result.items};
  })();
  return t.promise;
 }
 function markRead(id){current();if(settledReads.has(id))return;settledReads.add(id);for(const [filter,t]of Object.entries(tabs)){const row=t.items.find(r=>r.id===id);if(row)row.read=true;if(filter==='unread'){t.items=t.items.filter(r=>r.id!==id);if(t.total!==null)t.total=Math.max(0,t.total-1);}}}
 return {snapshot,load,markRead,reset(){tabs={unread:fresh(),all:fresh()};scope=source.scope();settledReads.clear();},dispose(){disposed=true;tabs={unread:fresh(),all:fresh()};settledReads.clear();}};
}
