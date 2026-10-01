import {sessionGuard} from '../home/home-flow.mjs';

// Internal prototype view state, never a backend upload/permission schema.
export const previewScope = state => ({actorId:state?.session?.actor?.id,warehouseId:state?.session?.warehouse?.id,sessionId:state?.session?.authSessionId});
export function scopeGuard(state,scope){
 const denied=sessionGuard(state);if(denied)return denied;
 const now=previewScope(state);
 if(!scope?.actorId||!scope.warehouseId||!scope.sessionId||now.actorId!==scope.actorId||now.warehouseId!==scope.warehouseId||now.sessionId!==scope.sessionId)return 'Ngữ cảnh người thao tác, phiên hoặc kho đã thay đổi.';
 return '';
}
export function handoffErrors(d){
 const e={};
 if(d.checked!==true)e.checked='Xác nhận đã kiểm tra hoạt động của thiết bị.';
 if(typeof d.receiver!=='string'||!d.receiver.trim())e.receiver='Nhập người nhận bàn giao.';
 const dt=typeof d.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d.day)?new Date(d.day+'T00:00:00Z'):null;
 if(!dt||Number.isNaN(+dt)||dt.toISOString().slice(0,10)!==d.day)e.day='Chọn ngày bàn giao hợp lệ.';
 if(typeof d.note!=='string'||d.note.length>200)e.note='Ghi chú tối đa 200 ký tự.';
 return e;
}
export function handoffBlock(caseRow){
 if(!caseRow)return 'Không tìm thấy hồ sơ bảo hành.';
 if(caseRow.closed||caseRow.status==='Đã trả khách')return 'Hồ sơ đã trả khách, chỉ được xem thông tin.';
 if(caseRow.status!=='Chờ bàn giao')return 'Hồ sơ chưa ở trạng thái Chờ bàn giao. Cập nhật kết quả sửa chữa tại hồ sơ trước.';
 return 'Chưa có chính sách và nguồn xác nhận bàn giao. Chưa gửi yêu cầu, hồ sơ vẫn Chờ bàn giao.';
}
export const SLOT_FIXTURE=Object.freeze(['A1','A2','A3','B1','B2','B3'].map((id,i)=>Object.freeze({id,current:[12,5,20,8,0,20][i],capacity:20})));
export function slotData(id,{fixture=false,slots=null}={}){
 const row=(fixture?SLOT_FIXTURE:slots)?.find(x=>x.id===id);
 const current=Number.isFinite(row?.current)?row.current:null,capacity=Number.isFinite(row?.capacity)?row.capacity:null;
 return {id,current,capacity,free:current!==null&&capacity!==null?Math.max(0,capacity-current):null};
}
export function createUploadQueue(files,{getState,scope,onChange=()=>{}}){
 const rows=structuredClone(files);let disposed=false;const tokens=new Map();
 const allowed=()=>!disposed&&!scopeGuard(getState(),scope)&&getState().session.warehouse.active===true;
 const find=id=>rows.find(f=>f.id===id);
 return {
  snapshot:()=>structuredClone(rows),
  begin(id){const f=find(id);if(!allowed()||!f?.taskId||!['error','cancelled'].includes(f.state))return null;const token=(tokens.get(id)||0)+1;tokens.set(id,token);f.state='uploading';f.progress=0;f.error=null;onChange(id);return {id,taskId:f.taskId,token};},
  event({id,taskId,token,loaded,total,result}){const f=find(id);if(!allowed()||!f||f.taskId!==taskId||f.state!=='uploading'||tokens.get(id)!==token)return false;
   if(result==='error'){f.state='error';f.error='Tải lên thất bại';}
   else if(result==='unknown'){f.state='unknown';f.error='Kết quả tải lên chưa xác định. Cần đối chiếu trước khi thử lại.';}
   else if(result==='ready'){f.state='ready';f.progress=100;}
   else if(Number.isFinite(loaded)&&Number.isFinite(total)&&total>0&&loaded>=0&&loaded<=total)f.progress=Math.max(f.progress||0,Math.round(loaded/total*100));
   else return false;
   onChange(id);return true;
  },
  cancel(id){const f=find(id);if(!allowed()||!f?.taskId||f.state!=='uploading')return false;tokens.set(id,(tokens.get(id)||0)+1);f.state='cancelled';f.progress=null;onChange(id);return true;},
  dispose(){disposed=true;tokens.clear();}
 };
}
