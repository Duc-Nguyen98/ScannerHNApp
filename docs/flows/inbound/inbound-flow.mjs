import {canRestorePreview} from '../recovery-shift/draft-retention.mjs';
import { sessionGuard } from '../home/home-flow.mjs';
import { INBOUND_NAMESPACE, BOARD_CODES } from './fixture-adapter.mjs';
import { inboundFieldErrors, manualCodeError } from './validation.mjs';
import { INBOUND_TYPES, INBOUND_SUPPLIERS } from './catalogue.mjs';

export function createInboundFlow({ adapter, getState, onChange = () => {}, onStopped = () => {}, timeoutMs = 4000 }) {
  let disposed = false, sequence = 0, scanSequence = 0, scanEpoch = 0, active = false;
  const finishedRuns = [];
  const emptyRun = () => ({ step: 1, document: null, attempts: [], accepted: [], busy: false, unknown: false, request: null, recorded: false, outcome: null, message: '', exception:null });
  let state = emptyRun();
  const snapshot = () => structuredClone(state);
  const emit = changes => { if (!disposed) { state = { ...state, ...changes }; onChange(snapshot()); } };
  function sessionOK() {
    const auth = getState();
    return !disposed && !sessionGuard(auth) && (!state.document || (auth.session.actor.id === state.document.actorId && auth.session.warehouse.id === state.document.warehouseId));
  }
  function guard(write = true) {
    if (!sessionOK()) { emit({ message: 'Phiên hoặc quyền thao tác đã thay đổi. Dữ liệu được giữ để đối chiếu.' }); return false; }
    if (write && getState().session.warehouse.active !== true) { onStopped(); return false; }
    return true;
  }
  const editable = () => guard() && !state.busy && !state.unknown && !state.recorded;
  const fieldErrors = () => inboundFieldErrors(state.document);
  function metadataOK() {
    const d = state.document;
    return d && d.namespace === INBOUND_NAMESPACE && !!d.documentId && !!d.scanSessionId && d.version != null && Object.keys(fieldErrors()).length === 0;
  }
  function accept(result, checking) {
    if (!sessionOK()) { emit({ busy: false, unknown: true, message: 'Phiên đã thay đổi. Cần đối chiếu kết quả gửi; giữ nguyên phiếu.' }); return; }
    if (result?.kind === 'recorded' && JSON.stringify(result.request) === JSON.stringify(state.request)) {
      emit({ busy: false, unknown: false, recorded: true, sentAt:result.sentAt??null, outcome: 'recorded', step: 4, message: '' });
    } else if (((checking && result?.kind === 'not-recorded') || (!checking && result?.kind === 'rejected')) && result.retryAllowed === true && JSON.stringify(result.request) === JSON.stringify(state.request)) {
      emit({ busy: false, unknown: false, outcome: 'not-recorded', message: checking ? 'Đã xác nhận chưa ghi nhận. Có thể thử lại cùng yêu cầu.' : 'Phiếu chưa được ghi nhận. Dữ liệu được giữ nguyên.' });
    } else emit({ busy: false, unknown: true, outcome: null, message: 'Chưa xác định kết quả gửi. Giữ nguyên phiếu và yêu cầu; kiểm tra trạng thái trước khi thử lại.' });
  }
  async function run(checking) {
    if (!guard(!checking) || state.busy || state.recorded || !state.document) return false;
    if (checking ? !state.unknown : state.unknown || state.step !== 3 || !state.accepted.length) return false;
    if (!checking && !metadataOK()) { emit({message:Object.values(fieldErrors())[0] || 'Thiếu thông tin định danh phiếu.'}); return false; }
    if (adapter.fixture !== true) { emit({ message: 'Thiếu contract metadata/record/status đã duyệt. Chưa gửi phiếu.' }); return false; }
    if (checking && (typeof adapter.check !== 'function' || adapter.canCheck?.() === false)) { emit({busy:false,unknown:true,message:'Chưa có nguồn tra trạng thái khả dụng. Giữ nguyên yêu cầu để đối chiếu Web.'}); return false; }
    if (!state.request) state.request = { requestId: `${INBOUND_NAMESPACE}-request-${++sequence}`, document: structuredClone(state.document), lines: structuredClone(state.accepted) };
    emit({ busy: true, outcome: null, message: checking ? 'Đang kiểm tra trạng thái…' : 'Đang gửi phiếu…' });
    let timer, result;
    try { result = await Promise.race([adapter[checking ? 'check' : 'record'](structuredClone(state.request)), new Promise(resolve => { timer = setTimeout(() => resolve({ kind: 'unknown' }), timeoutMs); })]); }
    catch { result = { kind: 'unknown' }; }
    finally { clearTimeout(timer); }
    if (!disposed) accept(result, checking);
    return true;
  }
  return {
    snapshot,
    discardPreview(fingerprint) {
      if(adapter.fixture!==true||!editable()||state.request||!state.document||fingerprint!==JSON.stringify([state.document,state.accepted,state.attempts,state.request,state.recorded,state.unknown,state.busy]))return false;
      state=emptyRun();active=false;emit({});return true;
    },
    canCheck() { return typeof adapter.check === 'function' && adapter.canCheck?.() !== false; },
    restorePreview(checkpoint) {
      if(disposed||state.document||adapter.fixture!==true||!canRestorePreview(checkpoint,getState(),INBOUND_NAMESPACE)||!Array.isArray(checkpoint.accepted)||!Array.isArray(checkpoint.attempts)||![1,2,3,4].includes(checkpoint.step))return false;
      const copy=structuredClone(checkpoint);delete copy.operation;delete copy.source;delete copy.geography;
      state=copy;active=false;sequence=Math.max(sequence,Number(/request-(\d+)$/.exec(copy.request?.requestId||'')?.[1]||0));
      adapter.reserveDocumentIdentity?.(copy.document);
      emit({});return true;
    },
    fieldErrors,
    select(name, id) {
      if (!editable() || state.request || !state.document || state.step !== 1) return false;
      if (name === 'type') {
        const item=INBOUND_TYPES.find(item=>item.id===id);
        if (!item || state.attempts.length) return false;
        emit({document:{...state.document,typeId:item.id,type:item.name},message:''}); return true;
      }
      if (name === 'supplier') {
        const item=INBOUND_SUPPLIERS.find(item=>item.id===id); if(!item)return false;
        emit({document:{...state.document,supplierId:item.id,supplier:item.name,supplierCode:item.code},message:''}); return true;
      }
      return false;
    },
    // Session-local audit only, not P12 history or backend persistence.
    finishedRuns() { return structuredClone(finishedRuns); },
    newRun() {
      if (state.busy || state.unknown || !['recorded','not-recorded'].includes(state.outcome)) return false;
      return this.start({}, {newAttempt:true});
    },
    leave() { active = false; scanEpoch++; },
    bindScan(source='manual') {
      const epoch=scanEpoch,identity=state.document?.scanSessionId,owner=this;
      return (raw,time)=>!disposed&&active&&epoch===scanEpoch&&identity===state.document?.scanSessionId ? owner.scan(raw,source,time) : false;
    },
    start(context = {}, { newAttempt = false } = {}) {
      if (!guard()) return false;
      if(context.ownerFingerprint&&context.ownerFingerprint!==JSON.stringify([state.document,state.accepted,state.attempts,state.request,state.recorded,state.unknown,state.busy]))return false;
      let fresh = !state.document;
      if (context.documentId && context.documentId !== state.document?.documentId) return false;
      // Route re-render is not a new run. Only re-entry after leaving a confirmed
      // terminal result starts fresh; pending/UNKNOWN/drafts retain exact identity.
      if ((newAttempt || !active) && !context.documentId && !state.busy && !state.unknown && ['recorded','not-recorded'].includes(state.outcome)) {
        const nextDocument = adapter.makeDocument(getState().session);
        finishedRuns.push(snapshot());
        state = emptyRun();
        scanEpoch++;
        fresh = true;
        emit({ document: nextDocument });
      }
      if (!state.document) emit({ document: adapter.makeDocument(getState().session) });
      // P12 only seeds a freshly allocated draft. Never overwrite a resumed request.
      if (fresh && context.documentEntry) {
        const entry=context.documentEntry,supplier=INBOUND_SUPPLIERS.find(s=>s.id===entry.supplierId);
        if(supplier && typeof entry.note==='string' && entry.note.length<=200)
          emit({document:{...state.document,supplierId:supplier.id,supplier:supplier.name,supplierCode:supplier.code,note:entry.note}});
      }
      active = true;
      return true;
    },
    note(value) {
      if (!editable() || state.request || !state.document) return false;
      if (state.message === fieldErrors().note) state.message = '';
      state.document.note = String(value); return true;
    },
    dismissException() { if (!guard(false) || !state.exception) return false; emit({exception:null,message:''}); return true; },
    next() {
      if (!editable()) return false;
      if (!metadataOK()) { emit({ message: Object.values(fieldErrors())[0] || 'Thiếu thông tin phiếu bắt buộc. Chưa thể tiếp tục.' }); return false; }
      if (state.step === 1) emit({ step: 2, message: '' });
      else if (state.step === 2 && state.accepted.length) { scanEpoch++; emit({ step: 3, message: '', exception:null }); }
      else { emit({ message: 'Cần ít nhất một mã hợp lệ trước khi kiểm tra phiếu.' }); return false; }
      return true;
    },
    back() { if (state.busy || state.unknown || state.recorded || state.request || !guard(false)) return false; scanEpoch++; emit({ step: Math.max(1, state.step - 1), message: '', exception:null }); return true; },
    scan(raw, source = 'manual', time = new Date().toLocaleTimeString('vi-VN', { hour12: false })) {
      if (!active || !editable() || state.request || state.step !== 2 || !['manual', 'camera-fixture'].includes(source)) return false;
      if (!metadataOK()) { emit({message:Object.values(fieldErrors())[0] || 'Thông tin phiếu chưa hợp lệ.'}); return false; }
      if (manualCodeError(raw)) { emit({message:manualCodeError(raw)}); return false; }
      // Fail closed for malformed/throwing source responses. A broken adapter
      // must not create NaN/negative quantities or crash the current draft.
      let result;
      try { result = adapter.validate(raw); } catch { result = null; }
      const quantity = state.accepted.reduce((total,row)=>total+row.quantity,0);
      if (!result || !['valid','invalid'].includes(result.kind) ||
        (result.kind === 'valid' && (result.raw !== raw || typeof result.sku !== 'string' || !result.sku.trim() || !Number.isSafeInteger(result.quantity) || result.quantity <= 0 || !Number.isSafeInteger(quantity + result.quantity)))) {
        result = {kind:'invalid', reason:'Chưa xác minh được mã sản phẩm. Vui lòng kiểm tra lại.'};
      }
      if (result.kind === 'invalid' && (typeof result.reason !== 'string' || !result.reason.trim())) result = {kind:'invalid',reason:'Mã chưa hợp lệ. Vui lòng kiểm tra lại.'};
      // Raw is intentionally preserved, never uppercased/truncated.
      const kind = result.kind === 'valid' && state.accepted.some(row => row.raw === raw) ? 'duplicate' : result.kind;
      const attempt = { eventId: `${state.document.scanSessionId}:event:${++scanSequence}`, raw, source, time, kind, ...(result.reason ? {reason:result.reason} : {}) };
      const accepted = kind === 'valid' ? [...state.accepted, { raw, sku: result.sku, quantity: result.quantity,
        ...(typeof result.serial==='string'&&result.serial.trim()?{serial:result.serial}:{}),
      }] : state.accepted;
      emit({ attempts: [...state.attempts, attempt], accepted, exception:kind==='invalid'?{panel:'P17.S01',raw,reason:result.reason}:null, message: kind === 'invalid' ? result.reason : '' });
      return kind;
    },
    fixtureBatch() {
      if (state.attempts.length || !editable() || state.step !== 2) return false;
      (adapter.boardCodes||BOARD_CODES).forEach((code, i) => this.scan(code, 'camera-fixture', i === 11 ? '09:15:22' : i === 10 ? '09:14:58' : i === 9 ? '09:14:36' : `09:13:${String(i + 10).padStart(2, '0')}`));
      return true;
    },
    send() { return run(false); }, check() { return run(true); },
    message(message) { emit({ message }); },
    dispose() { disposed = true; },
  };
}
