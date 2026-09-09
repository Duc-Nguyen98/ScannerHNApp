'use client';
import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, PauseCircle, ShieldCheck, ArrowRight, LoaderCircle, AlertCircle, Info, UserRound, LockKeyhole, CirclePlay, LogOut, ChevronRight } from 'lucide-react';
import './scanner-entry-ui.css';
import './scanner-entry-reference.css';
import { guardRoute, parseRoute, routeHash, validSession, type ScannerRoute, type ScannerView, type ScannerSession, type ScannerAuthAdapter } from '@/lib/scanner-auth';
import { createPreviewAuth } from '@/lib/scanner-auth-preview';

export function useScannerAccess() {
  const [route,setRoute]=useState<ScannerRoute>({view:'login',id:'',product:''});
  const [session,setSession]=useState<ScannerSession|null>(null);
  const [loaded,setLoaded]=useState(false);
  const [message,setMessage]=useState('');
  const adapter=useRef<ScannerAuthAdapter|null>(null);
  const resume=useRef<ScannerRoute|null>(null);
  const sync=useRef<() => void>(()=>{});
  const trail=useRef<ScannerRoute[]>([]);
  const sessionId=useRef<string|null>(null);
  const leaveGuard=useRef<null|(()=>boolean|Promise<boolean>)>(null);
  const confirming=useRef(false),allowOnce=useRef(false);
  const lastHash=useRef('#login');
  useEffect(()=>{
    try { adapter.current=createPreviewAuth(window.sessionStorage); }
    catch { queueMicrotask(()=>{setMessage('Không thể mở phiên trên thiết bị này. Vui lòng cho phép lưu trữ phiên rồi tải lại.'); setLoaded(true);}); return; }
    const update=()=>{
      const next=adapter.current!.read();
      const requested=parseRoute(window.location.hash);
      if(next && window.location.hash!==lastHash.current && leaveGuard.current && !allowOnce.current){
        const desiredHash=window.location.hash;
        if(confirming.current){window.history.replaceState(null,'',lastHash.current);return;}
        const decision=leaveGuard.current();
        if(decision instanceof Promise){confirming.current=true;window.history.replaceState(null,'',lastHash.current);void decision.then(yes=>{confirming.current=false;if(yes){allowOnce.current=true;window.history.replaceState(null,'',desiredHash);sync.current();}});return;}
        if(!decision){window.history.replaceState(null,'',lastHash.current);return;}
      }
      allowOnce.current=false;
      const guarded=guardRoute(requested,next);
      if (routeHash(guarded)!==window.location.hash) window.history.replaceState(null,'',routeHash(guarded));
      sessionId.current=next?.userId||null;
      lastHash.current=routeHash(guarded);
      setSession(next); setRoute(guarded); setLoaded(true);
    };
    sync.current=update;
    update();
    const check=()=>{
      if (sessionId.current && !adapter.current!.read() && !['login','forgot'].includes(parseRoute(window.location.hash).view)) {
        resume.current=parseRoute(window.location.hash);
        setMessage('Phiên làm việc đã hết hạn. Nội dung đang soạn được giữ trong lần mở này. Đăng nhập lại để tiếp tục; tải lại trang sẽ bỏ bản đang soạn.');
      }
      update();
    };
    window.addEventListener('hashchange',check);
    window.addEventListener('popstate',check);
    window.addEventListener('focus',check);
    const timer=window.setInterval(check,1000);
    return ()=>{clearInterval(timer);window.removeEventListener('hashchange',check);window.removeEventListener('popstate',check);window.removeEventListener('focus',check);};
  },[]);
  const navigate=(view:ScannerView, context:Partial<ScannerRoute>={},replace=false)=>{
    const next=guardRoute({view,id:context.id||'',product:context.product||''},adapter.current?.read()||null);
    if(adapter.current?.read()&&routeHash(next)!==window.location.hash&&leaveGuard.current&&!allowOnce.current){
      if(confirming.current)return false;const decision=leaveGuard.current();
      if(decision instanceof Promise){confirming.current=true;void decision.then(yes=>{confirming.current=false;if(yes){allowOnce.current=true;navigate(view,context,replace);}});return false;}
      if(!decision)return false;
    }
    allowOnce.current=false;
    lastHash.current=routeHash(next);
    if(!replace) trail.current.push(parseRoute(window.location.hash));
    window.history[replace?'replaceState':'pushState'](null,'',routeHash(next));
    sync.current();
    return true;
  };
  return {route,session,loaded,message, navigate,
    setLeaveGuard(fn:null|(()=>boolean|Promise<boolean>)) {leaveGuard.current=fn;},
    actor:()=>adapter.current?.read()||null,
    changePreviewRole(role:string) {adapter.current?.changePreviewRole(role);sync.current();},
    back() { const dest=trail.current.at(-1); if(navigate(dest?.view||'home',dest||{},true))trail.current.pop(); },
    allowed:loaded && validSession(session) && session.shiftStarted && !['login','forgot','shift'].includes(route.view),
    check:()=>validSession(adapter.current?.read()||null) && !!adapter.current?.read()?.shiftStarted,
    async login(id:string,password:string,scenario:string,role:string) {
      if (!adapter.current) throw new Error('Chưa thể khởi tạo phiên trên thiết bị này.');
      await adapter.current.login(id,password,scenario,role); navigate('shift',{},true);
    },
    startShift() {
      adapter.current!.startShift();
      const dest=resume.current; resume.current=null; setMessage('');
      navigate(dest?.view||'home',dest||{},true);
    },
    logout(message='Bạn đã đăng xuất an toàn.') {adapter.current?.logout();resume.current=null;trail.current=[];setMessage(message);navigate('login',{},true);},
    expire() {adapter.current?.logout();resume.current=route;setMessage('Phiên làm việc đã hết hạn. Nội dung đang soạn được giữ trong lần mở này. Đăng nhập lại để tiếp tục; tải lại trang sẽ bỏ bản đang soạn.');navigate('login',{},true);},
  };
}

export function ScannerAuthScreen({access,role,warehouse,warehouseLoaded=true,warehouseError=''}:{
  access:ReturnType<typeof useScannerAccess>;role:string;warehouse:'active'|'paused';warehouseLoaded?:boolean;warehouseError?:string;
}) {
  const [identifier,setIdentifier]=useState('');
  const [password,setPassword]=useState('');
  const [visible,setVisible]=useState(false);
  const [errors,setErrors]=useState({identifier:'',password:''});
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [scenario,setScenario]=useState('normal');
  const [qa,setQa]=useState(false);
  const lock=useRef(false);
  const idRef=useRef<HTMLInputElement>(null);
  const passRef=useRef<HTMLInputElement>(null);
  const view=access.route.view;
  useEffect(()=>{queueMicrotask(()=>setQa(new URLSearchParams(window.location.search).get('qa')==='1'));},[]);
  const start=async()=>{
    if(lock.current)return;
    lock.current=true;setBusy(true);setError('');
    // Only a brief presentation state; the existing synchronous shift service is unchanged.
    await new Promise(resolve=>setTimeout(resolve,180));
    try{access.startShift();}catch{access.expire();}finally{lock.current=false;setBusy(false);}
  };
  const brand=<div className="sc-auth-brand"><span className="vl-brand-icon" aria-hidden="true"/><strong>HOA NAM SCANNER<small>WMS - Vận hành chuyên nghiệp</small></strong></div>;
  if(view==='forgot')return <div className="sc-auth-wrap"><main className="sc-auth sc-entry sc-entry-op"><header className="sc-entry-heading">{brand}<span className="sc-op-eyebrow">TRUY CẬP HỆ THỐNG</span><h1>Quên mật khẩu</h1><p>Khôi phục quyền truy cập tài khoản.</p></header><section className="sc-entry-card sc-op-recovery" aria-labelledby="sc-recovery-title"><h2 id="sc-recovery-title">Hỗ trợ tài khoản</h2><p>Vui lòng liên hệ quản trị viên đã cấp tài khoản để được hỗ trợ khôi phục quyền truy cập.</p><div className="sc-op-security"><ShieldCheck aria-hidden="true"/><p>Không chia sẻ mật khẩu hoặc mã xác thực với người khác.</p></div><button className="sc-btn sc-entry-primary" onClick={()=>access.navigate('login',{},true)}>Quay lại đăng nhập<ArrowRight aria-hidden="true"/></button></section><footer className="sc-entry-footer"><strong>HOA NAM SCANNER</strong><span>AN TOÀN · CHÍNH XÁC · HIỆU QUẢ</span></footer></main></div>;
  const footer=<footer className="sc-entry-footer"><strong>HOA NAM SCANNER</strong><div className="entry-slogan"><span className="entry-slogan-text">KẾT NỐI CON NGƯỜI - VẬN HÀNH HIỆU QUẢ</span></div></footer>;
  const paused=warehouse==='paused';
  const name=access.session?.name||'';
  return <div className="sc-auth-wrap">
    <main className={`sc-auth sc-entry sc-entry-op vl-entry ${view==='shift'?'vl-shift':'vl-login'}`} aria-busy={busy}>
      <header className="sc-entry-heading">
        {brand}
        {view==='shift'&&<div className="entry-staff" aria-hidden="true"/>}
        {view==='shift'&&<span className="vl-greeting">Chào bạn,</span>}
        <h1>{view==='shift'?name:<>Quản lý kho<br/>Hoa Nam</>}</h1>
        <p>{view==='shift'?<>Sẵn sàng bắt đầu<br/>ca làm việc?</>:'Đăng nhập để bắt đầu phiên làm việc'}</p>
        <span className="vl-hero-motto">{view==='shift'?<>MỖI<br/>THAO TÁC<br/>TẠO NÊN<br/>GIÁ TRỊ</>:<>CHÍNH XÁC<br/>HIỆU QUẢ<br/>VẬN HÀNH<br/>BỀN VỮNG</>}</span>
      </header>
      {!access.loaded?<section className="sc-entry-card"><output className="sc-entry-check"><LoaderCircle aria-hidden="true" className="sc-entry-spinner"/>Đang kiểm tra phiên làm việc…</output></section>:view==='shift'?<>
        <section className="sc-entry-card sc-entry-shift" aria-label="Thông tin ca làm việc">
          <div className="sc-entry-user"><span className="sc-entry-avatar" aria-hidden="true">{name.split(' ').filter(Boolean).slice(-2).map(word=>word[0]).join('')}</span><div><h2>{name}</h2><p>{access.session?.role}</p></div><ChevronRight className="entry-user-chevron" aria-hidden="true"/></div>
          <dl className="sc-entry-details">
            <div className="entry-warehouse-main"><dt className="vl-sr-only">Kho làm việc</dt><dd><span className="entry-warehouse-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path fill="currentColor" d="m16 3 12 7v18H4V10z"/><path d="M10 26V14h12v12M9 14l7-4 7 4M14 25v-5h4v5" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/></svg></span><span><strong>Kho Hoa Nam</strong><small>WMS - Vận hành chuyên nghiệp</small></span></dd></div>
            <div className="entry-warehouse-state"><dt className="vl-sr-only">Trạng thái kho</dt><dd><span className={paused?'sc-entry-status paused':'sc-entry-status'}>{!warehouseLoaded?'Đang kiểm tra…':warehouseError?'Chưa xác định':paused?<><PauseCircle aria-hidden="true"/>Tạm dừng</>:<><i aria-hidden="true"/>Đang hoạt động</>}</span></dd></div>
          </dl>
          {warehouseError?<p className="sc-entry-alert" role="alert">{warehouseError}</p>:paused?<div className="sc-entry-alert"><PauseCircle aria-hidden="true"/><p><strong>Kho đang tạm dừng hoạt động</strong>Vào ca chỉ để xem và tra cứu. Các thao tác nhập, xuất và cập nhật kho đang bị khóa.</p></div>:<p className="sc-entry-shift-note"><Info aria-hidden="true"/>Thao tác theo quyền được cấp cho tài khoản của bạn.</p>}
          <button className="sc-btn sc-entry-primary" disabled={busy||!warehouseLoaded||!!warehouseError} onClick={()=>void start()}>{busy?<><LoaderCircle className="sc-entry-spinner" aria-hidden="true"/><span>Đang bắt đầu ca…</span></>:<><span className="entry-cta-leading"><CirclePlay aria-hidden="true"/></span><span>Bắt đầu ca làm việc</span><ChevronRight className="entry-cta-trailing" aria-hidden="true"/></>}</button>
          <div className="vl-or">hoặc</div><button className="sc-entry-signout" disabled={busy} onClick={()=>access.logout()}><LogOut aria-hidden="true"/>Đăng xuất</button>
        </section>
      </>:<>
        <section className="sc-entry-card" aria-labelledby="sc-entry-login-title">
          <h2 id="sc-entry-login-title" className="vl-sr-only">Đăng nhập</h2>
          {access.message&&<output className="sc-entry-session"><Info aria-hidden="true"/><span>{access.message}</span></output>}
          <form noValidate onSubmit={async e=>{
            e.preventDefault();if(lock.current)return;
            const next={identifier:identifier.trim()?'':'Vui lòng nhập tên đăng nhập, email hoặc số điện thoại.',password:password?'':'Vui lòng nhập mật khẩu.'};setErrors(next);setError('');
            if(next.identifier||next.password){(next.identifier?idRef:passRef).current?.focus();return;}
            lock.current=true;setBusy(true);
            try{await access.login(identifier,password,navigator.onLine?scenario:'offline',role);}
            catch(err){setError(err instanceof Error?err.message:'Không thể đăng nhập. Vui lòng thử lại.');requestAnimationFrame(()=>passRef.current?.focus());}
            finally{setPassword('');setVisible(false);setBusy(false);lock.current=false;}
          }}>
            <label htmlFor="sc-auth-id">Tên đăng nhập</label>
            <div className="vl-input"><UserRound aria-hidden="true"/><input id="sc-auth-id" ref={idRef} autoComplete="username" autoCapitalize="none" spellCheck={false} enterKeyHint="next" placeholder="Nhập tên đăng nhập" value={identifier} disabled={busy} onChange={e=>{setIdentifier(e.target.value);setErrors(old=>({...old,identifier:''}));}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();passRef.current?.focus();}}} aria-invalid={!!errors.identifier} aria-describedby="sc-entry-id-help sc-auth-id-error"/></div>
            <small id="sc-entry-id-help" className="vl-sr-only">Có thể dùng email hoặc số điện thoại đăng ký.</small>
            <p className="sc-entry-field-error" id="sc-auth-id-error" aria-live="polite">{errors.identifier&&<><AlertCircle aria-hidden="true"/>{errors.identifier}</>}</p>
            <label htmlFor="sc-auth-password">Mật khẩu</label>
            <div className="sc-auth-password vl-input"><LockKeyhole aria-hidden="true"/><input id="sc-auth-password" ref={passRef} type={visible?'text':'password'} autoComplete="current-password" enterKeyHint="go" placeholder="Nhập mật khẩu" value={password} disabled={busy} onChange={e=>{setPassword(e.target.value);setErrors(old=>({...old,password:''}));}} aria-invalid={!!errors.password} aria-describedby="sc-auth-password-error"/><button type="button" disabled={busy} aria-label={visible?'Ẩn mật khẩu':'Hiện mật khẩu'} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff aria-hidden="true"/>:<Eye aria-hidden="true"/>}</button></div>
            <p className="sc-entry-field-error" id="sc-auth-password-error" aria-live="polite">{errors.password&&<><AlertCircle aria-hidden="true"/>{errors.password}</>}</p>
            <button type="button" className="sc-auth-forgot" disabled={busy} onClick={()=>access.navigate('forgot')}>Quên mật khẩu?</button>
            <button className="sc-btn sc-entry-primary" type="submit" disabled={busy}>{busy?<><LoaderCircle className="sc-entry-spinner" aria-hidden="true"/>Đang đăng nhập…</>:<>Đăng nhập<ArrowRight aria-hidden="true"/></>}</button>
            <div className="sc-entry-feedback">{error?<p role="alert" className="sc-entry-alert"><AlertCircle aria-hidden="true"/><span>{error}</span></p>:<p className="sc-entry-reassurance"><ShieldCheck aria-hidden="true"/><span><strong>Quyền truy cập theo tài khoản được cấp.</strong><small>Chỉ dành cho nhân viên được ủy quyền.</small></span></p>}</div>
          </form>
        </section>
      </>}
      {footer}
    </main>
    {qa&&view==='login'&&<details className="sc-auth-harness"><summary>Thiết lập kiểm thử xác thực</summary><p>Chỉ dùng tài khoản giả: minhanh / Scanner@2026. Không nhập tài khoản thật. Đây không phải xác thực máy chủ.</p><label>Kịch bản đăng nhập<select value={scenario} onChange={e=>setScenario(e.target.value)} disabled={busy}>{[['normal','Bình thường'],['invalid','Sai thông tin'],['locked','Tài khoản bị khóa'],['disabled','Tài khoản vô hiệu hóa'],['offline','Mất mạng'],['server','Lỗi máy chủ']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></details>}
  </div>;
}
