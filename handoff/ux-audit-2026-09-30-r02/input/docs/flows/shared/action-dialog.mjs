import {openAppModal} from './app-modal.mjs';
// Shared action feedback. Caller owns navigation/async state with createDialogRoute.
// symbol is trusted SVG markup from existing repo icons, never server/user content.
export function openActionDialog({screen,tools,title,message,confirmLabel='Đã hiểu',cancelLabel=null,tone='neutral',symbol='',className='',actionAttribute='data-action-dialog',confirmAction='confirm',cancelAction='cancel',attributes={},onConfirm=()=>{},onClose=()=>{}}){
  const dialog=document.createElement('dialog');dialog.className=`p07-dialog hn-action-dialog ${className}`;dialog.dataset.tone=tone;
  for(const [name,value]of Object.entries(attributes))dialog.setAttribute(name,String(value));
  const heading=document.createElement('h2');heading.className='app-modal-heading';heading.id=`hn-action-${crypto.randomUUID()}`;heading.textContent=title;dialog.setAttribute('aria-labelledby',heading.id);
  const body=document.createElement('div');body.className='app-modal-body';
  if(symbol){const status=document.createElement('span');status.className='hn-action-status';status.setAttribute('aria-hidden','true');status.innerHTML=symbol;body.append(status);}
  const text=document.createElement('p');text.textContent=message;text.id=`${heading.id}-message`;body.append(text);dialog.setAttribute('aria-describedby',text.id);
  const footer=document.createElement('footer');footer.className='app-modal-footer';
  const button=(action,label)=>{const b=document.createElement('button');b.type='button';b.dataset.actionDialog=action;b.setAttribute(actionAttribute,action==='cancel'?cancelAction:confirmAction);b.textContent=label;b.className=action==='cancel'?'hn-action-secondary':'hn-action-primary';footer.append(b);return b;};
  const cancel=cancelLabel?button('cancel',cancelLabel):null;
  const confirm=button('confirm',confirmLabel);dialog.append(heading,body,footer);
  const modal=openAppModal({screen,tools,dialog,dismissOnBackdrop:false,initialFocus:`[data-action-dialog="${cancel?'cancel':'confirm'}"]`,onClose});
  cancel?.addEventListener('click',()=>modal.close());
  confirm.addEventListener('click',()=>{confirm.disabled=true;if(cancel)cancel.disabled=true;onConfirm();modal.close();});
  return modal;
}
