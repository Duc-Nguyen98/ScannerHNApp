// Presentation only: never modify source unread counts or pagination totals.
const numbers=new Intl.NumberFormat('vi-VN');
export const validCount=value=>Number.isSafeInteger(value)&&value>=0;
export const exactCount=value=>validCount(value)?numbers.format(value):'—';
export function notificationCount(value,cap=99){
 if(!validCount(value))return {known:false,empty:false,text:'?',exact:'Chưa xác định số thông báo chưa đọc'};
 return {known:true,empty:value===0,text:value>cap?`${cap}+`:String(value),exact:`${exactCount(value)} thông báo chưa đọc`};
}
export function notificationPageSummary({loaded,total,hasMore}){
 if(!validCount(loaded)||loaded===0&&!hasMore)return '';
 if(!hasMore)return `Đã tải đủ ${exactCount(loaded)} thông báo`;
 return `Đã tải ${exactCount(loaded)}${validCount(total)?' / '+exactCount(total):''} thông báo`;
}
