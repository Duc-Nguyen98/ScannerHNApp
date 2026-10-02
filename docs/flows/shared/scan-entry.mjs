// Shared scan surface derived from P04/P05's approved manual-entry upgrade.
// Markup only: each operation retains its own identity/validation/submit policy.
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function scanEntryMarkup({id,operation,title,subtitle,manual=false,value='',tone='idle',feedback='',locked=false,formLabel='Nhập mã sản phẩm',codeLabel='Mã QR/Serial/SKU',hint='Nhập từng mã, rồi nhấn Enter hoặc Kiểm tra mã.',icon}){
 return `<section class="hn-scan-entry ${manual?'hn-scan-manual-open':''}" aria-label="Quét và nhập mã">
  <div class="hn-scan-intro"><span class="hn-operation-icon" data-hn-operation="${esc(operation)}" data-size="lg">${icon('scan')}</span><div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div></div>
  <div class="hn-scan-camera" role="img" aria-label="Ảnh kho minh họa; camera chưa bật"><div class="hn-scan-reticle"></div><span>Camera chưa kết nối</span></div>
  <div class="hn-scan-actions"><button type="button" disabled>${icon('flash')} Đèn chưa sẵn sàng</button><button type="button" data-scan-action="manual" aria-expanded="${manual}" ${manual?`aria-controls="${id}-manual-form"`:''} ${locked?'disabled':''}>${icon('keyboard')} Nhập tay</button></div>
  ${manual?`<form id="${id}-manual-form" class="hn-scan-manual" novalidate aria-label="${esc(formLabel)}">
   <div class="hn-scan-manual-heading"><strong>${icon('keyboard')} Nhập mã sản phẩm</strong><button type="button" data-scan-action="collapse">Thu gọn</button></div>
   <label for="${id}-code">${esc(codeLabel)} <em>*</em></label>
   <div class="hn-scan-code-row"><input id="${id}-code" data-scan-code autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Ví dụ: HN12345" required aria-describedby="${id}-code-feedback" aria-invalid="${tone==='invalid'}" value="${esc(value)}" ${locked?'readonly':''}><button type="submit" ${locked?'disabled':''}>Kiểm tra mã</button></div>
   <p id="${id}-code-feedback" class="hn-scan-code-feedback" data-tone="${esc(tone)}" role="status" aria-live="polite" aria-atomic="true">${esc(feedback||hint)}</p>
  </form>`:''}
 </section>`;
}
