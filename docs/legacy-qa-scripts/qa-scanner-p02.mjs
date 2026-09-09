import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.SCANNER_QA_URL||'http://127.0.0.1:3000/scanner',out=process.env.SCANNER_QA_OUTPUT||'artifacts/scanner-p02/verified';await mkdir(out,{recursive:true});
const browser=await chromium.launch();const log=[];
const route=async(p,h)=>{await p.evaluate(h=>{location.hash=h;},h);await p.waitForTimeout(150);};
const login=async p=>{await p.goto(base+'#home');await p.locator('#sc-auth-id').fill('minhanh');await p.locator('#sc-auth-password').fill('Scanner@2026');await p.getByRole('button',{name:'Đăng nhập',exact:true}).click();await p.getByRole('button',{name:'Bắt đầu ca làm việc',exact:true}).click();await p.waitForURL(/#home/);};
const role=async(p,value)=>{const d=p.locator('.sc-mobile-controls');if(await d.getAttribute('open')===null)await d.locator('summary').click();await d.locator('select').first().selectOption(value);await p.waitForTimeout(100);};
const change=async(p,paused)=>{await route(p,'profile');await p.getByRole('button',{name:paused?'Tạm dừng kho':'Kích hoạt lại kho',exact:true}).click();const d=p.locator('.sc-warehouse-modal');await d.waitFor({state:'visible'});assert.equal(await d.getByRole('button',{name:'Xác nhận thay đổi'}).isDisabled(),true);await d.getByLabel('Lý do thay đổi trạng thái').fill('QA xác nhận trạng thái kho');await d.getByRole('button',{name:'Xác nhận thay đổi'}).click();await d.waitFor({state:'hidden'});};
try{
for(const [width,height]of [[360,800],[390,844],[430,932]]){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await login(p);
 const shot=async name=>{await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`${out}/${width}x${height}-${name}.png`});};
 for(const paused of [false,true]){
  if(paused){await role(p,'Super Admin');await change(p,true);await shot('pause-confirmed');}
  for(const r of ['Nhân viên kho','Người duyệt kho','Chỉ xem','Super Admin']){
   await role(p,r);const row={viewport:{width,height},role:r,warehouse:paused?'paused':'active',checks:[]};log.push(row);const canCreate=!paused&&['Nhân viên kho','Super Admin'].includes(r),canPost=!paused&&['Người duyệt kho','Super Admin'].includes(r);
   await route(p,'home');assert.equal(await p.locator('.sc-task-grid').getByRole('button',{name:/^Nhập kho /}).isDisabled(),!canCreate);assert.equal(await p.locator('.sc-task-grid').getByRole('button',{name:/^Xuất kho /}).isDisabled(),!canCreate);row.checks.push('home-inbound-outbound-cta');
   if(r==='Chỉ xem')await shot(paused?'viewer-paused':'viewer-home');
   for(const action of ['create','scan','review','intake','nfc-bind']){await route(p,action);assert.equal(await p.getByRole('heading',{name:'Thao tác đang bị khóa'}).count(),canCreate?0:1);if(!canCreate)assert.equal(await p.locator('.sc-content input,.sc-content textarea,.sc-content select').count(),0);}
   row.checks.push('direct-create-scan-review-intake-nfc-action-denial');
   await route(p,'doc?id=PN-0001');assert.equal(await p.getByRole('button',{name:'Duyệt và ghi sổ',exact:true}).isDisabled(),!canPost);assert.equal(await p.getByRole('button',{name:'Huỷ phiếu',exact:true}).isDisabled(),paused||r==='Chỉ xem');row.checks.push('document-post-cancel');
   await route(p,'case?id=BH-001');await p.getByRole('button',{name:'Thông tin',exact:true}).click();assert.equal(await p.getByRole('button',{name:/Xuất linh kiện bảo hành/}).isDisabled(),!canCreate);row.checks.push('warranty-parts');
   await p.getByRole('button',{name:'Ảnh & video',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Thêm ảnh hồ sơ',exact:true}).isDisabled(),!canCreate);row.checks.push('warranty-media');
   await route(p,'nfc');assert.equal(await p.getByRole('button',{name:/Gán thẻ NFC/}).isDisabled(),!canCreate);assert.equal(await p.getByRole('button',{name:'Thu hồi thẻ',exact:true}).isDisabled(),!canCreate);row.checks.push('nfc-assign-revoke');
   for(const read of ['lookup','docs','warranty','history','product?product=MAY-001']){await route(p,read);assert.equal(await p.getByRole('heading',{name:'Thao tác đang bị khóa'}).count(),0);assert.ok((await p.locator('.sc-content').innerText()).length>0);}row.checks.push('lookup-docs-warranty-history-product-read');
   await route(p,'profile');assert.equal(await p.getByRole('button',{name:paused?'Kích hoạt lại kho':'Tạm dừng kho',exact:true}).count(),r==='Super Admin'?1:0);row.checks.push('super-admin-only-management');
   if(paused)assert.equal(await p.locator('.sc-warehouse-banner').count(),1);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));row.checks.push('no-overflow');console.log(width,r,paused?'paused':'active','PASS');
  }
 }
 await role(p,'Super Admin');await change(p,false);await role(p,'Nhân viên kho');await route(p,'home');await p.locator('.sc-task-grid').getByRole('button',{name:/^Nhập kho /}).click();await p.getByLabel('Tên phiếu').fill('P02 draft retained');
 const admin=await ctx.newPage();await login(admin);await role(admin,'Super Admin');await change(admin,true);await p.getByRole('heading',{name:'Thao tác đang bị khóa'}).waitFor();await shot('draft-paused');
 await change(admin,false);await p.getByLabel('Tên phiếu').waitFor();assert.equal(await p.getByLabel('Tên phiếu').inputValue(),'P02 draft retained');
 log.push({viewport:{width,height},check:'cross-tab-pause-unpause-draft-preserved',result:'PASS'});await route(admin,'history');assert.ok((await admin.locator('.sc-content').innerText()).includes('QA xác nhận trạng thái kho'));
 await route(admin,'doc?id=PN-0001');await admin.getByRole('button',{name:'Duyệt và ghi sổ',exact:true}).click();await admin.locator('.sc-dialog').getByRole('button',{name:'Xác nhận ghi sổ',exact:true}).click();await admin.locator('.sc-content').getByText('Đã ghi sổ',{exact:true}).waitFor();log.push({viewport:{width,height},check:'authorized-post-confirmation-stock-result',result:'PASS'});
 assert.deepEqual(errors,[]);await ctx.close();
}
}finally{await writeFile(`${out}/matrix.json`,JSON.stringify(log,null,2));await browser.close();}
