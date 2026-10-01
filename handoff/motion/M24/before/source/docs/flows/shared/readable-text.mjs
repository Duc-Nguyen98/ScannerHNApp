import {createActionFeedback} from './action-feedback.mjs';

// Read-only presentation. Never reads input values, alters a source record,
// persists text, or shortens confirmation/warning content inside an overlay.
export const isTextTruncated = node => !!node && (node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1);

export function mountReadableText({root,getScreen,getTools=()=>null,isActive=()=>!root.hidden,key='hnReadableText'}) {
  let disposed=false,frame=0,origin=null;
  const nodes=new Map(),triggers=new WeakMap();
  const resize=new ResizeObserver(()=>schedule());
  const active=()=>!disposed&&isActive();
  // Register navigation before module routers; lazy listeners can let a Back
  // repaint the caller before the temporary reader history entry is consumed.
  const feedback=createActionFeedback({getScreen,tools:getTools,isActive:()=>active()&&!!origin?.isConnected,key});
  function release(node,entry){resize.unobserve(node);entry.button.remove();node.classList.remove('hn-readable-excerpt');node.removeAttribute('data-hn-truncated');for(const key of ['--hn-readable-lines','--hn-readable-leading','--hn-readable-value-leading'])node.style.removeProperty(key);nodes.delete(node);}
  function eligible(node){return !node.matches('input,textarea,select,option,button,a') && !node.closest('dialog,.app-modal-host,.p03-dialog,[role=alert],[role=status],[role=alertdialog],[role=dialog],[data-hn-critical]') && (!node.closest('button,a') || node.dataset.hnReadOutside==='true'&&!!node.closest('[data-hn-readable-group]')) && !node.querySelector('input,textarea,select,button,a,img,svg');}
  function sync(){
    frame=0;if(disposed)return;
    if(origin&&(!origin.isConnected||!root.contains(origin)||!origin.hasAttribute('data-hn-readable')||!active())){feedback?.clear();origin=null;}
    for(const [node,entry] of nodes)if(!node.isConnected||!root.contains(node)||!node.hasAttribute('data-hn-readable')||!eligible(node))release(node,entry);
    if(!active())return;
    for(const node of root.querySelectorAll('[data-hn-readable]')){
      if(!eligible(node))continue;
      let entry=nodes.get(node);
      if(!entry){
        if(node.dataset.hnReadableKind==='value'){const original=getComputedStyle(node);node.style.setProperty('--hn-readable-value-leading',original.lineHeight==='normal'?'normal':String(parseFloat(original.lineHeight)/parseFloat(original.fontSize)));}
        const button=document.createElement('button');button.type='button';button.className='hn-read-more';button.dataset.hnReadTrigger='';button.hidden=true;button.textContent='Xem đầy đủ';button.setAttribute('aria-haspopup','dialog');
        if(node.closest('button,a'))node.closest('[data-hn-readable-group]').append(button);else node.after(button);node.classList.add('hn-readable-excerpt');
        entry={button};nodes.set(node,entry);triggers.set(button,node);resize.observe(node);
      }
      const lines=node.dataset.hnLines==='3'?3:2;
      node.style.setProperty('--hn-readable-lines',String(lines));
      const style=getComputedStyle(node),leading=parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.5;
      const height=`${leading}px`;if(node.style.getPropertyValue('--hn-readable-leading')!==height)node.style.setProperty('--hn-readable-leading',height);
      const clipped=isTextTruncated(node);if(entry.button.hidden===clipped)entry.button.hidden=!clipped;
      entry.button.setAttribute('aria-label','Xem đầy đủ '+(node.dataset.hnReadable||'nội dung').toLocaleLowerCase('vi'));
      node.dataset.hnTruncated=String(clipped);
    }
  }
  function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(sync);}
  const mutation=new MutationObserver(schedule);
  mutation.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','data-hn-readable','data-hn-lines']});
  function onClick(event){
    const button=event.target.closest('[data-hn-read-trigger]');if(!button||!root.contains(button)||button.hidden||!active())return;
    const node=triggers.get(button);if(!node?.isConnected||!eligible(node))return;
    const screen=getScreen();if(!screen||screen.querySelector('.app-modal-host,dialog[open],.p03-host:not([hidden])'))return;
    event.preventDefault();event.stopImmediatePropagation();origin=node;
    feedback.show({title:node.dataset.hnReadable||'Nội dung đầy đủ',message:node.textContent,confirmLabel:'Đóng',className:'hn-readable-dialog'});
  }
  root.addEventListener('click',onClick,true);window.addEventListener('resize',schedule);schedule();
  return {refresh:schedule,dispose(){disposed=true;cancelAnimationFrame(frame);mutation.disconnect();resize.disconnect();feedback?.dispose();for(const [node,entry]of nodes){entry.button.remove();node.classList.remove('hn-readable-excerpt');node.removeAttribute('data-hn-truncated');node.style.removeProperty('--hn-readable-lines');node.style.removeProperty('--hn-readable-leading');node.style.removeProperty('--hn-readable-value-leading');}nodes.clear();root.removeEventListener('click',onClick,true);window.removeEventListener('resize',schedule);}};
}
