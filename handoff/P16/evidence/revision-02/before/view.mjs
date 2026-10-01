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
export function dataStateView({kind,query='',canCreate=false,errorCode=null}) {
 if(kind==='ready')return '';
 if(kind==='refreshing'||kind==='stale')return `<section class="p16-stale" data-data-state="${kind}" role="status"><p>${kind==='refreshing'?'Đang cập nhật chứng từ…':'Chưa cập nhật được dữ liệu. Đang hiển thị kết quả đã tải trước đó.'}</p>${kind==='stale'?action('retry','Thử lại'):'<span class="p16-spinner" aria-hidden="true"></span>'}</section>`;
 const panel={loading:'P16.S01',empty:'P16.S02','no-results':'P16.S03',error:'P16.S04'}[kind];
 if(kind==='loading')return `<section class="p16-loading" data-panel="${panel}" data-data-state="loading"><div class="p16-skeletons" aria-hidden="true">${Array.from({length:6},()=>'<div class="p16-skeleton"><i></i><div><b></b><b></b></div><em></em></div>').join('')}</div><p class="p16-loading-copy" role="status"><span class="p16-spinner" aria-hidden="true"></span><span>Đang tải chứng từ…<small>Vui lòng chờ trong giây lát</small></span></p></section>`;
 const title=kind==='empty'?'Chưa có chứng từ':kind==='no-results'?'Không tìm thấy kết quả':'Không tải được dữ liệu';
 const copy=kind==='empty'?(canCreate?'Bạn chưa có chứng từ nào.<br>Hãy tạo chứng từ mới để bắt đầu.':'Chưa có chứng từ trong phạm vi được xem.'):kind==='no-results'?`Không có chứng từ phù hợp${query?` với <strong>“${esc(query)}”</strong>`:' với bộ lọc hiện tại'}.<br>Vui lòng thử lại với điều kiện khác.`:'Dữ liệu chưa được cập nhật.<br>Vui lòng thử lại sau.';
 return `<section class="p16-state" data-panel="${panel}" data-data-state="${kind}"><div class="p16-art" data-tone="${kind==='error'?'error':'neutral'}">${icon(kind==='error'?'cloud':'document')}${kind==='empty'?'':`<span>${icon(kind==='error'?'alert':'search')}</span>`}</div><div role="status"><h2>${title}</h2><p>${copy}</p></div><div class="p16-actions">${kind==='empty'?(canCreate?action('create','Tạo chứng từ'):''):kind==='no-results'?action('clear','Xóa bộ lọc',true)+action('edit-query','Sửa từ khóa'):action('retry','Thử lại')}</div>${kind==='error'&&typeof errorCode==='string'&&errorCode?`<small class="p16-error-code">Mã lỗi: ${esc(errorCode)}</small>`:''}</section>`;
}
