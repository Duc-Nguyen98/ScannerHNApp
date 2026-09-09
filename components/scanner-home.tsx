'use client';
import {ArrowDown,ArrowUpFromLine,ArrowRight,ClipboardCheck,Wrench,Radio,ScanLine,ChevronRight,Clock3,PauseCircle} from 'lucide-react';
import type {Kind} from '@/lib/scanner-model';
import {DESIGN_SHIFT_TIME,type HomeRecord} from '@/lib/scanner-design-fixtures';
const kindLabel=(kind:Kind|'warranty')=>kind==='in'?'Nhập kho':kind==='out'?'Xuất kho':kind==='warranty'?'Bảo hành':'Xuất linh kiện';
// Present stored timestamps compactly without inventing dates or changing the source.
function recordTime(value:string){
 const date=value.match(/(\d{1,2})\/(\d{1,2})\/\d{4}/),time=value.match(/(\d{1,2}):(\d{2})/);
 return date&&time?`${date[1].padStart(2,'0')}/${date[2].padStart(2,'0')} ${time[1].padStart(2,'0')}:${time[2]}`:value;
}
function PackageIcon(){return <svg viewBox="0 0 32 32" aria-hidden="true" className="sh-package"><path d="m16 3 12 6-12 6L4 9Z" fill="#ffd36b" stroke="#ffeaba" strokeLinejoin="round"/><path d="m4 9 12 6v14L4 23Z" fill="#ffb128" stroke="#ffda80" strokeLinejoin="round"/><path d="m16 15 12-6v14l-12 6Z" fill="#ee970e" stroke="#ffc950" strokeLinejoin="round"/><path d="m10 6 12 6v7l-4 2v-7L6 8M8 13v7m3-6v7m9-5v7m4-10v8" fill="none" stroke="#ffe8a6" strokeWidth="1.1"/></svg>;}
export default function ScannerHome({name,paused,statusKnown,pendingCount,openCases,shiftStarted,docs,canInbound,canOutbound,draft,onPending,onWarranty,onOpenCases,onStart,onNfc,onLookup,onDocs,onDoc,onResume}:{name:string;paused:boolean;statusKnown:boolean;pendingCount:number;openCases:number;shiftStarted:boolean;docs:HomeRecord[];canInbound:boolean;canOutbound:boolean;draft:{kind:Kind;lines:number}|null;onPending:()=>void;onWarranty:()=>void;onOpenCases:()=>void;onStart:(kind:'in'|'out')=>void;onNfc:()=>void;onLookup:()=>void;onDocs:()=>void;onDoc:(id:string,target:'doc'|'case')=>void;onResume:()=>void}){
 const shiftTime=shiftStarted?DESIGN_SHIFT_TIME:null;
 const tasks=[{label:'Nhập kho',sub:'Nhận hàng và kiểm đếm',Icon:PackageIcon,allowed:canInbound,action:()=>onStart('in')},{label:'Xuất kho',sub:'Soạn hàng theo phiếu',Icon:ArrowUpFromLine,allowed:canOutbound,action:()=>onStart('out')},{label:'Bảo hành',sub:'Tiếp nhận và sửa chữa',Icon:Wrench,allowed:true,action:onWarranty},{label:'Thẻ NFC',sub:'Liên kết và tra cứu thẻ',Icon:Radio,allowed:true,action:onNfc}];
 return <div className="sh-dashboard">
  <section className="sh-hero" aria-label="Kho và ca làm việc">
   <div className="sh-warehouse-line"><span>KHO HOA NAM</span><span className={paused?'sh-status paused':'sh-status'}>{!statusKnown?'Chưa xác định':paused?<><PauseCircle aria-hidden="true"/>Tạm dừng</>:<><i aria-hidden="true"/>Đang hoạt động</>}</span></div>
   <h2>Chào bạn, {name}</h2><p>Cùng vận hành kho hiệu quả hôm nay!</p>
  </section>
  <section className="sh-summary" aria-label="Tổng quan vận hành">
   <button onClick={onPending}><div><strong>{pendingCount}</strong><ClipboardCheck aria-hidden="true"/></div><span>Phiếu chờ duyệt</span></button>
   <button onClick={onOpenCases}><div><strong>{openCases}</strong><Wrench aria-hidden="true"/></div><span>Bảo hành đang mở</span></button>
   <section className="sh-shift" aria-label={shiftTime?`Ca bắt đầu lúc ${shiftTime}`:shiftStarted?'Ca đã bắt đầu, chưa có dữ liệu giờ bắt đầu':'Ca chưa bắt đầu'}><div><strong>{shiftTime||'—'}</strong><Clock3 aria-hidden="true"/></div><span>Ca bắt đầu</span>{!shiftTime&&<small>{shiftStarted?'Chưa ghi nhận giờ':'Chưa vào ca'}</small>}</section>
  </section>
  <section className="sh-tasks">
   <div className="sh-section-title"><h3>Tác vụ kho</h3><span>Chọn nghiệp vụ để bắt đầu <ArrowRight aria-hidden="true"/></span></div>
   <div className="sh-task-grid">{tasks.map(({label,sub,Icon,allowed,action},i)=><button key={label} className={`sh-task ${i===0?'sh-task-primary':''}`} disabled={!allowed} onClick={action}>
    <span className="sh-task-icon"><Icon aria-hidden="true"/></span><span className="sh-task-copy"><strong>{label}</strong><small>{allowed?sub:paused?'Kho đang tạm dừng':'Không có quyền lập phiếu'}</small></span><ChevronRight className="sh-task-chevron" aria-hidden="true"/>
   </button>)}</div>
  </section>
  <button className="sh-lookup" onClick={onLookup}><span className="sh-lookup-icon"><ScanLine aria-hidden="true"/></span><span className="sh-lookup-copy"><strong>Quét hoặc nhập mã sản phẩm</strong><small>QR · Serial · SKU</small></span><ChevronRight aria-hidden="true"/></button>
  {draft&&<section className="sh-draft"><h3>Phiếu đang soạn · {kindLabel(draft.kind)}</h3><p>{draft.lines} mã đã giữ trong phiên.</p><button className="sc-btn secondary" onClick={onResume}>Tiếp tục quét</button></section>}
  <section className="sh-documents">
   <div className="sh-section-title"><h3>Chứng từ gần đây</h3><button onClick={onDocs}>Xem tất cả <ArrowRight aria-hidden="true"/></button></div>
   <div className="sh-recent">{docs.map(d=>{const Icon=d.kind==='in'?ArrowDown:d.kind==='out'?ArrowUpFromLine:Wrench;return <button key={d.id} className="sh-record" data-kind={d.kind} onClick={()=>onDoc(d.id,d.target)}>
    <span className="sh-record-icon"><Icon aria-hidden="true"/></span>
    <span className="sh-record-content"><strong>{d.id}</strong><span title={`${kindLabel(d.kind)} · ${d.name}`}>{kindLabel(d.kind)} · {d.name}</span></span>
    <span className="sh-record-meta"><time title={d.at}>{recordTime(d.at)}</time><span className={d.status==='Chờ duyệt'?'sh-doc-status pending':d.status==='Đã huỷ'?'sh-doc-status cancelled':d.status==='Đang xử lý'?'sh-doc-status processing':'sh-doc-status'}>{d.status}</span></span>
    <ChevronRight className="sh-record-chevron" aria-hidden="true"/>
   </button>;})}{!docs.length&&<p className="sh-empty">Chưa có chứng từ. Chọn “Xem tất cả” để kiểm tra danh sách.</p>}</div>
  </section>
 </div>;
}
