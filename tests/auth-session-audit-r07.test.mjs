import test from 'node:test';
import assert from 'node:assert/strict';
import {bindLoginExperience,warehousePresentation,syncConfirmation} from '../docs/flows/auth-session/experience.mjs';
import {createAuthFlow} from '../docs/flows/auth-session/auth-flow.mjs';
import {createFixtureAdapter} from '../docs/flows/auth-session/fixture-adapter.mjs';

function formFixture(){
  const nodes=Object.fromEntries(['username','password','toggle-password','password-caps'].map(id=>[id,new EventTarget()]));
  nodes['password-caps'].hidden=true;
  const form=new EventTarget();form.querySelector=selector=>nodes[selector.slice(1)];
  return {form,nodes};
}
test('cancelled composition cannot keep login locked after focus leaves a field',()=>{
  const {form}=formFixture(),binding=bindLoginExperience(form);
  form.dispatchEvent(new Event('compositionstart'));assert.equal(binding.isComposing(),true);
  form.dispatchEvent(new Event('focusout'));assert.equal(binding.isComposing(),false);
});
test('Enter during active composition remains prevented, including keyCode229',()=>{
  for(const flags of [{isComposing:true},{keyCode:229}]){
    const {form}=formFixture();bindLoginExperience(form);
    const event=new Event('keydown',{cancelable:true});Object.assign(event,{key:'Enter',...flags});
    form.dispatchEvent(event);assert.equal(event.defaultPrevented,true);
  }
});
test('Caps Lock blur requests layout exactly when the hint disappears',()=>{
  const {form,nodes}=formFixture();let calls=0;bindLoginExperience(form,{onLayout:()=>calls++});
  const event=new Event('keyup');event.getModifierState=()=>true;
  nodes.password.dispatchEvent(event);assert.equal(nodes['password-caps'].hidden,false);assert.equal(calls,1);
  nodes.password.dispatchEvent(new Event('blur'));assert.equal(nodes['password-caps'].hidden,true);assert.equal(calls,2);
  nodes.password.dispatchEvent(new Event('blur'));assert.equal(calls,2);
});
test('unknown warehouse never receives the active or stopped label/tone',()=>{
  assert.deepEqual(warehousePresentation(true),{label:'Đang hoạt động',tone:''});
  assert.deepEqual(warehousePresentation(false),{label:'Ngừng hoạt động',tone:'stopped'});
  for(const value of [null,undefined,1,'false'])assert.deepEqual(warehousePresentation(value),{label:'Chưa xác minh',tone:'unverified'});
});
test('confirmation sync updates badge and full source strings without replacing nodes',()=>{
  const selectors=['.auth-greeting-name','.identity .avatar','.identity strong','.identity p','.warehouse strong','.warehouse .badge','.warehouse .badge-label'];
  const nodes=new Map(selectors.map(s=>[s,{textContent:'old',classList:{toggle(name,value){this[name]=value;}}}]));
  const root={querySelector:s=>nodes.get(s)},session={actor:{name:'Tên '+ '長'.repeat(2000),initials:'TN',role:'Vai trò'},warehouse:{name:'Kho\nA<&>',active:false}};
  syncConfirmation(root,session);assert.equal(nodes.get('.warehouse .badge-label').textContent,'Ngừng hoạt động');assert.equal(nodes.get('.warehouse .badge').classList.stopped,true);
  assert.equal(nodes.get('.identity strong').textContent,session.actor.name);assert.equal(nodes.get('.warehouse strong').textContent,'Kho\nA<&>');
  session.warehouse.active=undefined;syncConfirmation(root,session);assert.equal(nodes.get('.warehouse .badge').classList.stopped,false);assert.equal(nodes.get('.warehouse .badge').classList.unverified,true);
});
test('reopening UNKNOWN information cannot make the controller start again',async()=>{
  const adapter=createFixtureAdapter({scenario:'start-unknown',delay:0});let calls=0;const original=adapter.startShift;
  adapter.startShift=s=>{calls++;return original(s);};const flow=createAuthFlow(adapter);
  await flow.login({username:'minhanh',password:'preview'});await flow.start();const before=flow.snapshot();
  await flow.start();await flow.start();assert.equal(calls,1);assert.deepEqual(flow.snapshot(),before);
});
