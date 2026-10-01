import test from 'node:test';
import assert from 'node:assert/strict';
import {queryDateBounds,dateAllowed,validateQueryRange,resolveQueryRange} from '../docs/flows/shared/query-date-policy.mjs';
test('90-day inclusive boundary in Vietnam: today and day90 valid, day91/future locked',()=>{
 const b=queryDateBounds(new Date('2026-09-27T12:00:00Z'));assert.deepEqual(b,{min:'2026-06-29',max:'2026-09-27'});
 for(const d of [b.min,b.max,'2026-07-01'])assert.equal(dateAllowed(d,b),true);
 for(const d of ['2026-06-28','2026-09-28','2026-02-30','0000-01-01'])assert.equal(dateAllowed(d,b),false);
 assert.ok(validateQueryRange({from:'2026-06-28',to:b.max},b));assert.ok(validateQueryRange({from:b.max,to:b.min},b));
 assert.deepEqual(resolveQueryRange({from:'',to:''},b),{from:'',to:''});
 assert.deepEqual(resolveQueryRange({from:'',to:b.max},b),{from:b.min,to:b.max});
 assert.deepEqual(resolveQueryRange({from:b.min,to:''},b),{from:b.min,to:b.max});
});
test('Calendar-day arithmetic crosses Vietnam midnight, leap/month/year boundaries',()=>{
 assert.equal(queryDateBounds(new Date('2026-09-27T16:59:59Z')).max,'2026-09-27');
 assert.equal(queryDateBounds(new Date('2026-09-27T17:00:00Z')).max,'2026-09-28');
 assert.deepEqual(queryDateBounds(new Date('2024-03-01T00:00:00Z')),{min:'2023-12-02',max:'2024-03-01'});
});
