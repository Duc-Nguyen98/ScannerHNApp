// User-authorized design fixtures only. These IDs are not WMS IDs/enums.
export const INBOUND_TYPES = Object.freeze([
  {id:'products',name:'Nhập sản phẩm'},
  {id:'components',name:'Nhập linh kiện'},
  {id:'other',name:'Khác'},
].map(Object.freeze));
export const INBOUND_SUPPLIERS = Object.freeze([
  'Công ty Minh Phát', 'Công ty An Bình', 'Công ty Thiên Long',
  'Công ty Hoàng Gia', 'Công ty Đại Việt', 'Công ty Tân Phú',
  'Công ty Phúc An', 'Công ty Hải Đăng', 'Công ty Nam Việt',
  'Công ty Đông Á', 'Công ty Bình Minh', 'Công ty Hưng Thịnh',
  'Công ty Kim Long', 'Công ty Sao Việt', 'Công ty Thành Công',
].map((name,index)=>Object.freeze({id:`fixture-supplier-${String(index+1).padStart(3,'0')}`,code:`NCC-${String(index+1).padStart(3,'0')}`,name})));
export const foldSearch = value => String(value).toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim();
export function matchesOption(option, query) {
  const text=foldSearch(`${option.name} ${option.code||''}`);
  return foldSearch(query).split(/\s+/).filter(Boolean).every(word=>text.includes(word));
}
