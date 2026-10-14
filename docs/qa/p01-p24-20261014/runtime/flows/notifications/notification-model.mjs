import {sessionGuard} from '../home/home-flow.mjs';
import {FIXTURE_NAMESPACE} from '../auth-session/fixture-adapter.mjs';

// Explicitly local review events. No notification service/API or backend permission is defined here.
export const PREVIEW_NAMESPACE='hn-scanner-notifications-preview-v1';
export function canReadPreview(state){return !sessionGuard(state)&&state.session.namespace===FIXTURE_NAMESPACE&&state.session.warehouse?.id==='fixture-hoa-nam'&&!!state.session.actor?.id&&!!state.session.authSessionId;}
export const scopeKey=state=>canReadPreview(state)?[state.session.authSessionId,state.session.actor.id,state.session.warehouse.id].join(':'):null;
export const scopedDocuments=(state,rows)=>canReadPreview(state)?rows.filter(r=>r.warehouseId===state.session.warehouse.id):[];
export const waitingDocuments=(state,rows,type='all')=>scopedDocuments(state,rows).filter(r=>r.status==='waiting'&&['inbound','outbound'].includes(r.type)&&(type==='all'||r.type===type));

function seedEvents(){return [
 {id:'p13-event-inbound',type:'inbound',title:'Phiếu nhập PN-0005 đã gửi lên Web',description:'Minh Anh đã gửi phiếu nhập PN-0005. Phiếu đang chờ xử lý trên Web, chưa ghi sổ.',documentId:'fixture-inbound-0005',day:'2026-09-09',time:'09:20',actor:'Minh Anh',read:false},
 {id:'p13-event-warehouse',type:'documents',title:'Thông báo từ Kho Hoa Nam',description:'Dự kiến có hàng về trong ngày 09/09/2026. Vui lòng sắp xếp khu vực nhận hàng.',documentId:null,day:'2026-09-09',time:'08:45',actor:'Điều phối kho',read:false},
 {id:'p13-event-warranty',type:'warranty',title:'Cập nhật phiếu bảo hành BH-001',description:'Phiếu BH-001 đã được cập nhật thông tin xử lý. Xem hồ sơ để đối chiếu trạng thái hiện tại.',documentId:'b12-warranty-001',day:'2026-09-09',time:'07:30',actor:'Minh Anh',read:false},
 {id:'p13-event-outbound',type:'outbound',title:'Phiếu xuất PX-0004 đã ghi sổ',description:'Phiếu xuất kho PX-0004 đã được ghi sổ trên Web. Xem chứng từ để đối chiếu thông tin.',documentId:'b12-outbound-0004',day:'2026-09-08',time:'17:30',actor:'Lan Nguyễn',read:true},
 {id:'p13-event-nfc',type:'nfc',title:'Thiết bị NFC sẵn sàng',description:'Thông báo kết nối thiết bị NFC đã được ghi nhận. Thông báo này không xác nhận tình trạng kết nối hiện tại; kiểm tra thiết bị tại màn Thẻ NFC.',documentId:null,day:'2026-09-08',time:'10:10',actor:'Hệ thống',read:true}
].map(r=>({...r,warehouseId:'fixture-hoa-nam',warehouse:'Kho Hoa Nam',version:1}));}

export const NOTIFICATION_PAGE_SIZE=10;
const orderKey=r=>[r.day,r.time,r.id].join('|');
const newestFirst=(a,b)=>orderKey(b).localeCompare(orderKey(a));
function extendedEvents(){
 const topics=[['Chuẩn bị khu vực nhận hàng','Sắp xếp lối đi và vị trí kiểm đếm trước khi nhận hàng trong ca.'],['Kiểm tra nhãn hàng hóa','Đối chiếu nhãn SKU và serial với chứng từ khi kiểm đếm; ghi nhận chênh lệch để theo dõi.'],['Bàn giao công việc cuối ca','Kiểm tra các phiếu đang chờ xử lý và ghi rõ công việc cần tiếp tục khi bàn giao.'],['Sắp xếp khu vực đóng gói','Chuẩn bị vật tư đóng gói theo kế hoạch xuất hàng, giữ lối đi thông thoáng.']];
 return [...seedEvents(),...Array.from({length:32},(_,i)=>({id:`p13-review-${String(i).padStart(3,'0')}`,type:'documents',title:topics[i%4][0],description:topics[i%4][1],documentId:null,day:`2026-08-${String(31-Math.floor(i/2)).padStart(2,'0')}`,time:i%2?'08:30':'16:00',actor:'Điều phối kho',read:i%3===0,warehouseId:'fixture-hoa-nam',warehouse:'Kho Hoa Nam',version:1}))];
}
function countReviewEvents(count){const templates=extendedEvents().slice(5);return Array.from({length:count},(_,i)=>({...templates[i%templates.length],id:'p13-count-review-'+String(i).padStart(5,'0'),read:false}));}
export function createNotificationPreview({getState,delay=180,seed=seedEvents}={}){
 const stores=new Map(),pending=new Map();let disposed=false,generation=0,seedFactory=seed,pageCalls=0;
 function rows(){const key=scopeKey(getState());if(!key||disposed)return [];if(!stores.has(key))stores.set(key,structuredClone(seedFactory()).sort(newestFirst));return stores.get(key);}
 return {
  namespace:PREVIEW_NAMESPACE,
  scope:()=>scopeKey(getState())?scopeKey(getState())+':'+generation:null,
  list:()=>rows().map(r=>({...r})),
  read:id=>{const r=rows().find(r=>r.id===id);return r?{...r}:null;},
  unread:()=>canReadPreview(getState())?rows().filter(r=>!r.read).length:null,
  // Local preview paging only. Cursor is never an assumed WMS API field.
  async loadPage({filter='unread',cursor=null,fail=false}={}){
   const scope=scopeKey(getState()),requestGeneration=generation;pageCalls++;
   if(!scope||disposed||!['all','unread'].includes(filter))return {kind:'denied'};
   if(cursor&&(cursor.scope!==scope||cursor.generation!==generation||cursor.filter!==filter))return {kind:'denied'};
   await new Promise(resolve=>setTimeout(resolve,delay));
   if(disposed||scope!==scopeKey(getState())||generation!==requestGeneration)return {kind:'stale'};
   if(fail)return {kind:'error'};
   const matching=rows().filter(r=>filter==='all'||!r.read),remaining=matching.filter(r=>!cursor||orderKey(r).localeCompare(cursor.before)<0),items=remaining.slice(0,NOTIFICATION_PAGE_SIZE);
   return {kind:'page',items:items.map(r=>({...r})),total:matching.length,nextCursor:remaining.length>items.length?{scope,generation,filter,before:orderKey(items.at(-1))}:null};
  },
  useReviewDataset(name){generation++;stores.clear();pending.clear();const match=/^count-(0|1|9|10|99|100|999|1000)$/.exec(name);seedFactory=match?()=>countReviewEvents(Number(match[1])):name==='extended'?extendedEvents:seed;},
  metrics:()=>({pageCalls}),
  markRead(id,{fail=false}={}){
   const key=scopeKey(getState()),row=rows().find(r=>r.id===id);if(!key||!row)return Promise.resolve({kind:'denied'});
   if(row.read)return Promise.resolve({kind:'verified',id});
   const requestKey=key+':'+id;if(pending.has(requestKey))return pending.get(requestKey);
   const version=row.version,requestGeneration=generation;
   const request=new Promise(resolve=>setTimeout(()=>{
    pending.delete(requestKey);
    if(disposed||scopeKey(getState())!==key||generation!==requestGeneration)return resolve({kind:'stale'});
    if(fail)return resolve({kind:'error'});
    if(row.version!==version)return resolve({kind:'conflict'});
    row.read=true;row.version++;resolve({kind:'verified',id});
   },delay));pending.set(requestKey,request);return request;
  },
  dispose(){disposed=true;stores.clear();}
 };
}
