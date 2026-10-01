// Same domain assertions as Flow Gate, against the packaged/public runtime.
const fs=require('node:fs');
const mode=process.argv[2]||'auto';if(!['auto','os-reduced','off'].includes(mode))throw Error('Invalid mode');
const phase=process.env.FINAL_PHASE||'local';
process.env.FLOW_JOURNEY_DIR='handoff/FINAL/evidence/'+phase+'-journeys-'+mode;
process.env.PREVIEW_BASE_URL=(process.env.FINAL_URL||'http://127.0.0.1:8766/review/').replace(/\/$/,'')+'/runtime';
let code=fs.readFileSync('scripts/check_flow_gate.cjs','utf8');
code=code.replace('u.origin===base','u.origin===new URL(base).origin');
code=code.replace("timezoneId:'Asia/Ho_Chi_Minh'","timezoneId:'Asia/Ho_Chi_Minh',reducedMotion:"+JSON.stringify(mode==='os-reduced'?'reduce':'no-preference'));
const setMode=`await p.locator('#motion-mode').evaluate(e=>{e.value=${JSON.stringify(mode==='off'?'off':'auto')};e.dispatchEvent(new Event('change'));});`;
code=code.replace("await p.fill('#username','minhanh');",setMode+"await p.fill('#username','minhanh');");
code=code.replace("await p.reload();await p.locator('#login-form').waitFor();","await p.reload();await p.locator('#login-form').waitFor();"+setMode);
// Existing suites use diagnostic fixture controls. Reveal those outside the app
// in this test only; product geometry/owners and shipped source are unchanged.
code=code.replace('p.setDefaultTimeout(9000);',`p.setDefaultTimeout(15000);await p.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{document.body.dataset.finalTest='true';const s=document.createElement('style');s.textContent='body[data-final-test] .preview-tools,body[data-final-test] .hn-tools{display:block!important}body[data-final-test]{overflow:auto!important}';document.head.append(s);},{once:true}));`);
new Function('require','process',code)(require,process);
