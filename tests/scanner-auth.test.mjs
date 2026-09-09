import test from 'node:test';
import assert from 'node:assert/strict';
import {guardRoute,parseRoute,routeHash,privateViews,validSession} from '../lib/scanner-auth.ts';
test('all private routes fail closed for absent, expired, malformed sessions',()=>{
 for(const view of [...privateViews,'shift'])for(const session of [null,{}, {userId:'preview-minhanh',name:'Minh Anh',role:'Chỉ xem',shiftStarted:true,expiresAt:0}]) assert.equal(guardRoute({view,id:'BH-001',product:'MAY-001'},session).view,'login');
});
test('shift gate and URL context are deterministic',()=>{
 const s={userId:'preview-minhanh',name:'Minh Anh',role:'Nhân viên kho',roleCode:'WAREHOUSE_STAFF',permissions:[],expiresAt:Date.now()+60000,shiftStarted:false};
 assert.ok(validSession(s));for(const view of privateViews)assert.equal(guardRoute({view,id:'',product:''},s).view,'shift');
 s.shiftStarted=true;assert.equal(guardRoute(parseRoute('#doc?id=PN-0001'),s).id,'PN-0001');
 assert.equal(guardRoute(parseRoute('#doc'),s).view,'docs');assert.equal(guardRoute(parseRoute('#product'),s).view,'lookup');
 assert.deepEqual(parseRoute(routeHash({view:'product',id:'',product:'MAY-001'})),{view:'product',id:'',product:'MAY-001'});
});
