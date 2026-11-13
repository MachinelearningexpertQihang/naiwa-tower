// 卡牌数值实测：在真实战斗里把每张牌的效果跑一遍，记录它实际给了什么（不改任何牌）
// 用法：node tools/cardmeasure.js [dist目录] [输出json]
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const DIST=path.resolve(process.argv[2]||path.join(__dirname,'../dist'));const OUT=process.argv[3]||path.join(__dirname,'cards_raw.json');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
p.on('pageerror',e=>{});p.on('dialog',d=>d.dismiss());
await p.goto('file://'+DIST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,trainBase:1,train:{naiwa:1,kungfu:1,knight:1,mage:1,vamp:1}}))});await p.reload();await p.waitForTimeout(1200);
await p.evaluate(()=>{newRun();const o=$('#ov');o.classList.remove('on');o.innerHTML='';$('#talk').classList.remove('on');__dbg.startCombat('m')});await p.waitForTimeout(1500);
const res=await p.evaluate(async()=>{
 const strip=x=>String(x).replace(/<[^>]+>/g,'');const out=[];
 const tpl=ENEMY[B.enemies[0].id];
 const mkE=i=>({...B.enemies[0],k:'E'+i,hp:5000,max:5000,block:0,str:0,vuln:0,weak:0,poison:0,poisonT:0,burn:0,bleed:0,frost:0,intent:{k:"atk",v:10}});
 const ST=['str','dex','tstr','vuln','weak','poison','burn','bleed','frost','thorns','mana','mud','stun','frz','nextAtk','nextSpell','nextBlock','warm','regen','plated','artifact','dodge','night','rage'];
 const ids=Object.keys(CARDS);
 for(const id of ids){const D=CARDS[id];if(!D||typeof D.fx!=='function')continue;
  for(const u of [0,1]){
   const rec={id,u,n:D.n,cost:D.cost,type:D.type,r:D.r,fam:D.fam,hero:D.hero||'',exh:!!(D.exh||(D.exhU&&!u)),ret:!!D.ret,eth:!!(D.eth||D.vo),spell:!!D.spell,ls:!!D.ls,d:'',dmg:{},aoe:0,blk:0,heal:0,draw:0,en:0,mana:0,self:0,gold:0,maxhp:0,pool:0,anqi:0,egg:0,pw:[],st:{},est:{},calls:{},err:''};
   try{rec.d=strip(D.d(u))}catch(e){rec.d='?'}
   try{
    B.over=false;B.myTurn=true;B.turn=2;B.enemies=[mkE(0),mkE(1),mkE(2)];B.pool=[];B.eggs=[];B.after=[];B.bonus=0;B.shinyPow=0;B.curFam=D.fam;B.curType=D.type;B.curSpell=D.spell||null;
    S.hero=D.hero||'naiwa';S.hp=60;S.max=80;S.gold=100;
    const p=B.p;Object.assign(p,{block:0,energy:3,str:0,dex:0,tstr:0,vuln:0,weak:0,frost:0,mana:0,pw:{},pw2:{},nextAtk:0,nextSpell:0,nextBlock:0});
    const filler=()=>mk('strike');B.hand=[filler(),filler(),filler(),filler(),filler()];B.dp=[...Array(15)].map(filler);B.disc=[filler(),filler()];
    const c=mk(id);c.u=u;c.k=999000+out.length;B.hand.push(c);
    const C=rec.calls;const cnt=k=>C[k]=(C[k]||0)+1;
    const snapP={};ST.forEach(k=>snapP[k]=p[k]||0);const hand0=B.hand.length;const max0=S.max;const hp0=S.hp;const gold0=S.gold;
    const O={};const W=(k,f)=>{O[k]=B[k];B[k]=function(...a){cnt(k);return f.apply(this,a)}};
    W('hit',(t,base,times=1)=>{t=t&&t.hp>0?t:B.enemies[0];rec.dmg[t.k]=(rec.dmg[t.k]||0)+base*(times||1)});
    W('spell',(t,base,times=1)=>{t=t&&t.hp>0?t:B.enemies[0];rec.dmg[t.k]=(rec.dmg[t.k]||0)+base*(times||1)});
    W('hitAll',v=>{rec.aoe+=v});W('block',v=>{rec.blk+=v});W('heal',v=>{rec.heal+=v});W('draw',n=>{rec.draw+=n});W('drawFam',()=>{rec.draw+=1});
    W('gainEnergy',n=>{rec.en+=n});W('addMana',n=>{rec.mana+=n});W('gainGold',v=>{rec.gold+=v});W('selfDamage',v=>{rec.self+=v});
    W('apply',(t,s,v)=>{if(t===p||t===B.p){rec.st[s]=(rec.st[s]||0)+v}else{const k=(t&&t.k)||'?';rec.est[s]=rec.est[s]||{};rec.est[s][k]=(rec.est[s][k]||0)+v}});
    W('poolAdd',()=>{rec.pool++});W('gainAnqi',()=>{rec.anqi++});W('layEgg',()=>{rec.egg++});
    ['shake','fxBuff','poolResolve','poolInsert','poolShuffle','poolOverflow','poolNudge','poolThaw','poolSort','poolConvert','poolClear','poolPop','poolForce','poolCleanse','discardHand','chooseDiscard','chooseFamily','chooseFromDraw','addRandomRare','fetchAtk','favAnqi','throwAnqi','warmEggs','setWx','setMoon','renderHand','statFx'].forEach(k=>{if(B[k])W(k,()=>{})});
    const oPW=window.PW;window.PW=(BB,k,v)=>{rec.pw.push(k+(v!=null?':'+v:''))};
    const oDE=window.dealEnemy;window.dealEnemy=(t,v)=>{if(t&&t.k)rec.dmg[t.k]=(rec.dmg[t.k]||0)+v};
    const oDP=window.dmgPlayer;window.dmgPlayer=v=>{rec.self+=v};
    const oSl=window.sleep;window.sleep=()=>Promise.resolve();
    try{const r=D.fx(B,u,B.enemies[0],c,3);if(r&&r.then)await Promise.race([r,new Promise(z=>setTimeout(z,300))])}catch(e){rec.err=String(e&&e.message||e).slice(0,80)}
    Object.keys(O).forEach(k=>B[k]=O[k]);window.PW=oPW;window.dealEnemy=oDE;window.dmgPlayer=oDP;window.sleep=oSl;
    ST.forEach(k=>{const dlt=(p[k]||0)-snapP[k];if(dlt&&k!=='energy')rec.st[k]=(rec.st[k]||0)+dlt});
    if(p.energy!==3)rec.en+=p.energy-3;
    rec.draw+=Math.max(0,B.hand.length-hand0-0)+0;
    if(S.max!==max0)rec.maxhp+=S.max-max0;if(S.hp<hp0&&!rec.self)rec.self+=hp0-S.hp;if(S.gold!==gold0)rec.gold+=S.gold-gold0;
    B.enemies.forEach(e=>{['vuln','weak','poison','burn','bleed','frost','stun','str'].forEach(s=>{const v=(e[s]||0);if(v&&!(rec.est[s]&&rec.est[s][e.k])){rec.est[s]=rec.est[s]||{};rec.est[s][e.k]=v}})});
   }catch(e){rec.err=String(e&&e.message||e).slice(0,80)}
   out.push(rec)}}
 return out});
fs.writeFileSync(OUT,JSON.stringify(res));console.log('cards measured',res.length/2,'errors',res.filter(r=>r.err).length);await b.close()})();
