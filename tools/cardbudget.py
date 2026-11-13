# 卡牌预算检查：读 cards_raw.json（cardmeasure.js 实测），按预算表打分，输出超模/亏模名单
# 用法：python3 tools/cardbudget.py   → tools/card_budget.csv + 终端摘要
import json,re,csv,os,sys
H=os.path.dirname(os.path.abspath(__file__))
R=json.load(open(os.path.join(H,'cards_raw.json'),encoding='utf8'))
# ---- 预算表（单位：分，1 点伤害 = 1 分）----
BASE={0:5,1:9,2:25,3:39}          # 家族牌、普通稀有度、非专属的基准
LINEAR={0:5,1:9,2:18,3:27}        # 抽牌/奶力为主的牌：不吃 2、3 费加价
XCOST=27                          # X 费按 3 奶力算
NOFAM=1.4                         # 无家族牌：吃不到三连，预算 ×1.4
RAR={'S':.67,'C':1,'R':1.1,'E':1.2,'L':1.3,'Q':1.35,'X':1.1,'P':1.1,'G':1.2}
HERO=1.1; SPELL=1.3; EXH=1.3; ETH=1.15; UPG=1.3
# ---- 效果换算（每点/每层多少分）----
V=dict(dmg=1,aoe=1.5,blk=1.2,heal=1.8,draw=4,en=8,mana=3,maxhp=4,self=-1.2,gold=.1,pool=2,anqi=5,egg=6,ret=2)
SELF={'str':7,'dex':5,'tstr':3,'thorn':1.5,'nextAtk':1,'nextBlock':1.2,'nextSpell':1,'evade':4,'dodge':1,'mana':3}
EN={'vuln':3,'weak':3,'frost':3,'burn':2,'bleed':2,'poison':2.5,'inj':3,'brk':2,'wet':1,'para':3,'night':2,'mud':2,'stun':8}
COND=re.compile(r'护盾 ?\d+%|下回合|雷雨|下雪|刮风|新月|下弦|晴|闪开|有易伤|有中毒|有烫伤|等级|×|次数|本回合|已损失|对首领|孵化|金币|经验|选 1|最贵|弃掉|抓|蛋|上弦|满月|变成|复制|升级|消耗掉|手牌|如果|若|时，|时,|时 |连击|≥|每有|每张|每层|当|护盾的|你护盾|护盾一|和你护盾|随机|池|三连|消除|家族|魔力×|层数|一半|翻倍|下次|打出过')
def score(r):
    sc=0;parts=[];unk=[]
    d=r['dmg'];aoe_like=bool(re.search(r'所有敌人|全体|每个敌人',r['d']))
    tot=sum(d.values())
    if aoe_like and len(d)>1: dv=max(d.values())*V['aoe']
    else: dv=tot
    dv+=r['aoe']*V['aoe']
    if r.get('spell') and dv:dv*=SPELL   # 法术吃魔力、无视护盾
    if dv:sc+=dv;parts.append('伤%g'%dv)
    for k in ('blk','heal','draw','en','mana','maxhp','gold','pool','anqi','egg'):
        if r[k]:v=r[k]*V[k];sc+=v;parts.append('%s%g'%(k,v))
    if r['self']:v=r['self']*V['self'];sc+=v;parts.append('扣血%g'%v)
    for k,v in r['st'].items():
        if k in SELF:x=v*SELF[k];sc+=x;parts.append('%s%g'%(k,x))
        else:unk.append('自'+k)
    for k,m in r['est'].items():
        n=len(m);per=max(m.values())
        if k in EN:x=per*EN[k]*(V['aoe'] if n>1 else 1);sc+=x;parts.append('敌%s%g'%(k,x))
        else:unk.append('敌'+k)
    if r['ret']:sc+=V['ret']
    return sc,parts,unk
def budget(r,util):
    c=r['cost']
    if c==-1:b=XCOST
    else:b=(LINEAR if util else BASE).get(c)
    if b is None:return None
    m=1
    if r['fam']=='none' and not r.get('spell'):m*=NOFAM   # 魔法师法术会进池，不算无家族
    m*=RAR.get(r['r'],1)
    if r['hero']:m*=HERO
    if r['exh']:m*=EXH
    if r['eth']:m*=ETH
    if r['u']:m*=UPG
    return b*m
rows=[]
for r in R:
    if r['cost']==-2 or r['type'] in('cur','sts') or r['r'] in('K','T'):continue
    sc,parts,unk=score(r)
    util=(r['draw']*V['draw']+r['en']*V['en'])>=sc*.5 and sc>0
    b=budget(r,util)
    if not b:continue
    flags=[]
    if r['type']=='pow' or r['pw']:flags.append('能力牌')
    if COND.search(r['d']):flags.append('有条件')
    if re.search(r'伤害 ?(\d+) ?次',r['d']) and int(re.search(r'伤害 ?(\d+) ?次',r['d']).group(1))>=3:flags.append('多段')
    if unk:flags.append('未计:'+'/'.join(unk))
    if r['err']:flags.append('出错')
    if sc<=0:flags.append('算不出')
    rows.append(dict(id=r['id'],n=r['n'],u=r['u'],cost=r['cost'],type=r['type'],r=r['r'],fam=r['fam'],hero=r['hero'],exh=int(r['exh']),val=round(sc,1),bud=round(b,1),ratio=round(sc/b,2) if b else 0,parts=' '.join(parts),flags=' '.join(flags),d=r['d']))
with open(os.path.join(H,'card_budget.csv'),'w',newline='',encoding='utf-8-sig') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0].keys()));w.writeheader();w.writerows(rows)
base=[x for x in rows if x['u']==0]
clean=[x for x in base if not any(k in x['flags'] for k in('能力牌','算不出','出错'))]
over=sorted([x for x in clean if x['r']!='P' and '弃掉所有手牌' not in x['d']],key=lambda x:-x['ratio'])
under=sorted([x for x in clean if not any(k in x['flags'] for k in ('有条件','未计','多段'))],key=lambda x:x['ratio'])
manual=[x for x in base if x not in clean]
pal=sorted([x for x in clean if x['r']=='P'],key=lambda x:-x['ratio'])
json.dump(dict(pal=pal,over=over[:30],under=under[:30],manual=manual,n=len(base),clean=len(clean),
  n_over=sum(1 for x in clean if x['ratio']>1.25),n_under=sum(1 for x in clean if x['ratio']<.8 and '有条件' not in x['flags']),
  n_ok=sum(1 for x in clean if .8<=x['ratio']<=1.25)),open(os.path.join(H,'summary.json'),'w',encoding='utf8'),ensure_ascii=False)
print('牌',len(base),'能算',len(clean),'超模',sum(1 for x in clean if x['ratio']>1.25),'合理',sum(1 for x in clean if .8<=x['ratio']<=1.25),'亏模(无条件)',sum(1 for x in clean if x['ratio']<.8 and '有条件' not in x['flags']),'人工',len(manual))
for x in over[:30]:print('OVER',x['ratio'],x['n'],x['cost'],x['r'],x['fam'],x['hero'],x['parts'],'|',x['flags'],'|',x['d'][:40])
for x in under[:30]:print('UNDER',x['ratio'],x['n'],x['cost'],x['r'],x['fam'],x['hero'],x['parts'],'|',x['flags'],'|',x['d'][:40])
