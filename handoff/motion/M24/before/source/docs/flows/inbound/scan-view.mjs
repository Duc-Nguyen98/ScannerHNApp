// Presentation only: filtering never changes attempts, accepted lines or requests.
export const SCAN_FILTERS = Object.freeze([
  {id:'all',label:'Tất cả'}, {id:'valid',label:'Hợp lệ'},
  {id:'duplicate',label:'Trùng'}, {id:'invalid',label:'Lỗi'},
].map(Object.freeze));
export function scanListView(attempts, filter='all') {
  const selected=SCAN_FILTERS.some(f=>f.id===filter)?filter:'all';
  const counts={all:attempts.length,valid:0,duplicate:0,invalid:0};
  attempts.forEach(a=>{if(Object.hasOwn(counts,a.kind)&&a.kind!=='all')counts[a.kind]++;});
  const rows=attempts.map((attempt,index)=>({attempt,index})).filter(({attempt})=>selected==='all'||attempt.kind===selected).reverse();
  return {selected,counts,rows};
}
export function skuGroups(accepted) {
  const groups=new Map();
  for(const line of accepted){const group=groups.get(line.sku)||{sku:line.sku,quantity:0,serialCount:0,serials:[]};
    const serial=typeof line.serial==='string'&&line.serial.trim()?line.serial:null;
    group.quantity+=line.quantity;group.serialCount+=serial?1:0;group.serials.push({raw:line.raw,serial,quantity:line.quantity});groups.set(line.sku,group);}
  return [...groups.values()];
}
