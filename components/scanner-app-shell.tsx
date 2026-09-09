'use client';
import {createContext,useContext,useEffect,useRef,useState,useCallback,type ReactNode} from 'react';
import {AppConfirmDialog} from './scanner-app-overlay';
import './scanner-app-shell.css';
type ConfirmRequest={message:string;resolve:(value:boolean)=>void};
const ShellContext=createContext<{overlayRoot:HTMLElement|null;confirm:(message:string)=>Promise<boolean>}|null>(null);
export function useAppShell(){const value=useContext(ShellContext);if(!value)throw new Error('Scanner overlay requires AppShell');return value;}
export function scrollAppTop(){document.querySelector('.sc-screen-scroll')?.scrollTo({top:0,behavior:'instant'});}
export default function ScannerAppShell({children}:{children:ReactNode}){
 const [overlayRoot,setOverlayRoot]=useState<HTMLDivElement|null>(null),[confirmation,setConfirmation]=useState<ConfirmRequest|null>(null);
 const viewport=useRef<HTMLDivElement>(null),pending=useRef<ConfirmRequest|null>(null);
 const confirm=useCallback((message:string)=>new Promise<boolean>(resolve=>{if(pending.current){resolve(false);return;}const request={message,resolve};pending.current=request;setConfirmation(request);}),[]);
 const finish=(value:boolean)=>{pending.current?.resolve(value);pending.current=null;setConfirmation(null);};
 useEffect(()=>()=>{pending.current?.resolve(false);},[]);
 useEffect(()=>{
  const el=viewport.current;if(!el)return;
  const resize=()=>{const mobile=window.matchMedia('(max-width: 600px)').matches;el.style.setProperty('--sc-runtime-height',mobile?`${window.visualViewport?.height||innerHeight}px`:'');};
  resize();window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);return()=>{window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);};
 },[]);
 return <ShellContext.Provider value={{overlayRoot,confirm}}><div className="sc-app-shell"><div className="sc-device"><div className="sc-app-viewport" ref={viewport}><div className="sc-screen-scroll">{children}</div><div className="sc-app-overlay-root" ref={setOverlayRoot}/>{confirmation&&<AppConfirmDialog open title="Bạn có thay đổi chưa lưu" message={confirmation.message} onConfirm={()=>finish(true)} onClose={()=>finish(false)}/>}</div></div></div></ShellContext.Provider>;
}
