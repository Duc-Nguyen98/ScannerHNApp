import {readWarrantyCases} from '../shared/warranty-cases.mjs';
import '../shared/history-fixtures.js';
const base=globalThis.HN_HISTORY_FIXTURES;
const freeze=x=>{Object.values(x).forEach(v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v))freeze(v);});return Object.freeze(x);};
// Authorized sample extension. Original B08 records remain unchanged.
const nfcEvents=[...base.nfcEvents,...Array.from({length:6},(_,i)=>({
 id:'NFC-E'+String(i+4).padStart(3,'0'),type:['Gán thẻ','Thay thẻ','Thu hồi thẻ'][i%3],
 day:'2026-09-'+String(12+i).padStart(2,'0'),time:'09:'+String(20+i),uid:'NFC-'+['9C31','6D20','4E18','2F44','1A90','3B72'][i],
 serial:'HN'+(12345+i%5),actor:['Minh Anh','Lan Nguyễn'][i%2],status:i%3===2?'Đã thu hồi':'Thành công'
}))];
const warrantyCases=readWarrantyCases();
function scanRows(id,total,duplicate,quantity){
 return Array.from({length:total},(_,i)=>{const dup=i>=total-duplicate,code='SN-XP420B-'+id.replace('PQ-','')+'-'+String(dup?1:i+1).padStart(3,'0');return {id:id+'-SCAN-'+(i+1),sessionId:id,code,sku:'XP-420B',serial:code,uid:null,time:'09:'+String(10+i).padStart(2,'0')+':00',result:dup?'duplicate':'accepted',quantity:dup?0:(i===0?quantity-(total-duplicate-1):1)};});
}
const sessions=base.sessions.map(s=>s.id==='PQ-0001'?s:{
 ...s,actor:s.id==='PQ-0002'?'Minh Anh':'Lan Nguyễn',warehouse:'Kho Hoa Nam',
 quantity:s.quantity??12,events:s.id==='PQ-0002'?scanRows(s.id,12,0,12).map((e,i)=>({...e,time:'11:'+String(10+i).padStart(2,'0')+':00'})):
 [{id:s.id+'-SCAN-1',sessionId:s.id,code:'LK0001-HN001',sku:'LK-0001',serial:'SN-LK-0001',time:'14:31:00',result:'accepted',quantity:1},{id:s.id+'-SCAN-2',sessionId:s.id,code:'BOX-LK-0002-01',sku:'LK-0002',serial:'BOX-LK-0002-01',time:'14:33:00',result:'accepted',quantity:2}]
});
for(let i=4;i<=8;i++){
 const id='PQ-'+String(i).padStart(4,'0'),component=i%2===0,total=5+i,duplicate=i%3===0?1:0,quantity=total-duplicate;
 sessions.push({id,type:component?'Xuất linh kiện':'Nhập kho',day:'2026-09-'+String(10+i),time:'09:00 – 10:00',status:component?'Đã xuất':'Chờ xử lý trên Web',doc:(component?'XLK-':'PN-')+String(200+i).padStart(4,'0'),sessionStatus:'Hoàn thành',total,accepted:total-duplicate,duplicate,quantity,actor:'Minh Anh',warehouse:'Kho Hoa Nam',count:total+' lượt · '+(total-duplicate)+' hợp lệ · '+duplicate+' trùng',events:scanRows(id,total,duplicate,quantity).map((e,j)=>component?{...e,code:'LK'+String(100+(e.result==='duplicate'?0:j)),sku:'LK-'+String((e.result==='duplicate'?0:j)+1).padStart(4,'0'),serial:'SN-LK-'+String(100+(e.result==='duplicate'?0:j))}:e)});
}
export const BUSINESS_DATA=freeze({nfcEvents,warrantyCases,sessions});
export const BUSINESS_CONFIG=Object.freeze({
 nfc:{title:'Lịch sử NFC',tabs:[['Gán thẻ','Gán thẻ'],['Thay thẻ','Thay thẻ'],['Thu hồi thẻ','Thu hồi thẻ']],statuses:{success:'Thành công',revoked:'Đã thu hồi'},placeholder:'Tìm UID, serial hoặc người thao tác'},
 warranty:{title:'Lịch sử bảo hành',tabs:[],statuses:{checking:'Đang kiểm tra',returned:'Đã trả khách',received:'Đã tiếp nhận',handover:'Chờ bàn giao'},placeholder:'Tìm hồ sơ, serial hoặc người thao tác'},
 sessions:{title:'Lịch sử phiên quét',tabs:[['Nhập kho','Nhập kho'],['Xuất linh kiện','Xuất linh kiện'],['Phiên quét mã','Phiên quét mã']],statuses:{waiting:'Chờ xử lý trên Web',exported:'Đã xuất'},statusTitle:'Kết quả chứng từ',placeholder:'Tìm phiên, chứng từ hoặc người thao tác'}
});
export function businessRows(kind){
 if(kind==='nfc')return nfcEvents.map(e=>({...e,label:e.type,documentId:e.uid,warehouse:'Kho Hoa Nam',status:e.status==='Đã thu hồi'?'revoked':'success',events:[{id:e.id+'-EVENT',label:e.type+' · '+e.status,time:e.time,actor:e.actor}],note:'UID: '+e.uid+' · Serial: '+e.serial,attachments:[]}));
 if(kind==='warranty')return readWarrantyCases().map(e=>({...e,label:'Bảo hành',type:'warranty',documentId:e.id,status:({'Đã trả khách':'returned','Đã tiếp nhận':'received','Chờ bàn giao':'handover','Đang kiểm tra':'checking'})[e.status],note:e.model+' · Serial: '+e.serial,attachments:[]}));
 if(kind==='sessions')return sessions.map(s=>({...s,label:s.type,documentId:s.doc,status:s.status==='Đã xuất'?'exported':'waiting',serial:s.events.map(e=>e.serial).join(' ')}));
 return [];
}
const fold=s=>String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/gi,'d').toLowerCase();
export function selectBusiness(kind,f){
 const rows=businessRows(kind).filter(r=>(f.type==='all'||r.type===f.type)&&(!f.from||r.day>=f.from)&&(!f.to||r.day<=f.to)&&(f.status==='all'||r.status===f.status)&&fold([r.id,r.documentId,r.uid,r.serial,r.actor,r.model].join(' ')).includes(fold(f.q.trim())));
 if(f.sort!=='source')rows.sort((a,b)=>(a.day.localeCompare(b.day)||a.time.localeCompare(b.time)||a.id.localeCompare(b.id))*(f.sort==='asc'?1:-1));
 return rows;
}
export const businessSession=id=>sessions.find(s=>s.id===id)||null;
