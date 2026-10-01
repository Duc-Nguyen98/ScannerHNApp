const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function flowProgress(step){return step>=1&&step<=3?`<ol class="hn-flow-progress" aria-label="Tiến trình tạo phiếu">${['Thông tin','Thêm sản phẩm','Kiểm tra'].map((label,i)=>`<li data-state="${i+1===step?'current':i+1<step?'done':'next'}" ${i+1===step?'aria-current="step"':''}><span aria-hidden="true">${i+1<step?'✓':i+1}</span>${label}</li>`).join('')}</ol>`:'';}
export function reviewTotals(type,accepted){
 const quantity=accepted.every(r=>Number.isFinite(r.quantity))?accepted.reduce((sum,r)=>sum+r.quantity,0):'—';
 const skus=accepted.every(r=>r.sku)?new Set(accepted.map(r=>r.sku)).size:'—';
 return `<section class="hn-review-totals" aria-label="Tóm tắt trước khi gửi"><div><span>Loại phiếu</span><strong>${esc(type)}</strong></div><div><span>Số lượng</span><strong>${quantity}</strong></div><div><span>Số SKU</span><strong>${skus}</strong></div></section>`;
}
// Owned by a mounted authenticated Home; never localStorage or a cross-user singleton.
export function createRecentChoices(limit=3){let ids=[];return {use(id){if(typeof id==='string'&&id)ids=[id,...ids.filter(x=>x!==id)].slice(0,limit);},read(){return [...ids];}};}
export function pendingStockRun(type,s,session){
 const d=s?.document;
 if(!['inbound','outbound'].includes(type)||!d||s.recorded||s.outcome==='recorded'||d.actorId!==session?.actor?.id||d.warehouseId!==session?.warehouse?.id)return null;
 return {type,document:d,step:s.step,unknown:!!s.unknown,busy:!!s.busy,outcome:s.outcome,quantity:(s.accepted||[]).reduce((n,r)=>n+r.quantity,0)};
}
