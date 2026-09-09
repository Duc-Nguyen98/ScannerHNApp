/** Preview-only contract. Never use client-side claims as production authorization. */
import type {Actor} from './scanner-policy';
export type ScannerSession = Actor & { role: string; shiftStartedAt?: number };
export const privateViews = ['home','lookup','product','scan-lookup','scan-warranty','warranty-product','create','scan','review','result','docs','doc','warranty','case','intake','nfc','nfc-bind','history','profile','profile-edit','profile-avatar','profile-work','profile-security','profile-password','profile-help','profile-support'] as const;
export type PrivateView = typeof privateViews[number];
export type ScannerView = PrivateView | 'login' | 'shift' | 'forgot';
export type ScannerRoute = { view: ScannerView; id: string; product: string };
export const validSession = (s: ScannerSession | null, now = Date.now()): s is ScannerSession => !!s && s.userId === 'preview-minhanh' && s.name === 'Minh Anh' && ['Nhân viên kho','Người duyệt kho','Chỉ xem','Super Admin'].includes(s.role) && Array.isArray(s.permissions) && typeof s.roleCode==='string' && Number.isFinite(s.expiresAt) && s.expiresAt > now && typeof s.shiftStarted === 'boolean';
export function parseRoute(hash: string): ScannerRoute {
  const [raw, search = ''] = hash.replace(/^#/, '').split('?');
  const view = [...privateViews,'login','shift','forgot'].includes(raw) ? raw as ScannerView : 'home';
  const p = new URLSearchParams(search);
  return { view, id: p.get('id') || '', product: p.get('product') || '' };
}
export function guardRoute(route: ScannerRoute, session: ScannerSession | null): ScannerRoute {
  if (!validSession(session)) return {view: route.view === 'forgot' ? 'forgot' : 'login',id:'',product:''};
  if (!session.shiftStarted) return {view:'shift',id:'',product:''};
  if (['login','shift','forgot'].includes(route.view)) return {view:'home',id:'',product:''};
  if (['doc','case'].includes(route.view) && !route.id) return {view:route.view === 'doc' ? 'docs' : 'warranty',id:'',product:''};
  if (route.view === 'product' && !route.product) return {view:'lookup',id:'',product:''};
  return route;
}
export function routeHash(route: ScannerRoute) {
  const p = new URLSearchParams();
  if (route.id) p.set('id',route.id);
  if (route.product) p.set('product',route.product);
  return `#${route.view}${p.size ? `?${p}` : ''}`;
}
export const authErrors: Record<string,string> = {
  invalid:'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra và thử lại.',
  locked:'Tài khoản đang bị khóa. Vui lòng liên hệ quản trị viên.',
  disabled:'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
  offline:'Không có kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.',
  server:'Hệ thống tạm thời chưa thể đăng nhập. Vui lòng thử lại sau.',
};
export interface ScannerAuthAdapter {
  read(): ScannerSession | null;
  login(identifier: string, password: string, scenario: string, role: string): Promise<ScannerSession>;
  startShift(): ScannerSession;
  logout(): void;
  changePreviewRole(role:string):void;
}
