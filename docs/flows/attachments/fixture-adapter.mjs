// Explicit local P18 fixtures. No network upload, storage mutation or invented size policy.
export function attachmentFixtures(doc,{baseline=false}={}){
 const ready=(doc.attachments||[]).map(f=>({...f,state:'ready',mime:'application/pdf'}));
 if(!baseline||doc.id!=='fixture-inbound-0005')return ready;
 const box=new URL('../lookup/assets/demo/box.png',import.meta.url).href;
 return [
  {id:'p18-pn0005-dossier',name:'HoSoNhap_PN-0005.pdf',size:'153.1 KiB',mime:'application/pdf',state:'ready',url:new URL('./assets/HoSoNhap_PN-0005.pdf',import.meta.url).href,day:doc.day},
  {id:'p18-pn0005-photo1',taskId:'p18-upload-photo1',name:'Hinh_01.png',size:null,mime:'image/png',state:'uploading',progress:75,url:box},
  {id:'p18-pn0005-handover',taskId:'p18-upload-handover',name:'BienBanKiemDem_PN-0005.pdf',size:ready[0]?.size,mime:'application/pdf',state:'error',error:'Tải lên thất bại',url:ready[0]?.url},
  {id:'p18-pn0005-photo2',name:'Hinh_02.png',size:null,mime:'image/png',state:'ready',url:box,day:doc.day}
 ];
}
// Events delivered by the explicit preview transport; timers do NOT prove production progress.
export function simulateUpload(queue,request,outcome='ready'){
 const timers=[setTimeout(()=>queue.event({...request,loaded:1,total:2}),250),setTimeout(()=>queue.event({...request,result:outcome}),650)];
 return ()=>timers.forEach(clearTimeout);
}
