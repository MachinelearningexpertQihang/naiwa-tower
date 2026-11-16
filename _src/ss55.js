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
{const _ea=enemyAct;enemyAct=async function(e){const I=e.intent;let hp0=S.hp;if(I&&I.burst){I.v=(I.burst>=3?8:6)+I.burst*csStacks()}const r=await _ea.apply(this,arguments);try{if(I&&I.burst&&hp0-S.hp>=50)ach("burst50");if(I&&I.k==="debuff"&&I.s2&&B&&!B.over&&S.hp>0){B.apply(B.p,I.s2,I.v2||1);renderBattle()}if(B&&negKinds().length>=8)ach("debuff8")}catch(x){}return r}}

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
  B.enemies.forEach(e=>{const el=enEl(e);if(!el)return;el.classList.add("eid-"+e.id);try{if(ENEMY[e.id].boss&&enSize(e)>=280)el.classList.add("bigEn")}catch(x){}});
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
 for(const n1 of S.map[rows[0]].filter(Boolean)){const ch=[n1];let cur=n1,ok=true;for(let i=1;i<rows.length;i++){const nx=cur.nx.map(c=>S.map[rows[i]][c]).find(Boolean);if(!nx){ok=false;break}ch.push(nx);cur=nx}
  if(ok){ch.forEach((n,i)=>{n.t=types[i];n.hid=1;n.grp=grps[i]||undefined;n.story=0;n.gold=0});S.flags[flag]=1;saveRun();if(msg)setTimeout(()=>toast(msg),600);return true}}return false}
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
  if(me[0]===6&&me[1]===6)ach("dice66");if(me[0]===1&&me[1]===1)ach("dice11");const a=me[0]+me[1],b=him[0]+him[1];const r=a>b?1:a<b?-1:0;let extra="";if(N.pro&&a===7)extra="<br><small>……他说中了。</small>";
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
 $("#event").innerHTML=`<div class="evBox dsqBox"><div class="phead"><span class="ribbon">奶茶厂第一斗场</span></div><div class="evPic dsqHorn"><img src="${IMG("v_horn")}" id="dqHorn"></div><div class="evTxt"><div class="dsqProg">${prog}</div><p id="evP">${D.txt}</p><small class="dsqHp">生命 ${S.hp} / ${S.max}　·　押着的金币 ${s.g}</small><div class="evOpts">${opts}</div></div></div>`;
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
Object.assign(BM.bloodbeast,{say:"……好冷。我闻到血了，热的。",tip:"嗅血：你每少 10% 的血，它力气 +1。它的攻击会让你冻伤；你身上冻伤 3 层以上时，它会喝冻住的血回 8 生命。冻伤每回合 -1，别让它叠起来",
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
