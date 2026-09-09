import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {DESIGN_SHIFT_TIME} from '../lib/scanner-design-fixtures.ts';
import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const out=process.env.SCANNER_QA_OUTPUT||'artifacts/scanner-design-data/shift-time',base='http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/';await mkdir(out,{recursive:true});const b=await chromium.launch(),results=[];
try{for(const [width,height] of [[360,800],[390,844],[430,932]]){
 const p=await b.newPage({viewport:{width,height},timezoneId:'Asia/Ho_Chi_Minh'});const row={width,height,errors:[]};results.push(row);p.on('pageerror',e=>row.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')row.errors.push(m.text());});
 await p.goto(base);await p.locator('#sc-auth-id').fill('minhanh');await p.locator('#sc-auth-password').fill('Scanner@2026');await p.getByRole('button',{name:'Đăng nhập',exact:true}).click();await p.getByRole('button',{name:'Bắt đầu ca làm việc',exact:true}).waitFor();const before=Date.now();await p.getByRole('button',{name:'Bắt đầu ca làm việc',exact:true}).click();await p.waitForURL(/#home$/);
 const stored=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('hoanam-scanner-preview-session-v1')));assert.ok(stored.shiftStartedAt>=before&&stored.shiftStartedAt<=Date.now());
 const expected=DESIGN_SHIFT_TIME;assert.equal(await p.locator('.sh-shift strong').innerText(),expected);assert.equal(await p.locator('.sh-shift small').count(),0);await p.reload();await p.locator('.sh-shift').waitFor();assert.equal(await p.locator('.sh-shift strong').innerText(),expected);
 const same=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('hoanam-scanner-preview-session-v1')).shiftStartedAt);assert.equal(same,stored.shiftStartedAt);
 assert.ok(await p.locator('.sh-shift').evaluate(e=>{const a=e.getBoundingClientRect(),n=e.querySelector('strong').getBoundingClientRect(),i=e.querySelector('svg').getBoundingClientRect();return n.right<=i.left&&i.right<=a.right&&document.documentElement.scrollWidth<=innerWidth;}));
 await p.screenshot({path:`${out}/${width}-home.png`});row.time=expected;row.timestamp=stored.shiftStartedAt;row.result='PASS';assert.deepEqual(row.errors,[]);await p.close();
}}finally{await writeFile(out+'/qa.json',JSON.stringify(results,null,2));await b.close();}
