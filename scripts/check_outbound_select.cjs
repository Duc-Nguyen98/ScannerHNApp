const {mockGeography,address:prepareAddress,choose}=require('./outbound_geography_helpers.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.OUTBOUND_EVIDENCE_DIR || 'handoff/P05/evidence/revision-06');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[],layouts=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p05="${n}"]`).first(),select=n=>page.locator(`[data-p05-select="${n}"]`),option=id=>page.locator(`[role="listbox"]:visible [data-p05-option="${id}"]`);
 const snap=async()=>JSON.parse(await page.locator('[data-p05-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function capture(name){await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try {
  await mockGeography(page);await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('.hn-task[data-route="outbound"]').click();await prepareAddress(page);
  await check('all S01 inputs/textarea: no native inner outline, editable values and outer error state retained',async()=>{
   for(const selector of ['[aria-label="Kho xuất"]','[data-p05-field="phone"]','[data-p05-field="address"]','[data-p05-field="planned"]','[data-p05-note]']){
    const field=page.locator(selector);await field.click();const style=await field.evaluate(e=>({outline:getComputedStyle(e).outlineStyle,shadow:getComputedStyle(e).boxShadow}));assert.deepEqual(style,{outline:'none',shadow:'none'});
   }
   await page.fill('[data-p05-field="planned"]','100');await act('next').click();assert.equal(await page.locator('[data-p05-field="planned"]').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('[data-p05-field="planned"]').evaluate(e=>getComputedStyle(e.parentElement).borderTopColor),'rgb(186, 20, 39)');await capture('01-input-error');await page.fill('[data-p05-field="planned"]','1');
  });
  await check('shared source/recipient/group dialogs: pending radio does not commit until Apply; cancel keeps prior selection',async()=>{
   for(const [name,id] of [['source','board-0005'],['recipient','an-binh'],['group','zd']]){
    const before=await select(name).getAttribute('data-value');await select(name).click();assert.equal(await page.locator('.app-modal-host').count(),1);assert.equal(await select(name).getAttribute('aria-expanded'),'true');await page.locator(`.app-modal-host input[value="${id}"]`).check();assert.equal(await select(name).getAttribute('data-value'),before);await page.keyboard.press('Escape');assert.equal(await select(name).evaluate(e=>document.activeElement===e),true);assert.equal(await select(name).getAttribute('data-value'),before);
   }
   await choose(page,'recipient','an-binh');assert.equal(await select('recipient').getAttribute('data-value'),'an-binh');assert.equal(await page.locator('[data-p05-field="phone"]').inputValue(),'0912 345 678');await prepareAddress(page);
  });
  await check('province/district keyboard movement does not commit until Enter; Esc/Tab close',async()=>{
   await select('district').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('End');assert.equal((await snap()).document.districtId,'760');await page.keyboard.press('Escape');assert.equal(await select('district').getAttribute('data-value'),'760');await select('district').press('ArrowDown');await page.keyboard.press('End');await page.keyboard.press('Enter');assert.equal(await select('district').getAttribute('data-value'),'761');await select('province').click();await page.keyboard.press('Tab');assert.equal(await page.locator('.p05-select-popup:visible').count(),0);
  });
  await check('source confirmation remains separate from picker; applying updates metadata and resets dependent location',async()=>{
   await choose(page,'source','board-0005');assert.equal(await select('source').getAttribute('data-value'),'new');await act('cancel-source').click();await choose(page,'source','board-0005');await act('apply-source').click();assert.equal(await select('source').getAttribute('data-value'),'board-0005');assert.equal(await page.locator('[data-p05-field="planned"]').inputValue(),'10');assert.equal(await page.locator('[data-p05-field="address"]').isDisabled(),true);await prepareAddress(page);
  });
  await check('all selectors remain within scaled app at6 sizes; no horizontal clipping or footer movement',async()=>{
   for(const viewport of [{width:340,height:420},{width:390,height:844},{width:494,height:1000},{width:768,height:1024},{width:1440,height:1000},{width:1869,height:940}]){
    await page.setViewportSize(viewport);
    for(const name of ['source','recipient','group','province','district']){
     await select(name).scrollIntoViewIfNeeded();const before=await page.locator('.p05-footer').boundingBox();await select(name).click();const modal=['source','recipient','group'].includes(name);const m=await page.locator(modal?'.app-modal-host dialog':'.p05-select-popup:not([hidden])').evaluate(el=>{const shell=el.closest('.hn-screen'),r=el.getBoundingClientRect(),s=shell.getBoundingClientRect();return{w:shell.offsetWidth,h:shell.offsetHeight,inside:r.left>=s.left-1&&r.right<=s.right+1&&r.top>=s.top-1&&r.bottom<=s.bottom+1,overflow:el.scrollWidth>el.clientWidth};});assert.deepEqual(m,{w:494,h:950,inside:true,overflow:false});assert.deepEqual(await page.locator('.p05-footer').boundingBox(),before);layouts.push({name,viewport,...m});if(viewport.width===390)await capture('selector-'+name+'-390');await page.keyboard.press('Escape');
    }
   }
  });
  await check('scan locks source/group; user inputs and geography validation preserved',async()=>{
   await page.setViewportSize({width:494,height:1000});await act('next').click();await act('manual').click();await page.fill('#p05-code','HN12345');await page.locator('#p05-code').press('Enter');await act('back').click();assert.equal(await select('source').isDisabled(),true);assert.equal(await select('group').isDisabled(),true);assert.equal((await snap()).accepted.length,1);
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'select-results.json'),JSON.stringify({checks,layouts,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,error:e.stack,errors},null,2));throw e;}finally{await browser.close();}
})();
