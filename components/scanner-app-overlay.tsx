'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-element-interactions -- P00 forbids native dialog top-layer; scoped ARIA dialog implements keyboard containment. */
import {forwardRef,useCallback,useEffect,useImperativeHandle,useRef,useState,useId,type HTMLAttributes,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {useAppShell} from './scanner-app-shell';
export type AppDialogHandle={readonly open:boolean;showModal:()=>void;close:()=>void};
type Props=Omit<HTMLAttributes<HTMLDivElement>,'onCancel'> & {onCancel?:(event:Event)=>void;variant?:'dialog'|'sheet';backdropClose?:boolean;};
const focusable='button:not(:disabled),[href],input:not(:disabled):not([type=hidden]),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';
/** App-local modal only: never HTMLDialogElement/top-layer or document.body portal. */
export const AppDialog=forwardRef<AppDialogHandle,Props>(function AppDialog({onCancel,children,className='',variant='dialog',backdropClose=true,onKeyDown,...props},ref){
 const {overlayRoot}=useAppShell();const [open,setOpen]=useState(false);const panel=useRef<HTMLDivElement>(null),origin=useRef<HTMLElement|null>(null),layer=useRef<HTMLDivElement>(null);
 const callback=useRef(onCancel);useEffect(()=>{callback.current=onCancel;},[onCancel]);
 const marker=useId();const openRef=useRef(false);
 const close=useCallback(()=>{openRef.current=false;setOpen(false);},[]);
 const requestClose=useCallback(()=>{const event=new Event('cancel',{cancelable:true});callback.current?.(event);if(!event.defaultPrevented)close();},[close]);
 useImperativeHandle(ref,()=>({get open(){return openRef.current;},showModal(){if(openRef.current)return;origin.current=document.activeElement as HTMLElement;openRef.current=true;setOpen(true);},close}),[close]);
 useEffect(()=>{
  if(!open||!overlayRoot)return;
  const prevState=window.history.state;const entry={...prevState,scAppOverlay:marker};window.history.pushState(entry,'',window.location.href);
  const scroll=overlayRoot.parentElement?.querySelector<HTMLElement>('.sc-screen-scroll');const oldInert=scroll?.inert||false;if(scroll)scroll.inert=true;
  const previousLayers=[...overlayRoot.querySelectorAll<HTMLElement>('.sc-overlay-layer')].filter(e=>e!==layer.current);const previousInert=previousLayers.map(e=>e.inert);previousLayers.forEach(e=>{e.inert=true;});
  const targets=()=>[...(panel.current?.querySelectorAll<HTMLElement>(focusable)||[])].filter(e=>e.getClientRects().length>0);
  const frame=requestAnimationFrame(()=>{const autofocus=panel.current?.querySelector<HTMLElement>('[data-app-autofocus]');(autofocus||targets()[0]||panel.current)?.focus({preventScroll:true});});
  const top=()=>overlayRoot.lastElementChild===layer.current;
  const back=()=>{if(top()&&window.history.state?.scAppOverlay!==marker){const e=new Event('cancel',{cancelable:true});callback.current?.(e);if(e.defaultPrevented&&openRef.current){window.history.pushState({...window.history.state,scAppOverlay:marker},'',window.location.href);}else close();}};
  window.addEventListener('popstate',back);const timer=window.setInterval(back,100);
  return()=>{cancelAnimationFrame(frame);clearInterval(timer);window.removeEventListener('popstate',back);if(window.history.state?.scAppOverlay===marker)window.history.replaceState(prevState,'',window.location.href);if(scroll)scroll.inert=oldInert;previousLayers.forEach((e,i)=>{e.inert=previousInert[i];});const target=origin.current;if(target?.isConnected&&!target.closest('[inert]'))target.focus({preventScroll:true});};
 },[open,overlayRoot,marker,close]);
 useEffect(()=>{if(!open||!panel.current)return;const element=panel.current;const observer=new MutationObserver(()=>{if(!element.contains(document.activeElement)){const target=element.querySelector<HTMLElement>('[data-app-autofocus]')||element.querySelector<HTMLElement>(focusable)||element;target.focus({preventScroll:true});}});observer.observe(element,{childList:true,subtree:true});return()=>observer.disconnect();},[open]);
 if(!open||!overlayRoot)return null;
 return createPortal(<div ref={layer} className={`sc-overlay-layer ${variant==='sheet'?'is-sheet':''}`}><button type="button" className="sc-app-backdrop" tabIndex={-1} aria-hidden="true" onClick={()=>{if(backdropClose)requestClose();}}/><div {...props} ref={panel} role="dialog" aria-modal="true" tabIndex={-1} data-app-dialog className={`sc-app-dialog ${className}`} onKeyDown={e=>{onKeyDown?.(e);if(e.defaultPrevented)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();requestClose();}else if(e.key==='Tab'){const items=[...(panel.current?.querySelectorAll<HTMLElement>(focusable)||[])].filter(n=>n.getClientRects().length>0);const first=items[0],last=items.at(-1);if(!first){e.preventDefault();panel.current?.focus();}else if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}>{children}</div></div>,overlayRoot);
});
export function AppModal({open,onClose,title,description,children,variant='dialog',className='',closeLabel='Đóng hộp thoại'}:{open:boolean;onClose:()=>void;title:string;description?:string;children:ReactNode;variant?:'dialog'|'sheet';className?:string;closeLabel?:string}){const ref=useRef<AppDialogHandle>(null),id=useId(),swipe=useRef<number|null>(null);useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close();},[open]);return <AppDialog ref={ref} variant={variant} className={className} aria-labelledby={id} aria-describedby={description?id+'-description':undefined} onCancel={onClose}>{variant==='sheet'&&<div className="sc-bottomsheet-handle" aria-hidden="true" onPointerDown={e=>{swipe.current=e.clientY;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={e=>{if(swipe.current!==null&&e.clientY-swipe.current>60)onClose();swipe.current=null;}}><span/></div>}<div className="sc-modal-heading"><h2 id={id}>{title}</h2><button type="button" aria-label={closeLabel} onClick={onClose}>×</button></div>{description&&<p id={id+'-description'}>{description}</p>}{children}</AppDialog>;}
export function AppBottomSheet(props:Omit<Parameters<typeof AppModal>[0],'variant'>){return <AppModal {...props} variant="sheet"/>;}
export const AppActionSheet=AppBottomSheet;
export function AppConfirmDialog({open,title,message,onConfirm,onClose}:{open:boolean;title:string;message:string;onConfirm:()=>void;onClose:()=>void}){return <AppModal open={open} onClose={onClose} title={title} description={message}><div className="sc-modal-actions"><button type="button" className="sc-btn" onClick={onConfirm}>Bỏ thay đổi và tiếp tục</button><button type="button" className="sc-btn secondary" onClick={onClose}>Tiếp tục chỉnh sửa</button></div></AppModal>;}
export function AppToast({children}:{children:ReactNode}){const {overlayRoot}=useAppShell();return overlayRoot?createPortal(<output className="sc-app-toast">{children}</output>,overlayRoot):null;}
