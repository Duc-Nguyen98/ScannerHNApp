/** Synthetic account service for Scanner preview only. No network/SMS/upload service. */
import type {Actor} from './scanner-policy';
type StoragePort=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type AccountProfile={officialName:string;nickname:string;phone:string;email:string;username:string;avatar:string;revision:number;lastLogin:string};
const profileKey='hn-scanner-account-preview-v1',secretKey='hn-scanner-password-preview-v1';
export const initialProfile=():AccountProfile=>({officialName:'Minh Anh',nickname:'',phone:'0900000000',email:'minhanh@example.test',username:'minhanh',avatar:'',revision:0,lastLogin:''});
export function normalizePhone(raw:string){return raw.replace(/[\s().-]/g,'').replace(/^\+84/,'0');}
export function validateProfile(nickname:string,phone:string){
 return {nickname:nickname.trim().length>40||! /^[\p{L}\p{M}\p{N} ._'’-]*$/u.test(nickname.trim())?'Biệt danh tối đa 40 ký tự, chỉ gồm chữ, số, khoảng trắng và dấu . _ - ’.':'',phone:/^0\d{9}$/.test(normalizePhone(phone))?'':'Nhập số điện thoại Việt Nam gồm 10 chữ số.'};
}
export function passwordIssues(old:string,next:string,confirm:string){return {old:old?'':'Nhập mật khẩu hiện tại.',next:next===old&&next?'Mật khẩu mới phải khác mật khẩu hiện tại.':next.length<12||next.length>128||!/[a-z]/.test(next)||!/[A-Z]/.test(next)||!/[0-9]/.test(next)||! /[^a-zA-Z0-9]/.test(next)?'Dùng 12–128 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.':'',confirm:next===confirm&&confirm?'':'Mật khẩu xác nhận chưa khớp.'};}
export function avatarFileError(file:{type:string;size:number}){return !['image/jpeg','image/png','image/webp'].includes(file.type)?'Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.':file.size>2*1024*1024?'Ảnh vượt quá 2 MB. Vui lòng chọn ảnh nhỏ hơn.':file.size<=0?'Tệp ảnh trống.':'';}
export function readPreviewProfile(storage:StoragePort):AccountProfile{
 const saved=storage.getItem(profileKey);if(!saved)return initialProfile();
 const p=JSON.parse(saved);if(!p||typeof p.nickname!=='string'||typeof p.phone!=='string'||!Number.isInteger(p.revision))throw new Error('Không thể đọc hồ sơ trên thiết bị. Vui lòng thử lại.');
 return {...initialProfile(),nickname:p.nickname,phone:p.phone,avatar:typeof p.avatar==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(p.avatar)?p.avatar:'',revision:p.revision,lastLogin:typeof p.lastLogin==='string'?p.lastLogin:''};
}
async function digest(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},key,256);return Array.from(new Uint8Array(bits),v=>v.toString(16).padStart(2,'0')).join('');}
export async function verifyPreviewPassword(storage:StoragePort,password:string){const raw=storage.getItem(secretKey);if(!raw)return password==='Scanner@2026';const saved=JSON.parse(raw);return typeof saved.salt==='string'&&saved.hash===await digest(password,saved.salt);}
export function recordPreviewLogin(storage:StoragePort){const p=readPreviewProfile(storage);storage.setItem(profileKey,JSON.stringify({...p,lastLogin:new Date().toISOString()}));}
export function createAccountPreview(storage:StoragePort,actor:()=>Actor|null,now=()=>Date.now()){
 let challenge:{phone:string;expires:number;tries:number;verified:boolean}|null=null;
 const authorize=()=>{const a=actor();if(!a||a.userId!=='preview-minhanh'||!a.shiftStarted||a.expiresAt<=now())throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');};
 const delay=async(mode:string)=>{authorize();await new Promise(r=>setTimeout(r,450));authorize();if(mode==='offline')throw new Error('Không có kết nối mạng. Nội dung chưa được lưu.');if(mode==='error'||mode==='server')throw new Error('Chưa thể lưu thay đổi. Vui lòng thử lại.');if(mode==='conflict')throw new Error('Hồ sơ đã thay đổi ở nơi khác. Quay lại rồi mở hồ sơ mới nhất trước khi sửa.');};
 const current=(revision:number)=>{const p=readPreviewProfile(storage);if(p.revision!==revision)throw new Error('Hồ sơ đã thay đổi. Quay lại rồi mở hồ sơ mới nhất.');return p;};
 return {
  read(){authorize();return readPreviewProfile(storage);},
  async requestPhone(phone:string,mode:string){await delay(mode);const normalized=normalizePhone(phone);if(validateProfile('',normalized).phone)throw new Error(validateProfile('',normalized).phone);if(mode==='duplicate'||normalized==='0900000001')throw new Error('Số điện thoại đã được sử dụng. Vui lòng kiểm tra hoặc liên hệ quản trị viên.');challenge={phone:normalized,expires:now()+120000,tries:0,verified:false};return {expires:challenge.expires};},
  async verifyPhone(phone:string,code:string,mode:string){await delay(mode);if(!challenge||challenge.phone!==normalizePhone(phone)||challenge.expires<=now()||challenge.tries>=5)throw new Error('Mã đã hết hạn hoặc vượt số lần thử. Vui lòng yêu cầu mã mới.');challenge.tries++;if(code!=='123456')throw new Error('Mã xác minh không đúng. Vui lòng thử lại.');challenge.verified=true;},
  async save(nickname:string,phone:string,revision:number,mode:string){await delay(mode);const errors=validateProfile(nickname,phone);if(errors.nickname||errors.phone)throw new Error(errors.nickname||errors.phone);const p=current(revision),n=normalizePhone(phone);if(mode==='duplicate'||n==='0900000001')throw new Error('Số điện thoại đã được sử dụng.');if(n!==p.phone&&(!challenge?.verified||challenge.phone!==n||challenge.expires<=now()))throw new Error('Vui lòng xác minh số điện thoại mới trước khi lưu.');const next={...p,nickname:nickname.trim(),phone:n,revision:p.revision+1};storage.setItem(profileKey,JSON.stringify(next));challenge=null;return next;},
  async avatar(data:string,revision:number,mode:string,onProgress:(n:number)=>void){await delay(mode);if(!/^data:image\/(jpeg|png|webp);base64,/.test(data)||data.length>2800000)throw new Error('Ảnh không hợp lệ hoặc vượt kích thước cho phép.');for(const progress of [25,60,90]){authorize();onProgress(progress);await new Promise(r=>setTimeout(r,100));}authorize();const p=current(revision),next={...p,avatar:data,revision:p.revision+1};storage.setItem(profileKey,JSON.stringify(next));onProgress(100);return next;},
  async password(old:string,next:string,confirm:string,mode:string){await delay(mode);const errors=passwordIssues(old,next,confirm);if(errors.old||errors.next||errors.confirm)throw new Error(errors.old||errors.next||errors.confirm);if(!await verifyPreviewPassword(storage,old))throw new Error('Mật khẩu hiện tại không chính xác.');const salt=crypto.randomUUID(),hash=await digest(next,salt);authorize();storage.setItem(secretKey,JSON.stringify({salt,hash}));storage.removeItem('hoanam-scanner-preview-session-v1');},
 };
}
