import {mountScaledControls} from './scaled-controls.mjs';

// Explicit scope: P01–P11's navigation/search/copy controls. P10 owns its existing
// controller; locked bottom navigation, calendars and later boards are excluded.
const base=[
 '.p03-header button','.p03-close','.p03-actions button',
 '.p04-header button','.p05-header button','.p06-header button','.p07-header button','.p08-header button','.p09-header button','.p11-header button',
 '.p04-search-clear','.p05-clear-code','.p06-search button','.p06-filter','.p06-open-filter','.p06-filter-chips button',
 '.p07-search-row button','.p07-copy','.p07-dialog-back',
 '.p08-search>button','.p08-filter-summary button','.p08-toolbar-actions button','[data-p08="copy"]',
 '.p09-search>button','[data-p09="copy"]','.p11-eye',
 'dialog .app-modal-footer button','dialog footer [data-cancel]','dialog footer [data-apply]','dialog footer [data-reset]',
 'dialog header [data-cancel]','dialog .p09-update-header [data-close]'
];
const homeScope='.hn-screen:not(.p10-screen):not(.p12-screen):not(.p13-screen):not(.p14-screen):not(.p15-screen):not(.p17-screen):not(.p18-screen):not(.p19-screen):not(.p20-screen):not(.p21-screen):not(.p22-screen):not(.p23-screen)';
const selector=[...base.flatMap(s=>[`.screen:not(.p14-auth) ${s}`,`${homeScope} ${s}`]),'.screen:is(.login,.confirmation) button',`${homeScope}.hn-home-active .hn-bell`,`${homeScope}.hn-home-active .hn-avatar`].join(',');
export function mountPriorityTouch({root,getScreen}){
 let current=null,controller=null,frame=0,disposed=false;
 function refresh(){frame=0;if(disposed)return;const next=root.hidden?null:getScreen();if(current!==next){controller?.dispose();current=next;controller=next?mountScaledControls({screen:next,selector,layout:true,isActive:()=>!root.hidden&&current===next&&next.isConnected}):null;}controller?.refresh();}
 function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(refresh);}
 const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});schedule();
 return {dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controller?.dispose();}};
}
