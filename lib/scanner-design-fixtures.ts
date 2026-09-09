/** User-approved Scanner design data (09/09/2026). Local preview only. */
import {seedStore,type Store,type Doc} from './scanner-model.ts';
export const DESIGN_SHIFT_TIME='08:30';
type DesignStore=Store&{designFixtureVersion?:number;designSerials?:Record<string,string>};
export type HomeRecord={id:string;kind:'in'|'out'|'parts'|'warranty';name:string;at:string;status:string;target:'doc'|'case'};
const outbound:Doc={id:'PX-0004',kind:'out',name:'Đại lý Minh Phát',recipient:'Đại lý Minh Phát',phone:'0900000000',address:'12 Nguyễn Văn Linh, TP. Hồ Chí Minh',group:'Đại lý',note:'Giao máy theo yêu cầu của đại lý.',lines:[{code:'HN-REF-OUT-001',qty:1}],status:'Đã ghi sổ',at:'16:20 11/04/2026',key:'design-out-0004'};
/** Additive/idempotent upgrade: preserve operational edits, no clearing local storage. */
export function applyScannerDesignFixtures(input:Store):Store{
 const store=input as DesignStore;if(store.designFixtureVersion===1)return store;
 const pristine=store.docs.length===1&&store.docs[0]?.key==='seed-in'&&store.docs[0].status==='Chờ duyệt'&&store.events.length===1;
 const docs=store.docs.map(d=>d.key==='seed-in'&&d.status==='Chờ duyệt'&&d.at==='08:10 08/09/2026'?{...d,at:'08:32 12/04/2026'}:d);
 if(!docs.some(d=>d.id===outbound.id))docs.push({...outbound,lines:outbound.lines.map(l=>({...l}))});
 const items=store.items.some(i=>i.code==='HN-REF-OUT-001')?store.items:[...store.items,{code:'HN-REF-OUT-001',sku:'HN-MCC-26',name:'Máy cắt cỏ Hoa Nam E26',type:'machine' as const,qty:0,status:'Đã xuất' as const,warehouse:'Kho Hoa Nam • Kệ A01'}];
 const cases=store.cases.map(c=>c.id==='BH-001'&&c.timeline.every(e=>e.at.endsWith('08/09/2026'))?{...c,timeline:[{at:'14:00 10/04/2026',text:'Tiếp nhận sản phẩm và phụ kiện'},{at:'14:15 10/04/2026',text:`Trạng thái hiện tại: ${c.status}`}]}:c);
 const fixtureEvents=[{at:'08:32 12/04/2026',text:'PN-0001 • chờ kiểm tra và duyệt'},{at:'16:20 11/04/2026',text:'PX-0004 • đã ghi sổ xuất • Đại lý Minh Phát'},{at:'14:15 10/04/2026',text:'BH-001 • Đang xử lý • SN: HN12345'}];
 const events=pristine?fixtureEvents:[...store.events,...fixtureEvents.slice(1).filter(e=>!store.events.some(old=>old.text===e.text))];
 const next:DesignStore={...store,docs,items,cases,events,designFixtureVersion:1,designSerials:{...store.designSerials,'MAY-003':'HN12345'}};
 return next;
}
export const seedScannerDesignStore=()=>applyScannerDesignFixtures(seedStore());
export const scannerDesignSerial=(store:Store,code:string)=>(store as DesignStore).designSerials?.[code];
export function scannerHomeRecords(store:Store):HomeRecord[]{
 const records:HomeRecord[]=store.docs.map(d=>({id:d.id,kind:d.kind,name:d.name,at:d.at,status:d.status,target:'doc'}));
 const warranty=store.cases.find(c=>c.id==='BH-001');
 if(warranty)records.push({id:warranty.id,kind:'warranty',name:`SN: ${scannerDesignSerial(store,warranty.code)||warranty.code}`,at:warranty.timeline.at(-1)?.at||'',status:['Tiếp nhận','Đang kiểm tra','Đang sửa chữa'].includes(warranty.status)?'Đang xử lý':warranty.status,target:'case'});
 // Domain docs are newest-first; the approved historical warranty follows stock documents.
 return records.slice(0,3);
}
