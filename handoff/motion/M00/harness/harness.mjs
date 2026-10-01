import {createMotionController} from './motion-primitives.mjs';
const $=id=>document.getElementById(id);
const motion=createMotionController({element:$('owner')});
let operations=0,view=1;
$('list').replaceChildren(...Array.from({length:40},(_,i)=>{const row=document.createElement('div');row.className='row';row.textContent='Fixture row '+(i+1);return row;}));
$('mode').onchange=e=>motion.setMode(e.target.value);
$('press').onclick=()=>{operations++;$('notice').textContent='Recorded '+operations;motion.pressFeedback($('press'));motion.noticeFeedback($('notice'));motion.rowFeedback($('list').firstElementChild);};
$('navigate').onclick=()=>{$('route-title').textContent='View '+(++view);motion.routeTransition($('route'));motion.dataState($('notice'));};
$('open').onclick=()=>{$('modal').showModal();motion.modalSheetMotion($('modal'));};
function close(){motion.cancel();$('modal').close();$('open').focus();}
$('close').onclick=close;$('modal').addEventListener('cancel',e=>{e.preventDefault();close();});
$('modal').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const list=[$('note'),$('close')];const index=list.indexOf(document.activeElement);e.preventDefault();list[(index+(e.shiftKey?-1:1)+list.length)%list.length].focus();});
$('security').onclick=()=>{motion.routeTransition($('route'),{securitySensitive:true});$('protected')?.remove();};
window.harness={motion,get operations(){return operations;},get view(){return view;}};
