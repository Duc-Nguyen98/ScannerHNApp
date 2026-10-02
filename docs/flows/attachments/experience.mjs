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
export const clampZoom=n=>Number.isFinite(n)?Math.max(.5,Math.min(2.5,Math.round(n*100)/100)):1;
export const validPage=(n,total)=>Math.max(1,Math.min(Number.isInteger(n)?n:1,total));
export function zoomReadingPoint({width,height,viewportWidth,viewportHeight,left,top,x,y}){
 const px=x??viewportWidth/2,py=y??Math.min(viewportHeight,height)/2;
 return {x:Math.max(0,Math.min(1,(left+px-Math.max(0,(viewportWidth-width)/2))/width)),y:Math.max(0,Math.min(1,(top+py)/height)),px,py};
}
export function panForReadingPoint(point,{width,height,viewportWidth}){
 return {left:Math.max(0,point.x*width-point.px+Math.max(0,(viewportWidth-width)/2)),top:Math.max(0,point.y*height-point.py)};
}
export function ownerAttachments(doc){
 if(!Array.isArray(doc?.attachments)||doc.attachments.some(f=>!f||typeof f.id!=='string'||!f.id||typeof f.name!=='string'||!f.name||typeof f.url!=='string'||!f.url||(f.mime!=null&&typeof f.mime!=='string'))||new Set(doc.attachments.map(f=>f.id)).size!==doc.attachments.length)return null;
 return doc.attachments.map(f=>({...f,state:'ready',mime:f.mime||(/\.pdf$/i.test(f.name)?'application/pdf':/\.png$/i.test(f.name)?'image/png':/\.jpe?g$/i.test(f.name)?'image/jpeg':null)}));
}
export const attachmentIdentity=(doc,file)=>file?JSON.stringify([doc?.id,doc?.version,file.id,file.version,file.url,file.mime,file.name]):null;
export function pageSize({width,height,availableWidth,availableHeight,mode='width',zoom=1}){
 if(![width,height,availableWidth,availableHeight].every(n=>Number.isFinite(n)&&n>0))return null;
 const fit=mode==='page'?Math.min(availableWidth/width,availableHeight/height):availableWidth/width;
 const scale=fit*clampZoom(zoom);return {width:Math.round(width*scale),height:Math.round(height*scale),scale};
}
export function hasDraft(d,initialDay){return !!d&&(!!d.checked||!!d.receiver||!!d.note||d.day!==initialDay);}
