import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecord} from '../docs/flows/history/history-model.mjs';
import {detailStatus,renderHistoryDetail} from '../docs/flows/history/history-detail.mjs';
const icon=name=>'<svg data-icon="'+name+'"></svg>';
test('P08 r05 processing/waiting are not completion; unknown fails closed',()=>{
 assert.deepEqual(detailStatus('processing'),{tone:'processing',icon:'clock',label:'Đang xử lý'});
 assert.equal(detailStatus('waiting').tone,'waiting');assert.equal(detailStatus('bad').label,'Chưa có dữ liệu');
 const html=renderHistoryDetail(readRecord('LS-0026'),'info',icon);assert.doesNotMatch(html,/✓|p08-success|Hoàn thành/);assert.match(html,/Chưa có ghi chú/);assert.match(html,/BH-DEMO-026/);
});
test('P08 r05 exact events and sources preserved; escaped and absent data honest',()=>{
 const r=readRecord('LS-0001'),html=renderHistoryDetail(r,'timeline',icon);
 for(const e of r.events)assert.ok(html.includes(e.id));assert.match(html,/Phiếu đã gửi, chưa ghi sổ/);
 assert.match(renderHistoryDetail(r,'attachments',icon),/Chưa có tệp nguồn/);
 const empty=renderHistoryDetail({...r,actor:null,warehouse:null,note:'<script>bad</script>',documentId:null,events:[]},'info',icon);
 assert.doesNotMatch(empty,/<script>|data-p08="copy"/);assert.match(empty,/&lt;script&gt;/);assert.match(empty,/Chưa có dữ liệu/);
});
