import {scopeGuard,previewScope} from '../attachments/model.mjs';
import {caseDetails,guardWarranty} from '../warranty/warranty-model.mjs';

// These are preview-domain objects, not proposed production request/permission enums.
export const ISSUE_NAMESPACE='hn-component-issue-preview-v1';
export const countIssue=lines=>({codes:lines.length,quantity:lines.reduce((n,l)=>n+l.quantity,0)});
export function quantityError(value,available){
 const raw=String(value).trim(),n=Number(raw);
 if(!/^\d+$/.test(raw)||!Number.isSafeInteger(n)||n<=0)return 'Nhập số nguyên dương.';
 if(available!=null&&(!Number.isSafeInteger(available)||available<0))return 'Tồn khả dụng chưa hợp lệ. Cần kiểm tra lại.';
 return available!=null&&n>available?`Số lượng vượt tồn khả dụng (${available}).`:'';
}
export function createIssueFlow({getState,caseId,adapter,onPosted=()=>{},id=()=>crypto.randomUUID()}){
 const scope=previewScope(getState()),scanSessionId=id();
 const document={documentId:'DRAFT-DEMO-'+id(),actorId:scope.actorId,warehouseId:scope.warehouseId,caseId,version:1,scanSessionId};
 let lines=[],pending=null,busy=false,unknown=false,request=null,receipt=null,disposed=false;
 const readGuard=()=>disposed?'Phiên thao tác đã đóng.':getState()?.sessionExpired?'Phiên đăng nhập đã hết hạn.':scopeGuard(getState(),scope);
 const writeGuard=()=>readGuard()||guardWarranty(getState(),caseId);
 const locked=()=>busy||unknown||!!receipt;
 const failure=error=>({kind:'invalid',error});
 const snapshot=()=>structuredClone({namespace:ISSUE_NAMESPACE,document,scope,caseId,scanSessionId,lines,pending,busy,unknown,request,receipt,counts:countIssue(lines),outcome:receipt?'posted':unknown?'unknown':'draft'});
 function accept(result){
  const r=result?.receipt;
  const matches=result?.kind==='verified'&&r?.namespace===ISSUE_NAMESPACE&&r.status==='POSTED'&&typeof r.id==='string'&&r.id.length>0&&r.caseId===caseId&&r.requestId===request?.id&&JSON.stringify(r.request)===JSON.stringify(request)&&JSON.stringify(r.lines)===JSON.stringify(request.lines)&&Number.isInteger(r.version)&&r.version>request.version&&typeof r.at==='string'&&r.at.length>0;
  if(matches&&!readGuard()){
   receipt=structuredClone(r);unknown=false;document.version=r.version;onPosted(structuredClone(receipt));return {kind:'posted',receipt:structuredClone(receipt)};
  }
  if(['rejected','not-posted'].includes(result?.kind)&&result?.requestId===request?.id&&!readGuard()){
   unknown=false;return {kind:'rejected',error:result.error||'Yêu cầu chưa được xuất. Dữ liệu được giữ nguyên.'};
  }
  unknown=true;return {kind:'unknown',error:'Chưa xác định kết quả xuất. Giữ nguyên phiếu và đối chiếu trước khi thử lại.'};
 }
 return {snapshot,writeGuard,
  scan(code){const err=writeGuard();if(err)return failure(err);if(locked())return failure('Phiếu đang khóa; cần kiểm tra kết quả xuất.');
   const value=String(code).trim(),item=adapter.lookup(value);if(!item)return failure('Mã chưa được nhận diện là linh kiện hoặc hộp có thể xuất.');
   const existing=lines.find(l=>l.code===value);if(existing?.recorded)return failure('Mã đã ghi nhận trên phiếu, không được sửa tùy ý.');
   if(item.kind==='BOX'){pending={...item,quantity:existing?.quantity??2};return {kind:'quantity'};}
   if(existing)return {kind:'duplicate',error:'Mã này đã có trong danh sách. Số lượng tem đơn vẫn là 1.'};
   const invalid=quantityError(1,item.available);if(invalid)return failure(invalid);
   request=null;lines.push({...item,quantity:1});document.version++;return {kind:'accepted'};
  },
  quantity(value){const err=writeGuard();if(err)return failure(err);if(locked()||!pending)return failure('Không có hộp đang chờ xác nhận.');
   const current=adapter.lookup(pending.code),error=quantityError(value,current?.available);if(!current)return failure('Không còn xác minh được hộp.');if(error)return failure(error);
   const i=lines.findIndex(l=>l.code===pending.code);if(i>=0&&lines[i].recorded)return failure('Dòng đã ghi nhận không được thay đổi.');
   const row={...current,quantity:Number(value)};if(i<0)lines.push(row);else lines[i]=row;pending=null;request=null;document.version++;return {kind:'accepted'};
  },
  cancelQuantity(){pending=null;},
  remove(code){const err=writeGuard();if(err)return failure(err);if(locked())return failure('Phiếu đang khóa.');const row=lines.find(l=>l.code===code);if(!row||row.recorded)return failure('Dòng đã ghi nhận hoặc không còn trong phiếu.');lines=lines.filter(l=>l.code!==code);request=null;document.version++;return {kind:'removed'};},
  async post(){const err=writeGuard();if(err)return failure(err);if(locked()||pending||!lines.length)return failure('Phiếu chưa đủ điều kiện xuất.');
   for(const row of lines){const item=adapter.lookup(row.code),e=!item?'Không còn xác minh được mã.':quantityError(row.quantity,item.available);if(e)return failure(e);}
   request??={namespace:ISSUE_NAMESPACE,id:id(),documentId:document.documentId,version:document.version,caseVersion:caseDetails(caseId).version,caseId,scope:structuredClone(scope),scanSessionId,lines:structuredClone(lines)};
   busy=true;let result;try{result=await adapter.post(structuredClone(request),writeGuard);}catch{result={kind:'unknown'};}finally{busy=false;}
   return accept(result);
  },
  async reconcile(){if(readGuard())return failure(readGuard());if(busy||!unknown||!request)return failure('Không có yêu cầu cần đối chiếu.');busy=true;let result;try{result=await adapter.check(structuredClone(request));}catch{result={kind:'unknown'};}finally{busy=false;}return accept(result);},
  // Future P21 must supply an authoritative adapter before setting recorded lines.
  restoreRecorded(rows){if(locked()||lines.length||writeGuard())return false;if(!Array.isArray(rows)||rows.some(r=>!adapter.lookup(r.code)||quantityError(r.quantity,r.available)))return false;lines=rows.map(r=>({...structuredClone(r),recorded:true}));return true;},
  dispose(){disposed=true;pending=null;},
 };
}
