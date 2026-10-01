import test from 'node:test';
import assert from 'node:assert/strict';
import {outboundSourceValues,createOutboundFixtureAdapter,OUTBOUND_SOURCES} from '../docs/flows/outbound/fixture-adapter.mjs';
import {sourceChangeReview,canApplySourceChange} from '../docs/flows/outbound/source-review.mjs';
const session={actor:{id:'user',name:'Người thử'},warehouse:{id:'hn',name:'Kho Hoa Nam'}};
test('source preview values exactly match committed document without reserving identities',()=>{
 const adapter=createOutboundFixtureAdapter();
 for(const source of OUTBOUND_SOURCES){const preview=outboundSourceValues(source.id);for(let i=0;i<4;i++)outboundSourceValues(source.id);const doc=adapter.makeDocument(session,source.id);for(const [key,value]of Object.entries(preview))assert.deepEqual(doc[key],value);}
 assert.equal(adapter.makeDocument(session).documentId,`fixture-outbound-0005-${OUTBOUND_SOURCES.length+1}`);assert.equal(outboundSourceValues('absent'),null);
});
test('review exposes exact values, including invalid current quantity and full note/address',()=>{
 const old={...outboundSourceValues('new'),plannedInput:'1.5',note:'<ghi chú> &\nUnicode tiếng Việt '+ 'X'.repeat(2100),address:'123 Lê Lợi',districtName:'Quận 1',provinceName:'TP. Hồ Chí Minh'};
 const view=sourceChangeReview(old,'demo-0006');for(const str of [old.note,'1.5 → 2','123 Lê Lợi, Quận 1, TP. Hồ Chí Minh','Cửa hàng An Bình','Máy in ZD421'])assert.ok(view.message.includes(str));
 assert.equal(sourceChangeReview(old,'new'),null);assert.equal(sourceChangeReview(old,'absent'),null);
});
test('stale document/version/draft, scanned and UNKNOWN callbacks cannot replace source',()=>{
 const expected={...outboundSourceValues('new'),documentId:'document-1',version:1};
 const snapshot={step:1,document:structuredClone(expected),attempts:[],request:null,unknown:false,busy:false};assert.equal(canApplySourceChange(snapshot,expected),true);
 for(const patch of [{document:{...expected,version:2}},{document:{...expected,note:'new input'}},{document:{...expected,documentId:'document-2'}},{step:2},{busy:true},{request:{requestId:'r'}},{unknown:true},{attempts:[{raw:'HN12345'}]}])assert.equal(canApplySourceChange({...snapshot,...patch},expected),false);
});
