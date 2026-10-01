// One logout action markup for P10 and the verified P14 summary.
import {PROFILE_ICONS} from './icons.mjs';
export function logoutButton(attribute){return `<button type="button" class="p10-logout-button hn-logout-button" ${attribute}><svg class="p10-icon" viewBox="0 0 24 24" aria-hidden="true">${PROFILE_ICONS['log-out']}</svg><span>Đăng xuất</span></button>`;}
