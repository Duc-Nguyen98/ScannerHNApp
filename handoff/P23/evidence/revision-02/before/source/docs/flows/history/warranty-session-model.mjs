// Read presentation only. This is not a backend schema or permission proposal.
import {sessionGuard} from '../home/home-flow.mjs';
import {readWarrantyCases} from '../shared/warranty-cases.mjs';
import {validQueryDate} from '../shared/query-date-policy.mjs';
export const SESSION_TYPES=['Nhập kho','Xuất linh kiện','Tra cứu'];
export const historyScope=s=>!sessionGuard(s)&&s.session.actor?.id&&s.session.warehouse?.id?JSON.stringify([s.session.actor.id,s.session.warehouse.id]):'';
export const newFilters=()=>({q:'',type:'all',status:'all',from:'',to:'',sort:'desc'});
export const textValue=v=>typeof v==='string'&&v.trim()?v:null;
export const countValue=v=>Number.isSafeInteger(v)&&v>=0?v:null;
export const findExact=(rows,id)=>rows.find(r=>r.id===id)||null;
export function warrantyRows(){return readWarrantyCases();}
export function caseEvents(row){const seen=new Set();return (Array.isArray(row?.events)?row.events:[]).filter(e=>textValue(e.id)&&!seen.has(e.id)&&seen.add(e.id)).slice().reverse();}
const fold=s=>String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/gi,'d').toLowerCase();
export function selectRows(rows,f,kind){return rows.filter(r=>(f.type==='all'||(kind==='warranty'?r.status:r.type)===f.type)&&(f.status==='all'||r.status===f.status)&&(!f.from||(validQueryDate(r.day)&&r.day>=f.from))&&(!f.to||(validQueryDate(r.day)&&r.day<=f.to))&&fold(kind==='warranty'?[r.id,r.serial].join(' '):[r.id,r.doc].join(' ')).includes(fold(f.q.trim()))).slice().sort((a,b)=>String(b.day||'').localeCompare(String(a.day||''))||String(b.time||'').localeCompare(String(a.time||''))||b.id.localeCompare(a.id));}
export function normalizeSessions(result,warehouseId){
 if(result?.available!==true||result?.confirmed!==true||!Array.isArray(result.items))return {kind:'unavailable',items:[]};
 const items=[],ids=new Set();
 for(const row of result.items){
  if(!textValue(row?.id)||row.warehouseId!==warehouseId||!SESSION_TYPES.includes(row.type)||row.confirmed!==true)return {kind:'unavailable',items:[]};
  if(ids.has(row.id))continue;ids.add(row.id);
  const r={id:row.id,type:row.type,warehouseId};
  for(const key of ['day','time','actor','warehouse','doc','caseId','sessionStatus'])r[key]=textValue(row[key]);
  for(const key of ['accepted','rejected','duplicate','quantity'])r[key]=countValue(row[key]);
  // Completion is not proof of posting; only confirmed operation result is used.
  r.status=row.type==='Xuất linh kiện'&&row.result==='POSTED'&&r.doc?'Đã xuất':row.type==='Nhập kho'&&row.result==='RECORDED'&&r.doc?'Chờ xử lý trên Web':row.type==='Tra cứu'&&row.result==='ENDED'?'Đã kết thúc':'Chưa xác minh kết quả';
  if(r.type==='Tra cứu'){r.doc=null;r.quantity=null;}
  if(r.type!=='Xuất linh kiện'||r.status!=='Đã xuất')r.quantity=null;
  const events=[],eventIds=new Set();
  for(const e of Array.isArray(row.events)?row.events:[]){
   if(!textValue(e?.id)||e.sessionId!==r.id||!['accepted','rejected','duplicate'].includes(e.result))return {kind:'unavailable',items:[]};
   if(eventIds.has(e.id))continue;eventIds.add(e.id);
   events.push({id:e.id,sessionId:e.sessionId,code:textValue(e.code),time:textValue(e.time),result:e.result,quantity:countValue(e.quantity)});
  }
  r.events=events;r.eventsKnown=Array.isArray(row.events);items.push(r);
 }
 return {kind:'ready',items,complete:result.complete===true};
}
