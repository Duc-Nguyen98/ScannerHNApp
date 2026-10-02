const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const out=process.env.P15_EVIDENCE_DIR||'handoff/P15/evidence/revision-01';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch(),p=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,timezoneId:'Asia/Ho_Chi_Minh'});
 const checks=[],metrics=[],errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(20000);
 const check=async(name,run)=>{await run();checks.push({name,status:'PASS'});console.log('PASS '+name);};
 const modal=()=>p.locator('.app-modal-host dialog'),act=a=>p.locator(`[data-p15="${a}"]`).first(),shot=async n=>{await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(80);await p.locator('.hn-screen').screenshot({path:path.join(out,n+'.png')});};
 async function login(){await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.locator('#home-app').waitFor({state:'visible'});}
 async function open(kind){await p.locator('.p15-tools').evaluate(e=>e.open=true);await p.click(`[data-system-demo="${kind}"]`);await p.locator('.p15-app').waitFor({state:'visible'});}
 async function fresh(){await p.goto((process.env.P15_BASE_URL||'http://localhost:8766/flows/auth-session/'));await login();}
 try {
  await fresh();
  await check('S01/S03/S04: four viewports, fixed caller footer, no horizontal overflow',async()=>{
   for(const kind of ['connection','forbidden','device']){
    await open(kind);
    for(const [width,height] of [[494,950],[360,800],[430,932],[1440,900],[340,420]]){
     await p.setViewportSize({width,height});await p.waitForTimeout(60);
     const m=await p.locator('.p15-app').evaluate(e=>{const r=e.getBoundingClientRect(),body=e.querySelector('.p15-body'),nav=e.parentElement.querySelector('.hn-nav'),n=nav.getBoundingClientRect();return {panel:e.dataset.panel,viewport:[innerWidth,innerHeight],bodyOverflow:body.scrollWidth>body.clientWidth,navTop:n.top,bottom:r.bottom,navBg:getComputedStyle(nav).backgroundColor,rect:r.toJSON()};});
     assert.ok(!m.bodyOverflow);assert.ok(m.bottom<=m.navTop+1);assert.equal(m.navBg,'rgba(255, 255, 255, 0.98)');metrics.push(m);
     await shot(`${m.panel.replace('.','-')}-${width}x${height}`);
    }
    await p.setViewportSize({width:494,height:950});await shot((await p.locator('.p15-app').getAttribute('data-panel')).replace('.','-'));await act('back').click();await p.locator('.p15-app').waitFor({state:'hidden'});
   }
  });
  await check('Retry without source cannot claim success; modal Back/Escape/backdrop and focus',async()=>{
   await open('connection');await act('retry').click();await modal().waitFor();assert.match(await modal().innerText(),/Chưa có nguồn kiểm tra/);await p.locator('.app-modal-host').click({position:{x:2,y:2}});assert.equal(await modal().count(),1);await p.keyboard.press('Tab');assert.ok(await modal().evaluate(e=>e.contains(document.activeElement)));await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));await act('retry').click();await modal().waitFor();await p.goBack();await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));assert.equal(await p.locator('.p15-app:visible').count(),1);await act('back').click();await p.locator('.p15-app').waitFor({state:'hidden'});
  });
  await check('Contact uses missing-configuration guidance; no external message or role change',async()=>{await open('forbidden');await act('contact').click();assert.match(await modal().innerText(),/Chưa có kênh/);await modal().getByRole('button',{name:'Đóng',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));await act('back').click();await p.locator('.p15-app').waitFor({state:'hidden'});});
  await check('A03 revoked fixture permission guards deep link and visible caller; restore only explicit fixture control',async()=>{await open('deny');await p.evaluate(()=>{location.hash='#p02/inbound'});await p.waitForTimeout(100);assert.equal(await p.locator('.p04-app:visible').count(),0);assert.equal(await p.locator('.p15-app').getAttribute('data-panel'),'P15.S03');await p.click('[data-system-demo=allow]');await p.click('[data-tab=home]');});
  await check('A04 no auto camera request; denial and hardware error remain usable; NFC API missing is unsupported',async()=>{
   await p.evaluate(()=>{window.__cameraCount=0;Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{window.__cameraCount++;throw new DOMException('Denied','NotAllowedError')}})});
   await open('device');assert.equal(await p.evaluate(()=>window.__cameraCount),0);assert.match(await p.locator('.p15-device-card').nth(1).innerText(),/Không khả dụng/);
   await act('camera').click();await modal().waitFor();assert.match(await modal().innerText(),/Quyền camera chưa/);assert.equal(await p.evaluate(()=>window.__cameraCount),1);await shot('camera-denied');await modal().getByRole('button',{name:'Đóng',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));
   assert.match(await p.locator('.p15-device-state').first().innerText(),/Chưa cho phép/);await act('camera-guide').click();await modal().waitFor();await shot('camera-guide');await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));await act('back').click();await p.locator('.p15-app').waitFor({state:'hidden'});
  });
  await fresh();await p.click('.hn-task[data-route=inbound]');await p.fill('[data-p04-note]','Nháp giữ nguyên 🌸');
  const snap=async()=>JSON.parse(await p.locator('[data-p04-snapshot]').textContent());
  await check('A05 caller DOM/input/scroll/focus survives system Back',async()=>{await p.locator('[data-p04-note]').focus();await p.locator('.p04-scroll').evaluate(e=>e.scrollTop=70);const before=await snap(),top=await p.locator('.p04-scroll').evaluate(e=>e.scrollTop);await open('connection');await p.goBack();await p.locator('.p15-app').waitFor({state:'hidden'});assert.deepEqual((await snap()).document,before.document);assert.equal(await p.locator('.p04-scroll').evaluate(e=>e.scrollTop),top);assert.equal(await p.inputValue('[data-p04-note]'),'Nháp giữ nguyên 🌸');});
  await p.click('[data-p04=next]');await p.locator('.p04-tools').evaluate(e=>e.open=true);await p.click('[data-p04=batch]');await p.click('[data-p04=next]');await p.selectOption('[data-p04-outcome]','timeout-recorded');
  await check('A01 owner UNKNOWN enters current P15/P17 boundary; read check settles same request, no record replay/inventory change',async()=>{
   await p.click('[data-p04=send]');await p.locator('[data-panel="P15.S01"]:visible,[data-panel="P17.S04"]:visible').first().waitFor();const before=await snap();assert.equal(before.unknown,true);await shot('unknown-pending');const throughSystem=await p.locator('.p15-app:visible').count();if(throughSystem)await act('retry').dblclick();else await p.locator('[data-p04=check]').first().click();await p.locator('[data-panel="P04.S04"]').waitFor();await p.locator('.p15-app').waitFor({state:'hidden'});const after=await snap();assert.equal(after.recorded,true);assert.deepEqual(after.request,before.request);assert.equal(after.metrics.recordCalls,1);assert.equal(after.metrics.inventoryDelta,0);if(throughSystem)assert.ok(await p.locator('.p04-app h1').evaluate(e=>e===document.activeElement));
  });
  await fresh();await p.click('.hn-task[data-route=inbound]');await p.fill('[data-p04-note]','Giữ khi hết phiên');const beforeExpiry=await snap();
  await check('S02 and A02: expire nulls auth, blocks nav/Back, reauthentication restores exact same-account draft',async()=>{
   await open('expired');await shot('P15-S02');await p.click('[data-tab=documents]');assert.equal(await p.locator('.p15-app').getAttribute('data-panel'),'P15.S02');await p.goBack();assert.equal(await p.locator('.p15-app:visible').count(),1);
   await act('login').click();await p.locator('#username').waitFor();assert.equal(await p.locator('#home-app:visible').count(),0);await login();await p.locator('[data-p04-note]').waitFor();assert.equal(await p.inputValue('[data-p04-note]'),'Giữ khi hết phiên');assert.equal((await snap()).document.documentId,beforeExpiry.document.documentId);
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({status:'PASS',checks,metrics,errors},null,2));console.log('TOTAL '+checks.length);
 } catch(error){await p.screenshot({path:path.join(out,'failure.png'),fullPage:true});fs.writeFileSync(path.join(out,'browser-failure.json'),JSON.stringify({error:String(error),checks,errors},null,2));throw error;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
