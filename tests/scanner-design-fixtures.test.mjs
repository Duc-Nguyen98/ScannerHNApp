import test from 'node:test';import assert from 'node:assert/strict';
import {seedStore,createDocument,postDocument} from '../lib/scanner-model.ts';
import {profiles} from '../lib/scanner-policy.ts';
import {applyScannerDesignFixtures,seedScannerDesignStore,scannerHomeRecords,scannerDesignSerial,DESIGN_SHIFT_TIME} from '../lib/scanner-design-fixtures.ts';
const actor={userId:'preview-minhanh',name:'Minh Anh',roleCode:profiles['Super Admin'].code,permissions:profiles['Super Admin'].permissions,expiresAt:Date.now()+60000,shiftStarted:true};
test('approved fixture is exact and all three Home rows have domain destinations',()=>{
 const db=seedScannerDesignStore();assert.equal(DESIGN_SHIFT_TIME,'08:30');assert.equal(db.docs.filter(d=>d.status==='Chờ duyệt').length,1);assert.equal(db.cases.filter(c=>!['Đã trả','Đã huỷ'].includes(c.status)).length,4);assert.equal(db.events.length,3);
 assert.deepEqual(scannerHomeRecords(db),[
 {id:'PN-0001',kind:'in',name:'Lô máy đầu ca',at:'08:32 12/04/2026',status:'Chờ duyệt',target:'doc'},
 {id:'PX-0004',kind:'out',name:'Đại lý Minh Phát',at:'16:20 11/04/2026',status:'Đã ghi sổ',target:'doc'},
 {id:'BH-001',kind:'warranty',name:'SN: HN12345',at:'14:15 10/04/2026',status:'Đang xử lý',target:'case'}]);
 assert.equal(scannerDesignSerial(db,db.cases.find(c=>c.id==='BH-001').code),'HN12345');
 assert.ok(db.docs.find(d=>d.id==='PX-0004').lines.every(l=>db.items.some(i=>i.code===l.code&&i.status==='Đã xuất'&&i.qty===0)));
});
test('upgrade is additive and idempotent; preserves existing edits, stock and warehouse pause',()=>{
 const original=seedStore();original.warehouseStatus='paused';original.docs[0].status='Đã huỷ';original.events.push({at:'10:00 09/09/2026',text:'User action retained'});original.cases[0].timeline.push({at:'10:00 09/09/2026',text:'User note retained'});
 const snapshot=structuredClone(original),upgraded=applyScannerDesignFixtures(original);assert.deepEqual(original,snapshot);assert.equal(upgraded.warehouseStatus,'paused');assert.equal(upgraded.docs[0].status,'Đã huỷ');assert.deepEqual(upgraded.items.slice(0,original.items.length),original.items);assert.deepEqual(upgraded.cases[0],original.cases[0]);assert.ok(upgraded.events.some(e=>e.text==='User action retained'));assert.equal(applyScannerDesignFixtures(upgraded),upgraded);
});
test('historical PX-0004 does not collide with next transaction; scan/submit does not post stock',()=>{
 const db=seedScannerDesignStore();const input={kind:'out',name:'New request',recipient:'A',phone:'',address:'',group:'',note:'',lines:[{code:'MAY-001',qty:1}],key:'new-request'};
 const submitted=createDocument(db,input,actor);assert.equal(submitted.docs[0].id,'PX-0005');assert.equal(new Set(submitted.docs.map(d=>d.id)).size,submitted.docs.length);assert.equal(submitted.items.find(i=>i.code==='MAY-001').qty,1);
 assert.deepEqual(submitted.docs.find(d=>d.id==='PX-0004'),db.docs.find(d=>d.id==='PX-0004'));
 const posted=postDocument(submitted,'PX-0005',actor);assert.equal(posted.items.find(i=>i.code==='MAY-001').qty,0);
});
