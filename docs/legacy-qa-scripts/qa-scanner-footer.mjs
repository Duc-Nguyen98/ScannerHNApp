import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts/scanner-footer-qr';
const base=process.env.SCANNER_QA_URL||'http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/';
await mkdir(out,{recursive:true});
const b=await chromium.launch(),runs=[];
try {
 for(const [width,height] of [[360,800],[390,844],[430,932]]) {
  const p=await b.newPage({viewport:{width,height},isMobile:true});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'#home');await p.locator('#sc-auth-id').fill('minhanh');
  await p.locator('#sc-auth-password').fill('Scanner@2026');
  await p.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await p.getByRole('button',{name:'Bắt đầu ca làm việc',exact:true}).click();
  await p.locator('.sc-nav-orb').waitFor();
  await p.waitForTimeout(200);
  const geometry=await p.evaluate(()=>{
   const q=s=>document.querySelector(s)?.getBoundingClientRect().toJSON()||null;
   return {viewport:{width:innerWidth,height:innerHeight},nav:q('.sc-nav'),orb:q('.sc-nav-orb'),
    padding:getComputedStyle(document.querySelector('.sc-content')).paddingBottom,
    label:document.querySelector('.sc-nav-center')?.innerText,
    qr:!!document.querySelector('.sc-nav-qr.lucide-scan-qr-code'),
    color:getComputedStyle(document.querySelector('.sc-nav-qr')).color};
  });
  assert.equal(geometry.orb.width,54);assert.equal(geometry.orb.height,54);
  assert.equal(geometry.label,'Quét mã');assert.ok(geometry.qr);
  assert.equal(geometry.color,'rgb(255, 255, 255)');
  assert.ok(geometry.orb.top>=geometry.nav.top);
  assert.ok(parseFloat(geometry.padding)>=geometry.nav.height);
  await p.screenshot({path:out+'/'+width+'-home.png'});
  await p.locator('.sc-nav').screenshot({path:out+'/'+width+'-footer.png'});
  await p.getByRole('button',{name:'Quét mã — Hoa Nam Tool',exact:true}).click();
  await p.getByRole('heading',{name:'Tra cứu sản phẩm',exact:true}).waitFor();
  assert.ok(p.url().endsWith('#lookup'));
  await p.getByRole('button',{name:'Trang chủ',exact:true}).click();
  await p.getByRole('button',{name:'Nhập kho Nhận hàng và kiểm đếm'}).click();
  await p.getByLabel('Tên phiếu *',{exact:true}).fill('Footer QA');
  await p.getByRole('button',{name:'Bắt đầu quét',exact:true}).click();
  await p.getByLabel('Mã linh kiện / hộp / hiện vật').fill('NEW-001');
  await p.getByRole('button',{name:'Kiểm tra mã',exact:true}).click();
  await p.locator('.sc-lines .sc-card').waitFor();
  await p.waitForTimeout(200);
  const cta=await p.evaluate(()=>{
   const n=document.querySelector('.sc-nav').getBoundingClientRect(),
    o=document.querySelector('.sc-nav-orb').getBoundingClientRect(),
    c=document.querySelector('.sc-sticky-actions').getBoundingClientRect();
   return {top:c.top,bottom:c.bottom,navTop:n.top,orbTop:o.top};
  });
  assert.ok(cta.bottom<=Math.min(cta.navTop,cta.orbTop)+1);
  await p.locator('.sc-lines .sc-card').last().scrollIntoViewIfNeeded();
  await p.evaluate(()=>scrollBy(0,350));
  const last=await p.locator('.sc-lines .sc-card').last().boundingBox();
  assert.ok(last.y+last.height<=cta.top+1);
  await p.screenshot({path:out+'/'+width+'-scan.png'});
  assert.deepEqual(errors,[]);
  runs.push({...geometry,cta,checks:'54px / white QR / lookup / content clearance / no pageerror PASS'});
  console.log(width,'PASS');await p.close();
 }
} finally {await writeFile(out+'/qa.json',JSON.stringify(runs,null,2));await b.close();}
