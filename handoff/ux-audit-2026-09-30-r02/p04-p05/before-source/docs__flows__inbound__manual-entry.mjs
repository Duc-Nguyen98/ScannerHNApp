// Preserve the connected input while counters/list repaint during continuous entry.
// The caller still owns values, validation, navigation and every scan mutation.
export function renderManualEntry(root, html, prefix) {
  const current=root.querySelector(`.${prefix}-app`), form=root.querySelector(`.${prefix}-manual`);
  const template=document.createElement('template');template.innerHTML=html;
  const next=template.content.firstElementChild;
  const nextForm=next.querySelector(`.${prefix}-manual`);
  if(!form || !nextForm || current?.dataset.panel!==next.dataset.panel){root.replaceChildren(template.content);return;}
  const content=form.parentElement,nextContent=nextForm.parentElement;
  for(const child of [...content.children])if(child!==form)child.remove();
  let after=false,anchor=form;
  for(const child of [...nextContent.children]){
    if(child===nextForm){after=true;continue;}
    if(after){anchor.after(child);anchor=child;}else form.before(child);
  }
  current.className=next.className;current.setAttribute('aria-busy',next.getAttribute('aria-busy'));
  for(const part of ['header','footer','live-progress']){
    const prior=current.querySelector(`.${prefix}-${part}`),fresh=next.querySelector(`.${prefix}-${part}`);
    if(prior&&fresh)prior.replaceChildren(...fresh.childNodes);
  }
}

export function revealManualInput(root,prefix,{focus=true}={}){
  const input=root.querySelector(`#${prefix}-code`);if(!input || input.disabled)return;
  if(focus)input.focus({preventScroll:true});
  const area=root.querySelector(`.${prefix}-scroll`),row=input.closest(`.${prefix}-code-row`);if(!area||!row)return;
  const a=area.getBoundingClientRect(),scale=a.height/area.offsetHeight;
  const bottom=Math.min(a.bottom,window.visualViewport?window.visualViewport.offsetTop+window.visualViewport.height:a.bottom);
  const b=row.getBoundingClientRect();if(b.bottom>bottom)area.scrollTop+=(b.bottom-bottom+8)/scale;
  const updated=row.getBoundingClientRect();if(updated.top<a.top)area.scrollTop-=(a.top-updated.top+8)/scale;
}
