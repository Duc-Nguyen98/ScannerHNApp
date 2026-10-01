import {allowed} from './model.mjs';
export const sourceUncertain=r=>!!(r.busy||r.unknown||r.saveUnknown||r.document?.uncertain);
export const summaryRecords=s=>s.summary?.request.records??s.records;
export const pendingMessage=action=>action==='recovery'
 ? 'Giữ nguyên yêu cầu khôi phục. Đối chiếu kết quả trước khi gửi lại.'
 : action==='end'?'Chưa xác định ca đã kết thúc hay chưa. Giữ nguyên yêu cầu kết thúc ca và đối chiếu trước khi thực hiện tiếp.'
 : 'Giữ nguyên yêu cầu lưu nháp và nội dung phiếu. Đối chiếu kết quả trước khi lưu lại.';
export function shiftPresentation(s,auth){
 if(s.busy)return {key:'busy',tone:'info',title:s.processing==='save'?'Đang lưu nháp':s.processing==='end'?'Đang kết thúc ca':'Đang đối chiếu kết quả',message:'Vui lòng chờ kết quả xác nhận. Phiếu và yêu cầu hiện tại được giữ nguyên.',action:null};
 if(s.pending)return {key:'pending',tone:'warning',title:'Cần đối chiếu kết quả',message:pendingMessage(s.pending.action),action:'check'};
 if(!allowed(auth))return {key:'blocked',tone:'warning',title:'Chưa thể kết thúc ca',message:'Phiên, quyền thao tác hoặc trạng thái kho chưa được xác nhận. Phiếu đang làm vẫn được giữ.',action:null};
 if(s.records.some(sourceUncertain))return {key:'source-unknown',tone:'warning',title:'Có phiếu cần đối chiếu',message:'Mở đúng phiếu để kiểm tra kết quả tại màn nghiệp vụ trước khi lưu nháp hoặc kết thúc ca.',action:'continue-first'};
 if(s.unsaved.length)return {key:'unfinished',tone:'danger',title:`Còn ${s.unsaved.length} phiếu chưa hoàn tất`,message:'Tiếp tục xử lý hoặc lưu nháp các phiếu đang mở trước khi kết thúc ca.',action:'save'};
 return {key:'ready',tone:'success',title:s.records.length?'Các phiếu dở đã được lưu':'Không có phiếu đang mở',message:'Có thể xác nhận kết thúc ca. Kết thúc ca không đăng xuất tài khoản.',action:'end'};
}
