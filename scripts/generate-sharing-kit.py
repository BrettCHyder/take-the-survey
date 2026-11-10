"""Generate exact-text share assets. Dev tools: Pillow, qrcode, zxing-cpp; ffmpeg for video.
Run from the repository root. No runtime dependencies or payment configuration change.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import qrcode, zxingcpp, subprocess, tempfile
P=Path(__file__).resolve().parents[1]/'public'
URL='https://onedollarsurvey.com/'
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=12,border=4)
qr.add_data(URL);qr.make(fit=True);qrim=qr.make_image(fill_color='#222720',back_color='white').convert('RGB')
assert zxingcpp.read_barcode(qrim).text==URL
qrim.save(P/'survey-qr.png',optimize=True)
def text(d,xy,t,size=32,bold=False,color='#222720'):
 f=ImageFont.truetype(BOLD if bold else FONT,size)
 assert d.textbbox(xy,t,font=f)[2] < 1040,(t,size)
 d.text(xy,t,font=f,fill=color)
def canvas():
 im=Image.new('RGB',(1080,1920),'#f6f5ef');d=ImageDraw.Draw(im)
 text(d,(70,115),'one dollar survey',32,True)
 d.line((70,190,1010,190),fill='#d9dbd0',width=2)
 text(d,(70,1750),'OneDollarSurvey.com',36,True)
 return im,d
poster=Image.new('RGB',(1080,1080),'#f6f5ef');d=ImageDraw.Draw(poster)
text(d,(65,50),'one dollar survey',27,True)
for i,line in enumerate(['Would you pay a dollar','to take this survey?']):text(d,(65,135+i*65),line,63,True)
text(d,(65,310),'No is free. Yes really costs $1.',32)
poster.paste(qrim.resize((410,410),Image.Resampling.NEAREST),(65,400))
text(d,(520,475),'One question.',32,True);text(d,(520,535),'No subscription.',27);text(d,(520,585),'No prize.',27)
text(d,(65,880),'Scan to answer or see the results.',30)
text(d,(65,955),'OneDollarSurvey.com',37,True)
assert zxingcpp.read_barcode(poster).text==URL
poster.save(P/'qr-card.png',optimize=True)
# Three readable four-second cards. The video has no music or third-party media.
with tempfile.TemporaryDirectory(prefix='survey-video-') as tmp:
 t=Path(tmp)
 im,d=canvas();text(d,(70,355),'This survey has',74,True);text(d,(70,460),'ONE question.',88,True)
 text(d,(70,690),'That is the whole thing.',42)
 text(d,(70,850),'No follow-up questions.',32,color='#68735c');text(d,(70,910),'No big reveal.',32,color='#68735c')
 text(d,(70,1330),'No is free.',44,True);text(d,(70,1410),'Yes costs a real $1.',44,True)
 im.save(t/'one.png')
 im,d=canvas()
 for i,line in enumerate(['Would you pay','a dollar to take','this survey?']):text(d,(70,390+i*108),line,82,True)
 text(d,(70,840),'A mildly questionable use of a dollar.',34)
 text(d,(70,1290),'No is free. Yes costs $1.',40,True)
 im.save(t/'two.png')
 im,d=canvas();text(d,(70,320),'Your answer.',80,True)
 for y,left,right in [(540,'Yes.','$1'),(710,'No.','FREE')]:
  d.rounded_rectangle((70,y,1010,y+130),radius=14,fill='#edf2e4' if left=='Yes.' else '#ffffff',outline='#a9c86f',width=2)
  text(d,(100,y+31),left,50,True);text(d,(800,y+41),right,35,True)
 text(d,(70,925),'No subscription. No prize.',32)
 im.paste(qrim.resize((410,410),Image.Resampling.NEAREST),(70,1110))
 text(d,(530,1200),'Scan to answer',29,True);text(d,(530,1250),'or just watch',29);text(d,(530,1300),'the results.',29)
 assert zxingcpp.read_barcode(im).text==URL
 im.save(t/'three.png')
 (t/'frames.txt').write_text("file 'one.png'\nduration 4\nfile 'two.png'\nduration 4\nfile 'three.png'\nduration 4\nfile 'three.png'\n")
 subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(t/'frames.txt'),'-t','12','-vf','fps=24','-c:v','libx264','-preset','fast','-crf','26','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(P/'survey-short.mp4')],check=True)
print('Generated QR assets; QR, poster and video end card independently decoded to '+URL)
