'use client';
import {Warehouse,Package,ClipboardCheck,ArrowRight,ScanLine,Info,AlertCircle,CheckCircle2,Send,FileText,Home,Clock3} from 'lucide-react';
import type {Doc,Item,Line} from '@/lib/scanner-model';
import './scanner-inbound-review.css';
type Exception={code:string;reason:string};
export function InboundSubmitSummary({name,count,total}:{name:string;count:number;total:number}){
 return <div className="sir-confirm-content"><Send className="sir-confirm-symbol" aria-hidden="true"/><p className="sir-confirm-name">{name}</p><dl className="sir-confirm-summary"><div><dt>Kho thực hiện</dt><dd>Kho Hoa Nam</dd></div><div><dt>Số lượng</dt><dd>{total} cái / {count} mã</dd></div></dl><p className="sir-confirm-note"><Info aria-hidden="true"/>Phiếu sẽ ở trạng thái chờ duyệt. Tồn kho chỉ thay đổi sau khi ghi sổ.</p></div>;
}
export function ScannerInboundReview({name,note,lines,items,exceptions,error,busy,disabled,onNote,onSend,onScan}:{name:string;note:string;lines:Line[];items:Item[];exceptions:Exception[];error:string;busy:boolean;disabled:boolean;onNote:(value:string)=>void;onSend:()=>void;onScan:()=>void}){
 const total=lines.reduce((sum,l)=>sum+l.qty,0);
 return <div className="sir-review" data-review-context="INBOUND">
  <div className="sir-context"><span><Warehouse aria-hidden="true"/>Kho Hoa Nam</span><span className="sir-context-tag">INBOUND</span></div>
  <ol className="sir-progress" aria-label="Tiến trình nhập kho">{['Thông tin','Quét mã','Kiểm tra'].map((label,i)=><li key={label} aria-current={i===2?'step':undefined}><span aria-hidden="true">{i+1}</span>{label}</li>)}</ol>
  <section className="sir-summary" aria-labelledby="sir-title"><div className="sir-summary-heading"><div><span className="sir-eyebrow">KIỂM TRA PHIẾU NHẬP</span><h2 id="sir-title">{name}</h2></div><ClipboardCheck aria-hidden="true"/></div><dl className="sir-totals"><div><dt>Mã đã quét</dt><dd>{lines.length}<span> mã</span></dd></div><div><dt>Tổng số lượng</dt><dd>{total}<span> cái</span></dd></div></dl></section>
  {exceptions.length>0?<section className="sir-exceptions" aria-labelledby="sir-exception-title"><h3 id="sir-exception-title"><AlertCircle aria-hidden="true"/>Có mã cần kiểm tra lại</h3><ul>{exceptions.map(e=><li key={e.code}><strong>{e.code}</strong><span>{e.reason}</span></li>)}</ul></section>:<p className="sir-validation-note"><Info aria-hidden="true"/>Mã và số lượng được kiểm tra lại khi gửi duyệt.</p>}
  {error&&<div className="sir-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span></div>}
  <section className="sir-items" aria-labelledby="sir-items-title"><div className="sir-section-heading"><h3 id="sir-items-title">Danh sách nhập kho</h3><button type="button" onClick={onScan} disabled={busy}><ScanLine aria-hidden="true"/>Quay lại quét</button></div><ul className="sir-list">{lines.map(line=>{const item=items.find(i=>i.code===line.code);return <li key={line.code} className="sir-row"><Package aria-hidden="true"/><div><strong>{item?.name||line.code}</strong><span>{line.code} · {item?.sku}</span></div><span className="sir-item-qty">{line.qty} cái</span></li>;})}</ul></section>
  <div className="sir-note-field"><label htmlFor="sir-note">Ghi chú phiếu<span>Không bắt buộc</span></label><textarea id="sir-note" aria-label="Ghi chú phiếu" rows={3} value={note} disabled={busy||disabled} onChange={e=>onNote(e.target.value)} placeholder="Thông tin cần lưu ý khi duyệt phiếu"/></div>
  <div className="sc-sticky-actions sir-actions"><p>Gửi duyệt chưa làm thay đổi tồn kho.</p><button type="button" className="sc-btn sir-primary" disabled={disabled||busy||!total} onClick={onSend}><Send aria-hidden="true"/><span>Gửi duyệt</span><ArrowRight aria-hidden="true"/></button></div>
 </div>;
}
export function ScannerInboundResult({doc,onDocument,onHome}:{doc:Doc;onDocument:()=>void;onHome:()=>void}){
 const total=doc.lines.reduce((sum,l)=>sum+l.qty,0);
 return <div className="sir-result" data-result-context="INBOUND">
  <section className="sir-result-heading"><span className="sir-result-icon"><CheckCircle2 aria-hidden="true"/></span><h2>Đã gửi phiếu nhập</h2><p>Phiếu đã được ghi nhận để kiểm tra và duyệt.</p></section>
  <section className="sir-receipt" aria-label="Phiếu nhập đã gửi"><div className="sir-receipt-title"><FileText aria-hidden="true"/><strong>{doc.id}</strong><span className="sir-pending"><Clock3 aria-hidden="true"/>{doc.status}</span></div><h3>{doc.name}</h3><dl><div><dt>Kho thực hiện</dt><dd>Kho Hoa Nam</dd></div><div><dt>Ngày tạo</dt><dd>{doc.at}</dd></div><div><dt>Đã gửi</dt><dd>{doc.lines.length} mã · {total} cái</dd></div></dl></section>
  <div className="sir-result-note"><Info aria-hidden="true"/><p>Số lượng tồn chưa thay đổi. Phiếu chỉ cập nhật tồn kho sau khi được ghi sổ.</p></div>
  <div className="sc-sticky-actions sir-result-actions"><button type="button" className="sc-btn sir-primary" onClick={onDocument}><FileText aria-hidden="true"/><span>Xem chứng từ</span><ArrowRight aria-hidden="true"/></button><button type="button" className="sc-btn sir-secondary" onClick={onHome}><Home aria-hidden="true"/>Về trang chủ</button></div>
 </div>;
}
