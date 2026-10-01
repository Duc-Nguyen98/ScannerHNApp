import test from 'node:test';
import assert from 'node:assert/strict';
import {detailStatus,renderHistoryDetail} from '../docs/flows/history/history-detail.mjs';
import {moveCalendarDate} from '../docs/flows/history/history-picker.mjs';
import {businessRows,BUSINESS_CONFIG} from '../docs/flows/history/business-history-data.mjs';

test('Known warranty received/handover states never render as unknown or completed',()=>{
 for(const [id,tone]of [['BH-003','processing'],['BH-005','waiting']]){
  const r=businessRows('warranty').find(r=>r.id===id),html=renderHistoryDetail(r,'info',n=>`<svg data-icon="${n}"></svg>`,{statuses:BUSINESS_CONFIG.warranty.statuses});
  assert.equal(detailStatus(r.status).tone,tone);assert.match(html,new RegExp('p08-detail-status '+tone));assert.doesNotMatch(html,/p08-detail-status (unknown|linked)/);
 }
});
test('Calendar keyboard follows real dates across month/leap boundaries without selecting or exceeding bounds',()=>{
 const bounds={min:'2026-07-01',max:'2026-09-29'};
 assert.equal(moveCalendarDate('2026-09-01','ArrowLeft',bounds),'2026-08-31');
 assert.equal(moveCalendarDate('2026-08-31','ArrowRight',bounds),'2026-09-01');
 assert.equal(moveCalendarDate('2026-09-03','ArrowUp',bounds),'2026-08-27');
 assert.equal(moveCalendarDate('2026-09-28','ArrowDown',bounds),'2026-09-29');
 assert.equal(moveCalendarDate('2026-07-01','ArrowLeft',bounds),'2026-07-01');
 assert.equal(moveCalendarDate('2024-03-01','ArrowLeft',{min:'2024-01-01',max:'2024-03-20'}),'2024-02-29');
});
