import {parseCurrentShift} from '../auth-session/shift-state.mjs';
import {P14ApiError,requireP14,uuid,record,iso,parseCloseCheck,responseError} from './api-contract.mjs';
import {P14_DEV_TEST,createP14DevTransport} from './dev-transport.mjs';

export function parseP14DevContext(me,p03,current,generation){
 const m=me?.data,p=p03?.data,d=current?.data;
 requireP14(me?.success===true&&p03?.success===true&&current?.success===true&&record(m)&&record(p)&&p03.meta?.contract==='mini-app-p03-v1','AUTH_CONTEXT_REQUIRED');
 requireP14(uuid(m.user_id)&&uuid(m.auth_session_id)&&m.status==='ACTIVE'&&Number.isSafeInteger(m.version)&&m.version>0&&m.auth_session_id===p.auth_session_id&&m.active_warehouse_id===p.active_warehouse_id&&Array.isArray(m.permissions)&&m.permissions.every(v=>typeof v==='string'),'AUTH_CONTEXT_REQUIRED');
 const warehouse=Array.isArray(p.available_warehouses)?p.available_warehouses.find(w=>w.warehouse_id===p.active_warehouse_id):null;
 if(p.warehouse_context?.status==='READY')requireP14(uuid(p.active_warehouse_id)&&warehouse?.status==='ACTIVE','AUTH_CONTEXT_REQUIRED');
 const c={actorId:m.user_id,authSessionId:m.auth_session_id,warehouseId:p.active_warehouse_id,authenticated:true,generation,userVersion:m.version,rights:[...m.permissions],warehouseStatus:warehouse?.status??null,contextStatus:p.warehouse_context?.status??null,shiftId:null,shiftStatus:'NONE',shiftVersion:null,trackingContract:null,actorName:m.display_name??null,actorRole:null,warehouseName:warehouse?.name??null,startedAt:null};
 if(d!==null){const parsed=parseCurrentShift(current,c);c.lifecycle=parsed.lifecycle;c.trackingContract=parsed.tracking_contract;requireP14(record(d)&&uuid(d.shift_id)&&d.actor_id===c.actorId&&d.auth_session_id===c.authSessionId&&d.warehouse_id===c.warehouseId&&d.status==='ACTIVE'&&d.preview_ready===true&&Number.isSafeInteger(d.version)&&d.version>0&&iso(d.started_at)&&d.ended_at===null,'CURRENT_SHIFT_MISMATCH');Object.assign(c,{shiftId:d.shift_id,shiftStatus:d.status,shiftVersion:d.version,startedAt:d.started_at});}
 // START/current provide lifecycle/tracking. Protocol support is not CLEAN or can_end.
 return c;
}

// Browser cookie login with ACCESS in memory. No automatic refresh/relogin,
// switch-context, shift start, logout or business request. Disconnect is local.
export function createP14DevSession({fetchImpl=globalThis.fetch}={}){
 let access=null,context=null,lastCurrent=null,generation=0,busy=false;
 const health=createP14DevTransport({fetchImpl});
 async function json(path,options={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000),captured=access,key=generation;
  try{
   const r=await fetchImpl(P14_DEV_TEST.origin+path,{method:'GET',headers:{Accept:'application/json',...(captured?{Authorization:'Bearer '+captured}:{})},credentials:'omit',redirect:'error',cache:'no-store',...options,signal:controller.signal});
   requireP14(key===generation&&captured===access,'STALE_CONTEXT');requireP14(!r.redirected&&(!r.url||r.url===P14_DEV_TEST.origin+path),'UNAPPROVED_REDIRECT');
   requireP14(r.headers.get('content-type')?.split(';')[0]==='application/json','INVALID_RESPONSE_TYPE');const b=await r.json();
   requireP14(key===generation&&captured===access,'STALE_CONTEXT');if(!r.ok||b.success!==true)throw responseError(b,r.status);return b;
  }catch(e){throw e instanceof P14ApiError?e:new P14ApiError('AUTH_TRANSPORT_UNAVAILABLE');}finally{clearTimeout(timer);}
 }
 async function refreshContext(){
  requireP14(access,'ACCESS_TOKEN_REQUIRED');const key=generation;
  const [me,p03,current]=await Promise.all([json('/api/v1/auth/me'),json('/api/v1/mini-app/p03/context'),json('/api/v1/mini-app/work-shifts/current')]);
  const value=parseP14DevContext(me,p03,current,key);requireP14(key===generation,'STALE_CONTEXT');context=value;lastCurrent=structuredClone(current);return structuredClone(value);
 }
 return {
  async login({email,password}){
   requireP14(!busy&&typeof email==='string'&&typeof password==='string','AUTH_INPUT_REQUIRED');busy=true;access=null;context=null;lastCurrent=null;generation++;const key=generation;
   try{await health.verify({signal:AbortSignal.timeout(12000)});requireP14(key===generation,'STALE_CONTEXT');
    const r=await json('/api/v1/auth/login',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email,password})});
    requireP14(typeof r.data?.access_token==='string'&&r.data.access_token.length>0&&r.data?.mfa_required!==true&&!Object.hasOwn(r.data,'refresh_token'),'AUTH_NOT_COMPLETE');access=r.data.access_token;return await refreshContext();
   }catch(e){if(key===generation){access=null;context=null;}throw e;}finally{busy=false;}
  },
  async refreshContext(){requireP14(!busy,'AUTH_READ_BUSY');busy=true;context=null;lastCurrent=null;try{return await refreshContext();}finally{busy=false;}},
  async verifyTracking(){
   requireP14(context&&uuid(context.shiftId)&&uuid(context.warehouseId)&&context.contextStatus==='READY'&&context.warehouseStatus==='ACTIVE','NO_ACTIVE_TEST_SHIFT');
   const key=generation,c=structuredClone(context);await health.verify({signal:AbortSignal.timeout(12000)});
   const b=await json(`/api/v1/mini-app/work-shifts/${c.shiftId}/close-check?warehouse_id=${c.warehouseId}`),value=parseCloseCheck(b,c);
   requireP14(key===generation&&JSON.stringify(context)===JSON.stringify(c),'STALE_CONTEXT');
   requireP14(value.can_end&&!value.blockers.length,'SHIFT_READINESS_BLOCKED');requireP14(c.trackingContract==='p14-shift-v1'&&c.lifecycle?.end_supported,'SHIFT_TRACKING_INCOMPLETE');
   // Do not expose or reuse this token: the protocol client obtains a fresh
   // close-check only after the complete local owner inventory is validated.
   return {canEndScope:value.can_end_scope,draftCount:value.draft_count,trackingVerified:true};
  },
  getContext:()=>context?structuredClone(context):null,getCurrentResponse:()=>lastCurrent?structuredClone(lastCurrent):null,getAccessToken:()=>access,
  disconnect(){generation++;access=null;context=null;lastCurrent=null;},
 };
}
