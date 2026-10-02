// LOCK source: handoff/P03/REVISION_04.md + shared/UI_STANDARD.md HN-footer-locked-v1.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.HOME_FOOTER_EVIDENCE_DIR||'handoff/P02/evidence/revision-08-footer');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1});const checks=[],metrics=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const paint=()=>page.locator('.hn-nav').evaluate(nav=>{
  const keys=['backgroundColor','borderRadius','color','fontSize','lineHeight','minHeight','padding','width','height','boxShadow','borderTopColor','borderTopWidth'];
  const read=n=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(n)[k]]));
  return{nav:read(nav),selected:read(nav.querySelector('[aria-current=page]')),circle:read(nav.querySelector('.hn-scan-circle')),icon:read(nav.querySelector('.hn-scan-circle svg')),html:nav.innerHTML};
 });
 try{
  await page.goto((process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766')+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('[data-shift-start]').waitFor();
  const timestamp=await page.locator('[data-shift-start]').getAttribute('datetime');
  for(const [width,height] of [[494,950],[456,874],[360,800],[1264,712]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));
   const home=await paint();
   assert.equal(home.nav.backgroundColor,'rgba(255, 255, 255, 0.98)');assert.equal(home.nav.borderRadius,'23px 23px 0px 0px');assert.equal(home.nav.minHeight,'75px');assert.equal(home.nav.padding,'8px');
   assert.equal(home.selected.backgroundColor,'rgb(238, 249, 251)');assert.equal(home.selected.color,'rgb(0, 85, 119)');
   assert.equal(home.circle.width,'62px');assert.equal(home.circle.height,'62px');assert.equal(home.circle.backgroundColor,'rgb(0, 115, 153)');assert.equal(home.circle.borderTopColor,'rgb(255, 255, 255)');assert.equal(home.circle.borderTopWidth,'3px');assert.equal(home.icon.width,'31px');
   const geometry=await page.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
    return{nav:rect('.hn-nav'),screen:rect('.hn-screen'),scan:rect('.hn-scan-circle'),clock:rect('[data-shift-start]'),clockIcon:rect('.hn-kpi-clock .hn-icon'),lastKpi:rect('.hn-kpi-clock'),kpis:rect('.hn-kpis'),lastRow:rect('.hn-record:last-child'),scale:document.querySelector('.hn-screen').getBoundingClientRect().width/494,horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert.equal(geometry.horizontalOverflow,false);assert.ok(geometry.clock.right<geometry.clockIcon.x);assert.ok((geometry.lastKpi.right-geometry.clockIcon.right)/geometry.scale>=15);assert.ok(geometry.nav.bottom<=height+1);assert.ok(geometry.lastRow.bottom<=geometry.nav.y);assert.ok(geometry.scan.y<geometry.nav.y);
   await page.locator('.hn-intro h1').focus();
   await page.screenshot({path:path.join(out,`home-${width}.png`)});
   await page.click('[data-tab=lookup]');await page.locator('.p03-dialog').waitFor();
   const dialog=await paint();assert.deepEqual(dialog,home,'P03 must inherit the identical LOCKED Home footer');
   await page.screenshot({path:path.join(out,`p03-${width}.png`)});
   await page.keyboard.press('Escape');await page.locator('#hn-home').waitFor({state:'visible'});
   assert.equal(await page.locator('[data-shift-start]').getAttribute('datetime'),timestamp);
   metrics.push({viewport:[width,height],home,geometry});checks.push({name:`${width}×${height}: footer LOCK + P03 parity + KPI spacing + fixed shift`,status:'PASS'});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,metrics,errors},null,2));console.log('PASS: 4 viewports; locked footer, identical P03 styles, KPI gaps, immutable shift time.');
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,checks,metrics,errors},null,2));throw e;}finally{await browser.close();}
})();
