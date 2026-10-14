// P06-only preview read adapter. No API, server enum, permission name or production data.
import { DEMO_ITEM_DETAILS, DEMO_EVENTS } from './demo-data.mjs';
export const LOOKUP_NAMESPACE = 'hn-scanner-lookup-fixture-v1';
const clone = value => structuredClone(value);
const locations = [
  { id: 'A-01-03', total: 6, available: 6, held: 0, unavailable: 0 },
  { id: 'B-02-01', total: 3, available: 3, held: 0, unavailable: 0 },
  { id: 'C-01-02', total: 2, available: 1, held: 1, unavailable: 0 },
  { id: 'D-01-01', total: 1, available: 0, held: 0, unavailable: 1 },
];
const rows = [
  ['HN12345','Máy in nhiệt XP-420B','XP-420B','A-01-03',12,10],
  ['HN12346','Máy in nhiệt XP-420B (Đen)','XP-420B-BK','B-02-01',8,8],
  ['HN12347','Giấy in nhiệt 80mm','PAPER-80','C-01-02',150,145],
  ['HN12348','Cáp nguồn XP-420B','CABLE-01','A-02-01',25,25],
  ['HN12349','Bộ vệ sinh đầu in','CLEAN-01','D-01-01',0,0],
];
const products = rows.map(([code,name,sku,location,total,available],i) => ({
  id: `fixture-item-${code}`, code, name, sku, serial: null, category: 'products', warehouseId: 'fixture-hoa-nam',
  location, stock: { total, available, held: i === 0 ? 1 : total === 0 ? 0 : null, unavailable: i === 0 ? 1 : total === 0 ? 0 : null },
  unit: 'Cái', group: i < 2 ? 'Thiết bị văn phòng' : null, brand: i < 2 ? 'Xprinter' : null,
  description: i === 0 ? 'Máy in nhiệt XP-420B, tốc độ cao, phù hợp in tem mã vạch.' : null,
  locations: i === 0 ? locations : null, images: [],
}));
// Independent fixture for category and serial search. Not an inferred product/component mapping.
const component = { id:'fixture-component-01',code:'LK0001-HN001',name:'Linh kiện mẫu LK0001',sku:'LK-0001',serial:'SN-LK-0001',category:'components',warehouseId:'fixture-hoa-nam',location:null,stock:{total:null,available:null,held:null,unavailable:null},unit:'Cái',group:null,brand:null,description:null,locations:null,images:[] };
const events = [
  ['09','08:15','inbound',20,'Từ NCC Thiên Phát','fixture-event-doc-01'],
  ['08','16:20','outbound',-5,'Bán cho KH Minh Phát','fixture-event-doc-02'],
  ['07','14:10','warranty',-1,'Tiếp nhận bảo hành','fixture-event-doc-03'],
  ['05','10:30','inbound',10,'Từ NCC An Khang','fixture-event-doc-04'],
  ['03','11:25','outbound',-2,'Bán cho KH Hồng Hà','fixture-event-doc-05'],
  ['02','15:40','warranty',-1,'Trả bảo hành (xuất)','fixture-event-doc-06'],
  ['01','09:05','inbound',15,'Từ NCC Thiên Phát','fixture-event-doc-07'],
].map(([day,time,type,quantity,description,documentId],i)=>({id:`fixture-event-${i+1}`,itemId:products[0].id,warehouseId:'fixture-hoa-nam',date:`2026-09-${day}`,time,type,quantity,description,documentId,status:'Thành công',canOpenDocument:false}));
const normalize = text => String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
export function validateEventFilters({from='',to=''}={}) {
  const validDate=value=>{
    if(value==='')return true;
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
    const date=new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value&&value.slice(0,4)!=='0000';
  };
  return !validDate(from)||!validDate(to)||(from&&to&&from>to)?'Khoảng ngày không hợp lệ. Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.':'';
}
export function filterEvents(source,{type='all',from='',to=''}={}) {
  const error=validateEventFilters({from,to});
  if(error)return {error,items:[]};
  return {error:null,items:clone(source.filter(e=>(type==='all'||e.type===type)&&(!from||e.date>=from)&&(!to||e.date<=to)))};
}
export function createLookupFixtureAdapter({capabilities={print:false,warranty:false},scenario='demo'}={}) {
  const items = [...products,component].map(item=>({...item,...DEMO_ITEM_DETAILS[item.code],source:'DEMO'}));
  const allEvents=[...events,...DEMO_EVENTS];
  const readItem=item=>{
    if(!item)return null;
    const result=clone(item);
    if(scenario==='missing'){
      if(item.id===component.id){result.stock=clone(component.stock);result.locations=null;result.location=null;}
      if(item.code==='HN12347'){result.stock.held=null;result.stock.unavailable=null;}
    }
    return result;
  };
  function scoped(scope) { return scope?.warehouseId === 'fixture-hoa-nam' && !!scope.actorId; }
  return {
    namespace:LOOKUP_NAMESPACE,
    setScenario(next){if(!['demo','missing','read-error'].includes(next))return false;scenario=next;return true;},
    // Explicit one-shot read failure scenario for presentation QA, no writes.
    retryRead(){if(scenario==='read-error')scenario='demo';},
    scenario:()=>scenario,
    capabilities:()=>clone(capabilities),
    search(scope,{category='products',query=''}={}) {
      if (!scoped(scope)) return {items:[],totals:{products:null,components:null},error:'Không xác minh được phạm vi tra cứu.'};
      if(scenario==='read-error')return {items:[],totals:{products:128,components:36},error:'Nguồn dữ liệu tạm thời chưa phản hồi.'};
      const q=normalize(query);
      return {items:items.filter(i=>i.warehouseId===scope.warehouseId&&i.category===category&&[i.code,i.name,i.sku,i.serial].some(v=>normalize(v).includes(q))).map(readItem),totals:{products:128,components:36},source:'FIXTURE',partial:true};
    },
    item(scope,id) { return scoped(scope) ? readItem(items.find(i=>i.id===id&&i.warehouseId===scope.warehouseId)) : null; },
    history(scope,id,filters) { return scoped(scope) && items.some(i=>i.id===id) ? scenario==='read-error'?{error:'Nguồn dữ liệu tạm thời chưa phản hồi.',items:[]}:{...filterEvents(allEvents.filter(e=>e.itemId===id&&e.warehouseId===scope.warehouseId),filters),source:'FIXTURE'} : {error:'Không xác minh được nguồn lịch sử.',items:[]}; },
  };
}
