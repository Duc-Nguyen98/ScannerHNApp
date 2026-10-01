// User-authorized synthetic warranty dataset (P09 r09). Never WMS records.
// Single case/event/ledger source for P09 and warranty history. No customer contact is sent.
const profiles=[
 {customer:'Công ty Minh Phát',contact:'0901 234 567',faultId:'power-off',fault:'Máy không lên nguồn',diagnosis:'Máy không lên nguồn, kiểm tra nguồn và bo mạch.',note:'Khách hàng yêu cầu kiểm tra tổng thể và vệ sinh máy.',accessories:'Adapter nguồn 24V, cáp USB, 01 cuộn tem'},
 {customer:'Đại lý Thành Công',contact:'0902 345 678',faultId:'no-scan',fault:'Không quét được mã vạch',diagnosis:'Cáp USB tiếp xúc chập chờn; bộ phận đọc mã hoạt động bình thường khi đổi cáp.',note:'Khách đã kiểm tra thiết bị tại quầy và nhận đủ phụ kiện.',accessories:'Cáp USB, chân đế',result:'Đã thay cáp USB, kiểm tra quét liên tục 30 lượt. Thiết bị hoạt động ổn định.'},
 {customer:'Cửa hàng An Khang',contact:'0903 456 789',faultId:'paper-sensor',fault:'Không nhận giấy / Tem',diagnosis:'',note:'Máy báo hết giấy dù đã lắp cuộn tem. Khách gửi kèm cuộn tem đang sử dụng để kiểm tra.',accessories:'Adapter nguồn 24V, 01 cuộn tem 50×30 mm'},
 {customer:'Siêu thị Minh Tâm',contact:'0904 567 890',faultId:'lan',fault:'Không kết nối mạng LAN',diagnosis:'Địa chỉ IP trên thiết bị không cùng lớp mạng sau khi đổi router; phần cứng bình thường.',note:'Đã hướng dẫn nhân viên cửa hàng cách kiểm tra cấu hình mạng.',accessories:'Adapter nguồn, cáp mạng LAN',result:'Đã cấu hình lại mạng LAN và kiểm tra kết nối trên máy khách. Không cần thay linh kiện.'},
 {customer:'Công ty Phúc An',contact:'0905 678 901',faultId:'broken-print',fault:'Bản in bị sọc / Đứt nét',diagnosis:'Đầu in có điểm nhiệt suy giảm, trục lăn mòn khiến tem đi không đều.',note:'Ưu tiên xử lý trước đợt kiểm kê. Khách đề nghị gọi khi thiết bị sẵn sàng nhận.',accessories:'Adapter nguồn 24V, cáp USB, 02 cuộn tem',result:'Đã thay đầu in và trục lăn, hiệu chuẩn cảm biến, in thử 20 tem đạt yêu cầu.'},
 {customer:'Nhà thuốc Bình An',contact:'0906 789 012',faultId:'button',fault:'Nút bấm không hoạt động',diagnosis:'Tiếp điểm cụm nút kích hoạt bị mòn, cần thay cụm nút.',note:'Khách đã kiểm tra quét mã và nhận lại thiết bị trong ngày.',accessories:'Cáp USB, dây đeo',result:'Đã thay cụm nút kích hoạt, vệ sinh thiết bị và kiểm tra chức năng quét.'},
 {customer:'Công ty Sông Việt',contact:'0907 890 123',faultId:'usb',fault:'Không kết nối USB',diagnosis:'Máy không nhận lệnh in sau khi cập nhật driver; đang kiểm tra cấu hình cổng USB và phần mềm.',note:'Nguồn và cơ cấu cấp tem bình thường. Khách đã cung cấp phiên bản phần mềm đang sử dụng.',accessories:'Adapter nguồn 24V, cáp USB'},
 {customer:'Đại lý Nam Phương',contact:'0908 901 234',faultId:'usb',fault:'Không kết nối USB',diagnosis:'Bo giao tiếp USB không ổn định, kiểm tra cổng kết nối và thay bo tương ứng.',note:'Khách đã kiểm tra thiết bị, xác nhận đủ phụ kiện và nhận lại tại quầy.',accessories:'Cáp USB, chân đế',result:'Đã thay bo giao tiếp USB và kiểm tra kết nối liên tục. Thiết bị hoạt động bình thường.'},
];
const component=(code,sku,name,quantity)=>({code,sku,name,quantity});
const ledger=[
 {id:'XLK-0002',caseId:'BH-001',day:'2026-09-10',time:'14:45',lines:[component('LK0001-HN001','LK-0001','Đầu in nhiệt XP-420B',1),component('BOX-LK-0002-01','LK-0002','Adapter nguồn 24V',2)]},
 {id:'XLK-0003',caseId:'BH-002',day:'2026-09-10',time:'09:15',lines:[component('LK0004-HN011','LK-0004','Cáp tín hiệu USB',1)]},
 {id:'XLK-0004',caseId:'BH-005',day:'2026-09-15',time:'11:10',lines:[component('LK0001-HN012','LK-0001','Đầu in nhiệt XP-420B',1),component('LK0003-HN008','LK-0003','Trục lăn máy in XP-420B',1)]},
 {id:'XLK-0005',caseId:'BH-006',day:'2026-09-16',time:'09:10',lines:[component('LK0005-HN006','LK-0005','Cụm nút kích hoạt',1)]},
 {id:'XLK-0006',caseId:'BH-008',day:'2026-09-18',time:'09:15',lines:[component('LK0006-HN004','LK-0006','Bo giao tiếp USB',1)]},
].map(d=>({...d,status:'POSTED',version:d.id==='XLK-0002'?3:1,actor:'Minh Anh',warehouse:'Kho Hoa Nam',at:d.day.split('-').reverse().join('/')+' '+d.time}));
const freeze=x=>{Object.values(x).forEach(v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v))freeze(v);});return Object.freeze(x);};
export const WARRANTY_LEDGER=freeze(ledger);
export const WARRANTY_SEED=freeze(Array.from({length:8},(_,i)=>{
 const id='BH-'+String(i+1).padStart(3,'0'),closed=i%2===1,day='2026-09-'+String(i<2?10:11+i).padStart(2,'0'),time=i===0?'14:35':i===1?'11:20':'10:'+String(20+i);
 const model=i%2?'Máy quét mã vạch ZD421':'Máy in nhiệt XP-420B',serial=i<2?'HN'+(12345+i):'SN-'+(i%2?'ZD421':'XP420B')+'-'+String(200+i),actor=i<2||i%3?'Minh Anh':'Lan Nguyễn';
 const status=i===2?'Đã tiếp nhận':i===4?'Chờ bàn giao':closed?'Đã trả khách':'Đang kiểm tra';
 let events=i===0?[{label:'Đã tiếp nhận',day:'2026-09-10',time:'08:32'},{label:'Đang kiểm tra',day:'2026-09-10',time:'14:30'}]:i===1?[{label:'Đã tiếp nhận',day:'2026-09-09',time:'16:10'},{label:'Hoàn tất sửa chữa',day:'2026-09-10',time:'10:45'},{label:'Đã trả khách',day:'2026-09-10',time:'11:20'}]:closed?[{label:'Đã tiếp nhận',time:'08:30'},{label:'Hoàn tất sửa chữa',time:'10:15'},{label:status,time}]:[{label:'Đã tiếp nhận',time:'08:32'},{label:'Đang kiểm tra',time}];
 if(i===2)events=events.slice(0,1);
 if(i===4)events.push({label:'Hoàn tất sửa chữa',time:'14:50'},{label:'Chờ bàn giao',time:'15:40'});
 const profile=profiles[i];
 events=events.map((e,j)=>({...e,day:e.day||day,id:id+'-E'+(j+1),actor,description:e.label==='Đã tiếp nhận'?profile.customer+' · '+profile.fault:e.label==='Đang kiểm tra'?profile.diagnosis:e.label==='Hoàn tất sửa chữa'?profile.result:e.label==='Đã trả khách'?'Khách đã kiểm tra thiết bị và nhận đủ phụ kiện.':'Thiết bị đã sẵn sàng; chờ khách nhận theo quy trình.'}));
 for(const doc of ledger.filter(d=>d.caseId===id))events.push({id:id+'-'+doc.id,label:'Đã xuất linh kiện',day:doc.day,time:doc.time,actor:doc.actor,documentId:doc.id,description:doc.id+' · '+doc.lines.length+' mã · '+doc.lines.reduce((n,l)=>n+l.quantity,0)+' linh kiện'});
 events.sort((a,b)=>a.day.localeCompare(b.day)||a.time.localeCompare(b.time));
 const latest=events.at(-1);
 return {id,model,serial,status,day:latest.day,time:latest.time,actor,warehouse:'Kho Hoa Nam',version:1,customerId:'KH-HN-'+String(i+1).padStart(3,'0'),...profile,ledgerKnown:true,events};
}));
let cases=structuredClone(WARRANTY_SEED);
export const readWarrantyCases=()=>structuredClone(cases);
// Read-only UI grouping of existing case statuses, not a new backend status.
export const isOpenWarrantyCase = row => ['Đã tiếp nhận','Đang kiểm tra','Chờ bàn giao'].includes(row.status);
export function writeWarrantyCase(row){const i=cases.findIndex(c=>c.id===row.id);if(i<0)cases.push(structuredClone(row));else cases[i]=structuredClone(row);}
export function resetWarrantyCases(){cases=structuredClone(WARRANTY_SEED);}
