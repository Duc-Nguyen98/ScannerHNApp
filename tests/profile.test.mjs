import test from 'node:test';
import assert from 'node:assert/strict';
import {readProfile,editableDraft,isProfileDirty,prepareProfilePatch,permissionState,profileIntent,createProfilePreviewAdapter} from '../docs/flows/profile/profile-model.mjs';
import {FIXTURE_NAMESPACE} from '../docs/flows/auth-session/fixture-adapter.mjs';
const session={namespace:FIXTURE_NAMESPACE,actor:{id:'fixture-minhanh',name:'Minh Anh',initials:'MA',role:'Nhân viên kho'},warehouse:{id:'fixture-hoa-nam',name:'Kho Hoa Nam'},permissions:{warehouseOperations:true}};
test('P10 reads identity from session, B10 contact isolated by actor AND namespace',()=>{
  assert.equal(readProfile(session).phone,'0901 234 567');
  assert.equal(readProfile({...session,namespace:'production'}).phone,undefined);
  const other=readProfile({...session,actor:{...session.actor,id:'fixture-lan',name:'Lan Nguyễn'}});
  assert.equal(other.name,'Lan Nguyễn');assert.equal(other.email,undefined);assert.equal(readProfile(null),null);
});
test('P10 allowlist rejects forged immutable identity and preserves Vietnamese raw input',()=>{
  const p=readProfile(session),d={...editableDraft(p),name:'Nguyễn Minh Ánh',phone:'0909 123 456',role:'admin',email:'x',warehouse:'x',id:'x',permissions:{inbound:true}};
  assert.deepEqual(prepareProfilePatch(p,d),{name:'Nguyễn Minh Ánh',phone:'0909 123 456'});
  assert.equal(isProfileDirty(p,d),true);assert.equal(isProfileDirty(p,editableDraft(p)),false);
});
test('P10 does not infer individual grants from warehouseOperations or a role label',()=>{
  assert.ok(Object.values(readProfile(session).permissions).every(v=>v===null));
  assert.equal(permissionState(true),'granted');assert.equal(permissionState(false),'denied');assert.equal(permissionState('true'),'unknown');
});
test('P10 missing profile/upload contracts return BLOCKED and never mutate input/session',async()=>{
  const before=structuredClone(session),adapter=createProfilePreviewAdapter();
  assert.equal((await adapter.save({name:'Changed'})).kind,'blocked');assert.equal((await adapter.uploadAvatar()).kind,'blocked');
  assert.deepEqual(session,before);
});
test('P10 routes password/session to exact P11 panels, shift P14 with caller and identity',()=>{
  const caller='#p02/profile?panel=4';
  assert.equal(profileIntent('password',session,caller).panel,'P11.S01');assert.equal(profileIntent('sessions',session,caller).panel,'P11.S04');
  const intent=profileIntent('shift',session,'#p02/profile');assert.equal(intent.target,'P14');assert.equal(intent.actorId,session.actor.id);assert.equal(intent.returnTo,'#p02/profile');assert.equal(profileIntent('logout',session,caller),null);
});
