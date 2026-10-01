import '../shared/history-fixtures.js';
export const DATA=globalThis.HN_HISTORY_FIXTURES;
export const initialFilters=(scope='all')=>({q:'',type:'all',from:'',to:'',status:'all',sort:'source',scope:scope==='documents'?'documents':'all'});
export const inHistoryScope=(record,scope)=>scope!=='documents'||['inbound','outbound'].includes(record.type);
const fold=s=>String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/gi,'d').toLowerCase();
export function selectRecords(filters,source=DATA.records){
  const rows=source.filter(r=>inHistoryScope(r,filters.scope)&&(filters.type==='all'||r.type===filters.type)&&(!filters.from||r.day>=filters.from)&&(!filters.to||r.day<=filters.to)&&(filters.status==='all'||r.status===filters.status)&&fold([r.id,r.documentId,r.serial,r.actor].join(' ')).includes(fold(filters.q.trim())));
  if(filters.sort!=='source')rows.sort((a,b)=>(a.occurredAt.localeCompare(b.occurredAt)||a.id.localeCompare(b.id))*(filters.sort==='asc'?1:-1));
  return rows;
}
export function readDay(day,{available=true,source=DATA.records}={}){
  if(!available||!Object.hasOwn(DATA.scopes,day))return {day,available:false,total:null,groups:null};
  const rows=[...new Map(source.filter(r=>r.day===day).map(r=>[r.activityId,r])).values()];
  return {day,available:true,total:rows.length,groups:Object.fromEntries(Object.keys(DATA.names).map(type=>[type,rows.filter(r=>r.type===type).length])),definition:DATA.reportingDefinition};
}
export function scanCounts(session){
  if(!session)return null;
  if(!session.events.length)return {total:session.total,accepted:session.accepted,duplicate:session.duplicate,quantity:session.quantity};
  const events=[...new Map(session.events.map(e=>[e.id,e])).values()];
  return {total:events.length,accepted:events.filter(e=>e.result==='accepted').length,duplicate:events.filter(e=>e.result==='duplicate').length,quantity:events.filter(e=>e.result==='accepted').reduce((n,e)=>n+e.quantity,0)};
}
export function readRange(filters,{available=true,source=DATA.records}={}){
  const coveredDays=[...new Set([...Object.keys(DATA.scopes),...source.map(r=>r.day).filter(Boolean)])].filter(day=>(!filters.from||day>=filters.from)&&(!filters.to||day<=filters.to));
  if(!available||!coveredDays.length)return {available:false,total:null,groups:null};
  const rows=[...new Map(selectRecords(filters,source).map(r=>[r.activityId,r])).values()];
  return {available:true,total:rows.length,groups:Object.fromEntries(Object.keys(DATA.names).map(type=>[type,rows.filter(r=>r.type===type).length]))};
}
export const readRecord=id=>DATA.records.find(r=>r.id===id)||null;
export const readSession=id=>DATA.sessions.find(s=>s.id===id)||null;
export const dayLabel=day=>day?day.split('-').reverse().join('/'):'—';
