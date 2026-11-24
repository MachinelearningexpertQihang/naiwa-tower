/* ===================== 6.0 新内容 =====================
   1. 新遗物 16 个
   2. 周目从 9 级加到 15 级
   3. 无尽之塔：通关以后接着往上爬
   4. 分享奖励
*/

/* ---------- 1. 新遗物 ---------- */
Object.assign(RELICS,{
 n6_kettle:{n:"铁水壶",img:"ctm",r:"C",d:"每场战斗开局，所有敌人虚弱 1"},
 n6_dice:{n:"老骰子",img:"c2",r:"C",d:"每场战斗结束掷一次，获得 1～20 金币"},
 n6_tealeaf:{n:"茶叶罐",img:"cty",r:"C",d:"每次喝药水，额外回复 6 生命"},
 n6_milk:{n:"奶瓶",img:"ega",r:"C",d:"战斗结束时如果生命不到一半，回复 10 生命"},
 n6_banner:{n:"战旗",img:"hrl",r:"C",d:"首领战开局获得 15 护盾"},
 n6_fishbone:{n:"鱼骨",img:"ctw",r:"C",d:"每回合第一次击败敌人，获得 1 点奶力"},
 n6_redstring:{n:"红绳",img:"hrcc",r:"R",d:"每个敌人第一次掉到半血以下时，你获得 1 点奶力"},
 n6_ember:{n:"余烬石",img:"hry",r:"R",d:"每回合开始，随机一个敌人烫伤 3"},
 n6_drum:{n:"战鼓",img:"c7",r:"R",d:"精英战和首领战开局，力气 +2"},
 n6_bellrope:{n:"钟绳",img:"egsk",r:"R",d:"每回合打出的第一张攻击牌，抽 1 张"},
 n6_watch:{n:"怀表",img:"np",r:"R",d:"每场战斗第 4 回合开始时，获得 2 点奶力"},
 n6_stardust:{n:"星砂",img:"nx",r:"R",d:"每回合第一次连锁，获得 1 点奶力"},
 n6_thorns:{n:"荆棘冠",img:"xsk",r:"E",d:"每场战斗开局获得 4 层荆棘（挨打时反伤）"},
 n6_glass:{n:"小沙漏",img:"xsw",r:"E",d:"回合开始时手牌不到 5 张，多抽 1 张"},
 n6_scale:{n:"龙鳞",img:"xcs",r:"E",d:"每回合第一次受到的伤害 -6"},
 n6_crown:{n:"古王冠",img:"xsr",r:"E",d:"每回合多 1 点奶力。代价：拿到时最大生命 -10"}});
try{for(const k in RELICS)if(/^n6_/.test(k)&&!RELIC_POOL.includes(k))RELIC_POOL.push(k)}catch(e){}

const BOSSK=["B","K","F","O","H","J","W"];
// 拿到古王冠：最大生命 -10
{const _g=gainRelic;gainRelic=function(id){const had=S&&S.relics&&S.relics.includes(id);const r=_g.apply(this,arguments);try{if(id==="n6_crown"&&!had){S.max=Math.max(20,S.max-10);S.hp=Math.min(S.hp,S.max);renderTop()}}catch(e){}return r}}
// 开局
{const _sc=startCombat;startCombat=function(kind){const r=_sc.apply(this,arguments);try{if(B&&B.enemies&&!PREV){
 if(has("n6_kettle")){B.enemies.forEach(e=>B.apply(e,"weak",1));relicPulse("n6_kettle")}
 if(has("n6_drum")&&(kind==="E"||BOSSK.includes(kind))){B.p.str=(B.p.str||0)+2;relicPulse("n6_drum")}
 if(has("n6_banner")&&BOSSK.includes(kind)){B.block(15,1);relicPulse("n6_banner")}
 if(has("n6_thorns")){B.p.thorn=(B.p.thorn||0)+4;relicPulse("n6_thorns")}
 // 周目 10：精英和首领开场力气 +2；周目 9/12 和无尽的生命加成在 mkEnemy 里
 if(asc()>=10)B.enemies.forEach(e=>{if(ENEMY[e.id].elite||ENEMY[e.id].boss){e.str=(e.str||0)+2;e.str0=(e.str0||0)+2}});
 if(S.endless&&S.eMod==="wall")B.enemies.forEach(e=>e.block=(e.block||0)+10);
 renderBattle()}}catch(e){console.warn(e)}return r}}
// 每回合开始
{const _st=startTurn;startTurn=async function(){const r=await _st.apply(this,arguments);try{if(B&&!B.over&&!PREV){
 if(has("n6_ember")){const t=pick(B.alive());if(t){B.apply(t,"burn",3);relicPulse("n6_ember")}}
 if(has("n6_glass")&&B.hand.length<5){B.draw(1);relicPulse("n6_glass")}
 if(has("n6_watch")&&B.turn===4){B.gainEnergy(2);relicPulse("n6_watch")}
 if(has("n6_crown")){B.gainEnergy(1)}
 renderBattle()}}catch(e){console.warn(e)}return r}}
// 打牌
{const _pc=playCard;playCard=function(c,target){const D=c&&CARDS[c.id];const first=B&&D&&D.type==="atk"&&B.n6bell!==B.turn;const r=_pc.apply(this,arguments);try{if(first&&has("n6_bellrope")&&B&&!B.over&&!PREV){B.n6bell=B.turn;setTimeout(()=>{if(B&&!B.over){B.draw(1);relicPulse("n6_bellrope");renderBattle()}},300)}}catch(e){}return r}}
// 打敌人：红绳、鱼骨
{const _de=dealEnemy;dealEnemy=function(t,d){const r=_de.apply(this,arguments);try{if(B&&t&&!PREV){
 if(has("n6_redstring")&&t.hp>0&&t.hp<=t.max/2&&!t.n6rs){t.n6rs=1;B.gainEnergy(1);relicPulse("n6_redstring")}
 if(has("n6_fishbone")&&t.hp<=0&&!t.n6dead&&B.n6fish!==B.turn){t.n6dead=1;B.n6fish=B.turn;B.gainEnergy(1);relicPulse("n6_fishbone")}}}catch(e){}return r}}
// 星砂：每回合第一次连锁
{const _pr=API.poolResolve;if(_pr)API.poolResolve=function(){const r=_pr.apply(this,arguments);try{if(r&&has("n6_stardust")&&this.n6dust!==this.turn&&!PREV){this.n6dust=this.turn;this.gainEnergy(1);relicPulse("n6_stardust")}}catch(e){}return r}}
// 挨打：龙鳞；周目 13：每回合第一次受到的伤害 +3
{const _dp=dmgPlayer;dmgPlayer=function(v,src,raw){try{if(B&&!PREV&&v>0&&B.n6hit!==B.turn){B.n6hit=B.turn;if(asc()>=13)v+=3;if(has("n6_scale")){v=Math.max(0,v-6);relicPulse("n6_scale")}}}catch(e){}return _dp.call(this,v,src,raw)}}
// 喝药
{const _up=usePotion;usePotion=function(){const r=_up.apply(this,arguments);try{if(has("n6_tealeaf")&&S){S.hp=Math.min(S.max,S.hp+6);relicPulse("n6_tealeaf");renderTop()}}catch(e){}return r}}
// 战斗结束
{const _w=win;win=async function(){try{if(B&&!B.over&&S){if(has("n6_dice")){const g=1+ri(20);S.gold+=g;setTimeout(()=>toast(`老骰子掷出了 <b>${g}</b>：+${g} 金币`),600)}if(has("n6_milk")&&S.hp>0&&S.hp<S.max/2){S.hp=Math.min(S.max,S.hp+10);relicPulse("n6_milk")}}}catch(e){}return _w.apply(this,arguments)}}

/* ---------- 2. 更多周目（9～14） ---------- */
ASC.push(
 {n:"敌人生命再 +10%",r:"",d:""},
 {n:"精英和首领开场就有 2 点力气",r:"",d:""},
 {n:"开局少 40 金币",r:"",d:""},
 {n:"首领生命再 +15%",r:"",d:""},
 {n:"每回合第一次受到的伤害 +3",r:"",d:""},
 {n:"开局只有 85% 生命",r:"",d:""});
{const _mk=mkEnemy;mkEnemy=function(id,i){const e=_mk.apply(this,arguments);try{const E=ENEMY[id];let m=1;if(asc()>=9)m*=1.1;if(asc()>=12&&E.boss)m*=1.15;
 if(S&&S.endless){m*=1+.35*(S.loop||0);e.str=(e.str||0)+(S.loop||0);e.str0=(e.str0||0)+(S.loop||0);if(S.eMod==="rage"){e.str+=2;e.str0+=2}}
 if(m!==1){e.max=Math.round(e.max*m);e.hp=Math.round(e.hp*m)}}catch(err){}return e}}
{const _nr=newRun;newRun=async function(){const r=await _nr.apply(this,arguments);try{if(S&&asc()>=11)S.gold=Math.max(0,S.gold-40);if(S&&asc()>=14)S.hp=Math.round(S.max*.85);saveRun()}catch(e){}return r}}

/* ---------- 3. 无尽之塔 ---------- */
const EMODS={elite:{n:"精英翻倍",d:"地图上一部分小怪换成了精英"},shop:{n:"商店关门",d:"这一轮没有商店"},night:{n:"永夜",d:"每一格都是新月"},rage:{n:"狂暴",d:"所有敌人力气再 +2"},wall:{n:"铁壁",d:"所有敌人开场带 10 护盾"}};
{const _gm=genMap;genMap=function(){const m=_gm.apply(this,arguments);try{if(S&&S.endless&&!S.junc){m.forEach(row=>row.forEach(n=>{if(!n)return;if(n.story)n.story=0;if(S.eMod==="elite"&&n.t==="m"&&rnd()<.3)n.t="E";if(S.eMod==="shop"&&n.t==="s")n.t="m"}))}}catch(e){}return m}}
{const _gs=genSky;genSky=function(){const k=_gs.apply(this,arguments);try{if(S&&S.endless&&S.eMod==="night")k.forEach(x=>{if(x)x.moon="new"})}catch(e){}return k}}
// 无尽里不出同伴剧情和 SS 线
{const _en=enterNode;enterNode=function(t,resumed,cur){try{if(S&&S.endless&&t==="q"&&!resumed){S.cur=cur||{t,rs:S.rs};saveRun();const r=rnd();if(r<.15)return startCombat("m");return eventScreen()}}catch(e){}return _en.apply(this,arguments)}}
{const base=STORY.falseEnd;Object.defineProperty(STORY,"falseEnd",{configurable:true,get(){return S&&S.endless?[["n1","","（大魔王倒下了。可是楼梯还在往上长。）"]]:base}})}
function endlessBest(){const v=(S.loop||0)*10+(S.act||0);if(v>(M.endlessBest||0)){M.endlessBest=v;saveMeta();return true}return false}
function endlessName(v){return `第 ${Math.floor(v/10)} 轮 · 第 ${v%10+1} 层`}
async function endlessNext(){S.loop=(S.loop||0)+1;S.act=0;S.eMod=pick(Object.keys(EMODS).filter(k=>k!==S.eMod));S.dream=0;S.fin=0;S.lowHalf=0;S.row=-1;S.col=-1;S.path=[];S.atBoss=false;S.actCombats=0;S.cur=null;S.junc=0;
 pickBoss();S.map=genMap();S.sky=genSky();S.hp=Math.min(S.max,S.hp+Math.round(S.max*.3));const nb=endlessBest();saveRun();B=null;show("ending");setBg("title");playMusic("title");
 const M_=EMODS[S.eMod];
 $("#ending").innerHTML=`<div class="endBox"><h1>无尽之塔 · 第 ${S.loop} 轮</h1><p>楼梯没有尽头。你往下看，云已经在脚底下了。</p><p style="font-size:20px;color:#ffe7a0">回复 30% 生命 · 敌人生命 +${Math.round(35*S.loop)}%、力气 +${S.loop}</p><p style="font-size:20px">这一轮塔变了：<b>${M_.n}</b>　${M_.d}</p>${nb?`<p style="color:#ffd23f">新纪录！</p>`:""}<div style="margin-top:22px"><button class="btn" id="eNext">继续往上 ▶</button></div></div>`;
 $("#eNext").onclick=async()=>{show("none");try{const ids=[randRelic("R"),randRelic("E"),randRelic("C")].filter((v,i,a)=>v&&a.indexOf(v)===i);if(ids.length){const id=await pickRelicOv(ids,"无尽之塔：挑一件遗物");if(id)gainRelic(id)}}catch(e){}openMap()}}
function endlessStart(){if(!S)return;S.endless=1;S.loop=0;S.flags={};S.comp=null;S.quest=null;S.mside=null;S.endKey=null;endlessNext()}
{const _ac=actClear;actClear=async function(){if(S&&S.endless&&(S.act||0)>=ACTS.length-1)return endlessNext();const keep=S;const r=_ac.apply(this,arguments);let tries=0;const addBtn=()=>{
 // 结局会把这一局清掉，所以先把它留一份：点「继续往上爬」时拿回来接着用
 try{const bt=document.querySelector("#ending .wsBtns");if(bt&&keep&&!keep.endless&&!bt.querySelector("#eEndless")){const b=document.createElement("button");b.className="wsBtn red";b.id="eEndless";b.textContent="继续往上爬（无尽）";bt.insertBefore(b,bt.firstChild);b.onclick=()=>{sfx("click");S=keep;S.noSave=0;endlessStart()};return}}catch(e){}if(++tries<40)setTimeout(addBtn,250)};setTimeout(addBtn,200);return r}}
// 无尽里倒下：记录
{const _lo=lose;lose=function(){try{if(S&&S.endless){const nb=endlessBest();setTimeout(()=>toast(`无尽之塔：爬到了 <b>${endlessName((S.loop||0)*10+(S.act||0))}</b>${nb?"，新纪录！":""}`),800)}}catch(e){}return _lo.apply(this,arguments)}}
// 顶栏：无尽里显示第几轮
{const _rt=renderTop;renderTop=function(){const r=_rt.apply(this,arguments);try{const f=document.querySelector("#top .floor");if(f&&S&&S.endless&&!f.querySelector(".eLoop"))f.insertAdjacentHTML("afterbegin",`<span class="eLoop">无尽 ${S.loop}·</span>`)}catch(e){}return r}}
// 主页：显示无尽纪录
{const _ts=titleScreen;titleScreen=function(){const r=_ts.apply(this,arguments);try{const m=document.querySelector("#title .tmeta");if(m&&M.endlessBest&&!m.querySelector(".eBest"))m.insertAdjacentHTML("beforeend",`<span class="eBest">无尽 <b>${endlessName(M.endlessBest)}</b></span>`)}catch(e){}return r}}

/* ---------- 4. 分享奖励：每天第一次分享战绩图，多一次撕卡包 ---------- */
{const _sh=typeof shareCard==="function"?shareCard:null;if(_sh)shareCard=function(){const r=_sh.apply(this,arguments);try{const d=new Date().toDateString();if(M.shareDay!==d){M.shareDay=d;packState().bonus++;saveMeta();setTimeout(()=>toast("谢谢你帮奶蛙之塔转发！今天多一次<b>撕卡包</b>的机会"),900)}}catch(e){}return r}}

/* ===================== 5. 六号主角：蛊师奶蛙 =====================
   几乎没有攻击牌，靠往敌人身上下蛊（全部是游戏里已有的负面状态）。
   养蛊（被动）：你的回合结束时，每个敌人身上每有 1 种不同的蛊，就发作一次，扣 2 点血。
   每种蛊最多 12 层，不吸血，护盾少；大伤害靠「噬心」和潮湿的连锁。 */
const GU_KEYS=["burn","bleed","mud","poison","inj","frost","para","night","wet","vuln","weak"];
const isGu=()=>S&&S.hero==="gushi";
function guKinds(e){return GU_KEYS.filter(k=>(e[k]||0)>0).length}
function guAll(e){return GU_KEYS.reduce((s,k)=>s+(e[k]||0),0)}
// 层数上限 12（只在蛊师这一局）
{const _ap=API.apply;API.apply=function(t,s,v){const r=_ap.apply(this,arguments);try{if(isGu()&&t!==this.p&&GU_KEYS.includes(s)&&t[s]>20)t[s]=20}catch(e){}return r}}
// 养蛊：回合结束时发作
{const _et=endTurn;endTurn=function(){const was=B&&B.myTurn&&!B.over;const r=_et.apply(this,arguments);try{if(was&&B&&!B.myTurn&&isGu()&&!PREV){B.enemies.forEach(e=>{if(e.hp<=0)return;const n=guKinds(e);if(n>0){const per=3+(S.act||0)+(has("qz_gu_heart")?2:0);dealEnemy(e,per*n);fxSay(e,`蛊发作 ×${n}`)}});renderBattle()}}catch(e){console.warn(e)}return r}}

/* 蛊师的牌 */
const guT=(B,t)=>t&&t.hp>0?t:B.alive()[0];
const GU_CARD=(o)=>Object.assign({fam:"none",img:"v_gushi",hero:"gushi"},o);
Object.assign(CARDS,{
 gu_frost:GU_CARD({n:"寒蛊",cost:1,type:"skl",r:"S",tgt:1,d:u=>`敌人冻伤 ${U(u,4,6)}、潮湿 1`,fx:(B,u,t)=>{const x=guT(B,t);if(x){B.apply(x,"frost",U(u,4,6));B.apply(x,"wet",1)}}}),
 gu_fire:GU_CARD({n:"火蛊",cost:1,type:"skl",r:"S",tgt:1,d:u=>`敌人烫伤 ${U(u,7,9)}。敌人潮湿的话，变成蒸汽：烫伤 ×1.5`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"burn",Math.round(U(u,7,9)*((x.wet||0)>0?1.5:1)))}}),
 gu_poison:GU_CARD({n:"毒蛊",cost:1,type:"skl",r:"S",tgt:1,d:u=>`敌人中毒 ${U(u,6,8)}`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"poison",U(u,6,8))}}),
 gu_bleed:GU_CARD({n:"血蛊",cost:1,type:"skl",r:"S",tgt:1,d:u=>`敌人流血 ${U(u,6,8)}`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"bleed",U(u,6,8))}}),
 gu_guard:GU_CARD({n:"护身蛊",cost:1,type:"skl",r:"S",d:u=>`获得 ${U(u,8,11)} 护盾`,fx:(B,u)=>{B.block(U(u,8,11))}}),
 gu_devour:GU_CARD({n:"噬心",cost:2,type:"atk",r:"S",tgt:1,d:u=>`吃掉一个敌人身上所有的蛊，每 1 层造成 ${u?3:2} 伤害，每种不同的蛊再加 5`,fx:(B,u,t)=>{const x=guT(B,t);if(!x)return;const n=guKinds(x),all=guAll(x);GU_KEYS.forEach(k=>{x[k]=0});x.poisonT=0;B.hit(x,all*(u?3:2)+5*n,1,1)}}),
 gu_mud:GU_CARD({n:"泥蛊",cost:0,type:"skl",r:"C",tgt:1,d:u=>`敌人泥巴 ${U(u,3,5)}`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"mud",U(u,3,5))}}),
 gu_rain:GU_CARD({n:"雨蛊",cost:1,type:"skl",r:"C",d:u=>`所有敌人潮湿 ${U(u,2,3)}，抽 1 张`,fx:(B,u)=>{B.alive().forEach(e=>B.apply(e,"wet",U(u,2,3)));B.draw(1)}}),
 gu_steam:GU_CARD({n:"蒸蛊",cost:1,type:"skl",r:"R",tgt:1,d:u=>`敌人潮湿 1，再烫伤 ${U(u,6,8)}（潮湿的敌人被火烧会变蒸汽，×1.5）`,fx:(B,u,t)=>{const x=guT(B,t);if(!x)return;B.apply(x,"wet",1);B.apply(x,"burn",Math.round(U(u,6,8)*1.5))}}),
 gu_icebind:GU_CARD({n:"冰缚蛊",cost:1,type:"skl",r:"R",tgt:1,d:u=>`敌人冻伤 ${U(u,3,4)}；它要是潮湿的，再冻伤 2、麻痹 ${U(u,1,2)}`,fx:(B,u,t)=>{const x=guT(B,t);if(!x)return;const w=(x.wet||0)>0;B.apply(x,"frost",U(u,3,4));if(w){B.apply(x,"frost",2);B.apply(x,"para",U(u,1,2))}}}),
 gu_thunder:GU_CARD({n:"雷蛊",cost:2,type:"skl",r:"E",d:u=>`每个潮湿的敌人受到「潮湿层数 × ${U(u,5,6)}」伤害，然后潮湿清零`,fx:(B,u)=>{B.alive().forEach(e=>{const w=e.wet||0;if(w>0){e.wet=0;B.hit(e,w*U(u,5,6),1,1)}})}}),
 gu_night:GU_CARD({n:"魇蛊",cost:1,type:"skl",r:"R",tgt:1,d:u=>`敌人梦魇 ${U(u,2,3)}（它的攻击有几率打到自己）`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"night",U(u,2,3))}}),
 gu_numb:GU_CARD({n:"麻蛊",cost:1,type:"skl",r:"C",tgt:1,d:u=>`敌人麻痹 ${U(u,2,3)}`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"para",U(u,2,3))}}),
 gu_bone:GU_CARD({n:"蚀骨蛊",cost:1,type:"skl",r:"R",tgt:1,d:u=>`敌人内伤 ${U(u,3,4)}（每回合结束扣血，不会自己消失）`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"inj",U(u,3,4))}}),
 gu_soft:GU_CARD({n:"软骨蛊",cost:0,type:"skl",r:"C",tgt:1,d:u=>`敌人虚弱 2、易伤 ${U(u,1,2)}`,fx:(B,u,t)=>{const x=guT(B,t);if(x){B.apply(x,"weak",2);B.apply(x,"vuln",U(u,1,2))}}}),
 gu_spread:GU_CARD({n:"引蛊",cost:1,type:"skl",r:"R",tgt:1,d:u=>`把这个敌人身上每种蛊的${u?"全部":"一半"}，分给其他所有敌人`,fx:(B,u,t)=>{const x=guT(B,t);if(!x)return;const o=B.alive().filter(e=>e!==x);GU_KEYS.forEach(k=>{const v=x[k]||0;if(v>0){const g=u?v:Math.ceil(v/2);o.forEach(e=>B.apply(e,k,g))}})}}),
 gu_feed:GU_CARD({n:"养蛊",cost:1,type:"skl",r:"R",tgt:1,d:u=>`一个敌人身上已有的蛊，层数最多的 4 种各 +${U(u,2,3)} 层`,fx:(B,u,t)=>{const x=guT(B,t);if(!x)return;GU_KEYS.filter(k=>(x[k]||0)>0).sort((a,b)=>x[b]-x[a]).slice(0,4).forEach(k=>B.apply(x,k,U(u,2,3)))}}),
 gu_shell:GU_CARD({n:"蛊甲",cost:1,type:"skl",r:"C",d:u=>`获得护盾：所有敌人身上蛊的种类加起来 × ${U(u,4,5)}（至少 7）`,fx:(B,u)=>{const n=B.alive().reduce((s,e)=>s+guKinds(e),0);B.block(Math.max(7,n*U(u,4,5)))}}),
 gu_seek:GU_CARD({n:"寻蛊",cost:0,type:"skl",r:"C",exh:1,d:u=>`抽 ${U(u,2,3)} 张`,fx:(B,u)=>{B.draw(U(u,2,3))}}),
 gu_nest:GU_CARD({n:"蛊巢",cost:2,type:"pow",r:"E",d:u=>`每回合开始，给所有敌人随机一种蛊 ${U(u,3,4)} 层`,fx:(B,u)=>{PW(B,"gunest",U(u,3,4))}}),
 gu_all:GU_CARD({n:"万蛊归宗",cost:3,type:"skl",r:"E",exh:1,d:u=>`所有敌人烫伤、流血、泥巴、中毒、冻伤各 ${U(u,3,4)}`,fx:(B,u)=>{B.alive().forEach(e=>["burn","bleed","mud","poison","frost"].forEach(k=>B.apply(e,k,U(u,3,4))))}})});
POOL_HERO.push("gu_mud","gu_rain","gu_steam","gu_icebind","gu_thunder","gu_night","gu_numb","gu_bone","gu_soft","gu_spread","gu_feed","gu_shell","gu_seek","gu_nest","gu_all");
// 蛊巢
{const _st2=startTurn;startTurn=async function(){const r=await _st2.apply(this,arguments);try{const v=B&&B.p.pw2&&B.p.pw2.gunest;if(v&&!B.over&&!PREV){B.alive().forEach(e=>B.apply(e,pick(["burn","bleed","mud","poison","frost","wet"]),v));renderBattle()}}catch(e){}return r}}
const GU_STARTER=["gu_frost","gu_frost","gu_fire","gu_fire","gu_poison","gu_bleed","gu_guard","gu_guard","gu_guard","gu_devour"];

/* 主角列表：打败过一次大魔王才解锁 */
HEROES.push({id:"gushi",n:"蛊师奶蛙",img:"v_gushi",tag:"六号主角 · 养蛊",d:"不出拳，靠下蛊。敌人身上蛊的种类越多，每回合扣的血越多。「噬心」吃掉全部蛊，打一大下。",hp:74,get on(){return !!(typeof M!=="undefined"&&M&&(M.guUnlock||(M.wins||0)>0||(M.ach||{}).win))}});
{const _hs=heroSelect;heroSelect=function(){const r=_hs.apply(this,arguments);try{const i=HEROES.findIndex(h=>h.id==="gushi");const el=document.querySelectorAll(".hcard")[i];if(el&&!HEROES[i].on){const lk=el.querySelector(".lk");if(lk)lk.textContent="打败大魔王解锁";const p=el.querySelector("p");if(p)p.textContent="打败过一次奶蛙大魔王就能解锁";el.onclick=()=>toast("蛊师奶蛙：打败过一次<b>奶蛙大魔王</b>就能解锁")}}catch(e){}return r}}
try{TRAIN_HERO.gushi={t:"蛊师奶蛙：养蛊",l:["你几乎没有攻击牌。烫伤、流血、泥巴、中毒、内伤、冻伤、麻痹、梦魇、潮湿、易伤、虚弱，这些都是你的蛊。先上潮湿再上烫伤会变蒸汽，潮湿还能被「雷蛊」一口气引爆。","回合结束时，敌人身上每有 1 种不同的蛊，就发作一次，扣「3 + 第几层」点血（第一层 3，第五层 7）。比起一种蛊叠很多层，种类多更痛。每种蛊最多 20 层。","「噬心」把一个敌人身上的蛊全部吃掉，每层 2 点伤害，每种再加 5。吃完要重新养。"],c:"gu_devour"}}catch(e){}
try{BIO.gushi="醒来的时候就在塔脚下，披着一件破斗篷，手里一根杖、一颗里面有东西在动的玻璃球。不记得自己是谁，只知道这些小虫听它的话。胸口挂着一只眼睛。"}catch(e){}
// 以蛊护身：每回合开始，按蛊种类最多的那个敌人，每种 +2 护盾
{const _st3=startTurn;startTurn=async function(){const r=await _st3.apply(this,arguments);try{if(isGu()&&B&&!B.over&&!PREV){const n=Math.max(0,...B.alive().map(guKinds));if(n>0){B.block(2*n,1);renderBattle()}}}catch(e){}return r}}

/* ===================== 6. 无尽之塔的守关双子：无尽恶魔·恒 / 无尽恶魔·蚀 =====================
   无尽模式里每层首领有 25% 换成它俩。
   白的「恒」守：给自己和同伴上盾、回血、给你上虚弱。
   黑的「蚀」打：多段攻击、上中毒和易伤，蓄力后放「无尽侵蚀」。
   双生：一个倒下后，另一个力气 +3，并在 2 回合后把同伴以一半血拉起来。两个要在 2 回合内一起打倒。 */
Object.assign(ENEMY,{
 twin_white:{n:"无尽恶魔·恒",img:"e_v_twin_white",hp:[230,230],h:300,boss:1,pd:"白色的那一半。守着同伴，同伴倒下两回合后会把它拉起来",
  ai:(e,t)=>[{k:"def",v:20},{k:"debuff",s:"weak",v:2,s2:"brk",v2:2},{k:"atk",v:14},{k:"buff",s:"str",v:2}][t%4]},
 twin_black:{n:"无尽恶魔·蚀",img:"e_v_twin_black",hp:[200,200],h:300,boss:1,pd:"黑色的那一半。出手狠，同伴倒下两回合后会把它拉起来",
  ai:(e,t)=>[{k:"atk",v:8,x:3},{k:"debuff",s:"poison",v:4,s2:"vuln",v2:2},{k:"atk",v:20},{k:"atkdef",v:12,b:12}][t%4]}});
try{
 BOSS_LORE.twin_white={t:"双生 · 恒",td:"倒下后，同伴 2 回合内会把它以一半血拉起来。两个要在 2 回合内一起打倒",lore:["无尽之塔里没有尽头，只有它们两个。"],lore2:["白的那个从来不先出手。"],lore3:["它们是同一个东西的两面：一个想让你停下，一个想让你倒下。"]};
 BOSS_LORE.twin_black={t:"双生 · 蚀",td:"倒下后，同伴 2 回合内会把它以一半血拉起来。两个要在 2 回合内一起打倒",lore:["无尽之塔里没有尽头，只有它们两个。"],lore2:["黑的那个从来不等。"],lore3:["它们是同一个东西的两面：一个想让你停下，一个想让你倒下。"]};
 BM.twin_white={say:"……又一个。",tip:"给同伴上盾、回血，给你上虚弱和破甲。倒下以后，同伴 2 回合内会把它拉起来：两个要在 2 回合内一起打倒",chip:e=>e.twinCd>0?`拉起同伴还差 ${e.twinCd} 回合`:""};
 BM.twin_black={say:"一直往上爬？那就一直倒下吧。",tip:"多段攻击，上中毒和易伤，蓄力以后是「无尽侵蚀」。倒下以后，同伴 2 回合内会把它拉起来",chip:e=>e.twinCd>0?`拉起同伴还差 ${e.twinCd} 回合`:""};
 ULT.twin_black={n:"无尽侵蚀",m:1.9,s:"poison",d:5};ULT.twin_white={n:"永恒之壁",m:1.4,s:"weak",d:3};
 STORY.bs_twin_white=[["v_twin_white","无尽恶魔·恒","你走到这儿，是第几轮了？"],["v_twin_black","无尽恶魔·蚀","不重要。再往上，也只是再来一轮。"],["v_twin_white","无尽恶魔·恒","塔不会有顶的。我们就是它的顶。"]];
 STORY.bw_twin_white=[["v_twin_black","无尽恶魔·蚀","……下一轮。"],["v_twin_white","无尽恶魔·恒","下一轮，我们还在这儿。"]];
 ELINE.twin_white={a:["停下吧。","你累了。"],s:["我守着它。","再来一轮。"],l:["……下一轮见。"]};
 ELINE.twin_black={a:["倒下！","没有尽头！"],s:["无尽！","一轮又一轮！"],l:["……还会回来的。"]};
}catch(e){console.warn(e)}
// 恒每回合给同伴 6 护盾，同伴少血时回 8
{const _st=startTurn;startTurn=async function(){const r=await _st.apply(this,arguments);try{if(B&&!B.over&&!PREV){const w=B.enemies.find(e=>e.id==="twin_white"&&e.hp>0),k=B.enemies.find(e=>e.id==="twin_black");
 if(w&&k&&k.hp>0){k.block=(k.block||0)+6;if(k.hp<k.max*.6)k.hp=Math.min(k.max,k.hp+8)}
 // 双生复活倒数
 B.enemies.forEach(e=>{if(!/^twin_/.test(e.id)||e.hp<=0||!(e.twinCd>0))return;e.twinCd--;if(e.twinCd<=0){const o=B.enemies.find(x=>/^twin_/.test(x.id)&&x!==e&&x.hp<=0);if(o){o.hp=Math.round(o.max/2);o.dead=0;o.block=10;o.turn=0;o.intent=ENEMY[o.id].ai(o,0);toast(`<b>${e.n}</b>把同伴拉了起来！`);const el=enEl(e);if(el)say(el.querySelector(".body"),"起来。还没完。")}}});
 renderBattle()}}catch(e){console.warn(e)}return r}}
// 一个倒下：另一个力气 +3，开始 2 回合倒数
{const _de=dealEnemy;dealEnemy=function(t,d){const was=t&&t.hp>0;const r=_de.apply(this,arguments);try{if(was&&t&&t.hp<=0&&/^twin_/.test(t.id)&&B&&!PREV){const o=B.enemies.find(x=>/^twin_/.test(x.id)&&x!==t&&x.hp>0);if(o){o.str=(o.str||0)+3;o.twinCd=2;const el=enEl(o);if(el)say(el.querySelector(".body"),"……你敢！");toast(`<b>${o.n}</b>力气 +3：2 回合内不打倒它，它会把同伴拉起来`)}else{B.enemies.forEach(x=>{x.twinCd=0})}}}catch(e){}return r}}
// 无尽模式：首领 25% 换成双子
// pickBoss 是常量，没法包，所以在每层第一次打开地图时掷一次
{const _om=openMap;openMap=function(){try{if(S&&S.endless&&S.row<0&&S.twinRoll!==S.loop*10+(S.act||0)){S.twinRoll=S.loop*10+(S.act||0);if(rnd()<.25)S.boss="twin_white";else if(S.boss==="twin_white")pickBoss()}}catch(e){}return _om.apply(this,arguments)}}

/* ===================== 7. 蛊师奶蛙的剧情 ===================== */
Object.assign(STORY,{
 intro_gushi:[["n1","","（你在塔脚下醒过来，不记得自己是谁。）"],
  ["m6","奶蛙长老","……你胸口那只眼睛，我好像在哪儿见过。"],
  ["m6","奶蛙长老","想知道自己是谁，就往上走吧。"]],
 act1_gushi:[["n1","蛊师奶蛙","我梦见一间屋子，全是书。有人在写字，写得很快。……那只手，是我的手吗？"]],
 act2_gushi:[["n1","蛊师奶蛙","冷。可玻璃球里的东西一点都不怕冷，它们好像以前来过这里。"]],
 act3_gushi:[["n1","蛊师奶蛙","这股甜味……我闻过。在很久以前，在一个我不想回去的地方。"]],
 act4_gushi:[["n1","蛊师奶蛙","越往上，梦就越清楚。我开始不想睡了。"]]});
try{
 BOSS_HERO.witch=BOSS_HERO.witch||{};BOSS_HERO.witch.gushi=["……你在闻什么？","烧糊的糖。你身上怎么会有这个味道？……闻不到的人，才最该小心。"];
 BOSS_HERO.proto=BOSS_HERO.proto||{};BOSS_HERO.proto.gushi=["我没来过这里。","……你又来了？上一次，你也是这么说的。"];
 BOSS_HERO.count=BOSS_HERO.count||{};BOSS_HERO.count.gushi=["这里的人看我的眼神，都像在等我先开口。","因为你身上有一股旧书的味道。我认识的人里，只有一个是这个味道。"];
}catch(e){}
// 初号机路线那段（不走首领开场的时候也补上）
{const b=STORY.ss_proto_in;if(b)Object.defineProperty(STORY,"ss_proto_in",{configurable:true,get(){return isGu()?b.concat([["v_proto","初号机","……你又来了？"],["n1","蛊师奶蛙","我没来过。"],["v_proto","初号机","上一次，你也是这么说的。你站在椅子旁边，看着我坐上去。"],["n1","蛊师奶蛙","（我那时候……是在看，还是在帮？）"]]):b}})}
// 斗兽场
{const b=STORY.dsq_boss;if(b)Object.defineProperty(STORY,"dsq_boss",{configurable:true,get(){return isGu()?b.concat([["v_champ","不灭的斗士","你……是他？……不对。他的眼睛，不是这样的。"]]):b}})}
{const b=STORY.dsq_cup;if(b)Object.defineProperty(STORY,"dsq_cup",{configurable:true,get(){return isGu()?b.concat([["v_cup","迷你奶茶杯","……等一下。你过来。"],["v_cup","迷你奶茶杯","像他，又不像他。烧糊的糖味……淡得快闻不到了。"],["n1","蛊师奶蛙","（我是不是，就是那个坏人？）"]]):b}})}
// 灭却诅咒师：揭开一切
{const b=STORY.cs_in;if(b)Object.defineProperty(STORY,"cs_in",{configurable:true,get(){return isGu()?[
 ["v_curser","灭却诅咒师","（黑袍子背对着你，在本子上写着什么。写到一半，笔停了。）"],
 ["v_curser","灭却诅咒师","（它合上本子，看了你很久。）……原来你还活着。"],
 ["n1","蛊师奶蛙","你认识我？"],
 ["v_curser","灭却诅咒师","我当然认识你。你是我拼了命才送出去的那一半。"],
 ["v_curser","灭却诅咒师","椅子钻进我脑子里的那天，我就知道自己撑不住了。最后还清醒的那一下，我把还像我的那部分切了下来，扔出了塔。"],
 ["v_curser","灭却诅咒师","椅子没抢到你。……剩下的，全给它了。"],
 ["n1","蛊师奶蛙","那九十九个预言……"],
 ["v_curser","灭却诅咒师","是剩下的我写的。你走了以后，就没有谁会喊停了。"],
 ["v_curser","灭却诅咒师","（它的眼睛暗了一下，声音变得不像它自己。）……现在，椅子想把你也要回去。"]]:b}})}
async function guChoice(){return new Promise(res=>{ov(`<div class="modal spareBox"><h3>黑袍子跪在地上</h3><p>它是你的另一半。椅子还在它身体里。</p><div class="row" style="gap:20px;margin-top:18px"><button class="btn" id="guTake">把它收回来</button><button class="btn pink" id="guLet">放它走</button></div></div>`);$("#guTake").onclick=()=>{closeOv();res(true)};$("#guLet").onclick=()=>{closeOv();res(false)}})}
{const b=STORY.cs_win;if(b)Object.defineProperty(STORY,"cs_win",{configurable:true,get(){return isGu()?[["v_curser","灭却诅咒师","（它跪在地上，肩膀在抖。这一次，它没有笑。）"],["v_curser","灭却诅咒师","……你要拿我怎么办？"]]:b}})}
{const _cw=csWin;csWin=async function(){if(isGu()&&!S.fin&&!S.flags.guChose){busy=true;await sleep(600);B=null;busy=false;show("none");await talk(STORY.cs_win);const take=await guChoice();S.flags.guChose=1;S.flags.guTake=take?1:0;
 await talk(take?[["n1","蛊师奶蛙","你那时候把我送走，是想让我替你活下去。……我回来了。"],["n1","","（黑袍子瘪了下去。底下是一只很瘦、很老的奶蛙，睡着了一样。椅子留在它身体里的那股黑烟，往深渊的方向逃走了。）"]]
  :[["n1","蛊师奶蛙","它也是我。……可我还不想变成它。"],["n1","","（黑袍子化成一股黑烟，钻进了地板的缝里。往下，往深渊的方向。）"]]);
 S.flags.curserDone=1;if(!S.relics.includes("ss_orb"))gainRelic("ss_orb");S.gold+=160;ach("curser");if(S.flags.protoDone&&S.flags.arenaDone)ach("allss");saveRun();return rewardScreen("E",0,[])}
 return _cw.apply(this,arguments)}}
{const b=STORY.cs2_in;if(b)Object.defineProperty(STORY,"cs2_in",{configurable:true,get(){return isGu()&&S.flags&&S.flags.guTake?[["n1","","（深渊的水里浮起一件空空的黑袍子。袍子里面只有黑烟，没有奶蛙。）"],["v_curser","椅子的影子","……你把它的另一半拿走了。那我就只剩下椅子了。"],["n1","蛊师奶蛙","那正好。这一次，没有谁替你说话了。"]]:b}})}
// 塔顶 · 宽恕
{const d=Object.getOwnPropertyDescriptor(STORY,"spare");const get=d&&d.get?d.get:(()=>d&&d.value);Object.defineProperty(STORY,"spare",{configurable:true,get(){const base=get.call(STORY)||[];if(!isGu())return base;
 return base.concat([["n1","蛊师奶蛙","你还记得那个预言家吗？"],["bx","奶蛙大魔王","……那个从来没说错过的人。"],["n1","蛊师奶蛙","他说错过一次，就是最后那次。"],["n1","蛊师奶蛙","那时候椅子已经钻进了他的脑子。他撑不住之前，把还像自己的那一半切下来，扔出了塔。"],["n1","蛊师奶蛙","……那一半，就是我。"],["bx","奶蛙大魔王","（他愣了很久。）……原来，他也是被那把椅子困住的人。"]])}})}
// 真结局：书房
{const d=Object.getOwnPropertyDescriptor(STORY,"trueEnd");const get=d&&d.get?d.get:(()=>d&&d.value);Object.defineProperty(STORY,"trueEnd",{configurable:true,get(){const base=get.call(STORY)||[];if(!isGu())return base;
 return base.concat([["n1","","（塔下那间书房又亮起了灯。）"],["n1","","（那本只记名字的本子被翻开，每个名字旁边，都慢慢多了几行小字：谁爱喝几分糖，谁笑起来会眯眼，谁怕黑。）"],["n1","","（最后一页写着：「它们不是材料。它们都有名字。」）"]])}})}
// 解锁：打败过一次大魔王
{const _a=ach;ach=function(id){const r=_a.apply(this,arguments);try{if(id==="win"&&!M.guUnlock){M.guUnlock=1;saveMeta();setTimeout(()=>toast("新主角解锁：<b>蛊师奶蛙</b>"),2200)}}catch(e){}return r}}

/* 蛊师的出手动作：举起玻璃球，一群紫色的小蛊飞到敌人身上 */
function guSwarm(t,n){try{if(PREV||!t)return;try{const n0=performance.now();if(n0-(guSwarm._t||0)>150){guSwarm._t=n0;sxPlay("whoosh",.45,1.7,0,{pan:.2});sxPlay("slime",.5,1.2,.25,{pan:.3})}}catch(e){}const pl=$("#player .body"),eb=enBody(t);if(!pl||!eb)return;const a=center(pl),b=center(eb);const fx=$("#fx")||$("#stage");
 for(let i=0;i<n;i++){const d=document.createElement("i");d.className="guBug";fx.appendChild(d);const sx=a.x+20,sy=a.top+40,ex=b.x+(Math.random()-.5)*80,ey=b.top+60+(Math.random()-.5)*80,mx=(sx+ex)/2+(Math.random()-.5)*160,my=Math.min(sy,ey)-80-Math.random()*120;
  const an=d.animate([{transform:`translate(${sx}px,${sy}px) scale(.4)`,opacity:0},{transform:`translate(${mx}px,${my}px) scale(1)`,opacity:1,offset:.45},{transform:`translate(${ex}px,${ey}px) scale(.7)`,opacity:1,offset:.9},{transform:`translate(${ex}px,${ey}px) scale(.2)`,opacity:0}],{duration:520+i*40,delay:i*35,easing:"cubic-bezier(.3,.7,.4,1)"});an.onfinish=()=>d.remove()}
 setTimeout(()=>{try{sparks(b.x,b.top+60,"#b46bff",10)}catch(e){}},560)}catch(e){}}
{const _pc2=playCard;playCard=function(c,target){const D=c&&CARDS[c.id];const go=isGu()&&D&&D.hero==="gushi"&&B&&B.myTurn&&!busy&&!PREV&&curCost(c)<=B.p.energy;const r=_pc2.apply(this,arguments);
 try{if(go){const pl=$("#player");if(pl)anim(pl,"atkGu");const tg=(target&&target.hp>0)?target:null;if(D.type==="pow"||D.n==="护身蛊"||D.n==="蛊甲"||D.n==="寻蛊"){}else if(tg&&D.tgt)guSwarm(tg,D.type==="atk"?10:6);else B.alive().forEach(e=>guSwarm(e,4))}}catch(e){}return r}}
// 普通攻击动作也换成蛊师自己的
{const _af=atkFx;atkFx=function(D,t){if(isGu()){const pl=$("#player");if(pl)anim(pl,"atkGu");return}return _af.apply(this,arguments)}}

/* ===================== 6.0.1 ===================== */
/* ---------- 1. 无尽之塔：每进一轮，三条 SS 线和真结局的进度清零，酒馆重新贴悬赏，每一轮都能再走一次真结局 ---------- */
const SS_FLAGS=["protoDone","curserDone","arenaDone","ssProto","truth","ssArena","clue","clue2","protoRoute","protoBox","protoEnd","protoDiary","csRoute","csRope","arenaRoute","betChal","betChamp","arenaFighter","cupFriend","dThrone","elderGone","guTake","guChose","ayNote"];
{const _en2=endlessNext;endlessNext=async function(){try{if(S&&S.flags)SS_FLAGS.forEach(k=>{delete S.flags[k]});if(S){S.quest=null;S.mside=null;S.endKey=null}}catch(e){}return _en2.apply(this,arguments)}}

/* ---------- 2. 蛊师奶蛙的专属遗物 ---------- */
Object.assign(RELICS,{
 mr_gujar:{n:"蛊母罐",img:"v_gushi",r:"S",d:"蛊师熟练度奖励：每场战斗开始，所有敌人随机 2 种蛊各 3 层"},
 qz_gu_heart:{n:"本命蛊",img:"v_gushi",r:"Q",hero:"gushi",d:"蛊师奇招：养蛊发作时，每种蛊多扣 2 点血"},
 qz_gu_jar:{n:"万蛊瓮",img:"v_gushi",r:"Q",hero:"gushi",d:"蛊师奇招：敌人倒下时，它身上每种蛊的一半，分给其他所有敌人"},
 qz_cicada:{n:"春秋蝉",img:"v_gushi",r:"Q",hero:"gushi",d:"蛊师奇招：倒下时满血复活，所有牌升一级；但身上所有遗物（包括它自己）都会消失"}});
const GU_START=["burn","bleed","mud","poison","frost","wet"];
{const _scG=startCombat;startCombat=function(kind){const r=_scG.apply(this,arguments);try{if(B&&!PREV){
  if(has("mr_gujar")){B.alive().forEach(e=>shuffle(GU_START.slice()).slice(0,2).forEach(k=>B.apply(e,k,3)));relicPulse("mr_gujar")}
  const gs=perk("guStart");if(gs)B.alive().forEach(e=>B.apply(e,pick(GU_START),3*gs));
  const es=perk("eggStart");for(let i=0;i<es;i++)B.layEgg({t:1,d:10,b:0,nw:1});
  if(perk("wxGo")){const ws=Object.keys(WX).filter(w=>w!=="clear"&&w!==B.wx);if(ws.length)B.setWx(pick(ws));B.wxGoE=1}
  renderBattle()}}catch(e){console.warn(e)}return r}}
// 万蛊瓮
{const _ke=killEnemy;killEnemy=function(t){const snap={};try{if(B&&!PREV&&has("qz_gu_jar"))GU_KEYS.forEach(k=>{if((t[k]||0)>0)snap[k]=Math.ceil(t[k]/2)})}catch(e){}const r=_ke.apply(this,arguments);try{if(Object.keys(snap).length){const o=B.alive().filter(e=>e!==t);if(o.length){o.forEach(e=>Object.entries(snap).forEach(([k,v])=>B.apply(e,k,v)));relicPulse("qz_gu_jar");renderBattle()}}}catch(e){}return r}}
// 春秋蝉
{const _lo2=lose;lose=async function(){try{if(S&&B&&!B.over&&S.hp<=0&&has("qz_cicada")&&!S.dummy&&!S.arena&&B.kind!=="R"){
  [...S.relics].forEach(id=>dropRelic(id));S.relics=[];S.hp=S.max;let n=0;
  S.deck.forEach(c=>{if(upOK(c)){c.u=(c.u|0)+1;n++}});["dp","hand","disc"].forEach(k=>(B[k]||[]).forEach(c=>{if(upOK(c))c.u=(c.u|0)+1}));
  banner("春秋蝉 · 蝉蜕",1);try{stageShake();sparks(640,300,"#9be36b",40)}catch(e){}toast(`春秋蝉脱了一层壳：<b>满血复活</b>，${n} 张牌升了一级。身上的遗物全没了`);sfx("levelup");renderTop();renderBattle();return}}catch(e){console.warn(e)}return _lo2.apply(this,arguments)}}
// 奇招牌：蛊王
Object.assign(CARDS,{qz_gu_king:GU_CARD({n:"蛊王",cost:1,type:"skl",r:"Q",tgt:1,exh:1,d:u=>`一个敌人身上每种蛊的层数翻倍${u?"，抽 1 张":""}。消耗`,fx:(B,u,t)=>{const x=guT(B,t);if(!x)return;GU_KEYS.forEach(k=>{const v=x[k]||0;if(v>0)B.apply(x,k,v)});if(u)B.draw(1)}})});

/* ---------- 3. 更多天赋：奶蛋流、气象流、蛊师专属 ---------- */
Object.assign(PSCH,{egg:{n:"奶蛋流",f:"egg"},eggStart:{n:"奶蛋流",f:"egg"},eggWarm:{n:"奶蛋流",f:"egg"},
 wxB:{n:"气象流",c:"#7fd4ff",k:"天"},wxGo:{n:"气象流",c:"#7fd4ff",k:"天"},wxShield:{n:"气象流",c:"#7fd4ff",k:"天"},
 guB:{n:"养蛊",c:"#b06bff",k:"蛊"},guStart:{n:"养蛊",c:"#b06bff",k:"蛊"}});
Object.assign(PERKS,{
 eggStart:{n:"多子多福",ic:"heart",max:2,d:"每场战斗开始下 1 枚蛋（下回合孵化，随机敌人 10 伤害）"},
 eggWarm:{n:"暖巢",ic:"shield",max:2,d:"每回合开始，场上每有 1 枚蛋，获得 2 护盾"},
 wxB:{n:"看天吃饭",ic:"boom",max:3,d:"天气每变一次，所有敌人受到 4 伤害"},
 wxGo:{n:"呼风唤雨",ic:"wind",max:1,d:"每场战斗开始随机变一次天（不会是晴天），第一回合奶力 +1"},
 wxShield:{n:"风雨无阻",ic:"shield",max:2,d:"不是晴天时，每回合开始获得 4 护盾"},
 guB:{n:"蛊毒入骨",ic:"skull",max:3,hero:"gushi",d:"养蛊发作时，每种蛊多扣 1 点血"},
 guStart:{n:"先下手",ic:"swirl",max:2,hero:"gushi",d:"每场战斗开始，每个敌人身上随机 1 种蛊 3 层"}});
// 看天吃饭
{const _swP=API.setWx;API.setWx=function(w){const old=this.wx;const r=_swP.apply(this,arguments);try{const lv=perk("wxB");if(lv&&!PREV&&B&&old!==w){B.alive().forEach(e=>B.hit(e,4*lv,1,1));setTimeout(()=>{try{if(B&&!B.alive().length&&!B.over)win()}catch(e){}},50)}}catch(e){}return r}}
// 每回合开始：呼风唤雨的奶力、暖巢、风雨无阻
{const _stP=startTurn;startTurn=async function(){const r=await _stP.apply(this,arguments);try{if(B&&!B.over&&!PREV){
  if(B.wxGoE&&B.turn===1){B.wxGoE=0;B.gainEnergy(1)}
  const ew=perk("eggWarm"),n=(B.eggs||[]).length;if(ew&&n)B.block(2*ew*n,1);
  const ws=perk("wxShield");if(ws&&B.wx&&B.wx!=="clear")B.block(4*ws,1);
  renderBattle()}}catch(e){}return r}}
// 蛊毒入骨：发作额外伤害（在原来的发作之后补上）
{const _etP=endTurn;endTurn=function(){const was=B&&B.myTurn&&!B.over;const before=was&&isGu()?B.alive().map(e=>[e,guKinds(e)]):null;const r=_etP.apply(this,arguments);try{const lv=perk("guB");if(before&&lv&&B&&!B.myTurn&&!PREV){before.forEach(([e,n])=>{if(e.hp>0&&n>0)dealEnemy(e,lv*n)});renderBattle()}}catch(e){}return r}}

/* ---------- 4. 奶蛋流新牌 ---------- */
Object.assign(CARDS,{
 e_detonate:{n:"炸蛋",cost:1,type:"atk",r:"R",fam:"egg",img:"egx",d:u=>`把场上的蛋全部炸掉：每枚蛋对所有敌人造成 ${U(u,4,5)} 伤害`,fx:(B,u)=>{const n=(B.eggs||[]).length;if(!PREV){B.eggs=[];renderEggs()}if(n)B.alive().forEach(e=>B.hit(e,n*U(u,4,5)))}},
 e_diary:{n:"孵化日记",cost:1,cu:0,type:"pow",r:"R",fam:"egg",img:"egq",d:u=>`每回合第一次有蛋孵化时，力气 +1${u?"，抽 1 张":""}`,fx:(B,u)=>{PW(B,"eggdiary",u?2:1)}},
 e_ducks:{n:"一窝鸭蛋",cost:2,cu:1,type:"skl",r:"C",fam:"egg",img:"egy",d:u=>`下 3 枚蛋，2 回合后孵化：每枚随机敌人 ${U(u,8,10)} 伤害，你得 3 护盾`,fx:(B,u)=>{for(let i=0;i<3;i++)B.layEgg({t:2,d:U(u,8,10),b:3})}},
 e_fry:{n:"煎蛋",cost:1,type:"atk",r:"C",fam:"egg",img:"eg",tgt:1,d:u=>`造成 ${U(u,8,11)} 伤害。场上最快的那枚蛋立刻孵化`,fx:(B,u,t)=>{B.hit(t,U(u,8,11));if(PREV||!(B.eggs||[]).length)return;const e=B.eggs.slice().sort((a,b)=>a.t-b.t)[0];const rest=B.eggs.filter(x=>x!==e),had=rest.filter(x=>x.nw);rest.forEach(x=>{x.nw=1});e.t=1;delete e.nw;setTimeout(()=>{try{hatchEggs().then(()=>{had.forEach(x=>{x.nw=1});renderEggs()})}catch(err){}},260)}},
 e_phoenix:{n:"不死鸟蛋",cost:2,cu:1,type:"skl",r:"E",fam:"egg",img:"egx",exh:1,d:u=>`下 1 枚不死鸟蛋，3 回合后孵化：所有敌人 ${U(u,30,38)} 伤害、烫伤 5，你回复 10 生命。消耗`,fx:(B,u)=>{B.layEgg({t:3,d:U(u,30,38),all:1,st:"burn",sv:5,h:10,gold:1})}},
 e_henguard:{n:"母鸡护巢",cost:1,type:"skl",r:"C",fam:"egg",img:"egh",d:u=>`获得 ${U(u,6,9)} 护盾。下 1 枚蛋，下回合孵化：随机敌人 6 伤害`,fx:(B,u)=>{B.block(U(u,6,9));B.layEgg({t:1,d:6,b:0})}}});
["e_detonate","e_diary","e_ducks","e_fry","e_phoenix","e_henguard"].forEach(k=>{if(!POOL_HERO.includes(k))POOL_HERO.push(k)});
// 孵化日记：每回合第一次孵化
{const _hE=hatchEggs;hatchEggs=async function(){const n0=(S&&S.stats&&S.stats.hatch)||0;const r=await _hE.apply(this,arguments);try{const v=B&&B.p.pw2&&B.p.pw2.eggdiary;if(v&&!PREV&&!B.over&&((S.stats.hatch||0)>n0)&&B.diaryT!==B.turn){B.diaryT=B.turn;B.p.str+=1;toast("孵化日记：力气 +1");if(v>1)B.draw(1);renderBattle()}}catch(e){}return r}}

/* ---------- 5. 气象流新牌 ---------- */
const wxSeenN=B=>Object.keys(Object.assign({[B.wx0||B.wx]:1},B.wxSeen||{})).length;
Object.assign(CARDS,{
 w_shift:{n:"风云突变",cost:0,type:"skl",r:"C",fam:"none",img:"c7",d:u=>`天气随机变成另一种（不会是晴天），抽 ${U(u,1,2)} 张`,fx:(B,u)=>{const ws=Object.keys(WX).filter(w=>w!=="clear"&&w!==B.wx);B.setWx(pick(ws));B.draw(U(u,1,2))}},
 w_dual:{n:"晴雨两用",cost:1,type:"skl",r:"C",fam:"none",img:"c3",d:u=>`获得 ${U(u,5,7)} 护盾，再看天气：晴/大雾抽 2 张；下雨/雷雨所有敌人潮湿 2；大风奶力 +1；下雪再 +8 护盾`,fx:(B,u)=>{B.block(U(u,5,7));const w=B.wx;if(w==="clear"||w==="fog")B.draw(2);else if(w==="rain"||w==="storm")B.alive().forEach(e=>B.apply(e,"wet",2));else if(w==="wind")B.gainEnergy(1);else if(w==="snow")B.block(8)}},
 w_station:{n:"气象站",cost:1,cu:0,type:"pow",r:"R",fam:"none",img:"m5",d:u=>`每回合第一次变天时，奶力 +1${u?"，抽 1 张":""}`,fx:(B,u)=>{PW(B,"wxstation",u?2:1)}},
 w_seasons:{n:"四季轮转",cost:2,type:"atk",r:"R",fam:"none",img:"m5",tgt:1,d:u=>`造成 ${U(u,6,8)} 伤害，这场战斗经历过几种天气就打几下`,fx:(B,u,t)=>{B.hit(t,U(u,6,8),Math.max(1,wxSeenN(B)))}},
 w_chainbolt:{n:"连环闪电",cost:1,type:"atk",r:"C",fam:"none",img:"c7",d:u=>`随机敌人 ${U(u,7,10)} 伤害；雷雨时改成所有敌人，再打一次`,fx:(B,u)=>{if(!PREV)try{lightning()}catch(e){}if(B.wx==="storm")B.alive().forEach(e=>B.hit(e,U(u,7,10),2));else{const t=pick(B.alive());if(t)B.hit(t,U(u,7,10))}}},
 w_umbrella:{n:"撑伞",cost:1,type:"skl",r:"C",fam:"none",img:"c3",d:u=>`获得 ${U(u,7,10)} 护盾；下雨、下雪或雷雨时护盾翻倍`,fx:(B,u)=>{B.block(U(u,7,10)*(["rain","snow","storm"].includes(B.wx)?2:1))}}});
["w_shift","w_dual","w_station","w_seasons","w_chainbolt","w_umbrella"].forEach(k=>{if(!POOL_HERO.includes(k))POOL_HERO.push(k)});
// 气象站
{const _swS=API.setWx;API.setWx=function(w){const old=this.wx;const r=_swS.apply(this,arguments);try{const v=B&&B.p.pw2&&B.p.pw2.wxstation;if(v&&!PREV&&old!==w&&B.wxStT!==B.turn){B.wxStT=B.turn;B.gainEnergy(1);if(v>1)B.draw(1)}}catch(e){}return r}}

/* ---------- 6. 信箱：6.0.1 更新说明 ---------- */
try{TMAILS.unshift({id:"m601",t:"6.1 · 蛊师加强、奶蛋和气象补完",date:"11月24日",body:[
 "谢谢大家的反馈！这一版给蛊师奶蛙撑腰，把奶蛋流和气象流补完，还加了一批新天赋和新塔况。",
 "【蛊师加强】养蛊发作：每种蛊扣「3 + 第几层」点血（原来固定 2 点）；每种蛊最多 20 层（原来 12）；噬心每层 2 伤害、每种再 +5；初始的寒蛊、火蛊、毒蛊、血蛊、护身蛊数值提高；蛊甲、蛊巢加强；生命 68 → 74",
 "【蛊师专属】熟练度 4 级开局自带「蛊母罐」；新奇招遗物「本命蛊」「万蛊瓮」「春秋蝉」（倒下时满血复活、所有牌升一级，但遗物全部消失）；新奇招牌「蛊王」",
 "【新天赋】奶蛋流：多子多福、暖巢（孵蛋高手也归到奶蛋流）；气象流：看天吃饭、呼风唤雨、风雨无阻；蛊师专属：蛊毒入骨、先下手",
 "【新牌】奶蛋 6 张：炸蛋、孵化日记、一窝鸭蛋、煎蛋、不死鸟蛋、母鸡护巢；气象 6 张：风云突变、晴雨两用、气象站、四季轮转、连环闪电、撑伞",
 "【修复】无尽之塔第二轮起，酒馆不再贴 SS 悬赏、走不了真结局：现在每一轮都会重新出悬赏，每一轮都能再打一次真结局",
 "——奶蛙工作室"]})}catch(e){}

/* ===================== 6.1 ===================== */
/* ---------- 1. 更多天赋 ---------- */
Object.assign(PSCH,{gamble:{n:"运气",c:"#ffd23f",k:"赌"},lastStand:{n:"体魄",c:"#ff5a5d",k:"拼"},minimal:{n:"修行",c:"#b392ff",k:"简"},hoard:{n:"财运",c:"#ffd23f",k:"囤"},secondWind:{n:"体魄",c:"#ff5a5d",k:"喘"},combo:{n:"节奏",c:"#4fc3ff",k:"连"},grudge:{n:"体魄",c:"#ff5a5d",k:"仇"},pet:{n:"伙伴",c:"#7bd06b",k:"宠"}});
Object.assign(PERKS,{
 gamble:{n:"赌徒",ic:"star",max:1,d:"每场战斗开始掷一次骰子：1–3 点力气 -1，4–6 点力气 +2"},
 lastStand:{n:"背水一战",ic:"sword",max:1,d:"生命低于 30% 时，你造成的伤害 +40%"},
 minimal:{n:"断舍离",ic:"deck",max:1,d:"牌组每比 15 张少 1 张，每回合开始多 2 护盾"},
 hoard:{n:"囤积癖",ic:"coin",max:1,d:"每场战斗结束，金币每有 50，最大生命 +1（一局最多 +15）"},
 secondWind:{n:"第二口气",ic:"heart",max:1,d:"每场战斗第一次掉到半血以下时，奶力 +2、抽 2 张"},
 combo:{n:"连环套",ic:"boom",max:1,d:"每回合打出的第 5 张牌，会再生效一次（能力牌除外）"},
 grudge:{n:"吃一堑",ic:"shield",max:1,d:"同一个敌人每打中你 3 次，你对它造成 10 伤害"},
 pet:{n:"养宠物",ic:"net",max:1,d:"每场战斗多抓 1 只；抓到的伙伴卡打完这场自动升一级"}});

/* ---------- 2. 更多塔况 ---------- */
Object.assign(MODS,{
 mirror:{n:"镜像塔",d:"敌人会学你上一回合打出的最后一张牌，但每场战斗多给一次选牌"},
 flip:{n:"反着来",d:"攻击牌费用 -1，技能牌费用 +1"},
 timer:{n:"限时塔",d:"每场战斗第 6 回合起，敌人每回合力气 +2；6 回合内打完多拿 30 金币"},
 loaded:{n:"满载而归",d:"精英和首领多掉一件遗物，但每拿到一件遗物，最大生命 -3"},
 dump:{n:"一张不留",d:"每回合多抽 2 张，但回合结束时手里每剩 1 张牌，失去 1 生命"},
 cats:{n:"猫猫塔",d:"敌人学会了猫的身法，你的攻击有 15% 被闪开；但每场战斗多给一次奶猫牌三选一"},
 night:{n:"夜市",d:"商店晚上才开：每家店多一张稀有牌和一件遗物，但价格在 -30% 到 +30% 之间浮动"},
 gufog:{n:"蛊雾弥漫",d:"每场战斗开始，每个敌人和你都随机中一种蛊 3 层"}});
Object.assign(MOD_GB,{
 mirror:["每场战斗多给一次选牌","敌人会学你上一回合打出的最后一张牌"],
 flip:["攻击牌费用 -1","技能牌费用 +1"],
 timer:["6 回合内打完多拿 30 金币","第 6 回合起，敌人每回合力气 +2"],
 loaded:["精英和首领多掉一件遗物","每拿到一件遗物，最大生命 -3"],
 dump:["每回合多抽 2 张","回合结束时手里每剩 1 张，失去 1 生命"],
 cats:["每场战斗多一次奶猫牌三选一","你的攻击有 15% 被闪开"],
 night:["每家店多一张稀有牌和一件遗物","价格在 -30% 到 +30% 之间浮动"],
 gufog:["每个敌人开场随机中一种蛊 3 层","你开场也随机中一种 3 层"]});

const GU_SELF=["poison","burn","bleed","frost","weak","vuln"];
// 战斗开始
{const _sc61=startCombat;startCombat=function(kind){const r=_sc61.apply(this,arguments);try{if(B&&!PREV&&kind!=="R"){
  B.cardsT=0;B.cardsTurn=-1;
  if(perk("gamble")){const d=1+ri(6);if(d<=3){B.p.str-=1;toast(`赌徒：掷出 <b>${d}</b> 点，力气 -1`)}else{B.p.str+=2;toast(`赌徒：掷出 <b>${d}</b> 点，力气 +2！`)}}
  if(perk("pet"))B.catchLeft=(B.catchLeft||0)+1;
  if(S.mod==="gufog"){B.alive().forEach(e=>B.apply(e,pick(GU_START),3));B.apply(B.p,pick(GU_SELF),3)}
  if(S.mod==="mirror")B.lootCards=(B.lootCards||[]).concat([offerCards(3,"C")]);
  if(S.mod==="cats"){const pool=shuffle(POOL_HERO.filter(k=>CARDS[k].fam==="cat"&&(!CARDS[k].hero||CARDS[k].hero===S.hero))).slice(0,3).map(k=>mk(k));if(pool.length)B.lootCards=(B.lootCards||[]).concat([pool])}
  if(S.mod==="loaded"&&"EBKMF".includes(kind))B.lootRelic2=1;
  // 最终之地：首领都稍微强一点
  if(S.fin)B.enemies.forEach(e=>{e.max=Math.round(e.max*1.12);e.hp=e.max;e.str=(e.str||0)+1;e.str0=(e.str0||0)+1});
  renderBattle()}}catch(e){console.warn(e)}return r}}
// 最终之地的深渊龙蛙真身也厚一点
{const _bf61=bossFormSeq;bossFormSeq=async function(t,kind){const r=await _bf61.apply(this,arguments);try{if(S&&S.fin&&t&&t.id==="abyssdragon"&&kind==="revive"){t.max=450;t.hp=450;renderBattle()}}catch(e){}return r}}
// 每回合开始
{const _st61=startTurn;startTurn=async function(){const r=await _st61.apply(this,arguments);try{if(B&&!B.over&&!PREV){
  const mn=perk("minimal")&&S.deck.length<15?2*(15-S.deck.length):0;if(mn)B.block(mn,1);
  if(S.mod==="timer"&&B.turn>=6){B.alive().forEach(e=>{e.str=(e.str||0)+2});toast("限时塔：敌人越打越急，力气 +2")}
  if(S.mod==="dump")B.draw(2);
  if(S.mod==="mirror"&&B.mirrorId&&B.turn>1){const D=CARDS[B.mirrorId],e=pick(B.alive());B.mirrorId=null;if(D&&e){fxSay(e,"学你：「"+D.n+"」");if(D.type==="atk"){const v=5+2*(S.act||0)+(e.str||0);setTimeout(()=>{try{if(!B||B.over)return;dmgPlayer(v,e);renderBattle();if(S.hp<=0)lose()}catch(err){}},400)}else if(D.type==="pow")e.str=(e.str||0)+1;else e.block=(e.block||0)+6+2*(S.act||0)}}
  renderBattle()}}catch(e){console.warn(e)}return r}}
// 打牌：连环套、镜像塔记牌
{const _pc61=playCard;playCard=async function(c,target){const id=c&&c.id,u=c&&(c.u|0);const r=await _pc61.apply(this,arguments);try{if(B&&!B.over&&!PREV&&id&&CARDS[id]){
  if(B.cardsTurn!==B.turn){B.cardsTurn=B.turn;B.cardsT=0}B.cardsT++;B.mirrorId=id;
  if(perk("combo")&&B.cardsT===5&&CARDS[id].type!=="pow"&&CARDS[id].fx&&B.alive().length){toast(`连环套：<b>${CARDS[id].n}</b> 再来一次！`);const t=target&&target.hp>0?target:B.alive()[0];B.curType=CARDS[id].type;B.curFam=CARDS[id].fam;try{CARDS[id].fx(B,u,t)}finally{B.curType=null}renderBattle();if(!B.alive().length&&!B.over)win()}}}catch(e){console.warn(e)}return r}}
// 受伤：第二口气、吃一堑
{const _dp61=dmgPlayer;dmgPlayer=function(v,src,raw){const h0=S?S.hp:0;const r=_dp61.apply(this,arguments);try{if(B&&!PREV&&!B.over&&S.hp<h0){
  if(perk("secondWind")&&!B.swUsed&&S.hp>0&&S.hp<S.max/2){B.swUsed=1;if(B.myTurn){B.gainEnergy(2);B.draw(2)}else{B.p.nextEnergy=(B.p.nextEnergy||0)+2;B.p.nextDraw=(B.p.nextDraw||0)+2}toast("第二口气：奶力 +2，抽 2 张")}
  if(perk("grudge")&&src&&src.hp>0&&B.enemies.includes(src)){src.grudgeN=(src.grudgeN||0)+1;if(src.grudgeN>=3){src.grudgeN=0;setTimeout(()=>{try{if(B&&!B.over&&src.hp>0){dealEnemy(src,10);fxSay(src,"吃一堑 10");renderBattle();if(!B.alive().length)win()}}catch(e){}},200)}}}}catch(e){}return r}}
// 造成伤害：背水一战、猫猫塔闪避
{const _de61=dealEnemy;dealEnemy=function(t,d,i){try{if(B&&!PREV&&B.curType&&d>0){if(S.mod==="cats"&&B.curType==="atk"&&rnd()<.15){fxSay(t,"闪开了！");return}if(perk("lastStand")&&S.hp<S.max*.3)d=Math.round(d*1.4)}}catch(e){}return _de61.call(this,t,d,i)}}
// 回合结束：一张不留
{const _et61=endTurn;endTurn=function(){const was=B&&B.myTurn&&!B.over;const n=was&&S.mod==="dump"?B.hand.filter(c=>!["cur","sts"].includes(CARDS[c.id].type)).length:0;const r=_et61.apply(this,arguments);try{if(was&&n&&B&&!B.myTurn&&!PREV){dmgPlayer(n,null,true);toast(`一张不留：手里剩 ${n} 张，失去 <b>${n}</b> 生命`);if(S.hp<=0)lose()}}catch(e){}return r}}
// 赢了：囤积癖、养宠物、限时塔
{const _w61=win;win=async function(){try{if(B&&!B.over&&B.kind!=="R"&&!B.alive().length){
  if(perk("hoard")){S.hoardN=S.hoardN||0;const a=Math.min(Math.floor(S.gold/50),15-S.hoardN);if(a>0){S.hoardN+=a;S.max+=a;S.hp+=a;toast(`囤积癖：最大生命 +${a}`)}}
  if(S.mod==="timer"&&B.turn<=6){S.gold+=30;toast("限时塔：6 回合内打完，<b>+30</b> 金币")}
  if(perk("pet"))S.deck.forEach(c=>{if(CARDS[c.id]&&CARDS[c.id].r==="P"&&!c.u&&upOK(c))c.u=1})}}catch(e){}return _w61.apply(this,arguments)}}
// 反着来：费用
{const _bc61=baseCost;baseCost=function(c){const v=_bc61.apply(this,arguments);try{if(S&&S.mod==="flip"&&v>=0){const t=CARDS[c.id].type;if(t==="atk")return Math.max(0,v-1);if(t==="skl")return v+1}}catch(e){}return v}}
// 满载而归：拿遗物掉最大生命
{const _gr61=gainRelic;gainRelic=function(id){const n=S?S.relics.length:0;const r=_gr61.apply(this,arguments);try{if(S&&S.mod==="loaded"&&S.relics.length>n){S.max=Math.max(10,S.max-3);S.hp=Math.min(S.hp,S.max);toast("满载而归：背包又重了，最大生命 -3");renderTop()}}catch(e){}return r}}
// 夜市
{const _ss61=shopScreen;shopScreen=function(mode){const fresh=S&&S.cur&&!S.cur.shop;const r=_ss61.apply(this,arguments);try{if(fresh&&S.mod==="night"&&S.cur.shop&&!S.cur.shop.night){const sh=S.cur.shop;sh.night=1;const jit=p=>Math.max(5,Math.round(p*(.7+rnd()*.6)));
  (sh.cards||[]).forEach(x=>x.p=jit(x.p));(sh.relics||[]).forEach(x=>x.p=jit(x.p));(sh.pots||[]).forEach(x=>x.p=jit(x.p));
  const rc=offerCards(1,"R",1)[0];if(rc&&sh.cards)sh.cards.push({c:rc,p:jit(95)});const rl=randRelic("R");if(rl&&sh.relics&&!sh.relics.some(x=>x.id===rl))sh.relics.push({id:rl,p:jit(280)});
  saveRun();return _ss61.apply(this,arguments)}}catch(e){console.warn(e)}return r}}

/* ---------- 3. 信箱：6.1 ---------- */
try{const m=TMAILS.find(x=>x.id==="m601");if(m){m.id="m613";m.t="6.1.3 · 同伴结局提示 + 存档找回 + 蛊师加强、新天赋、新塔况";m.body.splice(m.body.length-1,0,
 "【新天赋 8 个】赌徒、背水一战、断舍离、囤积癖、第二口气、连环套、吃一堑、养宠物",
 "【新塔况 8 个】镜像塔、反着来、限时塔、满载而归、一张不留、猫猫塔、夜市、蛊雾弥漫",
 "【首领】最终之地的五位首领和深渊龙蛙都稍微加强了一点（生命 +12%、力气 +1，龙蛙真身 450 血）",
 "【修复】刚开局还没打过一场就退出，不再给记忆碎片和熟练度",
 "【6.1.3】20 个同伴结局成就的提示也写细了：哪一层遇到、每一步选哪个、和同一个同伴的其他结局差在哪，在成就页里能看到",
 "【6.1.2】隐藏成就的提示写详细了：在哪一层、哪个事件、选哪个都写清楚了。老铁和小火多了「不救」的同伴结局（名人堂里能看到）。设置里加了「从云端找回存档」",
 "【6.1.1 紧急修复】6.1 的安装包漏了 B站 的连接组件，导致云存档和排行榜都连不上、看起来像存档没了。存档其实一直都在，这一版打开就能找回来。对不起大家")}}catch(e){}

/* ===================== 6.1.1：隐藏成就的提示写详细一点（在哪一层、哪个事件、选哪个） ===================== */
const ACH_HINT2={
 jailbreak:"走岔路（.5 层）时会路过「岔路检查站」。被关进牢房后选「越狱」：一半机会溜出去（还顺走一件遗物），一半会被抓回来。没成功就下次再试",
 sweet:"第四层「沸腾奶茶厂」的「？」里有个「传送带」事件，选「喝一杯」（最大生命 +8，但会拿到诅咒「沉重」）",
 seven:"任何一层的「？」都可能遇到「布娃娃」事件（背后绣着「七」），选「带上它」，然后一直带着它打败大魔王登顶",
 isekai:"第二层起，每次走进「？」都有很小的几率（约 4%，一局最多一次）推开「异世界之门」。多走「？」格子",
 isekai2:"进了「异世界之门」以后，门里那只奶蛙可以抓。进门前把抓捕机会留着，用网把它抓住",
 pipe3:"死斗场最后一场的「不灭的斗士」背后有奶茶管：一回合里打它足够多的伤害就能打断，管子修好后还能再断。它半血会砸掉罐子，之后就打不断了——所以要在它半血之前，在同一场里打断 3 次",
 champnobreak:"打「不灭的斗士」时，一次都不要打断它背后的奶茶管（一回合别打出太高伤害），让它一直喝，然后照样把它打倒",
 dsqfull:"死斗场五连战打完的那一刻，生命要是满的。中间的休息室选「坐下歇一会儿」，不要选「对着墙上的划痕练拳」（选了这一局就拿不到），最后一场一滴血都别掉",
 hornclick:"在死斗场里，屏幕上有一只报幕员的喇叭，点它。累计点 10 次就行（每次会说一句话）",
 debuff8:"身上同时挂着 8 种不同的负面状态（中毒、烫伤、虚弱、易伤、冻伤、梦魇、麻痹、诅咒……）。第五层隐藏路线尽头的「灭却诅咒师」最会上咒，打它时什么解药都别用，撑几回合",
 truth:"三条 SS 线做完后：在「预言家的书房」里把写着阿岳名字的本子带走（得到「阿岳的本子」），然后在塔顶打倒阿岳时选「宽恕」",
 prophet:"先救出迷你奶茶杯（死斗场），第五层地图会出现一条隐藏路线，尽头是「灭却诅咒师」，打败它。再走真结局路线：塔顶宽恕阿岳 → 打碎魔椅的意志，就会看到预言家",
 noDebuff:"打倒「灭却诅咒师」的那一刻，身上一个负面状态都没有。最后一下之前喝解毒剂、安神茶，或者带着「清心铃」清掉",
 nopot:"打「灭却诅咒师」那一整场，一瓶药水都不喝",
 hv_bottle:"先在寂静之海打败「守墓者」（这一局或以前打过都算），然后第四层奶茶厂的「？」里会出现「管子里的漂流瓶」，两个选项随便选一个",
 hv_bones:"第四层奶茶厂的「？」里会出现「会哼歌的骨头」，选「跟着哼一遍」或「把骨头搬到凉快的地方」都行",
 hv_ticket:"死斗场还没打完的时候，第四层奶茶厂的「？」里会出现「旧门票」，选哪个都行",
 hv_bookie:"死斗场还没打完的时候，第四层奶茶厂的「？」里有「地下赌档」（戴绿眼罩的庄家），选「押冠军（押 50）」",
 bookie:"在第四层的「地下赌档」选「押挑战者」（押你自己），然后去死斗场把冠军「不灭的斗士」打倒，会多拿 150 金币",
 hv_cheer:"第四层奶茶厂的「？」里会出现「空看台」，两个选项随便选",
 hv_robes:"第五层星空之顶的「？」里会出现「一柜子黑袍子」，翻口袋或者穿上一件都行",
 hv_apprentice:"第五层星空之顶的「？」里会出现「抄写的小学徒」，两个选项随便选",
 hv_bridge:"第五层星空之顶的「？」里会出现「第三座桥」（有人在锯桥墩），拦住他或者在旁边看都行",
 hv_crystal:"第五层星空之顶的「？」里会出现「碎掉的水晶球」，看一眼或者踩碎都行",
 hv_conch:"先在寂静之海打败「守墓者」，然后从第四层起，「？」里会出现「海螺」，两个选项随便选",
 hv_cupdream:"先在死斗场救出「迷你奶茶杯」，之后的「？」里会出现「奶茶杯睡着了」，两个选项随便选",
 hv_seaguard:"这一局在寂静之海打败「守墓者」以后，第五层星空之顶的「？」里会出现「没寄出去的信」（倒在路边的邮筒）",
 dice66:"在酒馆和客人掷骰子（一次押 30 金币），掷出两个 6。多掷几次就有",
 dice11:"在酒馆掷骰子，掷出两个 1",
 diceBroke:"在酒馆掷骰子输掉以后，身上剩不到 30 金币",
 relic25:"身上同时带着 25 件遗物：遗物都别卖、别换，精英和宝箱的遗物都拿，无尽之塔里每一轮还会送一件",
 hit10k:"一下打出 10000 点以上伤害：力气叠高 + 敌人易伤 + 金卡多次触发 + 顿悟 / 通透世界 / 星之力，全压在一张牌上",
 hit1m:"一下打出 100 万点以上伤害。无尽之塔后面几轮，把所有加成叠在同一下",
 eggs30:"场上同时有 30 枚蛋：多带奶蛋牌，「暖窝」「蛋雨」「鸡生蛋」一起用，先别用「催孵」「破壳」",
 greedy:"地图中间几排有时会出现「秘密房间」格子（大约一半的地图有）。如果是「睡着的宝库」，连续选「再抓一把」5 次（越抓越容易吵醒它，有点赌运气）",
 teamaster:"走进「秘密房间」，如果是「没人的奶茶厨房」：先选「先放珍珠」，再选「放糖」"};
try{Object.assign(ACH_HINT,ACH_HINT2);ACH.forEach(a=>{if(ACH_HINT2[a.id])a.h=ACH_HINT2[a.id]})}catch(e){console.warn(e)}

/* ===================== 6.1.1：同伴的「不救」结局 =====================
   老铁：锅炉炸开时可以不回头；小火：冻在冰里没救、或者在奶茶厂顾不上兄弟俩，到台阶下都会记一个结局 */
try{
 const I3=EVENTS.c_iron3;if(I3){const o0=I3.o;I3.o=()=>{const L=o0();L.push({t:"顾不上它，继续往前跑",d:"<span class='bad'>老铁不会再跟上来</span>",f:()=>{const c=cp();c.gone=1;c.left=1;compEnd("iron","left");saveRun();return"你跑出去很远才回头。锅炉房的蒸汽里，老铁还站在原地，盔甲烫得通红。它没有喊你。<br>后来，星空之顶的台阶下没有人等你。"}});return L}}
 const F3=EVENTS.c_fire3;if(F3){const o3=F3.o;F3.o=()=>{const L=o3();if(cp().alive)L.push({t:"现在顾不上",d:"<span class='bad'>兄弟俩会留在奶茶厂</span>",f:()=>{cp().left3=1;return"小火拉着哥哥的袖子，看着你走远。它没有喊你，只是把那个比它还大的包，又往背上提了提。"}});return L}}
 const F4=EVENTS.c_fire4;if(F4){const o4=F4.o;F4.o=()=>{const c=cp();if(!c.freed&&!c.scarf&&!c.stay)return[{t:"继续往上",d:"",f:()=>{if(c.alive)compEnd("fire","left");else compEnd("fire","ice");return c.alive?"台阶很长。你想起传送带边那两只奶马，大的在搬箱子，小的在帮他扶着。":"你把手伸进包里，摸到了那条红围巾。它还是软的。"}}];return o4()}}
 const ADD=[["iron","left","没回头","锅炉炸开时，你没有回头扶老铁","奶茶厂的锅炉炸开时，你可以不回头"],["fire","left","还在搬箱子","把小火和哥哥留在了奶茶厂","奶茶厂的传送带边，也可以说「现在顾不上」"],["fire","ice","冰里的围巾","没有把小火从冰里救出来","冰原上那块奇怪的冰，也可以不管"]];
 ADD.forEach(x=>{if(!CE_LIST.some(y=>y[0]===x[0]&&y[1]===x[1])){CE_LIST.push(x);ACH.push({id:"ce_"+x[0]+"_"+x[1],n:x[2],d:x[3],ic:"star",hid:1,h:x[4]})}});
}catch(e){console.warn(e)}

/* ===================== 6.1.1：设置里加「从云端找回存档」 =====================
   本机看不到进度时（换了设备、换了打开的地方），可以手动从 B站 云存档拉回来 */
async function cloudRecover(){sfx("click");if(!(window.toy&&toy.getCloudStorage)){toast("要在 B站 里打开游戏，才能用云存档");return}
 toast("正在读取云存档……");let o=null;
 try{const r=await TOY.timeout(toy.getCloudStorage(["tw_m"]),8000);const mt=r&&r.tw_m?JSON.parse(r.tw_m):null;if(mt&&mt.n&&mt.n<=120){const ks=[...Array(mt.n)].map((_,i)=>"tw_"+i);const r2=await TOY.timeout(toy.getCloudStorage(ks),10000);o=JSON.parse(ks.map(k=>(r2&&r2[k])||"").join(""))}}catch(e){toast("云存档暂时连不上，稍后再试（请确认已经登录 B站）");return}
 if(!o||!o.m){toast("云端还没有你的存档");return}
 const m=o.m,f=x=>(x||0).toLocaleString();const cmp=`<table style="margin:10px auto;font-size:18px;border-spacing:16px 6px"><tr><td></td><td><b>云端</b></td><td><b>这台设备</b></td></tr><tr><td>通关</td><td>${f(m.wins)} 次</td><td>${f(M.wins)} 次</td></tr><tr><td>记忆碎片</td><td>${f(m.shards)}</td><td>${f(M.shards)}</td></tr><tr><td>游玩时长</td><td>${fmtPlay(m.playMs)}</td><td>${fmtPlay(M.playMs)}</td></tr></table>`;
 const ok=await shopConfirm(`<div style="padding:6px 10px"><h3 style="margin:0 0 6px">从云端找回存档</h3><p>找回后，这台设备上的进度会和云端的合在一起（取两边更多的那份）。</p>${cmp}</div>`,0,"找回");
 if(!ok)return;try{if(S&&!S.noSave){toast("请先回到主页再找回");return}CLOUD.apply(o)}catch(e){toast("找回失败："+e.message)}}
{const _sx=settings;settings=function(){const r=_sx.apply(this,arguments);try{const row=document.querySelector("#ov .modal .row");if(row&&!document.getElementById("sCloud")&&(!S||S.noSave)){const b=document.createElement("button");b.className="btn sm ghost";b.id="sCloud";b.style.minWidth="240px";b.textContent="从云端找回存档";b.onclick=cloudRecover;row.insertBefore(b,row.lastElementChild)}}catch(e){}return r}}

/* ===================== 6.1.3：同伴结局的成就提示写细 =====================
   同伴是随机遇到的（最近三局没见过的优先）。每层第一次走进「？」（或带蓝圈的「路遇」格）就会碰到它的这一段；
   这一层一个「？」都不进，这一段就跳过了。 */
const CE_PRE="（同伴是随机遇到的，每层第一次进「？」会碰到它）";
const CE_HINT2={
 iron_let:"第一层遇到老奶狗「老铁」，选「一起走」。第三层打完初号机 SS 后，在第四层酒馆任务板接下 SS 悬赏「地底下的号子声」，走彩色隐藏路线进死斗场。打到最后一场「不灭的斗士」前，老铁会站在门口——选「不拦他」。之后在第五层星空之顶进「？」拿到老铁的剑",
 iron_stop:"第一层遇到「老铁」选「一起走」，带着它进第四层的死斗场（要先在第三层打完初号机 SS，再在第四层酒馆任务板接「地底下的号子声」）。最后一场「不灭的斗士」前，老铁站在门口——选「拦住他」，自己上场。选完当场就记下",
 iron_tog:"第一层遇到「老铁」选「一起走」，带着它进第四层的死斗场（先打完第三层初号机 SS，再在第四层酒馆任务板接「地底下的号子声」）。最后一场前选「跟他一起上」（老铁每回合帮你砍一刀），打赢不灭的斗士，然后在第五层星空之顶进「？」见它最后一面",
 iron_base:"第一层遇到「老铁」选「一起走」，第四层锅炉炸开时选「扶住它」，这一局不要去死斗场。一路带着它到第五层星空之顶，进「？」就能看到",
 iron_left:"第一层遇到「老铁」选「一起走」。第四层沸腾奶茶厂里，锅炉炸开、老铁替你挡住滚烫的奶茶时，选「顾不上它，继续往前跑」。选完当场就记下",
 blue_paid:"遇到蓝色奶猫「阿蓝」（借不借它 30 金币都行）。第四层沸腾奶茶厂门口，债主把它按在墙上时，选「替它还 100 金币」（身上要有 100）。然后在第五层星空之顶进「？」",
 blue_bet:"遇到「阿蓝」。第四层奶茶厂门口债主来时选「打跑它们」。然后同一层去死斗场把五连战打完（先在第三层打完初号机 SS，再在第四层酒馆任务板接「地底下的号子声」）——阿蓝会押你赢。最后在第五层星空之顶进「？」",
 blue_hide:"遇到「阿蓝」。第四层奶茶厂门口债主来时选「打跑它们」，这一局不去死斗场（或者没打完）。然后在第五层星空之顶进「？」",
 blue_left:"遇到「阿蓝」。第四层奶茶厂门口债主把它按在墙上时，选「这是它自己的事」。之后在第五层星空之顶进「？」，台阶下会放着它的骰子",
 fire_home:"第一层遇到背大包的小奶马「小火」，选「一起走吧」。第三层冰原它被冻在冰里时救它（「用体温把冰焐化」或「花 60 金币买火炭」）。第四层奶茶厂找到它哥哥时，选「打工头，把他抢出来」并打赢，或者「花 100 金币替他还债」。最后在第五层星空之顶进「？」",
 fire_stay:"第一层遇到「小火」选「一起走吧」，第三层冰原把它从冰里救出来。第四层奶茶厂找到它哥哥时，选「让小火自己决定」。选完当场就记下",
 fire_scarf:"第一层遇到「小火」选「一起走吧」。第三层冰原它被冻在冰里时选「来不及了，继续往上」（你会收下它的红围巾）。第四层奶茶厂传送带边碰到那只大奶马，选「把红围巾交给它」。最后在第五层星空之顶进「？」",
 fire_left:"第一层遇到「小火」选「一起走吧」，第三层冰原把它从冰里救出来。第四层奶茶厂找到它哥哥时，选「现在顾不上」。最后在第五层星空之顶进「？」",
 fire_ice:"第一层遇到「小火」选「一起走吧」。第三层冰原它被冻在冰里时选「来不及了，继续往上」；第四层传送带边碰到那只大奶马时选「什么都不说」。最后在第五层星空之顶进「？」",
 bean_ok:"第一层遇到陷在泥里的邮差「豆子」（先拉谁都行）。第三层冰原钟楼里它问能不能拆包裹，选「别拆」；第四层奶茶厂它掉上传送带时，选「抓住豆子」。最后在第五层星空之顶进「？」",
 bean_cold:"第一层遇到邮差「豆子」。第三层冰原钟楼里它问能不能拆包裹，选「打开看看」；第四层奶茶厂它掉上传送带时，选「抓住豆子」。最后在第五层星空之顶进「？」",
 bean_self:"第一层遇到邮差「豆子」。第四层奶茶厂它掉上传送带、喊「先抓包裹」时，选「抓住包裹」（第三层拆没拆都行）。最后在第五层星空之顶进「？」，替它把包裹送到",
 hen_full:"第一层遇到丢了蛋的奶鸡「桂嫂」，选「一起找」。要找回至少 5 个蛋：第二层古堡选「追」（+1），第三层冰原选「把冰敲开」（+1）或「连冰带蛋抱着走」（第四层孵出来 +1，还送一只小鸡），第四层茶叶蛋车间选「冲进去」并打赢精英（+4）。最后在第五层星空之顶进「？」",
 hen_some:"第一层遇到奶鸡「桂嫂」选「一起找」，一路只找回 1～4 个蛋：比如第四层茶叶蛋车间选「你一个人进去」（+2）或「来不及了」，不要打那场精英。最后在第五层星空之顶进「？」",
 hen_none:"第一层遇到奶鸡「桂嫂」选「一起找」，然后一个蛋都别找回：第二层选「别追了，先歇口气」，第三层一个「？」都不进（冰里的蛋不管怎么选都会找回来），第四层茶叶蛋车间选「来不及了」。最后在第五层星空之顶进「？」"};
try{ACH.forEach(a=>{const k=a.id.replace(/^ce_/,"");if(a.id.startsWith("ce_")&&CE_HINT2[k])a.h=CE_PRE+CE_HINT2[k]})}catch(e){console.warn(e)}
// 成就提示变长了：提示框放宽、整个留在屏幕里，并且多停一会儿（够读完）
{const _as6=achScreen;achScreen=async function(){const r=_as6.apply(this,arguments);try{const g=$("#achGrid");if(g&&!g.dataset.h613){g.dataset.h613=1;g.addEventListener("click",()=>{const d=[...document.querySelectorAll("#stage .tipBox")].pop();if(!d||!d.querySelector(".achHint"))return;const L=d.textContent.length;if(L>70){const w0=(L>160?460:360)+"px";d.style.setProperty("width",w0,"important");d.style.setProperty("max-width",w0,"important")}
  const h=d.offsetHeight,w=d.offsetWidth;let x=parseFloat(d.style.left)||10,y=parseFloat(d.style.top)||10;x=Math.max(10,Math.min(1270-w,x));y=Math.max(10,Math.min(710-h,y));d.style.left=x+"px";d.style.top=y+"px";
  try{clearTimeout(TIP_T);TIP_T=setTimeout(closeTip,Math.max(3500,L*120))}catch(e){}})}}catch(e){}return r}}

/* ===================== 6.1.5：蛊师更容易拿到奶猫牌 =====================
   蛊师自己的牌不属于任何家族，不进奶蛙池、不能三连；她要回血，就靠奶猫家族（三连：回复 4 生命、抽 2 张）。
   选牌奖励里每张非蛊师的牌，有 8% 换成同稀有度的奶猫牌：三选一里出现奶猫牌的机会从约 14% 变成约 25% */
{const _oc=offerCards;offerCards=function(n,kind,force,shinyFirst){const out=_oc.apply(this,arguments);try{if(isGu()&&!force){out.forEach((c,i)=>{const D=CARDS[c.id];if(!D||D.hero==="gushi"||D.fam==="cat"||rnd()>=.08)return;
  const pool=POOL_HERO.filter(x=>CARDS[x].fam==="cat"&&!CARDS[x].hero&&CARDS[x].r===D.r&&!out.some(o=>o.id===x));if(pool.length){const nc=mk(pick(pool),0);if(c.sh)nc.sh=c.sh;out[i]=nc}})}}catch(e){console.warn(e)}return out}}
try{const m=TMAILS.find(x=>x.id==="m613");if(m){m.id="m615";m.t="6.1.5 · 蛊师更容易拿到奶猫牌 + 同伴结局提示";m.body.splice(m.body.length-1,0,"【6.1.5】蛊师自己的牌不进奶蛙池、不能三连，回血全靠奶猫家族。现在蛊师选牌时更容易拿到奶猫牌（凑奶猫三连：回复 4 生命、抽 2 张）")}}catch(e){}

/* ===================== 6.1.5：蛊师有了「蛊」家族 =====================
   以前蛊师专属牌是「无家族」，不进奶蛙池、凑不了三连（魔法师的法术牌本来就会往池里放魔法符文，不用改）。现在：
   · 蛊师专属牌 → 蛊家族。三连爆发：所有敌人各加 1 种随机的蛊 3 层，你回复 3 生命（连锁越高越多）
   和其他主角一样，开局的蛊牌也算蛊家族 */
FAM.gu={n:"蛊",c:"#7fae3e"};
try{Object.values(CARDS).forEach(D=>{if(D.hero==="gushi"&&D.fam==="none")D.fam="gu"})}catch(e){console.warn(e)}
try{FAMINFO.gu="蛊家族：蛊师奶蛙专属。三连爆发：所有敌人各加 1 种随机的蛊 3 层，你回复 3 生命。"}catch(e){}
{const _pf=API.poolFx;API.poolFx=function(f,lv=1,n=3){const r=_pf.apply(this,arguments);try{if(f==="gu"&&!PREV&&!this.over){const k=lv||1;const ks=["burn","bleed","poison","frost","wet","mud"];this.alive().forEach(e=>this.apply(e,pick(ks),3*k));this.heal(3*k);renderBattle()}}catch(e){console.warn(e)}return r}}

/* ===================== 6.1.6 =====================
   1. 卡牌说明太长时字自动缩小，从上往下排，不再顶到「攻击 / 家族」小标签下面
   2. 设置里加「手机震动」「震屏」两个开关
   3. 成就「浑身是病」：8 种负面状态实测打不到，改成 6 种
   4. 信箱：奶蛙工作室第三部《奶蛙牌》已发布 */
{const _ch=cardHTML;cardHTML=function(c,cls){let h=_ch.apply(this,arguments);try{const m=/<div class="ds"><span>([\s\S]*?)<\/span><\/div>/.exec(h);if(m){const n=m[1].replace(/<[^>]*>/g,"").length;const k=n>66?"l3":n>50?"l2":n>36?"l1":"";if(k)h=h.replace('<div class="ds">',`<div class="ds ${k}">`)}}catch(e){}return h}}
// 开关存在本机
const VIB=(()=>{let v={vib:1,shake:1};try{Object.assign(v,JSON.parse(localStorage.getItem("nwt-fx")||"{}"))}catch(e){}return v})();
const vibSave=()=>{try{localStorage.setItem("nwt-fx",JSON.stringify(VIB))}catch(e){}};
try{if(navigator.vibrate){const _v=navigator.vibrate.bind(navigator);navigator.vibrate=function(){return VIB.vib?_v.apply(null,arguments):false}}}catch(e){}
{const _sk=stageShake;stageShake=function(){if(!VIB.shake)return;return _sk.apply(this,arguments)}}
{const _se=settings;settings=function(){const r=_se.apply(this,arguments);try{const row=document.querySelector("#ov .modal .row");if(row&&!document.getElementById("sVib")){
  const mk=(id,t,on)=>{const b=document.createElement("button");b.className="btn sm "+(on?"":"ghost");b.id=id;b.style.minWidth="240px";b.textContent=t+"："+(on?"开":"关");return b};
  const bv=mk("sVib","手机震动",VIB.vib),bs=mk("sShk","震屏",VIB.shake);bv.style.minWidth=bs.style.minWidth="116px";const pair=document.createElement("div");pair.style.cssText="display:flex;gap:8px;justify-content:center";pair.appendChild(bv);pair.appendChild(bs);const after=document.getElementById("sSpeed");if(after)after.after(pair);else row.appendChild(pair)
  bv.onclick=()=>{VIB.vib=VIB.vib?0:1;vibSave();sfx("click");bv.textContent="手机震动："+(VIB.vib?"开":"关");bv.classList.toggle("ghost",!VIB.vib)};
  bs.onclick=()=>{VIB.shake=VIB.shake?0:1;vibSave();sfx("click");bs.textContent="震屏："+(VIB.shake?"开":"关");bs.classList.toggle("ghost",!VIB.shake)}}}catch(e){console.warn(e)}return r}}
// 成就：8 种 → 6 种
try{const a=ACH.find(x=>x.id==="debuff8");if(a){a.d="身上同时有 6 种负面状态";a.h="身上同时挂着 6 种不同的负面状态（中毒、烫伤、虚弱、易伤、冻伤、梦魇、麻痹、诅咒……）。第五层隐藏路线尽头的「灭却诅咒师」最会上咒，打它时先别解，撑几回合"}if(typeof ACH_HINT!=="undefined")ACH_HINT.debuff8=a&&a.h}catch(e){}
{const _ap6=API.apply;API.apply=function(t,s,v){const r=_ap6.apply(this,arguments);try{if(t===this.p&&negKinds(this.p).length>=6)ach("debuff8")}catch(e){}return r}}
// 信箱
try{TMAILS.unshift({id:"m616pai",t:"奶蛙工作室的第三部作品《奶蛙牌》已发布！",date:"11月24日",body:[
 "爬塔的各位，好久不见！奶蛙工作室的第三部作品《奶蛙牌》已经发布啦。",
 "这次是一款卡牌肉鸽：用掼蛋的牌型来打——凑对子、顺子、炸弹，压住对手的牌，攒一队奶蛙伙伴，从打 2 一路打到打 A。",
 "塔里的老朋友们也都在：奶蛙、奶猫、奶马、奶鸡，还有好几位被你打败过的首领，这次换了个身份在牌桌上等你。",
 "不会掼蛋也没关系，第一局长老会手把手教你。",
 "——奶蛙工作室",
 "【6.1.6】卡牌说明太长时字会自动缩小，不再被卡面上的小标签挡住；设置里加了「手机震动」「震屏」开关；成就「浑身是病」改成同时 6 种负面状态（8 种实测打不到）"]})}catch(e){}
// 主页 logo 旁边的版本号跟着 VER 走（以前写死在样式里是 6.0）
try{const s=document.createElement("style");s.textContent=`#title .logo::after{content:"VER ${VER}"!important}`;document.head.appendChild(s)}catch(e){}
