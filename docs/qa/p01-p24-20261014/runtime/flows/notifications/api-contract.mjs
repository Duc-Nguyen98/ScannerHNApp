export const P13_RELEASE=Object.freeze({backend:'c7a3ea35a489e0cc6ae6de6caf1440bd79b70dbf',contract:'p13-notifications-v1',status:'PENDING_TEST_AND_DEPLOYMENT',productionActivation:false});
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class P13ApiError extends Error{
 constructor(code,message='Chưa xác minh được nguồn thông báo.',status=0){super(message);this.name='P13ApiError';this.code=code;this.status=status;}
}
export const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export const integer=v=>Number.isSafeInteger(v)&&v>=0;
export const uuid=v=>typeof v==='string'&&UUID.test(v);
export function requireP13(ok,code='INVALID_RESPONSE',message){if(!ok)throw new P13ApiError(code,message);}
const nullableText=v=>v===null||typeof v==='string';
export const isoTime=v=>{
 if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v)||!Number.isFinite(Date.parse(v)))return false;
 const day=v.slice(0,10),clock=v.slice(11,19).split(':').map(Number);
 return new Date(day+'T00:00:00Z').toISOString().slice(0,10)===day&&clock[0]<=23&&clock[1]<=59&&clock[2]<=59;
};
export function listQuery(input={}){
 requireP13(record(input)&&Object.keys(input).every(k=>['cursor','per_page','unread','severity'].includes(k)),'INVALID_QUERY');
 const query={cursor:input.cursor===undefined?'start':input.cursor,per_page:input.per_page===undefined?10:input.per_page};
 requireP13(typeof query.cursor==='string'&&query.cursor.length>0&&query.cursor.length<=4096&&integer(query.per_page)&&query.per_page>=1&&query.per_page<=100,'INVALID_QUERY');
 if(input.unread!==undefined){requireP13([0,1].includes(input.unread),'INVALID_QUERY');query.unread=input.unread;}
 if(input.severity!==undefined){requireP13(['info','warning','critical'].includes(input.severity),'INVALID_QUERY');query.severity=input.severity;}
 return query;
}
export function envelope(body){requireP13(record(body)&&body.success===true&&record(body.meta)&&body.meta.contract===P13_RELEASE.contract&&Object.hasOwn(body,'data'));return body;}
export function parseRecipient(raw,expectedId=null){
 requireP13(record(raw)&&uuid(raw.id)&&(!expectedId||raw.id.toLowerCase()===expectedId.toLowerCase()),'RECIPIENT_MISMATCH');
 for(const key of ['notification_id','event_key','title','body','severity','source_module','subject_type','subject_id','actor_id','actor_name','created_at','read_at'])requireP13(Object.hasOwn(raw,key)&&nullableText(raw[key]));
 for(const key of ['notification_id','actor_id','subject_id'])requireP13(raw[key]===null||uuid(raw[key]));
 requireP13(raw.created_at===null||isoTime(raw.created_at));requireP13(raw.read_at===null||isoTime(raw.read_at),'INVALID_READ_STATE');
 requireP13(Object.hasOwn(raw,'payload')&&(raw.payload===null||record(raw.payload)||Array.isArray(raw.payload)));
 requireP13(raw.payload_semantics==='EVENT_SNAPSHOT_NOT_AUTHORIZATION'&&record(raw.subject)&&raw.subject.requires_subject_revalidation===true&&raw.subject.web_url===null&&raw.subject.web_url_status==='NOT_CONFIGURED','SUBJECT_CONTRACT_PENDING');
 // No enum/type/warehouse/permission is inferred from title, prefixes or event snapshots.
 const created=raw.created_at===null?null:new Date(raw.created_at),parts=created?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(created):[];
 const part=k=>parts.find(p=>p.type===k)?.value;
 return {...structuredClone(raw),id:raw.id.toLowerCase(),description:raw.body,actor:raw.actor_name,warehouse:null,warehouseId:null,type:null,documentId:null,day:created?`${part('year')}-${part('month')}-${part('day')}`:null,time:created?`${part('hour')}:${part('minute')}`:null,read:raw.read_at!==null};
}
export function parsePage(body,query){
 const b=envelope(body),m=b.meta;requireP13(Array.isArray(b.data)&&b.data.length<=query.per_page&&m.pagination_mode==='keyset'&&m.per_page===query.per_page&&typeof m.has_more==='boolean'&&integer(m.total)&&isoTime(m.cursor_expires_at));
 requireP13(m.total_scope==='LIVE_FILTERED_WITHIN_HIGH_WATER'&&m.snapshot_consistent===false&&m.membership==='LIVE_UNREAD_OR_ALL'&&m.new_notifications==='RESTART_FROM_START'&&m.sort?.created_at==='desc'&&m.sort?.id==='desc');
 requireP13(m.has_more?typeof m.next_cursor==='string'&&m.next_cursor.length>0&&m.next_cursor.length<=4096&&m.next_cursor!=='start':m.next_cursor===null,'INVALID_CURSOR_RESPONSE');
 return {items:b.data.map(r=>parseRecipient(r)),meta:structuredClone(m)};
}
export function parseDetail(body,id){const b=envelope(body);return {recipient:parseRecipient(b.data,id),meta:structuredClone(b.meta)};}
export function parseCount(body){const b=envelope(body);requireP13(record(b.data)&&integer(b.data.unread_count),'INVALID_UNREAD_COUNT');requireP13(b.meta.count_scope==='CURRENT_USER_ALL_UNREAD'&&b.meta.count_consistency==='LIVE_DATABASE_READ');return {count:b.data.unread_count,meta:structuredClone(b.meta)};}
export function parseRead(body,id){const parsed=parseDetail(body,id),m=parsed.meta;requireP13(isoTime(parsed.recipient.read_at)&&typeof m.changed==='boolean'&&integer(m.unread_count)&&m.count_consistency==='LIVE_AFTER_READ','INVALID_READ_STATE');return {...parsed,changed:m.changed,unreadCount:m.unread_count};}
export function cursorRestart(error){return ({NOTIFICATION_CURSOR_INVALID:422,NOTIFICATION_CURSOR_SCOPE_MISMATCH:409,NOTIFICATION_CURSOR_EXPIRED:410})[error?.code]===error?.status;}
