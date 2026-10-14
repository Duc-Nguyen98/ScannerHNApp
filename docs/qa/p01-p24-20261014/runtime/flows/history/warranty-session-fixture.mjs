// B23-only opt-in fixture. PQ-0001 here is NOT the legacy B08 session.
export function sessionFixture(warehouseId,mode='unavailable'){
 if(mode==='unavailable')return {available:false};
 if(mode==='error')throw Error('PREVIEW_READ_ERROR');
 const event=(sessionId,n,code,time,quantity)=>({id:'B23-'+sessionId+'-E'+n,sessionId,code,time,quantity,result:'accepted'});
 const base={confirmed:true,warehouseId,warehouse:'Kho Hoa Nam',actor:'Minh Anh',day:'2026-09-10',sessionStatus:'Đã kết thúc',rejected:0,duplicate:0};
 const items=[
  {...base,id:'PQ-0003',type:'Xuất linh kiện',time:'14:30 – 14:45',result:'POSTED',doc:'XLK-0002',caseId:'BH-001',linkedReceiptId:'XLK-0002',accepted:2,quantity:3,events:[event('PQ-0003',1,'LK0001-HN001','14:31',1),event('PQ-0003',2,'BOX-LK-0002-01','14:33',2)]},
  {...base,id:'PQ-0002',type:'Nhập kho',time:'11:10 – 11:25',result:'RECORDED',doc:'PN-0005',accepted:12,quantity:null,events:null},
  {...base,id:'PQ-0001',type:'Tra cứu',time:'09:00 – 09:08',result:'ENDED',doc:null,accepted:5,quantity:null,events:null}
 ];
 if(mode==='long')for(const r of items){r.actor='Minh Anh — Tiếng Việt <>& 🌸\n'+('Tên người thao tác dài '.repeat(150));if(r.events)r.events[0].code='MÃ<>&🌸'+('ABC'.repeat(120));}
 if(mode==='missing'){items[0].accepted=null;items[0].rejected=null;items[0].quantity=null;items[0].duplicate=null;items[0].result=null;}
 return {available:true,confirmed:true,complete:true,items:mode==='empty'?[]:items};
}
