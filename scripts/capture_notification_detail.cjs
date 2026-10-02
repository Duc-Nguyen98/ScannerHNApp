const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const out=process.env.P13_DETAIL_EVIDENCE_DIR||'handoff/P13/evidence/revision-05',phase=process.env.P13_DETAIL_PHASE||'after';
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,timezoneId:'Asia/Ho_Chi_Minh'});try{await p.goto((process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766')+'/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.click('.hn-bell');await p.locator('[data-p13-loaded=true]').waitFor();await p.locator('.p13-tools details').evaluate(e=>e.open=true);await p.selectOption('#p13-dataset','count-1000');await p.locator('[data-p13-loaded=true]').waitFor();
const cases=[['warehouse','panel=2&event=p13-count-review-00832'],['missing','panel=2&event=missing']];
async function route(q){await p.evaluate(q=>location.hash='#p02/notifications?'+q,q);await p.locator('[data-panel="P13.S02"],[data-panel="P13.S04"]').waitFor();await p.waitForTimeout(240);await p.evaluate(()=>scrollTo(0,0));}
for(const [name,q]of cases){await route(q);await p.locator('.hn-screen').screenshot({path:path.join(out,phase+'-'+name+'.png')});}
await p.selectOption('#p13-dataset','baseline');await p.locator('[data-p13-loaded=true]').waitFor();
for(const [name,q]of [['document','panel=2&event=p13-event-inbound'],['waiting','panel=4&doc=fixture-inbound-0005']]){await route(q);await p.locator('.hn-screen').screenshot({path:path.join(out,phase+'-'+name+'.png')});}
console.log(phase+':4 detail captures');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
