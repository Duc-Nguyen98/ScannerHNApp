import {NfcHistoryError,p22Scope,p22ScopeKey,p22Defaults,p22Filters,identity,uuid,mergeP22Events} from './nfc-audit-api-contract.mjs';
// Private in-memory read owner. No persistence, event writer, receipt or NFC service.
export function createP22AuditOwner({adapter,getContext,onGuard=()=>{},now=()=>Date.now()}={}){
 if(!adapter||typeof getContext!=='function')throw new NfcHistoryError('P22_PREPARATION_REQUIRED');
 const listeners=new Set();let disposed=false,epoch=0,scopeKey='',filters=p22Defaults(),pageAbort=null,detailAbort=null,detailEpoch=0,summaryAbort=null,summaryEpoch=0,usedCursors=new Set(),chainStarted=null;
 const fresh=()=>({kind:'idle',items:[],total:null,hasMore:false,nextCursor:null,asOf:null,timezone:null,loading:false,pageIssue:null,restartRequired:false,detail:{kind:'idle',event:null,ref:null},summary:null});let state=fresh();
 const emit=()=>{for(const f of listeners)f();};
 function clear(){epoch++;detailEpoch++;summaryEpoch++;pageAbort?.abort();detailAbort?.abort();summaryAbort?.abort();pageAbort=detailAbort=summaryAbort=null;usedCursors=new Set();chainStarted=null;state=fresh();}
 function context(){if(disposed)throw new NfcHistoryError('P22_DISPOSED','cancelled');let c;try{c=getContext();const s=p22Scope(c),key=p22ScopeKey(s);if(key!==scopeKey){clear();scopeKey=key;}return {c,key};}catch(e){const changed=scopeKey!==''||state.kind!==(e.kind||'context');if(changed){clear();scopeKey='';state.kind=e.kind||'context';state.pageIssue={code:e.code||'P22_CONTEXT_UNCONFIRMED',kind:e.kind||'context'};emit();}throw e;}}
 function valid(key,token){if(disposed||token!==epoch)return false;try{return context().key===key&&token===epoch;}catch{return false;}}
 function issue(e){return {code:e instanceof NfcHistoryError?e.code:'P22_READ_FAILED',kind:e instanceof NfcHistoryError?e.kind:'error',httpStatus:e.httpStatus||null};}
 function pageError(e,hadData,append=false){if(['auth','denied','context'].includes(e.kind)){clear();state.kind=e.kind;state.pageIssue=issue(e);onGuard(issue(e));}else{state.loading=false;state.pageIssue={...issue(e),operation:append?'append':'first'};state.restartRequired=['restart','contract'].includes(e.kind);state.kind=hadData?'ready':e.kind==='unavailable'?'unavailable':'error';}emit();}
 async function readPage({append=false}={}){
  let ctx;try{ctx=context();}catch{return false;}
  if(state.loading||append&&(!state.hasMore||state.restartRequired))return false;
  const cursor=append?state.nextCursor:null;
  if(append&&(chainStarted===null||now()-chainStarted>=900000)){state.restartRequired=true;state.pageIssue={code:'P22_CURSOR_EXPIRED',kind:'restart'};emit();return false;}
  pageAbort?.abort();const controller=new AbortController();pageAbort=controller;const token=++epoch,query={...filters},hadData=state.kind==='ready';state.loading=true;state.pageIssue=null;emit();
  try{
   const page=await adapter.list(ctx.c,query,cursor,{signal:controller.signal});if(!valid(ctx.key,token))return false;
   const items=append?mergeP22Events(state.items,page.items):page.items;
   if(page.meta.total<items.length||page.meta.hasMore&&(page.meta.nextCursor===cursor||usedCursors.has(page.meta.nextCursor))||append&&page.meta.asOf!==state.asOf||append&&page.meta.timezone!==state.timezone)throw new NfcHistoryError('P22_CURSOR_CHAIN_INVALID');
   if(!append){usedCursors=new Set();chainStarted=now();}if(cursor!==null)usedCursors.add(cursor);
   state={...state,kind:'ready',items,total:page.meta.total,hasMore:page.meta.hasMore,nextCursor:page.meta.nextCursor,asOf:page.meta.asOf,timezone:page.meta.timezone,loading:false,pageIssue:null,restartRequired:false};emit();return true;
  }catch(e){if(!valid(ctx.key,token)||e.kind==='cancelled')return false;pageError(e,hadData,append);return false;}
  finally{if(token===epoch)pageAbort=null;}
 }
 return {
  snapshot(){try{context();}catch{}return structuredClone({...state,filters,loadedCount:state.items.length,activation:false});},
  validScope(){try{context();return true;}catch{return false;}},
  scopeKey(){try{return context().key;}catch{return ''; }},
  subscribe(f){listeners.add(f);return()=>listeners.delete(f);},
  first:()=>readPage(),more:()=>readPage({append:true}),retry:()=>readPage({append:state.pageIssue?.operation==='append'&&!state.restartRequired}),
  restart(){clear();emit();return readPage();},
  setFilters(input){const next=p22Filters(input);context();if(JSON.stringify(next)===JSON.stringify(filters))return Promise.resolve(false);clear();filters=next;return readPage();},
  async open(ref){
   let ctx;try{ctx=context();}catch{return false;}const token=++detailEpoch;detailAbort?.abort();pageAbort?.abort();epoch++;state.loading=false;const controller=new AbortController();detailAbort=controller;
   const opEpoch=epoch,pair=typeof ref==='string'?null:ref;
   if(!(pair?identity(pair.recordId)&&identity(pair.activityId):uuid(ref))){state.detail={kind:'not-found',event:null,ref:null,issue:{code:'P22_EVENT_ID_INVALID',kind:'not-found'}};emit();return false;}
   state.detail={kind:'loading',event:null,ref:pair||null};emit();
   try{const resolved=pair||await adapter.lookup(ctx.c,ref,{signal:controller.signal});if(token!==detailEpoch||!valid(ctx.key,opEpoch))return false;
    const target={recordId:resolved.recordId,activityId:resolved.activityId,...(resolved.eventId?{eventId:resolved.eventId}:{})};const result=await adapter.detail(ctx.c,target,{signal:controller.signal});if(token!==detailEpoch||!valid(ctx.key,opEpoch))return false;
    state.detail={kind:'ready',event:result.event,ref:target,meta:result.meta};emit();return true;
   }catch(e){if(token!==detailEpoch||!valid(ctx.key,opEpoch)||e.kind==='cancelled')return false;if(['auth','denied','context'].includes(e.kind)){clear();state.kind=e.kind;onGuard(issue(e));}state.detail={kind:e.kind==='not-found'?'not-found':e.kind==='unavailable'?'unavailable':e.kind||'error',event:null,ref:pair||null,issue:issue(e)};emit();return false;
   }finally{if(token===detailEpoch)detailAbort=null;}
  },
  closeDetail(){detailEpoch++;detailAbort?.abort();detailAbort=null;state.detail={kind:'idle',event:null,ref:null};},
  async summary(){let ctx;try{ctx=context();}catch{return false;}summaryAbort?.abort();const c=new AbortController();summaryAbort=c;const token=++summaryEpoch,key=epoch;try{const result=await adapter.summary(ctx.c,filters,{signal:c.signal});if(token!==summaryEpoch||!valid(ctx.key,key))return false;state.summary=result;emit();return true;}catch(e){if(token===summaryEpoch&&valid(ctx.key,key)&&['auth','denied','context'].includes(e.kind))pageError(e,false);return false;}finally{if(token===summaryEpoch)summaryAbort=null;}},
  cancel(){epoch++;detailEpoch++;summaryEpoch++;pageAbort?.abort();detailAbort?.abort();summaryAbort?.abort();pageAbort=detailAbort=summaryAbort=null;if(state.loading)state.pageIssue={code:'P22_READ_INTERRUPTED',kind:'interrupted'};state.loading=false;},
  async checkpoint(){context();const key=scopeKey,token=epoch,query=JSON.stringify(filters),eventRefs=state.items.map(e=>({recordId:e.recordId,activityId:e.activityId,eventId:e.eventId})),digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');const [scopeHash,queryHash]=await Promise.all([digest(key),digest(query)]);if(!valid(key,token))throw new NfcHistoryError('P22_CHECKPOINT_STALE','cancelled');return {contract:'p22-nfc-history-v1',activation:false,scopeHash,queryHash,eventRefs};},
  dispose(){clear();disposed=true;listeners.clear();scopeKey='';},
 };
}
