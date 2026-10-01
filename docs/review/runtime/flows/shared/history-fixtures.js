/* Shared, read-only DESIGN FIXTURES for P08/P22/P23. Not a backend schema.
   Classic script + side-effect module import share one source without a build. */
(() => {
  const names={inbound:'Nhập kho',outbound:'Xuất kho',warranty:'Bảo hành',nfc:'Quét NFC',documents:'Chứng từ'};
  const statuses={waiting:'Chờ xử lý trên Web',processing:'Đang xử lý',linked:'Đã liên kết',recorded:'Đã ghi nhận'};
  const seeds=[['inbound','PN-0005','2026-09-09','08:32','waiting'],['outbound','PX-0005','2026-09-09','10:15','waiting'],['warranty','BH-001','2026-09-08','14:20','processing'],['nfc','TAG-001','2026-09-09','11:05','linked'],['documents','DC-0001','2026-09-07','16:40','recorded'],['inbound','PN-0004','2026-09-06','09:18','waiting']];
  // Explicit disjoint fixture activity scope; never a production reporting rule.
  const scopes={'2026-09-09':[12,6,4,3,5],'2026-09-08':[3,2,1,1,1],'2026-09-07':[2,1,1,1,1],'2026-09-06':[2,1,0,0,1]};
  for(const [day,counts]of Object.entries(scopes))Object.keys(names).forEach((type,i)=>{
    const missing=counts[i]-seeds.filter(r=>r[0]===type&&r[2]===day).length;
    for(let j=0;j<missing;j++)seeds.push([type,`${{inbound:'PN',outbound:'PX',warranty:'BH',nfc:'TAG',documents:'DC'}[type]}-DEMO-${String(seeds.length+1).padStart(3,'0')}`,day,`13:${String(j+10).padStart(2,'0')}`,{inbound:'waiting',outbound:'waiting',warranty:'processing',nfc:'linked',documents:'recorded'}[type]]);
  });
  const records=seeds.map(([type,documentId,day,time,status],i)=>({id:`LS-${String(i+1).padStart(4,'0')}`,activityId:`B08-ACT-${i+1}`,type,label:i===4?'Điều chỉnh':names[type],documentId,day,time,occurredAt:`${day}T${time}:00+07:00`,status,actor:'Minh Anh',warehouse:'Kho Hoa Nam',serial:i===0||i===3?'HN12345':`SN-DEMO-${i+1}`,sessionId:i===0?'PQ-0001':null,nfcEventId:i===3?'NFC-B08-004':null,version:'fixture-v1',note:i===0?'Nhập hàng theo đơn đặt hàng số ĐH-2026-1023':null,attachments:i===0?[{id:'B08-ATT-1',name:'Ảnh kiện hàng',available:false},{id:'B08-ATT-2',name:'Phiếu giao hàng',available:false}]:[],events:i===0?[
    {id:'B08-LS1-E1',label:'Tạo phiếu',time:'08:30',actor:'Minh Anh'},
    {id:'B08-LS1-E2',label:'Quét mã sản phẩm',time:'08:31',actor:'Minh Anh'},
    {id:'B08-LS1-E3',label:'Kiểm tra phiếu',time:'08:32',actor:'Minh Anh'},
    {id:'B08-LS1-E4',label:'Gửi phiếu lên Web',time:'08:32',actor:'Minh Anh'}
  ]:[{id:`B08-LS${i+1}-E1`,label:status==='waiting'?'Gửi phiếu lên Web':statuses[status],time,actor:'Minh Anh'}]}));
  const scanEvents=Array.from({length:19},(_,i)=>{
    const duplicate=i===2,nfc=i===4;
    const code=i===0||duplicate?'HN12345':i===1?'HN12346':i===3?'HN12347':nfc?'NFC-8A2F':`HN${12344+i}`;
    return {id:`B08-SCAN-${i+1}`,sessionId:'PQ-0001',code,sku:nfc?'TAG-001':'XP-420B',serial:nfc?null:code,uid:nfc?'8A2F':null,time:['08:30:12','08:30:28','08:31:05','08:31:20','08:31:45'][i]||`08:${String(32+i).padStart(2,'0')}:00`,result:duplicate?'duplicate':'accepted',quantity:duplicate||nfc?0:1};
  });
  const sessions=[
    {id:'PQ-0003',type:'Xuất linh kiện',day:'2026-09-10',time:'14:30 – 14:45',count:'2 mã · 3 linh kiện',status:'Đã xuất',doc:'XLK-0002',sessionStatus:'Hoàn thành',total:2,accepted:2,duplicate:0,quantity:3,events:[]},
    {id:'PQ-0002',type:'Nhập kho',day:'2026-09-10',time:'11:10 – 11:25',count:'12 mã được ghi nhận',status:'Chờ xử lý trên Web',doc:'PN-0005',sessionStatus:'Hoàn thành',total:12,accepted:12,duplicate:0,quantity:null,events:[]},
    {id:'PQ-0001',type:'Phiên quét mã',day:'2026-09-09',time:'08:30 – 09:15',startedAt:'2026-09-09T08:30:00+07:00',endedAt:'2026-09-09T09:15:00+07:00',count:'19 lượt · 18 hợp lệ · 1 trùng',status:'Chờ xử lý trên Web',doc:'PN-0005',sessionStatus:'Hoàn thành',total:19,accepted:18,duplicate:1,quantity:17,actor:'Minh Anh',warehouse:'Kho Hoa Nam',events:scanEvents}
  ];
  const nfcEvents=[
    {id:'NFC-E003',type:'Gán thẻ',time:'14:35',date:'Hôm nay · 10/09',day:'2026-09-10',uid:'NFC-8A2F',serial:'HN12345',actor:'Minh Anh',status:'Thành công'},
    {id:'NFC-E002',type:'Thay thẻ',time:'11:20',date:'Hôm nay · 10/09',day:'2026-09-10',uid:'NFC-7B10',serial:'HN12346',actor:'Minh Anh',status:'Thành công'},
    {id:'NFC-E001',type:'Thu hồi thẻ',time:'09:15',date:'Hôm nay · 10/09',day:'2026-09-10',uid:'NFC-5C22',serial:'HN12347',actor:'Minh Anh',status:'Đã thu hồi'},
    {id:'NFC-B08-004',type:'Gán thẻ',time:'11:05',date:'09/09/2026',day:'2026-09-09',uid:'NFC-8A2F',serial:'HN12345',actor:'Minh Anh',status:'Thành công'}
  ];
  const freeze=x=>{Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(x);};
  globalThis.HN_HISTORY_FIXTURES=freeze({namespace:'hn-history-fixture-v1',names,statuses,records,sessions,nfcEvents,scopes,reportingDefinition:'Unique fixture activityId, disjoint categories, complete day, Asia/Ho_Chi_Minh. Production definition UNKNOWN.'});
})();
