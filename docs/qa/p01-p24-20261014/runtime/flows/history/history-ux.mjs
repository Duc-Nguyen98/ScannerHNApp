import {queryDateBounds} from '../shared/query-date-policy.mjs';

export const QUICK_RANGES=Object.freeze([[1,'Hôm nay'],[7,'7 ngày'],[30,'30 ngày'],[90,'90 ngày']]);
// N calendar days including today; timezone comes from the shared query policy.
export function quickHistoryRange(days,now=new Date()){
 if(!QUICK_RANGES.some(([n])=>n===days))throw new RangeError('Unsupported history range');
 const {max}=queryDateBounds(now),start=new Date(max+'T00:00:00Z');
 start.setUTCDate(start.getUTCDate()-(days-1));
 return {from:start.toISOString().slice(0,10),to:max};
}
export const hasHistoryRefinements=f=>!!(f.q?.trim()||f.from||f.to||(f.status&&f.status!=='all'));
export const relaxHistoryFilters=f=>({...f,q:'',from:'',to:'',status:'all'});
export const historyContextKey=(panel,business,scope)=>panel===4?'daily':business|| (scope==='documents'?'documents':'general');
