'use client';
import {Warehouse,Package,ClipboardCheck,ArrowRight,ScanLine,Info,AlertCircle,CheckCircle2,Send,FileText,Home,Clock3} from 'lucide-react';
import type {Doc,Item,Line} from '@/lib/scanner-model';
import './scanner-outbound-review.css';
type Exception={code:string;reason:string};
export function OutboundSubmitSummary({name,count,total,target,recipient}:{name:string;count:number;total:number;target:number;recipient:string}){
 return <div className="sor-confirm-content"><Send className="sor-confirm-symbol" aria-hidden="true"/><p className="sor-confirm-name">{name}</p><dl className="sor-confirm-summary"><div><dt>Kho thực hiện</dt><dd>Kho Hoa Nam</dd></div><div><dt>Số lượng</dt><dd>{total} cái / {target} yêu cầu</dd></div><div><dt>Người nhận</dt><dd>{recipient}</dd></div></dl><p className="sor-confirm-note"><Info aria-hidden="true"/>Phiếu sẽ ở trạng thái chờ duyệt. Tồn kho chỉ thay đổi sau khi ghi sổ.</p></div>;
}
export function ScannerOutboundReview({name,note,lines,items,exceptions,error,busy,disabled,target,recipient,onNote,onSend,onScan}:{name:string;note:string;lines:Line[];items:Item[];exceptions:Exception[];error:string;busy:boolean;disabled:boolean;target:number;recipient:string;onNote:(value:string)=>void;onSend:()=>void;onScan:()=>void}){
 const total=lines.reduce((sum,l)=>sum+l.qty,0);const required=Number(target)||0;
 return <div className="sor-review" data-review-context="OUTBOUND">
  <div className="sor-context"><span><Warehouse aria-hidden="true"/>Kho Hoa Nam</span><span className="sor-context-tag">OUTBOUND</span></div>
  <ol className="sor-progress" aria-label="Tiến trình xuất kho">{['Thông tin','Quét mã','Kiểm tra'].map((label,i)=><li key={label} aria-current={i===2?'step':undefined}><span aria-hidden="true">{i+1}</span>{label}</li>)}</ol>
  <section className="sor-summary" aria-labelledby="sor-title"><div className="sor-summary-heading"><div><span className="sor-eyebrow">KIỂM TRA PHIẾU XUẤT</span><h2 id="sor-title">{name}</h2><p className="sor-recipient">Người nhận · {recipient}</p></div><ClipboardCheck aria-hidden="true"/></div><dl className="sor-totals"><div><dt>Đã soạn</dt><dd>{total}<span> cái</span></dd></div><div><dt>Yêu cầu</dt><dd>{required}<span> cái</span></dd></div></dl></section>
  {exceptions.length>0?<section className="sor-exceptions" aria-labelledby="sor-exception-title"><h3 id="sor-exception-title"><AlertCircle aria-hidden="true"/>Có mã cần kiểm tra lại</h3><ul>{exceptions.map(e=><li key={e.code}><strong>{e.code}</strong><span>{e.reason}</span></li>)}</ul></section>:<p className="sor-validation-note"><Info aria-hidden="true"/>Mã và số lượng được kiểm tra lại khi gửi duyệt.</p>}
  {error&&<div className="sor-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span></div>}
  <section className="sor-items" aria-labelledby="sor-items-title"><div className="sor-section-heading"><h3 id="sor-items-title">Danh sách xuất kho</h3><button type="button" onClick={onScan} disabled={busy}><ScanLine aria-hidden="true"/>Quay lại quét</button></div><ul className="sor-list">{lines.map(line=>{const item=items.find(i=>i.code===line.code);return <li key={line.code} className="sor-row"><Package aria-hidden="true"/><div><strong>{item?.name||line.code}</strong><span>{line.code} · {item?.sku}</span></div><span className="sor-item-qty">{line.qty} cái</span></li>;})}</ul></section>
  <div className="sor-note-field"><label htmlFor="sor-note">Ghi chú phiếu<span>Không bắt buộc</span></label><textarea id="sor-note" aria-label="Ghi chú phiếu" rows={3} value={note} disabled={busy||disabled} onChange={e=>onNote(e.target.value)} placeholder="Thông tin cần lưu ý khi duyệt phiếu"/></div>
  <div className="sc-sticky-actions sor-actions"><p>Gửi duyệt chưa làm thay đổi tồn kho.</p><button type="button" className="sc-btn sor-primary" disabled={disabled||busy||!total||total!==required} onClick={onSend}><Send aria-hidden="true"/><span>Gửi duyệt</span><ArrowRight aria-hidden="true"/></button></div>
 </div>;
}
export function ScannerOutboundResult({doc,onDocument,onHome}:{doc:Doc;onDocument:()=>void;onHome:()=>void}){
 const total=doc.lines.reduce((sum,l)=>sum+l.qty,0);
 return <div className="sor-result" data-result-context="OUTBOUND">
  <section className="sor-result-heading"><span className="sor-result-icon"><CheckCircle2 aria-hidden="true"/></span><h2>Đã gửi phiếu xuất</h2><p>Phiếu đã được ghi nhận để kiểm tra và duyệt.</p></section>
  <section className="sor-receipt" aria-label="Phiếu xuất đã gửi"><div className="sor-receipt-title"><FileText aria-hidden="true"/><strong>{doc.id}</strong><span className="sor-pending"><Clock3 aria-hidden="true"/>{doc.status}</span></div><h3>{doc.name}</h3><dl><div><dt>Kho thực hiện</dt><dd>Kho Hoa Nam</dd></div><div><dt>Ngày tạo</dt><dd>{doc.at}</dd></div><div><dt>Đã gửi</dt><dd>{doc.lines.length} mã · {total} cái</dd></div></dl></section>
  <div className="sor-result-note"><Info aria-hidden="true"/><p>Số lượng tồn chưa thay đổi. Phiếu chỉ cập nhật tồn kho sau khi được ghi sổ.</p></div>
  <div className="sc-sticky-actions sor-result-actions"><button type="button" className="sc-btn sor-primary" onClick={onDocument}><FileText aria-hidden="true"/><span>Xem chứng từ</span><ArrowRight aria-hidden="true"/></button><button type="button" className="sc-btn sor-secondary" onClick={onHome}><Home aria-hidden="true"/>Về trang chủ</button></div>
 </div>;
}
