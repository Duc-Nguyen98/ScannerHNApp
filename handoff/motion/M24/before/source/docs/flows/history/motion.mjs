import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M08 owns feedback on existing descendants only. M02 owns route opacity;
// the history module remains the sole native scroll/data/focus owner.
export function mountHistoryMotion({root,requested='auto',active=()=>true,media}){
 let controller=null,disposed=false;
 const mark=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
 return {
  activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested,...(media?{media}:{})});},
  setMode(value){requested=value;controller?.setMode(value);},
  filter(node){if(active())controller?.dataState(mark(node,'HistoryFilter'));},
  tab(node){if(active())controller?.noticeFeedback(mark(node,'HistoryTab'));},
  cancel(){controller?.cancel();},
  hide(){controller?.dispose();controller=null;},
  dispose(){disposed=true;controller?.dispose();controller=null;},
 };
}
