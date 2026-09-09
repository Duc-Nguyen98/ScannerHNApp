import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts/scanner-active-nav',base=process.env.SCANNER_QA_URL||'http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/';
await mkdir(out,{recursive:true});const browser=await chromium.launch(),runs=[];
try{for(const [width,height] of [[360,800],[390,844],[430,932]]){
 const p=await browser.newPage({viewport:{width,height},isMobile:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base);await p.locator('#sc-auth-id').fill('minhanh');await p.locator('#sc-auth-password').fill('Scanner@2026');await p.getByRole('button',{name:'Đăng nhập',exact:true}).click();await p.getByRole('button',{name:'Bắt đầu ca làm việc',exact:true}).click();await p.locator('.sc-nav').waitFor();
 const checks=[];let originalHeight;
 for(const [label,hash] of [['Trang chủ','home'],['Chứng từ','docs'],['Quét mã — Hoa Nam Tool','lookup'],['Lịch sử','history'],['Cá nhân','profile']]){
  await p.locator('.sc-nav').getByRole('button',{name:label,exact:true}).click();await p.waitForURL(new RegExp('#'+hash+'$'));await p.waitForTimeout(220);
  assert.equal(await p.locator('.sc-nav [aria-current=page]').count(),1);assert.equal(await p.locator('.sc-nav [aria-current=page]').getAttribute('aria-label'),label);
  const measured=await p.locator('.sc-nav').evaluate(nav=>({height:nav.getBoundingClientRect().height,buttons:[...nav.querySelectorAll('button')].map(e=>({active:e.getAttribute('aria-current'),label:e.getAttribute('aria-label'),bg:getComputedStyle(e,'::before').backgroundColor,dot:getComputedStyle(e,'::after').content,color:getComputedStyle(e).color,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),orb:nav.querySelector('.sc-nav-orb').getBoundingClientRect().width,ring:getComputedStyle(nav.querySelector('.sc-nav-orb')).boxShadow}));
  originalHeight??=measured.height;assert.equal(measured.height,originalHeight);assert.equal(measured.orb,54);
  for(const button of measured.buttons){assert.ok(button.width>=44&&button.height>=44);assert.ok(button.dot==='none'||button.dot==='normal');if(button.label!== 'Quét mã — Hoa Nam Tool')assert.equal(button.bg,button.active?'rgb(234, 243, 246)':'rgba(0, 0, 0, 0)');}
  assert.equal(measured.ring.includes('inset'),hash==='lookup');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('.sc-nav').screenshot({path:`${out}/${width}-${hash}.png`});checks.push({hash,...measured});
 }
 await p.getByRole('button',{name:/Chỉnh sửa hồ sơ Biệt danh/}).click();assert.equal(await p.locator('.sc-nav [aria-current=page]').getAttribute('aria-label'),'Cá nhân');
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.sc-nav button').first().evaluate(e=>getComputedStyle(e,'::before').transitionDuration),'0s');
 assert.deepEqual(errors,[]);runs.push({width,height,checks,profileChild:true,reducedMotion:true,pageErrors:errors});console.log(width,'PASS');await p.close();
}}finally{await writeFile(out+'/qa.json',JSON.stringify(runs,null,2));await browser.close();}
