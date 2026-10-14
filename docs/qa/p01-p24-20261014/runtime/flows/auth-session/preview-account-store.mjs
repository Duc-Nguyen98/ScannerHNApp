// In-memory PREVIEW account authority shared by P01 and P11. Never a production auth service.
// Created per auth adapter; logout preserves account changes, explicit reset/page reload discards it.
export const PREVIEW_SECURITY_NAMESPACE='hn-scanner-security-review-v1';
export function createPreviewAccountStore({now=()=>new Date().toISOString(),id=()=>crypto.randomUUID()}={}) {
  const accounts=new Map();
  function account(actorId){
    if(!['fixture-minhanh','fixture-lan'].includes(actorId))return null;
    if(!accounts.has(actorId))accounts.set(actorId,{credential:'preview',sessions:new Map(),receipts:new Map(),seeded:false});
    return accounts.get(actorId);
  }
  function authorized(request){
    if(request?.namespace!==PREVIEW_SECURITY_NAMESPACE||request.warehouseId!=='fixture-hoa-nam')return null;
    const a=accounts.get(request.actorId);
    return a?.sessions.has(request.sessionId)?a:null;
  }
  const copy=value=>structuredClone(value);
  function prior(a,request){
    const receipt=a.receipts.get(request.requestId);
    if(!receipt)return null;
    return ['actorId','warehouseId','sessionId','action','targetId'].every(k=>receipt[k]===request[k])?copy(receipt):{kind:'rejected'};
  }
  function record(a,request,details){
    const receipt={namespace:PREVIEW_SECURITY_NAMESPACE,actorId:request.actorId,warehouseId:request.warehouseId,sessionId:request.sessionId,requestId:request.requestId,action:request.action,...details};
    a.receipts.set(request.requestId,receipt);return copy(receipt);
  }
  return Object.freeze({
    matches(actorId,password){const a=account(actorId);return !!a&&typeof password==='string'&&a.credential===password;},
    openSession(actorId){
      const a=account(actorId);if(!a)return null;
      if(!a.seeded){a.seeded=true;const otherId=`fixture-security-windows-${actorId}`;a.sessions.set(otherId,{id:otherId,device:'Windows PC',os:'Windows 11 · Chrome 128.0',deviceType:'computer',location:'Hà Nội, Việt Nam',loggedInAt:'2026-09-08T10:12:00+07:00',app:'Web WMS'});}
      const sessionId=`fixture-security-${id()}`;
      a.sessions.set(sessionId,{id:sessionId,device:'iPhone 14 Pro',os:'iOS 17.5.1',deviceType:'phone',location:'Hà Nội, Việt Nam',loggedInAt:now(),app:'Hoa Nam Scanner'});
      return sessionId;
    },
    isActive(actorId,sessionId){return accounts.get(actorId)?.sessions.has(sessionId)===true;},
    closeSession(actorId,sessionId){const a=accounts.get(actorId);a?.sessions.delete(sessionId);if(a)for(const [key,r]of a.receipts)if(r.sessionId===sessionId)a.receipts.delete(key);},
    listSessions(request){const a=authorized(request);return a?{kind:'sessions',currentSessionId:request.sessionId,items:copy([...a.sessions.values()])}:{kind:'expired'};},
    changePassword(request,fields){
      const a=authorized(request);if(!a)return {kind:'expired'};
      if(!request.requestId||request.action!=='password')return {kind:'rejected'};
      const previous=prior(a,request);if(previous)return previous;
      if(fields.current!==a.credential)return {kind:'rejected',field:'current'};
      if(typeof fields.next!=='string'||fields.next.length===0)return {kind:'rejected',field:'next'};
      a.credential=fields.next;
      // Explicit local preview policy only; backend session policy still needs its contract.
      return record(a,request,{kind:'changed',updatedAt:now(),sessionEffect:'keep'});
    },
    revokeSession(request){
      const a=authorized(request);if(!a)return {kind:'expired'};
      if(!request.requestId||request.action!=='revoke'||request.targetId===request.sessionId)return {kind:'rejected'};
      const previous=prior(a,request);if(previous)return previous;
      if(!a.sessions.has(request.targetId))return {kind:'rejected'};
      a.sessions.delete(request.targetId);
      return record(a,request,{kind:'revoked',targetId:request.targetId});
    },
    reconcile(request){const a=authorized(request);return a?(prior(a,request)||{kind:'unknown'}):{kind:'expired'};}
  });
}
