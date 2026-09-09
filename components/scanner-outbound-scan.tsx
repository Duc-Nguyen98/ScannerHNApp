'use client';
import {useRef,type ReactNode} from 'react';
import {Warehouse,Camera,ScanLine,Keyboard,CheckCircle2,AlertCircle,Package,X,ArrowRight,ClipboardCheck} from 'lucide-react';
import type {Item,Line} from '@/lib/scanner-model';
import './scanner-outbound-scan.css';

/** P05 presentation. All code validation/stock/draft operations remain parent callbacks. */
export default function ScannerOutboundScan({name,targetQty,code,lines,items,error,notice,busy,disabled,onCode,onScan,onRemove,onCamera,onReview,qaExamples}:{name:string;targetQty:string;code:string;lines:Line[];items:Item[];error:string;notice:string;busy:boolean;disabled:boolean;onCode:(value:string)=>void;onScan:(value:string)=>void;onRemove:(value:string)=>void;onCamera:()=>void;onReview:()=>void;qaExamples?:ReactNode}){
 const input=useRef<HTMLInputElement>(null);const total=lines.reduce((sum,line)=>sum+line.qty,0);const target=Number(targetQty)||0;const feedback=error||(notice.startsWith('Đã thêm')&&lines.length?`${lines.at(-1)!.code} · ${notice}`:notice);
 return <div className="sos-scan" data-scan-context="OUTBOUND">
  <div className="sos-context"><span><Warehouse aria-hidden="true"/>Kho Hoa Nam</span><span className="sos-context-tag">OUTBOUND</span></div>
  <ol className="sos-progress" aria-label="Tiến trình xuất kho">{['Thông tin','Quét mã','Kiểm tra'].map((label,i)=><li key={label} aria-current={i===1?'step':undefined}><span className="sos-step-number" aria-hidden="true">{i+1}</span>{label}</li>)}</ol>
  <section className="sos-workspace" aria-label="Quét và soạn hàng">
   <div className="sos-document"><span>PHIẾU XUẤT</span><h2>{name}</h2></div>
   <section className="sos-viewfinder" aria-label="Khung quét mô phỏng">
    <div className="sos-camera-status"><span><Camera aria-hidden="true"/>Camera mô phỏng trong preview</span><div className="sos-scan-count"><strong>{total} / {target}</strong><span>Đã soạn / Yêu cầu</span></div></div>
    <progress className="sos-target-progress" value={Math.min(total,target)} max={target} aria-label={`Tiến độ soạn hàng ${total} trên ${target}`} />
    <div className="sos-reticle" aria-hidden="true"><ScanLine/><span/></div>
    <div className="sos-camera-bottom"><p>Chưa kết nối camera thật.<br/>Nhập mã bên dưới để soạn hàng.</p><button type="button" onClick={onCamera} disabled={disabled||busy}><Camera aria-hidden="true"/>Mở camera</button></div>
   </section>
   <form className="sos-manual" noValidate onSubmit={e=>{e.preventDefault();if(!code.trim()||disabled||busy)return;onScan(code);input.current?.focus({preventScroll:true});}}>
    <label htmlFor="sos-code"><Keyboard aria-hidden="true"/>Mã QR / Barcode</label><div className="sos-input-row"><input id="sos-code" ref={input} value={code} onChange={e=>onCode(e.target.value)} placeholder="Ví dụ: MAY-001" autoComplete="off" autoCapitalize="characters" spellCheck={false} enterKeyHint="go" disabled={disabled||busy} aria-invalid={!!error} aria-describedby={feedback?'sos-feedback':undefined}/><button type="submit" disabled={!code.trim()||disabled||busy}>Kiểm tra mã</button></div>
   </form>
   <div className="sos-feedback-slot">{feedback&&<output id="sos-feedback" aria-live={error?'assertive':'polite'} className={error?'sos-feedback is-error':'sos-feedback is-success'}>{error?<AlertCircle aria-hidden="true"/>:<CheckCircle2 aria-hidden="true"/>}<span>{feedback}</span></output>}</div>
  </section>
  <section className="sos-results" aria-labelledby="sos-results-title"><div className="sos-results-title"><h3 id="sos-results-title">Đã quét</h3><span>{lines.length} mã · {total} cái</span></div>
   {!lines.length?<div className="sos-empty"><ScanLine aria-hidden="true"/><div><strong>Chưa có mã nào</strong><p>Mỗi mã hợp lệ chỉ được cộng một lần.</p></div></div>:<ul className="sc-lines sos-list">{lines.map(line=>{const item=items.find(i=>i.code===line.code);return <li key={line.code} className="sos-row" data-scanned-code={line.code}><Package className="sos-item-icon" aria-hidden="true"/><div className="sos-item-text"><strong>{item?.name||line.code}</strong><span>{line.code}{item?.sku&&<> · <small>{item.sku}</small></>}</span></div><span className="sos-qty">{line.qty} cái</span><button type="button" className="sos-remove" aria-label={`Bỏ ${line.code} khỏi danh sách`} disabled={disabled||busy} onClick={()=>onRemove(line.code)}><X aria-hidden="true"/></button></li>;})}</ul>}
  </section>
  {qaExamples}
  <div className="sc-sticky-actions sos-actions"><span className="sos-stock-note">Quét mã chưa làm thay đổi tồn kho.</span><button className="sc-btn sos-review" type="button" onClick={onReview} disabled={!total||total!==target||disabled||busy} aria-label={`Kiểm tra phiếu • ${total} cái`}><ClipboardCheck aria-hidden="true"/><span>Kiểm tra phiếu</span><span className="sos-review-qty">{total} cái</span><ArrowRight aria-hidden="true"/></button></div>
 </div>;
}
