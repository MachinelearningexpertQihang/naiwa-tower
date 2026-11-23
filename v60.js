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
{const _ap=API.apply;API.apply=function(t,s,v){const r=_ap.apply(this,arguments);try{if(isGu()&&t!==this.p&&GU_KEYS.includes(s)&&t[s]>12)t[s]=12}catch(e){}return r}}
// 养蛊：回合结束时发作
{const _et=endTurn;endTurn=function(){const was=B&&B.myTurn&&!B.over;const r=_et.apply(this,arguments);try{if(was&&B&&!B.myTurn&&isGu()&&!PREV){B.enemies.forEach(e=>{if(e.hp<=0)return;const n=guKinds(e);if(n>0){dealEnemy(e,2*n);fxSay(e,`蛊发作 ×${n}`)}});renderBattle()}}catch(e){console.warn(e)}return r}}

/* 蛊师的牌 */
const guT=(B,t)=>t&&t.hp>0?t:B.alive()[0];
const GU_CARD=(o)=>Object.assign({fam:"none",img:"v_gushi",hero:"gushi"},o);
Object.assign(CARDS,{
 gu_frost:GU_CARD({n:"寒蛊",cost:1,type:"skl",r:"S",tgt:1,d:u=>`敌人冻伤 ${U(u,3,4)}、潮湿 1`,fx:(B,u,t)=>{const x=guT(B,t);if(x){B.apply(x,"frost",U(u,3,4));B.apply(x,"wet",1)}}}),
 gu_fire:GU_CARD({n:"火蛊",cost:1,type:"skl",r:"S",tgt:1,d:u=>`敌人烫伤 ${U(u,5,7)}。敌人潮湿的话，变成蒸汽：烫伤 ×1.5`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"burn",Math.round(U(u,5,7)*((x.wet||0)>0?1.5:1)))}}),
 gu_poison:GU_CARD({n:"毒蛊",cost:1,type:"skl",r:"S",tgt:1,d:u=>`敌人中毒 ${U(u,4,6)}`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"poison",U(u,4,6))}}),
 gu_bleed:GU_CARD({n:"血蛊",cost:1,type:"skl",r:"S",tgt:1,d:u=>`敌人流血 ${U(u,4,6)}`,fx:(B,u,t)=>{const x=guT(B,t);if(x)B.apply(x,"bleed",U(u,4,6))}}),
 gu_guard:GU_CARD({n:"护身蛊",cost:1,type:"skl",r:"S",d:u=>`获得 ${U(u,6,9)} 护盾`,fx:(B,u)=>{B.block(U(u,6,9))}}),
 gu_devour:GU_CARD({n:"噬心",cost:2,type:"atk",r:"S",tgt:1,d:u=>`吃掉一个敌人身上所有的蛊，每 1 层造成 ${u?"1.5":"1"} 伤害，每种不同的蛊再加 3`,fx:(B,u,t)=>{const x=guT(B,t);if(!x)return;const n=guKinds(x),all=guAll(x);GU_KEYS.forEach(k=>{x[k]=0});x.poisonT=0;B.hit(x,Math.round(all*(u?1.5:1))+3*n,1,1)}}),
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
 gu_shell:GU_CARD({n:"蛊甲",cost:1,type:"skl",r:"C",d:u=>`获得护盾：所有敌人身上蛊的种类加起来 × ${U(u,3,4)}（至少 5）`,fx:(B,u)=>{const n=B.alive().reduce((s,e)=>s+guKinds(e),0);B.block(Math.max(5,n*U(u,3,4)))}}),
 gu_seek:GU_CARD({n:"寻蛊",cost:0,type:"skl",r:"C",exh:1,d:u=>`抽 ${U(u,2,3)} 张`,fx:(B,u)=>{B.draw(U(u,2,3))}}),
 gu_nest:GU_CARD({n:"蛊巢",cost:2,type:"pow",r:"E",d:u=>`每回合开始，给所有敌人随机一种蛊 ${U(u,2,3)} 层`,fx:(B,u)=>{PW(B,"gunest",U(u,2,3))}}),
 gu_all:GU_CARD({n:"万蛊归宗",cost:3,type:"skl",r:"E",exh:1,d:u=>`所有敌人烫伤、流血、泥巴、中毒、冻伤各 ${U(u,3,4)}`,fx:(B,u)=>{B.alive().forEach(e=>["burn","bleed","mud","poison","frost"].forEach(k=>B.apply(e,k,U(u,3,4))))}})});
POOL_HERO.push("gu_mud","gu_rain","gu_steam","gu_icebind","gu_thunder","gu_night","gu_numb","gu_bone","gu_soft","gu_spread","gu_feed","gu_shell","gu_seek","gu_nest","gu_all");
// 蛊巢
{const _st2=startTurn;startTurn=async function(){const r=await _st2.apply(this,arguments);try{const v=B&&B.p.pw2&&B.p.pw2.gunest;if(v&&!B.over&&!PREV){B.alive().forEach(e=>B.apply(e,pick(["burn","bleed","mud","poison","frost","wet"]),v));renderBattle()}}catch(e){}return r}}
const GU_STARTER=["gu_frost","gu_frost","gu_fire","gu_fire","gu_poison","gu_bleed","gu_guard","gu_guard","gu_guard","gu_devour"];

/* 主角列表：打败过一次大魔王才解锁 */
HEROES.push({id:"gushi",n:"蛊师奶蛙",img:"v_gushi",tag:"六号主角 · 养蛊",d:"不出拳，靠下蛊。敌人身上蛊的种类越多，每回合扣的血越多。「噬心」吃掉全部蛊，打一大下。",hp:68,get on(){return !!(typeof M!=="undefined"&&M&&(M.guUnlock||(M.wins||0)>0||(M.ach||{}).win))}});
{const _hs=heroSelect;heroSelect=function(){const r=_hs.apply(this,arguments);try{const i=HEROES.findIndex(h=>h.id==="gushi");const el=document.querySelectorAll(".hcard")[i];if(el&&!HEROES[i].on){const lk=el.querySelector(".lk");if(lk)lk.textContent="打败大魔王解锁";const p=el.querySelector("p");if(p)p.textContent="打败过一次奶蛙大魔王就能解锁";el.onclick=()=>toast("蛊师奶蛙：打败过一次<b>奶蛙大魔王</b>就能解锁")}}catch(e){}return r}}
try{TRAIN_HERO.gushi={t:"蛊师奶蛙：养蛊",l:["你几乎没有攻击牌。烫伤、流血、泥巴、中毒、内伤、冻伤、麻痹、梦魇、潮湿、易伤、虚弱，这些都是你的蛊。先上潮湿再上烫伤会变蒸汽，潮湿还能被「雷蛊」一口气引爆。","回合结束时，敌人身上每有 1 种不同的蛊，就发作一次扣 2 点血。比起一种蛊叠很多层，种类多更痛。每种蛊最多 12 层。","「噬心」把一个敌人身上的蛊全部吃掉，每层 1 点伤害，每种再加 3。吃完要重新养。"],c:"gu_devour"}}catch(e){}
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
