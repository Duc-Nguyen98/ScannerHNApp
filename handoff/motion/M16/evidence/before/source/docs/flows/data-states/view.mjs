import {HOME_ICONS} from '../home/icons.mjs';
import {DIALOG_ICONS} from '../scanner-dialogs/icons.mjs';
import {LOOKUP_ICONS} from '../lookup/icons.mjs';
const glyphs={...HOME_ICONS,...DIALOG_ICONS,...LOOKUP_ICONS,
 // Verbatim existing warranty-components/flow.js geometry; cloud from HEAD
 // node_modules/lucide-react/dist/esm/icons/cloud.mjs (ISC, existing dependency).
 document:'<path d="M14 2H5v20h14V7zM14 2v5h5M8 11h8M8 15h8M8 18h5"/>',
 cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
 refresh:'<path d="M20 5v5h-5M4 19v-5h5M20 10a8 8 0 0 0-14-5M4 14a8 8 0 0 0 14 5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${glyphs[name]||glyphs.document}</svg>`;
const action=(name,label,secondary=false)=>`<button type="button" data-p12="${name}" class="p16-action ${secondary?'p16-secondary':''}">${name==='retry'?icon('refresh'):name==='create'?icon('plus'):''}<span>${label}</span></button>`;
export function filterChips(filters={},types={},statuses={}) {
 const day=v=>v?v.split('-').reverse().join('/'):'Không giới hạn';
 const entries=[['q',filters.q?`Từ khóa: ${filters.q}`:''],['type',filters.type&&filters.type!=='all'?`Loại: ${types[filters.type]||filters.type}`:''],['date',filters.from||filters.to?`Ngày: ${day(filters.from)} – ${day(filters.to)}`:''],['status',filters.status&&filters.status!=='all'?`Trạng thái: ${statuses[filters.status]||filters.status}`:'']].filter(([,label])=>label);
 return entries.length?`<div class="p16-chips" role="group" aria-label="Điều kiện đang áp dụng">${entries.map(([key,label])=>`<button type="button" data-p16-remove="${key}" aria-label="Bỏ điều kiện ${esc(label)}" title="${esc(label)}"><span>${esc(label)}</span><b aria-hidden="true">×</b></button>`).join('')}</div>`:'';
}
export function dataStateView({kind,query='',canCreate=false,errorCode=null,filters={},types={},statuses={}}) {
 if(kind==='ready')return '';
 if(kind==='searching')return '<section class="p16-searching" data-data-state="searching" role="status" aria-live="off"><span class="p16-spinner" aria-hidden="true"></span><p>Đang tìm chứng từ…</p></section>';
 if(kind==='refreshing'||kind==='stale')return `<section class="p16-stale" data-data-state="${kind}" role="status" aria-live="off"><p>${kind==='refreshing'?'Đang cập nhật chứng từ…':'Chưa cập nhật được dữ liệu.'}<small>Đang hiển thị dữ liệu đã tải trước đó.</small></p>${kind==='stale'?action('retry','Thử lại'):'<span class="p16-spinner" aria-hidden="true"></span>'}</section>`;
 const panel={loading:'P16.S01',empty:'P16.S02','no-results':'P16.S03',error:'P16.S04'}[kind];
 if(kind==='loading')return `<section class="p16-loading" data-panel="${panel}" data-data-state="loading"><div class="p16-skeletons" aria-hidden="true">${Array.from({length:6},()=>'<div class="p16-skeleton"><i></i><div><b></b><b></b></div><em></em></div>').join('')}</div><p class="p16-loading-copy" role="status" aria-live="off"><span class="p16-spinner" aria-hidden="true"></span><span>Đang tải chứng từ…<small>Vui lòng chờ trong giây lát</small></span></p></section>`;
 const title=kind==='empty'?'Chưa có chứng từ':kind==='no-results'?'Không tìm thấy kết quả':'Không tải được dữ liệu';
 const copy=kind==='empty'?(canCreate?'Bạn chưa có chứng từ nào.<br>Hãy tạo chứng từ mới để bắt đầu.':'Chưa có chứng từ trong phạm vi được xem.'):kind==='no-results'?`Không có chứng từ phù hợp${query?` với <strong>“${esc(query)}”</strong>`:' với bộ lọc hiện tại'}.<br>Vui lòng thử lại với điều kiện khác.`:'Dữ liệu chưa được cập nhật.<br>Vui lòng thử lại sau.';
 return `<section class="p16-state" data-panel="${panel}" data-data-state="${kind}"><div class="p16-art" data-tone="${kind==='error'?'error':'neutral'}">${icon(kind==='error'?'cloud':'document')}${kind==='empty'?'':`<span>${icon(kind==='error'?'alert':'search')}</span>`}</div><div role="status" aria-live="off"><h2>${title}</h2><p class="p16-description" ${kind==='no-results'?'data-preview-key="p16-query"':''}>${copy}</p></div>${kind==='no-results'?'<button type="button" class="p12-text-more p16-query-more" data-p12="read-query" data-preview-for="p16-query" aria-haspopup="dialog" aria-label="Xem đầy đủ từ khóa tìm kiếm" hidden>Xem đầy đủ</button>':''}${kind==='no-results'?filterChips(filters,types,statuses):''}<div class="p16-actions">${kind==='empty'?(canCreate?action('create','Tạo chứng từ'):''):kind==='no-results'?action('clear','Xóa bộ lọc',true)+(query.trim()?action('edit-query','Sửa từ khóa'):action('filter','Điều chỉnh bộ lọc')):action('retry','Thử lại')}</div>${kind==='error'&&typeof errorCode==='string'&&errorCode?`<small class="p16-error-code">Mã lỗi: ${esc(errorCode)}</small>`:''}</section>`;
}
