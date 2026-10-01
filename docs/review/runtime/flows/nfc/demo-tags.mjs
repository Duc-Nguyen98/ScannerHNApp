// Additional synthetic records requested by the user on 2026-09-27.
// Independent test identities; not product serials or tag mappings from WMS.
export function additionalDemoTags() {
 const products=[
  ['Máy quét mã vạch cầm tay','DEMO-SCAN-01'],
  ['Máy in tem vận đơn','DEMO-PRINT-02'],
  ['Giấy in nhiệt 57mm','DEMO-PAPER-57'],
  ['Bộ nguồn máy in','DEMO-POWER-01'],
  ['Đầu đọc mã vạch để bàn','DEMO-SCAN-02'],
  ['Cuộn tem nhãn sản phẩm','DEMO-LABEL-01'],
  ['Máy in tem công nghiệp dùng cho kiện hàng tại kho Hoa Nam','DEMO-PRINT-LONG'],
 ];
 return Array.from({length:25},(_,index)=>{
  const number=index+6,key=String(number).padStart(3,'0');
  const status=number<=19?'linked':number<=26?'unlinked':'locked';
  const [name,sku]=products[index%products.length];
  return {
   id:`fixture-tag-${key}`,label:`TAG-${key}`,uid:`NFC-DEMO-${key}`,
   status,product:status==='unlinked'?null:{
    id:`fixture-nfc-demo-item-${key}`,code:`DEMO-HN-${key}`,name,sku,
    serial:`SN-DEMO-${key}`,warehouseId:'fixture-hoa-nam',
   },
   date:`${String(10+index%18).padStart(2,'0')}/09/2026 ${String(8+index%9).padStart(2,'0')}:${index%2?'30':'15'}`,
  };
 });
}
