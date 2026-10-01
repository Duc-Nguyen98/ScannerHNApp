// Local P05 form rules, not a production API contract or proof of phone ownership.
// Check formatting without rewriting the value stored in the document.
export function validVietnamPhone(value) {
  if (typeof value !== 'string') return false;
  const phone = value.trim();
  if (!/^\+?[0-9]+(?:[ .-][0-9]+)*$/.test(phone)) return false;
  return /^(?:0|\+84)(?:[35789][0-9]{8}|2[0-9]{9})$/.test(phone.replace(/[ .-]/g, ''));
}

const present = value => typeof value === 'string' && value.trim().length > 0;
export const validPlannedInput = value => typeof value === 'string' && /^[1-9][0-9]?$/.test(value);
export function outboundFieldErrors(document) {
  const d = document || {}, errors = {};
  if (!present(d.number)) errors.number = 'Thiếu mã phiếu nguồn. Vui lòng kiểm tra phiếu.';
  if (!present(d.recipient)) errors.recipient = 'Vui lòng chọn người nhận.';
  if (!present(d.phone)) errors.phone = 'Vui lòng nhập số điện thoại.';
  else if (!validVietnamPhone(d.phone)) errors.phone = 'Số điện thoại không hợp lệ. Ví dụ: 0901 234 567, +84 901 234 567 hoặc 028 3822 1234.';
  if (!present(d.provinceId) || !present(d.provinceName)) errors.province = 'Vui lòng chọn Tỉnh/Thành phố.';
  if (!present(d.districtId) || !present(d.districtName)) errors.district = 'Vui lòng chọn Quận/Huyện.';
  if (!present(d.address)) errors.address = 'Vui lòng nhập địa chỉ chi tiết sau khi chọn Tỉnh/Thành phố và Quận/Huyện.';
  if (!Number.isInteger(d.planned) || d.planned < 1 || d.planned > 99 || (d.plannedInput !== undefined && (!validPlannedInput(d.plannedInput) || Number(d.plannedInput) !== d.planned))) errors.planned = 'Nhập số nguyên từ 1 đến 99, không dùng dấu, khoảng trắng hoặc số thập phân.';
  if (!present(d.group)) errors.group = 'Thiếu nhóm hàng của phiếu nguồn.';
  if (typeof d.note !== 'string' || d.note.length > 200) errors.note = 'Ghi chú tối đa 200 ký tự.';
  return errors;
}

export function manualCodeError(raw) {
  return typeof raw !== 'string' || !raw.trim() ? 'Vui lòng nhập mã QR/Serial/SKU.' : '';
}
