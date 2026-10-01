import {ISSUE_NAMESPACE,quantityError} from './issue-model.mjs';
import {caseDetails} from '../warranty/warranty-model.mjs';
export const ISSUE_ITEMS=Object.freeze([
 {kind:'UNIT',sku:'LK-0001',name:'Đầu in nhiệt XP-420B',code:'LK0001-HN001',available:1},
 {kind:'BOX',sku:'LK-0002',name:'Adapter nguồn 24V',code:'BOX-LK-0002-01',available:12},
]);
// Per Home instance. No HTTP calls or localStorage; never a production adapter.
export function createIssueFixture({delay=450}={}){
 let mode='ready',sequence=0;const receipts=new Map(),attempts=new Map(),stock=new Map(ISSUE_ITEMS.map(r=>[r.code,r.available]));
 const metrics={post:0,check:0,commits:0};
 const wait=()=>new Promise(r=>setTimeout(r,delay));
 const rejected=(request,error)=>({kind:'rejected',requestId:request.id,error});
 return {setMode(v){mode=v;},metrics:()=>({...metrics}),lookup(code){if(code==='BOX-NOT-RECEIVED')return {kind:'BOX',code,sku:'LK-0002',name:'Adapter nguồn 24V',available:null,issuable:false,reason:'Hộp chưa được ghi nhận nhập kho. Kiểm tra lại mã hoặc chọn hộp khác.'};const row=ISSUE_ITEMS.find(r=>r.code===code);return row?{...row,available:stock.get(code)}:null;},
  async post(request,guard){metrics.post++;const outcome=mode;attempts.set(request.id,structuredClone(request));await wait();
   if(receipts.has(request.id))return {kind:'verified',receipt:structuredClone(receipts.get(request.id))};
   const err=guard();if(err)return rejected(request,err);
   if(outcome==='error')return rejected(request,'Xuất linh kiện bị từ chối. Danh sách được giữ nguyên.');
   if(outcome==='unknown'||outcome==='not-posted')return {kind:'unknown'};
   if(caseDetails(request.caseId)?.version!==request.caseVersion)return rejected(request,'Hồ sơ đã thay đổi. Mở lại hồ sơ trước khi xuất.');
   for(const row of request.lines){const e=quantityError(row.quantity,stock.get(row.code));if(e)return rejected(request,e);}
   const at=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'short',timeStyle:'short'}).format(new Date());
   const receipt={namespace:ISSUE_NAMESPACE,id:'XLK-DEMO-'+String(++sequence).padStart(4,'0'),caseId:request.caseId,status:'POSTED',requestId:request.id,request:structuredClone(request),version:request.version+1,lines:structuredClone(request.lines),at,warehouseId:request.scope.warehouseId};
   request.lines.forEach(row=>stock.set(row.code,stock.get(row.code)-row.quantity));receipts.set(request.id,receipt);metrics.commits++;
   return outcome==='timeout-posted'?{kind:'unknown'}:{kind:'verified',receipt:structuredClone(receipt)};
  },
  async check(request){metrics.check++;await wait();const receipt=receipts.get(request.id);if(receipt)return {kind:'verified',receipt:structuredClone(receipt)};
   return mode==='not-posted'&&JSON.stringify(attempts.get(request.id))===JSON.stringify(request)?{kind:'not-posted',requestId:request.id,error:'Đã đối chiếu: yêu cầu chưa xuất. Có thể xác nhận lại cùng yêu cầu.'}:{kind:'unknown'};
  },
 };
}
