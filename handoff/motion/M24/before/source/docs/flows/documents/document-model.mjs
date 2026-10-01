import {foldSearch,INBOUND_SUPPLIERS} from '../inbound/catalogue.mjs';
import {DATA} from '../history/history-model.mjs';
import {readWarrantyCases} from '../shared/warranty-cases.mjs';
// Read-only B12 design fixtures, not a WMS schema or persistence layer.
export const TYPES={inbound:'Nhập kho',outbound:'Xuất kho',warranty:'Bảo hành'};
export const STATUSES={waiting:'Chờ xử lý trên Web',posted:'Đã ghi sổ',processing:'Đang xử lý',warrantyWaiting:'Chờ duyệt',received:'Đã tiếp nhận',checking:'Đang kiểm tra',ready:'Chờ bàn giao',returned:'Đã trả khách'};
const lines=[
 {id:'b12-line-1',name:'Máy in nhiệt XP-420B',sku:'XP-420B',quantity:5,serialCount:5,unit:'Cái',image:new URL('../lookup/assets/demo/box.png',import.meta.url).href},
 {id:'b12-line-2',name:'Đầu in ZD421',sku:'ZD421',quantity:4,serialCount:4,unit:'Cái',image:null},
 {id:'b12-line-3',name:'Máy quét DS2208',sku:'DS2208',quantity:2,serialCount:2,unit:'Cái',image:null}
];
const seeds=[
 ['fixture-inbound-0005','PN-0005','inbound','2026-09-09','08:32','Công ty Minh Phát','waiting'],
 ['b12-outbound-0004','PX-0004','outbound','2026-09-08','15:20','Đại lý Minh Phát','posted'],
 ['b12-warranty-001','BH-001','warranty','2026-09-07','14:15','Công ty Minh Phát','processing'],
 ['b12-inbound-0004','PN-0004','inbound','2026-09-05','09:10','Công ty An Khang','posted'],
 ['b12-outbound-0003','PX-0003','outbound','2026-09-03','16:25','Cửa hàng Thịnh Phát','posted'],
 ['b12-warranty-002','BH-002','warranty','2026-09-02','11:20','Công ty Minh Phát','warrantyWaiting']
];
// Authorized realistic test data (2026-09-28), entirely local; no WMS connection.
const serialLine=(line,docId,index)=>({...line,id:docId+':line:'+index,serials:Array.from({length:line.quantity},(_,j)=>`SN-${line.sku.replace(/[^A-Z0-9]/g,'')}-${docId.replace(/[^0-9]/g,'').padStart(4,'0')}-${index+1}${String(j+1).padStart(3,'0')}`)});
const makeEvents=(id,day,time,actor,posted)=>[
 {id:id+':created',day,time:'08:00',label:'Tạo chứng từ',actor,description:'Ghi nhận thông tin đối tác và Kho Hoa Nam.'},
 {id:id+':checked',day,time:'08:15',label:'Kiểm tra sản phẩm',actor,description:'Đối chiếu số lượng và serial theo các dòng chứng từ.'},
 {id:id+':sent',day,time,label:'Gửi phiếu lên Web',actor,description:'Phiếu đã gửi, chưa ghi sổ.'},
 ...(posted?[{id:id+':posted',day,time:'17:30',label:'Đã ghi sổ trên Web',actor:'Lan Nguyễn',description:'Hoàn tất đối chiếu chứng từ trên hệ thống Web.'}]:[])
];
const stockSeeds=seeds.filter(r=>r[2]!=='warranty');
for(let i=0;i<12;i++){
 const inbound=i%2===0,number=(inbound?'PN-':'PX-')+String(6+Math.floor(i/2)).padStart(4,'0');
 stockSeeds.push(['p12-stock-'+number,number,inbound?'inbound':'outbound','2026-09-'+String(16+i).padStart(2,'0'),i%3?'09:20':'14:35',['Công ty Phúc An','Đại lý Nam Phương','Công ty Thiên Long','Cửa hàng An Bình'][i%4],i%3===0?'waiting':'posted']);
}
const stockDocuments=stockSeeds.map(([id,number,type,day,time,partner,status],i)=>{
 const selected=i===0?lines:lines.slice(i%2,i%2+1+(i%3===0?1:0)).map((l,j)=>({...l,quantity:2+(i+j)%7,serialCount:2+(i+j)%7}));
 return {id,number,type,day,time,partner,status,warehouseId:'fixture-hoa-nam',warehouse:'Kho Hoa Nam',actor:i%4===0?'Minh Anh':'Lan Nguyễn',version:'p12-data-r02',note:i===0?'Nhập hàng theo đơn đặt hàng số ĐH-2026-0091':type==='inbound'?`Nhận hàng theo đơn ĐH-2026-${String(90+i).padStart(4,'0')}. Đã kiểm tra bao bì và số lượng trước khi bàn giao.`:`Giao hàng cho ${partner}. Đối chiếu serial và phụ kiện theo phiếu trước khi đóng gói.`,lines:selected.map((l,j)=>serialLine(l,id,j)),historyRecordId:i===0?'LS-0001':null,events:i===0?null:makeEvents(id,day,time,i%4===0?'Minh Anh':'Lan Nguyễn',status==='posted'),attachments:i===0?[
 {id:'b12-attachment-1',name:'BienBanKiemDem_PN-0005.pdf',size:'77.4 KB',url:new URL('./assets/BienBanKiemDem_PN-0005.pdf',import.meta.url).href},
 {id:'b12-attachment-2',name:'PhieuNhap_PN-0005.pdf',size:'77.1 KB',url:new URL('./assets/PhieuNhap_PN-0005.pdf',import.meta.url).href}]:[]};
});
// Long read-only note case: source data can exceed the input policy of new P04/P05 drafts.
stockDocuments.find(r=>r.number==='PN-0010').note=[
 'Lô hàng phục vụ đợt bổ sung thiết bị cho các điểm bán trong tháng 10. Khi nhận hàng, đối chiếu từng serial trên tem sản phẩm với danh sách đóng gói và giữ nguyên nhãn của nhà cung cấp.',
 'Kiểm tra riêng hộp phụ kiện đi kèm: adapter nguồn, cáp kết nối và tài liệu hướng dẫn. Nếu thiếu phụ kiện, ghi rõ mã sản phẩm liên quan để bộ phận mua hàng làm việc với nhà cung cấp; không tự thay thế bằng phụ kiện của lô khác.',
 'Các kiện hàng được sắp theo nhóm sản phẩm để thuận tiện kiểm đếm. Bao bì cần khô ráo, không móp góc; chụp lại vị trí bất thường trước khi mở kiện và chuyển thông tin cho người phụ trách.',
 'Chứng từ và hàng thực nhận phải được đối chiếu đầy đủ trước khi hoàn tất bàn giao. Ghi chú này được lưu nguyên văn để các ca sau tiếp tục theo dõi.'
].join('\n\n');
// User-requested downloadable case on the current review document PX-0011.
const attachedExport=stockDocuments.find(r=>r.number==='PX-0011');
attachedExport.attachments=[
 {id:'p12-px0011-receipt',title:'Phiếu xuất kho',kind:'receipt',name:'PhieuXuat_PX-0011.pdf',size:'76.8 KB',pages:1,url:new URL('./assets/PhieuXuat_PX-0011.pdf',import.meta.url).href},
 {id:'p12-px0011-handover',title:'Biên bản giao nhận',kind:'handover',name:'BienBanGiaoNhan_PX-0011.pdf',size:'76.9 KB',pages:1,url:new URL('./assets/BienBanGiaoNhan_PX-0011.pdf',import.meta.url).href}
];
const warrantyStatus={'Đã tiếp nhận':'received','Đang kiểm tra':'checking','Chờ bàn giao':'ready','Đã trả khách':'returned'};
export function warrantyDocuments(){return readWarrantyCases().map(c=>({id:c.id==='BH-001'?'b12-warranty-001':c.id==='BH-002'?'b12-warranty-002':'p12-warranty-'+c.id,caseId:c.id,number:c.id,type:'warranty',day:c.day,time:c.time,partner:c.customer,status:warrantyStatus[c.status]||'processing',warehouseId:'fixture-hoa-nam',warehouse:c.warehouse,actor:c.actor,version:c.version,note:c.note,lines:[{id:c.id+':product',name:c.model,sku:c.serial.startsWith('SN-')?c.serial.split('-').slice(1,-1).join('-'):c.model.includes('XP-420B')?'XP-420B':'ZD421',quantity:1,serialCount:1,serials:[c.serial],unit:'Cái',image:null}],attachments:[],historyRecordId:null,events:c.events}));}
export const DOCUMENTS=[...stockDocuments,...warrantyDocuments()];
export const initialFilters=()=>({q:'',type:'all',from:'',to:'',status:'all',sort:'desc'});
export function selectDocuments(filters,rows=DOCUMENTS){
 const selected=rows.filter(r=>(filters.type==='all'||r.type===filters.type)&&(filters.status==='all'||r.status===filters.status)&&(!filters.from||r.day>=filters.from)&&(!filters.to||r.day<=filters.to)&&foldSearch([r.number,TYPES[r.type],r.partner].join(' ')).includes(foldSearch(filters.q)));
 return filters.sort==='source'?selected:selected.sort((a,b)=>((a.day+a.time).localeCompare(b.day+b.time)||a.id.localeCompare(b.id))*(filters.sort==='asc'?1:-1));
}
export const readDocument=id=>DOCUMENTS.find(r=>r.id===id)||null;
export function totals(rows){return {quantity:rows&&rows.every(r=>Number.isFinite(r.quantity))?rows.reduce((n,r)=>n+r.quantity,0):null,skuCount:rows&&rows.every(r=>r.sku)?new Set(rows.map(r=>r.sku)).size:null};}
export const selectLines=(rows,q)=>(rows||[]).filter(r=>foldSearch([r.name,r.sku,...(r.serials||[]),...(r.codes||[])].join(' ')).includes(foldSearch(q)));
export const documentEvents=doc=>doc?.events|| (doc?.historyRecordId?DATA.records.find(r=>r.id===doc.historyRecordId)?.events||null:null);
// P04/P05 remain the sole owners. Only verified in-memory record receipts enter P12.
export function recordedDocuments(sources,session){
 return sources.flatMap(({type,runs})=>runs.filter(s=>s.recorded===true&&s.outcome==='recorded'&&s.document?.warehouseId===session?.warehouse?.id&&s.document?.actorId===session?.actor?.id).map(s=>{
  const d=s.document,groups=new Map();
  for(const row of s.accepted){if(!groups.has(row.sku))groups.set(row.sku,[]);groups.get(row.sku).push(row);}
  const stamp=/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2})$/.exec(d.createdAt||'');
  return {id:d.documentId,number:d.number,type,day:stamp?`${stamp[3]}-${stamp[2]}-${stamp[1]}`:'',time:stamp?.[4]||'',partner:type==='inbound'?d.supplier:d.recipient,status:'waiting',warehouseId:d.warehouseId,warehouse:d.warehouseName,actor:d.actorName,version:d.version,note:d.note,historyRecordId:null,events:[{id:d.documentId+':receipt',day:stamp?`${stamp[3]}-${stamp[2]}-${stamp[1]}`:'',time:stamp?.[4]||'',label:'Gửi phiếu lên Web',actor:d.actorName,description:'Đã đối chiếu kết quả ghi nhận. Phiếu chưa ghi sổ.'}],attachments:[],lines:[...groups].map(([sku,rows])=>({id:d.documentId+':'+sku,sku,name:lines.find(l=>l.sku===sku)?.name||sku,quantity:rows.reduce((n,r)=>n+r.quantity,0),serialCount:null,codes:rows.map(r=>r.raw),unit:'Cái',image:lines.find(l=>l.sku===sku)?.image||null}))};
 }));
}
export function mergeDocuments(recorded){const live=[...warrantyDocuments(),...recorded],ids=new Set(live.map(r=>r.id));return [...DOCUMENTS.filter(r=>!ids.has(r.id)),...new Map(live.map(r=>[r.id,r])).values()];}
export function creationErrors(form){const errors={};if(!Object.hasOwn(TYPES,form.type))errors.type='Chọn nghiệp vụ hợp lệ.';if(form.type==='inbound'&&!INBOUND_SUPPLIERS.some(s=>s.id===form.supplierId))errors.supplier='Vui lòng chọn nhà cung cấp trong danh sách.';if(typeof form.note!=='string'||form.note.length>200)errors.note='Ghi chú tối đa 200 ký tự.';return errors;}
