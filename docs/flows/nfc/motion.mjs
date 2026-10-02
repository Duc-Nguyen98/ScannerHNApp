import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// P07 presentation only. The flow/adapter own listening and link commands.
export function mountNfcMotion({root,isActive,requested='auto'}){
 let controller=null,disposed=false,state=null;
 const verified=new Set(),confirmed=new Set(),doc=root.ownerDocument;
 const live=()=>!disposed&&isActive()&&!doc.hidden&&!root.hidden&&!root.closest('[inert]')&&!root.closest('.hn-screen')?.querySelector('.app-modal-host,.p03-host:not([hidden])');
 const verificationKey=s=>s?.read?`${s.itemId}/${s.read.uid}/${s.read.readAt}`:null;
 const label=(node,name)=>{if(node)node.dataset.hnMotionConsumer=name;return node;};
 function listening(){const dot=root.querySelector('.p07-read-state i');if(dot)dot.dataset.nfcListening=String(live()&&state?.panel===2&&state?.listening===true);}
 function onNfcVisibility(){listening();}
 function press(e){if(e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;
  const b=e.target.closest?.('.p07-tag,.p07-entry');if(live()&&b&&!b.disabled)controller?.pressFeedback(label(b,'ListViewport'));
 }
 root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);
 return {
  activate(snapshot){state=snapshot;if(snapshot?.panel===3&&snapshot.read)verified.add(verificationKey(snapshot));if(snapshot?.receipt)confirmed.add(snapshot.receipt.requestId);
   if(!disposed&&!controller){controller=createMotionController({element:root,requested});doc.addEventListener('visibilitychange',onNfcVisibility);}
  },
  beforeRender(){controller?.cancel();},
  commit(s){state=s;listening();const key=verificationKey(s);
   if(s.panel===3&&key&&!verified.has(key)){verified.add(key);if(live())controller?.noticeFeedback(label(root.querySelector('.p07-section'),'NfcVerified'));}
   const id=s.receipt?.requestId;
   if(s.panel===4&&id&&!s.busy&&!s.unknown&&!confirmed.has(id)){confirmed.add(id);if(live())controller?.rowFeedback(label(root.querySelector('.p07-success-symbol'),'NfcConfirmed'));}
  },
  selected(node){if(live())controller?.noticeFeedback(label(node,'ListViewport'));},
  setMode(value){requested=value;controller?.setMode(value);listening();},
  cancel(){controller?.cancel();const dot=root.querySelector('[data-nfc-listening]');if(dot)dot.dataset.nfcListening='false';},
  hide(){if(controller){controller.dispose();controller=null;doc.removeEventListener('visibilitychange',onNfcVisibility);}const dot=root.querySelector('[data-nfc-listening]');if(dot)dot.dataset.nfcListening='false';},
  dispose(){disposed=true;this.hide();verified.clear();confirmed.clear();root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);},
 };
}
