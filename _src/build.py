#!/usr/bin/env python3
"""奶蛙尖塔 打包：图片分块(<1MB)、字体子集、输出 dist/"""
import json, re, os, sys, shutil, glob, base64, io
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src"); DIST = os.path.join(ROOT, "dist")
FONTDIR = "/tmp/claude-0/-home-claude/e4bf23af-1bfe-54b2-8edd-5f9cf2c468ea/scratchpad/font/x/package/files"
dev = "--dev" in sys.argv

texts = "".join(open(os.path.join(SRC, f), encoding="utf8").read() for f in ["data.js", "game.js", "ui.js", "lines.js", "toy.js", "index.html"])
allimg = json.load(open(os.path.join(ROOT, "assets/_all.json")))
keys = set(re.findall(r'img:"(\w+)"', texts)) | set(re.findall(r'IMG\("(\w+)"\)', texts)) | set(re.findall(r'\["(\w+)","[^"]*",', texts)) | set(re.findall(r'ic:"(\w+)"', texts))
keys = sorted(k for k in keys if k in allimg or k.startswith("e_") or k.startswith("v_"))
print("images:", len(keys))
sys.path.insert(0, ROOT); import procimg
from PIL import Image
cache_p = os.path.join(ROOT, "assets/_proc2.json")
cache = json.load(open(cache_p)) if os.path.exists(cache_p) else {}
import recolor
for vk,(src,hh,sm,vm) in recolor.VAR.items():
    vp=os.path.join(ROOT,"sr/out",vk+".png")
    if not os.path.exists(vp): recolor.recolor(Image.open(os.path.join(ROOT,"sr/out",src+".png")),hh,sm,vm).save(vp)
BOSSES = set(re.findall(r'img:"(e_\w+)"[^}]{0,40}boss:1', texts))
print('bosses', sorted(BOSSES))
for k in keys:
    if k.startswith("e_"):
        srp = os.path.join(ROOT, "sr/out", k[2:] + ".png")
        if k not in cache:
            big = k in BOSSES
            cache[k] = [True, procimg.to_uri(procimg.proc(None, src=Image.open(srp), ol=((150,60,190,255),(30,10,40,255)), size=600 if big else 512, sharp=120 if big else 90), q=93 if big else 88)]
        continue
    srp = os.path.join(ROOT, "sr/out", k + ".png")
    if k in cache and cache[k][0] == os.path.exists(srp): continue
    if os.path.exists(srp): cache[k] = [True, procimg.to_uri(procimg.proc(None, src=Image.open(srp), size=600 if k in ('n1','m6') else 512, sharp=90), q=93 if k in ('n1','m6') else 88)]
    else: cache[k] = [False, procimg.to_uri(procimg.proc(allimg[k]))]
    missing_sr = not os.path.exists(srp)
    if missing_sr: print("  (no SR yet)", k)
json.dump(cache, open(cache_p, "w"))
allimg = {k: v[1] for k, v in cache.items()}

def write_imgs(out):
    chunks, cur, size = [], {}, 0
    for k in keys:
        v = allimg[k]
        if size + len(v) > 850_000 and cur:
            chunks.append(cur); cur, size = {}, 0
        cur[k] = v; size += len(v) + len(k) + 6
    if cur: chunks.append(cur)
    names = []
    for i, c in enumerate(chunks):
        n = f"img{i}.js"; names.append(n)
        with open(os.path.join(out, n), "w") as f:
            f.write("window.__NWT_IMG=Object.assign(window.__NWT_IMG||{}," + json.dumps(c, separators=(",", ":")) + ");")
    return names

def bad_glyphs(fp,chars):
    """找出画成实心黑块的坏字形（比如小薇体的「回」），让它们退回别的字体"""
    from fontTools.ttLib import TTFont
    from PIL import Image,ImageDraw,ImageFont
    f=TTFont(fp);f.flavor=None;buf=io.BytesIO();f.save(buf);buf.seek(0);ft=ImageFont.truetype(buf,64)
    cmap=f.getBestCmap() or {};bad=set()
    for c in chars:
        if ord(c)<0x2E80 or ord(c) not in cmap: continue
        im=Image.new("L",(80,80),0);ImageDraw.Draw(im).text((8,0),c,font=ft,fill=255);bb=im.getbbox()
        if not bb: continue
        cr=im.crop(bb);px=list(cr.getdata());fill=sum(1 for v in px if v>128)/len(px)
        if fill>0.62 and cr.size[0]>30 and cr.size[1]>30: bad.add(c)
    return bad
def extra_font(fam,pattern,chars):
    from fontTools.ttLib import TTFont
    from fontTools import subset
    remaining=set(chars);faces=[]
    for fp in sorted(glob.glob(pattern),key=lambda p:(0 if "simplified" in p else 1,p)):
        f=TTFont(fp);cmap=f.getBestCmap() or {}
        here={c for c in remaining if ord(c) in cmap}
        if fam=="ZCOOL XiaoWei" and here:
            bd=bad_glyphs(fp,here)
            if bd: print("  坏字形跳过:", "".join(sorted(bd))); here-=bd; remaining-=bd
        if not here: continue
        remaining-=here
        opt=subset.Options();opt.flavor="woff2";sub=subset.Subsetter(opt);sub.populate(unicodes=[ord(c) for c in here]);sub.subset(f)
        buf=io.BytesIO();f.flavor="woff2";f.save(buf)
        faces.append((buf.getvalue(),",".join("U+%X"%ord(c) for c in sorted(here))))
    return "".join("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}\n"%(fam,"600" if fam=="NW Serif" else "400",base64.b64encode(b).decode(),r) for b,r in faces)
FS2="/tmp/claude-0/-home-claude/e4bf23af-1bfe-54b2-8edd-5f9cf2c468ea/scratchpad/fonts2/node_modules/@fontsource/"
TITLE_TXT="奶蛙之塔壹零满月升起尖塔归来开始冒险继续重新卡牌首领图鉴成就音乐开关赞赏作者通关次记忆碎片云存档已开启正在连接登录后可层步第周目张泥沼回廊夜古堡冰封钟楼沸腾茶厂星空顶入口功夫骑士奶蛙0123456789/·，。！？「」"
def build_font(out):
    from fontTools.ttLib import TTFont
    from fontTools import subset
    chars = set(texts) | set("0123456789+-×/%：，。！？「」…（）·、ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ")
    chars = {c for c in chars if ord(c) >= 32}
    faces = []
    remaining = set(chars)
    for fp in sorted(glob.glob(os.path.join(FONTDIR, "*-400-normal.woff2"))):
        f = TTFont(fp); cmap = f.getBestCmap() or {}
        here = {c for c in remaining if ord(c) in cmap}
        if not here: continue
        remaining -= here
        opt = subset.Options(); opt.flavor = "woff2"; opt.layout_features = ["*"]
        sub = subset.Subsetter(opt); sub.populate(unicodes=[ord(c) for c in here]); sub.subset(f)
        buf = io.BytesIO(); f.flavor = "woff2"; f.save(buf)
        rng = ",".join("U+%X" % ord(c) for c in sorted(here))
        faces.append((buf.getvalue(), rng))
    css = "".join("@font-face{font-family:'ZCOOL KuaiLe';font-style:normal;font-weight:400;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}\n" % (base64.b64encode(b).decode(), r) for b, r in faces)
    css += extra_font("Zhi Mang Xing", FS2+"zhi-mang-xing/files/*-400-normal.woff2", "奶蛙之塔登顶倒下了")
    css2 = extra_font("ZCOOL XiaoWei", FS2+"zcool-xiaowei/files/*-400-normal.woff2", "".join(chars))
    css3 = extra_font("NW Serif", FS2+"noto-serif-sc/files/*-600-normal.woff2", "".join(chars))
    open(os.path.join(out, "font.css"), "w").write(css)
    open(os.path.join(out, "font2.css"), "w").write(css2)
    open(os.path.join(out, "font3.css"), "w").write(css3)
    print("font2 KB", len(css2)//1024, "font3 KB", len(css3)//1024)
    print("font faces:", len(faces), "css KB:", len(css) // 1024, "missing:", "".join(sorted(remaining))[:80])

out = SRC if dev else DIST
if not dev:
    shutil.rmtree(DIST, ignore_errors=True); os.makedirs(DIST)
    for f in ["data.js", "game.js", "lines.js", "toy.js", "music.js", "ui.js", "style.css", "zanshang.jpg"]:
        shutil.copy(os.path.join(SRC, f), DIST)
names = write_imgs(out)
html = open(os.path.join(SRC, "index.html"), encoding="utf8").read()
tags = "".join(f'<script src="{n}"></script>' for n in names)
html = re.sub(r'<script src="img\d+\.js"></script>(\s*<script src="img\d+\.js"></script>)*', tags, html)
open(os.path.join(SRC, "index.html"), "w", encoding="utf8").write(html)
if not dev: open(os.path.join(DIST, "index.html"), "w", encoding="utf8").write(html)
if "--nofont" not in sys.argv: build_font(out)
for f in sorted(os.listdir(out)):
    p = os.path.join(out, f)
    if os.path.isfile(p): print(f"  {f:14s} {os.path.getsize(p)//1024:5d} KB")

# cache-bust：给 index.html 里的文件加版本号
if not dev:
    import re as _re
    ver=_re.search(r'const VER="([^"]+)"',open(os.path.join(SRC,"game.js")).read()).group(1)
    ip=os.path.join(DIST,"index.html");h=open(ip).read()
    h=_re.sub(r'(src|href)="([\w.]+\.(?:js|css))"',lambda m:f'{m.group(1)}="{m.group(2)}?v={ver}"',h)
    open(ip,"w").write(h)
