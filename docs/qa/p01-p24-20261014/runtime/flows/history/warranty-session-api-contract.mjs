// P23 read preparation only. Never imported by the default r03 renderer.
export const P23_READ_CONTRACT='mini-app-p23-read-v2';
export const P23_READ_GATE=Object.freeze({status:'SOURCE_IMPLEMENTED_PENDING_BA_AND_LIVE_TEST',activation:false,live:'NOT_RUN',browserLive:'NOT_RUN',device:'NOT_RUN',backendTests:'NOT_RUN',backendCommit:'b51c77d929b223eb298efebcbf6fbdf0e7886358'});
export const P23_ROUTES=Object.freeze({cases:'/api/v1/mini-app/warranty-cases',case:'/api/v1/mini-app/warranty-cases/{id}',timeline:'/api/v1/mini-app/warranty-cases/{id}/events',sessions:'/api/v1/mini-app/scan-sessions',events:'/api/v1/mini-app/history/scan-sessions/{sessionId}'});
export class P23ReadError extends Error{constructor(code,kind='contract',httpStatus=null){super(code);this.name='P23ReadError';this.code=code;this.kind=kind;this.httpStatus=httpStatus;}}
export const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
export const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export const count=v=>Number.isSafeInteger(v)&&v>=0;
const text=v=>typeof v==='string';
const nullable=v=>v==null||text(v);
export const ensure=(yes,code='P23_RESPONSE_INVALID')=>{if(!yes)throw new P23ReadError(code);};
export const clone=v=>structuredClone(v);
const pick=(v,keys)=>Object.fromEntries(keys.filter(k=>Object.hasOwn(v,k)).map(k=>[k,clone(v[k])]));
export function p23Scope(c,kind='sessions'){
 if(!object(c)||c.authenticated!==true||c.contextConfirmed!==true||c.warehouseStatus!=='ACTIVE'||![c.actorId,c.authSessionId,c.warehouseId].every(uuid)||typeof c.callerId!=='string'||!c.callerId||!Array.isArray(c.permissions)||!c.permissions.every(text)||!object(c.dimensions))throw new P23ReadError('P23_CONTEXT_UNVERIFIED','context');
 const dims={};for(const k of Object.keys(c.dimensions).sort()){if(!['tenantId','organizationId','orgId'].includes(k)||!uuid(c.dimensions[k]))throw new P23ReadError('P23_ORGANIZATION_UNVERIFIED','context');dims[k]=c.dimensions[k];}
 if(c.tenantResolved!==true||!Object.keys(dims).length&&c.singleTenantConfirmed!==true)throw new P23ReadError('P23_TENANCY_UNVERIFIED','context');
 const rights=[...new Set(c.permissions)].sort(),caseRead=rights.some(p=>['warranty.view','warranty.manage'].includes(p));
 if(kind==='cases'?!caseRead:!rights.includes('history.read')||!rights.includes('inventory.view'))throw new P23ReadError('P23_READ_FORBIDDEN','denied',403);
 return {actorId:c.actorId,authSessionId:c.authSessionId,warehouseId:c.warehouseId,callerId:c.callerId,dimensions:dims,permissions:rights,singleTenantConfirmed:c.singleTenantConfirmed===true};
}
export const scopeKey=s=>JSON.stringify(s);
const validDay=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&s.slice(0,4)!=='0000'&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
function dateQuery(f,family){
 const keys=['date_mode','date_field','date','from','to'],provided=keys.filter(k=>Object.hasOwn(f,k));if(!provided.length)return {};
 const mode=f.date_mode;ensure(['ALL','DATE','RANGE'].includes(mode),'P23_INVALID_DATE');
 if(mode==='ALL'){ensure(provided.length===1,'P23_INVALID_DATE');return {date_mode:mode};}
 const fields=family==='cases'?['created_at','received_at','returned_at']:['created_at'];ensure(fields.includes(f.date_field),'P23_INVALID_DATE_FIELD');
 const expected=mode==='DATE'?['date_mode','date_field','date']:['date_mode','date_field','from','to'];ensure(provided.length===expected.length&&expected.every(k=>provided.includes(k)),'P23_INVALID_DATE');
 ensure(mode==='DATE'?validDay(f.date):validDay(f.from)&&validDay(f.to)&&f.from<=f.to,'P23_INVALID_DATE');return pick(f,expected);
}
export function p23Query(lane,input={}){
 ensure(object(input),'P23_QUERY_INVALID');
 const allowed=lane==='cases'?['search','status','sort','per_page','page','cursor','date_mode','date_field','date','from','to']:lane==='timeline'?['sort','per_page','page','cursor']:lane==='sessions'?['keyword','source_type','status','per_page','page','cursor','date_mode','date_field','date','from','to']:lane==='events'?['limit','cursor']:[];
 ensure(allowed.length&&Object.keys(input).every(k=>allowed.includes(k)),'P23_QUERY_INVALID');
 const sizeKey=lane==='events'?'limit':'per_page',size=input[sizeKey]??20;ensure(Number.isInteger(size)&&size>=1&&size<=100,'P23_SIZE_INVALID');
 if(Object.hasOwn(input,'page'))ensure(Number.isInteger(input.page)&&input.page>=1&&input.page<=100000&&!Object.hasOwn(input,'cursor'),'P23_PAGING_CONFLICT');
 if(Object.hasOwn(input,'cursor'))ensure(text(input.cursor)&&input.cursor.length>0&&input.cursor.length<=4096,'P23_CURSOR_INVALID');
 const q={};
 if(lane==='cases'){if(Object.hasOwn(input,'search')){ensure(text(input.search)&&[...input.search].length<=200,'P23_SEARCH_INVALID');if(input.search.trim())q.search=input.search;}if(input.sort!==undefined)ensure(['created_at_desc','created_at_asc'].includes(input.sort),'P23_SORT_INVALID');q.sort=input.sort??'created_at_desc';}
 if(lane==='timeline'){ensure(input.sort===undefined||['event_at_asc','event_at_desc'].includes(input.sort),'P23_SORT_INVALID');q.sort=input.sort??'event_at_asc';}
 if(lane==='sessions'){if(Object.hasOwn(input,'keyword')){ensure(text(input.keyword)&&[...input.keyword].length<=200,'P23_SEARCH_INVALID');if(input.keyword.trim())q.keyword=input.keyword;}if(Object.hasOwn(input,'source_type')&&input.source_type!=='ALL'){ensure(text(input.source_type)&&input.source_type.trim()&&[...input.source_type].length<=50&&!['Nhập kho','Xuất linh kiện','Tra cứu'].includes(input.source_type),'P23_SOURCE_FILTER_INVALID');q.source_type=input.source_type;}}
 if(['cases','sessions'].includes(lane)){if(Object.hasOwn(input,'status')&&input.status!=='ALL'){ensure(text(input.status)&&input.status.trim()&&[...input.status].length<=30,'P23_STATUS_INVALID');if(lane==='cases')ensure(['RECEIVED','CHECKING','REPAIRING','COMPLETED','RETURNED','CANCELLED'].includes(input.status),'P23_STATUS_INVALID');else ensure(!['Đã xuất','Chờ xử lý trên Web','Đã kết thúc'].includes(input.status),'P23_STATUS_INVALID');q.status=input.status;}Object.assign(q,dateQuery(input,lane));}
 q[sizeKey]=size;if(Object.hasOwn(input,'page'))q.page=input.page;if(Object.hasOwn(input,'cursor'))q.cursor=input.cursor;
 return q;
}
export function readError(r){const s=r?.status,code=typeof r?.body?.error?.code==='string'?r.body.error.code:'P23_READ_FAILED';
 const kind=s===401?'auth':s===403?'denied':s===409?'context':s===404?'notfound':s===503?'unavailable':s===422&&/CURSOR/.test(code)?'restart':'error';return new P23ReadError(code,kind,s??null);}
function envelope(r,scope,contract){if(r?.status!==200)throw readError(r);const b=r.body;ensure(object(b)&&b.success===true&&object(b.meta)&&Object.hasOwn(b,'data'),'P23_ENVELOPE_INVALID');ensure(b.meta.contract===contract,'P23_CONTRACT_MISMATCH');const wh=contract==='mini-app-p09-v1'?b.meta.warehouse_id:b.meta.warehouseId;ensure(wh===scope.warehouseId,'P23_WAREHOUSE_MISMATCH');return b;}
function zone(v){ensure(typeof v==='string','P23_TIMEZONE_MISSING');try{new Intl.DateTimeFormat('en',{timeZone:v});}catch{throw new P23ReadError('P23_TIMEZONE_INVALID');}return v;}
export function p23Timestamp(v){ensure(nullable(v),'P23_TIME_INVALID');return v??null;}
function pageMeta(m,q,lane){
 const sizeKey=lane==='events'?'limit':'per_page';ensure(m[sizeKey]===q[sizeKey]&&typeof m.hasMore==='boolean','P23_PAGING_INVALID');
 ensure(m.total===null||count(m.total),'P23_TOTAL_INVALID');
 const keyset=lane==='events'||!Object.hasOwn(q,'page');
 if(keyset){ensure(lane==='events'||m.pagination==='KEYSET'&&m.page===null&&m.nextPage===null,'P23_PAGING_INVALID');ensure(m.hasMore?text(m.nextCursor)&&m.nextCursor.length>0&&m.nextCursor.length<=4096:m.nextCursor===null,'P23_CURSOR_INVALID');}
 else{ensure(m.pagination==='OFFSET'&&m.page===q.page&&m.nextCursor===null&&(m.hasMore?m.nextPage===q.page+1:m.nextPage===null),'P23_PAGING_INVALID');}
 if(lane!=='events')ensure(m.consistency==='LIVE_READ_NOT_FROZEN_CROSS_REQUEST','P23_PAGING_INVALID');
 return pick(m,['total','availableTotal','hasMore','nextCursor','nextPage','page','per_page','limit','pagination','consistency','asOf','timezone','metricsAsOf','coverage','countUnit','dateMode','dateField','dateNullPolicy','sort','retentionStatus','scopePolicy','tenantIsolation']);
}
function caseRow(d,scope,id=null){
 ensure(object(d)&&uuid(d.warranty_case_id)&&(!id||d.warranty_case_id===id)&&Number.isSafeInteger(d.version)&&d.version>0&&typeof d.status==='string','P23_CASE_IDENTITY');
 if(d.warehouse_id!==undefined)ensure(d.warehouse_id===scope.warehouseId,'P23_CASE_SCOPE');
 if(!scope.permissions.includes('warranty.pii.view'))ensure(d.free_text_redacted===true&&['description','reported_defect','confirmed_defect','received_condition','accessories_received','manual_product_description'].every(k=>d[k]==null),'P23_CASE_REDACTION');
 const row=pick(d,['warranty_case_id','warranty_case_code','temporary_item_code','warehouse_id','item_id','status','version','sku_code','sku_name','serial_number','manual_product_description','customer_name','customer_phone','customer_address','description','reported_defect','confirmed_defect','received_condition','accessories_received','pii_masked','free_text_redacted','received_at','returned_at','created_at','updated_at']);
 for(const k of ['created_at','received_at','returned_at'])if(Object.hasOwn(row,k))p23Timestamp(row[k]);
 row.capabilities=object(d.capabilities)?pick(d.capabilities,['posted_component_issues_read','attachments_read','attachments_download']):{};
 return row;
}
function p09Envelope(r,s){const b=envelope(r,s,'mini-app-p09-v1');ensure(b.meta.scope_policy==='PERSISTED_WARRANTY_OWNER_BEFORE_TOTAL','P23_CASE_SCOPE');return b;}
export function parseCases(r,s,q){const b=p09Envelope(r,s),m=b.meta;ensure(Array.isArray(b.data)&&count(m.total)&&b.data.length<=q.per_page,'P23_CASE_PAGE');const meta=pageMeta(m,q,'cases');
 if(q.date_mode!==undefined){ensure(m.date_filter_contract==='p23-case-dates-v2'&&m.date_mode===q.date_mode,'P23_CASE_DATE_CONTRACT');zone(m.date_timezone);if(q.date_mode==='ALL')ensure(m.date_field===null&&m.date_source===null&&m.date_null_policy==='INCLUDED_WITHOUT_DATE_FILTER','P23_CASE_DATE_CONTRACT');else{ensure(m.date_field===q.date_field&&m.date_source==='warranty_case.'+q.date_field&&m.date_from===(q.date_mode==='DATE'?q.date:q.from)&&m.date_to===(q.date_mode==='DATE'?q.date:q.to)&&m.date_null_policy==='EXCLUDED_WITHOUT_FALLBACK'&&['TIMESTAMP_WITH_TIME_ZONE','APP_LOCAL_WALL_CLOCK'].includes(m.date_storage)&&text(m.date_from_inclusive)&&text(m.date_to_exclusive),'P23_CASE_DATE_CONTRACT');}Object.assign(meta,pick(m,['date_filter_contract','date_mode','date_field','date_from','date_to','date_timezone','date_source','date_storage','date_from_inclusive','date_to_exclusive','date_null_policy']));}
 return {items:b.data.map(d=>caseRow(d,s)),meta};}
export function parseCase(r,s,id){const b=p09Envelope(r,s);return {item:caseRow(b.data,s,id),etag:r.headers?.ETag??r.headers?.etag??null};}
export function parseTimeline(r,s,id,q){const b=p09Envelope(r,s),m=b.meta;ensure(Array.isArray(b.data)&&count(m.total)&&b.data.length<=q.per_page&&m.timeline_contract==='p23-timeline-v2'&&m.order===q.sort&&count(m.unknown_time_count)&&m.latest_policy==='GREATEST_RECORDED_EVENT_AT_THEN_EVENT_ID_IN_FULL_SCOPED_SOURCE','P23_TIMELINE_META');
 ensure(m.latest_recorded_event_id===null||uuid(m.latest_recorded_event_id),'P23_TIMELINE_LATEST');ensure(nullable(m.latest_recorded_event_at)&&['PARTIAL_TIME_INFORMATION','ALL_RETAINED_EVENTS_HAVE_TIME'].includes(m.latest_completeness)&&m.retention_status==='NOT_PUBLISHED','P23_TIMELINE_META');
 const latest=m.latest_recorded_event_id,items=b.data.map(e=>{ensure(object(e)&&uuid(e.event_id)&&e.warranty_case_id===id&&nullable(e.event_at)&&nullable(e.message)&&typeof e.message_redacted==='boolean','P23_TIMELINE_EVENT');if(e.message_redacted||!s.permissions.includes('warranty.pii.view'))ensure(e.message===null,'P23_TIMELINE_REDACTION');ensure(object(e.actor)&&(e.actor.user_id===null||uuid(e.actor.user_id))&&nullable(e.actor.display_name),'P23_TIMELINE_ACTOR');return {...pick(e,['event_id','warranty_case_id','event_type','from_status','status','to_status','event_at','message','message_redacted','time_status','related_document_event_id','related_document_event_status']),actor:pick(e.actor,['user_id','user_id_source','display_name','display_name_status']),isLatestRecorded:e.event_id===latest};});
 return {items,meta:{...pageMeta(m,q,'timeline'),...pick(m,['timeline_contract','latest_recorded_event_id','latest_recorded_event_at','latest_policy','unknown_time_count','latest_completeness','time_source','page_tie_breaker','page_null_time_policy','retention_status','order'])}};
}
export function parseCounts(v){ensure(object(v)&&['AVAILABLE_RETAINED_EVENTS','PARTIAL_SOURCE','SOURCE_UNAVAILABLE'].includes(v.countStatus)&&v.rejected===null&&v.quantity===null&&v.issuedQuantity===null&&v.isConfirmationReceipt===false,'P23_COUNTS_INVALID');const out=pick(v,['countStatus','quantityStatus','issuedQuantityStatus','rejectionMappingStatus']);
 if(v.countStatus==='AVAILABLE_RETAINED_EVENTS'){ensure(['total','accepted','duplicate','other','explicitRejected'].every(k=>count(v[k]))&&(object(v.statusTotals)||Array.isArray(v.statusTotals)&&v.statusTotals.length===0),'P23_COUNTS_INVALID');const totals=Object.entries(v.statusTotals);ensure(totals.every(([,n])=>count(n))&&totals.reduce((n,[,x])=>n+x,0)===v.total&&v.accepted===(v.statusTotals.ACCEPTED??0)&&v.duplicate===(v.statusTotals.DUPLICATE??0)&&v.other===v.total-v.accepted-v.duplicate&&v.explicitRejected===(v.statusTotals.REJECTED??0),'P23_COUNTS_EVIDENCE');Object.assign(out,pick(v,['total','accepted','duplicate','other','explicitRejected','statusTotals']));}
 else{ensure(['total','accepted','duplicate','other','explicitRejected','statusTotals'].every(k=>v[k]===null),'P23_PARTIAL_COUNTS');Object.assign(out,{total:null,accepted:null,duplicate:null,other:null,explicitRejected:null,statusTotals:null});}
 Object.assign(out,{rejected:null,quantity:null,issuedQuantity:null,isConfirmationReceipt:false});if(v.availableCounts!==undefined)out.availableCounts=parseCounts(v.availableCounts);return out;
}
const sourceMeta=v=>{ensure(object(v),'P23_SOURCES_INVALID');return Object.fromEntries(Object.entries(v).map(([k,s])=>{ensure(object(s)&&['INCLUDED','UNAVAILABLE','PARTIAL'].includes(s.status),'P23_SOURCES_INVALID');return [k,pick(s,['status','eventStatus','eventSource','fields'])];}));};
function batch(d,s,{counts=true}={}){ensure(object(d)&&uuid(d.sessionId)&&d.sessionType==='SCAN_BATCH'&&d.warehouseId===s.warehouseId&&d.isConfirmationReceipt===false,'P23_BATCH_IDENTITY');ensure(['NOT_RECORDED','TARGET_MAPPING_NOT_APPROVED'].includes(d.businessLinksStatus)&&Array.isArray(d.businessLinks)&&d.businessLinks.length===0,'P23_LINK_MAPPING_UNAPPROVED');
 const row=pick(d,['sessionId','sessionType','warehouseId','sourceTable','batchNo','batchNoStatus','sourceType','status','statusStatus','createdAtSource','timePolicy','businessLinksStatus']);
 for(const k of ['batchNo','sourceType','status','createdAt','startedAt','endedAt']){ensure(nullable(d[k]),'P23_BATCH_METADATA');row[k]=d[k]??null;}
 ensure(d.timePolicy==='CREATED_AT_IS_NOT_STARTED_AT_OR_ENDED_AT'&&object(d.actor)&&(d.actor.userId===null||uuid(d.actor.userId))&&d.actor.displayName===null&&d.actor.role==='BATCH_CREATOR_NOT_EVENT_ACTOR','P23_BATCH_ACTOR');row.actor=pick(d.actor,['userId','displayName','source','role','displayNameStatus']);row.businessLinks=[];row.isConfirmationReceipt=false;
 const expected=P23_ROUTES.events.replace('{sessionId}',d.sessionId);ensure(object(d.detail)&&d.detail.url===expected&&d.detail.requiredQuery?.warehouse_id===s.warehouseId&&d.detail.ownerPermissionRechecked===true&&typeof d.detail.canOpen==='boolean','P23_BATCH_DETAIL');row.detail={canOpen:d.detail.canOpen,path:expected};if(counts)row.counts=parseCounts(d.counts);return row;
}
export function parseSessions(r,s,q){const b=envelope(r,s,P23_READ_CONTRACT),m=b.meta;ensure(Array.isArray(b.data)&&b.data.length<=q.per_page&&m.countUnit==='SCAN_SESSION'&&['PARTIAL_SOURCE','SUPPORTED_PERSISTED_BATCHES'].includes(m.coverage)&&count(m.availableTotal),'P23_SESSION_META');ensure(m.coverage==='PARTIAL_SOURCE'?m.total===null:count(m.total),'P23_PARTIAL_TOTAL');ensure(m.sort==='CREATED_AT_DESC_THEN_BATCH_UUID_DESC_NULL_TIME_LAST'&&m.dateField==='created_at'&&m.dateMode===(q.date_mode??'ALL')&&m.scopePolicy==='PERSISTED_BATCH_WAREHOUSE_BEFORE_DEDUP_FILTER_TOTAL','P23_SESSION_META');zone(m.timezone);return {items:b.data.map(d=>batch(d,s)),meta:{...pageMeta(m,q,'sessions'),batchSources:sourceMeta(m.batchSources)}};}
export function parseSessionEvents(r,s,id,q){const b=envelope(r,s,'mini-app-p08-v1'),d=b.data,m=b.meta,p=d?.p23;ensure(object(d)&&d.sessionId===id&&d.sessionType==='SCAN_BATCH'&&Array.isArray(d.events)&&d.events.length<=q.limit&&m.countUnit==='ACTIVITY'&&count(m.total)&&m.paginationConsistency==='KEYSET_UPPER_BOUND_NOT_FROZEN_SNAPSHOT'&&object(p)&&p.contract===P23_READ_CONTRACT,'P23_SESSION_DETAIL');zone(m.timezone);ensure(p.eventProjectionStatus==='P08_SAFE_EVENTS_ONLY_RAW_REASON_ACTOR_SKU_QUANTITY_NOT_APPROVED'&&p.retentionStatus==='NOT_PUBLISHED'&&p.versionStatus==='NO_PERSISTED_BATCH_VERSION','P23_SESSION_PROJECTION');
 const items=d.events.map(e=>{ensure(object(e)&&uuid(e.eventId)&&e.activityId==='SCAN:'+e.eventId&&e.recordId==='SCAN:'+id&&e.source==='SCAN'&&e.rawCode===null&&e.quantity===null&&e.rawCodePolicy==='OMITTED_MAY_CONTAIN_PII_OR_SECRETS'&&e.isConfirmationReceipt===false,'P23_SCAN_EVENT_IDENTITY');return {...pick(e,['activityId','recordId','eventId','source','sourceTable','business','status','action','time','timeStatus','label','codeId']),rawCode:null,quantity:null,actor:null,reason:null,sku:null,serial:null,isConfirmationReceipt:false};});
 const projected=p.batch===null?null:batch(p.batch,s,{counts:false});ensure(!projected||projected.sessionId===id,'P23_BATCH_IDENTITY');return {items,detail:{sessionId:id,batch:projected,counts:parseCounts(p.counts),availableCounts:parseCounts(p.availableCounts),batchSources:sourceMeta(p.batchSources),eventProjectionStatus:p.eventProjectionStatus,retentionStatus:p.retentionStatus,versionStatus:p.versionStatus,businessLinks:[],isConfirmationReceipt:false},meta:pageMeta(m,q,'events')};
}
export function mergeById(previous,next,lane){const key=lane==='cases'?'warranty_case_id':lane==='sessions'?'sessionId':lane==='timeline'?'event_id':'eventId',items=previous.map(clone),positions=new Map(items.map((e,i)=>[e[key],i]));for(const row of next){if(positions.has(row[key]))items[positions.get(row[key])]=clone(row);else{positions.set(row[key],items.length);items.push(clone(row));}}return items;}
