import {assertPermission,assertWrite,type Actor} from './scanner-policy.ts';
import type {Store,Item} from './scanner-model';
export type ScanIntent='INBOUND'|'OUTBOUND'|'WARRANTY'|'LOOKUP'|'WARRANTY_PARTS';
export type GlobalIntent=Exclude<ScanIntent,'WARRANTY_PARTS'>;
export function assertLaunch(store:Store,actor:Actor|null,intent:GlobalIntent){
 if(intent==='INBOUND')assertWrite(store,actor,'inbound.create');
 else if(intent==='OUTBOUND')assertWrite(store,actor,'outbound.request.manual_create');
 else assertPermission(actor,intent==='WARRANTY'?'warranty.view':'inventory.view');
}
export function resolveScan(store:Store,actor:Actor|null,intent:'LOOKUP'|'WARRANTY',raw:string){
 assertLaunch(store,actor,intent);const code=raw.trim().toUpperCase();
 // No fake serial values: optional serial is resolved only when present on source item.
 const matches=store.items.filter(i=>[i.code,i.sku,(i as Item&{serial?:string}).serial].some(v=>v?.toUpperCase()===code));
 if(!code||!matches.length)throw new Error('Không tìm thấy mã. Kiểm tra QR, barcode, serial hoặc SKU và thử lại.');
 if(matches.length>1)return {type:'choose' as const,items:matches};
 const item=matches[0];if(intent==='LOOKUP')return {type:'product' as const,item};
 const active=store.cases.find(c=>c.code===item.code&&!['Đã trả','Đã huỷ'].includes(c.status));
 if(active)return {type:'case' as const,item,caseId:active.id};
 return {type:item.status==='Đã xuất'?'eligible' as const:'ineligible' as const,item};
}
