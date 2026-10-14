import {createMotionController} from '../shared/motion/motion-primitives.mjs';
// P06 owns only result/selected-tab feedback. M02 owns route opacity.
export function mountLookupMotion({root,requested='auto',active=()=>true}){
 let controller=null,disposed=false;
 const label=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
 return {
  activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested});},
  setMode(value){requested=value;controller?.setMode(value);},
  search(node){if(active())controller?.dataState(label(node,'SearchFeedback'));},
  tab(node){if(active())controller?.noticeFeedback(label(node,'TabFeedback'));},
  cancel(){controller?.cancel();},
  hide(){controller?.dispose();controller=null;},
  dispose(){disposed=true;controller?.dispose();controller=null;},
 };
}
