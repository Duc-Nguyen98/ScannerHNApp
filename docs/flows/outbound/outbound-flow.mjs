import {canRestorePreview} from '../recovery-shift/draft-retention.mjs';
import { sessionGuard } from '../home/home-flow.mjs';
import { OUTBOUND_NAMESPACE, BOARD_CODES, OUTBOUND_RECIPIENTS, OUTBOUND_SOURCES, OUTBOUND_GROUPS } from './fixture-adapter.mjs';
import { outboundFieldErrors, manualCodeError, validPlannedInput } from './validation.mjs';
import { createGeographyClient, GEOGRAPHY_VERSION } from './geography.mjs';

export function createOutboundFlow({ adapter, getState, onChange = () => {}, onStopped = () => {}, timeoutMs = 4000, geography = createGeographyClient() }) {
  let disposed = false, sequence = 0, scanSequence = 0, scanEpoch = 0, active = false, initialDocument = '';
  const finishedRuns = [];
  const emptyRun = () => ({ step: 1, returnToReview: false, document: null, attempts: [], accepted: [], busy: false, unknown: false, request: null, recorded: false, outcome: null, message: '', exception: null });
  let state = emptyRun();
  let districtEpoch = 0;
  let geo = {provinces:geography.cachedProvinces(),provinceStatus:geography.cachedProvinces().length?'ready':'idle',districts:[],districtStatus:'idle'};
  const snapshot = () => structuredClone({...state,geography:geo});
  function resetLocation() { districtEpoch++;geo = {...geo,districts:[],districtStatus:'idle'}; }
  async function loadProvinces() {
    if(disposed || geo.provinceStatus==='loading' || geo.provinceStatus==='ready')return;
    geo.provinceStatus='loading';emit({}, {geographyOnly:true});
    try{const provinces=await geography.provinces();if(disposed)return;geo={...geo,provinces,provinceStatus:'ready'};}
    catch{if(disposed)return;geo={...geo,provinces:[],provinceStatus:'error'};}
    emit({}, {geographyOnly:true});
  }
  async function loadDistricts() {
    const provinceId=state.document?.provinceId;if(!provinceId||disposed||geo.districtStatus==='loading')return;
    const token=++districtEpoch,docId=state.document.documentId;
    geo={...geo,districts:[],districtStatus:'loading'};emit({}, {geographyOnly:true});
    try{const districts=await geography.districts(provinceId);if(disposed||token!==districtEpoch||docId!==state.document?.documentId||provinceId!==state.document?.provinceId)return;geo={...geo,districts,districtStatus:'ready'};}
    catch{if(disposed||token!==districtEpoch)return;geo={...geo,districts:[],districtStatus:'error'};}
    emit({}, {geographyOnly:true});
  }
  const emit = (changes, context) => { if (!disposed) { if((changes.step!==undefined&&changes.step!==state.step)||(changes.document&&changes.document.scanSessionId!==state.document?.scanSessionId))scanEpoch++; state = { ...state, ...changes }; onChange(snapshot(),context); } };
  function sessionOK() {
    const auth = getState();
    return !disposed && !sessionGuard(auth) && (!state.document || (auth.session.actor.id === state.document.actorId && auth.session.warehouse.id === state.document.warehouseId));
  }
  function guard(write = true) {
    if (!sessionOK()) { emit({ message: 'Phiên hoặc quyền thao tác đã thay đổi. Dữ liệu được giữ để đối chiếu.' }); return false; }
    if (write && getState().session.warehouse.active !== true) { onStopped(); return false; }
    return true;
  }
  const editable = () => guard() && !state.busy && !state.unknown && !state.recorded && state.exception?.panel!=='P17.S02';
  function fieldErrors() {
    const d = state.document, errors = outboundFieldErrors(d);
    if(d && (!geo.provinces.some(p=>p.id===d.provinceId&&p.name===d.provinceName)||d.geographyVersion!==GEOGRAPHY_VERSION))errors.province='Vui lòng chọn Tỉnh/Thành phố hợp lệ.';
    if(d && (!geo.districts.some(p=>p.id===d.districtId&&p.name===d.districtName&&p.provinceId===d.provinceId)))errors.district='Vui lòng chọn Quận/Huyện thuộc tỉnh đã chọn.';
    if (d && !errors.planned && d.planned < state.accepted.reduce((n,l)=>n+l.quantity,0)) errors.planned = 'Số lượng không được nhỏ hơn số sản phẩm đã soạn. Các mã đã quét được giữ nguyên.';
    if (d && !OUTBOUND_SOURCES.some(s=>s.id===d.sourceId && s.number===d.number)) errors.number = 'Phiếu nguồn không hợp lệ.';
    if (d && !OUTBOUND_GROUPS.some(g=>g.id===d.groupId && g.name===d.group)) errors.group = 'Nhóm hàng không hợp lệ.';
    if (d && !(d.recipientType === 'walk-in' && d.recipientId === null) && !(d.recipientType === 'existing' && OUTBOUND_RECIPIENTS.some(r=>r.id===d.recipientId && r.name===d.recipient))) errors.recipient = 'Người nhận không hợp lệ. Chọn khách đã có hoặc Khách vãng lai.';
    return errors;
  }
  function metadataOK() {
    const d = state.document;
    return d && d.namespace === OUTBOUND_NAMESPACE && !!d.documentId && !!d.scanSessionId && d.version != null && Object.keys(fieldErrors()).length === 0;
  }
  function accept(result, checking) {
    if (!sessionOK()) { emit({ busy: false, unknown: true, message: 'Phiên đã thay đổi. Cần đối chiếu kết quả gửi; giữ nguyên phiếu.' }); return; }
    if (result?.kind === 'recorded' && JSON.stringify(result.request) === JSON.stringify(state.request)) {
      emit({ busy: false, unknown: false, recorded: true, sentAt: result.sentAt, outcome: 'recorded', step: 4, message: '' });
    } else if (((checking && result?.kind === 'not-recorded') || (!checking && result?.kind === 'rejected')) && result.retryAllowed === true && JSON.stringify(result.request) === JSON.stringify(state.request)) {
      emit({ busy: false, unknown: false, outcome: 'not-recorded', message: checking ? 'Đã xác nhận chưa ghi nhận. Có thể thử lại cùng yêu cầu.' : 'Phiếu chưa được ghi nhận. Dữ liệu được giữ nguyên.' });
    } else emit({ busy: false, unknown: true, outcome: null, message: 'Chưa xác định kết quả gửi. Giữ nguyên phiếu và yêu cầu; kiểm tra trạng thái trước khi thử lại.' });
  }
  async function run(checking) {
    if (!guard(!checking) || state.busy || state.recorded || !state.document) return false;
    if (checking ? !state.unknown : state.unknown || state.step !== 3) return false;
    if (!checking && !metadataOK()) { emit({ message: Object.values(fieldErrors())[0] || 'Thiếu thông tin định danh phiếu nguồn. Chưa thể gửi.' }); return false; }
    if (!checking && state.accepted.reduce((n, l) => n + l.quantity, 0) !== state.document.planned) return false;
    if (adapter.fixture !== true) { emit({ message: 'Thiếu contract metadata/record/status đã duyệt. Chưa gửi phiếu.' }); return false; }
    if (checking && (typeof adapter.check !== 'function' || adapter.canCheck?.() === false)) { emit({busy:false,unknown:true,message:'Chưa có nguồn tra trạng thái khả dụng. Giữ nguyên yêu cầu để đối chiếu Web.'}); return false; }
    if (!state.request) state.request = { requestId: `${OUTBOUND_NAMESPACE}-request-${++sequence}`, document: structuredClone(state.document), lines: structuredClone(state.accepted) };
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
      resetLocation();state=emptyRun();active=false;initialDocument='';emit({});return true;
    },
    canCheck() { return typeof adapter.check === 'function' && adapter.canCheck?.() !== false; },
    restorePreview(checkpoint) {
      if(disposed||state.document||adapter.fixture!==true||!canRestorePreview(checkpoint,getState(),OUTBOUND_NAMESPACE)||!Array.isArray(checkpoint.accepted)||!Array.isArray(checkpoint.attempts)||![1,2,3,4].includes(checkpoint.step))return false;
      const copy=structuredClone(checkpoint);delete copy.operation;delete copy.source;delete copy.geography;
      state=copy;active=false;scanEpoch++;sequence=Math.max(sequence,Number(/request-(\d+)$/.exec(copy.request?.requestId||'')?.[1]||0));
      for(const event of copy.attempts)scanSequence=Math.max(scanSequence,Number(/:event:(\d+)$/.exec(event.eventId||'')?.[1]||0));
      adapter.reserveDocumentIdentity?.(copy.document);
      initialDocument=JSON.stringify(copy.document);resetLocation();void loadProvinces();void loadDistricts();
      emit({});return true;
    },
    fieldErrors,
    hasUnfinishedWork() {
      return !disposed && !!state.document && !state.recorded && (state.busy || state.unknown || !!state.request || state.attempts.length > 0 || JSON.stringify(state.document) !== initialDocument);
    },
    editDelivery() {
      if (!editable() || state.request || state.step !== 3) return false;
      emit({step:1,returnToReview:true,message:''});return true;
    },
    loadProvinces,
    loadDistricts,
    select(name, id) {
      if (!editable() || state.request || !state.document || state.step !== 1) return false;
      if (['source','group'].includes(name) && state.attempts.length) { emit({message:'Đã có lượt quét. Giữ nguyên phiếu và nhóm hàng để bảo toàn dữ liệu.'}); return false; }
      if (name === 'province') {
        const p=geo.provinces.find(p=>p.id===id);if(!p)return false;
        if(id===state.document.provinceId)return true;
        resetLocation();const cached=geography.cachedDistricts(id);
        geo={...geo,districts:cached,districtStatus:cached.length?'ready':'idle'};
        emit({document:{...state.document,provinceId:p.id,provinceName:p.name,districtId:null,districtName:'',address:'',geographyVersion:GEOGRAPHY_VERSION},message:''});
        if(!cached.length)void loadDistricts();return true;
      }
      if (name === 'district') {
        const district=geo.districts.find(d=>d.id===id&&d.provinceId===state.document.provinceId);if(!district)return false;
        if(id===state.document.districtId)return true;
        emit({document:{...state.document,districtId:district.id,districtName:district.name,address:''},message:''});return true;
      }
      if (name === 'source') {
        if (!OUTBOUND_SOURCES.some(s=>s.id===id)) return false;
        if (id === state.document.sourceId) return true;
        const d = adapter.makeDocument(getState().session, id);
        if (!d) return false;
        resetLocation();emit({document:d,message:''}); return true;
      }
      if (name === 'recipient') {
        const r = OUTBOUND_RECIPIENTS.find(r=>r.id===id);
        if (!r && id !== 'walk-in') return false;
        if (id === state.document.recipientId || id === 'walk-in' && state.document.recipientType === 'walk-in') return true;
        resetLocation();emit({document:{...state.document,recipientType:r?'existing':'walk-in',recipientId:r?.id||null,recipient:r?.name||'',phone:r?.phone||'',address:'',addressSuggestion:r?.address||'',provinceId:null,provinceName:'',districtId:null,districtName:'',geographyVersion:GEOGRAPHY_VERSION},message:''}); return true;
      }
      if (name === 'group') {
        const g = OUTBOUND_GROUPS.find(g=>g.id===id); if (!g) return false;
        emit({document:{...state.document,groupId:g.id,group:g.name},message:''}); return true;
      }
      return false;
    },
    // Session-local audit only, not P12 history or backend persistence.
    finishedRuns() { return structuredClone(finishedRuns); },
    leave() { active = false; scanEpoch++; },
    bindScan(source='manual') {
      const epoch=scanEpoch,identity=state.document?.scanSessionId,owner=this;
      return (raw,time)=>!disposed&&active&&epoch===scanEpoch&&identity===state.document?.scanSessionId ? owner.scan(raw,source,time) : false;
    },
    start(context = {}, { newAttempt = false } = {}) {
      if (!guard()) return false;
      if(context.ownerFingerprint&&context.ownerFingerprint!==JSON.stringify([state.document,state.accepted,state.attempts,state.request,state.recorded,state.unknown,state.busy]))return false;
      if (context.documentId && context.documentId !== state.document?.documentId) return false;
      // Explicit task/picker selection is a new attempt even if its route is
      // already visible. Merely repainting/dismissing a dialog is not. Never
      // reset a draft, pending request, UNKNOWN or an explicit document resume.
      const terminal = state.outcome === 'recorded' || state.outcome === 'not-recorded';
      if ((newAttempt || !active) && !context.documentId && !state.busy && !state.unknown && terminal) {
        const nextDocument = adapter.makeDocument(getState().session);
        finishedRuns.push(snapshot());
        resetLocation();
        state = emptyRun();
        initialDocument = JSON.stringify(nextDocument);
        emit({ document: nextDocument });
      }
      if (!state.document) { const document=adapter.makeDocument(getState().session);initialDocument=JSON.stringify(document);emit({document}); }
      active = true;
      return true;
    },
    note(value) {
      if (!editable() || state.request || !state.document) return false;
      if (state.message === outboundFieldErrors(state.document).note) state.message = '';
      state.document.note = String(value); return true;
    },
    field(name, value) {
      if (!editable() || state.request || !state.document || !['phone', 'address', 'recipient', 'planned'].includes(name)) return false;
      if (name === 'recipient' && state.document.recipientType !== 'walk-in') return false;
      if (name === 'address' && (fieldErrors().province || fieldErrors().district)) return false;
      if (state.message === fieldErrors()[name]) state.message = '';
      if (name === 'planned') {
        state.document.plannedInput = String(value);
        state.document.planned = validPlannedInput(String(value)) ? Number(value) : null;
      } else state.document[name] = String(value);
      return true;
    },
    dismissException() { if (!state.exception || !guard(false)) return false; emit({ exception: null, message: '' }); return true; },
    next() {
      if (!editable()) return false;
      if (!metadataOK()) { emit({ message: Object.values(fieldErrors())[0] || 'Thiếu thông tin định danh phiếu nguồn. Chưa thể tiếp tục.' }); return false; }
      if (state.step === 1) emit({ step: state.returnToReview ? 3 : 2, returnToReview:false, message: '' });
      else if (state.step === 2 && state.accepted.length) emit({ step: 3, message: '',exception:null });
      else { emit({ message: 'Cần ít nhất một mã hợp lệ trước khi kiểm tra phiếu.' }); return false; }
      return true;
    },
    back() { if (state.busy || state.unknown || state.recorded || state.exception?.panel==='P17.S02' || !guard(false)) return false; emit({ step: Math.max(1, state.step - 1), message: '', exception:null }); return true; },
    scan(raw, source = 'manual', time = new Date().toLocaleTimeString('vi-VN', { hour12: false })) {
      if (!editable() || state.request || state.step !== 2 || !['manual', 'camera-fixture'].includes(source)) return false;
      if (!metadataOK()) { emit({message:Object.values(fieldErrors())[0] || 'Thông tin phiếu chưa hợp lệ.'}); return false; }
      if (manualCodeError(raw)) { emit({ message: manualCodeError(raw) }); return false; }
      let result;
      try { result=adapter.validate(raw,state.document); } catch { result=null; }
      if(!result||!['valid','invalid','blocked'].includes(result.kind)||(result.kind==='valid'&&(result.raw!==raw||typeof result.sku!=='string'||!result.sku.trim()||!Number.isSafeInteger(result.quantity)||result.quantity<=0))) result={kind:'invalid',reason:'Chưa xác minh được mã sản phẩm. Vui lòng kiểm tra lại.'};
      if(['invalid','blocked'].includes(result.kind)&&(typeof result.reason!=='string'||!result.reason.trim())) result={...result,reason:'Chưa xác định nguyên nhân từ nguồn kiểm tra mã.'};
      if (result.kind === 'valid' && !state.accepted.some(row => row.raw === raw) && state.accepted.reduce((n,l) => n+l.quantity,0) + result.quantity > state.document.planned) result = { kind: 'invalid', reason: 'Đã đủ số lượng yêu cầu. Không thêm mã vượt kế hoạch.' }; // Raw is intentionally preserved, never uppercased/truncated.
      const kind = result.kind === 'valid' && state.accepted.some(row => row.raw === raw) ? 'duplicate' : result.kind;
      const attempt = { eventId: `${state.document.scanSessionId}:event:${++scanSequence}`, raw, source, time, kind, ...(result.reason ? { reason: result.reason } : {}) };
      const accepted = kind === 'valid' ? [...state.accepted, { raw, sku: result.sku, quantity: result.quantity }] : state.accepted;
      emit({ attempts: [...state.attempts, attempt], accepted, exception: kind === 'blocked' ? { panel: 'P17.S02', raw, reason: result.reason, product: result.product, relatedDocument: result.relatedDocument, documentId: state.document.documentId, scanSessionId: state.document.scanSessionId, version: state.document.version } : kind==='invalid'?{panel:'P17.S01',raw,reason:result.reason}:null, message: kind === 'invalid' ? result.reason : '' });
      return kind;
    },
    fixtureBatch() {
      if (state.attempts.length || !editable() || state.step !== 2) return false;
      if (state.document.planned !== 10 || state.document.groupId !== 'printers') { emit({message:'Bộ mẫu 7/10 cần số lượng 10 và nhóm Máy in nhiệt. Quay lại thông tin phiếu hoặc nhập từng mã.'}); return false; }
      BOARD_CODES.forEach((code, i) => this.scan(code, 'camera-fixture', `14:31:${String(i + 10).padStart(2, '0')}`));
      return true;
    },
    send() { return run(false); }, check() { return run(true); },
    message(message) { emit({ message }); },
    dispose() { disposed = true; districtEpoch++; },
  };
}
