// View models only; no new UI or conversion to the preview's business enums.
import {p22Time} from './nfc-audit-api-contract.mjs';
import {P23ReadError} from './warranty-session-api-contract.mjs';
// Reuse the existing pure timezone utility; SQL storage zone remains explicitly verified input.
export function p23DisplayTime(value,serverTimezone,timePolicy={}){try{return p22Time(value,serverTimezone,timePolicy);}catch{throw new P23ReadError('P23_TIME_PROJECTION_INVALID');}}
export function p23CountLabel(state){if(state.kind==='loading')return 'Đang tải';if(state.total===null)return 'Đã tải '+state.loadedCount+' · Nguồn chưa đầy đủ';return 'Đã tải '+state.loadedCount+' / '+state.total;}
export function p23Metric(value,status){return {value:Number.isSafeInteger(value)&&value>=0?String(value):'—',partial:status==='PARTIAL_SOURCE',unavailable:status==='SOURCE_UNAVAILABLE'};}
export function p23TimelineNotice(meta){return {latestId:meta?.latest_recorded_event_id??null,latestAt:meta?.latest_recorded_event_at??null,partialTime:meta?.latest_completeness!=='ALL_RETAINED_EVENTS_HAVE_TIME',retentionKnown:meta?.retention_status!==undefined&&meta.retention_status!=='NOT_PUBLISHED'};}
