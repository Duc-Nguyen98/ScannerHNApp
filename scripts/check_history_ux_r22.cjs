const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.HISTORY_EVIDENCE_DIR||'handoff/P08/evidence/revision-22/checks');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[],memory={};page.on('pageerror',e=>errors.push(e.stack));
const scenes=process.env.HISTORY_AUDIT_SCENES?process.env.HISTORY_AUDIT_SCENES.split(','):['history-general','history-daily','documents','nfc','warranty','sessions'],act=n=>page.locator(`[data-p08="${n}"]`).first(),snapshot=async()=>JSON.parse(await page.locator('[data-p08-snapshot]').textContent());
const fields=()=>page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value));
const settled=()=>page.waitForFunction(()=>!history.state?.hnP08Picker&&!document.querySelector('.p08-picker'));
const capture=async name=>{await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});};
async function hub(scene){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator(`[data-action="${scene}"]`).click();await page.locator('#p08-search').waitFor();}
async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
try{
 await page.clock.setFixedTime(new Date('2026-09-29T05:00:00Z'));await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 for(const scene of scenes){
  await check(scene+': quick ranges draft-only; Cancel/Apply, indicator and focus',async()=>{
   await hub(scene);const initial=await snapshot();await act('filter').click();assert.equal(await page.locator('.p08-picker h2').evaluate(e=>e===document.activeElement),true);
   for(const [n,dates]of [[1,['29/09/2026','29/09/2026']],[7,['23/09/2026','29/09/2026']],[30,['31/08/2026','29/09/2026']],[90,['02/07/2026','29/09/2026']]]){
    await page.click(`[data-quick-range="${n}"]`);assert.deepEqual(await fields(),dates);assert.deepEqual(await snapshot(),initial);assert.equal(await page.locator(`[data-quick-range="${n}"]`).getAttribute('aria-pressed'),'true');
   }
   await page.getByRole('button',{name:'Hủy',exact:true}).click();await settled();assert.deepEqual(await snapshot(),initial);assert.equal(await page.locator('.p08-filter-dot').count(),0);
   await act('filter').click();await page.click('[data-quick-range="30"]');await page.locator('[name=status]').nth(1).check();await page.locator('.p08-picker [type=submit]').click();await settled();await page.waitForFunction(()=>document.querySelector('.p08-filter-dot'));
   assert.match(await act('filter').getAttribute('aria-label'),/đang áp dụng/);await capture(scene+'-active');
   await act('clear').click();assert.equal(await page.locator('.p08-filter-dot').count(),0);
  });
 }
 await check('Today navigates only; quick-range uses click-time VN day; validation and native Back retain committed state',async()=>{
  await hub('history-general');const initial=await snapshot();await act('filter').click();await page.click('[data-quick-range="90"]');await page.fill('[name=to]','10/09/2026');const prior=await fields();await page.click('[data-calendar=from]');await page.click('[data-today]');assert.equal(await page.locator('[data-date="2026-09-29"]').isDisabled(),true);await page.click('[data-calendar-back]');assert.deepEqual(await fields(),prior);
  await page.fill('[name=from]','29/09/2026');assert.equal(await page.locator('.p08-picker [type=submit]').isDisabled(),true);await page.click('[data-quick-range="7"]');assert.equal(await page.locator('.p08-picker [type=submit]').isEnabled(),true);
  await page.clock.setFixedTime(new Date('2026-09-29T17:01:00Z'));await page.click('[data-quick-range="1"]');assert.deepEqual(await fields(),['30/09/2026','30/09/2026']);await page.goBack();await settled();assert.deepEqual(await snapshot(),initial);await page.clock.setFixedTime(new Date('2026-09-29T05:00:00Z'));
 });
 await check(scenes.length+' independent in-session contexts retain query/date/sort/loaded rows/scroll when reopened from hub',async()=>{
  for(const scene of scenes){await hub(scene);await page.fill('#p08-search',scene==='warranty'?'BH':'Minh');await act('filter').click();await page.click('[data-quick-range="30"]');await page.locator('.p08-picker [type=submit]').click();await settled();
   if(scene!=='history-daily'){await act('sort').click();await page.check('[name=sort][value=desc]');await page.locator('.p08-picker [type=submit]').click();await settled();}
   await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=50);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));memory[scene]={snapshot:await snapshot(),top:await page.locator('.p08-scroll').evaluate(e=>e.scrollTop)};
  }
  for(const scene of scenes){await hub(scene);const s=await snapshot();for(const k of ['filters','dayFilters','limit'])assert.deepEqual(s[k],memory[scene].snapshot[k],scene+' '+k);assert.ok(Math.abs(await page.locator('.p08-scroll').evaluate(e=>e.scrollTop)-memory[scene].top)<=1,scene+' scroll');}
 });
 await check('Daily drilldown does not overwrite the separately remembered general-history context',async()=>{
  await hub('history-general');const original=await snapshot();await hub('history-daily');await page.click('[data-p08-group=inbound]');assert.equal((await snapshot()).filters.type,'inbound');await hub('history-general');assert.deepEqual((await snapshot()).filters,original.filters);
 });
 await check('P12 shared picker remains unchanged by opt-in history quick ranges',async()=>{
  await page.click('[data-tab=documents]');await page.locator('[data-p12=filter]').first().click();assert.equal(await page.locator('[data-quick-range]').count(),0);assert.equal(await page.locator('.p08-picker [type=submit]').count(),1);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.p08-picker')&&!history.state?.hnDocumentsDialog);
 });
 await check('Empty/no-match/error sources distinct; recovery retains operation and sort',async()=>{
  for(const scene of scenes){await hub(scene);if(await act('clear').count())await act('clear').click();if(scene==='documents')await page.click('[data-p08-type=inbound]');await page.fill('#p08-search','no-record-999');assert.match(await page.locator('.p08-state strong').textContent(),/Không có kết quả/);const before=await snapshot();await capture(scene+'-empty');await act('relax').click();const after=await snapshot();assert.equal(after.filters.scope,before.filters.scope);assert.equal(after.filters.type,before.filters.type);assert.equal(after.filters.sort,before.filters.sort);assert.equal(await page.inputValue('#p08-search'),'');
   await page.selectOption('[data-p08-scenario]','empty');assert.match(await page.locator('.p08-state strong').textContent(),/Chưa có hoạt động/);await act('retry').click();await page.selectOption('[data-p08-scenario]','error');assert.match(await page.locator('.p08-state strong').textContent(),/Không tải được/);await act('retry').click();
  }
 });
 await check('Six viewport dialogs: footer accessible at either scroll end, 44px targets, no horizontal overflow or autofocus input',async()=>{
  await hub('history-general');
  for(const [width,height]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await act('filter').click();await page.click('[data-quick-range="7"]');
   for(const end of [false,true]){await page.locator('.p08-picker .app-modal-body').evaluate((e,end)=>e.scrollTop=end?e.scrollHeight:0,end);const fit=await page.locator('.p08-picker').evaluate(e=>{const d=e.getBoundingClientRect(),s=e.closest('.hn-screen').getBoundingClientRect(),f=e.querySelector('footer').getBoundingClientRect();return d.top>=s.top-1&&d.bottom<=s.bottom+1&&f.bottom<=d.bottom+1&&e.scrollWidth<=e.clientWidth+1&&[...e.querySelectorAll('footer button,[data-quick-range]')].every(b=>b.offsetHeight>=44);});assert.equal(fit,true);}
   for(let i=0;i<14;i++)await page.keyboard.press('Tab');assert.equal(await page.locator('.p08-picker').evaluate(e=>e.contains(document.activeElement)),true);await capture('filter-'+width+'x'+height);await page.keyboard.press('Escape');await settled();
  }await page.setViewportSize({width:494,height:1000});
 });
 await check('Copy pending guarded; one result dialog, Back restores same detail and no inline feedback',async()=>{
  await hub('history-general');if(await act('clear').count())await act('clear').click();await page.locator('.p08-row').first().click();await page.evaluate(()=>{window.copyCalls=0;navigator.clipboard.writeText=()=>{window.copyCalls++;return new Promise(resolve=>window.releaseCopy=resolve);};});await act('copy').evaluate(e=>{e.click();e.click();});assert.equal(await page.evaluate(()=>window.copyCalls),1);assert.equal(await act('copy').isDisabled(),true);await page.evaluate(()=>window.releaseCopy());await page.locator('.hn-action-dialog[open]').waitFor();assert.equal(await page.locator('.app-modal-host').count(),1);await capture('copy-result');await page.goBack();await page.locator('.hn-action-dialog[open]').waitFor({state:'detached'});assert.equal(await page.locator('.p08-app').getAttribute('data-panel'),'P08.S02');assert.equal(await page.locator('.p08-feedback').count(),0);
 });
 await check('Logout clears the session cache; new login has default unfiltered history',async()=>{
  await page.click('[data-tab=profile]');await page.click('[data-p10=logout]');await page.locator('.hn-action-dialog[open] [data-action-dialog=confirm]').click();await page.locator('#username').waitFor();await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await hub('history-general');assert.equal(await page.inputValue('#p08-search'),'');assert.equal((await snapshot()).filters.from,'');assert.equal((await snapshot()).filters.sort,'source');
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({revision:'P08-r22',checks,errors},null,2));
}catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}})();
