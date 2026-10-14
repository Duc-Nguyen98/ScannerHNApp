import {auditDay} from './nfc-audit-model.mjs';
export function removeAuditFilter(filters,key){
  const next={...filters};
  if(key==='q')next.q='';
  if(key==='type')next.type='all';
  if(key==='status')next.status='all';
  if(key==='date'){next.from='';next.to='';}
  return next;
}
export function auditCopyText(event,kind){
  if(!event)return null;
  if(['uid','previousUid','serial'].includes(kind))return typeof event[kind]==='string'&&event[kind]?event[kind]:null;
  if(kind!=='bundle')return null;
  const rows=[['Mã sự kiện',event.id],['Loại thao tác',event.type],['UID thẻ',event.uid],['UID trước đó',event.previousUid],['Serial sản phẩm',event.serial],['Thời điểm',auditDay(event)?`${event.day} ${event.time} (UTC+7)`:null],['Kho',event.warehouse]];
  return rows.filter(([,v])=>typeof v==='string'&&v.length).map(([k,v])=>`${k}: ${v}`).join('\n');
}
export function auditReadState(previous,next,{preserve=false}={}){
  if(preserve&&previous.kind==='ready'&&next.kind!=='ready')return {...previous,refreshing:next.kind==='loading',readIssue:next.kind==='loading'?'loading':next.kind};
  return next;
}
