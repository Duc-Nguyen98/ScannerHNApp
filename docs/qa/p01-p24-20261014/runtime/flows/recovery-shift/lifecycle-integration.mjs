import {createShiftState} from '../auth-session/shift-state.mjs';
import {createP14OwnerRegistry} from './owner-registry.mjs';
import {createP14CandidateClient,createP14DevTestClient} from './api-client.mjs';
import {createP14PreparedSource} from './api-source.mjs';
import {requireP14} from './api-contract.mjs';

// One instance owned by the P01 auth adapter; Home and P14 share it. No gate or
// recovery activation, credential storage, login or automatic START is added.
export function createP01P14Lifecycle({getAuthContext,getAccessToken,transport,readCurrent=null,timeoutMs=12000,onSystemError=()=>{}}){
 requireP14(typeof getAuthContext==='function'&&typeof getAccessToken==='function','AUTH_OWNER_REQUIRED');
 const shiftState=createShiftState({getAuthContext}),owners=createP14OwnerRegistry({shiftState});
 let systemErrorHandler=onSystemError;
 let currentReader=readCurrent;
 const refreshCurrent=async()=>{requireP14(typeof currentReader==='function','CURRENT_SOURCE_UNAVAILABLE');const response=await currentReader();return shiftState.install(response,'current');};
 const entries=new Map();let activeEntry=null;
 function currentEntry(){
  let c;try{c=shiftState.context();}catch{if(activeEntry)return activeEntry;}
  if(!c?.shiftId&&shiftState.snapshot().pendingEnd&&activeEntry)return activeEntry;
  const key=JSON.stringify([c?.actorId,c?.authSessionId,c?.warehouseId,c?.shiftId]);
  if(!entries.has(key)){
   const options={transport,getContext:()=>shiftState.context(),getAccessToken,timeoutMs};
   const client=transport?.mockOnly?createP14CandidateClient(options):createP14DevTestClient(options);
   const source=createP14PreparedSource({client,kind:'shift',shiftState,refreshCurrent,getInventory:owners.inventory,saveOwner:owners.save,reconcileOwners:owners.reconcile,onSystemError:error=>systemErrorHandler(error)});
   entries.set(key,{client,source});
  }
  activeEntry=entries.get(key);return activeEntry;
 }
 // Each explicit START identity gets its own protocol state. Historical and
 // UNKNOWN entries remain private; a new key/shift is never generated here.
 const source={mode:transport?.mockOnly?'MOCK_PREPARATION':'DEV_TEST',subscribe:fn=>shiftState.subscribe(fn),snapshot:()=>currentEntry().source.snapshot()};
 for(const method of ['beginClose','cancelClose','run','check','invalidate','moreSummary','resumeSession'])source[method]=(...args)=>currentEntry().source[method](...args);
 source.deactivate=()=>{for(const entry of entries.values())entry.source.deactivate();};
 const recoveryDisabled={mode:source.mode,snapshot:()=>({candidate:true,kind:'recovery',busy:false,pending:null,recovery:null,usernameInput:'',error:null}),async run(){return {kind:'candidate-error',code:'RECOVERY_SUPPORT_UNAVAILABLE',status:503,unknown:false};},check(){return this.run();},deactivate(){},resumeSession(){return true;}};
 return {
  contract:'p01-p14-lifecycle-v1',revision:'p01-p14-safety-r2',gateEnabled:false,
  setCurrentReader(fn){requireP14(typeof fn==='function','CURRENT_SOURCE_UNAVAILABLE');currentReader=fn;},setSystemErrorHandler(fn){requireP14(typeof fn==='function','AUTH_OWNER_REQUIRED');systemErrorHandler=fn;},shiftState,owners,get client(){return currentEntry().client;},source,recoverySource:recoveryDisabled,
  installStart(body){return shiftState.install(body,'start');},installCurrent(body){return shiftState.install(body,'current');},
  requestClose(){source.beginClose();},
  dispose(){source.deactivate();},
 };
}
