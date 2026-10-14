// Only maps verified current P05 readback into the existing P12 detail/timeline.
// Never derives current status or adds events from a historical RECORD receipt.
export function currentDocumentRow(current,source,warehouseName){
  if(!current||!source||current.document.id!==source.source_document_id)return null;
  const d=current.document,stamp=value=>{const date=new Date(value);return Number.isNaN(date.valueOf())?{day:'',time:''}:{day:date.toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}),time:date.toLocaleTimeString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit'})};};
  const status={DRAFT:'draft',SCANNING:'waiting',POSTED:'posted',CANCELLED:'cancelled',REVERSED:'reversed'}[current.status];
  return {id:d.id,number:d.doc_no,type:'outbound',...stamp(d.created_at),partner:d.recipient_name,warehouseId:d.src_warehouse_id,warehouse:warehouseName,actor:d.created_by||'Chưa có dữ liệu',version:d.version,status,note:d.note||'',attachments:null,
    lines:(d.lines||[]).map(l=>{const plan=source.lines.find(s=>s.line_id===l.id);return {id:l.id,sku:plan?.sku_code||null,name:plan?.sku_name||'Chưa có dữ liệu',quantity:l.qty_planned,unit:'Cái',image:null,serialCount:null};}),
    events:current.history.map(e=>({id:e.id,...stamp(e.created_at),label:e.to_status==='POSTED'?'Đã ghi sổ trên Web':e.to_status==='SCANNING'?'Gửi phiếu lên Web':e.to_status==='DRAFT'?'Tạo phiếu':e.action,actor:e.changed_by||'Chưa có dữ liệu',description:e.note||''})),
    observedAt:current.observed_at,serverStatus:current.status};
}
