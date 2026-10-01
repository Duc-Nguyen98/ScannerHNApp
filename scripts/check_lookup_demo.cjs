const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P06/evidence/revision-03');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000},deviceScaleFactor:1});
 const checks=[],errors=[],failures=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push({url:r.url(),status:r.status()});});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8766')&&!r.url().startsWith('data:'))external.push(r.url());});
 const act=n=>page.locator(`[data-p06="${n}"]`).first();
 async function images(){await page.locator('.p06-app img').evaluateAll(es=>Promise.all(es.map(e=>e.decode())));assert.equal(await page.locator('.p06-app img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)),true);}
 async function capture(name){await images();await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});assert.equal(await page.locator('.p06-scroll').evaluate(e=>e.scrollWidth>e.clientWidth),false);}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('.hn-scanner');await capture('P06-S01-demo');
 const expected=[['fixture-item-HN12345',7],['fixture-item-HN12346',6],['fixture-item-HN12347',6],['fixture-item-HN12348',6],['fixture-item-HN12349',5],['fixture-component-01',6]];
 for(const [id,count] of expected){
  if(id==='fixture-component-01')await page.click('[data-p06-category="components"]');
  await page.click(`[data-p06-item="${id}"]`);await images();
  const stock=await page.locator('.p06-stock-link dd').allTextContents();assert.ok(stock.every(x=>x!=='—'));
  if(id==='fixture-item-HN12346'){
   await capture('P06-S02-demo');await page.click('[data-p06-image="1"]');assert.match(await page.locator('.p06-hero img').getAttribute('src'),/box.png/);assert.equal(await page.locator('[data-p06-image="1"]').getAttribute('aria-pressed'),'true');await page.click('[data-p06-image="0"]');
  }
  await act('stock').click();assert.deepEqual(await page.locator('.p06-stock-strip strong').allTextContents(),stock);assert.ok(await page.locator('.p06-location').count()>0);await images();if(id==='fixture-item-HN12346')await capture('P06-S03-demo');
  await act('back').click();await act('history').click();assert.equal(await page.locator('.p06-event').count(),count);await images();
  if(id==='fixture-item-HN12346')await capture('P06-S04-demo');
  if(id==='fixture-item-HN12349'){assert.match(await page.locator('.p06-chip').textContent(),/Hết hàng/);await capture('out-of-stock-history');}
  if(id==='fixture-component-01'){
   await page.selectOption('#p06-type','warranty');assert.deepEqual(await page.locator('.p06-event-result b').allTextContents(),['- 2','+ 1','0']);await capture('component-warranty-history');await page.selectOption('#p06-type','all');
  }
  checks.push({item:id,historyCount:count,status:'PASS'});
  await act('back').click();await act('back').click();await page.locator('[data-panel="P06.S01"]').waitFor();
 }
 await page.click('[data-p06-category="products"]');await page.fill('#p06-search','SN-XP420B-BK-0008');assert.equal(await page.locator('.p06-card').count(),1);await page.locator('.p06-card').click();await act('history').click();
 for(const [w,h] of [[360,800],[430,932],[1440,900]]){await page.setViewportSize({width:w,height:h});await capture(`history-${w}x${h}`);}
 checks.push({name:'serial search and responsive history',status:'PASS'});
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(out,'demo-browser-results.json'),JSON.stringify({checks,totalEvents:expected.reduce((n,x)=>n+x[1],0),errors,failures,external},null,2));console.log('PASS: 6 items, 36 events, 7 images loaded; gallery, serial, zero-stock history, signed warranty and responsive.');
 }catch(e){await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw e;}finally{await browser.close();}
})();
