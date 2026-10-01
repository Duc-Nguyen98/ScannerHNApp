import {handoffErrors} from './model.mjs';
// Presentation-only helpers. No permission grant or backend mutation.
export function fileSummary(rows){
 const count=state=>rows.filter(r=>r.state===state).length;
 return {ready:count('ready'),uploading:count('uploading'),attention:rows.filter(r=>['error','unknown','cancelled'].includes(r.state)).length};
}
export function handoffGuidance(c,d){
 const errors=handoffErrors(d),missing=Object.keys(errors);
 const closed=!!c?.closed||c?.status==='Đã trả khách';
 return {errors,missing,closed,disabled:true,canOpenCase:!!c&&!closed&&c.status!=='Chờ bàn giao',
  reason:closed?'Hồ sơ đã trả khách, chỉ xem thông tin.':c?.status!=='Chờ bàn giao'?'Trạng thái: '+(c?.status||'Chưa xác minh')+'. Cập nhật kết quả sửa chữa trước khi bàn giao.':'Chức năng xác nhận bàn giao hiện chưa khả dụng. Thông tin đang nhập được giữ trong phiên này.',
  next:missing.length?errors[missing[0]]:'Đã điền đủ thông tin kiểm tra. Hồ sơ chưa được bàn giao.'};
}
export const clampZoom=n=>Math.max(.5,Math.min(2.5,Math.round(n*100)/100));
export function pageSize({width,height,availableWidth,availableHeight,mode='width',zoom=1}){
 if(![width,height,availableWidth,availableHeight].every(n=>Number.isFinite(n)&&n>0))return null;
 const fit=mode==='page'?Math.min(availableWidth/width,availableHeight/height):availableWidth/width;
 const scale=fit*clampZoom(zoom);return {width:Math.round(width*scale),height:Math.round(height*scale),scale};
}
export function hasDraft(d,initialDay){return !!d&&(!!d.checked||!!d.receiver||!!d.note||d.day!==initialDay);}
