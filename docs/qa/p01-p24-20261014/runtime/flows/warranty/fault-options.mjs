// User-authorized intake symptom choices. UI keys only, not backend status enums.
export const FAULT_OPTIONS=Object.freeze([
 ['power-off','Máy không lên nguồn'],
 ['power-unstable','Nguồn chập chờn / Tự tắt máy'],
 ['no-print','Không in được'],
 ['faint-print','Bản in mờ / Không rõ nét'],
 ['broken-print','Bản in bị sọc / Đứt nét'],
 ['label-offset','In lệch tem / Sai vị trí'],
 ['paper-jam','Kẹt giấy / Kẹt tem'],
 ['paper-sensor','Không nhận giấy / Tem'],
 ['cutter','Không cắt giấy / Lỗi dao cắt'],
 ['no-scan','Không quét được mã vạch'],
 ['unstable-scan','Quét mã chậm / Chập chờn'],
 ['usb','Không kết nối USB'],
 ['lan','Không kết nối mạng LAN'],
 ['bluetooth','Không kết nối Bluetooth'],
 ['wifi','Không kết nối Wi-Fi'],
 ['button','Nút bấm không hoạt động'],
 ['physical','Hư vỏ máy / Cổng kết nối'],
 ['other','Khác'],
].map(([id,name])=>Object.freeze({id,name})));
export const faultOption=id=>FAULT_OPTIONS.find(o=>o.id===id)||null;
export const faultText=d=>d.faultId==='other'?String(d.faultOther??'').trim():faultOption(d.faultId)?.name||'';
export function faultError(d){
 if(!faultOption(d.faultId))return 'Vui lòng chọn lỗi tiếp nhận.';
 if(d.faultId==='other'&&!String(d.faultOther??'').trim())return 'Mô tả tình trạng khi chọn “Khác”.';
 if(d.faultId==='other'&&String(d.faultOther??'').length>200)return 'Mô tả tình trạng tối đa 200 ký tự.';
 return '';
}
