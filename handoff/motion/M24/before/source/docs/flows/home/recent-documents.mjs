import {initialFilters,selectDocuments,TYPES,STATUSES} from '../documents/document-model.mjs';
import {recentTimeLabel} from '../shared/recent-time.mjs';
export const HOME_RECENT_LIMIT = 3;
const validTime = row => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.day || '') || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(row.time || '')) return false;
  const date = new Date(row.day + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === row.day;
};
// Select from the complete P12 source, not a separate Home dataset or a loaded page.
export function recentDocuments(rows,now=Date.now()) {
  const eligible = [...new Map(rows.filter(row => row.id && row.number && Object.hasOwn(TYPES,row.type) && validTime(row)).map(row => [row.id,row])).values()];
  return selectDocuments({...initialFilters(),sort:'desc'},eligible).slice(0,HOME_RECENT_LIMIT).map(row => ({
    id:row.id, number:row.number, type:row.type,
    icon:row.type==='inbound'?'down':row.type==='outbound'?'up':'tool',
    description:TYPES[row.type],
    datetime:`${row.day}T${row.time}${row.time.length===5?':00':''}+07:00`,
    time:recentTimeLabel(row.day,row.time,now),
    fullTime:row.day.split('-').reverse().join('/')+' '+row.time+' (UTC+7)',
    label:STATUSES[row.status] || 'Chưa xác minh',
    tone:['posted','returned'].includes(row.status)?'green':['waiting','warrantyWaiting','ready'].includes(row.status)?'amber':['processing','received','checking'].includes(row.status)?'blue':'neutral',
  }));
}
