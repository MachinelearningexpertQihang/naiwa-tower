#!/usr/bin/env python3
"""把 dist/ 打成 B站 Toy 安装包：一定要在 index.html 里加上 Toy SDK（没有它就没有云存档和排行榜）"""
import os, sys, shutil, zipfile, re, tempfile
ROOT=os.path.dirname(os.path.abspath(__file__)); DIST=os.path.join(ROOT,"dist")
out=sys.argv[1]
SDK='<script src="//s1.hdslb.com/bfs/seed/toy/app/sdk/toy-sdk.js"></script>'
tmp=tempfile.mkdtemp(); shutil.copytree(DIST,os.path.join(tmp,"p")); P=os.path.join(tmp,"p")
ip=os.path.join(P,"index.html"); h=open(ip,encoding="utf8").read()
if SDK not in h:
    assert h.count('<meta charset="utf-8">')==1
    h=h.replace('<meta charset="utf-8">','<meta charset="utf-8">'+SDK,1); open(ip,"w",encoding="utf8").write(h)
assert open(ip,encoding="utf8").read().count("toy-sdk.js")==1, "SDK 没加上"
if os.path.exists(out): os.remove(out)
with zipfile.ZipFile(out,"w",zipfile.ZIP_DEFLATED) as z:
    for dp,dn,fn in os.walk(P):
        dn.sort()
        rel=os.path.relpath(dp,P)
        if rel!=".": z.write(dp,rel+"/")
        for f in sorted(fn): z.write(os.path.join(dp,f),os.path.normpath(os.path.join(rel,f)))
z=zipfile.ZipFile(out); assert b"toy-sdk.js" in z.read("index.html"); print("ok",out,os.path.getsize(out)//1024,"KB",len(z.namelist()),"files")
