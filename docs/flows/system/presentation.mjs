// Display context is projected from an existing owner, never a new checkpoint.
export function systemDocumentContext(operation,run,scope) {
  const d=run?.document;
  if(!['inbound','outbound'].includes(operation)||!scope?.actorId||!scope.warehouseId||!d?.documentId||!d.number||d.actorId!==scope.actorId||d.warehouseId!==scope.warehouseId)return null;
  return {documentId:d.documentId,number:String(d.number),operation,
    label:operation==='inbound'?'Phiếu nhập':'Phiếu xuất',
    status:run.unknown?'Chưa xác định kết quả gửi':run.busy?'Đang kiểm tra kết quả':run.recorded?'Chờ xử lý trên Web':'Phiếu đang làm',
    unknown:run.unknown===true};
}
export function connectionAction({intent,hasRead,busy,unknown=false}) {
  const reconcile=unknown||intent==='reconcile';
  return {label:busy?(reconcile?'Đang đối chiếu…':'Đang tải…'):!hasRead?'Xem cách xử lý':reconcile?'Đối chiếu kết quả':'Tải lại',
    message:reconcile?'Chưa xác định kết quả gửi. Không gửi lại phiếu trước khi đối chiếu.':'Chưa tải được dữ liệu. Thử tải lại khi kết nối ổn định.'};
}
export function cameraActions(state,pending=false) {
  if(state==='unsupported')return [{action:'camera-guide',label:'Hướng dẫn thiết bị hỗ trợ',icon:'smartphone'}];
  if(state==='denied')return [{action:'camera-guide',label:'Hướng dẫn cấp quyền',icon:'document'},{action:'camera',label:pending?'Đang kiểm tra…':'Kiểm tra lại camera',icon:'camera',secondary:true,disabled:pending}];
  return [{action:'camera',label:pending?'Đang yêu cầu…':state==='not-requested'?'Cho phép camera':'Kiểm tra lại camera',icon:'camera',disabled:pending},{action:'camera-guide',label:'Mở hướng dẫn',icon:'document',secondary:true}];
}
