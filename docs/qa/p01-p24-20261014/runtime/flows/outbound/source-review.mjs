import {outboundSourceValues,OUTBOUND_SOURCES} from './fixture-adapter.mjs';

// Read-only preview shares exactly the values used when the fixture creates a document.
export function sourceChangeReview(document,sourceId){
  const next=outboundSourceValues(sourceId),source=OUTBOUND_SOURCES.find(s=>s.id===sourceId);
  if(!document||!next||sourceId===document.sourceId)return null;
  const value=v=>v==null||v===''?'Chưa chọn':String(v);
  const pair=(label,a,b)=>`${label}\n${value(a)} → ${value(b)}`;
  return {title:`Đổi sang ${source.name}?`,message:[
    'Kiểm tra thông tin sẽ thay thế:',
    pair('Người nhận',document.recipient,next.recipient),
    pair('Số điện thoại',document.phone,next.phone),
    pair('Số lượng cần soạn',document.plannedInput??document.planned,next.planned),
    pair('Nhóm hàng',document.group,next.group),
    pair('Địa chỉ giao hàng',[document.address,document.districtName,document.provinceName].filter(Boolean).join(', '),''),
    pair('Ghi chú',document.note||'Không có',next.note||'Không có'),
    'Địa chỉ cần chọn lại sau khi đổi phiếu. Các thông tin đang nhập ở trên sẽ được thay thế.',
  ].join('\n\n')};
}

export function canApplySourceChange(snapshot,expectedDocument){
  return !!snapshot?.document && snapshot.step===1 && !snapshot.busy && !snapshot.request && !snapshot.unknown && !snapshot.attempts?.length && JSON.stringify(snapshot.document)===JSON.stringify(expectedDocument);
}
