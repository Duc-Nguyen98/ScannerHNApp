// Presentation adapter for known preview events. These keys are not backend enums.
// Never create events or infer stock changes from a status label alone.
const stockPhases={'Tạo chứng từ':'created','Tạo phiếu':'created','Quét mã sản phẩm':'checked','Kiểm tra phiếu':'checked','Kiểm tra sản phẩm':'checked','Gửi phiếu lên Web':'sent','Đã ghi sổ trên Web':'posted'};
const warrantyPhases={'Đã tiếp nhận':'received','Đang kiểm tra':'checking','Hoàn tất sửa chữa':'ready','Chờ bàn giao':'ready','Đã trả khách':'returned'};
const stockStates={
 waiting:{phase:'sent',title:'Chờ xử lý trên Web',description:'Phiếu đã gửi lên Web, chưa ghi sổ và chưa thay đổi tồn kho.',terminal:false},
 posted:{phase:'posted',title:'Đã hoàn tất · Đã ghi sổ',description:'Web đã ghi sổ chứng từ. Luồng nhập/xuất của phiếu này đã hoàn tất.',terminal:true}
};
const warrantyStates={
 received:{phase:'received',title:'Đã tiếp nhận · Chờ kiểm tra',description:'Hồ sơ đã tiếp nhận, chờ kiểm tra và cập nhật xử lý.',terminal:false},
 checking:{phase:'checking',title:'Đang kiểm tra',description:'Hồ sơ đang được xử lý. Chưa hoàn tất bàn giao cho khách.',terminal:false},
 ready:{phase:'ready',title:'Chờ bàn giao',description:'Đã hoàn tất sửa chữa; chờ xác nhận trả thiết bị cho khách.',terminal:false},
 returned:{phase:'returned',title:'Đã hoàn tất · Đã trả khách',description:'Đã ghi nhận bàn giao thiết bị cho khách. Hồ sơ chỉ đọc.',terminal:true}
};
export function documentProgress(doc,events){
 const warranty=doc?.type==='warranty',phases=warranty?warrantyPhases:stockPhases;
 const state=(warranty?warrantyStates:['inbound','outbound'].includes(doc?.type)?stockStates:{})[doc?.status];
 const source=Array.isArray(events)?events:[];
 // Use event identity, not array index or the latest auxiliary component receipt.
 const lifecycle=source.filter(e=>Object.hasOwn(phases,e.label)).map((event,index)=>({event,index,stamp:(event.day||doc?.day||'')+'T'+(event.time||'')}))
  .sort((a,b)=>/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(a.stamp)&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(b.stamp)?a.stamp.localeCompare(b.stamp)||a.index-b.index:a.index-b.index).map(x=>x.event);
 const current=lifecycle.at(-1);
 const corroborated=!!state&&!!current?.id&&phases[current.label]===state.phase;
 const empty=!source.length;
 return {
  tone:corroborated?(state.terminal?'success':'warning'):(empty?'neutral':'warning'),
  title:corroborated?state.title:empty?'Chưa đủ dữ liệu tiến trình':'Cần đối chiếu tiến trình',
  description:corroborated?state.description:empty?'Chưa có sự kiện để xác định bước đang xử lý hoặc xác nhận hoàn tất.':'Trạng thái và sự kiện hiện có chưa đủ khớp để xác nhận bước hiện tại. Kiểm tra lại nguồn chứng từ.',
  complete:corroborated&&state.terminal,
  currentEventId:corroborated?current.id:null,
  events:source.map(e=>({id:e.id,tone:corroborated&&e.id===current.id?(state.terminal?'success':'warning'):'past',label:corroborated&&e.id===current.id?(state.terminal?'Hoàn tất':'Bước hiện tại'):null}))
 };
}
