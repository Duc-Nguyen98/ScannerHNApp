const auditOrigin=process.env.PREVIEW_ORIGIN||'http://127.0.0.1:8766';
const previewBase=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {mockGeography,address}=require('./outbound_geography_helpers.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.SYSTEM_ICON_EVIDENCE_DIR||'handoff/P08/evidence/revision-20');fs.mkdirSync(out,{recursive:true});
const palette={inbound:['rgb(13, 107, 96)','rgb(234, 247, 242)'],outbound:['rgb(34, 95, 162)','rgb(237, 244, 255)'],warranty:['rgb(149, 96, 26)','rgb(255, 245, 230)'],nfc:['rgb(117, 80, 162)','rgb(243, 239, 251)'],documents:['rgb(70, 98, 121)','rgb(238, 243, 247)'],lookup:['rgb(70, 98, 121)','rgb(238, 243, 247)'],sessions:['rgb(78, 93, 168)','rgb(239, 241, 253)']};
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await mockGeography(page);
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function login(){await page.goto(previewBase+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('#hn-home').waitFor({state:'visible'});}
 async function audit(name,selector='.hn-operation-icon'){
  const icons=page.locator(selector+':visible');await icons.first().waitFor();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const m=await icons.evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e),svg=e.querySelector('svg');return {op:e.dataset.hnOperation||'nfc',box:[e.offsetLeft,e.offsetTop,e.offsetWidth,e.offsetHeight],color:s.color,bg:s.backgroundColor,fill:getComputedStyle(svg).fill,stroke:getComputedStyle(svg).strokeWidth};}));
  for(const icon of m){assert.deepEqual([icon.color,icon.bg],palette[icon.op],name+':'+icon.op);assert.equal(icon.fill,'none');assert.equal(icon.stroke,'1.8px');}
  await page.locator('link[href*="operation-icons.css"]').evaluate(e=>e.disabled=true);
  const prior=await icons.evaluateAll(es=>es.map(e=>[e.offsetLeft,e.offsetTop,e.offsetWidth,e.offsetHeight]));
  await page.locator('link[href*="operation-icons.css"]').evaluate(e=>e.disabled=false);
  // Re-enabling a no-store stylesheet may trigger an asynchronous fetch.
  // Wait for the original paint before the next viewport audit/screenshot.
  await page.waitForFunction(({selector,expected})=>{
    const nodes=[...document.querySelectorAll(selector)].filter(e=>e.getClientRects().length);
    return nodes.length===expected.length&&nodes.every((e,i)=>{
      const s=getComputedStyle(e);return s.color===expected[i].color&&s.backgroundColor===expected[i].bg;
    });
  },{selector,expected:m});
  m.forEach((icon,i)=>icon.box.forEach((n,j)=>assert.ok(Math.abs(n-prior[i][j])<.6,name+' geometry')));
  metrics.push({name,icons:m});await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});
 }
 try{
 await login();
 await check('Home task/recent/lookup tiles use shared palette without moving accepted layout at6 sizes',async()=>{
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){await page.setViewportSize({width:w,height:h});await audit('home-'+w+'x'+h);}
  await page.setViewportSize({width:494,height:1000});
 });
 await check('P03 operation picker has same operation mapping; warning dialogs excluded',async()=>{
  await page.click('[data-tab=lookup]');await page.locator('[data-panel="P03.S01"]').waitFor();await audit('p03-operations');await page.keyboard.press('Escape');await page.locator('#hn-home').waitFor({state:'visible'});
 });
 await check('P04/P05 review document icons use operation color, metadata neutral; workflow unchanged',async()=>{
  await page.locator('.hn-task[data-route=inbound]').click();await page.locator('[data-p04=next]').first().click();await page.locator('[data-p04=manual]').first().click();await page.fill('#p04-code','HN12345');await page.locator('#p04-code').press('Enter');await page.locator('[data-p04=next]').first().click();await page.locator('[data-panel="P04.S03"]').waitFor();await audit('p04-review');
  await login();await page.locator('.hn-task[data-route=outbound]').click();await address(page);await page.locator('[data-p05=next]').first().click();await page.locator('[data-p05=manual]').first().click();await page.fill('#p05-code','HN12345');await page.locator('#p05-code').press('Enter');await page.locator('[data-p05=next]').first().click();await page.locator('[data-panel="P05.S03"]').waitFor();await audit('p05-review');
 });
 await check('P06 transaction icon colors match Home and History without changing signed values',async()=>{
  await login();await page.click('.hn-scanner');await page.fill('#p06-search','HN12345');await page.locator('[data-p06-item]').first().click();await page.click('[data-p06=history]');const values=await page.locator('.p06-event-result b').allTextContents();await audit('p06-history');assert.deepEqual(await page.locator('.p06-event-result b').allTextContents(),values);
 });
 await check('P07 NFC identity tiles use purple while artwork module and layout remain unchanged',async()=>{
  await page.click('[data-tab=home]');await page.locator('.hn-task[data-route=nfc]').click();await page.locator('[data-panel="P07.S01"]').waitFor();await audit('p07-list','.p07-nfc-tile');
 });
 await check('Embedded history hub consumes same shared stylesheet; standalone is not repainted',async()=>{
  await page.click('[data-tab=history]');const frame=page.frameLocator('iframe');await frame.locator('.history-links').waitFor();
  const hub=await frame.locator('.history-link .hn-operation-icon').evaluateAll(es=>es.map(e=>({op:e.dataset.hnOperation,color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor})));
  assert.equal(hub.length,6);for(const i of hub)assert.deepEqual([i.color,i.bg],palette[i.op]);await page.locator('.hn-screen').screenshot({path:path.join(out,'history-hub.png')});
  const p=await browser.newPage();await p.goto(previewBase+'/flows/warranty-components/?mode=screen&scene=history-hub');assert.equal(await p.locator('.phone').getAttribute('data-history-embedded'),'false');assert.equal(await p.locator('.statusbar').isVisible(),true);await p.close();
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'system-icon-results.json'),JSON.stringify({revision:'HN-icon-standard-v1/P08-r20',checks,metrics,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
