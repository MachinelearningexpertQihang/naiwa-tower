"""音效库：Kenney CC0 采样 → src/sx.js（base64 mp3）+ 每个采样的归一化增益。
已有的旧采样保留，新采样从本地素材包编码。可重复运行。"""
import subprocess,base64,json,re,os,glob,sys,struct,math
ROOT='/home/claude/naiwa-tower';DL='/home/claude/work/dl';TMP='/tmp/claude-0/-home-claude/e4bf23af-1bfe-54b2-8edd-5f9cf2c468ea/scratchpad/sxb';os.makedirs(TMP,exist_ok=True)
K=DL+'/kis/addons/kenney impact sounds/';R=DL+'/rpg/addons/kenney rpg audio/';SF=DL+'/kenney-sci-fi-sounds-for-godot/addons/kenney sci-fi sounds/'
def seq(base,idx,fmt='%s_%03d.ogg'):return [fmt%(base,i) for i in idx]
NEW={ # key:[(file, max_seconds)]
 'punch':[(K+f,.35) for f in seq('impact_punch_medium',range(5))],
 'punchH':[(K+f,.45) for f in seq('impact_punch_heavy',range(5))],
 'thud':[(K+f,.2) for f in seq('impact_soft_medium',range(5))],
 'body':[(K+f,.5) for f in seq('impact_soft_heavy',range(3))],
 'slash':[(R+'knife_slice.ogg',.5),(R+'knife_slice_2.ogg',.5),(R+'chop.ogg',.24)],
 'schwing':[(R+'draw_knife_%d.ogg'%i,.48) for i in (1,2,3)],
 'whoosh':[(R+'cloth_%d.ogg'%i,.5) for i in (1,2,3,4)],
 'clank':[(K+'impact_metal_medium_000.ogg',.3),(K+'impact_metal_medium_003.ogg',.3),(K+'impact_metal_light_003.ogg',.4)],
 'clankH':[(K+'impact_metal_heavy_001.ogg',.36),(K+'impact_metal_heavy_003.ogg',.25)],
 'glass':[(K+f,.5) for f in seq('impact_glass_medium',range(3))],
 'glassH':[(K+f,.6) for f in seq('impact_glass_heavy',range(3))],
 'rock':[(K+f,.7) for f in seq('impact_mining',range(3))],
 'boomx':[(SF+f,.95) for f in seq('explosion_crunch',range(3))],
 'sub':[(SF+'low_frequency_explosion_001.ogg',1.0),(SF+'low_frequency_explosion_000.ogg',1.2)],
 'slime':[(SF+'slime_000.ogg',.5)],
 'firew':[(SF+'thruster_fire_000.ogg',.7),(SF+'thruster_fire_002.ogg',.7)],
 'flip':[(R+'book_flip_2.ogg',.4),(R+'book_flip_3.ogg',.23),(R+'book_flip_1.ogg',.45)],
 'place':[(R+'book_place_%d.ogg'%i,.3) for i in (1,2,3)],
 'coins':[(R+'handle_coins_2.ogg',.34),(R+'handle_coins.ogg',.6)],
 'knock':[(K+f,.3) for f in seq('impact_wood_medium',range(3))],
 'tick':[(K+f,.14) for f in seq('impact_generic_light',range(3))],
}
def pcm(path):
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',path,'-ac','1','-ar','22050','-f','f32le','-'])
    n=len(raw)//4;return struct.unpack('<%df'%n,raw)
def stats(path):
    x=pcm(path);pk=max(1e-6,max(abs(v) for v in x));w=int(.05*22050);sq=[v*v for v in x];acc=sum(sq[:w]);best=acc
    for i in range(w,len(sq)):
        acc+=sq[i]-sq[i-w]
        if acc>best:best=acc
    rms=math.sqrt(best/w);return pk,rms,len(x)/22050
src=open(ROOT+'/src/sx.js',encoding='utf8').read()
old=dict(re.findall(r'"([a-zA-Z_0-9]+)": ?"([A-Za-z0-9+/=]+)"',src))
newkeys=set()
for k,L in NEW.items():
    for i in range(len(L)):newkeys.add(f'{k}{i}')
# 旧库里以前由本脚本生成的同名键丢掉重做；手工加的旧键（没有数字结尾或不在 NEW 里）保留
bank={k:v for k,v in old.items() if k not in newkeys and not re.match(r'^(plate|latch|clank|clankH)\d$',k)}
for k,L in NEW.items():
    for i,(f,t) in enumerate(L):
        assert os.path.exists(f),f
        out=f'{TMP}/{k}{i}.mp3'
        subprocess.check_call(['ffmpeg','-v','error','-y','-i',f,'-ac','1','-ar','44100','-t',str(t),'-af',f'afade=t=out:st={max(0,t-.06):.3f}:d=0.06','-b:a','48k',out])
        bank[f'{k}{i}']=base64.b64encode(open(out,'rb').read()).decode()
gains={};rep=[]
for k,v in bank.items():
    p=f'{TMP}/_{k}.mp3';open(p,'wb').write(base64.b64decode(v));pk,rms,dur=stats(p)
    g=min(12,.9/pk,.28/max(rms,1e-4));gains[k]=round(g,2);rep.append((k,round(dur,2),round(pk,2),round(rms,3),gains[k]))
js='/* 音效：Kenney 公开授权（CC0）真实音效。SXG 是把每个采样的峰值拉平用的增益 */window.__NWT_SX={'+','.join(f'"{k}": "{v}"' for k,v in bank.items())+'};window.__NWT_SXG='+json.dumps(gains,separators=(',',':'))+';'
open(ROOT+'/src/sx.js','w',encoding='utf8').write(js)
print(len(bank),'samples',len(js)//1024,'KB')
for r in rep:print(*r)
