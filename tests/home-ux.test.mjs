import test from 'node:test';
import assert from 'node:assert/strict';
import {pendingWork} from '../docs/flows/home/pending-work.mjs';
import {recentTimeLabel} from '../docs/flows/shared/recent-time.mjs';
const auth={previewReady:true,session:{actor:{id:'a'},warehouse:{id:'w'},permissions:{warehouseOperations:true}}};
const draft={document:{documentId:'D1',number:'PN-1',scanSessionId:'S1',version:2,actorId:'a',warehouseId:'w'},accepted:[{raw:'A'}],busy:false,unknown:false,recorded:false,outcome:null,request:{id:'R1'}};
test('Resume shortcuts keep owner identity and exclude another scope/finished/unverified documents',()=>{
 const before=structuredClone(draft);const rows=pendingWork(auth,[{operation:'inbound',snapshot:draft}]);assert.equal(rows[0].id,'D1');assert.equal(rows[0].scanSessionId,'S1');assert.equal(rows[0].version,2);assert.equal(rows[0].acceptedCount,1);assert.deepEqual(draft,before);
 for(const s of [{...draft,recorded:true},{...draft,outcome:'recorded'},{...draft,document:{...draft.document,actorId:'b'}},{...draft,document:{...draft.document,warehouseId:'other'}},{...draft,document:{...draft.document,scanSessionId:null}}])assert.deepEqual(pendingWork(auth,[{operation:'inbound',snapshot:s}]),[]);
 assert.deepEqual(pendingWork({...auth,previewReady:false},[{operation:'inbound',snapshot:draft}]),[]);
});
test('UNKNOWN and busy work never become normal resume/success and multiple owners remain explicit',()=>{
 const rows=pendingWork(auth,[{operation:'inbound',snapshot:{...draft,unknown:true}},{operation:'outbound',snapshot:{...draft,busy:true,document:{...draft.document,documentId:'D2'}}}]);
 assert.equal(rows.length,2);assert.equal(rows[0].label,'Cần đối chiếu');assert.equal(rows[1].label,'Đang gửi phiếu');assert.equal(rows[1].id,'D2');
 assert.equal(pendingWork(auth,[{operation:'inbound',snapshot:{...draft,outcome:'not-recorded'}}])[0].id,'D1');
});
test('Relative labels use Vietnam midnight, preserve absolute old dates and include older years',()=>{
 const before=Date.parse('2026-09-28T16:59:59Z'),after=Date.parse('2026-09-28T17:00:00Z');
 assert.equal(recentTimeLabel('2026-09-28','08:30',before),'Hôm nay · 08:30');
 assert.equal(recentTimeLabel('2026-09-28','08:30',after),'Hôm qua · 08:30');
 assert.equal(recentTimeLabel('2026-09-29','09:20',after),'Hôm nay · 09:20');
 assert.equal(recentTimeLabel('2026-09-27','08:30',after),'27/09 · 08:30');
 assert.equal(recentTimeLabel('2025-09-28','08:30',after),'28/09/2025 · 08:30');
 assert.equal(recentTimeLabel('2024-02-29','10:00',Date.parse('2024-02-29T17:00:00Z')),'Hôm qua · 10:00');
});
