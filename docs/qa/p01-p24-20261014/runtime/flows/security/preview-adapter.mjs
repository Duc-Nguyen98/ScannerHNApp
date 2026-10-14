import {FIXTURE_NAMESPACE} from '../auth-session/fixture-adapter.mjs';
import {SECURITY_NAMESPACE} from './security-model.mjs';
export const REVIEW_SCENARIOS=[['preview','Luồng preview dùng chung P01–P11 (mặc định)'],['blocked','Mô phỏng chưa kết nối backend'],['baseline','B11 · thành công & hai thiết bị (fixture riêng)'],['wrong-current','Từ chối mật khẩu hiện tại (fixture)'],['rejected','Server từ chối (fixture)'],['unknown','Chưa rõ kết quả → đối chiếu (fixture)'],['revoke-failed','Thu hồi phiên thất bại (fixture)'],['revoke-unknown','Thu hồi chưa rõ → đối chiếu (fixture)'],['sessions-failed','Không tải được phiên (fixture)'],['missing','Thiết bị thiếu metadata (fixture)'],['reauthenticate','Đổi xong yêu cầu đăng nhập lại (fixture)'],['expired','Phiên hết hạn khi gửi (fixture)']];
export function createSecurityAdapter({session,scenario='preview',delay=450,accountStore}={}){
  if(scenario==='preview'){
    const enabled=session?.namespace===FIXTURE_NAMESPACE&&accountStore?.isActive(session.actor?.id,session.authSessionId)===true;
    let alive=true;
    const run=async(method,...args)=>{await new Promise(r=>setTimeout(r,delay));if(!alive)return {kind:'expired'};if(!enabled)return {kind:'blocked'};return accountStore[method](...args);};
    return {namespace:SECURITY_NAMESPACE,currentSessionId:enabled?session.authSessionId:null,
      policy:enabled?{accepts:value=>typeof value==='string'&&value.length>0}:null,
      changePassword:(request,fields)=>run('changePassword',request,fields),listSessions:request=>run('listSessions',request),
      revokeSession:request=>run('revokeSession',request),reconcile:request=>run('reconcile',request),dispose(){alive=false;}};
  }
  const enabled=scenario!=='blocked'&&session?.namespace===FIXTURE_NAMESPACE;
  const currentSessionId=enabled?'fixture-security-current':null;
  let alive=true,credential='preview',last=null;
  let items=[{id:currentSessionId,device:'iPhone 14 Pro',os:'iOS 17.5.1',deviceType:'phone',location:'Hà Nội, Việt Nam',loggedInAt:'2026-09-09T14:25:00+07:00',app:'Hoa Nam Scanner'},
    {id:'fixture-security-windows',device:'Windows PC',os:'Windows 11 · Chrome 128.0',deviceType:'computer',location:'Hà Nội, Việt Nam',loggedInAt:'2026-09-08T10:12:00+07:00',app:'Web WMS'}];
  if(scenario==='missing')items=items.map(x=>({id:x.id,device:null,deviceType:null}));
  const wait=()=>new Promise(r=>setTimeout(r,delay));
  return {namespace:SECURITY_NAMESPACE,currentSessionId,
    // Explicit test policy only: no inferred production min length/complexity.
    policy:enabled?{accepts:value=>typeof value==='string'&&value.length>0}:null,
    async changePassword(request,fields){
      await wait();if(!alive)return {kind:'expired'};if(!enabled)return {kind:'blocked'};
      if(scenario==='expired')return {kind:'expired'};
      if(scenario==='wrong-current'||fields.current!==credential)return {kind:'rejected',field:'current'};
      if(scenario==='rejected')return {kind:'rejected'};
      credential=fields.next;
      last={...request,kind:'changed',updatedAt:'2026-09-09T14:25:00+07:00',sessionEffect:scenario==='reauthenticate'?'reauthenticate':'keep'};
      return scenario==='unknown'?{kind:'unknown'}:{...last};
    },
    async listSessions(){await wait();if(!alive)return {kind:'expired'};if(!enabled)return {kind:'blocked'};if(scenario==='sessions-failed')return {kind:'unavailable'};return {kind:'sessions',currentSessionId,items:structuredClone(items)};},
    async revokeSession(request){
      await wait();if(!alive)return {kind:'expired'};if(!enabled)return {kind:'blocked'};
      if(request.targetId===currentSessionId||!items.some(s=>s.id===request.targetId))return {kind:'rejected'};
      if(scenario==='revoke-failed')return {kind:'rejected'};
      items=items.filter(s=>s.id!==request.targetId);last={...request,kind:'revoked'};
      return scenario==='revoke-unknown'?{kind:'unknown'}:{...last};
    },
    async reconcile(request){await wait();return alive&&last?.requestId===request.requestId?{...last}:{kind:'unknown'};},
    dispose(){alive=false;credential='';items=[];last=null;}
  };
}
