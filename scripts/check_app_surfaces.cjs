const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P07/evidence/revision-02/surfaces');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-features=OverlayScrollbar']});
 const page=await browser.newPage({viewport:{width:1869,height:940},deviceScaleFactor:1});const checks=[],audits=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function audit(name){const result=await page.evaluate(()=>{
  const roots=[...document.querySelectorAll('#app:not([hidden]),.hn-screen,.phone')];
  const nodes=roots.flatMap(r=>[r,...r.querySelectorAll('*')]).filter(e=>e.getClientRects().length);
  const scrollers=nodes.filter(e=>{const c=getComputedStyle(e);return /auto|scroll/.test(c.overflowY+' '+c.overflowX);});
  return {scrollers:scrollers.map(e=>({class:e.className,scrollbar:getComputedStyle(e).scrollbarWidth,gutter:getComputedStyle(e).scrollbarGutter,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight})),pageScrollbar:getComputedStyle(document.documentElement).scrollbarWidth};
 });for(const r of result.scrollers){assert.equal(r.scrollbar,'none',`${name}: ${r.class}`);assert.equal(r.gutter,'auto');}assert.equal(result.pageScrollbar,'none');audits.push({name,...result});}
 async function login(){await page.goto('http://127.0.0.1:8766/flows/auth-session/');await audit('P01.S01');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.locator('#start').waitFor();await audit('P01.S02');await page.click('#start');await page.locator('.hn-task').first().waitFor();}
 try{
 await login();await audit('P02.S01');
 await check('all implemented app owners use shared no-scrollbar policy',async()=>{
  for(const [route,selector,name]of [['inbound','.p04-app','P04'],['outbound','.p05-app','P05'],['lookup','.p06-app','P06'],['nfc','.p07-app','P07']]){await page.evaluate(r=>location.hash='#p02/'+r,route);await page.locator(selector).waitFor();await audit(name);await page.evaluate(()=>location.hash='#home');await page.locator('.hn-task').first().waitFor();}
  await page.click('[data-tab="lookup"]');await page.locator('.p03-dialog').waitFor();await audit('P03');await page.keyboard.press('Escape');
 });
 await page.click('[data-route="nfc"]');
 await check('tabs do not alter content width or frame alignment',async()=>{const widths=[];for(const tab of ['all','linked','unlinked','all']){await page.click(`[data-p07-tab="${tab}"]`);widths.push(await page.locator('.p07-scroll').evaluate(e=>({client:e.clientWidth,width:e.getBoundingClientRect().width,left:e.getBoundingClientRect().left})));}for(const v of widths)assert.deepEqual(v,widths[0]);});
 await check('wheel and keyboard still reach last NFC card; footer stays fixed',async()=>{
  const region=page.locator('.p07-scroll');await region.hover();const header=await page.locator('.p07-header').boundingBox();await page.mouse.wheel(0,700);await page.waitForFunction(()=>document.querySelector('.p07-scroll').scrollTop>0);assert.deepEqual(await page.locator('.p07-header').boundingBox(),header);
  await region.focus();await page.keyboard.press('Control+Home');await page.keyboard.press('End');await page.waitForFunction(()=>{const s=document.querySelector('.p07-scroll');return s.scrollTop+s.clientHeight>=s.scrollHeight-2;});
  const last=await page.locator('.p07-tag').last().locator('small').last().boundingBox(),sc=await region.boundingBox();assert.ok(last.y+last.height<=sc.y+sc.height+1);await page.locator('.hn-screen').screenshot({path:path.join(out,'nfc-scroll-end.png')});
 });
 await check('modal and backdrop confined to app across six sizes; outside tools undimmed',async()=>{
  for(const [width,height]of [[1869,940],[1495,752],[685,872],[494,1000],[360,800],[340,420]]){
   await page.setViewportSize({width,height});await page.locator('.p07-scroll').evaluate(e=>e.scrollTop=0);await page.click('[data-p07-tag="fixture-tag-001"]');
   const s=await page.locator('.hn-screen').boundingBox(),d=await page.locator('dialog[open]').boundingBox(),b=await page.locator('.app-modal-host').boundingBox();
   assert.ok(d.x>=s.x&&d.y>=s.y&&d.x+d.width<=s.x+s.width+1&&d.y+d.height<=s.y+s.height+1);
   for(const key of ['x','y','width','height'])assert.ok(Math.abs(b[key]-s[key])<1);
   assert.equal(await page.locator('dialog[open]').evaluate(e=>e.matches(':modal')),false);
   assert.equal(await page.locator('.hn-tools').evaluate(e=>e.inert),true);
   await audit('modal-'+width);await page.screenshot({path:path.join(out,`modal-${width}x${height}.png`)});
   for(let i=0;i<6;i++)await page.keyboard.press('Tab');assert.equal(await page.locator('dialog[open]').evaluate(e=>e.contains(document.activeElement)),true);
   await page.keyboard.press('Escape');await page.locator('dialog[open]').waitFor({state:'detached'});assert.equal(await page.locator('[data-p07-tag="fixture-tag-001"]').evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('.hn-tools').evaluate(e=>e.inert),false);
  }
 });
 await check('long modal body scrolls, background locked, close button always visible, backdrop stays open',async()=>{
  await page.setViewportSize({width:494,height:1000});await page.click('[data-p07-tag="fixture-tag-001"]');
  await page.locator('dialog dd').nth(2).evaluate(e=>e.textContent=('Tên sản phẩm dài kiểm tra xuống dòng. ').repeat(90));
  const body=page.locator('dialog[open] .app-modal-body');await body.hover();const old=await page.locator('.p07-scroll').evaluate(e=>e.scrollTop);await page.mouse.wheel(0,400);await page.waitForFunction(()=>document.querySelector('dialog[open] .app-modal-body').scrollTop>0);assert.equal(await page.locator('.p07-scroll').evaluate(e=>e.scrollTop),old);
  const d=await page.locator('dialog[open]').boundingBox(),close=await page.locator('dialog[open] [data-p07="close-detail"]').first().boundingBox();assert.ok(close.y+close.height<=d.y+d.height);await page.locator('.hn-screen').screenshot({path:path.join(out,'modal-long-content.png')});
  const host=await page.locator('.app-modal-host').boundingBox();await page.mouse.click(host.x+2,host.y+2);await page.locator('dialog[open]').waitFor();await page.keyboard.press('Escape');await page.locator('dialog[open]').waitFor({state:'detached'});
 });
 await check('touch swipe scrolls content with hidden scrollbar',async()=>{
  const box=await page.locator('.p07-scroll').boundingBox();await page.locator('.p07-scroll').evaluate(e=>e.scrollTop=0);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  const x=box.x+box.width/2,y=box.y+box.height-50;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*45}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForFunction(()=>document.querySelector('.p07-scroll').scrollTop>0);await cdp.detach();
 });
 await check('every existing warranty/history scene has no app scrollbar',async()=>{
  const source=fs.readFileSync('docs/flows/warranty-components/flow.js','utf8');const block=source.match(/const SCENES = \{([\s\S]*?)\n\};/)[1];
  const scenes=[...block.matchAll(/^\s*(?:"([^"]+)"|([\w-]+)):/gm)].map(m=>m[1]||m[2]);assert.ok(scenes.length>=24);
  await page.setViewportSize({width:1440,height:900});
  for(const scene of scenes){await page.goto('http://127.0.0.1:8766/flows/warranty-components/?mode=screen&scene='+scene);await page.locator('.phone').waitFor();await audit('existing-'+scene);}
  await page.goto('http://127.0.0.1:8766/flows/warranty-components/?mode=screen&scene=history-hub');await page.locator('.phone').screenshot({path:path.join(out,'history-hub.png')});
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,audits,errors,realTouchDevice:'NOT_RUN; Chromium touch emulation tested'},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,audits,error:e.stack,errors},null,2));throw e;}finally{await browser.close();}
})();
