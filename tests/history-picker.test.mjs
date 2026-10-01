import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDate,monthDays,initialPickerDates,validatePickerDates,selectableDateBounds,todayRangeDraft} from '../docs/flows/history/history-picker.mjs';
test('P08 custom date parser validates exact calendar dates, blank and leap years',()=>{
 for(const [text,expected] of [['',''],['09/09/2026','2026-09-09'],['29/02/2024','2024-02-29'],['29/02/2026',null],['31/04/2026',null],['01/13/2026',null],['00/09/2026',null],['2026-09-09',null],['01/01/0000',null]])assert.equal(parseDate(text),expected);
 assert.deepEqual(monthDays(2026,8),{offset:1,count:30});assert.equal(monthDays(2024,1).count,29);assert.equal(monthDays(2026,1).count,28);
});
test('Filter draft defaults to actual Vietnam today without changing committed all-days filters',()=>{
 const f={from:'',to:''};
 const a=initialPickerDates(f,undefined,new Date('2026-09-27T05:00:00Z'));
 assert.equal(a.from,'27/09/2026');assert.equal(a.to,'27/09/2026');assert.deepEqual(f,{from:'',to:''});
 assert.equal(initialPickerDates(f,undefined,new Date('2025-09-27T05:00:00Z')).from,'27/09/2025');
 assert.equal(initialPickerDates(f,undefined,new Date('2026-09-27T17:01:00Z')).from,'28/09/2026');
 assert.equal(initialPickerDates({from:'2026-09-08',to:'2026-09-09'},undefined).from,'08/09/2026');
 assert.equal(initialPickerDates({from:'',to:'2026-09-09'},undefined).from,'');
});
test('Live validation flags both reverse endpoints, permits equality/empty, blocks invalid calendar dates',()=>{
 const b={min:'2026-06-29',max:'2026-09-27'};
 assert.deepEqual(validatePickerDates({from:'09/09/2026',to:'09/09/2026'},'filter',b).errors,{});
 const bad=validatePickerDates({from:'10/09/2026',to:'09/09/2026'},'filter',b).errors;
 assert.match(bad.from,/sau/);assert.match(bad.to,/trước/);
 for(const from of ['28/06/2026','28/09/2026','31/02/2026','09/0'])assert.ok(validatePickerDates({from,to:'27/09/2026'},'filter',b).errors.from);
 assert.deepEqual(validatePickerDates({from:'',to:''},'filter',b).errors,{});
 assert.deepEqual(validatePickerDates({from:'',to:'27/09/2026'},'filter',b).errors,{});
});
test('Each calendar intersects global90-day boundary with the opposite valid endpoint',()=>{
 const b={min:'2026-06-29',max:'2026-09-27'},d={from:'08/09/2026',to:'09/09/2026'};
 assert.deepEqual(selectableDateBounds('from',d,b),{min:b.min,max:'2026-09-09'});
 assert.deepEqual(selectableDateBounds('to',d,b),{min:'2026-09-08',max:b.max});
 assert.deepEqual(selectableDateBounds('from',{from:'',to:'31/02/2026'},b),b);
 assert.deepEqual(selectableDateBounds('to',{from:'',to:''},b),b);
});
test('Reset draft has actual Vietnam today in both fields, including midnight/year boundary',()=>{
 assert.deepEqual(todayRangeDraft(new Date('2026-09-27T05:00:00Z')),{from:'27/09/2026',to:'27/09/2026'});
 assert.deepEqual(todayRangeDraft(new Date('2026-09-27T17:00:00Z')),{from:'28/09/2026',to:'28/09/2026'});
 assert.deepEqual(todayRangeDraft(new Date('2026-12-31T17:00:00Z')),{from:'01/01/2027',to:'01/01/2027'});
});
