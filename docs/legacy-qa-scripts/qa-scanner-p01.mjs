import { chromium } from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.SCANNER_QA_URL || 'http://127.0.0.1:3000/scanner';
const out=process.env.SCANNER_QA_OUTPUT||'artifacts/scanner-p01/verified';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});const log=[];
const routes=['home','lookup','product','create','scan','review','result','docs','doc','warranty','case','intake','nfc','nfc-bind','history','profile','unknown'];
try {
for(const [width,height] of [[360,800],[390,844],[430,932]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const entry={viewport:{width,height},checks:[],screenshots:[]};log.push(entry);
 const check=(name)=>{entry.checks.push(name);console.log(width,name);};
 const shot=async(name)=>{const file=`${width}x${height}-${name}.png`;await page.screenshot({path:`${out}/${file}`});entry.screenshots.push(file);};
 const login=async()=>{await page.locator('#sc-auth-id').fill('minhanh');await page.locator('#sc-auth-password').fill('Scanner@2026');await page.locator('#sc-auth-password').press('Enter');await page.waitForURL(/#shift$/);};
 const route=async(hash)=>{await page.evaluate(h=>{location.hash=h;},hash);await page.waitForTimeout(120);};
 await page.goto(base+'#home');await page.waitForURL(/#login$/);await page.getByRole('button',{name:'Đăng nhập',exact:true}).waitFor();
 assert.deepEqual(await page.evaluate(()=>({width:innerWidth,height:innerHeight})),{width,height});
 assert.equal(await page.locator('nav,.sc-header,.sc-content').count(),0);await shot('login');check('direct-home-guard + no-private-shell + measured-viewport');
 for(const name of routes){await route(name);await page.waitForURL(/#login$/);assert.equal(await page.locator('nav').count(),0);}check('all-private-routes-and-unknown-denied');
 await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await shot('validation');assert.equal(await page.locator('input[aria-invalid=true]').count(),2);assert.equal(await page.locator('#sc-auth-id').evaluate(e=>e===document.activeElement),true);check('validation-focus');
 await page.locator('#sc-auth-password').fill('synthetic');await page.getByRole('button',{name:'Hiện mật khẩu',exact:true}).click();assert.equal(await page.locator('#sc-auth-password').getAttribute('type'),'text');await page.getByRole('button',{name:'Ẩn mật khẩu',exact:true}).click();assert.equal(await page.locator('#sc-auth-password').getAttribute('type'),'password');await page.locator('#sc-auth-password').fill('');check('password-toggle');
 await page.getByRole('button',{name:'Quên mật khẩu?'}).click();await page.getByRole('heading',{name:'Quên mật khẩu',exact:true}).waitFor();await shot('forgot');await page.getByRole('button',{name:'Quay lại đăng nhập'}).click();check('recovery-contact-no-fake-reset');
 await page.locator('.sc-auth-harness summary').click();
 for(const scenario of ['invalid','locked','disabled','offline','server']){
  await page.getByLabel('Kịch bản đăng nhập').selectOption(scenario);await page.locator('#sc-auth-id').fill('minhanh');await page.locator('#sc-auth-password').fill('Scanner@2026');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await page.getByRole('button',{name:'Đang đăng nhập…'}).waitFor();if(scenario==='invalid')await shot('loading');
  await page.locator('[role=alert]').waitFor();assert.equal(await page.locator('#sc-auth-password').inputValue(),'');await shot(scenario);check('error-'+scenario);
 }
 await page.getByLabel('Kịch bản đăng nhập').selectOption('normal');await login();await shot('shift');assert.equal(await page.locator('nav').count(),0);await page.reload();await page.getByRole('button',{name:'Bắt đầu ca làm việc',exact:true}).waitFor();assert.ok(page.url().endsWith('#shift'));await route('home');await page.waitForURL(/#shift$/);check('session-reload-before-shift');
 await page.getByRole('button',{name:'Bắt đầu ca làm việc',exact:true}).click();await page.waitForURL(/#home$/);await page.locator('.sc-content h2').waitFor();await shot('home');check('shift-start-home');
 await page.getByRole('button',{name:'Chứng từ',exact:true}).click();await page.getByRole('button',{name:/Nhập kho PN-0001/}).click();await page.waitForURL(/#doc\?id=PN-0001/);await page.reload();await page.getByRole('heading',{name:'Chi tiết chứng từ',exact:true}).waitFor();assert.ok(await page.locator('.sc-content').innerText().then(t=>t.includes('PN-0001')));check('detail-context-reload');
 await page.goBack();await page.waitForTimeout(200);assert.ok(!await page.getByText('This page couldn’t load',{exact:true}).count());check('native-back');
 await route('home');await page.getByRole('button',{name:'Nhập kho Nhận hàng và kiểm đếm'}).click();await page.getByLabel('Tên phiếu').fill('P01 draft retained');
 await page.locator('.sc-mobile-controls summary').click();await page.locator('.sc-mobile-controls').getByRole('button',{name:'Kiểm thử hết hạn phiên'}).click();await page.waitForURL(/#login$/);await shot('expired');assert.equal(await page.locator('nav').count(),0);await login();await page.getByRole('button',{name:'Bắt đầu ca làm việc',exact:true}).click();await page.waitForURL(/#create/);assert.equal(await page.getByLabel('Tên phiếu').inputValue(),'P01 draft retained');check('expiry-draft-reauth-resume');
 await route('profile');await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await page.locator('dialog').getByRole('button',{name:'Đăng xuất',exact:true}).click();await page.waitForURL(/#login$/);await page.goBack();await page.waitForTimeout(200);assert.ok(page.url().endsWith('#login'));await page.reload();await page.getByRole('heading',{name:'Đăng nhập Hoa Nam Scanner'}).waitFor();for(const name of routes){await route(name);await page.waitForURL(/#login$/);}check('logout-back-reload-all-deeplinks');
 const storage=await page.evaluate(()=>({session:{...sessionStorage},local:{...localStorage}}));assert.ok(!JSON.stringify(storage).includes('Scanner@2026'));check('no-password-in-storage');
 const metrics=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,targets:[...document.querySelectorAll('.sc-auth button,.sc-auth input')].map(e=>({label:e.getAttribute('aria-label')||e.textContent,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width}))}));assert.ok(metrics.scrollWidth<=width);assert.ok(metrics.targets.every(t=>t.height>=44&&t.width>=44));entry.metrics=metrics;assert.deepEqual(errors,[]);check('no-overflow-touch-targets-no-runtime-errors');await shot('logout-guard');await context.close();
}
}finally{await writeFile(`${out}/qa.json`,JSON.stringify(log,null,2));await browser.close();}
