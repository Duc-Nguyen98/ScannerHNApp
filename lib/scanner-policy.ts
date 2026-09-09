import type {Store,Kind} from './scanner-model';
export type WarehouseStatus = 'active'|'paused';
export type Actor = {userId:string; name:string; roleCode:string; permissions:string[]; expiresAt:number; shiftStarted:boolean};
export const reads=['inbound.view','outbound.view','warranty.view','inventory.view','inventory.trace','item_instance.view','audit_log.view','report.view','warehouse.view'];
export const writes=['inbound.create','inbound.scan','inbound.cancel','inbound.post','outbound.request.manual_create','outbound.scan','outbound.cancel','outbound.post','warranty.manage','warranty.component_issue','physical_code.assign_rfid','item_instance.manage'];
// Preview assignments implementing the approved P02 behavior, not live CMS grants.
export const profiles:Record<string,{code:string;permissions:string[]}>= {
 'Nhân viên kho':{code:'WAREHOUSE_STAFF',permissions:[...reads,...writes.filter(p=>!p.endsWith('.post'))]},
 'Người duyệt kho':{code:'WAREHOUSE_APPROVER',permissions:[...reads,'inbound.post','outbound.post','inbound.cancel','outbound.cancel']},
 'Chỉ xem':{code:'VIEWER',permissions:[...reads]},
 'Super Admin':{code:'SUPER_ADMIN',permissions:[...reads,...writes,'warehouse.manage']},
};
export const warehouseStatus=(s:Store):WarehouseStatus=>s.warehouseStatus==='paused'?'paused':'active';
export const warehouseMessage='Kho Hoa Nam đang tạm dừng — chỉ cho phép xem và tra cứu';
export function permitted(actor:Actor|null|undefined,permission:string){return !!actor && actor.expiresAt>Date.now() && actor.shiftStarted && Array.isArray(actor.permissions) && actor.permissions.includes(permission);}
export function assertPermission(actor:Actor|null|undefined,permission:string){if(!permitted(actor,permission))throw new Error('Tài khoản không có quyền thực hiện thao tác này.');}
export function assertWrite(store:Store,actor:Actor|null|undefined,permission:string){assertPermission(actor,permission);if(warehouseStatus(store)==='paused')throw new Error(warehouseMessage);}
export const documentPermission=(kind:Kind,action:'create'|'scan'|'post'|'cancel')=>kind==='parts'&&action!=='post'&&action!=='cancel'?'warranty.component_issue':kind==='in'?`inbound.${action}`:action==='create'?'outbound.request.manual_create':`outbound.${action}`;
export function actionPermission(view:string,kind:Kind='in'):string|null{
 if(['create','review'].includes(view))return documentPermission(kind,'create');
 if(view==='scan')return documentPermission(kind,'scan');
 if(view==='intake')return 'warranty.manage';
 if(view==='nfc-bind')return 'physical_code.assign_rfid';
 return null;
}
// Guard arbitrary local store commits too, including media, cancellation and NFC.
// API integration must enforce the same contract against server-owned actor/state.
export function authorizeCommit(before:Store,after:Store,actor:Actor|null|undefined):Store{
 if(before.warehouseStatus!==after.warehouseStatus)throw new Error('Đổi trạng thái kho phải qua xác nhận quản trị.');
 if(JSON.stringify(before)===JSON.stringify(after))return before;
 if(JSON.stringify(before.items)!==JSON.stringify(after.items)){
  const posted=after.docs.filter(d=>d.status==='Đã ghi sổ'&&before.docs.find(b=>b.id===d.id)?.status!=='Đã ghi sổ');
  if(!posted.length)throw new Error('Không cho phép điều chỉnh tồn ngoài nghiệp vụ ghi sổ.');
  posted.forEach(d=>assertWrite(before,actor,documentPermission(d.kind,'post')));
 }
 if(before.docs.some(d=>!after.docs.some(n=>n.id===d.id)))throw new Error('Không cho phép xóa chứng từ.');
 for(const d of after.docs){const old=before.docs.find(b=>b.id===d.id);if(JSON.stringify(old)!==JSON.stringify(d))assertWrite(before,actor,documentPermission(d.kind,d.status==='Đã ghi sổ'?'post':d.status==='Đã huỷ'?'cancel':'create'));}
 if(JSON.stringify(before.cases)!==JSON.stringify(after.cases)){
  const justPosting=after.docs.some(d=>d.kind==='parts'&&d.status==='Đã ghi sổ'&&before.docs.find(b=>b.id===d.id)?.status==='Chờ duyệt');
  assertWrite(before,actor,justPosting?'outbound.post':'warranty.manage');
 }
 if(JSON.stringify(before.tags)!==JSON.stringify(after.tags))assertWrite(before,actor,'physical_code.assign_rfid');
 // Standalone audit edits are not an application operation.
 if(JSON.stringify({...before,events:[]})===JSON.stringify({...after,events:[]}))throw new Error('Không cho phép sửa lịch sử trực tiếp.');
 return after;
}
export function changeWarehouse(store:Store,actor:Actor|null|undefined,status:WarehouseStatus,reason:string,confirmed:boolean):Store{
 assertPermission(actor,'warehouse.manage');
 if(actor?.roleCode!=='SUPER_ADMIN')throw new Error('Chỉ Super Admin được thay đổi trạng thái kho.');
 if(!confirmed||reason.trim().length<5)throw new Error('Cần xác nhận và lý do tối thiểu 5 ký tự.');
 if(!['active','paused'].includes(status))throw new Error('Trạng thái kho không hợp lệ.');
 if(warehouseStatus(store)===status)return store;
 return {...store,warehouseStatus:status,events:[{at:new Date().toLocaleString('vi-VN'),text:`Kho Hoa Nam • ${status==='paused'?'Tạm dừng':'Kích hoạt lại'} • ${actor.name} (${actor.userId}) • ${reason.trim()}`},...store.events]};
}
