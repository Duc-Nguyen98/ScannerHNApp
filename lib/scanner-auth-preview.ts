import { authErrors, validSession, type ScannerAuthAdapter, type ScannerSession } from './scanner-auth.ts';
import {profiles} from './scanner-policy.ts';
import {readPreviewProfile,verifyPreviewPassword,recordPreviewLogin} from './scanner-account-preview.ts';

// Only imported by the Scanner preview. No credential/token is persisted.
// sessionStorage contains synthetic UI-session claims, not authentication proof.
export function createPreviewAuth(storage: Pick<Storage,'getItem'|'setItem'|'removeItem'>): ScannerAuthAdapter {
  const key = 'hoanam-scanner-preview-session-v1';
  const read = () => {
    try {
      const s = JSON.parse(storage.getItem(key) || 'null') as ScannerSession | null;
      return validSession(s) ? s : null;
    } catch { return null; }
  };
  return {
    read,
    async login(identifier, password, scenario, role) {
      await new Promise(resolve => setTimeout(resolve,450));
      if (authErrors[scenario]) throw new Error(authErrors[scenario]);
      // Public synthetic fixtures for design review only. Never enter real credentials.
      if (!['minhanh','minhanh@example.test',readPreviewProfile(storage).phone].includes(identifier.trim().toLowerCase()) || !await verifyPreviewPassword(storage,password)) throw new Error(authErrors.invalid);
      const profile=profiles[role];if(!profile)throw new Error('Vai trò không hợp lệ.');
      const s: ScannerSession = {userId:'preview-minhanh',name:'Minh Anh',role,roleCode:profile.code,permissions:[...profile.permissions],expiresAt:Date.now()+30*60*1000,shiftStarted:false};
      storage.setItem(key,JSON.stringify(s));
      recordPreviewLogin(storage);
      return s;
    },
    startShift() {
      const s=read(); if (!s) throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      // Timestamp belongs to the first start action, not a reload or repeated call.
      // Legacy sessions already in a shift keep an unknown time until a new login.
      if(s.shiftStarted)return s;
      const next={...s,shiftStarted:true,shiftStartedAt:Date.now()}; storage.setItem(key,JSON.stringify(next)); return next;
    },
    logout() { storage.removeItem(key); },
    changePreviewRole(role) {const s=read();const p=profiles[role];if(!s||!p)throw new Error('Phiên hoặc vai trò không hợp lệ.');storage.setItem(key,JSON.stringify({...s,role,roleCode:p.code,permissions:[...p.permissions]}));},
  };
}
