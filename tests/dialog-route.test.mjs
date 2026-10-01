import test from 'node:test';
import assert from 'node:assert/strict';
import {createDialogRoute} from '../docs/flows/shared/dialog-route.mjs';
function setup(){
 const entries=[{hash:'#p02/warranty?panel=2',state:{p09:true}},{hash:'#p02/lookup',state:{p09Return:{journey:'case-1',depth:1}}}];let index=1;
 const location={get hash(){return entries[index].hash;}};
 const history={get state(){return entries[index].state;},pushState(state,_,hash){entries.splice(++index);entries.push({state,hash});},replaceState(state,_,hash){entries[index]={state,hash};},back(){index--;},forward(){index++;}};
 return {history,location,route:createDialogRoute({history,location}),entries,index:()=>index};
}
test('P03 native Back consumes only modal marker and preserves caller identity',()=>{
 const s=setup(),caller=structuredClone(s.history.state);let opened=true;s.route.begin();assert.equal(s.index(),2);s.history.back();
 assert.equal(s.route.navigation(()=>{opened=false;s.route.closed();},()=>opened),true);assert.deepEqual(s.history.state,caller);assert.equal(s.index(),1);s.history.back();assert.equal(s.location.hash,'#p02/warranty?panel=2');
});
test('P03 UI close settles before routing and does not overwrite parent state',async()=>{
 const s=setup(),caller=structuredClone(s.history.state);s.route.begin();s.route.closed();assert.equal(s.route.isClosing(),true);let ready=false;s.route.ready().then(()=>ready=true);await Promise.resolve();assert.equal(ready,false);
 assert.equal(s.route.navigation(()=>{},()=>false),true);await s.route.ready();assert.equal(ready,true);assert.deepEqual(s.history.state,caller);
});
test('busy or stopped dialog re-arms the marker while preserving caller entry',()=>{
 const s=setup(),caller=structuredClone(s.history.state);s.route.begin();s.history.back();s.route.navigation(()=>false,()=>true);assert.equal(s.index(),2);s.history.back();assert.deepEqual(s.history.state,caller);
});
test('disposing a closing modal settles deferred work',async()=>{const s=setup();s.route.begin();s.route.closed();const ready=s.route.ready();s.route.dispose();await ready;assert.equal(s.route.isClosing(),false);});
test('separate P10 modal owner never strips an active P03 marker',()=>{
 const s=setup();s.route.begin();const token=s.history.state.hnScannerDialog;
 const profile=createDialogRoute({history:s.history,location:s.location,key:'hnProfileDialog'});
 assert.equal(profile.navigation(()=>{},()=>false),false);assert.equal(s.history.state.hnScannerDialog,token);
});
test('quick reopen while previous marker is closing creates one new marker',async()=>{
 const s=setup(),caller=structuredClone(s.history.state);s.route.begin();s.route.closed();s.route.begin();s.route.navigation(()=>{},()=>true);await s.route.ready();assert.equal(s.index(),2);assert.ok(s.history.state.hnScannerDialog);s.history.back();assert.deepEqual(s.history.state,caller);
});
test('Exception return adopts an existing marker without duplicate browser history',()=>{
 const s=setup();s.route.begin();const token=s.history.state.hnScannerDialog;s.route.dispose();const resumed=createDialogRoute({history:s.history,location:s.location});resumed.begin({adoptCurrent:true});assert.equal(s.index(),2);assert.equal(s.history.state.hnScannerDialog,token);resumed.closed();assert.equal(s.index(),1);resumed.navigation(()=>{},()=>false);assert.deepEqual(s.history.state,{p09Return:{journey:'case-1',depth:1}});
});
test('Forward to an owned dismissed dialog consumes the ghost entry and keeps caller data',async()=>{
 const s=setup(),caller=structuredClone(s.history.state);s.route.begin();s.route.closed();s.route.navigation(()=>{},()=>false);await s.route.ready();
 s.history.forward();assert.equal(s.index(),2);assert.equal(s.route.navigation(()=>{},()=>false),true);assert.equal(s.index(),1);assert.equal(s.route.isClosing(),true);
 s.route.navigation(()=>{},()=>false);await s.route.ready();assert.deepEqual(s.history.state,caller);s.history.back();assert.equal(s.location.hash,'#p02/warranty?panel=2');
});
test('Unknown stale marker is not allowed to traverse another owner history',()=>{
 const s=setup();s.history.replaceState({...s.history.state,hnScannerDialog:'foreign-token'},'',s.location.hash);
 assert.equal(s.route.navigation(()=>{},()=>false),false);assert.equal(s.index(),1);assert.equal(s.history.state.hnScannerDialog,undefined);
});
