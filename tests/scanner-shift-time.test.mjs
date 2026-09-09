import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewAuth} from '../lib/scanner-auth-preview.ts';
const key='hoanam-scanner-preview-session-v1';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const session=()=>({userId:'preview-minhanh',name:'Minh Anh',role:'Nhân viên kho',roleCode:'WAREHOUSE_STAFF',permissions:[],expiresAt:Date.now()+60000,shiftStarted:false});
test('first shift start records time; repeated start/reload/role change preserve it',()=>{
 const s=storage();s.setItem(key,JSON.stringify(session()));const auth=createPreviewAuth(s),before=Date.now();
 const started=auth.startShift();assert.equal(started.shiftStarted,true);assert.ok(started.shiftStartedAt>=before&&started.shiftStartedAt<=Date.now());
 assert.equal(auth.startShift().shiftStartedAt,started.shiftStartedAt);assert.equal(createPreviewAuth(s).read().shiftStartedAt,started.shiftStartedAt);
 auth.changePreviewRole('Chỉ xem');assert.equal(auth.read().shiftStartedAt,started.shiftStartedAt);
});
test('legacy active shift never invents a historical start time',()=>{
 const s=storage();s.setItem(key,JSON.stringify({...session(),shiftStarted:true}));const auth=createPreviewAuth(s);
 assert.equal(auth.startShift().shiftStartedAt,undefined);assert.equal(auth.read().shiftStartedAt,undefined);
});
test('logout/new login resets timestamp; expired session cannot start shift',async()=>{
 const s=storage();s.setItem(key,JSON.stringify(session()));const auth=createPreviewAuth(s);auth.startShift();auth.logout();assert.equal(auth.read(),null);
 const fresh=await auth.login('minhanh','Scanner@2026','normal','Nhân viên kho');assert.equal(fresh.shiftStarted,false);assert.equal(fresh.shiftStartedAt,undefined);
 s.setItem(key,JSON.stringify({...fresh,expiresAt:Date.now()-1}));assert.throws(()=>auth.startShift(),/hết hạn/);
});
