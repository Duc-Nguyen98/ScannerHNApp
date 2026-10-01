import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
root=Path.cwd();ev=root/'handoff/P12/evidence/revision-04';d=json.loads((ev/'export-data.json').read_text(encoding='utf-8'))
pdfmetrics.registerFont(TTFont('HN','C:/Windows/Fonts/arial.ttf'));pdfmetrics.registerFont(TTFont('HN-Bold','C:/Windows/Fonts/arialbd.ttf'))
styles=getSampleStyleSheet();styles.add(ParagraphStyle(name='HNBody',fontName='HN',fontSize=10,leading=15,textColor=colors.HexColor('#203f60')));styles.add(ParagraphStyle(name='HNTitle',fontName='HN-Bold',fontSize=20,leading=26,spaceAfter=16,textColor=colors.HexColor('#006887')))
def p(s):return Paragraph(escape(str(s)),styles['HNBody'])
results=[]
for attachment in d['attachments']:
 file=root/'docs/flows/documents/assets'/attachment['name'];title=attachment['title']
 pdf=SimpleDocTemplate(str(file),pagesize=(595.28,841.89),rightMargin=42,leftMargin=42,topMargin=42,bottomMargin=44,title=title+' '+d['number'],author='Hoa Nam - local test dataset',subject='Synthetic local test data, not a production WMS record')
 content=[Paragraph(title.upper(),styles['HNTitle']),p('Mã chứng từ: '+d['number']),p('Kho: '+d['warehouse']),p('Đối tác nhận hàng: '+d['partner']),p('Ngày chứng từ: '+ '/'.join(d['day'].split('-')[::-1])+' '+d['time']),p('Người lập: '+d['actor']),p('Trạng thái: Đã ghi sổ'),Spacer(1,20)]
 rows=[[p('Sản phẩm'),p('SKU'),p('Số lượng'),p('ĐVT')]]
 for l in d['lines']:rows.append([p(l['name']),p(l['sku']),p(l['quantity']),p(l['unit'])])
 t=Table(rows,colWidths=[240,115,80,76]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#f7fbfe')),('LINEBELOW',(0,0),(-1,-1),.5,colors.HexColor('#dce9ef')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10)]))
 content +=[t,Spacer(1,16),p('Tổng cộng: '+str(sum(l['quantity'] for l in d['lines']))+' sản phẩm / '+str(len(d['lines']))+' SKU'),Spacer(1,12),p('Ghi chú: '+d['note'])]
 if attachment['kind']=='handover':
  content +=[Spacer(1,16),p('Danh sách serial giao nhận:')]
  for l in d['lines']:content +=[p(l['sku']+': '+', '.join(l['serials']))]
 else:content +=[Spacer(1,18),p('Số lượng và serial được đối chiếu theo các dòng chứng từ trên. Vui lòng sử dụng cùng mã PX-0011 khi tra cứu tài liệu giao nhận.')]
 def footer(c,doc):c.setFont('HN',9);c.setFillColor(colors.HexColor('#526b7d'));c.drawString(42,25,'Kho Hoa Nam | '+d['number']);c.drawRightString(553,25,str(doc.page))
 pdf.build(content,onFirstPage=footer,onLaterPages=footer)
 reader=PdfReader(file);text='\n'.join(p.extract_text() for p in reader.pages);assert len(reader.pages)==1;assert d['number'] in text;assert d['partner'] in text;assert '7 sản phẩm / 2 SKU' in text
 results.append({'file':attachment['name'],'pages':1,'bytes':file.stat().st_size,'text_valid':True})
(ev/'pdf-checks.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8');print(results)
