export const P22_CONTRACT='p22-nfc-history-v1';
export const P22_GATE=Object.freeze({status:'PENDING_CONTRACT_AND_LIVE_TEST',activation:false,liveVerified:false,hardwareVerified:false,backendCommit:'9325eff232f486484d268ae7b098e4ec25411f9b'});
export class NfcHistoryError extends Error{constructor(code,kind='contract',httpStatus=null){super(code);this.name='NfcHistoryError';this.code=code;this.kind=kind;this.httpStatus=httpStatus;}}
export const fail=code=>{throw new NfcHistoryError(code);};
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
export const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
export const identity=x=>typeof x==='string'&&x.startsWith('NFC:')&&uuid(x.slice(4));
const text=x=>typeof x==='string'&&x.trim()?x:null;
export const p22Defaults=()=>({keyword:'',type:'ALL',status:'ALL',date_mode:'ALL',limit:20});
const validDate=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)||s.slice(0,4)==='0000')return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;};
export function p22Filters(input={}){
 if(!object(input)||Object.keys(input).some(k=>!['keyword','type','status','date_mode','date','from','to','limit'].includes(k)))fail('P22_INVALID_FILTER');
 const f={...p22Defaults(),...input};
 if(typeof f.keyword!=='string'||[...f.keyword].length>200||!['ALL','ASSIGN','REPLACE','REVOKE','UNKNOWN'].includes(f.type)||typeof f.status!=='string'||!f.status.trim()||[...f.status].length>100||!Number.isInteger(f.limit)||f.limit<1||f.limit>100)fail('P22_INVALID_FILTER');
 f.keyword=f.keyword.trim();
 if(f.date_mode==='ALL'){if(f.date||f.from||f.to)fail('P22_INVALID_DATE');delete f.date;delete f.from;delete f.to;}
 else if(f.date_mode==='DATE'){if(!validDate(f.date)||f.from||f.to)fail('P22_INVALID_DATE');delete f.from;delete f.to;}
 else if(f.date_mode==='RANGE'){if(!validDate(f.from)||!validDate(f.to)||f.from>f.to||f.date)fail('P22_INVALID_DATE');delete f.date;}
 else fail('P22_INVALID_DATE');
 return f;
}
export function p22Scope(c){
 if(!object(c)||!c.authenticated||!c.contextConfirmed||c.warehouseStatus!=='ACTIVE'||!c.tenantResolved||![c.actorId,c.authSessionId,c.warehouseId].every(uuid)||typeof c.callerId!=='string'||!c.callerId||!Array.isArray(c.permissions)||!c.permissions.every(x=>typeof x==='string')||!object(c.dimensions)||!Object.keys(c.dimensions).length)throw new NfcHistoryError('P22_CONTEXT_UNCONFIRMED','context');
 if(!c.permissions.includes('history.read')||!['physical_code.assign_rfid','inventory.trace'].some(x=>c.permissions.includes(x)))throw new NfcHistoryError('P22_PERMISSION_DENIED','denied');
 const dimensions={};for(const k of Object.keys(c.dimensions).sort()){if(!['tenantId','organizationId'].includes(k)||!uuid(c.dimensions[k]))throw new NfcHistoryError('P22_TENANT_UNCONFIRMED','context');dimensions[k]=c.dimensions[k];}
 return {actorId:c.actorId,authSessionId:c.authSessionId,warehouseId:c.warehouseId,callerId:c.callerId,dimensions,permissions:[...new Set(c.permissions)].sort()};
}
export const p22ScopeKey=s=>JSON.stringify(s);
export function p22ReadError(response){
 const status=response?.status,code=typeof response?.body?.error?.code==='string'?response.body.error.code:null;
 if(status===401)return new NfcHistoryError('P22_SESSION_REQUIRED','auth',401);
 if(status===403)return new NfcHistoryError('P22_READ_DENIED','denied',403);
 if(status===409)return new NfcHistoryError('P22_CONTEXT_RECOVERY','context',409);
 if(status===404)return new NfcHistoryError('P22_EVENT_NOT_FOUND','not-found',404);
 if(status===503&&['HISTORY_SOURCE_UNAVAILABLE','HISTORY_TENANCY_UNRESOLVED'].includes(code))return new NfcHistoryError(code,'unavailable',503);
 if(status===422&&['HISTORY_CURSOR_INVALID','HISTORY_CURSOR_SCOPE_MISMATCH'].includes(code))return new NfcHistoryError(code,'restart',422);
 return new NfcHistoryError(status===422?'P22_QUERY_REJECTED':'P22_READ_FAILED','error',Number.isInteger(status)?status:null);
}
function timezone(v){if(typeof v!=='string')fail('P22_TIMEZONE_MISSING');try{new Intl.DateTimeFormat('en',{timeZone:v});}catch{fail('P22_TIMEZONE_INVALID');}return v;}
function calendarParts(ms,zone){const p=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms));const get=k=>p.find(x=>x.type===k).value;return {day:get('year')+'-'+get('month')+'-'+get('day'),clock:get('hour')+':'+get('minute')+':'+get('second')};}
export function p22Time(raw,zone,{sqlTimestampTimezone=null}={}){
 timezone(zone);if(raw===null||raw===undefined)return {raw:null,day:null,clock:null,status:'NOT_RECORDED'};
 if(typeof raw!=='string')fail('P22_TIME_INVALID');
 const m=/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}(?::?\d{2})?)?$/.exec(raw);
 if(!m||!validDate(m[1])||+m[2]>23||+m[3]>59||+m[4]>59)fail('P22_TIME_INVALID');
 const local=Date.parse(m[1]+'T'+m[2]+':'+m[3]+':'+m[4]+'.'+(m[5]||'').padEnd(3,'0').slice(0,3)+'Z');let ms;
 if(m[6]){const o=m[6];if(o==='Z')ms=local;else{const match=/^([+-])(\d{2})(?::?(\d{2}))?$/.exec(o);if(+match[2]>23||+(match[3]||0)>59)fail('P22_TIME_INVALID');ms=local-(match[1]==='+'?1:-1)*(+match[2]*60+ +(match[3]||0))*60000;}}
 else{
  if(sqlTimestampTimezone===null)return {raw,day:null,clock:null,status:'UNVERIFIED_TIMEZONE'};
  timezone(sqlTimestampTimezone);const candidates=new Set();for(const delta of [-86400000,-21600000,0,21600000,86400000]){const ref=local+delta,p=calendarParts(ref,sqlTimestampTimezone),offset=Date.parse(p.day+'T'+p.clock+'Z')-Math.floor(ref/1000)*1000,candidate=local-offset,parts=calendarParts(candidate,sqlTimestampTimezone);if(parts.day===m[1]&&parts.clock===m[2]+':'+m[3]+':'+m[4])candidates.add(candidate);}
  if(candidates.size!==1)return {raw,day:null,clock:null,status:'UNVERIFIED_TIMEZONE'};ms=[...candidates][0];
 }
 const p=calendarParts(ms,zone);return {raw,...p,status:'SOURCE_TIMESTAMP'};
}
function envelope(response,scope){
 if(response?.status!==200||response?.body?.success===false)throw p22ReadError(response);
 const b=response.body,m=b?.meta;if(b?.success!==true||!object(m)||m.contract!==P22_CONTRACT||m.owner!=='P08'||m.source!=='NFC'||m.countUnit!=='EVENT'||m.warehouseId!==scope.warehouseId)fail('P22_META_MISMATCH');
 for(const [k,v]of Object.entries({coveragePolicy:'ONLY_PERSISTED_EVENT_SNAPSHOTS',legacyPolicy:'EXCLUDE_UNPROVEN_EVENT_WAREHOUSE',resultPolicy:'OWNER_RESULT_SNAPSHOT_NO_STORAGE_DEFAULTS',paginationConsistency:'KEYSET_UPPER_BOUND_NOT_FROZEN_SNAPSHOT',exportAvailable:false,currentTagLookupPerformed:false,isConfirmationReceipt:false}))if(m[k]!==v)fail('P22_POLICY_MISMATCH');
 if(!Number.isSafeInteger(m.total)||m.total<0||typeof m.asOf!=='string'||!m.asOf)fail('P22_META_INVALID');
 timezone(m.timezone);
 return {data:b.data,meta:{total:m.total,asOf:m.asOf,timezone:m.timezone,countUnit:'EVENT',coveragePolicy:m.coveragePolicy,consistency:m.paginationConsistency}};
}
export function parseP22Event(e,scope,zone,timePolicy){
 if(!object(e)||!identity(e.recordId)||!identity(e.activityId)||!uuid(e.eventId)||!uuid(e.physical_code_id)||e.recordId.slice(4)!==e.physical_code_id||e.activityId.slice(4)!==e.eventId||e.source!=='NFC'||!['ASSIGN','REPLACE','REVOKE','UNKNOWN'].includes(e.type))fail('P22_EVENT_IDENTITY');
 if(!object(e.warehouse)||e.warehouse.warehouse_id!==scope.warehouseId||e.identity_source!=='PERSISTED_NFC_AUDIT_SNAPSHOT'||e.missing_field_policy!=='NULL_NOT_RECORDED')fail('P22_EVENT_SCOPE');
 if(e.raw_content!==null||e.current_tag_status!==null||e.isConfirmationReceipt!==false||e.mutation_available!==false||e.raw_content_status!=='NOT_EXPOSED_MAY_CONTAIN_SECRETS')fail('P22_UNSAFE_PROJECTION');
 if(!['PERSISTED_OWNER_RESULT','NOT_RECORDED'].includes(e.status_source)||(e.status_source==='NOT_RECORDED'?e.status!==null:typeof e.status!=='string'))fail('P22_RESULT_PROVENANCE');
 if(!['PERMITTED','REDACTED'].includes(e.audit_details_status)||(e.audit_details_status==='REDACTED'&&(e.actor!==null||e.reason!==null))||(!scope.permissions.includes('audit_log.view')&&(e.actor!==null||e.reason!==null||e.audit_details_status!=='REDACTED')))fail('P22_REDACTION_MISMATCH');
 if(!['AUDIT_CREATED_AT','NOT_RECORDED'].includes(e.timeStatus)||(e.timeStatus==='NOT_RECORDED'&&e.time!==null))fail('P22_TIME_PROVENANCE');
 if(e.type==='REPLACE'&&(!text(e.previous_hardware_uid)||!text(e.hardware_uid)||e.previous_hardware_uid===e.hardware_uid||!uuid(e.previous_physical_code_id)||e.previous_physical_code_id===e.physical_code_id||!uuid(e.item_id)))fail('P22_REPLACEMENT_PROJECTION');
 // Only this allowlist is retained. Arbitrary response JSON never reaches UI/checkpoint/copy.
 return {recordId:e.recordId,activityId:e.activityId,eventId:e.eventId,physicalCodeId:e.physical_code_id,source:'NFC',action:text(e.action),type:e.type,typeLabel:text(e.type_label),status:e.status,statusSource:e.status_source,
  uid:text(e.hardware_uid),previousUid:text(e.previous_hardware_uid),previousPhysicalCodeId:uuid(e.previous_physical_code_id)?e.previous_physical_code_id:null,itemId:uuid(e.item_id)?e.item_id:null,serial:text(e.serial_number),
  product:text(e.sku?.sku_name),skuCode:text(e.sku?.sku_code),warehouseId:scope.warehouseId,warehouse:text(e.warehouse.name),actor:text(e.actor?.display_name),reason:text(e.reason),auditDetailsStatus:e.audit_details_status,
  timestamp:p22Time(e.time,zone,timePolicy),tagStatusAtEvent:text(e.tag_status_at_event),currentTagStatus:null,isConfirmationReceipt:false,mutationAvailable:false};
}
export function mergeP22Events(prior,next){const result=[...prior],activities=new Map(prior.map(e=>[e.activityId,e])),events=new Map(prior.map(e=>[e.eventId,e]));for(const e of next){const old=activities.get(e.activityId)||events.get(e.eventId);if(old){if(JSON.stringify(old)!==JSON.stringify(e))fail('P22_DUPLICATE_CONFLICT');continue;}activities.set(e.activityId,e);events.set(e.eventId,e);result.push(e);}return result;}
export function parseP22Page(response,scope,{lookupEventId=null,limit=20,timePolicy}={}){
 const {data,meta}=envelope(response,scope),m=response.body.meta;if(!Array.isArray(data)||!Number.isInteger(m.limit)||m.limit<1||m.limit>100||m.limit!==limit||typeof m.hasMore!=='boolean'||(m.hasMore?typeof m.nextCursor!=='string'||!m.nextCursor||m.nextCursor.length>4096:m.nextCursor!==null)||data.length>m.limit||data.length>meta.total)fail('P22_PAGE_INVALID');
 const items=mergeP22Events([],data.map(e=>parseP22Event(e,scope,meta.timezone,timePolicy)));
 if((meta.total===0&&items.length)||(meta.total>0&&!items.length&&!lookupEventId))fail('P22_PAGE_INCONSISTENT');
 if(lookupEventId&&(meta.total!==1||items.length!==1||items[0].eventId!==lookupEventId||m.hasMore))fail('P22_LOOKUP_MISMATCH');
 return {items,meta:{...meta,limit:m.limit,hasMore:m.hasMore,nextCursor:m.nextCursor}};
}
export function parseP22Detail(response,scope,ref,timePolicy){
 const {data,meta}=envelope(response,scope);if(!object(data)||data.recordId!==ref.recordId||meta.total!==1||!Array.isArray(data.events)||data.events.length!==1)fail('P22_DETAIL_MISMATCH');
 const event=parseP22Event(data.selectedActivity,scope,meta.timezone,timePolicy),again=parseP22Event(data.events[0],scope,meta.timezone,timePolicy);
 if(event.recordId!==ref.recordId||event.activityId!==ref.activityId||ref.eventId&&event.eventId!==ref.eventId||JSON.stringify(event)!==JSON.stringify(again))fail('P22_DETAIL_MISMATCH');
 return {event,meta};
}
export function parseP22Summary(response,scope){const {data,meta}=envelope(response,scope);if(!object(data)||data.countUnit!=='EVENT'||data.coverage!=='COMPLETE_FOR_AUTHORIZED_PERSISTED_EVENT_SNAPSHOTS'||![data.grandTotal,data.availableTotal].every(x=>Number.isSafeInteger(x)&&x>=0)||data.grandTotal!==meta.total||data.availableTotal!==meta.total||!Array.isArray(data.typeTotals)||!Array.isArray(data.statusTotals))fail('P22_SUMMARY_INVALID');
 const types=data.typeTotals.map(x=>{if(!['ASSIGN','REPLACE','REVOKE','UNKNOWN'].includes(x.type)||!Number.isSafeInteger(x.total)||x.total<0)fail('P22_SUMMARY_INVALID');return {type:x.type,total:x.total};});
 const statuses=data.statusTotals.map(x=>{if(x.status!==null&&typeof x.status!=='string'||!Number.isSafeInteger(x.total)||x.total<0)fail('P22_SUMMARY_INVALID');return {status:x.status,total:x.total};});
 if(new Set(types.map(x=>x.type)).size!==4||new Set(statuses.map(x=>x.status)).size!==statuses.length||types.reduce((n,x)=>n+x.total,0)!==meta.total||statuses.reduce((n,x)=>n+x.total,0)!==meta.total)fail('P22_SUMMARY_INCONSISTENT');
 return {grandTotal:data.grandTotal,availableTotal:data.availableTotal,typeTotals:types,statusTotals:statuses,countUnit:'EVENT',coverage:data.coverage,meta};}
