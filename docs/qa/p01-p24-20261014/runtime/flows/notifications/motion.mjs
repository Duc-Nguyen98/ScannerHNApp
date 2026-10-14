import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// NotificationFeedback consumes M00; M02 owns route opacity and native scroll stays put.
export function mountNotificationMotion({root,requested='auto',active=()=>true,media}){
 let controller=null,disposed=false;
 const seenStates=new Set();
 const usable=()=>!disposed&&active()&&!root.closest('[inert]')&&!root.ownerDocument.hidden;
 function fade(node,name){if(!node||!usable())return;node.dataset.motionPrimitive=name;controller?.dataState(node);}
 function release(){controller?.dispose();controller=null;}
 return {
  activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested,...(media?{media}:{})});},
  setMode(value){requested=value;controller?.setMode(value);},
  list:node=>fade(node,'NotificationList'),
  state(node,signature){if(!signature||seenStates.has(signature))return;seenStates.add(signature);fade(node,'WaitingWebState');},
  cancel(){controller?.cancel();},
  hide:release,
  dispose(){disposed=true;release();seenStates.clear();},
 };
}
