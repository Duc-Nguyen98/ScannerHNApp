// Presentation-only projection shared by prepared API and the r04 renderer.
// No transport, parser activation, retained credential or endpoint capability.
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
export function projectReservation(v,ctx){
 if(v===null)return null;
 // A malformed or denied projection remains non-null. Its identifiers never
 // enter presentation state, checkpoints, reasons or clipboard text.
 const hidden=()=>Object.freeze({redacted:true,can_open:false});
 if(!object(v)||v.redacted!==false||v.can_open!==true||ctx?.trusted!==true||ctx.actor_status!=='ACTIVE'||!ctx.permissions?.includes('outbound.view')||!uuid(v.document_id)||!uuid(v.match_id)||!Object.hasOwn(v,'outbound_request_id')||v.outbound_request_id!==null&&!uuid(v.outbound_request_id)||!['DRAFT','SCANNING'].includes(v.status)||typeof v.doc_no!=='string'||!v.doc_no)return hidden();
 // Holder-warehouse access was checked by the fresh server projection, not
 // inferred from the scanner's caller warehouse. Later GET checks it again.
 return Object.freeze({match_id:v.match_id,document_id:v.document_id,doc_no:v.doc_no,status:v.status,outbound_request_id:v.outbound_request_id,redacted:false,can_open:true});
}
export function reasonText(reason){return ({ITEM_ALREADY_MATCHED:'Sản phẩm đang được một phiếu xuất khác giữ.',ITEM_NOT_AVAILABLE:'Sản phẩm chưa ở trạng thái có thể xuất kho.',INSUFFICIENT_STOCK:'Số lượng khả dụng chưa đủ để xuất.',SKU_INACTIVE:'Sản phẩm đang ngừng hoạt động.',PHYSICAL_CODE_NOT_FOUND:'Chưa tìm thấy mã hiện vật trong hệ thống.'})[reason]||'Chưa xác định nguyên nhân từ nguồn kiểm tra.';}
export function relatedDocumentPresentation(reservation,ctx){
 const p=projectReservation(reservation,ctx);
 if(p===null)return null;
 if(p.redacted)return {readable:false,reservation:{redacted:true,can_open:false}};
 return {readable:true,number:p.doc_no,status:p.status,reservation:p};
}
