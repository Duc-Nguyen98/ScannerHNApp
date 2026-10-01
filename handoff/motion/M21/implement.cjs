const fs=require('node:fs');let p='docs/flows/warranty-components/resume-view.mjs',s=fs.readFileSync(p,'utf8');
function replace(a,b){if(!s.includes(a))throw Error(a);s=s.replace(a,b);}
replace("import {checkpointTime", "import {mountComponentResumeMotion} from './resume-motion.mjs';\nimport {checkpointTime");
replace('mountComponentResume({root,','mountComponentResume({motionMode=\'auto\',root,');
replace("const positions=new Map()", "let checking=false;\n const motion=mountComponentResumeMotion({root,screen,requested:motionMode,active:()=>active&&!disposed});\n const positions=new Map()");
replace("${icon(post?'clock':'monitor')}","${post&&checking&&s.busy?'<span class=\"p21-status-spinner\" aria-hidden=\"true\">'+icon('refresh')+'</span>':icon(post?'clock':'monitor')}");
replace("  root.innerHTML=", "  motion.beforeRender();\n  root.innerHTML=");
replace('  syncTools();onSize();',"  if(panel===3&&s&&!denied)motion.reconcile(JSON.stringify([sample,s.document.documentId,s.checkpoint?.checkpointId,s.readIssue,s.resumeBlocked]),root.querySelector('.p21-state-icon'));\n  syncTools();onSize();");
replace('const selected=owner,token=++generation;remember();const promise=selected.reconcile();', 'const selected=owner,token=++generation;remember();checking=true;const promise=selected.reconcile();');
replace('token!==generation)return;render(true);','token!==generation)return;checking=false;render(true);');
replace('return {show(force=false)', 'return {setMotionMode(value){motionMode=value;motion.setMode(value);},cancelMotion(){motion.cancel();},show(force=false)');
replace('active=true;backPending=false;generation++;','active=true;checking=false;motion.activate();backPending=false;generation++;');
replace('active=false;deferred=false;','active=false;checking=false;motion.hide();deferred=false;');
replace('disposed=true;overlayObserver.disconnect();','disposed=true;motion.dispose();overlayObserver.disconnect();');
fs.writeFileSync(p,s);
p='docs/flows/home/home.mjs';s=fs.readFileSync(p,'utf8');
s=s.replaceAll('componentHistory?.setMotionMode(motionSelect.value);','componentHistory?.setMotionMode(motionSelect.value);componentResume?.setMotionMode(motionSelect.value);').replaceAll('componentHistory?.cancelMotion();','componentHistory?.cancelMotion();componentResume?.cancelMotion();').replace('componentResume=mountComponentResume({','componentResume=mountComponentResume({motionMode,');
fs.writeFileSync(p,s);
p='docs/flows/warranty-components/resume.css';s=fs.readFileSync(p,'utf8').replace('transition:background-color .12s ease','transition:background-color var(--hn-motion-press,100ms) var(--hn-motion-ease-standard,ease)');
s+=`\n/* M21: replaces the existing hero glyph only while the explicit status read runs. */
.p21-status-spinner{display:inline-flex;width:38px;height:38px;animation:p21-status-spin .9s linear infinite}
@keyframes p21-status-spin{to{transform:rotate(360deg)}}
[data-hn-motion-mode="reduced"] .p21-status-spinner,[data-hn-motion-mode="off"] .p21-status-spinner{animation:none}
[data-p21-motion-paused="true"] .p21-status-spinner{animation-play-state:paused}
@media(prefers-reduced-motion:reduce){.p21-status-spinner{animation:none}.p21-draft-wrap>.p21-draft{transition:none}}
`;
fs.writeFileSync(p,s);
