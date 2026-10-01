const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');const out=process.env.P15_EVIDENCE_DIR||'handoff/P15/evidence/revision-01';
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,timezoneId:'Asia/Ho_Chi_Minh'});p.setDefaultTimeout(20000);const checks=[],errors=[];p.on('pageerror',e=>errors.push(e.message));
 const check=async(name,run)=>{await run();checks.push({name,status:'PASS'});console.log('PASS '+name);};const a=k=>p.locator(`[data-p15="${k}"]`).first(),modal=()=>p.locator('.app-modal-host dialog');
 const login=async()=>{await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.locator('#home-app').waitFor({state:'visible'});};
 const open=async kind=>{await p.locator('.p15-tools').evaluate(e=>e.open=true);await p.click(`[data-system-demo="${kind}"]`);};
 try{
 await p.goto((process.env.P15_BASE_URL||'http://localhost:8766/flows/auth-session/'));await login();
 await check('Camera hardware failure then verified live-track grant, streams stopped',async()=>{
  await p.evaluate(()=>{window.__stopped=0;Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{throw new DOMException('Busy','NotReadableError')}})});
  await open('device');await a('camera').click();await modal().waitFor();assert.match(await p.locator('.p15-device-state').first().innerText(),/Chưa truy cập/);await p.locator('.hn-screen').screenshot({path:out+'/camera-hardware-error.png'});await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));
  await p.evaluate(()=>Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{const track={readyState:'live',stop(){window.__stopped++}};return {getVideoTracks:()=>[track],getTracks:()=>[track]}}}));
  await a('camera').click();await modal().getByRole('button',{name:'Đã hiểu',exact:true}).waitFor();assert.equal(await p.evaluate(()=>window.__stopped),1);await p.locator('.hn-screen').screenshot({path:out+'/camera-granted-api-mock.png'});await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));await a('back').click();await p.locator('.p15-app').waitFor({state:'hidden'});
 });
 await check('Expiry during dialog cancels overlay, shows exactly S02; all viewports retain nav',async()=>{
  await open('forbidden');await a('contact').click();await modal().waitFor();await p.locator('[data-system-demo=expired]').evaluate(e=>e.click());await p.locator('[data-panel="P15.S02"]').waitFor();await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));assert.equal(await p.locator('.p15-app:visible').count(),1);
  for(const [width,height]of [[494,950],[360,800],[430,932],[1440,900],[340,420]]){await p.setViewportSize({width,height});await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(80);const m=await p.locator('.hn-nav').evaluate(n=>({bottom:n.getBoundingClientRect().bottom,h:innerHeight,display:getComputedStyle(n).display}));assert.equal(m.display,'grid');assert.ok(m.bottom<=height+1);await p.locator('.hn-screen').screenshot({path:out+`/P15-S02-${width}x${height}.png`});}
  await p.setViewportSize({width:494,height:950});await a('login').click();await login();
 });
 await p.click('.hn-task[data-route=inbound]');await p.fill('[data-p04-note]','Phiếu UNKNOWN còn nguyên');await p.click('[data-p04=next]');await p.locator('.p04-tools').evaluate(e=>e.open=true);await p.click('[data-p04=batch]');await p.click('[data-p04=next]');await p.selectOption('[data-p04-outcome]','timeout-recorded');await p.click('[data-p04=send]');await p.locator('[data-panel="P15.S01"]:visible,[data-panel="P17.S04"]:visible').first().waitFor();
 const snap=async()=>JSON.parse(await p.locator('[data-p04-snapshot]').textContent());const pending=await snap();
 await check('UNKNOWN request/lines survive expiry and same-account auth; no automatic replay, read settles',async()=>{
  await open('expired');await a('login').click();await login();const s=await snap();assert.equal(s.unknown,true);assert.deepEqual(s.request,pending.request);assert.deepEqual(s.accepted,pending.accepted);assert.equal(s.metrics.recordCalls,1);assert.deepEqual(s.metrics,pending.metrics);
  // Reauth returns caller; owner UNKNOWN action remains a read-only check.
  if(await p.locator('.p15-app:visible').count())await a('back').click();await p.locator('[data-p04=check]').click();await p.locator('[data-panel="P04.S04"]').waitFor();assert.equal((await snap()).metrics.recordCalls,1);
 });
 await check('Reload requires login and resets page-memory fixture',async()=>{await p.reload();await p.locator('#username').waitFor();assert.equal(await p.locator('.p04-app').count(),0);});
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/edge-results.json',JSON.stringify({status:'PASS',checks,errors},null,2));console.log('TOTAL '+checks.length);
 }catch(e){await p.screenshot({path:out+'/edge-failure.png',fullPage:true});fs.writeFileSync(out+'/edge-failure.json',JSON.stringify({error:String(e),checks,errors},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
