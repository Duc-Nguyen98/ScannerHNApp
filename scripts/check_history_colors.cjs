const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.HISTORY_COLOR_EVIDENCE_DIR||'handoff/P08/evidence/revision-17');fs.mkdirSync(out,{recursive:true});
const contrast=(a,b)=>{const lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const tones=new Map();
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function hub(scene){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+scene+'"]').click();await page.locator('.p08-app').waitFor();}
 async function capture(name){await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('Daily categories: one consistent tone for stat/icon/count; adequate contrast; continuous canvas at6 sizes',async()=>{
  await hub('history-daily');
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=0);
   const m=await page.locator('.p08-app').evaluate(e=>{const s=e.closest('.hn-screen'),sc=e.querySelector('.p08-scroll');return {shell:[s.offsetWidth,s.offsetHeight],canvas:[e,e.querySelector('.p08-body'),sc].map(n=>getComputedStyle(n).backgroundColor),overflow:sc.scrollWidth>sc.clientWidth+1,nav:sc.getBoundingClientRect().bottom<=s.querySelector('.hn-nav').getBoundingClientRect().top+1,tones:[...e.querySelectorAll('.p08-stat:not(.p08-stat-total)')].map(n=>{const k=n.dataset.historyTone,g=e.querySelector('[data-p08-group="'+k+'"]'),badge=g.querySelector('.p08-count-badge'),tile=g.querySelector('.p08-day-tile');return {key:k,bg:getComputedStyle(n).backgroundColor,ink:getComputedStyle(n.querySelector('strong')).color,label:getComputedStyle(n.querySelector('span:last-child')).color,icon:getComputedStyle(n.querySelector('svg')).color,tileBg:getComputedStyle(tile).backgroundColor,tileInk:getComputedStyle(tile.querySelector('svg')).color,badgeBg:getComputedStyle(badge).backgroundColor,badgeInk:getComputedStyle(badge.querySelector('strong')).color};})};});
   assert.deepEqual(m.shell,[494,950]);assert.equal(new Set(m.canvas).size,1);assert.equal(m.overflow,false);assert.equal(m.nav,true);assert.equal(new Set(m.tones.map(t=>t.bg)).size,5);
   for(const t of m.tones){assert.equal(t.bg,t.tileBg);assert.equal(t.bg,t.badgeBg);assert.equal(t.ink,t.icon);assert.equal(t.ink,t.tileInk);assert.equal(t.ink,t.badgeInk);assert.ok(contrast(t.ink,t.bg)>=4.5,t.key);assert.ok(contrast(t.label,t.bg)>=4.5,t.key);tones.set(t.key,{bg:t.bg,ink:t.ink});}
   metrics.push({w,h,...m});await capture('daily-top-'+w+'x'+h);await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await capture('daily-bottom-'+w+'x'+h);
  }await page.setViewportSize({width:494,height:1000});
 });
 await check('Same business colors across general/import-export/NFC/warranty/session rows; statuses retain their colors',async()=>{
  for(const scene of ['history-general','documents','nfc','warranty','sessions']){
   await hub(scene);
   const rows=await page.locator('.p08-row').evaluateAll(es=>es.map(e=>{const t=e.querySelector('.p08-tile'),badge=e.querySelector('.p08-chip');return {key:e.dataset.historyTone,bg:getComputedStyle(t).backgroundColor,ink:getComputedStyle(t).color,status:badge.className,statusBg:getComputedStyle(badge).backgroundColor};}));
   for(const r of rows){if(tones.has(r.key)){assert.equal(r.bg,tones.get(r.key).bg);assert.equal(r.ink,tones.get(r.key).ink);}else{assert.equal(r.key,'sessions');assert.ok(contrast(r.ink,r.bg)>=4.5);tones.set(r.key,{bg:r.bg,ink:r.ink});}if(r.status.includes('waiting'))assert.equal(r.statusBg,'rgb(255, 244, 216)');if(r.status.includes('success'))assert.equal(r.statusBg,'rgb(229, 248, 237)');}
   await capture(scene);
   await page.locator('.p08-row').first().click();const icon=scene==='sessions'?page.locator('.p08-summary .p08-tile'):page.locator('.p08-detail-glyph');
   const actual=await icon.evaluate(e=>({bg:getComputedStyle(e).backgroundColor,ink:getComputedStyle(e).color}));
   assert.deepEqual(actual,tones.get(rows[0].key));await capture(scene+'-detail');await page.locator('[data-p08=back]').click();
  }
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'color-results.json'),JSON.stringify({revision:'P08-r17',checks,metrics,palette:Object.fromEntries(tones),errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
