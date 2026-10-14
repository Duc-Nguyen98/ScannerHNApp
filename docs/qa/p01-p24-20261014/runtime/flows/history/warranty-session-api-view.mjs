import {P23_READ_GATE,P23ReadError,p23Scope,scopeKey} from './warranty-session-api-contract.mjs';
import {p23DisplayTime,p23CountLabel} from './warranty-session-api-experience.mjs';
const laneFor=s=>s==='warranty'?'cases':s==='warranty-detail'?'timeline':s==='sessions'?'sessions':'events';
// Presentation labels follow the locked P09/P23 vocabulary; raw status and capabilities are retained.
const caseLabels={RECEIVED:'Đã tiếp nhận',CHECKING:'Đang kiểm tra',REPAIRING:'Đang sửa chữa',COMPLETED:'Chờ bàn giao',RETURNED:'Đã trả khách',CANCELLED:'Đã hủy'};
const caseStatus=v=>caseLabels[v]??v??'Chưa xác minh';
// Local opt-in projection. No fixture import, business writer or parallel renderer.
export function createP23OfflineView({owner,getContext,timePolicy={},caseDateField='created_at',sessionFilterOptions=[],onComponents=()=>{}}={}){
 if(!owner||owner.snapshot('sessions').activation!==false)throw new P23ReadError('P23_OFFLINE_OWNER_REQUIRED');
 let scene='warranty',entity=null,active=false,contextKey=null;const queries={cases:{},sessions:{}},pending=new Set();
 function syncContext(){const key=scopeKey(p23Scope(getContext(),scene.startsWith('warranty')?'cases':'sessions'));if(contextKey!==null&&contextKey!==key){queries.cases={};queries.sessions={};}contextKey=key;return key;}
 const stamp=v=>{try{return p23DisplayTime(v,getContext().dateTimezone??'Asia/Ho_Chi_Minh',timePolicy);}catch{return {day:null,clock:null,status:'UNVERIFIED_TIMEZONE'};}};
 const clock=v=>stamp(v).clock?.slice(0,5)??null;
 function projectCase(d){if(!d)return null;const time=stamp(d[queries.cases.date_field??'created_at']);return {id:d.warranty_case_id,label:d.warranty_case_code??d.temporary_item_code??d.warranty_case_id,model:d.sku_name??d.manual_product_description??null,serial:d.serial_number??null,status:caseStatus(d.status),rawStatus:d.status,day:time.day,time:time.clock?.slice(0,5)??null,readOnly:d.status==='RETURNED'};}
 function projectBatch(d,detail=null){if(!d)return {id:entity,label:entity,type:null,status:'Chưa xác minh',day:null,time:null,actor:null,warehouse:getContext().warehouseName??null,accepted:detail?.counts.accepted??null,rejected:null,quantity:null,duplicate:detail?.counts.duplicate??null,sessionStatus:null,doc:null,events:[]};
  const time=stamp(d.createdAt),c=detail?.counts??d.counts;return {id:d.sessionId,label:d.batchNo??d.sessionId,type:d.sourceType??'Chưa ghi nhận loại phiên',status:d.status??'Chưa ghi nhận trạng thái',day:time.day,time:clock(d.createdAt),createdAt:d.createdAt,startedAt:d.startedAt,endedAt:d.endedAt,actor:d.actor?.displayName??null,warehouse:getContext().warehouseName??d.warehouseId,sessionStatus:d.status,doc:null,accepted:c?.accepted??null,rejected:c?.rejected??null,quantity:c?.issuedQuantity??null,duplicate:c?.duplicate??null,countStatus:c?.countStatus,explicitRejected:c?.explicitRejected??null,other:c?.other??null,events:[]};
 }
 function snapshot(){const lane=laneFor(scene),s=owner.snapshot(lane),cs=scene==='warranty-detail'?owner.snapshot('case'):null;let kind=s.kind;
  if(cs&&['auth','denied','context','notfound','unavailable','error'].includes(cs.kind)&&!cs.item)kind=cs.kind;
  else if(cs&&cs.kind==='loading'&&!cs.item)kind='loading';
  const rows=scene==='warranty'?s.items.map(projectCase):scene==='sessions'?s.items.map(d=>projectBatch(d)):[];
  let item=scene==='warranty-detail'?projectCase(cs.item):scene==='session-detail'&&s.detail?projectBatch(s.detail.batch,s.detail):null;
  if(scene==='session-detail'&&item)item.events=s.items.map(e=>({id:e.eventId,code:e.rawCode,time:clock(e.time),result:e.status,resultLabel:e.status??'Chưa ghi nhận kết quả',quantity:null}));
  const events=scene==='warranty-detail'?s.items.map(e=>{const time=stamp(e.event_at);return {id:e.event_id,label:e.event_type,day:time.day,time:time.clock?.slice(0,5)??null,actor:e.actor?.display_name??null,description:e.message,messageRedacted:e.message_redacted,isLatestRecorded:e.isLatestRecorded};}):[];
  const latest=s.meta?.latest_recorded_event_id??null;
  return {kind,loading:s.loading||!!cs?.loading,rows,item,events,latest,hasMore:s.hasMore,issue:s.issue??cs?.issue??null,total:s.total,loadedCount:s.loadedCount,meta:s.meta,detail:s.detail,countLabel:p23CountLabel(s),query:s.query,emptyVerified:s.kind==='empty'&&s.total===0,partial:kind==='partial',timelinePartial:scene==='warranty-detail'&&(s.meta?.latest_completeness==='PARTIAL_TIME_INFORMATION'||s.meta?.retention_status==='NOT_PUBLISHED'),mappingUnavailable:scene==='session-detail'};
 }
 function track(p){pending.add(p);p.then(()=>pending.delete(p),()=>pending.delete(p));return p;}
 async function show(next,id){scene=next;entity=id||null;active=true;try{syncContext();}catch{}const lane=laneFor(scene),s=owner.snapshot(lane);if(scene==='warranty-detail'){
  const cs=owner.snapshot('case');const reads=[];if(cs.entity!==entity||cs.kind==='idle')reads.push(owner.read('case',{entity}));if(s.entity!==entity||s.kind==='idle')reads.push(owner.read('timeline',{entity}));return track(Promise.all(reads));
 }if(['warranty','sessions'].includes(scene)){if(s.kind==='idle')return track(owner.read(lane,{query:queries[lane]}));return true;}if(s.entity!==entity||s.kind==='idle')return track(owner.read('events',{entity}));return true;}
 async function filter(f){syncContext();const lane=scene==='warranty'?'cases':'sessions',q={...(lane==='cases'?{search:f.q}:{keyword:f.q}),...(f.type==='all'?{}:{[lane==='cases'?'status':'source_type']:f.type})};if(f.from||f.to){if(!f.from||!f.to)throw new P23ReadError('P23_DATE_RANGE_INCOMPLETE');Object.assign(q,{date_mode:f.from===f.to?'DATE':'RANGE',date_field:lane==='cases'?caseDateField:'created_at',...(f.from===f.to?{date:f.from}:{from:f.from,to:f.to})});}else q.date_mode='ALL';queries[lane]=q;return track(owner.read(lane,{query:q}));}
 return {kind:'P23_OFFLINE_READ_VIEW',gate:P23_READ_GATE,snapshot,show,filter,scopeKey(){try{return syncContext();}catch{return '';}},
  tabs:family=>family==='warranty'?[['CHECKING','Đang kiểm tra'],['RETURNED','Đã trả khách']]:sessionFilterOptions,
  countLabel(){const state=snapshot();return state.total===null?state.countLabel:'Đã tải '+state.loadedCount;},subscribe:fn=>owner.subscribe(fn),validScope(){try{const state=snapshot();return !['auth','denied','context'].includes(state.kind);}catch{return false;}},
  reload(){if(scene==='warranty-detail')return track(Promise.all([owner.read('case',{entity}),owner.read('timeline',{entity})]));const lane=laneFor(scene);return track(owner.read(lane,{entity:['case','timeline','events'].includes(lane)?entity:undefined}));},
  more:()=>track(owner.more(laneFor(scene))),retry(){if(scene==='warranty-detail'){const lanes=['case','timeline'].filter(lane=>owner.snapshot(lane).issue);return track(Promise.all(lanes.map(lane=>owner.retry(lane))));}return track(owner.retry(laneFor(scene)));},restart(){const lane=scene==='warranty-detail'&&owner.snapshot('case').restartRequired?'case':laneFor(scene);return track(owner.restart(lane));},
  async openComponents(){if(scene!=='warranty-detail'||!active)return false;const target=owner.caseHistoryTarget();if(!target||target.caseId!==entity)return false;onComponents(target);return true;},
  componentsAvailable(){try{return scene==='warranty-detail'&&!!owner.caseHistoryTarget();}catch{return false;}},
  idle:()=>Promise.all([...pending]),
  hide(){active=false;for(const lane of ['cases','case','timeline','sessions','events'])owner.cancel(lane);},
  dispose:()=>owner.dispose(),
 };
}
