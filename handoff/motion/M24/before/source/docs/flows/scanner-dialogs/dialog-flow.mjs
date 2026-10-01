import { DIALOG_NAMESPACE } from './fixture-adapter.mjs';

export const SCAN_OPERATIONS = Object.freeze({
  inbound: { target: 'P04', label: 'Nhập kho', write: true },
  outbound: { target: 'P05', label: 'Xuất kho', write: true },
  warranty: { target: 'P09', label: 'Bảo hành', write: true },
  lookup: { target: 'P06', label: 'Tra cứu sản phẩm', write: false },
});
// One controller for all four panels. No camera, storage deletion or network writes.
export function createDialogFlow({ adapter, getState, onChange = () => {}, onNavigate = () => {}, timeoutMs = 4000 }) {
  let state = { panel: null, document: null, busy: false, saveUnknown: false, message: '', navigation: null };
  let disposed = false;
  let epoch = 0;
  const snapshot = () => structuredClone(state);
  const update = changes => { if (!disposed) { state = { ...state, ...changes }; onChange(snapshot()); } };
  const sessionOK = () => {
    const s = getState();
    return !disposed && !!s?.session && s.previewReady === true && !s.startUnknown && s.session.permissions?.warehouseOperations === true;
  };
  const owns = doc => sessionOK() && doc?.namespace === DIALOG_NAMESPACE
    && doc.actorId === getState().session.actor.id && doc.warehouseId === getState().session.warehouse.id;
  function writeGuard() {
    if (!sessionOK()) { update({ message: 'Phiên hoặc quyền thao tác chưa được xác nhận.' }); return false; }
    if (adapter.warehouseActive(getState()) !== true) {
      update({ panel: 'P03.S03', message: adapter.warehouseActive(getState()) === false ? '' : 'Chưa xác minh được trạng thái kho. Thao tác ghi đang bị chặn.' });
      return false;
    }
    return true;
  }
  function navigate(operation, document = null) {
    if (!sessionOK() || !Object.hasOwn(SCAN_OPERATIONS, operation)) return false;
    if (SCAN_OPERATIONS[operation].write && !writeGuard()) return false;
    const s = getState().session;
    const navigation = { kind: 'pending', operation, ...SCAN_OPERATIONS[operation], context: {
      namespace: DIALOG_NAMESPACE, actorId: s.actor.id, warehouseId: s.warehouse.id, returnTo: 'P02', operation,
      ...(document ? { documentId: document.documentId, scanSessionId: document.scanSessionId, version: document.version, codes: [...document.codes], ...(document.ownerBacked ? {resumeExisting:true,ownerFingerprint:document.ownerFingerprint} : {}) } : {}),
    } };
    update({ panel: null, message: '', navigation });
    onNavigate(navigation);
    return true;
  }
  const sameReceipt = doc => doc && state.document && ['namespace', 'actorId', 'warehouseId', 'documentId', 'scanSessionId', 'version', 'operation'].every(key => doc[key] === state.document[key])
    && JSON.stringify(doc.codes) === JSON.stringify(state.document.codes);
  function acceptSave(result) {
    if (!owns(state.document)) { update({ busy: false, saveUnknown: true, message: 'Phiên đã thay đổi. Giữ phiếu để đối chiếu kết quả lưu.' }); return; }
    if (result?.kind === 'fixture-saved' && sameReceipt(result.document)) {
      update({ panel: null, busy: false, saveUnknown: false, document: structuredClone(result.document), message: 'Đã lưu nháp trong bộ nhớ fixture; chưa lưu lên WMS.' });
      onNavigate({ kind: 'home', target: 'P02' });
    } else if (result?.kind === 'failed') {
      update({ busy: false, message: 'Chưa lưu được nháp. Nội dung phiếu được giữ nguyên.' });
    } else {
      update({ busy: false, saveUnknown: true, message: 'Chưa xác định kết quả lưu. Giữ nguyên phiếu, phiên quét và mã; kiểm tra kết quả trước khi thử lại.' });
    }
  }
  return {
    snapshot,
    writeGuard,
    openPicker() {
      if (state.busy || disposed || !sessionOK()) return false;
      if (!state.saveUnknown && (!state.document || state.document.ownerBacked)) state.document=adapter.pendingDocument?.()||null;
      update({ panel: state.document?.unsaved ? 'P03.S02' : 'P03.S01', message: state.saveUnknown ? 'Kết quả lưu chưa xác định; cần kiểm tra lại.' : '' });
      return true;
    },
    openUnfinished() {
      if(!state.busy&&!state.saveUnknown&&state.document?.ownerBacked)state.document=adapter.refreshDocument?.(state.document)||null;
      if (state.busy || !owns(state.document)) return false;
      update({ panel: 'P03.S02', message: state.saveUnknown ? 'Kết quả lưu chưa xác định; cần kiểm tra lại.' : '' }); return true;
    },
    showStopped() { if (!state.busy && sessionOK()) update({ panel: 'P03.S03', message: '' }); },
    loadFixtureDocument(doc) {
      if (state.busy || state.saveUnknown || !owns(doc)) return false;
      epoch++;
      update({ document: structuredClone(doc), saveUnknown: !!doc.uncertain, panel: null, message: '' }); return true;
    },
    choose(operation) {
      if (state.busy || state.panel !== 'P03.S01') return false;
      return navigate(operation);
    },
    resume() {
      if (state.busy || state.panel !== 'P03.S02' || !owns(state.document)) return false;
      if(adapter.canResume?.(state.document)===false){update({message:'Phiếu đã thay đổi. Đóng và mở lại để lấy đúng dữ liệu hiện tại.'});return false;}
      if (state.saveUnknown || (!state.document.ownerBacked && state.document.uncertain) || state.document.posted) {
        update({ message: 'Cần đối chiếu phiếu với P21/Web trước khi tiếp tục; giữ nguyên định danh và mã. Dependency chưa tích hợp.' }); return false;
      }
      return navigate(state.document.operation, state.document);
    },
    cancel(reason = 'cancel') {
      // The backdrop is decorative: it must never dismiss any P03 panel.
      if (reason === 'backdrop' || state.busy || state.panel === 'P03.S03') return false;
      if (state.panel === 'P03.S04') {
        update({ panel: 'P03.S02', message: '' });
      } else update({ panel: null, message: '' });
      return true;
    },
    dismissForMenu(key) {
      if (state.busy || !sessionOK() || !['home', 'documents', 'lookup', 'history', 'profile'].includes(key)) return false;
      // Leaving a panel never discards the document or resolves an UNKNOWN save.
      if (key === 'lookup') return this.openPicker();
      update({ panel: null, message: '' });
      return true;
    },
    requestDiscard() {
      if (state.busy || state.panel !== 'P03.S02' || !owns(state.document)) return false;
      update({ panel: 'P03.S04', message: '' }); return true;
    },
    confirmDiscard() {
      if (state.busy || state.panel !== 'P03.S04' || !owns(state.document) || !writeGuard()) return false;
      if (state.saveUnknown || !adapter.canDiscardLocal(state.document)) {
        update({ message: 'Không được xóa dữ liệu đã lưu, server đã ghi nhận, đã Post hoặc chưa xác định. Cần đối chiếu P21/Web; contract hủy chưa tích hợp.' }); return false;
      }
      if(adapter.discardLocal?.(state.document)===false){update({message:'Phiếu đã thay đổi. Dữ liệu được giữ nguyên; hãy mở lại phiếu để kiểm tra.'});return false;}
      epoch++;
      update({ panel: null, document: null, message: 'Đã bỏ phần chưa lưu của phiếu fixture. Không xóa dữ liệu WMS.' });
      return true;
    },
    async save() {
      if (state.busy || state.saveUnknown || state.panel !== 'P03.S02' || !owns(state.document) || !writeGuard()) return false;
      if (state.document.posted || state.document.uncertain) { update({ message: 'Phiếu cần đối chiếu P21/Web, chưa có contract lưu cho trạng thái này.' }); return false; }
      const requestEpoch = epoch;
      update({ busy: true, message: 'Đang lưu nháp…' });
      let timer;
      let result;
      try {
        result = await Promise.race([
          adapter.saveDraft(structuredClone(state.document)),
          new Promise(resolve => { timer = setTimeout(() => resolve({ kind: 'unknown' }), timeoutMs); }),
        ]);
      } catch { result = { kind: 'unknown' }; }
      finally { clearTimeout(timer); }
      if (!disposed && requestEpoch === epoch) acceptSave(result);
      return true;
    },
    async checkSave() {
      if (state.busy || !state.saveUnknown || !owns(state.document)) return false;
      const requestEpoch = epoch;
      update({ busy: true, message: 'Đang kiểm tra kết quả lưu…' });
      let result;
      try { result = await adapter.checkSave(structuredClone(state.document)); } catch { result = { kind: 'unknown' }; }
      if (!disposed && requestEpoch === epoch) acceptSave(result);
      return true;
    },
    home() {
      if (state.busy || !sessionOK()) return false;
      update({ panel: null, message: '' }); onNavigate({ kind: 'home', target: 'P02' }); return true;
    },
    contact() {
      if (state.panel !== 'P03.S03' || !sessionOK()) return null;
      const channel = adapter.contactChannel;
      if (!channel || !/^(mailto:|tel:|https:\/\/)/.test(channel.href)) {
        update({ message: 'Chưa có kênh liên hệ quản trị được cấu hình. Chưa gửi tin nhắn.' }); return null;
      }
      return { ...channel }; // UI presents configured link; never sends on the user's behalf.
    },
    dispose() { disposed = true; epoch++; state = { ...state, panel: null }; },
  };
}
