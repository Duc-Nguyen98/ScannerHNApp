const auditOrigin=process.env.PREVIEW_ORIGIN||'http://127.0.0.1:8766';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const before=process.argv.includes('--before'),out=path.resolve(process.env.NFC_ALIGNMENT_EVIDENCE_DIR||('handoff/P07/evidence/revision-05/'+(before?'before':'after')));fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1869,height:940},deviceScaleFactor:1});const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p07="${n}"]`).first();
 async function measure(name){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const m=await page.evaluate(()=>{
  const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
  const app=document.querySelector('.p07-app'),scroll=app.querySelector('.p07-scroll');
  const outer=[...scroll.querySelectorAll(':scope>.p07-section,:scope>.p07-summary,:scope>.p07-entry,:scope>.p07-search-row,:scope>.p07-tabs,:scope>.p07-list')].map(rect);
  outer.push(...[...app.querySelectorAll('.p07-footer>button,.p07-secondary-actions')].map(rect));
  const sections=[...app.querySelectorAll('.p07-section')].map(s=>{
   const r=rect(s),inner=[...s.querySelectorAll(':scope>.p07-product,:scope>.p07-warehouse,:scope>.p07-tag-hero,:scope>.p07-read-details')].map(e=>{const i=rect(e);return {left:i.left-r.left,right:r.right-i.right};});
   const title=s.querySelector('h2'),label=s.querySelector('dt');return {inner,labelDelta:label?rect(label).left-rect(title).left-(parseFloat(getComputedStyle(title).paddingLeft)+(s.querySelector('.p07-read-details')?9:0))*(app.getBoundingClientRect().width/app.offsetWidth):null};
  });
  const tables=[...app.querySelectorAll('dl')].map(dl=>[...dl.querySelectorAll('dd')].map(rect));
  const status=app.querySelector('.p07-read-state'),value=status?.parentElement;
  const dots=status?rect(status.querySelector('i')):null;const statusText=status?.querySelector('span')||null;const range=document.createRange();if(statusText)range.selectNodeContents(statusText);
  const nodes=[...app.querySelectorAll('small,strong,dd,dt')].filter(e=>getComputedStyle(e).display!=='inline');
  const trailing=[...app.querySelectorAll('[data-panel="P07.S02"] .p07-product>.p07-icon,[data-panel="P07.S02"] .p07-warehouse>.p07-icon:last-child,.p07-read-details dd')].map(e=>rect(e).right);
  const phone=app.querySelector('.p07-phone');const centerDelta=phone?(rect(phone).left+rect(phone).right-rect(app).left-rect(app).right)/2:null;
  return {trailing,centerDelta,viewport:[innerWidth,innerHeight],outer,sections,tables,statusOffset:statusText?range.getBoundingClientRect().right-rect(value).right:null,overflow:scroll.scrollWidth>scroll.clientWidth,textOverflow:nodes.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.slice(0,45)),app:rect(app),scale:app.getBoundingClientRect().width/app.offsetWidth};
 });results.push({name,...m});
 if(!before){
  if(m.trailing.length>1)assert.ok(Math.max(...m.trailing)-Math.min(...m.trailing)<1,name+' shared trailing edge');
  if(m.centerDelta!==null)assert.ok(Math.abs(m.centerDelta)<1,name+' centered phone');
  assert.equal(m.overflow,false,name);assert.deepEqual(m.textOverflow,[],name);
  for(const edge of ['left','right'])if(m.outer.length>1)assert.ok(Math.max(...m.outer.map(r=>r[edge]))-Math.min(...m.outer.map(r=>r[edge]))<1,name+' outer '+edge);
  for(const s of m.sections){for(const i of s.inner)assert.ok(Math.abs(i.left-i.right)<1,name+' inner balance');if(s.labelDelta!==null)assert.ok(Math.abs(s.labelDelta)<1,name+' heading/label');}
  const insets=m.sections.flatMap(s=>s.inner.map(i=>i.left));if(insets.length>1)assert.ok(Math.max(...insets)-Math.min(...insets)<1,name+' matching inner insets');
  for(const table of m.tables)if(table.length>1)assert.ok(Math.max(...table.map(r=>r.left))-Math.min(...table.map(r=>r.left))<1,name+' value columns');
  if(m.statusOffset!==null)assert.ok(Math.abs(m.statusOffset)<1,name+' visible status ends at shared trailing edge');
 }
 await page.evaluate(()=>scrollTo(0,0));await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 async function matrix(name){for(const [w,h]of before?[[1869,940]]:[[1869,940],[1495,752],[685,872],[494,1000],[360,800],[340,420]]){await page.setViewportSize({width:w,height:h});await measure(name+'-'+w+'x'+h);}await page.setViewportSize({width:494,height:1000});}
 try{
 await page.goto(auditOrigin+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-route="nfc"]');await matrix('S01');
 await act('begin').click();await matrix('S02-unread');await page.click('[data-p07-demo-read]');await page.waitForFunction(()=>!JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).busy);await matrix('S02-read');
 await act('next').click();await matrix('S03');await act('confirm').click();await page.locator('[data-panel="P07.S04"]').waitFor();await matrix('S04');
 await act('detail').click();await page.locator('.p07-dialog[open]').waitFor();await measure('detail');await page.keyboard.press('Escape');await page.locator('.p07-dialog[open]').waitFor({state:'detached'});
 if(!before){await act('new-link').click();await page.click('[data-p07-demo-read]');await page.waitForFunction(()=>!JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).busy);
 await page.locator('.p07-section').last().locator('dd').first().evaluate(e=>e.textContent='NFC-'+('LONG1234'.repeat(12)));await page.locator('.p07-read-state>span').evaluate(e=>e.append(' — trạng thái dài cần xuống dòng và vẫn giữ đúng cột'));await measure('S02-long-values');
 await page.locator('.p07-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await measure('S02-long-end');}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify({results,errors},null,2));console.log(`${results.length} captures ${before?'BEFORE':'PASS'}`);
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,results,errors},null,2));throw e;}finally{await browser.close();}
})();
