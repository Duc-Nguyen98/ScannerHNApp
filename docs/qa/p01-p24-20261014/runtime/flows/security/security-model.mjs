// P11 local view-model contract. No production API/schema or password policy is implied.
import {sessionGuard} from '../home/home-flow.mjs';
export {PREVIEW_SECURITY_NAMESPACE as SECURITY_NAMESPACE} from '../auth-session/preview-account-store.mjs';
export function validatePasswords(fields) {
  const errors={};
  for(const name of ['current','next','confirm'])if(typeof fields[name]!=='string'||fields[name].length===0)errors[name]='Vui lòng nhập mật khẩu.';
  if(!errors.confirm&&!errors.next&&fields.confirm!==fields.next)errors.confirm='Mật khẩu xác nhận chưa khớp.';
  return errors;
}
export const identityKey=s=>JSON.stringify([s?.namespace,s?.actor?.id,s?.warehouse?.id,s?.authSessionId]);
export function createSecurityFlow({adapter,getState,requestId=()=>crypto.randomUUID()}) {
  const owner=identityKey(getState().session);
  const context={namespace:adapter.namespace,actorId:getState().session?.actor?.id,warehouseId:getState().session?.warehouse?.id,sessionId:adapter.currentSessionId};
  let disposed=false,busy=false,pending=null,receipt=null,sessions=null,listBusy=false,version=0;
  const valid=()=>!disposed&&!sessionGuard(getState())&&identityKey(getState().session)===owner;
  const scoped=r=>r&&['namespace','actorId','warehouseId','sessionId','requestId'].every(k=>r[k]==={...context,requestId:pending?.requestId}[k]);
  function outcome(r){
    if(r?.kind==='expired')return {kind:'expired'};
    if(r?.kind==='rejected'){pending=null;return {kind:'rejected',field:r.field==='current'?'current':r.field==='next'?'next':null};}
    if(r?.kind==='blocked'){pending=null;return {kind:'blocked'};}
    if(pending?.action==='password'&&r?.kind==='changed'&&scoped(r)&&Number.isFinite(Date.parse(r.updatedAt))&&['keep','reauthenticate'].includes(r.sessionEffect)){
      receipt={updatedAt:r.updatedAt,sessionEffect:r.sessionEffect};pending=null;return {kind:'changed',receipt:{...receipt}};
    }
    if(pending?.action==='revoke'&&r?.kind==='revoked'&&scoped(r)&&r.targetId===pending.targetId)return {kind:'verify-revoke'};
    return {kind:'unknown'};
  }
  async function loadSessions(){
    if(!valid())return {kind:'expired'};
    if(listBusy)return {kind:'busy'};
    listBusy=true;const stamp=version;
    let r;try{r=await adapter.listSessions(context);}catch{r={kind:'unavailable'};}
    listBusy=false;if(stamp!==version||!valid())return {kind:'stale'};
    if(r?.kind!=='sessions')return {kind:r?.kind==='expired'?'expired':r?.kind==='blocked'?'blocked':'unavailable'};
    if(!Array.isArray(r.items)||r.currentSessionId!==context.sessionId||!r.currentSessionId)return {kind:'unavailable'};
    const ids=r.items.map(x=>x?.id);
    if(ids.some(x=>typeof x!=='string'||!x)||new Set(ids).size!==ids.length||ids.filter(x=>x===context.sessionId).length!==1)return {kind:'unavailable'};
    // Whitelist presentation fields. Never expose tokens or arbitrary server data.
    sessions=r.items.map(x=>Object.fromEntries(['id','device','os','location','loggedInAt','app','deviceType'].map(k=>[k,x[k]??null])));
    return {kind:'sessions'};
  }
  async function verifyRevoke(){
    const target=pending?.targetId;
    const result=await loadSessions();
    if(result.kind==='expired')return result;
    if(result.kind==='stale')return result;
    if(result.kind==='sessions'&&!sessions.some(s=>s.id===target)){pending=null;return {kind:'revoked'};}
    return {kind:'unknown'};
  }
  async function call(action,payload={}){
    if(!valid())return {kind:'expired'};
    if(busy)return {kind:'busy'};
    if(action!=='reconcile'&&pending)return {kind:'unknown'};
    if(action==='password'){
      receipt=null;
      const errors=validatePasswords(payload);if(Object.keys(errors).length)return {kind:'invalid',errors};
      if(!adapter.policy)return {kind:'blocked'};
      if(!adapter.policy.accepts(payload.next))return {kind:'invalid',errors:{next:'Mật khẩu chưa đáp ứng chính sách hệ thống.'}};
    }
    if(action==='revoke'&&(!sessions?.some(s=>s.id===payload.targetId)||payload.targetId===context.sessionId))return {kind:'forbidden'};
    if(action==='reconcile'&&!pending)return {kind:'idle'};
    if(action!=='reconcile')pending={action,requestId:requestId(),...(action==='revoke'?{targetId:payload.targetId}:{})};
    busy=true;const stamp=version;let r;
    try{
      const request={...context,...pending};
      r=action==='password'?await adapter.changePassword(request,{current:payload.current,next:payload.next}):action==='revoke'?await adapter.revokeSession(request):await adapter.reconcile(request);
    }catch{r={kind:'unknown'};}
    if(stamp!==version||!valid()){busy=false;return {kind:'stale'};}
    let result=outcome(r);
    if(result.kind==='verify-revoke')result=await verifyRevoke();
    busy=false;return result;
  }
  return {submit:fields=>call('password',fields),revoke:targetId=>call('revoke',{targetId}),reconcile:()=>call('reconcile'),loadSessions,
    snapshot:()=>({busy,listBusy,pending:pending?{...pending}:null,receipt:receipt?{...receipt}:null,sessions:sessions?structuredClone(sessions):null,currentSessionId:context.sessionId,policyKnown:!!adapter.policy}),
    dispose(){disposed=true;version++;receipt=null;sessions=null;pending=null;adapter.dispose?.();}};
}
