import {P14ApiError,requireP14,scopeKey,DRAFT_SCOPE,knownEndRejection} from './api-contract.mjs';
import {inspectOwners,saveDirtyOwners} from './owner-boundary.mjs';
const clone=v=>structuredClone(v);
const summaryIdentity=s=>JSON.stringify([s.contract,s.shift_id,s.warehouse_id,s.started_at,s.ended_at,s.immutable,s.kpis,s.draft_snapshot.scope,s.draft_snapshot.owner_unchanged,s.draft_snapshot.total,s.draft_snapshot.per_page,s.draft_snapshot.last_page]);

// Secrets stay in the client closure. Partial SAVE remains a close blocker even
// when an owner incorrectly labels its live row CLEAN after an unverified save.
export function createP14PreparedSource({client,kind,getInventory=()=>null,saveOwner=async()=>({verified:false}),reconcileOwners=null,shiftState=null,refreshCurrent=null,onSystemError=()=>{}}){
 requireP14(['MOCK_PREPARATION','DEV_TEST'].includes(client?.mode)&&['recovery','shift'].includes(kind),'ACTIVATION_OFF');
 let disposed=false,busy=false,processing=null,pending=null,receipt=null,endRequest=null,endReceipt=null;
 let summary=null,summaryKey=null,close=null,localRevision=null,error=null,checkEpoch=0,summaryEpoch=0;
 const saveBlockers=new Map();
 const listeners=new Set();
 const notify=()=>{for(const listener of listeners)listener();};
 const unsubscribeShift=shiftState?.subscribe(notify);
 const owners=()=>{
  const value=inspectOwners(getInventory(),client.context());
  if(saveBlockers.size){value.blockers.push(...[...saveBlockers.values()].map(r=>'OWNER_SAVE_UNCONFIRMED:'+r.owner));value.localState='UNKNOWN';}
  return value;
 };
 const uiRecord=r=>({operation:(['INBOUND','OUTBOUND','WARRANTY','COMPONENT_ISSUE'].includes(r.operation)?r.operation.toLowerCase():'documents'),owner:r.owner,state:r.state,unknown:r.state==='UNKNOWN',busy:r.state==='BUSY',document:{documentId:r.id,number:r.snapshot.title||r.id,scanSessionId:r.snapshot.scan_session_id,version:r.version,actorId:r.actorId,authSessionId:r.authSessionId,warehouseId:r.warehouseId}});
 const summaryRecords=value=>value?.draft_snapshot.items.map(r=>({operation:r.operation.toLowerCase(),source:'SERVER_SNAPSHOT',document:{documentId:r.document_id,number:r.title||r.document_id,scanSessionId:r.scan_session_id,version:r.version,actorId:r.actor_id,authSessionId:r.auth_session_id,warehouseId:r.warehouse_id}}))||[];
 const invalidate=()=>{checkEpoch++;close=null;localRevision=null;client.invalidateCheck();};
 function beginClose(){if(kind!=='shift'||!shiftState)return;try{if(shiftState.snapshot().phase==='ACTIVE')shiftState.beginClose();}catch(e){error=e;}}
 const captureScope=()=>kind==='shift'?client.contextKey({active:!endReceipt&&pending!=='end'}):null;
 function snap(){
  let i=null,c=null,key=null;
  try{if(kind==='shift'){const value=client.context();key=scopeKey(value,{active:!endReceipt&&pending!=='end'});requireP14(!endReceipt||value.actorId===endRequest.actorId&&value.warehouseId===endRequest.warehouseId,'END_RECEIPT_MISMATCH');c=value;if(!endReceipt)i=owners();}}
  catch{c=null;i={localState:'UNKNOWN',revision:'unavailable',records:[],blockers:['AUTH_CONTEXT_REQUIRED']};}
  if(close&&(!client.checkReady()||i&&localRevision!==i.revision))invalidate();
  const visibleSummary=c&&summaryKey===key?summary:null;
  const visibleRows=c&&i?i.records.filter(r=>r.kind!=='NFC_CONFIRMATION'&&r.actorId===c.actorId&&r.authSessionId===c.authSessionId&&r.warehouseId===c.warehouseId):[];
  const aggregate={inbound:null,outbound:null,warranty:null,nfc:null,documents:null,total:null};
  return {
   candidate:true,kind,busy,processing,usernameInput:client.recoveryPending()?.username||'',pending:pending?{action:pending}:null,error:error?.code||null,
   recovery:receipt?{id:receipt.operation_id,time:receipt.received_at,expiresAt:receipt.expires_at,request:{username:client.recoveryPending().username},accountAccessGranted:false}:null,
   ended:!!endReceipt,
   summary:endReceipt&&c?{id:endReceipt.summary_id,time:endReceipt.ended_at,aggregate,request:{shift:{actor:{name:c.actorName??'Chưa xác minh',role:c.actorRole??'Chưa xác minh'},warehouse:{name:c.warehouseName??'Chưa xác minh'},startedAt:visibleSummary?.started_at||c.startedAt},records:summaryRecords(visibleSummary)},serverSummary:visibleSummary?clone(visibleSummary):null,draftTotal:visibleSummary?.draft_snapshot.total??null,draftScope:DRAFT_SCOPE}:null,
   records:visibleRows.map(uiRecord),unsaved:visibleRows.filter(r=>r.state!=='CLEAN'||!r.receiptVerified).map(uiRecord),
   activeAuthSessionId:c?.authSessionId??null,inventoryComplete:!!i&&!i.blockers.some(b=>/^(OWNER_INVENTORY_|AUTH_CONTEXT_|OWNER_SCOPE_MISMATCH)/.test(b)),scopeValid:kind==='recovery'||!!c,ownerBlockers:i?.blockers||[],serverBlockers:close?.blockers||[],
   ownerCanReconcile:!!reconcileOwners&&!!i?.pendingRequestIds?.length,lifecycle:c?.lifecycle??null,canEnd:(!shiftState||shiftState.snapshot().phase==='CLOSING'&&c?.lifecycle?.end_supported===true)&&!!close?.can_end&&client.checkReady()&&i?.localState==='CLEAN'&&!pending&&!busy,
   needsCloseCheck:kind==='shift'&&!close&&!pending&&!busy&&!endReceipt,
   summaryReady:!!visibleSummary,summaryError:error?.code||null,kpiMappingPending:true,
  };
 }
 async function fetchSummary(page=1){
  requireP14(endReceipt,'END_RECEIPT_REQUIRED');const ticket=++summaryEpoch,key=captureScope();
  const value=await client.summary(endReceipt.summary_id,{page});
  requireP14(!disposed&&ticket===summaryEpoch&&key===captureScope(),'STALE_RESULT');
  requireP14(value.ended_at===endReceipt.ended_at,'END_RECEIPT_MISMATCH');
  requireP14(value.draft_snapshot.items.every(r=>r.auth_session_id===endRequest.authSessionId),'END_RECEIPT_MISMATCH');
  return {value,key};
 }
 async function readSummary(){
  const {value,key}=await fetchSummary();
  if(summary){
   requireP14(summaryIdentity(value)===summaryIdentity(summary),'IMMUTABLE_SUMMARY_CHANGED');
   requireP14(JSON.stringify(value.draft_snapshot.items)===JSON.stringify(summary.draft_snapshot.items.slice(0,value.draft_snapshot.per_page)),'IMMUTABLE_SUMMARY_CHANGED');
   summaryKey=key;return summary;
  }
  summary=value;summaryKey=key;return value;
 }
 async function run(action,username=''){
  if(disposed||busy)return {kind:'guarded'};
  let key;try{key=captureScope();}catch(e){error=e;invalidate();return {kind:'candidate-error',code:e.code};}
  busy=true;processing=action;error=null;
  try{
   if(kind==='recovery'){
    requireP14(action==='recovery'||action==='check','INVALID_ACTION');let value;
    if(action==='recovery'){client.prepareRecovery(username);pending='recovery';value=await client.submitRecovery();}
    else{requireP14(pending,'RECOVERY_REQUEST_REQUIRED');value=await client.checkRecovery();}
    requireP14(!disposed,'STALE_RESULT');receipt=value;pending=null;
    return {kind:'verified',request:{action:'recovery'},id:receipt.operation_id};
   }
   if(['save','close-check','end','reconcile-owners'].includes(action)&&shiftState){beginClose();if(action==='end')shiftState.assertCloseScope();}
   if(action==='reconcile-owners'){requireP14(!pending&&!endReceipt&&typeof reconcileOwners==='function','OWNER_RECONCILE_UNAVAILABLE');invalidate();const value=await reconcileOwners();requireP14(!disposed&&key===captureScope(),'STALE_RESULT');return value.inventory.localState==='CLEAN'?{kind:'candidate-reconciled'}:{kind:'candidate-partial-save',results:value.results};}
   if(action==='save'){
    shiftState?.assertOwnerMutation({command:'SAVE',existing:true});
    requireP14(!pending&&!endReceipt,'END_REQUEST_LOCKED');invalidate();
    const value=await saveDirtyOwners({getInventory,getContext:()=>client.context(),saveOwner});
    requireP14(!disposed&&key===captureScope(),'STALE_RESULT');
    for(const r of value.results){const id=r.owner+':'+r.id;if(r.outcome==='VERIFIED')saveBlockers.delete(id);else saveBlockers.set(id,r);}
    return owners().localState==='CLEAN'&&value.results.every(r=>r.outcome==='VERIFIED')?{kind:'verified',request:{action:'save'}}:{kind:'candidate-partial-save',results:value.results};
   }
   if(action==='close-check'){
    requireP14(!pending&&!endReceipt,'END_REQUEST_LOCKED');invalidate();
    if(shiftState){requireP14(shiftState.snapshot().phase==='CLOSING','SHIFT_CLOSE_NOT_REQUESTED');if(refreshCurrent){const authKey=client.contextKey({active:false}),epoch=checkEpoch;await refreshCurrent();requireP14(authKey===client.contextKey({active:false}),'STALE_CONTEXT');requireP14(!disposed&&epoch===checkEpoch,'STALE_RESULT');key=captureScope();}shiftState.assertCloseScope();}
    const i=owners();requireP14(i.localState==='CLEAN','LOCAL_WORK_PENDING');
    const ticket=++checkEpoch,value=await client.closeCheck();
    requireP14(!disposed&&ticket===checkEpoch&&key===captureScope(),'STALE_RESULT');requireP14(owners().revision===i.revision,'LOCAL_STATE_CHANGED');
    close=value;localRevision=i.revision;return {kind:'candidate-check',canEnd:value.can_end,blockers:value.blockers};
   }
   if(action==='summary'){await readSummary();return {kind:'candidate-summary'};}
   requireP14(action==='end'||action==='check','INVALID_ACTION');let value;
   if(action==='end'){
    requireP14(!pending&&!endReceipt,'END_REQUEST_LOCKED');const i=owners();requireP14(i.localState==='CLEAN'&&close?.can_end&&i.revision===localRevision,'LOCAL_WORK_PENDING');
    endRequest=client.prepareEnd({localState:i.localState,pendingRequestIds:i.pendingRequestIds,localRevision:i.revision});shiftState?.captureEnd(endRequest);pending='end';value=await client.end(endRequest.requestId,i.revision);
   }else{requireP14(pending==='end'&&endRequest,'END_REQUEST_REQUIRED');value=await client.checkEnd(endRequest.requestId);}
   requireP14(!disposed&&key===client.contextKey({active:action==='end'}),'STALE_RESULT');shiftState?.confirmEnd(value);endReceipt=value;pending=null;invalidate();
   try{await readSummary();}catch(e){error=e;onSystemError({code:e.code,status:e.status,provenance:e.provenance,panel:e.panel});}
   return {kind:'verified',request:{action:'end'},id:endReceipt.summary_id};
  }catch(e){
   error=e instanceof P14ApiError?e:new P14ApiError('UNVERIFIED_OWNER_RESULT');
   if(action==='close-check'||action==='save'||action==='end'&&!pending)invalidate();
   if(kind==='recovery')pending=client.recoveryPending()?.attempted?'recovery':null;
   if(pending==='end'&&action==='end'&&knownEndRejection(error)){pending=null;shiftState?.rejectEnd();invalidate();}
   if([401,403].includes(error.status)){summary=null;summaryKey=null;}
   if([401,403].includes(error.status))onSystemError({code:error.code,status:error.status,provenance:error.provenance,panel:error.panel});
   return {kind:'candidate-error',code:error.code,status:error.status,unknown:!!pending};
  }finally{busy=false;processing=null;}
 }
 return {
  candidate:true,mode:client.mode,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},beginClose,cancelClose(){invalidate();shiftState?.cancelClose();},snapshot:snap,run,check:()=>run('check'),invalidate,
  async moreSummary(){
   if(busy||disposed||!summary||summary.draft_snapshot.page>=summary.draft_snapshot.last_page)return {kind:'guarded'};
   busy=true;processing='summary';error=null;const old=summary,oldKey=summaryKey;
   try{
    requireP14(oldKey===captureScope(),'STALE_CONTEXT');const {value,key}=await fetchSummary(old.draft_snapshot.page+1);
    requireP14(summaryIdentity(value)===summaryIdentity(old),'IMMUTABLE_SUMMARY_CHANGED');
    const ids=new Set(old.draft_snapshot.items.map(r=>r.document_id)),sessions=new Set([...old.draft_snapshot.items,...value.draft_snapshot.items].map(r=>r.auth_session_id));
    requireP14(value.draft_snapshot.items.every(r=>!ids.has(r.document_id))&&sessions.size<=1,'DUPLICATE_SNAPSHOT_PAGE');
    summary={...value,draft_snapshot:{...value.draft_snapshot,items:[...old.draft_snapshot.items,...value.draft_snapshot.items]}};summaryKey=key;return {kind:'candidate-summary'};
   }catch(e){error=e;if([401,403].includes(e.status)){summary=null;summaryKey=null;onSystemError({code:e.code,status:e.status,provenance:e.provenance,panel:e.panel});}return {kind:'candidate-error',code:e.code};}finally{busy=false;processing=null;}
  },
  resumeSession(){invalidate();return !pending;},
  deactivate(){invalidate();summaryEpoch++;client.cancelReads();},
  dispose(){disposed=true;unsubscribeShift?.();listeners.clear();invalidate();summaryEpoch++;client.dispose();},
 };
}
