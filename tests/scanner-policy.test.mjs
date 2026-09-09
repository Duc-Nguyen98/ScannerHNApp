import test from 'node:test';
import assert from 'node:assert/strict';
import {profiles,reads,writes,assertWrite,assertPermission,actionPermission,authorizeCommit,changeWarehouse} from '../lib/scanner-policy.ts';
import {seedStore,createDocument,postDocument,changeCase} from '../lib/scanner-model.ts';
import {createPreviewAuth} from '../lib/scanner-auth-preview.ts';
const actor=(role)=>({userId:'test',name:'QA',roleCode:profiles[role].code,permissions:profiles[role].permissions,shiftStarted:true,expiresAt:Date.now()+60000});
for(const role of Object.keys(profiles))for(const warehouseStatus of ['active','paused'])test(`${role} × ${warehouseStatus}: permissions, reads, all writes, administration`,()=>{
 const a=actor(role),s={...seedStore(),warehouseStatus};
 for(const p of reads)assert.doesNotThrow(()=>assertPermission(a,p));
 for(const p of writes){const fn=()=>assertWrite(s,a,p);if(warehouseStatus==='active'&&a.permissions.includes(p))assert.doesNotThrow(fn);else assert.throws(fn);}
 const admin=()=>changeWarehouse(s,a,warehouseStatus==='active'?'paused':'active','Kiểm tra ca làm việc',true);
 if(role==='Super Admin')assert.equal(admin().events.length,s.events.length+1);else assert.throws(admin);
});
test('domain direct calls deny missing identity, viewer, expired and paused writes',()=>{
 const s=seedStore(),input={kind:'in',name:'Test',recipient:'Kho',phone:'',address:'',group:'',note:'',lines:[{code:'NEW-001',qty:1}],key:'test'};
 for(const a of [null,undefined,actor('Chỉ xem'),{...actor('Super Admin'),expiresAt:0}]){
  assert.throws(()=>createDocument(s,input,a));assert.throws(()=>postDocument(s,'PN-0001',a));assert.throws(()=>changeCase(s,'BH-001','Đang sửa chữa','Kiểm tra',a));
 }
 for(const role of Object.keys(profiles)){
  assert.throws(()=>createDocument({...s,warehouseStatus:'paused'},input,actor(role)));
  assert.throws(()=>postDocument({...s,warehouseStatus:'paused'},'PN-0001',actor(role)));
  assert.throws(()=>changeCase({...s,warehouseStatus:'paused'},'BH-001','Đang sửa chữa','Kiểm tra',actor(role)));
 }
 assert.doesNotThrow(()=>createDocument(s,input,actor('Nhân viên kho')));assert.throws(()=>postDocument(s,'PN-0001',actor('Nhân viên kho')));assert.doesNotThrow(()=>postDocument(s,'PN-0001',actor('Người duyệt kho')));
});
test('direct commit catches cancellation, media, intake, NFC assign/revoke, arbitrary inventory, audit edits',()=>{
 const s=seedStore();const mutations=[
  {...s,docs:s.docs.map(d=>({...d,status:'Đã huỷ'}))},
  {...s,cases:s.cases.map(c=>({...c,media:[{name:'test',category:'Tiếp nhận'}]}))},
  {...s,cases:[...s.cases,{...s.cases[0],id:'BH-new'}]},
  {...s,tags:[...s.tags,{uid:'NEW',code:'MAY-001',status:'Đang dùng',reason:''}]},
  {...s,tags:s.tags.map(t=>({...t,status:'Ngừng dùng'}))},
  {...s,items:s.items.map(i=>({...i,qty:1000}))},
  {...s,events:[]}
 ];
 for(const next of mutations)assert.throws(()=>authorizeCommit(s,next,actor('Chỉ xem')));
 for(const next of mutations)assert.throws(()=>authorizeCommit({...s,warehouseStatus:'paused'},{...next,warehouseStatus:'paused'},actor('Super Admin')));
});
test('permissions, not role labels, drive enforcement; admin status requires confirmation plus super code',()=>{
 const s=seedStore(),a={...actor('Super Admin'),permissions:[]};assert.throws(()=>assertWrite(s,a,'inbound.create'));
 assert.throws(()=>changeWarehouse(s,actor('Super Admin'),'paused','Bảo trì',false));assert.throws(()=>changeWarehouse(s,actor('Super Admin'),'paused','',true));
 assert.throws(()=>changeWarehouse(s,{...actor('Super Admin'),roleCode:'ADMIN'},'paused','Bảo trì',true));
 assert.equal(actionPermission('nfc-bind'),'physical_code.assign_rfid');assert.equal(actionPermission('scan','parts'),'warranty.component_issue');
});
test('mock adapter supports revocation and stores no password',async()=>{
 const map=new Map();const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};const service=createPreviewAuth(storage);
 await service.login('minhanh','Scanner@2026','normal','Nhân viên kho');assert.equal(service.read().shiftStarted,false);service.startShift();assert.equal(service.read().shiftStarted,true);service.changePreviewRole('Chỉ xem');assert.equal(service.read().permissions.includes('inbound.create'),false);assert.ok(!JSON.stringify([...map]).includes('Scanner@2026'));service.logout();assert.equal(service.read(),null);
});
