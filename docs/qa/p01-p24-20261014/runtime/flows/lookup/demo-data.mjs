// User-authorized DEMO data (2026-09-26), never backend inventory/audit records.
// Existing B06 item totals and HN12345 baseline events remain unchanged.
const asset=name=>new URL(`./assets/demo/${name}.png`,import.meta.url).href;
const position=(id,total,available,held,unavailable)=>({id,total,available,held,unavailable});
export const DEMO_ITEM_DETAILS={
 HN12345:{images:[asset('printer-white'),asset('box')],imageLabels:['Máy in','Đóng gói']},
 HN12346:{serial:'SN-XP420B-BK-0008',stock:{total:8,available:8,held:0,unavailable:0},description:'Máy in nhiệt màu đen, dùng in tem nhãn hàng hóa trong kho.',locations:[position('B-02-01',5,5,0,0),position('B-02-02',3,3,0,0)],images:[asset('printer-black'),asset('box')],imageLabels:['Máy in đen','Đóng gói']},
 HN12347:{group:'Vật tư tiêu hao',brand:'Hoa Nam',unit:'Cuộn',description:'Cuộn giấy in nhiệt khổ 80 mm, dùng cho máy in hóa đơn. Bảo quản nơi khô ráo.',stock:{total:150,available:145,held:3,unavailable:2},locations:[position('C-01-02',100,97,2,1),position('C-01-03',50,48,1,1)],images:[asset('paper-roll')],imageLabels:['Giấy in nhiệt']},
 HN12348:{group:'Phụ kiện máy in',brand:'Hoa Nam',description:'Dây nguồn màu đen, dùng cấp điện cho thiết bị tại quầy và kho.',stock:{total:25,available:25,held:0,unavailable:0},locations:[position('A-02-01',15,15,0,0),position('A-02-02',10,10,0,0)],images:[asset('power-cable')],imageLabels:['Dây nguồn']},
 HN12349:{group:'Vật tư bảo dưỡng',brand:'Hoa Nam',unit:'Bộ',description:'Bộ vệ sinh đầu in gồm que lau và bút vệ sinh. Lô hàng đã xuất hết.',locations:[position('D-01-01',0,0,0,0)],images:[asset('cleaning-kit')],imageLabels:['Bộ vệ sinh']},
 'LK0001-HN001':{name:'Trục lăn máy in XP-420B',group:'Linh kiện máy in',brand:'Hoa Nam',location:'D-02-01',description:'Trục lăn cao su dùng thay thế khi bảo dưỡng máy in. Dùng trong bảo dưỡng thiết bị.',stock:{total:24,available:20,held:3,unavailable:1},locations:[position('D-02-01',14,12,1,1),position('D-02-02',10,8,2,0)],images:[asset('component')],imageLabels:['Trục lăn']},
};
// Explicit immutable event fixtures. Signed quantity is authored per event,
// never inferred from type/current status. This is a partial historical window,
// not a complete ledger to recompute current stock.
const historyRows={
 HN12346:[
 ['09','15:40','inbound',5,'Nhận máy từ NCC Thiên Phát','PN-DEMO-020'],
 ['08','10:20','outbound',-2,'Giao Đại lý Minh Phát','PX-DEMO-021'],
 ['07','14:15','warranty',1,'Nhận lại máy sau bảo hành','BH-DEMO-022'],
 ['05','09:30','inbound',6,'Bổ sung máy in màu đen','PN-DEMO-023'],
 ['03','16:00','outbound',-3,'Giao cửa hàng Hồng Hà','PX-DEMO-024'],
 ['02','08:45','warranty',-1,'Gửi máy kiểm tra bảo hành','BH-DEMO-025'],
 ],
 HN12347:[
 ['09','13:10','inbound',100,'Nhập lô giấy in 80 mm','PN-DEMO-030'],
 ['08','11:45','outbound',-20,'Cấp giấy cho quầy bán hàng','PX-DEMO-031'],
 ['06','08:30','inbound',80,'Nhận giấy từ NCC An Khang','PN-DEMO-032'],
 ['04','15:20','outbound',-10,'Giao Đại lý Minh Phát','PX-DEMO-033'],
 ['03','09:50','outbound',-5,'Cấp dùng cho kho Hoa Nam','PX-DEMO-034'],
 ['01','08:15','inbound',50,'Nhận lô giấy đầu tháng','PN-DEMO-035'],
 ],
 HN12348:[
 ['09','10:10','inbound',20,'Nhận dây nguồn từ NCC An Khang','PN-DEMO-040'],
 ['08','14:00','outbound',-4,'Giao kèm máy in cho khách','PX-DEMO-041'],
 ['07','09:20','warranty',-1,'Cấp dây thay thế bảo hành','BH-DEMO-042'],
 ['05','16:30','inbound',15,'Nhập bổ sung phụ kiện','PN-DEMO-043'],
 ['03','11:10','warranty',1,'Nhận lại dây sau kiểm tra','BH-DEMO-044'],
 ['01','15:00','outbound',-6,'Giao phụ kiện cho đại lý','PX-DEMO-045'],
 ],
 HN12349:[
 ['09','16:20','outbound',-2,'Xuất 2 bộ cuối cùng trong lô hàng','PX-DEMO-050'],
 ['08','10:30','outbound',-3,'Cấp bộ vệ sinh cho kỹ thuật','PX-DEMO-051'],
 ['06','09:45','inbound',5,'Nhập bộ vệ sinh đầu in','PN-DEMO-052'],
 ['04','14:10','outbound',-4,'Giao bộ vệ sinh cho đại lý','PX-DEMO-053'],
 ['02','08:40','inbound',4,'Nhận vật tư bảo dưỡng','PN-DEMO-054'],
 ],
 'LK0001-HN001':[
 ['09','14:30','warranty',-2,'Cấp trục lăn cho hồ sơ bảo hành','BH-DEMO-060'],
 ['08','09:00','inbound',12,'Nhận lô trục lăn thay thế','PN-DEMO-061'],
 ['07','15:10','warranty',1,'Thu hồi linh kiện còn sử dụng được','BH-DEMO-062'],
 ['05','10:45','warranty',0,'Kiểm tra linh kiện — không đổi tồn','BH-DEMO-063'],
 ['03','13:20','outbound',-3,'Cấp linh kiện cho bộ phận kỹ thuật','PX-DEMO-064'],
 ['01','08:50','inbound',20,'Nhập linh kiện đầu tháng','PN-DEMO-065'],
 ],
};
export const DEMO_EVENTS=Object.entries(historyRows).flatMap(([code,rows])=>rows.map(([day,time,type,quantity,description,documentNo],i)=>({
 id:`fixture-demo-event-${code}-${i+1}`,itemId:code==='LK0001-HN001'?'fixture-component-01':`fixture-item-${code}`,warehouseId:'fixture-hoa-nam',
 date:`2026-09-${day}`,time,type,quantity,description,documentId:`fixture-${documentNo}`,documentNo,
 status:'Thành công',canOpenDocument:false,source:'DEMO',
})));
