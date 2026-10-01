const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out='handoff/P17/evidence/revision-02/p16-regression';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,reducedMotion:'reduce',timezoneId:'Asia/Ho_Chi_Minh'}),checks=[],errors=[],metrics=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);
 const check=async(name,fn)=>{await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);};
 const shot=async n=>{await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:path.join(out,n+'.png')});};
 const act=a=>p.locator(`[data-p12="${a}"]`).first();
 async function login(){await p.goto('http://localhost:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForSelector('#home-app');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');}
 async function query(s){await p.fill('#p12-query',s);await p.press('#p12-query','Enter');}
 async function demo(s){await p.locator('.p16-tools').evaluate(e=>e.open=true);await p.click(`[data-p16-demo="${s}"]`);await p.evaluate(()=>scrollTo(0,0));}
 async function filters(){await act('filter').click();await p.fill('#pick-from','01/09/2026');await p.fill('#pick-to','02/09/2026');await p.locator('[name=status][value=posted]').check();await p.locator('.p08-picker [type=submit]').click();await p.waitForTimeout(80);}
 try{
  await login();
  await check('Remove each filter independently; contextual primary CTA; Cancel keeps filters',async()=>{
   await query('PN-9999');await p.click('[data-p12-type=inbound]');await filters();assert.equal(await p.locator('[data-p16-remove]').count(),4);assert.ok(await p.locator('.p16-art').evaluate(e=>e.getBoundingClientRect().top>=e.closest('.p12-scroll').getBoundingClientRect().top));await shot('combined');
   await p.click('[data-p16-remove=q]');assert.equal(await p.inputValue('#p12-query'),'');assert.equal(await p.locator('.p16-actions [data-p12=edit-query]').count(),0);assert.equal(await p.locator('.p16-actions [data-p12=filter]').count(),1);await shot('filter-only');
   await p.locator('.p16-actions [data-p12=filter]').click();await p.fill('#pick-from','03/09/2026');await p.locator('.p08-picker footer [data-cancel]').click();await p.waitForTimeout(80);assert.match(await p.locator('[data-p16-remove=date]').textContent(),/01\/09\/2026/);
   await p.click('[data-p16-remove=status]');assert.equal(await p.locator('[data-p16-remove=status]').count(),0);assert.equal(await p.locator('[data-p12-type=inbound]').getAttribute('aria-selected'),'true');
   await p.click('[data-p16-remove=type]');assert.equal(await p.locator('[data-p12-type=all]').getAttribute('aria-selected'),'true');assert.equal(await p.locator('[data-p16-remove=date]').count(),1);
   await p.click('[data-p16-remove=date]');assert.equal(await p.locator('.p12-record').count(),24);await demo('no-results');await p.locator('.p16-actions [data-p12=clear]').click();assert.equal(await p.locator('.p12-record').count(),24);
  });
  await check('Four panels at five viewports, stable controls/nav and no overflow; chips keyboard reachable',async()=>{
   for(const [width,height]of [[494,950],[360,800],[430,932],[1440,900],[340,420]]){await p.setViewportSize({width,height});let previous;
    for(const [s,id]of [['loading','P16.S01'],['empty','P16.S02'],['no-results','P16.S03'],['error','P16.S04']]){if(s==='error'){await demo('ready');await act('clear').click();}await demo(s);await p.waitForSelector(`[data-panel="${id}"]`);
     const m=await p.locator('.p12-scroll').evaluate(e=>({overflow:e.scrollWidth>e.clientWidth,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,nav:document.querySelector('.hn-nav').getBoundingClientRect().top,frame:[document.querySelector('.hn-screen').offsetWidth,document.querySelector('.hn-screen').offsetHeight]}));assert.ok(!m.overflow);assert.ok(m.bottom<=m.nav+1);assert.deepEqual(m.frame,[494,950]);if(previous)assert.equal(m.top,previous.top);previous=m;metrics.push({width,height,id,...m});await shot(`${id.replace('.','-')}-${width}x${height}`);
    }
   }await p.setViewportSize({width:494,height:950});await demo('no-results');await p.locator('[data-p16-remove=q]').focus();await p.keyboard.press('Enter');assert.equal(await p.inputValue('#p12-query'),'');
  });
  await check('Unavailable scan explains reason and does not open entry; stale cache remains usable',async()=>{
   await demo('error');assert.equal(await act('scan').getAttribute('aria-disabled'),'true');assert.ok(await p.locator('#p16-scan-help').isVisible());await act('scan').dispatchEvent('click');assert.equal(await p.locator('.app-modal-host').count(),0);await shot('scan-unavailable');
   await demo('ready');await demo('stale');assert.equal(await act('scan').getAttribute('aria-disabled'),'false');assert.match(await p.locator('.p16-stale').textContent(),/Đang hiển thị dữ liệu đã tải trước đó/);assert.equal(await p.locator('.p16-stale time').count(),0);await shot('stale');await demo('refresh');assert.equal(await p.locator('[data-data-state=refreshing]').count(),1);await demo('recover');assert.equal(await p.locator('.p12-record').count(),24);
  });
  // Install a controllable read source through the normal mount dependency.
  await p.route('**/home/home.mjs*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('docs/flows/home/home.mjs','utf8').replace('onSystemError:showSystem,supplierHistory','readList:window.testRead,onSystemError:showSystem,supplierHistory')}));
  await p.addInitScript(()=>{window.calls=[];window.mode='ready';window.testRead=ctx=>{const c={ctx};calls.push(c);if(mode==='pending')return new Promise((resolve,reject)=>{c.resolve=resolve;c.reject=reject;});if(mode==='error')throw Error('test error');return window.rows;};});
  await p.goto('http://localhost:8766/flows/auth-session/');await p.evaluate(async()=>window.rows=(await import('/flows/documents/document-model.mjs')).mergeDocuments([]));await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForSelector('#home-app');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');
  await check('Typing is debounced; Enter flushes once; input/focus kept; no old results during wait',async()=>{
   const count=await p.evaluate(()=>calls.length);await p.locator('#p12-query').pressSequentially('PN-0005',{delay:15});assert.equal(await p.evaluate(()=>calls.length),count);assert.equal(await p.locator('[data-data-state=searching]').count(),1);assert.equal(await p.locator('[data-p12-doc]').count(),0);await p.press('#p12-query','Enter');assert.equal(await p.evaluate(()=>calls.length),count+1);await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>calls.length),count+1);assert.equal(await p.locator('.p12-record').count(),1);assert.ok(await p.locator('#p12-query').evaluate(e=>e===document.activeElement));
   await p.fill('#p12-query','PN-0010');await p.waitForTimeout(350);assert.equal(await p.locator('.p12-record').count(),1);assert.equal(await p.inputValue('#p12-query'),'PN-0010');
  });
  await check('IME does not read intermediate text and leaving cancels scheduled query',async()=>{
   const count=await p.evaluate(()=>calls.length);await p.locator('#p12-query').dispatchEvent('compositionstart');await p.fill('#p12-query','Bảo');await p.press('#p12-query','Enter');await p.waitForTimeout(320);assert.equal(await p.evaluate(()=>calls.length),count);await p.locator('#p12-query').dispatchEvent('compositionend');await p.waitForTimeout(320);assert.equal(await p.evaluate(()=>calls.length),count+1);
   await p.fill('#p12-query','leave');await p.click('[data-tab=home]');const n=await p.evaluate(()=>calls.length);await p.waitForTimeout(320);assert.equal(await p.evaluate(()=>calls.length),n);await p.click('[data-tab=documents]');await query('');
  });
  await check('Canceled A cannot appear while B debounce is pending or after B response',async()=>{
   await p.evaluate(()=>mode='pending');await query('A');await p.fill('#p12-query','PN-0005');await p.evaluate(()=>calls.at(-1).resolve([]));assert.equal(await p.locator('[data-panel="P16.S02"]').count(),0);await p.press('#p12-query','Enter');await p.evaluate(()=>calls.at(-1).resolve(rows));await p.waitForSelector('[data-p12-doc="fixture-inbound-0005"]');assert.equal(await p.locator('.p12-record').count(),1);
  });
  await check('Refresh keeps visible record and focus by ID despite reordered data and stale notice removal',async()=>{
   await p.evaluate(()=>mode='ready');await query('');await p.locator('.p12-scroll').evaluate(e=>e.scrollTop=600);
   await p.evaluate(()=>{window.anchor=document.querySelectorAll('[data-p12-doc]')[8].dataset.p12Doc;document.querySelector(`[data-p12-doc="${anchor}"]`).focus({preventScroll:true});});
   // Synthetic retry represents owner refresh without moving viewport to an offscreen toolbar.
   const retry=()=>p.evaluate(()=>{const b=document.createElement('button');b.dataset.p12='retry';document.querySelector('.p12-app').append(b);b.click();b.remove();});
   await p.evaluate(()=>mode='error');await retry();await p.locator('.p12-scroll').evaluate(e=>e.scrollTop=600);await p.evaluate(()=>document.querySelector(`[data-p12-doc="${anchor}"]`).focus({preventScroll:true}));
   const anchor=await p.locator('.p12-scroll').evaluate(e=>{const top=e.getBoundingClientRect().top,row=[...e.querySelectorAll('[data-p12-doc]')].find(r=>r.getBoundingClientRect().bottom>top);return {id:row.dataset.p12Doc,y:row.getBoundingClientRect().top-top};});
   await p.evaluate(()=>mode='pending');await retry();assert.equal(await p.locator('[data-data-state=refreshing]').count(),1);assert.equal(await p.locator('.p16-skeleton').count(),0);await shot('refreshing');
   await p.evaluate(()=>{rows=rows.map((r,i)=>i===23?{...r,day:'2026-09-29',time:'23:59'}:r);calls.at(-1).resolve(rows);});await p.waitForSelector('[data-data-state=refreshing]',{state:'detached'});
   const actual=await p.locator(`[data-p12-doc="${anchor.id}"]`).evaluate(e=>e.getBoundingClientRect().top-e.closest('.p12-scroll').getBoundingClientRect().top);assert.ok(Math.abs(actual-anchor.y)<1.5,`${actual} vs ${anchor.y}`);assert.equal(await p.evaluate(()=>document.activeElement.dataset.p12Doc),await p.evaluate(()=>window.anchor));await shot('refresh-preserved');
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'ux-results.json'),JSON.stringify({checks,errors,metrics},null,2));console.log(checks.length+' groups PASS');
 }catch(e){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:e.message,checks,errors,metrics},null,2));await shot('failure').catch(()=>{});throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
