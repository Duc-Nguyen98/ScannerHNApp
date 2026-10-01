const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out='handoff/P16/evidence/revision-01';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch(),p=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,timezoneId:'Asia/Ho_Chi_Minh',reducedMotion:'reduce'});
 const errors=[],checks=[],metrics=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 const shot=async name=>{await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});};
 const check=async(name,fn)=>{await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);};
 async function login(){await p.goto('http://localhost:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForSelector('#home-app');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');}
 async function demo(s){await p.locator('.p16-tools').evaluate(e=>e.open=true);await p.locator(`[data-p16-demo="${s}"]`).click();await p.evaluate(()=>scrollTo(0,0));}
 const kind=()=>p.locator('[data-data-state]').first().getAttribute('data-data-state');
 try{
  // Render immutable before source via request interception, never replace working source.
  await p.route('**/documents/documents.mjs*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(out,'before/documents.mjs'),'utf8')}));
  await p.route('**/documents/style.css*',r=>r.fulfill({contentType:'text/css',body:fs.readFileSync(path.join(out,'before/style.css'),'utf8')}));
  await login();await p.locator('.p12-tools details').evaluate(e=>e.open=true);
  for(const s of ['ready','loading','empty','error']){await p.selectOption('#p12-scenario',s);await shot('before/'+s);}
  await p.selectOption('#p12-scenario','ready');await p.fill('#p12-query','PN-9999');await shot('before/no-results');
  await p.unrouteAll();await login();
  await check('A01 four states, unknown count, fixed controls and footer at five viewports',async()=>{
   for(const [width,height] of [[494,950],[360,800],[430,932],[1440,900],[340,420]]){
    await p.setViewportSize({width,height});let previous;
    for(const [s,panel] of [['loading','P16.S01'],['empty','P16.S02'],['no-results','P16.S03'],['error','P16.S04']]){
     if(s==='error'){await demo('ready');await p.locator('[data-p12=clear]').first().click();}
     await demo(s);await p.waitForSelector(`[data-panel="${panel}"]`);
     const m=await p.locator('.p12-app').evaluate(e=>{const body=e.querySelector('.p12-scroll'),controls=e.querySelector('.p12-list-controls').getBoundingClientRect(),nav=document.querySelector('.hn-nav').getBoundingClientRect();return {panel:e.querySelector('[data-data-state]').dataset.panel,controls:controls.toJSON(),nav:nav.toJSON(),overflow:body.scrollWidth>body.clientWidth,body:body.getBoundingClientRect().toJSON(),busy:e.querySelector('.p12-records').getAttribute('aria-busy'),font:getComputedStyle(e).fontFamily,screen:{width:document.querySelector('.hn-screen').offsetWidth,height:document.querySelector('.hn-screen').offsetHeight}};});
     assert.ok(!m.overflow);assert.ok(m.body.bottom<=m.nav.top+1);assert.equal(m.screen.width,494);assert.equal(m.screen.height,950);
     if(previous){assert.equal(m.controls.top,previous.controls.top);assert.equal(m.controls.height,previous.controls.height);assert.equal(m.nav.top,previous.nav.top);}previous=m;
     assert.equal(m.busy,s==='loading'?'true':'false');assert.ok(await p.locator(`[data-panel="${panel}"] [role=status]`).count());
     if(['loading','error'].includes(s))assert.match(await p.locator('.p12-result-count').textContent(),/Chưa xác định/);
     metrics.push({viewport:[width,height],...m});await shot(`${panel.replace('.','-')}-${width}x${height}`);
    }
   }
   await p.setViewportSize({width:494,height:950});
  });
  await check('A03 edit query focuses/selects input; clear restores verified source and all filters',async()=>{
   await demo('no-results');assert.equal(await p.inputValue('#p12-query'),'PN-9999');await p.click('[data-p12="edit-query"]');assert.ok(await p.locator('#p12-query').evaluate(e=>e===document.activeElement));
   await p.locator('.p16-state [data-p12="clear"]').click();assert.equal(await p.inputValue('#p12-query'),'');assert.equal(await p.locator('.p12-record').count(),24);assert.equal(await p.locator('[data-p12-type=all]').getAttribute('aria-selected'),'true');await shot('ready');
  });
  await check('A02 failed retry retains query/type/date, null does not mean empty and no invented code',async()=>{
   await p.click('[data-p12-type=inbound]');await p.fill('#p12-query','PN-0005');await demo('error');await p.click('[data-p12="retry"]');assert.equal(await kind(),'error');assert.equal(await p.inputValue('#p12-query'),'PN-0005');assert.equal(await p.locator('[data-p12-type=inbound]').getAttribute('aria-selected'),'true');assert.equal(await p.locator('.p16-error-code').count(),0);
   await demo('null');assert.equal(await kind(),'error');assert.equal(await p.locator('[data-panel="P16.S02"]').count(),0);
  });
  await check('stale cache keeps exact rows; changed query cannot display old results',async()=>{
   await demo('ready');assert.equal(await p.locator('.p12-record').count(),1);const ids=await p.locator('[data-p12-doc]').evaluateAll(es=>es.map(e=>e.dataset.p12Doc));await demo('stale');assert.equal(await kind(),'stale');assert.deepEqual(await p.locator('[data-p12-doc]').evaluateAll(es=>es.map(e=>e.dataset.p12Doc)),ids);await shot('stale');await p.fill('#p12-query','different');assert.equal(await kind(),'error');assert.equal(await p.locator('.p12-record').count(),0);
  });
  await check('A05 readonly hides create, rejects synthetic action and direct create route',async()=>{
   await demo('empty');await p.locator('#p16-readonly').check();assert.equal(await p.locator('[data-p12=create]').count(),0);
   await p.evaluate(()=>{const b=document.createElement('button');b.dataset.p12='create';document.querySelector('.p12-app').append(b);b.click();b.remove();});await p.locator('.app-modal-host dialog').waitFor();assert.match(await p.locator('.app-modal-host dialog').textContent(),/Không có quyền/);await p.keyboard.press('Escape');await p.waitForTimeout(100);
   await p.evaluate(()=>location.hash='#p02/documents?panel=4');await p.waitForTimeout(100);assert.equal(await p.locator('[data-panel="P12.S04"]').count(),0);assert.equal(await p.locator('[data-p12=create]').count(),0);await shot('readonly');await p.locator('#p16-readonly').uncheck();
  });
  await check('empty CTA enters existing P12 form, preserves 200 limit and routes to P04 owner',async()=>{
   await demo('empty');await p.locator('.p16-state [data-p12=create]').click();await p.waitForSelector('[data-panel="P12.S04"]');assert.equal(await p.locator('#p12-note').getAttribute('maxlength'),'200');await p.click('[data-p12=continue]');await p.waitForSelector('[data-panel="P04.S02"]');await shot('create-owner');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');
  });
  await check('pending completion cannot replace destination and Back keeps list context',async()=>{
   await demo('ready');await p.locator('[data-p12=clear]').first().click().catch(()=>{});await p.fill('#p12-query','PN-001');await p.locator('.p12-scroll').evaluate(e=>e.scrollTop=100);const y=await p.locator('.p12-scroll').evaluate(e=>e.scrollTop);await p.locator('[data-p12-doc]').first().click();await p.click('[data-p12=back]');await p.waitForSelector('#p12-query');assert.equal(await p.inputValue('#p12-query'),'PN-001');assert.equal(await p.locator('.p12-scroll').evaluate(e=>e.scrollTop),y);
   await demo('loading');await p.locator('.hn-nav [data-route=home]').click();await p.waitForTimeout(8200);assert.equal(await p.locator('.p12-app').count(),0);
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({checks,metrics,errors},null,2));console.log(checks.length+' groups PASS');
 }catch(e){fs.writeFileSync(path.join(out,'browser-failure.json'),JSON.stringify({message:e.message,checks,metrics,errors},null,2));await shot('failure').catch(()=>{});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
