// Presentation only: keep guard policy and session ownership in auth-flow.
export function confirmationGuidance(state, homeStatus = 'idle') {
  if (state.previewReady && homeStatus === 'ready') return 'Trang chủ đã tải xong. Chọn Mở Trang chủ để tiếp tục.';
  if (state.previewReady) return homeStatus === 'error'
    ? 'Chưa tải được Trang chủ. Thử tải lại giao diện; không gửi lại yêu cầu bắt đầu ca. Nếu vẫn lỗi, kiểm tra máy chủ preview.'
    : 'Đang tải Trang chủ. Không cần nhấn bắt đầu ca lần nữa. Bạn vẫn có thể đăng xuất.';
  if (state.startUnknown) return 'Chưa xác định kết quả bắt đầu ca. Cần đối chiếu trước khi thử lại; nguồn đối chiếu phiên chưa được kết nối.';
  const reasons = [];
  if (state.session?.warehouse.active === false) reasons.push('Kho đang ngừng hoạt động. Liên hệ quản trị viên để kiểm tra trạng thái kho.');
  else if (state.session?.warehouse.active !== true) reasons.push('Chưa xác minh trạng thái kho. Liên hệ quản trị viên để kiểm tra trước khi bắt đầu ca.');
  if (state.session?.permissions.warehouseOperations === false) reasons.push('Tài khoản chưa có quyền thao tác kho. Liên hệ quản trị viên để kiểm tra quyền được cấp.');
  else if (state.session?.permissions.warehouseOperations !== true) reasons.push('Chưa xác minh quyền thao tác kho. Liên hệ quản trị viên để kiểm tra quyền được cấp.');
  return reasons.join('\n') || 'Thao tác theo quyền được cấp cho tài khoản của bạn.';
}

export function bindLoginExperience(form, { onLayout = () => {} } = {}) {
  const username = form.querySelector('#username'), password = form.querySelector('#password');
  const eye = form.querySelector('#toggle-password'), caps = form.querySelector('#password-caps');
  // Keep a pointer gesture's target stable until click. Blurring an input on
  // pointerdown can hide the keyboard/hint and move the button before pointerup.
  // Keyboard Tab/Enter is unaffected; submit/navigation owns the final blur.
  form.addEventListener('pointerdown', event => {
    if (event.target.closest?.('button') && [username,password].includes(document.activeElement)) event.preventDefault();
  });
  let composing = false;
  form.addEventListener('compositionstart', () => { composing = true; });
  form.addEventListener('compositionend', () => { composing = false; });
  // Some IMEs cancel composition by moving focus without compositionend.
  // A stale flag must not disable all subsequent login attempts.
  form.addEventListener('focusout', () => { composing = false; });
  form.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    if (composing || event.isComposing || event.keyCode === 229) { event.preventDefault(); return; }
    if (event.target === username) { event.preventDefault(); if (!password.disabled) password.focus(); }
  });
  const updateCaps = event => {
    const hidden = typeof event.getModifierState !== 'function' || !event.getModifierState('CapsLock');
    if (caps.hidden !== hidden) { caps.hidden = hidden; onLayout(); }
  };
  password.addEventListener('keydown', updateCaps);
  password.addEventListener('keyup', updateCaps);
  password.addEventListener('blur', () => { if(!caps.hidden){caps.hidden = true;onLayout();} });
  // Pointer activation keeps the keyboard and selection; keyboard activation
  // leaves focus on the eye button so Tab order remains predictable.
  eye.addEventListener('pointerdown', event => { if (document.activeElement === password) event.preventDefault(); });
  eye.addEventListener('click', () => {
    const selection = [password.selectionStart, password.selectionEnd, password.selectionDirection];
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    password.setSelectionRange(...selection);
    eye.setAttribute('aria-pressed', String(visible));
    eye.setAttribute('aria-label', visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  });
  return { isComposing: () => composing };
}

export function warehousePresentation(active) {
  return active === true ? {label:'Đang hoạt động',tone:''}
    : active === false ? {label:'Ngừng hoạt động',tone:'stopped'}
    : {label:'Chưa xác minh',tone:'unverified'};
}

// Change text without replacing controls/readers or stealing their focus.
export function syncConfirmation(root, session) {
  const set=(selector,value)=>{const node=root.querySelector(selector);if(node&&node.textContent!==value)node.textContent=value;};
  set('.auth-greeting-name',session.actor.name);
  set('.identity .avatar',session.actor.initials);
  set('.identity strong',session.actor.name);
  set('.identity p',session.actor.role);
  set('.warehouse strong',session.warehouse.name);
  const badge=root.querySelector('.warehouse .badge'),status=warehousePresentation(session.warehouse.active);
  badge.classList.toggle('stopped',status.tone==='stopped');
  badge.classList.toggle('unverified',status.tone==='unverified');
  set('.warehouse .badge-label',status.label);
}
