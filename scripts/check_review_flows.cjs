const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.FINAL_URL||'http://127.0.0.1:8766/review/';
const out=process.env.FLOW_REVIEW_EVIDENCE||'D:/ScannerHNApp_Archive_20261001/evidence/flow-review-local';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(),checks=[],errors=[],failed=[];try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}});page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
 await page.goto(base+'?view=review&panel=P04.S02&motion=auto');await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('Đã mở P04.S02'),null,{timeout:55000});
 const frame=()=>page.frames().find(f=>f.url().includes('/auth-session/'));
 const snapshot=()=>frame().locator('[data-p04-snapshot]').textContent().then(JSON.parse);
 const original=await snapshot();const originalWindow=await frame().evaluate(()=>{window.flowWindowToken=crypto.randomUUID();return flowWindowToken;});
 async function imageReady(board,type){await page.waitForFunction(({board,type})=>{const i=document.querySelector('#flow-image');return i.complete&&i.naturalWidth>500&&i.currentSrc.includes(board+'_'+type+'_Flow.png')&&!i.hidden;},{board,type});}
 await imageReady('P04','User');assert.equal(await page.inputValue('#flow-board'),'P04');checks.push('Default desktop comparison follows the active board');
 for(let n=0;n<=24;n++){
  const board='P'+String(n).padStart(2,'0');await page.selectOption('#flow-board',board);
  for(const type of ['User','Data']){await page.click(type==='User'?'#flow-user':'#flow-data');await imageReady(board,type);for(const extension of ['png','svg','mmd']){await page.selectOption('#flow-format',extension);const href=await page.locator('#flow-download').getAttribute('href');assert.ok(href.endsWith(board+'_'+type+'_Flow.'+extension));const response=await page.request.get(new URL(href,page.url()).href);assert.equal(response.status(),200,href);assert.ok((await response.body()).length>100);}}
 }
 checks.push('All 50 images and 150 PNG/SVG/Mermaid links load');
 assert.deepEqual((await snapshot()).document,original.document);assert.deepEqual((await snapshot()).accepted,original.accepted);assert.equal(await frame().evaluate(()=>flowWindowToken),originalWindow);checks.push('Changing diagrams does not reload iframe or change the draft');
 const old=await page.locator('#flow-image').evaluate(e=>e.getBoundingClientRect().width);await page.click('#flow-in');assert.ok(await page.locator('#flow-image').evaluate(e=>e.getBoundingClientRect().width)>old);await page.click('#flow-fit');await page.locator('#flow-user').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#flow-data').getAttribute('aria-selected'),'true');checks.push('Zoom, fit and keyboard tabs work');
 await page.check('#flow-follow');await imageReady('P04','Data');await frame().locator('[data-p04=next]').first().click();await frame().locator('[data-panel="P04.S03"]').waitFor();await page.click('#flow-close');assert.equal(await page.locator('#flow-pane').isVisible(),false);await page.click('#flow-toggle');await imageReady('P04','Data');assert.equal((await snapshot()).step,3);checks.push('Close/reopen preserves the current step and follows app state');
 for(const width of [360,390,430,1440]){
  await page.setViewportSize({width,height:900});await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  assert.ok(await page.locator('#flow-close').isVisible());await page.screenshot({path:path.join(out,width+'-flow.png')});await page.click('#flow-close');assert.equal(await frame().locator('.p04-app').isVisible(),true);assert.equal((await snapshot()).step,3);await page.screenshot({path:path.join(out,width+'-app.png')});await page.click('#flow-toggle');await imageReady('P04','Data');
 }
 checks.push('360/390/430/1440 layouts have no horizontal overflow; app survives mobile comparison');
 await page.selectOption('#flow-board','P00');await page.click('#flow-user');const url=page.url();assert.equal(new URL(url).searchParams.get('flowBoard'),'P00');assert.equal(new URL(url).searchParams.get('panel'),'P04.S03');await page.reload();await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('Đã mở P04.S03'),null,{timeout:55000});await imageReady('P00','User');assert.equal(await page.locator('#flow-follow').isChecked(),false);checks.push('Independent P00 diagram and live panel URL survive refresh');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS',base,checks,errors,failed},null,2));console.log({status:'PASS',checks:checks.length,images:50,links:150});
 }catch(e){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,error:e.stack,errors,failed},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
