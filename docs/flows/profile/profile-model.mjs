// P10 preview only. No backend schema, inferred grants or production mutation.
import {FIXTURE_NAMESPACE} from '../auth-session/fixture-adapter.mjs';
export const PROFILE_BUILD = Object.freeze({label:'Bản xem trước',revision:'P10-r10'});
export const EDITABLE_FIELDS = Object.freeze(['name','nickname','phone']);
export const PROFILE_OPERATIONS = Object.freeze([
  ['inbound','Nhập kho','box'],['outbound','Xuất kho','up'],['warranty','Bảo hành','tool'],
  ['nfc','Thẻ NFC','nfc'],['documents','Chứng từ','document'],['lookup','Tra cứu','search'],
]);
// B10 contact values are isolated design fixtures, never authentication fields.
const contacts = Object.freeze({'fixture-minhanh':Object.freeze({nickname:'Minh Anh',phone:'0901 234 567',email:'minhanh@hoanam.com'})});
export function readProfile(session) {
  if(!session?.actor)return null;
  const fixture=session.namespace===FIXTURE_NAMESPACE?contacts[session.actor.id]:null;
  return {...(fixture||{}),id:session.actor.id,name:session.actor.name,initials:session.actor.initials,
    role:session.actor.role,warehouse:session.warehouse?.name,warehouseId:session.warehouse?.id,
    // No individual capability contract in P01; deliberately not derived from role or warehouseOperations.
    permissions:Object.fromEntries(PROFILE_OPERATIONS.map(([key])=>[key,null]))};
}
export const editableDraft = profile => Object.fromEntries(EDITABLE_FIELDS.map(k=>[k,String(profile?.[k]??'')]));
export const isProfileDirty = (profile,draft) => EDITABLE_FIELDS.some(k=>String(profile?.[k]??'')!==String(draft?.[k]??''));
export function prepareProfilePatch(profile,draft) {
  return Object.fromEntries(EDITABLE_FIELDS.filter(k=>String(profile?.[k]??'')!==String(draft?.[k]??'')).map(k=>[k,String(draft?.[k]??'')]));
}
export const permissionState = value => value===true?'granted':value===false?'denied':'unknown';
export function profileIntent(action,session,returnTo) {
  const target={password:['P11','P11.S01'],sessions:['P11','P11.S04'],shift:['P14',null]}[action];
  return target?{kind:'pending',target:target[0],panel:target[1],action,actorId:session?.actor?.id,warehouseId:session?.warehouse?.id,returnTo}:null;
}
export function createProfilePreviewAdapter() {
  return Object.freeze({
    capabilities:Object.freeze({save:false,avatar:false}),
    async save(){return {kind:'blocked',message:'Chưa kết nối chức năng lưu hồ sơ. Thông tin bạn nhập vẫn được giữ ở màn này; tài khoản chưa thay đổi.'};},
    async uploadAvatar(){return {kind:'blocked',message:'Chức năng tải ảnh đại diện chưa được kết nối. Ảnh đại diện hiện tại được giữ nguyên.'};},
  });
}
