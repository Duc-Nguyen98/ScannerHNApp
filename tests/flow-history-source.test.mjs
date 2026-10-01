import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA,initialFilters,readRange,selectRecords} from '../docs/flows/history/history-model.mjs';
import {historyRows,receiptHistoryId,receiptHistoryRows,linkedHistoryDocument} from '../docs/flows/history/history-source.mjs';
import {DOCUMENTS,recordedDocuments} from '../docs/flows/documents/document-model.mjs';
import {renderHistoryDetail} from '../docs/flows/history/history-detail.mjs';

const session={actor:{id:'actor'},warehouse:{id:'warehouse'}};
const run={recorded:true,outcome:'recorded',document:{documentId:'run-1',number:'PN-0005',warehouseId:'warehouse',actorId:'actor',actorName:'Minh Anh',warehouseName:'Kho Hoa Nam',createdAt:'30/09/2026 14:30'},accepted:[{sku:'A',quantity:2,raw:'BOX-A'}]};
const receipts=r=>recordedDocuments([{type:'inbound',runs:r}],session);
test('only verified, scoped receipts enter the shared history source',()=>{
  for(const changed of [{recorded:false},{outcome:'unknown'},{document:{...run.document,actorId:'other'}},{document:{...run.document,warehouseId:'other'}}])assert.deepEqual(receiptHistoryRows(receipts([{...run,...changed}])),[]);
  const rows=receiptHistoryRows(receipts([run,run]));
  assert.equal(rows.length,1);assert.equal(rows[0].id,receiptHistoryId('run-1'));
  assert.equal(rows[0].sessionId,null);assert.equal(rows[0].events.length,1);assert.equal(rows[0].status,'waiting');
});
test('same display number does not merge distinct B08 and current receipts',()=>{
  const rows=historyRows(receipts([run]));
  assert.equal(rows.length,DATA.records.length+1);
  assert.ok(rows.some(r=>r.id==='LS-0001'));assert.ok(rows.some(r=>r.id===receiptHistoryId('run-1')));
  const all=[...DOCUMENTS,...receipts([run])];
  assert.equal(linkedHistoryDocument(rows[0],all).id,'run-1');
  assert.equal(linkedHistoryDocument(rows.find(r=>r.id==='LS-0001'),all).id,'fixture-inbound-0005');
  assert.equal(linkedHistoryDocument({id:'not-mapped',documentId:'PN-0005'},all),null);
  assert.equal(linkedHistoryDocument(rows[0],[...all,...receipts([run])]),null);
});
test('daily totals and filters include a verified receipt once, without mutating legacy seed',()=>{
  const before=JSON.stringify(DATA),source=historyRows(receipts([run,run]));
  const f={...initialFilters(),from:'2026-09-30',to:'2026-09-30'};
  assert.equal(selectRecords(f,source).length,1);
  assert.equal(readRange(f,{source}).total,1);assert.equal(readRange(f,{source}).groups.inbound,1);
  assert.equal(readRange({...f,from:'2026-10-01',to:'2026-10-01'},{source}).available,false);
  assert.equal(JSON.stringify(DATA),before);
});
test('exact baseline document identity is replaced, not counted twice or given a legacy session',()=>{
  const docs=receipts([{...run,document:{...run.document,documentId:'fixture-inbound-0005'}}]);
  const rows=historyRows(docs,DOCUMENTS);
  assert.equal(rows.length,DATA.records.length);
  assert.equal(rows.some(r=>r.id==='LS-0001'),false);
  assert.equal(rows[0].sessionId,null);
  assert.ok(DATA.records.some(r=>r.id==='LS-0001'));
});
test('known documents/files get real links; unmapped details retain unavailable state',()=>{
  const row=DATA.records.find(r=>r.id==='LS-0001'),icon=()=>'';
  const linked=renderHistoryDetail(row,'attachments',icon,{canOpenDocument:true,canOpenAttachments:true,showDocumentHint:false});
  assert.match(linked,/data-p08="document"/);assert.match(linked,/data-p08="attachments"/);
  assert.doesNotMatch(linked,/Chi tiết chứng từ chưa khả dụng|Chưa có tệp nguồn/);
  assert.doesNotMatch(renderHistoryDetail(row,'info',icon),/data-p08="document"/);
});
