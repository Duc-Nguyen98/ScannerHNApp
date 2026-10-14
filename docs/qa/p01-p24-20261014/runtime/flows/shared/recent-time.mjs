const vietnamDay = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'});
export function recentTimeLabel(day,time,now=Date.now()) {
  const parts=Object.fromEntries(vietnamDay.formatToParts(new Date(now)).map(p=>[p.type,p.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`;
  const delta=(Date.parse(today+'T00:00:00Z')-Date.parse(day+'T00:00:00Z'))/86400000;
  const label=delta===0?'Hôm nay':delta===1?'Hôm qua':day.slice(0,4)===parts.year?day.slice(5).split('-').reverse().join('/'):day.split('-').reverse().join('/');
  return `${label} · ${time}`;
}
