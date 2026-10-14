import {P14ApiError,requireP14,uuid,validateUsername} from './api-contract.mjs';

export const P14_DEV_TEST=Object.freeze({
 origin:'https://khohoanamdev.lptech.info.vn',
 runtimeSHA:'026f4f758da5e5ef8c16096ad5ec5cc963b37dba',
 sourceSHA:'026f4f758da5e5ef8c16096ad5ec5cc963b37dba',
 productionActivation:false,
 readEnabled:true,
 defaultRecoveryWrites:false,
 defaultEndWrites:false,
});
const registered=new WeakSet();
const uuidPath='[0-9a-f-]{36}';
export const isP14DevTransport=value=>registered.has(value);

// Explicit DEV/TEST transport. No arbitrary origin, storage, retry, login,
// refresh, logout, work-shift start or owner writer is exposed here.
export function createP14DevTransport({fetchImpl=globalThis.fetch,getApproval=()=>null}={}){
 requireP14(typeof fetchImpl==='function'&&typeof getApproval==='function','DEV_TRANSPORT_REQUIRED');
 let disposed=false;
 function target(url,options){
  const u=new URL(url),method=options.method||'GET';
  requireP14(u.origin===P14_DEV_TEST.origin&&!u.username&&!u.password&&!u.hash,'UNAPPROVED_ORIGIN');
  const recoveryPost=method==='POST'&&u.pathname==='/api/v1/auth/recovery-requests';
  const recoveryRead=method==='GET'&&new RegExp('^/api/v1/auth/recovery-requests/operations/'+uuidPath+'$','i').test(u.pathname);
  const shiftRead=method==='GET'&&new RegExp('^/api/v1/mini-app/work-shifts/'+uuidPath+'/(close-check|summary|requests/'+uuidPath+')$','i').test(u.pathname);
  const end=method==='POST'&&new RegExp('^/api/v1/mini-app/work-shifts/'+uuidPath+'/end$','i').test(u.pathname);
  requireP14(recoveryPost||recoveryRead||shiftRead||end,'DEV_ROUTE_NOT_ALLOWED');
  requireP14(method!=='GET'||options.body===undefined,'GET_BODY_FORBIDDEN');
  if(recoveryPost||recoveryRead)requireP14(!u.search&&!Object.keys(options.headers||{}).some(k=>/^(authorization|cookie)$/i.test(k)),'RECOVERY_ANONYMOUS_ONLY');
  return {u,recoveryPost,end};
 }
 function approval(command,body,context){
  const a=getApproval();
  if(command==='recovery'){
   validateUsername(body.username);
   requireP14(a?.recovery?.authorized===true&&a.recovery.username===body.username,'DEV_RECOVERY_NOT_AUTHORIZED');
  }else{
   requireP14(a?.end?.authorized===true&&a.end.ownerPolicyVerified===true&&a.end.retentionPolicyVerified===true,'DEV_END_POLICY_PENDING');
   requireP14([a.end.actorId,a.end.authSessionId,a.end.warehouseId,a.end.shiftId].every(uuid)&&context&&['actorId','authSessionId','warehouseId','shiftId'].every(k=>a.end[k]===context[k]),'DEV_END_SCOPE_NOT_AUTHORIZED');
  }
 }
 async function verify(signal){
  requireP14(!disposed,'DISPOSED');
  const r=await fetchImpl(P14_DEV_TEST.origin+'/api/v1/health',{method:'GET',headers:{Accept:'application/json'},credentials:'omit',redirect:'error',cache:'no-store',signal});
  requireP14(!r.redirected&&(!r.url||r.url===P14_DEV_TEST.origin+'/api/v1/health')&&r.status===200,'DEV_RUNTIME_UNAVAILABLE');
  const b=await r.json(),tier=r.headers.get('x-wms-deployment-tier');
  // Cross-origin browsers cannot read an unexposed tier header. Fixed DEV origin
  // plus testing JSON and exact reviewed SHA remain mandatory in that case.
  requireP14(b.success===true&&b.data?.environment==='testing'&&b.data?.build?.sha===P14_DEV_TEST.runtimeSHA&&(tier===null||tier==='dev-test'),'DEV_RUNTIME_MISMATCH');
  requireP14(!disposed&&!signal?.aborted,'STALE_RESULT');
  return {sha:b.data.build.sha,environment:'testing',tier:tier||'dev-test-origin/testing-json'};
 }
 const transport={
  mode:'DEV_TEST',origin:P14_DEV_TEST.origin,
  assertMutation:approval,
  async verify({signal}={}){return verify(signal);},
  async request(url,options){
   requireP14(!disposed,'DISPOSED');const {u,recoveryPost,end}=target(url,options);
   const capturedApproval=end?JSON.stringify(getApproval()?.end):null;
   if(recoveryPost)approval('recovery',JSON.parse(options.body));
   if(end){const a=getApproval();requireP14(a?.end?.shiftId===u.pathname.split('/')[5]&&a.end?.warehouseId===JSON.parse(options.body).warehouse_id,'DEV_END_SCOPE_NOT_AUTHORIZED');}
   await verify(options.signal);
   options.assertCurrent?.();
   if(recoveryPost)approval('recovery',JSON.parse(options.body));
   if(end){const a=getApproval();requireP14(JSON.stringify(a?.end)===capturedApproval,'DEV_END_SCOPE_NOT_AUTHORIZED');approval('end',JSON.parse(options.body),a?.end);}
   const {assertCurrent,...wireOptions}=options;
   return fetchImpl(u.href,{...wireOptions,credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer'});
  },
  dispose(){disposed=true;},
 };
 registered.add(transport);return transport;
}
