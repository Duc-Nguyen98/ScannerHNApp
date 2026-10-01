const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/stability-2026-09-28/evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1264,height:712}});
 const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 async function check(name,fn){try{await fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',message:e.message});}}
 async function home(){if(await page.locator('[data-tab=home]').isVisible())await page.locator('[data-tab=home]').click();else await page.evaluate(()=>{location.hash='#home';});await page.locator('#hn-home').waitFor({state:'visible'});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('.hn-task').first().waitFor();
 for(const [route,panel] of [['inbound','P04'],['outbound','P05'],['lookup','P06'],['nfc','P07'],['warranty','P09']]){
  await page.evaluate(route=>{location.hash='#p02/'+route;},route);await page.locator(`[data-panel="${panel}.S01"]`).waitFor();await home();
  await check(route+' → Home resets title',async()=>assert.match(await page.title(),/^P02 ·/));
 }
 await page.click('.hn-task[data-route=nfc]');await page.locator('.p07-app').waitFor();await page.click('[data-tab=documents]');
 await check('Pending document page has its own title',async()=>assert.match(await page.title(),/^P12 ·/));await home();
 await page.click('[data-tab=history]');await page.frameLocator('iframe').getByRole('heading',{name:'Lịch sử thao tác',exact:true}).waitFor();
 await check('History hub title matches route',async()=>assert.match(await page.title(),/^P22 ·/));
 await home();let attached=0;const onAttach=()=>attached++;page.on('frameattached',onAttach);
 await page.goBack();await page.frameLocator('iframe').getByRole('heading',{name:'Lịch sử thao tác',exact:true}).waitFor();page.off('frameattached',onAttach);
 await check('Native Back mounts history iframe once',async()=>assert.equal(attached,1));
 await page.evaluate(()=>{window.retiredHistoryFrame=document.querySelector('#hn-destination iframe');});await home();
 await check('Late load from detached history frame cannot redirect/logout/repaint',async()=>{
  await page.evaluate(()=>window.retiredHistoryFrame.dispatchEvent(new Event('load')));
  assert.equal(await page.locator('#hn-home').isVisible(),true);assert.equal(new URL(page.url()).hash,'#home');
 });
 for(let i=0;i<3;i++){
  await page.click('.hn-name');await page.locator('#hn-name-dialog[open]').waitFor();await page.keyboard.press('Escape');
  await check('Name close restores usable Home '+i,async()=>{assert.equal(await page.locator('.hn-name').evaluate(n=>n===document.activeElement),true);assert.equal(await page.locator('#home-app [inert]').count(),0);});
 }
 await page.screenshot({path:path.join(out,(process.env.AUDIT_BEFORE?'before':'after')+'-home.png')});
 await page.getByText('Kịch bản kiểm tra P02',{exact:true}).click();await page.click('#hn-logout');await page.locator('#username').waitFor();await page.goBack();await page.locator('#username').waitFor();
 await check('Logout/Back leaves no active modal or protected controls',async()=>{assert.equal(await page.locator('.hn-screen').count(),0);assert.equal(await page.locator('[inert]').count(),0);});
 await check('A failed module load offers explicit retry and recovers the login form',async()=>{
  const retry=await browser.newPage();
  try{
   await retry.route('**/auth-session/app.mjs*',route=>route.abort());
   await retry.goto('http://127.0.0.1:8766/flows/auth-session/');
   await retry.locator('#preview-startup-status').waitFor({state:'visible'});
   await retry.unroute('**/auth-session/app.mjs*');
   await retry.locator('#preview-startup-status button').click();
   await retry.locator('#username').waitFor();
   assert.equal(await retry.locator('#preview-startup-status').isVisible(),false);
  }finally{await retry.close();}
 });
 await check('No uncaught browser exceptions',async()=>assert.deepEqual(errors,[]));
 fs.writeFileSync(path.join(out,process.env.AUDIT_BEFORE?'before-audit.json':'after-audit.json'),JSON.stringify({checks,errors},null,2));
 console.log(JSON.stringify(checks,null,2));if(!process.env.AUDIT_BEFORE)assert.equal(checks.filter(c=>c.status==='FAIL').length,0);
 }finally{await browser.close();}
})();
