import json
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
root=Path.cwd();d=json.loads((root/'handoff/P12/evidence/revision-02/data.json').read_text(encoding='utf-8'))[0]
pdfmetrics.registerFont(TTFont('HN','C:/Windows/Fonts/arial.ttf'));pdfmetrics.registerFont(TTFont('HN-Bold','C:/Windows/Fonts/arialbd.ttf'))
styles=getSampleStyleSheet();styles.add(ParagraphStyle(name='HNBody',fontName='HN',fontSize=10,leading=15,textColor=colors.HexColor('#12384e')));styles.add(ParagraphStyle(name='HNTitle',fontName='HN-Bold',fontSize=20,leading=26,spaceAfter=16,textColor=colors.HexColor('#00597b')))
def p(s):return Paragraph(str(s),styles['HNBody'])
rows=[]
for kind,title in [('PhieuNhap','PHIẾU NHẬP KHO'),('BienBanKiemDem','BIÊN BẢN KIỂM ĐẾM')]:
 name=f'{kind}_PN-0005.pdf';file=root/'docs/flows/documents/assets'/name
 pdf=SimpleDocTemplate(str(file),pagesize=(595.28,841.89),rightMargin=42,leftMargin=42,topMargin=42,bottomMargin=44,title=title+' PN-0005',author='Hoa Nam - local test dataset',subject='Synthetic local test document; not a production WMS record')
 content=[Paragraph(title,styles['HNTitle']),p('Mã chứng từ: PN-0005'),p('Kho: Kho Hoa Nam'),p('Nhà cung cấp: Công ty Minh Phát'),p('Ngày chứng từ: 09/09/2026 08:32'),p('Người lập: Minh Anh'),p('Trạng thái: Chờ xử lý trên Web - chưa ghi sổ'),Spacer(1,20)]
 table=[[p('Sản phẩm'),p('SKU'),p('Số lượng'),p('ĐVT')]]
 for l in d['lines']:table.append([p(l['name']),p(l['sku']),p(l['quantity']),p(l['unit'])])
 t=Table(table,colWidths=[240,115,80,76]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eef6fa')),('LINEBELOW',(0,0),(-1,-1),.5,colors.HexColor('#dce9ef')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10)]));content +=[t,Spacer(1,16),p('Tổng cộng: 11 sản phẩm / 3 SKU'),Spacer(1,12),p(d['note'])]
 if kind=='BienBanKiemDem':
  content +=[Spacer(1,16),p('Serial đã đối chiếu:')]
  for l in d['lines']:content +=[p(l['sku']+': '+', '.join(l['serials']))]
 else:content +=[Spacer(1,18),p('Kết quả tiếp nhận: Bao bì nguyên vẹn; số lượng thực nhận khớp với các dòng chứng từ. Phiếu đã gửi lên Web để xử lý theo quy trình kho.')]
 def footer(c,doc):c.setFont('HN',9);c.setFillColor(colors.HexColor('#527186'));c.drawString(42,25,'Kho Hoa Nam | PN-0005');c.drawRightString(553,25,str(doc.page))
 pdf.build(content,onFirstPage=footer,onLaterPages=footer)
 reader=PdfReader(file);assert len(reader.pages)==1;assert 'PN-0005' in reader.pages[0].extract_text();rows.append({'file':name,'pages':len(reader.pages),'bytes':file.stat().st_size})
(root/'handoff/P12/evidence/revision-02/pdf-checks.json').write_text(json.dumps(rows,indent=2),encoding='utf-8');print(rows)
