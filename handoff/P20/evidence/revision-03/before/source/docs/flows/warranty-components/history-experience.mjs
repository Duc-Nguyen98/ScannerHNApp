// Read-only presentation. Does not invent a backend schema or mutate receipts.
const known=v=>typeof v==='string'&&v.length>0;
const quantity=v=>Number.isSafeInteger(v)&&v>0;
export function summarizeReceipt(document){
 const rows=Array.isArray(document?.lines)?document.lines:[],groups=new Map();let total=0,totalKnown=rows.length>0,skuKnown=rows.length>0;
 for(const [i,line] of rows.entries()){
  const l=line||{},hasSku=known(l.sku),key=hasSku?l.sku:Symbol(i);skuKnown&&=hasSku;
  if(!groups.has(key))groups.set(key,{sku:l.sku,name:l.name,quantity:0,known:true,codes:new Set(),codesKnown:true});
  const g=groups.get(key);if(quantity(l.quantity)&&Number.isSafeInteger(g.quantity+l.quantity))g.quantity+=l.quantity;else g.known=false;
  if(quantity(l.quantity)&&Number.isSafeInteger(total+l.quantity))total+=l.quantity;else totalKnown=false;
  if(known(l.code))g.codes.add(l.code);else g.codesKnown=false;
 }
 return {groups:[...groups.values()],skuCount:skuKnown?groups.size:null,total:totalKnown?total:null};
}
export function receiptSummary(document){const s=summarizeReceipt(document);return `${s.skuCount===null?'Số loại chưa xác minh':s.skuCount+' loại linh kiện'} · ${s.total===null?'Tổng số lượng chưa xác minh':'Tổng số lượng '+s.total}`;}
const value=v=>v===null||v===undefined||v===''?'Chưa xác minh':String(v);
export function receiptCodes(document){return `Phiếu: ${value(document.id)}\nHồ sơ: ${value(document.caseId)}\nThời điểm xuất: ${value(document.at)}\n\n`+(document.lines?.length?document.lines.map((l,i)=>`Dòng ${i+1}\nSKU: ${value(l.sku)}\nTên linh kiện: ${value(l.name)}\n${l.kind==='BOX'?'Mã hộp':l.kind==='UNIT'?'Mã linh kiện':'Mã linh kiện / hộp'}: ${value(l.code)}\nSố lượng: ${quantity(l.quantity)?l.quantity:'Chưa xác minh'}`).join('\n\n'):'Chưa có chi tiết mã được xác minh.');}
export function pendingSummary(pending){if(!pending)return '';const c=pending.counts;return `${Number.isSafeInteger(c?.codes)&&c.codes>=0?c.codes:'Chưa xác minh'} mã/hộp · ${Number.isSafeInteger(c?.quantity)&&c.quantity>=0?c.quantity:'Chưa xác minh'} linh kiện`;}
export function newlyLoadedIds(before,after){const seen=new Set(before.map(r=>r.id));return [...new Set(after.filter(r=>!seen.has(r.id)).map(r=>r.id))];}
