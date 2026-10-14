const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Only callers choose the existing read-only reset action; no business mutation.
export function clearFilterButton(attribute,action='clear-filters') {
  if(!/^data-[a-z0-9-]+$/.test(attribute))throw new Error('Invalid action attribute');
  return `<button type="button" class="hn-clear-filters" ${attribute}="${esc(action)}">Xóa bộ lọc</button>`;
}
