// Presentation contract only; not a proposed backend endpoint or enum mapping.
import {sessionGuard} from '../home/home-flow.mjs';
import {validQueryDate} from '../shared/query-date-policy.mjs';
export const AUDIT_TYPES=['Gán thẻ','Thay thẻ','Thu hồi thẻ'];
export const auditFilters=()=>({q:'',type:'all',status:'all',from:'',to:'',sort:'desc'});
export function auditScope(state){
  if(sessionGuard(state)||!state.session.actor?.id||!state.session.warehouse?.id)return null;
  return {actorId:state.session.actor.id,warehouseId:state.session.warehouse.id};
}
export const scopeKey=s=>s?JSON.stringify([s.actorId,s.warehouseId]):'';
export function normalizeAudit(result,scope){
  if(!scope||result?.available!==true||result?.confirmed!==true||!Array.isArray(result.items))return {kind:'unavailable',items:[]};
  const items=[],ids=new Set();
  for(const e of result.items){
    if(!e||typeof e.id!=='string'||!e.id||e.confirmed!==true||e.warehouseId!==scope.warehouseId||!AUDIT_TYPES.includes(e.type)||!['Thành công','Đã thu hồi'].includes(e.status))return {kind:'unavailable',items:[]};
    if(ids.has(e.id))continue;
    ids.add(e.id);items.push({...e});
  }
  return {kind:'ready',items,complete:result.complete===true};
}
export const auditDay=e=>validQueryDate(e.day)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)?e.day:null;
const fold=s=>String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/gi,'d').toLowerCase();
export function selectAudit(items,f){
  const q=fold(f.q.trim());
  return items.filter(e=>(f.type==='all'||e.type===f.type)&&(f.status==='all'||e.status===f.status)&&(!f.from||(auditDay(e)&&e.day>=f.from))&&(!f.to||(auditDay(e)&&e.day<=f.to))&&fold([e.uid,e.previousUid,e.serial].join(' ')).includes(q)).sort((a,b)=>((auditDay(b)||'').localeCompare(auditDay(a)||'')||String(b.time).localeCompare(String(a.time))||b.id.localeCompare(a.id)));
}
export const findAudit=(items,id)=>items.find(e=>e.id===id)||null;
