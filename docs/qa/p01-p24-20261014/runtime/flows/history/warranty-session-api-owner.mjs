import {P23_READ_CONTRACT,P23ReadError,p23Scope,scopeKey,p23Query,uuid,clone,mergeById} from './warranty-session-api-contract.mjs';
const lanes=['cases','case','timeline','sessions','events'];
const fresh=()=>({kind:'idle',items:[],item:null,detail:null,meta:null,total:null,availableTotal:null,loading:false,hasMore:false,issue:null,restartRequired:false});
const issue=e=>({code:e instanceof P23ReadError?e.code:'P23_READ_FAILED',kind:e instanceof P23ReadError?e.kind:'error',httpStatus:e.httpStatus??null});
// Five bounded read lanes; four private pagination namespaces; no store/command owner.
export function createP23ReadOwner({adapter,getContext,onGuard=()=>{},now=()=>Date.now()}={}){
 if(!adapter||typeof adapter.read!=='function'||typeof getContext!=='function')throw new P23ReadError('P23_PREPARATION_REQUIRED');
 const listeners=new Set(),channels=new Map();let disposed=false,identity='',lastGuard=null;
 const emit=()=>{for(const fn of listeners)fn();};
 const family=lane=>['cases','case','timeline'].includes(lane)?'cases':'sessions';
 function channel(lane){if(!lanes.includes(lane))throw new P23ReadError('P23_ROUTE_INVALID');if(!channels.has(lane))channels.set(lane,{state:fresh(),generation:0,abort:null,query:lane==='case'?{}:p23Query(lane),entity:null,next:null,seen:new Set(),chainAt:null,request:null,view:null});return channels.get(lane);}
 function invalidate(c,{keep=false}={}){c.generation++;c.abort?.abort();c.abort=null;c.next=null;c.seen.clear();c.chainAt=null;c.request=null;if(!keep){c.state=fresh();c.view=null;}else c.state.loading=false;}
 function clear(){for(const c of channels.values())invalidate(c);}
 function context(lane){
  if(disposed)throw new P23ReadError('P23_DISPOSED','cancelled');
  let raw,s;try{raw=getContext();s=p23Scope(raw,family(lane));}catch(e){const c=channel(lane),changed=identity!==''||c.state.kind!==(e.kind||'context')||c.state.issue?.code!==e.code;if(changed){clear();identity='';for(const ch of channels.values()){ch.state.kind=e.kind||'context';ch.state.issue=issue(e);}}if(lastGuard!==e.code){lastGuard=e.code;onGuard(issue(e));}if(changed)emit();throw e;}
  const key=scopeKey(s);if(identity!==key){clear();identity=key;}lastGuard=null;return {raw,key};
 }
 function current(lane,key,generation){if(disposed)return false;try{return context(lane).key===key&&channel(lane).generation===generation;}catch{return false;}}
 async function execute(lane,{append=false,retry=false,entity,query}={}){
  const c=channel(lane);let ctx;try{ctx=context(lane);}catch{return false;}
  if(query&&Object.hasOwn(query,'cursor'))throw new P23ReadError('P23_CURSOR_PRIVATE');
  if(lane==='case'&&query&&Object.keys(query).length)throw new P23ReadError('P23_QUERY_INVALID');
  const normalized=lane==='case'?{}:p23Query(lane,query??c.query),id=entity===undefined?c.entity:entity;
  if(['case','timeline','events'].includes(lane)&&(!uuid(id)||id===ctx.raw.authSessionId)){invalidate(c);c.entity=null;c.state.kind='notfound';c.state.issue={code:'P23_ENTITY_ID_INVALID',kind:'notfound',httpStatus:404};emit();return false;}
  const changed=JSON.stringify(normalized)!==JSON.stringify(c.query)||id!==c.entity;
  if(changed){invalidate(c);c.query=normalized;c.entity=id;}
  if(c.state.loading)return false;
  if(retry&&c.state.restartRequired)return false;
  if(append&&(c.state.restartRequired||!c.state.hasMore||!c.next))return false;
  if(append&&c.chainAt!==null&&now()-c.chainAt>=900000){c.state.restartRequired=true;c.state.issue={code:'P23_CURSOR_EXPIRED',kind:'restart',httpStatus:null};emit();return false;}
  const target=retry?c.request:{lane,id,query:append?{...c.query,...c.next}:clone(c.query),append};if(!target)return false;
  const hadRows=c.state.items.length>0||c.state.item!==null||c.state.detail!==null,baseKind=c.state.kind;
  const controller=new AbortController();c.abort=controller;const gen=++c.generation;c.request=clone(target);c.state.loading=true;c.state.issue=null;if(!hadRows)c.state.kind='loading';emit();
  try{
   const page=await adapter.read(lane,ctx.raw,target.query,target.id,{signal:controller.signal});if(!current(lane,ctx.key,gen))return false;
   const m=page.meta??null,next=m?.hasMore?(m.nextCursor?{cursor:m.nextCursor}:{page:m.nextPage}):null;
   if(next?.cursor&&(next.cursor===target.query.cursor||c.seen.has(next.cursor)))throw new P23ReadError('P23_CURSOR_LOOP','restart');
   if(lane==='case'){c.state={...fresh(),kind:'ready',item:page.item,meta:{etag:page.etag}};}
   else{
    const items=mergeById(target.append?c.state.items:[],page.items,lane);
    if(lane==='timeline')for(const e of items)e.isLatestRecorded=e.event_id===m.latest_recorded_event_id;
    const partial=lane==='sessions'&&m.total===null||lane==='timeline'&&(m.latest_completeness==='PARTIAL_TIME_INFORMATION'||m.retention_status==='NOT_PUBLISHED')||lane==='events'&&page.detail.counts.countStatus!=='AVAILABLE_RETAINED_EVENTS';
    c.state={...fresh(),items,total:m.total,availableTotal:m.availableTotal??null,meta:m,detail:page.detail??null,kind:partial?'partial':items.length||m.total>0||page.detail?'ready':'empty',hasMore:m.hasMore};
   }
   c.next=next;if(!target.append){c.seen.clear();c.chainAt=now();}if(target.query.cursor)c.seen.add(target.query.cursor);c.state.loading=false;c.state.issue=null;c.request=null;emit();return true;
  }catch(e){if(!current(lane,ctx.key,gen)||e.kind==='cancelled')return false;
   if(['auth','denied','context'].includes(e.kind)){clear();c.state.kind=e.kind;c.state.issue=issue(e);onGuard(issue(e));}
   else if(e.kind==='notfound'&&['case','timeline','events'].includes(lane)){invalidate(c);c.state.kind='notfound';c.state.issue=issue(e);}
   else{c.state.loading=false;c.state.kind=hadRows?baseKind:e.kind==='unavailable'?'unavailable':e.kind==='notfound'?'notfound':'error';c.state.issue=issue(e);c.state.restartRequired=['restart','contract'].includes(e.kind);}
   emit();return false;
  }finally{if(c.generation===gen)c.abort=null;}
 }
 return Object.freeze({
  read(lane,options={}){return execute(lane,options);},
  more(lane){return execute(lane,{append:true});},
  retry(lane){return execute(lane,{retry:true});},
  restart(lane){const c=channel(lane);invalidate(c);return execute(lane);},
  snapshot(lane){const c=channel(lane);try{context(lane);}catch{}const meta=c.state.meta?clone(c.state.meta):null;if(meta){delete meta.nextCursor;delete meta.nextPage;}return clone({...c.state,meta,activation:false,loadedCount:c.state.items.length,query:{...c.query,cursor:undefined},entity:c.entity,view:c.view});},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  rememberView(lane,view){context(lane);const c=channel(lane);if(!view||!Number.isFinite(view.top)||view.top<0||view.anchorId!==null&&!uuid(view.anchorId))throw new P23ReadError('P23_VIEW_INVALID');c.view={top:view.top,anchorId:view.anchorId,offset:Number.isFinite(view.offset)?view.offset:0,focusId:uuid(view.focusId)?view.focusId:null};},
  caseHistoryTarget(){const ctx=context('case'),d=channel('case').state.item;if(!d||channel('case').state.loading||d.capabilities.posted_component_issues_read!==true||!['documents.read','warranty.component_issue'].every(p=>ctx.raw.permissions.includes(p)))return null;return {owner:'P20',caseId:d.warranty_case_id,warehouseId:ctx.raw.warehouseId,requiresOwnerRecheck:true,isConfirmationReceipt:false};},
  cancel(lane){const c=channel(lane);c.generation++;c.abort?.abort();c.abort=null;if(c.state.loading){c.state.issue={code:'P23_READ_INTERRUPTED',kind:'interrupted',httpStatus:null};if(c.state.kind==='loading')c.state.kind='idle';}c.state.loading=false;},
  async checkpoint(lane){context(lane);const c=channel(lane),key=identity,gen=c.generation;const digest=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(x=>x.toString(16).padStart(2,'0')).join('');const [contextHash,queryHash]=await Promise.all([digest(key),digest(JSON.stringify([lane,c.entity,c.query]))]);if(!current(lane,key,gen))throw new P23ReadError('P23_CHECKPOINT_STALE','cancelled');const refKey=lane==='cases'?'warranty_case_id':lane==='sessions'?'sessionId':lane==='timeline'?'event_id':'eventId';return {contract:P23_READ_CONTRACT,activation:false,lane,contextHash,queryHash,entity:c.entity,refs:c.state.items.map(r=>r[refKey])};},
  dispose(){clear();disposed=true;listeners.clear();identity='';},
 });
}
