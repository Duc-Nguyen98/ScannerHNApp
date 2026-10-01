const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out='handoff/P16/evidence/revision-03';
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,reducedMotion:'reduce',timezoneId:'Asia/Ho_Chi_Minh'}),checks=[],metrics=[],errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
await p.route('**/home/home.mjs*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('docs/flows/home/home.mjs','utf8').replace('onSystemError:showSystem,supplierHistory','readList:window.auditRead,onSystemError:showSystem,supplierHistory')}));
await p.addInitScript(()=>{window.mode='ready';window.pending=[];window.auditRead=()=>mode==='pending'?new Promise(resolve=>pending.push(resolve)):rows;});
const check=async(name,fn)=>{await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);};
const shot=async name=>{await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});};
const act=a=>p.locator(`[data-p12="${a}"]`).first(),query=async q=>{await p.fill('#p12-query',q);await p.press('#p12-query','Enter');},dialog=()=>p.locator('.app-modal-host dialog');
try{
 await p.goto('http://localhost:8766/flows/auth-session/');await p.evaluate(async()=>window.rows=(await import('/flows/documents/document-model.mjs')).mergeDocuments([]));await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForSelector('#home-app');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');
 await check('Long query 250/2000/unbroken/Unicode is three lines with exact full reader; short has no extra link',async()=>{
  for(const [name,text]of [['250','Nội dung kiểm tra '.repeat(16)],['2000','Từ khóa 📦 <img src=x> & Unicode '.repeat(90)],['word','W'.repeat(2400)]]){
   await query(text);await p.waitForFunction(()=>!document.querySelector('[data-p12=read-query]').hidden);const native=await p.inputValue('#p12-query');assert.equal(native,text);
   const m=await p.locator('.p16-description').evaluate(e=>({height:e.clientHeight,leading:parseFloat(getComputedStyle(e).lineHeight),scroll:e.scrollHeight}));assert.ok(m.height<=m.leading*3+1);assert.ok(m.scroll>m.height);assert.equal(await p.locator('.p16-description img').count(),0);
   await act('read-query').click();assert.equal(await dialog().locator('.p12-full-text').textContent(),text);await p.keyboard.press('Escape');await p.waitForTimeout(90);assert.ok(await act('read-query').evaluate(e=>e===document.activeElement));await shot('query-'+name);
  }
  await query('PN-9999');assert.ok(await act('read-query').isHidden());
 });
 await check('Reader Back/backdrop/focus and six viewport geometry; recovery CTA remains reachable',async()=>{
  const text='Đối chiếu từ khóa dài 📦 '.repeat(100);await query(text);
  for(const [width,height]of [[494,950],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await p.setViewportSize({width,height});await p.evaluate(()=>scrollTo(0,0));
   const m=await p.locator('.p12-scroll').evaluate(e=>{const r=e.getBoundingClientRect(),a=e.querySelector('.p16-actions').getBoundingClientRect(),n=document.querySelector('.hn-nav').getBoundingClientRect();return {overflow:e.scrollWidth>e.clientWidth,scroll:e.scrollHeight,client:e.clientHeight,actionBottom:a.bottom,navTop:n.top,top:r.top};});assert.ok(!m.overflow);assert.ok(m.actionBottom<m.navTop);metrics.push({width,height,...m});await shot('long-'+width+'x'+height);
   await act('read-query').click();const inside=await dialog().evaluate(d=>{const a=d.getBoundingClientRect(),s=d.closest('.hn-screen').getBoundingClientRect();return a.left>=s.left-1&&a.right<=s.right+1&&a.top>=s.top-1&&a.bottom<=s.bottom+1;});assert.ok(inside);assert.equal(await p.locator('.app-modal-host').count(),1);assert.equal(await dialog().locator('.p12-full-text').textContent(),text);
   await p.locator('.app-modal-host').dispatchEvent('click');assert.equal(await p.locator('.app-modal-host').count(),1);await p.keyboard.press('Shift+Tab');assert.ok(await dialog().evaluate(d=>d.contains(document.activeElement)));await shot('reader-'+width+'x'+height);await p.goBack();await p.waitForSelector('.app-modal-host',{state:'detached'});await p.waitForTimeout(100);assert.ok(await act('read-query').evaluate(e=>e===document.activeElement));
  }await p.setViewportSize({width:494,height:950});
 });
 await check('Toolbar scan and sort keep DOM identity and keyboard focus when request settles',async()=>{
  await query('');await p.evaluate(()=>mode='pending');
  for(const a of ['scan','sort']){await p.press('#p12-query','Enter');await act(a).focus();await act(a).evaluate(e=>window.originalButton=e);await p.evaluate(()=>pending.shift()(rows));await p.waitForTimeout(80);assert.ok(await act(a).evaluate(e=>e===originalButton&&e===document.activeElement));}
 });
 await check('Open sort remains focused during read completion; Escape returns to same trigger',async()=>{
  await p.press('#p12-query','Enter');await act('sort').click();await p.evaluate(()=>pending.shift()(rows));await p.waitForTimeout(80);assert.ok(await dialog().evaluate(e=>e.contains(document.activeElement)));await p.keyboard.press('Escape');await p.waitForTimeout(100);assert.ok(await act('sort').evaluate(e=>e===document.activeElement));
 });
 await check('Focused row disappearing moves focus to list region, never BODY; busy/announcement remains accessible',async()=>{
  await p.press('#p12-query','Enter');await p.locator('[data-p12-doc]').first().focus();await p.evaluate(()=>pending.shift()([]));await p.waitForTimeout(80);assert.ok(await p.locator('.p12-records').evaluate(e=>e===document.activeElement));assert.equal(await p.locator('.p12-records').getAttribute('aria-busy'),'false');assert.match(await p.locator('[data-hn-announcement=p16-data]').textContent(),/Chưa có/);await shot('empty-focus');await p.evaluate(()=>mode='ready');await query('');
 });
 await check('Apply filter and sort restore semantic trigger after render; Cancel does not change query',async()=>{
  await query('PN-9999');await act('filter').click();await p.fill('#pick-from','01/09/2026');await p.fill('#pick-to','02/09/2026');await p.locator('.p08-picker [type=submit]').click();await p.waitForTimeout(100);assert.ok(await act('filter').evaluate(e=>e===document.activeElement));await act('sort').click();await p.locator('.p08-picker [type=submit]').click();await p.waitForTimeout(100);assert.ok(await act('sort').evaluate(e=>e===document.activeElement));await act('filter').click();await p.fill('#pick-from','03/09/2026');await p.keyboard.press('Escape');await p.waitForTimeout(100);assert.ok(await act('filter').evaluate(e=>e===document.activeElement));assert.equal(await p.inputValue('#p12-query'),'PN-9999');await shot('filter-focus');
 });
 await check('Long query with all filters has no clipped art; scrolling reaches CTA; removal and browser Back work',async()=>{
  await query('Từ khóa có độ dài lớn '.repeat(130));await p.click('[data-p12-type=inbound]');await act('filter').click();await p.check('[name=status][value=posted]');await p.locator('.p08-picker [type=submit]').click();await p.waitForTimeout(100);
  const m=await p.locator('.p12-scroll').evaluate(e=>({overflow:e.scrollWidth>e.clientWidth,artTop:e.querySelector('.p16-art').getBoundingClientRect().top,top:e.getBoundingClientRect().top}));assert.ok(!m.overflow);assert.ok(m.artTop>=m.top);await p.locator('.p12-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await shot('all-filters-bottom');await p.locator('.p16-actions [data-p12=clear]').click();assert.equal(await p.locator('.p12-record').count(),24);
  await p.locator('.p12-scroll').evaluate(e=>e.scrollTop=500);await p.locator('[data-p12-doc]').nth(8).dispatchEvent('click');await act('back').click();await p.waitForSelector('#p12-query');assert.equal(await p.locator('.p12-scroll').evaluate(e=>e.scrollTop),500);
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'audit-results.json'),JSON.stringify({checks,metrics,errors},null,2));console.log(checks.length+' groups PASS');
}catch(e){fs.writeFileSync(path.join(out,'audit-failure.json'),JSON.stringify({message:e.message,checks,metrics,errors},null,2));await shot('failure').catch(()=>{});throw e;}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
