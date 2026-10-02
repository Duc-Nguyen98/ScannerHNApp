// Local preview outcomes ONLY: no server API, permission enum or hardware protocol.
import { createLookupFixtureAdapter } from '../lookup/fixture-adapter.mjs';
import { additionalDemoTags } from './demo-tags.mjs';
export const NFC_NAMESPACE='hn-scanner-nfc-fixture-v1';
export const DEMO_READ_TAGS=Object.freeze([
 {uid:'NFC-8A2F',id:'fixture-tag-8a2f',label:'Thẻ thử 1'},
 ...[20,21,22,23].map(n=>({uid:`NFC-DEMO-0${n}`,id:`fixture-tag-0${n}`,label:`TAG-0${n}`})),
]);
export const BOARD_PRODUCT={id:'fixture-nfc-serial-HN12345',code:'HN12345',name:'Máy in nhiệt XP-420B',sku:'XP-420B',serial:'HN12345',warehouseId:'fixture-hoa-nam'};
const clone=x=>structuredClone(x);
const normalize=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().trim();
export function createNfcFixtureAdapter({delay=450,scenario='ready',extended=false}={}) {
 const catalog=createLookupFixtureAdapter(),receipts=new Map();
 let mutations=0,reads=0;
 const rows=[
  {id:'fixture-tag-001',label:'TAG-001',uid:'NFC-OLD-001',status:'linked',product:clone(BOARD_PRODUCT),date:'09/09/2026 14:32'},
  {id:'fixture-tag-002',label:'TAG-002',uid:'NFC-3F7D9A',status:'unlinked',product:null,date:'09/09/2026 10:20'},
  {id:'fixture-tag-003',label:'TAG-003',uid:'NFC-OLD-003',status:'linked',product:{...BOARD_PRODUCT,id:'fixture-nfc-head-HN12346',code:'HN12346',serial:'HN12346',name:'Đầu in XP-420B'},date:'08/09/2026 16:15'},
  {id:'fixture-tag-004',label:'TAG-004',uid:'NFC-LOCK-004',status:'locked',product:{...BOARD_PRODUCT,id:'fixture-nfc-paper',name:'Giấy in nhiệt 80mm',serial:'PAPER-80',sku:'PAPER-80'},date:'08/09/2026 09:10'},
  {id:'fixture-tag-005',label:'TAG-005',uid:'NFC-OLD-005',status:'unlinked',product:{...BOARD_PRODUCT,id:'fixture-nfc-cable',name:'Cáp nguồn XP-420B',serial:'CABLE-01',sku:'CABLE-01'},date:'07/09/2026 14:08'},
 ];
 if(extended)rows.push(...additionalDemoTags());
 const scoped=s=>s?.warehouseId==='fixture-hoa-nam'&&!!s.actorId;
 const wait=signal=>new Promise((resolve,reject)=>{
  const abort=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);reject(new DOMException('Read cancelled','AbortError'));};
  const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},delay);
  if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
 });
 const find=uid=>rows.find(t=>t.uid===uid);
 const knownProduct=(scope,id)=>id===BOARD_PRODUCT.id?clone(BOARD_PRODUCT):catalog.item(scope,id);
 return {
  namespace:NFC_NAMESPACE,
  scenario:()=>scenario,
  setScenario(v){if(!['ready','unsupported','permission','read-error','conflict','locked','link-denied','failed','unknown'].includes(v))return false;scenario=v;return true;},
  capabilities:()=>({read:scenario!=='unsupported',link:scenario!=='link-denied',source:'FIXTURE'}),
  stats:()=>({reads,mutations}),
  readTags:scope=>scoped(scope)?DEMO_READ_TAGS.map(t=>({...t,status:find(t.uid)?.status||'unlinked',productName:find(t.uid)?.product?.name||null})):[],
  product:(scope,id)=>scoped(scope)?knownProduct(scope,id):null,
  list(scope,{query='',tab='all'}={}) {
   if(!scoped(scope))return {items:[],counts:{},status:'denied',source:'FIXTURE'};
   const q=normalize(query);
   const counts=extended?{all:rows.length,linked:rows.filter(t=>t.status==='linked').length,unlinked:rows.filter(t=>t.status==='unlinked').length}:{all:8+mutations,linked:5+mutations,unlinked:2};
   return {items:clone(rows.filter(t=>(tab==='all'||t.status===tab)&&[t.label,t.uid,t.product?.code,t.product?.name,t.product?.serial,t.product?.sku].some(v=>normalize(v).includes(q)))),counts,partial:!extended,status:'ready',source:'FIXTURE'};
  },
  detail:(scope,id)=>scoped(scope)?clone(rows.find(t=>t.id===id)||null):null,
  mapping(scope,uid){return scoped(scope)?clone(find(uid)||null):null;},
  async read(scope,selectedUid='NFC-8A2F',{signal,onListening=()=>{}}={}){
   if(!scoped(scope)||scenario==='unsupported')return {kind:'unsupported'};
   if(!DEMO_READ_TAGS.some(t=>t.uid===selectedUid))return {kind:'read-error'};
   reads++;const mode=scenario;
   try{if(mode!=='permission'&&!signal?.aborted)onListening(true);await wait(signal);}finally{onListening(false);}
   if(mode==='permission')return {kind:'permission'};
   if(mode==='read-error')return {kind:'read-error'};
   const uid=mode==='conflict'?'NFC-OLD-003':mode==='locked'?'NFC-LOCK-004':selectedUid;
   return {kind:'fixture-read',uid,tagId:find(uid)?.id||DEMO_READ_TAGS.find(t=>t.uid===uid)?.id,readAt:'09/09/2026 14:32',warehouseId:scope.warehouseId};
  },
  async link(scope,request){
   const mode=scenario;await wait();
   if(!scoped(scope)||!knownProduct(scope,request.itemId)||mode==='link-denied')return {kind:'denied'};
   if(receipts.has(request.requestId))return clone(receipts.get(request.requestId));
   if(mode==='failed')return {kind:'failed'};
   const old=find(request.uid);
   if(old?.status==='locked')return {kind:'locked'};
   if(old?.status==='linked'&&old.product?.id!==request.itemId)return {kind:'conflict',tagId:old.id};
   if(old?.status==='linked')return {kind:'already-linked',tagId:old.id};
   if(old&&old.id!==request.tagId)return {kind:'unknown'};
   const product=knownProduct(scope,request.itemId);
   const receipt={kind:'fixture-confirmed',namespace:NFC_NAMESPACE,requestId:request.requestId,tagId:request.tagId,uid:request.uid,itemId:request.itemId,warehouseId:scope.warehouseId,actorId:scope.actorId,actor:clone(scope.actor),warehouseName:scope.warehouseName,linkedAt:'09/09/2026 14:32',product};
   if(old?.status!=='linked'){
    const tag={id:request.tagId,label:old?.label||request.uid,uid:request.uid,status:'linked',product,date:receipt.linkedAt,receipt:clone(receipt)};
    if(old)Object.assign(old,tag);else rows.push(tag);
    mutations++;
   }
   receipts.set(request.requestId,receipt);
   return mode==='unknown'?{kind:'unknown'}:clone(receipt);
  },
  async reconcile(scope,request){await wait();return scoped(scope)&&receipts.get(request.requestId)?.actorId===scope.actorId?clone(receipts.get(request.requestId)):{kind:'unknown'};},
 };
}
