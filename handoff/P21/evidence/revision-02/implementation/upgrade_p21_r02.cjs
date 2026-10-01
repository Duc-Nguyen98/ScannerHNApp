const fs=require('node:fs');const p='docs/flows/warranty-components/resume-view.mjs';let s=fs.readFileSync(p,'utf8');
function rep(a,b){if(!s.includes(a))throw Error(a.slice(0,100));s=s.replace(a,b);}
rep("import {caseDetails}","import {checkpointTime,reconciliationSummary,resumeReadiness} from './resume-experience.mjs';\nimport {beginClipboardCopy} from '../scan-exceptions/experience.mjs';\nimport {caseDetails}");
rep('onHistory,onHome,onSize})','onHistory,onHome,onSize,onPosted})');
rep('const positions=new Map();',"const positions=new Map(),lastResumed=new Map();let copyTask=null;\n const memoryKey=()=>panel===1?'list:'+sample:key;\n const timeMarkup=v=>{const t=checkpointTime(v);return `<time datetime=\"${esc(t.iso||'')}\" title=\"${esc(t.full)}\" aria-label=\"${esc(t.full)}\">${esc(t.label)}</time>`;};");
rep('positions.set(key,','positions.set(memoryKey(),');rep('positions.get(key)','positions.get(memoryKey())');
const start=s.indexOf(' function draftCard('),end=s.indexOf(' function list()',start);
s=s.slice(0,start)+` function draftCard(s){const c=caseDetails(s.caseId),id=s.document.documentId,fresh=lastResumed.get(sample)===id;const readable=(v,label)=>text(v,label).replace('data-hn-lines=','data-hn-read-outside="true" data-hn-lines=');return \`<article class="p21-draft-wrap \${fresh?'p21-resumed':''}" data-hn-readable-group>\${fresh?'<p class="p21-resumed-label">Vừa tiếp tục</p>':''}<button type="button" data-p21="open" data-doc="\${esc(id)}" class="p19-card p21-draft" aria-label="Tiếp tục phiếu \${esc(id)}"><span class="p21-row"><strong>\${readable(id,'Mã phiếu')}</strong><span class="p21-amber">\${s.unknown?'Cần kiểm tra kết quả':s.resumeBlocked?'Cần đối chiếu':'Đang thực hiện'}</span></span><span>\${readable(s.caseId+' · '+(c?.model||'Chưa xác minh'),'Hồ sơ bảo hành')}</span><span class="p21-row p21-muted"><span>\${esc(getState().session?.warehouse?.name)}</span>\${timeMarkup(s.checkpoint?.savedAt)}</span><span class="p21-row"><span>\${s.counts.codes} mã · \${s.counts.quantity} linh kiện</span><span class="p21-open">Tiếp tục \${icon('arrow')}</span></span></button></article>\`;}
`+s.slice(end);
const a=s.indexOf('return `<section class="p19-card p19-context">',s.indexOf(' function resume('));const b=s.indexOf('<div class="p19-warehouse">',a);
s=s.slice(0,a)+`return \`<section class="p19-card p21-context"><div class="p21-row"><strong>\${text(s.document.documentId,'Mã phiếu')}</strong><span class="p21-amber">Chưa xuất kho</span></div><div class="p21-case">\${tile('tool')}<div><strong>\${text(s.caseId,'Mã hồ sơ')}</strong><p>\${text(c?.model,'Sản phẩm bảo hành')}</p></div><span class="p19-badge">\${esc(c?.status)}</span></div><p class="p21-muted">Đang giữ · \${timeMarkup(s.checkpoint?.savedAt)}</p></section>`+s.slice(b);
rep("const post=panel===4;","const post=panel===4,load=s.readIssue==='load';");
rep("'Chưa xác minh được mã đã quét'","load?'Chưa tải được dữ liệu phiếu':'Chưa xác minh được mã đã quét'");
rep("'Phiếu được giữ lại để đối chiếu.<br>Không quét hoặc gửi lại phiếu lúc này.'","load?'Dữ liệu đang giữ vẫn còn nguyên.<br>Tải lại để xác minh trước khi tiếp tục.':'Phiếu được giữ lại để đối chiếu.<br>Không quét hoặc gửi lại phiếu lúc này.'");
rep("'Mở đúng phiếu trên Web WMS để kiểm tra mã đã ghi nhận và kết quả xuất.',true)","load?'Tải lại chỉ đọc dữ liệu, không gửi lại yêu cầu xuất.':'Mở đúng phiếu trên Web WMS để kiểm tra mã đã ghi nhận và kết quả xuất.',true)");
rep("${post?'':btn('reload','Tải lại để xác minh','p19-link')}","${post?'':load?btn('guide','Hướng dẫn đối chiếu','p19-link'):btn('reload','Tải lại dữ liệu','p19-link')}");
rep("'Xem định danh đối chiếu'","'Chi tiết đối chiếu'");
rep("panel===2?btn('scan'","panel===2?`<div class=\"p21-ready-summary\"><strong>${s.counts.codes} mã · ${s.counts.quantity} linh kiện</strong><p data-p21-readiness>${esc(resumeReadiness(s,owner.writeGuard()))}</p></div>`+btn('scan'");
rep("panel===3?btn('guide','Hướng dẫn đối chiếu '+icon('monitor'),'p19-primary')","panel===3?btn(s.readIssue==='load'?'reload':'guide',s.readIssue==='load'?'Tải lại dữ liệu '+icon('refresh'):'Hướng dẫn đối chiếu '+icon('monitor'),'p19-primary')");
rep("'Kiểm tra kết quả '+icon('refresh')","'Kiểm tra kết quả xuất '+icon('refresh')");
rep("...(doc?{doc}:{}),","...(next!==1&&doc?{doc}:{}),");
rep("onIssue(selected.snapshot(),4,sample)","openPosted(selected.snapshot())");
rep("if(a==='open'){go(2,el.dataset.doc);return;}","if(a==='open'){lastResumed.set(sample,el.dataset.doc);go(2,el.dataset.doc);return;}");
rep("onIssue(s,a==='review'?3:1,sample);","{lastResumed.set(sample,s.document.documentId);onIssue(s,a==='review'?3:1,sample);}");
rep("onIssue(owner.snapshot(),4,sample)","openPosted(owner.snapshot())");
const oldStart=s.indexOf("  if(a==='guide'||a==='identity')"),oldEnd=s.indexOf('\n }\n root.addEventListener',oldStart);
s=s.slice(0,oldStart)+`  if(a==='guide'||a==='identity'){const selected=owner,s=selected.snapshot(),payload=reconciliationSummary(s);feedback.show({title:a==='guide'?'Hướng dẫn đối chiếu trên Web':'Chi tiết đối chiếu',message:(a==='guide'?'Mở đúng phiếu trên Web WMS để kiểm tra mã đã ghi nhận và kết quả xuất. Chưa có URL Web được cấu hình. Sau khi đối chiếu, người quản lý hướng dẫn bước tiếp theo. Không tạo phiếu bù hoặc gửi lại khi chưa rõ kết quả.\\n\\n':'')+payload,cancelLabel:'Đóng',confirmLabel:'Sao chép thông tin đối chiếu',onConfirm:()=>copyIdentity(selected,payload)});}
`+s.slice(oldEnd);
const insertion=` function openPosted(s){if(!s.receipt||guard())return;if(!sample&&onPosted)onPosted(s);else onIssue(s,4,sample);}
 async function copyIdentity(selected,payload){if(!active||disposed||owner!==selected||guard()||reconciliationSummary(selected.snapshot())!==payload||copyTask)return;const token=generation,task=beginClipboardCopy(payload);copyTask=task;const result=await task.promise;if(copyTask===task)copyTask=null;if(!active||disposed||owner!==selected||token!==generation||guard()||result==='cancelled')return;feedback.show({title:result==='success'?'Đã sao chép thông tin đối chiếu':'Chưa sao chép được',message:result==='success'?'Thông tin đối chiếu đã được sao chép.': 'Bạn có thể chọn và sao chép thủ công nội dung dưới đây.\\n\\n'+payload,confirmLabel:result==='success'?'Đã hiểu':'Đóng'});}
`;
rep(' function click(e)',insertion+' function click(e)');
rep('feedback.clear();key=next;','copyTask?.cancel();copyTask=null;feedback.clear();key=next;');
rep('generation++;unsubscribe?.();','generation++;copyTask?.cancel();copyTask=null;unsubscribe?.();');
fs.writeFileSync(p,s);
const home='docs/flows/home/home.mjs';s=fs.readFileSync(home,'utf8');s=s.replace('componentResume=mountComponentResume({root:',`componentResume=mountComponentResume({onPosted:s=>{const r=s.receipt;if(!componentIssue.posted().some(x=>x.id===r?.id&&x.caseId===s.caseId&&x.requestId===s.request?.id))return;history.replaceState({...history.state,p20ReceiptFocus:{caseId:s.caseId,receiptId:r.id}},'',location.hash);openComponentHistory({case:s.caseId});},root:`);fs.writeFileSync(home,s);
