'use client';
import {useEffect,useRef} from 'react';
/** One measured layout contract shared by every Scanner screen. */
export function useScannerMobileLayout(screen:string){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=root.current;if(!el)return;
  const nav=el.querySelector<HTMLElement>('.sc-nav'),cta=el.querySelector<HTMLElement>('.sc-sticky-actions'),orb=el.querySelector<HTMLElement>('.sc-nav-orb');
  const measure=()=>{
   const viewport=el.closest<HTMLElement>('.sc-app-viewport');
   const bounds=(viewport||el).getBoundingClientRect(),vv=window.visualViewport;
   viewport?.style.setProperty('--sc-viewport-height',`${bounds.height}px`);
   const editing=document.activeElement?.matches('input,textarea,select')||false;
   const keyboard=editing&&!!vv&&window.innerHeight-vv.height>100;
   el.dataset.keyboard=keyboard?'open':'closed';
   el.style.setProperty('--sc-phone-width',`${bounds.width}px`);el.style.setProperty('--sc-phone-left',`${bounds.left}px`);
   el.style.setProperty('--sc-keyboard-offset',keyboard&&vv?`${Math.max(0,innerHeight-vv.height-vv.offsetTop)}px`:'0px');
   const navBounds=nav?.getBoundingClientRect(),orbBounds=orb?.getBoundingClientRect();
   // Reserve the visible envelope, including a raised orb (also after font/safe-area changes).
   const visibleNavHeight=navBounds?navBounds.bottom-Math.min(navBounds.top,orbBounds?.top??navBounds.top):0;
   el.style.setProperty('--sc-nav-height',`${keyboard?0:visibleNavHeight}px`);
   el.style.setProperty('--sc-action-height',`${cta?.getBoundingClientRect().height||0}px`);
   viewport?.style.setProperty('--sc-nav-height',`${keyboard?0:visibleNavHeight}px`);
   viewport?.style.setProperty('--sc-action-height',`${cta?.getBoundingClientRect().height||0}px`);
   viewport?.style.setProperty('--mobile-bottom-reserved-space',`${(keyboard?0:visibleNavHeight)+(cta?.getBoundingClientRect().height||0)+20}px`);
  };
  let frame=0;const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const observer=new ResizeObserver(schedule);observer.observe(el);if(nav)observer.observe(nav);if(cta)observer.observe(cta);if(orb)observer.observe(orb);
  measure();window.addEventListener('resize',measure);window.visualViewport?.addEventListener('resize',measure);document.addEventListener('focusin',measure);document.addEventListener('focusout',measure);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',measure);window.visualViewport?.removeEventListener('resize',measure);document.removeEventListener('focusin',measure);document.removeEventListener('focusout',measure);};
 },[screen]);return root;
}
