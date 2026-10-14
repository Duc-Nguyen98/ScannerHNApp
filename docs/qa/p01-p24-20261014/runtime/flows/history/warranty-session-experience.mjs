import {newFilters,textValue} from './warranty-session-model.mjs';
import {validQueryDate} from '../shared/query-date-policy.mjs';
export const hasHistoryFilters=f=>f.type!=='all'||f.status!=='all'||!!f.from||!!f.to;
export const clearHistoryConditions=f=>({...newFilters(),q:f.q});
export const acceptedLabel=r=>r.type==='Tra cứu'?'Lượt tra cứu hợp lệ':'Mã hợp lệ';
export function sessionNotice(r){
 if(r.type==='Tra cứu')return 'Phiên tra cứu không tạo phiếu kho hoặc thay đổi tồn.';
 if(r.type==='Nhập kho')return r.status==='Chờ xử lý trên Web'?'Phiếu đã gửi, chưa ghi sổ; chưa làm thay đổi tồn.':'Kết quả gửi phiếu chưa xác minh. Không suy trạng thái ghi sổ hoặc tồn kho từ việc kết thúc phiên.';
 return r.status==='Đã xuất'?'Kết quả xuất dựa trên nguồn xác nhận; kết thúc phiên không tự đồng nghĩa Đã xuất.':'Kết quả xuất chưa xác minh. Không suy Đã xuất hoặc số lượng đã xuất từ việc kết thúc phiên.';
}
export function latestWarrantyEvent(events){
 if(!events.length||events.some(e=>!validQueryDate(e.day)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)))return null;
 const ordered=events.slice().sort((a,b)=>b.day.localeCompare(a.day)||b.time.localeCompare(a.time));
 // Equal timestamps do not establish which event is the newest.
 return ordered.length>1&&ordered[0].day===ordered[1].day&&ordered[0].time===ordered[1].time?null:ordered[0].id;
}
export function sessionLinks(row,cases,receipts,warehouseId){
 if(!row||warehouseId!=='fixture-hoa-nam'||row.warehouseId!==warehouseId||row.type!=='Xuất linh kiện')return {};
 const c=cases.find(c=>c.id===row.caseId);if(!c)return {};
 const receipt=row.status==='Đã xuất'&&textValue(row.linkedReceiptId)&&receipts.find(r=>r.id===row.linkedReceiptId&&r.caseId===c.id&&r.status==='POSTED'&&r.warehouse==='Kho Hoa Nam');
 return {caseId:c.id,receiptId:receipt?receipt.id:null};
}
