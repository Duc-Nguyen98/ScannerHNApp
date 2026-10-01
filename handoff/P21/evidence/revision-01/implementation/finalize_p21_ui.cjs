const fs=require('node:fs');let p='docs/flows/warranty-components/resume-view.mjs',s=fs.readFileSync(p,'utf8');
s=s.replace("...ISSUE_ICONS,monitor:","...ISSUE_ICONS,refresh:'<path d=\"M20 7v5h-5M4 17v-5h5\"/><path d=\"M6.2 7a7 7 0 0 1 11.6-1L20 9M4 15l2.2 3A7 7 0 0 0 17.8 17\"/>',monitor:");
s=s.replace('Mã và checkpoint khớp nguồn','Mã đã lưu trên phiếu được xác minh');
s=s.replace("+btn('reload','Tải lại để xác minh')+btn('list','Về phiếu đang thực hiện','p19-link')","+btn('list','Về phiếu đang thực hiện')");
s=s.replace("${btn('identity','Xem định danh đối chiếu','p19-link')}","${post?'':btn('reload','Tải lại để xác minh','p19-link')}${btn('identity','Xem định danh đối chiếu','p19-link')}");
fs.writeFileSync(p,s);
