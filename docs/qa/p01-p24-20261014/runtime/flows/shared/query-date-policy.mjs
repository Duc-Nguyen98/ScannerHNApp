// Picker window only; the historical data source is never truncated.
export const QUERY_TIMEZONE='Asia/Ho_Chi_Minh';
export function queryDateBounds(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:QUERY_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const part=t=>parts.find(p=>p.type===t).value;
 const max=part('year')+'-'+part('month')+'-'+part('day'),d=new Date(max+'T00:00:00Z');
 d.setUTCDate(d.getUTCDate()-90);return {min:d.toISOString().slice(0,10),max};
}
export function validQueryDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value.startsWith('0000'))return false;
 const d=new Date(value+'T00:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===value;
}
export const dateAllowed=(value,bounds=queryDateBounds())=>validQueryDate(value)&&value>=bounds.min&&value<=bounds.max;
export function clampQueryDate(value,bounds=queryDateBounds()){
 return !validQueryDate(value)?bounds.max:value<bounds.min?bounds.min:value>bounds.max?bounds.max:value;
}
export const queryDateLabel=value=>value.split('-').reverse().join('/');
export function queryDateHelp(bounds=queryDateBounds()){
 return 'Chỉ chọn từ '+queryDateLabel(bounds.min)+' đến '+queryDateLabel(bounds.max)+' (hôm nay lùi 90 ngày). Để xem lịch sử cũ hơn, bỏ lọc ngày rồi tìm hoặc cuộn danh sách.';
}
export function validateQueryRange({from='',to=''},bounds=queryDateBounds()){
 if((from&&!validQueryDate(from))||(to&&!validQueryDate(to)))return 'Ngày không hợp lệ.';
 if((from&&!dateAllowed(from,bounds))||(to&&!dateAllowed(to,bounds)))return 'Ngày nằm ngoài phạm vi cho phép. '+queryDateHelp(bounds);
 if(from&&to&&from>to)return 'Ngày bắt đầu không được sau ngày kết thúc.';
 return '';
}
export function resolveQueryRange({from='',to=''},bounds=queryDateBounds()){
 // Both blank means manual browsing; a single blank stays inside the window.
 return !from&&!to?{from:'',to:''}:{from:from||bounds.min,to:to||bounds.max};
}
