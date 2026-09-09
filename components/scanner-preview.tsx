// @ts-nocheck -- the preview keeps the existing discriminated draft model while
// supporting the legacy warranty/parts branches in one runtime surface.
'use client';
import {AppDialog,type AppDialogHandle} from './scanner-app-overlay';
import {scrollAppTop,useAppShell} from './scanner-app-shell';
/* oxlint-disable react/react-compiler -- Render helpers return event handlers;
 * transaction/navigation refs are accessed only inside those handlers/effects.
 * The preview is not compiled with React Compiler. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ScanLine,
  ScanQrCode,
  Search,
  Radio,
  Home,
  ClipboardCheck,
  History,
  UserRound,
  CheckCircle2,
  ChevronRight,
  Plus,
  X,
  Package,
  Layers,
  WifiOff,
  LoaderCircle,
  AlertTriangle,
  Camera,
  ImagePlus,
  Bell,
} from 'lucide-react';
import {
  stamp,
  validateLine,
  createDocument,
  postDocument,
  changeCase,
  canIssueParts,
  transitions,
  type Store,
  type Kind,
  type Line,
  type Warranty,
  type CaseStatus,
} from '@/lib/scanner-model';
import './scanner-preview.css';
import { ScannerAuthScreen, useScannerAccess } from './scanner-auth';
import ScannerAccount from './scanner-account';
import ScannerHome from './scanner-home';
import {applyScannerDesignFixtures,seedScannerDesignStore,scannerDesignSerial,scannerHomeRecords} from '@/lib/scanner-design-fixtures';
import ScannerOutbound from './scanner-outbound';
import ScannerInboundCreate from './scanner-inbound-create';
import ScannerInboundScan from './scanner-inbound-scan';
import {ScannerInboundReview,ScannerInboundResult,InboundSubmitSummary} from './scanner-inbound-review';
import ScannerOutboundScan from './scanner-outbound-scan';
import {ScannerOutboundReview,ScannerOutboundResult,OutboundSubmitSummary} from './scanner-outbound-review';
import {useScannerMobileLayout} from './scanner-mobile-layout';
import './scanner-mobile-layout.css';
import {actionPermission,assertWrite,authorizeCommit,changeWarehouse,documentPermission,permitted,profiles,warehouseMessage,warehouseStatus,type WarehouseStatus} from '@/lib/scanner-policy';
import {assertLaunch,resolveScan,type GlobalIntent} from '@/lib/scanner-intent';
import ScannerLauncher, {ScannerPausedWarning} from './scanner-launcher';
import IntentScanner from './scanner-intent-scan';
import './scanner-global.css';
import './scanner-visual-lock.css';
import './scanner-home.css';

type View =
  | 'home'
  | 'lookup'
  | 'product'
  | 'scan-lookup' | 'scan-warranty' | 'warranty-product'
  | 'create'
  | 'scan'
  | 'review'
  | 'result'
  | 'docs'
  | 'doc'
  | 'warranty'
  | 'case'
  | 'intake'
  | 'nfc'
  | 'nfc-bind'
  | 'history'
  | 'profile'
  | 'profile-edit' | 'profile-avatar' | 'profile-work' | 'profile-security' | 'profile-password' | 'profile-help' | 'profile-support'
  | 'login';
type Draft = {
  kind: Kind;
  name: string;
  recipient: string;
  phone: string;
  address: string;
  group: string;
  target: string;
  note: string;
  caseId?: string;
  lines: Line[];
  key: string;
};
type Popup = {
  title: string;
  body: ReactNode;
  action?: () => void;
  label?: string;
  danger?: boolean;
};
const key = () => `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fresh = (kind: Kind, caseId?: string): Draft => ({
  kind,
  name: '',
  recipient: '',
  phone: '',
  address: '',
  group: 'Đại lý',
  target: '1',
  note: '',
  caseId,
  lines: [],
  key: key(),
});
const kindLabel = (k: Kind) =>
  k === 'in' ? 'Nhập kho' : k === 'out' ? 'Xuất kho' : 'Xuất linh kiện';
const icons = [Home, ClipboardCheck, ScanLine, History, UserRound];
const nav: View[] = ['home', 'docs', 'lookup', 'history', 'profile'];
const navLabels = ['Trang chủ', 'Chứng từ', 'Quét mã', 'Lịch sử', 'Cá nhân'];
const allStatuses: CaseStatus[] = [
  'Tiếp nhận',
  'Đang kiểm tra',
  'Đang sửa chữa',
  'Hoàn tất',
  'Đã trả',
  'Đã huỷ',
];
const titles: Record<View, string> = {
  home: 'Ca làm việc của bạn',
  lookup: 'Tra cứu sản phẩm',
  product: 'Chi tiết sản phẩm',
  'scan-lookup':'Quét tra cứu sản phẩm', 'scan-warranty':'Quét bảo hành', 'warranty-product':'Kết quả kiểm tra bảo hành',
  create: 'Thông tin phiếu',
  scan: 'Quét mã',
  review: 'Kiểm tra phiếu',
  result: 'Kết quả xử lý',
  docs: 'Chứng từ kho',
  doc: 'Chi tiết chứng từ',
  warranty: 'Bảo hành',
  case: 'Hồ sơ bảo hành',
  intake: 'Tiếp nhận bảo hành',
  nfc: 'Thẻ NFC',
  'nfc-bind': 'Liên kết thẻ NFC',
  history: 'Lịch sử thao tác',
  profile: 'Cá nhân',
  'profile-edit':'Chỉnh sửa hồ sơ', 'profile-avatar':'Ảnh đại diện', 'profile-work':'Công việc và quyền', 'profile-security':'Tài khoản và bảo mật', 'profile-password':'Đổi mật khẩu', 'profile-help':'Hướng dẫn sử dụng', 'profile-support':'Liên hệ hỗ trợ',
  login: 'Đăng nhập',
};
const Card = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <section className={`sc-card ${className}`}>{children}</section>;
const Badge = ({ children }: { children: ReactNode }) => (
  <span
    className={`sc-badge ${typeof children === 'string' && /huỷ|Hỏng|Thất lạc/.test(children) ? 'danger' : typeof children === 'string' && /chờ|Chờ|kiểm tra/.test(children) ? 'warning' : ''}`}
  >
    {children}
  </span>
);
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="sc-field">
    <span>{label}</span>
    {children}
  </label>
);
const Empty = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => (
  <div className="sc-empty">
    <Package />
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="sc-row">
    <span>{label}</span>
    <strong>{children}</strong>
  </div>
);
export default function ScannerPreview() {
  const access = useScannerAccess();
  const appShell=useAppShell();
  const [qa,setQa]=useState(false),[launcher,setLauncher]=useState(false);
  const [matches,setMatches]=useState<Store['items']>([]);
  const launcherReturn=useRef<View>('home');
  useEffect(()=>{queueMicrotask(()=>setQa(new URLSearchParams(window.location.search).get('qa')==='1'));},[]);
  const [db, setDb] = useState<Store>(seedScannerDesignStore);
  const dbRef = useRef(db);
  const [ready, setReady] = useState(false);
  const view = access.route.view as View;
  const phoneRef=useScannerMobileLayout(`${view}-${access.allowed}-${ready}`);
  const [haptic,setHaptic]=useState(false);
  const [sound,setSound]=useState(false);
  const [draft, setDraft] = useState<Draft>(() => fresh('in'));
  useEffect(()=>{
    const warn=(event:BeforeUnloadEvent)=>{if(['create','scan','review'].includes(view)&&(draft.name.trim()||draft.lines.length)){event.preventDefault();}};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[view,draft]);
  const selectedId = access.route.id;
  const productCode = access.route.product;
  const pendingContext = useRef({id:'',product:''});
  const setSelectedId = (id:string) => { pendingContext.current.id=id; };
  const setProductCode = (product:string) => { pendingContext.current.product=product; };
  const [query, setQuery] = useState('');
  const [docFilter, setDocFilter] = useState('Tất cả');
  const [caseFilter, setCaseFilter] = useState('Tất cả');
  const [tagFilter, setTagFilter] = useState('Tất cả');
  const [historyFilter, setHistoryFilter] = useState('Tất cả');
  const [scanCode, setScanCode] = useState('');
  const [box, setBox] = useState('');
  const [boxQty, setBoxQty] = useState('');
  const [inputSheet, setInputSheet] = useState(false);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [mode, setMode] = useState('normal');
  const [connected,setConnected]=useState(true);
  const [networkNotice,setNetworkNotice]=useState('');
  const [storageError,setStorageError]=useState('');
  const [deviceState,setDeviceState]=useState('normal');
  useEffect(()=>{const update=()=>{setConnected(navigator.onLine);setNetworkNotice(navigator.onLine?'Đã kết nối lại. Kiểm tra nội dung và bấm lại thao tác cần gửi.':'Mất kết nối. Nội dung đang soạn được giữ; chưa gửi thay đổi.');};setConnected(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
  const role = access.session?.role || 'Nhân viên kho';
  const setRole = (value:string) => access.changePreviewRole(value);
  const paused=warehouseStatus(db)==='paused';
  const routePermission=actionPermission(view,draft.kind);
  const readPermission=view==='scan-lookup'?'inventory.view':['scan-warranty','warranty-product'].includes(view)?'warranty.view':null;
  const actionDenied=(!!routePermission && (!permitted(access.session,routePermission)||paused))|| (!!readPermission&&!permitted(access.session,readPermission));
  const [warehouseTarget,setWarehouseTarget]=useState<WarehouseStatus|null>(null);
  const [warehouseReason,setWarehouseReason]=useState('');
  const warehouseDialogRef=useRef<AppDialogHandle>(null);
  useEffect(()=>{const dialog=warehouseDialogRef.current;if(!dialog)return;if(warehouseTarget&&!dialog.open)dialog.showModal();else if(!warehouseTarget&&dialog.open)dialog.close();},[warehouseTarget]);
  const [result, setResult] = useState({
    title: '',
    message: '',
    docId: '',
    caseId: '',
  });
  const [caseTab, setCaseTab] = useState('Thông tin');
  const [caseNote, setCaseNote] = useState('');
  const [mediaGroup, setMediaGroup] = useState('Tiếp nhận');
  const [intake, setIntake] = useState({
    code: '',
    missing: false,
    customer: '',
    phone: '',
    address: '',
    fault: '',
    product: '',
    reason: '',
    accessories: '',
  });
  const [nfcCode, setNfcCode] = useState('MAY-001');
  const [uid, setUid] = useState('NFC-002');
  const [nfcStage, setNfcStage] = useState(0);
  const [nfcReason, setNfcReason] = useState('');
  const dialogRef = useRef<AppDialogHandle>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const storageKey = 'hoanam-scanner-preview-v2';
  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
    if (!mounted) return;
    try {
      const value = localStorage.getItem(storageKey);
      if (value) {
        const saved = JSON.parse(value);
        if (
          saved.version === 1 &&
          Array.isArray(saved.items) &&
          Array.isArray(saved.cases) &&
          Array.isArray(saved.docs) &&
          Array.isArray(saved.events) &&
          Array.isArray(saved.tags)
        ) {
          const upgraded=applyScannerDesignFixtures(saved);
          dbRef.current = upgraded;
          setDb(upgraded);
        } else throw new Error('Invalid local store');
      }
    } catch {setStorageError('Không thể đọc dữ liệu trên thiết bị. Vui lòng tải lại hoặc liên hệ hỗ trợ; không tạo giao dịch mới trước khi kiểm tra.');}
    setReady(true);
    });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (ready&&!storageError)
      try {
        localStorage.setItem(storageKey, JSON.stringify(db));
      } catch {queueMicrotask(()=>setStorageError('Không thể lưu dữ liệu trên thiết bị. Vui lòng giải phóng dung lượng rồi thử lại.'));}
  }, [db, ready,storageError]);
  useEffect(()=>{
    const receive=(event:StorageEvent)=>{
      if(event.key!==storageKey||!event.newValue)return;
      try{const next=JSON.parse(event.newValue) as Store;if(next.version===1&&Array.isArray(next.docs)&&Array.isArray(next.cases)&&Array.isArray(next.items)&&Array.isArray(next.tags)&&Array.isArray(next.events)){dbRef.current=next;setDb(next);setPopup(null);setInputSheet(false);setBox('');}}catch{}
    };
    window.addEventListener('storage',receive);return()=>window.removeEventListener('storage',receive);
  },[]);
  const modalOpen = access.allowed && (!!popup || inputSheet || !!box);
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (modalOpen && !el.open) {
      previousFocus.current = document.activeElement as HTMLElement;
      el.showModal();
    } else if (!modalOpen && el.open) {
      el.close();
      previousFocus.current?.focus();
    }
  }, [modalOpen]);
  useEffect(() => {
      setPopup(null);
      setInputSheet(false);
      setBox('');
      setError('');
      scrollAppTop();
  }, [view, selectedId, productCode]);
  const go = (next: View) => {
    const permission=actionPermission(next,draft.kind);
    if(permission && !can(permission)){setError(paused?warehouseMessage:'Bạn chỉ được xem nội dung này; không có quyền mở thao tác ghi.');return;}
    access.navigate(next,{id:pendingContext.current.id || selectedId,product:pendingContext.current.product || productCode});
    pendingContext.current={id:'',product:''};
    setError('');
    setNotice('');
  };
  const back = () => {
    access.back();
    setError('');
  };
  const tab = (next: View) => {
    if (['scan', 'review', 'create'].includes(view) && (draft.lines.length || draft.name.trim() || draft.recipient.trim())) {
      setPopup({
        title: 'Rời phiếu đang soạn?',
        body: 'Các mã đã quét được giữ trong lần mở này. Bạn có thể tiếp tục từ trang chủ.',
        label: 'Về trang chủ',
        action: () => {
          access.navigate('home',{},true);
          setPopup(null);
        },
      });
    } else {
      access.navigate(next,{},true);
      setQuery('');
      setError('');
    }
  };
  const start = async (kind: Kind, caseId?: string) => {
    if(!can(documentPermission(kind,'create'))){setError(paused?warehouseMessage:'Bạn không có quyền lập phiếu.');return;}
    if((draft.lines.length||draft.name.trim()||draft.recipient.trim())&&!await appShell.confirm('Bạn còn phiếu đang soạn. Bỏ nội dung phiếu cũ để tạo phiếu mới?'))return;
    setDraft(fresh(kind, caseId));
    setScanCode('');
    go(kind === 'parts' ? 'scan' : 'create');
  };
  const can=(permission:string)=>!paused&&permitted(access.session,permission);
  const readOnly = !can(view==='nfc'||view==='nfc-bind'?'physical_code.assign_rfid':view==='case'||view==='intake'||view==='warranty'?'warranty.manage':documentPermission(draft.kind,'create'));
  const approver = can(documentPermission(db.docs.find(d=>d.id===selectedId)?.kind||'in','post'));
  const currentStore=()=>{
    try {const saved=localStorage.getItem(storageKey);if(saved){const next=JSON.parse(saved) as Store;if(next.version===1&&Array.isArray(next.docs))dbRef.current=next;}}catch{}
    return dbRef.current;
  };
  const hasDraft=!!(draft.name.trim()||draft.recipient.trim()||draft.note.trim()||draft.lines.length||intake.customer.trim()||intake.code.trim()||intake.fault.trim());
  const launchReason=(intent:GlobalIntent)=>{try{assertLaunch(currentStore(),access.actor(),intent);return '';}catch{return (intent==='INBOUND'||intent==='OUTBOUND')&&warehouseStatus(db)==='paused'?'Kho đang tạm dừng hoạt động':'Bạn không có quyền thực hiện tác vụ này.';}};
  const launch=(intent:GlobalIntent,discard:boolean)=>{
    try{assertLaunch(currentStore(),access.actor(),intent);}catch(e){setError((e as Error).message);return;}
    if(discard){setDraft(fresh('in'));setIntake({code:'',missing:false,customer:'',phone:'',address:'',fault:'',product:'',reason:'',accessories:''});}
    setScanCode('');setError('');setNotice('');setMatches([]);
    if(intent==='INBOUND'||intent==='OUTBOUND'){setDraft(fresh(intent==='INBOUND'?'in':'out'));access.navigate('create');}
    else access.navigate(intent==='LOOKUP'?'scan-lookup':'scan-warranty');
  };
  const intentScan=(code:string)=>{
    if(mode==='offline'||!navigator.onLine){setError('Đang ngoại tuyến. Chưa thể kiểm tra mã; vui lòng thử lại khi có kết nối.');return;}
    try{const result=resolveScan(currentStore(),access.actor(),view==='scan-warranty'?'WARRANTY':'LOOKUP',code);setError('');
      if(result.type==='choose'){setMatches(result.items);return;}
      setMatches([]);if(result.type==='case')access.navigate('case',{id:result.caseId});
      else access.navigate(view==='scan-warranty'?'warranty-product':'product',{product:result.item.code});
    }catch(e){setError((e as Error).message);}
  };
  const save = (next: Store) => {
    if(storageError)throw new Error(storageError);
    authorizeCommit(currentStore(),next,access.actor());
    try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{throw new Error('Không thể lưu trên thiết bị. Dữ liệu chưa được xác nhận; kiểm tra dung lượng rồi thử lại.');}
    dbRef.current = next;
    setDb(next);
  };
  const run = async (fn: () => void) => {
    if (!access.check()) { access.expire(); return; }
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    await new Promise((r) => setTimeout(r, 500));
    try {
      if (!access.check()) { access.expire(); return; }
      if(warehouseStatus(currentStore())==='paused')throw new Error(warehouseMessage);
      if (mode === 'offline'||!navigator.onLine)
        throw new Error(
          'Đang ngoại tuyến. Dữ liệu chưa được gửi; giữ nguyên nội dung để thử lại.',
        );
      if (mode === 'error')
        throw new Error(
          'Không thể xử lý lúc này. Nội dung đã giữ nguyên; vui lòng thử lại.',
        );
      fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể xử lý.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const findItem = (code: string) =>
    db.items.find(
      (i) =>
        i.code.toUpperCase() === code.trim().toUpperCase() ||
        i.sku.toUpperCase() === code.trim().toUpperCase(),
    );
  const c = db.cases.find((c) => c.id === selectedId);
  const doc = db.docs.find((d) => d.id === selectedId);
  const item = findItem(productCode);
  const total = draft.lines.reduce((s, l) => s + l.qty, 0);
  const pending = db.docs.filter((d) => d.status === 'Chờ duyệt');
  const inboundResultDoc=view==='result'?db.docs.find(d=>d.id===result.docId&&d.kind==='in'):undefined;
  const outboundResultDoc=view==='result'?db.docs.find(d=>d.id===result.docId&&d.kind==='out'):undefined;
  const lookup = (raw: string) => {
    setProductCode(raw.trim());
    setInputSheet(false);
    go('product');
  };
  const addCode = (raw: string, qty?: number) => {
    if(mode==='offline'||!navigator.onLine){setError('Đang ngoại tuyến. Chưa xác minh được mã; nội dung đang soạn vẫn được giữ.');return;}
    try{assertWrite(currentStore(),access.actor(),documentPermission(draft.kind,'scan'));}catch(e){setError((e as Error).message);return;}
    const code = raw.trim().toUpperCase();
    const found = db.items.find((i) => i.code === code);
    setError('');
    if (found?.type === 'box' && qty === undefined) {
      setInputSheet(false);
      setBox(code);
      setBoxQty('');
      return;
    }
    const line = { code, qty: qty ?? 1 };
    const issue = validateLine(db, draft.kind, line, draft.lines, draft.caseId);
    if (issue) {
      setError(issue);
      return;
    }
    if (draft.kind === 'out' && total + line.qty > Number(draft.target)) {
      setError(
        'Số lượng vượt mục tiêu của phiếu. Kiểm tra lại thông tin phiếu.',
      );
      return;
    }
    setDraft((d) => d.lines.some(l=>l.code===line.code)?d:({ ...d, lines: [...d.lines, line] }));
    setBox('');
    setInputSheet(false);
    setScanCode('');
    setNotice(`Đã thêm ${found?.name} • ${line.qty} cái`);
    if(haptic&&navigator.vibrate)navigator.vibrate(25);
    if(sound){try{const audio=new AudioContext();const oscillator=audio.createOscillator(),gain=audio.createGain();gain.gain.value=.025;oscillator.frequency.value=740;oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.07);oscillator.onended=()=>{void audio.close();};}catch{/* Silent fallback when device disallows audio. */}}
  };
  const candidates = db.items.filter((i) =>
    draft.kind === 'in'
      ? i.status === 'Chờ nhập'
      : i.status === 'Trong kho' &&
        (draft.kind !== 'parts' || i.type !== 'machine'),
  );
  const openDoc = (id: string) => {
    setSelectedId(id);
    go('doc');
  };
  const openCase = (id: string) => {
    setSelectedId(id);
    setCaseTab('Thông tin');
    setCaseNote('');
    go('case');
  };
  const submitDoc = () =>
    run(() => {
      if (readOnly) throw new Error('Tài khoản không có quyền lập phiếu.');
      const next = createDocument(currentStore(), {
        kind: draft.kind,
        name: draft.name || `${kindLabel(draft.kind)} ${stamp()}`,
        recipient: draft.recipient,
        phone: draft.phone,
        address: draft.address,
        group: draft.group,
        note: draft.note,
        caseId: draft.caseId,
        lines: draft.lines,
        key: draft.key,
      },access.actor());
      save(next);
      const created = next.docs.find((d) => d.key === draft.key)!;
      setPopup(null);
      setResult({
        title: 'Đã lập phiếu chờ duyệt',
        message:
          'Số lượng tồn chưa thay đổi. Phiếu đã có trong Chứng từ để kiểm tra và ghi sổ.',
        docId: created.id,
        caseId: draft.caseId || '',
      });
      setDraft(fresh('in'));
      go('result');
    });
  const approve = () => {
    if (!doc) return;
    const id = doc.id;
    setPopup({
      title: 'Xác nhận ghi sổ?',
      body: (
        <>
          <p>
            Kiểm tra phiếu <b>{id}</b> trước khi xác nhận.
          </p>
          <Row label="Nghiệp vụ">{kindLabel(doc.kind)}</Row>
          <Row label="Kho">Kho Hoa Nam</Row>
          <Row label="Tổng số lượng">
            {doc.lines.reduce((s, l) => s + l.qty, 0)} cái
          </Row>
          <p>
            Tồn kho sẽ {doc.kind === 'in' ? 'tăng' : 'giảm'} theo phiếu này.
            Không tự đổi trạng thái bảo hành.
          </p>
        </>
      ),
      label: 'Xác nhận ghi sổ',
      action: () =>
        run(() => {
          if (!approver) throw new Error('Cần quyền người duyệt kho.');
          save(postDocument(currentStore(), id,access.actor()));
          setPopup(null);
          setNotice('Đã ghi sổ. Tồn kho và lịch sử đã được cập nhật.');
        }),
    });
  };
  const setD = (field: keyof Draft, value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));
  const chooseMode = (value: string) => {
    setMode(value);
    setError('');
  };
  const lineCards = (lines: Line[], editable = false) => (
    <div className="sc-lines">
      {lines.map((l) => {
        const i = db.items.find((i) => i.code === l.code);
        return (
          <Card key={l.code}>
            <div className="sc-split">
              <div>
                <small>{i?.sku}</small>
                <h3>{i?.name || l.code}</h3>
              </div>
              <Badge>{l.qty} cái</Badge>
            </div>
            <p className="sc-code">{l.code}</p>
            {i?.type === 'box' && (
              <small>Hộp linh kiện • Khả dụng {i.qty} cái</small>
            )}
            {editable && (
              <button
                className="sc-text danger"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    lines: d.lines.filter((x) => x.code !== l.code),
                  }))
                }
              >
                Bỏ khỏi danh sách
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
  const btn = (
    label: string,
    fn: () => void,
    disabled = false,
    secondary = false,
  ) => (
    <button
      className={secondary ? 'sc-btn secondary' : 'sc-btn'}
      disabled={disabled || busy}
      onClick={fn}
    >
      {busy ? <LoaderCircle className="sc-spin" /> : null}
      {label}
    </button>
  );
  const chips = (
    values: string[],
    current: string,
    change: (v: string) => void,
  ) => (
    <div className="sc-filter-region"><fieldset className="sc-chips" aria-label="Lựa chọn bộ lọc hoặc thẻ nội dung">
      {values.map((v) => (
        <button
          key={v}
          aria-pressed={v === current}
          className={v === current ? 'active' : ''}
          onClick={() => change(v)}
        >
          {v}
        </button>
      ))}
    </fieldset>{values.includes('Tất cả')&&<button className="sc-text sc-filter-reset" onClick={()=>{change('Tất cả');setQuery('');}}>Xóa bộ lọc{current!=='Tất cả'?' (1)':''}</button>}</div>
  );
  const scanExamples = (
    <details className="sc-code-help">
      <summary>Mã có thể chọn</summary>
      <p>Chọn mã để điền vào ô nhập, sau đó kiểm tra.</p>
      <div>
        {candidates.map((i) => (
          <button key={i.code} onClick={() => setScanCode(i.code)}>
            {i.code}
            <small>{i.name}</small>
          </button>
        ))}
        <button onClick={() => setScanCode('KHONG-TON-TAI')}>
          Mã không tồn tại
        </button>
      </div>
    </details>
  );
  const filterDocs = db.docs.filter(
    (d) =>
      (docFilter === 'Tất cả' || d.status === docFilter) &&
      `${d.id} ${d.name} ${d.recipient} ${d.caseId || ''}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const body = () => {
    switch (view) {
      case 'home':
        return <ScannerHome name={access.session?.name||'Minh Anh'} paused={paused} statusKnown={!storageError&&ready} pendingCount={pending.length} openCases={db.cases.filter(c=>!['Đã trả','Đã huỷ'].includes(c.status)).length} shiftStarted={!!access.session?.shiftStarted} docs={scannerHomeRecords(db)} canInbound={can('inbound.create')} canOutbound={can('outbound.request.manual_create')} draft={draft.lines.length?{kind:draft.kind,lines:draft.lines.length}:null} onPending={()=>{setDocFilter('Chờ duyệt');go('docs');}} onOpenCases={()=>{setCaseFilter('Tất cả');go('warranty');}} onWarranty={()=>go('warranty')} onStart={kind=>{void start(kind);}} onNfc={()=>go('nfc')} onLookup={()=>go('lookup')} onDocs={()=>{setDocFilter('Tất cả');go('docs');}} onDoc={(id,target)=>target==='case'?openCase(id):openDoc(id)} onResume={()=>go('scan')}/>;
      case 'lookup':
        return (
          <>
            <Card>
              <div className="sc-feature-icon">
                <Search />
              </div>
              <h2>Tìm đúng sản phẩm</h2>
              <p>Xem tồn kho, chứng từ và bảo hành từ một mã.</p>
              <Field label="QR / Barcode / Serial / SKU">
                <input
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  placeholder="Ví dụ: MAY-001"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') lookup(scanCode);
                  }}
                />
              </Field>
              {btn('Tra cứu', () => lookup(scanCode), !scanCode.trim())}
              {btn(
                'Quét mã / nhập mã',
                () => {
                  setScanCode('');
                  setInputSheet(true);
                },
                false,
                true,
              )}
            </Card>
            <h3>Mã tra cứu nhanh</h3>
            {db.items.slice(0, 6).map((i) => (
              <button
                className="sc-list-card"
                key={i.code}
                onClick={() => lookup(i.code)}
              >
                <Package />
                <div>
                  <h3>{i.name}</h3>
                  <p>
                    {i.code} • {i.sku}
                  </p>
                </div>
                <ChevronRight />
              </button>
            ))}
            {btn('Tra cứu bằng thẻ NFC', () => go('nfc'), false, true)}
          </>
        );
      case 'scan-lookup': case 'scan-warranty':
        return <><IntentScanner intent={view==='scan-lookup'?'LOOKUP':'WARRANTY'} onScan={intentScan} error={error}/>{!!matches.length&&<Card><h2>Chọn hiện vật cần kiểm tra</h2><p>SKU có nhiều hiện vật. Chọn đúng mã; không tự suy đoán máy.</p>{matches.map(i=><button className="sc-list-card" key={i.code} onClick={()=>intentScan(i.code)}>{i.name} · {i.code} · {i.status}</button>)}</Card>}</>;
      case 'warranty-product':
      case 'product':
        return !item ? (
          <>
            <Empty title="Không tìm thấy sản phẩm">
              Không có mã khớp “{productCode}”. Kiểm tra mã hoặc quét lại.
            </Empty>
            {btn('Nhập mã khác', () => {
              setScanCode('');
              go('lookup');
            })}
          </>
        ) : (
          <>
            <Card>
              <div className="sc-feature-icon">
                <Package />
              </div>
              <small>{item.sku}</small>
              <h2>{item.name}</h2>
              <Badge>{item.status}</Badge>
              <Row label="Mã hiện vật">{item.code}</Row>
              <Row label="Kho / vị trí">{item.warehouse}</Row>
              <Row label="Số lượng khả dụng">
                {item.status === 'Trong kho' ? item.qty : 0} cái
              </Row>
              <Row label="Loại">
                {item.type === 'box'
                  ? 'Hộp linh kiện'
                  : item.type === 'part'
                    ? 'Linh kiện có mã'
                    : 'Máy / thiết bị'}
              </Row>
            </Card>
            <Card>
              <h3>Chứng từ liên quan</h3>
              {view==='warranty-product'&&<section><h3>Điều kiện bảo hành</h3>{db.cases.some(c=>c.code===item.code&&!['Đã trả','Đã huỷ'].includes(c.status))?<button className="sc-btn" onClick={()=>openCase(db.cases.find(c=>c.code===item.code&&!['Đã trả','Đã huỷ'].includes(c.status))!.id)}>Mở hồ sơ bảo hành hiện tại</button>:item.status!=='Đã xuất'?<p role="alert">Sản phẩm hiện chưa ở trạng thái đã xuất nên chưa đủ điều kiện tiếp nhận bảo hành.</p>:<><p>Sản phẩm đã xuất và chưa có hồ sơ đang xử lý.</p><button className="sc-btn" disabled={!can('warranty.manage')} onClick={()=>{try{assertWrite(currentStore(),access.actor(),'warranty.manage');}catch(e){setError((e as Error).message);return;}setIntake({code:item.code,missing:false,customer:'',phone:'',address:'',fault:'',product:item.name,reason:'',accessories:''});go('intake');}}>Tiếp nhận bảo hành</button>{!can('warranty.manage')&&<p>{paused?'Kho đang tạm dừng hoạt động':'Bạn không có quyền tiếp nhận bảo hành.'}</p>}</>}</section>}
              {db.docs
                .filter((d) => d.lines.some((l) => l.code === item.code))
                .map((d) => (
                  <button
                    className="sc-inline-link"
                    key={d.id}
                    onClick={() => openDoc(d.id)}
                  >
                    {d.id}
                    <Badge>{d.status}</Badge>
                    <ChevronRight />
                  </button>
                ))}
              {!db.docs.some((d) =>
                d.lines.some((l) => l.code === item.code),
              ) && <p>Chưa có chứng từ trong lịch sử hiển thị.</p>}
            </Card>
            <Card>
              <h3>Bảo hành liên quan</h3>
              {db.cases
                .filter((c) => c.code === item.code)
                .map((c) => (
                  <button
                    key={c.id}
                    className="sc-inline-link"
                    onClick={() => openCase(c.id)}
                  >
                    {c.id}
                    <Badge>{c.status}</Badge>
                    <ChevronRight />
                  </button>
                ))}
              {!db.cases.some((c) => c.code === item.code) && (
                <p>Chưa có hồ sơ bảo hành.</p>
              )}
            </Card>
            {btn('Tra cứu mã khác', () => go('lookup'), false, true)}
          </>
        );
      case 'create':
        if(draft.kind==='out')return <ScannerOutbound draft={draft} update={values=>setDraft(d=>({...d,...values}))} onScan={()=>go('scan')} disabled={readOnly} manual={permitted(access.session,'outbound.request.manual_create')}/>;
        if(['in'].includes(draft.kind))return <ScannerInboundCreate name={draft.name} note={draft.note} scannedCount={draft.lines.length} disabled={readOnly} paused={paused} onName={value=>setD('name',value)} onNote={value=>setD('note',value)} onContinue={()=>{if(!draft.name.trim()){setError('Nhập tên phiếu.');return;}go('scan');}}/>;
        return (
          <>
            <div className="sc-stepper">
              <b>1 Thông tin</b>
              <span>2 Quét mã</span>
              <span>3 Kiểm tra</span>
            </div>
            <Card>
              <Badge>{kindLabel(draft.kind)}</Badge>
              <h2>
                {draft.kind === 'in'
                  ? 'Nhận hàng vào kho'
                  : 'Thông tin giao hàng'}
              </h2>
              <Field label="Tên phiếu *">
                <input
                  value={draft.name}
                  onChange={(e) => setD('name', e.target.value)}
                  placeholder={
                    draft.kind === 'in'
                      ? 'Nhập lô hàng đầu ca'
                      : 'Giao hàng cho đại lý'
                  }
                />
              </Field>
              <Row label="Kho thực hiện">Kho Hoa Nam</Row>
              <Field label="Ghi chú">
                <textarea
                  value={draft.note}
                  onChange={(e) => setD('note', e.target.value)}
                  placeholder="Thông tin cần lưu ý khi kiểm đếm"
                />
              </Field>
            </Card>
            <div className="sc-info">
              Chỉ giữ danh sách mã khi quét. Tồn kho thay đổi sau khi phiếu được
              ghi sổ.
            </div>
            {btn(
              'Bắt đầu quét',
              () => {
                if (!draft.name.trim()) {
                  setError('Nhập tên phiếu.');
                  return;
                }
                if (
                  draft.kind === 'out' &&
                  (!draft.recipient.trim() ||
                    !/^0\d{9}$/.test(draft.phone) ||
                    !draft.address.trim() ||
                    !Number.isSafeInteger(Number(draft.target)) ||
                    Number(draft.target) < 1)
                ) {
                  setError(
                    'Kiểm tra tên người nhận, số điện thoại 10 chữ số, địa chỉ và số lượng nguyên dương.',
                  );
                  return;
                }
                go('scan');
              },
              readOnly,
            )}
          </>
        );
      case 'scan':
        if(draft.kind==='parts'?!draft.caseId:!draft.name.trim()||(draft.kind==='out'&&(!draft.recipient.trim()||!draft.phone||!draft.address||!Number.isSafeInteger(Number(draft.target))||Number(draft.target)<1)))return <Card><h2>Hoàn tất thông tin trước khi quét</h2><p>Chọn nghiệp vụ và hoàn tất phiếu trước khi quét mã. Chưa có thay đổi tồn kho.</p><button className="sc-btn" onClick={()=>draft.kind==='parts'?go('warranty'):go('create')}>Bổ sung thông tin phiếu</button></Card>;
        if(['in'].includes(draft.kind))return <ScannerInboundScan name={draft.name} code={scanCode} lines={draft.lines} items={db.items} error={modalOpen?'':error} notice={modalOpen||error?'':notice} busy={busy} disabled={readOnly} onCode={value=>{setScanCode(value);setError('');setNotice('');}} onScan={addCode} onRemove={code=>{setDraft(d=>({...d,lines:d.lines.filter(l=>l.code!==code)}));setError('');setNotice('');}} onCamera={()=>setPopup({title:'Quét bằng camera',body:<><Camera aria-hidden="true"/><p>Camera mô phỏng trong preview — chưa kết nối camera thật.</p><p>{deviceState==='denied'?'Quyền camera bị từ chối trong kịch bản mô phỏng. Dùng nhập mã thủ công để tiếp tục.':'Dùng nhập mã thủ công để kiểm tra và thêm mã vào phiếu.'}</p></>,label:'Nhập mã thủ công',action:()=>{setPopup(null);setInputSheet(true);}})} onReview={()=>go('review')} qaExamples={qa?scanExamples:undefined}/>;
        if(draft.kind==='out')return <ScannerOutboundScan name={draft.name} targetQty={draft.target} code={scanCode} lines={draft.lines} items={db.items} error={modalOpen?'':error} notice={modalOpen||error?'':notice} busy={busy} disabled={readOnly} onCode={value=>{setScanCode(value);setError('');setNotice('');}} onScan={addCode} onRemove={code=>{setDraft(d=>({...d,lines:d.lines.filter(l=>l.code!==code)}));setError('');setNotice('');}} onCamera={()=>setPopup({title:'Quét bằng camera',body:<><Camera aria-hidden="true"/><p>Camera mô phỏng trong preview — chưa kết nối camera thật.</p><p>Dùng nhập mã thủ công để tiếp tục.</p></>,label:'Nhập mã thủ công',action:()=>{setPopup(null);setInputSheet(true);}})} onReview={()=>go('review')} qaExamples={qa?scanExamples:undefined}/>;
        return (
          <>
            <div className="sg-context" data-scan-context={draft.kind==='in'?'INBOUND':draft.kind==='out'?'OUTBOUND':'WARRANTY_PARTS'}><ScanQrCode aria-hidden="true"/><strong>{kindLabel(draft.kind)}{draft.caseId?` · ${draft.caseId}`:''}</strong></div>
            <div className="sc-stepper">
              <span>1 Thông tin</span>
              <b>2 Quét mã</b>
              <span>3 Kiểm tra</span>
            </div>
            {draft.caseId && (
              <Card>
                <small>PHỤC VỤ HỒ SƠ</small>
                <h3>{draft.caseId}</h3>
                <p>{db.cases.find((c) => c.id === draft.caseId)?.product}</p>
                <Badge>
                  {db.cases.find((c) => c.id === draft.caseId)?.status}
                </Badge>
              </Card>
            )}
            <div className="sc-scan-frame">
              <div className="sc-split">
                <strong>{kindLabel(draft.kind)}</strong>
                <Badge>
                  {total}
                  {draft.kind === 'out' ? ` / ${draft.target}` : ''} cái
                </Badge>
              </div>
              <div className="sc-reticle">
                <ScanLine />
              </div>
              <p>
                {draft.kind === 'parts'
                  ? 'Quét mã linh kiện hoặc mã hộp đựng linh kiện'
                  : 'Đưa mã QR / Barcode vào vùng quét'}
              </p>
              <button
                onClick={() =>
                  setPopup({
                    title: 'Quét bằng camera',
                    body: (
                      <>
                        <Camera />
                        <p>
                          {deviceState==='denied'?'Quyền camera bị từ chối. Kiểm tra quyền của ứng dụng trong cài đặt hoặc nhập mã thủ công.':'Camera chưa khả dụng trong phiên này. Bạn có thể nhập mã thủ công để tiếp tục kiểm đếm.'}
                        </p>
                      </>
                    ),
                    label: 'Nhập mã thủ công',
                    action: () => {
                      setPopup(null);
                      setInputSheet(true);
                    },
                  })
                }
              >
                Mở camera
              </button>
            </div>
            <Card>
              <Field label="Mã linh kiện / hộp / hiện vật">
                <input
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  placeholder="Quét hoặc nhập mã"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCode(scanCode);
                  }}
                />
              </Field>
              {btn(
                'Kiểm tra mã',
                () => addCode(scanCode),
                !scanCode.trim() || readOnly,
              )}
              {qa&&scanExamples}
            </Card>
            {notice && (
              <output className="sc-success">
                <CheckCircle2 />
                {notice}
              </output>
            )}
            <div className="sc-section-title">
              <h3>Đã chọn • {draft.lines.length} mã</h3>
              <span>{total} cái</span>
            </div>
            {!draft.lines.length ? (
              <Empty title="Chưa có mã nào">
                Mỗi mã hợp lệ chỉ được cộng một lần.
              </Empty>
            ) : (
              lineCards(draft.lines, true)
            )}
            <div className="sc-sticky-actions">
              <strong className="sc-live-count" aria-live="polite">{draft.lines.length} mã · {total} cái{draft.kind==='out'?` / ${draft.target}`:''}</strong>
              {btn(
                `Kiểm tra phiếu • ${total} cái`,
                () => go('review'),
                !total ||
                  (draft.kind === 'out' && total !== Number(draft.target)),
              )}
              {draft.kind === 'out' && total !== Number(draft.target) && (
                <small>
                  Cần đủ {draft.target} cái trước khi kiểm tra phiếu.
                </small>
              )}
            </div>
          </>
        );
      case 'review':
        if(!draft.lines.length)return <Card><h2>Chưa có mã để kiểm tra</h2><p>Tiếp tục phiếu đang soạn hoặc chọn tác vụ quét phù hợp.</p><button className="sc-btn" onClick={()=>go('create')}>Về thông tin phiếu</button></Card>;
        if(['in'].includes(draft.kind))return <ScannerInboundReview name={draft.name} note={draft.note} lines={draft.lines} items={db.items} exceptions={draft.lines.flatMap((line,i)=>{const reason=validateLine(db,'in',line,draft.lines.slice(0,i));return reason?[{code:line.code,reason}]:[];})} error={modalOpen?'':error} busy={busy} disabled={readOnly} onNote={value=>setD('note',value)} onScan={()=>go('scan')} onSend={()=>setPopup({title:'Xác nhận gửi duyệt?',body:<InboundSubmitSummary name={draft.name} count={draft.lines.length} total={total}/>,label:'Gửi phiếu',action:submitDoc})}/>;
        if(draft.kind==='out')return <ScannerOutboundReview name={draft.name} recipient={draft.recipient} target={Number(draft.target)} note={draft.note} lines={draft.lines} items={db.items} exceptions={draft.lines.flatMap((line,i)=>{const reason=validateLine(db,'out',line,draft.lines.slice(0,i));return reason?[{code:line.code,reason}]:[];})} error={modalOpen?'':error} busy={busy} disabled={readOnly} onNote={value=>setD('note',value)} onScan={()=>go('scan')} onSend={()=>setPopup({title:'Xác nhận gửi duyệt?',body:<OutboundSubmitSummary name={draft.name} count={draft.lines.length} total={total} target={Number(draft.target)} recipient={draft.recipient}/>,label:'Gửi phiếu',action:submitDoc})}/>;
        return (
          <>
            <div className="sc-stepper">
              <span>1 Thông tin</span>
              <span>2 Quét mã</span>
              <b>3 Kiểm tra</b>
            </div>
            <Card>
              <Badge>{kindLabel(draft.kind)}</Badge>
              <h2>{draft.name || 'Xuất linh kiện bảo hành'}</h2>
              <Row label="Kho thực hiện">Kho Hoa Nam</Row>
              {draft.caseId && <Row label="Hồ sơ bảo hành">{draft.caseId}</Row>}
              {draft.recipient && (
                <>
                  <Row label="Người nhận">{draft.recipient}</Row>
                  <Row label="Số điện thoại">{draft.phone}</Row>
                  <Row label="Địa chỉ">{draft.address}</Row>
                </>
              )}
              <Row label="Tổng">
                {draft.lines.length} mã • {total} cái
              </Row>
            </Card>
            {lineCards(draft.lines)}
            <Field label="Ghi chú phiếu">
              <textarea
                value={draft.note}
                onChange={(e) => setD('note', e.target.value)}
              />
            </Field>
            <div className="sc-info">
              Phiếu được gửi duyệt trước khi thay đổi tồn.{' '}
              {draft.caseId
                ? 'Việc xuất linh kiện không tự chuyển trạng thái hồ sơ.'
                : ''}
            </div>
            {btn(
              'Xác nhận gửi phiếu',
              () =>
                setPopup({
                  title:
                    draft.kind === 'parts'
                      ? 'Xác nhận xuất linh kiện?'
                      : 'Xác nhận gửi duyệt?',
                  body: (
                    <>
                      <Row label="Nghiệp vụ">{kindLabel(draft.kind)}</Row>
                      {draft.caseId && <Row label="Hồ sơ">{draft.caseId}</Row>}
                      <Row label="Kho">Kho Hoa Nam</Row>
                      <Row label="Số lượng">
                        {total} cái / {draft.lines.length} mã
                      </Row>
                      <p>
                        Kiểm tra đúng mã và số lượng. Tồn chưa thay đổi cho tới
                        bước ghi sổ.
                      </p>
                    </>
                  ),
                  label: 'Gửi phiếu',
                  action: submitDoc,
                }),
              readOnly || !total,
            )}
            {btn('Quay lại quét', () => go('scan'), false, true)}
          </>
        );
      case 'result':
        if(outboundResultDoc)return <ScannerOutboundResult doc={outboundResultDoc} onDocument={()=>openDoc(outboundResultDoc.id)} onHome={()=>tab('home')}/>;
        if(inboundResultDoc)return <ScannerInboundResult doc={inboundResultDoc} onDocument={()=>openDoc(inboundResultDoc.id)} onHome={()=>tab('home')}/>;
        return (
          <>
            <div className="sc-result">
              <CheckCircle2 />
              <h2>{result.title}</h2>
              <p>{result.message}</p>
              {result.docId && <Badge>{result.docId}</Badge>}
              {result.caseId && <p>Hồ sơ {result.caseId}</p>}
            </div>
            {result.docId && btn('Xem chứng từ', () => openDoc(result.docId))}
            {result.caseId &&
              btn(
                'Về hồ sơ bảo hành',
                () => openCase(result.caseId),
                false,
                true,
              )}
            {btn('Về trang chủ', () => tab('home'), false, true)}
          </>
        );
      case 'docs':
        return (
          <>
            <Field label="Tìm chứng từ">
              <input
                placeholder="Mã phiếu, hồ sơ, người nhận…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Field>
            {chips(
              ['Tất cả', 'Chờ duyệt', 'Đã ghi sổ', 'Đã huỷ'],
              docFilter,
              setDocFilter,
            )}
            <div className="sc-section-title">
              <span>{filterDocs.length} chứng từ</span>
              <small>
                {approver ? 'Quyền duyệt và ghi sổ' : 'Xem trạng thái xử lý'}
              </small>
            </div>
            {filterDocs.length ? (
              filterDocs.map((d) => (
                <button
                  className="sc-list-card"
                  key={d.id}
                  onClick={() => openDoc(d.id)}
                >
                  <div>
                    <small>
                      {kindLabel(d.kind)} {d.caseId ? `• ${d.caseId}` : ''}
                    </small>
                    <h3>{d.id}</h3>
                    <p>{d.name}</p>
                    <small>
                      {d.lines.length} mã •{' '}
                      {d.lines.reduce((s, l) => s + l.qty, 0)} cái
                    </small>
                  </div>
                  <Badge>{d.status}</Badge>
                </button>
              ))
            ) : (
              <Empty title="Không tìm thấy chứng từ">
                Đổi từ khoá hoặc bộ lọc để xem phiếu khác.
              </Empty>
            )}
          </>
        );
      case 'doc':
        return !doc ? (
          <Empty title="Không tìm thấy phiếu" />
        ) : (
          <>
            <Card>
              <Badge>{doc.status}</Badge>
              <h2>{doc.id}</h2>
              <p>{doc.name}</p>
              <Row label="Nghiệp vụ">{kindLabel(doc.kind)}</Row>
              <Row label="Ngày tạo">{doc.at}</Row>
              <Row label="Tổng số lượng">
                {doc.lines.reduce((s, l) => s + l.qty, 0)} cái
              </Row>
              <Row label="Kho">Kho Hoa Nam</Row>
              {doc.caseId && (
                <button
                  className="sc-inline-link"
                  onClick={() => openCase(doc.caseId!)}
                >
                  Hồ sơ {doc.caseId}
                  <ChevronRight />
                </button>
              )}
              {doc.recipient && (
                <>
                  <Row label="Người nhận">{doc.recipient}</Row>
                  <Row label="Số điện thoại">
                    {doc.phone || 'Chưa ghi nhận'}
                  </Row>
                  <Row label="Địa chỉ">{doc.address || 'Chưa ghi nhận'}</Row>
                </>
              )}
              <Row label="Ghi chú">{doc.note || 'Không có'}</Row>
            </Card>
            {lineCards(doc.lines)}
            {doc.status === 'Chờ duyệt' ? (
              <>
                <div className="sc-info">
                  Chờ kiểm tra và ghi sổ. Tồn kho chưa thay đổi.
                </div>
                {btn('Duyệt và ghi sổ', approve, !approver)}
                {!approver && (
                  <p className="sc-help">
                    Chỉ người có quyền duyệt kho được ghi sổ.
                  </p>
                )}
                {btn(
                  'Huỷ phiếu',
                  () => {
                    setNfcReason('');
                    setPopup({
                      title: 'Huỷ phiếu đang chờ?',
                      body: 'Phiếu sẽ không được ghi sổ và không tác động tồn. Lịch sử vẫn được giữ.',
                      label: 'Xác nhận huỷ phiếu',
                      danger: true,
                      action: () =>
                        run(() => {
                          const current = dbRef.current.docs.find(
                            (d) => d.id === doc.id,
                          );
                          if (!current || current.status !== 'Chờ duyệt')
                            throw new Error(
                              'Phiếu không còn ở trạng thái chờ duyệt.',
                            );
                          save({
                            ...dbRef.current,
                            docs: dbRef.current.docs.map((d) =>
                              d.id === doc.id ? { ...d, status: 'Đã huỷ' } : d,
                            ),
                            events: [
                              { at: stamp(), text: `${doc.id} • đã huỷ` },
                              ...dbRef.current.events,
                            ],
                          });
                          setPopup(null);
                        }),
                    });
                  },
                  !can(documentPermission(doc.kind,'cancel')),
                  true,
                )}
              </>
            ) : (
              <div
                className={
                  doc.status === 'Đã ghi sổ' ? 'sc-success' : 'sc-info'
                }
              >
                {doc.status === 'Đã ghi sổ'
                  ? 'Phiếu đã ghi sổ. Tra cứu tồn đã được cập nhật.'
                  : 'Phiếu đã huỷ. Không được tiếp tục ghi sổ.'}
              </div>
            )}
          </>
        );
      case 'warranty': {
        const cases = db.cases.filter(
          (c) =>
            (caseFilter === 'Tất cả' || c.status === caseFilter) &&
            `${c.id} ${c.product} ${c.customer}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        );
        return (
          <>
            <button
              className="sc-wide-callout"
              disabled={readOnly}
              onClick={() => {
                setIntake({
                  code: '',
                  missing: false,
                  customer: '',
                  phone: '',
                  address: '',
                  fault: '',
                  product: '',
                  reason: '',
                  accessories: '',
                });
                go('intake');
              }}
            >
              <Plus />
              <div>
                <strong>Tiếp nhận bảo hành</strong>
                <span>Có mã sản phẩm hoặc mất tem/mã</span>
              </div>
              <ChevronRight />
            </button>
            <Field label="Tìm hồ sơ">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mã hồ sơ, sản phẩm, khách hàng"
              />
            </Field>
            {chips(['Tất cả', ...allStatuses], caseFilter, setCaseFilter)}
            <p>{cases.length} hồ sơ</p>
            {cases.map((c) => (
              <button
                className="sc-list-card"
                key={c.id}
                onClick={() => openCase(c.id)}
              >
                <div>
                  <small>{c.id}</small>
                  <h3>{c.product}</h3>
                  <p>{c.customer}</p>
                </div>
                <Badge>{c.status}</Badge>
              </button>
            ))}
            {!cases.length && (
              <Empty title="Không tìm thấy hồ sơ">
                Thay đổi từ khoá hoặc trạng thái.
              </Empty>
            )}
          </>
        );
      }
      case 'case':
        return !c ? (
          <Empty title="Không tìm thấy hồ sơ" />
        ) : (
          <>
            <Card>
              <div className="sc-split">
                <small>{c.id}</small>
                <Badge>{c.status}</Badge>
              </div>
              <h2>{c.product}</h2>
              <p>{c.code || 'Tiếp nhận không có tem mã'}</p>
              {scannerDesignSerial(db,c.code)&&<Row label="Serial">{scannerDesignSerial(db,c.code)}</Row>}
              <div className="sc-progress">
                {['Tiếp nhận', 'Kiểm tra', 'Sửa chữa', 'Trả khách'].map(
                  (s, i) => (
                    <span
                      key={s}
                      className={
                        i <=
                        (c.status === 'Tiếp nhận'
                          ? 0
                          : c.status === 'Đang kiểm tra'
                            ? 1
                            : c.status === 'Đang sửa chữa'
                              ? 2
                              : 3)
                          ? 'active'
                          : ''
                      }
                    >
                      {s}
                    </span>
                  ),
                )}
              </div>
            </Card>
            {chips(
              ['Thông tin', 'Linh kiện', 'Ảnh & video', 'Diễn biến'],
              caseTab,
              setCaseTab,
            )}
            {caseTab === 'Thông tin' && (
              <>
                <Card>
                  <Row label="Khách hàng">{c.customer}</Row>
                  <Row label="Số điện thoại">{c.phone}</Row>
                  <Row label="Địa chỉ">{c.address}</Row>
                  <Row label="Bệnh / lỗi">{c.fault}</Row>
                  <Row label="Phụ kiện">{c.accessories || 'Không có'}</Row>
                </Card>
                {canIssueParts(c.status) && (
                  <button
                    className="sc-wide-callout"
                    disabled={!can('warranty.component_issue')}
                    onClick={() => start('parts', c.id)}
                  >
                    <Layers />
                    <div>
                      <strong>Xuất linh kiện bảo hành</strong>
                      <span>Quét mã linh kiện hoặc hộp + số lượng</span>
                    </div>
                    <ChevronRight />
                  </button>
                )}
                {transitions[c.status].length ? (
                  <Card>
                    <h3>Cập nhật xử lý</h3>
                    <Field label="Kết quả kiểm tra / ghi chú *">
                      <textarea
                        value={caseNote}
                        onChange={(e) => setCaseNote(e.target.value)}
                        placeholder="Ghi rõ kết quả xử lý hoặc lý do"
                      />
                    </Field>
                    <div className="sc-action-wrap">
                      {transitions[c.status].map((status) => (
                        <button
                          key={status}
                          className={
                            status === 'Đã huỷ'
                              ? 'sc-btn secondary danger'
                              : 'sc-btn secondary'
                          }
                          disabled={readOnly}
                          onClick={() => {
                            if (!caseNote.trim()) {
                              setError(
                                'Nhập kết quả xử lý trước khi chuyển trạng thái.',
                              );
                              return;
                            }
                            setPopup({
                              title: `Chuyển sang ${status}?`,
                              body: (
                                <>
                                  <p>
                                    {c.id} • {c.product}
                                  </p>
                                  <p>{caseNote}</p>
                                </>
                              ),
                              label: 'Xác nhận chuyển trạng thái',
                              action: () =>
                                run(() => {
                                  save(
                                    changeCase(
                                      dbRef.current,
                                      c.id,
                                      status,
                                      caseNote,
                                      access.actor(),
                                    ),
                                  );
                                  setPopup(null);
                                  setCaseNote('');
                                  setNotice(
                                    'Trạng thái hồ sơ đã được cập nhật.',
                                  );
                                }),
                            });
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <div className="sc-info">
                    Hồ sơ đã đóng. Không còn thao tác chuyển trạng thái.
                  </div>
                )}
              </>
            )}
            {caseTab === 'Linh kiện' && (
              <>
                {canIssueParts(c.status) &&
                  btn('Xuất linh kiện', () => start('parts', c.id), !can('warranty.component_issue'))}
                {db.docs
                  .filter((d) => d.caseId === c.id)
                  .map((d) => (
                    <button
                      className="sc-list-card"
                      key={d.id}
                      onClick={() => openDoc(d.id)}
                    >
                      <div>
                        <h3>{d.id}</h3>
                        <p>
                          {d.lines.reduce((s, l) => s + l.qty, 0)} cái • {d.at}
                        </p>
                      </div>
                      <Badge>{d.status}</Badge>
                    </button>
                  ))}
                {!db.docs.some((d) => d.caseId === c.id) && (
                  <Empty title="Chưa xuất linh kiện">
                    Phiếu xuất cho hồ sơ sẽ hiển thị ở đây.
                  </Empty>
                )}
              </>
            )}
            {caseTab === 'Ảnh & video' && (
              <Card>
                <h3>Hồ sơ hình ảnh • {c.media.length}/10</h3>
                <Field label="Giai đoạn">
                  <select
                    value={mediaGroup}
                    onChange={(e) => setMediaGroup(e.target.value)}
                  >
                    {['Tiếp nhận', 'Kiểm tra', 'Bàn giao'].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </Field>
                {c.media.map((m, i) => (
                  <button
                    key={`${m.name}-${i}`}
                    className="sc-inline-link"
                    onClick={() =>
                      setPopup({
                        title: m.name,
                        body: (
                          <>
                            <ImagePlus />
                            <p>{m.category} • Tệp đính kèm trong hồ sơ.</p>
                          </>
                        ),
                      })
                    }
                  >
                    <ImagePlus />
                    {m.name}
                    <small>{m.category}</small>
                  </button>
                ))}
                {!c.media.length && <Empty title="Chưa có ảnh hoặc video" />}
                {btn(
                  'Thêm ảnh hồ sơ',
                  () =>
                    setPopup({
                      title: 'Thêm ảnh hồ sơ',
                      body: 'Chọn ảnh ghi nhận tình trạng máy và phụ kiện tại thời điểm xử lý.',
                      label: 'Thêm ảnh tình trạng máy',
                      action: () => { void run(()=>{
                        save({
                          ...db,
                          cases: db.cases.map((w) =>
                            w.id === c.id
                              ? {
                                  ...w,
                                  media: [
                                    ...w.media,
                                    {
                                      name: `Tình trạng máy ${w.media.length + 1}.jpg`,
                                      category: mediaGroup,
                                    },
                                  ],
                                }
                              : w,
                          ),
                        });
                        setPopup(null);
                      }); },
                    }),
                  readOnly ||
                    c.media.length >= 10 ||
                    ['Đã trả', 'Đã huỷ'].includes(c.status),
                )}
              </Card>
            )}
            {caseTab === 'Diễn biến' && (
              <Card>
                <h3>Lịch sử hồ sơ</h3>
                <ol className="sc-timeline">
                  {[...c.timeline].reverse().map((e, i) => (
                    <li key={i}>
                      <small>{e.at}</small>
                      <p>{e.text}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            )}
            {notice && <p className="sc-success">{notice}</p>}
          </>
        );
      case 'intake':
        return (
          <>
            <Card>
              <h2>Thông tin sản phẩm</h2>
              {chips(
                ['Có mã', 'Mất tem/mã'],
                intake.missing ? 'Mất tem/mã' : 'Có mã',
                (v) =>
                  setIntake((i) => ({ ...i, missing: v === 'Mất tem/mã' })),
              )}
              {intake.missing ? (
                <>
                  <Field label="Mô tả sản phẩm *">
                    <input
                      value={intake.product}
                      onChange={(e) =>
                        setIntake((i) => ({ ...i, product: e.target.value }))
                      }
                      placeholder="Tên máy, màu sắc, đặc điểm nhận dạng"
                    />
                  </Field>
                  <Field label="Lý do không có mã *">
                    <input
                      value={intake.reason}
                      onChange={(e) =>
                        setIntake((i) => ({ ...i, reason: e.target.value }))
                      }
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Mã hiện vật *">
                    <input
                      value={intake.code}
                      onChange={(e) =>
                        setIntake((i) => ({ ...i, code: e.target.value }))
                      }
                      placeholder="MAY-003 hoặc MAY-004"
                    />
                  </Field>
                  {findItem(intake.code) && (
                    <p>
                      {findItem(intake.code)?.name} •{' '}
                      {findItem(intake.code)?.status}
                    </p>
                  )}
                  <small>
                    Mã được kiểm tra trước khi tiếp nhận. Chưa xuất kho không
                    đồng nghĩa mất tem.
                  </small>
                </>
              )}
            </Card>
            <Card>
              <h3>Khách hàng & tình trạng máy</h3>
              <Field label="Tên khách hàng *">
                <input
                  value={intake.customer}
                  onChange={(e) =>
                    setIntake((i) => ({ ...i, customer: e.target.value }))
                  }
                />
              </Field>
              <Field label="Số điện thoại *">
                <input
                  inputMode="tel"
                  value={intake.phone}
                  onChange={(e) =>
                    setIntake((i) => ({ ...i, phone: e.target.value }))
                  }
                />
              </Field>
              <Field label="Địa chỉ *">
                <textarea
                  value={intake.address}
                  onChange={(e) =>
                    setIntake((i) => ({ ...i, address: e.target.value }))
                  }
                />
              </Field>
              <Field label="Bệnh / lỗi khách báo *">
                <textarea
                  value={intake.fault}
                  onChange={(e) =>
                    setIntake((i) => ({ ...i, fault: e.target.value }))
                  }
                />
              </Field>
              <div className="sc-chips">
                {['Không khởi động', 'Rò rỉ nhiên liệu', 'Kêu bất thường'].map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() =>
                        setIntake((i) => ({
                          ...i,
                          fault: i.fault.includes(f)
                            ? i.fault
                            : `${i.fault}${i.fault ? '; ' : ''}${f}`,
                        }))
                      }
                    >
                      {f}
                    </button>
                  ),
                )}
              </div>
              <Field label="Phụ kiện nhận kèm">
                <input
                  value={intake.accessories}
                  onChange={(e) =>
                    setIntake((i) => ({ ...i, accessories: e.target.value }))
                  }
                />
              </Field>
            </Card>
            {btn(
              'Kiểm tra và tiếp nhận',
              () => {
                const it = findItem(intake.code);
                if (
                  !intake.customer.trim() ||
                  !/^0\d{9}$/.test(intake.phone) ||
                  !intake.address.trim() ||
                  !intake.fault.trim()
                ) {
                  setError(
                    'Nhập tên, số điện thoại 10 chữ số, địa chỉ và mô tả lỗi.',
                  );
                  return;
                }
                if (
                  intake.missing
                    ? !intake.product.trim() || !intake.reason.trim()
                    : !it || it.status !== 'Đã xuất'
                ) {
                  setError(
                    intake.missing
                      ? 'Nhập mô tả sản phẩm và lý do thiếu mã.'
                      : 'Mã chưa tìm thấy hoặc chưa xuất kho. Kiểm tra mã; không tự chuyển thành mất tem.',
                  );
                  return;
                }
                if (
                  !intake.missing &&
                  db.cases.some(
                    (c) =>
                      c.code === it?.code &&
                      !['Đã trả', 'Đã huỷ'].includes(c.status),
                  )
                ) {
                  setError(
                    'Sản phẩm đã có hồ sơ đang xử lý. Tra cứu hồ sơ hiện có trước khi tiếp nhận thêm.',
                  );
                  return;
                }
                setPopup({
                  title: 'Xác nhận tiếp nhận?',
                  body: (
                    <>
                      <Row label="Khách hàng">{intake.customer}</Row>
                      <Row label="Sản phẩm">
                        {intake.missing ? intake.product : it?.name}
                      </Row>
                      <p>{intake.fault}</p>
                    </>
                  ),
                  label: 'Tiếp nhận hồ sơ',
                  action: () =>
                    run(() => {
                      const id = `BH-${String(dbRef.current.cases.length + 1).padStart(3, '0')}`;
                      const w: Warranty = {
                        id,
                        code: intake.missing ? '' : it!.code,
                        product: intake.missing ? intake.product : it!.name,
                        customer: intake.customer,
                        phone: intake.phone,
                        address: intake.address,
                        fault: intake.fault,
                        accessories: intake.accessories,
                        status: 'Tiếp nhận',
                        timeline: [
                          {
                            at: stamp(),
                            text: `Tiếp nhận • ${intake.missing ? intake.reason : intake.code}`,
                          },
                        ],
                        media: [],
                      };
                      save({
                        ...dbRef.current,
                        cases: [w, ...dbRef.current.cases],
                        events: [
                          { at: stamp(), text: `${id} • tiếp nhận bảo hành` },
                          ...dbRef.current.events,
                        ],
                      });
                      setPopup(null);
                      setResult({
                        title: 'Đã tiếp nhận hồ sơ',
                        message:
                          'Tiếp tục kiểm tra tình trạng máy và bổ sung ảnh tiếp nhận.',
                        caseId: id,
                        docId: '',
                      });
                      go('result');
                    }),
                });
              },
              readOnly,
            )}
          </>
        );
      case 'nfc':
        return (
          <>
            <div className="sc-task-grid">
              <button
                disabled={readOnly}
                onClick={() => {
                  setNfcStage(0);
                  go('nfc-bind');
                }}
              >
                <span>
                  <Radio />
                </span>
                <h3>Gán thẻ NFC</h3>
                <p>Nhận diện → ghi → đọc lại</p>
              </button>
              <button
                onClick={() => {
                  setUid('NFC-001');
                  setPopup({
                    title: 'Tra cứu thẻ NFC',
                    body: 'Chọn thẻ đã có hoặc nhập UID ở danh sách thẻ để xem sản phẩm liên kết.',
                    label: 'Tra thẻ NFC-001',
                    action: () => {
                      const t = db.tags.find((t) => t.uid === 'NFC-001');
                      if (!t || t.status !== 'Đang dùng') {
                        setError('Thẻ không còn hoạt động.');
                        return;
                      }
                      setPopup(null);
                      lookup(t.code);
                    },
                  });
                }}
              >
                <span>
                  <Search />
                </span>
                <h3>Tra cứu thẻ</h3>
                <p>Xem sản phẩm và bảo hành</p>
              </button>
            </div>
            <Field label="Tìm UID hoặc mã sản phẩm">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="NFC-001 / MAY-003"
              />
            </Field>
            {chips(
              ['Tất cả', 'Đang dùng', 'Ngừng dùng', 'Thất lạc', 'Hỏng'],
              tagFilter,
              setTagFilter,
            )}
            {db.tags
              .filter(
                (t) =>
                  (tagFilter === 'Tất cả' || tagFilter === t.status) &&
                  `${t.uid} ${t.code}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              )
              .map((t) => (
                <Card key={t.uid}>
                  <div className="sc-split">
                    <h3>{t.uid}</h3>
                    <Badge>{t.status}</Badge>
                  </div>
                  <p>{findItem(t.code)?.name}</p>
                  <Row label="Hiện vật">{t.code}</Row>
                  {t.reason && <Row label="Lý do">{t.reason}</Row>}
                  {btn('Xem sản phẩm', () => lookup(t.code), false, true)}
                  {t.status === 'Đang dùng' &&
                    btn(
                      'Thu hồi thẻ',
                      () => {
                        setUid(t.uid);
                        setNfcReason('');
                        setPopup({
                          title: `Thu hồi ${t.uid}?`,
                          body: (
                            <>
                              <p>
                                {t.code} • {findItem(t.code)?.name}
                              </p>
                              <p>
                                Thẻ không còn dùng để tra cứu sau khi thu hồi.
                                Lịch sử liên kết được giữ lại.
                              </p>
                            </>
                          ),
                          label: 'Xác nhận thu hồi',
                          danger: true,
                          action: () => {
                            /* handled with current reason below */
                          },
                        });
                      },
                      readOnly,
                      true,
                    )}
                </Card>
              ))}
            {!db.tags.some(
              (t) =>
                (tagFilter === 'Tất cả' || tagFilter === t.status) &&
                `${t.uid} ${t.code}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
            ) && <Empty title="Không có thẻ khớp bộ lọc" />}
          </>
        );
      case 'nfc-bind':
        if(deviceState!=='normal')return <Card><h2>{deviceState==='denied'?'Không có quyền truy cập NFC':'NFC chưa được hỗ trợ'}</h2><p>{deviceState==='denied'?'Kiểm tra quyền của ứng dụng và bật NFC trong cài đặt thiết bị.':'Thiết bị hoặc phiên bản ứng dụng này chưa hỗ trợ ghi thẻ NFC. Dùng thiết bị hỗ trợ để tiếp tục.'}</p>{btn('Về danh sách thẻ',()=>go('nfc'),false,true)}</Card>;
        return (
          <>
            <div className="sc-stepper">
              <b>1 Nhận diện</b>
              <span className={nfcStage >= 1 ? 'active' : ''}>2 Ghi thẻ</span>
              <span className={nfcStage >= 2 ? 'active' : ''}>3 Đọc lại</span>
            </div>
            <Card>
              <h2>Liên kết đúng hiện vật</h2>
              <Field label="Mã sản phẩm *">
                <select
                  disabled={nfcStage > 0}
                  value={nfcCode}
                  onChange={(e) => setNfcCode(e.target.value)}
                >
                  {db.items
                    .filter(
                      (i) => i.type === 'machine' && i.status !== 'Chờ nhập',
                    )
                    .map((i) => (
                      <option key={i.code} value={i.code}>
                        {i.code} • {i.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="UID thẻ NFC *">
                <input
                  disabled={nfcStage > 0}
                  value={uid}
                  onChange={(e) => setUid(e.target.value.toUpperCase())}
                />
              </Field>
              <Row label="Trạng thái">{findItem(nfcCode)?.status}</Row>
              <p>Liên kết thẻ không tự làm tăng hoặc giảm tồn kho.</p>
              {nfcStage === 0 &&
                btn(
                  'Nhận diện hiện vật',
                  () => {
                    if (!uid.trim()) {
                      setError('Nhập UID thẻ.');
                      return;
                    }
                    if (
                      db.tags.some(
                        (t) =>
                          t.uid === uid ||
                          (t.code === nfcCode && t.status === 'Đang dùng'),
                      )
                    ) {
                      setError(
                        'Thẻ hoặc hiện vật đã có liên kết. Kiểm tra danh sách NFC.',
                      );
                      return;
                    }
                    setNfcStage(1);
                  },
                  readOnly,
                )}
              {nfcStage === 1 && btn('Ghi thẻ NFC', () => setNfcStage(2))}
              {nfcStage === 2 && (
                <>
                  <div className="sc-info">
                    Đã đến bước kiểm tra. Đọc lại cùng thẻ để đối chiếu UID và
                    hiện vật.
                  </div>
                  {btn('Đọc lại và đối chiếu', () => setNfcStage(3))}
                </>
              )}
              {nfcStage === 3 && (
                <>
                  <div className="sc-success">
                    <CheckCircle2 />
                    UID {uid} khớp hiện vật {nfcCode}.
                  </div>
                  {btn(
                    'Xác nhận liên kết',
                    () =>
                      run(() => {
                        if (
                          dbRef.current.tags.some(
                            (t) =>
                              t.uid === uid ||
                              (t.code === nfcCode && t.status === 'Đang dùng'),
                          )
                        )
                          throw new Error('Liên kết đã tồn tại.');
                        save({
                          ...dbRef.current,
                          tags: [
                            {
                              uid,
                              code: nfcCode,
                              status: 'Đang dùng',
                              reason: '',
                            },
                            ...dbRef.current.tags,
                          ],
                          events: [
                            {
                              at: stamp(),
                              text: `${uid} • liên kết ${nfcCode}`,
                            },
                            ...dbRef.current.events,
                          ],
                        });
                        setResult({
                          title: 'Đã liên kết thẻ NFC',
                          message: `${uid} được gắn với ${nfcCode}. Có thể tra cứu từ danh sách thẻ.`,
                          docId: '',
                          caseId: '',
                        });
                        go('result');
                      }),
                    readOnly,
                  )}
                </>
              )}
              {nfcStage > 0 &&
                btn(
                  'Làm lại bước nhận diện',
                  () => setNfcStage(0),
                  false,
                  true,
                )}
            </Card>
          </>
        );
      case 'history': {
        const events = db.events.filter(
          (e) =>
            (historyFilter === 'Tất cả' || e.text.includes(historyFilter)) &&
            e.text.toLowerCase().includes(query.toLowerCase()),
        );
        return (
          <>
            <Field label="Tìm lịch sử">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mã phiếu, NFC, hồ sơ…"
              />
            </Field>
            {chips(
              ['Tất cả', 'PN-', 'PX-', 'XLK-', 'NFC-', 'BH-'],
              historyFilter,
              setHistoryFilter,
            )}
            <Card>
              <ol className="sc-timeline">
                {events.map((e, i) => (
                  <li key={i}>
                    <small>{e.at}</small>
                    <p>{e.text}</p>
                    {db.docs.some((d) => e.text.includes(d.id)) && (
                      <button
                        className="sc-text"
                        onClick={() =>
                          openDoc(
                            db.docs.find((d) => e.text.includes(d.id))!.id,
                          )
                        }
                      >
                        Xem chứng từ →
                      </button>
                    )}
                  </li>
                ))}
              </ol>
              {!events.length && <Empty title="Không có thao tác phù hợp" />}
            </Card>
          </>
        );
      }
      case 'profile':
        return (
          <>
            <ScannerAccount access={access} mode={mode} onPasswordChanged={passwordChanged}/>
            <Card>
              <h3>Trạng thái Kho Hoa Nam</h3><Badge>{paused?'Tạm dừng':'Hoạt động'}</Badge>
              {permitted(access.session,'warehouse.manage')&&access.session?.roleCode==='SUPER_ADMIN' ? <button className="sc-btn secondary" onClick={()=>{setWarehouseReason('');setWarehouseTarget(paused?'active':'paused');}}>{paused?'Kích hoạt lại kho':'Tạm dừng kho'}</button>:<p>Chỉ Super Admin được thay đổi trạng thái kho.</p>}
              <p>Xem lịch sử thay đổi tại Lịch sử thao tác.</p>
            </Card>
            {btn(
              'Đăng xuất',
              () =>
                setPopup({
                  title: 'Đăng xuất khỏi ca làm việc?',
                  body: 'Phiên làm việc sẽ kết thúc. Nội dung chưa hoàn tất sẽ bị bỏ; chứng từ đã ghi nhận vẫn được giữ.',
                  label: 'Đăng xuất',
                  action: () => {
                    setPopup(null);
                    setDraft(fresh('in'));
                    setIntake({code:'',missing:false,customer:'',phone:'',address:'',fault:'',product:'',reason:'',accessories:''});
                    setScanCode(''); setCaseNote(''); setNfcStage(0); setNfcReason('');
                    pendingContext.current={id:'',product:''};
                    access.logout();
                  },
                }),
              false,
              true,
            )}
          </>
        );
      case 'login':
        return null;
      case 'profile-edit': case 'profile-avatar': case 'profile-work': case 'profile-security': case 'profile-password': case 'profile-help': case 'profile-support':
        return <ScannerAccount access={access} mode={mode} onPasswordChanged={passwordChanged}/>;
    }
  };
  const passwordChanged = () => {
    setDraft(fresh('in'));setIntake({code:'',missing:false,customer:'',phone:'',address:'',fault:'',product:'',reason:'',accessories:''});
    setScanCode('');setCaseNote('');setNfcStage(0);setNfcReason('');setPopup(null);pendingContext.current={id:'',product:''};
    access.logout('Đã đổi mật khẩu. Phiên trên thiết bị này đã kết thúc; vui lòng đăng nhập bằng mật khẩu mới.');
  };
  const closeDialog = () => {
    if (busy) return;
    setPopup(null);
    setInputSheet(false);
    setBox('');
    setError('');
  };
  if (!access.allowed) return <div className="sc-workspace sc-auth-workspace"><ScannerAuthScreen access={access} role={role} warehouse={warehouseStatus(db)} warehouseLoaded={ready} warehouseError={storageError}/></div>;
  return (
    <div className="sc-workspace">
      {qa&&<aside className="sc-design-panel">
        <div className="sc-panel-brand">
          <ScanLine />
          <strong>HOA NAM / SCANNER</strong>
        </div>
        <h1>
          Một app.
          <br />
          Trọn ca vận hành.
        </h1>
        <p>
          Preview tương tác • dữ liệu mock cục bộ, không kết nối API/DB thật.
          Các xác nhận chỉ thay đổi dữ liệu trên thiết bị này.
        </p>
        <div className="sc-panel-rule">
          WEB quản lý thông tin
          <br />
          <ArrowRight /> APP thực hiện nghiệp vụ kho
        </div>
        <Field label="Vai trò kiểm thử">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {Object.keys(profiles).map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Kịch bản phản hồi">
          <select value={mode} onChange={(e) => chooseMode(e.target.value)}>
            <option value="normal">Bình thường</option>
            <option value="offline">Ngoại tuyến • giữ nội dung</option>
            <option value="error">Lỗi xử lý • thử lại</option>
          </select>
        </Field>
        <p>
          <b>Luồng thử nhanh</b>
          <br />
          Nhập NEW-001 → duyệt PN → xuất NEW-001 → duyệt PX → tiếp nhận bảo hành
          NEW-001.
          <br />
          <br />
          BH-001 → Xuất linh kiện → LK-001 + BOX-001 × 3 → gửi duyệt → ghi sổ
          XLK → xem lại hồ sơ.
        </p>
        <p>Vai trò và kịch bản bên ngoài khung điện thoại chỉ dùng cho QA. Các quyền trong app lấy từ phiên hiện tại.</p>
        <small>
          BA cần duyệt: chính sách Post, quyền xác nhận, giữ chỗ và tính nguyên
          tử của xuất linh kiện.
        </small>
        <button onClick={()=>access.expire()}>Kiểm thử hết hạn phiên</button>
      </aside>}
      <div className={view==='home'?'sc-phone sc-phone-home':view==='create'&&draft.kind==='in'?'sc-phone sc-phone-inbound-create':view==='scan'&&draft.kind==='in'?'sc-phone sc-phone-inbound-scan':view==='review'&&draft.kind==='in'?'sc-phone sc-phone-inbound-review':view==='scan'&&draft.kind==='out'?'sc-phone sc-phone-outbound-scan':view==='review'&&draft.kind==='out'?'sc-phone sc-phone-outbound-review':outboundResultDoc?'sc-phone sc-phone-outbound-result':inboundResultDoc?'sc-phone sc-phone-inbound-result':view==='create'&&draft.kind==='out'?'sc-phone sc-phone-outbound-create':'sc-phone'} ref={phoneRef}>
        <div className="sc-preview-note">
          Môi trường xem thiết kế • không ghi dữ liệu thật
        </div>
        <header className="sc-header">
          {view !== 'home' ? (
            <button aria-label="Quay lại" onClick={back}>
              <ArrowLeft />
            </button>
          ) : (
            <span className="sc-header-symbol vl-brand-icon" aria-hidden="true"/>
          )}
          <div>
            {view==='home'?<><h1>HOA NAM SCANNER</h1><small>WMS - Vận hành chuyên nghiệp</small></>:<><small>HOA NAM SCANNER</small><h1>{(['create','scan','review'].includes(view)&&draft.kind==='in')||inboundResultDoc?'Nhập kho':(['scan','review'].includes(view)&&draft.kind==='out')||outboundResultDoc?'Xuất kho':view==='create'&&draft.kind==='out'?'Xuất kho':titles[view]}</h1></>}
          </div>
          {view==='home'&&<button className="sh-activity-button" aria-label="Xem hoạt động kho" title={`${db.events.length} hoạt động đã ghi nhận`} onClick={()=>go('history')}><Bell aria-hidden="true"/>{db.events.length>0&&<span className="sh-activity-count" aria-hidden="true">{db.events.length>99?'99+':db.events.length}</span>}</button>}
          {!view.startsWith('profile')&&<button aria-label="Mở cá nhân" onClick={() => go('profile')}>
            {view==='home'?<span aria-hidden="true">{(access.session?.name||'').split(' ').filter(Boolean).slice(-2).map(word=>word[0]).join('')}</span>:<UserRound />}
          </button>}
        </header>
        {paused&&<output className="sc-warehouse-banner"><AlertTriangle aria-hidden="true"/><span>{warehouseMessage}. Nội dung đang soạn được giữ trong lần mở này.</span></output>}
        {!paused&&readOnly&&<p className="sc-permission-note">Các thao tác không thuộc quyền được cấp sẽ bị khóa.</p>}
        {(mode === 'offline'||!connected) && (
          <div className="sc-offline">
            <WifiOff />
            Ngoại tuyến • giữ nội dung đang soạn
          </div>
        )}
        <main className="sc-content" key={view}>
          {networkNotice&&<output className="sc-info">{networkNotice}</output>}
          {storageError&&<div className="sc-error" role="alert">{storageError}<button className="sc-btn secondary" onClick={()=>window.location.reload()}>Tải lại để kiểm tra</button></div>}
          {!ready ? (
            <div className="sc-skeleton" aria-busy="true" aria-label="Đang tải dữ liệu kho">
              <span />
              <span />
              <span />
            </div>
          ) : (
            actionDenied ? <Card>{paused&&<ScannerPausedWarning onLookup={()=>access.navigate('lookup')}/>}<h2>Thao tác đang bị khóa</h2><p>{paused?warehouseMessage:'Bạn không có quyền mở thao tác tạo, sửa hoặc gửi dữ liệu.'}</p><p>Nội dung đang soạn được giữ trong lần mở này; chưa có thay đổi nào được gửi.</p><button className="sc-btn secondary" onClick={()=>access.navigate('home',{},true)}>Về trang chủ</button></Card> : body()
          )}
          {error && !modalOpen && !['scan-lookup','scan-warranty'].includes(view) && !(['scan','review'].includes(view)&&(['in','out'] as string[]).includes(draft.kind as string)) && (
            <div className="sc-error" role="alert">
              <AlertTriangle />
              {error}
            </div>
          )}
        </main>
        <nav className="sc-nav" aria-label="Điều hướng chính">
          <svg className="sc-nav-surface" viewBox="0 0 430 106" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 18H151C175 18 178 44 215 44S255 18 279 18H430V106H0Z" />
          </svg>
          {nav.map((v, i) => {
            const Icon = icons[i];
            const active = i!==2&&(view === v || (v === 'profile'&&view.startsWith('profile-')) || (v === 'docs' && view==='doc'));
            return (
              <button
                key={v}
                aria-current={active ? 'page' : undefined}
                aria-haspopup={i===2?'dialog':undefined}
                aria-expanded={i===2?launcher:undefined}
                data-context-active={i===2&&(launcher||['create','scan','review','scan-lookup','scan-warranty','warranty-product'].includes(view))?true:undefined}
                aria-label={i === 2 ? 'Mở tác vụ quét mã' : navLabels[i]}
                className={`${active ? 'active' : ''} ${i === 2 ? 'sc-nav-center' : ''}`}
                onClick={() => {if(i===2){launcherReturn.current=view;setLauncher(true);}else tab(v);}}
              >
                {i === 2 ? <span className="sc-nav-orb" aria-hidden="true"><ScanQrCode className="sc-nav-qr" strokeWidth={2} /></span> : <Icon aria-hidden="true" />}
                <span>{navLabels[i]}</span>
              </button>
            );
          })}
        </nav>
        {qa&&<details className="sc-mobile-controls">
          <summary>Điều khiển xem thiết kế</summary>
          <p>Dữ liệu mock • không kết nối hệ thống thật.</p>
          <label className="sc-feedback-setting"><input type="checkbox" checked={haptic} onChange={e=>setHaptic(e.target.checked)}/>Rung nhẹ khi quét thành công</label>
          <label className="sc-feedback-setting"><input type="checkbox" checked={sound} onChange={e=>setSound(e.target.checked)}/>Âm báo khi quét thành công</label>
          <p>Hồ sơ: mã xác minh giả 123456; số 0900000001 kiểm thử trùng. Không nhập tài khoản thật. Thay mật khẩu chỉ áp dụng phiên tab này.</p>
          <button className="sc-btn secondary" onClick={()=>access.expire()}>Kiểm thử hết hạn phiên</button>
          <Field label="Vai trò">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.keys(profiles).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Kịch bản">
            <select value={mode} onChange={(e) => chooseMode(e.target.value)}>
              <option value="normal">Bình thường</option>
              <option value="offline">Ngoại tuyến</option>
              <option value="error">Lỗi xử lý</option>
              <option value="conflict">Hồ sơ xung đột</option>
              <option value="duplicate">Số điện thoại trùng</option>
            </select>
          </Field>
          <Field label="Kịch bản thiết bị"><select value={deviceState} onChange={e=>setDeviceState(e.target.value)}><option value="normal">Luồng thiết bị mô phỏng</option><option value="unsupported">Thiết bị không hỗ trợ</option><option value="denied">Quyền thiết bị bị từ chối</option></select></Field>
        </details>}
      </div>
      <AppDialog ref={warehouseDialogRef} className="sc-warehouse-modal" aria-labelledby="sc-warehouse-title" onCancel={()=>setWarehouseTarget(null)}><div className="sc-card"><h2 id="sc-warehouse-title">{warehouseTarget==='paused'?'Tạm dừng Kho Hoa Nam?':'Kích hoạt lại Kho Hoa Nam?'}</h2><p>{warehouseTarget==='paused'?'Toàn bộ thao tác ghi sẽ bị chặn. Nhân viên vẫn xem và tra cứu được.':'Nhân viên có quyền sẽ được tiếp tục thao tác ghi.'}</p><p>Người xác nhận: {access.session?.name} • Super Admin</p><Field label="Lý do thay đổi trạng thái"><input data-app-autofocus="true" value={warehouseReason} onChange={e=>setWarehouseReason(e.target.value)}/></Field><button className="sc-btn" disabled={warehouseReason.trim().length<5} onClick={()=>{try{if(!warehouseTarget)return;const next=changeWarehouse(currentStore(),access.actor(),warehouseTarget,warehouseReason,true);localStorage.setItem(storageKey,JSON.stringify(next));dbRef.current=next;setDb(next);setWarehouseTarget(null);setNotice('Trạng thái kho đã được cập nhật.');}catch(e){setError((e as Error).message);setWarehouseTarget(null);}}}>Xác nhận thay đổi</button><button className="sc-btn secondary" onClick={()=>setWarehouseTarget(null)}>Hủy, giữ nguyên trạng thái</button></div></AppDialog>
      {launcher&&<ScannerLauncher hasDraft={hasDraft} reason={launchReason} onSelect={launch} onClose={()=>setLauncher(false)} onResume={()=>access.navigate(['create','scan','review','intake'].includes(launcherReturn.current)?launcherReturn.current:intake.code||intake.customer?'intake':draft.lines.length?'scan':'create')}/>}
      <AppDialog
        ref={dialogRef}
        variant="sheet"
        className={view==='scan'&&draft.kind==='in'?'sc-dialog sc-inbound-scan-dialog':view==='scan'&&draft.kind==='out'?'sc-dialog sc-outbound-scan-dialog':view==='review'&&draft.kind==='in'?'sc-dialog sc-inbound-review-dialog':view==='review'&&draft.kind==='out'?'sc-dialog sc-outbound-review-dialog':'sc-dialog'}
        aria-labelledby="sc-dialog-title"
        onCancel={(e) => {
          e.preventDefault();
          closeDialog();
        }}
      >
        <div className="sc-dialog-inner">
          <div className="sc-split">
            <h2 id="sc-dialog-title">
              {box
                ? 'Số lượng trong hộp'
                : inputSheet
                  ? 'Nhập mã thủ công'
                  : popup?.title}
            </h2>
            <button
              className="sc-icon-btn"
              aria-label="Đóng hộp thoại"
              disabled={busy}
              onClick={closeDialog}
            >
              <X />
            </button>
          </div>
          {box ? (
            <>
              <p>{db.items.find((i) => i.code === box)?.name}</p>
              <Row label="Mã hộp">{box}</Row>
              <Row label="Khả dụng">
                {db.items.find((i) => i.code === box)?.qty} cái
              </Row>
              <Field label={view==='scan'&&draft.kind==='in'?'Số lượng cần nhập *':'Số lượng cần xuất *'}>
                <input
                  data-app-autofocus="true"
                  type="number"
                  min="1"
                  step="1"
                  value={boxQty}
                  onChange={(e) => setBoxQty(e.target.value)}
                />
              </Field>
              {btn(
                'Xác nhận số lượng',
                () => addCode(box, Number(boxQty)),
                !boxQty,
              )}
            </>
          ) : inputSheet ? (
            <>
              <Field label="Mã QR / Barcode">
                <input
                  data-app-autofocus="true"
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  placeholder="Nhập mã trên tem"
                  disabled={view==='scan'&&draft.kind==='in'?(readOnly||busy):undefined}
                  aria-invalid={view==='scan'&&draft.kind==='in'?!!error:undefined}
                  aria-describedby={view==='scan'&&draft.kind==='in'&&error?'sis-dialog-error':undefined}
                  enterKeyHint={view==='scan'&&draft.kind==='in'?'go':undefined}
                  onKeyDown={e=>{if(view==='scan'&&draft.kind==='in'&&e.key==='Enter'&&scanCode.trim()){e.preventDefault();addCode(scanCode);}}}
                />
              </Field>
              {btn(
                'Kiểm tra mã',
                () =>
                  view === 'lookup' ? lookup(scanCode) : addCode(scanCode),
                !scanCode.trim()||(view==='scan'&&draft.kind==='in'&&readOnly),
              )}
            </>
          ) : (
            <>
              {popup?.body}
              {popup?.title.startsWith('Thu hồi ') && (
                <Field label="Lý do thu hồi *">
                  <input
                    value={nfcReason}
                    onChange={(e) => setNfcReason(e.target.value)}
                    placeholder="Ví dụ: thẻ hỏng, không còn đọc được"
                  />
                </Field>
              )}
              {popup?.action && (
                <button
                  className={`sc-btn ${popup.danger ? 'danger-fill' : ''}`}
                  disabled={busy||(view==='review'&&draft.kind==='in'&&readOnly)}
                  onClick={() => {
                    if (popup.title.startsWith('Thu hồi ')) {
                      if (!nfcReason.trim()) {
                        setError('Nhập lý do thu hồi.');
                        return;
                      }
                      void run(() => {
                        save({
                          ...dbRef.current,
                          tags: dbRef.current.tags.map((t) =>
                            t.uid === uid
                              ? {
                                  ...t,
                                  status: 'Ngừng dùng',
                                  reason: nfcReason,
                                }
                              : t,
                          ),
                          events: [
                            {
                              at: stamp(),
                              text: `${uid} • thu hồi • ${nfcReason}`,
                            },
                            ...dbRef.current.events,
                          ],
                        });
                        setPopup(null);
                      });
                    } else popup.action?.();
                  }}
                >
                  {busy ? <LoaderCircle className="sc-spin" /> : null}
                  {busy ? 'Đang xử lý…' : popup.label || 'Xác nhận'}
                </button>
              )}
            </>
          )}
          {error && (
            <div className="sc-error" role="alert" id={view==='scan'&&draft.kind==='in'?'sis-dialog-error':undefined}>
              {view==='review'&&draft.kind==='in'&&<strong>Chưa gửi được phiếu</strong>}
              {error}
            </div>
          )}
          {btn('Huỷ / quay lại', closeDialog, false, true)}
        </div>
      </AppDialog>
    </div>
  );
}
