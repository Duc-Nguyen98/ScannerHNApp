// P01 controller. Adapter contract is local to the prototype, not production auth.
export function createAuthFlow(adapter, onChange = () => {}) {
  let session = null;
  let epoch = 0;
  let state = { screen: 'login', busy: false, message: '', focus: null, startUnknown: false, previewReady: false, shiftStartedAt: null, navigation: null, credentialEpoch: 0 };
  const snapshot = () => structuredClone({ ...state, session });
  const update = changes => { state = { ...state, ...changes }; onChange(snapshot()); };
  // Validate only the existing local adapter contract; never invent permissions.
  const text = value => typeof value === 'string' && value.length > 0;
  const validShape = value => !!value && text(value.namespace)
    && ['id', 'name', 'initials', 'role'].every(key => text(value.actor?.[key]))
    && text(value.warehouse?.id) && text(value.warehouse?.name)
    && !!value.permissions && typeof value.permissions === 'object';
  const isValid = value => {
    try { return validShape(value) && adapter.isValid(value) === true; }
    catch { return false; }
  };
  const guardMessage = () => !isValid(session) ? 'Phiên không còn hợp lệ. Vui lòng đăng nhập lại.'
    : session.warehouse.active !== true ? 'Kho ngừng hoạt động hoặc chưa xác minh. Không thể bắt đầu ca làm việc.'
    : session.permissions.warehouseOperations !== true ? 'Tài khoản chưa có quyền thao tác kho được xác nhận.' : '';
  const logout = (message = '') => {
    epoch += 1;
    // Local teardown must happen even if adapter cleanup fails. No remote-success claim.
    try { adapter.logout(); }
    catch { message = 'Đã đóng phiên trên thiết bị. Chưa xác minh được kết quả đăng xuất ở nguồn xác thực.'; }
    session = null;
    update({ screen: 'login', sessionExpired:false, busy: false, message, focus: 'username', startUnknown: false, previewReady: false, shiftStartedAt: null, navigation: null, credentialEpoch: state.credentialEpoch + 1 });
  };
  return {
    snapshot,
    logout,
    expire() {
      if (!session || !state.previewReady) { logout('Phiên đã hết hạn. Vui lòng đăng nhập lại.'); return; }
      epoch++;
      try { adapter.logout(); } catch { /* Local guard still takes effect. */ }
      session=null;
      update({screen:'expired',sessionExpired:true,busy:false,previewReady:false,navigation:null,message:'',credentialEpoch:state.credentialEpoch+1});
    },
    async login(credentials) {
      if (state.busy || session) return;
      const requestEpoch = epoch;
      update({ busy: true, message: '', focus: null, navigation: null });
      let result;
      try { result = await adapter.authenticate(credentials); } catch { result = { kind: 'unknown' }; }
      if (requestEpoch !== epoch) return;
      if (result?.kind === 'authenticated' && isValid(result.session)) {
        session = result.session;
        update({ screen: 'confirmation', sessionExpired:false, busy: false, message: guardMessage(), focus: 'heading' });
      } else {
        update({ busy: false, message: result?.kind === 'rejected'
          ? 'Tên đăng nhập hoặc mật khẩu không đúng.'
          : 'Chưa xác định được kết quả đăng nhập. Chưa có phiên được xác nhận.', focus: 'message' });
      }
    },
    async start() {
      if (state.busy || state.startUnknown || state.previewReady) return;
      const blocked = guardMessage();
      if (!isValid(session)) { logout(blocked); return; }
      if (blocked) { update({ message: blocked, focus: 'message' }); return; }
      const requestEpoch = epoch;
      update({ busy: true, message: '', focus: null });
      let result;
      try { result = await adapter.startShift(session); } catch { result = { kind: 'unknown' }; }
      if (requestEpoch !== epoch) return;
      if (result?.kind === 'expired' || !isValid(session)) { logout('Phiên đã hết hạn. Vui lòng đăng nhập lại.'); return; }
      const blockedAfterWait = guardMessage();
      if (blockedAfterWait) {
        // A changed local guard does not prove an in-flight start was rejected.
        // Keep the existing reconciliation lock unless the source explicitly denied it.
        const needsReconciliation = result?.kind !== 'denied';
        update({ busy: false, startUnknown: needsReconciliation,
          message: blockedAfterWait + (needsReconciliation ? ' Cần đối chiếu kết quả yêu cầu đã gửi trước khi thử lại.' : ''),
          focus: 'message', navigation: null });
        return;
      }
      if (result?.kind === 'preview-ready') {
        // The Home receipt must come from confirmation, never from render time.
        const timestamp = typeof result.startedAt === 'string' ? Date.parse(result.startedAt) : NaN;
        if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== result.startedAt) {
          update({ busy: false, startUnknown: true, shiftStartedAt: null, navigation: null, message: 'Chưa xác minh được thời điểm bắt đầu ca. Cần đối chiếu kết quả xác nhận phiên.', focus: 'message' });
          return;
        }
        update({ busy: false, previewReady: true, shiftStartedAt: result.startedAt, navigation: { target: 'P02', namespace: session.namespace, actorId: session.actor.id, warehouseId: session.warehouse.id },
          message: 'Phiên fixture đã sẵn sàng mở Trang chủ; chưa tạo ca làm việc thật.', focus: 'message' });
      } else {
        const unknown = result?.kind !== 'denied';
        update({ busy: false, startUnknown: unknown, message: unknown
          ? 'Chưa xác định kết quả bắt đầu ca. Cần đối chiếu phiên trước khi thử lại; tích hợp đang chờ.'
          : 'Không có quyền hoặc kho đã ngừng hoạt động. Không thể bắt đầu ca.', focus: 'message' });
      }
    },
    recovery() {
      if (state.busy || session) return;
      update({ navigation: { target: 'P14', returnTo: 'P01' }, message: 'Khôi phục tài khoản (P14) chưa tích hợp. Chưa gửi yêu cầu khôi phục.', focus: 'message' });
    },
    enforceSession() {
      if (state.sessionExpired && state.screen==='expired') return false;
      if (session && !isValid(session)) { if(state.previewReady)this.expire();else logout('Phiên không còn hợp lệ. Vui lòng đăng nhập lại.'); return false; }
      // P02 remains a durable handoff; recovery is a one-shot intent, not a route.
      update({ screen: session ? 'confirmation' : 'login', focus: null, navigation: state.previewReady ? state.navigation : null });
      return true;
    },
  };
}
