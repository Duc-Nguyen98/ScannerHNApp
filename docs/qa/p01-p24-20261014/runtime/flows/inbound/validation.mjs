// P04 fields only; no outbound recipient/phone/geography/planned rules.
import { INBOUND_TYPES, INBOUND_SUPPLIERS } from './catalogue.mjs';
export function inboundFieldErrors(d) {
  const errors = {}, present = v => typeof v === 'string' && !!v.trim();
  if (!d) return { number: 'Chưa có thông tin phiếu nhập.' };
  if (!present(d.number)) errors.number = 'Thiếu mã phiếu nhập.';
  if (!INBOUND_TYPES.some(t=>t.id===d.typeId && t.name===d.type)) errors.type = 'Vui lòng chọn loại nhập hợp lệ.';
  if (!INBOUND_SUPPLIERS.some(s=>s.id===d.supplierId && s.name===d.supplier && s.code===d.supplierCode)) errors.supplier = 'Vui lòng chọn nhà cung cấp trong danh sách.';
  if (typeof d.note !== 'string' || d.note.length > 200) errors.note = 'Ghi chú tối đa 200 ký tự.';
  return errors;
}
export function manualCodeError(raw) {
  return typeof raw !== 'string' || !raw.trim() ? 'Vui lòng nhập mã QR/Serial/SKU.' : '';
}
