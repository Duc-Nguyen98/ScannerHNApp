'use client';
import {useRef,useState} from 'react';
import {Warehouse,Info,ScanLine,ArrowRight,AlertCircle,FilePenLine,PauseCircle} from 'lucide-react';
import './scanner-inbound-create.css';

/** P04 presentation only. The parent retains draft, routing, permissions and posting rules. */
export default function ScannerInboundCreate({name,note,scannedCount,disabled,paused,onName,onNote,onContinue}:{name:string;note:string;scannedCount:number;disabled:boolean;paused:boolean;onName:(value:string)=>void;onNote:(value:string)=>void;onContinue:()=>void}){
 const [nameError,setNameError]=useState('');const nameRef=useRef<HTMLInputElement>(null);
 const editing=!!(name.trim()||note.trim()||scannedCount);
 return <div className="si-create">
  <div className="si-warehouse" aria-label="Kho thực hiện"><span><Warehouse aria-hidden="true"/>Kho Hoa Nam</span><span className={paused?'si-status paused':'si-status'}>{paused?<><PauseCircle aria-hidden="true"/>Tạm dừng</>:<><i aria-hidden="true"/>Đang hoạt động</>}</span></div>
  <ol className="si-progress" aria-label="Tiến trình nhập kho">{['Thông tin','Quét mã','Kiểm tra'].map((label,i)=><li key={label} aria-current={i===0?'step':undefined}><span className="si-step-number" aria-hidden="true">{i+1}</span><span>{label}</span></li>)}</ol>
  <form className="si-form" noValidate onSubmit={e=>{e.preventDefault();if(disabled)return;if(!name.trim()){setNameError('Nhập tên phiếu.');nameRef.current?.focus();return;}setNameError('');onContinue();}}>
   <section className="si-form-surface" aria-labelledby="si-title">
    <div className="si-section-heading"><div><h2 id="si-title">Thông tin phiếu</h2><p>Nhận hàng và kiểm đếm vào kho</p></div><span className="si-draft-state"><FilePenLine aria-hidden="true"/>{editing?'Đang soạn':'Phiếu mới'}</span></div>
    <div className="si-field"><label htmlFor="si-name">Tên phiếu <span aria-hidden="true">*</span></label><input id="si-name" aria-label="Tên phiếu *" ref={nameRef} value={name} required autoComplete="off" enterKeyHint="go" placeholder="Nhập lô hàng đầu ca" disabled={disabled} onChange={e=>{onName(e.target.value);if(nameError)setNameError('');}} aria-invalid={!!nameError} aria-describedby={nameError?'si-name-error':undefined}/><div id="si-name-error" className="si-field-error" aria-live="polite">{nameError&&<><AlertCircle aria-hidden="true"/>{nameError}</>}</div></div>
    <div className="si-field si-note"><label htmlFor="si-note">Ghi chú <span className="si-optional">Không bắt buộc</span></label><textarea id="si-note" aria-label="Ghi chú" value={note} rows={4} disabled={disabled} onChange={e=>onNote(e.target.value)} placeholder="Thông tin cần lưu ý khi kiểm đếm"/></div>
    {scannedCount>0&&<output className="si-retained">{scannedCount} mã đã có trong phiếu. Tiếp tục quét để kiểm đếm thêm.</output>}
   </section>
   <div className="si-post-note"><Info aria-hidden="true"/><p>Chỉ giữ danh sách mã khi quét. Tồn kho thay đổi sau khi phiếu được ghi sổ.</p></div>
   <div className="sc-sticky-actions sc-inbound-actions"><button className="sc-btn si-continue" type="submit" disabled={disabled}><span className="si-cta-icon"><ScanLine aria-hidden="true"/></span><span>Tiếp tục quét mã</span><ArrowRight aria-hidden="true"/></button></div>
  </form>
 </div>;
}
