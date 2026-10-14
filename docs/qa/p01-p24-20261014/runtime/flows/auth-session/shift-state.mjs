import {requireP14,uuid,iso,record} from '../recovery-shift/api-contract.mjs';

export const SHIFT_LIFECYCLE=Object.freeze({contract:'p01-p14-lifecycle-v1',revision:'p01-p14-safety-r2',source:'026f4f758da5e5ef8c16096ad5ec5cc963b37dba'});
const clone=v=>structuredClone(v);
const identity=c=>JSON.stringify([c?.actorId,c?.authSessionId,c?.warehouseId]);
export function parseCurrentShift(body,owner,{source='current'}={}){
 requireP14(body?.success===true&&Object.hasOwn(body,'data')&&['current','start'].includes(source),'SHIFT_RESPONSE_INVALID');
 if(body.data===null){requireP14(source==='current','SHIFT_RESPONSE_INVALID');return null;}
 const d=body.data,l=d?.lifecycle;
 requireP14(record(d)&&[d.shift_id,d.actor_id,d.auth_session_id,d.warehouse_id].every(uuid)&&d.actor_id===owner?.actorId&&d.auth_session_id===owner?.authSessionId&&d.warehouse_id===owner?.warehouseId,'SHIFT_IDENTITY_MISMATCH');
 requireP14(['ACTIVE','ENDED'].includes(d.status)&&Number.isSafeInteger(d.version)&&d.version>0&&iso(d.started_at)&&d.preview_ready===(d.status==='ACTIVE')&&(d.status==='ACTIVE'?d.ended_at===null:iso(d.ended_at)),'SHIFT_RESPONSE_INVALID');
 requireP14(d.tracking_contract===null||d.tracking_contract==='p14-shift-v1','SHIFT_TRACKING_INVALID');
 requireP14(record(l)&&l.contract===SHIFT_LIFECYCLE.contract&&['DISABLED','ENABLED','DRAINING'].includes(l.mode)&&l.owner_coverage==='PARTIAL_EXPLICIT_OWNER_PROTOCOLS'&&l.end_readiness==='REQUIRES_CLOSE_CHECK_AND_LOCAL_CLEAN'&&l.local_state_verified===false&&l.legacy_upgrade_allowed===false,'SHIFT_LIFECYCLE_INVALID');
 const tracked=d.tracking_contract==='p14-shift-v1';
 const reason=d.status==='ENDED'?'SHIFT_ALREADY_ENDED':!tracked?'SHIFT_TRACKING_INCOMPLETE':l.mode==='DISABLED'?'P14_SHIFT_NOT_ENABLED':null;
 requireP14(l.tracking_status===(tracked?'TRACKED':'LEGACY_UNTRACKED')&&l.end_supported===(reason===null)&&l.end_unavailable_reason===reason,'SHIFT_LIFECYCLE_INVALID');
 return {shift_id:d.shift_id,actor_id:d.actor_id,auth_session_id:d.auth_session_id,warehouse_id:d.warehouse_id,status:d.status,version:d.version,started_at:d.started_at,ended_at:d.ended_at,preview_ready:d.preview_ready,tracking_contract:d.tracking_contract,lifecycle:clone(l)};
}

// Auth owner owns this instance. Rendering or navigation never creates a shift.
// END references survive current:null/logout; no journal or legacy upgrade here.
export function createShiftState({getAuthContext,onChange=()=>{}}){
 let shift=null,bound=null,phase='NONE',currentVerified=false,endRef=null,receipt=null,revision=0;
 const listeners=new Set(),archived=[];
 const currentScope=()=>{const c=getAuthContext();requireP14(c?.authenticated===true&&[c.actorId,c.authSessionId].every(uuid),'AUTH_CONTEXT_REQUIRED');return c;};
 const writeContextReady=()=>{try{const c=currentScope();return c.warehouseStatus==='ACTIVE'&&c.contextStatus==='READY'&&Array.isArray(c.rights)&&['inbound.view','outbound.view','warranty.view','warranty.manage','sku.view','physical_code.assign_rfid'].some(r=>c.rights.includes(r));}catch{return false;}};
 const same=()=>{try{return bound===identity(currentScope());}catch{return false;}};
 function snapshot(){const visible=same();return {contract:SHIFT_LIFECYCLE.contract,revision:SHIFT_LIFECYCLE.revision,phase:visible?phase:'DETACHED',shift:visible&&shift?clone(shift):null,currentVerified:visible&&currentVerified,pendingEnd:!!endRef&&!receipt,endRequest:visible&&endRef?clone(endRef):null,endedReceipt:visible&&receipt?clone(receipt):null,localRevision:revision,writeBarrier:!canBeginOperation()};}
 function emit(){revision++;const s=snapshot();onChange(s);for(const f of listeners)f(s);}
 function canBeginOperation(){return same()&&writeContextReady()&&currentVerified&&phase==='ACTIVE'&&shift?.status==='ACTIVE'&&!(shift.tracking_contract==='p14-shift-v1'&&shift.lifecycle.mode==='DISABLED');}
 return {
  snapshot,subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
  localStateChanged(){emit();},
  context(){const c=clone(currentScope());if(!same()||!shift)return {...c,shiftId:null,shiftStatus:'NONE',shiftVersion:null,trackingContract:null,lifecycle:null};return {...c,shiftId:shift.shift_id,shiftStatus:shift.status,shiftVersion:shift.version,trackingContract:shift.tracking_contract,lifecycle:clone(shift.lifecycle),startedAt:shift.started_at,currentVerified};},
  install(body,source='current'){
   const c=currentScope(),value=parseCurrentShift(body,c,{source}),key=identity(c);
   requireP14(!endRef||receipt||bound===key,'END_REQUEST_SESSION_MISMATCH');
   if(bound&&bound!==key&&receipt){archived.push({endRef:clone(endRef),receipt:clone(receipt)});endRef=null;receipt=null;shift=null;phase='NONE';}
   if(value===null){
    currentVerified=false;
    if(endRef&&!receipt){emit();return snapshot();}
    if(receipt&&bound===key){phase='ENDED';emit();return snapshot();}
    shift=null;bound=key;phase='NONE';emit();return snapshot();
   }
   if(bound===key&&shift){requireP14(value.shift_id===shift.shift_id||source==='start'&&phase==='ENDED'&&!!receipt,'SHIFT_REPLACEMENT_NOT_ALLOWED');if(value.shift_id!==shift.shift_id){archived.push({endRef:clone(endRef),receipt:clone(receipt)});endRef=null;receipt=null;}}
   if(endRef&&!receipt)requireP14(value.shift_id===endRef.shiftId,'END_REQUEST_SESSION_MISMATCH');
   const preserveBarrier=bound===key&&['CLOSING','END_UNKNOWN'].includes(phase);
   shift=value;bound=key;currentVerified=true;
   phase=receipt&&value.shift_id===receipt.shift_id?'ENDED':preserveBarrier?phase:value.status;
   emit();return snapshot();
  },
  beginClose(){requireP14(same()&&currentVerified&&shift?.status==='ACTIVE','SHIFT_NOT_ACTIVE');requireP14(shift.tracking_contract==='p14-shift-v1','SHIFT_TRACKING_INCOMPLETE');requireP14(!endRef&&!receipt,'END_REQUEST_LOCKED');phase='CLOSING';emit();return snapshot();},
  assertCloseScope(){requireP14(same()&&currentVerified&&phase==='CLOSING'&&shift?.status==='ACTIVE','SHIFT_CLOSE_SCOPE_CHANGED');requireP14(shift.lifecycle.end_supported&&shift.lifecycle.mode!=='DISABLED',shift.lifecycle.end_unavailable_reason||'P14_SHIFT_NOT_ENABLED');},
  cancelClose(){requireP14(!endRef&&!receipt,'END_REQUEST_LOCKED');if(phase==='CLOSING'){phase=shift.status;emit();}},
  captureEnd(ref){this.assertCloseScope();requireP14(uuid(ref?.requestId)&&ref.shiftId===shift.shift_id&&ref.actorId===shift.actor_id&&ref.authSessionId===shift.auth_session_id&&ref.warehouseId===shift.warehouse_id&&ref.expectedVersion===shift.version,'END_RECEIPT_MISMATCH');endRef=clone(ref);phase='END_UNKNOWN';emit();},
  rejectEnd(){requireP14(endRef&&!receipt,'END_REQUEST_REQUIRED');archived.push({endRef:clone(endRef),outcome:'CONFIRMED_REJECTION'});endRef=null;phase='CLOSING';emit();},
  confirmEnd(value){
   requireP14(same()&&endRef&&value.actor_id===endRef.actorId&&value.auth_session_id===endRef.authSessionId&&value.warehouse_id===endRef.warehouseId&&value.shift_id===endRef.shiftId&&value.request_id===endRef.requestId&&value.version===endRef.expectedVersion+1&&value.command==='END'&&value.outcome==='SUCCEEDED'&&value.status==='ENDED'&&value.login_preserved===true,'END_RECEIPT_MISMATCH');
   receipt=clone(value);shift={...shift,status:'ENDED',version:value.version,ended_at:value.ended_at,preview_ready:false,lifecycle:{...shift.lifecycle,end_supported:false,end_unavailable_reason:'SHIFT_ALREADY_ENDED'}};phase='ENDED';currentVerified=false;emit();
  },
  canBeginOperation,
  assertOwnerMutation({command,existing=false}={}){requireP14(same()&&writeContextReady()&&shift,'SHIFT_NOT_ACTIVE');if(shift.tracking_contract==='p14-shift-v1')requireP14(shift.lifecycle.mode!=='DISABLED','P14_SHIFT_NOT_ENABLED');if(phase==='CLOSING'&&existing&&command==='SAVE')return;requireP14(canBeginOperation(),'SHIFT_NEW_OPERATION_BLOCKED');},
  invalidate(){currentVerified=false;emit();},
 };
}
