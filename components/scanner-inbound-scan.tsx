'use client';
import {useRef,type ReactNode} from 'react';
import {Warehouse,Camera,ScanLine,Keyboard,CheckCircle2,AlertCircle,Package,X,ArrowRight,ClipboardCheck} from 'lucide-react';
import type {Item,Line} from '@/lib/scanner-model';
import './scanner-inbound-scan.css';

/** P05 presentation. All code validation/stock/draft operations remain parent callbacks. */
export default function ScannerInboundScan({name,code,lines,items,error,notice,busy,disabled,onCode,onScan,onRemove,onCamera,onReview,qaExamples}:{name:string;code:string;lines:Line[];items:Item[];error:string;notice:string;busy:boolean;disabled:boolean;onCode:(value:string)=>void;onScan:(value:string)=>void;onRemove:(value:string)=>void;onCamera:()=>void;onReview:()=>void;qaExamples?:ReactNode}){
 const input=useRef<HTMLInputElement>(null);const total=lines.reduce((sum,line)=>sum+line.qty,0);const feedback=error||(notice.startsWith('Đã thêm')&&lines.length?`${lines.at(-1)!.code} · ${notice}`:notice);
 return <div className="sis-scan" data-scan-context="INBOUND">
  <div className="sis-context"><span><Warehouse aria-hidden="true"/>Kho Hoa Nam</span><span className="sis-context-tag">INBOUND</span></div>
  <ol className="sis-progress" aria-label="Tiến trình nhập kho">{['Thông tin','Quét mã','Kiểm tra'].map((label,i)=><li key={label} aria-current={i===1?'step':undefined}><span className="sis-step-number" aria-hidden="true">{i+1}</span>{label}</li>)}</ol>
  <section className="sis-workspace" aria-label="Quét và kiểm đếm">
   <div className="sis-document"><span>PHIẾU NHẬP</span><h2>{name}</h2></div>
   <section className="sis-viewfinder" aria-label="Khung quét mô phỏng">
    <div className="sis-camera-status"><span><Camera aria-hidden="true"/>Camera mô phỏng trong preview</span><div className="sis-scan-count"><strong>{lines.length}</strong><span>mã đã quét</span></div></div>
    <div className="sis-reticle" aria-hidden="true"><ScanLine/><span/></div>
    <div className="sis-camera-bottom"><p>Chưa kết nối camera thật.<br/>Nhập mã bên dưới để kiểm đếm.</p><button type="button" onClick={onCamera} disabled={disabled||busy}><Camera aria-hidden="true"/>Mở camera</button></div>
   </section>
   <form className="sis-manual" noValidate onSubmit={e=>{e.preventDefault();if(!code.trim()||disabled||busy)return;onScan(code);input.current?.focus({preventScroll:true});}}>
    <label htmlFor="sis-code"><Keyboard aria-hidden="true"/>Mã QR / Barcode</label><div className="sis-input-row"><input id="sis-code" ref={input} value={code} onChange={e=>onCode(e.target.value)} placeholder="Ví dụ: NEW-001" autoComplete="off" autoCapitalize="characters" spellCheck={false} enterKeyHint="go" disabled={disabled||busy} aria-invalid={!!error} aria-describedby={feedback?'sis-feedback':undefined}/><button type="submit" disabled={!code.trim()||disabled||busy}>Kiểm tra mã</button></div>
   </form>
   <div className="sis-feedback-slot">{feedback&&<output id="sis-feedback" aria-live={error?'assertive':'polite'} className={error?'sis-feedback is-error':'sis-feedback is-success'}>{error?<AlertCircle aria-hidden="true"/>:<CheckCircle2 aria-hidden="true"/>}<span>{feedback}</span></output>}</div>
  </section>
  <section className="sis-results" aria-labelledby="sis-results-title"><div className="sis-results-title"><h3 id="sis-results-title">Đã quét</h3><span>{lines.length} mã · {total} cái</span></div>
   {!lines.length?<div className="sis-empty"><ScanLine aria-hidden="true"/><div><strong>Chưa có mã nào</strong><p>Mỗi mã hợp lệ chỉ được cộng một lần.</p></div></div>:<ul className="sc-lines sis-list">{lines.map(line=>{const item=items.find(i=>i.code===line.code);return <li key={line.code} className="sis-row" data-scanned-code={line.code}><Package className="sis-item-icon" aria-hidden="true"/><div className="sis-item-text"><strong>{item?.name||line.code}</strong><span>{line.code}{item?.sku&&<> · <small>{item.sku}</small></>}</span></div><span className="sis-qty">{line.qty} cái</span><button type="button" className="sis-remove" aria-label={`Bỏ ${line.code} khỏi danh sách`} disabled={disabled||busy} onClick={()=>onRemove(line.code)}><X aria-hidden="true"/></button></li>;})}</ul>}
  </section>
  {qaExamples}
  <div className="sc-sticky-actions sis-actions"><span className="sis-stock-note">Quét mã chưa làm thay đổi tồn kho.</span><button className="sc-btn sis-review" type="button" onClick={onReview} disabled={!total||disabled||busy} aria-label={`Kiểm tra phiếu • ${total} cái`}><ClipboardCheck aria-hidden="true"/><span>Kiểm tra phiếu</span><span className="sis-review-qty">{total} cái</span><ArrowRight aria-hidden="true"/></button></div>
 </div>;
}
