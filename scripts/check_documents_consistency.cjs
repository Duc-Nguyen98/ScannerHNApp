const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out='handoff/P12/evidence/revision-07';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),p=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,timezoneId:'Asia/Ho_Chi_Minh'}),checks=[],errors=[],measurements=[];p.on('pageerror',e=>errors.push(e.message));await p.clock.setFixedTime(new Date('2026-09-29T04:00:00Z'));
const a=n=>p.locator('[data-p12="'+n+'"]').first(),tab=t=>p.locator('[data-p12-tab="'+t+'"]'),scroll=()=>p.locator('.p12-scroll');
async function route(hash){await p.evaluate(h=>location.hash=h,hash);await p.waitForTimeout(120);}
async function check(name,f){console.log('RUN '+name);await f();checks.push({name,status:'PASS'});console.log('PASS '+name);}
async function closed(){await p.waitForFunction(()=>!history.state?.hnDocumentsDialog);await p.waitForSelector('.app-modal-host',{state:'detached'});}
async function shot(name){await p.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
async function style(selector){return p.locator(selector).first().evaluate(e=>{const s=getComputedStyle(e);return Object.fromEntries(['height','paddingTop','paddingBottom','gap','borderRadius','backgroundColor','backgroundImage','color','fontSize','lineHeight','fontWeight','boxShadow'].map(k=>[k,s[k]]));});}
try{
 p.setDefaultTimeout(12000);console.log('RUN login');
 await p.goto('http://127.0.0.1:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForFunction(()=>location.hash==='#home');await p.locator('[data-tab=documents]').waitFor();
 await check('History and Documents use identical rendered search/category/date/sort controls',async()=>{
  await route('#p02/history-list');await p.locator('.p08-app').waitFor();
  const selectors=['.p08-search','.p08-search label','.p08-search input','.p08-search>button','.p08-tabs button[aria-selected=true]','.p08-tabs button[aria-selected=false]','.p08-filter-summary button','.p08-filter-summary button span','.p08-results-toolbar [aria-label^="Sắp xếp"]'];const reference={};for(const s of selectors)reference[s]=await style(s);
  await route('#p02/documents');for(const s of selectors){const actual=await style(s);assert.deepEqual(actual,reference[s],s);measurements.push({selector:s,actual,reference:reference[s]});}
  assert.equal(await p.locator('[data-p12-type]').count(),4);assert.equal(await p.locator('[data-p12=scan]').count(),1);assert.equal(await p.locator('.p12-sort,.p12-filters,select[data-p12]').count(),0);
 });
 await check('One picker combines date/status; invalid range, Reset/Cancel/Apply/Clear preserve correct scopes',async()=>{
  await a('filter').click();await p.fill('#pick-from','28/09/2026');await p.fill('#pick-to','20/09/2026');assert.equal(await p.locator('.p08-picker [type=submit]').isDisabled(),true);await p.click('[data-reset]');assert.equal(await p.inputValue('#pick-from'),'29/09/2026');await p.click('[data-cancel]');await closed();assert.equal(await p.locator('.p12-record').count(),24);
  await a('filter').click();await p.fill('#pick-from','20/09/2026');await p.fill('#pick-to','27/09/2026');await p.check('[name=status][value=posted]');await p.locator('.p08-picker [type=submit]').click();await closed();assert.equal(await p.locator('.p12-record').count(),6);assert.match(await p.locator('.p08-active-status').textContent(),/Đã ghi sổ/);await shot('filter-applied');
  await p.click('[data-p12-type=outbound]');await p.fill('#p12-query','An Bình');assert.equal(await p.locator('.p12-record').count(),2);await a('clear').click();assert.equal(await p.locator('.p12-record').count(),24);assert.equal(await p.inputValue('#p12-query'),'');assert.equal(await p.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
 });
 await check('Sorting source/oldest/newest and keyboard category switching are functional',async()=>{
  for(const [sort,number]of [['source','PN-0005'],['asc','PX-0003'],['desc','PX-0011']]){await a('sort').click();await p.check('[name=sort][value='+sort+']');await p.locator('.p08-picker [type=submit]').click();await closed();assert.equal(await p.locator('.p12-record-copy strong').first().textContent(),number);}
  await p.locator('[data-p12-type=all]').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('[data-p12-type=inbound]').getAttribute('aria-selected'),'true');assert.equal(await p.locator('.p12-record').count(),8);await p.keyboard.press('Home');assert.equal(await p.locator('.p12-record').count(),24);
 });
 await check('One header Back after repeated tabs restores list filters, scroll and original record focus',async()=>{
  await p.click('[data-p12-type=outbound]');await p.fill('#p12-query','PX');await scroll().evaluate(e=>e.scrollTop=180);const y=await scroll().evaluate(e=>e.scrollTop);await p.locator('.p12-record').last().dispatchEvent('click');const length=await p.evaluate(()=>history.length);
  for(let i=0;i<3;i++)for(const t of ['products','files','events','info'])await tab(t).click();assert.equal(await p.evaluate(()=>history.length),length);await a('back').dblclick();await p.locator('#p12-query').waitFor();assert.equal(await p.inputValue('#p12-query'),'PX');assert.equal(await p.locator('[data-p12-type=outbound]').getAttribute('aria-selected'),'true');assert.equal(await scroll().evaluate(e=>e.scrollTop),y);assert.equal(await p.evaluate(()=>document.activeElement.hasAttribute('data-p12-doc')),true);
 });
 await check('Browser Back leaves detail in one step; Forward restores latest tab and product query',async()=>{
  await a('clear').click();await p.click('[data-p12-doc="p12-stock-PX-0011"]');await tab('products').click();await p.fill('#p12-product-query','ZD421');await tab('files').click();await tab('events').click();await p.goBack();await p.locator('#p12-query').waitFor();await p.goForward();await tab('events').waitFor();assert.equal(await tab('events').getAttribute('aria-selected'),'true');await tab('products').click();assert.equal(await p.inputValue('#p12-product-query'),'ZD421');
 });
 await check('Direct/legacy deep link header Back returns to list rather than another tab',async()=>{
  await route('#p02/documents?panel=3&doc=p12-stock-PN-0010');await p.evaluate(()=>history.replaceState({p12:true},'',location.hash));await tab('files').click();await tab('events').click();await a('back').click();await p.locator('#p12-query').waitFor();assert.equal(await p.locator('.p12-app').getAttribute('data-panel'),'P12.S01');
 });
 await check('KPI caller retains waiting scope and Home remains separate from ordinary list state',async()=>{
  await p.fill('#p12-query','PX-0004');await p.click('[data-tab=home]');await p.click('[data-home-kpi=waiting]');await p.locator('#p12-query').waitFor();assert.equal(await p.locator('.p12-record').count(),5);await p.fill('#p12-query','PN-0005');await p.locator('.p12-record').click();await tab('events').click();await tab('files').click();await a('back').click();await p.locator('#p12-query').waitFor();assert.equal(await p.inputValue('#p12-query'),'PN-0005');assert.match(await p.locator('.p08-active-status').textContent(),/Chờ xử lý trên Web/);await p.click('[data-tab=home]');await p.click('[data-tab=documents]');assert.equal(await p.inputValue('#p12-query'),'PX-0004');await a('clear').click();
 });
 await check('PDF dialog browser Back closes only overlay; following header Back leaves document',async()=>{
  await p.click('[data-p12-doc="p12-stock-PX-0011"]');await tab('files').click();await p.locator('[data-p12-file]').first().click();await p.locator('.p12-document-preview').waitFor();await p.goBack();await closed();assert.equal(await tab('files').getAttribute('aria-selected'),'true');await a('back').click();await p.locator('#p12-query').waitFor();
 });
 await check('Timeline waiting/posted/ready/returned labels correspond to actual lifecycle events',async()=>{
  for(const [id,tone,copy]of [['fixture-inbound-0005','warning','Chờ xử lý trên Web'],['p12-stock-PX-0011','success','Đã hoàn tất · Đã ghi sổ'],['p12-warranty-BH-005','warning','Chờ bàn giao'],['b12-warranty-002','success','Đã hoàn tất · Đã trả khách']]){
   await route('#p02/documents?panel=2&doc='+id+'&tab=events');assert.equal(await p.locator('.p12-progress').getAttribute('data-tone'),tone);assert.equal(await p.locator('.p12-progress h3').textContent(),copy);const highlighted=p.locator('.p12-timeline li[data-tone='+tone+']');assert.equal(await highlighted.count(),1);assert.notEqual(await highlighted.locator('strong').textContent(),'Đã xuất linh kiện');assert.equal(await p.locator('[aria-current=step]').count(),tone==='warning'?1:0);await highlighted.scrollIntoViewIfNeeded();const bottom=await highlighted.boundingBox(),nav=await p.locator('.hn-nav').boundingBox();assert.ok(bottom.y+bottom.height<=nav.y+1);await shot('timeline-'+id);
  }
 });
 await check('Unverified timeline never shows a success marker or fabricated event',async()=>{
  await p.evaluate(async()=>{const {DOCUMENTS}=await import('/flows/documents/document-model.mjs');const doc=DOCUMENTS.find(d=>d.number==='PX-0011');window.savedEvents=doc.events;doc.events=doc.events.slice(0,-1);});await route('#p02/documents?panel=2&doc=p12-stock-PX-0011&tab=events');assert.equal(await p.locator('.p12-timeline li').count(),3);assert.equal(await p.locator('.p12-progress h3').textContent(),'Cần đối chiếu tiến trình');assert.equal(await p.locator('.p12-timeline [data-tone=success]').count(),0);await shot('unverified-progress');await p.evaluate(async()=>{const {DOCUMENTS}=await import('/flows/documents/document-model.mjs');DOCUMENTS.find(d=>d.number==='PX-0011').events=window.savedEvents;});
 });
 await check('Four detail tabs keep shared palette, single line,48px height and fixed dock across six viewports',async()=>{
  for(const [width,height]of [[494,950],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){await p.setViewportSize({width,height});await route('#p02/documents?panel=2&doc=p12-stock-PX-0011');let dock=null,columns=null;
   for(const t of ['info','products','files','events']){await tab(t).click();const m=await p.evaluate(()=>{const tabs=document.querySelector('.p12-tabs'),scroll=document.querySelector('.p12-scroll'),rect=tabs.getBoundingClientRect();return {height:tabs.offsetHeight,tabHeights:[...tabs.children].map(e=>e.offsetHeight),lineHeights:[...tabs.children].map(e=>e.firstElementChild.offsetHeight),dock:[rect.x,rect.y,rect.width,rect.height],columns:[...tabs.children].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.width]}),overflow:scroll.scrollWidth>scroll.clientWidth,shell:[document.querySelector('.hn-screen').offsetWidth,document.querySelector('.hn-screen').offsetHeight]};});assert.ok(m.height<=49);assert.ok(m.lineHeights.every(n=>n<26));assert.equal(m.overflow,false);assert.deepEqual(m.shell,[494,950]);if(dock)assert.deepEqual(m.dock,dock);else dock=m.dock;if(columns)assert.deepEqual(m.columns,columns);else columns=m.columns;measurements.push({viewport:[width,height],tab:t,...m});}
  }await p.setViewportSize({width:494,height:950});
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'consistency-results.json'),JSON.stringify({checks,measurements,errors,visualAcceptance:'NOT_GRANTED'},null,2));console.log(checks.length+' groups PASS');
}catch(e){await shot('consistency-failure').catch(()=>{});fs.writeFileSync(path.join(out,'consistency-failure.json'),JSON.stringify({message:e.message,checks,measurements,errors},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
