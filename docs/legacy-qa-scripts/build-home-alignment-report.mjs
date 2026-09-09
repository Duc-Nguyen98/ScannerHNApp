import {readFile,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {chromium} from 'file:///C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root='artifacts/scanner-home-alignment',before=JSON.parse(await readFile(root+'/before/qa.json','utf8')),after=JSON.parse(await readFile(root+'/after/qa.json','utf8'));
const rows=after.map((a,i)=>`| ${a.width===1440?'Desktop1440 (app390)':a.width} | ${before[i].geometry.delta.labelY.toFixed(2)} → ${a.geometry.delta.labelY} | ${before[i].geometry.delta.metaX.toFixed(2)} → ${a.geometry.delta.metaX} | ${a.result} |`).join('\n');
const report=`# Home alignment fix

Ngày09/09/2026. Phạm vi: hai vùng đỏ trong ảnh6 mới nhất. Chỉ sửa \`components/scanner-home.css\`, thêm QA/evidence. Không đổi mock, dữ liệu store, auth, RBAC, navigation hay nghiệp vụ.

## Nguyên nhân

1. Mỗi KPI dùng luồng block riêng; số1/4 dùng26px, giờ dùng19px và icon khác cỡ, nên vùng số/giờ có chiều cao khác nhau. Nhãn phía dưới lệch5.17–7.09px tùy viewport. Ở434px là6.27px.
2. Mỗi chứng từ tự tính cột metadata bằng \`max-content\`. Ngày dùng chữ số proportional và badge dài/ngắn khác nhau tạo cột rộng khác nhau; mép trái lệch6.81–9.34px. Ở434px là8.22px.

## Cách sửa

- Tất cả KPI dùng cùng hai grid tracks: hàng giá trị29×scale, gap7×scale, nhãn bắt đầu ở cùng tọa độY. Không dùng margin bù riêng cho “Ca bắt đầu”.
- Danh sách khai báo duy nhất \`--sh-record-meta-width\`; mỗi hàng dùng cùng độ rộng metadata72×scale. Ngày/giờ và badge căn trái cùng cột; chevron có track riêng, không bị nội dung đẩy.
- Ngày giờ dùng \`font-variant-numeric: tabular-nums\`, chiều rộng không thay đổi theo chữ số.
- Kích thước vẫn lấy từ app viewport được đo, không lấy chiều rộng cửa sổ desktop. Giữ nguyên cỡ chữ, dữ liệu và action.
- Đường ngăn giữa chứng từ dùng inset shadow không chiếm kích thước layout, loại bỏ chênh lệch chiều cao/offset nội dung do border-top ở riêng hàng2–3.

## Tọa độ đo trực tiếp — CSS px

| Viewport width | ΔY nhãn KPI trước → sau | ΔX metadata trước → sau | Result |
|---|---:|---:|---|
${rows}

Ngoài hai số trong bảng, QA assert cả label bottom, value row top/height, metadata width, timeX, badgeX, chevronX, chiều cao các hàng và offsetY của ngày/badge so với hàng với ngưỡng≤0.1px. Tất cả chênh lệch sau sửa đều0px trong các bản chụp chuẩn.

## Kiểm thử

- 6 kích thước:360×800,390×844,430×932,434×914 (khung gần ảnh đánh dấu),494×1024 và desktop1440×1000 chứa app390.
- Thử đổi DOM trong browser QA sang số128, ngày11/11 11:11 và28/08 20:08, trạng tháiĐã huỷ: các cột giữ vị trí. Không lưu các giá trị stress này vào store.
- Reload vẫn thẳng hàng; dữ liệu08:30 và ba bản ghi approved giữ nguyên.
- Mở ba record đi đúng PN-0001/PX-0004/BH-001; nhấn hai KPI đi đúng danh sách. Store không đổi sau các thao tác đọc.
- Last row cuộn lên trên nav; chiều cao420px vẫn truy cập được. Global scanner sheet vẫn contained và có thể đóng bằngEscape.
- 0 console/page errors; 0 axe WCAG A/AA violations ở6 viewport. Đây là kiểm tra tự động, không thay thế kiểm thử screen reader trên thiết bị thật.
- Hashes JS/TS/domain/entry/launcher/shell/nav trước và sau giống nhau; chỉ Home CSS đổi.
- Standalone build và TypeScript scanner PASS.

## Evidence

- [Before/After](index.html)
- [QA trước](before/qa.json), [QA sau](after/qa.json)
- [Ảnh434 so sánh](comparison-434.png)
- [Ảnh390 sau sửa](after/390-home.png)

Kết luận: **PASS — hai lỗi căn hàng đã sửa và được đo kiểm**. Không suy rộng thành toàn bộ Visual Lock P01–P03 PASS. Không chạyP04; không commit/push/deploy.
`;
await writeFile(root+'/HOME_ALIGNMENT_FIX_REPORT.md',report.replaceAll('\\`','`'));
const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Home alignment — Before / After</title><style>body{margin:0;background:#edf5f8;color:#193b49;font:14px/1.6 system-ui}main{max-width:1060px;margin:auto;padding:24px}a{color:#0c6286}.pass{padding:16px;background:#e3f6eb;border-radius:12px}section{background:#fff;border-radius:12px;padding:16px;margin:24px 0}.pair{display:flex;gap:24px;overflow:auto}figure{margin:0;flex:none}figcaption{font-weight:650;padding:8px 0}img{display:block}table{border-collapse:collapse}td,th{padding:8px 16px;border:1px solid #d6e3ea;text-align:left}</style><main><h1>Trang chủ — sửa căn hàng KPI và metadata</h1><div class="pass">PASS: độ lệch sau sửa0px ở6 kích thước kiểm thử. Dữ liệu/luồng nghiệp vụ không đổi.</div><p><a href="http://127.0.0.1:4174/WMS_UIUX_HoaNamv2/app-scanner/?v=alignment-1#home">Mở app cập nhật</a> · <a href="HOME_ALIGNMENT_FIX_REPORT.md">Báo cáo</a> · <a href="after/qa.json">Số đo chi tiết</a></p><table><tr><th>Width</th><th>ΔY KPI</th><th>ΔX metadata</th></tr>${after.map((a,i)=>`<tr><td>${a.width}</td><td>${before[i].geometry.delta.labelY.toFixed(2)} → ${a.geometry.delta.labelY}px</td><td>${before[i].geometry.delta.metaX.toFixed(2)} → ${a.geometry.delta.metaX}px</td></tr>`).join('')}</table>${[434,390,360,430].map(w=>`<section><h2>${w}px — Before / After</h2><div class="pair" id="pair-${w}"><figure><figcaption>BEFORE</figcaption><img src="before/${w}-home.png" width="${w}" alt="Home trước sửa${w}"></figure><figure><figcaption>AFTER</figcaption><img src="after/${w}-home.png" width="${w}" alt="Home sau sửa${w}"></figure></div></section>`).join('')}</main></html>`;
await writeFile(root+'/index.html',html);const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1120,height:1060}});await p.goto(pathToFileURL(resolve(root+'/index.html')).href);await p.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode())));await p.locator('#pair-434').screenshot({path:root+'/comparison-434.png'});}finally{await b.close();}
