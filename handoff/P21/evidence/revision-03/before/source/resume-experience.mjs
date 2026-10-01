import {recentTimeLabel} from '../shared/recent-time.mjs';
export function checkpointTime(value,now=Date.now()){
 const date=new Date(value);if(!value||!Number.isFinite(+date))return {label:'Chưa xác minh',full:'Chưa xác minh',iso:null};
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));
 return {label:recentTimeLabel(`${parts.year}-${parts.month}-${parts.day}`,`${parts.hour}:${parts.minute}`,now),full:new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'full',timeStyle:'short'}).format(date),iso:date.toISOString()};
}
export function reconciliationSummary(s){
 const field=v=>v==null||v===''?'Chưa xác minh':String(v);
 return [['Phiếu',s.document?.documentId],['Hồ sơ',s.caseId],['Yêu cầu',s.request?.id],['Phiên quét',s.scanSessionId],['Version',s.document?.version],['Checkpoint',s.checkpoint?.checkpointId]].map(([k,v])=>`${k}: ${field(v)}`).join('\n')+'\nMã:\n'+(s.lines||[]).map(l=>field(l.code)).join('\n');
}
export function resumeReadiness(s,writeError=''){
 if(s.receipt)return 'Phiếu đã xuất · chỉ xem lịch sử';
 if(s.busy)return 'Đang chờ xác nhận · không gửi thêm yêu cầu';
 if(s.unknown)return 'Chưa rõ kết quả · kiểm tra trước khi gửi lại';
 if(s.verification==='loading')return 'Đang xác minh phiếu · chưa thể quét';
 if(writeError)return writeError;
 return s.verification==='verified'?'Có thể tiếp tục quét':'Chưa xác minh dữ liệu phiếu';
}
