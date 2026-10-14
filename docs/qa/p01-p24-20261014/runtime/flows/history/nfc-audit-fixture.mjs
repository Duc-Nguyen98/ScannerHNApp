import '../shared/history-fixtures.js';
// Explicit review fixture. Never appended from P07 scans, prepares or tag status.
export function readAuditFixture(scope,mode='fixture'){
  if(mode==='unavailable')return {available:false};
  if(mode==='error')throw Error('Nguồn mô phỏng không phản hồi hợp lệ.');
  const details={
    'NFC-E003':{product:'Máy in nhiệt XP-420B',description:'Liên kết thẻ với sản phẩm đã được nguồn sự kiện mô phỏng xác nhận.'},
    'NFC-E002':{product:'Máy quét mã HS-200',actor:'Lan Nguyễn',previousUid:'NFC-OLD-7B10',reason:'Thẻ cũ bị hỏng.',description:'Thay thẻ đã được xác nhận; UID cũ được giữ để truy vết.'},
    'NFC-E001':{product:'Máy in hóa đơn HN-80',actor:'Hoàng Nam',reason:'Thu hồi thẻ không còn sử dụng.',description:'Thẻ đã ngừng sử dụng theo sự kiện thu hồi. Không suy trạng thái hiện tại từ lịch sử.'},
    'NFC-B08-004':{product:'Máy in nhiệt XP-420B',description:'Sự kiện mô phỏng liên quan đến LS-0004.'}
  };
  let items=globalThis.HN_HISTORY_FIXTURES.nfcEvents.map(e=>({...e,...details[e.id],warehouse:'Kho Hoa Nam',warehouseId:scope.warehouseId,confirmed:true}));
  if(mode==='empty')items=[];
  if(mode==='long')items=items.map(e=>({...e,description:('Nội dung gốc nhiều dòng\nTiếng Việt <>& — 🌸 '+ 'Mã'.repeat(40)+'\n').repeat(25),reason:'Ghi chú gốc\n'.repeat(50),uid:e.uid+'-UID'.repeat(50)}));
  return {available:true,confirmed:true,complete:true,items};
}
