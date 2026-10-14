import {P17_RELEASE,requireP17,exceptionPresentation,reasonText,safeReference} from './api-contract.mjs';
import {createP17OwnerBinding} from './api-owner.mjs';
import {renderScanException} from './view.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import {createExceptionNavigation} from './navigation.mjs';
import {mountReadableText} from '../shared/readable-text.mjs';
import {beginClipboardCopy} from './experience.mjs';

// Explicit dependency-injected preparation. Nothing in Home/production entry
// imports or creates this boundary. Mount/show/Back never inspect an API.
export function mountPreparedScanExceptions({root,screen,tools,client,operation,getReference,getBody,getCallerGeneration,getOriginalRequest,getOriginalScope,getSnapshot,onBack=()=>{},onHome=onBack,onSystem=()=>{},onObservation=()=>{},onSize=()=>{}}){
 requireP17(client?.mode==='MOCK_PREPARATION'&&typeof getSnapshot==='function','ACTIVATION_OFF');
 let active=false,disposed=false,copyTask=null,epoch=0,relatedBinding=null,detailBinding=null;
 const namespace=getReference().owner==='P04'?'p04':getReference().owner==='P05'?'p05':'p07';
 const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:()=>active&&!disposed,key:namespace+'PreparedFeedback'});
 const navigation=createExceptionNavigation({root,key:namespace+'PreparedException',isActive:()=>active&&!disposed,onBack:()=>back('scanner')});
 const reader=mountReadableText({root,getScreen:()=>screen,getTools:()=>tools,isActive:()=>active&&!disposed,key:namespace+'PreparedReader'});
 const binding=createP17OwnerBinding({client,operation,getReference,getBody,getCallerGeneration,getOriginalRequest,getOriginalScope,onChange:()=>render()});
 function closeRelated(){relatedBinding?.dispose();relatedBinding=null;detailBinding?.dispose();detailBinding=null;}
 function safeSnapshot(){
  // The owner retains the real request body/journal. Render only its permitted
  // context values and safe identity, never an entire private response.
  const source=getSnapshot(),r=binding.reference,d=source.document||{};
  if(r.owner==='P07')return {document:null,accepted:undefined,busy:binding.snapshot().busy,unknown:false};
  const sameScope=d.actorId===r.actor_id&&d.authSessionId===r.auth_session_id&&d.warehouseId===r.warehouse_id;
  const sameDraft=(!r.scan_session_id||d.scanSessionId===r.scan_session_id)&&(!r.draft_id||d.documentId===r.draft_id);
  // The retained P05 owner stores the business source in document and the
  // staging draft/scan identity in its frozen pending request. Check both.
  const pending=source.pending;
  const sameSource=r.owner==='P05'&&r.mode==='SOURCE_LINKED'&&source.mode==='source-linked'&&r.source_document_id&&d.documentId===r.source_document_id&&source.source?.source_document_id===r.source_document_id&&pending?.draftId===r.draft_id&&pending?.scanSessionId===r.scan_session_id&&pending?.sourceId===r.source_document_id&&pending?.key===r.operation_key;
  const sameOwner=sameScope&&(sameDraft||sameSource);
  return {document:{documentId:r.draft_id??d.documentId,scanSessionId:r.scan_session_id??d.scanSessionId,version:r.original_version??d.version,number:sameOwner&&typeof d.number==='string'?d.number:undefined,actorName:sameOwner&&typeof d.actorName==='string'?d.actorName:undefined,actorId:r.actor_id,authSessionId:r.auth_session_id,warehouseId:r.warehouse_id},accepted:sameOwner&&Array.isArray(source.accepted)?source.accepted.map(x=>({raw:x.raw,quantity:x.quantity})):undefined,request:{requestId:r.operation_key},busy:binding.snapshot().busy,unknown:operation.endsWith('RECONCILE'),sentAt:sameOwner&&typeof source.sentAt==='string'?source.sentAt:undefined};
 }
 function tagPresentation(tag){return tag?{prepared:true,id:tag.physical_code_id,uid:tag.hardware_uid,statusLabel:tag.status_label,product:{name:tag.sku_name,sku:tag.sku_code,serial:tag.serial_number,code:null}}:null;}
 function render(){
  if(!active||disposed)return;
  if(!binding.current()){feedback.clear();closeRelated();root.replaceChildren();return;}
  const read=binding.snapshot(),s=safeSnapshot(),ctx=client.context();
  if(s.unknown){
   // The GET may verify a SAVE or historical RECORD; P17 does not unlock a
   // writer or turn a recorded historical snapshot into today's posted state.
   renderScanException({root,owner:namespace,state:s,canCheck:true,preparedContext:ctx,onSize});
   const title=root.querySelector('.p17-verifying h2'),copy=root.querySelector('.p17-verifying p');
   if(read.observation?.nativeOutcome==='SUCCEEDED'){title.textContent=read.observation.recordVerified?'Đã đối chiếu yêu cầu ghi nhận':'Đã đối chiếu yêu cầu '+binding.reference.command;copy.textContent='Kết quả thuộc yêu cầu đã gửi. Trạng thái chứng từ hiện tại được kiểm tra riêng bởi luồng nghiệp vụ.';}
   else if(read.error){copy.textContent=read.error.panel==='expired'?'Phiên đã hết hiệu lực. Dữ liệu yêu cầu được giữ để đối chiếu.':'Chưa xác minh được kết quả. Giữ nguyên yêu cầu để đối chiếu tiếp.';}
   const id=root.querySelector(`[data-${namespace}=identity]`);if(id)id.setAttribute('aria-label','Thông tin yêu cầu gốc');
   reader.refresh();return;
  }
  let exception=read.observation?exceptionPresentation(read.observation,ctx):null;
  if(read.error?.reservation!==undefined)exception={panel:'P17.S02',raw:getBody?.()?.raw_code,reason:reasonText(read.error.code),reasonCode:read.error.code,reservation:read.error.reservation,prepared:true};
  if(operation==='P07_TAG_DETAIL'&&!read.busy&&!read.error&&read.observation?.tag?.tab_status==='ASSIGNED')exception={panel:'P17.S03',prepared:true};
  if(exception){navigation.sync(true);renderScanException({root,owner:namespace,state:{...s,exception},tag:tagPresentation(read.observation?.tag),canCheck:false,preparedContext:ctx,onSize});reader.refresh();return;}
  // Unknown/error checks are not definitive invalid/accepted business rows.
  const nfc=operation==='P07_TAG_DETAIL',scroll=root.querySelector('.p17-scroll')?.scrollTop||0,hadFocus=root.contains(document.activeElement),focus=document.activeElement?.getAttribute(`data-${namespace}`);
  navigation.sync(false);root.innerHTML=`<section class="${namespace}-app p17-app" aria-busy="${read.busy}" data-check-state="${read.status}"><header class="p17-header"><button type="button" class="p17-button p17-secondary" data-${namespace}="exception-return" aria-label="Quay lại"><svg class="p17-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><h1 tabindex="-1">${nfc?'Đọc thẻ NFC':'Kiểm tra mã'}</h1></header><div class="p17-sheet"><div class="p17-scroll" tabindex="0" role="region" aria-label="${nfc?'Thông tin liên kết':'Kết quả kiểm tra'}"><h2 data-status></h2><p data-copy></p></div><footer class="p17-footer"><button type="button" class="p17-button p17-primary" data-${namespace}="inspect" aria-disabled="${read.busy}" aria-busy="${read.busy}">${nfc?'Kiểm tra liên kết':'Kiểm tra mã'}</button><button type="button" class="p17-button p17-secondary" data-${namespace}="${nfc?'exception-cancel':'exception-manual'}">${nfc?'Hủy':'Nhập mã'}</button></footer></div></section>`;
  root.querySelector('[data-status]').textContent=nfc?(read.busy?'Đang kiểm tra thông tin thẻ…':read.error?'Chưa xác minh được liên kết':read.observation?.tag?.tab_status==='UNASSIGNED'?'Thẻ chưa liên kết':read.observation?'Chưa xác minh trạng thái liên kết':'Chưa kiểm tra thông tin thẻ'):(read.busy?'Đang kiểm tra mã…':read.error?'Chưa xác minh được mã':read.observation?'Đã nhận kết quả kiểm tra':'Chưa kiểm tra mã');
  root.querySelector('[data-copy]').textContent=nfc?'Kiểm tra dữ liệu liên kết từ nguồn. Thao tác này không ghi hoặc thay liên kết.':read.error?'Dữ liệu đã nhập và các mã hợp lệ được giữ nguyên.':read.observation?.kind==='validate'&&read.observation.row.outcome==='DUPLICATE'?'Mã trùng không được cộng thêm số lượng.':'Kiểm tra theo luồng nghiệp vụ hiện tại.';
  root.querySelector('.p17-scroll').scrollTop=scroll;
  if(hadFocus)(focus?root.querySelector(`[data-${namespace}="${CSS.escape(focus)}"]`):root.querySelector('h1'))?.focus({preventScroll:true});
  onSize();
 }
 function back(intent){hide();onBack({intent,reference:binding.reference});}
 async function inspect(){const result=await binding.inspect();if(active&&binding.current()&&result.kind!=='ignored'){if(result.kind==='error'&&result.error.panel)onSystem(result.error);onObservation(result);}return result;}
 async function related(){
  const read=binding.snapshot(),reservation=binding.reservation();
  if(read.busy||relatedBinding?.snapshot().busy||!reservation?.can_open||reservation.redacted)return;
  const r={...binding.reference,related_document_id:reservation.document_id};
  relatedBinding?.dispose();relatedBinding=createP17OwnerBinding({client,operation:'P05_RELATED_RESERVATION_DOCUMENT',getReference:()=>r,getCallerGeneration});
  const marker=epoch,target=relatedBinding;
  const result=await target.inspect({reservation});
  if(!binding.current()){invalidate();return;}if(!active||marker!==epoch||result.kind==='ignored')return;
  if(result.kind==='related')feedback.show({title:'Phiếu liên quan',message:`Số phiếu: ${result.document.doc_no}\nTrạng thái: ${result.document.status}`,confirmLabel:'Đóng'});
  else {if(result.error?.panel)onSystem(result.error);feedback.show({title:'Chưa thể xem phiếu liên quan',message:'Nguồn đọc không còn khả dụng hoặc chưa được cấp quyền. Hãy kiểm tra lại phiên và quyền hiện tại.',confirmLabel:'Đóng'});}
 }
 async function detail(){
  if(!binding.snapshot().observation?.tag||detailBinding?.snapshot().busy)return;
  detailBinding?.dispose();detailBinding=createP17OwnerBinding({client,operation:'P07_TAG_DETAIL',getReference,getCallerGeneration});
  const marker=epoch,result=await detailBinding.inspect();if(!binding.current()){invalidate();return;}if(!active||marker!==epoch||result.kind==='ignored')return;
  if(result.kind!=='tag'){if(result.error?.panel)onSystem(result.error);feedback.show({title:'Chưa thể xem liên kết',message:'Nguồn liên kết chưa được xác minh. Liên kết hiện tại không thay đổi.',confirmLabel:'Đóng'});return;}
  const t=result.tag;feedback.show({title:'Thông tin thẻ NFC',message:`UID: ${t.hardware_uid??'Chưa xác định'}\nTrạng thái: ${t.status_label??'Chưa xác định'}\nSKU: ${t.sku_code??'Chưa xác định'}\nSerial: ${t.serial_number??'Chưa xác định'}\nNgười liên kết: ${t.linker?.display_name??'Chưa được ghi nhận'}\nKho liên kết: ${t.assigned_warehouse?.name??'Chưa được ghi nhận'}\nNgày liên kết: ${t.assigned_at??'Chưa được ghi nhận'}`,confirmLabel:'Đóng'});
 }
 function copyText(){const r=binding.reference;return ['operation_key','draft_id','scan_session_id','original_version','command'].filter(k=>r[k]!==undefined).map(k=>`${k}: ${r[k]}`).join('\n');}
 async function copy(){
  if(!active||copyTask||!binding.current())return;const marker=epoch,body=copyText();if(!body)return;
  const task=beginClipboardCopy(body);copyTask=task;const result=await task.promise;if(copyTask===task)copyTask=null;
  if(!active||marker!==epoch||!binding.current()||result==='cancelled')return;
  root.querySelector(`[data-${namespace}=copy-reconciliation]`)?.focus({preventScroll:true});
  feedback.show(result==='success'?{title:'Đã sao chép thông tin yêu cầu',message:'Thông tin định danh yêu cầu đã được sao chép.',tone:'success'}:{title:'Không thể sao chép tự động',message:body,confirmLabel:'Đóng',className:'hn-readable-dialog'});
 }
 function click(event){
  const button=event.target.closest('button');if(!active||!button||!root.contains(button)||button.disabled)return;
  if(!binding.current()){invalidate();return;}
  const action=button.getAttribute(`data-${namespace}`);
  if(['exception-back','exception-return','exception-manual','exception-cancel'].includes(action))back(action==='exception-manual'?'manual':'scanner');
  else if(action==='home'){hide();onHome();}
  else if(action==='inspect'||action==='check')void inspect();
  else if(action==='related-document')void related();
  else if(action==='exception-detail')void detail();
  else if(action==='copy-reconciliation')void copy();
  else if(action==='review-reconciliation'){const d=root.querySelector('.p17-identity');if(d){d.open=true;d.querySelector('summary').focus({preventScroll:true});}}
  // No send/cancel/prepare/confirm/release command branch exists here.
 }
 function hide(){epoch++;active=false;copyTask?.cancel();copyTask=null;binding.cancel();navigation.hide();feedback.clear();closeRelated();}
 function invalidate(){hide();binding.invalidate();root.replaceChildren();}
 root.addEventListener('click',click);
 return {mode:'MOCK_PREPARATION',release:P17_RELEASE,binding,inspect,show(){if(disposed)return;active=true;render();},hide,invalidate,dispose(){hide();disposed=true;binding.dispose();reader.dispose();navigation.dispose();feedback.dispose();root.removeEventListener('click',click);root.replaceChildren();}};
}
