# 按预算表自动调牌：超模的往 1.15 压，亏模的往 0.95 抬。只动 U(u,a,b) 里 ≥4 的数（伤害/护盾/回血），小数字（抽牌、层数、奶力）不动。
# 用法：python3 tools/rebalance.py <pass号>   会改 src/data.js，并把改动记到 tools/rebalance_log.json
import json,re,csv,os,sys,math
H=os.path.dirname(os.path.abspath(__file__));SRC=os.path.join(H,'../src/data.js')
PASS=int(sys.argv[1]) if len(sys.argv)>1 else 1
rows={r['id']:r for r in csv.DictReader(open(os.path.join(H,'card_budget.csv'),encoding='utf-8-sig')) if r['u']=='0'}
s=open(SRC,encoding='utf8').read()
LOG=os.path.join(H,'rebalance_log.json');log=json.load(open(LOG,encoding='utf8')) if os.path.exists(LOG) else {}
SKIP_R={'S','Q','K','T'}
MANUAL={'yarnball','croak2','deepbreath','catwalk','catnap','t_nap','bigtea','c_featherwall','ultimate','frogdance'}
def spans(cid):
    out=[]
    for m in re.finditer(r'(?<![\w$.])'+re.escape(cid)+r':\{n:"',s):
        i=m.end()-len('{n:"');d=0;j=i
        while j<len(s):
            c=s[j]
            if c=='{':d+=1
            elif c=='}':
                d-=1
                if d==0:break
            j+=1
        out.append((i,j+1))
    return out
def pick(r):
    x=float(r['ratio']);f=r['flags']
    if r['r'] in SKIP_R or r['id'] in MANUAL:return None
    if any(k in f for k in('能力牌','算不出','出错')):return None
    if x>1.25 and (r['r']!='P' or x>1.6):return (1.35 if r['r']=='P' else 1.15)/x
    if PASS>1 and x>1.3 and r['id'] in log:return 1.15/x
    if x<.8 and not any(k in f for k in('有条件','未计','多段')):return .95/x
    return None
def sc(n,f):return max(1,int(math.floor(n*f+.5)))
changed=0;nochg=[]
for cid,r in rows.items():
    f=pick(r)
    if not f:continue
    f=max(.6,min(1.6,f))
    sp=spans(cid)
    if not sp:continue
    hit=False
    for (i,j) in sorted(sp,reverse=True):
        seg=s[i:j]
        def rep(m):
            nonlocal_hit[0]=True
            a,b=int(m.group(1)),int(m.group(2))
            if a<4:return m.group(0)
            na,nb=sc(a,f),sc(b,f)
            if nb<=na:nb=na+max(1,round((b-a)*f))
            return f'U(u,{na},{nb})'
        nonlocal_hit=[False]
        seg2=re.sub(r'U\(u,(\d+),(\d+)\)',rep,seg)
        if seg2!=seg:
            s=s[:i]+seg2+s[j:];hit=True
    if hit:
        changed+=1;e=log.setdefault(cid,{'n':r['n'],'before':r['d'],'r0':r['ratio']});e['f%d'%PASS]=round(f,2)
    else:nochg.append((r['n'],r['ratio']))
open(SRC,'w',encoding='utf8').write(s)
json.dump(log,open(LOG,'w',encoding='utf8'),ensure_ascii=False,indent=0)
print('pass',PASS,'changed',changed,'no-scalable',len(nochg));print(nochg[:60])
