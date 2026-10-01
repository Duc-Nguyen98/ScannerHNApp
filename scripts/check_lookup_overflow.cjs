const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P06/evidence/revision-04');fs.mkdirSync(out,{recursive:true});
const before=process.argv.includes('--before');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1869,height:940},deviceScaleFactor:1});
 const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p06="${n}"]`).first();
 async function inspect(label){
  await page.locator('.p06-app img').evaluateAll(es=>Promise.all(es.map(e=>e.decode())));
  await page.locator('.p06-scroll').evaluate(e=>e.scrollTop=0);
  const m=await page.evaluate(()=>{
   const screen=document.querySelector('.hn-screen'),scroller=document.querySelector('.p06-scroll'),s=screen.getBoundingClientRect(),scale=s.width/494;
   const textBounds=el=>{const r=document.createRange();r.selectNodeContents(el);return [...r.getClientRects()].filter(r=>r.width>0);};
   const overflow=[];
   for(const el of document.querySelectorAll('.p06-stock-strip small,.p06-stock-strip strong')){
    const p=el.parentElement,b=p.getBoundingClientRect(),style=getComputedStyle(p),left=b.left+parseFloat(style.paddingLeft)*scale,right=b.right-parseFloat(style.paddingRight)*scale;
    for(const r of textBounds(el))if(r.left<left-1||r.right>right+1)overflow.push({text:el.textContent,left:r.left,right:r.right,allowed:[left,right]});
   }
   const cards=[...document.querySelectorAll('.p06-card,.p06-hero,.p06-section,.p06-location,.p06-event,.p06-warehouse,.p06-history-filters,.p06-info')];
   for(const el of cards){if(el.scrollWidth>el.clientWidth+1)overflow.push({class:el.className,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth});}
   // Text ranges catch painted overflow that scrollWidth can miss inside a
   // clipped ancestor; check actual glyph boxes against their owning card.
   for(const card of cards){
    const bounds=card.getBoundingClientRect(),walker=document.createTreeWalker(card,NodeFilter.SHOW_TEXT);
    let node;while(node=walker.nextNode()){
     if(!node.textContent.trim()||node.parentElement.closest('[hidden],select,summary,input'))continue;
     const range=document.createRange();range.selectNodeContents(node);
     for(const r of range.getClientRects())if(r.width>0&&(r.left<bounds.left-1||r.right>bounds.right+1))overflow.push({class:card.className,text:node.textContent,left:r.left,right:r.right,bounds:[bounds.left,bounds.right]});
    }
   }
   const numbers=[...document.querySelectorAll('.p06-stock-strip strong')].map(el=>{const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return {top:r.top,bottom:r.bottom,center:(r.left+r.right)/2,cellCenter:(p.left+p.right)/2};});
   return {viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,scale,screen:{width:s.width,height:s.height},pageOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,scrollOverflow:scroller.scrollWidth>scroller.clientWidth,overflow,numbers,bodyRadius:getComputedStyle(document.querySelector('.p06-body')||scroller).borderTopRightRadius};
  });
  checks.push({label,...m});await page.locator('.hn-screen').screenshot({path:path.join(out,`${before?'before':'after'}-${label}.png`)});
  if(!before){assert.equal(m.pageOverflow,false,label);assert.equal(m.scrollOverflow,false,label);assert.deepEqual(m.overflow,[],label);assert.ok(Math.abs(m.screen.width/494-m.screen.height/950)<.002);if(m.numbers.length){assert.ok(Math.max(...m.numbers.map(n=>n.top))-Math.min(...m.numbers.map(n=>n.top))<1);assert.ok(m.numbers.every(n=>Math.abs(n.center-n.cellCenter)<1));}}
 }
 try{
  await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('.hn-scanner');
  // Reserve a real scrollbar gutter, reproducing the Windows screenshot even
  // when headless Chromium defaults to overlay scrollbars.
  await page.addStyleTag({content:'#home-app .p06-scroll{scrollbar-gutter:stable;scrollbar-width:auto}'});
  if(before){await page.click('[data-p06-item="fixture-item-HN12345"]');await act('stock').click();await inspect('S03-1869x940');}
  else{
   for(const [w,h]of [[1869,940],[1495,752],[494,1000],[360,800],[430,932],[340,420]]){
    await page.setViewportSize({width:w,height:h});
    await page.evaluate(()=>location.hash='#p02/lookup');await page.locator('[data-panel="P06.S01"]').waitFor();await inspect(`S01-${w}x${h}`);
    await page.click('[data-p06-item="fixture-item-HN12345"]');await inspect(`S02-${w}x${h}`);await act('stock').click();await inspect(`S03-${w}x${h}`);await act('back').click();await act('history').click();await inspect(`S04-${w}x${h}`);
   }
   await page.setViewportSize({width:1869,height:940});await page.evaluate(()=>location.hash='#p02/lookup?panel=2&item=fixture-item-HN12346');await page.locator('[data-panel="P06.S02"]').waitFor();await inspect('long-serial-detail');
   const fixed=await page.locator('.p06-header').boundingBox();await page.locator('.p06-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await act('history').focus();const button=await act('history').boundingBox(),nav=await page.locator('.hn-scan-circle').boundingBox();assert.ok(button.y+button.height<=nav.y);assert.deepEqual(await page.locator('.p06-header').boundingBox(),fixed);
   await page.keyboard.press('Enter');await page.locator('[data-panel="P06.S04"]').waitFor();await inspect('long-serial-history');
   await page.locator('.p06-dates summary').click();await inspect('date-editor');
   // Explicit layout-only stress fixtures; no production values are changed.
   await page.locator('.p06-event-body small').first().evaluate(e=>e.textContent='Mãchứngtừdàikhôngcódấucách'.repeat(8));await inspect('long-event-text');
   await page.evaluate(()=>location.hash='#p02/lookup?panel=3&item=fixture-item-HN12345');await page.locator('[data-panel="P06.S03"]').waitFor();
   await page.locator('.p06-stock-strip strong').evaluateAll(es=>es.forEach((e,i)=>e.textContent=String(9999-i)));
   await page.locator('.p06-info>span').evaluate(e=>e.textContent='KhoHoaNamTênKhoRấtDài'.repeat(12));await inspect('long-stock-text');
   const fixedStock=await page.locator('.p06-header').boundingBox();await page.locator('.p06-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);
   const end=await page.locator('.p06-info').boundingBox(),circle=await page.locator('.hn-scan-circle').boundingBox();assert.ok(end.y+end.height<circle.y);assert.deepEqual(await page.locator('.p06-header').boundingBox(),fixedStock);
   await page.locator('.hn-screen').screenshot({path:path.join(out,'after-scroll-end.png')});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,`${before?'before':'after'}-metrics.json`),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({captures:checks.length,overflow:checks.flatMap(c=>c.overflow),errors}));
 }finally{await browser.close();}
})();
