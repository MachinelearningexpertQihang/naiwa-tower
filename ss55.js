/* ===================== 5.5 · 两条 SS 线：奶茶厂死斗场 / 灭却诅咒师 ===================== */
BGIMG.teaarena="teaarena";BGIMG.curser="curser";
Object.assign(NODE,{P:{n:"斗场大门",ic:"v_mcolo",badge:1},D:{n:"奶茶厂第一斗场",ic:"v_mcolo"},U:{n:"预言家的书房",ic:"v_mhood",badge:1},J:{n:"灭却诅咒师",ic:"v_mhood"}});

/* ---------- 负面状态 ---------- */
const NEG55=["poison","burn","weak","vuln","frost","night","para","inj","brk","wet","bleed","brittle","curse","mud"];
function negKinds(p){p=p||(B&&B.p)||{};return NEG55.filter(k=>(p[k]||0)>0)}
function csStacks(){const p=(B&&B.p)||{};return NEG55.reduce((a,k)=>a+Math.max(0,Math.min(30,p[k]||0)),0)}
function cleanseAll(p){p=p||B.p;const n=negKinds(p).length;NEG55.forEach(k=>{p[k]=0});p.poisonT=0;p.curseD=0;if(n>=4)ach("cleanse");return n}
function cleanseOne(p){p=p||B.p;const L=negKinds(p);if(!L.length)return null;const k=L.sort((a,b)=>(p[b]||0)-(p[a]||0))[0];p[k]=0;if(k==="poison")p.poisonT=0;if(k==="curse")p.curseD=0;return k}

/* ---------- 敌人 ---------- */
Object.assign(ENEMY,{
 ss_shield:{n:"盾斗士",img:"e_v_shielder",hp:[100,104],h:240,elite:1,pd:"不灭的斗士生涯第一场的对手。输了以后，自己留下来守门。盾上钉满了钉子：每次挨打少掉 3 点",
  ai:(e,t)=>[{k:"def",v:18},{k:"atk",v:15},{k:"atkdef",v:10,b:12},{k:"atk",v:7,x:2,s:"weak",d:1}][t%4]},
 ss_archer:{n:"弓斗士",img:"e_v_archer",hp:[92,96],h:230,elite:1,pd:"在看台上长大的孩子，冠军的头号粉丝。拉满弓的那一箭非常痛",
  ai:(e,t)=>[{k:"atk",v:5,x:3},{k:"debuff",s:"vuln",v:2},{k:"charge"},{k:"atk",v:26,ult:"满弓"}][t%4]},
 ss_champ:{n:"不灭的斗士",img:"e_v_champ",hp:[220,220],h:320,boss:1,pd:"奶茶厂第一斗场一千场不败的冠军。背后的奶茶罐每回合给它灌一次",
  ai:(e,t)=>e.hp<e.max/2?[{k:"atk",v:9,x:3},{k:"atkdef",v:16,b:16},{k:"atk",v:30,ult:"第一千零一拳"},{k:"buff",s:"str",v:2}][t%4]:[{k:"atk",v:14},{k:"atk",v:8,x:2},{k:"atkdef",v:12,b:14},{k:"atk",v:20}][t%4]},
 ss_minion:{n:"咒缚奶猫",img:"e_ctw",hp:[24,28],h:120,ai:(e,t)=>[{k:"debuff",s:"weak",v:1},{k:"atk",v:6},{k:"def",v:6},{k:"debuff",s:"poison",v:2}][(t+(e.seed||0))%4]},
 ss_minion2:{n:"深渊咒缚奶猫",img:"e_ctw",hp:[38,42],h:130,ai:(e,t)=>[{k:"atk",v:8,s:"poison",d:2},{k:"debuff",s:"vuln",v:1,s2:"burn",v2:3},{k:"atk",v:5,x:2}][(t+(e.seed||0))%3]},
 curser:{n:"灭却诅咒师",img:"e_v_curser",hp:[150,150],h:300,boss:1,pd:"魔王的军师，大家叫它灭却大人。几乎不亲自动手：给你上咒，再让仆从挡在前面",
  ai:(e,t)=>{const L=e.hp<e.max/2?[{k:"debuff",s:"poison",v:6,s2:"night",v2:2},{k:"call",id:"ss_minion"},{k:"debuff",s:"burn",v:7,s2:"para",v2:1},{k:"atk",v:6+2*csStacks(),burst:2,ult:"咒爆"}]:[{k:"call",id:"ss_minion"},{k:"debuff",s:"poison",v:5,s2:"weak",v2:2},{k:"debuff",s:"burn",v:6,s2:"vuln",v2:2},{k:"call",id:"ss_minion"},{k:"debuff",s:"curse",v:1,s2:"frost",v2:3},{k:"atk",v:6+2*csStacks(),burst:2,ult:"咒爆"}];return L[t%L.length]}},
 curser2:{n:"灭却诅咒师·深渊",img:"e_v_curser",hp:[210,210],h:320,boss:1,pd:"吸了深渊龙蛙的力量回来了。咒一次上两种，仆从更强，半血以后还会偷你的牌",
  ai:(e,t)=>{const L=[{k:"call",id:"ss_minion2"},{k:"debuff",s:"poison",v:8,s2:"vuln",v2:3},{k:"debuff",s:"burn",v:9,s2:"weak",v2:3},{k:"call",id:"ss_minion2"},{k:"debuff",s:"curse",v:1,s2:"frost",v2:4},{k:"atk",v:8+3*csStacks(),burst:3,ult:"深渊咒爆"}];if(e.hp<e.max/2)L.splice(3,1,{k:"debuff",s:"night",v:3,s2:"para",v2:2});return L[t%L.length]}}
});
Object.assign(ELINE,{
 ss_shield:{a:["站住！","这面盾，补过一次。"],s:["我守了十三年。","谁也别想过去。"],l:["……盾，又穿了。"]},
 ss_archer:{a:["看箭！","你不配见它！"],s:["屏住呼吸……","这一箭，替看台上的大家射的。"],l:["弦……断了……"]},
 ss_champ:{a:["一千……零一。","站好。","……再来。"],s:["打完……就能出去了。","他说的……都会应验。"],l:["……我想起来了……"]},
 ss_minion:{a:["（同一个声音）早就看见你了。"],s:["（同一个声音）你会后悔的。"],l:["（同一个声音）预言里没有这一段。"]},
 ss_minion2:{a:["（水里冒泡）咕……"],s:["（同一个声音）深渊在看。"],l:["咕……"]},
 curser:{a:["记录：材料还在挣扎。","工具在说话吗？"],s:["让我预言一下。","第三回合，你会开始后悔。"],l:["……不在预言里。"]},
 curser2:{a:["这一次，我不用预言。","结局已经写好了。"],s:["龙蛙大人给的，比椅子给的多。","深渊里什么都有。"],l:["怎么……没算到……"]}
});
BOSS_LORE.ss_champ={t:"奶茶罐",td:"每回合往身上灌一次，力气 +2；一回合里打够伤害，就能打断管子，让它晕一回合",lore:["它本来是奶茶厂搬箱子的。","赢来的奶茶，它分给看台上的小孩，自己只喝杯底。"]};
BOSS_LORE.curser={t:"咒爆",td:"不停上咒、召唤仆从；仆从活着时它只受一半伤害。咒爆按你身上的负面状态层数算伤害",lore:["阿岳叫它预言家。","它说过的事，都会有人替它做成真的。"]};

/* ---------- 首领机制 ---------- */
const champBrk=e=>Math.max(40,Math.round(e.max*.1));
Object.assign(BM,{
 ss_shield:{say:"谁也别想过去。",tip:"盾上全是钉子：每次挨打少 3 点。多段的小攻击很亏，用大伤害打",chip:()=>"钉盾 -3"},
 ss_archer:{say:"我不会让你过去的！",tip:"看到它「蓄力」，下一回合就是「满弓」那一箭，先叠护盾",chip:e=>e.intent&&e.intent.ult?"满弓！":""},
 ss_champ:{say:"一千……零一。",tip:"背后的奶茶罐每回合给它灌一次，力气 +2。一回合里打它够多伤害就能打断管子：它晕一回合，灌进去的力气全吐出来",
  chip:e=>e.brkCd>0?`管子断了 · 修好还要 ${e.brkCd} 回合`:`奶茶罐 ${e.tank||0} 层 · 打断还差 ${Math.max(0,champBrk(e)-(e.turnDmg||0))}`,
  hit:(e,l)=>{if(!B||!B.myTurn||e.hp<=0||e.brkCd>0||(e.turnDmg||0)<champBrk(e))return;e.brkCd=2;e.broke=1;const lost=2*(e.tank||0);e.str=Math.max(e.str0||0,(e.str||0)-lost);e.tank=0;e.intent={k:"stun"};B.pipeN=(B.pipeN||0)+1;S.stats.pipe=(S.stats.pipe||0)+1;ach("pipebreak");if(B.pipeN>=3)ach("pipe3");
   setTimeout(()=>{if(!B||B.over)return;banner("打断管子！",1);stageShake();sfx("bigkill");const el=enEl(e);if(el)say(el.querySelector(".body"),"……咳……我刚才……在干什么？");toast(`管子断了：${e.n}晕一回合，力气 -${lost}`);renderBattle()},150)},
  act:async e=>{if(e.str0==null)e.str0=e.str||0;if(e.brkCd>0){e.brkCd--;if(e.broke){e.broke=0;return}}e.tank=(e.tank||0)+1;e.str=(e.str||0)+2;fxSay(e,"灌奶 · 力气 +2");sfx("buff");renderBattle();await sleep(260)}},
 curser:{say:"让我预言一下。",tip:"自己不怎么打人，但会一直给你上咒，还会召唤仆从。仆从活着的时候，它只受一半伤害。每隔几回合放一次「咒爆」：你身上每有 1 层负面状态，就多挨 2 点。带上解毒剂和安神茶",
  chip:e=>{const m=B.alive().filter(x=>/^ss_minion/.test(x.id)).length;return(e.intent&&e.intent.burst?`咒爆：约 ${6+2*csStacks()} 点`:"")+(m?`${e.intent&&e.intent.burst?" · ":""}仆从挡着：伤害减半`:"")}},
 curser2:{say:"这一次，我不用预言。",tip:"一次上两种咒，召唤更强的仆从，仆从活着时它只受一半伤害。「深渊咒爆」按你身上的负面状态每层 3 点算。半血以后，每回合从你的抽牌堆偷走一张牌",
  chip:e=>{const m=B.alive().filter(x=>/^ss_minion/.test(x.id)).length;return(e.intent&&e.intent.burst?`深渊咒爆：约 ${8+3*csStacks()} 点`:"")+(m?" · 仆从挡着：伤害减半":"")+(e.hp<e.max/2?" · 偷牌":"")},
  act:async e=>{if(e.hp<e.max/2&&B.dp.length){const c=B.dp.splice(ri(B.dp.length),1)[0];B.exh.push(c);fxSay(e,"偷走一张牌");toast(`${e.n}从你的抽牌堆里偷走了「${cname(c)}」`);sfx("debuff");await sleep(260)}}}
});
{const _bg=bossGuard;bossGuard=function(t,d){if(/^curser/.test(t.id)&&d>0&&B&&B.alive().some(x=>/^ss_minion/.test(x.id)))d=Math.ceil(d/2);return _bg(t,d)}}
{const _de=dealEnemy;dealEnemy=function(t,d,i){if(t&&t.id==="ss_shield"&&d>0)d=Math.max(0,d-3);return _de.call(this,t,d,i)}}
{const _ke=killEnemy;killEnemy=function(t){const r=_ke.apply(this,arguments);try{if(/^curser/.test(t.id)&&B)B.enemies.forEach(x=>{if(/^ss_minion/.test(x.id)&&x.hp>0){x.hp=0;x.fled=1}});if(/^ss_minion/.test(t.id)){M.minionK=(M.minionK||0)+1;if(M.minionK>=10)ach("minion10")}if(t.id==="seakeeper"){M.seaK=(M.seaK||0)+1;ach("seakeeper");if(M.seaK>=2)ach("seakeeper2");S.flags.seaKill=1}if(t.id==="ss_shield")ach("shieldwin");if(t.id==="ss_archer")ach("archerwin")}catch(e){}return r}}
{const _ea=enemyAct;enemyAct=async function(e){const I=e.intent;let hp0=S.hp;try{if(I&&I.k==="buff"){const _c=center(enEl(e).querySelector(".body"));sparks(_c.x,_c.y-30,"#ff6b6b",7)}}catch(x){}if(I&&I.burst){I.v=(I.burst>=3?8:6)+I.burst*csStacks()}const r=await _ea.apply(this,arguments);try{if(I&&I.burst&&hp0-S.hp>=50)ach("burst50");if(I&&I.k==="debuff"&&I.s2&&B&&!B.over&&S.hp>0){B.apply(B.p,I.s2,I.v2||1);renderBattle()}if(B&&negKinds().length>=8)ach("debuff8")}catch(x){}return r}}

/* 负面状态：完整生效 / 挡掉 / 免疫 */
{const _ap=API.apply;API.apply=function(t,s,v){try{if(B&&t===B.p&&NEG55.includes(s)&&v>0){
  if((B.p.immune||0)>0){fxSay2("免疫");return}
  if((B.noteBlock||0)>0){B.noteBlock--;relicPulse("ss_note");fxSay2("看穿了");return}
  if((B.maskBlock||0)>0){B.maskBlock--;relicPulse("r_mask");B.block(8,1);fxSay2("辟邪");return}
  if(has("r_salt")&&["poison","burn","bleed"].includes(s))v=Math.max(1,Math.floor(v/2));
  if(B.fullCurse&&S.diff!=="hard"&&["poison","curse","frost","night","para"].includes(s))v*=2}}catch(e){}return _ap.call(this,t,s,v)}}
function fxSay2(s){const el=$("#player");if(!el)return;const c=center(el.querySelector(".body"));fnum(c.x,c.top+40,s,"txt")}

/* 药水加强 */
Object.assign(POTIONS.pantidote,{d:"清掉你身上全部负面状态，回复 12 生命，接下来 2 回合不会再被上负面状态",fx:B=>{cleanseAll(B.p);B.p.immune=2;B.heal(12)}});
Object.assign(POTIONS.pcalm,{d:"清掉你身上全部负面状态，获得 14 护盾，抽 2 张牌",fx:B=>{cleanseAll(B.p);B.block(14,1);B.draw(2)}});

/* ---------- 遗物 ---------- */
Object.assign(RELICS,{
 ss_glove:{n:"斗士的拳套",img:"v_champ",r:"S",d:"不灭的斗士留下的：每场战斗开局力气 +2，首领战再 +2"},
 ss_note:{n:"阿岳的本子",img:"v_curser",r:"S",d:"预言家写的。翻熟了，你也看得穿：每场战斗前 2 次给你上的负面状态会被挡掉"},
 ss_orb:{n:"预言家的水晶球",img:"v_curser",r:"S",d:"每回合开始，给一个随机敌人上一种随机负面状态（虚弱 / 易伤 / 中毒，2 层）"},
 r_bell2:{n:"清心铃",img:"m6",r:"R",d:"每回合开始，清掉你身上层数最多的一种负面状态"},
 r_salt:{n:"粗盐袋",img:"ct",r:"C",d:"被上中毒、烫伤、流血时，层数减半"},
 r_mask:{n:"辟邪面具",img:"e_ctw",r:"R",d:"每场战斗第一次被上负面状态时挡掉，并获得 8 护盾"}
});
function relicSold(){M.relicSold=(M.relicSold||0)+1;ach("relicSell");if(M.relicSold>=10)ach("relicSell10");saveMeta()}
{const _gr=gainRelic;gainRelic=function(id){const r=_gr.apply(this,arguments);try{const n=(S.relics||[]).length;if(n>=15)ach("relic15");if(n>=25)ach("relic25")}catch(e){}return r}}

/* ---------- 战斗开始 / 回合开始 ---------- */
{const _sc=startCombat;startCombat=function(kind){const grp=S.pendGrp?[...S.pendGrp]:null;_sc.apply(this,arguments);if(!B)return;try{
  const bt=$("#battle");
  if(kind==="D"){const boss=B.enemies.some(e=>ENEMY[e.id].boss);setBg("teaarena",B.moon);playMusic(boss?"champ":"dsq");if(boss){bt.classList.add("bossFight","finalFight")}B.enemies.forEach(e=>{if(!/^ss_/.test(e.id)&&!/^奶茶兵/.test(e.n))e.n="奶茶兵·"+e.n});
   if(grp&&grp[0]==="ss_minion"){setBg("curser",B.moon);playMusic("curser");B.introTalk=STORY.cs_minions}renderBattle()}
  if(kind==="J"){B.fullCurse=1;setBg("curser",B.moon);playMusic(S.fin?"curser2":"curser");bt.classList.add("bossFight","finalFight")}
  B.enemies.forEach(e=>{const el=enEl(e);if(!el)return;el.classList.add("eid-"+e.id);try{const z=enSize(e);if(ENEMY[e.id].boss&&z>=280)el.classList.add("bigEn");else if(z>=215)el.classList.add("midEn")}catch(x){}});
  if(has("ss_glove")){B.p.str+=2;if(B.enemies.some(e=>ENEMY[e.id].boss))B.p.str+=2}
  if(S.flags&&S.flags.nextEvade){S.flags.nextEvade=0;B.p.evade=(B.p.evade||0)+1}B.noteBlock=has("ss_note")?2:0;B.maskBlock=has("r_mask")?1:0;
  if(kind==="F"&&S.flags&&S.flags.cupFriend){const of=B.introFx;B.introTalk=(B.introTalk||[]).concat(STORY.cup_help);B.introFx=()=>{if(of)of();cleanseAll(B.p);B.heal(15);B.enemies.forEach(e=>e.hp>0&&B.apply(e,"weak",2));ach("cuphelp");renderBattle()}}
 }catch(e){console.warn(e)}}}
{const _st=startTurn;startTurn=async function(){if(B&&B.p&&(B.p.immune||0)>0)B.p.immune--;if(B)B.potT=0;const r=await _st.apply(this,arguments);try{if(!B||B.over)return r;
  if(has("r_bell2")){const k=cleanseOne(B.p);if(k){relicPulse("r_bell2");toast(`清心铃：清掉了「${STAT[k].n}」`)}}
  if(has("ss_orb")){const t=pick(B.alive());if(t){const s=pick(["weak","vuln","poison"]);B.apply(t,s,2);relicPulse("ss_orb")}}
  if((B.eggs||[]).length>=30)ach("eggs30");
  B.enemies.forEach(e=>{if(e.intent&&e.intent.burst)e.intent.v=(e.intent.burst>=3?8:6)+e.intent.burst*csStacks()});renderBattle()}catch(e){console.warn(e)}return r}}
{const _up=usePotion;usePotion=function(i){const r=_up.apply(this,arguments);try{if(B){B.potT=(B.potT||0)+1;B.potAll=(B.potAll||0)+1;if(B.potT>=3)ach("potion3")}}catch(e){}return r}}

/* ---------- 隐藏路线 ---------- */
function injectRoute(types,grps,flag,msg){const GR=GROW();const rows=types.map((_,i)=>GR+1+i);if(rows.some(r=>!S.map[r]))return false;if(S.row>GR)return false;
 const safe=n=>["m","q","E","t"].includes(n.t)&&!n.story&&!n.hid&&!n.gold;const chains=[];const walk=(ch)=>{if(ch.length===rows.length){chains.push(ch);return}const cur=ch[ch.length-1];cur.nx.map(c=>S.map[rows[ch.length]][c]).filter(Boolean).forEach(nx=>walk([...ch,nx]))};S.map[rows[0]].filter(Boolean).forEach(n1=>walk([n1]));
 const ch=chains.find(c=>c.every(safe))||chains.find(c=>c.every(n=>!["A","Y","Z","v","s","r"].includes(n.t)&&!n.story))||chains[0];if(!ch)return false;
 ch.forEach((n,i)=>{n.t=types[i];n.hid=1;n.grp=grps[i]||undefined;n.story=0;n.gold=0});S.flags[flag]=1;saveRun();if(msg)setTimeout(()=>toast(msg),600);return true}
/* 初号机的隐藏路线也改用同一套：不会盖掉隐藏房间、后门、镜之间、酒馆和剧情房间 */
injectProto=function(){if(!S||S.junc||!S.flags||!S.flags.ssProto||S.flags.protoDone||S.flags.protoRoute||S.dream||S.fin||(S.act||0)!==2)return;injectRoute(["X","H"],[null,["proto"]],"protoRoute","地图下半层出现了一条<b>彩色的隐藏路线</b>：SS 讨伐目标就在那里")};
function injectSS(){if(!S||S.junc||S.dream||S.fin||!S.flags||!S.map)return;const a=S.act||0;
 if(a===3&&S.flags.ssArena&&!S.flags.arenaDone&&!S.flags.arenaRoute){if(injectRoute(["P","D"],[null,null],"arenaRoute","地图下半层出现了一条<b>彩色的隐藏路线</b>：尽头是奶茶厂第一斗场"))openMap()}
 if(a===4&&S.flags.cupFriend&&!S.flags.curserDone&&!S.flags.csRoute){if(injectRoute(["U","m","J"],[null,["ss_minion","ss_minion","ss_minion"],["curser"]],"csRoute","")){setTimeout(async()=>{await talk(STORY.cs_smell);toast("地图下半层出现了一条<b>隐藏路线</b>：跟着迷你奶茶杯走")},400);openMap()}}}
{const _en=enterNode;enterNode=function(t,resumed,cur){if(!["P","D","U","J"].includes(t))return _en.apply(this,arguments);S.cur=cur||{t,rs:S.rs};if(resumed&&cur){S.rs=cur.rs;if(cur.snap){S.hp=cur.snap.hp;S.gold=cur.snap.gold;S.pots=[...cur.snap.pots];S.uid=cur.snap.uid}}saveRun();
 if(t==="P")eventScreen("ss_dsqgate");else if(t==="U")eventScreen("ss_study");else if(t==="D"){if(S.dsq)dsqStep();else dsqStart()}else if(t==="J")csIntro()}}
{const _fm=finMap;finMap=function(){const m=_fm.apply(this,arguments);try{if(S.flags&&S.flags.curserDone){const c=Math.floor(COLS/2);const ri0=m.length-1;const row=Array(COLS).fill(null);row[c]={r:ri0,c,t:"J",nx:[c],jx:0,jy:0,grp:["curser2"]};m.splice(ri0,0,row);m.forEach((rw,r)=>{const n=rw[c];if(n){n.r=r;n.nx=r<m.length-1?[c]:[]}})}}catch(e){console.warn(e)}return m}}

/* ---------- 酒馆：SS 悬赏 / 掷骰子 ---------- */
function ssArenaOk(){return S&&S.flags&&(S.act||0)===3&&S.flags.protoDone&&!S.flags.ssArena&&!S.flags.arenaDone&&!S.junc&&!S.dream&&!S.fin&&S.row<GROW()}
function ssCardX(){if(ssArenaOk())return`<div class="qSS" id="qSS4"><i>SS</i><div><b>讨伐悬赏：地底下的号子声</b><p>奶茶厂底下的旧斗场，最近半夜总传出喊号子的声音。看门的说，那地方关了很多年了。悬赏一个敢下去看看的人。</p><small>奖励：金币，一件特级遗物，还有……（后面的字被奶茶渍糊住了）　·　不占普通任务的名额</small></div></div>`;
 if(S.flags&&S.flags.ssArena&&!S.flags.arenaDone&&(S.act||0)===3)return`<div class="qSS taken"><i>SS</i><div><b>讨伐悬赏：地底下的号子声（已接）</b><small>沸腾奶茶厂的下半层，找那条彩色的路</small></div></div>`;
 if(S.flags&&S.flags.cupFriend&&!S.flags.curserDone&&(S.act||0)===4)return`<div class="qSS taken"><i>SS</i><div><b>迷你奶茶杯在闻什么</b><small>它说，那股烧糊的糖味就在这一层的下半层</small></div></div>`;return""}
function ssBindX(draw,tsay,tv,T,gate){const q=$("#qSS4");if(q)q.onclick=async()=>{if(gate())return;const ok=await shopConfirm(`<div class="qSS big"><i>SS</i><div><b>讨伐：地底下的号子声</b><p>接下以后，沸腾奶茶厂的下半层会出现一条隐藏路线，尽头是奶茶厂第一斗场。<br>里面是五连战，中间只能歇一次。<b>输了，这一局就结束。</b></p></div></div>`,0,"接下悬赏");if(!ok)return;S.flags.ssArena=1;ach("ssquest");tsay("……你真要下去？那地方，进去的人都是被抬出来的。……活着回来，酒我请。");saveRun();draw()};
 const d=$("#tvDice");if(d)d.onclick=()=>{if(window.TAV_BUSY||gate())return;if((tv.dice||0)>=3){tsay("骰子收起来了，明天再来。");return}if(S.gold<30){tsay("押 30，你兜里不够啊。");return}window.TAV_BUSY=1;tavDice(T).then(r=>{window.TAV_BUSY=0;if(r==null)return;tv.dice=(tv.dice||0)+1;M.dice=(M.dice||0)+1;ach("dice1");if(r>0){S.gold+=30;sfx("coin");S.stats.diceW=(S.stats.diceW||0)+1;if(S.stats.diceW>=3)ach("dice3")}else if(r<0){S.gold=Math.max(0,S.gold-30);if(S.gold<30)ach("diceBroke")}else tv.dice--;renderTop();saveRun();draw()})}}
function tavDiceHTML(tv){return`<div class="shopItem tavIt ${(tv.dice||0)>=3?"sold":""}" id="tvDice"><div class="rmv"><big>🎲</big>掷骰子比大小<small>还能玩 ${3-(tv.dice||0)} 局</small></div><div class="price">${ICON.coin}押 30</div></div>`}
const DICE_NPC=[
 {n:"独眼老奶蛙",hi:"比大小？好啊。我这只眼睛看骰子，比你两只眼睛都准。",w:["……再来！刚才那把不算！","哼，新手的运气。"],l:["嘿嘿，这点数，我闭着眼都赢你。","年轻人，钱留下，路继续走。"]},
 {n:"退休的奶茶兵",hi:"我在斗场门口站了十年岗，就学会了一样：掷骰子。",w:["当年冠军也老输给我。……骗你的。","行，你这手比斗场里那帮人稳。"],l:["押你赢？我押了十年，一次都没押中过。","再来一把？我请你。……用你的钱。"]},
 {n:"醉醺醺的骑士",hi:"嗝。来，来来，我们掷……掷几个来着？",w:["我、我这是让着你……嗝。","明天，明天我一定赢回来。"],l:["哈！我就说我今天手气好！","嗝……这钱我拿去买酒。"]},
 {n:"数钱很慢的商人",hi:"赢了的话，我得慢慢数给你。你不赶时间吧？",w:["一、二……三十。……不对，我再数一遍。","今天不宜赌钱。黄历上写着呢。"],l:["一、二……三十。嗯，正好。","生意就是生意。"]},
 {n:"戴兜帽的人",hi:"……你会掷出七。",w:["……不在预言里。","怎么会？"],l:["我说过了。","一切都在预言里。"],pro:1}];
function tavDice(T){return new Promise(res=>{const N=(S.act||0)===4?pick(DICE_NPC):pick(DICE_NPC.filter(x=>!x.pro));const DF=[1,2,3,4,5,6].map(n=>`<b class="die">${n}</b>`);const d=document.createElement("div");d.className="shopConf";d.innerHTML=`<div class="scBox rpsBox diceBox"><b>和${N.n}掷骰子</b><p>${N.hi}</p><p class="dcRule">各掷两颗，点数大的赢。押 30，赢了拿回 60</p><div class="rpsRes"><span class="me">？</span><i>VS</i><span class="him">？</span></div><div class="scBtns"><button class="btn sm rpsB" id="dcGo">掷骰子</button><button class="btn sm ghost" data-x="1">算了</button></div></div>`;let done=0;
 d.onclick=async e=>{e.stopPropagation();if(done)return;if(e.target.closest("[data-x]")||!e.target.closest(".scBox")){d.remove();res(null);return}if(!e.target.closest("#dcGo"))return;done=1;sfx("click");const me=[1+ri(6),1+ri(6)],him=[1+ri(6),1+ri(6)];const ms=d.querySelector(".me"),hs=d.querySelector(".him");for(let k=0;k<10;k++){ms.innerHTML=DF[ri(6)]+DF[ri(6)];hs.innerHTML=DF[ri(6)]+DF[ri(6)];await sleep(60)}ms.innerHTML=DF[me[0]-1]+DF[me[1]-1];hs.innerHTML=DF[him[0]-1]+DF[him[1]-1];
  if(me[0]===6&&me[1]===6)ach("dice66");if(me[0]===1&&me[1]===1)ach("dice11");const a=me[0]+me[1],b=him[0]+him[1];const r=a>b?1:a<b?-1:0;{const sb=d.querySelector(".scBtns");if(sb)sb.style.display="none"}let extra="";if(N.pro&&a===7)extra="<br><small>……他说中了。</small>";
  d.querySelector(".scBox").insertAdjacentHTML("beforeend",`<p class="rpsOut ${r>0?"w":r<0?"l":""}">${a} 比 ${b}　${r>0?"你赢了！+30":r<0?"你输了…… -30":"平局，再来一次"}${extra}</p><p class="dcSay">${N.n}：「${r>0?pick(N.w):r<0?pick(N.l):"一样大？有意思。"}」</p>`);await sleep(1500);window.SHOP_LOCK=Date.now()+400;d.remove();res(r)};$("#stage").appendChild(d)})}

/* ---------- 死斗场 ---------- */
const DSQ=[
 {g:["porter","boilerdog"],pre:"dsq_f1",txt:"喇叭：「第一场！奶茶厂第三车间的新兵，对阵——（咔）——一只奶蛙！」"},
 {g:["ss_shield"],pre:"dsq_f2",post:"dsq_f2w",el:1,txt:"喇叭：「第二场！守门十三年，一步没退过的——盾斗士！」"},
 {rest:1,txt:"休息室的门自己开了。<br>墙上密密麻麻刻着划痕，你数到一半就数乱了。最后一道旁边，刻着几个歪歪扭扭的字：<b>「还差一场。」</b><br>地上丢着一只褪色的奶茶杯盖，上面画着一张笑脸。"},
 {g:["hothorse","teaegg","porter"],pre:"dsq_f3",txt:"喇叭：「中场休息结束！据说上一个走到这里的挑战者……（咔）……我们不提他了。第三场！」"},
 {g:["ss_archer"],pre:"dsq_f4",post:"dsq_f4w",el:1,txt:"喇叭：「第四场！看台上长大的孩子，冠军的头号粉丝——弓斗士！」"},
 {g:["ss_champ"],pre:"dsq_boss",boss:1,txt:"喇叭：「女士们……先生们……（滋……）」<br>喇叭停了很久。<br>「……第一千零一场。」"}];
const HORN_LINES=["（咔）观众朋友们请安静！","本场比赛由沸腾奶茶厂冠名播出。","请不要向场内投掷珍珠。","（滋……）测试，测试。","前排的观众请注意，你们会被溅到奶茶。","今日特价：三分糖，去冰。","（咔）……我已经一个人报了好多年的幕了。","你戳我也没用，我只会报幕。","最后一次警告：请不要戳报幕员。","（咔咔咔）——系统过热——（咔）——欢迎光临！"];
function dsqStart(){S.dsq={st:0,g:0,hpFull:1};ach("dsqenter");saveRun();show("event");setBg("teaarena");playMusic("dsq");$("#event").innerHTML="";talk(STORY.dsq_rules).then(()=>dsqStep())}
function dsqStep(){const s=S.dsq,D=DSQ[s.st];show("event");setBg("teaarena");playMusic("dsq");
 const prog=DSQ.map((x,i)=>`<i class="${i<s.st?"done":i===s.st?"now":""}">${x.rest?"歇":x.boss?"王":x.el?"精":"兵"}</i>`).join("");
 const opts=D.rest?`<button class="evo" id="dqA"><b>坐下歇一会儿</b><small><span class='good'>回复 30% 生命</span></small></button><button class="evo" id="dqB"><b>对着墙上的划痕练拳</b><small><span class='good'>随机升级 2 张牌</span></small></button>`:`<button class="evo" id="dqGo"><b>${D.boss?"走上场":"上场"}</b><small>${D.boss?"不灭的斗士":D.el?"精英":"奶茶兵"}　·　输了，这一局就结束</small></button>`;
 $("#event").innerHTML=`<div class="evBox dsqBox"><div class="phead"><span class="ribbon">奶茶厂第一斗场</span></div><div class="evPic dsqHorn"><img src="${IMG("v_horn")}" id="dqHorn"></div><div class="evTxt"><div class="dsqProg">${prog}</div><p id="evP">${D.txt}</p><div class="dsqChips"><span>生命 <b>${S.hp}</b> / ${S.max}</span><span>押着 <b>${s.g}</b> 金币</span>${D.rest?"<span>中场休息</span>":`<span>第 <b>${Math.min(5,s.st+1-(s.st>2?1:0))}</b> / 5 场</span>`}</div>${D.rest?"":`<div class="dsqVs">${D.g.map(id=>`<div class="dsqFoe ${D.boss?"myst":""}"><img src="${IMG(ENEMY[id].img)}"><b>${D.boss?"？？？":ENEMY[id].elite||ENEMY[id].boss?ENEMY[id].n:"奶茶兵"}</b></div>`).join("")}${D.el?`<p class="dsqPd">${ENEMY[D.g[0]].pd||""}</p>`:D.boss?`<p class="dsqPd">一千场，一场没输过。</p>`:""}</div>`}<div class="evOpts">${opts}</div></div></div>`;
 const h=$("#dqHorn");if(h)h.onclick=()=>{M.horn=(M.horn||0)+1;sfx("click");h.classList.remove("hornPop");void h.offsetWidth;h.classList.add("hornPop");toast("喇叭："+HORN_LINES[Math.min(HORN_LINES.length-1,(M.horn-1)%HORN_LINES.length)]);if(M.horn>=10)ach("hornclick");saveMeta()};
 if(D.rest){const done=t=>{s.st++;saveRun();$("#evP").innerHTML=t;$(".evOpts").innerHTML=`<button class="evo" id="dqN"><b>回到场上</b></button>`;$("#dqN").onclick=()=>{sfx("click");dsqStep()}};
  $("#dqA").onclick=()=>{sfx("click");const hh=Math.round(S.max*.3);S.hp=Math.min(S.max,S.hp+hh);renderTop();done(`你靠着墙坐了一会儿。墙那边，好像有人在用同一个节奏，一下一下地捶着什么。<br><span class='good'>回复 ${hh} 生命</span>`)};
  $("#dqB").onclick=()=>{sfx("click");s.hpFull=0;ach("dsqtrain");const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);try{upFx(l)}catch(e){}done(`你对着那一千道划痕打了一千拳。打到后来，手都没知觉了。<br><span class='good'>升级了：${l.map(cname).join("、")||"没有"}</span>`)};return}
 $("#dqGo").onclick=async()=>{sfx("click");$("#dqGo").disabled=true;clearBattleUI();show("battle");$("#hand").innerHTML="";$("#enemies").innerHTML="";setBg(D.g[0]==="ss_minion"?"curser":"teaarena");if(D.boss)playMusic("champ");await talk(STORY[D.pre]);if(D.boss)await bossTitle("ss_champ","SS 讨伐 · 第一千零一场");if(S.cur)S.cur.snap=null;S.pendGrp=[...D.g];startCombat("D")}}
async function dsqWin(gold){const s=S.dsq,D=DSQ[s.st];busy=true;await sleep(500);busy=false;s.g+=gold+25+8*s.st;if(S.hp<S.max)s.hpFull=0;if(D.post){show("battle");await talk(STORY[D.post])}
 if(D.boss){B=null;return dsqDone()}if(D.el){B=null;show("none");try{const c=await chooseReward(offerCards(3,"R",1),`斗场的奖励：选一张牌`)}catch(e){}}
 s.st++;B=null;saveRun();dsqStep()}
async function dsqDone(){const s=S.dsq;show("none");setBg("teaarena");await talk(STORY.dsq_win);await talk(STORY.dsq_cup);
 S.dsq=null;S.flags.arenaDone=1;S.flags.cupFriend=1;S.flags.clue2=1;if(!S.relics.includes("ss_glove"))gainRelic("ss_glove");const g=s.g+150;S.gold+=g;ach("champ");ach("cupfriend");if(s.hpFull)ach("dsqfull");if(!(S.stats.pipe>0))ach("champnobreak");
 if(S.flags.betChal){S.gold+=150;toast("你在地下赌档押的「挑战者」赢了：<b>+150</b> 金币");ach("bookie")}
 if(S.flags.ssProto&&S.flags.protoDone)ach("ss2");
 toast(`SS 讨伐完成：<b>+${g}</b> 金币，得到「斗士的拳套」。迷你奶茶杯跟上了你`);saveRun();rewardScreen("E",0,[])}

/* ---------- 灭却诅咒师 ---------- */
async function csIntro(){const fin=!!S.fin;clearBattleUI();setBg("curser");show("battle");$("#hand").innerHTML="";$("#enemies").innerHTML="";playMusic(fin?"curser2":"curser");await talk(fin?STORY.cs2_in:STORY.cs_in);await bossTitle(fin?"curser":"curser",fin?"最终之地 · 二番战":"SS 讨伐 · 灭却诅咒师");S.pendGrp=[fin?"curser2":"curser"];startCombat("J")}
async function csWin(){const fin=!!S.fin;const clean=B&&!negKinds().length;const nopot=B&&!(B.potAll>0);busy=true;await sleep(600);B=null;busy=false;show("none");
 if(fin){await talk(STORY.cs2_win);ach("curser2");const h=Math.round(S.max*.2);S.hp=Math.min(S.max,S.hp+h);toast(`黑袍子沉进了水里：回复 <b>${h}</b> 生命`);saveRun();return rewardScreen("E",40,[])}
 await talk(STORY.cs_win);S.flags.curserDone=1;if(!S.relics.includes("ss_orb"))gainRelic("ss_orb");S.gold+=160;ach("curser");if(clean)ach("noDebuff");if(nopot)ach("nopot");if(S.flags.protoDone&&S.flags.arenaDone)ach("allss");
 toast("SS 讨伐完成：<b>+160</b> 金币，得到「预言家的水晶球」。它往深渊的方向逃了");saveRun();rewardScreen("E",0,[])}

/* ---------- 梦境 / 真结局 ---------- */
{const D0=STORY.dreamIn,Y0=STORY.bs_youngyue,SP0=STORY.spare;
 Object.defineProperty(STORY,"dreamIn",{configurable:true,get(){return(S&&S.flags&&S.flags.curserDone?D0.concat(STORY.dream_ay12):D0)}});
 if(Y0)Object.defineProperty(STORY,"bs_youngyue",{configurable:true,get(){return(S&&S.flags&&S.flags.curserDone?STORY.dream_ay3.concat(Y0):Y0)}});
 Object.defineProperty(STORY,"spare",{configurable:true,get(){return(S&&S.flags&&S.flags.ayNote?STORY.spare_note.concat(SP0):SP0)}})}
{const _ce=chairEnd;chairEnd=async function(){try{if(S&&S.flags&&S.flags.curserDone)setTimeout(()=>ach("prophet"),4000)}catch(e){}return _ce.apply(this,arguments)}}
{const _cs=chairStart;chairStart=async function(){try{if(S&&S.flags&&S.flags.ayNote)ach("truth")}catch(e){}return _cs.apply(this,arguments)}}

/* ===================== 5.5 剧情台词 ===================== */
Object.assign(STORY,{
dsq_rules:[["v_horn","报幕喇叭","（咔……滋……）欢——迎！欢迎来到奶茶厂第一斗场！"],
 ["n1","","……台下一个人都没有。"],
 ["v_horn","报幕喇叭","观众朋友们请安静！今晚的挑战者是……是……（咔）……第一千零一位！"],
 ["v_horn","报幕喇叭","规矩老样子：连打五场，中间歇一回。认输的，抬出去。没认输的……也抬出去。"],
 ["n1","","那打赢了的呢？"],
 ["v_horn","报幕喇叭","打赢了的……（咔）……数据丢失。这里很久没有人赢过了。"]],
dsq_f1:[["e_msy","奶茶兵","站住！新来的？"],
 ["e_dgy","奶茶兵","斗士大人说过，第一千零一场之前，谁都不许过去！"],
 ["n1","","斗士大人？它还在这儿？"],
 ["e_msy","奶茶兵","……少废话！我们也是喝奶茶长大的！"]],
dsq_f2:[["v_shielder","盾斗士","……又来一个。"],
 ["v_shielder","盾斗士","它第一场打的就是我。那年它还是个搬箱子的，瘦得像根吸管。"],
 ["v_shielder","盾斗士","一拳。就一拳，我这面盾就穿了。"],
 ["n1","","那你为什么还替它守门？"],
 ["v_shielder","盾斗士","打穿我盾的人，不能输给别人。后来我把盾补好了，就站在这儿。十三年了。"],
 ["v_shielder","盾斗士","谁也别想去吵它。"]],
dsq_f2w:[["v_shielder","盾斗士","……你比当年的它慢。"],
 ["v_shielder","盾斗士","但你没倒下。"],
 ["v_shielder","盾斗士","过去吧。替我看看它现在……还认不认得人。"]],
dsq_f3:[["v_horn","报幕喇叭","（咔）第三场！这一场的选手……是刚才那两位的同事！"],
 ["e_msy","奶茶兵","我们几个是一起进厂的。今天一起躺，也行。"],
 ["e_msy","奶茶兵","……不过得先把你放倒。"]],
dsq_f4:[["v_archer","弓斗士","不许再往前走了！"],
 ["v_archer","弓斗士","我七岁那年，它打完第五百场，朝看台举了一下手。看台上几千个人，可我就觉得，它是在跟我打招呼。"],
 ["v_archer","弓斗士","后来斗场关了，大人们都走了。我没走。"],
 ["n1","","它现在变成什么样了，你知道吗？"],
 ["v_archer","弓斗士","……它不是坏了！它只是在等！"],
 ["v_archer","弓斗士","你凭什么去打扰它！"]],
dsq_f4w:[["v_archer","弓斗士","（弓弦断了。弓斗士蹲在地上，半天没说话。）"],
 ["v_archer","弓斗士","那天晚上……有个穿黑袍子的人来过。他在笼子边上，跟它说了好久的话。"],
 ["v_archer","弓斗士","他说，等到第一千零一场，它就能出去了。它就信了。它等了好久好久。"],
 ["v_archer","弓斗士","你……你别让它输得太难看。"]],
dsq_boss:[["v_horn","报幕喇叭","女士们先生们……（滋……）第一千零一场……终于……"],
 ["v_champ","不灭的斗士","……一千。"],
 ["v_champ","不灭的斗士","一千……零一。"],
 ["v_champ","不灭的斗士","打完……这场……就可以……出去了。他说的。"],
 ["n1","","谁说的？"],
 ["v_champ","不灭的斗士","他说的话……都会应验。断手……应验了。第一千场……应验了。"],
 ["v_champ","不灭的斗士","所以……这一场……也……"],
 ["v_champ","不灭的斗士","（背后的管子咕咚一声，奶茶灌了进去。它的眼睛亮了。）……站好。"]],
dsq_win:[["v_champ","不灭的斗士","……输了？"],
 ["v_champ","不灭的斗士","我……输了。"],
 ["n1","","（它脸上那半块铁皮裂开，掉在沙地上。底下是一张很普通的奶蛙的脸。）"],
 ["v_champ","不灭的斗士","我想起来了。我本来是厂里搬箱子的。那年交不上奶茶钱，被拉来打了第一场。"],
 ["v_champ","不灭的斗士","那个黑袍子……他说的每件事都准。他说我第三百场会断一只手，我就断了。他说我第一千场会赢，我就赢了。"],
 ["v_champ","不灭的斗士","后来我才想明白。不是他看得准……是他说完，就有人去把那件事做成真的。"],
 ["v_champ","不灭的斗士","我的对手，总是在上场前一晚，生一场怪病。"],
 ["n1","","那「第一千零一场就能出去」呢？"],
 ["v_champ","不灭的斗士","……那一句，没有人去做成真的。所以我等了这么多年。"],
 ["v_champ","不灭的斗士","笼子里……还有一个。它每场都在看台上给我喊加油，喊到嗓子都哑了。替我……带它出去。"],
 ["v_horn","报幕喇叭","（咔……）本场比赛……挑战者……获胜。"],
 ["v_horn","报幕喇叭","（滋……）冠军……退役。"]],
dsq_cup:[["n1","","（场地边上的笼子里，蹲着一只很小很小的奶茶杯。杯盖上画着笑脸，笑脸已经被擦得发白了。）"],
 ["v_cup","迷你奶茶杯","……它最后有说什么吗？"],
 ["n1","","它说，你每场都给它喊加油。它让我带你出去。"],
 ["v_cup","迷你奶茶杯","……"],
 ["v_cup","迷你奶茶杯","它以前不是那样的。它会把赢来的奶茶分给看台上的小孩，自己只喝杯底。"],
 ["v_cup","迷你奶茶杯","后来那个黑袍子来了，它就再也不看看台了。"],
 ["v_cup","迷你奶茶杯","我跟你走。那个人身上有股味道，像烧糊的糖。我闻到了，一定认得出来。"],
 ["n1","","（能让人把一句话信到忘了自己是谁……这座塔里，有人专门干这种事。）"]],
cs_smell:[["v_cup","迷你奶茶杯","……等一下。"],
 ["v_cup","迷你奶茶杯","烧糊的糖。就是这个味道！"],
 ["v_cup","迷你奶茶杯","在下面，往下面走！"]],
cs_minions:[["e_ctw","咒缚奶猫","（几只奶猫一起抬起头。开口的，却是同一个声音。）"],
 ["e_ctw","咒缚奶猫","你来得比我预言的……早了三天。"],
 ["v_cup","迷你奶茶杯","它们身上全是那个味道！"]],
cs_in:[["v_curser","灭却诅咒师","（黑袍子背对着你，在本子上写着什么。）"],
 ["v_curser","灭却诅咒师","第四层斗场，记录：材料损坏。原因：一只奶蛙。"],
 ["v_curser","灭却诅咒师","……就是你？"],
 ["n1","","斗士在等你答应它的第一千零一场。等了很多年。"],
 ["v_curser","灭却诅咒师","是好材料。一千场，一次都没失手。可惜了。"],
 ["v_cup","迷你奶茶杯","它不是材料！它有名字的！"],
 ["v_curser","灭却诅咒师","有吗？"],
 ["v_curser","灭却诅咒师","我没记。"],
 ["v_curser","灭却诅咒师","（它合上本子，终于转过身来。）让我预言一下：三回合以后，你会开始后悔。"]],
cs_win:[["v_curser","灭却诅咒师","（它跪在地上，肩膀在抖。它在笑。）"],
 ["v_curser","灭却诅咒师","你知道阿岳为什么会坐上那把椅子吗？"],
 ["v_curser","灭却诅咒师","泉水要干了。我告诉他：坐上去，泉水就会回来。"],
 ["v_curser","灭却诅咒师","在那之前，我已经给他说准了九十九件事。第一百件，他凭什么不信？"],
 ["n1","","那九十九件，是影子刺客替你做成的。"],
 ["v_curser","灭却诅咒师","对。那又怎样？"],
 ["v_curser","灭却诅咒师","他得到了力量，坐上了塔顶。我得到了研究不完的材料。谁吃亏了？"],
 ["v_curser","灭却诅咒师","我有什么错？"],
 ["v_curser","灭却诅咒师","（它的眼睛闪了一下。再开口时，声音低得不像它自己。）……椅子……还要……更多……"],
 ["n1","","（黑袍子一下子瘪了下去，化成一股黑烟，钻进了地板的裂缝里。往下，往深渊的方向。）"],
 ["v_cup","迷你奶茶杯","它跑了！……底下是什么？"],
 ["n1","","不知道。但我们迟早要下去。"]],
dream_ay12:[["n1","","（梦里的泉水只剩一个小坑。一个年轻的奶蛙蹲在坑边，用手捧起水，一点一点喂给身边的小奶蛙。）"],
 ["bx","年轻的阿岳","再撑一年。就一年。"],
 ["n1","","（他身后，站着一个穿黑袍子的人。）"],
 ["v_curser","黑袍子","明天，北边那口井会塌。"],
 ["bx","年轻的阿岳","……你谁啊？"],
 ["n1","","（第二天，北井塌了。从那以后，阿岳每天都去找那个黑袍子，管他叫「预言家」。）"],
 ["bx","年轻的阿岳","预言家，你说，今年冬天泉水会怎么样？"],
 ["v_curser","预言家","会干。"]],
dream_ay3:[["n1","","（梦的最深处，是塔顶。那把椅子还是新的。）"],
 ["v_curser","预言家","只有坐上这把椅子的人，能让泉水回来。"],
 ["bx","年轻的阿岳","坐上去以后……我还是我吗？"],
 ["e_xsh","影子刺客","你不坐，就让别人坐。你放心别人吗？"],
 ["bx","年轻的阿岳","……"],
 ["bx","年轻的阿岳","预言家从来没有说错过。"],
 ["n1","","（他坐了上去。梦晃了一下，四周的东西开始往下掉。）"]],
cs2_in:[["n1","","（深渊的水里浮起一件黑袍子。袍子底下，往外渗着紫色的水。）"],
 ["v_curser","灭却诅咒师","又见面了。"],
 ["v_curser","灭却诅咒师","龙蛙大人给了我新的身体。它说，深渊里什么都有，就是没有结局。"],
 ["v_curser","灭却诅咒师","所以这一次，我不用预言了。我直接告诉你结局：你会死在这里。"],
 ["v_cup","迷你奶茶杯","它在骗人！它就是靠这个骗人的！"],
 ["n1","","我知道。这一次，没有人替它把话做成真的了。"]],
cs2_win:[["n1","","（紫色的水从黑袍子里退了出去。袍子底下，是一只很瘦、很老的奶蛙。）"],
 ["v_curser","灭却诅咒师","我预言了那么多事……"],
 ["v_curser","灭却诅咒师","怎么……没算到这个。"],
 ["n1","","（迷你奶茶杯走过去，在它旁边放下一小杯奶茶。什么都没说，走开了。）"]],
spare_note:[["n1","","阿岳，我在预言家的书房里，找到了写着你名字的本子。"],
 ["n1","","北井是影子刺客弄塌的。你信的那九十九件事，都是他们做出来的。"],
 ["n1","","只有第一百件，坐上椅子泉水就会回来，没有人去做。因为它本来就不会成真。"],
 ["bx","奶蛙大魔王","……"],
 ["bx","奶蛙大魔王","那我坐在这里的这些年……"],
 ["v_cup","迷你奶茶杯","不是你的错。斗士也被骗了。它到最后都没想明白。"],
 ["bx","奶蛙大魔王","……原来是这样。"],
 ["n1","","（阿岳第一次，把手从椅子扶手上拿了下来。）"]],
cup_help:[["v_cup","迷你奶茶杯","我来了！喝一口，热的！"]]
});
/* 酒馆闲聊：第四层讲斗场，第五层讲黑袍子 */
try{TAVERN[3].talk.splice(2,0,
 "这厂子底下以前有个斗场。用奶茶喂怪，喂大了就打，打赢的送上楼，给魔王当兵。",
 "那里出过一个怪物，叫「不灭的斗士」。一千场，一场没输。我年轻时在看台上看过它一回，对面那家伙还没站稳，人就飞出场外了。",
 "它赢来的奶茶，都分给看台上的小孩，自己只喝杯底。那时候谁都喜欢它。",
 "后来它没了。不是死了，是没了。那天晚上来了个穿黑袍子的，在笼子边上跟它说了半宿话。第二天笼子空了，斗场也关了。",
 "最近半夜，地底下又有人在喊号子。你要是想下去……我劝你别去。");
 TAVERN[4].talk.splice(1,0,"魔王身边有个穿黑袍子的，大家叫他灭却大人。魔王听谁的？就听他的。","他说的话，十句里十句都准。准得让人心里发毛。")}catch(e){}

/* ===================== 5.5 书房 & 斗场大门 & 隐藏随机事件 ===================== */
Object.assign(EVENTS,{
ss_dsqgate:{ss:1,n:"斗场大门",img:"v_mcolo",t:"奶茶厂最底下有一扇铁门，门上挂着一块牌子：「奶茶厂第一斗场 · 暂停营业」。牌子下面，有人用指甲划了一行小字：「没有暂停。」<br>门缝里吹出一股甜腻腻的风，还有喊号子的声音。门边的柱子上绑着一只生了锈的喇叭。",o:()=>[
 {t:"看看门边的名单",d:"<span class='good'>随机升级 2 张牌</span>",f:()=>{const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);try{upFx(l)}catch(e){}return`名单很长，一千多个名字，全被划掉了。只有最上面一个名字，被人划掉又写上，写上又划掉，纸都磨破了。你看着它，手心发热。升级了：${l.map(cname).join("、")||"没有"}。`}},
 {t:"叫醒门口打瞌睡的老奶茶兵",d:"<span class='good'>+45 金币</span>",f:()=>{S.gold+=45;return"老奶茶兵揉着眼睛，塞给你一袋金币：「押你赢。我押了十年了，一次都没押中过。拿着，赢了记得分我一半。」"}},
 {t:"在门口把东西吃完再进去",d:"<span class='good'>回复 15% 生命</span>",f:()=>{const h=Math.round(S.max*.15);S.hp=Math.min(S.max,S.hp+h);return"你坐在台阶上吃完了最后一块奶糕。门里的号子声停了一下，好像有人在等你。"}}]},
ss_study:{ss:1,n:"预言家的书房",img:"v_mhood",t:()=>"书房里没有窗。四面墙全是书架，书架上全是本子，每本封面写着一个名字。迷你奶茶杯跳上桌子，抽出一本：「斗士」。<br>「第 300 场，右手。已告知影。」<br>「第 1000 场，必胜。对手已处理。」<br>「第 1001 场，不必安排。」<br>旁边一本写着「海底守墓者」：「派它去守那片海。它会一直守下去，它已经什么都不记得了。」<br>最底下压着最厚的一本，封面写着<b>「阿岳」</b>。你翻开第一页：<br>「第一个预言：明天，北井会塌。已告知影。」",o:()=>[
 {t:"带走写着「阿岳」的那一本",cf:"ayNote",d:"<span class='good'>获得「阿岳的本子」</span>",f:()=>{gainRelic("ss_note");ach("aynote");return"本子很沉。你翻到最后一页，上面只有一行：「第一百个预言：坐上去，泉水就会回来。」这一行后面，没有写「已告知影」。"}},
 {t:"把这些本子全撕了",d:"<span class='good'>+60 金币，最大生命 +6</span>",f:()=>{S.gold+=60;S.max+=6;S.hp+=6;ach("tearbook");return"纸屑飞了一屋子。迷你奶茶杯把「斗士」那本的封面捡起来，叠好，塞进了自己的杯子里。抽屉底下压着一袋金币，你顺手拿走了。"}},
 {t:"什么都不碰",d:"<span class='good'>回复 25% 生命</span>",f:()=>{const h=Math.round(S.max*.25);S.hp=Math.min(S.max,S.hp+h);return"你把本子放回原处。有些东西，看过就够了。"}}]},
hv_bottle:{act:3,n:"管子里的漂流瓶",img:"v_seakeeper",req:()=>!!(M.seaK||S.flags.seaKill),t:"奶茶厂的一根排水管里，卡着一只玻璃瓶。瓶子里的纸条湿透了，字还看得清：<br>「今天又有三个实验者被送下来。灭却大人说，他们睡着了。我守着。」<br>字写得很用力，最后一个句号把纸戳穿了。",o:()=>[
 {t:"在纸条背面回一句话",d:"<span class='good'>最大生命 +5</span>",f:()=>{S.max+=5;S.hp+=5;ach("hv_bottle");return"你写：「他们不是睡着了。」然后把瓶子塞回管子里。水流把它冲走的时候，管子深处好像传来一声很低的「咕噜」。"}},
 {t:"把瓶子里的东西倒出来",d:"<span class='good'>+35 金币</span>",f:()=>{S.gold+=35;ach("hv_bottle");return"纸条下面压着几枚长了海草的金币。你不知道它们在水里漂了多少年。"}}]},
hv_bones:{act:3,n:"会哼歌的骨头",img:"v_seakeeper",t:"一块很大的骨头靠在锅炉边上，被烤得发烫。你凑近一点，听见它在哼歌，调子很慢，像是哄小孩睡觉的那种。",o:()=>[
 {t:"跟着哼一遍",d:"<span class='good'>回复 18 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+18);ach("hv_bones");return"你哼完了，骨头就不哼了。锅炉边上很安静。你忽然想起寂静之海底下那个守着墓的大家伙，它是不是也哼过这首歌。"}},
 {t:"把骨头搬到凉快的地方",d:"<span class='good'>获得一件随机遗物</span>，<span class='bad'>失去 8 生命（烫）</span>",ok:S.hp>8,f:()=>{S.hp-=8;gainRelic(randRelic());ach("hv_bones");return"骨头底下压着一样东西。你搬开骨头，它就停止了哼歌，像是终于可以睡了。"}}]},
hv_ticket:{act:3,n:"旧门票",img:"v_mcolo",req:()=>!S.flags.arenaDone,t:"地上有一张皱巴巴的门票：「奶茶厂第一斗场 · 第 512 场 · 不灭的斗士 对 ？？？」。对手的名字被奶茶泡烂了。票根背面，用很小的字写着：「我押冠军。我永远押冠军。」",o:()=>[
 {t:"收好",d:"<span class='good'>挑一张稀有牌</span>",f:async()=>{const r=await chooseReward(offerCards(3,"R",1),"门票里夹着的");ach("hv_ticket");return"门票里还夹着一张牌，像是哪个观众随手塞进去的。"}},
 {t:"在「？？？」那里写上自己的名字",d:"<span class='good'>力气 +1（整局）</span>",f:()=>{S.flags.ssStr=1;ach("hv_ticket");return"写完以后你自己都笑了。可是不知道为什么，你觉得拳头硬了一点。"}}]},
hv_bookie:{act:3,n:"地下赌档",img:"m5",req:()=>!S.flags.arenaDone,t:"一个戴着绿色眼罩的奶蛙坐在两根管子中间，面前摆着一块小黑板：「第一千零一场 · 赔率：冠军 1 赔 1.1，挑战者 1 赔 4」。<br>「来来来，买定离手。斗场重开的那天，我一定第一个开盘。」",o:()=>[
 {t:"押挑战者（押 50）",d:"<span class='bad'>-50 金币</span>，赢了的话以后有惊喜",ok:S.gold>=50,f:()=>{S.gold-=50;S.flags.betChal=1;return"他在黑板上写下你的名字，然后看了你一眼：「你押你自己？……行，有种。」"}},
 {t:"押冠军（押 50）",d:"<span class='bad'>-50 金币</span>",ok:S.gold>=50,f:()=>{S.gold-=50;S.flags.betChamp=1;ach("hv_bookie");return"「明智。」他把钱收进抽屉，「这十几年，押冠军的从来没亏过。」"}},
 {t:"不赌",d:"",f:()=>"「不赌也好。」他打了个哈欠，「反正斗场也不开了。」"}]},
hv_cheer:{act:3,n:"空看台",img:"v_mcolo",t:"你走错了路，走到了一片空看台上。台下的沙地早就干裂了。你坐下来歇脚，耳边却忽然响起一阵欢呼声，几千个人在喊同一个名字。你回头，看台上一个人都没有。",o:()=>[
 {t:"朝场地举一下手",d:"<span class='good'>回复 15 生命，+1 经验</span>",f:async()=>{S.hp=Math.min(S.max,S.hp+15);await gainXP(1);ach("hv_cheer");return"欢呼声停了。过了很久，场地对面，好像也有谁朝你举了一下手。"}},
 {t:"跟着喊那个名字",d:"<span class='good'>随机升级 1 张牌</span>",f:()=>{const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,1);l.forEach(c=>c.u=(c.u|0)+1);ach("hv_cheer");return"你张开嘴，却不知道该喊什么。它们喊的是「不灭的斗士」，可那不是它的名字。没有人知道它原来叫什么。"+(l[0]?`（升级了：${cname(l[0])}）`:"")}}]},
hv_robes:{act:4,n:"一柜子黑袍子",img:"v_mhood",t:"墙边立着一个大衣柜，柜门半开。里面挂着几十件一模一样的黑袍子，每件的袖口都缝着一个编号。最里面那件的口袋鼓鼓的。",o:()=>[
 {t:"翻一翻口袋",d:"<span class='good'>+40 金币</span>",f:()=>{S.gold+=40;ach("hv_robes");return"口袋里有几枚金币，还有一张小纸条：「北井。明天。别让人看见。——影」。纸条已经发黄了，至少是十几年前写的。"}},
 {t:"穿上一件试试",d:"<span class='good'>力气 +1（整局）</span>，<span class='bad'>获得诅咒「沉重」</span>",f:()=>{S.flags.ssStr=1;addCard(mk("heavy"));ach("hv_robes");return"袍子一上身，你耳朵里就响起一个很轻的声音：「坐上去……坐上去……」你赶紧脱了下来。可是那个声音，好像在你脑子里多待了一会儿。"}},
 {t:"一把火烧了",d:"<span class='good'>回复 10 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+10);ach("hv_robes");return"黑袍子烧起来是蓝色的火，一点都不暖和。烧完以后，柜子底下露出一行刻字：「第 31 号，叛逃。」"}}]},
hv_apprentice:{act:4,n:"抄写的小学徒",img:"v_mhood",t:"一只小奶蛙趴在桌上抄东西，墨水蹭了一脸。它看见你，吓得把笔都扔了：「我、我只是个抄预言的！灭却大人说什么，我就抄什么！」<br>你看了一眼它在抄的东西：「明天黄昏，东边第三座桥会断。已告知影。」",o:()=>[
 {t:"告诉它这些预言是怎么「应验」的",d:"<span class='good'>得到 1 瓶解毒剂</span>",f:()=>{if(S.pots.length<(S.potSlots||3))S.pots.push("pantidote");else S.gold+=30;ach("hv_apprentice");return"小学徒听完，半天没说话。然后它从抽屉里掏出一瓶药：「这是灭却大人的解毒剂……你拿去。我、我不抄了。」它把笔折成了两段。"}},
 {t:"让它接着抄，顺便抄一份给你",d:"<span class='good'>挑一张稀有牌</span>",f:async()=>{const r=await chooseReward(offerCards(3,"R",1),"学徒抄给你的");ach("hv_apprentice");return"它抄得很认真，每个字都描了两遍。你拿着那张纸，觉得上面的字在动。"}}]},
hv_bridge:{act:4,n:"第三座桥",img:"e_xsh",t:"黄昏，东边第三座桥。桥底下有个黑影在锯桥墩，锯两下停一下，往四周看看。是影子刺客的手下。<br>你想起了学徒本子上那句话：「明天黄昏，东边第三座桥会断。」",o:()=>[
 {t:"冲下去拦住它",d:"<span class='good'>获得一件稀有遗物</span>，<span class='bad'>失去 10 生命</span>",ok:S.hp>10,f:()=>{S.hp-=10;const id=randRelic("R");if(id)gainRelic(id);ach("hv_bridge");return"黑影跑了，锯子扔在河里。桥没断。这大概是这些年来，第一个没有应验的预言。"}},
 {t:"在旁边看着",d:"<span class='good'>+30 金币</span>",f:()=>{S.gold+=30;ach("hv_bridge");return"桥塌了，「轰」的一声。第二天，所有人都在说：灭却大人又说准了。你攥着在桥边捡到的金币，心里很不舒服。"}}]},
hv_crystal:{act:4,n:"碎掉的水晶球",img:"v_curser",t:"地上滚着一颗裂了缝的水晶球，里面的雾还在转。你凑过去，雾里浮出一行字：「看看你的下一场？」",o:()=>[
 {t:"看",d:"一半一半：<span class='good'>随机升级 3 张牌</span>，或者 <span class='bad'>失去 12 生命</span>",f:()=>{ach("hv_crystal");if(rnd()<.5){const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,3);l.forEach(c=>c.u=(c.u|0)+1);return`雾里是你赢了的样子。看完以后，手上的牌都轻快了：${l.map(cname).join("、")||"没有"}。`}S.hp=Math.max(1,S.hp-12);return"雾里是你倒下的样子。你吓得往后一跳，撞在了墙上。……这个，应该不准吧？"}},
 {t:"一脚踩碎",d:"<span class='good'>+25 金币</span>",f:()=>{S.gold+=25;ach("hv_crystal");return"水晶球碎成了一地亮晶晶的渣子。雾跑出来，在空中写了半个字，就散了。"}}]},
hv_conch:{n:"海螺",img:"v_seakeeper",req:()=>(S.act||0)>=3&&!!(M.seaK||S.flags.seaKill),t:"路边有一只很大的海螺，在离海这么远的地方。你把它贴在耳朵上，听见很远的地方有个声音，一下一下的：<br>「咕噜……灭却大人……答应过……等我守够了……就让我……想起来……」",o:()=>[
 {t:"听完",d:"<span class='good'>最大生命 +6</span>",f:()=>{S.max+=6;S.hp+=6;ach("hv_conch");return"声音最后说：「……我原来……叫什么来着……」然后就没有了。你把海螺放回原地，朝着海的方向。"}},
 {t:"对着海螺说话",d:"<span class='good'>获得 1 层闪避（下一场战斗）</span>，<span class='good'>+20 金币</span>",f:()=>{S.gold+=20;S.flags.nextEvade=1;ach("hv_conch");return"你说：「它骗你的。」海螺那头安静了很久，然后传来一声很轻的「咕噜」。像是听见了，又像是没听见。"}}]},
hv_cupdream:{n:"奶茶杯睡着了",img:"v_cup",req:()=>!!(S.flags&&S.flags.cupFriend),t:"迷你奶茶杯靠着你的包睡着了，在说梦话：「……第五百场……举手了……它朝我举手了……」它翻了个身，杯盖滑下来一点。",o:()=>[
 {t:"把杯盖给它盖好",d:"<span class='good'>回复 12 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+12);ach("hv_cupdream");return"它咂了咂嘴，又睡熟了。你想起弓斗士说过的话：它朝看台举手，几千个人，每个都觉得是在跟自己打招呼。"}},
 {t:"等它醒了问问斗士的事",d:"<span class='good'>力气 +1（整局）</span>",f:()=>{S.flags.ssStr=1;ach("hv_cupdream");return"它醒了，揉着眼睛说：「它出拳之前，左脚会往后挪半步。你学学。」你学了。好像真的有点用。"}}]},
hv_seaguard:{act:4,n:"没寄出去的信",img:"v_seakeeper",req:()=>!!(S.flags&&S.flags.seaKill),t:"一个邮筒倒在路边，里面掉出一封信，收信人写着：「灭却大人亲启」。寄信人那一栏，画了一块骨头。",o:()=>[
 {t:"拆开看",d:"<span class='good'>+1 经验，回复 10 生命</span>",f:async()=>{S.hp=Math.min(S.max,S.hp+10);await gainXP(1);ach("hv_seaguard");return"信只有一句话：「我守了很久了。可以让我想起来了吗？」日期是七年前。这封信从来没有被送到过。"}},
 {t:"替它寄出去",d:"<span class='good'>+40 金币</span>",f:()=>{S.gold+=40;ach("hv_seaguard");return"你把信塞回邮筒，把邮筒扶正。投信口里吐出几枚金币，像是在说谢谢。"}}]}
});

/* ===================== 5.5 成就 ===================== */
ACH.push(
{id:"dsqenter",n:"欢迎光临",d:"走进奶茶厂第一斗场",ic:"sword"},
{id:"shieldwin",n:"穿了第二次",d:"打败盾斗士",ic:"shield"},
{id:"archerwin",n:"头号粉丝",d:"打败弓斗士",ic:"sword"},
{id:"champ",n:"第一千零一场",d:"打败不灭的斗士",ic:"skull"},
{id:"cupfriend",n:"杯盖上的笑脸",d:"救出迷你奶茶杯",ic:"heart"},
{id:"pipebreak",n:"拔管子",d:"打断不灭的斗士背后的奶茶管",ic:"boom"},
{id:"pipe3",n:"水管工",d:"一场战斗里打断奶茶管 3 次",ic:"boom",hid:1,h:"不灭的斗士的管子，修好了还能再断"},
{id:"champnobreak",n:"让它喝个够",d:"一次都不打断奶茶管，打败不灭的斗士",ic:"skull",hid:1,h:"有时候，硬碰硬才是对冠军的尊重"},
{id:"dsqfull",n:"满血退役",d:"死斗场五连战打完时，生命是满的",ic:"heart",hid:1,h:"休息室里别练拳，最后一场也别掉血"},
{id:"dsqtrain",n:"一千拳",d:"在死斗场的休息室对着墙练拳",ic:"sword"},
{id:"hornclick",n:"请不要戳报幕员",d:"在死斗场戳了喇叭 10 次",ic:"q",hid:1,h:"斗场里那只喇叭，好像能点"},
{id:"curser",n:"我有什么错",d:"打败灭却诅咒师",ic:"skull"},
{id:"curser2",n:"没算到",d:"在最终之地打败灭却诅咒师·深渊",ic:"skull"},
{id:"aynote",n:"第一百个预言",d:"从预言家的书房带走阿岳的本子",ic:"deck"},
{id:"tearbook",n:"撕书",d:"把预言家书房里的本子全撕了",ic:"deck"},
{id:"burst50",n:"咒爆",d:"被一次咒爆打掉 50 点以上生命",ic:"boom"},
{id:"debuff8",n:"浑身是病",d:"身上同时有 8 种负面状态",ic:"skull",hid:1,h:"去找那个只会上咒的家伙，什么药都别喝"},
{id:"cleanse",n:"一身轻",d:"一次清掉 4 种以上的负面状态",ic:"heart"},
{id:"minion10",n:"不让你躲",d:"累计打倒 10 只咒缚奶猫",ic:"sword"},
{id:"cuphelp",n:"热的",d:"迷你奶茶杯在决战时来帮你",ic:"heart"},
{id:"truth",n:"原来是这样",d:"把真相告诉阿岳",ic:"star",hid:1,h:"书房里有一本写着他名字的本子。带着它，在塔顶选择宽恕"},
{id:"prophet",n:"预言家从没说错过",d:"在阿岳的梦里看到预言家",ic:"star",hid:1,h:"先打败灭却诅咒师，再走进阿岳的梦"},
{id:"noDebuff",n:"百毒不侵",d:"打败灭却诅咒师时，身上没有任何负面状态",ic:"shield",hid:1,h:"解毒剂、安神茶、清心铃，总有一个能用"},
{id:"nopot",n:"硬扛",d:"一瓶药都不喝，打败灭却诅咒师",ic:"shield",hid:1,h:"真的什么都不喝？"},
{id:"allss",n:"三张悬赏",d:"完成初号机、死斗场、灭却诅咒师三条 SS 线",ic:"star"},
{id:"ss2",n:"两张悬赏",d:"同一局里打倒初号机和不灭的斗士",ic:"star"},
{id:"seakeeper",n:"守墓人下班了",d:"打败海底守墓者",ic:"skull"},
{id:"seakeeper2",n:"又潜下去了",d:"累计打败海底守墓者 2 次",ic:"skull"},
{id:"hv_bottle",n:"漂流瓶",d:"在奶茶厂的管子里捡到一只瓶子",ic:"q",hid:1,h:"先去寂静之海见一见守墓者，再回奶茶厂找找管子"},
{id:"hv_bones",n:"摇篮曲",d:"听一块骨头哼完一首歌",ic:"q",hid:1,h:"奶茶厂的锅炉边上，有东西在哼歌"},
{id:"hv_ticket",n:"第 512 场",d:"捡到一张斗场的旧门票",ic:"q",hid:1,h:"斗场还没打完的时候，奶茶厂的地上会掉东西"},
{id:"hv_bookie",n:"押冠军的人",d:"在地下赌档押了冠军",ic:"coin",hid:1,h:"奶茶厂有个戴绿眼罩的庄家"},
{id:"bookie",n:"爆冷",d:"押挑战者，然后亲手把冠军打倒",ic:"coin",hid:1,h:"在地下赌档押自己，然后去死斗场"},
{id:"hv_cheer",n:"空看台",d:"在空看台上听见欢呼声",ic:"q",hid:1,h:"奶茶厂里迷路一次试试"},
{id:"hv_robes",n:"第 31 号",d:"翻过黑袍子的衣柜",ic:"q",hid:1,h:"星空之顶的某个房间里，挂满了一样的衣服"},
{id:"hv_apprentice",n:"不抄了",d:"见到灭却诅咒师的抄写学徒",ic:"q",hid:1,h:"星空之顶，有人在抄预言"},
{id:"hv_bridge",n:"第三座桥",d:"在桥边看见预言是怎么「应验」的",ic:"q",hid:1,h:"星空之顶的黄昏，东边第三座桥"},
{id:"hv_crystal",n:"碎掉的水晶球",d:"往一颗碎掉的水晶球里看了一眼",ic:"q",hid:1,h:"星空之顶的地上，有东西在转"},
{id:"hv_conch",n:"海螺",d:"在离海很远的地方听见海的声音",ic:"q",hid:1,h:"见过守墓者以后，第四层往上留意路边"},
{id:"hv_cupdream",n:"梦话",d:"听迷你奶茶杯说梦话",ic:"heart",hid:1,h:"带着迷你奶茶杯多走几个事件"},
{id:"hv_seaguard",n:"没寄出去的信",d:"捡到一封写给灭却大人的信",ic:"q",hid:1,h:"打败守墓者以后，星空之顶的路边有个邮筒"},
{id:"dice1",n:"掷骰子",d:"在酒馆和客人掷了一次骰子",ic:"q"},
{id:"dice3",n:"手气正旺",d:"一局里掷骰子赢 3 次",ic:"coin"},
{id:"dice66",n:"双六",d:"掷出两个 6",ic:"star",hid:1,h:"多掷几次骰子"},
{id:"dice11",n:"蛇眼",d:"掷出两个 1",ic:"skull",hid:1,h:"多掷几次骰子，运气差一点也行"},
{id:"diceBroke",n:"输光了",d:"掷骰子输到身上不够 30 金币",ic:"coin",hid:1,h:"赌博有风险"},
{id:"relicSell",n:"换钱",d:"卖掉一件遗物",ic:"coin"},
{id:"relicSell10",n:"倒爷",d:"累计卖掉 10 件遗物",ic:"coin"},
{id:"relic15",n:"挂满了",d:"身上同时有 15 件遗物",ic:"chest"},
{id:"relic25",n:"走路叮当响",d:"身上同时有 25 件遗物",ic:"chest",hid:1,h:"什么都别卖"},
{id:"hit10k",n:"一万点",d:"一下打出 10000 点以上伤害",ic:"sword",hid:1,h:"力气、易伤、金卡……全叠在一张牌上"},
{id:"hit1m",n:"排行榜放不下",d:"一下打出 100 万点以上伤害",ic:"boom",hid:1,h:"你确定？"},
{id:"potion3",n:"连干三瓶",d:"一回合里喝掉 3 瓶药水",ic:"heart"},
{id:"eggs30",n:"蛋满了",d:"场上同时有 30 枚蛋",ic:"star",hid:1,h:"奶蛋牌出得够多就行"}
);
ACH.forEach(a=>{if(a.id==="allboss")a.d="打败首领图鉴里的全部首领"});
/* 旧的隐藏成就 / 不好找的成就：点开给提示 */
const ACH_HINT={jailbreak:"岔路里有个检查站，被关进去以后别急着认命",sweet:"奶茶厂的传送带上，有杯东西可以喝",seven:"第四层的锅炉边上有个布娃娃，带着它一路爬到顶",isekai:"第二层以后的事件，有很小的几率开出一扇奇怪的门",isekai2:"异世界之门里那只奶蛙，可以抓",
 snowhelp:"第三层遇到歪掉的雪人时，选「帮它扶正」。最后一层的首领战，它会滚过来替你挡一下",teatime:"第二层的事件里请月夜伯爵喝一杯奶茶",mudcannon:"打败沼泽之王时，血量保持在一半以上",puppy:"第一层救一只小奶狗，第三层以后它会带朋友来",father:"用吸血鬼奶蛙去打第二层的首领",clue:"打倒初号机以后，把核心带去休息处",elder:"第二次以上登顶，饶过阿岳以后",notover:"在塔顶打倒大魔王以后，先别急着高兴",magic:"礼帽先生会变走你的牌，让它多变几次",bitten:"有的宝箱会咬人",goldfrog:"金色奶蛙三回合就跑",ranaway:"让金色奶蛙跑掉一次",backdoor:"奶茶厂的后门，一次打倒 12 只",arena:"隐藏房间里连赢四场",proto:"第三层酒馆的任务板上，偶尔会有一张彩色的悬赏",ssquest:"酒馆任务板上的彩色悬赏",dream:"真结局路线：饶过阿岳以后",trueend:"二周目以上，走进阿岳的梦，再去最终之地",spare:"二周目以上，在塔顶选择宽恕"};
{const _as=achScreen;achScreen=async function(){const r=_as.apply(this,arguments);try{const g=$("#achGrid");if(g&&!g.dataset.h55){g.dataset.h55=1;g.addEventListener("click",e=>{const c=e.target.closest(".achC");if(!c)return;const i=[...g.children].indexOf(c);const a=ACH[i];if(!a)return;const got=(M.ach||{})[a.id];const hint=a.h||ACH_HINT[a.id];
  tipAt(c,`<b>${a.hid&&!got?"隐藏成就":a.n}</b><p>${a.hid&&!got?"还没解锁。":a.d}</p>${hint?`<p class="achHint">提示：${hint}</p>`:got?"":"<p class=\"achHint\">照着说明去做就行</p>"}`)})}}catch(e){}return r}}

/* ===================== 5.5 首领机制加强 ===================== */
/* 四头奶蛙：睡着一个头，剩下的更凶；醒着的头会互相舔伤口 */
ENEMY.fourhead.ai=(e,t)=>[{k:"atk",v:8},{k:"atk",v:4,x:2,s:"weak",d:1},{k:"def",v:10},{k:"debuff",s:"poison",v:3,s2:"weak",v2:1},{k:"atk",v:10,pool:{t:"boil",n:1}}][t%5];
Object.assign(BM.fourhead,{tip:"醒着几个头，一回合就出手几次；每打掉它四分之一的血就睡着一个头，可剩下的头会更凶（力气 +2）。醒着的头每回合会互相舔伤口回血",
 chip:e=>{const h=Math.max(1,Math.ceil(e.hp/e.max*4));return`醒着 ${h} 个头 · 每回合回 ${3*h}`},
 hit:(e,l)=>{const h=Math.max(1,Math.ceil(e.hp/e.max*4));if(e.heads==null)e.heads=4;if(h<e.heads&&e.hp>0){const n=e.heads-h;e.heads=h;e.str=(e.str||0)+2*n;setTimeout(()=>{if(!B||B.over)return;fxSay(e,"老"+["大","二","三","四"][h]+"睡了！剩下的更凶了");toast(`四头奶蛙睡着了一个头：剩下的头<b>力气 +${2*n}</b>`);renderBattle()},150)}},
 act:async e=>{const h=Math.max(1,Math.ceil(e.hp/e.max*4));const v=3*h;if(e.hp<e.max){e.hp=Math.min(e.max,e.hp+v);fxSay(e,"互相舔伤口 +"+v);renderBattle();await sleep(220)}}});
/* 古堡女巫：多了诅咒和泥巴 */
ENEMY.witch.ai=(e,t)=>e.phase2?[{k:"atk",v:11,x:2,s:"weak",d:1},{k:"add",card:"mud",n:3,pool:{t:"junk",n:1}},{k:"atk",v:24},{k:"debuff",s:"curse",v:1,s2:"vuln",v2:2},{k:"buff",s:"str",v:3}][t%5]:[{k:"atk",v:13},{k:"debuff",s:"vuln",v:2,s2:"weak",v2:1},{k:"atk",v:7,x:2},{k:"def",v:16},{k:"debuff",s:"curse",v:1}][t%5];
Object.assign(BM.witch,{tip:"每 3 回合把你一张手牌变成「青蛙」（这回合没用），回合结束变回来。还会给你下「厄运诅咒」：倒数结束时一大口伤害，记得留着解毒剂"});
/* 冰封奶蛙王：蜡烛会重新点亮，攻击带冻伤 */
ENEMY.iceking.ai=(e,t)=>e.phase2?[{k:"atk",v:10,x:3,s:"frost",d:1,pool:{t:"freeze",n:3}},{k:"atkdef",v:18,b:22},{k:"buff",s:"str",v:3,pool:{t:"freeze",n:2}},{k:"atk",v:32,ult:"冰河时代",s:"frost",d:2}][t%4]:[{k:"atk",v:14,s:"frost",d:1,pool:{t:"freeze",n:2}},{k:"def",v:22,pool:{t:"freeze",n:1}},{k:"atk",v:7,x:3},{k:"atk",v:18,pool:{t:"freeze",n:2}}][t%4];
Object.assign(BM.iceking,{tip:"每回合冻住你最左边的一张手牌。身边的蜡烛每根让你的每一下少 3 点伤害，熄灭的蜡烛每 3 回合会重新点亮一根",chip:e=>`冻住最左边的手牌 · 蜡烛 ${e.candles==null?3:e.candles}`,
 act:async e=>{e.ckT=(e.ckT||0)+1;if(e.ckT%3===0&&e.candles!=null&&e.candles<3){e.candles++;fxSay(e,"蜡烛又亮了");toast("冰封奶蛙王身边<b>重新点亮了一根蜡烛</b>");renderBattle();await sleep(220)}}});
/* 年轻的阿岳：你不打他，他就回血 */
ENEMY.youngyue.ai=(e,t)=>e.phase2?[{k:"atk",v:12,x:2},{k:"atkdef",v:15,b:14},{k:"atk",v:26,ult:"泉边一竿"},{k:"buff",s:"str",v:2}][t%4]:[{k:"atk",v:13},{k:"def",v:16},{k:"atk",v:7,x:2,s:"weak",d:1},{k:"buff",s:"str",v:2}][t%4];
BM.youngyue={say:"我必须上去。",tip:"执念：哪一回合你没打到他，他就回 15 生命。半血以后力气 +3，出招更凶",chip:e=>(e.turnDmg||0)>0?"执念：这回合不回血":"执念：这回合不打他，他会回 15",
 act:async e=>{if(!(e.turnDmg>0)&&e.hp<e.max){e.hp=Math.min(e.max,e.hp+15);fxSay(e,"我还能撑 +15");renderBattle();await sleep(220)}}};
/* 宇宙巨蛋：孵化后更凶，多孵一只星鸡 */
ENEMY.cosmicegg.ai=(e,t)=>e.phase2?[{k:"atk",v:12,x:2,pool:{t:"shuffle"}},{k:"atk",v:32,ult:"超新星"},{k:"buff",s:"str",v:4,pool:{t:"junk",n:2}},{k:"atkdef",v:16,b:22}][t%4]:[{k:"def",v:28},{k:"atk",v:15,pool:{t:"junk",n:2}},{k:"atk",v:8,x:2},{k:"def",v:18,pool:{t:"shuffle"}}][t%4];
Object.assign(BM.cosmicegg,{tip:"孵化之前，它受到的伤害翻倍。孵化后会放出三只星鸡，自己也更凶。趁它还是蛋，尽量多打"});
/* 冰原血兽：冷 */
ENEMY.bloodbeast.ai=(e,t)=>e.phase2?[{k:"atk",v:9,x:3,s:"frost",d:1},{k:"atk",v:24,pool:{t:"freeze",n:2}},{k:"debuff",s:"frost",v:3,s2:"bleed",v2:3},{k:"atkdef",v:14,b:14},{k:"atk",v:30,ult:"冰血咆哮",s:"frost",d:3}][t%5]:[{k:"atk",v:15,s:"frost",d:1},{k:"atk",v:7,x:2,pool:{t:"freeze",n:1}},{k:"debuff",s:"frost",v:2,s2:"weak",v2:1},{k:"def",v:16},{k:"atk",v:18}][t%5];
Object.assign(BM.bloodbeast,{say:"哈！我闻到热乎的了！",tip:"嗅血：你每少 10% 的血，它力气 +1。它的攻击会让你冻伤；你身上冻伤 3 层以上时，它会喝冻住的血回 8 生命。冻伤每回合 -1，别让它叠起来",
 chip:e=>`嗅血：力气 +${e.smell||0}${(B.p.frost||0)>=3?" · 要喝你的冻血了":""}`,
 act:async e=>{const sm=Math.floor((S.max-S.hp)/S.max*10);e.str=(e.str||0)-(e.smell||0)+sm;e.smell=sm;if((B.p.frost||0)>=3&&e.hp<e.max){e.hp=Math.min(e.max,e.hp+8);fxSay(e,"喝冻血 +8");renderBattle();await sleep(220)}}});
try{BOSS_LORE.bloodbeast.td="嗅血 + 冻伤：你掉血越多它越凶；你冻伤叠到 3 层，它就喝你的血"}catch(e){}

/* 背景：死斗场 / 诅咒师领域里换月相也不换背景 */
{const _bb=battleBg;battleBg=function(kind){if(kind==="D")return B&&B.csBg?"curser":"teaarena";if(kind==="J")return"curser";return _bb.apply(this,arguments)}}

/* ===================== 5.5 天气 / 月相流派：更多牌和遗物 ===================== */
Object.assign(CARDS,{
w_forecast:{n:"天气预报",cost:0,type:"skl",r:"C",fam:"none",img:"m5",d:u=>`抽 1 张；只要现在不是晴天，再抽 ${U(u,1,2)} 张`,fx:(B,u)=>{B.draw(1);if(B.wx!=="clear")B.draw(U(u,1,2))}},
w_rainbow:{n:"彩虹",cost:1,cu:0,type:"skl",r:"R",fam:"none",img:"c3",exh:1,d:u=>`天气变晴，回复 ${U(u,8,12)} 生命；这场战斗天气每变过 1 种，奶力 +1（最多 3）。消耗`,fx:(B,u)=>{const n=Math.min(3,Object.keys(B.wxSeen||{}).length);B.setWx("clear");B.heal(U(u,8,12));if(n)B.gainEnergy(n)}},
w_hail:{n:"冰雹",cost:2,cu:1,type:"atk",r:"C",fam:"chick",img:"egl",d:u=>`对所有敌人造成 ${U(u,4,5)} 伤害 3 次；下雪时每个敌人再冻伤 2`,fx:(B,u)=>{B.alive().forEach(e=>{B.hit(e,U(u,4,5),3);if(B.wx==="snow"&&e.hp>0)B.apply(e,"frost",2)})}},
w_thunderclap:{n:"惊雷",cost:2,type:"atk",r:"R",fam:"none",img:"c7",tgt:1,d:u=>`造成 ${U(u,16,22)} 伤害；雷雨时伤害翻倍`,fx:(B,u,t)=>{if(B.wx==="storm"&&!PREV)lightning();B.hit(t,U(u,16,22)*(B.wx==="storm"?2:1))}},
w_mist:{n:"雾中步",cost:1,type:"skl",r:"C",fam:"cat",img:"xsh",d:u=>`获得 ${U(u,7,10)} 护盾和 1 层闪避；大雾时护盾翻倍`,fx:(B,u)=>{B.block(U(u,7,10)*(B.wx==="fog"?2:1));B.p.evade=(B.p.evade||0)+1}},
w_tide:{n:"涨潮",cost:1,type:"atk",r:"C",fam:"frog",img:"c3",tgt:1,d:u=>`造成 ${U(u,6,9)} 伤害，目标每有 1 层潮湿再加 3；下雨时先让它潮湿 2`,fx:(B,u,t)=>{if(B.wx==="rain")B.apply(t,"wet",2);B.hit(t,U(u,6,9)+3*(t.wet||0))}},
w_moonblade:{n:"月刃",cost:1,type:"atk",r:"C",fam:"none",img:"np",tgt:1,d:u=>`造成 ${U(u,7,10)} 伤害；上弦月和满月时打两次`,fx:(B,u,t)=>{B.hit(t,U(u,7,10),B.moon==="wax"||B.moon==="full"?2:1)}},
w_moonwell:{n:"月井",cost:1,cu:0,type:"pow",r:"R",fam:"none",img:"np",d:u=>`每回合开始，月亮往下走一格（新月 → 上弦 → 满月 → 下弦），并获得 ${U(u,3,5)} 护盾`,fx:(B,u)=>{PW(B,"moonwell",U(u,3,5))}},
w_newmoon:{n:"朔夜",cost:0,type:"skl",r:"C",fam:"none",img:"np",d:u=>`新月时奶力 +${U(u,2,3)}；别的月相抽 1 张`,fx:(B,u)=>{if(B.moon==="new")B.gainEnergy(U(u,2,3));else B.draw(1)}},
w_waning:{n:"残月盾",cost:1,type:"skl",r:"C",fam:"none",img:"np",d:u=>`获得 ${U(u,7,10)} 护盾；下弦月时再获得 ${U(u,7,10)}`,fx:(B,u)=>{B.block(U(u,7,10));if(B.moon==="wane")B.block(U(u,7,10))}},
w_skyfall:{n:"天变",cost:2,cu:1,type:"pow",r:"E",fam:"none",img:"c7",d:u=>`这场战斗里，天气或月亮每变一次，对所有敌人造成 ${U(u,6,9)} 伤害`,fx:(B,u)=>{PW(B,"skyfall",U(u,6,9))}},
w_drought:{n:"大旱",cost:1,type:"skl",r:"R",fam:"none",img:"m5",d:u=>`天气变晴；所有敌人烫伤 ${U(u,3,5)}，身上的潮湿全部变成两倍的烫伤`,fx:(B,u)=>{B.setWx("clear");B.alive().forEach(e=>{const w=e.wet||0;e.wet=0;B.apply(e,"burn",U(u,3,5)+2*w)})}}
});
Object.assign(RELICS,{
 r_umbrella:{n:"油纸伞",img:"c3",r:"C",d:"下雨或下雪的时候，每回合开始获得 5 护盾"},
 r_barometer:{n:"晴雨表",img:"m5",r:"R",d:"每场战斗第一次改变天气时，抽 2 张，奶力 +1"},
 r_moonshard:{n:"月亮碎片",img:"np",r:"R",d:"月亮每变一次，力气 +1（每场最多 3 次）"}
});
{const _sw=API.setWx;API.setWx=function(w){const old=this.wx;const r=_sw.apply(this,arguments);try{if(PREV||!B||old===w)return r;B.wxSeen=B.wxSeen||{};B.wxSeen[w]=1;B.skyN=(B.skyN||0)+1;if(B.skyN>=5)ach("skychange");
  if(has("r_barometer")&&!B.baroUsed){B.baroUsed=1;relicPulse("r_barometer");B.draw(2);B.gainEnergy(1)}skyHit()}catch(e){}return r}}
{const _sm=API.setMoon;API.setMoon=function(m){const old=this.moon;const r=_sm.apply(this,arguments);try{if(PREV||!B||old===m)return r;B.moonN=(B.moonN||0)+1;if(B.moonN>=4)ach("moon4");
  if(has("r_moonshard")&&(B.shardN||0)<3){B.shardN=(B.shardN||0)+1;B.p.str+=1;relicPulse("r_moonshard")}skyHit()}catch(e){}return r}}
function skyHit(){const v=B&&B.p&&B.p.pw2&&B.p.pw2.skyfall;if(!v)return;setTimeout(()=>{if(!B||B.over)return;B.alive().forEach(e=>B.hit(e,v,1,1));renderBattle();if(!B.alive().length)win()},120)}
{const _st2=startTurn;startTurn=async function(){const r=await _st2.apply(this,arguments);try{if(!B||B.over)return r;
  if(has("r_umbrella")&&(B.wx==="rain"||B.wx==="snow")){B.block(5,1);relicPulse("r_umbrella")}
  const mw=B.p.pw2&&B.p.pw2.moonwell;if(mw){const O=["new","wax","full","wane"];B.setMoon(O[(O.indexOf(B.moon)+1)%4]);B.block(mw,1)}}catch(e){console.warn(e)}return r}}
ACH.push({id:"skychange",n:"天有不测",d:"一场战斗里天气变了 5 次",ic:"storm"},{id:"moon4",n:"阴晴圆缺",d:"一场战斗里月亮变了 4 次",ic:"star"});
try{if(!S&&$("#title").classList.contains("on"))titleScreen()}catch(e){}

/* ===================== 5.5 敌人出手：按招式、体型分开做动作和声音 ===================== */
const SPK=()=>.72/(typeof SPEED==="number"&&SPEED>0?SPEED:1);
function strikeKind(e,I){const s=I&&I.s;if(s==="burn")return"fire";if(s==="frost")return"ice";if(["poison","curse","night","para"].includes(s))return"magic";const n=(ENEMY[e.id]||{}).n||"";
 if(/弓|炮|枪/.test(n))return"shot";if(/巫|法师|诅咒|主教|预言|圣者|佛|堕天|巨蛋|星/.test(n))return"magic";if(/冰|雪|霜/.test(n))return"ice";if(/熔|火|锅炉|岩浆|烫/.test(n))return"fire";
 if(/骑士|将军|刺客|斗士|伯爵|管家|剑|守卫|魔王|阿岳/.test(n))return"blade";if(/狗|猫|兽|蛇|鼠|龙|熊|蝙蝠|鸡/.test(n))return"claw";return"blunt"}
const KIND_COL={fire:"#ff8a2a",ice:"#9be4ff",magic:"#b77bff",shot:"#ffe9a8",blade:"#ffffff",claw:"#ff5a5a",blunt:"#ffd23f"};
function fxDiv(cls,x,y,ms,html){const F=$("#fx");if(!F)return null;const d=document.createElement("div");d.className=cls;d.style.left=x+"px";d.style.top=y+"px";if(html)d.innerHTML=html;F.appendChild(d);setTimeout(()=>d.remove(),ms);return d}
/* 飞过去的东西：箭、法球、咒 */
function flyOrb(from,to,col,ms,cls){return new Promise(res=>{const d=fxDiv("eOrb "+(cls||""),from.x,from.y,ms+80);if(!d||!d.animate){res();return}d.style.setProperty("--c",col);const dx=to.x-from.x,dy=to.y-from.y;const ang=Math.atan2(dy,dx)*180/Math.PI;
  d.animate([{transform:`translate(0,0) rotate(${ang}deg) scale(.6)`,opacity:.2},{transform:`translate(${dx*.5}px,${dy*.5-26}px) rotate(${ang}deg) scale(1.15)`,opacity:1,offset:.5},{transform:`translate(${dx}px,${dy}px) rotate(${ang}deg) scale(.9)`,opacity:1}],{duration:ms,easing:"cubic-bezier(.4,0,.9,.6)",fill:"forwards"});setTimeout(res,ms)})}
/* 主角挨打：按招式换命中的样子和声音 */
function playerImpact(c,loss,big){const K=(B._strike||{}),k=K.kind||"blunt",i=K.i||0,heavy=!!K.heavy||big,col=KIND_COL[k]||"#fff",rate=1+Math.min(.5,i*.07);const x=c.x+(Math.random()*26-13),y=c.y-20+(Math.random()*26-13);
 if(k==="claw"){const sl=fxDiv("pSlash"+(heavy?" big":""),x,y,520,"<i></i><i></i><i></i>");sxPlay("claw",.5,rate*(heavy?.85:1.05),0,{pan:-.2})}
 else if(k==="blade"){const d=fxDiv("pCut"+(heavy?" big":""),x,y,420,"<i></i>");if(d)d.style.setProperty("--r",(-40+Math.random()*20+(i%2?70:0))+"deg");sxPlay("blade",.5,rate*(heavy?.9:1.1),0,{pan:-.2})||sxPlay("slash",.5,rate)}
 else if(k==="shot"){const d=fxDiv("pCut thin",x,y,360,"<i></i>");if(d)d.style.setProperty("--r","-8deg");sxPlay("knock",.55,rate,0,{pan:-.2});sxPlay("schwing",.25,1.4*rate,0,{pan:-.2})}
 else{fxDiv("pBonk"+(heavy?" big":""),x,y,440).style.setProperty("--c",col);
  if(k==="fire"){sxPlay("firew",.5,rate,0,{pan:-.2});sparks(x,y,"#ff8a2a",heavy?12:6)}else if(k==="ice"){sxPlay("icecrack",.5,rate,0,{pan:-.2});sparks(x,y,"#bff0ff",heavy?12:6)}else if(k==="magic"){sxPlay("glass",.3,1.25*rate,0,{pan:-.2});try{ring(520*rate,.16,.05)}catch(e){}sparks(x,y,"#c79bff",heavy?12:6)}
  else{sxPlay("thud",.6,rate*(heavy?.8:1),0,{pan:-.2});if(heavy){sxPlay("rock",.35,.9,0.02,{pan:-.2});sparks(x,y,"#ffd23f",8)}}}
 /* 掉血越多，被打退得越远 */
 try{const b=$("#player .body");if(b&&b.animate){const d=Math.max(8,Math.min(64,loss*2.2))*(heavy?1.15:1);b.animate([{transform:"none"},{transform:`translateX(${-d}px) rotate(${-Math.min(9,d/7)}deg)`,offset:.22},{transform:`translateX(${-d*.55}px) rotate(${-Math.min(5,d/12)}deg)`,offset:.5},{transform:"none"}],{duration:Math.round((heavy?420:300)*Math.max(.5,SPK()/.72)),easing:"cubic-bezier(.2,.8,.3,1)"})}}catch(e){}}
function playerGuardFx(c){const K=B._strike||{};fxDiv("pGuard",c.x+46,c.y-10,360);sparks(c.x+52,c.y-10,"#bfe6ff",K.heavy?8:4)}
/* 上咒：不冲过来，原地抬手，一团颜色飞到你身上 */
async function enemyCast(e,el,s){try{const body=el.querySelector(".body");const col=(STAT[s]||{}).c||"#b77bff";const k=SPK();
  if(body&&body.animate)body.animate([{transform:"none"},{transform:"translateY(-14px) scale(1.06) rotate(-3deg)",offset:.35},{transform:"translateY(-10px) scale(1.04)",offset:.7},{transform:"none"}],{duration:Math.round(520*k),easing:"ease-out"});
  sxPlay("whoosh",.3,1.5,0,{pan:.2});try{ring(660,.2,.04)}catch(x){}await sleep(160);const a=center(body),b=center($("#player .body"));await flyOrb({x:a.x-30,y:a.y-20},{x:b.x,y:b.y-10},col,Math.round(300*k),"hex");
  fxDiv("pBonk",b.x,b.y-10,440).style.setProperty("--c",col);sparks(b.x,b.y-10,col,6);sxPlay("glass",.28,.9,0,{pan:-.2})}catch(x){}}
/* 出手 */
async function enemyStrike(e,el,I,v,n){const body=el.querySelector(".body"),E=ENEMY[e.id]||{},W=E.boss?2:E.elite?1:0,ult=!!I.ult,kind=strikeKind(e,I),k=SPK();
 const est=v+(e.str||0),heavy=ult||(n===1&&(W===2||est>=18));const ranged=kind==="shot"||(kind==="magic"&&n===1&&!ult&&W<2);
 const pb=$("#player .body"),pc=center(pb),ec=center(body);const gap=Math.max(40,ec.x-pc.x-(W===2?230:170));const A=(kf,ms,ez)=>{try{return body&&body.animate?body.animate(kf,{duration:Math.max(60,Math.round(ms*k)),easing:ez||"ease-out"}):null}catch(x){return null}};
 const strike=(i)=>{B._strike={kind,heavy,i,n};dmgPlayer(v,e);renderBattle()};
 if(ult){const dm=fxDiv("ultDim",0,0,900);sxPlay("sub",.5,.8)||0;sxPlay("whoosh",.4,.5,0,{pan:.2});try{duck(.5,700)}catch(x){}A([{transform:"none"},{transform:"translateX(34px) scale(1.12) rotate(6deg)",offset:.6},{transform:"translateX(40px) scale(1.14) rotate(7deg)"}],320,"ease-in");await sleep(330)}
 if(ranged){ /* 远程：不冲过来，后坐一下，东西飞过去 */
  for(let i=0;i<n;i++){A([{transform:"none"},{transform:"translateX(18px) rotate(4deg) scale(1.03)",offset:.3},{transform:"translateX(-10px) rotate(-3deg)",offset:.55},{transform:"none"}],300);sxPlay(kind==="shot"?"schwing":"whoosh",.35,kind==="shot"?1.2:1.4,0,{pan:.2});await sleep(110);
   const a=center(body),b=center(pb);await flyOrb({x:a.x-40,y:a.y-20},{x:b.x+10,y:b.y-16},KIND_COL[kind],Math.round((heavy?170:210)*k),kind==="shot"?"arrow":"");if(!B||B.over)return;strike(i);if(heavy)stageShake();await sleep(n>1?120:140);if(S.hp<=0)return}
  return}
 if(n===1){ /* 单下：往后缩，再冲过来 */
  const back=heavy?(W===2?54:40):20,wu=heavy?(W===2?.44:.4):.3,T=heavy?(W===2?760:620):440,reach=heavy?gap:Math.min(gap,150+W*40);
  A([{transform:"none",easing:"ease-out"},{transform:`translateX(${back}px) rotate(${heavy?7:4}deg) scale(${heavy?1.08:1.03})`,offset:wu,easing:"cubic-bezier(.7,0,.9,.4)"},{transform:`translateX(${-reach}px) rotate(${heavy?-9:-6}deg) scale(${heavy?1.12:1.04})`,offset:wu+.14,easing:"ease-out"},{transform:`translateX(${-reach*.92}px) rotate(${heavy?-5:-3}deg) scale(${heavy?1.08:1.02})`,offset:wu+.28,easing:"ease-in-out"},{transform:"none"}],T,"linear");
  setTimeout(()=>sxPlay("whoosh",heavy?.45:.3,heavy?(W===2?.6:.75):1.25,0,{pan:.15}),Math.max(0,T*k*(wu-.06)));
  await sleep(T*(wu+.13));if(!B||B.over)return;strike(0);if(heavy){stageShake();try{hitStop(90)}catch(x){}await sleep(90)}await sleep(heavy?150:110);return}
 /* 多段：凑近以后连戳，越戳越快 */
 const reach=Math.min(gap,(W===2?gap:200+W*40));A([{transform:"none"},{transform:`translateX(${-reach}px) rotate(-4deg)`}],170,"cubic-bezier(.3,0,.2,1)");sxPlay("whoosh",.3,1.3,0,{pan:.15});await sleep(170);
 let hold=null;try{hold=body&&body.animate?body.animate([{transform:`translateX(${-reach}px) rotate(-4deg)`},{transform:`translateX(${-reach}px) rotate(-4deg)`}],{duration:60000}):null}catch(x){}
 try{for(let i=0;i<n;i++){const gapT=Math.max(110,200-i*26);A([{transform:`translateX(${-reach}px) rotate(-4deg)`},{transform:`translateX(${-reach-34}px) rotate(${i%2?-10:2}deg) scale(1.05)`,offset:.4},{transform:`translateX(${-reach}px) rotate(-4deg)`}],gapT*.9);await sleep(gapT*.36);if(!B||B.over)return;strike(i);await sleep(gapT*.64);if(S.hp<=0)return}}finally{if(hold)try{hold.cancel()}catch(x){}}
 A([{transform:`translateX(${-reach}px) rotate(-4deg)`},{transform:"none"}],200,"ease-out");await sleep(120)}

/* ===================== 5.5 遗物代价 ===================== */
{const _gr2=gainRelic;gainRelic=function(id){const had=S&&S.relics&&S.relics.includes(id);const r=_gr2.apply(this,arguments);try{if(!had&&id==="r_bowl"&&S.relics.includes("r_bowl")){S.max=Math.max(1,S.max-6);S.hp=Math.min(S.hp,S.max);renderTop()}}catch(e){}return r}}
{const _sc2=startCombat;startCombat=function(kind){_sc2.apply(this,arguments);try{if(B&&has("r_ledger"))B.p.drawMinus=(B.p.drawMinus||0)+1}catch(e){}}}
{const _st3=startTurn;startTurn=async function(){const r=await _st3.apply(this,arguments);try{if(B&&!B.over&&B.turn===1&&has("r_twinshell")&&B.p.energy>0){B.p.energy--;relicPulse("r_twinshell");renderBattle()}}catch(e){}return r}}
{const _sm2=API.setMoon;API.setMoon=function(m){const old=this.moon;const r=_sm2.apply(this,arguments);try{if(!PREV&&B&&m==="new"&&old!=="new"&&has("r_compass")&&B.turn>1){dmgPlayer(3,null,true);relicPulse("r_compass");if(S.hp<=0)lose()}}catch(e){}return r}}

/* ===================== 5.5 秘密房间：没有战斗，只有探索 ===================== */
NODE.W={n:"秘密房间",ic:"np",badge:1};
const upN=n=>{const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,n);l.forEach(c=>c.u=(c.u|0)+1);try{upFx(l)}catch(e){}return l.map(cname).join("、")||"没有能升级的牌"};
const hpUp=n=>{S.max+=n;S.hp+=n};const sHeal=n=>{S.hp=Math.min(S.max,S.hp+n)};const hurt=n=>{S.hp=Math.max(1,S.hp-n)};
const SECRET={
museum:{n:"冒险者博物馆",img:"m6",steps:[
 {t:"墙上的砖是松的。你推了一下，整面墙转了过去。<br>后面是一间落满灰的展厅，玻璃柜里摆着各种旧东西，每个柜子下面贴着一张小纸条：「某某某，在第几层倒下」。角落里坐着一只戴眼镜的老奶蛙，正在打瞌睡。",o:[
  {t:"去看玻璃柜",go:1},{t:"叫醒馆长",go:2}]},
 {t:"三个柜子没上锁。<br>第一个放着一副磨破的拳套，纸条写着「第三层，雪太大了」。<br>第二个放着一张手画的地图，画得歪歪扭扭，有好几处画了圈。<br>第三个放着一张唱片，封面上是一只张着嘴唱歌的小奶蛙。",o:[
  {t:"戴上拳套",d:"<span class='good'>力气 +1（整局）</span>",f:()=>{S.flags.ssStr=1;ach("secret");return"拳套很合手。里面还有前一个主人留下的汗味，你不讨厌。"}},
  {t:"带走地图",d:"<span class='good'>+60 金币，随机升级 1 张牌</span>",f:()=>{S.gold+=60;const u=upN(1);ach("secret");return`地图上画圈的地方，有一处就在这间展厅里：地板下面藏着一袋金币。地图背面还写着几招打法（升级了：${u}）。`}},
  {t:"放一遍唱片",d:"<span class='good'>回满生命</span>",f:()=>{S.hp=S.max;ach("secret");return"是小七的声音。整间展厅的灰好像都安静了下来。你靠着柜子听完了一整面。"}}]},
 {t:"馆长揉着眼睛：「有客人？好多年没人来了。」<br>他从抽屉里摸出一张卡片：「答对一个问题，我就把镇馆之宝借给你。」<br>「这座塔里，走得最高的那个奶蛙，叫什么名字？」",o:[
  {t:"「阿岳。」",d:"<span class='good'>挑一张稀有牌</span>",f:async()=>{await chooseReward(offerCards(3,"R",1),"馆长的镇馆之宝");ach("secret");return"馆长愣了一下，点点头：「……对。他走得最高，也走得最远。」他把东西交给你，转过身去，没再说话。"}},
  {t:"「我。」",d:"<span class='good'>+1 经验</span>",f:async()=>{await gainXP(1);ach("secret");return"馆长笑出了声：「有志气。等你倒下了，我给你也留一个柜子。」"}},
  {t:"「不知道。」",d:"<span class='good'>回复 15 生命</span>",f:()=>{sHeal(15);ach("secret");return"「不知道也好。」馆长给你倒了杯茶，「知道太多的人，都走不远。」"}}]}]},
cellar:{n:"漏水的地下室",img:"c3",steps:[
 {t:"楼梯一直往下走，越走越潮。最底下是一间地下室，伸手不见五指，只听见滴答滴答的水声。<br>墙上挂着一盏油灯，还剩一点点油。",o:[
  {t:"点上灯，往水声那边走",go:1},{t:"不点灯，摸黑往里走",go:2}]},
 {t:"灯光照出一条小水沟，水是从墙缝里渗出来的，清得能看见底。<br>你蹲下来闻了闻——是泉水的味道。",o:[
  {t:"喝几口",d:"<span class='good'>最大生命 +8</span>",f:()=>{hpUp(8);ach("secret");return"凉的，甜的。你突然明白了长老为什么老说「泉水满的时候，喝一口能睡三天」。"}},
  {t:"灌一瓶带走",d:"<span class='good'>得到 1 瓶回血药水</span>",f:()=>{if(S.pots.length<(S.potSlots||3))S.pots.push("pheal");else S.gold+=40;ach("secret");return"你把瓶子灌满，塞好。水在瓶子里晃，像是还想回去。"}}]},
 {t:"你摸着墙往前走，膝盖撞到了一个木箱子。箱子很沉，锁已经锈断了。<br>黑暗里，好像有什么东西在看着你。",o:[
  {t:"打开箱子",d:"<span class='good'>获得一件随机遗物</span>，<span class='bad'>失去 10 生命</span>",f:()=>{hurt(10);gainRelic(randRelic());ach("secret");return"箱子一开，一群蝙蝠从里面炸了出来，在你脸上抓了好几道。等它们飞走，箱底躺着一样东西。"}},
  {t:"轻轻退出去",d:"<span class='good'>+1 经验</span>",f:async()=>{await gainXP(1);ach("secret");return"你屏住呼吸退了出去。关上门的那一刻，里面传来一声很轻的「咕」。"}}]}]},
mirrors:{n:"镜子迷宫",img:"xcs",steps:[
 {t:"一间全是镜子的屋子。每面镜子里都是你，可每个你都不太一样：<br>一个比你壮，一个比你瘦，一个在笑，一个在哭。<br>最里面有三面特别大的镜子。",o:[
  {t:"走向「比你壮」的那个",go:1},{t:"走向「在哭」的那个",go:2}]},
 {t:"镜子里的你抬起拳头，对着你比划了几下。好像在说：「来，我教你。」",o:[
  {t:"跟着它比划",d:"<span class='good'>随机升级 3 张牌</span>，<span class='bad'>失去 8 生命</span>",f:()=>{hurt(8);const u=upN(3);ach("secret");return`它打得太狠了，你被自己的影子揍了一顿。不过打完以后，手上的招式都变利索了（升级了：${u}）。`}},
  {t:"摇摇头，伸手碰镜子",d:"<span class='good'>复制牌组里的一张牌</span>",f:async()=>{const r=await pickCards(S.deck,{title:"镜子会照出哪一张？",sub:"选的这张会多一张一样的"});if(!r||!r[0])return"镜子里什么都没有了。";const c={...r[0]};c.k=undefined;addCard(mk(r[0].id));const n=S.deck[S.deck.length-1];n.u=r[0].u;ach("secret");return`镜子里的你把「${cname(r[0])}」递了出来。你伸手一接，真的有了两张。`}}]},
 {t:"镜子里的你在哭。你问它哭什么，它指了指你的背包。",o:[
  {t:"把一张牌给它",d:"<span class='good'>忘掉一张牌，回复 20 生命</span>",f:async()=>{const r=await pickCards(S.deck,{title:"把哪张牌留给镜子里的你？（忘掉）",sub:"这张牌会从牌组里消失"});if(r&&r[0])S.deck.splice(S.deck.indexOf(r[0]),1);sHeal(20);ach("secret");return r&&r[0]?`它接过「${cname(r[0])}」，不哭了。镜子慢慢变成了一扇普通的窗户。`:"它看了你一会儿，自己擦干了眼泪。"}},
  {t:"抱抱它",d:"<span class='good'>最大生命 +5</span>",f:()=>{hpUp(5);ach("secret");return"你抱住的是一面冰凉的镜子。可松开的时候，你觉得心里暖了一点。"}}]}]},
library:{n:"不许出声的图书馆",img:"m5",steps:[
 {t:"门上贴着一张纸：「本馆不许出声。」<br>屋里一排一排全是书架，书都是奶茶色的封皮。管理员是一只很胖的奶猫，趴在桌上睡着了。<br>有三本书放在桌子上，好像是被人特意挑出来的。",o:[
  {t:"《魔椅图鉴》",d:"<span class='good'>挑一张稀有牌</span>",f:async()=>{await chooseReward(offerCards(3,"R",1),"书里夹着的");ach("secret");return"第一页写着：「它不是木头做的。」后面的字被人用墨涂掉了，只剩一张夹在书里的牌。"}},
  {t:"《不要打开》",go:1},
  {t:"借书卡",d:"<span class='good'>得到 1 瓶随机药水</span>",f:()=>{if(S.pots.length<(S.potSlots||3))S.pots.push(randPot());else S.gold+=40;ach("secret");return"借书卡上写满了名字，最后一个是「阿岳」，借的是一本《怎么让泉水变满》，没还。卡片背面粘着一瓶药水。"}}]},
 {t:"书很薄。你还没翻开，管理员的耳朵就动了一下。",o:[
  {t:"还是翻开",d:"一半一半：<span class='good'>+120 金币</span>，或者 <span class='bad'>获得诅咒「沉重」</span>",f:()=>{ach("secret");if(rnd()<.5){S.gold+=120;return"书里夹满了金币，像是谁藏的私房钱。你一枚一枚塞进口袋，管理员翻了个身，没醒。"}addCard(mk("heavy"));return"「啪！」书里弹出一个弹簧拳头，正打在你脑门上。管理员睁开一只眼：「说了不要打开。」"}},
  {t:"放回去",d:"<span class='good'>回复 10 生命</span>",f:()=>{sHeal(10);ach("secret");return"你把书放回去。管理员闭着眼睛说：「好孩子。」"}}]}]},
observatory:{n:"漏风的天文台",img:"np",steps:[
 {t:"楼梯尽头是一间圆顶的小屋，顶上开了一道缝，一架很旧的望远镜正对着天。<br>望远镜旁边的本子上写着：「转到哪，就是哪。」",o:[
  {t:"对准月亮",go:1},{t:"对准云",go:2}]},
 {t:"镜头里的月亮很大。旁边有个旋钮，可以拧到不同的月相。",o:[
  {t:"拧到满月",d:"<span class='good'>下一场战斗是满月</span>（三连只需要 2 个）",f:()=>{S.flags.nextMoon="full";ach("secret");return"你一拧，窗外的月亮真的圆了。下一场战斗，月亮会站在你这边。"}},
  {t:"拧到上弦月",d:"<span class='good'>下一场战斗是上弦月</span>（攻击牌伤害 +1），<span class='good'>+1 经验</span>",f:async()=>{S.flags.nextMoon="wax";await gainXP(1);ach("secret");return"月亮缺了一半，可是看着很锋利。"}}]},
 {t:"镜头里的云在动。旁边有个旋钮，上面画着几种天气。",o:[
  {t:"拧到下雨",d:"<span class='good'>下一场战斗下雨</span>（奶蛙牌伤害 +2）",f:()=>{S.flags.nextWx="rain";ach("secret");return"雨点打在圆顶上，叮叮咚咚。"}},
  {t:"拧到雷雨",d:"<span class='good'>下一场战斗是雷雨</span>，<span class='good'>+40 金币</span>",f:()=>{S.flags.nextWx="storm";S.gold+=40;ach("secret");return"一道闪电劈在望远镜上，震下来几枚卡在缝里的金币。"}},
  {t:"拧到下雪",d:"<span class='good'>下一场战斗下雪</span>（回合开始护盾只消一半）",f:()=>{S.flags.nextWx="snow";ach("secret");return"圆顶的缝里飘进来几片雪花，落在你鼻尖上就化了。"}}]}]},
kitchen:{n:"没人的奶茶厨房",img:"cty",steps:[
 {t:"一间小厨房，灶上的锅还温着，案板上摆着三样东西：一罐珍珠、一袋糖、一瓶颜色很怪的绿色液体。<br>墙上的配方被撕掉了一半，只剩一句：「先放——」",o:[
  {t:"先放珍珠",go:1},{t:"先放绿色的",go:2}]},
 {t:"珍珠在锅里咕嘟咕嘟地滚。接下来呢？",o:[
  {t:"放糖",d:"<span class='good'>最大生命 +6，回复 10 生命</span>",f:()=>{hpUp(6);sHeal(10);ach("secret");ach("teamaster");return"一锅标准的珍珠奶茶。你一口气喝了三杯，打了一个很长的嗝。"}},
  {t:"放绿色的",d:"一半一半：<span class='good'>力气 +1（整局）</span>，或者 <span class='bad'>失去 12 生命</span>",f:()=>{ach("secret");if(rnd()<.5){S.flags.ssStr=1;return"难喝，但是喝完浑身是劲。"}hurt(12);return"你喝了一口，在地上躺了很久。"}}]},
 {t:"绿色的液体倒进锅里，冒出一股紫烟。锅里的东西好像在看你。",o:[
  {t:"赶紧加糖",d:"<span class='good'>得到 1 瓶解毒剂</span>",f:()=>{if(S.pots.length<(S.potSlots||3))S.pots.push("pantidote");else S.gold+=40;ach("secret");return"紫烟慢慢变白，锅里剩下一小瓶清清亮亮的东西。闻起来像薄荷。"}},
  {t:"盖上锅盖跑",d:"<span class='good'>+1 经验</span>",f:async()=>{await gainXP(1);ach("secret");return"你刚跑出门，身后就「砰」的一声。回头看，锅盖嵌在了天花板上。"}}]}]},
vault:{n:"睡着的宝库",img:"egar",steps:[
 {t:"一间堆满金币的屋子，金币中间趴着一只巨大的奶蛙，鼻孔一张一合，睡得正香。<br>它的肚皮底下压着最多的金币。",o:[
  {t:"轻轻抓一把",d:"<span class='good'>+40 金币</span>",go:1,f:()=>{S.gold+=40;S.cur.sec.g=1;return"你抓了一把，金币叮当响了一下。巨蛙的鼻子抽了抽，没醒。"}},
  {t:"什么都不拿",d:"<span class='good'>+1 经验</span>",f:async()=>{await gainXP(1);ach("secret");return"你看了它一会儿，悄悄退了出去。有些东西，就让它好好睡吧。"}}]},
 {t:()=>`巨蛙还在睡。你已经拿了 ${S.cur.sec.g} 把了。`,o:[
  {t:"再抓一把",d:"越抓越容易吵醒它",go:1,f:()=>{const g=S.cur.sec.g;if(rnd()<.18*g){S.cur.sec.woke=1;return null}S.gold+=40+10*g;S.cur.sec.g=g+1;if(g+1>=5)ach("greedy");return`又一把。巨蛙翻了个身，金币哗啦啦地滑下来一片。`},ok:()=>!S.cur.sec.woke},
  {t:"见好就收",d:"",f:()=>{ach("secret");return`你揣着鼓鼓的口袋溜了出来，一共抓了 ${S.cur.sec.g} 把。`}}]}]}
};
{const _gm=genMap;genMap=function(){const g=_gm.apply(this,arguments);try{if(S&&!S.junc&&!S.dream&&!S.fin&&rnd()<.55){const all=g.flat().filter(n=>n&&(n.t==="m"||n.t==="q")&&n.r>=2&&n.r<=MAPR-4&&!n.story);if(all.length){const n=pick(all);n.t="W";n.grp=null}}}catch(e){}return g}}
function secretRoom(){S.secSeen=S.secSeen||[];if(!S.cur.sec){let ids=Object.keys(SECRET).filter(k=>!S.secSeen.includes(k));if(!ids.length)ids=Object.keys(SECRET);const id=pick(ids);S.secSeen.push(id);S.cur.sec={id,step:0}}saveRun();secRender()}
function secRender(){const c=S.cur.sec,T=SECRET[c.id];if(c.woke){c.woke=0;hurt(15);S.gold=Math.max(0,S.gold-40);renderTop();show("event");$("#event").innerHTML=`<div class="evBox"><div class="phead"><span class="ribbon">秘密房间 · ${T.n}</span></div><div class="evPic"><img src="${IMG(T.img)}"></div><div class="evTxt"><p id="evP">巨蛙睁开了眼睛。<br>它没说话，一巴掌把你拍出了门，连带你刚抓的金币也撒了一路。<br><span class='bad'>失去 15 生命和 40 金币</span></p><div class="evOpts"><button class="evo" id="evGo"><b>离开秘密房间</b></button></div></div></div>`;S.cur=null;saveRun();$("#evGo").onclick=openMap;return}
 const st=T.steps[c.step];show("event");setBg("event");playMusic("secret");const opts=st.o.filter(o=>!o.ok||o.ok());const txt=(c.pre?`<span class="secPre">${c.pre}</span><br>`:"")+(typeof st.t==="function"?st.t():st.t);c.pre=null;
 $("#event").innerHTML=`<div class="evBox"><div class="phead"><span class="ribbon">秘密房间 · ${T.n}</span></div><div class="evPic"><img src="${IMG(T.img)}"></div><div class="evTxt"><p id="evP">${txt}</p><div class="evOpts">${opts.map((o,i)=>`<button class="evo" data-i="${i}"><b>${o.t}</b><small>${o.d||""}</small></button>`).join("")}</div></div></div>`;
 $$("#event .evo").forEach(b=>b.onclick=async()=>{if(b.dataset.busy)return;$$("#event .evo").forEach(x=>x.dataset.busy=1);sfx("click");const o=opts[+b.dataset.i];const r=o.f?await o.f():null;renderTop();if(o.go!=null&&!c.woke||c.woke){if(!c.woke){c.step=o.go;c.pre=r}saveRun();secRender();return}S.cur=null;saveRun();$("#evP").innerHTML=r||"";$(".evOpts").innerHTML=`<button class="evo" id="evGo"><b>离开秘密房间</b></button>`;$("#evGo").onclick=openMap})}
{const _en2=enterNode;enterNode=function(t,resumed,cur){if(t!=="W")return _en2.apply(this,arguments);S.cur=cur||{t,rs:S.rs};if(resumed&&cur){S.rs=cur.rs}saveRun();M.secN=(M.secN||0)+1;saveMeta();secretRoom()}}
{const _sc3=startCombat;startCombat=function(kind){_sc3.apply(this,arguments);try{if(B&&S.flags){if(S.flags.nextMoon){B.setMoon(S.flags.nextMoon);delete S.flags.nextMoon}if(S.flags.nextWx){B.setWx(S.flags.nextWx);delete S.flags.nextWx}}}catch(e){}}}
ACH.push({id:"secret",n:"推开那面墙",d:"第一次走进秘密房间",ic:"q"},{id:"greedy",n:"再一把就好",d:"在睡着的宝库里连抓 5 把金币",ic:"coin",hid:1,h:"秘密房间里有一只睡得很香的大奶蛙"},{id:"teamaster",n:"标准答案",d:"在没人的厨房里煮出一锅标准的珍珠奶茶",ic:"heart",hid:1,h:"先放珍珠，再放糖"});

/* ===================== 5.5 2 费、3 费攻击牌：动作和声音更夸张 ===================== */
{const _pc=playCard;playCard=async function(c,t){let D=null;try{D=CARDS[c.id]}catch(e){}if(B&&!PREV&&D){B._bc=(D.type==="atk"&&D.cost>=2)?{cost:D.cost>=3?3:2,n:0,t:performance.now()}:null}return _pc.apply(this,arguments)}}
{const _hf=hitFx;hitFx=function(x,y,big,blocked,fam,HK,HO){const r=_hf.apply(this,arguments);try{const bc=B&&B._bc;if(bc&&!blocked&&!PREV&&B.myTurn&&performance.now()-bc.t<2500){bc.n++;const d=HO&&typeof HO.d==="number"?HO.d:99,lite=document.documentElement.classList.contains("lite");
  /* 稍微夸张一点就够：第一下够重才给冲击波；一串小伤害的多段牌只垫一声闷响 */
  if(!bc.done&&(d>=(bc.cost>=3?10:8)||bc.n>=4)){bc.done=1;const lv=bc.cost,small=d<(lv>=3?10:8);
   const pb=$("#player .body");if(pb&&pb.animate&&bc.n===1)pb.animate([{transform:"none"},{transform:`translateX(${lv>=3?40:26}px) rotate(${lv>=3?5:3}deg) scale(${lv>=3?1.07:1.04})`,offset:.3},{transform:"none"}],{duration:lv>=3?340:280,easing:"cubic-bezier(.2,.9,.3,1)"});
   if(small){sxPlay("thud",.3,.9,0,{pan:.2})}
   else{fxDiv("pBonk"+(lv>=3?" big":""),x,y,440).style.setProperty("--c",lv>=3?"#ff6b3b":"#ffd23f");if(!lite)sparks(x,y,lv>=3?"#ff6b3b":"#ffd23f",lv>=3?8:5);
    sxPlay("thud",lv>=3?.42:.35,lv>=3?.7:.82,0,{pan:.2});if(lv>=3){sxPlay("punchH",.42,.78,.01,{pan:.2});stageShake();try{hitStop(60)}catch(e){}}}}}}catch(e){}return r}}

/* ===================== 5.5 更多随机事件 ===================== */
Object.assign(EVENTS,{
ev_choir:{act:0,n:"青蛙合唱团",img:"n3",t:"泥塘边站着一排奶蛙，正在排练。指挥是一只戴着树叶帽子的老蛙，看见你，眼睛一亮：「你，过来！我们缺一个低音。」",o:()=>[
 {t:"站进去一起唱",d:"<span class='good'>回复 15 生命</span>",f:()=>{sHeal(15);return"你唱得很一般，但是大家都很开心。唱完以后，你觉得肚子暖暖的。"}},
 {t:"抢过指挥棒",d:"<span class='good'>随机升级 1 张牌</span>",f:()=>{const u=upN(1);return`你挥了几下，合唱团居然跟上了你的节奏。老蛙在旁边点头：「有天分。」（升级了：${u}）`}},
 {t:"故意唱走调",d:"<span class='good'>+35 金币</span>",f:()=>{S.gold+=35;return"大家笑成了一团。老蛙一边擦眼泪一边塞给你一袋钱：「求你别唱了。」"}}]},
ev_ghostchef:{act:1,n:"幽灵厨师",img:"e_ctw",t:"古堡的厨房里，一只半透明的奶猫正在熬汤，锅里什么都没有，它却搅得很认真：「客人，来一碗吗？我已经三百年没有客人了。」",o:()=>[
 {t:"喝一碗",d:"<span class='good'>最大生命 +6</span>，<span class='bad'>获得诅咒「沉重」</span>",f:()=>{hpUp(6);addCard(mk("heavy"));return"汤是凉的，没有味道，可是喝完以后你觉得自己结实了一点——也沉了一点。"}},
 {t:"夸它做得好",d:"<span class='good'>+1 经验</span>",f:async()=>{await gainXP(1);return"幽灵厨师愣住了，然后慢慢变透明，消失了。锅里留下一句话：「谢谢。」"}}]},
ev_icefish:{act:2,n:"冰窟窿钓鱼",img:"egl",t:"冰面上有个圆圆的窟窿，旁边插着一根没人要的鱼竿。窟窿底下有什么在发光。",o:()=>[
 {t:"钓一下",d:"随机：<span class='good'>一张稀有牌 / 60 金币 / 一瓶药水</span>，也可能 <span class='bad'>掉进水里（-10 生命）</span>",f:async()=>{const r=rnd();if(r<.25){hurt(10);return"鱼没上钩，你倒是滑进去了。爬上来的时候，眉毛都结了冰。"}if(r<.5){S.gold+=60;return"钓上来一只铁皮罐子，里面全是金币。"}if(r<.75){if(S.pots.length<(S.potSlots||3))S.pots.push(randPot());else S.gold+=40;return"钓上来一瓶药，瓶子里还游着一条小鱼。"}await chooseReward(offerCards(3,"R",1),"冰窟窿里钓上来的");return"钓上来一张牌，冻得硬邦邦的。"}},
 {t:"把鱼竿收好留给别人",d:"<span class='good'>回复 10 生命</span>",f:()=>{sHeal(10);return"你把鱼竿插回雪里。不知道为什么，你想起了一根枣树枝削的鱼竿。"}}]},
ev_vending:{act:3,n:"奶茶贩卖机",img:"cty",t:"墙角立着一台生锈的奶茶贩卖机，屏幕上闪着：「投币 20」。机器侧面被人踹出了好几个坑。",o:()=>[
 {t:"投币",d:"<span class='bad'>-20 金币</span>，<span class='good'>得到 1 瓶随机药水</span>",ok:S.gold>=20,f:()=>{S.gold-=20;if(S.pots.length<(S.potSlots||3))S.pots.push(randPot());else sHeal(15);return"「咚」的一声，掉出来一瓶药。机器的屏幕上闪了一下：「谢谢惠顾」。"}},
 {t:"踹一脚",d:"一半一半：<span class='good'>2 瓶药水</span>，或者 <span class='bad'>失去 8 生命</span>",f:()=>{if(rnd()<.5){for(let i=0;i<2;i++)if(S.pots.length<(S.potSlots||3))S.pots.push(randPot());return"机器哐当哐当吐出两瓶药。你明白侧面那些坑是怎么来的了。"}hurt(8);return"机器纹丝不动，你的脚肿了。"}}]},
ev_wish:{act:4,n:"流星",img:"np",t:"一颗流星从你头顶划过去，拖着很长的尾巴。旁边一只小奶蛙拉了拉你：「快许愿！快！」",o:()=>[
 {t:"想变强",d:"<span class='good'>力气 +1（整局）</span>",f:()=>{S.flags.ssStr=1;return"你攥紧了拳头。流星好像闪了一下。"}},
 {t:"想活得久一点",d:"<span class='good'>最大生命 +8</span>",f:()=>{hpUp(8);return"小奶蛙说：「这个愿望好。」"}},
 {t:"想让泉水满起来",d:"<span class='good'>回满生命，+1 经验</span>",f:async()=>{S.hp=S.max;await gainXP(1);return"小奶蛙看了你很久：「你和他说的一样。」你问他是谁，它没回答。"}}]},
ev_swap:{n:"换牌的旅人",img:"m4",t:"一只背着大包的奶蛙拦住你：「我收旧牌，换新牌。不问来路，不包好坏。」",o:()=>[
 {t:"换一张",d:"<span class='good'>把一张牌换成随机一张稀有牌</span>",f:async()=>{const r=await pickCards(S.deck,{title:"把哪张牌换掉？",sub:"会换成随机一张稀有牌"});if(!r||!r[0])return null;const nc=offerCards(1,"R",1)[0];S.deck.splice(S.deck.indexOf(r[0]),1,nc);try{gotCard(nc.id)}catch(e){}return`旅人把「${cname(r[0])}」塞进包里，掏出一张「${cname(nc)}」给你：「拿好，不退不换。」`}},
 {t:"不换",d:"",f:()=>"「可惜。」他背着包走远了，包里叮叮当当的。"}]},
ev_bigcat:{n:"挡路的大猫",img:"ctm",t:"一只比你大三倍的奶猫横躺在路中间，肚皮朝天，睡得打呼。路只有这么宽。",o:()=>[
 {t:"摸摸肚子",d:"<span class='good'>回复 12 生命</span>",f:()=>{sHeal(12);return"肚子又软又暖。大猫眯着眼睛呼噜了几声，翻身让开了路。"}},
 {t:"从它身上爬过去",d:"<span class='good'>+40 金币</span>，<span class='bad'>失去 6 生命</span>",f:()=>{S.gold+=40;hurt(6);return"大猫一爪子把你拍了下来，掉在地上的还有它藏在毛里的几枚金币。"}},
 {t:"坐下来等它醒",d:"<span class='good'>+1 经验</span>",f:async()=>{await gainXP(1);return"你等了很久。它醒了，打了个哈欠，看了你一眼，又睡了。你决定绕路。"}}]},
ev_bard:{n:"吟游奶蛙",img:"n3",t:"一只抱着琴的奶蛙坐在路边：「三十个金币，给你唱一首塔里的故事。听完的人，打架都更有劲。」",o:()=>[
 {t:"付钱听",d:"<span class='bad'>-30 金币</span>，<span class='good'>随机升级 2 张牌</span>",ok:S.gold>=30,f:()=>{S.gold-=30;const u=upN(2);return`他唱的是一只奶蛙打了一千场的故事。唱到最后一句，琴弦断了。（升级了：${u}）`}},
 {t:"给他唱一首",d:"<span class='good'>+20 金币</span>",f:()=>{S.gold+=20;return"你唱完，他沉默了一会儿，从琴盒里拿出二十个金币给你：「这首我收下了。」"}}]}
});

/* 5.6 屏幕两边的空白，用当前背景图模糊铺满，不再是一条黑边 */
{const _sb=setBg;setBg=function(){const r=_sb.apply(this,arguments);try{const el=document.querySelector("#bg .bgPhoto,#bg .mPhoto");const u=el&&el.style.backgroundImage;document.body.style.setProperty("--fillImg",u&&u!=="none"?u:"none")}catch(e){}return r}}

/* ===================== 5.6 新塔况：让某一路的牌更容易拿到 ===================== */
Object.assign(MODS,{
 party:{n:"动物派对",d:"奶蛙、奶马、奶鸡、奶猫、奶蛋这些动物牌更容易拿到，但敌人生命 +8%"},
 wxreport:{n:"Weather Report",d:"天气牌更容易拿到，每回合开始还可能变天，但天气变得很快"},
 moongod:{n:"三月女神",d:"月相牌更容易拿到，每场战斗月亮更亮，但敌人力气 +1"},
 curser:{n:"诅咒师",d:"上负面状态的牌更容易拿到，但每场战斗开始你虚弱 1"},
 lastegg:{n:"最后的奶蛋",d:"所有的蛋少等 1 回合就孵，但蛋的伤害 -15%"},
 eggtower:{n:"奶蛋之塔",d:"奶蛋牌更容易拿到，但敌人生命 +8%"}});
Object.assign(MOD_ST,{party:"派",wxreport:"天",moongod:"月",curser:"咒",lastegg:"蛋",eggtower:"塔"});
Object.assign(MOD_GB,{party:["动物牌（奶蛙、奶马、奶鸡、奶猫、奶蛋）更容易拿到","敌人生命 +8%"],wxreport:["天气牌更容易拿到；每回合开始有 1/3 的几率变天","天气说变就变，不一定对你有利"],moongod:["月相牌更容易拿到；每场战斗开局月亮往前走一格","敌人力气 +1"],curser:["上负面状态的牌更容易拿到","每场战斗开始你虚弱 1"],lastegg:["所有的蛋少等 1 回合就孵","蛋的伤害 -15%"],eggtower:["奶蛋牌更容易拿到","敌人生命 +8%"]});
const MOONC=["w_eclipse","w_hidemoon","w_halfmoon","w_moonblade","w_moonwell","w_newmoon","w_waning"];
function modWants(id){const c=CARDS[id];if(!c)return false;let txt="";try{txt=String(c.d(0))}catch(e){}const m=S&&S.mod;
 if(m==="party")return["frog","horse","chick","cat","egg"].includes(c.fam);
 if(m==="eggtower")return c.fam==="egg";
 if(m==="moongod")return MOONC.includes(id)||/月/.test(txt);
 if(m==="wxreport")return(/^w_/.test(id)&&!MOONC.includes(id))||/下雨|下雪|大风|大雾|雷雨|天气/.test(txt);
 if(m==="curser")return(c.type==="atk"||c.type==="skl")&&/虚弱|易伤|中毒|烫伤|冻伤|内伤|破甲|流血|诅咒|麻痹|潮湿/.test(txt);return false}
{const _oc=offerCards;offerCards=function(n,kind,force,shinyFirst){const out=_oc.apply(this,arguments);try{if(!S||!["party","eggtower","moongod","wxreport","curser"].includes(S.mod))return out;
  out.forEach((c,i)=>{if(modWants(c.id)||rnd()>.5)return;const r=CARDS[c.id].r;const pool=POOL_HERO.concat(Object.keys(CARDS).filter(k=>/^w_/.test(k))).filter((x,j,a)=>a.indexOf(x)===j&&CARDS[x]&&CARDS[x].r===r&&(!CARDS[x].hero||CARDS[x].hero===S.hero)&&modWants(x)&&!out.some(o=>o.id===x));if(pool.length){const nc=mk(pick(pool),0);if(c.sh)nc.sh=c.sh;out[i]=nc}})}catch(e){}return out}}
{const _le=API.layEgg;API.layEgg=function(o){try{if(S&&S.mod==="lastegg"&&o){o=Object.assign({},o);o.t=Math.max(1,(o.t||1)-1);if(o.d)o.d=Math.max(1,Math.round(o.d*.85))}}catch(e){}return _le.call(this,o)}}
{const _sc4=startCombat;startCombat=function(kind){_sc4.apply(this,arguments);try{if(!B||!S)return;const m=S.mod;
  if(m==="party"||m==="eggtower")B.enemies.forEach(e=>{e.max=Math.round(e.max*1.08);e.hp=e.max});
  if(m==="moongod"){B.enemies.forEach(e=>e.str=(e.str||0)+1);const O=["new","wax","full","wane"];B.moon=O[(O.indexOf(B.moon)+1)%4];renderSky()}
  if(m==="curser")B.apply(B.p,"weak",1);renderBattle()}catch(e){}}}
{const _st4=startTurn;startTurn=async function(){const r=await _st4.apply(this,arguments);try{if(B&&!B.over&&S.mod==="wxreport"&&B.turn>1&&rnd()<1/3){const L=Object.keys(WX).filter(w=>w!==B.wx);B.setWx(pick(L))}}catch(e){}return r}}

/* ===================== 5.6 奶马 / 奶鸡 / 奶蛋流派遗物 ===================== */
Object.assign(RELICS,{
 r_saddle:{n:"旧马鞍",img:"hrl",r:"R",d:"每回合打出第 2 张奶马牌时，抽 1 张，奶力 +1"},
 r_horseshoe:{n:"马蹄铁",img:"hrl",r:"C",d:"奶马牌每一下伤害 +2"},
 r_carrot:{n:"胡萝卜",img:"hrl",r:"C",d:"这回合第 3 张以后打出的奶马牌，会再踢随机敌人一脚（6 伤害）"},
 r_featherpillow:{n:"羽毛枕",img:"cki",r:"C",d:"奶鸡牌获得的护盾 +3"},
 r_rooster:{n:"公鸡闹钟",img:"cki",r:"C",d:"每回合打出第一张奶鸡牌时，抽 1 张"},
 r_henhouse:{n:"鸡舍",img:"cki",r:"R",d:"回合开始时，如果你还留着 10 点以上护盾，每 10 点下 1 颗小蛋（下回合孵，5 伤害，最多 2 颗）"},
 r_eggcarton:{n:"蛋托",img:"egt",r:"C",d:"你下的每颗蛋，孵化时伤害 +3"},
 r_incubator:{n:"恒温箱",img:"egt",r:"R",d:"每 2 回合，场上所有的蛋少等 1 回合。代价：拿到时最大生命 -5"},
 r_goldyolk:{n:"金蛋黄",img:"egar",r:"R",d:"这场战斗每孵出 5 颗蛋，力气 +1"},
 r_family:{n:"全家福",img:"egsk",r:"R",d:"一回合里奶马、奶鸡、奶蛋牌各打出过 1 张，获得 2 点奶力和 10 护盾（每回合一次）"}
});
{const _pc2=playCard;playCard=async function(c,t){const p0=B?B.played||0:0;const r=await _pc2.apply(this,arguments);try{if(!B||B.over||PREV||(B.played||0)<=p0)return r;const f=(CARDS[c.id]||{}).fam;B.famT=B.famT||{};B.famT[f]=(B.famT[f]||0)+1;
  if(f==="horse"&&has("r_saddle")&&B.famT.horse===2){relicPulse("r_saddle");B.draw(1);B.gainEnergy(1)}
  if(f==="horse"&&has("r_carrot")&&(B.played||0)>=3){const tg=pick(B.alive());if(tg){relicPulse("r_carrot");B.hit(tg,6,1,1);renderBattle();if(!B.alive().length)win()}}
  if(f==="chick"&&has("r_rooster")&&B.famT.chick===1){relicPulse("r_rooster");B.draw(1)}
  if(has("r_family")&&!B.famDone&&B.famT.horse&&B.famT.chick&&B.famT.egg){B.famDone=1;relicPulse("r_family");B.gainEnergy(2);B.block(10,1);toast("全家福：奶马、奶鸡、奶蛋都到齐了")}
  renderBattle()}catch(e){console.warn(e)}return r}}
{const _de2=dealEnemy;dealEnemy=function(t,d,i){try{if(B&&B.curType&&B.curFam==="horse"&&has("r_horseshoe")&&d>0)d+=2}catch(e){}return _de2.call(this,t,d,i)}}
{const _bk=API.block;API.block=function(v,raw){try{if(!raw&&B&&B.curFam==="chick"&&B.curType&&has("r_featherpillow")&&v>0)v+=3}catch(e){}return _bk.call(this,v,raw)}}
{const _le2=API.layEgg;API.layEgg=function(o){try{if(has("r_eggcarton")&&o&&o.d>0){o=Object.assign({},o);o.d+=3}}catch(e){}return _le2.call(this,o)}}
{const _he=hatchEggs;hatchEggs=async function(){const n0=B&&B.eggs?B.eggs.length:0;const r=await _he.apply(this,arguments);try{if(B&&has("r_goldyolk")){const got=Math.max(0,n0-(B.eggs||[]).length);B.yolkN=(B.yolkN||0)+got;while(B.yolkN>=5){B.yolkN-=5;B.p.str+=1;relicPulse("r_goldyolk");toast("金蛋黄：力气 +1")}renderBattle()}}catch(e){}return r}}
{const _st5=startTurn;startTurn=async function(){try{if(B&&!B.over&&has("r_henhouse")&&B.turn>=1&&(B.p.block||0)>=10){const n=Math.min(2,Math.floor(B.p.block/10));for(let i=0;i<n;i++)B.layEgg({t:1,d:5,b:0,mini:1,nw:1});relicPulse("r_henhouse")}}catch(e){}if(B){B.famT={};B.famDone=0}const r=await _st5.apply(this,arguments);try{if(B&&!B.over&&has("r_incubator")&&B.turn%2===0&&(B.eggs||[]).length){B.warmEggs();relicPulse("r_incubator")}}catch(e){}return r}}
{const _gr3=gainRelic;gainRelic=function(id){const had=S&&S.relics&&S.relics.includes(id);const r=_gr3.apply(this,arguments);try{if(!had&&id==="r_incubator"&&S.relics.includes(id)){S.max=Math.max(1,S.max-5);S.hp=Math.min(S.hp,S.max);renderTop()}}catch(e){}return r}}
/* 5.5/5.6 新遗物加进随机池（RELIC_POOL 在 data.js 里就算好了，后加的要自己补进去） */
["r_bell2","r_salt","r_mask","r_umbrella","r_barometer","r_moonshard","r_saddle","r_horseshoe","r_carrot","r_featherpillow","r_rooster","r_henhouse","r_eggcarton","r_incubator","r_goldyolk","r_family"].forEach(k=>{if(RELICS[k]&&!RELIC_POOL.includes(k))RELIC_POOL.push(k)});

/* ===================== 5.6 天气 / 月相流派加强：更多牌、遗物，抬高上限 ===================== */
Object.assign(CARDS,{
w_drizzle:{n:"毛毛雨",cost:0,type:"skl",r:"C",fam:"none",img:"c3",d:u=>`下雨时：所有敌人潮湿 ${U(u,2,3)}。不下雨：天气变成下雨`,fx:(B,u)=>{if(B.wx==="rain")B.alive().forEach(e=>B.apply(e,"wet",U(u,2,3)));else B.setWx("rain")}},
w_downpour:{n:"倾盆大雨",cost:2,cu:1,type:"atk",r:"R",fam:"frog",img:"c3",d:u=>`对所有敌人造成 ${U(u,7,10)} 伤害，目标每有 1 层潮湿再 +2；下雨时打两次`,fx:(B,u)=>{const n=B.wx==="rain"?2:1;B.alive().forEach(e=>B.hit(e,U(u,7,10)+2*(e.wet||0),n))}},
w_frostbite:{n:"冻疮",cost:1,type:"atk",r:"C",fam:"chick",img:"egl",tgt:1,d:u=>`造成 ${U(u,7,10)} 伤害，冻伤 2；下雪时改成冻伤 4`,fx:(B,u,t)=>{B.hit(t,U(u,7,10));if(t.hp>0)B.apply(t,"frost",B.wx==="snow"?4:2)}},
w_blizzard:{n:"暴风雪",cost:2,cu:1,type:"skl",r:"R",fam:"none",img:"egl",d:u=>`天气变成下雪，所有敌人冻伤 3，获得 ${U(u,10,14)} 护盾`,fx:(B,u)=>{B.setWx("snow");B.alive().forEach(e=>B.apply(e,"frost",3));B.block(U(u,10,14))}},
w_whirlwind:{n:"旋风",cost:1,type:"atk",r:"C",fam:"horse",img:"hrl",d:u=>`对所有敌人造成 ${U(u,4,6)} 伤害 2 次；大风时再抽 1 张`,fx:(B,u)=>{B.alive().forEach(e=>B.hit(e,U(u,4,6),2));if(B.wx==="wind")B.draw(1)}},
w_fogveil:{n:"雾隐",cost:1,cu:0,type:"skl",r:"R",fam:"cat",img:"xsh",d:u=>`天气变成大雾，获得 2 层闪避和 ${U(u,4,7)} 护盾`,fx:(B,u)=>{B.setWx("fog");B.p.evade=(B.p.evade||0)+2;B.block(U(u,4,7))}},
w_thunderstep:{n:"雷步",cost:0,type:"skl",r:"C",fam:"none",img:"c7",d:u=>`雷雨时：奶力 +1，抽 ${U(u,1,2)} 张。不是雷雨：天气变成雷雨`,fx:(B,u)=>{if(B.wx==="storm"){B.gainEnergy(1);B.draw(U(u,1,2))}else B.setWx("storm")}},
w_moonrite:{n:"满月祭",cost:2,cu:1,type:"pow",r:"E",fam:"none",img:"np",d:u=>`满月时，每回合开始奶力 +1、获得 ${U(u,6,9)} 护盾。现在就把月亮变满`,fx:(B,u)=>{PW(B,"moonrite",U(u,6,9));B.setMoon("full")}}
});
try{["w_drizzle","w_downpour","w_frostbite","w_blizzard","w_whirlwind","w_fogveil","w_thunderstep","w_moonrite"].forEach(k=>{if(!POOL_HERO.includes(k))POOL_HERO.push(k)});["w_moonrite"].forEach(k=>MOONC.push(k))}catch(e){}
Object.assign(RELICS,{
 r_raingauge:{n:"雨量计",img:"c3",r:"R",d:"下雨时，每回合开始所有敌人潮湿 1。你对潮湿的敌人伤害 +20%"},
 r_icecrystal:{n:"冰晶",img:"egl",r:"R",d:"下雪时，你的攻击每打中一次就让目标冻伤 1（每回合最多 3 次）"},
 r_kite:{n:"风筝",img:"hrl",r:"C",d:"大风时，每回合开始多抽 1 张"},
 r_foglamp:{n:"雾灯",img:"xsh",r:"C",d:"大雾时，敌人每次攻击你有 25% 打偏"},
 r_stormcore:{n:"雷核",img:"c7",r:"R",d:"雷雨时，每回合开始力气 +1（每场最多 +5）"},
 r_vane:{n:"风向标",img:"m5",r:"R",d:"天气每变一次，抽 1 张，获得 4 护盾"},
 r_seasons:{n:"四季手账",img:"m5",r:"E",d:"这场战斗每经历过 1 种天气，你的攻击每一下伤害 +2"},
 r_moonvial:{n:"月光瓶",img:"np",r:"R",d:"满月时，每回合开始奶力 +1"}
});
["r_raingauge","r_icecrystal","r_kite","r_foglamp","r_stormcore","r_vane","r_seasons","r_moonvial"].forEach(k=>{if(!RELIC_POOL.includes(k))RELIC_POOL.push(k)});
{const _st6=startTurn;startTurn=async function(){const r=await _st6.apply(this,arguments);try{if(!B||B.over)return r;B.iceN=0;
  if(B.wx==="rain"&&has("r_raingauge")){B.alive().forEach(e=>B.apply(e,"wet",1));relicPulse("r_raingauge")}
  if(B.wx==="wind"&&has("r_kite")){B.draw(1);relicPulse("r_kite")}
  if(B.wx==="storm"&&has("r_stormcore")&&(B.coreN||0)<5){B.coreN=(B.coreN||0)+1;B.p.str+=1;relicPulse("r_stormcore")}
  if(B.moon==="full"&&has("r_moonvial")){B.gainEnergy(1);relicPulse("r_moonvial")}
  const mr=B.p.pw2&&B.p.pw2.moonrite;if(mr&&B.moon==="full"){B.gainEnergy(1);B.block(mr,1)}
  renderBattle()}catch(e){console.warn(e)}return r}}
{const _de3=dealEnemy;dealEnemy=function(t,d,i){try{if(B&&B.curType&&d>0&&!PREV){if(has("r_raingauge")&&(t.wet||0)>0)d=Math.round(d*1.2);if(has("r_seasons")){const n=Object.keys(Object.assign({[B.wx0||B.wx]:1},B.wxSeen||{})).length;d+=2*n}}}catch(e){}const r=_de3.call(this,t,d,i);try{if(B&&!PREV&&B.curType&&B.wx==="snow"&&has("r_icecrystal")&&(B.iceN||0)<3&&t&&t.hp>0&&d>0){B.iceN=(B.iceN||0)+1;B.apply(t,"frost",1)}}catch(e){}return r}}
{const _sw2=API.setWx;API.setWx=function(w){const old=this.wx;if(B&&!B.wx0)B.wx0=old;const r=_sw2.apply(this,arguments);try{if(!PREV&&B&&old!==w&&has("r_vane")){B.draw(1);B.block(4,1);relicPulse("r_vane")}}catch(e){}return r}}
{const _dp=dmgPlayer;dmgPlayer=function(d,src,raw){try{if(!raw&&src&&B&&B.wx==="fog"&&has("r_foglamp")&&d>0&&rnd()<.25){fxSay2("打偏了");relicPulse("r_foglamp");return}}catch(e){}return _dp.apply(this,arguments)}}
/* 5.5/5.6 加的天气月相牌也放进奖励池（以前漏了，只能在商店以外的地方看到） */
try{Object.keys(CARDS).forEach(k=>{if(/^w_/.test(k)&&!POOL_HERO.includes(k))POOL_HERO.push(k)})}catch(e){}

/* ===================== 5.6 自动省电：掉帧就少放特效 ===================== */
const LITE={on:false,auto:false};
function liteSet(on,auto){LITE.on=!!on;document.documentElement.classList.toggle("lite",LITE.on);try{M.lite=on?(auto?"auto":"on"):"off";saveMeta()}catch(e){}}
try{if(M.lite==="on"||M.lite==="auto")liteSet(true,M.lite==="auto")}catch(e){}
/* 每 4 秒看一次帧率：页面在前台、不在过场、连续两次低于 38 帧，就自动切省电 */
{let fr=[],last=0,low=0;const tick=t=>{if(last)fr.push(t-last);last=t;requestAnimationFrame(tick)};requestAnimationFrame(tick);
 setInterval(()=>{const f=fr;fr=[];last=0;if(document.hidden||LITE.on||(M&&M.lite==="off")||f.length<20)return;const fps=1000*f.length/f.reduce((a,b)=>a+b,0);if(fps<38)low++;else low=0;if(low>=2){low=0;liteSet(true,true);try{toast("画面有点卡，已经自动切到<b>省电模式</b>（少放一些特效）。设置里可以关掉")}catch(e){}}},4000)}
{const _set=settings;settings=function(){const r=_set.apply(this,arguments);try{const box=document.querySelector("#ov .modal .row");if(box&&!document.getElementById("sLite")){const b=document.createElement("button");b.className="btn sm ghost";b.id="sLite";b.style.minWidth="240px";const lab=()=>b.textContent=LITE.on?"省电模式：开（少放特效）":"省电模式：关";lab();b.onclick=()=>{liteSet(!LITE.on,false);if(!LITE.on)M.lite="off";saveMeta();lab();sfx("click")};box.insertBefore(b,box.firstChild)}}catch(e){}return r}}

/* ===================== 5.6 长老的小院：多两条路，旧的路也往后延 ===================== */
META.push(
 {id:"lastBreath",n:"回光",d:()=>"每局第一次受到致命伤害时，留下 1 点生命",max:1,cost:()=>55},
 {id:"pocketM",n:"压岁钱",d:l=>`每上一层，多拿 ${12*l} 金币`,max:3,cost:l=>12+l*8},
 {id:"fastLearn",n:"学得快",d:l=>`获得的经验 +${20*l}%`,max:2,cost:l=>16+l*10},
 {id:"comboHeart",n:"连击心得",d:()=>"一回合连击 5 次以后，之后每一下攻击伤害 +2",max:1,cost:()=>40},
 {id:"famEgg",n:"暖窝",d:l=>`每场战斗开局，场上有 ${l} 颗蛋（2 回合后孵化，8 伤害）`,max:2,cost:l=>14+l*10},
 {id:"famHorse",n:"马厩",d:l=>`奶马牌每一下伤害 +${l}`,max:2,cost:l=>14+l*10},
 {id:"famChick",n:"鸡窝",d:l=>`奶鸡牌获得的护盾 +${2*l}`,max:2,cost:l=>14+l*10},
 {id:"skyWx",n:"看云",d:l=>`天气每变一次，获得 ${3*l} 护盾`,max:2,cost:l=>12+l*8},
 {id:"skyMoon",n:"拜月",d:()=>"满月的战斗里，每回合多抽 1 张",max:1,cost:()=>30},
 {id:"skyStart",n:"老天爷赏饭",d:()=>"每场战斗开局，天气变成对你牌组最有利的那种",max:1,cost:()=>45});
try{YTREE.forEach(b=>{if(b.n==="生存")b.ids.push("lastBreath");if(b.n==="财富")b.ids.push("pocketM");if(b.n==="修行")b.ids.push("fastLearn");if(b.n==="武艺")b.ids.push("comboHeart")});
 YTREE.push({n:"家族",c:"#35b06a",ids:["famEgg","famHorse","famChick"]},{n:"天象",c:"#3a8bff",ids:["skyWx","skyMoon","skyStart"]})}catch(e){}
/* 成长的效果 */
{const _sc5=startCombat;startCombat=function(kind){_sc5.apply(this,arguments);try{if(!B||kind==="R")return;
  for(let i=0;i<mlv("famEgg");i++)B.layEgg({t:2,d:8,b:0,nw:1});
  if(mlv("skyStart")&&!has("r_windbell")&&!has("r_drum")&&!has("snowglobe")){const cnt={};S.deck.forEach(c=>{const f=CARDS[c.id].fam;cnt[f]=(cnt[f]||0)+1});const W={frog:"rain",horse:"wind",chick:"snow",egg:"snow",cat:"fog"};let best=null,bv=0;for(const f in W)if((cnt[f]||0)>bv){bv=cnt[f];best=f}if(best)B.wx=W[best];renderSky()}
  B.lbUsed=0}catch(e){console.warn(e)}}}
{const _de4=dealEnemy;dealEnemy=function(t,d,i){try{if(B&&B.curType&&d>0&&!PREV){if(B.curFam==="horse")d+=mlv("famHorse");if(mlv("comboHeart")&&(B.hitStreak||0)>5)d+=2}}catch(e){}return _de4.call(this,t,d,i)}}
{const _bk2=API.block;API.block=function(v,raw){try{if(!raw&&B&&B.curType&&B.curFam==="chick"&&v>0)v+=2*mlv("famChick")}catch(e){}return _bk2.call(this,v,raw)}}
{const _sw3=API.setWx;API.setWx=function(w){const old=this.wx;const r=_sw3.apply(this,arguments);try{if(!PREV&&B&&old!==w&&mlv("skyWx"))B.block(3*mlv("skyWx"),1)}catch(e){}return r}}
{const _st7=startTurn;startTurn=async function(){const r=await _st7.apply(this,arguments);try{if(B&&!B.over&&B.moon==="full"&&mlv("skyMoon"))B.draw(1)}catch(e){}return r}}
{const _gx=gainXP;gainXP=async function(n){try{const l=mlv("fastLearn");if(l&&n>0)n=Math.max(n,Math.round(n*(1+.2*l)))}catch(e){}return _gx.call(this,n)}}
{const _ac=actClear;actClear=async function(){const a0=S&&S.act;const r=await _ac.apply(this,arguments);try{if(S&&mlv("pocketM")&&S.act!==a0){S.gold+=12*mlv("pocketM");renderTop();saveRun()}}catch(e){}return r}}
{const _dp2=dmgPlayer;dmgPlayer=function(v,src,raw){const r=_dp2.apply(this,arguments);try{if(S&&S.hp<=0&&mlv("lastBreath")&&!S.flags.lastBreath){S.flags.lastBreath=1;S.hp=1;toast("长老教你的「回光」：你留住了 <b>1</b> 点生命（一局一次）");renderBattle()}}catch(e){}return r}}
