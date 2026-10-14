import {requireP14,scopeKey,uuid} from './api-contract.mjs';
import {REQUIRED_OWNER_INVENTORY,inspectOwners,prepareOwnerCorrelation,fenceRoute} from './owner-boundary.mjs';
const clone=v=>structuredClone(v);
export function createP14OwnerRegistry({shiftState}){
 const adapters=new Map(),legacyJournal=new Map();
 function inventory(){
  const covered=[],records=[],journal=[];
  for(const [owner,adapter] of adapters){
   let value;try{value=adapter.inventory();}catch{continue;}
   if(value?.complete===true&&Array.isArray(value.records)&&Array.isArray(value.journal)){covered.push(owner);records.push(...value.records.map(r=>({...clone(r),owner})));journal.push(...clone(value.journal).map(j=>({...j,owner})));}
  }
  for(const j of [...journal,...records.flatMap(r=>r.journal.map(j=>({...j,owner:r.owner})))])if(j.httpStatus===202||j.response_status===202||['PENDING_OWNER_RESULT','UNSUPPORTED_OWNER_SAVE'].includes(j.classification||j.operation)){const key=JSON.stringify([j.owner,j.requestId,j.classification||j.operation,j.httpStatus||j.response_status]);if(!legacyJournal.has(key))legacyJournal.set(key,clone(j));}
  const retained=[...legacyJournal.values()];
  return {covered,records,journal:[...journal,...retained.filter(j=>!journal.some(x=>JSON.stringify(x)===JSON.stringify(j)))],lifecycleEvidenceRequired:true};
 }
 return {
  register(owner,adapter){requireP14(REQUIRED_OWNER_INVENTORY.includes(owner)&&!adapters.has(owner)&&typeof adapter?.inventory==='function','OWNER_ADAPTER_REQUIRED');adapters.set(owner,adapter);const unsubscribe=adapter.subscribe?.(()=>shiftState.localStateChanged());return ()=>{unsubscribe?.();adapters.delete(owner);shiftState.localStateChanged();};},
  inventory,
  open(row){const c=shiftState.context(),id=row?.document?.documentId,r=inventory().records.find(r=>r.owner===row.owner&&r.id===id);requireP14(r&&r.actorId===c.actorId&&r.authSessionId===c.authSessionId&&r.warehouseId===c.warehouseId&&r.version===row.document.version,'OWNER_RESUME_IDENTITY_MISMATCH');const adapter=adapters.get(r.owner);requireP14(typeof adapter?.open==='function','OWNER_RESUME_UNAVAILABLE');return adapter.open(clone(r));},
  async save(owner,row){const adapter=adapters.get(owner),captured=clone(row);requireP14(typeof adapter?.save==='function','OWNER_SAVE_UNAVAILABLE');shiftState.assertOwnerMutation({command:'SAVE',existing:true});try{return await adapter.save(captured);}finally{shiftState.localStateChanged();}},
  async reconcile(){
   const c=shiftState.context(),scope=scopeKey(c,{active:false}),before=inventory(),results=[];
   // Only the native owner may read/consume its original request evidence.
   // Historical 202/unsupported journal entries are never cleared here.
   for(const j of [...before.journal,...before.records.flatMap(r=>r.journal.map(j=>({...j,owner:r.owner,id:r.id})))] ){
    if(j.outcome!=='UNKNOWN'&&!j.inflight)continue;
    requireP14(scope===scopeKey(shiftState.context(),{active:false}),'STALE_CONTEXT');
    const adapter=adapters.get(j.owner);
    if(typeof adapter?.reconcile!=='function'||!(j.owner==='P07'?typeof j.requestId==='string'&&j.requestId.length>0&&j.requestId.length<=128&&!/[\x00-\x1f\x7f]/.test(j.requestId):uuid(j.requestId))){results.push({owner:j.owner,outcome:'UNAVAILABLE'});continue;}
    try{const result=await adapter.reconcile(clone(j));results.push({owner:j.owner,requestId:j.requestId,outcome:result?.verified===true?'VERIFIED':'UNKNOWN'});}catch{results.push({owner:j.owner,requestId:j.requestId,outcome:'UNKNOWN'});}
   }
   requireP14(scope===scopeKey(shiftState.context(),{active:false}),'STALE_CONTEXT');
   return {results,inventory:inspectOwners(inventory(),shiftState.context())};
  },
  // Owner integrations use this seam before every non-safe request. It never
  // installs a global fence or changes a native writer/receipt schema.
  wrapTransport(transport,{owner,getIntent}){
   requireP14(adapters.has(owner)&&typeof transport?.request==='function'&&typeof getIntent==='function','OWNER_ADAPTER_REQUIRED');
   return {...transport,async request(url,options){
    const path=new URL(url,'https://p14.invalid').pathname,rule=fenceRoute(options.method||'GET',path);
    if(!rule.applies)return transport.request(url,options);
    const intent=getIntent();shiftState.assertOwnerMutation(intent);
    const c=shiftState.context();requireP14(uuid(intent?.requestId),'SHIFT_COMMAND_IDENTITY_REQUIRED');
    const prepared=prepareOwnerCorrelation({method:options.method,path,headers:options.headers,body:options.body},c,{requestId:intent.requestId,preparation:true});
    return transport.request(url,{...options,headers:prepared.request.headers});
   }};
  },
 };
}
