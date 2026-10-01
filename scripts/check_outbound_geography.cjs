const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {mockGeography,choose,address,provinces,districts}=require('./outbound_geography_helpers.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.OUTBOUND_EVIDENCE_DIR || 'handoff/P05/evidence/revision-07');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[],layouts=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p05="${n}"]`).first(),sel=n=>page.locator(`[data-p05-select="${n}"]`),field=n=>page.locator(`[data-p05-field="${n}"]`);
 const snap=async()=>JSON.parse(await page.locator('[data-p05-snapshot]').textContent());
 const capture=async name=>page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});
 async function login(){await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('.hn-task[data-route="outbound"]').click();}
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function ready(name){await page.waitForFunction(n=>!document.querySelector(`[data-p05-select="${n}"]`).disabled,name);}
 try{
  let provinceFail=true,districtFail=true;const requests=[];
  await page.route('https://provinces.open-api.vn/api/v1/**',async route=>{const url=new URL(route.request().url());requests.push(url.href);const match=url.pathname.match(/p\/(\d+)/);if(match?districtFail:provinceFail)return route.fulfill({status:503,body:'unavailable'});await new Promise(r=>setTimeout(r,180));return route.fulfill({json:match?{code:Number(match[1]),districts:districts(Number(match[1]))}:provinces});});
  await login();
  await check('province failure locks downstream, explicit retry loads list; no detail data sent to API',async()=>{
   await act('retry-provinces').waitFor();assert.equal(await sel('province').isDisabled(),true);assert.equal(await sel('district').isDisabled(),true);assert.equal(await field('address').isDisabled(),true);provinceFail=false;await act('retry-provinces').click();await ready('province');assert.match(await page.locator('.p05-tools').textContent(),/trước 07\/2025/);assert.doesNotMatch(await page.locator('.p05-address-section').textContent(),/Địa chỉ đã lưu|Chọn lần lượt|Đổi tỉnh sẽ|trước 07\/2025/);
  });
  await check('province popup search matches accents; no-match state, then pick exact province',async()=>{
   await sel('province').click();const search=page.locator('.p05-select-popup:not([hidden]) input');await search.fill('khong co tinh nay');assert.equal(await page.locator('.p05-select-empty:visible').count(),1);await search.fill('ho chi minh');assert.equal(await page.locator('.p05-select-popup:not([hidden]) [role="option"]:visible').count(),1);await page.locator('.p05-select-popup:not([hidden]) [data-p05-option="79"]').click();assert.equal(await field('address').isDisabled(),true);await act('retry-districts').waitFor();assert.equal((await snap()).document.provinceId,'79');await capture('01-district-error');
  });
  await check('district retry unlocks only level2; chosen district unlocks detail and address preview',async()=>{
   districtFail=false;await act('retry-districts').click();await ready('district');assert.equal(await field('address').isDisabled(),true);await choose(page,'district','760');assert.equal(await field('address').isEnabled(),true);await field('address').fill('123 Lê Lợi');assert.match(await page.locator('[data-p05-address-preview]').textContent(),/123 Lê Lợi, Quận 1, Thành phố Hồ Chí Minh/);await capture('02-address-complete');
  });
  await check('all5 selects at6 sizes: popup same width, zero movement of form/footer, above/below and keyboard cancel',async()=>{
   for(const viewport of [{width:340,height:420},{width:390,height:844},{width:494,height:1000},{width:768,height:1024},{width:1440,height:1000},{width:1869,height:940}]){
    await page.setViewportSize(viewport);
    for(const name of ['source','recipient','province','district','group']){
     await sel(name).scrollIntoViewIfNeeded();const before=await page.locator('.p05-app').evaluate(app=>({height:app.querySelector('.p05-scroll').scrollHeight,top:app.querySelector('.p05-scroll').scrollTop,fields:[...app.querySelectorAll('.p05-content > *, .p05-address-section > *, .p05-footer')].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})}));
     await sel(name).click();const modal=['source','recipient','group'].includes(name);const m=await page.locator(modal?'.app-modal-host dialog':'.p05-select-popup:not([hidden])').evaluate(p=>{const shell=p.closest('.hn-screen'),app=shell.querySelector('.p05-app'),modal=p.tagName==='DIALOG',s=(modal?shell:app.querySelector('.p05-scroll')).getBoundingClientRect(),r=p.getBoundingClientRect(),t=app.querySelector('[aria-expanded="true"]').getBoundingClientRect();return{w:shell.offsetWidth,h:shell.offsetHeight,inside:r.top>=s.top-1&&r.bottom<=s.bottom+1&&r.left>=s.left-1&&r.right<=s.right+1,widthDiff:modal?0:Math.abs(t.width-r.width),side:modal?'shared-dialog':p.dataset.side};});
     const after=await page.locator('.p05-app').evaluate(app=>({height:app.querySelector('.p05-scroll').scrollHeight,top:app.querySelector('.p05-scroll').scrollTop,fields:[...app.querySelectorAll('.p05-content > *, .p05-address-section > *, .p05-footer')].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})}));
     assert.deepEqual(after,before,`${name} must not shift form`);assert.equal(m.w,494);assert.equal(m.h,950);assert.equal(m.inside,true);assert.ok(m.widthDiff<1);layouts.push({viewport,name,...m});if(viewport.width===390||viewport.width===494)await capture(`03-${name}-${viewport.width}`);await page.keyboard.press('Escape');assert.equal(await sel(name).evaluate(e=>document.activeElement===e),true);
    }
   }
  });
  await check('parent changes clear dependent IDs/detail; no stale or invalid district sent; cached reload no network',async()=>{
   await page.setViewportSize({width:494,height:1000});await choose(page,'province','1');await ready('district');assert.equal(await field('address').isDisabled(),true);assert.equal((await snap()).document.address,'');assert.equal((await snap()).document.districtId,null);await choose(page,'district','1');await field('address').fill('9 Phố A');const n=requests.length;await choose(page,'province','79');await ready('district');assert.equal(requests.length,n);await choose(page,'district','760');await field('address').fill('12 Đường B');await choose(page,'district','761');assert.equal(await field('address').inputValue(),'');assert.equal(await field('address').isEnabled(),true);
  });
  await check('keyboard commit and rapid select switching; scroll/resize anchor follows without form movement',async()=>{
   await choose(page,'group','zd');assert.equal(await sel('group').getAttribute('data-value'),'zd');await sel('source').click();await page.keyboard.press('Escape');await sel('recipient').click();assert.equal(await page.locator('.app-modal-host').count(),1);assert.equal(await sel('source').getAttribute('aria-expanded'),'false');await page.keyboard.press('Escape');await choose(page,'group','printers');
   await sel('province').click();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);const p=await page.locator('.p05-select-popup:not([hidden])').boundingBox(),t=await sel('province').boundingBox();assert.ok(Math.abs(p.x-t.x)<1);assert.ok(Math.abs(p.width-t.width)<1);await page.keyboard.press('Escape');
  });
  await check('address persists with document through review/send/UNKNOWN; next attempt resets geographic selections',async()=>{
   await field('address').fill('12 Đường B');await act('next').click();await act('manual').click();await page.fill('#p05-code','HN12345');await page.locator('#p05-code').press('Enter');await act('next').click();assert.match(await page.locator('.p05-review-summary').textContent(),/12 Đường B, Quận 12, Thành phố Hồ Chí Minh/);await page.locator('.p05-tools summary').click();await page.selectOption('[data-p05-outcome]','timeout-recorded');await act('send').click();await page.locator('.p05-unknown').waitFor();const req=(await snap()).request;assert.equal(req.document.provinceId,'79');assert.equal(req.document.districtId,'761');assert.match(req.document.geographyVersion,/v1/);await act('check').click();await page.locator('[data-panel="P05.S04"]').waitFor();assert.deepEqual((await snap()).request,req);await act('home').click();await page.locator('.hn-task[data-route="outbound"]').click();assert.equal(await field('address').isDisabled(),true);assert.equal((await snap()).document.provinceId,null);
  });
  assert.deepEqual(errors,[]);assert.ok(requests.every(u=>/^https:\/\/provinces\.open-api\.vn\/api\/v1\/(?:p\/\d+\?depth=2)?$/.test(u)));fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({checks,layouts,errors,requests},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,layouts,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
