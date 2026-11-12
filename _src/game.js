/* ===================== 奶蛙之塔 · 主程序 ===================== */
"use strict";
const VER="4.11";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
/* 图片：把内嵌的 base64 一次性转成 blob 地址，之后每次渲染只传一个短链接，切页面和出牌都快很多 */
const IMG_CACHE={};
function toBlobURL(u){try{if(!u||u.slice(0,5)!=="data:"||!window.URL||!URL.createObjectURL)return u;const i=u.indexOf(",");const mime=u.slice(5,u.indexOf(";"));const bin=atob(u.slice(i+1));const arr=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)arr[j]=bin.charCodeAt(j);return URL.createObjectURL(new Blob([arr],{type:mime}))}catch(e){return u}}
const IMG=k=>{if(k!=="__mimic"&&IMG_CACHE[k])return IMG_CACHE[k];const W_=window.__NWT_IMG||{};const u=k==="__mimic"?(typeof MIMIC_URI!=="undefined"?MIMIC_URI:""):W_[k]||W_["e_"+k]||(k&&k.startsWith("e_")?W_[k.slice(2)]:"")||"";if(!u)return"";const b=toBlobURL(u);IMG_CACHE[k]=b;return b};
let SPEED=1;try{SPEED=+(localStorage.getItem("nwt-speed")||1)||1}catch(e){}
const sleep=ms=>new Promise(r=>setTimeout(r,ms*.72/SPEED));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let S=null,B=null,busy=false;
let M={wins:0,runs:0,shards:0,tale:0,best:0,seen:{}};
try{Object.assign(M,JSON.parse(localStorage.getItem("nwt-meta")||"{}"))}catch(e){}if(typeof M.pals!=="object"||!M.pals){M.palN=typeof M.pals==="number"?M.pals:0;M.pals={}}
const fmtPlay=ms=>{const m=Math.floor((ms||0)/60000),h=Math.floor(m/60);return h?`${h}小时${m%60}分`:`${m}分钟`};
setInterval(()=>{try{if(document.hidden||typeof M==="undefined"||!M)return;M.playMs=(M.playMs||0)+5000;if(typeof S!=="undefined"&&S&&!S.noSave)S.playMs=(S.playMs||0)+5000;M._pt=(M._pt||0)+1;if(M._pt>=12){M._pt=0;saveMeta()}const e=document.getElementById("tPlay");if(e)e.textContent=fmtPlay(M.playMs)}catch(e){}},5000);
addEventListener("pagehide",()=>{try{if(M._pt){M._pt=0;saveMeta()}}catch(e){}});
const saveMeta=()=>{M.t=Date.now();try{localStorage.setItem("nwt-meta",JSON.stringify(M))}catch(e){saveWarn()}try{NWB.soon();CLOUD.mark()}catch(e){}};
let SAVE_ERR=0;const saveWarn=()=>{if(SAVE_ERR)return;SAVE_ERR=1;try{toast("这台设备的存储空间写不进去了，进度可能存不上。请点右上角设置里的「立即存档」试试")}catch(e){}};
const saveRun=()=>{if(S&&S.noSave)return;try{if(S){S.ts=Date.now();localStorage.setItem("nwt-run",JSON.stringify(S));localStorage.removeItem("nwt-run-end")}else{localStorage.removeItem("nwt-run");localStorage.setItem("nwt-run-end","1")}}catch(e){saveWarn()}try{NWB.soon();CLOUD.hot()}catch(e){}};
async function manualSave(){let okL=false,okC=null;try{if(S&&!S.noSave){S.ts=Date.now();const j=JSON.stringify(S);localStorage.setItem("nwt-run",j);okL=localStorage.getItem("nwt-run")===j}else okL=true;M.t=Date.now();const mj=JSON.stringify(M);localStorage.setItem("nwt-meta",mj);okL=okL&&localStorage.getItem("nwt-meta")===mj}catch(e){okL=false}
 try{NWB.save()}catch(e){}
 try{if(CLOUD.st==="on"){CLOUD.dirty=true;const t0=Date.now();for(let i=0;i<20&&CLOUD.busy;i++)await sleep(300);await CLOUD.up(true);okC=CLOUD.lastUp>=t0-200}}catch(e){okC=false}
 sfx(okL?"relic":"hurt");toast(okL?(okC===true?"<b>存好了</b>：本机和云端都已保存":okC===false?"<b>本机已保存</b>，云端这次没连上，稍后会自动再传":"<b>本机已保存</b>"+(CLOUD.st==="nologin"?"（登录 B站 后才有云存档）":"")):"<b>没存上</b>：这台设备写不进存储，请不要关闭游戏，稍后再试");return okL}
const loadRun=()=>{try{const s=JSON.parse(localStorage.getItem("nwt-run")||"null");return s&&s.v===2?s:null}catch(e){return null}};

/* ---------- 随机数（存档可复现） ---------- */
function rnd(){if(!S)return Math.random();let t=S.rs=(S.rs+0x6D2B79F5)|0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
const ri=n=>Math.floor(rnd()*n);
const pick=a=>a[ri(a.length)];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const has=r=>S&&S.relics.includes(r);

/* ---------- 舞台缩放 / 横屏 ---------- */
function fit(){const W=innerWidth,H=innerHeight,st=$("#stage");const port=H>W*1.05;let s;
 if(port){s=Math.min(W/720,H/1280);st.style.transform=`translate(-50%,-50%) rotate(90deg) scale(${s})`}
 else{s=Math.min(W/1280,H/720);st.style.transform=`translate(-50%,-50%) scale(${s})`}
 document.body.classList.toggle("port",port);fit._k=innerWidth+"x"+innerHeight}
function fitSoon(){[60,250,600,1200,2500].forEach(t=>setTimeout(fit,t))}
setInterval(()=>{if(fit._k!==innerWidth+"x"+innerHeight)fit()},700);
if(window.visualViewport)visualViewport.addEventListener("resize",fit);
addEventListener("load",()=>{try{if(window.toy&&toy.onContainerChange)toy.onContainerChange(()=>{fit();fitSoon()})}catch(e){}fitSoon()});
/* 流畅模式：手机上自动打开，去掉大面积投影和会重绘的循环动画 */
try{if((matchMedia("(pointer:coarse)").matches||/Android|iPhone|iPad|Mobile|BiliApp/i.test(navigator.userAgent))&&localStorage.getItem("nwt-fx")!=="full")document.documentElement.classList.add("lite")}catch(e){}
addEventListener("resize",fit);addEventListener("orientationchange",fitSoon);

/* ---------- 音效 ---------- */
/* 真实音效（Kenney CC0）：解码一次，之后叠在合成音上 */

/* ---------- 小工具 ---------- */
function toast(h){const d=document.createElement("div");d.innerHTML=h;$("#toast").appendChild(d);setTimeout(()=>d.remove(),2700)}
function show(id){$$(".scr").forEach(s=>s.classList.toggle("on",s.id===id));$("#stage").classList.toggle("inBattle",id==="battle");$("#top").classList.toggle("on",!!S&&!["title","heroSel","ending","none"].includes(id));closeTip()}
function setBg(kind,moon){const b=$("#bg");const fl=[...Array(7)].map((_,i)=>`<i class="ffly" style="left:${8+i*13}%;bottom:${10+(i*37)%24}%;animation-delay:${i*.9}s"></i>`).join("");
 if(kind==="map"){const A=(S&&S.act)||0,T=MAPTH[A]||MAPTH[0];b.className="bgmap ma"+A;b.innerHTML=`<div class="parch"><div class="mPhoto" style="background-image:url(bg/${S&&S.fin?"final":S&&S.lowHalf&&A<5?"low"+A:T.bg}.jpg)"></div><div class="mGrade"></div><div class="mFx">${T.fx()}</div>${T.deco}</div>`;$("#map").className="scr on ma"+A;dreamBg();return}
 const im=BGIMG[kind];if(im){b.className="photoBg";b.innerHTML=`<div class="bgPhoto" style="background-image:url(bg/${im}.jpg)"></div><div class="bgGrade"></div>`+fl;dreamBg();return}
 b.className="";b.innerHTML=sceneSVG(kind,moon)+(kind==="shop"?"":fl)}
function dreamBg(){const b=$("#bg");if(b)b.classList.toggle("dream",!!(S&&S.dream))}
const BGIMG={low0:"low0",low1:"low1",low2:"low2",low3:"low3",low4:"low4",final:"final",swamp:"forest",reed:"forest",elite:"forest",ruin:"swamp",boss:"swamp",castle:"castle",gate:"gate",boss1:"gate",snowfield:"ice",belltower:"ice",bellE:"ice",bossice:"ice",factory:"gears",pipes:"gears",bossfac:"lava",cosmos:"sky",summit:"sky",boss2:"void",demon:"void",event:"temple"};
let TIP_EL=null,TIP_T=0,TIP_SKIP=0;function closeTip(){clearTimeout(TIP_T);$$(".tipBox").forEach(t=>t.remove());removeEventListener("pointerdown",tipOutside,true)}
function tipOutside(e){if(e&&e.target&&e.target.closest&&e.target.closest(".tipBox"))return;if(TIP_EL&&e&&e.target&&TIP_EL.contains(e.target))TIP_SKIP=Date.now();closeTip()}
function tipAt(el,html){if(TIP_EL===el&&Date.now()-TIP_SKIP<800){TIP_SKIP=0;return}closeTip();TIP_EL=el;TIP_T=setTimeout(closeTip,3500);const r=rectIn(el),d=document.createElement("div");const act=/<button/.test(html);d.className="tipBox"+(act?" act":"");d.innerHTML='<i class="tipX">×</i>'+html;d.onclick=e=>{e.stopPropagation();if(!act||e.target.closest(".tipX")||!e.target.closest("button"))closeTip()};if(act){clearTimeout(TIP_T);TIP_T=setTimeout(closeTip,9000)}$("#stage").appendChild(d);
 let x=r.x+r.w/2-130,y=r.y+r.h+8;x=Math.max(10,Math.min(1010,x));if(y>560)y=r.y-d.offsetHeight-8;d.style.left=x+"px";d.style.top=y+"px";setTimeout(()=>addEventListener("pointerdown",tipOutside,true),30)}
let _stR=null,_stT=0;function stageRect(){const n=performance.now();if(!_stR||n-_stT>250){_stR=$("#stage").getBoundingClientRect();_stT=n}return _stR}addEventListener("resize",()=>{_stR=null});
function rectIn(el){const st=stageRect(),r=el.getBoundingClientRect(),port=document.body.classList.contains("port");
 const sc=port?st.width/720:st.width/1280;
 if(!port)return{x:(r.left-st.left)/sc,y:(r.top-st.top)/sc,w:r.width/sc,h:r.height/sc};
 // 竖屏旋转了 90°：屏幕 x→舞台 y，屏幕 y→舞台(1280-x)
 return{x:(r.top-st.top)/sc,y:(st.right-r.right)/sc,w:r.height/sc,h:r.width/sc}}
function center(el){if(!el)return{x:640,y:360,top:300};const r=rectIn(el);return{x:r.x+r.w/2,y:r.y+r.h/2,top:r.y}}

/* ---------- 卡牌显示 ---------- */
const mk=(id,u=0)=>({id,u,k:S?++S.uid:Math.random()});
function upDiff(c){const D=CARDS[c.id],u=c.u|0,T=k=>{try{return String(D.d(k))}catch(e){return""}};const a=T(u),ca=baseCost(c);for(let k=u+1;k<=3;k++)if(T(k)!==a||baseCost({...c,u:k})!==ca)return true;return false}
function upOK(c){const D=CARDS[c.id];return D&&!D.noUp&&!["cur","sts"].includes(D.type)&&(c.u|0)<3&&upDiff(c)}
function stars(c){const n=c.u|0;return n?"★".repeat(n):""}
function cname(c){return(c.g?"金·":"")+CARDS[c.id].n+(c.u?" "+stars(c):"")}
function baseCost(c){const D=CARDS[c.id];return c.u&&D.cu!=null?D.cu:D.cost}
function curCost(c){const D=CARDS[c.id];if(D.cost<0)return D.cost;let v=baseCost(c);if(c.sh==="cost")v-=1;if(c.tmp!=null)v=c.tmp;if(B&&D.dyn)v+=D.dyn(B);if(B&&B.p.horseFree&&D.fam==="horse")v=0;if(B&&B.p.free)v=0;return Math.max(0,v)}
function liveMod(D){if(!B||!B.p)return null;const p=B.p,sv=[B.curFam,B.curType];B.curFam=D.fam;B.curType=D.type;let wa=0,wb=0;try{wa=B.wxAtk();wb=B.wxBlk()}catch(e){}B.curFam=sv[0];B.curType=sv[1];
 const al=B.alive?B.alive():[];const kb=D.type==="atk"?((p.nextAtk||0)+(S.hero==="knight"&&!B.knAtk?Math.min(20,Math.floor(p.block/3)):0)+(S.hero==="kungfu"&&(B.combo||0)>=2?2:0)):0;return{atk:wa+(p.str||0)+(p.tstr||0)+(B.bonus||0)+kb,weak:p.weak>0,vuln:al.length>0&&al.every(e=>e.vuln>0),blk:wb+(p.dex||0)}}
function descHTML(c,live){const D=CARDS[c.id];const t=D.d((c.u|0));const base=D.d(false).match(/\d+/g)||[];let i=0;const L=live?liveMod(D):null;
 return esc(t).replace(/(\d+)( 点)?( ?)(伤害|护盾)?/g,(all,m,dian,sp,kind)=>{const o=base[i++];let v=+m;
  if(L&&kind==="伤害"&&D.type==="atk"){v=v+L.atk;if(L.weak)v*=.75;if(L.vuln)v*=1.5;v=Math.max(0,Math.floor(v))}
  else if(L&&kind==="护盾"){v=Math.max(0,v+L.blk)}
  const cls=v>+m?"g":v<+m?"r":(c.u&&o!==m?"g":"");return`<b class="${cls}">${v}</b>${dian||""}${sp}${kind||""}`})}
function cardHTML(c,cls=""){const D=CARDS[c.id],fam=FAM[D.fam];let cost=B&&cls.includes("inhand")?curCost(c):baseCost(c);
 let cc="";if(D.cost===-2)cc="na";else if(B&&cls.includes("inhand")&&D.cost>=0){if(cost<baseCost(c))cc="dn";else if(cost>baseCost(c))cc="upc"}
 const cs=D.cost===-1?"X":cost;
 const extra=[D.exh||(D.exhU&&!c.u)?"消耗":"",D.eth?"虚无":""].filter(Boolean);
 return`<div class="card r-${D.r} t-${D.type}${c.frz?" frzC":""}${c.frog?" frogC":""}${c.u?" up":""}${c.g?" gold":""}${c.sh?" shiny":""} ${cls}" data-k="${c.k}" data-id="${c.id}" data-u="${c.u?1:0}">${c.sh?`<span class="shtag">闪·${SHINY[c.sh]}</span>`:""}${c.g?`<span class="gtag">效果×2</span>`:""}${D.aq&&S&&ANQI[D.aq].fav===S.hero?`<span class="gtag aqfav">★擅长 +50%</span>`:""}<div class="cf"><div class="in"><div class="art"><img src="${IMG(D.img)}" alt=""></div><div class="tpc"><em>${TYPE[D.type].n}</em>${D.spell?`<i style="--famc:#c9b2ff">法术</i>`:""}${D.fam!=="none"?`<i style="--famc:${fam.c}">${fam.n}</i>`:""}</div><div class="ds"><span>${descHTML(c,!!B&&cls.includes("inhand"))}</span></div></div><div class="rib"><span>${esc(cname(c))}</span></div></div><div class="cost ${cc}">${cs}</div><i class="gem"></i><span class="tri">三连！</span></div>`}
function relicHTML(id,extra=""){const R=RELICS[id];return`<div class="rl ${extra}" data-rl="${id}"><img src="${IMG(R.img)}" alt=""></div>`}
function potHTML(id){if(!id)return`<div class="pot"></div>`;return`<div class="pot full" data-pot="${id}"><i class="flask2" style="--pc:${POTIONS[id].c}"><i class="cork"></i><i class="neck"></i><i class="body"><i class="liq"></i><i class="shine"></i><i class="bub b1"></i><i class="bub b2"></i></i></i></div>`}
function gotCard(id){if(!CARDS[id])return;M.got=M.got||{};if(!M.got[id]){M.got[id]=1;saveMeta()}}
function seeCard(id){if(!M.seen[id]){M.seen[id]=1;saveMeta()}}

/* ---------- 顶栏 ---------- */
function renderTop(){if(S&&S.deck){if(!M.got){M.got={};Object.keys(M.seen||{}).forEach(k=>{if(CARDS[k])M.got[k]=1})}S.deck.forEach(c=>{if(!M.got[c.id])gotCard(c.id)})}if(S&&S.gold>=500)ach("rich");if(!S)return;const t=$("#top");const fl=S.row<0?0:S.row+1;
 t.innerHTML=`<div class="face"><img src="${IMG(HI())}"></div><div class="lvB" id="lvB"><b>Lv.${S.lv||1}</b><i style="width:${S.lv>=LV_XP.length-1?100:Math.min(100,((S.xp||0)-LV_XP[S.lv||1])/(LV_XP[(S.lv||1)+1]-LV_XP[S.lv||1])*100)}%"></i></div><span class="hpIco">${ICON.heart}</span><div class="hpPill"><i style="width:${S.hp/S.max*100}%"></i><span>${S.hp}/${S.max}</span></div><div class="goldBox">${ICON.coin}${S.gold}</div><div class="pots">${[...Array(S.potSlots)].map((_,i)=>potHTML(S.pots[i])).join("")}</div><div class="relics">${S.relics.map(r=>relicHTML(r)).join("")}</div><div class="floor">${S.junc?`${S.act}.5层 · ${JNAME[S.act]||"交叉路口"}`:S.fin?"最终之地":S.dream?"阿岳的梦":actN().n+(S.lowHalf?"·下":"·上")}<b>${S.atBoss?"首领":fl?fl+"/"+ROWS:"入口"}</b></div>${S.mod&&MODS[S.mod]?`<button class="tbtn modChip" id="modBtn">${MODS[S.mod].n}</button>`:""}<button class="tbtn" id="deckBtn">${ICON.deck}${S.deck.length}</button><button class="tbtn" id="setBtn">${ICON.gear}</button>`;
 $$("#top .rl").forEach(e=>e.onclick=ev=>{ev.stopPropagation();const R=RELICS[e.dataset.rl];tipAt(e,`<b>${R.n}</b><p>${R.d}</p>`)});
 $$("#top .pot.full").forEach((e,i)=>e.onclick=ev=>{ev.stopPropagation();potMenu(e,[...$$("#top .pot")].indexOf(e))});
 {const mb=$("#modBtn");if(mb)mb.onclick=ev=>{ev.stopPropagation();tipAt(mb,`<b>今日塔况：${MODS[S.mod].n}</b><p>${MODS[S.mod].d}</p>`)}}
 $("#deckBtn").onclick=()=>viewCards(S.deck,"我的牌组",`共 ${S.deck.length} 张`);
 $("#setBtn").onclick=settings}
function potMenu(el,i){const id=S.pots[i],P=POTIONS[id];const inB=B&&!B.over&&$("#battle").classList.contains("on");const canUse=inB&&!busy&&B.myTurn||id==="pheal";
 tipAt(el,`<b>${P.n}</b><p>${P.d}</p><div style="display:flex;gap:8px;margin-top:10px">${canUse?`<button class="btn sm" id="pUse" style="min-width:90px">使用</button>`:""}<button class="btn sm ghost" id="pDrop" style="min-width:90px">丢掉</button></div>`);
 const u=$("#pUse");if(u)u.onpointerdown=e=>{e.stopPropagation();closeTip();usePotion(i)};
 $("#pDrop").onpointerdown=e=>{e.stopPropagation();closeTip();S.pots.splice(i,1);renderTop();saveRun()}}
function usePotion(i){const id=S.pots[i],P=POTIONS[id];M.pots=(M.pots||0)+1;if(M.pots>=30)ach("potions");
 if(!B||B.over||!$("#battle").classList.contains("on")){if(id==="pheal"){S.pots.splice(i,1);S.hp=Math.min(S.max,S.hp+20);sfx("heal");toast("回复了 <b>20</b> 生命");renderTop();saveRun()}return}
 if(P.tgt){const al=B.alive();if(al.length===1){S.pots.splice(i,1);P.fx(B,al[0]);afterAction()}else{B.sel={pot:i};hint("点一个敌人使用 "+P.n);renderBattle()}return}
 S.pots.splice(i,1);P.fx(B);sfx("buff");if(rnd()<.5)setTimeout(()=>heroSay(pick(HL("potion"))),300);afterAction()}
function settings(){ov(`<div class="modal"><h3>设置</h3><div class="row" style="flex-direction:column;align-items:center;gap:14px"><button class="btn sm ${A.music?"":"ghost"}" id="sMus" style="min-width:240px">音乐：${A.music?"开":"关"}</button><button class="btn sm ${A.sfx?"":"ghost"}" id="sSfx" style="min-width:240px">音效：${A.sfx?"开":"关"}</button><button class="btn sm ghost" id="sSpeed" style="min-width:240px">战斗速度：${SPEED}×</button><button class="btn sm ghost" id="sTrain" style="min-width:240px">重看规则</button><button class="btn sm ghost" id="sSt" style="min-width:240px">状态说明</button>${(!S||!$("#top").classList.contains("on"))?`<button class="btn sm ghost" id="sMemo" style="min-width:240px">重温回忆</button>`:""}${S&&!S.noSave?`<button class="btn sm" id="sSave" style="min-width:240px">立即存档</button>`:""}<button class="btn sm ghost" id="sQuit" style="min-width:240px">保存并回到标题</button><button class="btn sm pink" id="sGive" style="min-width:240px">放弃这次冒险</button><button class="btn sm" id="sClose" style="min-width:240px">继续</button></div><p class="credit">乐器音色：FluidR3 GM（Frank Wen），CC BY 3.0</p></div>`);
 $("#sMus").onclick=()=>{A.music=!A.music;audioSave();settings()};$("#sSfx").onclick=()=>{A.sfx=!A.sfx;audioSave();settings()};
 $("#sSpeed").onclick=()=>{SPEED=SPEED>=2?1:SPEED>=1.5?2:1.5;try{localStorage.setItem("nwt-speed",SPEED)}catch(e){}document.documentElement.style.setProperty("--spd",SPEED);settings()};$("#sTrain").onclick=async()=>{closeOv();const b=M.trainBase;M.trainBase=0;await training((S&&S.hero)||"naiwa");M.trainBase=b||1;saveMeta()};$("#sClose").onclick=closeOv;if($("#sMemo"))$("#sMemo").onclick=memoPick;$("#sSt").onclick=stCodex;
 if($("#sSave"))$("#sSave").onclick=async()=>{const b=$("#sSave");if(b.disabled)return;b.disabled=true;b.textContent="正在存档……";await manualSave();if($("#sSave")){b.disabled=false;b.textContent="立即存档"}};
 $("#sQuit").onclick=()=>{saveRun();closeOv();B=null;titleScreen()};
 $("#sGive").onclick=()=>confirmBox("放弃这次冒险？","这一次爬塔的进度会消失。",()=>{closeOv();gameOver(true)})}
function confirmBox(t,p,yes){ov(`<div class="modal"><h3>${t}</h3><p>${p}</p><div class="row"><button class="btn sm ghost" id="cNo" style="color:#5a3a1a">再想想</button><button class="btn sm pink" id="cYes">确定</button></div></div>`);$("#cNo").onclick=closeOv;$("#cYes").onclick=yes}

/* ---------- 浮层 ---------- */
function ov(h){const o=$("#ov");o.innerHTML=h;o.classList.add("on")}
function closeOv(){$("#ov").classList.remove("on");$("#ov").innerHTML=""}
function viewCards(list,title,sub,sort=true){let arr=[...list];if(sort)arr.sort((a,b)=>"SCRELXTK".indexOf(CARDS[a.id].r)-"SCRELXTK".indexOf(CARDS[b.id].r)||a.id.localeCompare(b.id));
 ov(`<div class="ovHead"><span class="ribbon b">${title}</span><small>${sub||""}</small></div><div class="ovGrid">${arr.length?arr.map(c=>cardHTML(c,"mid")).join(""):`<div class="ovEmpty">这里还空空的</div>`}</div><div class="ovFoot"><small class="ovTip">点卡牌看详细说明</small><button class="btn sm" id="ovX">返回</button></div>`);$("#ovX").onclick=closeOv;$$("#ov .ovGrid .card").forEach((e,i)=>e.onclick=()=>cardInfo(arr[i]))}
/* 选牌：list=牌实例, opts:{title,sub,n,cancel,filter,confirm(c)->html} */
function pickCards(list,opts){return new Promise(res=>{let sel=[];const n=opts.n||1;
 const draw=()=>{ov(`<div class="ovHead"><span class="ribbon b">${opts.title}</span><small>${opts.sub||""}</small></div><div class="ovGrid">${list.length?list.map(c=>cardHTML(c,"mid"+(sel.includes(c)?" pk":""))).join(""):`<div class="ovEmpty">没有可以选的牌</div>`}</div><div class="ovFoot">${opts.cancel!==false?`<button class="btn sm ghost" id="pkX">${opts.cancelTxt||"算了"}</button>`:""}${n>1?`<button class="btn sm" id="pkOk" ${sel.length?"":"disabled"}>确定</button>`:""}</div>`);
  $$("#ov .ovGrid .card").forEach((e,i)=>e.onclick=()=>{const c=list[i];sfx("click");if(n===1){if(opts.confirm){confirmPick(c)}else{closeOv();res([c])}}else{sel.includes(c)?sel.splice(sel.indexOf(c),1):sel.length<n&&sel.push(c);draw()}});
  const x=$("#pkX");if(x)x.onclick=()=>{closeOv();res([])};const ok=$("#pkOk");if(ok)ok.onclick=()=>{closeOv();res(sel)};
  if(!list.length&&opts.cancel===false)setTimeout(()=>{closeOv();res([])},900)};
 const confirmPick=c=>{ov(`<div class="ovHead"><span class="ribbon b">${opts.title}</span><small>确认一下</small></div><div class="cmpRow">${opts.confirm(c)}</div><div class="ovFoot"><button class="btn sm ghost" id="pkB">换一张</button><button class="btn sm" id="pkY">就它了</button></div>`);$("#pkB").onclick=draw;$("#pkY").onclick=()=>{closeOv();res([c])}};
 draw()})}
function codex(){let up=false,tab="fam",fF="all",fT="all",fO="all";try{if(S&&!S.noSave)saveRun()}catch(e){}const H=POOL_HERO.filter(id=>!CARDS[id].hero),HH=POOL_HERO.filter(id=>CARDS[id].hero);
 const tabs={fam:["家族牌",H],hero:["角色专属",HH],x:["通用牌",POOL_X],pal:["伙伴卡",POOL_PAL],col:["✦ 闪卡收藏",[]],boss:["首领",[]]};const total=[...POOL_HERO,...POOL_X,...POOL_PAL];M.got=M.got||{};
 const d=()=>{if(tab==="boss")return bossCodex();if(tab==="col")return shinyAlbum(()=>{tab="fam";d()},b=>{tab=b;d()});const all0=tabs[tab][1];const all=all0.filter(id=>{const D=CARDS[id];if(fF!=="all"&&D.fam!==fF)return false;if(fT!=="all"&&D.type!==fT)return false;if(fO==="got"&&!M.got[id])return false;if(fO==="miss"&&M.got[id])return false;return true});const fams=[...new Set(all0.map(id=>CARDS[id].fam))];const FB=(k,v,cur,a)=>`<button class="${cur===k?"on":""}" data-${a}="${k}">${v}</button>`;const list=all.map(id=>({id,u:up?1:0,k:"cx"+id}));const got=total.filter(i=>M.got[i]).length;const tg=all.filter(i=>M.got[i]).length;
 ov(`<div class="ovHead"><span class="ribbon b">图鉴</span><small>已收集 ${got} / ${total.length} 张　这一页 ${tg} / ${all.length}${tab==="pal"?"　伙伴卡要在战斗里抓敌人获得":""}</small></div><div class="tabs">${Object.entries(tabs).map(([k,v])=>`<button class="${tab===k?"on":""}" data-t="${k}">${v[0]}</button>`).join("")}<button class="${up?"on":""}" id="cxu" style="margin-left:18px">${up?"升级后":"原版"}</button></div><div class="cxF">${fams.length>1?`<span>${FB("all","全部家族",fF,"ff")}${fams.map(f=>FB(f,(FAM[f]||{n:f}).n,fF,"ff")).join("")}</span>`:""}<span>${FB("all","全部类型",fT,"ft")}${FB("atk","攻击",fT,"ft")}${FB("skl","技能",fT,"ft")}${FB("pow","能力",fT,"ft")}</span><span>${FB("all","全部",fO,"fo")}${FB("got","已收集",fO,"fo")}${FB("miss","未收集",fO,"fo")}</span></div><div class="ovGrid" style="top:190px">${list.length?"":`<p class="cxNone">没有符合条件的牌</p>`}</div><div class="ovFoot"><small class="ovTip">灰色的是还没拿到的牌，效果也能先看看。点卡牌看详细说明</small><button class="btn sm" id="ovX">返回</button></div>`);
 $$("#ov .tabs button[data-t]").forEach(b=>b.onclick=()=>{tab=b.dataset.t;fF="all";fT="all";d()});$$("#ov .cxF button").forEach(b=>b.onclick=()=>{if(b.dataset.ff)fF=b.dataset.ff;if(b.dataset.ft)fT=b.dataset.ft;if(b.dataset.fo)fO=b.dataset.fo;sfx("click");d()});$("#cxu").onclick=()=>{up=!up;d()};{const g=$("#ov .ovGrid");let shown=0;const more=()=>{if(shown>=list.length)return;const part=list.slice(shown,shown+18);shown+=part.length;g.insertAdjacentHTML("beforeend",part.map(c=>cardHTML(c,"mid"+(M.got[c.id]?"":" unk2"))).join(""))};more();g.onscroll=()=>{if(g.scrollTop+g.clientHeight>g.scrollHeight-500)more()};const fill=()=>{if(g.isConnected&&shown<list.length&&g.scrollHeight<=g.clientHeight+260){more();requestAnimationFrame(fill)}};requestAnimationFrame(fill);g.onclick=e=>{const el=e.target.closest(".card[data-id]");if(!el)return;const i=list.findIndex(x=>x.id===el.dataset.id);if(i>=0)cardReveal(list.map(x=>x.id),i,id=>!M.got[id])}}$("#ovX").onclick=()=>{closeOv();if(S&&$("#top").classList.contains("on"))settings()}};d()}


/* 4.0 闪卡收藏册：像宝可梦卡那样，有编号、稀有度和一句小故事，镭射光随手指移动 */
const FLAV={frog:["池塘边最吵的那一只，也是最先跳出来的那一只。","呱一声是打招呼，呱两声是在说「我饿了」。","它说自己会游泳，其实只会扑腾。","奶蛙的拳头软软的，但它从不收回来。","泉水还满的时候，它们每天都在晒肚皮。"],
 horse:["跑得比风快，停下来的时候比谁都喘。","奶马的蹄子踩过的地方，草会长得更好。","它不认路，但它认得回家的方向。","一匹奶马能拉动一车奶茶，两匹能拉动一个梦。"],
 chick:["蛋壳是它的第一件盔甲，到现在还留着。","咯咯哒，是奶鸡唯一会说的、最重要的一句话。","奶鸡护崽的时候，连锅炉都要让三分。","它孵出来的第一眼，看见的是一盏灯。它以为那是妈妈。"],
 cat:["奶猫只在你不需要它的时候出现。需要的时候也是。","它的九条命里，有八条在睡觉。","喵一声，伤口就不那么疼了。大概是心理作用。","奶猫走过的地方，会留下一点点暖。"],
 pal:["被网住的那一刻，它想：这家伙好像也没那么坏。","伙伴不是抓来的，是打出来的交情。","它以前替别人卖命，现在只替你出拳。"],
 magic:["咒语念错了一个字，反而更好用。","星星落下来的时候，会先落在法术上。"],
 none:["这张牌没有家族，所以它谁都帮。","塔里有很多这样的牌：不起眼，但总在关键时候亮一下。","有人说它是从塔顶掉下来的。","长老说，这张牌他年轻时候也用过。"]};
function flavOf(id){const D=CARDS[id];const L=FLAV[D.fam]||FLAV.none;let h=0;for(const ch of id)h=(h*31+ch.charCodeAt(0))>>>0;return L[h%L.length]}
function shinyAlbum(back,goTab){const all=[...POOL_HERO,...POOL_X,...POOL_PAL].filter(id=>CARDS[id]&&!["cur","sts"].includes(CARDS[id].type));const col=M.shinyCol||{};const got=all.filter(id=>col[id]).length;const gg=all.filter(id=>col[id]&&col[id].g).length;
 const num=i=>"No."+String(i+1).padStart(3,"0");
 ov(`<div class="ovHead"><span class="ribbon b">闪卡收藏</span><small>收集了 ${got} / ${all.length} 张闪卡　其中金闪 ${gg} 张　闪卡在奖励、商店里有 1/10 的机会出现</small></div><div class="tabs">${[["fam","家族牌"],["hero","角色专属"],["x","通用牌"],["pal","伙伴卡"],["col","✦ 闪卡收藏"],["boss","首领"]].map(([k,n])=>`<button class="${k==="col"?"on":""}" data-t="${k}">${n}</button>`).join("")}</div>
 <div class="ovGrid albumGrid" style="top:150px">${all.map((id,i)=>{const r=col[id];if(!r)return`<div class="pkSlot empty"><b>${num(i)}</b><i>？</i></div>`;const gold=!!r.g;return`<div class="pkSlot ${gold?"gold":"holo"}" data-id="${id}"><div class="pkCard">${cardHTML({id,u:0,k:"al"+id,sh:Object.keys(SHINY).find(k=>r[k])||"draw",g:gold?1:0},"mid")}<i class="holo"></i></div><div class="pkMeta"><b>${num(i)}</b><span class="pkR ${gold?"g":""}">${gold?"金闪 ★★":"闪 ★"}</span></div><p class="pkFl">${flavOf(id)}</p></div>`}).join("")}</div><div class="ovFoot"><small class="ovTip">手指按住闪卡左右滑动，看镭射光</small><button class="btn sm" id="ovX">返回</button></div>`);
 $$("#ov .tabs button[data-t]").forEach(b=>b.onclick=()=>goTab(b.dataset.t));
 $$("#ov .pkSlot[data-id]").forEach(el=>{const card=el.querySelector(".pkCard");const mv=e=>{const r=card.getBoundingClientRect();const x=((e.clientX-r.left)/r.width),y=((e.clientY-r.top)/r.height);card.style.setProperty("--mx",(x*100)+"%");card.style.setProperty("--my",(y*100)+"%");card.style.transform=`perspective(600px) rotateY(${(x-.5)*22}deg) rotateX(${(.5-y)*18}deg)`};el.onpointermove=mv;el.onpointerleave=()=>{card.style.transform=""};el.onclick=()=>{const ids=[...$$("#ov .pkSlot[data-id]")].map(x=>x.dataset.id);cardReveal(ids,ids.indexOf(el.dataset.id))}});
 $("#ovX").onclick=()=>{closeOv();if(S&&$("#top").classList.contains("on"))settings()}}
/* ---------- 对话 ---------- */
function talk(lines){return new Promise(res=>{const T=$("#talk");let i=0;const L=lines.map(l=>({img:l[0]==="n1"?HI():l[0],who:l[0]==="n1"?HN():l[1],say:l[2],side:l[0]==="n1"?"l":"r"}));
 const left=L.find(l=>l.side==="l"),right=L.find(l=>l.side==="r");
 const step=()=>{if(i>=L.length){T.classList.remove("on");T.onclick=null;res();return}const l=L[i];
  T.innerHTML=`${left?`<div class="pt l ${l.side!=="l"?"dim":""}"><img src="${IMG(l.side==="l"?l.img:left.img)}"></div>`:""}${right?`<div class="pt r ${l.side!=="r"?"dim":""}"><img src="${IMG(l.side==="r"?l.img:(L.slice(0,i+1).reverse().find(x=>x.side==="r")||right).img)}" style="${l.side==="r"?"":""}"></div>`:""}<div class="box"><div class="who ${l.side}">${l.who}</div><div class="say">${esc(l.say)}</div><div class="nx">点一下继续 ▶</div></div>${L.length>2?`<button class="tSkip">跳过 ⏭</button>`:""}`;
  const sk=T.querySelector(".tSkip");if(sk)sk.onclick=ev=>{ev.stopPropagation();i=L.length;step()};
  T.querySelectorAll(".pt img").forEach(im=>{if(!im.getAttribute("src"))im.parentNode.style.visibility="hidden"});T.classList.add("on");sfx("click");i++};T.onclick=step;step()})}

/* ===================== 标题 ===================== */
function bossCodex(){const ids=Object.keys(BOSS_LORE);const rec=M.boss||{};const got=ids.filter(id=>(rec[id]||{}).k).length;
 ov(`<div class="bcx"><div class="mgHead"><span class="ribbon b">首领图鉴</span><small>已解锁 ${got} / ${ids.length}　打败首领后解锁它的故事</small></div><div class="bcxRow"><div class="bcxGrid">${ids.map(id=>{const k=(rec[id]||{}).k;return`<button class="bcxC ${k?"":"lock"}" data-id="${id}"><img src="${IMG(ENEMY[id].img)}"><span>${k?ENEMY[id].n:"？？？"}</span></button>`}).join("")}</div><div class="bcxD" id="bcxD"><p class="bcxHint">点左边的首领看看</p></div></div><div class="ovFoot"><button class="btn" id="bcxX">返回图鉴</button></div></div>`);
 $$(".bcxC").forEach(b=>b.onclick=()=>{$$(".bcxC").forEach(x=>x.classList.remove("on"));b.classList.add("on");const id=b.dataset.id,L=BOSS_LORE[id],k=(rec[id]||{}).k;sfx("click");
  $("#bcxD").innerHTML=k?`<img src="${IMG(ENEMY[id].img)}"><h3>${ENEMY[id].n}</h3><div class="bt"><b>${L.t}</b>${L.td}</div><div class="lore">${[["初见",L.lore,1],["为什么",L.lore2,2],["阿岳与长老",L.lore3,3]].filter(x=>x[1]).map(([h,l,n])=>k>=n?`<h4>${h}</h4>${l.map(x=>`<p>${x}</p>`).join("")}`:`<h4 class="lk">${h}</h4><p class="sp">再打败它 ${n-k} 次解锁</p>`).join("")}</div><small>击败 ${k} 次</small>`:`<img class="sil" src="${IMG(ENEMY[id].img)}"><h3>？？？</h3><p class="bcxHint">还没有打败过它。</p>`});
 $("#bcxX").onclick=()=>codex()}
const mlvRaw=id=>((M.up||{})[id]||0);const mlv=id=>(M.upOff||{})[id]?0:mlvRaw(id);
function earnShards(win){if(!S)return{n:0};LB.onRunEnd(win);const mx=mastGain(win);const rooms=(S.act||0)*(ROWS+1)+Math.max(0,S.row)+1;
 const n=Math.max(1,Math.round((Math.floor(rooms/15)+Math.floor((S.stats.endb||0)/2)+(win?3:0)+Math.floor(asc()/3))*({easy:.6,normal:1,hard:1.5}[S.diff||"normal"]||1)));
 M.shards=(M.shards||0)+n;M.shardsAll=(M.shardsAll||0)+n;saveMeta();return{n}}
function villageTale(){M.seenT=M.seenT||[];const un=VILLAGE_TALES.filter(t=>!M.seenT.includes(t.t));const T=pick(un.length?un:VILLAGE_TALES);if(!M.seenT.includes(T.t))M.seenT.push(T.t);if(VILLAGE_TALES.every(t=>M.seenT.includes(t.t)))ach("tales");saveMeta();return T}
function shardHTML(r){return`<div class="shardRes"><div class="srN">${ICON.star}<b>记忆碎片 +${r.n}</b><small>在主页「长老的小院」换成永久成长</small></div></div>`}
const ACH_P={kill100:()=>[M.kills,100],kill1000:()=>[M.kills,1000],pals:()=>[M.palN,20],stubborn:()=>[M.deaths,10],boiled:()=>[M.boiled,10],potions:()=>[M.pots,30],netfail3:()=>[M.netFail,3],tales:()=>[(M.seenT||[]).length,VILLAGE_TALES.length],trinity:()=>[["naiwa","kungfu","knight"].filter(h=>(M.ach||{})["win_"+h]).length,3]};
function achProg(id){const f=ACH_P[id];if(!f)return null;try{const [a,b]=f();return[Math.min(a||0,b),b]}catch(e){return null}}
function ach(id){if(!M.ach)M.ach={};if(M.ach[id])return;const A=ACH.find(a=>a.id===id);if(!A)return;M.ach[id]=Date.now();saveMeta();sfx("relic");
 GSTAT.add(["tw_a_"+id]).then(()=>showAch(A));}
const ACHQ=[];function showAch(A){ACHQ.push(A);if(ACHQ.length===1)showAch0(A)}
function showAch0(A){setTimeout(()=>{ACHQ.shift();if(ACHQ.length)showAch0(ACHQ[0])},1900);const p=GSTAT.pct(A.id);const d=document.createElement("div");d.className="achPop";d.innerHTML=`<i>${ICON[A.ic]||WXICON[A.ic]||ICON.star}</i><div><small>成就解锁</small><b>${A.n}</b><span>${A.d}${p!=null?`　·　${GSTAT.txt(A.id)}`:""}</span></div>`;$("#stage").appendChild(d);setTimeout(()=>d.classList.add("out"),1500);setTimeout(()=>d.remove(),2000)}
async function achScreen(){const got=ACH.filter(a=>(M.ach||{})[a.id]).length;
 ov(`<div class="bcx"><div class="mgHead"><span class="ribbon b">成就</span><small>已解锁 ${got} / ${ACH.length}　</small></div><div class="achGrid" id="achGrid"></div><div class="ovFoot"><button class="btn" id="achX">关闭</button></div></div>`);
 const paint=()=>{const g=$("#achGrid");if(!g)return;g.innerHTML=ACH.map(a=>{const t=(M.ach||{})[a.id],p=GSTAT.pct(a.id);const hide=a.hid&&!t;return`<div class="achC ${t?"":"lock"}"><i>${hide?ICON.q:(ICON[a.ic]||WXICON[a.ic]||ICON.star)}</i><div><b>${hide?"？？？":a.n}</b><span>${hide?"隐藏成就":a.d}</span>${!t&&!hide&&achProg(a.id)?(([x,y])=>`<em class="achP"><i style="width:${Math.round(x/y*100)}%"></i><span>${x} / ${y}</span></em>`)(achProg(a.id)):""}${p!=null?`<em>${GSTAT.txt(a.id)}</em>`:""}</div></div>`}).join("")};
 paint();$("#achX").onclick=closeOv;if(GSTAT.detect()){await GSTAT.load(true);paint();const s=$("#achSt");if(s)s.textContent=GSTAT.data?`全服 ${GSTAT.data.tw_players||0} 位玩家`:"全服数据暂时读不到"}}
/* 4.4 长老的小院：三条分支的成长树，前一格点亮了才能点下一格 */
const YTREE=[{n:"生存",c:"#e5191c",ids:["hp","rest","pot","ascHp","ascRest"]},{n:"财富",c:"#f2b21e",ids:["gold","shop","bless","relic","ascPot"]},{n:"修行",c:"#7a5cff",ids:["sharp","lv","pal"]},{n:"武艺",c:"#ff6a2b",ids:["atkUp","atkFirst","atkVuln","atkStr"]}];
function yParent(id){for(const b of YTREE){const i=b.ids.indexOf(id);if(i>0)return b.ids[i-1]}return null}
function yardScreen(){
 ov(`<div class="bcx yard"><div class="mgHead"><span class="ribbon b">长老的小院</span><small>记忆碎片 <b id="ydS">${M.shards||0}</b>　前一格点亮了，才能点下一格</small></div><div class="ydBody ytree" id="ydB"></div><div class="ovFoot"><button class="btn" id="ydX">关闭</button></div></div>`);
 $("#ydX").onclick=()=>{closeOv();titleScreen()};
 const node=id=>{const u=META.find(x=>x.id===id);if(!u)return"";const l=mlvRaw(id),mx=l>=u.max,c=mx?0:u.cost(l),off=l&&(M.upOff||{})[id];const par=yParent(id),lock=!l&&par&&!mlvRaw(par);const pn=par?(META.find(x=>x.id===par)||{}).n:"";
  return`<div class="upItem yNode ${mx?"max":""} ${off?"off":""} ${lock?"lock":""} ${l?"lit":""}"><div class="uiH"><b>${u.n}</b><span>${"●".repeat(l)}${"○".repeat(u.max-l)}</span></div><p>${u.d(Math.max(1,l))}</p><div class="uiBtns">${lock?`<em class="yLock">先点亮「${pn}」</em>`:`${l?`<button class="uiTog ${off?"":"on"}" data-id="${id}">${off?"已关闭":"已启用"}</button>`:""}<button class="uiBuy" data-id="${id}" ${mx||(M.shards||0)<c?"disabled":""}>${mx?"已满":`${ICON.star}${c}`}</button>`}</div></div>`};
 $("#ydB").innerHTML=YTREE.map(b=>`<div class="yRow"><div class="yHead" style="--yc:${b.c}">${b.n}</div>${b.ids.map((id,i)=>(i?`<i class="yLink ${mlvRaw(b.ids[i-1])?"on":""}" style="--yc:${b.c}"></i>`:"")+node(id)).join("")}</div>`).join("");
 $$(".uiTog").forEach(b=>b.onclick=()=>{const id=b.dataset.id;M.upOff=M.upOff||{};if(M.upOff[id])delete M.upOff[id];else M.upOff[id]=1;saveMeta();sfx("click");yardScreen()});
 $$(".uiBuy").forEach(b=>b.onclick=()=>{const u=META.find(x=>x.id===b.dataset.id),l=mlvRaw(u.id),c=u.cost(l);const par=yParent(u.id);if(!l&&par&&!mlvRaw(par))return;if(l>=u.max||(M.shards||0)<c)return;M.shards-=c;M.up=M.up||{};M.up[u.id]=l+1;saveMeta();sfx("relic");yardScreen()})}
/* ===================== 信箱：作者写给玩家的信 ===================== */
const MAIL_SVG=`<svg viewBox="0 0 40 32" class="mailIco"><rect x="2" y="4" width="36" height="25" rx="2" fill="#fff" stroke="#0d0d0d" stroke-width="3"/><path d="M3 6 L20 19 L37 6" fill="none" stroke="#0d0d0d" stroke-width="3" stroke-linejoin="round"/><path d="M28 2 h9 v8" fill="none" stroke="#e5191c" stroke-width="3"/></svg>`;
const TMAILS=[
 {id:"m411",t:"4.11 版本更新",date:"11月12日",body:[
  "· 手机上自动开启流畅模式：去掉了大片的投影和一直在闪的特效，战斗和拆卡包都顺多了",
  "· 主页的「抽卡包」「木桩练习」挪进了按钮区，不会再被挤到屏幕外面",
  "· 手机横屏、切换全屏后会自动重新对齐画面；两侧留边改成深蓝夜空色",
  "· 新牌「自强不息」（来自粉丝的建议）：每打出一次，这场战斗里它就更疼一点；血量低于一半时还会给你力气",
  "· 骑士「盾击」：伤害不变，但打完会失去 30% 护盾，连打会越打越弱",
  "· 首领大招更难打断：要在它蓄力时打掉 15% 血（原来 12%）",
  "· 第二周目起，每多一周目首领伤害 +5%"]},
 {id:"m410",t:"4.10 版本更新",date:"11月12日",body:[
  "· 主页新增「抽卡包」：像拆真卡包一样，手指沿着封口从左划到右把它撕开，5 张牌一张张翻开。抽到的牌会解锁图鉴",
  "· 每天可以撕 2 包；每打通一次大魔王，多得 1 次撕包机会（不会过期）",
  "· 每包 5 张：前三张普通牌，第四张有机会是稀有，第五张至少稀有，有机会出史诗、传说，甚至专属奇招；每张牌还有小概率是闪卡。没收集过的牌更容易出",
  "· 抽到重复的牌会化成星尘，攒满 10 点自动换 1 个记忆碎片",
  "· 修复：4.6 以后新加的牌（功夫和骑士的 12 张新牌、6 张奶蛋牌、放血）之前没进奖励池和图鉴，打完怪选牌时选不到。现在都补进去了，奇招也能在图鉴里看到"]},
 {id:"m49",t:"4.9 版本更新",date:"11月12日",body:[
  "· 第二层以上的首领都有了自己的机制，第一次见面会告诉你怎么破：骸骨主教往你手里塞烫手的祷文；月夜伯爵把你打它的伤害吸走两成；古堡女巫把你的牌变成青蛙；金身奶蛙一下挨 15 点以上就裂开晕一回合；礼帽先生偷你最贵的牌，一回合打它 20 点才能抢回来",
  "· 第三层：雷霆奶蛙王蓄雷，满 4 层劈 25 点，一回合打 3 张技能牌能让它放电失败；冰封奶蛙王每回合冻住你最左边的手牌；冰原血兽你血越少它越凶；雪球大王每回合滚大一圈，打中一下缩一圈",
  "· 第四层：熔岩巨无霸把池里的奶蛙变成岩浆，每块每回合烫你 2 点；紫砂奶茶壶有奶茶杯护着时打不动；第五层：赤纹将军举盾的回合你打它会被反击；影子刺客学你上回合的第一张牌；堕天奶蛙的审判之秤，谁打得多谁加力气；宇宙巨蛋孵化前受到的伤害翻倍；大魔王会学你打得最多的那张攻击牌；深渊龙蛙每 3 回合涨潮卷走你的池子",
  "· 敌人头上会显示机制的进度（比如「蓄雷 2/4」「帽子里：火球」）",
  "· 每层多了一步：地图倒数第三排是「路遇」，会遇到同行的奶蛙或者支线角色",
  "· 新增 4 条长线剧情，每局随机遇到一位同行者，每层见一次，你的选择决定它的结局：找哥哥的小火、躲债的阿蓝、想再爬一次塔的老铁，还有七年前上塔没回来的小七留下的足迹。走到最后会留给你一件专属遗物",
  "· 新增 6 张奶蛋牌：双黄蛋、金蛋存钱罐、惊喜蛋、孵蛋灯、蛋壳盾、摔蛋",
  "· 困难难度首领的伤害加成从 +20% 改成 +10%",
  "· 主页换成淡蓝色的星夜，木桩练习旁边加了靶子图标"]},
 {id:"m48",t:"4.8 版本更新",date:"11月12日",body:[
  "· 主页新增「木桩练习」：选主角、随便搭牌组（专属牌、通用牌、奇招都能挑），打一个血无限的木桩，实时显示这回合伤害、平均每回合伤害和最高伤害；木桩可以设成不还手或每回合打你 8/15/25。练习不影响存档",
  "· 专属奇招：每个主角 2 张奇招牌 + 2 件奇招遗物，打精英、首领、开宝箱时约 8% 出现。奶蛙「泉水之心」「蛙鸣」「肚皮弹」「泉涌」；功夫「醉拳葫芦」「太极图」「一指禅」「千手」；骑士「不落城旗」「反击之盾」「以盾为剑」「坚不可摧」；法师「星辰回响」「魔力泉眼」「时间停止」「元素风暴」；吸血鬼「血之契约」「蝙蝠群」「血祭」「鲜血盛宴」",
  "· 首领放大招前会露出破绽：大招亮出来时，敌人头上会显示「打断 0/N」，在它出手前打出 N 点伤害（约它最大生命的 12%），大招就被打断：它晕一回合，还易伤 2 回合",
  "· 困难难度的首领不再加血，改成伤害 +10%：战斗回合数和普通差不多，但更紧张",
  "· 魔法师保命：回合结束没用完的奶力，一半变魔力，一半变护盾（每点 4 护盾）"]},
 {id:"m47",t:"4.7 版本更新",date:"11月12日",body:[
  "· 出手动作重做：五个主角各有一套身体动作——奶蛙挺肚子撞、功夫奶蛙贴地冲拳、骑士先收后劈、魔法师浮起来施法、吸血鬼从上往下扑；2 费以上的重牌冲得更远，还会震屏",
  "· 打技能牌和能力牌也有动作了：技能牌会蹲一下再弹起，能力牌会鼓一下劲",
  "· 打击感加强：轻击的声音更实，30 点以上的重击带低音；奶蛙的肚皮、骑士的铁器、吸血鬼的爪子各多一层自己的声音；10 点以上的攻击都有一瞬间的顿帧",
  "· 更流畅：挨打闪白的画法改了，连打时不再每一帧重画，手机上掉帧更少",
  "· 所有首领都有第二形态过场了：新增沼泽圣者「泥潮」、冰封奶蛙王「永冻」、四头奶蛙「半梦半醒」，以及守关首领们的浓雾、蛇巢、黑翼、魔药沸腾、开光、狂暴、雪崩、熔流、满壶、涨潮、摘帽，每个都会告诉你它接下来怎么打",
  "· 四头奶蛙：血掉到一半，两个头睡着，剩下的头力气 +2",
  "· 第五层敌人的力气少 1 点",
  "· 骑士奶蛙：每回合第一张攻击牌的护盾加成上限 15 → 20；骑士爆发用护盾的 45% 砸人（原来三成）",
  "· 主角奶蛙：每次消除再加 3 点护盾"]},
 {id:"m46",t:"4.6 版本更新",date:"11月12日",body:[
  "· 奶蛙池不再乱放：新奶蛙会挨着池里的同家族站；池里没有同家族，就排到最右边。消掉以后两边靠拢，不再自动重新排队，所以被泥巴、冰隔开的同家族，清掉后一靠拢就能连锁。点「奶蛙池」三个字能看规则",
  "· 奶力不再有上限",
  "· 顿悟（通透世界、星之力）不再一局只能用一次：攒满就能用，用完从零重新攒",
  "· 敌人的「破防」改了：打在护盾上算双倍，打穿了剩下的才扣血，不再一下清空护盾；骑士护盾被打穿也不再额外受伤",
  "· 主角奶蛙：每次消除力气 +1，不再封顶；清掉泥巴也算消除，还给 5 护盾；所有家族的爆发效果 ×1.3",
  "· 新家族「骑士」：骑士的专属牌都归进骑士家族，凑齐 3 只触发骑士爆发（护盾 +7，再用护盾的三成砸一个敌人）；骑士开局一张护盾换成「举盾」",
  "· 暗器不再占手牌：放进主角旁边的暗器袋，最多 3 个，点一下扔出去，不花奶力；袋里凑齐 3 个一样的自动引爆",
  "· 普通和简单难度的首领血量下调，越往上砍得越多：第二层 -4%、第三层 -8%、第四层 -12%、第五层 -15%（普通难度最终首领约 1000 血）；困难难度不变",
  "· 主角挨打时，「格挡」数字显示在主角身体中间，字更大，扣血数字在右上，不会再叠在一起",
  "· 炸弹药水、泥巴药水不再出现（攻击类的活交给暗器）",
  "· 吸血鬼小削：吸血比例 50% → 42%，血月形态 100% → 90%",
  "· 「放血」现在也会出现在吸血鬼的选牌奖励里",
  "· 奶蛙池规则弹窗里加了一段循环小动画：放进去 → 凑齐消掉 → 两边靠拢 → 又凑齐，连锁消掉",
  "· 战斗里的奶蛙池也有动画了：消掉的奶蛙会炸开，剩下的滑过去靠拢，不再一下跳过去",
  "· 休息点新增「磨练筋骨」：最大生命 +3~5（当前生命也一起加）",
  "· 休息点的长老改成和酒馆老板一样：直接点长老就能聊天，一句一句讲往事，不占休息的机会",
  "· 主线也有支线了：一路上可能遇到怕黑的小奶鼠、奶猫铁匠、村里来的信使、迷路的小奶马，接下它们的委托，完成后给报酬，地图左上角会显示进度",
  "· 岔路新增 3 个给支线的角色：赏金猎人奶猫、着急的奶鸡妈妈、练武的奶马",
  "· 休息点的长老多了 6 段新聊天",
  "· 遗物最多带 5 件：拿到第 6 件时，可以换掉一件旧的，或者不要新的换 40 金币",
  "· 战斗金币少了约两成，金币不再那么好攒",
  "· 多段攻击的出手节奏加快，连击和连锁时更流畅、不卡顿",
  "· 信箱信多了也能上下滑动",
  "· 修复：暖心冰奶蛙、冰火奶蛙抠图边缘的残影；赤鳞大蛇放大；堕天奶蛙改成面朝主角",
  "· 功夫奶蛙新增 6 张专属牌：点穴、连环腿、借力打力、气贯全身、无影手、内功心法",
  "· 骑士奶蛙新增 6 张专属牌：盾墙、冲撞、坚守阵地、盾牌猛击、铁壁、圣骑士之誓",
  "· 魔法师换上新立绘"]},
 {id:"m45",t:"4.5 版本更新",date:"11月11日",body:[
  "· 长老的小院新增「武艺」一条路：练拳（开局随机升级 1~2 张攻击牌）→ 先下手（每场战斗第一张攻击牌伤害 +3/+6/+9）→ 看穿破绽（精英和首领战开始时敌人带 1~2 层易伤）→ 铁拳（每场战斗开始力气 +1）",
  "· 小怪更难：第二层起生命多 4%，之后每往上一层再多 10%；第二层起力气 +1，第三层、第四层各再 +1",
  "· 首领更难：生命再多约 6%~10%，第三层起首领力气再 +1",
  "· .5 层岔路：每次都有两处分岔，分岔上都是事件；整条岔路只有两场战斗：中间一只小怪、尽头一只精英",
  "· 岔路支线：岔路里的角色会托你办事（追犯人的看守、跑不动的信使、不服输的冒险者、缺香草的奶油摊），在这条岔路里办完就给报酬，地图左上角会显示当前支线",
  "· 岔路新增 10 个随机事件：卖地图的奶鼠、路边奶油摊、打瞌睡的看门狗、蜕皮的奶蛇、会说话的路牌、迷路的小奶蛙，以及上面 4 个给支线的角色",
  "· 新小怪：青苔奶蛙（第一层）、冰堡奶蛙和暖心冰奶蛙（第三层）、冰火小奶蛙（第四层）；岔路中间的小怪也会按两层之间的元素换成它们",
  "· 修复：地图上显示金宝箱，走到了却是普通宝箱",
  "· 修复：主角奶蛙的「嘎嘎滴辣虾」语音没念完就停了（两段语音都重新剪过，保留完整尾音）",
  "· 修复：骨主教复活时还趴在画面下方，现在复活一开始就站起来",
  "· 修复：升级天赋页背景的红黑条纹转动时看起来一闪一闪，现在背景不再转",
  "· 修复：地图图标太大盖住路线，图标缩小了一圈，路线加粗",
  "· 修复：金卡的「效果×2」标签挡住卡牌说明，挪到了卡牌右下角外沿"]},
 {id:"m44",t:"4.4 版本更新",date:"11月11日",body:[
  "· 周目：从第 2 周目起，每升一周目除了数值，还会多一条特殊规则（宝箱怪更多、商店少一张牌、首领更早变身、药水栏少一格、精英自带护盾、奖励卡只剩 2 选 1、打完首领不回血、首领越打越有力气），选周目时能看到",
  "· 长老的小院新增 3 个给多周目玩家的加成：老骨头（第 2 周目起开局生命 +5/+10/+15）、备用药囊（第 5 周目起药水栏不再少一格）、老地方（第 8 周目起打完首领仍回复三成已损失的生命）",
  "· 主角熟练度：第 2 周目起，熟练度每一级让开局生命 +2；周目越高，熟练度涨得越快（每周目 +15%）",
  "· 成就：还没完成的累计类成就会显示进度，比如「打倒 512 / 1000 个敌人」",
  "· 长老的小院改成成长树：分「生存」「财富」「修行」三条路，前一格点亮了才能点下一格（以前已经买过的不受影响）",
  "· 小怪在高层也会变强：第三层起每往上一层生命再多 8%，第三层起力气 +1、第四层起再 +1",
  "· 一局结束（登顶、倒下、下山）可以生成一张竖版分享图：主角、打到哪层、难度和周目、用时、主要数据和最得意的 8 张牌，手机长按就能保存"]},
 {id:"m43",t:"4.3 版本更新",date:"11月11日",body:[
  "· 新增隐藏的 .5 层岔路（比如「1.5层 · 通往古堡的交叉路口」「2.5层 · 通往冰原的小径」）：打完每层首领后有时会出现，可以走进去，也可以直接上楼；岔路很短，天气不变，共 5 步，最后一步是精英，打完可以三选一拿一张稀有牌，还有金币和记忆碎片，然后直接上楼",
  "· 岔路里有专属的小怪、7 只专属精英（紫晶奶蛇、冰火奶蛙、苔藓奶蛙、霜晶奶蛙、焰心奶蛙、暗焰奶蛙、幽霜奶蛙）和 7 个专属角色",
  "· 酒馆新增 4 个岔路任务（标着「岔路」），只能在 .5 层完成；接了岔路任务，打完首领一定会出现岔路",
  "· 岔路改成一条路走到底，偶尔分叉；岔路精英按两层之间的元素出现（比如 3.5 层冰原到奶茶厂之间是冰火奶蛙）",
  "· 岔路新增 5 个随机事件：岔路检查站（会被抓进牢房）、收过路费的桥、迷路的邮差、走错路的冒险者、许愿井",
  "· 魔法师新增 3 张回血牌：治愈术、生命汲取、回春法阵",
  "· 主角奶蛙：池子每消除一次，这场战斗力气 +1（最多 +3）",
  "· 骑士奶蛙：每回合第一张攻击牌加的伤害从护盾的 1/4（最多 +10）改成 1/3（最多 +15）；初始牌组多 1 张「打一下」",
  "· 首领战更流畅：发光特效改了画法，影子刺客分身时也不再卡",
  "· 事件图片上的小黑点去掉了"]},
 {id:"m42",t:"4.2 版本更新",date:"11月11日",body:[
  "· 语音彩蛋（只有主角奶蛙会喊）：一回合连击到第 4 下，会喊一声「安迪」或「嘎嘎滴辣虾」（每回合最多一次）；奶蛋孵化时会喊「安迪」",
  "· 功夫奶蛙变强：生命 74 → 76；新被动「拳意」：每回合从第 3 张攻击牌起，每一下伤害 +2",
  "· 功夫奶蛙初始牌组：护盾牌只留 1 张，换成 2 张「轻身」（0 费，敏捷 +1、闪避 1 层）；攻击牌有 2 张快拳、2 张奶蛙拳、1 张推掌",
  "· 功夫奶蛙拿到纯护盾牌的机会变少了",
  "· 每个主角更容易拿到自己流派的牌：专属牌（魔法师还包括法术牌）出现的比例从约一成提高到约四成",
  "· 新增隐藏的 .5 层「交界处」：打完每层首领后有时会出现，可以进去探索也可以直接上楼",
  "· 难度：从第二层开始，每往上一层，敌人生命再多 6%",
  "· 雷霆奶蛙王、雾里的白奶蛙、熔岩巨无霸、熔岩斗士改成面朝主角",
  "· 修复：骸骨主教变成骨堆时会跑到别的位置",
  "· 新增 8 张奶蛋牌：火焰蛋、冰蛋、暖蛋、蛋壳盾、彩虹蛋、破壳、抱窝、巨蛋；金蛋和一窝蛋换了卡面",
  "· 地图路线更分散：5 条路从不同的格子出发，尽量不挤在一起",
  "· 卡面更清晰：偏糊的卡面（比如奶猫）重新处理过",
  "· 信箱打开看过以后，主页上的红点就会消失",
  "· 设置里去掉了「卡牌图鉴」，图鉴从主页进",
  "· 修复：手机切到后台再回来，声音没了"]},
 {id:"m41",t:"4.1 版本更新",date:"11月10日",body:[
  "· 音效全部重做，换成真实录音素材；拳、刀、法术、水、土、冰的打击声各不相同；暴击、击杀有专门音效",
  "· 打击时音乐自动压低一点；各首曲子音量重新平衡，切换场景时淡入淡出",
  "· 首页显示游戏时长",
  "· 新增金宝箱：地图上能直接看到，奖励更多；宝箱图标重画；宝箱可以一键全部收下",
  "· 首领生命和力气略微提高",
  "· 连锁：消除后池子里的同家族会合拢；新家族的奶蛙落在池子中间；泥巴更容易把一组奶蛙隔开",
  "· 战斗奖励和宝箱可以选择不拿，直接走前会确认",
  "· 「差一点」成就按打倒最终首领那一刻的生命判定",
  "· 休息处和长老聊天，也会讲村子里的旧事",
  "· 没遇到过的事件更容易出现",
  "· 长老的小院：已买的加成可以关闭或重新开启",
  "· 升级后不会有变化的牌，不能再升级",
  "· 重名或效果重复的牌：改名 20 张，改效果 8 张（连啄、轻挠、晒太阳、猫爪挠、月光猫、快拳、甩鬃、巨无霸奶蛙）",
  "· 图鉴：奖励和商店里出现过的牌直接算收集，并标「图鉴 NEW」；可以按家族、类型、收集状态筛选",
  "· 战斗：需要选目标的牌再点一次，直接打首领或最前面的敌人；敌人太多时自动缩小，不会跑出屏幕",
  "· 战斗：点主角可以看全部状态和能力；打出的能力牌会显示在状态栏；首领的状态不会再超出屏幕",
  "· 排行榜：新增「真结局」榜；走到真结局的爬塔积分 +500；打破自己的纪录会有提示",
  "· 点开卡牌换成全图展示卡：可以拖动倾斜，稀有度越高镭射越亮；第一次拿到的新牌会自动展示",
  "· 存档：修复回到标题后云端存档会丢掉当前这一局的问题；设置里新增「立即存档」",
  "· 图鉴打开更快，卡牌边滑边加载",
  "· 功夫奶蛙出拳声音更重；连击到第 3 下才出现残影",
  "· 新成就「金光闪闪」",
  "· 优化天气和发光特效，减少卡顿",
  "· 修复：湿漉漉的奶蛙缺腿、骸骨主教缺一只脚、沼泽圣者对话时没有人物"]},
 {id:"m40",t:"4.0 版本更新",date:"11月10日",body:[
  "· 新主线：一周目是假结局，之后可以走真结局",
  "· 隐藏路线：酒馆的 SS 讨伐任务、残破的初号奶蛙、塔顶的击败或宽恕、魔椅的意志、梦境层、最终之地、片尾字幕、真结局名人堂",
  "· 新怪物和新图：沼泽圣者、骸骨主教、残破的初号奶蛙、赤纹将军、熔岩斗士、城主奶蛙、蘑菇奶蛙、湿漉漉的奶蛙、冰莲花、新娘、泥沼蛇王、魔椅的意志",
  "· 新精英：赤鳞大蛇、冰鳞大蛇",
  "· 首领台词和人设重写；新增首领图鉴",
  "· 首领有第二形态",
  "· 每层地图 13 步，上半层和下半层用不同背景",
  "· 卡牌可以升星，最多升 3 次",
  "· 新增暴击、粉色伤害、真实伤害",
  "· 新状态：受伤、破甲、冰冻、麻痹、潮湿、中毒、夜幕、闪避、诅咒、易碎等，以及元素反应",
  "· 状态第一次出现时有简单介绍；设置里可以查状态百科",
  "· 所有主角都能靠敏捷闪避：每层 3%，最多 30%",
  "· 新增顿悟（怒气槽），每局可以发动一次",
  "· 暗器改成奶蛇牌，手里凑齐 3 张一样的会自动引爆",
  "· 各主角新增流派卡；新增下蛋、奶狗相关的牌",
  "· 新药水：解毒剂、定心药水",
  "· 酒馆：19 个任务每次给 6 个，还有石头剪刀布和挑遗物",
  "· 商店买东西前会确认",
  "· 新增回忆战：每个主角的回忆",
  "· 奶力上限 10，手牌上限 10；新月夜每消除 3 次 +1 奶力，「小池子」每消除 2 次 +1 奶力",
  "· 地图上休息处、商店、酒馆显示头像；影子刺客只显示剪影",
  "· 出手动画：拳脚残影、骑士刀光、法阵、吸血鬼瞬移；敌人受击会闪白后退",
  "· 大连锁、多次三连会出现高光剪影",
  "· 选主角页去掉茶杯和金币；首页按钮改成 2×2，标题和开始按钮变大；图鉴合并；新增闪卡收藏册",
  "· 新音乐：梦境、最终之地、魔椅、回忆、初号机、片尾",
  "· 新增多个成就"]},
 {id:"m37",t:"3.7 版本更新",date:"11月9日",body:[
  "· 修复存档丢失：云存档正常上传，新设备上的空进度不会再覆盖云端；本机多存一份备份",
  "· 抓伙伴：敌人血量要打低才能抓，抓不了的不显示网；越强的越容易挣脱，难度越高越难抓；抓失败有提示",
  "· 升级天赋页：卡片对齐，按流派重做卡面",
  "· 小怪显示变大",
  "· 宝箱怪、深渊龙蛙、雪球大王换了新图",
  "· 首页：月亮和小按钮重做；赞赏弹窗加了作者的话；新增信箱",
  "· 修复：奶茶杯被打以后从后面飞到前面"]},
 {id:"hello",t:"欢迎来到奶蛙之塔",date:"",body:[
  "你好，我们是做这个游戏的人。",
  "《奶蛙之塔》是《抓奶蛙》的第二部。这次，奶蛙们要去爬一座会结冰、会下雨、会让人想家的塔。",
  "以后有新版本、新角色，或者想对你说的话，我们都会写信放在这里。",
  "祝你爬得顺利。"]}];
function mailBox(){M.mailRead=M.mailRead||{};M.mailSeen=M.mailSeen||{};TMAILS.forEach(m=>M.mailSeen[m.id]=1);saveMeta();const draw=()=>{ov(`<div class="mailBox"><div class="mgHead"><span class="ribbon b">信箱</span><small>制作组写给你的信</small></div><div class="mlList">${TMAILS.map(m=>`<button class="mlItem ${M.mailRead[m.id]?"":"new"}" data-id="${m.id}">${MAIL_SVG}<b>${m.t}</b><small>${m.date||""}</small>${M.mailRead[m.id]?"":`<i class="dot"></i>`}</button>`).join("")}</div><div class="ovFoot"><button class="btn" id="mlX">关闭</button></div></div>`);
  $$(".mlItem").forEach(b=>b.onclick=()=>{const m=TMAILS.find(x=>x.id===b.dataset.id);M.mailRead[m.id]=1;ach("mail");saveMeta();sfx("click");
   ov(`<div class="letter"><div class="ltHead"><span class="ribbon b">${m.t}</span>${m.date?`<small>${m.date}</small>`:""}</div><div class="ltBody">${m.body.map(p=>`<p class="${p.startsWith("·")?"li":""}">${p}</p>`).join("")}<p class="ltSig">—— 奶蛙之塔 制作组</p></div><div class="ovFoot"><button class="btn ghost" id="ltB">返回信箱</button><button class="btn" id="ltX">好的</button></div></div>`);
   $("#ltB").onclick=draw;$("#ltX").onclick=()=>{closeOv();titleScreen()}});
  $("#mlX").onclick=()=>{closeOv();titleScreen()}};draw()}
function titleScreen(){B=null;S=null;show("title");setBg("title");playMusic("title");const sv=loadRun();
 $("#title").innerHTML=`<div class="logo"><h1>${"奶蛙之塔".split("").map((c,i)=>`<span class="rn rn${i}" data-c="${c}">${c}</span>`).join("")}</h1><div class="tsub"><span class="ver">${VER}</span></div></div>
 <div class="tmenu">${sv?(()=>{const H=HEROES.find(h=>h.id===sv.hero)||HEROES[0],a=sv.act||0,stp=sv.atBoss?"首领":(sv.row>=0?`第 ${sv.row+1}/${ROWS} 步`:"入口");return`<div class="saveWrap"><button class="saveCard" id="tCont"><div class="svPic"><img src="${IMG(H.img)}" alt=""></div><div class="svInfo"><div class="svT"><b>回到塔里</b><span>${H.n}</span></div><div class="svL">第${"一二三四五"[a]||a+1}层 · ${ACTS[a]?ACTS[a].n:""}　${stp}</div><div class="svS"><span>${ICON.heart}${sv.hp}/${sv.max}</span><span>${ICON.deck}${(sv.deck||[]).length} 张</span><span>${ICON.coin}${sv.gold||0}</span><span>第 ${(sv.asc||0)+1} 周目</span></div></div><i class="svGo">▶</i></button><button class="newLink" id="tNew">重新开始</button></div>`})():`<button class="gbtn" id="tNew"><i class="pl"></i><b>开始冒险</b></button>`}<div class="sub"><button class="gbtn sm" id="tCodex"><b>图鉴</b></button><button class="gbtn sm" id="tAch"><b>成就</b></button><button class="gbtn sm packGb" id="tPack"><svg class="tgt" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" fill="#5aa8ff" stroke="#0d0d0d" stroke-width="1.5"/><path d="M5 6h14" stroke="#0d0d0d" stroke-width="1.5" stroke-dasharray="2 1.5"/><circle cx="12" cy="14" r="3.6" fill="#fff"/><circle cx="13.6" cy="13" r="3" fill="#5aa8ff"/></svg><b>抽卡包</b>${packLeft()>0?`<i class="dot"></i>`:""}</button><button class="gbtn sm ${A.music?"":"off"}" id="tSet"><b>${A.music?"♪ 音乐开":"♪ 音乐关"}</b></button><button class="gbtn sm" id="tRank"><b>排行榜</b></button><button class="gbtn sm dummyGb" id="tDummy"><svg class="tgt" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff" stroke="#0d0d0d" stroke-width="1.5"/><circle cx="12" cy="12" r="7.5" fill="#e5191c"/><circle cx="12" cy="12" r="4" fill="#fff"/><circle cx="12" cy="12" r="1.8" fill="#e5191c"/></svg><b>木桩练习</b></button></div></div>
 <i class="tfloor"></i><div class="tkungfu"><img src="${IMG("n1")}"></div><div class="tknight"><img src="${IMG("kn")}"></div><div class="tmage"><img src="${IMG("mg")}"></div><img class="tWaFrog" src="${IMG("nw")}" alt=""><div class="thero tvampHero"><img src="${IMG("v_vamps")}"><i class="plat"></i></div>
 <button class="zsBtn" id="zsBtn"><img src="zanshang.jpg" alt=""><span>赞赏作者</span></button>${(M.trueEnds||[]).length?`<button class="hofBtn" id="tHof">真结局名人堂 · ${M.trueEnds.length}</button>`:""}<button class="yardBtn" id="tYard"><i class="ybPic"><img src="${IMG("m6")}" alt=""></i><span>长老的小院${(()=>{const n=META.filter(u=>mlvRaw(u.id)<u.max&&(M.shards||0)>=u.cost(mlvRaw(u.id))&&!(!mlvRaw(u.id)&&yParent(u.id)&&!mlvRaw(yParent(u.id)))).length;return n?`<i class="dot"></i>`:""})()}</span><em>${ICON.star}${M.shards||0}</em></button>${M.isekaiMet?`<button class="isePeek" id="tIse"><img src="${IMG("yjx")}"></button>`:""}<div class="cloudSt" id="cloudSt">${CLOUD.txt()}</div><div class="tmeta"><button class="mailBtn" id="tMail" aria-label="信箱">${MAIL_SVG}${TMAILS.some(m=>!(M.mailRead||{})[m.id]&&!(M.mailSeen||{})[m.id])?`<i class="dot"></i>`:""}</button><span>通关 <b>${M.wins}</b> 次</span><span>成就 <b>${ACH.filter(a=>(M.ach||{})[a.id]).length}/${ACH.length}</b></span><span>时长 <b id="tPlay">${fmtPlay(M.playMs)}</b></span></div>`;
 const c=$("#tCont");if(c)c.onclick=()=>{S=sv;resume()};
 $("#tNew").onclick=()=>{if(sv)confirmBox("重新开始？","现在的存档会被覆盖。",()=>{closeOv();heroSelect()});else heroSelect()};
 $("#tCodex").onclick=codex;{const v=$("#tVamp");if(v)v.onclick=()=>{sfx("click");v.classList.remove("flip");void v.offsetWidth;v.classList.add("flip");toast(pick(["倒着看，世界好像没那么坏。","血都流到头上了……但是很爽。","别学我，我是专业的。","父亲说这样不体面。所以我天天这样。"]))}}$("#tAch").onclick=achScreen;$("#tRank").onclick=rankScreen;$("#tYard").onclick=()=>yardScreen();{const db=$("#tDummy");if(db)db.onclick=()=>dummyScreen();const pb=$("#tPack");if(pb)pb.onclick=()=>packScreen()}if($("#tHof"))$("#tHof").onclick=hallOfFame;if($("#tIse"))$("#tIse").onclick=()=>{sfx("click");toast(pick(["那边的人还在抓奶蛙。我在这边挺好的。","门偶尔还会开。你要是看到了，记得帮我关上。","这边的奶茶比那边甜。","你也是从别的地方来的吧？我看得出来。","别拿网对着我。"]))};{const z=$("#zsBtn");if(z)z.onclick=()=>{sfx("click");ach("thanks");ov(`<div class="zsBox"><div class="zsL"><img src="zanshang.jpg" alt="赞赏码"><p>微信扫一扫</p></div><div class="zsR"><span class="ribbon b">作者的话</span><p>为了做这个游戏，我们白天上班，晚上熬夜，爆肝了很多个夜晚。有时候光是做一个角色，就要花好几天。</p><p>如果你喜欢《奶蛙之塔》，可以扫左边的码<b>众筹支持</b>我们。也非常欢迎给我们<b>提建议</b>，你说的每一条我们都会认真看。</p><p>也可以在<b>抖音搜索【仰冬】</b>，继续关注我们。</p><p class="zsSig">谢谢你来爬塔。</p><button class="btn" id="zsX">关闭</button></div></div>`);$("#zsX").onclick=closeOv}}{const mb=$("#tMail");if(mb)mb.onclick=()=>{sfx("click");mailBox()}}$("#tSet").onclick=()=>{A.music=!A.music;if(!A.music)ach("quiet");audioSave();titleScreen()}}

const HEROES=[{id:"naiwa",n:"奶蛙",img:"nw",tag:"一号主角 · 厚肚皮",d:"奶茶泉边最普通的一只奶蛙。开局自带 8 点护盾；池子每消除一次（清掉泥巴也算），这场力气 +1（不封顶）、护盾 +3；所有爆发 ×1.3，清泥巴再给 5 护盾。",hp:84,on:1},{id:"kungfu",n:"功夫奶蛙",img:"n1",tag:"二号主角 · 快手连击",d:"在竹林里练了很多年拳。第一回合多抽 2 张；每回合从第 3 张攻击牌起，每下伤害 +2。",hp:76,on:1},{id:"knight",n:"骑士奶蛙",img:"kn",tag:"三号主角 · 铁甲",d:"开局 7 护盾，护盾每回合只掉一半。每回合第一张攻击牌，额外加上护盾 1/3 的伤害。",hp:72,on:1},{id:"mage",n:"奶蛙魔法师",img:"mg",tag:"四号主角 · 法术",d:"法术无视敌人护盾，伤害吃魔力不吃力气。开局 2 层魔力。回合结束时没用完的奶力，一半变成魔力，一半变成护盾（每点 4 护盾）。",hp:74,on:1},{id:"vamp",n:"吸血鬼奶蛙",img:"v_vamp",tag:"五号主角 · 血契",d:"月夜古堡伯爵的儿子。没有护盾，生命最低，但攻击会吸血、让敌人流血。血量低于 25% 进入血月形态。",hp:62,on:1}];
const ASC=[{n:"标准难度",d:"第一次爬塔"},{n:"敌人生命 +10%",r:"宝箱更容易是宝箱怪",d:""},{n:"首领和精英生命 +12%",r:"商店少一张牌",d:""},{n:"敌人开场就有 1 点力气",r:"首领剩 65% 血就进入第二形态",d:""},{n:"最大生命 -6",r:"药水栏少一格",d:""},{n:"商店涨价 15%",r:"精英开场自带 12 护盾",d:""},{n:"精英一定带词缀",r:"战斗奖励的卡牌只有 2 张可选",d:""},{n:"初始牌组多一张诅咒「沉重」",r:"打完一层首领不再回血",d:""},{n:"休息处回复减少三分之一",r:"首领每 3 回合力气 +1",d:""}];
const ascTxt=x=>x.n+(x.r?"，特殊规则："+x.r:"");
const asc=()=>(S&&S.asc)||0;
const HERO=()=>HEROES.find(h=>h.id===(S&&S.hero))||HEROES[0],HI=()=>HERO().img,HN=()=>HERO().n;
/* ===================== 角色熟练度 ===================== */
const MAST_LV=[0,60,180,400,800,1500];
const MAST_REW=["开局多 1 张随机专属牌","选角卡片换上星夜卡框","解锁角色小传","开局自带专属遗物","起始牌组随机 1 张升级，获得金色称号"];
const MAST_RELIC={naiwa:"mr_pillow",kungfu:"mr_glove",knight:"mr_mirror",mage:"mr_notes",vamp:"mr_watch"};
const BIO={vamp:"吸血鬼奶蛙在古堡里长大。他小时候以为父亲是全世界最温柔的人，会给他讲星星的故事。直到有一天，他看见父亲把一只迷路的小奶蛙领进地窖，然后锁上了门。那天晚上他没睡，第二天一早就离开了古堡。",naiwa:"奶蛙是在泉边被捡到的。那年冬天特别冷，长老抱它回家，它一整晚都在打嗝。它长大以后什么都不太会，就是特别能扛。村里谁家搬东西，都喊它。",kungfu:"功夫奶蛙七岁拜师，第一天就被长老罚站。长老说：拳要收得回来。它站了一下午，没想明白。后来有一次，它一拳打出去，看见对面是个小孩，硬生生收了回来，手腕扭了半个月。那天它想明白了。",knight:"骑士奶蛙的盔甲，原来属于一个叫阿青的人。阿青是铁匠的哥哥，三十年前穿着它进了塔。后来只有盔甲被冲下了山。铁匠把盔甲擦了三十年，直到有一天，一只小奶蛙说它想穿。",mage:"奶蛙魔法师是长老的第二个徒弟。长老送它去山那边学星星，是想让它离塔远一点。它学了十年，每天晚上都在看同一片星空。它在一本旧书里读到：塔顶的王座，是用魔法做的。"};
const mastLv=h=>{const x=((M.mast||{})[h]||0);let l=0;for(let i=1;i<MAST_LV.length;i++)if(x>=MAST_LV[i])l=i;return l};
function mastGain(win){if(!S)return 0;const fl=(S.act||0)*(ROWS+1)+Math.max(0,S.row)+1;const x=Math.round(Math.max(3,fl+5*(S.stats.endb||0)+(win?25:0)+3*asc())*(1+.15*asc()));M.mast=M.mast||{};const h=S.hero||"naiwa";const before=mastLv(h);M.mast[h]=(M.mast[h]||0)+x;const after=mastLv(h);saveMeta();if(after>before)setTimeout(()=>toast(`${HN()} 熟练度升到 <b>Lv.${after}</b>：${MAST_REW[after-1]}`),1200);return x}
const DIFF={easy:{n:"简单",d:"第一次玩推荐",hp:.75,dmg:.75,heal:1.4},normal:{n:"普通",d:"标准难度",hp:1,dmg:1,heal:1},hard:{n:"困难",d:"敌人更强，碎片更多",hp:1.2,dmg:1.15,heal:.8}};
const DF=()=>DIFF[(S&&S.diff)||"normal"]||DIFF.normal;
function heroSelect(){show("heroSel");setBg("title");let cur=0;
 $("#heroSel").innerHTML=`<div class="hsTitle"><span class="ribbon b">选择你的奶蛙</span></div><div class="hsRow">${HEROES.map((h,i)=>`<div class="hcard ${h.on?"":"lock"} ${i===0?"on":""} ${h.on&&mastLv(h.id)>=2?"mframe":""} ${h.on&&mastLv(h.id)>=5?"mframe5":""}"><div class="pic"><img src="${IMG(h.img)}">${h.on?(()=>{const l=mastLv(h.id),x=(M.mast||{})[h.id]||0,nx=MAST_LV[Math.min(l+1,MAST_LV.length-1)],pv=MAST_LV[l];return`<button class="mast lv${l}" data-h="${h.id}"><b>LV${l}</b><i><u style="width:${l>=5?100:Math.round((x-pv)/(nx-pv)*100)}%"></u></i></button>`})():""}</div>${h.on?"":`<span class="lk">敬请期待</span>`}<h3>${h.n}</h3><div class="tag">${h.tag}</div><p>${h.on?h.d:"之后的版本开放"}</p>${h.on?`<div class="hst"><span title="初始生命">${ICON.heart}生命 ${h.hp}</span></div>`:""}</div>`).join("")}</div><div class="hsGo"><div class="diffSel">${["easy","normal","hard"].map(k=>`<button class="dBtn ${k===(M.diff||"normal")?"on":""}" data-d="${k}"><b>${DIFF[k].n}</b><small>${DIFF[k].d}</small></button>`).join("")}</div>${(M.ascMax||0)>0?`<div class="ascSel"><button id="ascL">◀</button><div><b id="ascN"></b><small id="ascD"></small></div><button id="ascR">▶</button></div>`:""}<button class="btn ghost" id="hsB">返回</button><button class="btn" id="hsGo">出发！</button></div>`;
 $$(".mast").forEach(m=>m.onclick=ev=>{ev.stopPropagation();const h=m.dataset.h,l=mastLv(h);tipAt(m,`<b>${(HEROES.find(x=>x.id===h)||{}).n} · 熟练度 Lv.${l}</b><p>经验 ${(M.mast||{})[h]||0}。输了也会涨，爬得越高涨得越多。</p>${MAST_REW.map((r,i)=>`<p style="opacity:${l>i?1:.45}">Lv.${i+1}（${MAST_LV[i+1]}）${l>i?"✓":"🔒"} ${r}</p>`).join("")}${l>=3?`<p style="margin-top:8px;font-size:14px">${BIO[h]}</p>`:""}`);});
 $$(".hcard").forEach((e,i)=>e.onclick=()=>{if(!HEROES[i].on){toast(`${HEROES[i].n}还在路上，<b>之后的版本</b>开放`);return}cur=i;sfx("click");$$(".hcard").forEach((x,j)=>x.classList.toggle("on",j===i))});
 $("#hsB").onclick=titleScreen;$$(".dBtn").forEach(b=>b.onclick=()=>{M.diff=b.dataset.d;saveMeta();sfx("click");$$(".dBtn").forEach(x=>x.classList.toggle("on",x===b))});let ac=Math.min(M.ascSel||0,M.ascMax||0);const ascUI=()=>{const n=$("#ascN");if(!n)return;n.textContent=`第 ${ac+1} 周目`;$("#ascD").innerHTML=ac?ASC.slice(1,ac+1).map(x=>x.n).join("　·　")+(ASC.slice(1,ac+1).some(x=>x.r)?`<br><span class="ascR">特殊规则：${ASC.slice(1,ac+1).filter(x=>x.r).map(x=>x.r).join("　·　")}</span>`:""):"标准难度";$("#ascL").disabled=ac<=0;$("#ascR").disabled=ac>=(M.ascMax||0)};
 if($("#ascL")){$("#ascL").onclick=()=>{if(ac>0){ac--;sfx("click");ascUI()}};$("#ascR").onclick=()=>{if(ac<(M.ascMax||0)){ac++;sfx("click");ascUI()}};ascUI()}
 $("#hsGo").onclick=async()=>{sfx("click");M.ascSel=ac;saveMeta();const hid=HEROES[cur].id;M.train=M.train||{};if(!M.train[hid]){M.train[hid]=1;M.tut=1;saveMeta()}newRun(hid,ac)}}

/* ===================== 新冒险 ===================== */
async function newRun(hero,ascLv){const seed=(Math.random()*2**31)|0;
 S={v:2,seed,rs:seed,uid:0,hp:72,max:72,gold:99,deck:[],relics:["cup"],pots:[],potSlots:2,row:-1,col:-1,path:[],combats:0,elites:0,removeCost:75,stats:{kills:0,played:0,dmg:0,tri:0,gold:0},flags:{},evSeen:[],atBoss:false,cur:null};
 S.hero=["kungfu","knight","mage","vamp"].includes(hero)?hero:"naiwa";S.diff=M.diff||"normal";{const H=HEROES.find(h=>h.id===S.hero);S.hp=S.max=H.hp}
 S.asc=Math.max(0,Math.min(ASC.length-1,ascLv||0));if(S.asc>=4)S.potSlots=1;S.mod=pick(Object.keys(MODS).filter(k=>k!==M.lastMod&&k!=="memo"));M.lastMod=S.mod;if(S.mod==="xp"){S.max-=10;S.hp-=10}
 ach("first");S.act=0;S.actCombats=0;S.lv=1;S.xp=0;S.perks={};S.deck=(S.hero==="kungfu"?["strike","strike","strike","strike","guard","k_lightfoot","k_lightfoot","fist","fist","k_jab","k_jab","k_palm"]:S.hero==="knight"?[...STARTER.filter((x,i)=>i!==0),"kn_shield","kn_bash","kn_slash","strike"]:S.hero==="mage"?["m_bolt","m_bolt","m_bolt","m_bolt","m_spark","m_ward","m_ward","guard","guard","m_fire"]:S.hero==="vamp"?["v_bite","v_bite","v_bite","v_bite","v_claw","v_dodge","v_dodge","v_dodge","v_pact","v_bleed","v_fang"]:[...STARTER,"strike"]).map(id=>mk(id));{const ml=mastLv(S.hero);if(ml>=1){const pool=Object.keys(CARDS).filter(k=>CARDS[k].hero===S.hero&&CARDS[k].r==="C");if(pool.length)S.deck.push(mk(pick(pool)))}if(ml>=4&&MAST_RELIC[S.hero])S.relics.push(MAST_RELIC[S.hero]);if(ml>=5){const l=S.deck.filter(c=>!c.u);if(l.length)pick(l).u=1}}if(asc()>=4){S.max-=6;S.hp=Math.min(S.hp,S.max)}if(asc()>=7)S.deck.push(mk("heavy"));{S.max+=4*mlv("hp");if(asc()>=1)S.max+=2*mastLv(S.hero)+5*mlv("ascHp");S.hp=S.max;if(asc()>=4&&mlv("ascPot"))S.potSlots++;S.gold+=15*mlv("gold");if(mlv("pot")){givePotQuiet(randPot());if(mlv("pot")>=2)S.potSlots++}
  if(mlv("sharp")){shuffle(S.deck.filter(c=>c.id!=="heavy")).slice(0,mlv("sharp")).forEach(c=>c.u=1)}
  if(mlv("atkUp")){shuffle(S.deck.filter(c=>CARDS[c.id].type==="atk"&&!c.u)).slice(0,mlv("atkUp")).forEach(c=>c.u=1)}if(mlv("pal"))S.deck.push(mk(pick(POOL_PAL)));if(mlv("relic")){const r=randRelic("R");if(r)S.relics.push(r)}}
 S.tr=(M.wins||0)>=1?1:0;S.map=genMap();S.sky=genSky();pickBoss();S.pals={};S.stats.caught=0;S.stats.gold2=0;M.runs++;saveMeta();
 show("none");setBg("title");playMusic("space");
 M.memo=M.memo||{};if(!M.memo[S.hero]&&MEMO[S.hero]){await memoryBattle();M.memo[S.hero]=1;saveMeta();show("none");setBg("title");playMusic("space")}
 await talk((M.heroRuns||{})[S.hero]?(STORY.intro2):HS("intro"));M.heroRuns=M.heroRuns||{};M.heroRuns[S.hero]=(M.heroRuns[S.hero]||0)+1;await modIntro();await blessing()}
async function blessing(){const opts=shuffle([
 {t:"最大生命 +10",d:"身体更结实了",f:()=>{S.max+=10;S.hp+=10}},
 {t:"获得一件随机遗物",d:"长老塞给你一个小包裹",f:()=>gainRelic(randRelic("C"))},
 {t:"移除一张「打一下」",d:"去掉一张最普通的牌",f:()=>{const i=S.deck.findIndex(c=>c.id==="strike");if(i>=0)S.deck.splice(i,1)}},
 {t:"获得 100 金币",d:"长老的私房钱",f:()=>{S.gold+=100}},
 {t:"选一张稀有牌",d:"长老教你一招",f:async()=>{const c=offerCards(3,"R",1);await chooseReward(c,"长老教你一招",false)}},
 {t:"获得两瓶药水",d:"奶茶泉的泉水",f:()=>{givePot(randPot());givePot(randPot())}}]).slice(0,3+mlv("bless"));
 return new Promise(res=>{ov(`<div class="ovHead"><span class="ribbon b">奶蛙长老的祝福</span><small>出发前，选一样带上</small></div><div class="evOpts" style="position:absolute;left:330px;right:120px;top:150px;gap:12px">${opts.map((o,i)=>`<button class="evo" data-i="${i}"><b>${o.t}</b><small>${o.d}</small></button>`).join("")}</div><div style="position:absolute;left:60px;bottom:30px;width:220px;height:260px"><img src="${IMG("m6")}" style="width:100%;height:100%;object-fit:contain"></div><div class="blessSay">拿着。用不上就扔了，别跟人说是我给的。</div>`);
  {const bs=$(".blessSay");if(bs)bs.onclick=()=>bs.remove()}
  $$("#ov .evo").forEach(b=>b.onclick=async()=>{sfx("relic");closeOv();await opts[+b.dataset.i].f();if(mlv("lv")&&!S.lvPerk){S.lvPerk=1;await levelUp("老练")}saveRun();openMap();res()})})}
function resume(){if(S.act==null)S.act=0;S.rageUsed=0;if(!S.boss)pickBoss();if(!S.sky)S.sky=genSky();if(!S.pals)S.pals={};setBg("swamp");if(S.cur){const c=S.cur;S.cur=null;enterNode(c.t,true,c)}else openMap()}

/* ===================== 地图 ===================== */
const MAPTH=(()=>{const R=(n,f)=>Array.from({length:n},(_,i)=>f(i)).join("");const r=(a,b)=>(a+Math.random()*(b-a)).toFixed(1);
 return[
 {bg:"swamp",k:"沼",fx:()=>R(14,i=>`<i class="ff" style="left:${r(2,98)}%;top:${r(10,95)}%;animation-delay:-${r(0,6)}s;animation-duration:${r(4,8)}s"></i>`),
  deco:`<svg class="mDeco reeds" viewBox="0 0 300 220"><g fill="#0c1a0e">${[20,48,70,96,130,160,190].map((x,i)=>`<path d="M${x} 220 Q${x-6} ${120-i*6} ${x+4} ${40+i*9} Q${x+10} ${120-i*6} ${x+8} 220Z"/><ellipse cx="${x+4}" cy="${46+i*9}" rx="6" ry="20"/>`).join("")}</g></svg><svg class="mDeco reeds r2" viewBox="0 0 300 220"><g fill="#0c1a0e">${[30,64,92,140,200,240].map((x,i)=>`<path d="M${x} 220 Q${x-6} ${110-i*5} ${x+4} ${50+i*8} Q${x+10} ${110-i*5} ${x+8} 220Z"/>`).join("")}</g></svg>`},
 {bg:"castle",k:"堡",fx:()=>R(6,i=>`<i class="bat" style="top:${r(5,55)}%;animation-delay:-${r(0,12)}s;animation-duration:${r(9,16)}s"><svg viewBox="0 0 40 16"><path d="M20 6 Q14 0 2 4 Q8 6 6 12 Q12 8 16 12 Q18 8 20 10 Q22 8 24 12 Q28 8 34 12 Q32 6 38 4 Q26 0 20 6Z" fill="#0d0d0d"/></svg></i>`),
  deco:`<div class="mDeco moonBig"></div><svg class="mDeco rose" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="#0d0d0d"/>${R(12,i=>`<path d="M100 100 L${100+88*Math.cos(i*Math.PI/6)} ${100+88*Math.sin(i*Math.PI/6)} A88 88 0 0 1 ${100+88*Math.cos((i+1)*Math.PI/6)} ${100+88*Math.sin((i+1)*Math.PI/6)}Z" fill="${["#e5191c","#5b1a7a","#c8a23a"][i%3]}" opacity=".85" stroke="#0d0d0d" stroke-width="6"/>`)}<circle cx="100" cy="100" r="22" fill="#e5191c" stroke="#0d0d0d" stroke-width="6"/></svg>`},
 {bg:"ice",k:"冰",fx:()=>R(30,i=>`<i class="sn" style="left:${r(0,100)}%;width:${r(2,6)}px;height:${r(2,6)}px;animation-delay:-${r(0,10)}s;animation-duration:${r(6,12)}s"></i>`),
  deco:`<svg class="mDeco bell" viewBox="0 0 120 140"><path d="M60 8 Q64 8 64 16 Q100 24 100 80 L112 112 L8 112 L20 80 Q20 24 56 16 Q56 8 60 8Z" fill="#0d0d0d"/><circle cx="60" cy="122" r="12" fill="#0d0d0d"/><path d="M30 104 L90 104" stroke="#fff" stroke-width="4"/></svg>`},
 {bg:"gears",k:"沸",fx:()=>R(8,i=>`<i class="st" style="left:${r(3,97)}%;animation-delay:-${r(0,7)}s;animation-duration:${r(5,9)}s"></i>`),
  deco:`<svg class="mDeco gear g1" viewBox="0 0 100 100"><path fill="#0d0d0d" d="${R(12,i=>{const a=i*Math.PI/6,b=a+.2,c=a+.32,d=a+.52;return(i?"L":"M")+(50+40*Math.cos(a))+" "+(50+40*Math.sin(a))+"L"+(50+48*Math.cos(b))+" "+(50+48*Math.sin(b))+"L"+(50+48*Math.cos(c))+" "+(50+48*Math.sin(c))+"L"+(50+40*Math.cos(d))+" "+(50+40*Math.sin(d))})}Z"/><circle cx="50" cy="50" r="14" fill="#e5191c"/></svg><svg class="mDeco gear g2" viewBox="0 0 100 100"><path fill="#0d0d0d" d="${R(10,i=>{const a=i*Math.PI/5,b=a+.25,c=a+.4,d=a+.62;return(i?"L":"M")+(50+38*Math.cos(a))+" "+(50+38*Math.sin(a))+"L"+(50+48*Math.cos(b))+" "+(50+48*Math.sin(b))+"L"+(50+48*Math.cos(c))+" "+(50+48*Math.sin(c))+"L"+(50+38*Math.cos(d))+" "+(50+38*Math.sin(d))})}Z"/><circle cx="50" cy="50" r="12" fill="#fff"/></svg><div class="mDeco pipe"></div>`},
 {bg:"sky",k:"星",fx:()=>R(36,i=>`<i class="tw" style="left:${r(0,100)}%;top:${r(0,100)}%;animation-delay:-${r(0,4)}s"></i>`),
  deco:``}
 ]})();
const LEGI={m:["laugh","butler","snowchick","teacup","starfrog"],E:["swampbear","knight2","icefrog","furnaceegg","imp"]};
const MAPR=13,COLS=7;Object.defineProperty(window,"ROWS",{get(){return S&&S.map&&S.map.length?S.map.length:MAPR},configurable:true});const GROW=()=>Math.floor(ROWS/2);const actN=()=>ACTS[S.act||0];const curBoss=()=>S.boss||ACTS[S.act||0].boss;const bossAlt=()=>curBoss()!==ACTS[S.act||0].boss;const pickBoss=()=>{const bl=ENCS[S.act||0].bosses.map(x=>x[0]);const last=(M.lastBoss||{})[S.act||0];const fresh=bl.filter(b=>b!==last);const unk=bl.filter(b=>!((M.boss||{})[b]||{}).k);S.boss=asc()>=1&&unk.length&&rnd()<.75?pick(unk):pick(fresh.length&&rnd()<.75?fresh:bl);M.lastBoss=M.lastBoss||{};M.lastBoss[S.act||0]=S.boss;if(S.act===1&&S.flags&&(S.flags.vampTea||S.flags.vampBit))S.boss="count";{const gl=(ENCS[S.act||0].guards||ENCS[S.act||0].bosses.map(x=>x[0])).filter(b=>b!==S.boss);const gu=gl.filter(b=>!((M.boss||{})[b]||{}).k);S.guard=asc()>=1&&gu.length&&rnd()<.75?pick(gu):pick(gl)}};
function genMap(){const g=[...Array(MAPR)].map(()=>Array(COLS).fill(null));const edges=new Set();const starts=[];
 {const cols=shuffle([...Array(COLS).keys()]);for(let i=0;i<5;i++)starts.push(cols[i])}
 for(const s of starts){let c=s;for(let r=0;r<MAPR;r++){g[r][c]=g[r][c]||{r,c,t:null,nx:[],jx:ri(14)-7,jy:ri(8)-4};if(r===MAPR-1)break;
  let o=[c-1,c,c+1].filter(x=>x>=0&&x<COLS&&!(x!==c&&edges.has(`${r},${x},${c}`)));const fresh=o.filter(x=>!g[r+1][x]);const n=pick(fresh.length&&rnd()<.7?fresh:o);if(!g[r][c].nx.includes(n))g[r][c].nx.push(n);edges.add(`${r},${c},${n}`);c=n}}
 for(let r=0;r<MAPR;r++)for(let c=0;c<COLS;c++){const n=g[r][c];if(!n)continue;
  const par=r?g[r-1].filter(p=>p&&p.nx.includes(c)):[];
  if(r===0)n.t="m";else if(r===2||r===8)n.t="t";else if(r===MAPR-1)n.t="r";else if(r===MAPR-3){n.t="q";n.story=1}else{
   for(let k=0;k<20;k++){const w=[["m",34],["q",30],["E",r>=2?12:0],["r",r===4?16:0],["s",r>=1?11:0],["t",0]];let tot=w.reduce((a,b)=>a+b[1],0),x=rnd()*tot,t="m";for(const[k2,v]of w){if((x-=v)<0){t=k2;break}}
    if(["E","r","s","t"].includes(t)&&par.some(p=>p.t===t))continue;if(r>=MAPR-3&&t==="r")continue;n.t=t;break}
   if(!n.t)n.t="m"}
  if(n.t==="t"&&rnd()<.14)n.gold=1}
 {const GR=Math.floor(MAPR/2);const G4=g[GR].filter(Boolean);if(G4.length){const nx=[...new Set(G4.flatMap(n=>n.nx))];const mc=Math.floor(COLS/2);g[GR]=Array(COLS).fill(null);g[GR][mc]={r:GR,c:mc,t:"K",nx,jx:0,jy:0};g[GR-1].forEach(n=>{if(n)n.nx=[mc]})}}
 {const all=g.flat().filter(Boolean),GR=Math.floor(MAPR/2);[[1,GR-1],[GR+1,MAPR-2]].forEach(([a,b])=>{const half=all.filter(n=>n.r>=a&&n.r<=b);half.forEach(n=>{if(n.t==="s")n.t="m"});const pk=(t,avoidRow)=>{const c=half.filter(n=>(n.t==="m"||n.t==="q")&&n.r!==avoidRow&&n.r>=a+1);const x=c.length?pick(c):pick(half.filter(n=>n.t==="m"||n.t==="q"));if(x){x.t=t;return x.r}return -1};const sr=pk("s",-1);pk("v",sr)})}
 g[MAPR-3].forEach(n=>{if(n){n.t="q";n.story=1}});return g}
function genSky(){const off=ri(4);const fm=S.mod==="full",rn=S.mod==="rain";const bs=[{moon:"full",wx:"rain"},{moon:"wane",wx:"storm"},{moon:"new",wx:"snow"},{moon:"wax",wx:"fog"},{moon:"full",wx:"clear"}][S.act||0];const wxp=S.act===2?["snow","snow","snow","fog","clear","storm"]:S.act===3?["fog","fog","clear","rain","storm"]:WX_POOL;return[...Array(ROWS+1)].map((_,r)=>{const k=r===ROWS?{...bs}:{moon:MOON_CYCLE[(r+off)%4],wx:r===0?(S.act===2?"snow":"clear"):pick(wxp)};if(fm)k.moon="full";if(rn)k.wx="rain";return k})}
const NODE={m:{n:"小怪",ic:"e_v_ms"},E:{n:"精英",ic:"e_v_m4"},q:{n:"事件",ic:"v_evq",badge:1},r:{n:"休息",ic:"m6",head:1,bd:"🔥"},s:{n:"商店",ic:"m4",head:1,bd:"coin"},v:{n:"酒馆",ic:"i5",head:1,bd:"🍺"},t:{n:"宝箱",e:"mChest"},K:{n:"守关首领",e:"skull"},C:{n:"魔化首领",e:"skull"},X:{n:"冰原残骸",ic:"v_evq",badge:1},H:{n:"SS 讨伐",e:"skull"}};
const mx=r=>140+r*Math.round(900/(ROWS-1)),my=c=>172+c*70;
function availNodes(){if(S.atBoss)return[];if(S.row<0)return S.map[0].filter(Boolean);if(S.row===ROWS-1)return"boss";const n=S.map[S.row][S.col];return n.nx.map(c=>S.map[S.row+1][c])}
function openMap(){B=null;try{injectProto()}catch(e){}show("map");$("#map").classList.toggle("junc",!!S.junc);if(S.quest&&S.quest.done&&!S.quest.paid)setTimeout(()=>questPay(),700);setBg("map");if(S.lowHalf===1){S.lowHalf=2;setTimeout(()=>banner(`${actN().n} · 下半层`,1),300)}renderTop();playMusic("swing");S.cur=null;saveRun();
 const av=availNodes();const svg=$("#mapSvg");let p="";
 for(const row of S.map)for(const n of row){if(!n)continue;for(const c of n.nx){const m=S.map[n.r+1][c];const done=S.path.some((q,i)=>q[0]===n.r&&q[1]===n.c&&S.path[i+1]&&S.path[i+1][1]===c);const nxt=S.row===n.r&&S.col===n.c;
  p+=`<path class="${done?"done":nxt?"next":""}" d="M${mx(n.r)+n.jx} ${my(n.c)+n.jy} L${mx(m.r)+m.jx} ${my(m.c)+m.jy}"/>`}
  if(n.r===ROWS-1&&!S.junc){const done=S.atBoss&&S.col===n.c;p+=`<path class="${S.row===n.r&&S.col===n.c?"next":""}" d="M${mx(n.r)+n.jx} ${my(n.c)+n.jy} L1180 400"/>`}}
 svg.innerHTML=p;let h="";
 for(const row of S.map)for(const n of row){if(!n)continue;const T=NODE[n.t];if((n.t==="m"||n.t==="E")&&!n.grp){const P=S.junc?JENC:S.dream?ENCS[ri(4)]:ENCS[S.act||0];n.grp=[...(n.t==="E"?(S.junc?(()=>{const L=(JENC.byAct[S.act]||JENC.elite.flat()).map(x=>[x]);const used=S.map.flat().filter(m=>m&&m!==n&&m.t==="E"&&m.grp).map(m=>m.grp[0]);const f=L.filter(x=>!used.includes(x[0]));return pick(f.length?f:L)})():pick(P.elite)):S.junc&&JENC.mobAct&&JENC.mobAct[S.act]?pick(JENC.mobAct[S.act]):n.r<((S.act||0)?1:2)?pick(P.easy):pick(P.normal))]}const gi=n.grp&&ENEMY[n.grp[0]]?ENEMY[n.grp[0]].img:null;const isAv=Array.isArray(av)&&av.includes(n);const vis=S.path.some(q=>q[0]===n.r&&q[1]===n.c);const past=!isAv&&n.r<=S.row&&!vis;
  h+=`<div class="mn t-${n.t} ${S.junc&&n.r===ROWS-1?"lastE":""} ${n.story?"storyN":""} ${n.t==="t"&&(n.gold||S.flags.goldChest)?"gold":""} ${n.hid?"hidR":""} ${isAv?"av":""} ${vis?"visited":""} ${past?"past":""} ${S.row===n.r&&S.col===n.c?"cur":""}" data-r="${n.r}" data-c="${n.c}" style="left:${mx(n.r)+n.jx}px;top:${my(n.c)+n.jy}px">${n.t==="K"&&S.guard&&ENEMY[S.guard]?`<img class="sil" src="${IMG(ENEMY[S.guard].img)}"><b>？？？</b>`:gi?`<img class="${n.grp&&n.grp.some(x=>/shadow/.test(x))?"sil":""}" src="${IMG(gi)}">`:T.ic?`<span class="hw"><img class="${T.head?"head":T.badge?"badge":""}" src="${IMG(n.t==="v"?TAVERN[Math.min(S.act||0,TAVERN.length-1)].img:T.ic)}">${T.bd?`<i class="hbd">${T.bd==="coin"?ICON.coin:T.bd}</i>`:""}</span>`:(n.t==="t"&&(n.gold||S.flags.goldChest)?ICON.mChestG:ICON[T.e])}</div>`}
 h+=S.junc?"":`<div class="mn boss ${av==="boss"?"av":""}" id="bossNode" style="left:1180px;top:400px"><img class="sil" src="${IMG(ENEMY[curBoss()].img)}"><b>？？？</b></div>`;
 for(let r=0;r<=ROWS;r++){const k=S.sky[r];h+=`<div class="skyCol ${r===S.row+1?"nx":""}" data-r="${r}" style="left:${r===ROWS?1180:mx(r)}px">${moonSVG(k.moon)}${WXICON[k.wx]}</div>`}
 h+=`<div class="mapHead"><span class="ribbon">${S.junc?`${S.act}.5层 · ${JNAME[S.act]||"交叉路口"}`:S.fin?"最终之地":S.dream?"第五层 · 阿岳的梦":`第${"一二三四五"[S.act]}层 · ${actN().n}`}</span><small>${S.junc?(av==="boss"?"岔路走完了，领奖励吧":"随时可以离开，继续往上爬")+(S.jside&&JSIDE[S.jside.k]?`　｜　支线：${JSIDE[S.jside.k].n}${S.jside.done?"（已完成）":"："+JSIDE[S.jside.k].d}`:""):av==="boss"?"首领就在前面":"选择下一个房间"}</small></div>${S.junc?`<button class="btn sm pink juncLeave" id="juncLeave">离开岔路，继续上楼 ▶</button>`:""}${(()=>{const q=S.junc?S.jside:S.mside;if(!q||!JSIDE[q.k]||(!S.junc&&q.done))return"";const J=JSIDE[q.k];return`<div class="jsideChip${q.done?" ok":""}"><b>支线</b>${J.n}<small>${q.done?"已完成 ✓":J.d+(J.cnt>1?`（${q.p||0}/${J.cnt}）`:"")}</small></div>`})()}<div class="legend">${Object.entries(NODE).map(([k,t])=>{const L=LEGI[k]&&ENEMY[LEGI[k][S.act||0]];const ic=L?L.img:t.ic;return`<span>${ic?`<img src="${IMG(ic)}">`:ICON[t.e]}${t.n}</span>`}).join("")}</div>`;
 $("#mapNodes").innerHTML=h;$("#map").style.setProperty("--hero",`url(${IMG(HI())})`);
 if($("#juncLeave"))$("#juncLeave").onclick=()=>{sfx("click");confirmBox("离开这条岔路？","没走完的房间就不要了，直接上楼。",()=>{closeOv();juncLeave()})};
 $$(".mn.av").forEach(e=>e.onclick=()=>{sfx("click");if(e.id==="bossNode"&&S.junc){juncFinish();return}if(e.id==="bossNode"){S.atBoss=true;enterNode("B")}else{const r=+e.dataset.r,c=+e.dataset.c;S.row=r;S.col=c;S.path.push([r,c]);S.pendGrp=S.map[r][c].grp||null;enterNode(S.map[r][c].t)}});
 $$(".skyCol").forEach(e=>e.onclick=()=>{const k=S.sky[+e.dataset.r];tipAt(e,`<b>${MOON[k.moon].n} · ${WX[k.wx].n}</b><p>${MOON[k.moon].d}</p><p>${WX[k.wx].d}</p>`)});
 if(S.junc&&S.row===S.map.length-1&&!S.juncDone)setTimeout(()=>juncFinish(),350);
 $("#mapTip").textContent=S.row<0?"往右爬，过守关首领，打最终首领。":"点顶上的月亮可以查看那一层的月相和天气。"}

/* ===================== 进入房间 ===================== */
function enterNode(t,resumed,cur){S.cur=cur||{t,rs:S.rs};if(!resumed&&t==="t"){const nd=S.map&&S.map[S.row]&&S.map[S.row][S.col];if(nd&&nd.gold)S.cur.gold=1}if(resumed&&cur){S.rs=cur.rs;if(cur.snap){S.hp=cur.snap.hp;S.gold=cur.snap.gold;S.pots=[...cur.snap.pots];S.uid=cur.snap.uid}}saveRun();
 if(t==="m")startCombat("m");else if(t==="E")startCombat("E");else if(t==="B")bossIntro();else if(t==="K")guardIntro();else if(t==="F")startCombat("F");else if(t==="C")startCombat("C");else if(t==="H")protoIntro();else if(t==="X")eventScreen("ss_ruins");else if(t==="r")restSite();else if(t==="s")shopScreen();else if(t==="v")tavernScreen();else if(t==="t")treasure();else if(t==="q"&&S.junc)eventScreen();else if(t==="q"&&!S.dream&&!S.fin&&S.map&&S.map[S.row]&&S.map[S.row][S.col]&&S.map[S.row][S.col].story)storyNode();else if(t==="q"){const r=rnd();if(r<.1)startCombat("m");else if(r<.2)shopScreen("caravan");else eventScreen()}}
const OLDS={king:"boss0",snakeking:"boss0b",count:"boss1",buddha:"boss1b",iceking:"boss2",snowking:"boss2b",lavagiant:"boss3",pearlqueen:"boss3b",shadow:"boss4",cosmicegg:"boss4b"},OLDW={king:"win0",snakeking:"win0b",count:"win1",buddha:"win1b",iceking:"win2",snowking:"win2b",lavagiant:"win3",pearlqueen:"win3b"};
const HS=k=>STORY[k+"_"+((S&&S.hero)||"naiwa")]||STORY[k];
function heroTalk(id,img){const x=(BOSS_HERO[id]||{})[(S&&S.hero)||"naiwa"];if(!x)return[];return[["n1",HN(),x[0]],[img,ENEMY[id].n,x[1]]]}
function bossLines(id,w){return(w?STORY["bw_"+id]||STORY[OLDW[id]]:STORY["bs_"+id]||STORY[OLDS[id]])||[]}
async function guardIntro(){clearBattleUI();if(!S.guard){const gl=(ENCS[S.act||0].guards||ENCS[S.act||0].bosses.map(x=>x[0])).filter(b=>b!==S.boss);S.guard=pick(gl);saveRun()}const gid=S.guard;setBg(battleBg("B"));show("battle");$("#hand").innerHTML="";$("#enemies").innerHTML="";playMusic("boss");banner("守关首领",1);await sleep(600);const L=bossLines(gid);const L2=[...L,...heroTalk(gid,(L.find(l=>l[0]!=="n1")||[ENEMY[gid].img])[0])];if(L2.length)await talk(L2);const Lr=BOSS_LORE[gid]||{};toast(`守关首领 <b>${ENEMY[gid].n}</b>　<b>${Lr.t||""}</b>：${Lr.td||""}`);startCombat("K")}
/* 获得稀有以上的牌：发光飞进牌组（克制） */
function cardFly(el,r){if(!"REL".includes(r))return;try{const a=rectIn(el),db=$("#deckBtn");const b=db?rectIn(db):{x:1150,y:10,w:40,h:40};const c=el.cloneNode(true);c.classList.add("flyGet","fg-"+r);c.style.cssText=`position:absolute;left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${a.h}px;margin:0;z-index:140;font-size:${el.style.fontSize||""}`;$("#stage").appendChild(c);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{c.style.transform=`translate(${b.x+b.w/2-a.x-a.w/2}px,${b.y+b.h/2-a.y-a.h/2}px) scale(.12)`;c.style.opacity=".2"}));setTimeout(()=>{c.remove();if(db){db.classList.remove("got");void db.offsetWidth;db.classList.add("got")}},720)}catch(e){}}
/* 首领登场：P5 斜切大标题，踩着下一个鼓点进 */
function bossTitle(id,sub){return new Promise(res=>{let wait=350;try{if(A.ctx&&A.music&&TR[A.cur]){const q=60/TR[A.cur].bpm/2;const left=(8-(A.step%8))%8;wait=Math.max(120,Math.min(1600,(A.next-A.ctx.currentTime+left*q)*1000))}}catch(e){}
 setTimeout(()=>{const L=BOSS_LORE[id]||{};const d=document.createElement("div");d.className="bossTitle";d.innerHTML=`<i class="btBar"></i><div class="btTxt"><small>${sub||"首领"}</small><b>${ENEMY[id].n}</b><em>${L.t||""}</em></div>`;$("#stage").appendChild(d);sfx("boom");try{const t=A.ctx.currentTime;tone({type:"sine",f:55,f2:32,t,dur:1.1,vol:.6});noise({t,dur:.5,vol:.2,filt:"lowpass",f:300})}catch(e){}stageShake();
  setTimeout(()=>d.classList.add("out"),1500);setTimeout(()=>{d.remove();res()},1900)},wait)})}
async function bossIntro(){if(!S)return;clearBattleUI();setBg(battleBg("B"));show("battle");$("#hand").innerHTML="";$("#enemies").innerHTML="";playMusic("final");const bid=curBoss(),L0=STORY["bs_"+bid]||STORY["boss"+S.act+(bossAlt()?"b":"")];const met=(M.boss||{})[bid];const extra=met&&met.k?[[L0[0][0],ENEMY[bid].n,pick(["又是你。上次你也是这么说的。","我们见过吧？你的脸好熟。","你又来了。这次能走多远？","你还记得上次的事吗？我记得。"])]]:[];await talk([...L0,...heroTalk(bid,(L0.find(l=>l[0]!=="n1")||[ENEMY[bid].img])[0]),...extra]);await bossTitle(bid,S.fin?"最终之地 · 深渊":S.dream?"阿岳的梦 · 最终首领":`第${"一二三四五"[S.act||0]}层 · 最终首领`);toast(`首领特性 <b>${(BOSS_LORE[bid]||{}).t||""}</b>：${(BOSS_LORE[bid]||{}).td||""}`);startCombat("B")}

/* ===================== 战斗 ===================== */
function mkEnemy(id,i){const E=ENEMY[id];let hp=E.hp[0]+ri(E.hp[1]-E.hp[0]+1);if(id==="mimic"||id==="goldfrog")hp+=(S.act||0)*22;if(!S.act&&(S.combats||0)<=2&&!E.boss&&!E.elite)hp=Math.round(hp*.85);hp=Math.round(hp*(1+.12*(S.act||0))*(1+.06*Math.min(4,S.act||0))*(!E.boss&&!E.elite?1.04+.1*Math.max(0,(S.act||0)-1):1)*(1+.025*Math.max(0,S.row||0))*(E.elite?1.15:1)*(E.boss?(1.42+.05*Math.min(4,S.act||0))*(S.diff!=="hard"?[1,.96,.92,.88,.85][Math.min(4,S.act||0)]:1):1));if(asc()>=1)hp=Math.round(hp*1.1);if(asc()>=2&&(E.boss||E.elite))hp=Math.round(hp*1.12);if(S.mod==="fat")hp=Math.round(hp*1.25);if(S.mod==="hunter")hp=Math.round(hp*1.1);if(S.mod==="chain")hp=Math.round(hp*1.1);hp=Math.max(1,Math.round(hp*(E.boss?Math.min(1,DF().hp):DF().hp)));return{id,n:E.n,hp,max:hp,block:E.elite&&asc()>=5?12:0,str:(S.mod==="full"?1:0)+(asc()>=3?1:0)+[0,1,2,3,5][S.act||0]+(E.boss&&(S.act||0)>=1?1:0)+(E.boss&&(S.act||0)>=2?1:0)+(!E.boss&&!E.elite?((S.act||0)>=1?1:0)+((S.act||0)>=2?1:0)+((S.act||0)>=3?1:0):0)+((S.row||0)>=ROWS-2&&!E.boss?1:0)+(id==="mimic"?(S.act||0)*2:0),vuln:0,weak:0,mud:0,turn:0,seed:i,k:"e"+(++S.uid),stolen:0}}
function battleBg(kind){const a=S.act||0;if(S.fin||kind==="C")return"final";if(kind==="W")return"demon";if(S.lowHalf&&kind!=="F"&&BGIMG["low"+a])return"low"+a;if(kind==="F")return"demon";if(kind==="B"||kind==="K")return["boss","boss1","bossice","bossfac","boss2"][a];if(kind==="E")return["elite","gate","bellE","pipes","summit"][a];return actN().bgs[(S.row+3)%3]}
function clearBattleUI(){try{$("#pool").innerHTML="";$("#pool").className="";$("#hand").innerHTML="";$("#skyBar").innerHTML="";const c=$("#comboCt");if(c)c.remove();const bg0=$("#bag");if(bg0)bg0.remove();const si=$("#stIntro");if(si)si.remove();ST_Q=[];ST_ON=0;$$("#fx .triBan,#fx .famFlash,#fx .poolRing").forEach(x=>x.remove())}catch(e){}}
function startCombat(kind){clearBattleUI();setTimeout(()=>{try{if(!B)return;B.enemies.forEach(e=>{const m=BM[e.id];if(m&&!e.bmSaid){e.bmSaid=1;const el=enEl(e);if(el&&m.say)say(el.querySelector(".body"),m.say);toast(`<b>${e.n}的机制</b>：${m.tip}`)}})}catch(er){}},2600);{const bt=$("#battle");bt.classList.toggle("bossFight","BFKWCH".includes(kind));bt.classList.toggle("finalFight","BFWCH".includes(kind));if("BFKWCH".includes(kind))setTimeout(()=>{stageShake();sfx("bossIn")},700)}if(kind==="m"&&(S.actCombats||0)>=2&&rnd()<(S.mod==="gold"?.2:.07))kind="G";if(S.cur){if(!S.cur.snap)S.cur.snap={hp:S.hp,gold:S.gold,pots:[...S.pots],uid:S.uid};saveRun()}let list;if(kind==="R")list=[MEMO[S.hero].foe];else if(kind==="H")list=["proto"];else if(kind==="W")list=["chairwill"];else if(kind==="C")list=S.pendGrp||["king"];else if(kind==="F")list=["demon"];else if(kind==="M")list=["mimic"];else if(kind==="G")list=["goldfrog"];else if(kind==="B")list=[curBoss()];else if(kind==="K")list=[S.guard||curBoss()];else if((kind==="E"||kind==="m")&&S.pendGrp&&S.pendGrp.every(k=>ENEMY[k]))list=S.pendGrp;else if(kind==="E")list=pick(ENCS[S.act].elite);else list=(S.actCombats||0)<(S.act?1:2)?pick(ENCS[S.act].easy):pick(ENCS[S.act].normal);S.pendGrp=null;S.actCombats=(S.actCombats||0)+(kind==="m"?1:0);
 if(kind!=="B")S.combats++;
 B={kind,enemies:list.map(mkEnemy),p:{block:0,energy:0,str:has("star")?1:0,tstr:0,dex:0,vuln:0,weak:0,mud:0,nextAtk:0,borrow:0,retain:0,drawMinus:0,free:0,pw:{}},
  dp:shuffle(S.deck.map(c=>({...c}))),hand:[],disc:[],exh:[],turn:0,combo:0,played:0,fam:{},pool:[],poolCap:7,catchLeft:1+(has("net")?1:0),caught:[],badge:0,extraGold:0,mirror:has("mirror"),over:0,after:[],bag:[],eggs:[],sel:null,myTurn:false,totalPlayed:0};
 if(kind==="K")B.enemies.forEach(e=>{e.max=e.hp=Math.round(e.max*.7);e.guard=1});if(S.dream&&"mEMG".includes(kind))B.enemies.forEach(e=>{e.dreamy=1;e.n="梦里的"+e.n});if(S.dream&&kind==="K")B.enemies.forEach(e=>{e.dreamy=1});if(kind==="C")B.enemies.forEach(e=>{e.corrupt=1;e.n="魔化·"+e.n;e.str=(e.str||0)+1;e.max=e.hp=Math.round(e.max*.85)});if(S.flags&&S.flags.ssStr)B.p.str+=1;if(has("mw_will")){B.p.str+=2;B.p.evade=(B.p.evade||0)+1}if(S.diff==="hard"&&(kind==="B"||kind==="K"||kind==="F"))B.enemies.forEach(e=>{if(ENEMY[e.id].boss)e.str=(e.str||0)+1});
 Object.assign(B,API);{const k=S.sky[S.atBoss?ROWS:Math.max(0,S.row)];B.moon=k.moon;B.wx=k.wx;if(has("moonmirror"))B.moon="full";B.poolCap+=perk("cap");if(has("snakeskin"))B.p.dex+=1;B.p.str+=perk("str");if(kind!=="R"){B.p.str+=mlv("atkStr");B.p.nextAtk+=3*mlv("atkFirst");if(mlv("atkVuln")&&"EBKCF".includes(kind))B.enemies.forEach(e=>e.vuln=(e.vuln||0)+mlv("atkVuln"))}if(perk("thorn"))B.p.thorn=(B.p.thorn||0)+2*perk("thorn");for(let i=0;i<perk("rb")+(has("rbegg")?1:0);i++)B.pool.push({f:"any",ice:0});if(S.mod==="tiny")B.poolCap=5+perk("cap")+(has("pondstone")?1:0);if(S.mod==="pal")B.catchLeft++;if(S.mod==="calm")B.p.block+=5;if(B.moon==="new")B.poolCap--;if(has("snowglobe"))B.wx="snow";if(has("stablekey"))B.p.horseFree=1;if(has("eggbasket")){B.pool.push({f:"chick",ice:0});B.p.block+=5};if(has("pondstone"))B.poolCap++}
 setBg(battleBg(kind),B.moon);renderSky();show("battle");renderTop();if(kind==="W")playMusic("chair");else if(kind==="H")playMusic("proto");else if(kind==="R")playMusic("memo");else if(kind==="C")playMusic("fin");else if(S.fin&&kind==="B")playMusic("chair");else if(kind==="F"||kind==="B")playMusic("final");else if(kind==="K")playMusic("boss");else playMusic(kind==="E"?"elite":"battle");
 {const f=S.flags,E0=B.enemies[0];
  if(f.pupFriend&&!f.pupPaid&&S.act>=2&&(kind==="m"||kind==="E")){f.pupPaid=1;B.dogPack=2;ach("puppy");B.introTalk=[["dg","小奶狗","汪汪！是你！上次的恩情，我带朋友们来还了！"],["n1","功夫奶蛙","是那只小奶狗！还带来了一整群！"]]}
  if(kind==="B"&&E0.id==="count"&&f.vampTea){ach("teatime");E0.waitTurns=3;B.introTalk=[["vp","月夜伯爵","咦？你是，上次请我喝奶茶的那个小家伙？"],["vp","月夜伯爵","我这个人恩怨分明。先让你三回合，我把这杯茶喝完。"]]}
  else if(kind==="B"&&E0.id==="count"&&f.vampBit){E0.str+=2;B.introTalk=[["vp","月夜伯爵","你的血，我还记得那个味道。"],["vp","月夜伯爵","这一次，我要喝个够。（力气 +2）"]]}
  if(kind==="B"&&S.act===ACTS.length-1&&f.snowFriend){ach("snowhelp");B.introTalk=(B.introTalk||[]).concat([["egl","雪人","（从星星中间滚了过来）上次你扶我站起来，这次换我来挡一下！"]]);B.introFx=()=>{B.block(25,1)}}
  if(kind==="F"&&f.kingFriend){ach("mudcannon");B.introTalk=[["xsk","沼泽之王","呱！"+HN()+"，我来还人情了！看我的泥巴大炮！"]];B.introFx=()=>{B.apply(E0,"mud",12);B.apply(E0,"weak",2);sfx("mud")}}}
 if(kind==="m"){B.enemies.forEach(e=>{if(ENEMY[e.id].boss)return;const r=rnd();if(r<.08)applyAffix(e,"huge");else if(r<.15)applyAffix(e,"mini")})}if(kind==="E"){const af=pick(Object.keys(AFFIX));if((asc()>=6||S.diff==="hard"||rnd()<.7+.075*(S.act||0)))B.enemies.forEach(e=>applyAffix(e,af));if(kind==="E"&&has("eyepatch"))B.enemies.forEach(e=>e.vuln=(e.vuln||0)+2)}
 if(!has("snowglobe")&&S.mod!=="calm"&&kind!=="F"&&rnd()<.3)B.wxShift={turn:2+ri(2),to:pick(Object.keys(WX).filter(w=>w!==B.wx))};
 if(kind==="G")B.introTalk=[["n1","功夫奶蛙","那、那是，金色的奶蛙？！"],["n1","功夫奶蛙","传说三回合内打倒它，就能拿到一大笔金币！"]];
 B.enemies.forEach(e=>e.intent=e.waitTurns>0?{k:"wait"}:ENEMY[e.id].ai(e,0));
 renderBattle(true);
 if(has("feather"))B.block(8,1);
 setTimeout(async()=>{if(!B)return;if(!M.tut){M.tut=1;saveMeta();await tutorial()}if(!B)return;if(B.introTalk){await talk(B.introTalk);B.introTalk=null}if(B.introFx)B.introFx();{const bk="BFK".includes(B.kind),ek=B.kind==="E";if(bk)heroSay(pick(HL("boss")),1);else if(ek&&rnd()<.7)heroSay(pick(HL("elite")),1);else if(rnd()<.35)heroSay(pick(HL("start")))}startTurn()},300)}
/* ===================== 长老特训：每个角色第一次出发前 ===================== */
const TRAIN_BASE=[
 {t:"出牌和奶力",l:["每回合你有 3 点奶力。卡牌左上角的数字是它要花的奶力。","点一张牌出牌；要选目标的牌，再点一个敌人。","用不完的牌回合结束会弃掉，下回合重新抽 5 张。"],c:"strike"},
 {t:"看敌人想干嘛",l:["敌人头顶的牌子是它下一步要做的事：剑是攻击，后面的数字是伤害，盾是加护盾。","看到它要打你，就先出护盾牌挡一挡。","点敌人可以看它的特性，点别处就关掉。"]},
 {t:"奶蛙池和三连",l:["奶蛙、奶马、奶鸡、奶猫这些家族牌，打出去会往上方的奶蛙池里放一只同家族的小家伙。","同家族凑齐 3 只就会消除（新放进去的会自动排到同伴旁边），触发家族爆发：奶蛙乱拳、奶马群踏、奶鸡加盾、奶猫回血抽牌。","凑成三连的那张牌会打两次。池子里快凑齐时会发光晃动，手里能凑成三连的牌也会发光。"],c:"frogslam"},
 {t:"连锁和连击",l:["消除以后池子合拢，如果又凑成一组，就是连锁。每次连锁爆发更强，还会多给 1 点奶力。","连击是这回合打出的攻击牌数量。有的牌写着「连击 ≥3 时」，要先垫几张攻击牌再打它。","池子满了会溢出，挤掉最前面 3 只，你还要挨 6 点伤害。"]},
 {t:"奶蛙池的规则",l:["出一张牌，就往池子里放一只同家族的奶蛙。","放在哪：池里有同家族的，就挨着它们站（排在它们最右边）；没有同家族的，就排到池子最右边。","3 只同家族挨在一起，就消掉，触发爆发（满月夜 2 只就够）。","消掉以后两边会靠拢。靠拢后又有 3 只同家族挨在一起，就接着消，这叫连锁，连锁越多越强。","泥巴和冰会把同家族隔开。把泥巴清掉、等冰化开，两边一靠拢，常常一下连锁好几次。"]},
 {t:"爆发是什么",l:["同家族凑齐 3 只消除时，会触发这个家族的「爆发」：奶蛙乱拳打随机敌人，奶马群踏打全体，奶鸡给你加护盾，奶猫回血还抽牌，魔法符文是法术齐射，血滴让全体流血并回血，骑士加护盾再用护盾砸人。","爆发跟着连锁翻倍：二连锁 ×2，三连锁 ×3……所以先攒、再一口气连起来最赚。","满月夜只要 2 只就消除，新月夜每消除 3 次多给 1 点奶力。"]},
 {t:"暗器、顿悟、暴击",l:["暗器放在主角旁边的暗器袋里，最多 3 个，不占手牌；在你的回合点一下就扔出去，不花奶力。袋里凑齐 3 个一样的会自动一起引爆。每个主角都有自己擅长的暗器（带★的威力更大）。","血条下面的细条是顿悟（功夫叫通透世界，魔法师叫星之力），攒满了点一下发动。用完从零开始重新攒，攒满就能再用，次数不限。","所有攻击都能暴击，红色大字就是暴击；粉色数字是吸血鬼的粉伤；白紫色是无视护盾的真伤。"]},
 {t:"抓奶蛙",l:["敌人血量打到血条上那道白线以下时，它身上会出现「抓」的按钮，花 1 点奶力扔网。越强的敌人越容易挣脱，按钮上会写成功率。每场战斗能抓 1 次，首领抓不了。","抓到的敌人会变成伙伴卡加入牌组，图鉴里也会记下来。","首领抓不了。"]},
 {t:"爬塔",l:["地图从左往右走：小怪、精英、事件、休息、商店、宝箱，每层中间有守关首领，最后是这一层的首领。","顶上的月亮和天气会改变规则，点一下就能看。","看不懂某张牌？长按它，就能看到完整说明和家族介绍。"]}];
const TRAIN_HERO={
 vamp:{t:"吸血鬼奶蛙：血契",l:["你没有护盾，也不需要护盾。生命只有 62，所有加护盾的效果对你都无效。","带「吸血」的攻击，打出伤害的一半会回成你的血。「流血」会让敌人每回合掉血，可以叠层。「闪身」能挡掉下一次攻击的一部分。","血量低于 25% 时，进入血月形态：攻击全部吸血，攻击 +3。每场战斗一次。"],c:"v_bite"},
 naiwa:{t:"奶蛙：厚肚皮",l:["你的肚皮最厚，生命 84，每场战斗开局自带 8 点护盾。","池子每消除一次（清掉泥巴也算），这场战斗力气 +1（不封顶），再加 3 点护盾。所有家族的爆发效果 ×1.3，清掉泥巴时还多给 5 点护盾。","稳稳地挡，慢慢地打。专属牌「枕头大战」会把护盾的一半变成伤害。","打不过就回来，没人会笑你。"],c:"n_pillow"},
 kungfu:{t:"功夫奶蛙：快手连击",l:["每场战斗第一回合多抽 2 张，起手就是一整套。","拳意：每回合从第 3 张攻击牌起，每一下伤害 +2。多段攻击的牌每段都加。","起始牌组只有 1 张护盾牌，换成 2 张「轻身」（0 费，敏捷 +1、闪避 1 层），靠躲不靠挡。攻击有 2 张「快拳」、2 张「奶蛙拳」和 1 张「推掌」。","专属牌「一气呵成」，这回合出的牌越多，打得越多下。"],c:"fist"},
 knight:{t:"骑士奶蛙：铁甲",l:["开局自带 7 护盾，回合开始时护盾只掉一半，越守越厚。","每回合第一张攻击牌，会额外加上你护盾 1/3 的伤害，最多 +20。","「盾击」「审判」这些牌都吃护盾，先堆盾，再反打。","骑士专属牌属于「骑士」家族：凑齐 3 张会触发骑士爆发——加护盾，再用护盾的 45% 砸一个敌人。","敌人的「破防」攻击打在护盾上会翻倍，打穿了剩下的才扣血。"],c:"kn_bash"},
 mage:{t:"奶蛙魔法师：法术",l:["你的攻击是法术：无视敌人护盾，伤害加魔力，不吃力气。","回合结束时，没用完的奶力一半变成魔力（整场一直留着），一半变成护盾（每点 4 护盾）。省一点，既能攒大招，也能保命。","每张法术会往奶蛙池里放一枚魔法符文，凑齐 3 枚就会法术齐射，还会加 1 层魔力。「冥想」攒魔力，「陨石术」一口气把魔力全打出去。"],c:"m_fire"}};
function training(hid){return new Promise(res=>{const pages=[...(M.trainBase?[]:TRAIN_BASE),TRAIN_HERO[hid]].filter(Boolean);let i=0;const H=HEROES.find(h=>h.id===hid)||HEROES[0];
 const done=()=>{M.trainBase=1;saveMeta();closeOv();res()};
 const draw=()=>{const P=pages[i];ov(`<div class="trainBox"><div class="trHead"><span class="ribbon b">${M.trainBase?"规则":"长老特训"}</span><small>${i+1} / ${pages.length}</small></div><div class="trBody"><div class="trElder"><img src="${IMG("m6")}"><b>奶蛙长老</b></div><div class="trTxt"><h3>${P.t}</h3>${P.l.map(x=>`<p>${x}</p>`).join("")}</div>${P.c?`<div class="trCard">${cardHTML({id:P.c,u:0,k:"tr"},"mid")}</div>`:`<div class="trCard trHero"><img src="${IMG(H.img)}"></div>`}</div><div class="trFoot"><button class="btn sm ghost" id="trSkip">跳过特训</button>${i>0?`<button class="btn sm ghost" id="trPrev">上一步</button>`:""}<button class="btn sm" id="trNext">${i===pages.length-1?"出发！":"下一步"}</button></div></div>`);
  $("#trSkip").onclick=()=>{sfx("click");done()};if($("#trPrev"))$("#trPrev").onclick=()=>{i--;sfx("click");draw()};$("#trNext").onclick=()=>{sfx("click");if(i>=pages.length-1)done();else{i++;draw()}}};
 draw()})}
function tutorial(){return new Promise(res=>{ov(`<div class="modal" style="max-width:820px;text-align:left"><h3 style="text-align:center">奶蛙池怎么玩</h3><p>1. 打出的每张家族牌，都会往上方的<b>奶蛙池</b>里放一只奶蛙，它会自动排到同家族旁边。</p><p>2. <b>同家族凑齐 3 只</b>就会消除（满月时 2 只就够；泥巴和冰冻会把它们隔开）：这张牌效果翻倍，再触发一次<b>家族爆发</b>。</p><p>3. 消除后后面的奶蛙会往前补位，补位又凑成 3 只就继续消，这就是<b>连锁</b>。每多一环，爆发翻一倍，还多给 1 点奶力。</p><p>4. 敌人会往池里<b>丢泥巴</b>把你的奶蛙隔开、<b>冻住</b>奶蛙、甚至<b>吸走</b>奶蛙。泥巴凑够 3 块也会消掉，常常能顺势连锁。池子满 7 格会溢出受伤。</p><p>5. 敌人血量低于 35% 时可以<b>抓</b>回去当伙伴卡；每层的<b>月相天气</b>在左上角；集齐 3 张同名牌会合成<b>金卡</b>。</p><div class="row"><button class="btn" id="tutOk">开打！</button></div></div>`);$("#tutOk").onclick=()=>{closeOv();res()}})}
function relicPulse(id){const e=$(`#top .rl[data-rl="${id}"]`);if(e){e.classList.remove("pulse");void e.offsetWidth;e.classList.add("pulse")}}
async function startTurn(){if(B.over)return;B.turn++;if(asc()>=8&&B.turn>1&&(B.turn-1)%3===0)B.alive().forEach(e=>{if(ENEMY[e.id].boss){e.str=(e.str||0)+1;fxSay(e,"力气 +1")}});if(S&&S.stats&&B.kind!=="R")S.stats.turns=(S.stats.turns||0)+1;if(B.rageOn){B.rageOn=0;$("#player")&&$("#player").classList.remove("rageOn")}B.elimTurn=0;B.curLs=false;B.rebelNow=0;B.triTurn=0;B.lastAct=Date.now();B.combo=0;B.hitStreak=0;B.palTurn=0;B.played=0;B.fam={};B.wayUsed=0;B.myTurn=true;const p=B.p;B.brittle=0;p.brittle=0;p.noBrittle=0;if(p.poison>0&&p.poisonT>0){const pd=p.poison;p.poison++;p.poisonT--;if(!p.poisonT)p.poison=0;dmgPlayer(pd,null,true);toast(`中毒：失去 <b>${pd}</b> 生命`);if(S.hp<=0){setTimeout(()=>lose(),300)}}if(p.curse>0){p.curse--;if(!p.curse){const cd=p.curseD||12;dmgPlayer(cd,null,true);banner("诅咒爆发",1);stageShake();toast(`诅咒爆发：失去 <b>${cd}</b> 生命`);if(S.hp<=0){setTimeout(()=>lose(),300)}}}{const W2=p.pw2||{};if(W2.hotbelly)B.alive().forEach(e=>B.apply(e,"burn",W2.hotbelly));if(W2.moonshade){shuffle(B.alive()).slice(0,W2.moonshade).forEach(e=>B.apply(e,"night",1))}}if(B.kind==="R")setTimeout(()=>memoTurn(),650);
 B.horseN=0;B.fogUsed=0;B.chainsTurn=0;B.comboUsed=0;{let th=0;B.pool.forEach(x=>{if(x.ice){x.ice--;if(!x.ice)th++}});if(th){toast(`池里有 ${th} 只奶蛙解冻了`);B.poolResolve()}}if(S.mod==="sand"&&B.turn>1){const fr=B.pool.filter(x=>!x.ice&&x.f!=="mud");if(fr.length){pick(fr).ice=1;toast("风沙埋住了池里一只奶蛙");renderPool()}}p.noOverflow=0;if(p.keepBlk){p.keepBlk=0}else if(!p.retain&&!p.pw.iron&&!has("qz_banner"))p.block=(B.wx==="snow"||S.hero==="knight")?Math.floor(p.block/2):0;if(B.turn===1&&S.hero==="naiwa")p.block+=8;if(B.turn===1&&has("comp_sword"))p.str=(p.str||0)+1;if(B.turn===1&&has("comp_doll")){S.hp=Math.min(S.max,S.hp+5)}if(B.turn===1&&S.hero==="knight")p.block+=7;if(B.turn===1){if(has("mr_pillow"))p.block+=4;if(has("mr_mirror"))p.block+=6;if(has("mr_notes"))p.mana=(p.mana||0)+2}if(B.turn===1&&S.hero==="mage")p.mana=(p.mana||0)+2;if(S.hero==="vamp"){p.dodge=0;p.nightLs=0;if(p.pw.bloodmoon)B.alive().forEach(e=>B.apply(e,"bleed",p.pw.bloodmoon))}if(p.bell){p.drawMinus=(p.drawMinus||0)+1;p.bell=0}B.knAtk=0;if(B.turn===1&&has("spikeshell")){p.block+=8;relicPulse("spikeshell")}if(B.turn===1){if(has("ironpot"))p.str=(p.str||0)+1;if(has("frogcharm")){B.poolInsert("frog");B.poolInsert("frog");B.poolResolve()}}if(has("bigspoon")&&!p.block)p.block+=4;if(has("snowglobe"))B.pool.forEach(x=>x.ice=0);if(has("darkmirror")){S.hp=Math.max(1,S.hp-1);p.tstr=(p.tstr||0)+2}B.horseRope=0;B.catBell=0;B.played5=0;p.redirect=0;B.gourdT=0;B.sklN=0;B.alive().forEach(e=>{e.turnDmg=0});B.lastFirst=B.firstC;B.firstC=null;setTimeout(()=>{try{bmStart()}catch(er){console.warn(er)}},650);if(S.dummy)dummyTurn();B.spellN=0;if(has("qz_well")&&(p.mana||0)>=10){p.energy=(p.energy||0);B.after=B.after||[];setTimeout(()=>{if(B&&!B.over){B.gainEnergy(1);B.block(8);relicPulse("qz_well");renderBattle()}},300)}if(has("qz_banner")&&B.turn>1){S.hp=Math.max(1,S.hp-2)}if(has("qz_pact")&&S.hp<S.max/2){S.hp=Math.max(1,S.hp-2)}{const W=p.pw2||{};if(W.neigong){const al=B.alive();if(al.length)B.apply(pick(al),"inj",W.neigong)}if(W.anqi)for(let i=0;i<W.anqi;i++)B.gainAnqi();if(B.turn===1){for(let i=0;i<1+perk("anqi");i++)B.gainAnqi(B.favAnqi());if(S.flags.nextAnqi){B.gainAnqi("dart");S.flags.nextAnqi--}}if((B.eggs||[]).length)setTimeout(()=>hatchEggs(),500);if(W.mana)p.mana=(p.mana||0)+W.mana;if(W.starcat){const al=B.alive();if(al.length){B.curSpell="arc";B.spell(pick(al),W.starcat);B.curSpell=null}}if(W.shield)B.block(W.shield);if(W.tstr)p.tstr=(p.tstr||0)+W.tstr;if(W.heal)B.heal(W.heal);if(W.frogwall){for(let i=0;i<W.frogwall;i++)B.poolInsert("frog");B.poolResolve();B.poolOverflow()}if(W.vuln){const al=B.alive();if(al.length)B.apply(pick(al),"vuln",W.vuln)}if(W.mweak){const al=B.alive();if(al.length)B.apply(pick(al),"weak",W.mweak)}if(W.eggturn)B.layEgg({t:1,d:W.eggturn,b:0,nw:1})};p.retain=0;
 banner("你的回合");sfx("turn");
 if(B.wxShift&&B.turn===B.wxShift.turn){weatherShift();await sleep(600);if(!B||B.over)return}
 if(p.mud>0){dmgPlayer(p.mud*(B.wx==="rain"?2:1),null,true);p.mud--;sfx("mud");if(S.hp<=0)return lose()}
 if(p.burn>0){const bd=p.burn*(B.wx==="rain"?1:1);dmgPlayer(bd,null,true);toast(`烫伤发作，受到 <b>${bd}</b> 伤害`);p.burn--;sfx("hit");if(S.hp<=0)return lose()}
 p.energy=Math.min(EN_MAX,3+(B.turn===1?perk("en")+(has("mr_glove")?1:0):0)+(p.nextEnergy||0)+(p.pw.galaxy||0)+(B.turn===1&&has("lantern")?1:0)+(B.turn===1&&has("warhorn")?1:0)+(has("moon")&&B.turn%3===0?1:0));if(B.turn%3===0&&has("moon"))relicPulse("moon");
 let n=5+(B.turn===1?perk("dr"):0)-p.drawMinus+(p.nextDraw||0)+(p.pw.galaxy||0)+(B.turn===1&&has("sand")?2:0)+(B.turn===1&&S.hero==="kungfu"?2:0)+((p.pw2||{}).draw||0)+(B.turn===1&&has("littlecrown")?2:0);p.drawMinus=0;p.nextEnergy=0;p.nextDraw=0;if(p.warm>0){p.energy+=p.warm;toast(`椅子的余温：多 <b>${p.warm}</b> 点奶力`)}if(p.rest>=3){p.rest=0;p.energy=0;banner("你睡着了",1);toast("安息满 3 层：你昏睡了一回合，没有奶力")}
 if(p.nextBlock){B.block(p.nextBlock,1);p.nextBlock=0}
 if(p.pw.rooster)B.block(p.pw.rooster,1);
 if(B.wx==="storm"){const al=[null,...B.alive()],t=pick(al);setTimeout(()=>{if(!B||B.over)return;lightning();if(t){dealEnemy(t,5);renderBattle();if(!B.alive().length)win()}else{dmgPlayer(5,null,true);if(S.hp<=0)lose()}},700)}
 if(p.pw.nine&&S.hp<S.max)B.heal(p.pw.nine);
 if(p.pw.stampede){const v=p.pw.stampede;setTimeout(()=>{B.alive().forEach(e=>B.hit(e,v,1,1));afterAction()},500)}
 if(B.dogPack>0){B.dogPack--;setTimeout(()=>{if(!B||B.over)return;toast("奶狗群冲了上来！");say($("#player .body"),"汪汪汪！","hero");B.alive().forEach(e=>B.hit(e,8,1,1));sfx("bighit");afterAction()},800)}
 if(B.turn===1&&has("pup")){const t=pick(B.alive());if(t){relicPulse("pup");setTimeout(()=>{if(!B||B.over)return;B.hit(t,6,1,1);afterAction()},600)}}
 await sleep(350);if(!B||B.over)return;B.draw(n);{const fa=B.alive().find(x=>x.id==="fallen");if(fa&&B.turn%2===0&&B.hand.length){const c=pick(B.hand);c.netted=B.turn;const el=enEl(fa);if(el)say(el.querySelector(".body"),pick(["抓到了！抓到了！嘻嘻嘻！","别动，这张归我了！","网住喽！再挣扎呀！"]));toast(`${fa.n}用网缠住了你的「${cname(c)}」，这回合打不出去`);renderHand()}}
 if(p.pw.stallion)p.horseFree=1;
 if(p.pw.dawn)B.alive().forEach(e=>B.apply(e,"weak",1));
 if(has("belltoken")&&B.turn%3===0){relicPulse("belltoken");B.alive().forEach(e=>B.apply(e,"weak",2))}
 if(p.pw.owl)B.draw(p.pw.owl);
 if(B.wx==="wind"&&B.pool.length>1){await sleep(300);if(!B||B.over)return;toast("一阵大风把池子吹乱了！");B.poolShuffle()}
 busy=false;renderBattle();$("#endBtn").classList.remove("wait")}
function lightning(){const d=document.createElement("div");d.className="flash";$("#fx").appendChild(d);setTimeout(()=>d.remove(),600);sfx("bighit");stageShake()}
function banner(t,en){const b=$("#turnBan");b.innerHTML=`<span>${t}</span>`;b.className="";void b.offsetWidth;b.className="on"+(en?" en":"")}
function hint(t){const h=$("#hint");if(t){h.textContent=t;h.classList.add("on")}else h.classList.remove("on")}

/* ---- 战斗渲染 ---- */
function intentHTML(e){const I=e.intent;if(!I||e.hp<=0)return"";const ph=I.pool?`<span class="pIc">${{junk:ICON.mud,freeze:WXICON.snow,suck:ICON.grab,shuffle:WXICON.wind,eat:ICON.boom,boil:WXICON.storm}[I.pool.t]}</span>`:"";return intentHTML0(e,I).replace(/<\/div>$/,ph+"</div>")}
function intentHTML0(e,I){const dmg=v=>{if(B.wx==="fog"||e.fogged)return"?";let d=v+e.str;if(e.weak>0)d*=.75;d*=DF().dmg*bossHard(e);if(B.p.vuln>0)d*=1.5;return Math.max(0,Math.floor(d))};
 const ic=k=>ICON[k],x=I.x?`<small>×${I.x}</small>`:"";
 switch(I.k){case"stun":return`<div class="intent">${ic("swirl")}<small>晕了</small></div>`;case"charge":return`<div class="intent chg">${ic("up")}<small>蓄力！</small></div>`;case"atk":return`<div class="intent atk ${I.ult?"ult":""}${I.pierce?" prc":""}">${ic("sword")}${dmg(I.v)}${x}${I.s?ic("swirl"):""}${I.ult?`<small class="ultN">${I.ult}</small>`:I.pierce?`<small class="ultN">破防</small>`:""}</div>`;
 case"def":return`<div class="intent">${ic("shield")}${I.v}${I.s2?ic("up"):""}</div>`;
 case"buff":return`<div class="intent">${ic("up")}<small>蓄力</small></div>`;
 case"debuff":return`<div class="intent">${ic("swirl")}<small>${STAT[I.s].n}</small></div>`;
 case"add":return`<div class="intent">${ic("mud")}<small>扔泥巴</small></div>`;
 case"atkdef":return`<div class="intent atk">${ic("sword")}${dmg(I.v)}${ic("shield")}</div>`;
 case"steal":return`<div class="intent atk">${ic("grab")}${dmg(I.v)}<small>偷钱</small></div>`;
 case"flee":return`<div class="intent">${ic("wind")}<small>想跑</small></div>`;
 case"wait":return`<div class="intent">${ic("heart")}<small>喝奶茶中</small></div>`;case"call":return`<div class="intent">${ic("up")}<small>倒茶</small></div>`;
 case"atkcnt":return`<div class="intent atk">${ic("sword")}${dmg(I.v)}${ic("bomb")}${I.c}</div>`;
 case"boom":return`<div class="intent boom">${ic("boom")}${dmg(I.v)}<small>自爆</small></div>`}return""}
function intentTip(e){const I=e.intent||{};const E=ENEMY[e.id];const extra=(I.pool?" "+{junk:"，还会往你的池子丢泥巴",freeze:"，还会冻住你池里的奶蛙",suck:"，还会吸走你池里的奶蛙",shuffle:"，还会搅乱你的池子",eat:"，还会一口吞掉你整个池子",boil:"，还会把你池里的奶蛙煮成泥巴"}[I.pool.t]:"")+(E.pd?"<br>特性："+E.pd:"")+(E.boss&&BOSS_LORE[e.id]?`<br><b>${BOSS_LORE[e.id].t}</b>：${BOSS_LORE[e.id].td}`:"");return intentTip0(I)+extra+(e.af?`<br>词缀：<b>${AFFIX[e.af].n}</b>${AFFIX[e.af].d}`:"")}
function intentTip0(I){const m={wait:"在喝奶茶，这回合不会攻击",stun:"晕过去了，这回合不会行动",charge:"正在蓄力！下回合会放出大招，提前准备好护盾",call:"准备倒出一只新的奶茶杯（场上最多 4 个敌人）",atk:"准备攻击",def:"准备防御",buff:"准备变强",debuff:"准备给你上负面状态",add:"准备往你的弃牌堆扔泥巴块",atkdef:"攻击并防御",steal:"攻击并偷走金币",flee:"准备带着金币逃跑",atkcnt:"攻击，倒计时结束会自爆",boom:"要自爆了！"};return m[I.k]||""}
const STMAX={str:8,dex:8,thorn:8,inj:10,poison:8,evade:4,mana:15};
const EN_MAX=999,HAND_MAX=10;
const STGL={inj:"内",brk:"破",frost:"冻",para:"麻",wet:"湿",poison:"毒",night:"魇",evade:"避",curse:"咒",brittle:"脆",str:"力",dex:"敏",vuln:"易",weak:"弱",mud:"泥",mana:"魔",thorn:"荆",burn:"烫",bleed:"血",dodge:"闪",warm:"暖",rest:"眠",mirror:"仿"};
const STBAD={inj:1,brk:1,frost:1,para:1,wet:1,poison:1,night:1,curse:1,brittle:1,vuln:1,weak:1,mud:1,burn:1,bleed:1,warm:1,rest:1,mirror:1};
document.addEventListener("click",ev=>{const st=ev.target.closest&&ev.target.closest(".st[data-st]");if(!st)return;const k=st.dataset.st,D=STAT[k];if(!D)return;ev.stopPropagation();const own=st.closest("#player")?"你":"它";tipAt(st,`<b style="color:${D.c}">${D.n} ${st.dataset.v}${st.classList.contains("tmp")?"（本回合）":""}</b><p>${D.d}</p><p style="opacity:.7">${STBAD[k]?own+"身上的减益":own+"身上的增益"}</p>`)},true);
function stsList(o,own){const ks=["str","tstr","dex",...Object.keys(STAT).filter(k=>!["str","dex"].includes(k))];const rows=[];const seen={};ks.forEach(k=>{if(seen[k])return;seen[k]=1;const v=o[k];if(!v||typeof v!=="number")return;const D=STAT[k==="tstr"?"str":k];if(!D)return;rows.push(`<p><b style="color:${D.c}">${D.n}${k==="tstr"?"（本回合）":""} ${v}</b>　${D.d}</p>`)});Object.entries(o.powL||{}).forEach(([id,n])=>{const C=CARDS[id];if(!C)return;let d="";try{d=C.d(0)}catch(e){}rows.push(`<p><b style="color:#c8901e">能力 · ${C.n}${n>1?" ×"+n:""}</b>　${d}</p>`)});return rows.length?rows.join(""):`<p style="opacity:.7">${own}身上现在没有任何状态</p>`}
document.addEventListener("click",ev=>{const st=ev.target.closest&&ev.target.closest(".st.pwc");if(!st)return;ev.stopPropagation();const C=CARDS[st.dataset.pw];if(!C)return;let d="";try{d=C.d(0)}catch(e){}tipAt(st,`<b style="color:#c8901e">能力 · ${C.n}</b><p>${d}</p><p style="opacity:.7">这场战斗一直有效</p>`)},true);
function stsHTML(o){const a=[];if(o.str)a.push(["str",o.str]);if(o.tstr)a.push(["str",o.tstr,"本回合"]);if(o.dex)a.push(["dex",o.dex]);["mana","vuln","weak","mud","burn","bleed","poison","inj","brk","frost","para","wet","night","curse","dodge","evade","brittle","warm","rest","thorn","mirror"].forEach(k=>o[k]&&a.push([k,o[k]]));
 return a.map(([k,v,x])=>`<span class="st ${STBAD[k]?"bad":"good"}${x?" tmp":""}${v>=(k==="mana"?(S.mmax||15):(STMAX[k]||999))?" full":""}" data-st="${k}" data-v="${v}" style="--sc:${STAT[k].c}"><i>${STGL[k]||STAT[k].n[0]}</i><b>${v}</b></span>`).join("")+(o.powL?Object.entries(o.powL).map(([id,n])=>CARDS[id]?`<span class="st pwc" data-pw="${id}" style="--sc:#c8901e"><i>能</i><b>${CARDS[id].n}${n>1?"×"+n:""}</b></span>`:"").join(""):"")+(o.pw?Object.keys(o.pw).filter(k=>!(o.powL||{})[k]).map(k=>`<span class="st" style="--sc:#c8901e">${{calm:"定心",way:"修行之道",zone:"心流",noself:"三连只需2",reso:"蛙鸣共振",stallion:"千里马",dawn:"金鸡报晓",rebirth:"凤凰涅槃",owl:"夜猫子",momentum:"一鼓作气",ninering:"九连环",rhythm:"节奏感",stampede:"万马奔腾",iron:"铁公鸡",nine:"九命",galaxy:"银河猫"}[k]||""}</span>`).filter(x=>!x.includes("\"></span>")&&!x.endsWith(">"+"</span>")).join(""):"")}
let PREV=null;
const NOOP=["block","draw","apply","heal","poolAdd","poolInsert","poolResolve","poolOverflow","poolShuffle","poolPop","poolClear","gainEnergy","addMana","gainGold","discardHand","addRandomRare","shake","fxBuff"];
function previewCard(c){if(!B||!c)return null;const D=CARDS[c.id];if(!D||D.type!=="atk")return null;const save={p:B.p,hand:B.hand,pool:B.pool,dp:B.dp,disc:B.disc,curFam:B.curFam,curType:B.curType,bonus:B.bonus,shinyPow:B.shinyPow,curSpell:B.curSpell,catchLeft:B.catchLeft,after:B.after,gold:S.gold,hp:S.hp,mana:B.p.mana};
 const ov={};NOOP.forEach(k=>{if(B[k]){ov[k]=B[k];B[k]=function(){}}});const sfxS=window.sfx;const spFx=window.spellFx;
 const r={d:{},blk:{}};let reps=1;try{reps=(willTri(c)?2:1)+(c.g?1:0)}catch(e){}
 const enState=B.enemies.map(e=>({...e}));
 try{PREV=r;B.p={...B.p};B.hand=[...B.hand];B.pool=B.pool.map(x=>({...x}));B.after=[];B.curFam=D.fam;B.curType=D.type;B.curSpell=D.spell||null;B.shinyPow=c.sh==="pow"?4:0;B.bonus=(B.p.nextAtk||0)+(S.hero==="knight"&&!B.knAtk?Math.min(10,Math.floor(B.p.block/4)):0);window.sfx=()=>{};window.spellFx=()=>{};
  const t=D.tgt?(B.sel&&B.sel.t)||null:null;const tgts=D.tgt?B.alive():[null];const res={};
  for(const tg of tgts){r.d={};r.blk={};for(let k=0;k<reps;k++)D.fx(B,(c.u|0),tg,c,B.p.energy);if(D.tgt)res[tg.k]=r.d[tg.k]||0;else Object.assign(res,r.d)}
  return {res,rand:/随机/.test(D.d((c.u|0))),tgt:!!D.tgt}}
 catch(e){return null}
 finally{PREV=null;Object.assign(B,{p:save.p,hand:save.hand,pool:save.pool,after:save.after,curFam:save.curFam,curType:save.curType,bonus:save.bonus,shinyPow:save.shinyPow,curSpell:save.curSpell,catchLeft:save.catchLeft});B.p.mana=save.mana;for(const k in ov)B[k]=ov[k];window.sfx=sfxS;window.spellFx=spFx;S.gold=save.gold;S.hp=save.hp;B.enemies.forEach((e,i)=>{const o=enState[i];if(o)Object.keys(o).forEach(k=>{e[k]=o[k]})})}}
function showPreview(){if(!B)return;$$("#enemies .pv").forEach(x=>x.remove());$$("#enemies .en").forEach(x=>x.classList.remove("killable"));
 const c=B.sel&&B.sel.k!=null?B.hand.find(x=>x.k===B.sel.k):null;if(!c||!B.myTurn)return;const P=previewCard(c);if(!P)return;
 B.enemies.forEach(e=>{if(e.hp<=0||e.fled)return;const d=P.res[e.k];if(!d)return;const el=enEl(e);if(!el)return;const hw=el.querySelector(".hpw");if(!hw)return;const kill=d>=e.hp;
  if(kill)el.classList.add("killable")})}
/* 血条：原地更新，白色残影慢慢追上，扣血时抖一下 */
function setHp(w,hp,max,blk){const bar=w.querySelector(".hpbar");if(!bar){w.innerHTML=hpHTML(hp,max,blk);w._hp=hp;return}
 const pct=Math.max(0,hp/max*100)+"%",prev=w._hp==null?hp:w._hp;w._hp=hp;
 const i=bar.querySelector("i"),u=bar.querySelector("u"),sp=bar.querySelector("span");i.style.width=pct;
 if(hp<prev){clearTimeout(w._ut);w._ut=setTimeout(()=>{u.style.width=pct},520);bar.classList.remove("hpHit");void bar.offsetWidth;bar.classList.add("hpHit");
  const lost=prev-hp,ch=document.createElement("b");ch.className="hpChunk";ch.textContent="-"+lost;w.appendChild(ch);setTimeout(()=>ch.remove(),700)}else u.style.width=pct;
 if(sp)sp.textContent=hp+"/"+max;bar.classList.toggle("blk",!!blk);bar.classList.toggle("low",hp>0&&hp<=max*.25);
 const bb=w.querySelector(".blkB");if(bb){bb.classList.toggle("on",!!blk);const bv=bb.querySelector("b");if(bv&&bv.textContent!==String(blk||"")){bv.textContent=blk||"";bb.classList.remove("bump");void bb.offsetWidth;bb.classList.add("bump")}}}
function hpHTML(hp,max,blk){return`<div class="blkB ${blk?"on":""}">${ICON.shield}<b>${blk||""}</b></div><div class="hpbar ${blk?"blk":""}"><u style="width:${hp/max*100}%"></u><i style="width:${hp/max*100}%"></i><span>${hp}/${max}</span></div>`}
/* 死掉的敌人动画放完后从队伍里收起，其余的平滑挪位；防止挤出屏幕看不见 */
function enGone(el){if(!el||!el.isConnected||!(el.classList.contains("dead")||el.classList.contains("fled")||el.classList.contains("caught")))return;const sib=[...el.parentNode.children].filter(c=>c!==el&&!c.classList.contains("gone"));const r0=sib.map(c=>{try{return rectIn(c)}catch(x){return null}});el.classList.add("gone");sib.forEach((c,i)=>{const a=r0[i];if(!a)return;const b=rectIn(c);const dx=a.x-b.x;if(Math.abs(dx)>3)try{c.animate([{transform:`translateX(${dx}px)`},{transform:"none"}],{duration:380,easing:"cubic-bezier(.2,.8,.3,1)"})}catch(x){}})}
function enSize(e){const E=ENEMY[e.id];const big=e.big?1.3:e.small?.72:(!E.boss&&/^小|小奶蛙|小猫|小泥/.test(E.n))?.88:1;if(E.boss)return Math.round(E.h*big*(e.guard?Math.min(1.2,320/E.h):Math.min(1.5,398/E.h)));const h=E.elite?Math.min(280,Math.max(210,E.h*1.12)):Math.min(235,Math.max(170,E.h*1.45));return Math.round(h*big)}
function renderBattle(first){if(!B)return;const p=B.p;if(S&&S.dummy)try{dummyHud()}catch(e){}try{if(!PREV)renderBag()}catch(e){}
 const pl=$("#player");if(first||!pl.firstChild)pl.innerHTML=`<div class="body"><i class="plat"></i><img src="${IMG(HI())}"></div><div class="hpw"></div><div class="sts"></div>`;
 setTimeout(stScan,50);pl.className="fighter"+(B.rageOn?" rageOn":"")+(B.vForm?" vform":"");if(S.hero==="mage"){const cap=S.mmax||15;if((p.mana||0)>cap)p.mana=cap;let mb=pl.querySelector(".manaW");if(!mb){mb=document.createElement("div");mb.className="manaW";mb.innerHTML="<i></i><span></span>";const hw=pl.querySelector(".hpw");if(hw)hw.after(mb)}mb.querySelector("i").style.width=Math.min(100,(p.mana||0)/cap*100)+"%";mb.querySelector("span").textContent=`魔力 ${p.mana||0}/${cap}`}rageUI();setHp(pl.querySelector(".hpw"),S.hp,S.max,p.block);pl.querySelector(".sts").innerHTML=stsHTML(p);
 B.enemies.forEach(x=>{if(x.fake&&x.real){if(x.real.hp<=0){x.hp=0;x.fled=1}else if(x.hp>0){x.hp=x.real.hp;x.max=x.real.max;x.block=x.real.block}}});const en=$("#enemies");if(first)en.innerHTML="";const flip0={};if(!first)[...en.children].forEach(c=>{if(c.dataset.k)try{flip0[c.dataset.k]=rectIn(c)}catch(x){}});{const al=B.enemies.filter(e=>e.hp>0&&!e.fled);en.classList.toggle("crowd",al.length>=3||(al.length>=2&&al.some(e=>ENEMY[e.id].boss)));en.classList.toggle("crowd4",al.length>=4)}
 B.enemies.forEach(e=>{let el=en.querySelector(`[data-k="${e.k}"]`);const E=ENEMY[e.id];
  if(!el){el=document.createElement("div");el.className="en fighter"+(E.boss?" bossEn"+(e.guard?" guardEn":" finalEn"):"");el.dataset.k=e.k;el.style.position="relative";el.innerHTML=`<div class="itw"></div><div class="body"><i class="plat ${E.boss||E.elite?"stone":""}"></i><img src="${IMG(E.img)}" style="width:${enSize(e)}px;height:${enSize(e)}px${E.flip?";transform:scaleX(-1)":""}"></div><div class="hpw"></div><div class="ename">${e.n}</div>${E.boss&&BOSS_LORE[e.id]?`<div class="btrait">${BOSS_LORE[e.id].t}</div>`:""}<div class="sts"></div>`;{const idx=B.enemies.indexOf(e);en.insertBefore(el,en.children[idx]||null)}
   el.onclick=()=>clickEnemy(e);const cb=document.createElement("button");cb.className="catchBtn";cb.setAttribute("aria-label","抓");cb.innerHTML=`<img src="${NET_IMG}" alt="">`;cb.onclick=ev=>{ev.stopPropagation();catchEnemy(e)};el.querySelector(".body").appendChild(cb)}
  el.classList.toggle("canCatch",canCatch(e));try{catchUI()}catch(x){}el.classList.toggle("hasAf",!!e.af);el.classList.toggle("corrupt",!!e.corrupt);el.classList.toggle("dreamy",!!e.dreamy);el.classList.toggle("goldf",e.id==="goldfrog");
  if(e.hp<=0&&!el.classList.contains("dead")&&!el.classList.contains("fled")){el.classList.add(e.fled?"fled":"dead");setTimeout(()=>enGone(el),760)}
  else if(e.hp>0&&!e.fled&&!e.caught&&(el.classList.contains("dead")||el.classList.contains("fled")||el.classList.contains("gone")||el.classList.contains("caught"))){el.classList.remove("dead","fled","gone","caught");el.style.display=""}
  {const nm=el.querySelector(".ename");if(nm&&nm.textContent!==e.n)nm.textContent=e.n}el.querySelector(".itw").innerHTML=intentHTML(e);setHp(el.querySelector(".hpw"),e.hp,e.max,e.block);el.classList.toggle("taunt",isTaunt(e));el.querySelector(".sts").innerHTML=(isTaunt(e)?`<span class="eCnt tauntT">嘲讽</span>`:"")+stsHTML(e)+(e.id==="cosmicegg"?`<span class="eCnt">孵化 ${e.cnt==null?6:e.cnt}</span>`:"")+(e.id==="boilerdragon"?`<span class="eCnt">热度 ${e.heat||0}/3</span>`:"")+(e.fogged?`<span class="eCnt">雾中</span>`:"")+(e.id==="rockfrog"?`<span class="eCnt">岩甲 ${e.armor==null?6:e.armor}</span>`:"")+(e.id==="bishop"?(e.pile?`<span class="eCnt">复活倒数 ${e.pile}</span>`:`<span class="eCnt">骨甲 ${e.bone==null?6:e.bone}</span>`):"")+(e.form2&&FORM2[e.id]?`<span class="eCnt f2t">${FORM2[e.id].n}</span>`:"")+(e.id==="iceking"?`<span class="eCnt">蜡烛 ${e.candles==null?3:e.candles}</span>`:"")+(BM[e.id]&&BM[e.id].chip&&e.hp>0&&BM[e.id].chip(e)?`<span class="eCnt bmC">${BM[e.id].chip(e)}</span>`:"")+(e.brkNeed&&e.intent&&e.intent.ult?`<span class="eCnt brkC">打断 ${Math.min(e.brkGot||0,e.brkNeed)}/${e.brkNeed}</span>`:"")+(e.id==="general"?`<span class="eCnt">纹路 ${e.marks||0}/5</span>`:"")+(e.id==="fallen"&&e.stole?`<span class="eCnt">笼子：${cname(e.stole)}</span>`:"")+(e.id==="fourhead"?`<span class="eCnt">醒着 ${Math.max(1,Math.ceil(e.hp/e.max*4))} 个头</span>`:"");
  el.classList.toggle("tg",!!B.sel&&e.hp>0&&(B.sel.pot!=null||CARDS[(B.hand.find(c=>c.k===B.sel.k)||{id:"strike"}).id].tgt))});
 {[...en.children].forEach(c=>{const r0=flip0[c.dataset.k];if(!r0||c.classList.contains("dead")||c.classList.contains("fled")||c.classList.contains("caught"))return;const r1=rectIn(c);const dx=r0.x-r1.x,dy=r0.y-r1.y;if(Math.abs(dx)>3||Math.abs(dy)>3){try{c.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:"translate(0,0)"}],{duration:420,easing:"cubic-bezier(.2,.8,.3,1)"})}catch(x){}}})}
 const eb=$("#energy");eb.innerHTML=`<i class="liq" style="height:${Math.min(1,p.energy/3)*100}%"></i><b>${p.energy}<small>/3</small></b>`;
 $("#drawPile b").textContent=B.dp.length;$("#discPile b").textContent=B.disc.length;$("#exhPile b").textContent=B.exh.length;$("#exhPile").style.display=B.exh.length?"":"none";
 renderFam();renderHand();
 const playable=B.hand.some(c=>{const v=curCost(c);return v>=0&&v<=p.energy&&CARDS[c.id].cost!==-2});$("#endBtn").classList.toggle("nudge",B.myTurn&&!playable);try{showPreview()}catch(e){}}
function renderFam(){renderPool();renderSky()}
function renderFamOld(){const need=B.p.pw.noself?2:3;const h=["frog","horse","chick","cat"].filter(f=>B.fam[f]||B.hand.some(c=>CARDS[c.id].fam===f)).map(f=>{const n=B.fam[f]||0;return`<span style="--fc:${FAM[f].c}" class="${n===need-1?"hot":""}">${FAM[f].n}<i>${[...Array(need)].map((_,i)=>`<u class="${i<n?"on":""}"></u>`).join("")}</i></span>`}).join("");$("#famBar").innerHTML=h}
function willTri(c){const D=CARDS[c.id];if(D.spell&&D.fam==="none"){const save=B.pool.map(x=>({...x}));B.poolInsert("magic");const r=findRun(B.pool,B.poolNeed());B.pool=save;return!!r&&r.f==="magic"}if(D.fam==="none"||D.cost===-2||D.type==="cur"||D.type==="sts")return false;const save=B.pool.map(x=>({...x}));B.poolInsert(D.fam);const r=findRun(B.pool,B.poolNeed());B.pool=save;return!!r&&r.f===D.fam}
const TOKEN={kungfu:"n1",knight:"kn",frog:"i5",horse:"hr",chick:"ck",cat:"ct",pal:"dg",mud:"pp",any:"hrr",magic:"mg",blood:"v_vamp",snake:"sn"};
function poolRules(){const o=document.getElementById("poolRuleBox");if(o){o.remove();return}const T=TRAIN_BASE.find(x=>x.t==="奶蛙池的规则");if(!T)return;const d=document.createElement("div");d.id="poolRuleBox";d.innerHTML=`<h4>奶蛙池的规则</h4><div class="prDemo"><div class="prSl"></div><b class="prCap"></b></div>${T.l.map(x=>`<p>${x}</p>`).join("")}<button class="btn sm">知道了</button>`;d.onclick=()=>d.remove();($("#battle")||document.body).appendChild(d);poolDemo(d)}
function poolDemo(box){const sl=box.querySelector(".prSl"),cap=box.querySelector(".prCap");const W=56;const im={a:IMG(TOKEN.frog),b:IMG(TOKEN.horse)},fc={a:FAM.frog.c,b:FAM.horse.c};let toks={};
 const mkT=(id,f,i,fly)=>{const t=document.createElement("span");t.className="tok old";t.style.cssText=`position:absolute;top:0;left:${(fly?7:i)*W}px;--fc:${fc[f]};transition:left .45s cubic-bezier(.3,1.3,.5,1),transform .35s,opacity .35s`;t.innerHTML=`<img src="${im[f]}">`;sl.appendChild(t);toks[id]={el:t,f};return t};
 const place=order=>order.forEach((id,i)=>{toks[id].el.style.left=i*W+"px"});
 const pop=ids=>ids.forEach(id=>{const e=toks[id].el;e.style.transform="scale(1.4)";e.style.filter="brightness(1.8)";setTimeout(()=>{e.style.transform="scale(.1)";e.style.opacity="0"},180);delete toks[id]});
 const steps=[
  [()=>{sl.innerHTML="";toks={};["a1","a2","b1","b2","a3"].forEach((id,i)=>mkT(id,id[0],i))},"池子里现在是：奶蛙 奶蛙 奶马 奶马 奶蛙",1700],
  [()=>{mkT("b3","b",0,1);setTimeout(()=>place(["a1","a2","b1","b2","b3","a3"]),40)},"出一张奶马牌：新奶马挨着同家族站",1500],
  [()=>{["b1","b2","b3"].forEach(id=>toks[id].el.classList.add("hot"))},"3 只奶马挨在一起……",900],
  [()=>pop(["b1","b2","b3"]),"消掉！",700],
  [()=>place(["a1","a2","a3"]),"两边往中间靠拢",1100],
  [()=>{["a1","a2","a3"].forEach(id=>toks[id].el.classList.add("hot"))},"靠拢后 3 只奶蛙挨在一起了……",900],
  [()=>pop(["a1","a2","a3"]),"接着消！这就是连锁",1600]];
 let i=0;const go=()=>{if(!box.isConnected)return;const [f,t,ms]=steps[i];f();cap.textContent=t;i=(i+1)%steps.length;setTimeout(go,ms)};go()}
let POOLK=0;const POOLA={pos:{},img:{},raf:0};
function poolAnim(){if(POOLA.b!==B){POOLA.b=B;POOLA.pos={};POOLA.img={}}const el=$("#pool");const sl=el&&el.querySelector(".slots");if(!sl)return;const base=POOLA.pos,bimg=POOLA.img;const now={},nimg={};
 const ts=[...sl.querySelectorAll(".tok[data-k]")];ts.forEach(t=>{const k=t.dataset.k;now[k]=t.offsetLeft;nimg[k]=t.innerHTML});const mv=ts.filter(t=>base[t.dataset.k]!=null&&base[t.dataset.k]!==now[t.dataset.k]);mv.forEach(t=>{t.style.transition="none";t.style.transform=`translateX(${base[t.dataset.k]-now[t.dataset.k]}px)`});if(mv.length){void sl.offsetWidth;mv.forEach(t=>{t.style.transition="transform .32s cubic-bezier(.3,1.3,.5,1)";t.style.transform=""})}
 Object.keys(base).forEach(k=>{if(now[k]!=null)return;const g=document.createElement("span");g.className="tok popOut";g.style.left=base[k]+"px";g.innerHTML=bimg[k]||"";sl.appendChild(g);setTimeout(()=>g.remove(),420)});
 POOLA.pos=now;POOLA.img=nimg}
function renderPool(){if(PREV)return;if(POOLA.b!==B){POOLA.b=B;POOLA.pos={};POOLA.img={}}if(B&&B.pool){if(B.pool.filter(x=>x.f==="mud").length>=5)ach("mudbath");if(B.pool.filter(x=>x.ice).length>=4)ach("frozen4")}const el=$("#pool");if(!B){el.innerHTML="";return}const need=B.poolNeed(),P=B.pool;const hot=new Set();
 for(let i=0;i<P.length;){let j=i;while(j<P.length&&P[j].f===P[i].f&&!P[j].ice)j++;if(j===i){i++;continue}if(j-i===need-1&&P[i].f!=="mud")for(let k=i;k<j;k++)hot.add(k);i=j}
 let h=`<b class="plbl" onclick="poolRules()">奶蛙池<small>${P.length}/${B.poolCap}</small><u class="pq">?</u></b><div class="slots">`;
 for(let i=0;i<B.poolCap;i++){const t=P[i];h+=t?`<span data-k="${t.k||(t.k=++POOLK)}" class="tok ${POOLA.pos[t.k]!=null?"old":""} ${hot.has(i)?"hot":""} ${t.f==="mud"?"mudt":""} ${t.f==="any"?"anyt":""} ${t.ice?"ice":""}" style="--fc:${(FAM[t.f]||{c:"#fff"}).c}"><img src="${IMG(TOKEN[t.f])}">${t.ice?`<i>${t.ice}</i>`:""}</span>`:`<span class="tok empty ${i>=B.poolCap-1&&P.length>=B.poolCap-1?"warn":""}"></span>`}
 const hotF=[...new Set([...hot].map(i=>P[i].f))].filter(f=>f!=="mud");el.innerHTML=h+`</div><span class="prule">相邻凑齐 ${need} 只消除 · 点「奶蛙池」看规则</span>${hotF.length?`<span class="phot">再来 1 只${hotF.map(f=>(FAM[f]||{}).n||"").join("/")}就消除！</span>`:""}`;el.classList.toggle("danger",P.length>=B.poolCap-1);if(!POOLA.q){POOLA.q=1;requestAnimationFrame(()=>{POOLA.q=0;try{poolAnim()}catch(e){}})}}
function renderSky(){if(!B)return;$("#skyBar").innerHTML=`<button class="skyPill" data-k="m">${moonSVG(B.moon)}<span>${MOON[B.moon].n}</span></button><button class="skyPill" data-k="w">${WXICON[B.wx]}<span>${WX[B.wx].n}</span></button>`;
 $$("#skyBar .skyPill").forEach(b=>b.onclick=ev=>{ev.stopPropagation();const m=b.dataset.k==="m";tipAt(b,m?`<b>${MOON[B.moon].n}</b><p>${MOON[B.moon].d}</p>`:`<b>${WX[B.wx].n}</b><p>${WX[B.wx].d}</p>`)});
 const w=$("#wxfx");w.className="wx-"+B.wx}
function layoutHand(){const cards=$$("#hand .card");const n=cards.length;if(!n)return;const W=150,span=Math.min(760,n*124),step=n>1?Math.min(124,(span-W)/(n-1)+0):0,x0=640-((n-1)*step)/2-W/2;
 $("#battle").classList.toggle("aim",!!B.sel);
 cards.forEach((el,i)=>{const mid=(n-1)/2,off=i-mid;const sel=B.sel&&el.dataset.k==B.sel.k;const rot=sel?0:off*3.2,y=sel?-96:Math.abs(off)*off*0+Math.pow(Math.abs(off),1.6)*5-6,sc=sel?1.25:1;
  el.style.zIndex=sel?40:10+i;el.style.transform=`translate(${x0+i*step}px,${y-14}px) rotate(${rot}deg) scale(${sc})`})}
function renderHand(){if(PREV)return;if(B&&B.hand&&B.hand.length>HAND_MAX){const ex=B.hand.splice(HAND_MAX);B.disc.push(...ex);toast(`手牌最多 <b>${HAND_MAX}</b> 张，多出来的 ${ex.length} 张放进了弃牌堆`)}const h=$("#hand");const keys=B.hand.map(c=>String(c.k));
 [...h.children].forEach(el=>{if(!keys.includes(el.dataset.k)&&!el.classList.contains("fly"))el.remove()});
 B.hand.forEach((c,i)=>{let el=h.querySelector(`.card[data-k="${c.k}"]`);const html=cardHTML(c,"inhand");
  if(!el){const t=document.createElement("div");t.innerHTML=html;el=t.firstChild;el.style.transform="translate(40px,80px) scale(.4) rotate(-20deg)";el.style.opacity="0";h.appendChild(el);void el.offsetWidth;el.style.opacity="";
   el.onclick=ev=>{ev.stopPropagation();clickCard(c.k)};el.oncontextmenu=e=>e.preventDefault()}
  else{const t=document.createElement("div");t.innerHTML=html;el.querySelector(".cost").outerHTML=t.firstChild.querySelector(".cost").outerHTML;el.querySelector(".ds").innerHTML=t.firstChild.querySelector(".ds").innerHTML}
  const v=curCost(c),D=CARDS[c.id];el.classList.toggle("na",!B.myTurn||D.cost===-2||(D.cost>=0&&v>B.p.energy));el.classList.toggle("willtri",B.myTurn&&willTri(c)&&!(D.cost>=0&&v>B.p.energy));el.classList.toggle("sel",!!B.sel&&B.sel.k===c.k);el.classList.toggle("netted",c.netted===B.turn);el.querySelector(".dmgB")?.remove();h.appendChild(el)});
 layoutHand()}
function fitEnemies(force){const en=$("#enemies");if(!en)return;const sig=[...en.children].map(c=>c.dataset.k+(c.classList.contains("dead")?"d":"")).join(",")+"|"+(B&&B.alive().length);if(!force&&en._fitSig===sig)return;en._fitSig=sig;setTimeout(()=>{if(en._fitSig===sig)fitEnemies2(en)},120);fitEnemies2(en)}
function fitEnemies2(en){const ch=[...en.children].filter(c=>c.offsetWidth&&getComputedStyle(c).position!=="absolute");if(!ch.length){en.style.transform="";return}const gap=parseFloat(getComputedStyle(en).columnGap)||0;const w=ch.reduce((a,c)=>a+c.offsetWidth,0)+gap*(ch.length-1);const s=Math.min(1,(en.clientWidth-10)/w);en.style.transformOrigin="50% 100%";en.style.transform=s<.995?`scale(${s.toFixed(3)})`:""}
{const _rb=renderBattle;renderBattle=function(...a){const r=_rb.apply(this,a);try{fitEnemies()}catch(e){}return r}}
function clickCard(k){if(busy||!B.myTurn||B.over)return;const c=B.hand.find(x=>x.k===k);if(!c)return;const D=CARDS[c.id];
 if(D.cost===-2){toast(D.type==="cur"?"诅咒牌不能打出":"这张牌不能打出");return}
 const v=curCost(c);if(D.cost>=0&&v>B.p.energy){toast("奶力不够");shakeEl($("#energy"));return}
 if(B.sel&&B.sel.k===k){ // 再点一次
  if(!D.tgt){playCard(c)}else{const al=B.alive();if(al.length)playCard(c,al.find(x=>ENEMY[x.id].boss)||al[0])}return}
 B.sel={k};sfx("click");const kw=kwText(c);hint((D.tgt?(B.alive().length===1?"再点一次这张牌，或点敌人":"点一个敌人；再点一次这张牌直接打首领/最前面的敌人"):"再点一次打出，或点场上任意位置")+(kw?"　｜　"+kw:""));renderBattle()}
function kwText(c){const t=CARDS[c.id].d((c.u|0));return Object.keys(KW).filter(k=>t.includes(k)).slice(0,2).map(k=>(k==="池"?"奶蛙池":k)+"："+KW[k].split("。")[0]).join("　")}
function clickEnemy(e){if(e.hp<=0)return;if(B.sel&&!busy){if(B.sel.pot!=null){const i=B.sel.pot;const id=S.pots[i];B.sel=null;hint();S.pots.splice(i,1);POTIONS[id].fx(B,e);afterAction();return}
  const c=B.hand.find(x=>x.k===B.sel.k);if(c){if(CARDS[c.id].tgt)playCard(c,e);else playCard(c);return}}
 const el=$(`.en[data-k="${e.k}"]`);tipAt(el.querySelector(".body"),`<b>${e.n}</b><p>${intentTip(e)}</p>${stsList(e,"它")}`)}
function shakeEl(el){el.animate([{transform:"translateX(0)"},{transform:"translateX(-8px)"},{transform:"translateX(8px)"},{transform:"translateX(0)"}],{duration:260})}
function stageShake(){const s=$("#stage");s.classList.remove("shake");void s.offsetWidth;s.classList.add("shake")}

/* ---- 特效 ---- */
function critRate(){if(!B)return 0;if(B.rageOn==="kungfu"||B.forceCrit)return 1;let r=.08;if(S.hero==="kungfu")r+=.05;r+=(B.p.critUp||0)+(typeof perk==="function"?perk("crit")*.04:0);if(B.p.pw&&B.p.pw.crit)r+=B.p.pw.crit*.05;return Math.min(.6,r)}
function shieldBreakFx(el){if(!el)return;const c=center(el.querySelector(".body")||el);const d=document.createElement("div");d.className="shbreak";d.style.left=c.x+"px";d.style.top=(c.top+40)+"px";d.innerHTML="<i></i><i></i><i></i><i></i><i></i><i></i><b>破盾！</b>";$("#fx").appendChild(d);setTimeout(()=>d.remove(),1200);sxPlay("glassH",.62,1,0,{pan:.2,wet:.2});sxPlay("clank",.4,.8,.02,{pan:.2})}
function fnum(x,y,t,cls="",delay=0){setTimeout(()=>{const d=document.createElement("div");d.className="fnum "+cls;d.textContent=t;d.style.left=x+"px";d.style.top=y+"px";$("#fx").appendChild(d);if(B&&B.curType&&!/txt|gold|heal|pink|blk/.test(cls)){const k=1+Math.min(.6,(B.hitStreak||0)*.06);if(k>1)d.style.scale=k.toFixed(2)}setTimeout(()=>d.remove(),1650)},delay)}
function fxAt(el,cls,delay=0,html=""){if(!el)return;setTimeout(()=>{const c=center(el);const d=document.createElement("div");d.className=cls;d.innerHTML=html;d.style.left=c.x+"px";d.style.top=c.y+"px";$("#fx").appendChild(d);setTimeout(()=>d.remove(),900)},delay)}
function sparks(x,y,col,n=14){for(let i=0;i<n;i++){const d=document.createElement("i");d.className="spark";const a=Math.random()*Math.PI*2,r=60+Math.random()*90;d.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px;--c:${col}`;$("#fx").appendChild(d);setTimeout(()=>d.remove(),850)}}
function hitStop(ms){const a=$("#arena");if(!a)return;a.classList.add("hitstop");setTimeout(()=>a.classList.remove("hitstop"),ms)}
const ELC={fire:"#ff4a2a",ice:"#6fd3ff",thunder:"#b46bff",arc:"#ff8ce8"};
function impactFx(x,y,big,col){const F=$("#fx");const r=document.createElement("div");r.className="impRing"+(big?" big":"");r.style.cssText=`left:${x}px;top:${y}px;--ic:${col}`;F.appendChild(r);setTimeout(()=>r.remove(),450);
 const n=big?12:7;for(let i=0;i<n;i++){const s=document.createElement("i");s.className="shard";const a=Math.random()*Math.PI*2,dist=(big?120:70)+Math.random()*50;s.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*dist}px;--dy:${Math.sin(a)*dist-30}px;--rt:${Math.random()*360}deg;background:${col}`;F.appendChild(s);setTimeout(()=>s.remove(),520)}}
function hitFx(x,y,big,blocked,fam,HK,HO){const F=$("#fx");
 if(B&&B.curType){B.hitStreak=(B.hitStreak||0)+1;if(B.hitStreak>=2){let cb=$("#comboCt");if(!cb){cb=document.createElement("div");cb.id="comboCt";F.appendChild(cb)}if(B.hitStreak>=15)ach("combo15");cb.innerHTML=`<small>连击</small><i>×</i><b>${B.hitStreak}</b>${B.hitStreak>=10?"<em>无双！</em>":B.hitStreak>=7?"<em>停不下来！</em>":B.hitStreak>=4?"<em>好连击！</em>":""}`;cb.className=B.hitStreak>=10?"c3":B.hitStreak>=7?"c2":B.hitStreak>=4?"c1":"";sfx("combo");if([4,7,10].includes(B.hitStreak)){stageShake();sparks(640,210,"#ffd23f",14+B.hitStreak)}cb.style.setProperty("--k",Math.min(1.5,1+B.hitStreak*.05));cb.classList.remove("pop");void cb.offsetWidth;cb.classList.add("pop");clearTimeout(cb._t);cb.classList.remove("out");cb._t=setTimeout(()=>{cb.classList.add("out");setTimeout(()=>{if(cb.classList.contains("out"))cb.remove()},450)},2400)}}
 const add=(cls,html,st,ms)=>{const d=document.createElement("div");d.className=cls;d.innerHTML=html||"";d.style.cssText=`left:${x}px;top:${y}px;${st||""}`;F.appendChild(d);setTimeout(()=>d.remove(),ms);return d};
 if(blocked){blockSound(true);add("hxShield","","",520);const o=document.createElement("div");o.className="ono blk";o.textContent=pick(["叮！","铛！"]);o.style.cssText=`left:${x+(Math.random()*60-30)}px;top:${y-70}px;--r:${Math.random()*16-8}deg`;F.appendChild(o);setTimeout(()=>o.remove(),620);return}
 const K=HK||hitKind();hitSound(K,big,HO);
 if(K==="fist"){add("hxRing"+(big?" big":""),"","",420);add("hxRing2"+(big?" big":""),"","",520);add("hxLines"+(big?" big":""),Array.from({length:big?12:8},(_,k)=>`<i style="--a:${k*(360/(big?12:8))+Math.random()*14}deg;--l:${(big?70:48)+Math.random()*30}px"></i>`).join(""),"",380);for(let k=0;k<(big?4:2);k++)add("hxDust",`<i></i>`,`--dx:${(Math.random()-.5)*120}px;--dy:${20+Math.random()*30}px;--s:${.7+Math.random()*.6}`,700);if(big){const ar=$("#arena");if(ar){ar.classList.remove("punch");void ar.offsetWidth;ar.classList.add("punch")}}}
 else if(K==="blade"){const r=-30+Math.random()*20;add("hxCut"+(big?" big":""),"",`--r:${r}deg`,380);if(big)add("hxCut big","",`--r:${r+70}deg;animation-delay:.06s`,440);for(let k=0;k<(big?12:7);k++){const a=(r+(Math.random()<.5?0:180))*Math.PI/180+(Math.random()-.5)*.8,dd=60+Math.random()*80;add("hxSpark",`<i></i>`,`--dx:${Math.cos(a)*dd}px;--dy:${Math.sin(a)*dd}px`,420)}}
 else if(K==="claw"){add("hxClaw"+(big?" big":""),"<i></i><i></i><i></i>","",560);for(let k=0;k<(big?9:5);k++){const a=Math.PI*(.15+Math.random()*.7),dd=50+Math.random()*70;add("hxBlood",`<i></i>`,`--dx:${Math.cos(a)*dd*(Math.random()<.5?-1:1)}px;--dy:${Math.sin(a)*dd}px;--s:${.6+Math.random()*.8}`,620)}}
 else if(K==="fire"){add("hxBoom"+(big?" big":""),"","",560);for(let k=0;k<(big?10:6);k++){const a=Math.random()*Math.PI*2,dd=60+Math.random()*80;add("hxEmber",`<i></i>`,`--dx:${Math.cos(a)*dd}px;--dy:${Math.sin(a)*dd-30}px`,700)}add("hxSmoke","","",900);const o=document.createElement("div");o.className="ono fire"+(big?" big":"");o.textContent=big?pick(["轰！！","砰！！"]):"砰！";o.style.cssText=`left:${x+(Math.random()*60-30)}px;top:${y-80}px;--r:${Math.random()*16-8}deg`;F.appendChild(o);setTimeout(()=>o.remove(),620)}
 else if(K==="ice"){add("hxFrost"+(big?" big":""),"","",520);for(let k=0;k<(big?10:6);k++){const a=Math.random()*Math.PI*2,dd=50+Math.random()*80;add("hxIce",`<i></i>`,`--dx:${Math.cos(a)*dd}px;--dy:${Math.sin(a)*dd}px;--rt:${Math.random()*360}deg`,620)}}
 else if(K==="thunder"){add("hxBolt",`<svg viewBox="0 0 60 300" width="${big?120:92}" height="${big?380:330}"><path d="M36 0 L14 120 L32 120 L8 300 L52 104 L32 104 L50 0Z" fill="#fff6a8" stroke="#b46bff" stroke-width="4" stroke-linejoin="round"/></svg>`,"",360);add("hxZap","","",300)}
 else if(K==="water"){add("hxFrost wat"+(big?" big":""),"","",520);for(let k=0;k<(big?9:6);k++){const a=-Math.PI/2+(Math.random()-.5)*2.6;add("drop",`<i></i>`,`--dx:${Math.cos(a)*100}px;--dy:${Math.sin(a)*100}px`,600)}}
 else if(K==="earth"){add("hxRing2 big","","",520);for(let k=0;k<(big?10:7);k++){const a=-Math.PI*(.1+Math.random()*.8),dd=60+Math.random()*80;add("hxIce rock",`<i></i>`,`--dx:${Math.cos(a)*dd}px;--dy:${Math.sin(a)*dd}px;--rt:${Math.random()*360}deg`,620)}}
 else if(K==="star"){for(let k=0;k<(big?9:6);k++){const a=Math.random()*Math.PI*2,dd=40+Math.random()*80;add("hxStar",`<i></i>`,`--dx:${Math.cos(a)*dd}px;--dy:${Math.sin(a)*dd}px;--s:${.6+Math.random()*.8};animation-delay:${k*25}ms`,700)}add("hxRing star","","",420)}
 else {add("hxPop"+(big?" big":""),"",`--c:${(FAM[fam]||{}).c||"#fff"}`,360)}
 if(fam==="chick")for(let k=0;k<5;k++)add("fth",`<i></i>`,`--dx:${Math.random()*160-80}px;--dy:${40+Math.random()*80}px;--r:${Math.random()*360}deg;animation-delay:${k*30}ms`,900);
 if(fam==="frog"&&K==="pool")for(let k=0;k<5;k++){const a=-Math.PI/2+(Math.random()-.5)*2.2;add("drop",`<i></i>`,`--dx:${Math.cos(a)*90}px;--dy:${Math.sin(a)*90}px`,600)}}
function hitKind(){if(!B)return"pool";if(B.dotElem)return B.dotElem==="fire"?"pool":"pool";const el=B.curElem;if(el==="fire")return"fire";if(el==="ice")return"ice";if(el==="thunder")return"thunder";if(el==="water")return"water";if(el==="earth")return"earth";if(el==="arc"||B.curSpell==="arc")return"star";if(B.curType==="anqi"||B.curType==="egg"||!B.curType)return"pool";if(B.curType!=="atk")return"pool";const h=S.hero;return h==="knight"?"blade":h==="vamp"?"claw":"fist"}
function anim(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),500)}
const enEl=e=>$(`.en[data-k="${e.k}"]`);const enBody=e=>{const el=enEl(e);return(el&&el.querySelector(".body"))||$("#enemies")};
function say(el,t,cls){if(!el||!t)return;const c=center(el);const d=document.createElement("div");d.className="bubble "+(cls||"");d.textContent=t;let x=c.x-40;x=Math.max(10,Math.min(1280-d.textContent.length*21-40,x));d.style.left=x+"px";d.style.top=Math.max(70,c.top-56)+"px";$("#fx").appendChild(d);setTimeout(()=>d.remove(),2500)}
function heroSay(t,force){if(!B||!t)return;const now=Date.now();if(!force&&B.lastHeroSay&&now-B.lastHeroSay<1800)return;B.lastHeroSay=now;say($("#player .body"),t,"hero")}
function eLine(e,kind){if(!ENEMY[e.id].boss&&(kind==="a"||kind==="s")&&typeof MOB_BOSS!=="undefined"&&rnd()<.3){const M0=MOB_BOSS[Math.min(4,S.act||0)];if(M0)return pick(M0)}const L=(ELINE[e.id]||{})[kind];return pick(L&&L.length?L:GLINE[kind])}
function bubble(el,t){const c=center(el);const d=document.createElement("div");d.className="bubble";d.textContent=t;d.style.left=(c.x-40)+"px";d.style.top=Math.max(70,c.top-50)+"px";$("#fx").appendChild(d);setTimeout(()=>d.remove(),2500)}

/* ---- 战斗 API（卡牌效果调用） ---- */
const API={
 alive(){return this.enemies.filter(e=>e.hp>0&&!e.fled)},
 favAnqi(){return({naiwa:"bomb",knight:"caltrop",kungfu:"dart",mage:"charm",vamp:"needle"})[S.hero]||"bomb"},
 gainAnqi(k){if(PREV)return;if(!k){const fav=this.favAnqi();k=rnd()<.4?fav:pick(Object.keys(ANQI))}this.bag=this.bag||[];if(this.bag.length>=3){toast("暗器袋满了（最多 3 个），这个暗器掉在了地上");return}this.bag.push(k);seeCard("aq_"+k);renderBag(k);const n=this.bag.filter(x=>x===k).length;if(n>=3)setTimeout(()=>anqiTriple(k),450);else if(n===2)toast(`暗器袋里有 2 个<b>${ANQI[k].n}</b>，再来 1 个就会一起引爆！`)},
 throwAnqi(k){if(PREV){anqiFx(k,1);return}sfx("throw");S.stats.anqi=(S.stats.anqi||0)+1;questTick("anqi");if(S.stats.anqi>=20)ach("anqi20");anqiFx(k,1);if(this.p.pw2&&this.p.pw2.anqiDraw&&this.anqiDrew!==this.turn){this.anqiDrew=this.turn;this.after.push(async()=>this.draw(1))}},
 layEgg(o){if(PREV)return;this.eggs=this.eggs||[];if(this.eggs.length>=6){toast("场上的蛋太多了，放不下");return}this.eggs.push({...o});renderEggs(1);sxPlay("place",.4,.9)},
 warmEggs(){if(PREV)return;(this.eggs||[]).forEach(e=>e.t=Math.max(1,e.t-1));renderEggs();toast("蛋暖和了，快孵出来了")},

 hit(t,base,times=1,raw){if(!t||t.hp<=0)t=this.alive()[0];if(!t)return;if(!raw)base+=this.wxAtk()+(this.shinyPow||0);for(let i=0;i<times;i++){if(t.hp<=0)break;
  let d=base+(raw?0:this.p.str+this.p.tstr+(this.bonus||0));if(this.rebelNow&&!raw)d*=2;if(!raw&&this.p.weak>0)d*=.75;if(!raw&&this.p.frost>0)d*=.75;if(!PREV&&!raw&&this.p.night>0&&Math.random()<.15*this.p.night){const sd=Math.max(1,Math.floor(d/2));fxSay(t,"梦魇！");dmgPlayer(sd,null,true);toast(`梦魇让你打到了自己：<b>${sd}</b> 伤害`);continue}if(t.id==="cosmicegg"&&!t.form2&&!raw)d*=2;if(t.vuln>0)d*=1.5;d=Math.max(0,Math.floor(d));let cr=0;if(!PREV&&d>0&&Math.random()<critRate()){cr=1;questTick("crit");d=Math.floor(d*1.5);S.stats.crit=(S.stats.crit||0)+1;if(S.stats.crit>=30)ach("crit30")}this._crit=cr;dealEnemy(t,d,i);this._crit=0;if(false){const op=this.pierce;this.pierce=1;const c=center((enEl(t)||$("#enemies")).querySelector(".body")||enEl(t));sparks(c.x,c.top+60,"#b9a6ff",10);dealEnemy(t,4);this.pierce=op}}},
 hitAll(v){this.alive().forEach(e=>this.hit(e,v))},
 spell(t,base,times=1,noMana){if(S.hero==="mage"&&M.mageStar&&!PREV&&t&&t.hp>0){setTimeout(()=>{if(!B||B.over||t.hp<=0)return;const op=B.pierce;B.pierce=1;try{const el=enEl(t);if(el){const c=center(el.querySelector(".body"));sparks(c.x,c.top+60,"#b9a6ff",10)}dealEnemy(t,3)}finally{B.pierce=op}renderBattle()},260)}if(!t||t.hp<=0)t=this.alive()[0];if(!t)return;let v=base+(noMana?0:(this.p.mana||0))+(this.p.nextSpell||0)+(this.shinyPow||0);{const k=this.curSpell;if(!PREV&&t.wet>0){if(k==="thunder"){v*=2;fxSay(t,"导电 ×2")}else if(k==="fire"){v=Math.round(v*1.5);t.wet=0;fxSay(t,"蒸汽！")}else if(k==="ice"){t.wet=0;t.frost=(t.frost||0)+2;fxSay(t,"结冰！冻伤 +2")}}}this.p.nextSpell=0;spellFx(t,this.curSpell||"arc");this.pierce=1;try{this.hit(t,v,times,1)}finally{this.pierce=0}},
 addMana(n){this.p.mana=(this.p.mana||0)+n;const el=$("#player .body");if(el){const c=center(el);fnum(c.x,c.top+30,"魔力+"+n,"txt")}sfx("buff")},
 block(v,raw){if(S.hero==="vamp"){if(!PREV&&this.vNoBlk!==this.turn){this.vNoBlk=this.turn;const c=center($("#player .body"));fnum(c.x,c.top+40,"吸血鬼不需要护盾","txt")}return}let b=Math.max(0,v+(raw?0:this.p.dex+this.wxBlk()+(this.shinyPow||0)));if(S.hero==="knight"&&!raw)b=Math.round(b*1.15);this.p.block+=b;sfx("block");const el=$("#player .body");fxAt(el,"shieldFx",0,ICON.shield);const c=center(el);fnum(c.x,c.top+40,"+"+b,"blk")},
 draw(n){let last=null;for(let i=0;i<n;i++){if(!this.dp.length){if(!this.disc.length)break;this.dp=shuffle(this.disc);this.disc=[];toast("弃牌堆洗回了抽牌堆")}
  const c=this.dp.pop();if(this.hand.length>=10){this.disc.push(c);toast("手牌满了");continue}last=c;this.hand.push(c);seeCard(c.id);if(c.id==="fret"){this.p.energy=Math.max(0,this.p.energy-1);toast("烦躁，失去 1 点奶力")}}sfx("draw");renderBattle();return last},
 wxAtk(){if(!this.curFam)return 0;return(S.mod==="sand"&&this.curType==="atk"?1:0)+(this.moon==="wax"&&this.curType==="atk"?1:0)+(this.wx==="rain"&&this.curFam==="frog"?2:0)+(this.wx==="wind"&&this.curFam==="horse"?3:0)},
 wxBlk(){if(!this.curFam)return 0;return(this.moon==="wane"?2:0)+(this.wx==="snow"&&this.curFam==="chick"?3:0)},
 poolNeed(){return(this.p.pw.noself||this.moon==="full")?2:3},
 poolCount(f){return this.pool.filter(x=>x.f===f&&!x.ice).length},
 poolInsert(f){const tok={f,ice:0},P=this.pool;
  if(f==="mud"){const sp=[];for(let i=1;i<P.length;i++)if(P[i].f===P[i-1].f&&P[i].f!=="mud"&&!P[i].ice&&!P[i-1].ice)sp.push(i);P.splice(sp.length&&rnd()<.6?pick(sp):ri(P.length+1),0,tok);return}
  if(f==="any"){for(let i=P.length;i>=0;i--){const t=[...P];t.splice(i,0,tok);if(findRun(t,this.poolNeed())){P.splice(i,0,tok);return}}P.push(tok);return}
  let at=-1;P.forEach((x,i)=>{if(x.f===f&&!x.ice)at=i});if(at<0)P.push(tok);else P.splice(at+1,0,tok)},
 poolRegroup(){const P=this.pool,out=[],done={};P.forEach((x,i)=>{if(x.ice||x.f==="any"){out.push(x);return}if(done[x.f])return;done[x.f]=1;P.forEach(y=>{if(y.f===x.f&&!y.ice)out.push(y)})});this.pool=out},
 poolAdd(f){this.poolInsert(f);const r=this.poolResolve();this.poolOverflow();renderPool();return r},
 poolResolve(){let lv=0,first=null,run;while((run=findRun(this.pool,this.poolNeed()))){lv++;rageGain(1.5);if(this.p.pw2&&this.p.pw2.dogbite&&!PREV){const v=this.p.pw2.dogbite;setTimeout(()=>{if(!B||B.over)return;const t=pick(B.alive());if(!t)return;say($("#player .body"),pick(["汪！","汪汪！","嗷呜——"]),"hero");B.hit(t,v,1,1);renderBattle();if(!B.alive().length)win()},350)}this.pool.splice(run.i,run.n);if(!first)first=run.f;renderPool();this.poolFx(run.f,lv,run.n)}if(B&&B.kind==="R"&&!PREV){if(lv>=2)memoTip("chain","这就是<b>连锁</b>！消除以后池子合拢，又凑成了一组，就会接着消。每多一环，爆发更强，还多给 1 点奶力。");else if(lv>=1)memoTip("tri","<b>三连！</b>同家族凑齐 3 只就消除：刚才那张牌效果打两次，还触发一次<b>家族爆发</b>。")}if(!PREV&&lv){S.stats.chain=Math.max(S.stats.chain||0,lv);if(lv>=4)ach("chain4");if(lv>=6)ach("chain6")}if(lv>=3&&!PREV)questTick("chain3");if(lv>=2){chainBanner(lv);if(!PREV)this.gainAnqi();heroSay(pick(HLC(Math.min(lv,6))),1);this.chainsTurn=(this.chainsTurn||0)+1;if(has("shadowcloak")){relicPulse("shadowcloak");this.alive().forEach(e=>this.hit(e,6,1,1))}if(this.p.pw.momentum){this.p.str+=this.p.pw.momentum;this.fxBuff(this.p)}if(this.p.pw.ninering){this.draw(2*this.p.pw.ninering);this.gainEnergy(this.p.pw.ninering)}if(perk("chain"))this.block(6*perk("chain"),1);if(has("chainbell")){relicPulse("chainbell");this.block(6,1)}}return first},
 poolOverflow(){if(this.pool.length<=this.poolCap)return;ach("overflow");const out=this.pool.splice(0,3);
  if(this.p.noOverflow||has("tidecharm"))toast("池子溢出了，但你没有受伤！");else{toast("池子溢出了！受到 <b>6</b> 伤害，最前面的 3 只被挤了出去");dmgPlayer(6,null,true)}
  sfx("hurt");const pl=$("#pool");pl.classList.remove("spill");void pl.offsetWidth;pl.classList.add("spill");this.poolResolve()},
 poolFx(f,lv=1,n=3){const pc=center($("#pool"));sparks(pc.x,pc.y,(FAM[f]||{c:"#fff"}).c,10+lv*6);
  if(S.hero==="naiwa"&&!PREV){this.nwStr=(this.nwStr||0)+1;this.p.str=(this.p.str||0)+1;this.block(3,1);this.fxBuff&&this.fxBuff(this.p)}
  if(f==="mud"){toast("泥巴被清掉了");sfx("mud");if(S.mod==="mud"){this.block(8,1);this.gainEnergy(1)}if(S.hero==="naiwa")this.block(5,1);return}
  questTick("tri");S.stats.tri++;this.elims=(this.elims||0)+1;this.elimTurn=(this.elimTurn||0)+1;{const ik=this.alive().find(x=>x.id==="iceking");if(ik&&(ik.candles==null?3:ik.candles)>0){ik.candles=(ik.candles==null?3:ik.candles)-1;setTimeout(()=>{fxSay(ik,"蜡烛灭了一根");renderBattle()},200)}}if(has("combo")&&!this.comboUsed){this.comboUsed=1;relicPulse("combo");this.draw(1)}S.stats.chain=Math.max(S.stats.chain||0,lv);if(lv>=4)ach("chain4");if(lv>=6)ach("chain6");if(lv===1)triBanner(f,1);else{this._lvSfx=lv;sfx("tri2")}this.triTurn=(this.triTurn||0)+1;if(this.triTurn>=3)ach("tri3");if(this.triTurn===3)setTimeout(()=>cutIn("三连 ×3！","一回合三次消除"),250);const p=this.p,mul={frog:"frogB",horse:"horseB",chick:"chickB",cat:"catB"}[f],k=lv*(1+.5*(mul?perk(mul):0))*(S.mod==="chain"&&lv>=2?1.5:1)*(S.hero==="naiwa"?1.3:1);if(has("goldpot")){S.gold+=2;renderTop()}
  if(f==="frog"){const kk=has("frogcrown")?k*2:k;if(p.pw.reso)this.alive().forEach(e=>this.hit(e,p.pw.reso,1,1));for(let i=0;i<Math.round(3*kk);i++){const t=pick(this.alive());if(t)this.hit(t,3,1,1)}}
  else if(f==="horse")this.alive().forEach(e=>this.hit(e,Math.round(5*k),1,1));
  else if(f==="chick")this.block(Math.round(6*k),1);
  else if(f==="cat"){this.heal(Math.round(3*k));this.draw(Math.max(1,Math.floor(k)))}
  else if(f==="pal"){const t=pick(this.alive());if(t)this.hit(t,8*k,1,1)}
  else if(f==="magic"){const t=this.alive();t.forEach(e=>this.hit(e,Math.round(4*k)+(p.mana||0),1,1));p.mana=(p.mana||0)+1+(p.pw.runeMana||0)}
  else if(f==="blood"){this.alive().forEach(e=>this.apply(e,"bleed",Math.round(3*k)));this.heal(Math.round(5*k))}
  else if(f==="kungfu"){for(let i=0;i<Math.round(2*k);i++){const t=pick(this.alive());if(t){this.hit(t,4,1,1);if(t.hp>0)t.inj=Math.min(10,(t.inj||0)+1)}}this.apply(p,"dex",1)}
  else if(f==="knight"){this.block(Math.round(7*k),1);const t=pick(this.alive());if(t)this.hit(t,Math.max(4,Math.floor(p.block*.45)),1,1)}
  else if(f==="any")this.gainEnergy(1);
  if(lv>=2)this.gainEnergy(1);
  if(!PREV&&has("qz_spring")&&lv>=3){relicPulse("qz_spring");this.heal(10);this.draw(2)}if(!PREV&&has("qz_croak")){const t=pick(this.alive());if(t)this.hit(t,4+2*(this.p.str||0),1,1)}
  if(p.pw.pond)this.heal(p.pw.pond);if(p.pw.calm)this.block(p.pw.calm,1);if(p.pw.way&&!this.wayUsed){this.wayUsed=1;this.gainEnergy(1)}
  if(!PREV){this.newEl=(this.newEl||0)+1;if(this.moon==="new"&&this.newEl%3===0){this.gainEnergy(1);toast("新月：消除满 3 次，奶力 +1")}if(S.mod==="tiny"&&this.newEl%2===0){this.gainEnergy(1)}}
  if(has("badge")&&!this.badge){this.badge=1;relicPulse("badge");this.draw(2)}
  const mir=this.alive().filter(e=>e.mirror>0);mir.forEach(e=>{setTimeout(()=>{if(!B||B.over)return;const el=enEl(e);if(el){anim(el,"lungeL");bubble(el,"你会的，我也会！")}dmgPlayer(e.mirror*lv,null,true);renderBattle();if(S.hp<=0)lose()},300)})},
 poolPop(n){for(let i=0;i<n;i++)this.pool.pop();renderPool()},
 poolClear(){const n=this.pool.length;this.pool=[];renderPool();return n},
 poolConvert(a,b,max=99){let n=0;this.pool.forEach(x=>{if(x.f===a&&n<max){x.f=b;x.ice=0;n++}});this.poolResolve();renderPool()},
 poolForce(){const c={};this.pool.forEach(x=>{if(!x.ice)c[x.f]=(c[x.f]||0)+1});const f=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];if(!f){toast("池子是空的");return}
  this.pool=this.pool.filter(x=>!(x.f===f&&!x.ice));this.poolFx(f==="mud"?"frog":f,1);this.poolResolve();renderPool()},
 poolSort(){const ord=["frog","horse","chick","cat","pal","any","mud"];this.pool.sort((a,b)=>ord.indexOf(a.f)-ord.indexOf(b.f));this.poolResolve();renderPool()},
 poolNudge(){if(this.pool.length>1)this.pool.unshift(this.pool.pop());this.poolResolve();renderPool()},
 poolShuffle(){shuffle(this.pool);this.poolResolve();renderPool()},
 poolThaw(){let n=0;this.pool.forEach(x=>{if(x.ice){x.ice=0;n++}});this.poolResolve();renderPool();return n},
 poolCleanse(){this.pool=this.pool.filter(x=>x.f!=="mud");this.pool.forEach(x=>x.ice=0);this.poolResolve();renderPool()},
 poolEnemy(P,e){const el=enEl(e);
  if(P.t==="junk"){if(has("mudboots"))this.block(4,1);for(let i=0;i<P.n+(S.mod==="mud"&&!e.af?1:0);i++)this.poolInsert("mud");toast(`${e.n}往你的池子里丢了 <b>${P.n} 块泥巴</b>`);sfx("mud");this.poolResolve();this.poolOverflow()}
  else if(P.t==="boil"){const l=shuffle(this.pool.filter(x=>!x.ice&&x.f!=="mud")).slice(0,P.n);l.forEach(x=>x.f="mud");if(l.length){M.boiled=(M.boiled||0)+l.length;if(M.boiled>=10)ach("boiled");toast(`${e.n}把池里的 <b>${l.length} 只</b>奶蛙煮成了泥巴！`);sfx("mud");this.poolResolve()}}
  else if(P.t==="freeze"){const l=shuffle(this.pool.filter(x=>!x.ice&&x.f!=="mud")).slice(0,P.n);l.forEach(x=>x.ice=has("icepick")?1:2);if(l.length)toast(`${e.n}冻住了池里的 <b>${l.length} 只</b>奶蛙（2 回合）`);sfx("debuff")}
  else if(P.t==="suck"){let k=0;for(let i=0;i<P.n&&this.pool.length;i++){const idx=Math.floor(this.pool.length/2);this.pool.splice(idx,1);k++}if(k){e.hp=Math.min(e.max,e.hp+P.h*k);toast(`${e.n}吸走了池里的 <b>${k} 只</b>奶蛙，回复了 ${P.h*k} 生命`);if(el){const c=center(el.querySelector(".body"));fnum(c.x,c.top+20,"+"+P.h*k,"heal")}sfx("heal");this.poolResolve()}}
  else if(P.t==="eat"){const n=this.pool.length;if(n>=3)ach("eaten");this.pool=[];if(n){e.str=(e.str||0)+Math.floor(n/2);e.hp=Math.min(e.max,e.hp+n*3);toast(`${e.n}一口吞掉了你整个池子（${n} 只）！力气 +${Math.floor(n/2)}`);if(el)bubble(el,"嗷呜，好吃！");sfx("boom")}}
 else if(P.t==="shuffle"){shuffle(this.pool);toast(`${e.n}把你的池子搅乱了！`);sfx("debuff");this.poolResolve()}
  renderPool()},
 setWx(w){this.wx=w;renderSky();toast(`天气变成了 <b>${WX[w].n}</b>：${WX[w].d}`)},
 setMoon(m){this.moon=m;this.poolCap=m==="new"?6:7;renderSky();setBg(battleBg(this.kind),m);toast(`月亮变成了 <b>${MOON[m].n}</b>：${MOON[m].d}`);renderPool()},
 drawFam(f){const c=[...this.dp].reverse().find(x=>CARDS[x.id].fam===f);if(c&&this.hand.length<10){this.dp.splice(this.dp.indexOf(c),1);this.hand.push(c);renderBattle()}else this.draw(1)},
 fetchAtk(){const l=this.disc.filter(c=>CARDS[c.id].type==="atk");if(l.length&&this.hand.length<10){const c=pick(l);this.disc.splice(this.disc.indexOf(c),1);this.hand.push(c);toast(`拿回了 <b>${cname(c)}</b>`)}},
 chooseFromDraw(){this.after.push(async()=>{if(!this.dp.length)return;const r=await pickCards([...this.dp],{title:"观星",sub:"选一张放进手里",cancel:false});const c=r[0];if(c&&this.hand.length<10){this.dp.splice(this.dp.indexOf(c),1);this.hand.push(c)}})},
 gainEnergy(n){const b=this.p.energy;this.p.energy=Math.min(EN_MAX,this.p.energy+n);if(this.p.energy===EN_MAX&&b+n>EN_MAX&&!PREV)toast(`奶力最多 <b>${EN_MAX}</b> 点`);anim($("#energy"),"pop");sfx("buff")},
 statFx(t,s,v){const el=t===this.p?$("#player"):enEl(t);if(el){const c=center(el.querySelector(".body"));fnum(c.x,c.top+30,STAT[s].n+"+"+v,"txt")}},
 apply(t,s,v){if(t===this.p&&["poison","curse","frost","night","para"].includes(s)&&S.diff!=="hard")v=Math.max(1,Math.ceil(v/2));if(s==="poison")t.poisonT=3;if(s==="curse"){t.curseD=Math.round((12+(S.act||0)*4)*(S.diff==="hard"?1:.5));if(t.curse){t.curseD+=6;v=0}}t[s]=(t[s]||0)+v;if(s==="inj")t.inj=Math.min(10,t.inj);const el=t===this.p?$("#player"):enEl(t);if(el){const c=center(el.querySelector(".body"));fnum(c.x,c.top+30,STAT[s].n+"+"+v,"txt")}sfx(s==="str"?"buff":"debuff")},
 heal(v){const h=Math.min(v,S.max-S.hp);S.hp+=h;if(h<=0)return;sfx("heal");const c=center($("#player .body"));fnum(c.x,c.top+20,"+"+h,"heal");renderTop()},
 selfDamage(v){dmgPlayer(v,null,true)},
 gainGold(v){S.gold+=v;S.stats.gold+=v;sfx("coin");const c=center($("#player .body"));fnum(c.x,c.top,"+"+v+" 金币","gold");renderTop()},
 shake(){stageShake()},
 fxBuff(o){anim($("#player"),"buffA");sfx("buff")},
 renderHand(){renderHand()},
 discardHand(){this.disc.push(...this.hand);this.hand=[];renderBattle()},
 chooseDiscard(n){this.after.push(async()=>{if(!this.hand.length)return;const r=await pickCards([...this.hand],{title:"选 1 张弃掉",sub:"",cancel:false});const c=r[0];if(c){this.hand.splice(this.hand.indexOf(c),1);this.disc.push(c)}})},
 chooseFamily(src){this.after.push(async()=>{const fams=new Set(this.hand.map(c=>CARDS[c.id].fam).filter(f=>f!=="none"));const list=this.dp.filter(c=>fams.has(CARDS[c.id].fam));
  if(!list.length){toast("抽牌堆里没有同家族的牌");return}const r=await pickCards(list,{title:"凑齐",sub:"从抽牌堆选一张，放进手里",cancel:false});const c=r[0];if(c&&this.hand.length<10){this.dp.splice(this.dp.indexOf(c),1);this.hand.push(c)}})},
 addRandomRare(){const pool=POOL_HERO.filter(id=>"REL".includes(CARDS[id].r));const c=mk(pick(pool));c.tmp=0;if(this.hand.length<10){this.hand.push(c);seeCard(c.id);toast(`扭出了 <b>${cname(c)}</b>！`)}}};

function bossGuard(t,d){const id=t.id;
 if(id==="king"){const m=B.pool.filter(x=>x.f==="mud").length;if(m)d=Math.max(0,d-2*m)}
 if(id==="buddha"&&d<=5){fxSay(t,"金身！");return 0}
 if(id==="pearlqueen"&&B.alive().some(x=>x.id==="teacup"))d=Math.ceil(d/2);
 if(id==="fogwhite"&&t.fogged)d=Math.ceil(d/2);
 if(id==="rockfrog"){if(t.armor==null)t.armor=6;if(t.armor>0&&d>0){d=Math.max(0,d-4);t.armor--;if(!t.armor)setTimeout(()=>{const el=enEl(t);if(el)say(el.querySelector(".body"),"石甲全碎了")},200)}}
 if(id==="shadow"&&rnd()<.25){fxSay(t,"闪开了");return 0}
 if(id==="bishop"){if(t.bone==null)t.bone=6;if(t.bone>0&&d>0){d=Math.max(0,d-t.bone);t.bone--;if(!t.bone)fxSay(t,"骨甲碎了")}}
 if(id==="general"&&t.unarm)d=Math.round(d*1.25);
 if(id==="rockfrog"&&t.molten)return d;
 if(id==="iceking"){if(t.candles==null)t.candles=3;if(t.candles>0)d=Math.max(0,d-3*t.candles)}
 if(id==="lavagiant"&&B.curType==="atk"&&B.lavaLock!==B.cardSeq){B.lavaLock=B.cardSeq;setTimeout(()=>{if(B&&!B.over){B.apply(B.p,"burn",1)}},150)}
 return d}
function fxSay(t,s){const el=enEl(t);if(el){const c=center(el.querySelector(".body"));fnum(c.x,c.top+20,s,"txt")}}
function bossAfterHit(t,d,loss){const id=t.id;if(loss>0&&B&&B.myTurn){t.turnDmg=(t.turnDmg||0)+loss}try{if(BM[id]&&BM[id].hit)BM[id].hit(t,loss)}catch(er){}
 if(t.brkNeed&&t.intent&&t.intent.ult&&loss>0&&t.hp>0&&B&&B.myTurn){t.brkGot=(t.brkGot||0)+loss;if(t.brkGot>=t.brkNeed){const un=t.intent.ult;t.brkNeed=0;t.intent={k:"stun"};t.vuln=(t.vuln||0)+2;S.stats.brk=(S.stats.brk||0)+1;setTimeout(()=>{if(!B||B.over)return;banner("打断！",1);stageShake();const el=enEl(t);if(el)say(el.querySelector(".body"),"……我的「"+un+"」！");toast(`打断了 <b>${un}</b>：${t.n}晕一回合，还易伤 2 回合`);renderBattle()},200)}}
 if(id==="general"&&t.hp>0&&B.curType&&!t.unarm){t.marks=(t.marks||0)+1;if(t.marks>=5){t.marks=0;setTimeout(()=>{if(!B||B.over||t.hp<=0)return;const el=enEl(t);banner("纹路爆发",1);stageShake();if(el)say(el.querySelector(".body"),"这一下，替他还给你！");dmgPlayer(15,null,true);t.block+=20;renderBattle();if(S.hp<=0)lose()},250)}}
 
 if(id==="buddha"&&d>=15&&t.hp>0&&!(t.stunCD>0)){t.stunCD=3;t.intent={k:"stun"};setTimeout(()=>{const el=enEl(t);if(el)say(el.querySelector(".body"),"金身裂了一道缝");renderBattle()},300)}
 if(id==="demon"&&t.hp<=0&&!t.revived){t.revived=1;ach("notover");t.hp=1;t.reviving=1;t.block=0;formQ(t,"revive")}
 if(id==="bishop"&&t.hp<=0&&!t.piled){t.piled=1;t.hp=1;t.reviving=1;formQ(t,"pile")}}

/* ---- 4.0 首领第二形态 / 第二条命：整段约 3 秒的过场，期间不能操作 ---- */
const FORM2={
 rockfrog:{n:"熔芯",say:"壳碎了……也好。里面的火，憋了一千年了。",tip:"石壳裂开：不再叠护盾，攻击会让你烫伤"},
 count:{n:"血月",say:"月亮红了。孩子，现在轮到父亲吃饭了。",tip:"吸血翻倍"},
 thunderking:{n:"雷暴",say:"钟，给我敲快一点！让整座塔都醒着！",tip:"进塔钟每 2 回合就响一次"},
 boilerdragon:{n:"过热",say:"压力表爆了……那就一起烧吧！",tip:"热度满了会大爆炸。打技能牌能给它降温"},
 cosmicegg:{n:"孵化",say:"咔……咔嚓。外面，原来这么亮。",tip:"蛋壳破了，换了一套更凶的打法"},
 general:{n:"卸甲",say:"这身甲替我挡了二十年。今天，我自己上。",tip:"纹路没了，一回合打两次，但自己受伤 +25%"},
 shadow:{n:"无影",say:"你看得见我吗？……哪一个才是我呢。",tip:"分出一个假影子。打到假的会白打"},
 demon:{n:"魔椅加身",say:"……椅子，还不让我走。",tip:"第二条命：每回合从你池子里抓走 1 只奶蛙",life:1},
 youngyue:{n:"执念",say:"……我必须上去。泉水在等我。",tip:"力气 +3，换成更凶的打法"},
 king:{n:"泥潮",say:"莲花谢了。泥巴们，起来。",tip:"叫来两只泥巴怪，还会往你的牌堆和池子里塞泥巴"},
 fogwhite:{n:"浓雾",say:"雾更浓了。你还分得清哪边是前吗？",tip:"连击时会打乱你池子里奶蛙的顺序，还会让你虚弱"},
 snakeking:{n:"蛇巢",say:"孩子们，出来咬他！",tip:"叫来两条小蛇；三连咬时吸走你池里的奶蛙回血"},
 fallen:{n:"黑翼",say:"保佑的人太多了……翅膀，就黑透了。",tip:"让你易伤 2 回合，重击 24 点"},
 witch:{n:"魔药沸腾",say:"汪——锅开了。今晚的料，是你。",tip:"往你的牌堆和池子里塞泥巴，力气越攒越高"},
 buddha:{n:"开光",say:"金身，开光！",tip:"护盾更厚，出手时冻住你池里 2 只奶蛙"},
 bloodbeast:{n:"狂暴",say:"血……热起来了。",tip:"一回合连咬三口；重击时冻住你池里 2 只奶蛙"},
 iceking:{n:"永冻",say:"冰不会化的。你也留下来吧。",tip:"三连击时一次冻住 3 只奶蛙，重击 30 点"},
 snowking:{n:"雪崩",say:"越滚越大——停不下来啦！",tip:"出手就往你池里滚雪块，力气越滚越大"},
 lavagiant:{n:"熔流",say:"火，给我烧得更旺！",tip:"把你池里的奶蛙煮成泥巴，让你烫伤 5 层，重击 34 点"},
 fourhead:{n:"半梦半醒",say:"……两个头睡着了。剩下的两个，更凶。",tip:"醒着的头变少了，但每个头打得更重：力气 +2"},
 pearlqueen:{n:"满壶",say:"满上！一口气倒两杯！",tip:"一口气倒出两只奶茶杯，攻击带烫伤"},
 abyssdragon:{n:"涨潮",say:"水涨上来了。你掉的东西，我都收着。",tip:"连击时吸走你池里 2 只奶蛙回血，重击 30 点"},
 tophat:{n:"摘帽",say:"失礼了。帽子摘了，就不必再客气。",tip:"一回合连打三下，让你虚弱 3 回合；重击时吸走你池里 2 只奶蛙"},
 bishop:{n:"复生",say:"安息？不，我还没替他们祷告完。",tip:"骨堆重新站了起来",life:1}};
function formQ(t,kind){if(!B||PREV)return;(B.formQ=B.formQ||[]).push({t,kind});setTimeout(()=>{if(B&&!B.formRun&&B.myTurn&&!busy)runForms()},60)}
async function runForms(){if(!B||B.formRun||!B.formQ||!B.formQ.length)return;B.formRun=1;busy=true;
 try{while(B.formQ.length){const {t,kind}=B.formQ.shift();await bossFormSeq(t,kind)}}finally{B.formRun=0;busy=false;renderBattle();if(B.myTurn)renderHand()}}
async function bossFormSeq(t,kind){const F=kind==="pile"?{n:"骨堆",say:"……骨头，散了。可是还在动。",tip:"2 回合内打碎骨堆，不然他会以半血复活"}:FORM2[t.id];if(!F)return;const el=enEl(t),bt=$("#battle");if(!el)return;const body=el.querySelector(".body");
 bt.classList.add("formDim");$("#bg")&&$("#bg").classList.add("formDimBg");if(kind==="revive")el.classList.remove("bonePile");el.classList.add("forming");anim(el,"hit");sxPlay("bell",.4,.55,0,{wet:.3});duck(.5,2200);setTimeout(()=>sfx("form"),700);await sleep(500);
 say(body,F.say);await sleep(1500);
 sfx("formHit");const fl=document.createElement("div");fl.className="formFlash";$("#fx").appendChild(fl);setTimeout(()=>fl.remove(),1300);
 await sleep(250);
 if(kind==="pile"){el.classList.add("bonePile");t.n="骨堆"}else{el.classList.add("f2",("f2-"+t.id));t.form2=1;if(!/·/.test(t.n))t.n=F.n+"·"+t.n}
 const tgt=kind==="pile"?Math.round(t.max*.22):F.life?Math.round(t.max*(t.id==="demon"?.6:.5)):null;
 banner((kind==="pile"?"":"第二形态 · ")+F.n,1);await sleep(300);
 if(tgt!=null){const st=t.hp;for(let i=1;i<=10;i++){t.hp=Math.round(st+(tgt-st)*i/10);renderBattle();await sleep(70)}}
 formApply(t,kind);t.reviving=0;renderBattle();toast(`<b>${t.n}</b>：${F.tip}`);await sleep(700);
 el.classList.remove("forming");bt.classList.remove("formDim");$("#bg")&&$("#bg").classList.remove("formDimBg");if(kind==="revive")el.classList.remove("bonePile")}
function formApply(t,kind){if(kind==="pile"){t.pile=2;t.block=0;t.bone=0;t.intent={k:"wait"};t.waitTurns=0;return}
 if(t.id==="bishop"){t.n=ENEMY.bishop.n;t.bone=3;t.intent=ENEMY.bishop.ai(t,t.turn)}
 if(t.id==="rockfrog"){t.armor=0;t.block=0;t.molten=1}
 if(t.id==="general"){t.marks=0;t.unarm=1}
 if(t.id==="shadow"){shadowFake(t)}
 if(t.id==="cosmicegg"){t.str=(t.str||0)+3;t.cnt=Math.min(t.cnt==null?6:t.cnt,3)}
 if(t.id==="demon"){t.block=0;t.str=(t.str||0)+2}
 if(t.id==="youngyue"){t.str=(t.str||0)+3}
 if(t.id==="fourhead"){t.str=(t.str||0)+2}}
function shadowFake(t){if(!B||t.hp<=0)return;B.enemies.forEach(x=>{if(x.fake&&x.hp>0){x.hp=0;x.fled=1}});if(B.alive().length>=4)return;const m=mkEnemy("shadow",B.enemies.length+1);m.fake=1;m.real=t;m.n=t.n;m.max=t.max;m.hp=t.hp;m.block=t.block;m.intent=t.intent;m.form2=1;const i=B.enemies.indexOf(t);B.enemies.splice(rnd()<.5?i:i+1,0,m)}
function fakeHit(t){t.hp=0;t.fled=1;const el=enEl(t);if(el){const c=center(el.querySelector(".body"));fnum(c.x,c.top+30,"是假的！","txt");el.classList.add("fakePop")}sfx("click");setTimeout(()=>renderBattle(),350)}


/* ---- 4.0 出手动画：拳脚残影 / 骑士刀光 / 法阵 / 吸血鬼瞬移爪痕 ---- */
/* 4.2 语音彩蛋：奶蛙连击到第 4 下 / 其他主角打出连锁时，喊一声「安迪」或「嘎嘎滴辣虾」（每回合最多一次） */
function voiceEgg(){if(!B||PREV||B.vEggTurn===B.turn)return;B.vEggTurn=B.turn;M.vEggI=(M.vEggI||0)+1;const k=M.vEggI%2?"vAndi":"vGaga";setTimeout(()=>{try{if(sxPlay(k,1,1,0,{jit:0}))duck(.35,k==="vGaga"?1500:1100)}catch(e){}},220)}
function atkFx(D,t){const h=S.hero||"naiwa",pl=$("#player");t=(t&&t.hp>0)?t:pick(B.alive());if(!t)return;
 const heavy=D.cost>=2||!!D.tru;if(pl)pl.style.setProperty("--ak",heavy?"1.22":"1");const A1={naiwa:"atkNaiwa",kungfu:"atkKungfu",knight:"atkKnight",mage:"castA",vamp:"atkVamp"}[h]||"lungeR";
 if(h==="vamp"){if((B.combo||0)>=3)vampBlink(t);else anim(pl,A1);return}
 anim(pl,A1);if(heavy&&!PREV)setTimeout(()=>{try{stageShake()}catch(e){}},h==="knight"?260:200);if(h==="knight"){slashFx(t,D.cost>=2||!!D.tru);return}
 if(h==="kungfu")punchFx(t,(B.combo||0)>=3?Math.min(5,B.combo||0):-1,true);else punchFx(t,1,false)}
function fxPos(el){const c=center(el.querySelector(".body")||el);return{x:c.x,y:c.top+(c.y-c.top)*.9}}
function punchFx(t,n,fast){const pl=$("#player .body img"),te=enEl(t);if(!pl||!te)return;const a=fxPos($("#player")),b=fxPos(te);const dur=fast?Math.max(150,330-n*40):300;
 for(let i=0;i<n+1;i++){const g=document.createElement("img");g.src=pl.src;g.className="ghostAtk";const w=pl.getBoundingClientRect().width/($("#stage").getBoundingClientRect().width/1280);g.style.width=w+"px";g.style.left=(a.x-w/2)+"px";g.style.top=(a.y-w*.75)+"px";g.style.transitionDuration=dur+"ms";g.style.opacity=String(.55-i*.08);$("#fx").appendChild(g);
  setTimeout(()=>{g.style.transform=`translateX(${(b.x-a.x)*(.45+i*.07)}px)`;g.style.opacity="0"},i*Math.round(dur/4)+10);setTimeout(()=>g.remove(),dur+i*dur/4+80)}
 const f=document.createElement("div");f.className="punchStar";f.style.left=b.x+"px";f.style.top=b.y+"px";f.style.animationDelay=Math.round(dur*.55)+"ms";$("#fx").appendChild(f);setTimeout(()=>f.remove(),dur+600)}
function slashFx(t,heavy){const te=enEl(t);if(!te)return;const b=fxPos(te);const mk1=(rot,dl)=>{const d=document.createElement("div");d.className="slashArc"+(heavy?" heavy":"");d.innerHTML=`<svg viewBox="0 0 200 200"><defs><linearGradient id="sg${rot}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="${heavy?"#ffd23f":"#bfe3ff"}"/></linearGradient></defs><path d="M20 160 Q60 30 185 40 Q80 60 40 170Z" fill="url(#sg${rot})"/></svg>`;d.style.left=b.x+"px";d.style.top=b.y+"px";d.style.setProperty("--r",rot+"deg");d.style.animationDelay=dl+"ms";$("#fx").appendChild(d);setTimeout(()=>d.remove(),700+dl)};
 mk1(-20,120);if(heavy){mk1(150,260);setTimeout(()=>hitStop(130),200)}}
function vampBlink(t){const pb=$("#player .body"),te=enEl(t);if(!pb||!te)return;const img=pb.querySelector("img");const b=fxPos(te);const r=te.querySelector(".body").getBoundingClientRect(),k=1280/$("#stage").getBoundingClientRect().width;
 pb.classList.add("blinkOut");const g=document.createElement("img");g.src=img.src;g.className="vampGhost";const w=img.getBoundingClientRect().width*k;g.style.width=w+"px";g.style.left=(b.x+r.width*k*.32)+"px";g.style.top=(b.y-w*.8)+"px";$("#fx").appendChild(g);
 setTimeout(()=>{const c=document.createElement("div");c.className="clawMk";c.innerHTML="<i></i><i></i><i></i>";c.style.left=b.x+"px";c.style.top=b.y+"px";$("#fx").appendChild(c);setTimeout(()=>c.remove(),800)},140);
 setTimeout(()=>{g.classList.add("out");pb.classList.remove("blinkOut");pb.classList.add("blinkIn");setTimeout(()=>{g.remove();pb.classList.remove("blinkIn")},300)},420)}
function runeCircle(k){const el=$("#player .body");if(!el)return;const c=center(el);const C=(SPELLC[k]||SPELLC.arc)[0];const d=document.createElement("div");d.className="runeC";d.style.left=c.x+"px";d.style.top=(c.y+(c.y-c.top)*.82)+"px";d.style.setProperty("--rc",C);d.innerHTML=`<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="none" stroke="var(--rc)" stroke-width="5"/><circle cx="100" cy="100" r="74" fill="none" stroke="var(--rc)" stroke-width="2" stroke-dasharray="6 8"/><path d="M100 14 L174 143 L26 143Z M100 186 L26 57 L174 57Z" fill="none" stroke="var(--rc)" stroke-width="3"/>${[0,1,2,3,4,5].map(i=>`<circle cx="${100+83*Math.cos(i*Math.PI/3)}" cy="${100+83*Math.sin(i*Math.PI/3)}" r="5" fill="var(--rc)"/>`).join("")}</svg>`;$("#fx").appendChild(d);setTimeout(()=>d.remove(),900)}
/* ---- 4.0 暗器袋 ---- */
const ANQI_SVG={bomb:'<circle cx="20" cy="24" r="12" fill="#3a2a2a"/><circle cx="16" cy="20" r="3" fill="#fff8" /><path d="M26 13 q4 -6 9 -5" stroke="#c8901e" stroke-width="3" fill="none"/><circle cx="35" cy="8" r="3" fill="#ffd23f"/>',
caltrop:'<path d="M20 4 L24 18 L36 20 L24 23 L20 36 L16 23 L4 20 L16 18Z" fill="#9aa6b8" stroke="#2a2a3a" stroke-width="2"/>',
dart:'<path d="M20 3 L23 17 L37 20 L23 23 L20 37 L17 23 L3 20 L17 17Z" fill="#e8e8f0" stroke="#2a2a3a" stroke-width="2" transform="rotate(45 20 20)"/><circle cx="20" cy="20" r="3" fill="#2a2a3a"/>',
charm:'<rect x="11" y="5" width="18" height="30" rx="2" fill="#ffe88a" stroke="#2a2a3a" stroke-width="2"/><path d="M15 12 h10 M20 12 v18 M15 20 h10 M16 27 l8 -4" stroke="#d02020" stroke-width="2.5" fill="none"/>',
needle:'<path d="M8 32 L30 10" stroke="#e8e8f0" stroke-width="3"/><circle cx="31" cy="9" r="2.5" fill="none" stroke="#e8e8f0" stroke-width="1.5"/><path d="M10 26 q-3 6 0 8 q3 -2 0 -8z" fill="#ff3a6a"/>',
smoke:'<circle cx="14" cy="24" r="8" fill="#b7b0c9"/><circle cx="24" cy="18" r="10" fill="#cfc8dd"/><circle cx="28" cy="27" r="7" fill="#a59ebb"/>',
boomer:'<path d="M8 10 Q20 22 32 10 L34 14 Q20 32 6 14Z" fill="#c8901e" stroke="#2a2a3a" stroke-width="2"/>',
candy:'<circle cx="20" cy="20" r="8" fill="#ff8fd0" stroke="#2a2a3a" stroke-width="2"/><path d="M12 20 L4 14 L4 26Z M28 20 L36 14 L36 26Z" fill="#ffd0ea" stroke="#2a2a3a" stroke-width="2"/>',
cracker:'<rect x="14" y="10" width="12" height="24" rx="2" fill="#e02020" stroke="#2a2a3a" stroke-width="2"/><path d="M20 10 q3 -4 6 -5" stroke="#2a2a3a" stroke-width="2" fill="none"/><circle cx="27" cy="5" r="2.5" fill="#ffd23f"/><path d="M14 18 h12 M14 26 h12" stroke="#ffd23f" stroke-width="2"/>',
mudball:'<circle cx="20" cy="21" r="12" fill="#8a6038" stroke="#2a1a0a" stroke-width="2"/><circle cx="15" cy="17" r="3" fill="#a87a4a"/><circle cx="24" cy="25" r="2" fill="#6a4628"/>'};
function anqiIcon(k){return `<svg viewBox="0 0 40 40" width="100%" height="100%">${ANQI_SVG[k]||""}</svg>`}
function renderBag(newK){if(!B){const ob=$("#bag");if(ob)ob.remove();return}let b=$("#bag");if(!b){b=document.createElement("div");b.id="bag";$("#battle").appendChild(b)}const bag=B.bag||[];
 b.innerHTML=`<em>暗器</em>`+[0,1,2].map(i=>{const k=bag[i];return k?`<button class="aq${S.hero&&ANQI[k].fav===S.hero?" fav":""}${i===bag.length-1&&newK?" new":""}" data-i="${i}" style="--ac:${ANQI[k].c}" aria-label="${ANQI[k].n}">${anqiIcon(k)}</button>`:`<span class="aq empty"></span>`}).join("")+(bag.length===3&&bag.every(x=>x===bag[0])?"":(bag.length>=2&&bag[0]===bag[1]&&bag.length===2?`<i class="aqHint">再来 1 个一样的就引爆！</i>`:""));
 b.querySelectorAll(".aq[data-i]").forEach(el=>{let lp=0,tm=null;el.onpointerdown=()=>{lp=0;tm=setTimeout(()=>{lp=1;const k=bag[+el.dataset.i];tipAt(el,`<b>${ANQI[k].n}</b>${ANQI[k].fav?`<small> · ${HEROES.find(h=>h.id===ANQI[k].fav).n}擅长</small>`:""}<p>${ANQI[k].d}</p><p style="opacity:.7">点一下扔出去，不花奶力</p>`)},380)};el.onpointerup=el.onpointerleave=()=>clearTimeout(tm);el.onclick=ev=>{ev.stopPropagation();if(lp)return;useAnqi(+el.dataset.i)}})}
function anqiPow(k){return ANQI[k].fav===S.hero?1.5:1}
function anqiFx(k,mul){const al=B.alive(),m=v=>Math.round(v*mul*anqiPow(k));const rt=()=>pick(B.alive());const pc=center($("#player .body"));
 const throwFx=t=>{if(PREV)return;const el=t?enEl(t):null;if(!el)return;const c=center(el.querySelector(".body"));const f=document.createElement("div");f.className="aqFly";f.innerHTML=anqiIcon(k);f.style.left=pc.x+"px";f.style.top=(pc.top+60)+"px";$("#fx").appendChild(f);requestAnimationFrame(()=>{f.style.transform=`translate(${c.x-pc.x}px,${c.top+40-pc.top-60}px) rotate(540deg)`});setTimeout(()=>f.remove(),420)};
 B.curType="anqi";
 if(k==="bomb"){al.forEach(e=>{throwFx(e);B.hit(e,m(6),1,1)});sfx("boom")}
 else if(k==="caltrop"){B.block(m(6),1);B.p.thorn=(B.p.thorn||0)+Math.round(2*anqiPow(k)*mul)}
 else if(k==="dart"){const n=3;for(let i=0;i<n;i++){const t=rt();if(!t)break;throwFx(t);B.p.critUp=(B.p.critUp||0)+.25;B.hit(t,m(3),1,1);B.p.critUp-=.25}}
 else if(k==="charm"){const t=rt();if(t){throwFx(t);const el=pick(["fire","ice","thunder"]);B.curElem=el;B.hit(t,m(6),1,1);B.curElem=null;if(t.hp>0){if(el==="fire")B.apply(t,"burn",Math.round(3*mul));else if(el==="ice")B.apply(t,"weak",1);else B.apply(t,"vuln",1)}}}
 else if(k==="needle"){const t=rt();if(t){throwFx(t);B.apply(t,"bleed",m(4));B.curPink=true;B.curType="atk";B.hit(t,m(2),1,1);B.curPink=false}}
 else if(k==="smoke"){al.forEach(e=>B.apply(e,"weak",Math.max(1,Math.round(mul))))}
 else if(k==="boomer"){al.forEach(e=>{throwFx(e);B.hit(e,m(4),1,1)});if(mul===1&&rnd()<.5){setTimeout(()=>{if(B&&!B.over&&(B.bag||[]).length<3){B.bag.push("boomer");renderBag("boomer");toast("回旋镖飞回来了！")}},500)}}
 else if(k==="candy"){B.heal(m(5))}
 else if(k==="cracker"){for(let i=0;i<5;i++){const t=rt();if(!t)break;throwFx(t);B.hit(t,m(2),1,1)}crackle(7,.14)}
 else if(k==="mudball"){const i=B.pool.findIndex(x=>x.f==="mud");if(i>=0){B.pool.splice(i,1);renderPool()}B.block(m(4),1)}
 B.curType=null}
function useAnqi(i){if(!B||B.over||!B.myTurn||busy)return;const k=(B.bag||[])[i];if(!k)return;B.bag.splice(i,1);S.stats.anqi=(S.stats.anqi||0)+1;questTick("anqi");if(S.stats.anqi>=20)ach("anqi20");anim($("#player"),"lungeR");sfx("throw");anqiFx(k,1);B.poolAdd("snake");if(B.p.pw2&&B.p.pw2.anqiDraw&&B.anqiDrew!==B.turn){B.anqiDrew=B.turn;B.draw(1)}renderBag();renderBattle();if(!B.alive().length){win();return}afterAction()}
async function anqiTriple(k){if(!B||B.over)return;const bag=B.bag||[];if(bag.filter(x=>x===k).length<3)return;questTick("anqi3");busy=true;try{for(let j=0;j<3;j++)bag.splice(bag.indexOf(k),1);renderBag();banner(ANQI[k].n+" × 3 · 引爆！",0);stageShake();sfx("boom");await sleep(450);anqiFx(k,4);ach("anqi3");renderBattle();await sleep(400)}finally{busy=false;if(B)afterAction()}}
function renderEggs(pop){if(!B)return;const pl=$("#player");if(!pl)return;let w=pl.querySelector(".eggs");if(!w){w=document.createElement("div");w.className="eggs";pl.querySelector(".body").appendChild(w)}w.innerHTML=(B.eggs||[]).map((e,i)=>`<i class="egg${e.gold?" gold":""}${pop&&i===B.eggs.length-1?" pop":""}" style="${e.st==="burn"?"background:#ff6a4a":e.st==="weak"?"background:#6ab8ff":e.h?"background:#ffb0c8":e.any?"background:linear-gradient(135deg,#ff8ad8,#8ad8ff,#fff08a)":""}"><b>${e.t}</b></i>`).join("")}
async function hatchEggs(){if(!B||!(B.eggs||[]).length)return;B.eggs.forEach(e=>{if(e.nw)delete e.nw;else e.t--});const ready=B.eggs.filter(e=>e.t<=0);B.eggs=B.eggs.filter(e=>e.t>0);renderEggs();if(ready.length&&!PREV&&S.hero==="naiwa")setTimeout(()=>{try{if(sxPlay("vAndi",1,1,0,{jit:0}))duck(.35,1100)}catch(e){}},120);for(const e of ready){if(B.over||!B.alive().length)break;toast(e.gold?"大蛋孵出来了！":e.d>0?"蛋孵出来了：小奶鸡啄了上去！":"蛋孵出来了！");sfx("egg");B.curType="egg";const ed=Math.round(e.d*(1+.5*perk("egg")));if(ed>0){if(e.all)B.alive().forEach(x=>{B.hit(x,ed,1,1);if(e.st&&x.hp>0)B.apply(x,e.st,e.sv||1)});else{const t=pick(B.alive());if(t){B.hit(t,ed,1,1);if(e.st&&t.hp>0)B.apply(t,e.st,e.sv||1)}}}B.curType=null;if(e.h)B.heal(e.h);if(e.coin){S.gold+=e.coin;sfx("coin");renderTop()}if(e.twin)B.layEgg({t:1,d:4,b:0,nw:1});if(e.rnd){const k=ri(4);if(k===0){const t=pick(B.alive());if(t)B.hit(t,12,1,1)}else if(k===1)B.heal(8);else if(k===2)B.gainEnergy(2);else B.draw(2)}if(e.any)B.poolAdd("any");if(e.dr)B.draw(e.dr);if(e.b)B.block(e.b,1);if(e.e)B.gainEnergy(e.e);S.stats.hatch=(S.stats.hatch||0)+1;questTick("hatch");if(S.stats.hatch>=10)ach("hatch10");renderBattle();await sleep(320)}if(!B.alive().length&&!B.over)win()}
/* ---- 吸血鬼奶蛙 ---- */
function vampUseless(id){const D=CARDS[id];if(D.fam==="chick")return true;let t="";try{t=D.d(false)}catch(e){}return /护盾/.test(t)&&!/伤害|抽|奶力|回复/.test(t)}
function vampLs(loss){if(!B||PREV)return;let r=B.vForm||B.rebelNow?.9:.42;if(has("qz_pact")&&S.hp<S.max/2)r*=2;r*=B.lsMul||1;if(has("mr_watch")&&!B.watchUsed){B.watchUsed=1;r*=2;relicPulse("mr_watch")}const h=Math.max(1,Math.floor(loss*r))+(B.p.nightLs||0);B.vLs=(B.vLs||0)+h;const before=S.hp;S.hp=Math.min(S.max,S.hp+h);const got=S.hp-before;if(got>0){const c=center($("#player .body"));fnum(c.x+30,c.top+10,"+"+got,"heal")}renderTop()}
const RAGE={naiwa:{n:"顿悟",sub:"奶力 +2 · 力气 +4 · 抽 2",say:"……原来如此。我睡了那么久，就是为了这一刻醒过来。"},kungfu:{n:"通透世界",sub:"本回合每一拳都暴击",say:"师父说过，看得见风的时候，拳就到了。"},knight:{n:"顿悟",sub:"奶力 +2 · 力气 +3 · 护盾 +15",say:"剑小又怎样，村口那扇门，我守了十年！"},mage:{n:"星之力",sub:"奶力 +2 · 魔力 +4",say:"老师，您看——星星听我的了。"}};
function rageGain(v){if(!S||!RAGE[S.hero]||S.rageUsed||PREV)return;v*=1+.3*perk("rage");const o=S.rage||0;S.rage=Math.min(100,o+v);if(o<100&&S.rage>=100){toast(`<b>${RAGE[S.hero].n}</b>攒满了！点主角头上的按钮发动（用完可以重新攒）`);sfx("relic")}rageUI()}
function rageUI(){const pl=$("#player");if(!pl||!S)return;let w=pl.querySelector(".rageW");if(!RAGE[S.hero]||S.rageUsed){if(w)w.remove();return}if(!w){w=document.createElement("div");w.className="rageW";w.innerHTML=`<i class="rf"></i><span></span><button class="rageGo"></button>`;const hw=pl.querySelector(".hpw");if(hw)hw.after(w);else pl.appendChild(w);w.querySelector(".rageGo").onclick=ev=>{ev.stopPropagation();rageGo()}}const v=Math.floor(S.rage||0);w.querySelector(".rf").style.width=v+"%";w.querySelector("span").textContent=RAGE[S.hero].n+" "+v+"%";w.classList.toggle("full",v>=100);w.querySelector(".rageGo").textContent=RAGE[S.hero].n+"！"}
function rageGo(){if(!B||B.over||!B.myTurn||busy||S.rageUsed||(S.rage||0)<100)return;const R0=RAGE[S.hero];if(!R0)return;S.rageUsed=0;S.rage=0;B.rageOn=S.hero;B.rageUsedHere=1;const p=B.p;B.cutTurn=-1;cutIn(R0.n+"！",R0.sub);heroSay(R0.say,1);$("#player").classList.add("rageOn");
 if(S.hero==="naiwa"){B.gainEnergy(2);p.tstr=(p.tstr||0)+4;B.draw(2)}else if(S.hero==="kungfu"){B.gainEnergy(1);p.tstr=(p.tstr||0)+2;B.draw(2)}else if(S.hero==="knight"){B.gainEnergy(2);p.tstr=(p.tstr||0)+3;B.block(15)}else if(S.hero==="mage"){B.gainEnergy(2);p.mana=(p.mana||0)+4}
 ach("rage");saveRun&&0;rageUI();renderBattle();renderHand&&renderHand()}
function vampForm(force){if(!B||B.over||B.vForm||S.hero!=="vamp")return;B.vForm=1;{const im=$("#player .body img");if(im)im.src=IMG("v_vamps")}$("#player").classList.add("vform");sfx("cutin");cutIn("血月！","吸血全开");toast("进入<b>血月形态</b>：攻击全部吸血，攻击 +3");B.p.str=(B.p.str||0)+3;ach("bloodmoon")}
function dealEnemy(t,d,i=0){if(!PREV&&t&&t.id==="pearlqueen"&&B&&B.alive().some(x=>x.id==="teacup")&&d>0){fxSay(t,"杯子护着它！");return}if(B&&!PREV&&t.hp>0)B.hpPre=S.hp;if(!PREV&&t.fake){fakeHit(t);return}if(!PREV&&t.reviving)return;if(PREV){const blk=B.pierce?0:Math.max(0,Math.min((t.block||0)-(PREV.blk[t.k]||0),d));PREV.blk[t.k]=(PREV.blk[t.k]||0)+blk;PREV.d[t.k]=(PREV.d[t.k]||0)+(d-blk);return}if(ENEMY[t.id].boss&&has("bossbane")&&B.curType)d=Math.round(d*1.25);if(ENEMY[t.id].boss&&!(B&&B.curTru))d=bossGuard(t,d);if(has("lavastone")&&B.curType==="atk"&&t.hp>0)t.burn=(t.burn||0)+1;const blk=B&&(B.pierce||B.curTru)?0:Math.min(t.block,d);if(blk&&blk===t.block&&t.block>=5&&!(B&&B.pierce))B._shBreak=t;t.block-=blk;const loss=d-blk;t.hp=Math.max(0,t.hp-loss);let pk=0;if(B&&B.curPink&&loss>0&&t.hp>0&&B.curType==="atk"){pk=Math.max(1,Math.round((t.id==="dummy"?1000:t.max)*.01));pk=Math.min(pk,t.hp);t.hp-=pk;S.stats.dmg+=pk;S.hp=Math.min(S.max,S.hp+pk)}if(S.hero==="vamp"&&B&&B.curLs&&loss>0)vampLs(loss);S.stats.dmg+=loss;if(B&&B.curType){S.stats.maxHit=Math.max(S.stats.maxHit||0,loss);if(loss>=30)questTick("big30");if(loss>=50)ach("hit50");if(loss>=100)ach("hit100");if(loss>=200)ach("hit200")}if(ENEMY[t.id].boss)bossAfterHit(t,d,loss);if(ENEMY[t.id].boss&&t.hp>0&&t.hp<=t.max/2&&B&&!B.rageMus){B.rageMus=1;musicRage(1);toast("首领急了！")}if(t.thorn&&B.curType==="atk"&&loss>=0&&!B.thornLock){B.thornLock=1;setTimeout(()=>{if(B){B.thornLock=0;dmgPlayer(t.thorn,null,true);if(S.hp<=0)lose()}},120)}
 if(t.af==="split"&&!t.splitDone&&t.hp>0&&t.hp<=t.max/2){t.splitDone=1;setTimeout(()=>{if(!B||B.over||B.alive().length>=4)return;const m=mkEnemy(t.id,9);m.n="分身·"+ENEMY[t.id].n;m.clone=1;m.max=Math.ceil(t.max*.4);m.hp=m.max;m.intent=ENEMY[t.id].ai(m,0);B.enemies.push(m);const el2=enEl(t);if(el2)say(el2.querySelector(".body"),"分身术！");renderBattle()},400)}
 if(ENEMY[t.id].boss&&!t.guard&&t.hp>0&&!t.rage&&t.hp<=t.max*.25){t.rage=1;t.str=(t.str||0)+3;setTimeout(()=>{const el2=enEl(t);if(el2){say(el2.querySelector(".body"),"我，生气了！！");anim(el2,"buffA")}toast(`${t.n}<b>狂暴了</b>：力气 +3`)},500)}
 if(t.hp>0&&!t.lowSaid&&t.hp<=t.max*.3){t.lowSaid=1;setTimeout(()=>{const el2=enEl(t);if(el2&&t.hp>0)say(el2.querySelector(".body"),eLine(t,"l"))},350)}
 const el=enEl(t);const HK=hitKind(),HF=B&&B.curType?B.curFam:null,HO={d:loss,crit:!!(B&&B._crit)};if(el){const c=center(el.querySelector(".body"));setTimeout(()=>{anim(el,d>=18?"hitBig":"hit");if(d>=10)hitStop(d>=22?120:55);if(d>=18){const ar=$("#arena");if(ar){ar.classList.remove("zoomP");void ar.offsetWidth;ar.classList.add("zoomP")}}hitFx(c.x+(Math.random()*30-15),c.y+(Math.random()*30-15),d>=18,!loss,HF,HK,HO)},i*70);{const cr=B&&B._crit,tr=B&&B.curTru&&loss;fnum(c.x+(i%2?18:-18),c.top+30,loss?(cr?"暴击 "+loss:tr?"真伤 "+loss:loss):"格挡",loss?(cr?"crit":tr?"tru":B&&B.dotElem?"el-"+B.dotElem:B&&B.curElem?"el-"+B.curElem:""):"blk",i*70);if(pk){fnum(c.x+(i%2?-30:30),c.top+80,"吸 "+pk,"pink",i*70+180);const pc=center($("#player .body"));fnum(pc.x,pc.top+20,"+"+pk,"pink",i*70+260)}if(B&&B._shBreak===t){B._shBreak=null;setTimeout(()=>{shieldBreakFx(el);},i*70)}}if(d>=18)setTimeout(stageShake,i*70)}
 if(t.id==="snakered"&&!t.shed&&t.hp>0&&t.hp<=t.max/2){t.shed=1;t.block+=20;setTimeout(()=>{if(el){bubble(el,"……嘶。旧皮不要了。");anim(el,"buffA")}toast(`${t.n}<b>蜕皮</b>了：护盾 +20`)},300)}
 if(t.id==="giant"&&!t.enraged&&t.hp>0&&t.hp<=t.max/2){t.enraged=1;t.turn=0;t.intent=ENEMY.giant.ai(t,0);setTimeout(()=>el&&bubble(el,"你惹我生气了！"),300)}
if((ENEMY[t.id].flee||t.timid)&&t.hp>0&&t.hp<=t.max/2){t.fled=1;t.hp=0;if(t.timid)B.lootRelic=1;setTimeout(()=>{if(el)bubble(el,t.timid?"我、我把宝贝留下，饶了我吧！":"不错嘛，我们塔顶见。");renderBattle();if(B&&!B.alive().length)win()},200);return}
 if(ENEMY[t.id].boss&&t.id!=="king"&&!t.phase2&&t.hp>0&&t.hp<=t.max*(asc()>=3?.65:.5)){t.phase2=1;t.turn=0;t.intent=ENEMY[t.id].ai(t,0);t.block+=15;{const sm={snakeking:["snakelet","snakelet"],cosmicegg:["starchick","starchick"],pearlqueen:["teacup","teacup"]}[t.id];if(sm)setTimeout(()=>{sm.forEach((id,j)=>{if(B.alive().length>=4)return;const m=mkEnemy(id,j);m.intent=ENEMY[id].ai(m,0);B.enemies.unshift(m)});renderBattle()},500)}if(FORM2[t.id]&&!FORM2[t.id].life){formQ(t,"half")}else setTimeout(()=>el&&bubble(el,({count:"我的血，还不够！",snakeking:"孩子们，出来咬他！",buddha:"金身，开光！",cosmicegg:"咔嚓，要孵出来了！",pearlqueen:"满上！一口气倒两杯！",lavagiant:"火，给我烧得更旺！"}[t.id]||"现在，轮到我了。")),300)}
 if(t.id==="king"&&!t.phase2&&t.hp>0&&t.hp<=t.max/2){t.phase2=1;t.turn=0;t.intent=ENEMY.king.ai(t,0);t.block+=10;
  formQ(t,"half");setTimeout(()=>{for(let j=0;j<2;j++){if(B.alive().length>=4)break;const m=mkEnemy("mudling",j);m.intent=ENEMY.mudling.ai(m,0);B.enemies.unshift(m)}renderBattle()},400)}
 if(t.hp<=0)killEnemy(t)}
/* ---- 抓捕：血量够低才能抓；越强、难度越高越容易挣脱 ---- */
const catchTh=()=>has("otherball")&&B&&!B.ballUsed?.5:.35;
function catchable(e){if(!e||!B||B.kind==="R")return false;const E=ENEMY[e.id];return!!E&&!!E.pal&&!E.boss&&!e.clone&&!e.guard&&!"BFK".includes(B.kind||"")}
function catchChance(e){const E=ENEMY[e.id];let p=(E.elite?.55:.94)-(E.catchHard||0)-.05*(S.act||0);p+={easy:.12,normal:0,hard:-.14}[S.diff||"normal"]||0;p-=asc()*.02;
 p+=Math.max(0,catchTh()-e.hp/e.max)*1.4;if(has("otherball")&&!B.ballUsed)p+=.15;if(S.mod==="pal")p+=.1;if(S.mod==="hunter")p+=.15;return Math.max(.2,Math.min(1,p))}
function canCatch(e){return!!B&&B.myTurn&&!busy&&!!e&&e.hp>0&&!e.fled&&!e.caught&&catchable(e)&&B.catchLeft>0&&e.hp<=Math.ceil(e.max*catchTh())}
function catchUI(){if(!B)return;B.enemies.forEach(e=>{const el=enEl(e);if(!el)return;const ok=canCatch(e);el.classList.toggle("canCatch",ok);el.classList.toggle("palable",catchable(e)&&e.hp>0&&!e.caught&&B.catchLeft>0);const b=el.querySelector(".catchBtn i");if(b&&ok){const t=Math.round(catchChance(e)*100)+"%";if(b.textContent!==t)b.textContent=t}const hb=el.querySelector(".hpw .hpbar");if(hb){let ln=hb.querySelector(".catchLn");const show=false;if(show&&!ln){ln=document.createElement("b");ln.className="catchLn";ln.innerHTML=ICON.net;hb.appendChild(ln)}if(ln){ln.style.display=show?"":"none";ln.style.left=(catchTh()*100)+"%";ln.classList.toggle("in",e.hp<=Math.ceil(e.max*catchTh()))}}})}
setInterval(()=>{try{catchUI()}catch(e){}},250);
async function catchEnemy(e){try{await catchEnemy0(e)}catch(err){console.log("catch err",err)}finally{busy=false;try{afterAction()}catch(x){}}}
async function catchEnemy0(e){
 if(!canCatch(e)){if(!B||busy||!B.myTurn||!e||e.hp<=0)return;
  if(!catchable(e))toast(ENEMY[e.id].boss?"首领抓不住":"这个抓不了");else if(B.catchLeft<=0)toast("这场战斗已经抓过了");else toast(`血量还太高，打到 <b>${Math.ceil(e.max*catchTh())}</b> 以下才能抓`);
  const el0=enEl(e);if(el0)shakeEl(el0.querySelector(".body"));return}
 const cc=S.mod==="pal"||(has("otherball")&&!B.ballUsed)?0:1;if(B.p.energy<cc){toast("抓它需要 1 点奶力");shakeEl($("#energy"));return}
 const chance=catchChance(e),ok=rnd()<chance;
 const ball=has("otherball")&&!B.ballUsed;busy=true;if(ball){B.ballUsed=1;if(e.hp>Math.ceil(e.max*.35)||cc)toast("另一个世界的奶蛙球发光了")}else B.p.energy-=cc;B.catchLeft--;const el=enEl(e);const c=center(el.querySelector(".body"));
 const n=document.createElement("div");n.className="netFx";n.innerHTML=`<div class="netIn"><img src="${NET_IMG}" alt=""></div>`;n.style.left=c.x+"px";n.style.top=(c.y+10)+"px";$("#fx").appendChild(n);sfx("throw");
 el.classList.add("netted");await sleep(520);
 for(let k=0;k<3;k++){n.classList.remove("wig");void n.offsetWidth;n.classList.add("wig");sfx("click");await sleep(320);if(!ok&&k===(chance>.6?2:1))break}
 el.classList.remove("netted");
 if(!ok){ach("netfail");M.netFail=(M.netFail||0)+1;if(M.netFail>=3)ach("netfail3");n.classList.add("tear");sfx("catchFail");const bt=document.createElement("div");bt.className="catchRes fail";bt.innerHTML=`<b>挣脱了！</b><small>成功率 ${Math.round(chance*100)}%</small>`;bt.style.left=c.x+"px";bt.style.top=(c.y-40)+"px";$("#fx").appendChild(bt);setTimeout(()=>bt.remove(),1600);setTimeout(()=>n.remove(),500);
  shakeEl(el.querySelector(".body"));say(el.querySelector(".body"),pick(["想抓我？没那么容易！","哼，网破了！","差一点点哦～","再来啊！"]));
  toast(B.catchLeft>0?`<b>${e.n}</b> 挣脱了网！还能再抓 ${B.catchLeft} 次`:`<b>${e.n}</b> 挣脱了网！这场战斗的抓捕机会用完了`);renderBattle();await sleep(400);return}
 if(e.id==="isekaiX")ach("isekai2");if(ENEMY[e.id].elite)ach("netelite");
 e.hp=0;e.caught=1;el.classList.add("caught");setTimeout(()=>enGone(el),760);n.classList.add("got");setTimeout(()=>n.remove(),600);sparks(c.x,c.y,"#b392ff",18);sfx("catchOk");
 {const bt=document.createElement("div");bt.className="catchRes ok";bt.innerHTML=`<b>抓到了！</b><small>${e.n}</small>`;bt.style.left=c.x+"px";bt.style.top=(c.y-40)+"px";$("#fx").appendChild(bt);setTimeout(()=>bt.remove(),1600)}
 questTick("catch");const pal=ENEMY[e.id].pal;B.caught.push(pal);S.stats.caught++;if(S.stats.caught>=5)ach("pals5");M.palN=(M.palN||0)+1;if(M.palN>=20)ach("pals");if(typeof M.pals!=="object"||!M.pals)M.pals={};M.pals[pal]=1;seeCard(pal);saveMeta();
 if(e.stolen){S.gold+=e.stolen;toast(`拿回了 <b>${e.stolen}</b> 金币`);e.stolen=0}
 toast(`抓到了 <b>${e.n}</b>！战斗结束后，伙伴卡「${CARDS[pal].n}」会加入牌组`);
 await sleep(500)}
function killEnemy(t){S.stats.kills++;questTick("kill");if(t.id==="shadow"&&!t.fake&&B)B.enemies.forEach(x=>{if(x.fake){x.hp=0;x.fled=1}});rageGain(ENEMY[t.id].boss?8:ENEMY[t.id].elite?5:1);sfx(ENEMY[t.id].boss?"bigkill":"kill");if(ENEMY[t.id].boss&&!t.guard)S.stats.endb=(S.stats.endb||0)+1;if(ENEMY[t.id].boss)S.stats.bosses=(S.stats.bosses||0)+1;M.kills=(M.kills||0)+1;if(M.kills>=100)ach("kill100");if(M.kills>=1000)ach("kill1000");if(t.id==="demon")ach("demon");if(t.id==="fallen"&&t.stole){S.deck.push(t.stole);toast(`你从笼子里救回了「${cname(t.stole)}」`);t.stole=null}if(t.id==="count"&&S.hero==="vamp")ach("father");if(t.id==="witch"&&S.hero==="mage"&&!M.mageStar){M.mageStar=1;saveMeta();setTimeout(()=>toast("女巫倒下了，留给你一颗星星。<b>星之攻击</b>解锁：之后每次放法术，都会多落下一道 3 点的星光（无视护盾）"),1500)}if(t.id==="snowking")ach("snowkill");if(t.id==="abyssdragon")ach("abysskill");if(t.guard)ach("guard");if(t.id==="mimic")ach("mimic");if(t.id==="goldfrog")ach("goldfrog");if(has("vampfang"))S.hp=Math.min(S.max,S.hp+4);if(ENEMY[t.id].boss&&BOSS_LORE[t.id]){M.boss=M.boss||{};const r=M.boss[t.id]=M.boss[t.id]||{};r.k=(r.k||0)+1;saveMeta();if(Object.keys(BOSS_LORE).every(k=>(M.boss[k]||{}).k))ach("allboss")}if(has("pearlbag"))B.extraGold+=8;if(t.af==="rich"){B.extraGold+=60;toast("富有的敌人掉了 <b>60</b> 金币")}if(t.af==="glitter")B.shinyLoot=1;if(t.id==="goldfrog"){B.goldKill=1;toast("打倒了<b>金色奶蛙</b>！金币哗啦啦地掉了一地")}B.alive().forEach(a=>{if(a.af==="vengeful"&&a!==t){a.str+=3;const el2=enEl(a);if(el2)say(el2.querySelector(".body"),"你竟敢！（力气 +3）")}});if(rnd()<.3)setTimeout(()=>heroSay(pick(HL("kill"))),500);if(t.stolen){S.gold+=t.stolen;toast(`抢回了 <b>${t.stolen}</b> 金币`);t.stolen=0}
 if(has("cape")){relicPulse("cape");setTimeout(()=>B&&B.heal(3),300)}
 if(t.id==="king")B.enemies.forEach(e=>{if(e.hp>0){e.hp=0}})}
const ULT={king:{n:"泥巴海啸",m:1.5,s:"mud",d:4},snakeking:{n:"万蛇噬咬",m:.5,x:4},count:{n:"血月之吻",m:1.7,s:"weak",d:2},buddha:{n:"金刚掌",m:1.6,p:1},iceking:{n:"冰河时代",m:1.5,s:"weak",d:2},snowking:{n:"超级雪球",m:2},lavagiant:{n:"火山爆发",m:1.5,s:"burn",d:5},pearlqueen:{n:"滚烫满壶",m:.6,x:3,s:"burn",d:3},shadow:{n:"影分身连斩",m:.45,x:5},cosmicegg:{n:"超新星",m:2.2},rockfrog:{n:"落石",m:1.6},fallen:{n:"审判之光",m:1.5,s:"weak",d:2},thunderking:{n:"天雷",m:1.7,p:1},fourhead:{n:"四重奏",m:.4,x:4},abyssdragon:{n:"深渊之口",m:1.8,s:"vuln",d:2},fogwhite:{n:"白雾吞没",m:1.6,s:"weak",d:2},witch:{n:"厄运诅咒",m:1.4,s:"vuln",d:3},bloodbeast:{n:"撕咬",m:.55,x:4},boilerdragon:{n:"锅炉爆燃",m:1.6,s:"burn",d:6},tophat:{n:"最后的魔术",m:2,p:1},demon:{n:"大魔王之锅",m:2,p:1},_:{n:"全力一击",m:1.8}};
function bossHard(e){if(!(e&&ENEMY[e.id]&&ENEMY[e.id].boss&&S))return 1;return (S.diff==="hard"?1.1:1)*(1+.05*Math.min(10,asc()))}
function maxAtk(e){let m=10;for(let i=0;i<8;i++){const I=ENEMY[e.id].ai(e,i);if(I&&(I.k==="atk"||I.k==="atkdef"))m=Math.max(m,I.v)}return m}
function PW(B,k,v){B.p.pw2=B.p.pw2||{};B.p.pw2[k]=(B.p.pw2[k]||0)+v}
function nextIntent(e,t){const E=ENEMY[e.id];if(e.waitTurns>0)return{k:"wait"};if(e.intent&&e.intent.k==="stun"&&e.stunCD===3){e.stunCD=2;return{k:"stun"}}if(!E.boss)return E.ai(e,t);
 if(e.charging){e.charging=0;e.sinceUlt=0;const u=ULT[e.id]||ULT._;e.brkNeed=Math.round(e.max*.15);e.brkGot=0;return{k:"atk",v:Math.round(maxAtk(e)*u.m),x:u.x||1,ult:u.n,pierce:u.p,s:u.s,d:u.d}}
 e.sinceUlt=(e.sinceUlt||0)+1;
 if(!e.guard&&t>=2&&e.sinceUlt>=3&&rnd()<.6){e.charging=1;return{k:"charge"}}
 if(B&&B.p.block>=14&&rnd()<.5)return{k:"atk",v:Math.round(maxAtk(e)*.75),pierce:1};
 if(rnd()<.16)return pick([{k:"debuff",s:"vuln",v:2},{k:"debuff",s:"weak",v:2},{k:"debuff",s:"burn",v:4}]);
 let I,n=0;do{I=E.ai(e,t+Math.floor(rnd()*8))}while(n++<6&&e.lastI&&JSON.stringify(I)===e.lastI);e.lastI=JSON.stringify(I);return I}
function dmgPlayer(v,src,raw){const p=B.p;let d=v;if(S.hero==="vamp")p.block=0;if(!raw){if(src){d+=src.str;if(src.weak>0)d*=.75;if(src.frost>0)d*=.75;d*=DF().dmg*bossHard(src)}if(p.vuln>0)d*=1.5;if(B.brittle)d*=1.25}d=Math.max(0,Math.floor(d));
 if(!raw&&src&&d>0){if(src.night>0&&Math.random()<.15*src.night){fxSay(src,"梦魇！打到了自己");dealEnemy(src,d);renderBattle();return}
  let miss=0;if(p.evade>0){p.evade--;if(Math.random()<.5)miss=1}if(!miss&&(p.dex||0)>0&&Math.random()<Math.min(.3,.03*p.dex))miss=1;
  if(miss){const c0=center($("#player .body"));fnum(c0.x,c0.top+30,"闪开！","txt");anim($("#player"),"lungeR");sfx("dodge");S.stats.dodged=(S.stats.dodged||0)+1;if(p.pw2&&p.pw2.dodgeheal)B.heal(p.pw2.dodgeheal);if(p.pw2&&p.pw2.dodgestr){p.tstr=(p.tstr||0)+p.pw2.dodgestr}if(has("qz_taiji")){relicPulse("qz_taiji");B.draw(1);B.gainEnergy(1)}if(p.redirect&&src&&src.hp>0){const rv=p.redirect;setTimeout(()=>{if(!B||B.over||src.hp<=0)return;dealEnemy(src,rv);fxSay(src,"借力打力 "+rv);renderBattle();if(!B.alive().length)win()},150)}if(p.pw2&&p.pw2.flow&&src.hp>0){const pf=p.pw2.flow;setTimeout(()=>{if(!B||B.over||src.hp<=0)return;dealEnemy(src,pf);src.inj=Math.min(10,(src.inj||0)+2);renderBattle()},150)}renderBattle();return}}if(!raw&&p.dodge>0&&d>0){const dd=Math.min(p.dodge,d);d-=dd;p.dodge=0;const c0=center($("#player .body"));fnum(c0.x,c0.top+40,"闪身 -"+dd,"txt")}
 let blk=raw?0:Math.min(p.block,d);B._lastSrc=src;if(!raw&&B._pierce&&p.block&&!p.noBrittle){const sb=Math.min(p.block,d*2);blk=Math.min(d,Math.ceil(sb/2));p.block+=blk-sb;if(p.block<=0)toast("破防：护盾被打穿了！");else toast(`破防：护盾多掉了 <b>${sb-blk}</b>`)}const hadBlk=p.block;p.block-=blk;const loss=d-blk;if(src&&src.id==="fallen"&&loss>0)src.dealt=(src.dealt||0)+loss;S.hp=Math.max(0,S.hp-loss);if(!raw&&src&&blk>0&&loss===0&&has("qz_counter")&&src.hp>0){const cv=blk;setTimeout(()=>{if(!B||B.over||src.hp<=0)return;relicPulse("qz_counter");dealEnemy(src,cv);fxSay(src,"反击 "+cv);renderBattle();if(!B.alive().length)win()},140)}if(!raw&&src&&blk>0&&p.pw2&&p.pw2.ironwall&&(B.iwStr||0)<4){B.iwStr=(B.iwStr||0)+1;p.str=(p.str||0)+1;toast(`铁壁：力气 +1（${B.iwStr}/4）`)}if(!raw&&src&&blk>0&&p.pw2&&p.pw2.counter&&src.hp>0){const cv=Math.max(1,Math.round(blk*p.pw2.counter/100));setTimeout(()=>{if(!B||B.over||src.hp<=0)return;const op=B.pierce;B.pierce=1;try{dealEnemy(src,cv)}finally{B.pierce=op}fxSay(src,"反伤 "+cv);renderBattle()},120)}if(loss>0&&B){B.hurt=1;rageGain(loss*.25)}if(B&&has("comp_amulet")&&!S.flags.amuletUsed&&S.hp<=0){S.flags.amuletUsed=1;S.hp=1;relicPulse("comp_amulet");toast("兄弟护符碎了：你留住了 <b>1</b> 点生命（一局一次）")}if(B&&has("mw_beads")&&!B.beadUsed&&S.hp<=0){B.beadUsed=1;S.hp=1;relicPulse("mw_beads");toast("长老的念珠亮了一下：你留住了 <b>1</b> 点生命")}if(S.hero==="vamp"&&S.hp>0&&S.hp<=S.max*.25&&B&&!B.vForm)setTimeout(()=>vampForm(),350);if(src&&has("thornvest")&&src.hp>0&&!raw){setTimeout(()=>{if(B&&!B.over&&src.hp>0)dealEnemy(src,3)},80)}if(loss>0&&B)B.enemies.forEach(x=>{if(x.id==="bloodbeast"&&x.hp>0)x.str=(x.str||0)+1});if(src&&src.id==="count"&&loss>0&&src.hp>0){src.hp=Math.min(src.max,src.hp+loss*(src.form2?2:1))}if(src&&src.id==="rockfrog"&&src.molten&&loss>0){setTimeout(()=>{if(B&&!B.over)B.apply(B.p,"burn",2)},120)}
 const el=$("#player");const c=center(el.querySelector(".body"));anim(el,"hit");if(loss)sfx("hurt");else blockSound(false);{const j=B?(B._pfn=((B._pfn||0)+1)%3):0;if(blk>0||!loss)fnum(c.x,c.top+130+j*30,blk>0?"格挡 "+blk:"格挡","blk pblk");if(loss)fnum(c.x+75,c.top+10+j*26,"-"+loss,"me")}if(loss>=10||loss>=S.max*.15){const v=document.createElement("div");v.className="hurtV"+(loss>=20?" big":"");$("#stage").appendChild(v);setTimeout(()=>v.remove(),650);try{if(navigator.vibrate)navigator.vibrate(loss>=20?[70,40,70]:45)}catch(e){}}if(loss>=12)stageShake();
 if(S.hp<=0&&B.p.pw.rebirth&&!B.rebirthUsed){B.rebirthUsed=1;S.hp=Math.ceil(S.max*.5);toast("<b>凤凰涅槃</b>！你从火里站了起来");sfx("relic")}
 if(S.hp<=0&&has("phoenix")&&!S.flags.phoenix){S.flags.phoenix=1;S.hp=Math.ceil(S.max*.3);relicPulse("phoenix");toast("<b>不死羽</b>燃烧了！你又站了起来");sfx("relic")}
 if(src&&!raw&&p.thorn&&src.hp>0){const t=src;setTimeout(()=>{if(t.hp>0){dealEnemy(t,p.thorn);renderBattle()}},150)}
 if(src&&src.af==="vamp"&&loss>0&&src.hp>0){const h=Math.ceil(loss/2);src.hp=Math.min(src.max,src.hp+h)}
 if(loss>0&&S.hp<=0)S.stats.killer=src?src.n:(B.lastSrc||"");
 if(loss>=15&&S.hp>0&&rnd()<.5)heroSay(pick(HL("big")));
 if(S.hp>0&&S.hp<=S.max*.25&&!B.heroLow){B.heroLow=1;heroSay(pick(HL("low")),1)}
 renderTop();return loss}

/* ---- 出牌 ---- */
/* 嘲讽：首领战里召唤出来的小怪会挡在首领前面，要先打掉 */
const isTaunt=e=>!!B&&!!e&&"BFK".includes(B.kind||"")&&!ENEMY[e.id].boss&&e.hp>0&&!e.fled;
function tauntBlock(t){if(!t||!B||!ENEMY[t.id].boss)return false;const tt=B.alive().filter(isTaunt);if(!tt.length)return false;
 toast(`<b>${tt[0].n}</b>在嘲讽你！先把小怪打掉`);tt.forEach(x=>{const el=enEl(x);if(el){const b=el.querySelector(".body");shakeEl(b);el.classList.remove("tauntPing");void el.offsetWidth;el.classList.add("tauntPing")}});sfx("debuff");return true}
async function playCard(c,target){if(busy)return;if(c&&c.frz&&!PREV){toast("这张牌被冻住了，这回合打不出去");return}if(c&&c.netted===B.turn){toast("这张牌被网缠住了，下回合才能用");return}if(target&&CARDS[c.id].tgt&&!PREV&&tauntBlock(target))return;if(B)B.lastAct=Date.now();const D=CARDS[c.id];let cost=curCost(c),x=0;
 if(D.cost===-1){x=B.p.energy;cost=x}if(cost>B.p.energy)return;
 if(D.tgt&&(!target||target.hp<=0)){const al=B.alive();if(al.length===1)target=al[0];else return}
 busy=true;B.sel=null;hint();B.p.energy-=cost;B.hand.splice(B.hand.indexOf(c),1);
 // 飞出动画
 const el=$(`#hand .card[data-k="${c.k}"]`);if(el){el.classList.add("fly");const tx=target?center(enEl(target)).x-75:560;el.style.transform=`translate(${tx}px,-300px) scale(.6) rotate(0deg)`;el.style.opacity="0";setTimeout(()=>el.remove(),340)}
 sfx("card");S.stats.played++;if(D.type==="pow"&&!PREV){B.p.powL=B.p.powL||{};B.p.powL[c.id]=(B.p.powL[c.id]||0)+1}if(D.fam==="pal"){B.palTurn=(B.palTurn||0)+1;if(B.palTurn>=3)ach("pal3")}if(B.played>=11)ach("rush");if(has("horserope")&&D.fam==="horse"&&!B.horseRope){B.horseRope=1;B.after.push(async()=>B.draw(1))}if(has("catbell")&&D.fam==="cat"&&!B.catBell){B.catBell=1;const al=B.alive();if(al.length)B.apply(pick(al),"vuln",1)}if(has("duster")&&D.fam==="chick"){S.dust=(S.dust||0)+1;if(S.dust%3===0)B.heal(3)}if(has("metronome")&&B.played===4)B.gainEnergy(1);if(has("bellclock")&&B.played===2){relicPulse("bellclock");B.after.push(async()=>B.draw(1))}seeCard(c.id);
 B.curLs=!!D.ls||(S.hero==="vamp"&&D.type==="atk"&&B.vForm);B.curPink=!!D.pink||(S.hero==="vamp"&&D.type==="atk");B.curTru=!!D.tru;B.lsMul=1;B.rebelNow=0;if(D.type==="atk"&&S.hero==="vamp"){if(B.p.lsx2){B.lsMul=2;B.p.lsx2=0}if(B.p.rebel){B.rebelNow=1;B.p.rebel=0;B.curLs=true}}B.bonus=0;if(D.type==="atk"){B.bonus=B.p.nextAtk;B.p.nextAtk=0;if(S.hero==="kungfu"&&(B.combo||0)>=2)B.bonus+=2;if(S.hero==="knight"&&!B.knAtk){B.knAtk=1;B.bonus+=Math.min(20,Math.floor(B.p.block/3))}}
 if(D.type==="skl"&&B.p.warm>0){B.p.warm--;toast("你甩掉了一层暖意")}if(D.type==="skl"){const bd=B.alive().find(x=>x.id==="boilerdragon"&&x.form2&&x.heat>0);if(bd){bd.heat--;fxSay(bd,"降温 -1")}}B.cardSeq=(B.cardSeq||0)+1;B.curFam=D.fam;B.curType=D.type;B.shinyPow=c.sh==="pow"?4:0;B.forceCrit=c.sh==="crit";if(c.sh==="gold")B.after.push(async()=>B.gainGold(3));if(c.sh==="draw")B.after.push(async()=>B.draw(1));if(D.fam==="horse"&&B.p.horseFree)B.p.horseFree=0;
 if(D.fam==="horse"&&B.p.pw.blood){B.p.tstr+=B.p.pw.blood}
 if(D.fam==="pal"&&PAL_LINE[c.id])heroSay(pick(PAL_LINE[c.id]),1);else if(c.g&&rnd()<.5)heroSay(pick(HL("golden")));
 if(D.fam==="pal"&&has("palcollar"))B.after.push(async()=>B.draw(1));
 if(B.kind==="R"&&(D.fam!=="none"||D.spell))setTimeout(()=>memoTip("pool","看上面的<b>奶蛙池</b>：家族牌打出去，会放一只同家族的小家伙进去。<b>同家族凑齐 3 只</b>就会消除。"),300);let tri=false;if(D.fam!=="none"&&D.fam!=="snake"&&D.type!=="cur"&&D.type!=="sts"){if(B.poolAdd(D.fam)===D.fam)tri=true}else if(D.spell){if(B.poolAdd("magic")==="magic")tri=true}else if(c.id==="mud")B.poolAdd("mud");
 if(B.wx==="fog"&&D.fam==="cat"&&!B.fogUsed){B.fogUsed=1;B.after.push(async()=>B.draw(1))}
 let reps=tri?2:1;if(c.g)reps++;if(!PREV){if(D.type==="skl")B.sklN=(B.sklN||0)+1;if(!B.firstC)B.firstC=D.type;B.pc=B.pc||{};B.pc[c.id]=(B.pc[c.id]||0)+1}if(!PREV){if(has("qz_gourd")&&D.type==="atk"&&!B.gourdT){B.gourdT=1;reps++;relicPulse("qz_gourd")}if(D.spell){B.spellN=(B.spellN||0)+1;if(has("qz_echo")&&B.spellN===3){reps++;relicPulse("qz_echo")}}if(has("qz_bats")&&D.type==="atk"){B.batN=(B.batN||0)+1;if(B.batN%3===0){const bt=pick(B.alive());if(bt){B.after.push(async()=>{if(!B||B.over||bt.hp<=0)return;relicPulse("qz_bats");B.hit(bt,8,1,1);B.heal(4);renderBattle();if(!B.alive().length)win()})}}}}if(B.mirror){reps++;B.mirror=false;relicPulse("mirror")}
 if(D.fam==="horse")B.horseN=(B.horseN||0)+1;
 questTick("play");if(D.type==="atk"&&B.combo===5)questTick("combo6");if(D.type==="atk"){rageGain(S.hero==="kungfu"?1.6:1.2);B.combo++;if(S.hero==="naiwa"&&B.combo===4)voiceEgg();if(B.combo>=8)ach("combo8");if(B.p.borrow)B.block(B.p.borrow,1);if(B.p.echo>0){B.p.echo--;reps++}if(B.combo===3&&B.p.pw.rhythm){B.after.push(async()=>{B.gainEnergy(1);B.draw(B.p.pw.rhythm)})}}
 B.played++;
 await sleep(tri?380:160);
 B.curElem=cardElem(D);if(D.spell){if(B.p.pw2&&B.p.pw2.prism){B.prismT=B.prismT&&B.prismT.t===B.turn?B.prismT:{t:B.turn};if(!B.prismT[D.spell]){B.prismT[D.spell]=1;B.p.mana=(B.p.mana||0)+B.p.pw2.prism;toast(`元素共鸣：魔力 +${B.p.pw2.prism}`)}}B.curSpell=D.spell;anim($("#player"),"castA");runeCircle(D.spell);sfx("sp_"+D.spell)}else if(D.type==="atk"){atkFx(D,target);sfx("atk_"+(S.hero||"naiwa"))}else if(D.type==="skl"&&!D.spell){anim($("#player"),"sklA")}else if(D.type==="pow"){anim($("#player"),"powA")}
 for(let r=0;r<reps;r++){if(D.tgt&&(!target||target.hp<=0))target=B.alive()[0];if(D.tgt&&!target)break;D.fx(B,(c.u|0),target,c,x);if(r<reps-1)await sleep(260)}
 B.bonus=0;
 if(B.p.pw.zone&&B.played%5===0)B.draw(2*B.p.pw.zone);
 delete c.tmp;B.forceCrit=false;B.curPink=false;B.curTru=false;B.curFam=null;B.curType=null;B.shinyPow=0;B.curSpell=null;B.curElem=null;
 if(D.type!=="pow"){if(D.exh||(D.exhU&&!c.u)||D.type==="sts")B.exh.push(c);else B.disc.push(c)}
 while(B.after.length){const f=B.after.shift();await f()}
 busy=false;afterAction()}
const SPELLC={water:["#4aa8ff","#d8f0ff"],earth:["#b8864a","#f3d8a8"],arc:["#b07cff","#efe2ff"],fire:["#ff6a2a","#ffd27a"],ice:["#6fd3ff","#e8fbff"],thunder:["#ffe14a","#fff8c8"]};
function castRing(){const el=$("#player .body");if(!el)return;const c=center(el);const d=document.createElement("div");d.className="castRing";d.style.left=c.x+"px";d.style.top=(c.y+(c.y-c.top)*.8)+"px";$("#fx").appendChild(d);setTimeout(()=>d.remove(),700)}
function spellFx(t,k){try{const C=SPELLC[k]||SPELLC.arc;const from=$("#player .body"),to=enEl(t);if(!from||!to)return;const a=center(from),b=center(to.querySelector(".body")||to);const o=document.createElement("div");o.className="spellOrb sp-"+k;o.style.setProperty("--c1",C[0]);o.style.setProperty("--c2",C[1]);o.style.left=(a.x+40)+"px";o.style.top=(a.top+40)+"px";$("#fx").appendChild(o);requestAnimationFrame(()=>{o.style.transform=`translate(${b.x-a.x-40}px,${(b.top+60)-(a.top+40)}px) scale(1.3)`});setTimeout(()=>{o.remove();sparks(b.x,b.top+70,C[0],14);const s=document.createElement("div");s.className="spellHit sp-"+k;s.style.setProperty("--c1",C[0]);s.style.left=b.x+"px";s.style.top=(b.top+70)+"px";$("#fx").appendChild(s);setTimeout(()=>s.remove(),450)},260)}catch(e){}}
const KW={消耗:"打出后这场战斗里就拿掉了，不进弃牌堆。",虚无:"回合结束时还在手里，就会被消耗掉。",保留:"回合结束时不会被弃掉，留到下回合。",护盾:"先替你挡伤害。通常每回合开始清空，骑士奶蛙只掉一半。",力气:"每层让攻击伤害 +1。“本回合力气”到回合结束就没了。",敏捷:"每层让获得的护盾 +1。",易伤:"受到的伤害 +50%。每回合 -1 层。",虚弱:"造成的伤害 -25%。每回合 -1 层。",泥巴:"身上的泥巴：回合开始扣等量生命，然后 -1。池子里的泥巴会把同家族隔开。",烫伤:"回合开始扣等量生命，然后 -1。",荆棘:"被攻击时，对攻击者造成等量伤害。",反弹:"被攻击时，对攻击者造成等量伤害。",奶力:"打牌要花的能量，每回合开始恢复到 3 点。",连击:"这回合已经打出过的攻击牌数量，每回合清零。",池:"奶蛙池：打出家族牌会放一只进去，同家族凑齐 3 只（满月 2 只）就消除，触发家族爆发。消除后，被隔开的两边合到一起又凑齐了，就是连锁，每次连锁多给 1 点奶力。",彩虹奶蛙:"万能的奶蛙，可以当任何家族凑三连。",法术:"魔法师的攻击。无视敌人护盾，伤害加魔力，不吃力气和虚弱。每张法术往奶蛙池放一枚魔法符文。",魔力:"每层让法术伤害 +1。魔法师回合结束时，没用完的奶力会变成魔力。",伙伴:"在战斗里把血量打到很低的敌人抓住，它就会变成伙伴卡。",抽:"从抽牌堆拿牌到手里，手牌最多 10 张。",经验:"攒够了会升级，升级时选一个天赋。",天赋:"升级时选的被动能力，这一局一直有效。"};try{Object.assign(KW,KW_ADD)}catch(e){}
const FAMINFO={frog:"奶蛙家族：乱拳型。三连爆发：随机乱拳 9 下，每下 3 伤害。下雨时奶蛙牌伤害 +2。",horse:"奶马家族：速攻群伤。三连爆发：所有敌人各受 5 伤害。刮风时奶马牌伤害 +3。",chick:"奶鸡家族：护盾防守。三连爆发：获得 6 护盾。下雪时奶鸡牌护盾 +3。",cat:"奶猫家族：回复和抽牌。三连爆发：回复 3 生命，抽 1 张。起雾时每回合第一张奶猫牌多抽 1 张。",pal:"伙伴：抓来的敌人。三连爆发：随机打一个敌人 8 伤害。",none:"通用牌：不属于任何家族，不进奶蛙池，不触发三连。"};
const TYPEINFO={atk:"攻击牌：打敌人。打出会让连击 +1。",skl:"技能牌：护盾、回复、抽牌等。",pow:"能力牌：打出后整场战斗一直生效。",cur:"诅咒：坏牌，通常不能打出，占手牌位置。",sts:"状态：战斗里临时塞进来的牌。"};
const RARN={S:"起始",C:"普通",R:"稀有",E:"史诗",L:"传说",X:"特殊",P:"伙伴",T:"临时",K:"诅咒"};
const HERON={naiwa:"奶蛙",kungfu:"功夫奶蛙",knight:"骑士奶蛙",mage:"奶蛙魔法师"};
function cardInfo(c,locked){closeCardInfo();const D=CARDS[c.id];if(!D)return;sfx("click");
 const strip=s=>String(s).replace(/<[^>]+>/g,"");const t0=strip(D.d(0)),t1=strip(D.d(1));const txt=t0+t1+(D.exh?"消耗":"")+(D.eth?"虚无":"")+(D.ret?"保留":"")+(D.spell?"法术":"")+(D.fam==="pal"?"伙伴":"");
 const kws=Object.keys(KW).filter(k=>txt.includes(k)||(k==="池"&&/池/.test(txt)));const fam=FAM[D.fam]||FAM.none;
 const d=document.createElement("div");d.id="cinfo";d.innerHTML=`<div class="ciBox"><button class="ciX" aria-label="关闭">×</button><div class="ciCard">${cardHTML({id:c.id,u:c.u,k:"ci"},"big"+(locked?" unk":""))}</div><div class="ciTxt">${locked?`<h3>？？？</h3><p class="ciLock">还没收集到这张牌。拿到一次以后，这里会亮起来。</p><div class="ciFam" style="--fc:${fam.c}"><b>${fam.n==="无"?"通用":fam.n}</b>${FAMINFO[D.fam]||FAMINFO.none}</div>`:`<h3>${D.n}${c.u?"+":""}</h3><div class="ciTags"><span>${(TYPE[D.type]||{}).n||""}</span><span>${RARN[D.r]||D.r}</span>${D.hero?`<span>${HERON[D.hero]||""}专属</span>`:""}<span>${D.cost===-1?"X":D.cost<0?"不能打出":D.cost+" 费"}</span></div><p class="ciD"><b>效果</b>${t0}</p><p class="ciD up"><b>升级后</b>${t1}</p><p class="ciType">${TYPEINFO[D.type]||""}</p>${(()=>{if(!B||!B.myTurn||D.type!=="atk"||locked)return"";const P=previewCard(c);if(!P)return"";const r=B.alive().map(e=>`${e.n} ${P.rand?"约 ":""}${P.res[e.k]||0}`).join("，");return r?`<p class="ciD"><b>现在能打</b>${r}</p>`:""})()}${D.spell?`<div class="ciFam" style="--fc:#7d8cff"><b>魔法</b>法术牌：无视敌人护盾，伤害加魔力。打出时往奶蛙池放一枚魔法符文，凑齐 3 枚就会法术齐射：全体受到 4 + 魔力的伤害，魔力 +1。</div>`:`<div class="ciFam" style="--fc:${fam.c}"><b>${fam.n==="无"?"通用":fam.n}</b>${FAMINFO[D.fam]||FAMINFO.none}</div>`}${kws.length?`<div class="ciKw">${kws.map(k=>`<p><b>${k==="池"?"奶蛙池":k}</b>${KW[k]}</p>`).join("")}</div>`:""}`}<small class="ciHint">点空白处或右上角关闭</small></div></div>`;
 $("#stage").appendChild(d);d.onclick=e=>{if(e.target===d||e.target.closest(".ciX"))closeCardInfo()};}

/* 4.0 图鉴里点开卡牌：像拆开卡包那样亮相（翻面、光芒、镭射、编号、三档星级数值、一句小故事） */
const RSTAR={S:1,C:1,R:2,E:3,L:4,X:3,P:2,T:1,K:1};
function cardReveal(list,idx,locked){closeCardInfo();const id=list[idx];const D=CARDS[id];if(!D)return;sfx("relic");
 const all=[...POOL_HERO,...POOL_X,...POOL_PAL];const no=all.indexOf(id);const lk=locked&&locked(id);const col=(M.shinyCol||{})[id];const fam=FAM[D.fam]||FAM.none;
 const strip=x=>String(x).replace(/<[^>]+>/g,"");const lv=[0,1,2,3].map(u=>strip(D.d(u)));const txt=lv.join("")+(D.exh?"消耗":"")+(D.spell?"法术":"");const kws=Object.keys(KW).filter(k=>txt.includes(k)).slice(0,4);
 const sh=col?(Object.keys(SHINY).find(k=>col[k])||"draw"):null;
 const d=document.createElement("div");d.id="cinfo";d.className="reveal tcgMode"+(col?" isShiny":"")+(list.length<2?" one":"");
 d.innerHTML=`<i class="rvRays"></i><i class="rvGlow" style="--fc:${col&&col.g?"#ffd23f":fam.c}"></i><div class="rvSp">${Array.from({length:14},(_,i)=>`<i style="--x:${(i*37)%100}%;--y:${(i*53)%100}%;--d:${(i%5)*.4}s"></i>`).join("")}</div>
 <button class="ciX" aria-label="关闭">×</button>
 <div class="rvStage"><div class="rvCard"><div class="rvFlip"><div class="rvBack"><i></i><b>奶蛙之塔</b></div><div class="rvFront">${tcgHTML(id,lk,col,no,lv[0])}</div></div></div>
 <div class="rvInfo"><div class="rvNo">${no<0?"初始牌":"No."+String(no+1).padStart(3,"0")+`<small> / ${all.length}</small>`}</div><h3>${lk?"？？？":D.n}</h3><div class="rvStars">${"★".repeat(RSTAR[D.r]||1)}<span>${RARN[D.r]||""}</span>${col?`<em class="${col.g?"g":""}">${col.g?"金闪 已收藏":"闪卡 已收藏"}</em>`:""}</div>
 <div class="rvTags"><span>${(TYPE[D.type]||{}).n||""}</span><span style="--fc:${fam.c}" class="fc">${fam.n==="无"?"通用":fam.n}</span>${D.hero?`<span>${HERON[D.hero]||""}专属</span>`:""}<span>${D.cost===-1?"X":D.cost<0?"不能打出":D.cost+" 费"}</span></div>
 ${lk?`<p class="rvLock">还没拿到这张牌。效果先给你看看：</p>`:""}<div class="rvLv">${(D.noUp||["cur","sts"].includes(D.type))?`<p><b>效果</b>${lv[0]}</p>`:[0,1,2,3].map(u=>`<p class="${u?"u":""}"><b>${u?"★".repeat(u):"原版"}</b>${lv[u]}</p>`).join("")}</div>
 ${kws.length?`<div class="rvKw">${kws.map(k=>`<span><b>${k==="池"?"奶蛙池":k}</b>${KW[k].split("。")[0]}</span>`).join("")}</div>`:""}
 <p class="rvFl">「${flavOf(id)}」</p></div></div>
 <button class="rvNav l" ${idx<=0?"disabled":""}>‹</button><button class="rvNav r" ${idx>=list.length-1?"disabled":""}>›</button>`;
 $("#stage").appendChild(d);
 const card=d.querySelector(".rvCard");{let tx=0,ty=0,cx=0,cy=0,act=0,idleT=0;const t0=performance.now(),cl=v=>Math.max(-1,Math.min(1,v));
  const aim=e=>{const r=d.querySelector(".rvStage .rvFlip").getBoundingClientRect();tx=cl((e.clientX-(r.left+r.width/2))/(r.width*.75));ty=cl((e.clientY-(r.top+r.height/2))/(r.height*.75));act=1;clearTimeout(idleT);idleT=setTimeout(()=>act=0,1600)};
  d.onpointermove=aim;d.onpointerdown=aim;
  const gy=e=>{if(!d.isConnected){removeEventListener("deviceorientation",gy);return}if(act===1||e.gamma==null)return;const land=innerWidth>innerHeight;const a=land?e.beta:e.gamma,b=land?-e.gamma:e.beta-45;if(Math.abs(a)+Math.abs(b)<2)return;tx=cl(a/28);ty=cl(b/28);act=2};addEventListener("deviceorientation",gy);
  const loop=t=>{if(!d.isConnected)return;if(!act){const k=(t-t0)/1000;tx=Math.sin(k*.9)*.42;ty=Math.cos(k*.65)*.28}cx+=(tx-cx)*.13;cy+=(ty-cy)*.13;const st=card.style;st.transform=`perspective(1100px) rotateY(${(cx*22).toFixed(2)}deg) rotateX(${(-cy*18).toFixed(2)}deg)`;st.setProperty("--mx",(50+cx*50).toFixed(1)+"%");st.setProperty("--my",(50+cy*50).toFixed(1)+"%");st.setProperty("--px",(-cx*16).toFixed(1)+"px");st.setProperty("--py",(-cy*11).toFixed(1)+"px");st.setProperty("--hyp",Math.min(1,Math.hypot(cx,cy)).toFixed(3));requestAnimationFrame(loop)};requestAnimationFrame(loop)}
 d.onclick=e=>{if(e.target.closest(".rvNav")){const b=e.target.closest(".rvNav");if(b.disabled)return;cardReveal(list,idx+(b.classList.contains("l")?-1:1),locked);return}if(e.target===d||e.target.closest(".ciX"))closeCardInfo()};
 setTimeout(()=>{d.classList.add("flipped");sxPlay("gem",.5,1.2)},380)}
function tcgHTML(id,lk,col,no,tx){const D=CARDS[id],T=TYPE[D.type]||{n:""};const cost=D.cost===-1?"X":D.cost<0?"—":D.cost;
 return`<div class="tcg tf-${D.fam} tr-${D.r}${col?" tsh":""}${col&&col.g?" tgold":""}${lk?" tlk":""}"><div class="tcgIn"><i class="tBg"></i><i class="tMoon"></i><i class="tHill"></i><i class="tHill h2"></i>
 <div class="tArt"><img src="${IMG(D.img)}" alt="" draggable="false"></div>
 <div class="tTop"><span class="tStage">${T.n}</span><b class="tName">${lk?"？？？":D.n}</b><span class="tCost">${cost}</span></div>
 <div class="tFx"><p>${tx}</p></div>
 <div class="tFoot"><span class="tStars">${"★".repeat(RSTAR[D.r]||1)}</span><span class="tNo">${no<0?"":"No."+String(no+1).padStart(3,"0")}</span><em class="tFl">${flavOf(id)}</em></div>
 <i class="tFoil"></i><i class="tSpark"></i><i class="tGlare"></i></div></div>`}
function closeCardInfo(){$$("#cinfo").forEach(x=>x.remove())}
addEventListener("keydown",e=>{if(e.key==="Escape")closeCardInfo()});
/* 长按任何卡牌：看说明（不会触发出牌） */
{let lpT=0,lpX=0,lpY=0,lpSkip=0;
 addEventListener("pointerdown",e=>{const el=e.target.closest&&e.target.closest(".card[data-id]");if(!el||el.closest("#cinfo"))return;lpX=e.clientX;lpY=e.clientY;clearTimeout(lpT);lpT=setTimeout(()=>{lpSkip=Date.now();cardInfo({id:el.dataset.id,u:+el.dataset.u},el.classList.contains("unk"))},480)},true);
 addEventListener("pointermove",e=>{if(Math.abs(e.clientX-lpX)+Math.abs(e.clientY-lpY)>14)clearTimeout(lpT)},true);
 ["pointerup","pointercancel"].forEach(ev=>addEventListener(ev,()=>clearTimeout(lpT),true));
 addEventListener("click",e=>{if(Date.now()-lpSkip<700){lpSkip=0;e.stopPropagation();e.preventDefault()}},true);
 addEventListener("contextmenu",e=>{const el=e.target.closest&&e.target.closest(".card[data-id]");if(el){e.preventDefault();cardInfo({id:el.dataset.id,u:+el.dataset.u},el.classList.contains("unk"))}},true)}
function cardElem(D){if(D.spell)return D.spell==="arc"?"arc":D.spell;if(D.type!=="atk")return null;const t=D.d(0)+D.n;if(/雷|闪电/.test(t))return"thunder";if(/火|烫伤|熔岩|炎/.test(t))return"fire";if(/冰|冻|雪|霜/.test(t))return"ice";return null}
function findRun(P,need){for(let i=0;i<P.length;i++){let f=null,j=i;while(j<P.length){const t=P[j];if(t.ice&&!has("warmscarf"))break;if(t.f==="any"){if(f==="mud")break;j++;continue}if(f===null){if(t.f==="mud"&&j>i)break;f=t.f;j++;continue}if(t.f===f){j++;continue}break}
  const n=j-i;if(n>=need&&!(f==="mud"&&P.slice(i,j).some(x=>x.f==="any")))return{i,n,f:f||"any"}}return null}
function chainBanner(lv){if(B)B._lvSfx=lv;sfx("tri2");const d=document.createElement("div");d.className="triBan chain p5t lv"+Math.min(lv,6);d.innerHTML=`<div class="tbIn"><b>${["","","二","三","四","五","六"][Math.min(lv,6)]}连锁！</b><small><em>爆发 ×${lv}</em>奶力 +1</small></div>`;$("#fx").appendChild(d);setTimeout(()=>d.remove(),1300);sparks(640,260,"#ffffff",30+lv*6);sparks(640,260,"#e5191c",20+lv*6);stageShake();if(lv>=3)cutIn(`${["","","二","三","四","五","六"][Math.min(lv,6)]}连锁！`,`爆发 ×${lv}`)}
/* 高光剪影：一条斜带横穿画面，主角剪影 + 大字 */
function cutIn(title,sub){if(!B||B.cutTurn===B.turn)return;B.cutTurn=B.turn;ach("cutin");sfx("cutin");
 const d=document.createElement("div");d.className="cutIn";d.innerHTML=`<div class="ciDim"></div><div class="ciBand"><i class="ciLines"></i><div class="ciHero"><img src="${IMG(HI())}" alt=""></div><div class="ciTxt"><b>${title}</b><small>${HN()} · ${sub}</small></div></div>`;
 $("#stage").appendChild(d);setTimeout(()=>d.classList.add("out"),1050);setTimeout(()=>d.remove(),1450);try{const l=HLC(Math.min(6,3));setTimeout(()=>heroSay(pick(l),1),1100)}catch(e){}}
function triBanner(fam,lv){if(B)B._lvSfx=lv||1;sfx("tri2");const F=FAM[fam]||{n:"彩虹",c:"#ffd200"};const d=document.createElement("div");d.className="triBan p5t";d.style.setProperty("--fc",F.c);d.innerHTML=`<div class="tbIn"><b>三连！</b><small><em>${F.n}</em>${({frog:"乱拳 3×3",horse:"群踏 5",chick:"护盾 +6",cat:"回复 3，抽 1",pal:"伙伴出击 8",any:"奶力 +1",magic:"法术齐射 4+魔力，魔力 +1",blood:"全体流血 3，回复 5",kungfu:"连打 2×4，内伤 +1，敏捷 +1",knight:"护盾 +7，护盾的 45% 砸敌人"}[fam]||"")}</small></div>`;$("#fx").appendChild(d);setTimeout(()=>d.remove(),1100);
 const fl=document.createElement("div");fl.className="famFlash";fl.style.setProperty("--fc",F.c);$("#fx").appendChild(fl);setTimeout(()=>fl.remove(),500);
 {const pc=center($("#pool"));const r=document.createElement("div");r.className="poolRing";r.style.setProperty("--fc",F.c);r.style.left=pc.x+"px";r.style.top=pc.y+"px";$("#fx").appendChild(r);setTimeout(()=>r.remove(),600)}
 sparks(640,300,F.c,26)}
function afterAction(){if(B&&B.chairNow&&!B.over)return chairEnd();renderTop();renderBattle();if(S.hp<=0)return lose();if(!B.alive().length&&!B.over)return win();if(B.formQ&&B.formQ.length&&!B.formRun&&B.myTurn)runForms()}

/* ---- 回合结束 / 敌人行动 ---- */
$("#endBtn").onclick=()=>endTurn();
$("#drawPile").onclick=()=>B&&viewCards(B.dp,"抽牌堆",`${B.dp.length} 张（顺序是打乱的）`);
$("#discPile").onclick=()=>B&&viewCards(B.disc,"弃牌堆",`${B.disc.length} 张`,false);
$("#exhPile").onclick=()=>B&&viewCards(B.exh,"消耗的牌",`本场战斗不会再回来`,false);
$("#battle").addEventListener("click",e=>{if(B&&!B.sel&&e.target.closest("#player .body")){tipAt($("#player .body"),`<b>${HN()} 的状态</b>${stsList(B.p,"你")}`);return}if(B&&B.sel&&!e.target.closest(".card")&&!e.target.closest(".en")){const c=B.hand.find(x=>x.k===B.sel.k);if(c&&!CARDS[c.id].tgt&&e.target.closest("#arena")){playCard(c);return}B.sel=null;hint();renderBattle()}});
async function endTurn(){if(busy||!B||!B.myTurn||B.over)return;B.curLs=false;if(S.hero!=="mage"&&B.p.energy>0&&B.endWarn!==B.turn&&B.hand.some(c=>{const D=CARDS[c.id],v=curCost(c);return v>=0&&v<=B.p.energy&&D.cost!==-2&&D.type!=="cur"&&D.type!=="sts"})){B.endWarn=B.turn;{const l=HL("endE");if(l.length&&rnd()<.6)heroSay(pick(l),1)}const eb=$("#endBtn");eb.classList.remove("warnShake");void eb.offsetWidth;eb.classList.add("warnShake");toast(`还有 <b>${B.p.energy}</b> 点奶力和能打的牌。确定的话，再点一次结束回合`);return}busy=true;B.myTurn=false;B.sel=null;hint();$("#endBtn").classList.add("wait");
 if(has("sugarcube")&&B.p.energy>0){B.p.block+=B.p.energy*3}if(S.hero==="mage"&&B.p.energy>0){const mn=Math.ceil(B.p.energy/2),bk=Math.floor(B.p.energy/2)*4;B.p.mana=(B.p.mana||0)+mn;if(bk)B.p.block+=bk;toast(`剩下的奶力化成了 <b>${mn}</b> 层魔力${bk?`和 <b>${bk}</b> 点护盾`:""}`)}
 const p=B.p;{const pr=B.hand.filter(c=>c.id==="prayer").length;if(pr){dmgPlayer(pr*5,null,true);toast(`手里的祷文在燃烧：受到 <b>${pr*5}</b> 伤害`);if(S.hp<=0)return lose()}B.hand.forEach(c=>{delete c.frz;if(c.frog){c.id=c.frog;delete c.frog}})}let mud=B.hand.filter(c=>c.id==="mud").length*(B.wx==="rain"?2:1);if(mud){dmgPlayer(mud*2,null,true);toast(`手里的泥巴块弄脏了你，受到 <b>${mud*2}</b> 伤害`);if(S.hp<=0)return lose()}
 const keep=[];for(const c of B.hand){delete c.tmp;if(CARDS[c.id].ret||c.sh==="ret")keep.push(c);else if(CARDS[c.id].eth)B.exh.push(c);else B.disc.push(c)}B.hand=keep;
 if(p.pw.owl){dmgPlayer(p.pw.owl,null,true);if(S.hp<=0)return lose()}
 if(p.warm>0){dmgPlayer(3*p.warm,null,true);toast(`椅子的余温烧掉了你 <b>${3*p.warm}</b> 生命`);if(S.hp<=0)return lose()}
 if(p.pw2&&p.pw2.bastion&&p.block>=20){B.apply(p,"thorn",p.pw2.bastion)}p.tstr=0;p.free=0;p.borrow=0;if(p.vuln)p.vuln--;if(p.weak)p.weak--;if(p.frost)p.frost--;if(p.night)p.night--;
 renderBattle();await sleep(300);banner("敌人回合",1);sfx("enemy");await sleep(700);
 for(const e of B.enemies){if(e.hp<=0||e.fled)continue;e.block=e.id==="iceking"?Math.floor(e.block/2):0;if(e.af==="tough")e.block+=8;
  if(e.mud>0){const d=e.mud*(B.wx==="rain"?2:1);e.mud--;dealEnemy(e,d);sfx("mud");renderBattle();await sleep(300);if(e.hp<=0){ach("mudkill");continue}}
  if(e.bleed>0){const d=e.bleed;e.bleed--;dealEnemy(e,d);sfx("bleed");sparks(center(enBody(e)).x,center(enBody(e)).top+60,"#c81e3c",8);renderBattle();await sleep(260);if(e.hp<=0)continue}
  if(e.burn>0){const d=e.burn;e.burn--;B.dotElem="fire";dealEnemy(e,d);B.dotElem=null;sfx("sizzle");renderBattle();await sleep(260);if(e.hp<=0){ach("burnkill");continue}}
  if(e.id==="snakeking"){B.p.mud=(B.p.mud||0)+1+Math.floor(e.turn/2);const el=enEl(e);if(el)say(el.querySelector(".body"),"嘶，吸一口孢子吧。");renderBattle()}
  if(e.id==="king"&&!(B.elimTurn>0)&&e.hp<e.max){e.hp=Math.min(e.max,e.hp+6);fxSay(e,"莲花开了 +6");renderBattle()}
  if(e.id==="king"&&B.elimTurn>0)fxSay(e,"莲花没开");
  if(e.id==="proto"){B.p.warm=(B.p.warm||0)+1;const el=enEl(e);if(el)say(el.querySelector(".body"),pick(["暖吧？我当年也是这么想的。","别贪那点暖，它会烧掉你。"]));toast("你多了一层<b>暖意</b>：下回合多 1 点奶力，回合结束每层烧掉 3 生命。打出技能牌能甩掉一层")}
  if(e.id==="bishop"&&!e.pile&&S.hp<=S.max*.3){B.p.rest=(B.p.rest||0)+1;e.skipAct=1;const el=enEl(e);if(el)say(el.querySelector(".body"),"嘘，睡吧，孩子。");toast(`安息 <b>${B.p.rest}</b> / 3：满 3 层你会昏睡一回合`);renderBattle()}
  if(e.id==="snowking"){e.str=(e.str||0)+1;e.grow=(e.grow||0)+1;const el=enEl(e);if(el){const bd=el.querySelector(".body");bd.style.transform=`scale(${Math.min(1.35,1+e.grow*.04)})`;bd.style.transformOrigin="50% 100%"}}
  if(e.id==="iceking"){const l=B.pool.filter(x=>!x.ice&&x.f!=="mud");if(l.length){pick(l).ice=2;renderPool()}}
  if(e.id==="buddha"&&e.stunCD>0)e.stunCD--;
  if(e.id==="timefrog"&&e.turn%3===2){const back=B.disc.splice(-2,2);B.dp.push(...back);say(enBody(e),"时间倒流");toast(`${e.n}拨回了时钟：${back.length} 张牌回到抽牌堆`);await enemyAct(e);renderBattle();await sleep(300)}
  if(e.id==="plague"){B.apply(B.p,"poison",3);await sleep(200)}if(e.id==="witch"&&e.phase2&&!e.cursed){e.cursed=1;B.apply(B.p,"curse",3);say(enBody(e),"三回合以后，你会想起我的。");await sleep(300)}if(e.id==="shadow"&&e.turn%2===1){B.apply(B.p,"night",2);await sleep(200)}if((e.id==="iceking"||e.id==="snakeblue")&&e.turn%2===0){B.apply(B.p,"frost",2);await sleep(200)}
  if(e.id==="fallen"&&e.phase2&&!e.stole){const pals=S.deck.filter(c=>CARDS[c.id].fam==="pal");const pool=pals.length?pals:S.deck.filter(c=>!["cur","sts"].includes(CARDS[c.id].type));if(pool.length){const c=pick(pool);e.stole=c;S.deck.splice(S.deck.indexOf(c),1);[B.dp,B.disc,B.hand].forEach(a=>{const i=a.findIndex(x=>x.k===c.k);if(i>=0)a.splice(i,1)});const el=enEl(e);if(el)say(el.querySelector(".body"),"哈哈哈哈！这只归我了！关进笼子里！");toast(`${e.n}把你的「${cname(c)}」<b>抓进了笼子</b>，打倒它才能拿回来`);renderBattle();await sleep(350)}}
  if(e.id==="thunderking"&&(e.form2?e.turn%2===1:e.turn%3===2)){B.p.bell=1;banner("进塔钟",1);toast("咚——钟声震得你头晕：下回合少抽 1 张")}
  if(e.id==="thunderking"){lightning();dmgPlayer(5,null,true);toast("落雷：受到 <b>5</b> 伤害");renderBattle();await sleep(350);if(S.hp<=0)return lose()}
  if(e.id==="abyssdragon"&&B.disc.length){const c=B.disc.pop();B.exh.push(c);e.hp=Math.min(e.max,e.hp+6);toast(`${e.n}吞掉了你的「${cname(c)}」`);renderBattle();await sleep(250)}
  if(e.id==="fogwhite"){e.fogged=e.turn%2===1;if(e.fogged)say(enBody(e),"（躲进了雾里）")}
  if(e.id==="witch"){B.dp.splice(ri(B.dp.length+1),0,mk("bottle"));toast(`${e.n}往你的抽牌堆塞了一个<b>空瓶</b>`)}
  if(e.id==="tophat"&&B.dp.length){const i=ri(B.dp.length),c=B.dp.splice(i,1)[0];B.exh.push(c);B.magicN=(B.magicN||0)+1;if(B.magicN>=5)ach("magic");toast(`${e.n}把你的「${cname(c)}」<b>变没了</b>`)}
  if(e.id==="boilerdragon"){e.heat=(e.heat||0)+1;if(e.heat>=3){e.heat=0;if(e.form2){banner("过热爆炸",1);stageShake();sfx("boom");dmgPlayer(14+(S.act||0)*3,e,true);B.apply(B.p,"burn",6);renderBattle();await sleep(500);if(S.hp<=0)return lose()}else{banner("喷火",1);B.apply(B.p,"burn",6)}await sleep(400)}}
  if(e.id==="cosmicegg"){e.cnt=(e.cnt==null?6:e.cnt)-1;if(e.cnt<=0){e.cnt=6;banner("孵化爆发",1);stageShake();await sleep(400);dmgPlayer(26+(S.act||0)*4,e);renderBattle();await sleep(500);if(S.hp<=0)return lose()}}
  if(e.poison>0&&e.poisonT>0){const d=e.poison;dealEnemy(e,d);sfx("poison");fxSay(e,"中毒 -"+d);if(B.p.pw2&&B.p.pw2.toxblood)B.heal(B.p.pw2.toxblood);e.poison++;e.poisonT--;if(!e.poisonT)e.poison=0;renderBattle();await sleep(260);if(e.hp<=0)continue}
  if(e.para>0&&e.intent&&e.intent.k!=="wait"&&Math.random()<.15*e.para){e.para--;fxSay(e,"麻痹了，动不了");e.intent=ENEMY[e.id].ai(e,++e.turn);renderBattle();await sleep(420);continue}
  if(e.fake){e.turn++;continue}
  if(e.pile){e.pile--;const el=enEl(e);if(el)say(el.querySelector(".body"),e.pile?"（骨头咯吱咯吱地拼了回去……）":"（骨堆站起来了）");renderBattle();await sleep(400);if(!e.pile){e.reviving=1;B.formQ=B.formQ||[];B.formQ.push({t:e,kind:"revive"});await runFormsE()}e.turn++;continue}
  if(e.id==="demon"&&e.revived&&e.form2){const l=B.pool.filter(x=>x.f!=="mud");if(l.length){B.pool.splice(B.pool.indexOf(pick(l)),1);renderPool();fxSay(e,"抓走 1 只");toast("魔椅从你的池子里<b>抓走了一只奶蛙</b>");await sleep(300)}}
  if(e.skipAct){e.skipAct=0;e.intent=ENEMY[e.id].ai(e,++e.turn)}else{await enemyAct(e);if(B.chairNow)return chairEnd();if(e.id==="general"&&e.unarm&&e.hp>0&&S.hp>0){await sleep(380);e.intent=ENEMY.general.ai(e,e.turn+1);await enemyAct(e)}}renderBattle();await sleep(420);
  if(e.id==="shadow"&&e.form2&&e.hp>0){shadowFake(e);renderBattle()}
  if(e.hp>0&&S.hp>0&&BM[e.id]&&BM[e.id].act){try{await BM[e.id].act(e)}catch(er){console.warn(er)}if(S.hp<=0)return lose()}if(e.id==="fourhead"&&e.hp>0&&S.hp>0){const heads=Math.max(1,Math.ceil(e.hp/e.max*4));for(let k=1;k<heads&&e.hp>0&&S.hp>0;k++){e.intent=ENEMY.fourhead.ai(e,e.turn+k*2+1);await enemyAct(e);renderBattle();await sleep(380)}if(S.hp<=0)return lose()}
  if(e.af==="swift"&&e.turn===0&&e.hp>0&&S.hp>0){say(enBody(e),"再来一次！");e.intent=ENEMY[e.id].ai(e,1);await enemyAct(e);renderBattle();await sleep(420)}
  if(e.hp>0&&S.hp>0&&e.af){const P={sticky:{t:"junk",n:1},greedy:{t:"suck",n:1,h:6},frosty:{t:"freeze",n:1}}[e.af];if(P){B.poolEnemy(P,e);await sleep(250)}if(e.af==="mocking"){B.apply(B.p,"weak",1);await sleep(200)}}
  if(e.inj>0&&e.hp>0){dealEnemy(e,e.inj);sfx("inj");fxSay(e,"内伤 -"+e.inj);renderBattle();await sleep(220)}if(e.vuln)e.vuln--;if(e.weak)e.weak--;["brk","frost","para","wet","night"].forEach(k=>{if(e[k]>0)e[k]--});e.turn++;
  if(S.hp<=0)return lose()}
 await runFormsE();if(!B.alive().length)return win();
 B.enemies.forEach(e=>{if(e.hp>0&&!e.fled)e.intent=nextIntent(e,e.turn)});B.enemies.forEach(e=>{if(e.fake&&e.real&&e.hp>0)e.intent=e.real.intent});
 startTurn()}
async function runFormsE(){if(B&&B.formQ&&B.formQ.length&&!B.formRun){B.formRun=1;try{while(B.formQ.length){const q=B.formQ.shift();await bossFormSeq(q.t,q.kind)}}finally{B.formRun=0}}}
function eBlk(e,v){if(e.brk>0){v=Math.floor(v/2);fxSay(e,"破甲：护盾减半")}e.block+=v}
async function enemyAct(e){const I=e.intent;let el=enEl(e);if(!el){try{renderBattle()}catch(x){}el=enEl(e)}if(!el){el=document.createElement("div");el.innerHTML=`<div class="body"></div>`}if(!I)return;{const sp=!!I.pool||["def","buff","debuff","add"].includes(I.k);if(I.k!=="flee"&&I.k!=="boom"&&I.k!=="wait"&&rnd()<(sp?.8:.5))say(el.querySelector(".body"),eLine(e,sp?"s":"a"))}const atk=async(v,n=1)=>{anim(el,"lungeL");for(let i=0;i<n;i++){dmgPlayer(v,e);renderBattle();await sleep(n>1?200:120);if(S.hp<=0)return}};
 switch(I.k){
 case"atk":if(I.ult){banner(I.ult,1);stageShake();await sleep(500)}B._pierce=!!I.pierce;await atk(I.v,I.x||1);B._pierce=0;if(I.s)B.apply(B.p,I.s,I.d||1);break;
 case"stun":say(el.querySelector(".body"),"头好晕");break;
 case"charge":eBlk(e,10+(S.act||0)*4);sfx("buff");anim(el,"buffA");say(el.querySelector(".body"),pick(["要来了","深呼吸","看好了！","我要认真了！"]));fxAt(el.querySelector(".body"),"shieldFx",0,ICON.shield);break;
 case"def":eBlk(e,I.v);sfx("block");fxAt(el.querySelector(".body"),"shieldFx",0,ICON.shield);if(I.s2){e[I.s2]=(e[I.s2]||0)+I.v2}break;
 case"buff":e[I.s]=(e[I.s]||0)+I.v;anim(el,"buffA");sfx("buff");bubble(el,I.s==="mirror"?"让我看看你会什么":pick(["呱！力气来了！","嘿，哈！","我要认真了"]));break;
 case"debuff":B.apply(B.p,I.s,I.v);anim(el,"buffA");break;
 case"add":anim(el,"lungeL");for(let i=0;i<I.n;i++)B.disc.push(mk(I.card));sfx("mud");toast(`${e.n}往你的弃牌堆扔了 <b>${I.n} 张${CARDS[I.card].n}</b>`);break;
 case"atkdef":await atk(I.v);eBlk(e,I.b);break;
 case"steal":{await atk(I.v);const g=Math.min(S.gold,I.g);S.gold-=g;e.stolen+=g;if(g){const c=center($("#player .body"));fnum(c.x,c.top,"-"+g+" 金币","gold");toast(`${e.n}偷走了 <b>${g}</b> 金币！打败它才能抢回来`)}renderTop();break}
 case"flee":e.fled=1;e.hp=0;bubble(el,e.id==="goldfrog"?"拜拜～金子都是我的！":"咯咯哒～拜拜！");if(e.id==="goldfrog")ach("ranaway");toast(e.id==="goldfrog"?"金色奶蛙一溜烟跑掉了":`${e.n}带着金币跑掉了`);break;
 case"atkcnt":await atk(I.v);break;
 case"call":{anim(el,"buffA");if(B.alive().length<4){const m=mkEnemy(I.id,B.enemies.length+1);m.intent=ENEMY[I.id].ai(m,0);B.enemies.push(m);sfx("buff");say(el.querySelector(".body"),pick(["咕嘟咕嘟，出来吧！","再来一杯！","趁热喝！"]));toast(`${e.n}倒出了一只<b>${ENEMY[I.id].n}</b>`)}else{e.block+=12;sfx("block");say(el.querySelector(".body"),"杯子太多了，先歇会儿")}}break;case"wait":e.waitTurns--;say(el.querySelector(".body"),e.waitTurns>0?"（慢慢地喝着奶茶）":"好了，茶喝完了。");break;
 case"boom":sfx("boom");stageShake();dmgPlayer(I.v,e);e.hp=0;sparks(center(el).x,center(el).y,"#ff9a1f",26);break}
 if(I.pool&&e.hp>0&&S.hp>0){await sleep(250);B.poolEnemy(I.pool,e)}}

/* ---- 胜负 ---- */
async function win(){if(B.over)return;if(S.junc&&B.kind==="E"&&B.enemies.some(e=>ENEMY[e.id].jx))questTick("jElite");if(B.kind==="E")jsideTick("elite");if(B.kind==="m")jsideTick("mob");if(B.kind==="B")jsideTick("boss");S.winHp=Math.min(S.hp,B.hpPre==null?S.hp:B.hpPre);if(B.kind==="W"){B.over=1;return chairEnd(1)}if(B.kind==="H"){B.over=1;return protoWin()}B.over=1;if(B.kind==="R"){memoEnd(true);return}questTick("win");if(!B.hurt)questTick("flaw");if(B.kind==="E")questTick("elite");if(B.turn<=3)questTick("fast");if(B.kind==="E"&&S.deck.length<=15)questTick("lightElite");if(B.rageOn||B.rageUsedHere)questTick("rageWin");if(B.kind==="E"&&!B.hurt)questTick("flawElite");if(B.kind==="B"&&S.hp>=S.max/2)questTick("bossHalf");if(S.mod==="tea"&&S.hp>0){S.hp=Math.min(S.max,S.hp+5);toast("奶茶节：喝一口，回复 <b>5</b> 生命")}if(B.turn<=1)ach("oneturn");if(B.turn>=20)ach("longfight");if(S.hp<=3)ach("onehp");if(["B","K","F"].includes(B.kind)&&!B.hurt)ach("flawless");busy=true;B.myTurn=false;$("#endBtn").classList.add("wait");sfx("win");
 await sleep(700);
 if(has("cup")){relicPulse("cup");const h=Math.min(6,S.max-S.hp);S.hp+=h}if(has("teacan"))S.hp=Math.min(S.max,S.hp+4);
 if(perk("regen"))S.hp=Math.min(S.max,S.hp+4*perk("regen"));
 if(has("trophy")&&B.kind!=="m"){S.max+=5;S.hp+=5;relicPulse("trophy")}
 let gold=0;if(has("ring"))gold+=8;if(has("comp_dice"))gold+=10;if(has("goldegg"))gold+=10;if(has("fullbonus")&&S.hp>=S.max)gold+=15;
 renderTop();
 for(const id of B.caught)addCard(mk(id));
 {const xp=({m:1,E:3,B:4,F:0,M:3,G:2,K:4}[B.kind]||0)+B.caught.length;if(xp){toast(`获得 <b>${xp}</b> 点经验`);await gainXP(xp)}}
 if(B.kind==="B"&&curBoss()==="king")S.flags.kingFriend=1;
 if(B.kind==="B"&&S.fin){return trueFinale()}if(B.kind==="B"&&S.dream){return dreamClear()}
 if(B.kind==="B"&&S.act===ACTS.length-1){await sleep(400);await talk(curBoss()==="shadow"?STORY.demon:[["bx","奶蛙大魔王","深渊那片水退了。我在上面都听见了。"],...STORY.demon.slice(2)]);playMusic("final");await bossTitle("demon","塔顶");S.hp=Math.min(S.max,S.hp+20);toast("不知道谁在台阶上放了一杯奶茶：回复 <b>20</b> 生命");S.cur={t:"F",rs:S.rs};saveRun();return startCombat("F")}
 if(B.kind==="B"||B.kind==="F"){await sleep(400);{const bw=B.kind==="B"&&STORY["bw_"+curBoss()];if(B.kind==="F"){if(S.flags&&S.flags.truth){const sp=await spareChoice();if(sp)return chairStart()}S.endKey=S.hero==="mage"?"mage":S.flags&&S.flags.doll?"doll":!(S.stats.caught||0)?"lone":"base";await talk(STORY.falseEnd)}else await talk(bw||STORY["win"+S.act+(B.kind==="B"&&bossAlt()?"b":"")])}return actClear()}
 if(B.kind==="K"){const wl=bossLines(S.guard,1);if(wl.length){await sleep(300);await talk(wl)}const h=Math.round(S.max*.2);S.hp=Math.min(S.max,S.hp+h);toast(`守关首领倒下了：回复 <b>${h}</b> 生命`)}
 if(B.kind==="E")S.elites++;
 if(B.kind==="C"){const h=Math.round(S.max*.15);S.hp=Math.min(S.max,S.hp+h);toast(`魔化的首领醒过来了，回复 <b>${h}</b> 生命`);return rewardScreen("E",gold+B.extraGold,B.caught)}
 rewardScreen(B.kind,gold+B.extraGold,B.caught)}
async function lose(){if(S&&S.dummy){S.hp=S.max;toast("木桩把你打倒了！血已经补满，接着练");renderTop&&renderTop();return}if(B&&B.kind==="R"){if(B.over)return;B.over=2;memoEnd(false);return}if(B&&B.over===2)return;if(B)B.over=2;busy=true;sfx("lose");await sleep(900);gameOver(false)}
/* 4.3 一局结束的分享图：竖图，主角、结果、牌组、用时 */
let SHARE=null;
function runSnap(res,fl){const st=S.stats||{};const order="LEXRCPGST";const deck=[...S.deck].sort((a,b)=>order.indexOf(CARDS[a.id].r)-order.indexOf(CARDS[b.id].r)||(b.u|0)-(a.u|0));const seen={},top=[];deck.forEach(c=>{if(["cur","sts"].includes(CARDS[c.id].type))return;const k=c.id;if(seen[k]){seen[k].n++;return}seen[k]={c,n:1};top.push(seen[k])});
 return{res,hero:HN(),img:HI(),diff:(DIFF[S.diff||"normal"]||DIFF.normal).n,asc:asc(),act:S.act||0,fl,floor:S.junc?`${S.act}.5层`:S.fin?"最终之地":S.dream?"阿岳的梦":`第${"一二三四五"[S.act||0]}层 · ${(ACTS[S.act||0]||{}).n||""}`,ms:S.playMs||0,kills:st.kills||0,maxHit:st.maxHit||0,chain:st.chain||0,deckN:S.deck.length,relics:S.relics.length,top:top.slice(0,8).map(x=>({n:cname(x.c),r:CARDS[x.c.id].r,k:x.n,g:!!x.c.g})),date:new Date()}}
function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
async function shareCard(o){if(!o)return;sfx("click");try{await document.fonts.ready}catch(e){}
 const W=720,H=1280,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");const F=(w,sz,f)=>`${w} ${sz}px ${f||"'NW Black','PingFang SC','Microsoft YaHei',sans-serif"}`;
 const RC={L:"#ff9a1f",E:"#9b5cff",R:"#3d8bff",C:"#9aa6bb",P:"#b392ff",G:"#f7c948",S:"#b8b3c8",X:"#ff5a8a",T:"#9aa6bb",K:"#9aa6bb"};
 // 背景
 const win=o.res==="登顶"||o.res==="真结局";const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,win?"#2a0f3a":"#141018");g.addColorStop(1,win?"#0d0d0d":"#050505");x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.translate(W/2,420);for(let i=0;i<24;i++){x.rotate(Math.PI*2/24);x.fillStyle=i%2?"rgba(229,25,28,.20)":"rgba(255,255,255,.04)";x.beginPath();x.moveTo(0,0);x.lineTo(900,-120);x.lineTo(900,120);x.fill()}x.restore();
 x.fillStyle="#e5191c";x.beginPath();x.arc(W/2,420,230,0,Math.PI*2);x.fill();
 // 标题
 x.fillStyle="#fff";x.font=F(900,64);x.textAlign="center";x.fillText("奶蛙之塔",W/2,96);x.font=F(700,22);x.fillStyle="#ffd23f";x.fillText("VER "+VER+"　·　"+o.date.getFullYear()+"."+(o.date.getMonth()+1)+"."+o.date.getDate(),W/2,132);
 // 主角
 const im=await loadImg(IMG(o.img));if(im){const s=Math.min(420/im.width,440/im.height),w=im.width*s,h=im.height*s;x.save();x.shadowColor="rgba(0,0,0,.6)";x.shadowOffsetX=10;x.shadowOffsetY=10;x.drawImage(im,W/2-w/2,640-h,w,h);x.restore()}
 // 结果条
 x.save();x.translate(W/2,700);x.rotate(-.04);x.fillStyle="#0d0d0d";x.fillRect(-300,-56,600,112);x.fillStyle=win?"#ffd23f":"#fff";x.font=F(900,64);x.fillText(o.res,0,22);x.restore();
 x.fillStyle="#fff";x.font=F(800,30);x.fillText(`${o.hero}　·　${o.floor}`,W/2,800);
 x.font=F(700,22);x.fillStyle="#ddd2bc";const mins=Math.max(1,Math.round(o.ms/60000));x.fillText(`${o.diff}难度　·　第 ${o.asc+1} 周目　·　用时 ${mins>=60?Math.floor(mins/60)+" 小时 "+mins%60+" 分":mins+" 分钟"}`,W/2,838);
 // 数据格
 const stats=[[o.kills,"击败敌人"],[o.maxHit,"最高一击"],[o.chain,"最长连锁"],[o.deckN,"牌组张数"]];stats.forEach(([v,l],i)=>{const cx=90+i*180;x.fillStyle="rgba(255,255,255,.08)";x.fillRect(cx-78,870,156,92);x.fillStyle="#fff";x.font=F(900,40);x.fillText(String(v),cx,925);x.fillStyle="#bbb";x.font=F(700,18);x.fillText(l,cx,952)});
 // 牌组
 x.textAlign="left";x.fillStyle="#ffd23f";x.font=F(900,24);x.fillText("最得意的牌",54,1010);
 o.top.forEach((c,i)=>{const cx=54+(i%2)*312,cy=1030+Math.floor(i/2)*44;x.fillStyle="rgba(255,255,255,.06)";x.fillRect(cx,cy,300,36);x.fillStyle=RC[c.r]||"#aaa";x.fillRect(cx,cy,8,36);x.fillStyle=c.g?"#ffd23f":"#fff";x.font=F(800,20);x.fillText(c.n+(c.k>1?" ×"+c.k:""),cx+20,cy+25)});
 x.textAlign="center";x.fillStyle="#888";x.font=F(700,20);x.fillText("在 B站 搜「奶蛙之塔」，一起来爬塔",W/2,H-30);
 const url=cv.toDataURL("image/png");
 ov(`<div class="shareBox"><img src="${url}" alt="分享图"><div class="shareSide"><span class="ribbon b">分享图</span><p>手机上长按图片就能保存，然后发到 B站 动态。</p><a class="btn" id="shDl" download="naiwa-tower.png" href="${url}">保存图片</a><button class="btn ghost" id="shX">关闭</button></div></div>`);$("#shX").onclick=closeOv}
function gameOver(quit){setTimeout(()=>CLOUD.up(true),500);const heroName=HN(),heroImg=HI();if(!quit&&S){if(!(S.act||0))ach("oops");M.deaths=(M.deaths||0)+1;if(M.deaths>=10)ach("stubborn")}const fl=(S.act||0)*(ROWS+1)+S.row+1+(S.atBoss?1:0);M.best=Math.max(M.best,fl);const SR=earnShards(false);saveMeta();const st=S.stats;const roast=quit?[]:elderRoast(st,{gold:S.gold,deck:S.deck.length,golds:S.deck.filter(c=>c.g).length,pots:S.pots.length,killer:st.killer,rooms:fl});SHARE=runSnap(quit?"下山":"倒下了",fl);S=null;saveRun();B=null;show("ending");setBg("title");playMusic("space");
 const fails=["塔还在那里，它不着急。","你被抬下山的时候，天已经亮了。","村里有人给你留了一碗粥，已经凉了，你还是喝完了。","长老看了你很久，说：回来就好。"];
 $("#ending").innerHTML=`<div class="winWrap lose"><div class="winHero"><div class="winMoon"></div><img src="${IMG("hs")}"><i class="winStone"></i></div>
 <div class="winScroll"><div class="wsHead"><h1>${quit?"下山":"倒下了"}</h1><div class="wsSeal">${heroName}<br>${fl} 步</div></div>
 <p class="wsLead">${quit?"塔还在那里，随时可以再爬。":heroName+"被抬回了村里。长老什么也没问。"+pick(fails)}</p>
 <div class="wsStats"><div><b>${fl}/${ACTS.length*(ROWS+1)}</b><small>走过的房间</small></div><div><b>${st.kills}</b><small>击败敌人</small></div><div><b>${st.endb||0}</b><small>层末首领</small></div><div><b>${st.chain||0}</b><small>最长连锁</small></div><div><b>${st.maxHit||0}</b><small>单次最高伤害</small></div></div>
 ${roast.length?`<div class="wsQuote"><img src="${IMG("m6")}"><div>${roast.map(t=>`<p>「${t}」</p>`).join("")}</div></div>`:""}
 <div class="wsFoot"><div class="wsShard">${ICON.star}<span>记忆碎片</span><b>+${SR.n}</b></div><div class="wsBtns"><button class="wsBtn red" id="eAgain">再爬一次</button><button class="wsBtn" id="eShare">分享图</button><button class="wsBtn" id="eHome">回到主页</button></div></div></div></div>`;
 $("#eAgain").onclick=heroSelect;$("#eHome").onclick=titleScreen;$("#eShare").onclick=()=>shareCard(SHARE)}
const END_NAME={true:"真结局 · 泉水回来了",base:"新的大魔王",doll:"小七的歌",lone:"一个人的王座",mage:"画了一半的法阵"};
const END_LEAD={true:"深渊的水退回了地底。你回到村口的时候，泉水已经漫过了石阶，月亮在水里一晃一晃的。小七站在泉边唱歌，唱的是你从来没听过的调子。村口那棵枣树底下，有一根埋了很多年的鱼竿。你把它挖出来，坐在泉边，钓了一整个下午。什么都没钓到，但你觉得，这样就很好。",base:"长老一个人下了山。他说村里的晚饭不能没人吃。你坐在塔顶，泉水的声音一直在耳边，很近，很好听。山脚下的泉，确实不再往下掉了——可它也没有涨回来。每天傍晚，村口都会亮起一盏小小的灯，你知道那是长老点的。你想，再坐一阵子，等泉水满了，就下去。",
 doll:"小七被长老背回了村子，怀里还抱着那个布娃娃。他每天晚上都在泉边唱歌，唱给塔顶听。你坐在椅子上，听得见。泉水在他唱歌的时候，会多流一点点。有一天他问长老：塔上那个新的大魔王，是不是不会回来了？长老没有回答。",
 lone:"你一路上没有带任何伙伴。到了塔顶，也还是一个人。椅子很宽，坐一个人刚刚好。偶尔有新的奶蛙爬上来，站在台阶下面看着你，眼神和当初的你一模一样。你忽然明白了，阿岳当年为什么那么累。",
 mage:"你在椅子周围画了一个星之法阵，想让它替你撑住泉水，好让谁都不用坐在这里。法阵画了一半，椅子就开口了：坐下吧。你坐下了，手里的粉笔还没放下。女巫在东边的塔楼上看着星星，说：那孩子，画得还不够圆。"};
const END_TALE={};
const FALSE_TALES=[{t:"村口的灯",l:["长老回到村里以后，每天傍晚都在村口点一盏灯。有人问他点给谁看，他说：塔顶风大，总得有个亮的地方，让人知道往哪儿走。"]},
 {t:"小七",l:["小七每天晚上都去泉边唱歌。泉水在他唱歌的时候会多流一点点，可他一停下来，水声也跟着停了。他问长老：是不是唱得不够好？长老摸摸他的头，说：是有人坐得太久了。"]},
 {t:"枣树",l:["村口那棵枣树今年结了很多枣。有人在树底下挖到一根旧鱼竿，竿头已经朽了。大家不知道是谁的，就把它靠在树边。后来每年秋天，树下都会多一把新摘的枣，不知道是谁放的。"]},
 {t:"台阶下面",l:["又有一只奶蛙爬上了塔顶。它站在台阶下面，攥着一把又小又破的剑，看着椅子上的你。你忽然想起了很久以前的自己，想起了阿岳最后说的那句话：我只是想让它再满一次。"]}];
/* 4.2 交界处（0.5 层）：打完首领后偶尔出现。5 步小地图，可以随时离开；走到深处拿稀有遗物 */
function juncMap(){const c=Math.floor(COLS/2);/* 4.4：两次分岔都是事件，中间一只小怪，尽头一只精英 */const R=[["q"],["q","q"],["m"],["q","q"],["E"]];
 const g=R.map((ts,r)=>{const row=Array(COLS).fill(null);const cs=ts.length===1?[c]:[c-1,c+1];ts.forEach((t,i)=>{row[cs[i]]={r,c:cs[i],t,nx:[],jx:ri(10)-5,jy:ri(10)-5}});return row});
 for(let r=0;r<g.length-1;r++)g[r].forEach(n=>{if(n)n.nx=g[r+1].filter(Boolean).map(m=>m.c)});return g}
function juncEnter(){S.junc=1;S.juncSave={map:S.map,sky:S.sky};S.map=juncMap();{const k={moon:pick(MOON_CYCLE),wx:"clear"};S.sky=[...Array(S.map.length+1)].map(()=>({...k}))}S.row=-1;S.col=-1;S.path=[];S.atBoss=false;S.lowHalf=2;S.cur=null;ach("junction");saveRun();show("none");
 talk([[HI(),HN(),"楼梯旁边岔出去一条小路。不是上一层，也不是下一层。"],[HI(),HN(),"……走走看。随时都可以回到楼梯上。"]]).then(()=>{openMap();setTimeout(()=>banner(`${S.act}.5层 · ${JNAME[S.act]||"交叉路口"}`,1),300)})}
/* 4.4 岔路支线：岔路里的角色会托你办事，在这条岔路里办完就给报酬 */
const JSIDE={escape:{n:"抓回逃跑的犯人",d:"打倒岔路中间的小怪",need:"mob",pay:()=>{S.gold+=60;const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,1);l.forEach(c=>c.u=(c.u|0)+1);return"红奶狗看守：+60 金币"+(l[0]?`，「${cname(l[0])}」升级了`:"")}},
 letter:{n:"把信送到岔路尽头",d:"走到岔路尽头",need:"end",pay:()=>{S.max+=6;S.hp+=6;return"收信的奶蛙：最大生命 +6"}},
 race:{n:"和冒险者比赛",d:"打倒尽头的精英",need:"elite",pay:()=>{S.gold+=40;givePotQuiet(randPot());return"走错路的冒险者：+40 金币，一瓶药水"}},
 m_rat:{n:"帮小奶鼠清路",d:"打倒 3 场小怪",need:"mob",cnt:3,pay:()=>{S.max+=5;S.hp+=5;return"小奶鼠：最大生命 +5"}},
 m_smith:{n:"给铁匠找材料",d:"打倒 1 只精英",need:"elite",pay:()=>{const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);if(l.length)upFx(l);return"奶猫铁匠：随机升级 "+l.length+" 张牌"}},
 m_letter:{n:"替信使带句话",d:"打倒这一层的首领",need:"boss",pay:()=>{S.gold+=60;givePotQuiet(randPot());return"村里的信使：+60 金币，一瓶药水"}},
 m_lost:{n:"送迷路的奶马回家",d:"打倒 2 场小怪",need:"mob",cnt:2,pay:()=>{S.gold+=40;S.hp=Math.min(S.max,S.hp+12);return"奶马一家：+40 金币，回复 12 生命"}},
 bounty:{n:"赏金猎人的委托",d:"打倒尽头的精英",need:"elite",pay:()=>{S.gold+=70;return"赏金猎人奶猫：+70 金币"}},
 medicine:{n:"给小奶鸡送药",d:"走到岔路尽头",need:"end",pay:()=>{S.hp=Math.min(S.max,S.hp+25);const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,1);l.forEach(c=>c.u=(c.u|0)+1);return"奶鸡妈妈：回复 25 生命"+(l[0]?`，「${cname(l[0])}」升级了`:"")}},
 spar:{n:"陪奶马练一场",d:"打倒岔路中间的小怪",need:"mob",pay:()=>{S.max+=4;S.hp+=4;S.gold+=30;return"练武的奶马：最大生命 +4，+30 金币"}},
 herb:{n:"帮奶油摊找香草",d:"打倒岔路中间的小怪（香草在它身上）",need:"mob",pay:()=>{S.hp=Math.min(S.max,S.hp+20);S.gold+=30;return"奶油摊老板：回复 20 生命，+30 金币"}}};
function jsideTake(k){const slot=S.junc?"jside":"mside",cur=S[slot];if(cur&&!cur.done){toast("你手上已经有一个支线了，先办完它");return false}S[slot]={k,done:0,p:0};toast(`接下支线：<b>${JSIDE[k].n}</b>（${JSIDE[k].d}）`);saveRun();return true}
function jsideTick(need){["jside","mside"].forEach(sl=>jsideTick1(S[sl],need))}
function jsideTick1(q,need){if(!q||q.done||!JSIDE[q.k]||JSIDE[q.k].need!==need)return;q.p=(q.p||0)+1;if(q.p<(JSIDE[q.k].cnt||1)){toast(`支线「${JSIDE[q.k].n}」进度 ${q.p}/${JSIDE[q.k].cnt}`);saveRun();return}q.done=1;const r=JSIDE[q.k].pay();renderTop();toast(`支线完成：<b>${JSIDE[q.k].n}</b>　${r}`);sfx("relic");saveRun()}
function juncLeave(){if(!S.junc)return;delete S.jside;const sv=S.juncSave||{};S.junc=0;delete S.juncSave;S.map=sv.map||genMap();S.sky=sv.sky||genSky();S.row=-1;S.col=-1;S.path=[];S.atBoss=false;S.lowHalf=0;S.cur=null;saveRun();show("none");talk(HS("act"+S.act)).then(()=>openMap())}
async function juncFinish(){if(S.juncDone)return;S.juncDone=1;jsideTick("end");S.gold+=40;M.shards=(M.shards||0)+1;M.shardsAll=(M.shardsAll||0)+1;saveMeta();sfx("relic");ach("junction2");questTick("jDeep");renderTop();
 await chooseReward(offerCards(3,"R"),"走完岔路：+40 金币、记忆碎片 +1，再挑一张稀有牌");delete S.juncDone;renderTop();setTimeout(()=>juncLeave(),500)}
async function actClear(){if(S){S.rageUsed=0;S.rage=S.rage||0}setTimeout(()=>CLOUD.up(true),1500);if((S.act||0)<ACTS.length-1){const a=S.act||0,ob=curBoss();S.act=a;const jQ=S.quest&&!S.quest.done&&(QUESTS.find(x=>x.id===S.quest.id)||{}).j;const jOffer=!S.dream&&!S.fin&&(S.flags.juncForce||jQ||rnd()<.25);if(S.flags.juncForce)delete S.flags.juncForce;S.act++;if(S.act>=2)ach("act3");pickBoss();S.lowHalf=0;S.row=-1;S.col=-1;S.path=[];S.atBoss=false;S.actCombats=0;S.cur=null;S.map=genMap();S.sky=genSky();
  const heal=asc()>=7?(mlv("ascRest")?Math.floor((S.max-S.hp)*.3):0):Math.floor((S.max-S.hp)*.5);S.hp+=heal;saveRun();B=null;show("ending");setBg(["castle","snowfield","factory","cosmos"][a]);playMusic("title");
  $("#ending").innerHTML=`<div class="endBox"><div class="endImg"><img src="${IMG(ENEMY[ob].img)}"></div><h1>第${"一二三四"[a]}层 · 通关</h1><p>${ENEMY[ob].n}倒下的时候没有出声。往上的楼梯就在它身后，一直都在。</p><p style="font-size:20px;color:#ffe7a0">休整一下：回复 ${heal} 生命</p><div class="tbc"><span class="ribbon b">下一层：${ACTS[a+1].n}</span></div><div style="margin-top:22px">${jOffer?`<button class="btn pink" id="eJunc">走进 ${a+1}.5 层</button> `:""}<button class="btn" id="eNext">继续往上爬 ▶</button></div>${jOffer?`<p class="juncHint">楼梯旁边岔出去一条小路：<b>${a+1}.5层 · ${JNAME[a+1]||"交叉路口"}</b>。${jQ?"你接的酒馆任务就要在这里做。":"进去看看也行，直接上楼也行。"}</p>`:""}</div>`;
  sparks(640,200,"#ffd23f",30);$("#eNext").onclick=async()=>{show("none");await talk(HS("act"+S.act));openMap()};if(jOffer)$("#eJunc").onclick=()=>juncEnter();return}
 const st=S.stats;const roast=elderRoast(st,{win:1,gold:S.gold,deck:S.deck.length,golds:S.deck.filter(c=>c.g).length,pots:S.pots.length});ach("win");ach("win_"+(S.hero||"naiwa"));try{packState().bonus++;saveMeta();setTimeout(()=>toast("打通了大魔王：多得 <b>1 次</b>撕卡包的机会"),1500)}catch(e){}if(["naiwa","kungfu","knight"].every(h=>(M.ach||{})["win_"+h]))ach("trinity");if(!(S.stats.caught||0))ach("lonewolf");if(S.flags&&S.flags.doll)ach("seven");if(asc()>=1)ach("asc2");if(asc()>=3)ach("asc4");if(asc()>=7)ach("asc8");if(S.deck.length<=12)ach("slim");if(Math.min(S.hp,S.winHp==null?S.hp:S.winHp)<10)ach("close");const endKey=S.endKey||"base",endDiff=S.diff||"normal";if(endDiff==="hard")ach("win_hard");M.ends=M.ends||{};M.ends[endKey]=1;const endImg=HI(),ascNow=asc(),ascUp=ascNow>=(M.ascMax||0)&&ascNow<ASC.length-1;const SR=earnShards(true);M.wins++;if(ascUp)M.ascMax=ascNow+1;saveMeta();const deckN=S.deck.length;SHARE=runSnap(endKey==="true"?"真结局":"登顶",(S.act||0)*(ROWS+1)+ROWS+1);S=null;saveRun();B=null;
 show("ending");setBg("title");playMusic("title");
 const T=endKey!=="true"?(()=>{M.falseI=((M.falseI||0)+1);saveMeta();return FALSE_TALES[(M.falseI-1)%FALSE_TALES.length]})():END_TALE[endKey]&&!(M.endSeen||{})[endKey]?(M.endSeen=M.endSeen||{},M.endSeen[endKey]=1,saveMeta(),END_TALE[endKey]):(()=>{M.warmI=((M.warmI||0)+1);saveMeta();return WARM_TALES[(M.warmI-1)%WARM_TALES.length]})(),heroN=(HEROES.find(h=>h.img===endImg)||{}).n||"奶蛙",ascT=ascNow?`第 ${ascNow+1} 周目`:"";
 $("#ending").innerHTML=`<div class="winWrap"><div class="winHero"><div class="winMoon"></div><img src="${IMG(endImg)}"><i class="winStone"></i></div>
 <div class="winScroll"><div class="wsHead"><h1>${endKey==="true"?"真结局":"登顶"}</h1><div class="wsSeal">${heroN}<br>${ascT||"首登"}</div>${endDiff!=="normal"?`<div class="wsDiff d-${endDiff}">${DIFF[endDiff].n}登顶</div>`:""}</div>
 <p class="wsEnd">结局 ${Object.keys(M.ends||{}).length} / 5 · ${END_NAME[endKey]}</p><p class="wsLead">${END_LEAD[endKey]}</p>
 ${ascUp?`<p class="wsAsc">解锁「第 ${ascNow+2} 周目」　${ascTxt(ASC[ascNow+1])}</p>`:""}
 <div class="wsStats"><div><b>${st.kills}</b><small>击败敌人</small></div><div><b>${st.endb||0}</b><small>层末首领</small></div><div><b>${st.chain||0}</b><small>最长连锁</small></div><div><b>${st.maxHit||0}</b><small>单次最高伤害</small></div><div><b>${deckN}</b><small>最终牌组</small></div></div>
 <div class="wsQuote"><img src="${IMG("m6")}"><div>${roast.map(t=>`<p>「${t}」</p>`).join("")}</div></div>
 <div class="wsTale"><em>后来 · ${T.t}</em><p>${T.l.join("")}</p></div>
 <div class="wsFoot"><div class="wsShard">${ICON.star}<span>记忆碎片</span><b>+${SR.n}</b></div><div class="wsBtns"><button class="wsBtn red" id="eAgain">再爬一次</button><button class="wsBtn" id="eShare">分享图</button><button class="wsBtn" id="eHome">回到主页</button></div></div></div></div>`;
 sparks(640,200,"#ffd23f",40);$("#eAgain").onclick=heroSelect;$("#eHome").onclick=titleScreen;$("#eShare").onclick=()=>shareCard(SHARE)}



/* ===================== 4.0 隐藏首领：初号机 ===================== */
function injectProto(){if(!S||S.junc||!S.flags||!S.flags.ssProto||S.flags.protoDone||S.flags.protoRoute||S.dream||S.fin||(S.act||0)!==2)return;const GR=GROW();const r1=GR+1,r2=GR+2;if(!S.map[r1]||!S.map[r2])return;if(S.row>GR)return;
 const a=S.map[r1].filter(Boolean);const n1=a.find(n=>n.nx.some(c=>S.map[r2][c]))||a[0];if(!n1)return;const n2=S.map[r2][n1.nx[0]];if(!n2)return;n1.t="X";n1.hid=1;n1.grp=undefined;n2.t="H";n2.hid=1;n2.grp=["proto"];S.flags.protoRoute=1;saveRun();setTimeout(()=>toast("地图下半层出现了一条<b>彩色的隐藏路线</b>：SS 讨伐目标就在那里"),600)}
async function protoIntro(){clearBattleUI();setBg("bossice");show("battle");$("#hand").innerHTML="";$("#enemies").innerHTML="";playMusic("proto");await talk(STORY.ss_proto_in);await bossTitle("proto","SS 讨伐 · 初号机");startCombat("H")}
async function protoWin(){busy=true;await sleep(600);B=null;busy=false;show("none");await talk(STORY.ss_proto_win);S.flags.protoDone=1;S.flags.clue=1;gainRelic("proto_core");S.gold+=150;ach("proto");toast("SS 讨伐完成：<b>+150</b> 金币，得到「初号机的核心」。带去休息处给长老看看");saveRun();rewardScreen("E",0,[])}
function spareChoice(){return new Promise(res=>{ov(`<div class="modal spareBox"><h3>阿岳倒在了椅子前面</h3><p>他还有一口气。长老的话在你耳边：「他也是被用坏的那一个。」</p><div class="row" style="gap:20px;margin-top:18px"><button class="btn" id="spK">击败他</button><button class="btn pink" id="spS">宽恕他</button></div></div>`);$("#spK").onclick=()=>{closeOv();res(false)};$("#spS").onclick=()=>{closeOv();res(true)}})}
/* ===================== 4.0 真结局流程 ===================== */
const DREAM_SHOP=["这些东西都是我从山下背上来的。……奇怪，我怎么不记得背过？","阿岳出发那天，我给他煮了一锅奶茶。他一口没喝，说回来再喝。","你身上有长老的味道。那个老家伙，现在还好吗？","我总觉得自己在做一个很长的梦。梦里我一直在等。","买点什么吧。在梦里花钱，醒了也不心疼。"];
async function chairStart(){B=null;playMusic("chair");await talk(STORY.spare);ach("spare");await bossTitle("chairwill","塔顶 · ？？？");startCombat("W")}
async function chairEnd(){if(!B||B.over===3)return;B.over=3;busy=true;await sleep(500);banner("魔椅的意志 · 碎裂",1);stageShake();await sleep(1100);B=null;busy=false;show("none");setBg("demon");
 await talk(STORY.elderGone);S.flags.elderGone=1;if(!S.relics.includes("mw_beads"))gainRelic("mw_beads");ach("elder");
 S.dream=1;S.fin=0;S.boss="shadow";S.guard="youngyue";S.lowHalf=0;S.row=-1;S.col=-1;S.path=[];S.atBoss=false;S.actCombats=0;S.cur=null;S.map=genMap();S.sky=genSky();S.hp=S.max;saveRun();
 chapterCard("第五层 · 阿岳的梦","墙上的颜色是软的，像隔着一层水在看。这是阿岳的梦，椅子看不见的地方。",STORY.dreamIn)}
async function dreamClear(){B=null;show("none");await talk(STORY.dreamOut);gainRelic("mw_will");ach("dream");
 S.dream=0;S.fin=1;S.boss="abyssdragon";S.lowHalf=0;S.row=-1;S.col=-1;S.path=[];S.atBoss=false;S.cur=null;S.map=finMap();S.sky=genSky();S.hp=Math.min(S.max,S.hp+Math.floor((S.max-S.hp)*.6));saveRun();
 chapterCard("最终之地","深渊的水漫了上来，五个守层的首领在紫色的裂隙里等着。尽头，是深渊龙蛙。",STORY.finIn)}
function finMap(){const T=[["C","king"],["C","bishop"],["C","iceking"],["C","boilerdragon"],["C","general"],["r"]];const c=Math.floor(COLS/2);return T.map((x,r)=>{const row=Array(COLS).fill(null);row[c]={r,c,t:x[0],nx:r<T.length-1?[c]:[],jx:0,jy:0,grp:x[1]?[x[1]]:undefined};return row})}
function chapterCard(title,text,lines){show("ending");setBg(S.fin?"final":"low4");playMusic("title");$("#ending").innerHTML=`<div class="endBox chapter${S.dream?" dream":""}"><h1>${title}</h1><p>${text}</p><div style="margin-top:22px"><button class="btn" id="eNext">继续 ▶</button></div></div>`;sparks(640,200,S.dream?"#b8a8ff":"#ff4ad8",30);$("#eNext").onclick=async()=>{show("none");await talk(lines);openMap()}}
async function trueFinale(){B=null;show("none");setBg("final");await talk(STORY.trueEnd);ach("trueend");
 M.trueEnds=M.trueEnds||[];M.trueEnds.push({h:S.hero,n:HN(),t:Date.now(),a:asc(),d:S.diff||"normal",k:S.stats.kills,deck:S.deck.length});saveMeta();try{CLOUD.up(true)}catch(e){}
 await credits();S.endKey="true";S.act=ACTS.length-1;return actClear()}
function credits(){return new Promise(res=>{const L=[["奶蛙之塔",""],["",""],["制作人 · 程序 · 策划","龙井茉莉"],["美术 · 测试","乔乔"],["",""],["做这个游戏的时候",""],["","我们爆肝了很多个夜晚"],["","有时候光做一个角色，就做了好几天"],["","有一只奶蛙的腿画了三遍"],["","有一个首领的台词改了七次"],["",""],["谢谢每一位爬过塔的你",""],["","你们的反馈，让这座塔一层一层长高"],["",""],["小七的歌",""],["","送给每一个还在等泉水回来的人"],["",""],["抖音搜索【仰冬】","继续关注我们"],["",""],["—— 完 ——",""]];
 const d=document.createElement("div");d.id="credits";d.innerHTML=`<div class="crRoll">${L.map(([a,b])=>a?`<h3>${a}</h3>${b?`<p>${b}</p>`:""}`:b?`<p>${b}</p>`:`<br>`).join("")}</div><button class="btn sm ghost crSkip">跳过</button>`;$("#stage").appendChild(d);playMusic("credits");
 const end=()=>{if(d._done)return;d._done=1;d.classList.add("out");setTimeout(()=>{d.remove();res()},700)};d.querySelector(".crSkip").onclick=end;setTimeout(end,32000)})}
function hallOfFame(){const L=(M.trueEnds||[]).slice().reverse();ov(`<div class="ovHead"><span class="ribbon b">真结局名人堂</span><small>打败深渊龙蛙、把泉水带回来的每一次，都记在这里</small></div><div class="hofList">${L.length?L.map((x,i)=>{const H=HEROES.find(h=>h.id===x.h)||HEROES[0];const dt=new Date(x.t);return`<div class="hofRow"><img src="${IMG(H.img)}"><b>${H.n}</b><span>第 ${(x.a||0)+1} 周目 · ${DIFF[x.d]?DIFF[x.d].n:"普通"}</span><span>击败 ${x.k||0} · 牌组 ${x.deck||0}</span><small>${dt.getFullYear()}.${dt.getMonth()+1}.${dt.getDate()}</small></div>`}).join(""):`<p style="text-align:center;opacity:.7;margin-top:60px">还没有人走到这里。<br>第二次登顶以后，椅子会开口说话。</p>`}</div><div class="ovFoot"><button class="btn sm" id="ovX">返回</button></div>`);$("#ovX").onclick=closeOv}
/* ===================== 等级 / 天赋 ===================== */
const LV_XP=[0,0,2,4,7,11,16,22,29,37,46,56];
const perk=id=>(S&&S.perks&&S.perks[id])||0;
const PERKS={
 hp:{n:"强身",ic:"heart",max:9,d:"最大生命 +8，并回复 8",f:()=>{S.max+=8;S.hp=Math.min(S.max,S.hp+8)}},
 en:{n:"先手",ic:"star",max:2,d:"第一回合多 1 点奶力"},
 dr:{n:"眼疾手快",ic:"deck",max:2,d:"第一回合多抽 1 张"},
 cap:{n:"大池子",ic:"q",max:2,d:"奶蛙池 +1 格，更不容易溢出"},
 frogB:{n:"奶蛙拳意",ic:"sword",max:3,d:"奶蛙爆发伤害 +50%"},
 horseB:{n:"奶马奔雷",ic:"wind",max:3,d:"奶马爆发伤害 +50%"},
 chickB:{n:"奶鸡铁壁",ic:"shield",max:3,d:"奶鸡爆发护盾 +50%"},
 catB:{n:"奶猫回春",ic:"heart",max:3,d:"奶猫爆发回复与抽牌 +50%"},
 rb:{n:"彩虹开局",ic:"star",max:2,d:"每场战斗开始，池里先放 1 只彩虹奶蛙"},
 str:{n:"蛙力",ic:"up",max:3,d:"每场战斗开始力气 +1"},
 regen:{n:"喝口奶茶",ic:"heart",max:3,d:"每场战斗结束回复 4 生命"},
 gold:{n:"招财",ic:"coin",max:2,d:"战斗获得的金币 +40%"},
 chain:{n:"连锁大师",ic:"boom",max:2,d:"每次连锁额外获得 6 护盾"},
 crit:{n:"会心",ic:"sword",max:3,d:"暴击率 +4%"},
 anqi:{n:"暗器袋",ic:"boom",max:2,d:"每场战斗开始，多得 1 个你擅长的暗器"},
 egg:{n:"孵蛋高手",ic:"heart",max:2,d:"蛋孵化时的伤害 +50%"},
 rage:{n:"心如止水",ic:"star",max:2,d:"顿悟 / 通透世界 / 星之力攒得快 30%"},
 thorn:{n:"带刺的皮",ic:"shield",max:2,d:"每场战斗开始获得 2 层荆棘"},
 upg:{n:"开窍",ic:"up",max:5,d:"立刻随机升级 2 张牌",f:()=>{shuffle(S.deck.filter(c=>upOK(c))).slice(0,2).forEach((c,i,arr)=>{c.u=(c.u|0)+1;if(i===arr.length-1)upFx(arr);toast(`<b>${cname(c)}</b> 升级了！`)})}},
};
async function gainXP(n){if(!S.lv){S.lv=1;S.xp=0;S.perks={}}if(has("xpbook"))n=Math.ceil(n*1.5);if(S.mod==="xp")n*=2;S.xp+=n;renderTop();
 while(S.lv<LV_XP.length-1&&S.xp>=LV_XP[S.lv+1]){S.lv++;S.hp=Math.min(S.max,S.hp+5);renderTop();await levelUp()}saveRun()}
/* 天赋流派 */
const PSCH={frogB:{n:"奶蛙流",f:"frog"},horseB:{n:"奶马流",f:"horse"},chickB:{n:"奶鸡流",f:"chick"},catB:{n:"奶猫流",f:"cat"},rb:{n:"彩虹流",f:"any",c:"#b392ff"},chain:{n:"连锁流",c:"#e5191c",k:"连"},
 hp:{n:"体魄",c:"#ff5a5d",k:"体"},str:{n:"体魄",c:"#ff5a5d",k:"力"},regen:{n:"体魄",c:"#ff5a5d",k:"茶"},en:{n:"节奏",c:"#4fc3ff",k:"先"},dr:{n:"节奏",c:"#4fc3ff",k:"快"},cap:{n:"奶蛙池",c:"#7bd06b",k:"池"},gold:{n:"财运",c:"#ffd23f",k:"财"},upg:{n:"修行",c:"#b392ff",k:"悟"}};
function perkCard(k,i){const P=PERKS[k],sc=PSCH[k]||{n:"通用",c:"#fff"},fc=sc.f&&FAM[sc.f]?FAM[sc.f].c:sc.c,cur=perk(k),mx=P.max;
 const art=sc.f&&TOKEN[sc.f]?`<span class="pArt"><img src="${IMG(TOKEN[sc.f])}"></span>`:`<span class="pi">${ICON[P.ic]||""}</span>`;
 const d=P.d.replace(/([+-]?\d+%?|×[\d.]+)/g,"<em>$1</em>");
 const pips=mx>1?`<span class="pLv">${[...Array(Math.min(mx,9))].map((_,j)=>`<i class="${j<cur?"on":j===cur?"nx":""}"></i>`).join("")}</span>`:"";
 return`<button class="perk sch" data-k="${k}" style="--sc:${fc}"><u>0${i+1}</u><span class="pTag">${sc.n}</span>${art}<b>${P.n}</b><p>${d}</p>${pips}<small>${cur?`Lv.${cur} → Lv.${cur+1}`:"NEW · 新天赋"}</small></button>`}
function levelUp(title){return new Promise(res=>{sfx("levelup");const ids=shuffle(Object.keys(PERKS).filter(k=>perk(k)<PERKS[k].max&&!(k==="rage"&&!RAGE[S.hero]))).slice(0,3);
 ov(`<div class="lvWrap"><div class="lvRays"></div><div class="lvSlash"></div><div class="lvUp"><i>LEVEL UP</i><b>${title||"等级提升！"}</b><small>${title?"":"<em>Lv."+S.lv+"</em>　生命 +5　"}选一个天赋，这一局一直有效</small></div><div class="perkRow">${ids.map((k,i)=>perkCard(k,i)).join("")}</div></div>`);
 sparks(640,140,"#f7c948",34);
 $$("#ov .perk").forEach(b=>b.onclick=()=>{const k=b.dataset.k;S.perks[k]=(S.perks[k]||0)+1;if(PERKS[k].f)PERKS[k].f();sfx("relic");closeOv();toast(`获得天赋 <b>${PERKS[k].n}</b>`);renderTop();saveRun();res()})})}

/* ===================== 奖励 ===================== */
function rollRar(kind){const r=rnd();if(kind==="E")return r<.03?"L":r<.15?"E":r<.55?"R":"C";if(kind==="R")return r<.04?"L":r<.2?"E":"R";return r<.01?"L":r<.05?"E":r<.3?"R":"C"}
/* 4.2：每个主角更容易拿到自己流派的牌（魔法师还包括通用的法术牌） */
function ownCard(x){const D=CARDS[x],h=S&&S.hero;if(!D||!h)return false;if(D.hero)return D.hero===h;return h==="mage"&&!!D.spell}
function offerCards(n,kind,force,shinyFirst){const out=[];let guard=0;const own=S&&S.hero&&!out.length;while(out.length<n&&guard++<200){let id;if(!force&&rnd()<.08)id=pick(POOL_X);else{const rr=rollRar(kind);const ok=x=>(!CARDS[x].hero||CARDS[x].hero===(S&&S.hero))&&!(S&&S.hero==="vamp"&&vampUseless(x));let pool=POOL_HERO.filter(x=>CARDS[x].r===rr&&ok(x));if(own&&rnd()<.42&&guard<60){const mine=pool.filter(ownCard);if(mine.length)pool=mine}if(S&&S.hero==="kungfu"&&guard<60){const nb=pool.filter(x=>!vampUseless(x));if(nb.length&&rnd()<.7)pool=nb}id=pick(pool)}if(out.some(c=>c.id===id))continue;out.push(mk(id,0))}
 out.forEach((c,i)=>rollShiny(c,shinyFirst&&i===0));return out}
function shinyRec(c){if(!c||!c.sh)return;M.shinyCol=M.shinyCol||{};const r=M.shinyCol[c.id]||{};r[c.g?"g":"s"]=1;r[c.sh]=1;M.shinyCol[c.id]=r;saveMeta()}
function addCard(c){S.deck.push(c);shinyRec(c);if(S.deck.filter(x=>x.g).length>=3)ach("gold3");if(S.deck.filter(x=>CARDS[x.id].type==="cur").length>=5)ach("curse5");if(c.g)ach("goldcard");if(c.sh)ach("shiny");seeCard(c.id);const D=CARDS[c.id];if("SKTG".includes(D.r)||c.g)return false;
 const same=S.deck.filter(x=>x.id===c.id&&!x.g);if(same.length<3)return false;
 const top3=same.slice(0,3),mu=Math.max(1,...top3.map(x=>x.u|0)),msh=(top3.find(x=>x.sh)||{}).sh;top3.forEach(x=>S.deck.splice(S.deck.indexOf(x),1));const g={id:c.id,u:mu,g:1,k:++S.uid};if(msh){g.sh=msh;shinyRec(g)};S.deck.push(g);mergeFx(g);return true}
function upFx(cards){cards=(cards||[]).filter(Boolean).slice(0,3);if(!cards.length)return;sfx("relic");setTimeout(()=>sfx("tri"),420);
 const d=document.createElement("div");d.className="upFx";
 d.innerHTML=`<div class="upRays"></div><div class="upRow">${cards.map((c,i)=>`<div class="upC" style="--i:${i}"><div class="upOld">${cardHTML({id:c.id,u:0,g:c.g,k:"uo"+i},"mid")}</div><div class="upNew">${cardHTML(c,"mid")}</div><div class="upFlash"></div>${[...Array(10)].map((_,k)=>`<i class="upSp" style="--a:${k*36}deg;--d:${(k%3)*40}ms"></i>`).join("")}</div>`).join("")}</div><div class="upT"><img class="upIc" src="${UP_IMG}" alt=""><b>升级！</b><small>${cards.map(cname).join("、")}</small></div>`;
 $("#stage").appendChild(d);setTimeout(()=>d.classList.add("out"),1900);setTimeout(()=>d.remove(),2400)}
function mergeFx(g){sfx("tri");const d=document.createElement("div");d.className="mergeFx";d.innerHTML=`<div class="m3">${[0,1,2].map(i=>`<div class="mc mc${i}">${cardHTML({id:g.id,u:0,k:"m"+i},"mid")}</div>`).join("")}</div><div class="mg">${cardHTML(g,"big")}</div><div class="mt"><b>三合一！</b><small>获得金卡「${cname(g)}」，效果触发两次</small></div>`;$("#stage").appendChild(d);
 d.onclick=()=>d.remove();setTimeout(()=>d.remove(),3200);setTimeout(()=>sparks(640,330,"#f7c948",30),900)}
function mergeTag(id){if(!S)return"";const D=CARDS[id];if("SKTG".includes(D.r))return"";const n=S.deck.filter(x=>x.id===id&&!x.g).length;return n===2?`<span class="mtag hot">拿了就合成金卡！</span>`:n===1?`<span class="mtag">已有 1 张 · 集齐 3 张合成</span>`:""}
function chooseReward(cards,title,canSkip=true){return new Promise(res=>{const o=$("#ov");const nw=cards.map(c=>!(M.got||{})[c.id]);cards.forEach(c=>{seeCard(c.id);gotCard(c.id)});
 ov(`<div class="pickHead"><span class="ribbon b">${title}</span><small>选一张加入牌组</small></div><div class="pickRow">${cards.map((c,i)=>`<div class="pkw">${cardHTML(c,"big")}${mergeTag(c.id)}${nw[i]?`<i class="newTag">图鉴 NEW</i>`:""}</div>`).join("")}</div><div class="pickFoot">${canSkip?`<button class="btn ghost" id="rkSkip">跳过</button>`:""}</div>`);
 $$("#ov .pickRow .card").forEach((e,i)=>e.onclick=()=>{sfx("card");cardFly(e,CARDS[cards[i].id].r);closeOv();if(!addCard(cards[i]))toast(`<b>${cname(cards[i])}</b> 加入了牌组`);renderTop();saveRun();if(nw[i]){const nid=cards[i].id;setTimeout(()=>cardReveal([nid],0),420)}res(cards[i])});
 const sk=$("#rkSkip");if(sk)sk.onclick=()=>{closeOv();res(null)}})}
function randRelic(rar){let pool=RELIC_POOL.filter(r=>!S.relics.includes(r));if(rar){const p2=pool.filter(r=>RELICS[r].r===rar);if(p2.length)pool=p2}return pool.length?pick(pool):null}
const RELIC_MAX=5;
function qzDrop(items){const h=S.hero;const rs=Object.keys(RELICS).filter(k=>RELICS[k].r==="Q"&&RELICS[k].hero===h&&!S.relics.includes(k));const cs=Object.keys(CARDS).filter(k=>CARDS[k].r==="Q"&&CARDS[k].hero===h);if(rs.length&&(rnd()<.5||!cs.length))items.push({t:"relic",v:pick(rs)});else if(cs.length)items.push({t:"card",v:[mk(pick(cs))]});toast("奇招出现了！");sfx("relic")}
function dropRelic(id){const i=S.relics.indexOf(id);if(i<0)return;S.relics.splice(i,1);if(id==="milktank"||id==="heartstone"){S.max=Math.max(1,S.max-12);S.hp=Math.min(S.hp,S.max)}if(id==="belt"){S.potSlots=Math.max(1,S.potSlots-1);S.pots=S.pots.slice(0,S.potSlots)}}
function relicSwap(id){const box=document.createElement("div");box.id="relicSwap";const R=RELICS[id];
 box.innerHTML=`<div class="rsBox"><h4>遗物最多带 ${RELIC_MAX} 件</h4><p class="rsNew">新遗物：<b>${R.n}</b>　${R.d}</p><p class="rsTip">点一件旧遗物换掉它，或者不要新的（换成 40 金币）</p><div class="rsList">${S.relics.map(r=>`<button class="rsIt" data-r="${r}">${relicHTML(r)}<b>${RELICS[r].n}</b><small>${RELICS[r].d}</small></button>`).join("")}</div><button class="btn sm" id="rsSkip">不要新的，换 40 金币</button></div>`;
 document.body.appendChild(box);box.querySelectorAll(".rsIt").forEach(b=>b.onclick=()=>{dropRelic(b.dataset.r);box.remove();toast(`扔掉了 <b>${RELICS[b.dataset.r].n}</b>`);gainRelic(id);saveRun()});
 $("#rsSkip").onclick=()=>{box.remove();S.gold+=40;sfx("coin");toast("换成了 <b>40</b> 金币");renderTop();saveRun()}}
function gainRelic(id){if(!id){S.gold+=50;toast("遗物都拿光了，换成 <b>50</b> 金币");return}if(S.relics.length>=RELIC_MAX){relicSwap(id);return}S.relics.push(id);if(id==="milktank"||id==="heartstone"){S.max+=12;S.hp+=12}if(id==="belt")S.potSlots++;sfx("relic");toast(`获得遗物 <b>${RELICS[id].n}</b>：${RELICS[id].d}`);renderTop()}
const randPot=()=>pick(Object.keys(POTIONS).filter(k=>!POTIONS[k].old));
function givePotQuiet(id){if(S.pots.length<S.potSlots)S.pots.push(id)}
function givePot(id){if(S.pots.length>=S.potSlots){toast("药水栏满了");return false}S.pots.push(id);renderTop();return true}
function rewardScreen(kind,extraGold,caught=[]){show("reward");setBg(actN().bgs[0]);playMusic("swing");
 const items=[];const gold=Math.round((has("goldtooth")&&kind==="E"?1.4:1)*(((kind==="E"||kind==="M"||kind==="K")?20+ri(9):8+ri(9))*(kind==="M"?2:kind==="K"?1.6:1)+extraGold+(B&&B.goldKill?90+S.act*30:0))*(1+.4*perk("gold"))*(S.mod==="fat"?2:1));items.push({t:"gold",v:gold});
 if(kind==="M"||rnd()<(kind==="E"?.6:.4))items.push({t:"pot",v:randPot()});
caught.forEach(id=>items.push({t:"pal",v:id,done:0,auto:1}));
 items.push({t:"card",v:offerCards((has("clover")?4:3)-(asc()>=6?1:0),(kind==="E"||kind==="M"||kind==="K"||S.combats<=1)?"E":"C",0,S.combats<=1||B&&B.shinyLoot)});
 if((kind==="E"&&rnd()<.2)||(kind==="K"&&rnd()<.4)||(kind==="M"&&rnd()<.1)||S.isekaiFight)items.push({t:"relic",v:randRelic(kind==="K"?"E":"R")});S.isekaiFight=0;if(["E","B","K","M"].includes(kind)&&!S.noSave&&rnd()<.08)qzDrop(items);if(kind==="K"&&!S.lowHalf)S.lowHalf=1;if(B&&B.lootRelic)items.push({t:"relic",v:randRelic()});
 S.cur=null;saveRun();
 const draw=()=>{$("#reward").innerHTML=`<div class="panel"><div class="phead"><span class="ribbon">胜利！</span></div><div class="psub">${kind==="K"?"守关首领倒下了，前面的路开了":kind==="E"?"精英被打倒了，掉了好东西":"拿上战利品继续前进"}</div><div class="rwList">${items.map((it,i)=>{let ic="",tx="",sm="";
   if(it.t==="gold"){ic=ICON.coin;tx=`${it.v} 金币`}
   if(it.t==="pot"){ic=potHTML(it.v);tx=POTIONS[it.v].n;sm=POTIONS[it.v].d}
   if(it.t==="card"){ic=ICON.deck;tx="选一张卡牌";sm="三选一，也可以跳过"}
   if(it.t==="pal"){ic=ICON.net;tx=`抓到伙伴：${CARDS[it.v].n}`;sm="已经加入牌组"}
   if(it.t==="relic"){ic=relicHTML(it.v);tx=it.v?RELICS[it.v].n:"50 金币";sm=it.v?RELICS[it.v].d:""}
   return`<button class="rwItem ${it.done?"done":""}" data-i="${i}"><span class="ic">${ic}</span>${tx}<small>${sm}</small></button>`}).join("")}</div><div class="foot">${items.some(i=>!i.done)?`<button class="btn pink" id="rwAll">全部收下</button>`:""}<button class="btn" id="rwGo">继续前进 ▶</button></div></div>`;
  $$("#reward .rwItem").forEach(b=>b.onclick=async()=>{const it=items[+b.dataset.i];if(it.done)return;
   if(it.t==="gold"){S.gold+=it.v;S.stats.gold+=it.v;sfx("coin");it.done=1}
   else if(it.t==="pot"){if(givePot(it.v)){sfx("relic");it.done=1}}
   else if(it.t==="relic"){gainRelic(it.v);it.done=1}
   else if(it.t==="card"){const r=await chooseReward(it.v,"选一张卡牌");if(r)it.done=1}
   renderTop();saveRun();draw()});
  if($("#rwAll"))$("#rwAll").onclick=async()=>{let full=false;for(const it of items){if(it.done)continue;if(it.t==="gold"){S.gold+=it.v;S.stats.gold+=it.v;it.done=1}else if(it.t==="pot"){if(givePot(it.v))it.done=1;else full=true}else if(it.t==="relic"){gainRelic(it.v);it.done=1}else if(it.t==="pal")it.done=1}sfx("coin");renderTop();saveRun();draw();
   const c=items.find(i=>i.t==="card"&&!i.done);if(c){const r=await chooseReward(c.v,"选一张卡牌");if(r)c.done=1;renderTop();saveRun();draw()}if(full)toast("药水栏满了，药水还放在这里");else if(items.every(i=>i.done||i.t==="card"))setTimeout(()=>{if($("#reward").classList.contains("on"))openMap()},450)};
  $("#rwGo").onclick=()=>{const left=items.filter(i=>!i.done&&(i.t==="gold"||i.t==="relic"||i.t==="pot"));if(left.length)confirmBox("还有奖励没拿","直接走的话，没点的金币、遗物、药水就不要了。",()=>{closeOv();openMap()});else openMap()}};
 draw();renderTop()}

/* ===================== 休息 ===================== */
/* 休息处：长老讲的往事和念的诗（轮流讲，不重复） */
const ELDER_TALK=[
 ["你小时候第一次下泉水，吓得抓着我的胡子不放。","现在都敢一个人爬塔了。","……胡子倒是被你揪少了好几根。"],
 ["塔里的每一层，都住着曾经想上去的人。","有的人留下了，有的人变成了别的样子。","你打赢它们的时候，记得也替它们看一眼塔顶。"],
 ["累了就歇。","歇够了再走，路又不会跑。","我等了几十年，也没见哪条路自己跑掉。"],
 ["村口那棵老树，是阿岳小时候种的。","他走以后，我每年都给它浇水。","树长得比他高了。他要是回来，得仰着头看。"],
 ["你知道奶茶泉为什么是甜的吗？","我也不知道。","可能是大家喝的时候，心里都挺高兴。"],
 ["吃饱了吗？","没吃饱就别逞强，塔上可没有人给你煮粥。","……来，我兜里还有半块饼。"],
 ["我年轻的时候，也爬过这座塔。","那时候我只想着往上爬，一次都没回头看。","后来才知道，最要紧的东西，一直在塔底下。"],
 ["很久很久以前，山那边的人唱过一首长歌，叫《罗兰之歌》。","里面有一句，我一直记得：「山高而幽暗，谷深，水急。」","唱的是一个骑士守在山口，一直不肯吹号角求援，到最后才吹响。","有的人就是这样，什么都想自己扛。阿岳也是。"],
 ["阿岳走的那天早上，天还没亮。","他把干粮袋往肩上一甩，回头说：「找到泉，我就回来。」","我在门口站了很久。后来每年那一天，我都去门口站一会儿。"],
 ["给你念一首我年轻时候写的，别笑。","「泉水往下流，人往上走。」","「走到半山腰，回头看，炊烟像一根线。」","「线的那头，有人在等你回家吃饭。」"],
 ["你看这火。","木头烧完就成了灰，可火光照过的地方，你都记得。","人也是这样。"],
 ["塔里的每一个守门人，都给自己找了一个理由。","有的说是等人，有的说是守约，有的说是怕冷。","理由是真的，难过也是真的。打他们的时候，别恨他们。"],
 ["我教过两个徒弟。一个下了山，一个去了山那边。","我总觉得自己教错了什么。","现在看见你，又觉得，也许没教错。"],
 ["山那边的人还有一句老话：「勇敢的人往前走，聪明的人记得回头。」","我希望你两样都有。"]];
async function restClue(){if(!S.flags.clue||S.flags.truth)return;show("none");await talk(STORY.elder_clue);S.flags.truth=1;ach("clue");saveRun()}
async function restSite(){await restClue();show("rest");setBg(["swamp","castle","snowfield","factory","summit"][S.act||0]||"swamp");playMusic("home");const heal=Math.floor(S.max*(.27-.025*(S.act||0)+(has("oldmap")?.15:0)+.05*mlv("rest"))*(asc()>=8?2/3:1)*DF().heal)+(has("pot")?10:0);
 const canUp=S.deck.some(c=>upOK(c));if(S.cur&&S.cur.tough==null)S.cur.tough=3+ri(3);const tough=(S.cur&&S.cur.tough)||4;
 $("#rest").innerHTML=`<div class="restGlow"></div><div class="pickHead"><span class="ribbon b">休息点</span><small>火烧得很安静。你坐了一会儿，想起村里的晚饭。</small></div><div class="restScene"><img class="rsHero" src="${IMG(HI())}"><div class="camp camp2"><i class="cGlow"></i><i class="cLog l1"></i><i class="cLog l2"></i><i class="cStone"></i><i class="cf f1"></i><i class="cf f2"></i><i class="cf f3"></i><i class="cf f4"></i><i class="cf f5"></i><i class="cEm e1"></i><i class="cEm e2"></i><i class="cEm e3"></i><i class="cEm e4"></i><i class="cEm e5"></i><i class="cEm e6"></i></div><img class="rsElder" id="rsElder" src="${IMG("m6")}"><div class="elderSay" id="elderSay">坐过来烤烤火。想听点什么，就叫我一声。</div></div>
 <div class="restOpts"><button class="ropt rHeal" id="rHeal"><span class="rArt"><img src="${IMG(HI())}"><i class="zz">Z<sup>z</sup></i></span><b>休息</b><small>回复 <em>${heal}</em> 生命</small></button><button class="ropt rUp" id="rUp" ${canUp?"":"disabled"}><span class="rArt"><img class="rFrog" src="${IMG("n1")}"></span><img class="rBadge" src="${UP_IMG}" alt=""><b>修炼</b><small>升级一张牌</small></button><button class="ropt rTough" id="rTough"><span class="rArt"><img src="${IMG(HI())}"></span><b>磨练筋骨</b><small>最大生命 <em>+${tough}</em></small></button></div>`;
 const done=()=>{saveRun();setTimeout(openMap,600)};
 $("#rHeal").onclick=()=>{S.hp=Math.min(S.max,S.hp+heal);sfx("heal");toast(`回复了 <b>${heal}</b> 生命`);renderTop();done()};
 $("#rUp").onclick=async()=>{const r=await upgradePick();if(r)done()};
 $("#rTough").onclick=()=>{S.max+=tough;S.hp+=tough;sfx("relic");toast(`筋骨更结实了：最大生命 <b>+${tough}</b>`);renderTop();done()};
 {let tale=null,ti=0;const say=t=>{const e=$("#elderSay");if(e){e.textContent=t;e.classList.remove("pop");void e.offsetWidth;e.classList.add("pop")}};
  $("#rsElder").onclick=()=>{sfx("click");if(!tale||ti>=tale.length){const unT=VILLAGE_TALES.filter(t=>!(M.seenT||[]).includes(t.t));tale=unT.length&&rnd()<.4?villageTale().l:ELDER_TALK[(M.elderI=(M.elderI||0)+1)%ELDER_TALK.length];ti=0;if(M.elderI>=ELDER_TALK.length)ach("elder8");S.talks=(S.talks||0)+1;if(S.talks>=3)ach("chatty");saveMeta()}say(tale[ti++])}}}
async function upgradePick(){const list=S.deck.filter(c=>upOK(c));
 const r=await pickCards(list,{title:"升级一张牌",sub:"每张牌最多升到 ★★★，第一颗星提升最大",confirm:c=>`${cardHTML(c,"big")}<span class="arr">➜</span>${cardHTML({...c,u:(c.u|0)+1},"big")}`});
 if(r[0]){r[0].u=(r[0].u|0)+1;upFx([r[0]]);renderTop();return true}return false}

/* ===================== 宝箱 ===================== */
function treasure(){if(S.cur&&S.cur.mimic){S.cur.mimic=2;saveRun();return startCombat("M")}
 if(S.cur&&!S.flags.goldChest&&!S.cur.gold&&S.cur.mimicRoll==null)S.cur.mimicRoll=rnd()<(asc()>=1?.3:.18)?1:0;
 if(S.cur&&S.cur.mimicRoll===1){ach("bitten");show("reward");setBg(actN().bgs[0]);$("#reward").innerHTML=`<div class="panel"><div class="phead"><span class="ribbon">宝箱</span></div><div class="psub">一个看起来很普通的箱子，是吗？</div><div class="chestBig" id="mimicChest">${ICON.mChest}</div><div class="foot"><button class="btn" id="mOpen">打开宝箱</button></div></div>`;
  $("#mOpen").onclick=async()=>{const c=$("#mimicChest");c.classList.add("bite");sfx("hurt");stageShake();await sleep(500);S.hp=Math.max(1,S.hp-5);renderTop();toast("宝箱，咬人了！是<b>宝箱怪</b>！打赢它能拿双倍宝物");S.cur.mimic=1;saveRun();await sleep(700);startCombat("M")};return}
 show("reward");setBg(actN().bgs[0]);const r=rnd();let tier=(S.cur&&S.cur.gold)||S.flags.goldChest?2:r<.36?1:0;S.flags.goldChest=0;
 const T=[{n:"小宝箱",d:"藏在角落的小箱子，咔哒一声开了",rel:"C",g:[20,40]},{n:"大宝箱",d:"沉甸甸的大箱子，里面闪着光",rel:"R",g:[40,70],pot:1},{n:"金宝箱",d:"金光闪闪！传说中的金宝箱！",rel:"R",g:[80,120],gold:1,pot:1,relic:1}][tier];
 const id=randRelic(T.rel);const gd=T.g[0]+ri(T.g[1]-T.g[0]);const items=[{t:"gold",v:gd},{t:"card",v:offerCards(3,tier>=1?"R":"C",0,tier>=2)}];if(T.pot)items.push({t:"pot",v:randPot()});if(T.gold)items.push({t:"goldcard"});if(T.relic)items.splice(1,0,{t:"relic",v:id});if(rnd()<.08)qzDrop(items);if(tier===2)ach("goldchest");
 S.cur=null;saveRun();sfx(tier?"relic":"coin");
 const draw=()=>{$("#reward").innerHTML=`<div class="panel"><div class="phead"><span class="ribbon">${T.n}</span></div><div class="psub">${T.d}</div><div class="chestBig t${tier}">${tier===2?ICON.mChestG:ICON.mChest}</div><div class="rwList ${items.length>4?"many":""}">${items.map((it,i)=>{let ic="",tx="",sm="";
   if(it.t==="relic"){ic=it.v?relicHTML(it.v):"";tx=it.v?RELICS[it.v].n:"50 金币";sm=it.v?RELICS[it.v].d:""}
   if(it.t==="gold"){ic=ICON.coin;tx=it.v+" 金币"}
   if(it.t==="pot"){ic=potHTML(it.v);tx=POTIONS[it.v].n;sm=POTIONS[it.v].d}
   if(it.t==="card"){ic=ICON.deck;tx="选一张卡牌";sm="三选一，可以跳过"}
   if(it.t==="goldcard"){ic=ICON.star;tx="挑一张金卡";sm="三选一，直接变成金卡（效果触发两次）"}
   return`<button class="rwItem ${it.done?"done":""}" data-i="${i}"><span class="ic">${ic}</span>${tx}<small>${sm}</small></button>`}).join("")}</div><div class="foot">${items.some(it=>!it.done)?`<button class="btn pink" id="tkAll">全部收下</button>`:""}<button class="btn" id="tkGo">继续前进 ▶</button></div></div>`;
  const take=async it=>{if(it.done)return 1;
   if(it.t==="relic"){if(it.v)gainRelic(it.v);else S.gold+=50}if(it.t==="gold"){S.gold+=it.v;sfx("coin")}if(it.t==="pot"&&!givePot(it.v))return;
   if(it.t==="card"){const r=await chooseReward(it.v,"选一张卡牌");if(!r)return}
   if(it.t==="goldcard"){const cs=offerCards(3,"R",1);cs.forEach(c=>{c.u=1;c.g=1});const r=await chooseReward(cs,"挑一张金卡");if(!r)return}
   it.done=1;renderTop();saveRun();return 1};
  $$("#reward .rwItem").forEach(b=>b.onclick=async()=>{if(await take(items[+b.dataset.i]))draw()});
  {const ab=$("#tkAll");if(ab)ab.onclick=async()=>{if(ab.disabled)return;ab.disabled=1;for(const it of items)await take(it);draw();if(items.some(i=>i.t==="pot"&&!i.done))toast("药水栏满了，药水还放在这里");else if(items.every(i=>i.done))setTimeout(()=>{if($("#reward").classList.contains("on"))openMap()},450)}}
  $("#tkGo").onclick=()=>{const left=items.filter(i=>!i.done&&(i.t==="gold"||i.t==="relic"||i.t==="pot"));if(left.length)confirmBox("还有宝物没拿","直接走的话，没点的金币、遗物、药水就不要了。",()=>{closeOv();openMap()});else openMap()}};draw();renderTop()}

/* ===================== 商店 ===================== */



/* ===================== 4.0 状态第一次出现时的小教学 + 状态百科 ===================== */
const STX={str:"打出去的每一下攻击都多这么多伤害。叠满 8 层会发金光。",dex:"每层让护盾牌多给 1 点护盾，还让你有几率直接闪开攻击：每层 3%，最多 30%。所有主角都一样，功夫奶蛙最会用它：闪开以后能回血、能反打。",
 vuln:"它这几回合挨打会更疼：受到的伤害 ×1.5。",weak:"它这几回合打人没力气：造成的伤害 ×0.75。",burn:"烫伤会在回合开始时扣血，每回合少 1 层。",bleed:"流血和烫伤差不多：回合开始扣血，然后少 1 层。",
 mud:"泥巴会在回合开始扣你的血。",thorn:"有人打你，就会被扎回去等量的伤害。",mana:"魔法师的法术伤害加上魔力。没用完的奶力会变成魔力，上限看蓝条。",
 inj:"内伤是功夫奶蛙的招牌：敌人每回合结束都要掉这么多血，而且不会自己消失。叠多了用「寸劲」一口气引爆。",brk:"破甲的敌人加护盾时只能加一半。",
 frost:"冻伤：造成的伤害少 25%。",para:"麻痹：每层有 15% 的几率这回合动不了。",wet:"潮湿本身不疼，但是雷打它翻倍，火烧变蒸汽 ×1.5，冰冻会再加冻伤。魔法师先泼水再打雷。",
 poison:"中毒每回合扣血，而且越拖越疼：每回合层数 +1，持续 3 回合。解毒剂能解。",night:"梦魇：攻击时每层有 15% 的几率打到自己。",
 evade:"闪避：每层能挡一次——被打的时候有一半机会完全闪开，用掉一层少一层。",curse:"诅咒在倒数到 0 的时候扣一大口血。解毒剂能解。",brittle:"骑士的护盾被打穿那一刻会「脆弱」：这回合剩下的攻击多受 25% 伤害。",
 dodge:"闪身：下一次受到的攻击减少这么多。",warm:"暖意：下回合多 1 点奶力，但回合结束时每层烧掉 3 生命。打出技能牌能甩掉一层。",rest:"安息：叠满 3 层你会睡过去一回合。",mirror:"模仿：你每消除一次，它就照着打你。"};
let ST_Q=[],ST_ON=0;
function stScan(){if(!B||PREV||B.kind==="R"&&false)return;M.stSeen=M.stSeen||{};const objs=[B.p,...B.alive()];for(const o of objs)for(const k in STAT){if(o[k]>0&&!M.stSeen[k]&&!ST_Q.includes(k))ST_Q.push(k)}if(ST_Q.length&&!ST_ON)stShow()}
function stShow(){const k=ST_Q.shift();if(!k){ST_ON=0;return}ST_ON=1;M.stSeen[k]=1;saveMeta();const D=STAT[k];let d=$("#stIntro");if(!d){d=document.createElement("div");d.id="stIntro";$("#battle").appendChild(d)}
 d.innerHTML=`<i class="stTag">新状态</i><div class="stRow"><span class="sts">${stsHTML({[k]:1}).replace('<b>1</b>','')}</span><b style="color:${D.c}">${D.n}</b></div><p>${STX[k]||D.d}</p><div class="stBtns"><button class="btn sm ghost" id="stAll">全部状态</button><button class="btn sm" id="stOk">知道了</button></div>`;
 d.classList.remove("on");void d.offsetWidth;d.classList.add("on");clearTimeout(d._h);const nx=()=>{clearTimeout(d._h);d.classList.remove("on");setTimeout(()=>stShow(),260)};d._h=setTimeout(nx,9000);$("#stOk").onclick=ev=>{ev.stopPropagation();nx()};$("#stAll").onclick=ev=>{ev.stopPropagation();nx();stCodex()}}
function stCodex(){const keys=Object.keys(STAT);const seen=M.stSeen||{};ov(`<div class="ovHead"><span class="ribbon b">状态说明</span><small>战斗里点一下状态图标，也能随时看说明</small></div><div class="stList">${keys.map(k=>`<div class="stItem ${STBAD[k]?"bad":"good"}"><span class="sts">${stsHTML({[k]:1}).replace('<b>1</b>','')}</span><div><b style="color:${STAT[k].c}">${STAT[k].n}</b>${seen[k]?"":`<em>还没遇到</em>`}<p>${STX[k]||STAT[k].d}</p></div></div>`).join("")}</div><div class="ovFoot"><button class="btn sm" id="ovX">返回</button></div>`);$("#ovX").onclick=closeOv}
/* ===================== 4.0 主角回忆关 ===================== */
let MEMO_RES=null;
function memoryBattle(replay){return new Promise(async res=>{MEMO_RES=res;const Mm=MEMO[S.hero];S.memoSeen={};S.memoMod=S.mod;S.mod="memo";
 show("none");playMusic("memo");await talk(Mm.pre);startCombat("R");const bt=$("#battle");bt.classList.add("memory");$("#bg").classList.add("memoBg");let fx=$("#memoFx");if(!fx){fx=document.createElement("div");fx.id="memoFx";fx.innerHTML=`<i class="grain"></i><i class="vig"></i><i class="flick"></i><b class="memoT"></b>`;bt.appendChild(fx)}fx.querySelector(".memoT").innerHTML=`${HN()}的回忆<small>${Mm.t.replace(/^回忆 · /,"")}</small>`;
 setTimeout(()=>{if(!B)return;const fam=memoFam();B.pool=[{f:fam,ice:0},{f:fam,ice:0}];renderPool()},300)})}
function memoFam(){const c=S.deck.find(c=>CARDS[c.id].type==="atk"&&(CARDS[c.id].fam!=="none"||CARDS[c.id].spell));if(!c)return"frog";const D=CARDS[c.id];return D.spell?"magic":D.fam}
function memoTip(k,html,ms){if(!B||B.kind!=="R"||!S.memoSeen||S.memoSeen[k])return;S.memoSeen[k]=1;let t=$("#memoTip");if(!t){t=document.createElement("div");t.id="memoTip";$("#battle").appendChild(t)}t.innerHTML=`<i>回忆 · 提示</i><b class="mtX">×</b><p>${html}</p>`;t.onclick=()=>t.classList.remove("on");t.classList.remove("on");void t.offsetWidth;t.classList.add("on");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("on"),ms||8000)}
function memoTurn(){if(!B||B.kind!=="R"||B.over)return;const Mm=MEMO[S.hero];
 if(B.turn===1)memoTip("t1","每回合有 <b>3 点奶力</b>（左下角圆圈）。卡牌左上角是它要花的奶力。点一张牌出牌，要选目标的再点敌人。<br>敌人头顶的牌子是它下一步要做的事：剑是攻击，盾是加护盾。",9000);
 else if(B.turn===2){memoTip("mech",Mm.mech,9000);if(!S.memoSeen.chain){const fam=memoFam(),o=fam==="chick"?"cat":"chick";B.pool=[{f:o,ice:0},{f:fam,ice:0},{f:fam,ice:0},{f:o,ice:0},{f:o,ice:0}];renderPool();setTimeout(()=>memoTip("chainSet","池子已经摆好了：再打一张同家族的牌试试，看会发生什么。",6000),9200)}}
else if(B.turn===3&&false){memoTip("anqi","左边是<b>暗器袋</b>：点一下就扔，不花奶力。凑齐 3 个一样的会一起引爆。"+(RAGE[S.hero]?"<br>主角血条下面那条是<b>"+RAGE[S.hero].n+"</b>：慢慢攒，一局能用一次。":""),9000)}
else if(B.turn===4&&false)memoTip("end","没用完的牌回合结束会弃掉，下回合重新抽。打不完也没关系，点右下角<b>结束回合</b>。",7000)}
async function memoEnd(won){const Mm=MEMO[S.hero];busy=true;await sleep(700);const bt=$("#battle");
 banner(won?"回忆 · 完":"回忆 · 模糊了",1);await sleep(1200);bt.classList.remove("memory");$("#bg").classList.remove("memoBg");const fx=$("#memoFx");if(fx)fx.remove();const t=$("#memoTip");if(t)t.remove();
 S.hp=S.max;S.rage=0;if(S.memoMod)S.mod=S.memoMod;B=null;busy=false;show("none");await talk(won?Mm.post:[["n1",HN(),"……那时候，我还没赢过。"],["m6","奶蛙长老","没关系。回忆不是用来赢的。"]]);
 if(M.memo&&M.memo[S.hero])toast("回忆结束。可以在设置里随时<b>重温回忆</b>");const r=MEMO_RES;MEMO_RES=null;if(r)r()}
async function replayMemory(hid){closeOv();const keep=S;S=null;await newRunShell(hid);await memoryBattle(1);S=keep;titleScreen()}
async function newRunShell(hid){S={v:2,seed:1,rs:1,uid:0,hp:72,max:72,gold:0,deck:[],relics:[],pots:[],potSlots:2,row:-1,col:-1,path:[],combats:0,elites:0,removeCost:75,stats:{kills:0,played:0,dmg:0,tri:0,gold:0},flags:{},evSeen:[],atBoss:false,cur:null,noSave:1};S.hero=hid;S.diff="easy";{const H=HEROES.find(h=>h.id===hid);S.hp=S.max=H.hp}S.act=0;S.lv=1;S.xp=0;S.perks={};S.mod="calm";S.asc=0;
 S.deck=(hid==="kungfu"?["strike","strike","strike","strike","guard","k_lightfoot","k_lightfoot","fist","fist","k_jab","k_jab","k_palm"]:hid==="knight"?[...STARTER.filter((x,i)=>i!==0),"kn_shield","kn_bash","kn_slash","strike"]:hid==="mage"?["m_bolt","m_bolt","m_bolt","m_bolt","m_spark","m_ward","m_ward","guard","guard","m_fire"]:hid==="vamp"?["v_bite","v_bite","v_bite","v_bite","v_claw","v_dodge","v_dodge","v_dodge","v_pact","v_bleed","v_fang"]:[...STARTER,"strike"]).map(id=>mk(id));S.map=genMap();S.sky=genSky();S.boss=null;pickBoss();S.pals={}}
function memoPick(){ov(`<div class="modal"><h3>重温回忆</h3><p style="text-align:center;opacity:.8">选一位主角，回到他出发之前的那一天</p><div class="row" style="flex-wrap:wrap;gap:12px;justify-content:center">${HEROES.filter(h=>h.on&&MEMO[h.id]).map(h=>`<button class="btn sm ${M.memo&&M.memo[h.id]?"":"ghost"}" data-h="${h.id}">${h.n}</button>`).join("")}</div><div class="row"><button class="btn sm ghost" id="mpX">返回</button></div></div>`);$$("#ov [data-h]").forEach(b=>b.onclick=()=>replayMemory(b.dataset.h));$("#mpX").onclick=closeOv}
/* ===================== 4.0 酒馆 ===================== */
const QUESTS=[
 {id:"j_npc",g:"C",j:1,n:"问路",d:"在岔路（.5 层）上遇到 2 个人",k:"jNpc",need:2,rw:"50 金币，回复 15 生命",f:()=>{S.gold+=50;S.hp=Math.min(S.max,S.hp+15)}},
 {id:"j_elite",g:"B",j:1,n:"岔路上的怪物",d:"在岔路（.5 层）打败 1 只岔路精英",k:"jElite",need:1,rw:"80 金币，最大生命 +5",f:()=>{S.gold+=80;S.max+=5;S.hp+=5}},
 {id:"j_deep",g:"A",j:1,n:"走到尽头",d:"走到岔路（.5 层）的尽头",k:"jDeep",need:1,rw:"挑一张稀有牌，60 金币",f:async()=>{S.gold+=60;const r=await chooseReward(offerCards(3,"R",1),"任务奖励：挑一张");if(r)addCard(r)}},
 {id:"j_hunt",g:"S",j:1,n:"岔路猎人",d:"在岔路（.5 层）打败 2 只岔路精英",k:"jElite",need:2,rw:"一件稀有遗物，100 金币",f:()=>{S.gold+=100;const id=randRelic("R");if(id)gainRelic(id)}},
 {id:"c_win2",g:"C",n:"连赢两场",d:"再打赢 2 场战斗",k:"win",need:2,rw:"40 金币",f:()=>{S.gold+=40}},
 {id:"c_play",g:"C",n:"手不停",d:"再打出 25 张牌",k:"play",need:25,rw:"35 金币，回复 10 生命",f:()=>{S.gold+=35;S.hp=Math.min(S.max,S.hp+10)}},
 {id:"b_flaw",g:"B",n:"毫发无伤",d:"不掉一滴血赢下一场战斗",k:"flaw",need:1,rw:"70 金币",f:()=>{S.gold+=70}},
 {id:"b_chain",g:"B",n:"三连锁",d:"在一次出牌里打出 3 级连锁",k:"chain3",need:1,rw:"一瓶随机药水，50 金币",f:()=>{S.gold+=50;givePotQuiet(randPot())}},
 {id:"b_crit",g:"B",n:"会心",d:"再打出 8 次暴击",k:"crit",need:8,rw:"60 金币，最大生命 +3",f:()=>{S.gold+=60;S.max+=3;S.hp+=3}},
 {id:"a_catch",g:"A",n:"带个伙伴回来",d:"再抓到 1 只敌人",k:"catch",need:1,rw:"挑一张稀有牌",f:async()=>{const r=await chooseReward(offerCards(3,"R",1),"任务奖励：挑一张");if(r)addCard(r)}},
 {id:"a_elite",g:"A",n:"悬赏精英",d:"再打败 1 只精英怪",k:"elite",need:1,rw:"一件普通遗物",f:()=>{gainRelic(randRelic("C"))}},
 {id:"s_boss",g:"S",n:"体面地赢",d:"打败这一层的首领时，生命还剩一半以上",k:"bossHalf",need:1,rw:"一件稀有遗物，100 金币",f:()=>{S.gold+=100;gainRelic(randRelic("R"))}},
 {id:"c_kill",g:"C",n:"清理杂兵",d:"再打倒 6 个敌人",k:"kill",need:6,rw:"45 金币",f:()=>{S.gold+=45}},
 {id:"c_tri",g:"C",n:"三连练习",d:"再触发 6 次池子消除",k:"tri",need:6,rw:"30 金币，一瓶随机药水",f:()=>{S.gold+=30;givePotQuiet(randPot())}},
 {id:"c_anqi",g:"C",n:"试试暗器",d:"再扔出 5 个暗器",k:"anqi",need:5,rw:"40 金币",f:()=>{S.gold+=40}},
 {id:"b_egg",g:"B",n:"孵小鸡",d:"再孵出 3 枚蛋",k:"hatch",need:3,rw:"60 金币，回复 15 生命",f:()=>{S.gold+=60;S.hp=Math.min(S.max,S.hp+15)}},
 {id:"b_big",g:"B",n:"一拳定音",d:"一下打出 30 点以上的伤害",k:"big30",need:1,rw:"随机升级 2 张牌",f:()=>{const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);if(l.length)upFx(l)}},
 {id:"b_fast",g:"B",n:"速战速决",d:"在 3 回合内赢下一场战斗",k:"fast",need:1,rw:"75 金币",f:()=>{S.gold+=75}},
 {id:"a_combo",g:"A",n:"连击狂",d:"一个回合里打出 6 张攻击牌",k:"combo6",need:1,rw:"挑一张稀有牌，40 金币",f:async()=>{S.gold+=40;const r=await chooseReward(offerCards(3,"R",1),"任务奖励：挑一张");if(r)addCard(r)}},
 {id:"a_poor",g:"A",n:"轻装上阵",d:"牌组不超过 15 张时赢下一场精英战",k:"lightElite",need:1,rw:"一件普通遗物，最大生命 +5",f:()=>{S.max+=5;S.hp+=5;gainRelic(randRelic("C"))}},
 {id:"s_rage",g:"S",n:"顿悟之时",d:"发动一次顿悟 / 通透世界 / 星之力，并赢下那场战斗",k:"rageWin",need:1,rw:"一件稀有遗物",f:()=>{gainRelic(randRelic("R"))}},
 {id:"s_flaw",g:"S",n:"毫发无伤的精英",d:"不掉血赢下一场精英战",k:"flawElite",need:1,rw:"一张金卡，60 金币",f:async()=>{S.gold+=60;const cs=offerCards(3,"R",1);cs.forEach(c=>{c.u=1;c.g=1});const r=await chooseReward(cs,"任务奖励：挑一张金卡");if(r)addCard(r)}},
 {id:"s_anqi",g:"S",n:"暗器高手",d:"凑齐 3 个一样的暗器引爆 1 次",k:"anqi3",need:1,rw:"一张金卡",f:async()=>{const cs=offerCards(3,"R",1);cs.forEach(c=>{c.u=1;c.g=1});const r=await chooseReward(cs,"任务奖励：挑一张金卡");if(r)addCard(r)}}];
function questTick(k,n=1){const q=S&&S.quest;if(!q||q.done)return;const Q=QUESTS.find(x=>x.id===q.id);if(!Q||Q.k!==k)return;q.p=(q.p||0)+n;if(q.p>=Q.need){q.done=1;toast(`任务完成：<b>${Q.n}</b>！回到地图时自动领奖`);sfx("relic")}}
async function questPay(){const q=S&&S.quest;if(!q||!q.done||q.paid)return;const Q=QUESTS.find(x=>x.id===q.id);q.paid=1;S.quest=null;await Q.f();toast(`任务奖励到手：<b>${Q.rw}</b>`);S.stats.quests=(S.stats.quests||0)+1;if(Q.g==="S")ach("questS");renderTop();saveRun()}
function ssOk(){return (M.wins||0)>=1&&S&&S.flags&&!S.flags.ssProto&&!S.flags.protoDone&&((S.act||0)<2||((S.act||0)===2&&S.row<GROW()))}
function tavernScreen(){show("shop");setBg("shop");playMusic("country");const T=TAVERN[Math.min(S.act||0,TAVERN.length-1)];
 if(!S.cur.tav){const gs=["C","C","B","B","A","S"];const used=[];S.cur.tav={qs:gs.map(g=>{const jOK=!S.junc&&!S.dream&&!S.fin&&(S.act||0)<ACTS.length-1;const q=pick(QUESTS.filter(q=>q.g===g&&!used.includes(q.id)&&(jOK||!q.j)));used.push(q.id);return q.id}),rps:0,talk:0,hp:0,mp:0,fc:0,fr:0};saveRun()}const tv=S.cur.tav;
 let sayNow=T.hi;const tsay=t=>{sayNow=t;const e=$(".shopSay");if(e){e.textContent=t;e.classList.remove("pop");void e.offsetWidth;e.classList.add("pop")}};
 const gate=()=>Date.now()<(window.SHOP_LOCK||0);
 const draw=()=>{const pr=p=>`<div class="price ${S.gold<p?"no":""}">${ICON.coin}${p}</div>`;const q=S.quest,Qc=q&&QUESTS.find(x=>x.id===q.id);
  $("#shop").innerHTML=`<div class="shopKeeper tavKeeper"><img src="${IMG(T.img)}"></div><div class="shopSay">${sayNow}</div><div class="tavName">${T.boss}</div><div class="shopBoard tavBoard"><div class="phead"><span class="ribbon">${T.n}</span></div>
  <div class="tavSec"><b class="tavH">任务板</b>${ssOk()?`<div class="qSS" id="qSS"><i>SS</i><div><b>讨伐悬赏：冰原上的铁皮奶蛙</b><p>冰原上出现了一只像机器一样的奶蛙，见到会动的就抓，冰屋都被掀翻了，伤亡惨重。悬赏能打倒它的冒险者。</p><small>奖励：150 金币，以及它身上掉下来的东西　·　不占普通任务的名额</small></div></div>`:S.flags.ssProto&&!S.flags.protoDone?`<div class="qSS taken"><i>SS</i><div><b>讨伐悬赏：冰原上的铁皮奶蛙（已接）</b><small>冰封钟楼的下半层，找那条彩色的路</small></div></div>`:""}${q?`<div class="qCur g-${Qc.g}"><i>${Qc.g}</i><div><b>${Qc.n}${Qc.j?`<em class="qJ">岔路</em>`:""}</b>　${Qc.d}<small>进度 ${Math.min(q.p||0,Qc.need)}/${Qc.need} · 奖励：${Qc.rw}</small></div>${q.done?`<button class="btn sm" id="qPay">领奖</button>`:`<button class="btn sm ghost" id="qDrop">放弃</button>`}</div>`:`<div class="qList">${tv.qs.map(id=>{const Q=QUESTS.find(x=>x.id===id);return`<div class="qCard g-${Q.g}" data-q="${id}"><i>${Q.g}</i><b>${Q.n}${Q.j?`<em class="qJ">岔路</em>`:""}</b><p>${Q.d}</p><small>奖励：${Q.rw}</small></div>`}).join("")}</div><small class="qTip">普通任务一次接一个，SS 悬赏可以同时接</small>`}</div>
  <div class="tavRow">
   <div class="shopItem tavIt" id="tvTalk"><div class="rmv"><big>💬</big>和老板聊聊</div><div class="price">免费</div></div>
   <div class="shopItem tavIt ${tv.rps>=3?"sold":""}" id="tvRps"><div class="rmv"><big>✊</big>猜拳赌钱<small>还能玩 ${3-tv.rps} 局</small></div><div class="price">${ICON.coin}押 30</div></div>
   <div class="shopItem tavIt ${tv.fc?"sold":""}" id="tvForget"><div class="rmv"><big>🍶</big>忘忧酒<small>忘掉一张牌</small></div>${pr(60)}</div>
   <div class="shopItem tavIt ${tv.fr||!S.relics.filter(r=>r!=="cup").length?"sold":""}" id="tvForgetR"><div class="rmv"><big>🍶</big>陈年忘忧酒<small>忘掉一个遗物</small></div>${pr(40)}</div>
   <div class="shopItem tavIt ${tv.hp?"sold":""}" id="tvHp"><div class="rmv"><big>🍺</big>壮骨酒<small>最大生命 +6</small></div>${pr(80)}</div>
   ${S.hero==="mage"?`<div class="shopItem tavIt ${tv.mp?"sold":""}" id="tvMp"><div class="rmv"><big>🍸</big>星露酒<small>最大魔力 +3</small></div>${pr(70)}</div>`:""}
  </div></div><button class="btn sm shopLeave" id="shGo">离开 ▶</button></div>`;
  const pay=(p,f)=>{if(S.gold<p){tsay("钱不够啊朋友，赊账要等你下次来。");sfx("hurt");return false}S.gold-=p;sfx("coin");f();renderTop();saveRun();draw();return true};
  if($("#qSS"))$("#qSS").onclick=async()=>{if(gate())return;const ok=await shopConfirm(`<div class="qSS big"><i>SS</i><div><b>讨伐：冰原上的铁皮奶蛙</b><p>危害极大。接下以后，冰封钟楼的下半层会出现一条隐藏路线，尽头就是它。</p></div></div>`,0,"接下悬赏");if(!ok)return;S.flags.ssProto=1;ach("ssquest");tsay("SS？……那东西我见过一次。活着回来，酒我请。");saveRun();draw()};
  $$(".qCard").forEach(e=>e.onclick=async()=>{if(gate())return;const Q=QUESTS.find(x=>x.id===e.dataset.q);const ok=await shopConfirm(`<div class="qCard big g-${Q.g}"><i>${Q.g}</i><b>${Q.n}</b><p>${Q.d}</p><small>奖励：${Q.rw}</small></div>`,0,"接下任务");if(!ok)return;S.quest={id:Q.id,p:0,act:S.act||0};tsay(Q.g==="S"?"S 级？……行，我在这儿等你回来。":"好，接了就别反悔。");saveRun();draw()});
  if($("#qDrop"))$("#qDrop").onclick=()=>{S.quest=null;tsay("放弃也是一种勇气。……不过下次别找我接活。");saveRun();draw()};
  if($("#qPay"))$("#qPay").onclick=async()=>{await questPay();tsay("拿好。这塔里，说话算话的不多了。");draw()};
  $("#tvTalk").onclick=()=>{tsay(T.talk[tv.talk%T.talk.length]);tv.talk++;if(tv.talk>=T.talk.length)ach("tavlore");saveRun()};
  $("#tvRps").onclick=()=>{if(tv.rps>=3){tsay("今天不玩了，再玩我要关门了。");return}if(S.gold<30){tsay("押 30，你兜里没有啊。");return}tavRps(T).then(r=>{if(r==null)return;tv.rps++;if(r>0){S.gold+=30;sfx("coin");tsay(pick(TAVERN_RPS.win));S.stats.rpsWin=(S.stats.rpsWin||0)+1;if(S.stats.rpsWin>=3)ach("rps3")}else if(r<0){S.gold-=30;tsay(pick(TAVERN_RPS.lose))}else{tv.rps--;tsay(pick(TAVERN_RPS.tie))}renderTop();saveRun();draw()})};
  $("#tvForget").onclick=async()=>{if(tv.fc||gate())return;if(S.gold<60){tsay("忘忧酒 60，少一个子儿都不行。");return}const r=await pickCards(S.deck,{title:"喝了忘忧酒，忘掉哪张牌？",sub:"这张牌会从牌组里永远消失"});if(r[0])pay(60,()=>{S.deck.splice(S.deck.indexOf(r[0]),1);tv.fc=1;tsay(`「${cname(r[0])}」？什么牌？我从没见过。`)})};
  $("#tvForgetR").onclick=async()=>{if(tv.fr||gate())return;const rs=S.relics.filter(r=>r!=="cup");if(!rs.length)return;if(S.gold<40){tsay("钱不够。");return}const id=await pickRelicOv(rs,"忘掉哪个遗物？");if(id)pay(40,()=>{S.relics.splice(S.relics.indexOf(id),1);tv.fr=1;tsay(`${RELICS[id].n}……想不起来了。轻松多了吧？`)})};
  $("#tvHp").onclick=()=>{if(tv.hp||gate())return;pay(80,()=>{tv.hp=1;S.max+=6;S.hp+=6;tsay("一口闷！骨头都硬了吧？");toast("最大生命 <b>+6</b>")})};
  if($("#tvMp"))$("#tvMp").onclick=()=>{if(tv.mp||gate())return;pay(70,()=>{tv.mp=1;S.mmax=(S.mmax||15)+3;tsay("星露酒，喝了做梦都是亮的。");toast(`最大魔力 <b>+3</b>（现在 ${S.mmax}）`)})};
  $("#shGo").onclick=()=>{sfx("click");openMap()}};
 draw();if(S.quest&&S.quest.done)setTimeout(()=>tsay("你的任务做完了吧？来，领奖。"),400)}
function pickRelicOv(ids,title){return new Promise(res=>{const d=document.createElement("div");d.className="shopConf";d.innerHTML=`<div class="scBox"><b>${title}</b><div class="rlPick">${ids.map(id=>`<button class="rlOpt" data-id="${id}">${relicHTML(id)}<span>${RELICS[id].n}</span></button>`).join("")}</div><div class="scBtns"><button class="btn sm ghost" data-x="1">算了</button></div></div>`;const fin=v=>{window.SHOP_LOCK=Date.now()+500;d.remove();res(v)};d.onclick=e=>{e.stopPropagation();const o=e.target.closest(".rlOpt");if(o)fin(o.dataset.id);else if(e.target.closest("[data-x]")||!e.target.closest(".scBox"))fin(null)};$("#stage").appendChild(d)})}
function tavRps(T){return new Promise(res=>{const H=["✊","✌️","🖐"],N=["石头","剪刀","布"];const d=document.createElement("div");d.className="shopConf";d.innerHTML=`<div class="scBox rpsBox"><b>和${T.boss}猜拳</b><p>押 30 金币，赢了拿回 60</p><div class="rpsRes"><span class="me">？</span><i>VS</i><span class="him">？</span></div><div class="scBtns">${H.map((h,i)=>`<button class="btn sm rpsB" data-i="${i}">${h} ${N[i]}</button>`).join("")}</div></div>`;let done=0;
 d.onclick=async e=>{e.stopPropagation();const b=e.target.closest(".rpsB");if(!b){if(!e.target.closest(".scBox")&&!done){d.remove();res(null)}return}if(done)return;done=1;const me=+b.dataset.i,him=ri(3);d.querySelector(".me").textContent=H[me];const hs=d.querySelector(".him");for(let k=0;k<8;k++){hs.textContent=H[k%3];await sleep(70)}hs.textContent=H[him];const r=me===him?0:((me+1)%3===him?1:-1);d.querySelector(".scBox").insertAdjacentHTML("beforeend",`<p class="rpsOut ${r>0?"w":r<0?"l":""}">${r>0?"你赢了！+30":r<0?"你输了…… -30":"平局，再来一次"}</p>`);await sleep(1100);window.SHOP_LOCK=Date.now()+400;d.remove();res(r)};$("#stage").appendChild(d)})}
/* 商店购买确认：整屏遮罩挡住下面所有东西，关掉后 0.5 秒内商店不响应点击，防止手机上"连点"误买 */
function shopConfirm(html,price,label){return new Promise(res=>{closeTip();const d=document.createElement("div");d.className="shopConf";d.innerHTML=`<div class="scBox">${html}<div class="scBtns"><button class="btn sm ghost" data-a="0">算了</button><button class="btn sm" data-a="1"${S.gold<price?" disabled":""}>${label||(S.gold<price?"金币不够":"买下 "+price+" 金币")}</button></div></div>`;
 let done=0;const fin=v=>{if(done)return;done=1;window.SHOP_LOCK=Date.now()+550;d.classList.add("out");setTimeout(()=>d.remove(),380);res(v)};
 d.addEventListener("pointerdown",e=>e.stopPropagation());d.onclick=e=>{e.stopPropagation();const b=e.target.closest("button");if(b){if(b.disabled)return;fin(b.dataset.a==="1")}else if(!e.target.closest(".scBox"))fin(false)};$("#stage").appendChild(d)})}
function shopScreen(mode){if(S&&S.gold<=0)ach("broke");show("shop");setBg("shop");playMusic("country");const cv=mode==="caravan"||(S.cur.shop&&S.cur.shop.caravan);const off=((has("bellr")?.8:1)*(has("coupon")?.8:1))*(S.mod==="sale"?.7:1)*(S.mod==="gold"?1.2:1)*(cv?.85:1)*(1-.06*mlv("shop"));
 const price=c=>Math.round(({C:50,R:78,E:125,L:190,X:85}[CARDS[c.id].r]||60)*(.9+rnd()*.2)*off*(asc()>=5?1.15:1));
 if(!S.cur.shop&&cv){const cards=offerCards(4,"C",0,1).map(c=>({c,p:price(c)}));const relics=[randRelic("C"),randRelic("R")].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).map(id=>({id,p:Math.round(({C:185,R:270,E:350}[RELICS[id].r])*off)}));const pots=[randPot(),randPot()].map(id=>({id,p:Math.round(55*off)}));S.cur.shop={cards,relics,pots,rm:1,up:1,cp:1,caravan:1};saveRun()}
 if(!S.cur.shop){if(has("piggy")){S.gold+=30;toast("存钱罐叮当一响：<b>+30</b> 金币")}const cards=[...offerCards(asc()>=2?4:5,"C"),mk(pick(POOL_X))].map(c=>({c,p:price(c)}));cards[ri(cards.length-1)].sale=1;cards.forEach(x=>{if(x.sale)x.p=Math.round(x.p/2)});
  const relics=[randRelic("C"),randRelic(rnd()<.5?"R":"E")].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).map(id=>({id,p:Math.round(({C:150,R:220,E:290}[RELICS[id].r])*(.95+rnd()*.1)*off)}));
  const pots=[randPot(),randPot(),randPot()].map(id=>({id,p:Math.round((50+ri(25))*off*(S.mod==="tea"?.5:1))}));S.cur.shop={cards,relics,pots,rm:0,up:0,cp:0};saveRun()}
 const sh=S.cur.shop;const shopMood=()=>{const gc=S.deck.filter(c=>c.g).length;if(sh.caravan)return pick(SHOP_LINE.caravan);if(S.gold<50)return pick(SHOP_LINE.broke);if(gc>=2&&rnd()<.6)return pick(SHOP_LINE.gold);if(S.gold>=300)return pick(SHOP_LINE.rich);if(S.deck.length>=28&&rnd()<.5)return pick(SHOP_LINE.fat);if(S.deck.length<=12&&rnd()<.5)return pick(SHOP_LINE.thin);return pick(SHOP_LINE.idle)};let sayNow=S.dream?pick(DREAM_SHOP):shopMood();const shopSay=t=>{sayNow=t;const e=$(".shopSay");if(e){e.textContent=t;e.classList.remove("pop");void e.offsetWidth;e.classList.add("pop")}};
 const draw=()=>{const pr=(p,sale)=>`<div class="price ${S.gold<p?"no":""} ${sale?"sale":""}">${ICON.coin}${sale?"特价 ":""}${p}</div>`;
  $("#shop").innerHTML=`<div class="shopKeeper"><img src="${IMG(S.dream?"e_n1_old":sh.caravan?"hrcc":"m4")}"></div><div class="shopSay">${sayNow}</div><div class="shopBoard"><div class="phead"><span class="ribbon">${S.dream?"梦里的小摊":sh.caravan?"流浪奶马商队":"巨无霸杂货铺"}</span></div>
  <div class="shopCards">${sh.cards.map((x,i)=>{const nw=!x.sold&&!(M.got||{})[x.c.id];if(!x.sold)gotCard(x.c.id);return`<div class="shopItem ${x.sold?"sold":""}" data-c="${i}">${cardHTML(x.c,"")}${pr(x.p,x.sale)}${mergeTag(x.c.id)}${nw?`<i class="newTag">图鉴 NEW</i>`:""}</div>`}).join("")}</div>
  <div class="shopRow2">${sh.relics.map((x,i)=>`<div class="shopItem ${x.sold?"sold":""}" data-r="${i}">${relicHTML(x.id)}<div class="lbl">${RELICS[x.id].n}</div>${pr(x.p)}</div>`).join("")}${sh.pots.map((x,i)=>`<div class="shopItem ${x.sold?"sold":""}" data-p="${i}">${potHTML(x.id)}<div class="lbl">${POTIONS[x.id].n}</div>${pr(x.p)}</div>`).join("")}${sh.caravan?"":`<div class="shopItem ${sh.rm?"sold":""}" id="shRm"><div class="rmv"><big>✂</big>移除一张牌</div>${pr(S.removeCost)}</div><div class="shopItem ${sh.up?"sold":""}" id="shUp"><div class="rmv"><big>⬆</big>升级一张牌</div>${pr(svc(70))}</div><div class="shopItem ${sh.cp?"sold":""}" id="shCp"><div class="rmv"><big>⧉</big>复制一张牌<small>凑三合一</small></div>${pr(svc(95))}`}</div></div>
  <button class="btn sm shopLeave" id="shGo">离开 ▶</button><button class="btn sm ghost shopTalk" id="shTalk">💬 聊聊</button></div>`;
  $("#shTalk").onclick=()=>{sh.tk=(sh.tk||0);const L=S.dream?DREAM_SHOP:SHOP_TALK;shopSay(sh.caravan&&!S.dream?pick(SHOP_LINE.caravan):L[sh.tk%L.length]);sh.tk++};
  const buy=(p,f)=>{if(S.gold<p){shopSay(pick(SHOP_LINE.nomoney));sfx("hurt");return}S.gold-=p;sfx("coin");sayNow=pick(SHOP_LINE.thanks);f();renderTop();saveRun();draw()};
  const gate=()=>Date.now()<(window.SHOP_LOCK||0);
  $$(".shopItem[data-c]").forEach(e=>{const x=sh.cards[+e.dataset.c];e.onclick=async ev=>{ev.stopPropagation();if(x.sold||gate())return;const ok=await shopConfirm(`<div class="scCard">${cardHTML(x.c,"big")}</div><b>${cname(x.c)}</b><p>${CARDS[x.c.id].d((x.c.u|0))}</p>`,x.p);if(ok)buy(x.p,()=>{x.sold=1;if(addCard(x.c))return;toast(`买下了 <b>${cname(x.c)}</b>`)})}});
  $$(".shopItem[data-r]").forEach(e=>{const x=sh.relics[+e.dataset.r];e.onclick=async ev=>{ev.stopPropagation();if(x.sold||gate())return;const ok=await shopConfirm(`<div class="scIcon">${relicHTML(x.id)}</div><b>${RELICS[x.id].n}</b><p>${RELICS[x.id].d}</p>`,x.p);if(ok)buy(x.p,()=>{x.sold=1;gainRelic(x.id)})}});
  $$(".shopItem[data-p]").forEach(e=>{const x=sh.pots[+e.dataset.p];e.onclick=async ev=>{ev.stopPropagation();if(x.sold||gate())return;if(S.pots.length>=S.potSlots){toast("药水栏满了");return}const ok=await shopConfirm(`<div class="scIcon">${potHTML(x.id)}</div><b>${POTIONS[x.id].n}</b><p>${POTIONS[x.id].d}</p>`,x.p);if(ok)buy(x.p,()=>{x.sold=1;givePot(x.id)})}});
  if($("#shRm"))$("#shRm").onclick=async()=>{if(S.gold<S.removeCost){shopSay(pick(SHOP_LINE.nomoney));return}const r=await pickCards(S.deck,{title:"移除一张牌",sub:`花 ${S.removeCost} 金币，让牌组更精简`});if(r[0]){buy(S.removeCost,()=>{S.deck.splice(S.deck.indexOf(r[0]),1);sh.rm=1;S.removeCost+=25;toast(`<b>${cname(r[0])}</b> 被移除了`)})}};
  if($("#shUp"))$("#shUp").onclick=async()=>{if(S.gold<svc(70)){shopSay(pick(SHOP_LINE.nomoney));return}const ok=await upgradePick();if(ok){S.gold-=svc(70);sh.up=1;sfx("coin");renderTop();saveRun();draw()}};
  if($("#shCp"))$("#shCp").onclick=async()=>{if(S.gold<svc(95)){shopSay(pick(SHOP_LINE.nomoney));return}const list=S.deck.filter(c=>!c.g&&!"SKT".includes(CARDS[c.id].r));const r=await pickCards(list,{title:"复制一张牌",sub:"同名牌集齐 3 张会自动合成金卡"});if(r[0]){S.gold-=svc(95);sh.cp=1;sfx("coin");if(!addCard({id:r[0].id,u:r[0].u,k:++S.uid}))toast(`复制了 <b>${cname(r[0])}</b>`);renderTop();saveRun();draw()}};
  $("#shGo").onclick=()=>{S.cur=null;openMap()}};const svc=p=>Math.round(p*off*(has("vipcard")?.5:1));draw();renderTop()}

/* ===================== 随机性：今日塔况 / 精英词缀 / 闪卡 ===================== */
const MODS={
full:{n:"满月之夜",d:"每一层都是满月（三连只需 2 只），但敌人力气 +1"},
fat:{n:"胖胖塔",d:"敌人都变胖了：生命 +25%，但战斗金币翻倍"},
tiny:{n:"小池子",d:"奶蛙池只有 5 格（更容易溢出），但每消除 2 次给 1 点奶力"},
rain:{n:"暴雨季",d:"每一层都在下雨：泥巴伤害翻倍，奶蛙牌伤害 +2"},
sale:{n:"大甩卖",d:"商店里的东西全部七折"},
xp:{n:"修行日",d:"获得的经验翻倍，但最大生命 -10"},
shiny:{n:"闪卡潮",d:"闪卡出现的几率变成 4 倍"},
pal:{n:"伙伴节",d:"每场战斗可以多抓 1 只，抓捕不花奶力"},
chain:{n:"连锁狂热",d:"连锁爆发再 ×1.5，但敌人生命 +10%"},
mud:{n:"泥巴季",d:"敌人更爱丢泥巴，但泥巴消除时给 8 护盾和 1 点奶力"},
calm:{n:"风平浪静",d:"战斗中不会天气突变，每场战斗开始获得 5 护盾"},
gold:{n:"黄金之塔",d:"金色奶蛙出现得更频繁，但商店贵 20%"},
sand:{n:"沙尘暴",d:"每回合开始，风沙埋住池里 1 只奶蛙（一回合后挖出来），但所有攻击牌伤害 +1"},
tea:{n:"奶茶节",d:"每赢一场战斗回复 5 生命，商店的药水半价"},
hunter:{n:"捕手出没",d:"抓捕成功率 +15%，但敌人生命 +10%"},
memo:{n:"回忆",d:"这是一段回忆，没有塔况"}};
const AFFIX={
angry:{n:"暴躁的",d:"力气 +3"},
sticky:{n:"黏糊糊的",d:"每回合往你池里丢 1 块泥巴"},
timid:{n:"胆小的",d:"半血就逃跑，但会丢下一件遗物"},
tough:{n:"坚硬的",d:"每回合获得 8 护盾"},
greedy:{n:"贪吃的",d:"每回合吸走你池里 1 只奶蛙，回复 6 生命"},
frosty:{n:"冰冷的",d:"每回合冻住你池里 1 只奶蛙"},
huge:{n:"巨大的",d:"生命 +40%，个头也更大"},
mini:{n:"迷你",d:"生命 -35%，个头小小的，但力气 +2"},
swift:{n:"迅捷的",d:"第一回合会行动两次"},
vamp:{n:"吸血的",d:"打中你时，回复一半伤害的生命"},
spiky:{n:"带刺的",d:"你每次用攻击打中它，自己受到 3 伤害"},
mocking:{n:"狂笑的",d:"每回合让你虚弱 1"},
split:{n:"会分身的",d:"血量过半时分裂出一个分身"},
rich:{n:"富有的",d:"打倒它额外掉 60 金币"},
vengeful:{n:"复仇的",d:"同伴倒下时，力气 +3"},
copycat:{n:"学人精",d:"你每消除一次，它就打你 2 下"},
glitter:{n:"闪耀的",d:"打倒后的卡牌奖励里，必有一张闪卡"}};
const SHINY={draw:"打出后抽 1",cost:"费用 -1",pow:"效果 +4",ret:"保留",crit:"必定暴击",gold:"打出 +3 金币"};
function rollShiny(c,force){const D=CARDS[c.id];if("SKTP".includes(D.r)&&!force)return c;const rate=.1*(S&&S.mod==="shiny"?4:1);if(!force&&rnd()>=rate)return c;
 const ok=["draw"];if(D.cost>0)ok.push("cost");if(D.type==="atk"||D.type==="skl")ok.push("pow");if(!D.ret&&D.type!=="pow")ok.push("ret");if(D.type==="atk")ok.push("crit");ok.push("gold");c.sh=pick(ok);return c}
function applyAffix(e,af){const A=AFFIX[af];e.af=af;e.n=A.n+e.n;
 if(af==="angry")e.str+=3;if(af==="huge"){e.max=Math.round(e.max*1.4);e.hp=e.max;e.big=1}if(af==="mini"){e.max=Math.max(8,Math.round(e.max*.65));e.hp=e.max;e.small=1;e.str=(e.str||0)+2}if(af==="spiky")e.thorn=3;if(af==="copycat")e.mirror=2;if(af==="timid")e.timid=1}
const MOD_ST={memo:"忆",sand:"沙",tea:"茶",hunter:"捕",full:"月",fat:"胖",tiny:"小",rain:"雨",sale:"折",xp:"修",shiny:"闪",pal:"伴",chain:"链",mud:"泥",calm:"静",gold:"金"};
const MOD_GB={sand:["所有攻击牌伤害 +1","每回合风沙埋住池里 1 只奶蛙"],tea:["每赢一场回复 5 生命，药水半价","没有代价，好好享受"],hunter:["抓捕成功率 +15%","敌人生命 +10%"],full:["每一层都是满月（三连只需 2 只）","敌人力气 +1"],fat:["战斗金币翻倍","敌人都变胖了：生命 +25%"],tiny:["每消除 2 次给 1 点奶力","奶蛙池只有 5 格，更容易溢出"],rain:["每一层都在下雨，奶蛙牌伤害 +2","泥巴伤害翻倍"],xp:["获得的经验翻倍","最大生命 -10"],chain:["连锁爆发再 ×1.5","敌人生命 +10%"],mud:["泥巴消除时给 8 护盾和 1 点奶力","敌人更爱丢泥巴"],gold:["金色奶蛙出现得更频繁","商店贵 20%"]};
function modDescHTML(k){const gb=MOD_GB[k];if(!gb)return`<p class="mdG">${MODS[k].d}</p>`;return`<p class="mdG">${gb[0]}</p><p class="mdB"><span>代价</span>${gb[1]}</p>`}
function modIntro(){return new Promise(res=>{const keys=Object.keys(MODS).filter(k=>k!=="memo");let i=0;const M0=MODS[S.mod];
 ov(`<div class="mg modMg"><div class="mgHead"><span class="ribbon b">今日塔况</span><small>每一局的塔，都不太一样</small></div><div class="modCard" id="modCard"><div class="mcIn"><i class="mcTag">TODAY'S TOWER</i><b class="mcName">？</b><div class="mcDesc"></div></div><div class="mcSt"></div></div><div class="ovFoot"><button class="btn" id="modOk" disabled>知道了</button></div></div>`);
 const card=$("#modCard"),nm=card.querySelector(".mcName");let n=0;const spin=()=>{if(!document.contains(card))return;const k=keys[i++%keys.length];nm.textContent=MODS[k].n;nm.classList.remove("roll");void nm.offsetWidth;nm.classList.add("roll");sfx("click");if(++n<14)setTimeout(spin,60+n*12);else{nm.classList.remove("roll");nm.textContent=M0.n;card.querySelector(".mcDesc").innerHTML=modDescHTML(S.mod);card.querySelector(".mcSt").textContent=MOD_ST[S.mod]||"塔";card.classList.add("done");sfx("relic");const ok=$("#modOk");if(ok)ok.disabled=false}};spin();
 $("#modOk").onclick=()=>{closeOv();res()}})}
function weatherShift(){ach("wxshift");const w=B.wxShift.to;B.wxShift=null;B.wx=w;renderSky();const pill=$$("#skyBar .skyPill")[1];if(pill){pill.classList.remove("flash");void pill.offsetWidth;pill.classList.add("flash")}
 const d=document.createElement("div");d.className="triBan wxBan";d.innerHTML=`<b>天气突变！</b><small>${WX[w].n}：${WX[w].d}</small>`;$("#fx").appendChild(d);setTimeout(()=>d.remove(),2200);
 if(w==="storm")lightning();sfx("buff");setTimeout(()=>heroSay(HERO_LINE.weather[w],1),900)}

/* ===================== 小游戏 ===================== */
const RPS=[["rock","石头","✊"],["scissors","剪刀","✌️"],["paper","布","✋"]];

/* ===================== 小游戏：猜杯子 / 打铁 / 赛马 / 打奶鼠 ===================== */
function mgEnd(win,txt,res,val){$("#ov .mg").insertAdjacentHTML("beforeend",`<div class="mgRes ${win?"win":""}">${txt}</div><div class="ovFoot"><button class="btn" id="mgOk">好</button></div>`);sfx(win?"win":"hurt");$("#mgOk").onclick=()=>{closeOv();res(val)}}
function shellGame(){return new Promise(res=>{const X=[180,380,580];let pos=[0,1,2],ball=1;
 ov(`<div class="mg"><div class="mgHead"><span class="ribbon b">猜杯子</span><small id="sgI">看清楚，球在哪个杯子下面</small></div><div class="sgBox">${[0,1,2].map(i=>`<button class="sgCup" data-c="${i}" style="left:${X[i]}px"><i class="cup"></i></button>`).join("")}<i class="sgBall" style="left:${X[1]+48}px"></i></div></div>`);
 const cups=$$("#ov .sgCup");const place=()=>cups.forEach((c,i)=>c.style.left=X[pos[i]]+"px");
 (async()=>{cups[1].classList.add("lift");await sleep(1200);cups[1].classList.remove("lift");await sleep(400);if(!$("#ov .sgBall"))return;$("#ov .sgBall").style.opacity=0;
  const n=7+((S&&S.act)||0)*2;for(let k=0;k<n;k++){const a=ri(3);let b=ri(3);if(a===b)b=(a+1)%3;const ia=pos.indexOf(a),ib=pos.indexOf(b);pos[ia]=b;pos[ib]=a;const sp=Math.max(160,380-k*25);if(!$("#ov .sgBox"))return;cups.forEach(c=>c.style.transitionDuration=sp+"ms");place();sfx("click");await sleep(sp+60)}
  if(!$("#sgI"))return;$("#sgI").textContent="球在哪个杯子下面？";cups.forEach(c=>c.onclick=async()=>{cups.forEach(x=>x.onclick=null);const pick=+c.dataset.c;const ok=pick===ball;const bl=$("#ov .sgBall");bl.style.left=(X[pos[ball]]+48)+"px";bl.style.opacity=1;c.classList.add("lift");if(!ok)cups[ball].classList.add("lift");await sleep(700);mgEnd(ok,ok?"猜中了！":"不在这里……",res,ok)})})()})}
function forgeGame(){return new Promise(res=>{let hits=0,round=0,x=0,dir=1,raf,last=performance.now(),stop=false;const W=600;let zone=[250,350];
 ov(`<div class="mg"><div class="mgHead"><span class="ribbon b">打铁</span><small id="fgI">指针走到金色区域时点「敲！」，一共敲 3 下</small></div><div class="fgBox"><img class="fgSmith" src="${IMG("m2")}"><div class="fgBar"><i class="fgZone" id="fgZ"></i><i class="fgNeedle" id="fgN"></i></div><div class="fgDots">${[0,1,2].map(i=>`<u id="fgd${i}"></u>`).join("")}</div></div><div class="ovFoot"><button class="btn pink" id="fgGo">敲！</button></div></div>`);
 const setZ=()=>{const w=Math.max(46,100-round*22);const s=40+ri(W-80-w);zone=[s,s+w];const z=$("#fgZ");z.style.left=s+"px";z.style.width=w+"px"};setZ();
 const tick=t=>{if(!$("#fgN"))return;const dt=Math.min(40,t-last);last=t;if(!stop){x+=dir*(.38+round*.12)*dt;if(x>W){x=W;dir=-1}if(x<0){x=0;dir=1}$("#fgN").style.left=x+"px"}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);
 $("#fgGo").onclick=async()=>{if(stop)return;stop=true;const ok=x>=zone[0]&&x<=zone[1];if(ok){hits++;sfx("block");$("#ov .fgBox").classList.add("spark")}else sfx("hurt");$("#fgd"+round).className=ok?"ok":"no";await sleep(450);$("#ov .fgBox").classList.remove("spark");round++;
  if(round>=3){cancelAnimationFrame(raf);$("#fgGo").disabled=true;mgEnd(hits>=2,hits===3?"完美！三下都中":hits===2?"敲中了 2 下":"敲歪了……",res,hits);return}setZ();stop=false}})}
function raceGame(){return new Promise(res=>{const H=["hrg","hrl","hrz","hrf"];let mine=-1,pos=[0,0,0,0],raf,last,boost=0,done=false;const L=620;
 const draw=()=>`<div class="rcTrack">${H.map((h,i)=>`<div class="rcLane ${i===mine?"me":""}" data-i="${i}"><img src="${IMG(h)}" id="rch${i}" style="left:0px"><b>${i+1}</b></div>`).join("")}<i class="rcGoal"></i></div>`;
 ov(`<div class="mg"><div class="mgHead"><span class="ribbon b">奶马赛跑</span><small id="rcI">先押一匹奶马（点它的跑道）</small></div><div id="rcW">${draw()}</div><div class="ovFoot"><button class="btn pink" id="rcGo" disabled>加油！（狂点）</button></div></div>`);
 $$("#ov .rcLane").forEach(l=>l.onclick=()=>{if(mine>=0)return;mine=+l.dataset.i;l.classList.add("me");sfx("click");$("#rcI").textContent="开跑了！狂点「加油」给你的奶马加速";$("#rcGo").disabled=false;last=performance.now();raf=requestAnimationFrame(run)});
 const sp=[.11,.115,.12,.118].map(v=>v+Math.random()*.02);
 $("#rcGo").onclick=()=>{boost=Math.min(boost+.05,.14);sfx("click")};
 const run=t=>{if(!$("#rcW"))return;const dt=Math.min(40,t-last);last=t;for(let i=0;i<4;i++){let v=sp[i]*(.8+Math.random()*.5);if(i===mine){v+=boost}pos[i]=Math.min(L,pos[i]+v*dt);const im=$("#rch"+i);if(im)im.style.left=pos[i]+"px"}boost=Math.max(0,boost-.0006*dt);
  const w=pos.findIndex(p=>p>=L);if(w>=0&&!done){done=true;cancelAnimationFrame(raf);$("#rcGo").disabled=true;const ok=w===mine;if(ok)ach("rpswin");mgEnd(ok,ok?"你的奶马赢了！":`${w+1} 号先冲线了`,res,ok);return}raf=requestAnimationFrame(run)}})}
function whackGame(){return new Promise(res=>{let score=0,miss=0,t0=performance.now(),T=15000,live={},over=false;
 ov(`<div class="mg"><div class="mgHead"><span class="ribbon b">打奶鼠</span><small id="wkI">奶鼠冒头就敲！别敲到泥巴　0 只</small></div><div class="wkGrid">${[...Array(9)].map((_,i)=>`<button class="wkHole" data-i="${i}"><i class="wkM"></i></button>`).join("")}</div><div class="wkTime"><i id="wkT"></i></div></div>`);
 const holes=$$("#ov .wkHole");const info=()=>{$("#wkI").textContent=`奶鼠冒头就敲！别敲到泥巴　${score} 只`};
 const pop=()=>{if(over||!$("#ov .wkGrid"))return;const free=[...Array(9).keys()].filter(i=>!live[i]);if(free.length){const i=pick(free);const mud=Math.random()<.18;live[i]=mud?"mud":"rat";const m=holes[i].querySelector(".wkM");m.innerHTML=`<img src="${IMG(mud?"pp":pick(["ms","msg","msb","msl"]))}">`;holes[i].classList.add("up");const el=performance.now()-t0;setTimeout(()=>{if(live[i]){live[i]=0;holes[i].classList.remove("up")}},Math.max(520,1100-el/30))}setTimeout(pop,Math.max(260,650-(performance.now()-t0)/40))};pop();
 holes.forEach((h,i)=>h.onpointerdown=()=>{if(over||!live[i])return;const k=live[i];live[i]=0;h.classList.remove("up");h.classList.add(k==="mud"?"bad":"hit");setTimeout(()=>h.classList.remove("hit","bad"),250);if(k==="mud"){miss++;score=Math.max(0,score-2);sfx("mud")}else{score++;sfx("block")}info()});
 const tm=setInterval(()=>{if(!$("#ov .wkGrid")){clearInterval(tm);over=true;return}const left=Math.max(0,T-(performance.now()-t0));const b=$("#wkT");if(b)b.style.width=(left/T*100)+"%";if(left<=0){clearInterval(tm);over=true;holes.forEach(h=>h.classList.remove("up"));mgEnd(score>=12,`敲到 ${score} 只奶鼠`,res,score)}},100)})}
function rpsGame(stake){return new Promise(res=>{let round=0;
 const play=()=>{round++;ov(`<div class="mg"><div class="mgHead"><span class="ribbon b">猜拳！</span><small>${stake}${round>1?"　平局，再来一次！":""}</small></div><div class="rpsFoe"><img src="${IMG("m3")}"><div class="rpsHand" id="foeHand">？</div></div><div class="rpsRow">${RPS.map((r,i)=>`<button class="rpsBtn" data-i="${i}"><big>${r[2]}</big>${r[1]}</button>`).join("")}</div></div>`);
  $$("#ov .rpsBtn").forEach(b=>b.onclick=async()=>{$$("#ov .rpsBtn").forEach(x=>x.disabled=true);b.classList.add("pk");const me=+b.dataset.i,foe=Math.floor(Math.random()*3);sfx("click");
   const fh=$("#foeHand");for(let k=0;k<8;k++){fh.textContent=RPS[k%3][2];await sleep(70)}fh.textContent=RPS[foe][2];fh.classList.add("show");
   const r=me===foe?"tie":((me+1)%3===foe?"win":"lose");await sleep(500);
   if(r==="tie"&&round<4){sfx("click");return play()}
   const fin=r==="tie"?"lose":r;sfx(fin==="win"?"win":"hurt");
   $("#ov .mg").insertAdjacentHTML("beforeend",`<div class="mgRes ${fin}">${fin==="win"?"你赢了！":"你输了"}</div><div class="ovFoot"><button class="btn" id="mgOk">好</button></div>`);
   say($("#ov .rpsFoe img"),fin==="win"?"哈，哈哈，这把不算！":"哈哈哈哈哈！你出的什么呀！");
   if(fin==="win")ach("rpswin");$("#mgOk").onclick=()=>{closeOv();res(fin)}})};play()})}
function memoryGame(){return new Promise(res=>{const imgs=["i5","hr","ck","ct","dg","sn"];const deck=shuffle([...imgs,...imgs].map((k,i)=>({k,i})));let open=[],found=0,miss=0,lock=true;const MAXMISS=5;
 ov(`<div class="mg"><div class="mgHead"><span class="ribbon b">记忆翻牌</span><small id="memInfo">记住它们的位置，</small></div><div class="memGrid">${deck.map((c,i)=>`<button class="memC up" data-i="${i}"><i class="f"><img src="${IMG(c.k)}"></i><i class="b">?</i></button>`).join("")}</div></div>`);
 const info=()=>{const mi=$("#memInfo");if(mi)mi.textContent=`找到 ${found}/6 对　还能失误 ${MAXMISS-miss} 次`};
 setTimeout(()=>{$$("#ov .memC").forEach(e=>e.classList.remove("up"));lock=false;info()},2200);
 const end=()=>{lock=true;sfx(found===6?"win":"click");$("#ov .mg").insertAdjacentHTML("beforeend",`<div class="mgRes ${found===6?"win":""}">${found===6?"全部找到了！":`找到了 ${found} 对`}</div><div class="ovFoot"><button class="btn" id="mgOk">好</button></div>`);if(found===6)ach("memory");$("#mgOk").onclick=()=>{closeOv();res(found)}};
 $$("#ov .memC").forEach(b=>b.onclick=async()=>{if(lock||b.classList.contains("up"))return;b.classList.add("up");sfx("click");open.push(b);
  if(open.length<2)return;lock=true;const [x,y]=open;open=[];
  if(deck[+x.dataset.i].k===deck[+y.dataset.i].k){found++;x.classList.add("ok");y.classList.add("ok");sfx("coin");info();lock=false;if(found===6)end()}
  else{miss++;info();await sleep(700);x.classList.remove("up");y.classList.remove("up");lock=false;if(miss>=MAXMISS)end()}})})}
function clawGame(tries){return new Promise(res=>{const W=720;const kinds=[["relic","遗物",ICON.star],["card","卡牌",ICON.deck],["gold","金币",ICON.coin],["pot","药水",ICON.heart],["mud","泥巴",ICON.mud]];
 const prizes=[0,1,2,3,4].map(i=>({t:kinds[i],x:70+i*140+Math.floor(Math.random()*40-20)}));shuffle(prizes).forEach((p,i)=>p.x=70+i*140+Math.floor(Math.random()*30-15));
 let x=40,dir=1,left=tries,got=[],busyC=false,raf,last=performance.now();
 ov(`<div class="mg"><div class="mgHead"><span class="ribbon b">抓娃娃机</span><small id="clawInfo">还能抓 ${left} 次，看准了再下爪！</small></div><div class="clawBox"><div class="clawRail"></div><div class="claw" id="claw"><i class="rope"></i><i class="hook">${ICON.grab}</i></div><div class="prizes">${prizes.map((p,i)=>`<div class="prize p-${p.t[0]}" data-i="${i}" style="left:${p.x-38}px">${p.t[2]}<small>${p.t[1]}</small></div>`).join("")}</div></div><div class="ovFoot"><button class="btn pink" id="clawGo">下爪！</button></div></div>`);
 const claw=$("#claw");const tick=t=>{const dt=Math.min(50,t-last);last=t;if(!busyC){x+=dir*.42*dt;if(x>W-40){x=W-40;dir=-1}if(x<40){x=40;dir=1}claw.style.left=(x-30)+"px"}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);
 $("#clawGo").onclick=async()=>{if(busyC||left<=0)return;busyC=true;left--;sfx("click");claw.classList.add("down");await sleep(650);
  let hit=null,bi=-1;prizes.forEach((p,i)=>{if(p.taken)return;if(Math.abs(p.x-x)<=34&&(hit===null||Math.abs(p.x-x)<Math.abs(hit.x-x))){hit=p;bi=i}});
  const slip=hit&&Math.abs(hit.x-x)>22&&Math.random()<.5;
  if(hit&&!slip){hit.taken=1;const el=$(`#ov .prize[data-i="${bi}"]`);el.classList.add("grab");got.push(hit.t[0]);sfx(hit.t[0]==="mud"?"mud":"relic")}else sfx("hurt");
  claw.classList.remove("down");await sleep(650);
  $("#clawInfo").textContent=hit&&!slip?`抓到了「${hit.t[1]}」！${left?"还能抓 "+left+" 次":""}`:(slip?"抓到了，又滑掉了！":"什么都没抓到")+(left?` 还能抓 ${left} 次`:"");
  busyC=false;if(left<=0){cancelAnimationFrame(raf);$("#clawGo").outerHTML=`<button class="btn" id="mgOk">收下</button>`;$("#mgOk").onclick=()=>{closeOv();res(got)}}};
})}
function clawReward(got){if(got.includes("relic"))ach("clawprize");const s=[];got.forEach(t=>{if(t==="relic"){const r=randRelic();gainRelic(r);s.push(r?RELICS[r].n:"50 金币")}if(t==="card"){const c=offerCards(1,"R",1)[0];addCard(c);s.push(cname(c))}if(t==="gold"){S.gold+=45;s.push("45 金币")}if(t==="pot"){givePot(randPot());s.push("药水")}if(t==="mud"){addCard(mk("mud"));s.push("一块泥巴")}});return s.length?"收获："+s.join("、")+"。":"一样都没抓到，机器在嘲笑你。"}

/* ===================== 事件 ===================== */
const EVENTS={
jc_jail:{junc:1,n:"岔路检查站",img:"dgx",t:"路口突然横出一道栏杆。一只戴着帽子的红奶狗吹响哨子：「站住！通行证！」你还没开口，它已经把你推进了路边的小牢房。「两层之间不许乱走，关一晚再说！」牢房角落里还蹲着一只老奶蛙，冲你眨了眨眼。",o:()=>[
 {t:"交保释金",d:"<span class='bad'>-60 金币</span>，马上放出去",ok:S.gold>=60,f:()=>{S.gold-=60;sfx("coin");return"红奶狗数了三遍钱，才不情不愿地打开了门。「下次带好通行证！」"}},
 {t:"和狱友聊一晚",d:"<span class='bad'>失去 10 生命</span>（地上太凉），<span class='good'>从 3 张稀有牌里挑 1 张</span>",f:async()=>{S.hp=Math.max(1,S.hp-10);const r=await chooseReward(offerCards(3,"R"),"老奶蛙教你的一招");return r?"老奶蛙说它被关了三年，因为它也没有通行证。天亮的时候，红奶狗打着哈欠把你们都放了。":"你们聊到了天亮。红奶狗打着哈欠把你们都放了。"}},
 {t:"越狱",d:"一半机会 <span class='good'>溜出去，还顺走一件遗物</span>，一半机会 <span class='bad'>被抓回来：失去 15 生命，获得诅咒「沉重」</span>",f:()=>{if(rnd()<.5){const id=randRelic();if(id)gainRelic(id);ach("jailbreak");return`你从窗户缝里钻了出去，路过值班室时顺手拿走了一样东西${id?`：<b>${RELICS[id].n}</b>`:""}。`}S.hp=Math.max(1,S.hp-15);addCard(mk("heavy"));sfx("hurt");return"你卡在了窗户缝里。红奶狗一边拽你一边念叨：「我当了二十年看守，第一次见这么胖的。」"}}]},
jc_map:{junc:1,n:"卖地图的奶鼠",img:"mst",t:"一只奶鼠蹲在路牌底下，面前铺着一张皱巴巴的地图。「两层之间的路，只有我画得出来。」它压低声音，「还有宝箱的位置哦。」",o:()=>[
 {t:"买一张（40 金币）",d:"<span class='good'>下一个宝箱一定是金宝箱</span>",ok:S.gold>=40,f:()=>{S.gold-=40;S.flags.goldChest=1;sfx("coin");return"它把地图卷好塞给你：「金的，保证是金的。」"}},
 {t:"偷看一眼就走",d:"一半机会 <span class='good'>+2 经验</span>，一半机会 <span class='bad'>被它咬一口：失去 5 生命</span>",f:async()=>{if(rnd()<.5){await gainXP(2);return"你记住了一条近路。"}S.hp=Math.max(1,S.hp-5);return"「看了就得买！」它一口咬在你脚趾上。"}},
 {t:"摇摇头",d:"什么都不发生",f:()=>"「不识货。」它把地图又铺平了。"}]},
jc_stall:{junc:1,n:"路边奶油摊",img:"ppt",t:"一只奶油奶鸡支着小摊，锅里的奶油咕嘟咕嘟冒泡。「赶路累了吧？来一碗！」",o:()=>[
 {t:"买一碗（25 金币）",d:"<span class='good'>回复 18 生命</span>",ok:S.gold>=25,f:()=>{S.gold-=25;S.hp=Math.min(S.max,S.hp+18);sfx("heal");return"热乎乎的，从嘴里一直暖到脚底。"}},
 {t:"尝尝锅底",d:"一半机会 <span class='good'>最大生命 +5</span>，一半机会 <span class='bad'>失去 7 生命（烫）</span>",f:()=>{if(rnd()<.5){S.max+=5;S.hp+=5;return"锅底是熬了一整晚的精华。你觉得身体结实了一点。"}S.hp=Math.max(1,S.hp-7);return"烫烫烫烫烫！"}},
 {t:"帮它看摊",d:"<span class='good'>+30 金币</span>",f:()=>{S.gold+=30;return"路过的奶蛙一个接一个，你忙到天黑，它分了你一份。"}}]},
jc_nap:{junc:1,n:"打瞌睡的看门狗",img:"dgt",t:"一只红奶狗靠在路口的木门上打呼噜，脚边的碗里盛着一堆金币。",o:()=>[
 {t:"轻轻拿一点",d:"六成机会 <span class='good'>+45 金币</span>，四成机会 <span class='bad'>被发现：失去 9 生命</span>",f:()=>{if(rnd()<.6){S.gold+=45;sfx("coin");return"它翻了个身，继续打呼噜。"}S.hp=Math.max(1,S.hp-9);sfx("hurt");return"「小偷！」它一口咬住了你的尾巴。"}},
 {t:"叫醒它问路",d:"<span class='good'>升级一张牌</span>",f:async()=>{await upgradePick();return"它迷迷糊糊地给你指了路，顺便教了你一招。"}},
 {t:"绕过去",d:"什么都不发生",f:()=>"你踮着脚走过去了。"}]},
jc_shed:{junc:1,n:"蜕皮的奶蛇",img:"snt",t:"一条奶蛇卡在树根中间，正在蜕皮。「帮、帮个忙……」它扭来扭去。",o:()=>[
 {t:"帮它拽一把",d:"<span class='good'>从牌组里删掉一张牌</span>",f:async()=>{const r=await pickCards(S.deck,{title:"删掉一张牌",sub:"跟旧皮一起扔掉"});if(r[0])S.deck.splice(S.deck.indexOf(r[0]),1);return"旧皮「啪」地掉了下来。它甩甩身子：「谢啦，你也轻松点了吧？」"}},
 {t:"把蛇皮收起来",d:"<span class='good'>获得一瓶药水</span>，<span class='bad'>失去 4 生命（被它抽了一下）</span>",f:()=>{S.hp=Math.max(1,S.hp-4);givePot(randPot());return"「那是我的！」它抽了你一尾巴。但你已经把皮揣进兜里了。"}},
 {t:"不管它",d:"什么都不发生",f:()=>"身后传来委屈的嘶嘶声。"}]},
jc_sign:{junc:1,n:"会说话的路牌",img:"gb",t:"路边插着一块歪掉的路牌，上面画着两个箭头。你刚走近，路牌开口了：「往左是近路，往右是好路。选一个。」",o:()=>[
 {t:"走近路",d:"<span class='good'>回复 12 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+12);return"近路果然很近，你还在半路睡了一觉。"}},
 {t:"走好路",d:"<span class='good'>从 3 张牌里挑 1 张</span>",f:async()=>{const r=await chooseReward(offerCards(3,"C"),"好路上捡到的");return"好路上落着别人掉的东西。"}},
 {t:"把路牌扶正",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"「谢谢……」路牌的声音有点哽咽。「好多年没人扶我了。」"}}]},
jc_lost:{junc:1,n:"迷路的小奶蛙",img:"egt",t:"一颗蛋壳还没脱干净的小奶蛙蹲在路中间哭：「我、我找不到回家的路了……」",o:()=>[
 {t:"送它回家",d:"<span class='bad'>失去 6 生命</span>（路很远），<span class='good'>获得一件遗物</span>",f:()=>{S.hp=Math.max(1,S.hp-6);const id=randRelic("C");if(id)gainRelic(id);return`它妈妈塞给你一样东西${id?`：<b>${RELICS[id].n}</b>`:""}，说什么都不肯收回去。`}},
 {t:"给它一点零花钱",d:"<span class='bad'>-20 金币</span>，<span class='good'>回复 10 生命</span>（心情好）",ok:S.gold>=20,f:()=>{S.gold-=20;S.hp=Math.min(S.max,S.hp+10);return"它不哭了，蹦蹦跳跳地跑去买奶茶。"}},
 {t:"指个方向",d:"什么都不发生",f:()=>"它朝你指的方向跑了。希望是对的。"}]},
jc_guard:{junc:1,n:"追犯人的看守",img:"dgt",t:"一只红奶狗看守气喘吁吁地跑过来：「看见一个逃犯没有？就往这条路跑了！帮我抓回来，有赏！」",o:()=>[
 {t:"答应帮忙",d:"<span class='good'>接下支线「抓回逃跑的犯人」</span>：打倒岔路中间的小怪，<span class='good'>+60 金币，随机升级 1 张牌</span>",f:()=>{jsideTake("escape");return"「就靠你了！」它又往回跑去了，跑得比你还快。"}},
 {t:"问它要点路费",d:"<span class='good'>+15 金币</span>",f:()=>{S.gold+=15;return"它不情不愿地掏出几个硬币：「看见了记得喊我。」"}}]},
jc_mail:{junc:1,n:"跑不动的信使",img:"mst",t:"一只奶鼠信使瘫坐在路边：「这封信要送到岔路尽头……我腿抽筋了。你顺路吗？」",o:()=>[
 {t:"帮它送信",d:"<span class='good'>接下支线「把信送到岔路尽头」</span>：走到尽头，<span class='good'>最大生命 +6</span>",f:()=>{jsideTake("letter");return"信封上画着一只笑脸奶蛙。"}},
 {t:"给它揉揉腿",d:"<span class='good'>+2 经验</span>",f:async()=>{await gainXP(2);return"「舒服多了……」它还是没站起来。"}}]},
jc_racer:{junc:1,n:"不服输的冒险者",img:"kn",t:"一只穿着盔甲的奶蛙拦住你：「尽头那只精英，咱俩比比谁先打倒它？赢了我请客！」",o:()=>[
 {t:"比就比",d:"<span class='good'>接下支线「和冒险者比赛」</span>：打倒尽头的精英，<span class='good'>+40 金币和一瓶药水</span>",f:()=>{jsideTake("race");return"「一言为定！」它拔腿就跑，然后在第一个路口拐错了。"}},
 {t:"算了",d:"什么都不发生",f:()=>"「胆小鬼！」它的声音越来越远。"}]},
jc_herb:{junc:1,n:"缺香草的奶油摊",img:"ppt",t:"奶油奶鸡对着锅发愁：「香草被路上那只小怪叼走了，没有香草，奶油就不香了……」",o:()=>[
 {t:"帮它抢回来",d:"<span class='good'>接下支线「帮奶油摊找香草」</span>：打倒岔路中间的小怪，<span class='good'>回复 20 生命，+30 金币</span>",f:()=>{jsideTake("herb");return"「拜托啦！」它往锅里又加了一勺糖。"}},
 {t:"先尝一口没香草的",d:"<span class='good'>回复 6 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+6);return"其实也挺好吃的。"}}]},
mq_rat:{n:"怕黑的小奶鼠",img:"mst",t:"一只小奶鼠缩在路边的草堆里发抖：「前面老有坏家伙堵路，我不敢过去……」",o:()=>[
 {t:"帮它清路",d:"<span class='good'>接下支线「帮小奶鼠清路」</span>：再打倒 3 场小怪，<span class='good'>最大生命 +5</span>",f:()=>{jsideTake("m_rat");return"它揪着你的衣角：「我、我跟在你后面！」"}},
 {t:"给它一块奶糖",d:"<span class='good'>回复 5 生命</span>（你也吃了一块）",f:()=>{S.hp=Math.min(S.max,S.hp+5);return"它不抖了，嚼得很认真。"}}]},
mq_smith:{n:"奶猫铁匠",img:"ct",t:"路边支着一个小铁匠铺，一只奶猫在敲一块发红的铁：「缺一块好材料。精英身上掉的那种，你要是能弄来……」",o:()=>[
 {t:"答应它",d:"<span class='good'>接下支线「给铁匠找材料」</span>：打倒 1 只精英，<span class='good'>随机升级 2 张牌</span>",f:()=>{jsideTake("m_smith");return"「叮——」它敲了一下砧子，算是答应了。"}},
 {t:"请它顺手磨一磨",d:"<span class='bad'>-30 金币</span>，<span class='good'>升级一张牌</span>",ok:S.gold>=30,f:async()=>{S.gold-=30;await upgradePick();return"火星溅了你一脸。"}}]},
mq_letter:{n:"村里来的信使",img:"msx",t:"一只背着邮包的奶鼠追上来：「长老托我带句话给这一层的首领，可我打不过它……你上去的时候，帮我说一声？」",o:()=>[
 {t:"帮它带话",d:"<span class='good'>接下支线「替信使带句话」</span>：打倒这一层的首领，<span class='good'>+60 金币和一瓶药水</span>",f:()=>{jsideTake("m_letter");return"「长老说：『别太为难那孩子。』」"}},
 {t:"问它村里怎么样了",d:"<span class='good'>+2 经验</span>",f:async()=>{await gainXP(2);return"「泉水还在往下掉。不过大家都挺好的，就是想你。」"}}]},
mq_lost:{n:"迷路的小奶马",img:"hr",t:"一只小奶马在路口转圈：「我跟爸爸妈妈走散了……他们说在前面的空地等我。」",o:()=>[
 {t:"送它一程",d:"<span class='good'>接下支线「送迷路的奶马回家」</span>：再打倒 2 场小怪，<span class='good'>+40 金币，回复 12 生命</span>",f:()=>{jsideTake("m_lost");return"它跟在你身后，蹄子哒哒地响。"}},
 {t:"给它指个方向",d:"什么都不发生",f:()=>"它朝你指的方向跑了。"}]},
jc_hunter:{junc:1,n:"赏金猎人奶猫",img:"ct",t:"一只披着斗篷的奶猫靠在路牌上擦飞刀：「尽头那只精英，我追了三天了。你要是先把它放倒，赏金归你。」",o:()=>[
 {t:"接下委托",d:"<span class='good'>接下支线「赏金猎人的委托」</span>：打倒尽头的精英，<span class='good'>+70 金币</span>",f:()=>{jsideTake("bounty");return"「别死了，死了赏金就没人领了。」"}},
 {t:"问它要把飞刀",d:"<span class='good'>获得 1 个暗器（下场战斗开始时放进暗器袋）</span>",f:()=>{S.flags.nextAnqi=(S.flags.nextAnqi||0)+1;return"它丢给你一把：「省着点用。」"}}]},
jc_sick:{junc:1,n:"着急的奶鸡妈妈",img:"ck",t:"一只奶鸡抱着药包在路口转圈：「我家孩子在岔路尽头发烧，可我腿脚慢……你能帮我把药送过去吗？」",o:()=>[
 {t:"帮它送药",d:"<span class='good'>接下支线「给小奶鸡送药」</span>：走到岔路尽头，<span class='good'>回复 25 生命，随机升级 1 张牌</span>",f:()=>{jsideTake("medicine");return"「谢谢你！路上小心！」"}},
 {t:"陪它聊两句",d:"<span class='good'>回复 6 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+6);return"它絮絮叨叨讲了半天孩子小时候的事，你听着听着也放松了。"}}]},
jc_horse:{junc:1,n:"练武的奶马",img:"hr",t:"一只奶马在空地上踢木桩，踢一下喊一声。看见你，它眼睛一亮：「来得正好！前面那只小怪老来捣乱，咱俩比比谁先收拾它？」",o:()=>[
 {t:"比就比",d:"<span class='good'>接下支线「陪奶马练一场」</span>：打倒岔路中间的小怪，<span class='good'>最大生命 +4，+30 金币</span>",f:()=>{jsideTake("spar");return"「好！输了的请喝奶茶！」"}},
 {t:"帮它扶木桩",d:"<span class='good'>+2 经验</span>",f:async()=>{await gainXP(2);return"它踢了一下午，你扶了一下午，两个人都累瘫了。"}}]},
jc_toll:{junc:1,n:"收过路费的桥",img:"snx",t:"一座只够一只奶蛙走的小木桥，桥头盘着一条红奶蛇，尾巴拍着一块牌子：「过桥费：30 金币。讲价的，60。」",o:()=>[
 {t:"老老实实交钱",d:"<span class='bad'>-30 金币</span>，<span class='good'>回复 8 生命</span>（它附送一杯热奶茶）",ok:S.gold>=30,f:()=>{S.gold-=30;S.hp=Math.min(S.max,S.hp+8);return"「爽快！」它从尾巴底下摸出一杯热奶茶给你。"}},
 {t:"给它讲个笑话",d:"一半机会 <span class='good'>免费过桥，还得 25 金币</span>，一半机会 <span class='bad'>被一尾巴扫下河：失去 8 生命</span>",f:()=>{if(rnd()<.5){S.gold+=25;return"它笑得从桥上滑了下去，金币撒了一地。你捡了一点，走了过去。"}S.hp=Math.max(1,S.hp-8);return"「不好笑。」它一尾巴把你扫进了河里。你游到对岸，浑身都是泥。"}},
 {t:"直接从河里游过去",d:"<span class='bad'>失去 5 生命</span>，<span class='good'>免费</span>",f:()=>{S.hp=Math.max(1,S.hp-5);return"水很冷。你听见桥上的红奶蛇在骂：「不讲武德！」"}}]},
jc_post:{junc:1,n:"迷路的邮差",img:"msx",t:"一只背着大邮包的红奶鼠蹲在路边哭。「这条路上的信，寄给楼上的，寄给楼下的，还有寄给……不知道哪一层的。我分不清了。」邮包里露出一角信封，上面写着你的名字。",o:()=>[
 {t:"帮它送信",d:"<span class='good'>+40 金币，记忆碎片 +1</span>",f:()=>{S.gold+=40;M.shards=(M.shards||0)+1;M.shardsAll=(M.shardsAll||0)+1;saveMeta();return"你们一起把信分好了。它非要把邮费分你一半。"}},
 {t:"拆开写着你名字的信",d:"<span class='good'>获得 1 张随机稀有牌</span>",f:()=>{const c=offerCards(1,"R")[0];addCard(c);return`信里没有字，只夹着一张 <b>${cname(c)}</b>。落款是：「以后的你」。`}},
 {t:"安慰它一下",d:"<span class='good'>回复 12 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+12);return"它不哭了，从邮包里摸出一块压扁的饼干分给你。"}}]},
jc_rival:{junc:1,n:"走错路的冒险者",img:"kn",t:"一只穿着盔甲的奶蛙从对面走过来，看起来和你一样迷路了。「你也是往上爬的？」它拍了拍剑，「在这种地方遇到，要么交换点东西，要么比划两下。」",o:()=>[
 {t:"交换一张牌",d:"<span class='good'>把牌组里 1 张牌换成随机 1 张同稀有度的牌</span>",f:async()=>{const r=await pickCards(S.deck.filter(c=>!["cur","sts"].includes(CARDS[c.id].type)),{title:"拿哪张去换",sub:"会换成一张同稀有度的随机牌"});if(!r[0])return null;const rr=CARDS[r[0].id].r;const pool=POOL_HERO.filter(x=>CARDS[x].r===rr&&x!==r[0].id&&(!CARDS[x].hero||CARDS[x].hero===S.hero));const nid=pool.length?pick(pool):r[0].id;S.deck.splice(S.deck.indexOf(r[0]),1);addCard(mk(nid,r[0].u||0));return`你把 <b>${cname(r[0])}</b> 给了它，换来一张 <b>${CARDS[nid].n}</b>。`}},
 {t:"比划两下",d:"<span class='bad'>失去 10 生命</span>，<span class='good'>随机升级 2 张牌</span>",f:()=>{S.hp=Math.max(1,S.hp-10);const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);return"打完以后你们都坐在地上喘气。「下次在楼顶见。」它说。"}},
 {t:"互相指个路",d:"<span class='good'>+30 金币</span>",f:()=>{S.gold+=30;return"它说上面有个大汤勺很好用，你说下面有个老奶蛙很啰嗦。它付了你一点问路钱。"}}]},
jc_well:{junc:1,n:"许愿井",img:"nx",t:"路边有一口很浅的井，井底不是水，是一小片星空。旁边的木牌上写着：「投钱许愿，概不退款。」",o:()=>[
 {t:"投 20 金币",d:"<span class='good'>回复 20 生命</span>",ok:S.gold>=20,f:()=>{S.gold-=20;S.hp=Math.min(S.max,S.hp+20);return"叮。井里亮了一下，你觉得身上暖洋洋的。"}},
 {t:"投 60 金币",d:"六成机会 <span class='good'>获得一件遗物</span>，四成机会什么都没有",ok:S.gold>=60,f:()=>{S.gold-=60;if(rnd()<.6){const id=randRelic();if(id){gainRelic(id);return`井底的星星浮了上来，变成了 <b>${RELICS[id].n}</b>。`}}return"井里安安静静的。木牌上好像多了一行小字：「概不退款」。"}},
 {t:"把一张牌扔下去",d:"<span class='good'>移除 1 张牌，最大生命 +3</span>",f:async()=>{const r=await pickCards(S.deck,{title:"扔哪张牌",sub:"井会收下它"});if(!r[0])return null;S.deck.splice(S.deck.indexOf(r[0]),1);S.max+=3;S.hp+=3;return`<b>${cname(r[0])}</b> 慢慢沉进了星星里。`}}]},
jc_devil:{junc:1,n:"缝里的小恶魔",img:"dv",t:"缝最窄的地方蹲着一只红色的小恶魔，双手抱在胸前。「两层之间的东西不归楼上管，也不归楼下管。」它眯起眼，「所以在这里，什么都能换。」",o:()=>[
 {t:"拿生命换遗物",d:"<span class='bad'>最大生命 -8</span>，<span class='good'>获得一件稀有遗物</span>",ok:S.max>20,f:()=>{S.max-=8;S.hp=Math.min(S.hp,S.max);const id=randRelic("R");if(id)gainRelic(id);return id?`它把一件 <b>${RELICS[id].n}</b> 塞进你手里，顺手拔走了一点什么。`:"它翻了翻口袋，什么都没有，只好把生命还了一半给你。"}},
 {t:"拿一张牌换金币",d:"<span class='bad'>随机失去 1 张牌</span>，<span class='good'>+70 金币</span>",ok:S.deck.length>5,f:()=>{const c=pick(S.deck);S.deck.splice(S.deck.indexOf(c),1);S.gold+=70;sfx("coin");return`它挑走了你的 <b>${cname(c)}</b>，丢给你一袋叮当响的金币。`}},
 {t:"不换",d:"",f:()=>"「真没意思。」它把脸转了过去。"}]},
jc_gift:{junc:1,n:"礼物盒奶蛙",img:"gb",t:"一只奶蛙趴在粉色礼物盒上，托着下巴看你。「两个盒子，选一个。」它敲了敲左边，又敲了敲右边，「一个是好东西，一个是更好的东西。也可能是坏东西，我忘了。」",o:()=>[
 {t:"拆左边的",d:"<span class='good'>从 3 张稀有牌里挑 1 张</span>",f:async()=>{const r=await chooseReward(offerCards(3,"R"),"左边的盒子");return r?"盒子里是一张牌，带着淡淡的奶香。":"你又把盒子合上了。"}},
 {t:"拆右边的",d:"一半机会 <span class='good'>获得一件遗物</span>，一半机会 <span class='bad'>获得诅咒「沉重」</span>",f:()=>{if(rnd()<.5){const id=randRelic();if(id)gainRelic(id);return"盒子里亮了一下。它鼓起掌来：「看吧，更好的东西！」"}addCard(mk("heavy"));return"盒子里是一块石头。它小声说：「……我说过我忘了。」"}},
 {t:"都不拆",d:"<span class='good'>回复 10 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+10);return"「不拆？」它愣了一下，把自己的奶茶分了你一半。"}}]},
jc_echo:{junc:1,n:"没有颜色的奶蛙",img:"fask",t:"一只浅得快看不见的奶蛙抱着手站在那里，姿势和你一模一样。你抬手，它也抬手。「我是你在两层之间留下的回声，」它说，「我可以替你多记住一样东西，或者替你忘掉一样东西。」",o:()=>[
 {t:"多记住一样",d:"<span class='good'>复制牌组里的 1 张牌</span>",f:async()=>{const r=await pickCards(S.deck,{title:"复制一张牌",sub:"回声会记住它"});if(!r[0])return null;addCard(mk(r[0].id,r[0].u));return`回声把 <b>${cname(r[0])}</b> 抄了一遍，递给你。`}},
 {t:"忘掉一样",d:"<span class='good'>移除牌组里的 1 张牌</span>",f:async()=>{const r=await pickCards(S.deck,{title:"忘掉一张牌",sub:"回声会替你带走它"});if(!r[0])return null;S.deck.splice(S.deck.indexOf(r[0]),1);return`<b>${cname(r[0])}</b> 跟着回声一起淡了下去。`}},
 {t:"挥挥手",d:"",f:()=>"它也挥挥手。你走了好几步，回头看，它还在挥。"}]},
jc_watch:{junc:1,n:"缝边的守夜人",img:"fbsk",t:"一只淡蓝色的奶蛙坐在缝边，咬着指甲看着下面。「我在这里守了很久。上去的人，下来的人，我都见过。」它往旁边挪了挪，给你让出一块地方。「坐一会儿吧，楼上不会跑。」",o:()=>[
 {t:"坐下歇一会儿",d:"<span class='good'>回复 30% 最大生命</span>",f:()=>{const h=Math.round(S.max*.3);S.hp=Math.min(S.max,S.hp+h);return`你靠着墙坐了一会儿。它什么都没问，你也什么都没说。回复了 <b>${h}</b> 生命。`}},
 {t:"请它指点一下",d:"<span class='good'>升级 1 张牌</span>",f:async()=>{const ok=await upgradePick();return ok?"「这一招，你出手早了半拍。」它比划了一下，你就明白了。":null}},
 {t:"问它守的是谁",d:"<span class='good'>记忆碎片 +1</span>",f:()=>{M.shards=(M.shards||0)+1;M.shardsAll=(M.shardsAll||0)+1;saveMeta();return"「一个说好会下来的人。」它看着缝的下面，「他一直没下来。不过没关系，我还在这儿。」"}}]},
jc_riddle:{junc:1,n:"出题的奶蛙",img:"fjsk",t:"一只奶蛙托着下巴挡在路中间。「答对了就让你过去，还送你点东西。答错了嘛……」它想了想，「也让你过去，只是会有点疼。」",o:()=>{const Q=pick([["什么东西越洗越脏？",["水","奶茶杯","奶蛙"],0],["奶蛙之塔一共有几层？（不算交界处）",["四层","五层","七层"],1],["什么东西有头没有脚，有身体没有手？",["奶蛇","蛋","雪人"],0],["打牌时，哪样东西用完了下回合又会回来？",["金币","奶力","遗物"],1],["小鸡出生前住在哪里？",["鸡窝","蛋里","塔顶"],1]]);const ans=(i)=>()=>{if(i===Q[2]){const id=rnd()<.5?randRelic("C"):null;if(id)gainRelic(id);else S.gold+=60;sfx("relic");return`「答对了！」它一拍大腿。${id?`你得到了 <b>${RELICS[id].n}</b>。`:"它塞给你 60 金币。"}`}S.hp=Math.max(1,S.hp-6);sfx("hurt");return`「错啦，是「${Q[1][Q[2]]}」。」它弹了一下你的脑门。失去 6 生命。`};
 return[{t:Q[0],d:"",ok:false,f:()=>null},...Q[1].map((x,i)=>({t:x,d:"",f:ans(i)}))]}},
jc_face:{junc:1,n:"做鬼脸的奶蛙",img:"fhsk",t:"一只奶蛙蹲着冲你做鬼脸，舌头吐得老长。「来比！谁先笑谁输！」它的脸越拧越怪，你的嘴角已经开始抖了。",o:()=>[
 {t:"认真比",d:"一半机会 <span class='good'>随机升级 2 张牌</span>，一半机会 <span class='bad'>失去 8 生命</span>",f:()=>{if(rnd()<.5){const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);return"它先笑了，笑得在地上打滚。「好吧好吧，教你两招。」"}S.hp=Math.max(1,S.hp-8);return"你没忍住，笑出了声。它趁机在你脑门上弹了个响亮的脑瓜崩。"}},
 {t:"也冲它做鬼脸",d:"<span class='good'>获得伙伴卡「狂笑」</span>",f:()=>{addCard(mk("p_laugh"));return"你们对着做了半天鬼脸，谁也没赢。它说你挺有意思，决定跟你走一段。"}},
 {t:"绕过去",d:"",f:()=>"它在后面喊：「胆小鬼！」然后自己先笑了。"}]},
jc_egg:{junc:1,n:"漂着的蛋",img:"egt",t:"一颗淡青色的蛋浮在半空中，慢慢转着圈。它好像是从哪一层掉下来的，又好像从来没属于过哪一层。你伸出手，它轻轻碰了碰你的指尖。",o:()=>[
 {t:"抱走它",d:"<span class='good'>获得 2 张随机奶蛋牌</span>",f:()=>{const pool=Object.keys(CARDS).filter(k=>k.startsWith("egg_"));for(let i=0;i<2;i++)addCard(mk(pick(pool)));return"蛋在你怀里暖暖的，分成了两颗。"}},
 {t:"贴着它听一听",d:"<span class='good'>最大生命 +5</span>",f:()=>{S.max+=5;S.hp+=5;return"里面有心跳，和你的心跳一样快。你觉得自己也结实了一点。"}},
 {t:"让它继续漂",d:"",f:()=>"它转了个圈，慢慢漂到缝的另一边去了。"}]},
ss_ruins:{ss:1,n:"冰原残骸",img:"v_proto",t:"冰屋被整个掀翻了，雪地上全是铁爪印。一只裹着毯子的老奶蛙缩在墙角：「它昨晚又来了……铁做的，冒着热气，见到会动的东西就抓。我家小孙子……」她说不下去了。爪印一直往前延伸，通向一阵咔咔的齿轮声。",o:()=>[
 {t:"把带的吃的分给她",d:"<span class='good'>回复 15 生命</span>，<span class='bad'>-30 金币</span>",ok:S.gold>=30,f:()=>{S.gold-=30;S.hp=Math.min(S.max,S.hp+15);return"老奶蛙捧着你给的奶糕，小口小口地吃。她说：那东西身上，刻着跟塔顶那把椅子一样的花纹。你心里咯噔了一下。"}},
 {t:"顺着爪印搜一搜",d:"<span class='good'>挑一张稀有牌</span>",f:async()=>{const r=await chooseReward(offerCards(3,"R",1),"残骸里找到的");if(r)addCard(r);return"雪地里埋着一块铁皮，上面有一行被磨掉一半的字：「……任 · 守泉人」。你把它收好，继续往前走。"}},
 {t:"直接追上去",d:"<span class='good'>力气 +1（整局）</span>",f:()=>{S.flags.ssStr=1;return"你咬着牙往前跑。冷风灌进喉咙，可你一点都不觉得冷。下一场战斗，你会更有力气。"}}]},
dream_fish:{dream:1,n:"泉边钓鱼",img:"bx",t:"梦里的泉水满得能照见月亮。一只年轻的奶蛙坐在石头上，正用小刀削一根枣树枝。他抬头看见你：「你也来钓鱼？这根给你，我再削一根。」——是年轻的阿岳。",o:()=>[
 {t:"陪他钓一会儿",d:"<span class='good'>回复 20 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+20);return"你们钓了一下午，什么都没钓到。阿岳说：没关系，泉水满着就好。他笑起来的样子，和塔顶那个人一点都不像。"}},
 {t:"问他为什么要上塔",d:"<span class='good'>挑一张稀有牌</span>",f:async()=>{const r=await chooseReward(offerCards(3,"R",1),"阿岳教你的");if(r)addCard(r);return"「泉水一年比一年浅。总得有人上去看看。」他把鱼竿插进泥里，「要是我回不来，这根就留给你。」"}},
 {t:"劝他别上去",d:"<span class='good'>最大生命 +5</span>",f:()=>{S.max+=5;S.hp+=5;return"他摇摇头：「总得有人去。」你知道他会去，你也知道他回不来。梦里的风吹过泉面，你什么都改变不了，可心里好像变结实了一点。"}}]},
dream_farewell:{dream:1,n:"告别",img:"e_n1_old",t:"山脚下，年轻的修行奶蛙拽着阿岳的袖子不放：「你一个人上去能干什么？等我练好了，我们一起去！」阿岳低着头，谁都不看。他们好像都看不见你。",o:()=>[
 {t:"站在修行奶蛙这边",d:"<span class='good'>升级一张牌</span>",f:async()=>{const ok=await upgradePick();return ok?"修行奶蛙冲你点了点头，好像终于有人懂他。可阿岳还是轻轻抽回了袖子。":null}},
 {t:"站在阿岳这边",d:"<span class='good'>+60 金币</span>",f:()=>{S.gold+=60;return"阿岳往你手里塞了一袋金币：「路上用。」修行奶蛙瞪了你一眼，转身回去煮奶茶了。那锅奶茶，阿岳一口没喝。"}},
 {t:"什么都不说",d:"<span class='good'>移除一张牌</span>",f:async()=>{const r=await pickCards(S.deck,{title:"放下一张牌",sub:"有些东西，带不上去"});if(!r[0])return null;S.deck.splice(S.deck.indexOf(r[0]),1);return"你什么都没说。他们吵了很久，最后阿岳一个人上了山。修行奶蛙在山脚下站到天黑。"}}]},
dream_throne:{dream:1,n:"第一次坐上椅子",img:"v_chairwill",t:"梦的这一角很冷。你看见阿岳一个人走到塔顶，满身是伤。那把椅子在等他。他犹豫了很久，伸手扶住了扶手。",o:()=>[
 {t:"喊住他",d:"<span class='bad'>失去 8 生命</span>，<span class='good'>获得一件稀有遗物</span>",ok:S.hp>8,f:()=>{S.hp-=8;gainRelic(randRelic("R"));return"你喊得嗓子都哑了。他回头看了一眼——不是看你，是看山下的泉。然后他坐了下去。椅子发出一声满足的叹息。你手里多了一样东西，像是他那时候掉下的。"}},
 {t:"静静看着",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"他坐下去的那一刻，山下的泉水停止了下降。他笑了一下，很轻。你突然明白：他不是贪心，他只是太想让泉水满回来了。"}}]},
well:{n:"许愿池",img:"c2",t:"泥沼中间有一口亮晶晶的小池子，池底铺满了金币。旁边的牌子上写着：「投币许愿，童叟无欺」。",o:()=>[
 {t:"投 20 金币",d:"<span class='good'>获得一瓶药水，回复 10 生命</span>",ok:S.gold>=20,f:()=>{S.gold-=20;givePot(randPot());S.hp=Math.min(S.max,S.hp+10);return"池水冒了几个泡泡，浮上来一个小瓶子。"}},
 {t:"把一张牌扔进去",d:"<span class='good'>移除一张牌</span>",f:async()=>{const r=await pickCards(S.deck,{title:"扔哪一张？",sub:"它会沉到池底"});if(!r[0])return null;S.deck.splice(S.deck.indexOf(r[0]),1);return`「${cname(r[0])}」咕噜咕噜沉下去了。你觉得轻松了一点。`}},
 {t:"捞几枚金币",d:"<span class='good'>+45 金币</span>，<span class='bad'>获得诅咒「沉重」</span>",f:()=>{S.gold+=45;addCard(mk("heavy"));return"金币到手了，可是心里沉甸甸的。"}},
 {t:"离开",d:"",f:()=>"你决定不碰这口来路不明的池子。"}]},
pup:{n:"迷路的奶狗",img:"dg",t:"一只浑身是泥的小奶狗蹲在路边，呜呜地叫。它看起来又冷又饿，尾巴却还在拼命摇。",o:()=>[
 {t:"抱起它",cf:"pupFriend",d:"<span class='good'>获得遗物「奶狗陪伴」</span>，<span class='bad'>失去 6 生命</span>（它太激动，把你扑进了泥里）",f:()=>{S.hp=Math.max(1,S.hp-6);gainRelic("pup");return"奶狗在你怀里蹭来蹭去。从今天起，你不是一个人爬塔了。"}},
 {t:"分它一点干粮",cf:"pupFriend",d:"<span class='good'>回复 8 生命</span>（你也顺便吃了点）",f:()=>{S.hp=Math.min(S.max,S.hp+8);return"奶狗吃得很香，吃完舔了舔你的手，跑进了草丛。"}},
 {t:"给它指个方向",d:"<span class='good'>+25 金币</span>",f:()=>{S.gold+=25;return"奶狗跑走了。过了一会儿又跑回来，嘴里叼着一个小钱袋。"}}]},
egg:{n:"神秘的蛋",img:"eg",t:"一颗比你还大的蛋卡在泥里，蛋壳上画着奇怪的花纹，里面好像有什么在动。",o:()=>[
 {t:"孵一孵",d:"<span class='good'>选一张稀有以上的牌</span>，<span class='bad'>失去 8 生命</span>",ok:S.hp>8,f:async()=>{S.hp-=8;await chooseReward(offerCards(3,"R",1),"蛋里蹦出来的",false);return"你抱着蛋暖了很久，最后蹦出来的东西让你吃了一惊。"}},
 {t:"扭开它",d:"<span class='good'>获得「扭蛋」×2</span>",f:()=>{addCard(mk("gacha"));addCard(mk("gacha"));return"原来是个扭蛋机！里面掉出来两个小扭蛋。"}},
 {t:"卖给路过的商人",d:"<span class='good'>+60 金币</span>",f:()=>{S.gold+=60;return"商人眼睛一亮，掏出一把金币。"}}]},
smith:{n:"铁匠奶蛙",img:"m2",t:"一只挺着大肚子的奶蛙在敲敲打打，火星四溅。「嘿！要不要我帮你把招式敲得更结实点？」",o:()=>[
 {t:"敲一张",d:"<span class='good'>升级一张牌</span>",f:async()=>{const ok=await upgradePick();return ok?"铛铛铛！焕然一新。":null}},
 {t:"一起打铁",d:"敲中几下就 <span class='good'>随机升级几张牌</span>，三下全中再 <span class='good'>+40 金币</span>",f:async()=>{const n=await forgeGame();const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,n);l.forEach(c=>c.u=(c.u|0)+1);if(l.length)upFx(l);if(n===3)S.gold+=40;return n?`铛！铛！${n===3?"铛！":""}升级了：${l.map(cname).join("、")}${n===3?"。铁匠还塞给你 40 金币。":""}`:"铁匠摇摇头：「力气有，准头没有。」"}},
 {t:"多敲几下",d:"<span class='good'>随机升级 2 张牌</span>，<span class='bad'>失去 10 生命</span>",ok:S.hp>10,f:()=>{S.hp-=10;const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);return`敲得太用力，火星烫到了你。升级了：${l.map(cname).join("、")||"没有"}。`}},
 {t:"算了",d:"",f:()=>"铁匠耸耸肩，继续敲他的锅。"}]},
gamble:{n:"赌徒奶蛙",img:"m3",t:"一只笑得停不下来的奶蛙拦住你：「来来来，猜大小！赢了翻倍，输了，哈哈哈哈哈！」",o:()=>[
 {t:"押 30 金币",d:"一半机会赢 <span class='good'>80 金币</span>",ok:S.gold>=30,f:()=>{S.gold-=30;if(rnd()<.5){S.gold+=80;sfx("coin");return"你赢了！狂笑奶蛙笑得更大声了。"}return"你输了。狂笑奶蛙笑到在地上打滚。"}},
 {t:"押上体力",d:"<span class='bad'>失去 10 生命</span>，一半机会获得 <span class='good'>一件遗物</span>",ok:S.hp>10,f:()=>{S.hp-=10;if(rnd()<.5){gainRelic(randRelic());return"它愿赌服输，从口袋里掏出一样宝贝。"}return"你输了，还被它拍了一巴掌。好疼。"}},
 {t:"不玩",d:"",f:()=>"「哈哈哈，胆小鬼！」笑声在身后响了很久。"}]},
elder:{n:"长老的回忆",img:"m6",t:"雾里浮现出长老的身影。不是真的长老，是一段留在塔里的记忆。它轻轻开口",o:()=>[
 {t:"静静听完",d:"<span class='good'>回复 15 生命，记忆碎片 +1</span>",f:()=>{S.hp=Math.min(S.max,S.hp+15);M.shards=(M.shards||0)+1;M.shardsAll=(M.shardsAll||0)+1;saveMeta();const T=villageTale();return"「"+T.l.join("")+"」身影慢慢散开了。"}},
 {t:"向长老请教",d:"<span class='good'>升级一张牌</span>",f:async()=>{const ok=await upgradePick();return ok?"记忆里的长老点了点头：「对，就是这样。」":null}}]},
teashop:{n:"奶茶摊",img:"ctm",t:"路边支着一个小小的奶茶摊，老板是一只打瞌睡的奶猫。锅里的奶茶咕嘟咕嘟冒着泡。",o:()=>[
 {t:"来一大杯",d:"<span class='good'>回满生命</span>，花 35 金币",ok:S.gold>=35,f:()=>{S.gold-=35;S.hp=S.max;sfx("heal");return"一口气喝完，浑身都暖起来了。"}},
 {t:"来一小杯",d:"<span class='good'>回复 15 生命</span>，花 12 金币",ok:S.gold>=12,f:()=>{S.gold-=12;S.hp=Math.min(S.max,S.hp+15);sfx("heal");return"甜甜的，刚刚好。"}},
 {t:"帮老板看摊",d:"<span class='good'>+3 经验，+20 金币</span>",f:async()=>{S.gold+=20;await gainXP(3);return"你帮奶猫卖了一下午奶茶，学到了不少招呼客人的本事。"}}]},
gachamachine:{n:"扭蛋机",img:"egj",t:"一台锈迹斑斑的扭蛋机，玻璃罩里塞满了五颜六色的蛋。投币口上写着：「保证不坑」。",o:()=>[
 {t:"投 40 金币",d:"<span class='good'>随机一张稀有以上的牌</span>，有机会直接是金卡",ok:S.gold>=40,f:()=>{S.gold-=40;const c=offerCards(1,"R",1)[0];if(rnd()<.2){c.u=1;c.g=1}addCard(c);sfx("relic");return`咔哒！扭出了「${cname(c)}」！`}},
 {t:"投 90 金币",d:"<span class='good'>随机一件遗物</span>",ok:S.gold>=90,f:()=>{S.gold-=90;gainRelic(randRelic());return"扭蛋里滚出来一件闪闪发光的宝贝。"}},
 {t:"拍一拍机器",d:"一半机会掉出 <span class='good'>30 金币</span>，一半机会 <span class='bad'>被夹手 6 生命</span>",f:()=>{if(rnd()<.5){S.gold+=30;sfx("coin");return"哗啦啦，机器吐出一把金币！"}S.hp=Math.max(1,S.hp-6);return"哎哟！手被夹了一下。"}}]},
dummy:{n:"训练木桩",img:"i3",t:"一根被打得坑坑洼洼的木桩立在空地上，旁边刻着：「练到天亮，天下无敌」。",o:()=>[
 {t:"认真练一招",d:"<span class='good'>升级一张牌</span>",f:async()=>{const ok=await upgradePick();return ok?"这一招，你已经练到骨子里了。":null}},
 {t:"练到天亮",d:"<span class='good'>随机升级 3 张牌，+2 经验</span>，<span class='bad'>失去 12 生命</span>",ok:S.hp>12,f:async()=>{S.hp-=12;const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,3);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);await gainXP(2);return`天亮了，木桩也碎了。升级了：${l.map(cname).join("、")||"没有"}。`}}]},
spring:{n:"池塘泉眼",img:"c6",t:"一汪清澈的小泉眼，水面上漂着几只发光的奶蛙。泉水好像在回应你心里的奶蛙池。",o:()=>[
 {t:"喝一口",d:"<span class='good'>最大生命 +6</span>",f:()=>{S.max+=6;S.hp+=6;sfx("heal");return"泉水甜甜的，你觉得身体更结实了。"}},
 {t:"许个愿",d:"<span class='good'>这一局奶蛙池永久 +1 格</span>",f:()=>{S.perks=S.perks||{};S.perks.cap=(S.perks.cap||0)+1;sfx("relic");return"泉水泛起涟漪，你心里的池子变宽了。"}},
 {t:"捞彩虹",d:"<span class='good'>获得「彩虹奶蛙」×2</span>",f:()=>{addCard(mk("rainbow"));addCard(mk("rainbow"));return"两只彩虹奶蛙跳进了你的口袋。"}}]},
merchant:{n:"流浪商人",img:"xg",t:"一只戴着高帽子的奶蛙推着小车走过来：「先生，要不要做点小生意？」",o:()=>[
 {t:"以旧换新",d:"<span class='good'>移除一张牌，换一张同家族的稀有以上的牌</span>",f:async()=>{const r=await pickCards(S.deck.filter(c=>!"SKT".includes(CARDS[c.id].r)&&CARDS[c.id].fam!=="none"&&CARDS[c.id].fam!=="pal"),{title:"拿哪张去换？",sub:"会换成同家族的稀有以上的牌"});if(!r[0])return null;const fam=CARDS[r[0].id].fam;S.deck.splice(S.deck.indexOf(r[0]),1);const pool=POOL_HERO.filter(x=>CARDS[x].fam===fam&&"REL".includes(CARDS[x].r));const c=mk(pick(pool));addCard(c);return`「${cname(r[0])}」换成了「${cname(c)}」。`}},
 {t:"买张藏宝图",d:"花 50 金币，<span class='good'>下一个宝箱一定是金宝箱</span>",ok:S.gold>=50,f:()=>{S.gold-=50;S.flags.goldChest=1;return"商人眨眨眼：「顺着地图走，准没错。」"}},
 {t:"不了谢谢",d:"",f:()=>"商人摘下帽子鞠了个躬，推着小车走远了。"}]},
claw:{n:"抓娃娃机",img:"ega",t:"一台亮着彩灯的抓娃娃机，里面躺着各种奇怪的宝贝。抓奶蛙的手艺，这下派上用场了。爪子会来回移动，看准时机按下去！",o:()=>[
 {t:"抓一次",d:"花 20 金币，抓 1 次",ok:S.gold>=20,f:async()=>{S.gold-=20;renderTop();return clawReward(await clawGame(1))}},
 {t:"连抓三次",d:"花 50 金币，抓 3 次",ok:S.gold>=50,f:async()=>{S.gold-=50;renderTop();return clawReward(await clawGame(3))}},
 {t:"算了",d:"",f:()=>"你决定把手艺留给真正的奶蛙。"}]},
rpsfrog:{n:"猜拳奶蛙",img:"m3",t:"狂笑奶蛙拦住了你：「哈哈哈！来猜拳！赢了有奖，输了，哈哈哈哈！」",o:()=>[
 {t:"押 30 金币",d:"赢了拿 <span class='good'>80 金币</span>（平局再来）",ok:S.gold>=30,f:async()=>{S.gold-=30;renderTop();const r=await rpsGame("押了 30 金币");if(r==="win"){S.gold+=80;return"它笑不出来了，乖乖掏出 80 金币。"}return"它笑到在地上打滚，你的 30 金币没了。"}},
 {t:"押上体力",d:"赢了 <span class='good'>拿一件遗物</span>，输了 <span class='bad'>失去 10 生命</span>",ok:S.hp>10,f:async()=>{const r=await rpsGame("押上了 10 生命");if(r==="win"){gainRelic(randRelic());return"「愿赌服输！」它从口袋里掏出一样宝贝。"}S.hp-=10;return"它一巴掌拍在你脑门上：「哈哈哈，再来啊！」"}},
 {t:"不玩",d:"",f:()=>"「哈哈哈，胆小鬼！」"}]},
memory:{n:"管家的记忆游戏",img:"xg",t:"管家奶蛙摆出十二张卡片：「请记住它们的位置，先生。找到几对，我就奖励您几份。」",o:()=>[
 {t:"玩一局",d:"每找到 1 对 <span class='good'>+12 金币</span>，全部找到再送 <span class='good'>一件遗物</span>",f:async()=>{const n=await memoryGame();S.gold+=n*12;if(n===6){gainRelic(randRelic("C"));return`全部找到！获得 ${n*12} 金币和一件遗物。管家鼓起了掌。`}return`找到 ${n} 对，获得 ${n*12} 金币。`}},
 {t:"加注玩（30 金币）",d:"每对 <span class='good'>+25 金币</span>，全部找到送 <span class='good'>稀有遗物</span>",ok:S.gold>=30,f:async()=>{S.gold-=30;renderTop();const n=await memoryGame();S.gold+=n*25;if(n===6){gainRelic(randRelic("R"));return`全部找到！获得 ${n*25} 金币和一件稀有遗物。`}return`找到 ${n} 对，获得 ${n*25} 金币。`}},
 {t:"不玩",d:"",f:()=>"管家优雅地收起了卡片。"}]},
gallery:{n:"古堡画廊",img:"ml",act:1,t:"长长的走廊里挂满了画，每一幅画里都是一只奶蛙，它们的眼睛好像跟着你转。",o:()=>[
 {t:"仔细欣赏",d:"<span class='good'>+4 经验</span>",f:async()=>{await gainXP(4);return"看着看着，你好像领悟了什么。"}},
 {t:"偷一幅",d:"<span class='good'>+90 金币</span>，<span class='bad'>获得诅咒「烦躁」</span>",f:()=>{S.gold+=90;addCard(mk("fret"));return"画里的奶蛙瞪了你一眼。你心里有点发毛。"}},
 {t:"离开",d:"",f:()=>"你快步走出画廊，背后好像有谁在笑。"}]},
altar:{n:"星空祭坛",img:"ckf",act:4,t:"星星围成一圈，中间是一座发光的祭坛。祭坛上刻着：「献出一点自己，换来一点永恒」。",o:()=>[
 {t:"献出 10 最大生命",d:"<span class='good'>选一张牌，直接变成金卡</span>",ok:S.max>20,f:async()=>{const r=await pickCards(S.deck.filter(c=>!c.g&&!"SKT".includes(CARDS[c.id].r)),{title:"哪张牌变成金卡？",sub:"效果会触发两次"});if(!r[0])return null;S.max-=10;S.hp=Math.min(S.hp,S.max);r[0].u=Math.max(1,r[0].u|0);r[0].g=1;sfx("tri");return`「${cname(r[0])}」闪闪发光！`}},
 {t:"献出 60 金币",d:"<span class='good'>+6 经验</span>",ok:S.gold>=60,f:async()=>{S.gold-=60;await gainXP(6);return"星光落在你身上，你变强了。"}},
 {t:"离开",d:"",f:()=>"星星眨了眨眼，没有挽留你。"}]},
dojo:{n:"长老道场",img:"fj",t:"雾里浮现出一座小小的道场，长老的影子坐在中间：「来，陪老头子过两招。」",o:()=>[
 {t:"切磋一下",d:"<span class='good'>立刻选一个天赋</span>，<span class='bad'>失去 10 生命</span>",ok:S.hp>10,f:async()=>{S.hp-=10;await levelUp("长老指点");return"「不错，比我年轻时强。」"}},
 {t:"坐下喝茶",d:"<span class='good'>回复 20 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+20);sfx("heal");return"茶很苦，心很静。"}}]},
snakehole:{n:"蛇洞",img:"sna",act:0,t:"泥地里有个黑漆漆的洞，里面传来嘶嘶声，还有金币反光的亮点。",o:()=>[
 {t:"伸手去掏",d:"<span class='good'>+60 金币</span>，一半机会 <span class='bad'>被咬失去 8 生命</span>",f:()=>{S.gold+=60;if(rnd()<.5){S.hp=Math.max(1,S.hp-8);return"掏到了金币，也被咬了一口。"}return"小蛇睡着了，你顺利拿到了金币。"}},
 {t:"引它出来",d:"<span class='good'>获得伙伴卡「小蛇」</span>",f:()=>{addCard(mk("p_snk"));return"一条小蛇爬出来，缠在你手腕上不走了。"}},
 {t:"离开",d:"",f:()=>"你绕开了蛇洞。"}]},
chinashop:{n:"瓷器店",img:"cki",act:1,t:"古堡角落有一间瓷器店，架子上摆满了奶鸡形状的花瓶。老板不在，只有一块牌子：「打碎照价赔偿」。",o:()=>[
 {t:"买一只花瓶",d:"花 45 金币，<span class='good'>获得伙伴卡「瓷器奶鸡」×2</span>",ok:S.gold>=45,f:()=>{S.gold-=45;addCard(mk("p_china"));addCard(mk("p_china"));return"花瓶里竟然住着两只小奶鸡。"}},
 {t:"在店里练拳",d:"<span class='good'>升级 2 张随机牌</span>，<span class='bad'>赔偿 30 金币</span>",ok:S.gold>=30,f:()=>{S.gold-=30;const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);return`哐啷！碎了一地。不过你的招式更利索了：${l.map(cname).join("、")}。`}},
 {t:"轻手轻脚离开",d:"",f:()=>"你屏住呼吸，一只花瓶都没碰到。"}]},
meteor:{n:"流星雨",img:"nx",act:4,t:"星空突然亮了起来，一颗颗流星从你身边划过。据说对着流星许愿，愿望就会实现。",o:()=>[
 {t:"许愿变强",d:"<span class='good'>立刻选一个天赋</span>",f:async()=>{await levelUp("流星的祝福");return"一颗流星落进了你的心里。"}},
 {t:"许愿发财",d:"<span class='good'>+120 金币</span>",f:()=>{S.gold+=120;sfx("coin");return"流星化成了金币，叮叮当当落了一地。"}},
 {t:"接住一颗",d:"<span class='good'>获得一件稀有遗物</span>，<span class='bad'>失去 10 生命</span>",ok:S.hp>10,f:()=>{S.hp-=10;gainRelic(randRelic("R"));return"好烫！但你抓住了它。"}}]},
belltower:{n:"敲钟",img:"egsk",act:2,t:"钟楼顶上挂着一口大钟，旁边挂着一根木槌。传说敲响它，会听见过去的自己。",o:()=>[
 {t:"轻轻敲一下",d:"<span class='good'>+4 经验</span>",f:async()=>{await gainXP(4);return"当，钟声里，你好像听见了长老年轻时的笑声。"}},
 {t:"使劲敲十下",d:"<span class='good'>随机升级 3 张牌</span>，<span class='bad'>失去 8 生命（耳朵好疼）</span>",ok:S.hp>8,f:()=>{S.hp-=8;const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,3);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);return`当当当当，升级了：${l.map(cname).join("、")||"没有"}。`}},
 {t:"捂着耳朵离开",d:"",f:()=>"你决定保护好自己的耳朵。"}]},
snowman:{n:"雪人",img:"egl",act:2,t:"雪地里站着一个歪歪扭扭的雪人，鼻子是一根胡萝卜，眼睛是两颗奶茶珍珠。",o:()=>[
 {t:"帮它扶正",cf:"snowFriend",d:"<span class='good'>获得伙伴卡「雪蛋」×2</span>",f:()=>{addCard(mk("p_egl"));addCard(mk("p_egl"));return"雪人眨了眨眼，从肚子里滚出两颗雪蛋送给你。"}},
 {t:"拿走胡萝卜",d:"<span class='good'>+50 金币</span>，<span class='bad'>获得诅咒「沉重」</span>",f:()=>{S.gold+=50;addCard(mk("heavy"));return"胡萝卜里藏着金币。可是雪人看你的眼神好伤心。"}},
 {t:"一起堆雪人",d:"<span class='good'>回复 12 生命，+2 经验</span>",f:async()=>{S.hp=Math.min(S.max,S.hp+12);await gainXP(2);return"你堆了一个"+HN()+"雪人，开心得不得了。"}}]},
teatest:{n:"试喝员招聘",img:"cty",act:3,t:"流水线旁贴着一张告示：「招试喝员，喝多少都行，喝完别投诉」。一排刚煮好的奶茶冒着热气。",o:()=>[
 {t:"喝一杯",d:"<span class='good'>回复 15 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+15);return"甜度刚好，温度刚好。你觉得自己又能爬十层。"}},
 {t:"一口气喝完一排",d:"<span class='good'>最大生命 +6，回满生命</span>，<span class='bad'>获得诅咒「沉重」</span>",f:()=>{S.max+=6;S.hp=S.max;addCard(mk("heavy"));return"你打了一个长长的奶嗝。肚子好重"}},
 {t:"偷偷装一瓶",d:"<span class='good'>获得 2 瓶药水</span>",f:()=>{givePot(randPot());givePot(randPot());return"你把奶茶灌进小瓶子里，揣进了怀里。"}}]},
boiler:{n:"失控的锅炉",img:"dgy",act:3,t:"一口大锅炉咕嘟咕嘟乱响，压力表的指针已经转到了红色。旁边的阀门烫得发红。",o:()=>[
 {t:"拧紧阀门",d:"<span class='good'>随机升级 2 张牌，+3 经验</span>，<span class='bad'>失去 8 生命（烫手）</span>",ok:S.hp>8,f:async()=>{S.hp-=8;const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);await gainXP(3);return`嘶，好烫！锅炉安静了下来。升级了：${l.map(cname).join("、")||"没有"}。`}},
 {t:"捡锅炉下面的金币",d:"<span class='good'>+70 金币</span>，一半机会 <span class='bad'>失去 12 生命</span>",f:()=>{S.gold+=70;sfx("coin");if(rnd()<.5){S.hp=Math.max(1,S.hp-12);return"砰！锅炉喷了你一脸蒸汽，不过钱到手了。"}return"你趁它不注意，把金币全捡走了。"}},
 {t:"赶紧跑",d:"",f:()=>"你跑得飞快，身后传来一声闷响。"}]},
library:{n:"古卷书架",img:"m6",t:"一排落满灰尘的书架，最上面压着一本发光的秘籍。",o:()=>[
 {t:"翻开秘籍",d:"<span class='good'>从 3 张稀有牌里选 1 张</span>",f:async()=>{await chooseReward(offerCards(3,"E",1),"秘籍里写着",false);return"你把招式记在了心里。"}},
 {t:"把书都读一遍",d:"<span class='good'>+5 经验</span>，<span class='bad'>失去 10 生命（熬夜）</span>",ok:S.hp>10,f:async()=>{S.hp-=10;await gainXP(5);return"天亮了，你的眼睛红红的，但脑子里全是招式。"}},
 {t:"不看了",d:"",f:()=>"书架上的灰尘呛得你直咳嗽。"}]},
cursechest:{n:"诅咒宝箱",img:"cki",t:"一只宝箱被铁链缠着，锁上贴着一张符：「打开的人，会背上一点霉运」。",o:()=>[
 {t:"撕掉符咒打开",d:"<span class='good'>获得一件稀有遗物</span>，<span class='bad'>获得诅咒「沉重」×2</span>",f:()=>{gainRelic(randRelic("R"));addCard(mk("heavy"));addCard(mk("heavy"));return"宝箱里闪闪发光。你的口袋突然变得好重。"}},
 {t:"小心地撬一条缝",d:"<span class='good'>+60 金币</span>，<span class='bad'>失去 8 生命</span>",ok:S.hp>8,f:()=>{S.hp-=8;S.gold+=60;sfx("coin");return"缝里夹出来一把金币，铁链弹了你一下。"}},
 {t:"不碰它",d:"",f:()=>"有些东西，还是不要碰比较好。"}]},
dummy:{n:"训练木桩",img:"n3",t:"空地上立着一排木桩，上面密密麻麻全是拳印。",o:()=>[
 {t:"打一百拳",d:"<span class='good'>随机升级 2 张牌</span>，<span class='bad'>失去 7 生命</span>",ok:S.hp>7,f:()=>{S.hp-=7;const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);return`拳头肿了，但升级了：${l.map(cname).join("、")||"没有"}。`}},
 {t:"对着木桩冥想",d:"<span class='good'>+3 经验，回复 8 生命</span>",f:async()=>{S.hp=Math.min(S.max,S.hp+8);await gainXP(3);return"你和木桩对视了一个下午，好像明白了什么。"}}]},
lantern:{n:"熄掉的灯",img:"ct",act:0,t:"沼泽边的木桩上挂着一盏灯，灯芯还是湿的。",o:()=>[
 {t:"把它点亮",d:"<span class='good'>+4 经验</span>",f:async()=>{await gainXP(4);return"灯亮了一会儿。远处好像有谁朝这边挥了挥手。"}},
 {t:"倒出灯油",d:"<span class='good'>+45 金币</span>",f:()=>{S.gold+=45;sfx("coin");return"灯油卖了个好价钱。"}},
 {t:"别碰它",d:"",f:()=>"你走过去的时候，灯晃了一下。"}]},
nametags:{n:"一堆木牌",img:"m2",act:0,t:"路边堆着很多小木牌，每块上面都刻着一个名字。",o:()=>[
 {t:"翻一翻",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"你没找到小七的名字。也可能是还没翻完。"}},
 {t:"刻上自己的名字",d:"<span class='good'>最大生命 +6</span>",f:()=>{S.max+=6;S.hp+=6;return"刻完以后，你觉得自己结实了一点。"}},
 {t:"走开",d:"",f:()=>"木牌太多了。"}]},
portraitroom:{n:"画像室",img:"fbcc",act:1,t:"一间只挂着画的房间。角落有一个空画框，下面写着今天的日期。",o:()=>[
 {t:"站到画框前面",d:"<span class='good'>获得一件稀有遗物</span>，<span class='bad'>最大生命 -6</span>",f:()=>{S.max=Math.max(20,S.max-6);S.hp=Math.min(S.hp,S.max);gainRelic(randRelic("R"));return"画框里映出了你。你赶紧走开，口袋里多了个东西。"}},
 {t:"把画框砸了",d:"<span class='good'>+35 金币</span>",f:()=>{S.gold+=35;sfx("coin");return"砸碎以后，隔壁房间有人叹了口气。"}},
 {t:"离开",d:"",f:()=>"门在你身后自己关上了。"}]},
teaparty:{n:"茶会",img:"ctp",act:1,t:"长桌边坐满了客人，都低着头，没有人说话。主位空着。",o:()=>[
 {t:"坐下喝一杯",d:"<span class='good'>回满生命</span>，<span class='bad'>获得诅咒「沉重」</span>",f:()=>{S.hp=S.max;addCard(mk("heavy"));return"茶很好喝。你走的时候，没有人抬头。"}},
 {t:"拿走桌上的点心",d:"<span class='good'>获得 2 瓶药水</span>",f:()=>{givePot(randPot());givePot(randPot());return"点心是热的。"}},
 {t:"离开",d:"",f:()=>"你轻轻把门带上了。"}]},
frozenline:{n:"冰里的队伍",img:"c7",act:2,t:"冰层下面，一排奶蛙排着队，都朝着同一个方向。",o:()=>[
 {t:"敲敲冰",d:"<span class='good'>+5 经验</span>，<span class='bad'>失去 5 生命</span>",ok:S.hp>5,f:async()=>{S.hp-=5;await gainXP(5);return"最前面那只好像动了一下。应该是看错了。"}},
 {t:"顺着它们的方向走",d:"<span class='good'>下一个宝箱一定是金宝箱</span>",f:()=>{S.flags.goldChest=1;return"它们看的方向，确实有东西。"}},
 {t:"离开",d:"",f:()=>"你没有回头。"}]},
bellrope:{n:"钟绳",img:"egsk",act:2,t:"一根绳子从上面垂下来。拉一下，钟就会响。",o:()=>[
 {t:"拉一下",d:"<span class='good'>随机升级 1 张牌</span>",f:()=>{const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,1);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);return`钟响了。村里应该听得见。升级了：${l.map(cname).join("、")||"没有"}。`}},
 {t:"拉很多下",d:"<span class='good'>随机升级 3 张牌</span>，<span class='bad'>失去 10 生命</span>",ok:S.hp>10,f:()=>{S.hp-=10;const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,3);l.forEach(c=>c.u=(c.u|0)+1);upFx(l);return`钟一直响。你停下来以后，它又自己响了一下。升级了：${l.map(cname).join("、")||"没有"}。`}},
 {t:"别拉",d:"",f:()=>"绳子自己晃了晃。"}]},
warehouse:{n:"仓库",img:"cty",act:3,t:"奶茶厂的仓库，门没有锁。里面很暖和，堆满了麻袋。",o:()=>[
 {t:"翻麻袋",d:"<span class='good'>+80 金币</span>，<span class='bad'>获得诅咒「沉重」</span>",f:()=>{S.gold+=80;addCard(mk("heavy"));sfx("coin");return"麻袋里有金币，也有别的东西。你没细看。"}},
 {t:"拿一袋珍珠",d:"<span class='good'>获得遗物「珍珠袋」</span>",f:()=>{if(!has("pearlbag"))gainRelic("pearlbag");else S.gold+=40;return"珍珠圆圆的，有点软。"}},
 {t:"关上门",d:"",f:()=>"门关上以后，里面好像有什么在动。"}]},
conveyor:{n:"传送带",img:"cup",act:3,t:"传送带一直往上走，上面是一个个封好的杯子。",o:()=>[
 {t:"喝一杯",d:"<span class='good'>最大生命 +8</span>，<span class='bad'>获得诅咒「沉重」</span>",f:()=>{ach("sweet");S.max+=8;S.hp+=8;addCard(mk("heavy"));return"很甜。你不太想知道为什么这么甜。"}},
 {t:"关掉传送带",d:"<span class='good'>+4 经验</span>，<span class='bad'>失去 6 生命</span>",ok:S.hp>6,f:async()=>{S.hp-=6;await gainXP(4);return"整个工厂安静了几秒，然后又响了起来。"}},
 {t:"离开",d:"",f:()=>"杯子一个接一个往上走。"}]},
starmap:{n:"星图",img:"egf",act:4,t:"地上画着一张星图，有些星星被划掉了。",o:()=>[
 {t:"研究星图",d:"<span class='good'>从 3 张稀有牌里选 1 张</span>",f:async()=>{await chooseReward(offerCards(3,"E",1),"星图上画着招式",false);return"你记住了几颗星星的位置。"}},
 {t:"划掉一颗",d:"<span class='good'>获得一件稀有遗物</span>",f:()=>{gainRelic(randRelic("R"));return"你划掉的那颗，好像正好在村子上面。"}},
 {t:"离开",d:"",f:()=>"星星还在闪。"}]},
isekaigate:{n:"异世界之门",img:"yjx",rare:1,t:"墙上裂开一道缝，透出很亮的光。光里探出来一个猫耳朵、穿女仆装的家伙，左右看了看，小声问你：「这里……不是那个大家拿着网到处抓奶蛙的地方吧？」看你一脸疑惑，它解释：「我原来也是只奶蛙。去了一趟异世界，回来就变成这样了。在那边被抓了好多次，今天门开了，我就跑过来了。」",o:()=>[
 {t:"帮它回去",d:"<span class='good'>获得遗物「另一个世界的奶蛙球」</span>，<span class='bad'>花 30 金币修门</span>",ok:S.gold>=30,f:()=>{S.gold-=30;if(!has("otherball"))gainRelic("otherball");else S.gold+=60;return"你帮它把门撑开。它钻回去之前，塞给你一个圆圆的球：「那边的人就是用这个抓我的。送你吧，我用不上了。」光一下子合上了。"}},
 {t:"让它跟着你",d:"<span class='good'>伙伴卡「异世界传送」和 1 张异世界招式加入牌组</span>，<span class='bad'>失去 6 生命</span>",ok:S.hp>6,f:()=>{S.hp-=6;addCard(mk("p_yjx"));addCard(mk(pick(["x_reborn","x_rules","x_otherside","x_tray","x_nekoimpact"])));return"它想了想：「反正回去也是被抓，我先跟你走一段。」它跳下来的时候踩了你一脚，又塞给你一张它那边的招式。"}},
 {t:"把它抓了",d:"<span class='bad'>和它打一场</span>，<span class='good'>赢了有稀有遗物；抓住它有隐藏成就</span>",f:async()=>{await talk([["yjx","异世界奶蛙","……"],["yjx","异世界奶蛙","怎么到哪都一样啊。"]]);S.cur={t:"E",rs:S.rs};S.pendGrp=["isekaiX"];S.isekaiFight=1;startCombat("E");return null}}]},
emptychair:{n:"空王座",img:"bx",act:4,t:"塔顶边上立着一张旧王座，靠背上刻着很多名字。",o:()=>[
 {t:"坐一会儿",d:"<span class='good'>回复 20 生命，+3 经验</span>",f:async()=>{S.hp=Math.min(S.max,S.hp+20);await gainXP(3);return"王座是温的，坐上去就不想起来。你赶紧站了起来。"}},
 {t:"看看那些名字",d:"<span class='good'>立刻选一个天赋</span>",f:async()=>{await levelUp("靠背上的名字");return"最上面的名字已经磨平了。最下面那个还很新。"}},
 {t:"离开",d:"",f:()=>"你走开以后，王座还在原地，靠背上好像多了一道划痕。"}]},
candykid:{n:"卖糖的小奶鼠",img:"msj",t:"路边有一只小奶鼠在卖糖，一块 10 金币。",o:()=>[
 {t:"买一块",d:"<span class='good'>回复 10 生命</span>，花 10 金币",ok:S.gold>=10,f:()=>{S.gold-=10;S.hp=Math.min(S.max,S.hp+10);return"糖很甜。"}},
 {t:"全买了",d:"<span class='good'>获得遗物「方糖」</span>，花 40 金币",ok:S.gold>=40,f:()=>{S.gold-=40;if(!has("sugarcube"))gainRelic("sugarcube");else S.hp=S.max;return"它数钱数了很久。"}},
 {t:"问它爸妈在哪",d:"<span class='good'>+2 经验</span>",f:async()=>{await gainXP(2);return"它说爸妈去塔顶上班了，很快就回来。"}}]},
mirrorpond:{n:"镜子一样的水",img:"bnl",t:"水面很平，映出来的你在笑。你没有笑。",o:()=>[
 {t:"盯着看",d:"<span class='good'>从 3 张牌里选 1 张</span>",f:async()=>{await chooseReward(offerCards(3,"C"),"水里的你在比划招式",false);return"水里的你先转身走了。"}},
 {t:"扔块石头",d:"<span class='good'>+30 金币</span>，<span class='bad'>失去 3 生命</span>",ok:S.hp>3,f:()=>{S.hp-=3;S.gold+=30;return"水花溅起来，打湿了你。水底有几枚硬币。"}},
 {t:"走开",d:"",f:()=>"你走了几步，水里的你没有跟上。"}]},
oldclimber:{n:"老登山者",img:"m5",t:"一只很老的奶蛙坐在台阶上，说他爬了一辈子。",o:()=>[
 {t:"听他说",d:"<span class='good'>+4 经验</span>",f:async()=>{await gainXP(4);return"他说他第一次来的时候，塔只有三层。"}},
 {t:"给他 30 金币",d:"<span class='good'>获得一件遗物</span>",ok:S.gold>=30,f:()=>{S.gold-=30;gainRelic(randRelic("C"));return"他从怀里掏出一个旧东西给你，说用不上了。"}},
 {t:"问他为什么不下山",d:"",f:()=>"他想了很久，说忘了下山的路怎么走。"}]},
cupgame:{n:"猜杯子",img:"dg",t:"一只奶狗摆了三个杯子，把一颗球塞进中间那个下面：「看好了哦，我要开始换了！」",o:()=>[
 {t:"押 30 金币",d:"猜中拿回 <span class='good'>100 金币</span>",ok:S.gold>=30,f:async()=>{S.gold-=30;renderTop();const ok=await shellGame();if(ok){S.gold+=100;return"猜中了！奶狗的笑容僵了一下。"}return"奶狗把球揣回兜里，冲你眨眨眼。"}},
 {t:"押上眼力",d:"猜中 <span class='good'>升级一张牌</span>，猜错 <span class='bad'>失去 5 生命</span>",ok:S.hp>5,f:async()=>{const ok=await shellGame();if(ok){await upgradePick();return"「好眼力！」奶狗给你比了个大拇指。"}S.hp-=5;return"奶狗咬了你一口：「再练练吧！」"}},
 {t:"不玩",d:"",f:()=>"奶狗冲你笑了笑。"}]},
whack:{n:"奶鼠乱窜",img:"ms",t:"仓库的地板上全是洞，奶鼠从这个洞钻出来，又从那个洞钻进去。看门的奶狗递给你一把小锤子。",o:()=>[
 {t:"拿起锤子",d:"每敲到 1 只 <span class='good'>+5 金币</span>，敲到 15 只再送 <span class='good'>一瓶药水</span>",f:async()=>{const n=await whackGame();S.gold+=n*5;let s=`敲到 ${n} 只，获得 ${n*5} 金币。`;if(n>=15){givePot(randPot());s+="奶狗还送了你一瓶药水。"}return s}},
 {t:"不管它们",d:"",f:()=>"奶鼠们继续开派对。"}]},
ragdoll:{n:"布娃娃",img:"n2",t:"路上掉着一个布娃娃，缝的是一只小奶蛙，背后绣着一个「七」字。",o:()=>[
 {t:"带上它",d:"<span class='good'>最大生命 +6，回复 6 生命</span>",f:()=>{S.max+=6;S.hp=Math.min(S.max,S.hp+12);S.flags.doll=1;return"抱着它，好像没那么怕了。"}},
 {t:"放回原处",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"也许它的主人会回来找。"}}]},
fishing:{n:"钓鱼",img:"c3",t:"一根钓竿插在池塘边，主人不知去哪了。水面下有东西在游来游去。",o:()=>[
 {t:"钓一杆",d:"随机：金币、药水、卡牌，或者，一块泥巴",f:()=>{const r=rnd();if(r<.3){S.gold+=40;return"钓上来一个钱袋！+40 金币"}if(r<.55){givePot(randPot());return"钓上来一瓶药水。"}if(r<.85){const c=offerCards(1,"C")[0];addCard(c);return`钓上来一张卡：「${cname(c)}」。`}addCard(mk("mud"));return"钓上来一块泥巴，它粘在你的牌组里了。"}},
 {t:"钓到天黑",d:"<span class='good'>钓三次</span>，<span class='bad'>失去 6 生命（着凉了）</span>",ok:S.hp>6,f:()=>{S.hp-=6;let s=[];for(let i=0;i<3;i++){const r=rnd();if(r<.4){S.gold+=30;s.push("30 金币")}else if(r<.7){givePot(randPot());s.push("药水")}else{const c=offerCards(1,"C")[0];addCard(c);s.push(cname(c))}}return"收获："+s.join("、")+"。"}},
 {t:"不钓了",d:"",f:()=>"你把钓竿插回原处。"}]},
horserace:{n:"奶马赛跑",img:"hrg",t:"一群奶马在空地上比赛跑步，旁边围着一圈下注的观众。",o:()=>[
 {t:"押 30 金币",d:"押中拿 <span class='good'>100 金币</span>，可以狂点给它加油",ok:S.gold>=30,f:async()=>{S.gold-=30;renderTop();const ok=await raceGame();if(ok){S.gold+=100;sfx("coin");return"你押的那匹奶马冲过了终点！"}return"你押的那匹跑到一半停下来吃草了。"}},
 {t:"自己上场",d:"<span class='good'>+3 经验，升级一张奶马牌</span>，<span class='bad'>失去 6 生命</span>",ok:S.hp>6,f:async()=>{S.hp-=6;await gainXP(3);const l=S.deck.filter(c=>upOK(c)&&CARDS[c.id].fam==="horse");if(l.length){const c=pick(l);c.u=(c.u|0)+1;upFx([c]);return`你跑赢了奶马！「${cname(c)}」升级了。`}return"你跑赢了奶马，大家都看呆了。"}},
 {t:"在旁边看",d:"",f:()=>"真热闹。"}]},
fortune:{n:"占卜奶猫",img:"ctf",t:"一只披着星星斗篷的奶猫坐在水晶球后面：「喵，让我看看你的命运。」",o:()=>[
 {t:"算一卦（20 金币）",d:"随机：<span class='good'>一个天赋</span>，或 <span class='bad'>失去 6 生命</span>",ok:S.gold>=20,f:async()=>{S.gold-=20;if(rnd()<.6){await levelUp("好运来了");return"「喵～你会越来越强。」"}S.hp=Math.max(1,S.hp-6);return"「喵，今天不宜出门。」水晶球砸到了你的脚。"}},
 {t:"问问前路",d:"<span class='good'>下一个宝箱一定是金宝箱</span>",f:()=>{S.flags.goldChest=1;return"「往前走，金光在等你。」"}},
 {t:"不信这个",d:"",f:()=>"奶猫耸耸肩，继续盯着水晶球。"}]},
wedding:{n:"奶蛙婚礼",img:"xb",t:"一场热闹的奶蛙婚礼正在举行，新娘穿着白纱，宾客们端着奶茶碰杯。",o:()=>[
 {t:"送份礼（30 金币）",d:"<span class='good'>回复 15 生命，获得一件普通遗物</span>",ok:S.gold>=30,f:()=>{S.gold-=30;S.hp=Math.min(S.max,S.hp+15);gainRelic(randRelic("C"));return"新娘笑着回赠了你一件小礼物。"}},
 {t:"抢捧花",d:"<span class='good'>获得伙伴卡「新娘捧花」</span>",f:()=>{addCard(mk("p_xb"));return"你一跃而起，接住了捧花！全场欢呼。"}},
 {t:"蹭一顿饭",d:"<span class='good'>最大生命 +5</span>",f:()=>{S.max+=5;S.hp+=5;return"喜宴真好吃，你吃得肚子圆滚滚。"}}]},
vamp:{n:"路过的吸血鬼",img:"vp",act:0,t:"一只披着斗篷的奶蛙从天上落下来，舔了舔尖牙。「别怕，我只是路过，顺便饿了。」",o:()=>[
 {t:"让它咬一口",cf:"vampBit",d:"<span class='bad'>最大生命 -8</span>，<span class='good'>获得遗物「吸血鬼披风」</span>",f:()=>{S.max-=8;S.hp=Math.min(S.hp,S.max);gainRelic("cape");return"「谢啦！这件披风送你，上面那层见。」它飞走了。"}},
 {t:"请它喝奶茶",cf:"vampTea",d:"<span class='good'>获得「吸血鬼之吻」×2</span>",f:()=>{addCard(mk("kiss"));addCard(mk("kiss"));return"「奶茶，好像也不错？」它教了你两招才走。"}},
 {t:"赶快跑",d:"",f:()=>"你跑得飞快。身后传来一句：「上面见哦～」"}]},
};
function eventScreen(force){show("event");if(force){S.cur=S.cur||{};S.cur.ev=force}setBg("event");playMusic("space");
 let pool=Object.keys(EVENTS).filter(k=>!EVENTS[k].story&&!EVENTS[k].rare&&!S.evSeen.includes(k)&&!EVENTS[k].ss&&(S.junc?EVENTS[k].junc:!EVENTS[k].junc)&&(S.dream?EVENTS[k].dream:!EVENTS[k].dream)&&(EVENTS[k].act==null||EVENTS[k].act===S.act||S.dream));if(S.dream&&!pool.length)pool=Object.keys(EVENTS).filter(k=>EVENTS[k].dream);if(!pool.length)pool=Object.keys(EVENTS).filter(k=>!EVENTS[k].rare&&(S.junc?EVENTS[k].junc:!EVENTS[k].junc&&!EVENTS[k].ss));if(S.relics.includes("pup"))pool=pool.filter(k=>k!=="pup");
 if(!force&&!S.junc&&!S.cur.ev&&(S.act||0)>=1&&!S.flags.isekai&&rnd()<.04){S.cur.ev="isekaigate";S.flags.isekai=1}M.evEver=M.evEver||[];if(S.junc){const mobQ=["jc_guard","jc_herb","jc_horse"];{const pf=pool.filter(k=>!(mobQ.includes(k)&&S.row>=2));if(pf.length)pool=pf}if(!S.cur.ev&&!S.jside){const qg=pool.filter(k=>[...mobQ,"jc_mail","jc_racer","jc_hunter","jc_sick"].includes(k));if(qg.length&&rnd()<.6)S.cur.ev=pick(qg)}}else if(!S.cur.ev&&!S.dream&&!S.fin&&(!S.mside||S.mside.done)&&rnd()<.3){const mq=pool.filter(k=>/^mq_/.test(k));if(mq.length)S.cur.ev=pick(mq)}const fresh=pool.filter(k=>!M.evEver.includes(k));const id=S.cur.ev||(S.cur.ev=pick(fresh.length&&rnd()<.7?fresh:pool));if(!M.evEver.includes(id)){M.evEver.push(id);saveMeta()}if(id==="isekaigate"){ach("isekai");M.isekaiMet=1;saveMeta()}saveRun();const E=EVENTS[id];if(E.junc&&!S.evSeen.includes(id))questTick("jNpc");if(!S.evSeen.includes(id))S.evSeen.push(id);const opts=E.o();
 $("#event").innerHTML=`<div class="evBox"><div class="phead"><span class="ribbon">${E.n}</span></div><div class="evPic"><img src="${IMG(E.img)}"></div><div class="evTxt"><p id="evP">${typeof E.t==="function"?E.t():E.t}</p><div class="evOpts">${opts.map((o,i)=>`<button class="evo" data-i="${i}" ${o.ok===false?"disabled":""}><b>${o.t}</b><small>${o.d}</small></button>`).join("")}</div></div></div>`;
 $$("#event .evo").forEach(b=>b.onclick=async()=>{if(b.dataset.busy)return;b.dataset.busy=1;const op=opts[+b.dataset.i];const r=await op.f();if(r==null){delete b.dataset.busy;return}if(op.cf){S.flags[op.cf]=1}sfx("click");renderTop();S.cur=null;saveRun();
  $("#evP").textContent=r;$(".evOpts").innerHTML=`<button class="evo" id="evGo"><b>继续前进</b></button>`;$("#evGo").onclick=openMap})}

/* ===================== 启动 ===================== */
$("#stage").addEventListener("scroll",e=>{e.target.scrollTop=0;e.target.scrollLeft=0});
fit();titleScreen();
/* 防卡死：任何报错都不该让游戏永远停住 */
setInterval(()=>{try{if(!B||B.over||!B.myTurn||busy||!B.lastAct||B.idleSaid===B.turn||document.hidden)return;if(!$("#battle").classList.contains("on")||$("#ov").classList.contains("on")||$("#talk").classList.contains("on"))return;if(Date.now()-B.lastAct>14000){B.idleSaid=B.turn;const l=HL("idle");if(l.length)heroSay(pick(l))}}catch(e){}},2000);
let busySince=0;setInterval(()=>{if(!busy){busySince=0;return}if(!busySince){busySince=Date.now();return}
 const talking=$("#talk").classList.contains("on")||$("#ov").classList.contains("on");
 if(!talking&&Date.now()-busySince>8000){busy=false;busySince=0;try{if(B&&!B.over){if(!B.alive().length)win();else{B.myTurn=true;$("#endBtn").classList.remove("wait");renderBattle()}}}catch(e){}}},1000);
addEventListener("error",()=>{setTimeout(()=>{if(busy&&!$("#talk").classList.contains("on")&&!$("#ov").classList.contains("on")){busy=false;try{if(B&&!B.over&&!B.alive().length)win();else if(B&&!B.over){B.myTurn=true;renderBattle()}}catch(e){}}},1500)});
addEventListener("unhandledrejection",()=>{setTimeout(()=>{if(busy&&!$("#talk").classList.contains("on")&&!$("#ov").classList.contains("on")){busy=false;try{if(B&&!B.over&&!B.alive().length)win();else if(B&&!B.over){B.myTurn=true;renderBattle()}}catch(e){}}},1500)});CLOUD.init().then(()=>{const c=$("#cloudSt");if(c)c.textContent=CLOUD.txt()});
window.__dbg={get S(){return S},get B(){return B},startCombat,openMap,enterNode,newRun,win:()=>{B.enemies.forEach(e=>e.hp=0);afterAction()},CARDS};

/* ===================== 4.8 木桩练习：随便搭牌组，看每回合打多少 ===================== */
(function(){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect x="88" y="150" width="24" height="140" rx="6" fill="#7a4a24"/><rect x="20" y="120" width="160" height="22" rx="10" fill="#8a5a30"/><ellipse cx="100" cy="95" rx="62" ry="70" fill="#c9965a" stroke="#5a3418" stroke-width="6"/><circle cx="100" cy="95" r="44" fill="#fff" stroke="#e5191c" stroke-width="10"/><circle cx="100" cy="95" r="22" fill="#e5191c"/><circle cx="100" cy="95" r="8" fill="#fff"/><path d="M70 285h60" stroke="#3a2210" stroke-width="10" stroke-linecap="round"/></svg>`;window.__NWT_IMG=window.__NWT_IMG||{};window.__NWT_IMG.dummy="data:image/svg+xml;base64,"+btoa(svg)})();
ENEMY.dummy={n:"木桩",img:"dummy",hp:[99999,99999],h:250,pd:"练习用的木桩。血是无限的，每回合开始会补满",ai:(e,t)=>S&&S.dummyAtk?{k:"atk",v:S.dummyAtk}:{k:"wait"}};
function starterDeck(h){return(h==="kungfu"?["strike","strike","strike","strike","guard","k_lightfoot","k_lightfoot","fist","fist","k_jab","k_jab","k_palm"]:h==="knight"?[...STARTER.filter((x,i)=>i!==0),"kn_shield","kn_bash","kn_slash","strike"]:h==="mage"?["m_bolt","m_bolt","m_bolt","m_bolt","m_spark","m_ward","m_ward","guard","guard","m_fire"]:h==="vamp"?["v_bite","v_bite","v_bite","v_bite","v_claw","v_dodge","v_dodge","v_dodge","v_pact","v_bleed","v_fang"]:[...STARTER,"strike"])}
const DM={hero:"naiwa",deck:null,atk:0,up:0,tab:"hero",bak:null};
function dummyScreen(){if(!DM.deck)DM.deck=starterDeck(DM.hero);
 const pool=Object.keys(CARDS).filter(k=>{const D=CARDS[k];if(["cur","sts"].includes(D.type)||["T","K"].includes(D.r)||D.aq)return false;if(DM.tab==="hero")return D.hero===DM.hero;if(DM.tab==="qz")return D.r==="Q"&&(!D.hero||D.hero===DM.hero);return !D.hero&&D.r!=="Q"});
 ov(`<div class="dmBox"><div class="mgHead"><span class="ribbon b">木桩练习</span><small>随便搭一套牌，打木桩看伤害。练习不会影响你的存档</small></div>
 <div class="dmRow"><b>主角</b>${HEROES.map(h=>`<button class="dmH ${h.id===DM.hero?"on":""}" data-h="${h.id}"><img src="${IMG(h.img)}"><span>${h.n}</span></button>`).join("")}</div>
 <div class="dmRow"><b>木桩</b>${[[0,"不还手"],[8,"每回合打 8"],[15,"每回合打 15"],[25,"每回合打 25"]].map(([v,t])=>`<button class="dmA ${DM.atk===v?"on":""}" data-a="${v}">${t}</button>`).join("")}<button class="dmA ${DM.up?"on":""}" id="dmUp">牌全部升 1 星</button></div>
 <div class="dmCols"><div class="dmDeck"><b>牌组 ${DM.deck.length} 张</b><small>点一下拿掉</small><div class="dmList">${DM.deck.map((id,i)=>`<button class="dmC" data-i="${i}">${CARDS[id].n}</button>`).join("")}</div><button class="btn sm ghost" id="dmReset">恢复初始牌组</button></div>
 <div class="dmPool"><div class="dmTabs">${[["hero","专属牌"],["all","通用牌"],["qz","奇招"]].map(([k,t])=>`<button class="dmT ${DM.tab===k?"on":""}" data-t="${k}">${t}</button>`).join("")}<small>点卡牌加进牌组</small></div><div class="dmCards">${pool.map(k=>`<div class="dmPick" data-k="${k}">${cardHTML(mk(k))}</div>`).join("")}</div></div></div>
 <div class="ovFoot"><button class="btn ghost" id="dmX">返回</button><button class="btn" id="dmGo">开始练习 ▶</button></div></div>`);
 $$(".dmH").forEach(b=>b.onclick=()=>{DM.hero=b.dataset.h;DM.deck=starterDeck(DM.hero);sfx("click");dummyScreen()});
 $$(".dmA[data-a]").forEach(b=>b.onclick=()=>{DM.atk=+b.dataset.a;sfx("click");dummyScreen()});
 $("#dmUp").onclick=()=>{DM.up=DM.up?0:1;dummyScreen()};
 $$(".dmT").forEach(b=>b.onclick=()=>{DM.tab=b.dataset.t;dummyScreen()});
 $$(".dmC").forEach(b=>b.onclick=()=>{if(DM.deck.length<=5){toast("牌组至少 5 张");return}DM.deck.splice(+b.dataset.i,1);sfx("click");dummyScreen()});
 $$(".dmPick").forEach(b=>b.onclick=()=>{if(DM.deck.length>=40){toast("最多 40 张");return}DM.deck.push(b.dataset.k);sfx("click");const sc=$(".dmCards").scrollTop;dummyScreen();const c2=$(".dmCards");if(c2)c2.scrollTop=sc});
 $("#dmReset").onclick=()=>{DM.deck=starterDeck(DM.hero);dummyScreen()};
 $("#dmX").onclick=()=>{closeOv();titleScreen()};
 $("#dmGo").onclick=()=>dummyStart()}
function dummyStart(){try{DM.bak=localStorage.getItem("nwt-run")}catch(e){DM.bak=null}closeOv();const H=HEROES.find(h=>h.id===DM.hero)||HEROES[0];
 S={v:2,seed:1,rs:12345,uid:0,hp:H.hp,max:H.hp,gold:0,deck:DM.deck.map(id=>{const c=mk(id);if(DM.up&&upOK(c))c.u=1;return c}),relics:[],pots:[],potSlots:2,row:0,col:0,path:[],combats:5,elites:0,removeCost:75,stats:{kills:0,played:0,dmg:0,tri:0,gold:0},flags:{},evSeen:[],atBoss:false,cur:null,hero:DM.hero,diff:"normal",asc:0,mod:"",act:0,actCombats:9,lv:1,xp:0,perks:{},noSave:1,dummy:1,dummyAtk:DM.atk};
 S.sky=genSky();S.map=genMap();S.boss="king";S.pendGrp=["dummy"];DMS.reset();startCombat("m")}
const DMS={hist:[],cur:0,reset(){this.hist=[];this.cur=0}};
function dummyTurn(){const d=B.enemies.find(e=>e.id==="dummy");if(!d)return;if(B.turn>1){DMS.hist.push(d.max-d.hp)}d.hp=d.max;d.block=0;d.vuln=d.vuln||0}
function dummyHud(){let h=$("#dmHud");if(!h){h=document.createElement("div");h.id="dmHud";$("#battle").appendChild(h)}const d=B.enemies.find(e=>e.id==="dummy");const cur=d?d.max-d.hp:0;const hs=DMS.hist;const avg=hs.length?Math.round(hs.reduce((a,b)=>a+b,0)/hs.length):0;const best=Math.max(cur,...hs,0);
 h.innerHTML=`<b>木桩练习</b><span>这回合 <em>${cur}</em></span><span>平均每回合 <em>${avg}</em></span><span>最高 <em>${best}</em></span><span>已打 ${hs.length} 回合</span><button class="btn sm" id="dmEnd">结束练习</button>`;
 $("#dmEnd").onclick=()=>dummyEnd()}
function dummyEnd(){B=null;S=null;try{if(DM.bak)localStorage.setItem("nwt-run",DM.bak)}catch(e){}const h=$("#dmHud");if(h)h.remove();const bg=$("#bag");if(bg)bg.remove();closeOv();titleScreen();setTimeout(()=>dummyScreen(),50)}

/* ===================== 4.9 首领机制：每个首领一个「逼你换打法」的招 ===================== */
function bmHand(){return B&&B.hand?B.hand:[]}
const BM={
 bishop:{say:"孩子，替他们祷告吧。",tip:"每 3 回合往你手里塞一张「祷文」，留在手里回合结束会烫你 5 点，打掉它要花 1 奶力",chip:e=>e.pile?"":`祷文 ${2-((e.turn||0)%3)} 回合后`,act:async e=>{if((e.turn||0)%3===2&&!e.pile){B.hand.push(mk("prayer"));renderHand();toast("骸骨主教往你手里塞了一张<b>祷文</b>");sfx("debuff")}}},
 count:{say:"你的血，比你想得要甜。",tip:"每回合会把你这回合打它的伤害吸走 20% 回血。慢慢磨不划算，要一口气打",chip:e=>`血契：吸回你伤害的 20%`,act:async e=>{const h=Math.floor((e.turnDmg||0)*.2);if(h>0){e.hp=Math.min(e.max,e.hp+h);fxSay(e,"吸血 +"+h);renderBattle();await sleep(250)}}},
 witch:{say:"汪，变个小戏法给你看。",tip:"每 3 回合把你一张手牌变成「青蛙」（这回合没用），回合结束变回来",chip:e=>{const n=2-((e.turn||0)%3);return n?`变形术 ${n} 回合后`:"这回合会变你一张牌"}},
 buddha:{say:"金身不坏。你那点力气，挠痒痒。",tip:"护盾很厚。但一下打出 15 点以上，会敲出裂缝：它晕一回合",chip:e=>`一下 ≥15 能敲裂金身`},
 tophat:{say:"失礼，借你的牌一用。",tip:"每 2 回合从你手里偷走最贵的一张牌放进帽子。一回合打它 20 点就能抢回来",chip:e=>e.hat?`帽子里：${CARDS[e.hat.id].n}（${Math.min(e.turnDmg||0,20)}/20 抢回）`:`会偷你的牌`,hit:(e,l)=>{if(e.hat&&(e.turnDmg||0)>=20){bmHand().push(e.hat);toast(`抢回了 <b>${CARDS[e.hat.id].n}</b>`);e.hat=null;renderHand()}}},
 thunderking:{say:"雷，攒着呢。",tip:"每回合蓄 1 层雷，满 4 层劈下 25 点。你一回合打出 3 张技能牌，能让它放电失败、清空雷",chip:e=>`蓄雷 ${e.thunder||0}/4 · 技能牌 ${Math.min(3,B?B.sklN||0:0)}/3 可泄掉`,act:async e=>{if((B.sklN||0)>=3&&e.thunder){e.thunder=0;fxSay(e,"放电失败！");toast("你打出 3 张技能牌：雷霆奶蛙王<b>放电失败</b>");renderBattle();await sleep(250);return}e.thunder=(e.thunder||0)+1;if(e.thunder>=4){e.thunder=0;banner("天雷",1);stageShake();dmgPlayer(25+(e.str||0),e);renderBattle();await sleep(400)}}},
 iceking:{say:"冰不会化的。",tip:"每回合冻住你最左边的一张手牌，这回合打不出去",chip:e=>`冻住你最左边的手牌`},
 bloodbeast:{say:"……我闻到血了。",tip:"你每少 10% 的血，它力气 +1。尽量别让自己掉太多血",chip:e=>`嗅血：力气 +${e.smell||0}`,act:async e=>{const sm=Math.floor((S.max-S.hp)/S.max*10);e.str=(e.str||0)-(e.smell||0)+sm;e.smell=sm}},
 snowking:{say:"越滚越大——",tip:"每回合雪球变大一圈（力气 +1），被你打中一下就缩回一圈。每回合都要打它",chip:e=>`雪球 ${e.ball||0} 层`,act:async e=>{e.ball=(e.ball||0)+1;e.str=(e.str||0)+1;fxSay(e,"又大了一圈");renderBattle()},hit:(e,l)=>{if((e.ball||0)>0&&B.curType&&B.lastShrink!==B.played){B.lastShrink=B.played;e.ball--;e.str=(e.str||0)-1;fxSay(e,"缩了一圈")}}},
 lavagiant:{say:"地板，烫起来！",tip:"每回合把你池里一只奶蛙变成岩浆块；回合开始时，池里每块岩浆烫你 2 点。快点把池子消掉",chip:e=>`池里岩浆 ${B?B.pool.filter(x=>x.lava).length:0} 块`,act:async e=>{const l=B.pool.filter(x=>!x.ice&&x.f!=="mud");if(l.length){const x=pick(l);x.f="mud";x.lava=1;renderPool();toast("熔岩巨无霸把池里一只奶蛙变成了<b>岩浆块</b>")}}},
 pearlqueen:{say:"杯子们，挡着我。",tip:"场上还有奶茶杯时，奶茶壶不会受伤。先把杯子打掉",chip:e=>B&&B.alive().some(x=>x.id==="teacup")?"杯子护着它：打不动":"没有杯子了，快打！"},
 boilerdragon:{say:"压力，在涨。",tip:"热度满了会大爆炸。打技能牌能给它降温"},
 fourhead:{say:"四个头，一人一口。",tip:"醒着几个头，一回合就出手几次；每打掉它四分之一的血，就睡着一个头"},
 general:{say:"举盾。你敢打，我就敢还。",tip:"它要防御的回合（头上是盾），你每打它一下，它都反击你 4 点。那回合先停手堆盾",chip:e=>e.intent&&(e.intent.k==="def"||e.intent.k==="atkdef")?"反击架势！先别打":"",hit:(e,l)=>{if(e.intent&&(e.intent.k==="def"||e.intent.k==="atkdef")&&B.curType&&B.myTurn){setTimeout(()=>{if(!B||B.over)return;fxSay(e,"反击 4");dmgPlayer(4,e,true);renderBattle();if(S.hp<=0)lose()},150)}}},
 shadow:{say:"你出什么，我就学什么。",tip:"它会模仿你上回合打出的第一张牌：你先出攻击，它就多砍一刀；你先出技能，它就加 15 护盾",chip:e=>B&&B.lastFirst?`学你上回合：${B.lastFirst==="atk"?"多砍一刀":"加护盾"}`:"会学你出牌",act:async e=>{if(e.fake)return;if(B.firstC==="atk"){fxSay(e,"学你的");dmgPlayer(8+(e.str||0),e);renderBattle();await sleep(300)}else if(B.firstC){e.block+=15;fxSay(e,"学你的：护盾 +15");renderBattle()}}},
 fallen:{say:"上天有一杆秤。",tip:"每回合比一比：你打它多，还是它打你多。谁多，谁下回合力气 +2",chip:e=>`审判之秤 你 ${e.turnDmg||0} : 它 ${e.dealt||0}`,act:async e=>{const a=e.turnDmg||0,b=e.dealt||0;if(a>b){B.p.tstrNext=(B.p.tstrNext||0)+2;fxSay(e,"秤歪向了你");toast("审判之秤：你打得更多，下回合<b>力气 +2</b>")}else if(b>a){e.str=(e.str||0)+2;fxSay(e,"秤歪向了我");toast("审判之秤：它打得更多，<b>它力气 +2</b>")}e.dealt=0}},
 cosmicegg:{say:"咔……",tip:"孵化之前，它受到的伤害翻倍。趁它还是蛋，尽量多打",chip:e=>e.form2?"已孵化":"蛋壳：受到伤害 ×2"},
 demon:{say:"你最爱用的那一招……我也会。",tip:"它会学你这场打得最多的那张攻击牌，每回合用它多打你一下",chip:e=>{const c=bmTop();return c&&c[1]>=2?`学会了：${CARDS[c[0]].n}`:"在看你出牌"},act:async e=>{const c=bmTop();if(c&&c[1]>=2){const v=Math.min(30,6+c[1]*2);fxSay(e,"「"+CARDS[c[0]].n+"」");dmgPlayer(v+(e.str||0),e);renderBattle();await sleep(300)}}},
 abyssdragon:{say:"潮水要来了。",tip:"每 3 回合涨一次潮，把你池里的奶蛙全部卷走。赶在涨潮前消掉",chip:e=>`涨潮 ${(e.turn||0)%3===2?"就在这回合":(2-((e.turn||0)%3))+" 回合后"}`,act:async e=>{if((e.turn||0)%3===2&&B.pool.length){const n=B.poolClear();toast(`涨潮了：卷走了池里 <b>${n}</b> 只奶蛙`);sfx("mud")}}}};
function bmTop(){const pc=B&&B.pc||{};const l=Object.entries(pc).filter(([k])=>CARDS[k]&&CARDS[k].type==="atk").sort((a,b)=>b[1]-a[1]);return l[0]||null}
function bmStart(){if(!B||B.over||!B.myTurn)return;const al=B.alive();const p=B.p;if(p.tstrNext){p.tstr=(p.tstr||0)+p.tstrNext;p.tstrNext=0}
 const lv=B.pool.filter(x=>x.lava).length;if(lv&&al.some(e=>e.id==="lavagiant")){dmgPlayer(lv*2,null,true);toast(`池里的岩浆烫了你 <b>${lv*2}</b> 点`);if(S.hp<=0)return lose()}
 const ice=al.find(e=>e.id==="iceking");if(ice&&B.hand.length){const c=B.hand[0];c.frz=1;toast(`冰封奶蛙王冻住了你的「<b>${CARDS[c.id].n}</b>」`);sfx("debuff")}
 const w=al.find(e=>e.id==="witch");if(w&&(w.turn||0)%3===2){const l=B.hand.filter(c=>!["cur","sts"].includes(CARDS[c.id].type)&&!c.frog);if(l.length){const c=pick(l);c.frog=c.id;c.id="frogged";toast("古堡女巫把你一张牌变成了<b>青蛙</b>");sfx("debuff")}}
 const th=al.find(e=>e.id==="tophat");if(th&&!th.hat&&(th.turn||0)%2===1&&B.hand.length){const l=[...B.hand].filter(c=>!["cur","sts"].includes(CARDS[c.id].type)).sort((a,b)=>baseCost(b)-baseCost(a));if(l[0]){th.hat=l[0];B.hand.splice(B.hand.indexOf(l[0]),1);toast(`礼帽先生偷走了你的「<b>${CARDS[l[0].id].n}</b>」`);sfx("debuff")}}
 renderHand();renderBattle()}

/* ===================== 4.9 路遇：每层多一步，遇到同行的奶蛙 ===================== */
const COMP={
 fire:{n:"小火",img:"hr",why:"找三年前上塔的哥哥",beats:["c_fire0","c_fire1","c_fire2","c_fire3","c_fire4"]},
 blue:{n:"阿蓝",img:"ct",why:"躲债，也想在塔顶赢一把大的",beats:["c_blue0","c_blue1","c_blue2","c_blue3","c_blue4"]},
 iron:{n:"老铁",img:"dgt",why:"年轻时没爬上去，想再试一次",beats:["c_iron0","c_iron1","c_iron2","c_iron3","c_iron4"]},
 seven:{n:"小七的足迹",img:"i5",why:"七年前上塔没回来的小七，留下了一路痕迹",beats:["c_seven0","c_seven1","c_seven2","c_seven3","c_seven4"]}};
function storyNode(){const a=S.act||0;if(!S.comp){const ks=Object.keys(COMP);const seen=M.compSeen||[];const fresh=ks.filter(k=>!seen.includes(k));const id=pick(fresh.length?fresh:ks);S.comp={id,done:-1,alive:1,rel:0,gone:0};M.compSeen=[...seen.filter(x=>x!==id),id].slice(-3);saveMeta()}
 const C=COMP[S.comp.id];if(!S.comp.gone&&S.comp.done<a&&C.beats[a]){S.comp.done=a;saveRun();return eventScreen(C.beats[a])}
 const mq=Object.keys(EVENTS).filter(k=>/^mq_/.test(k));if((!S.mside||S.mside.done)&&mq.length)return eventScreen(pick(mq));eventScreen()}
const cp=()=>S.comp||{};
Object.assign(EVENTS,{
 c_fire0:{story:1,n:"背大包的小奶马",img:"hr",t:"路边坐着一只背着大包的小奶马，包比它人还大。「我叫小火。我哥三年前上了塔，再也没下来。大家都说他回不来了……我不信。」它抬头看你：「你也要上去吧？」",o:()=>[
  {t:"一起走吧",d:"小火会和你同行，每层都会再遇到它",f:()=>{cp().rel=1;return"它一下子站起来，包差点把它带倒。「说好了！到了塔顶，我请你喝奶茶！」"}},
  {t:"各走各的",d:"这段故事就到这里",f:()=>{cp().gone=1;return"它点点头，又坐了回去，把包抱得更紧了一点。"}}]},
 c_fire1:{story:1,n:"画像上的围巾",img:"hr",t:"古堡的走廊里，小火盯着一幅画像不动。画像里的奶马，脖子上围着一条红围巾。「这是我哥的！我织的，针脚歪歪扭扭的那条！」画框后面好像有一道暗门。",o:()=>[
  {t:"陪它撬开暗门",d:"<span class='bad'>失去 8 生命</span>（门后有机关），小火更信任你了",f:()=>{S.hp=Math.max(1,S.hp-8);cp().rel++;cp().clue=1;return"暗门后面是一间小屋，墙上用蹄子划着一行字：「往上，冰的下面。」小火把围巾围在了自己脖子上。"}},
  {t:"劝它别冒险",d:"什么都不发生",f:()=>"小火看了画像很久，最后还是跟你走了。走出很远，它还在回头。"}]},
 c_fire2:{story:1,n:"冰里的小火",img:"hr",t:()=>cp().alive?"钟楼外的雪地上，你看见一块奇怪的冰——小火被冻在里面，眼睛还睁着，脖子上那条红围巾露在外面。它是为了看清冰下面的东西，趴得太久了。":"雪地上很安静。",o:()=>[
  {t:"用体温把冰焐化",d:"<span class='bad'>失去最大生命的 15%</span>，救出小火",f:()=>{const l=Math.floor(S.max*.15);S.hp=Math.max(1,S.hp-l);cp().rel++;return"你抱着那块冰坐了一整夜。天亮的时候，小火打了个喷嚏：「……我看见了。冰下面有一条路，通往奶茶厂。」"}},
  {t:"花 60 金币买火炭",d:"<span class='bad'>-60 金币</span>，救出小火",ok:S.gold>=60,f:()=>{S.gold-=60;return"火炭噼啪作响，冰一点点化开。小火缩成一团发抖：「谢、谢谢……冰下面，有路。」"}},
  {t:"来不及了，继续往上",d:"<span class='bad'>小火会留在这里</span>",f:()=>{cp().alive=0;return"你把那条红围巾从冰里抽出来，收进了包里。"}}]},
 c_fire3:{story:1,n:"奶茶厂的苦工",img:"hr",t:()=>cp().alive?"小火在传送带边停住了。一只瘦得皮包骨的大奶马正在搬箱子，脖子上有一道围巾勒过的旧印子。「……哥？」大奶马手里的箱子掉在了地上。":"传送带边，一只瘦瘦的大奶马在搬箱子。你认出了它脖子上的旧印子——和那条红围巾的宽度一模一样。",o:()=>cp().alive?[
  {t:"帮兄弟俩逃出去",d:"<span class='bad'>失去 15 生命</span>（拖住看守）",f:()=>{S.hp=Math.max(1,S.hp-15);cp().freed=1;return"你冲上去撞翻了看守。兄弟俩抱在一起哭了一路，跑得比谁都快。"}},
  {t:"花 100 金币赎人",d:"<span class='bad'>-100 金币</span>",ok:S.gold>=100,f:()=>{S.gold-=100;cp().freed=1;return"工头数着钱，不耐烦地挥挥手。大奶马愣愣地看着你：「你是……我弟弟的朋友？」"}},
  {t:"现在顾不上",d:"<span class='bad'>小火会留下来陪哥哥</span>",f:()=>{cp().gone=1;return"小火说：「我留下来。我们一起想办法。」它把围巾解下来，系在了哥哥脖子上。"}}]:[
  {t:"把红围巾交给它",d:"<span class='good'>+1 记忆碎片</span>",f:()=>{M.shards=(M.shards||0)+1;saveMeta();return"大奶马捧着围巾，看了很久很久。它没有哭，只是把围巾围上，继续搬箱子了。"}},
  {t:"什么都不说",d:"什么都不发生",f:()=>"你走过去的时候，它抬头看了你一眼。"}]},
 c_fire4:{story:1,n:"兄弟俩",img:"hr",t:()=>cp().freed?"星空之顶的台阶下，小火和哥哥在等你。哥哥脖子上围着那条歪歪扭扭的红围巾。「我们不上去了。」小火说，「塔顶留给你。这个给你——我哥年轻时候的护身符。」":"星空之顶很冷。你想起那个说要请你喝奶茶的小奶马。",o:()=>cp().freed?[
  {t:"收下护身符",d:"<span class='good'>获得遗物「兄弟护符」</span>：受到致命伤时留住 1 点生命（一局一次）",f:()=>{gainRelic("comp_amulet");return"「到了塔顶，替我们看一眼。」兄弟俩挥着手，越来越小。"}}]:[
  {t:"继续往上",d:"",f:()=>"你把手伸进包里，摸到了什么软软的东西。"}]},
 c_blue0:{story:1,n:"输光了的奶猫",img:"ct",t:"一只蓝色的奶猫蹲在路边，面前摊着一副骰子，兜比脸还干净。「嘿，朋友！借我 30，翻倍还你！我叫阿蓝，塔里认识我的都知道我讲信用——」它的耳朵心虚地抖了抖。",o:()=>[
  {t:"借它 30 金币",d:"<span class='bad'>-30 金币</span>，阿蓝会和你同行",ok:S.gold>=30,f:()=>{S.gold-=30;cp().rel=1;cp().lent=1;return"「仗义！」它把钱揣进兜里，「我欠债欠得满塔都是，一个个躲着呢。跟着你，安全！」"}},
  {t:"不借",d:"阿蓝还是会跟着你",f:()=>"「小气……算了，我跟着你走，顺路。」"}]},
 c_blue1:{story:1,n:"银勺子",img:"ct",t:"古堡的餐厅里，阿蓝从桌上顺了一把银勺子，正往兜里塞。「嘘——伯爵那么有钱，少一把勺子他不会发现的！」",o:()=>[
  {t:"帮它望风",d:"<span class='good'>+40 金币</span>（它分你一半）",f:()=>{S.gold+=40;return"你们卖掉了勺子。阿蓝数钱的时候，手有点抖：「其实……我也不想这样。」"}},
  {t:"让它放回去",d:"<span class='good'>+3 经验</span>，阿蓝更信任你了",f:async()=>{cp().rel++;await gainXP(3);return"它磨磨蹭蹭地把勺子放回去了。「你跟我妈说话一个样。」它小声说。"}}]},
 c_blue2:{story:1,n:"阿蓝的围巾",img:"ct",t:"冰原上风很大。阿蓝把自己唯一的围巾解下来，塞到你手里：「你比我怕冷。别还我，我皮厚。」它说完就打了个大喷嚏。",o:()=>[
  {t:"收下",d:"<span class='good'>最大生命 +4</span>",f:()=>{S.max+=4;S.hp+=4;return"围巾上有一股奶茶味。"}},
  {t:"还给它",d:"阿蓝更信任你了",f:()=>{cp().rel++;return"「……傻子。」它把围巾围回去，往你身边挤了挤。"}}]},
 c_blue3:{story:1,n:"债主来了",img:"ct",t:"奶茶厂门口，几只壮实的奶狗把阿蓝按在墙上：「欠了三年的钱，今天要么还，要么进厂里搬一辈子箱子！」阿蓝看着你，没有喊救命。",o:()=>[
  {t:"替它还 100 金币",d:"<span class='bad'>-100 金币</span>",ok:S.gold>=100,f:()=>{S.gold-=100;cp().freed=1;return"奶狗们拿钱走了。阿蓝坐在地上，半天没说话，最后憋出一句：「我会还你的。真的。」"}},
  {t:"打晕它们",d:"<span class='bad'>失去 12 生命</span>",f:()=>{S.hp=Math.max(1,S.hp-12);cp().freed=1;return"你们一路跑到楼梯口才停下。阿蓝笑得喘不上气：「刺激！太刺激了！」"}},
  {t:"这是它自己的事",d:"<span class='bad'>阿蓝会被抓进奶茶厂</span>",f:()=>{cp().gone=1;return"你听见身后阿蓝喊了一声：「没事！我搬箱子可快了！」声音有点哑。"}}]},
 c_blue4:{story:1,n:"阿蓝的骰子",img:"ct",t:"星空之顶的台阶下，阿蓝在等你。「我不上去了，我这种人，到了塔顶也是赌。」它把那副骰子塞给你，「这对骰子从来没让我赢过。给你，你运气好。」",o:()=>[
  {t:"收下骰子",d:"<span class='good'>获得遗物「幸运骰子」</span>：每场战斗多 10 金币",f:()=>{gainRelic("comp_dice");return"「对了，那 30 块——」它挠挠头，「下次一定。」"}}]},
 c_iron0:{story:1,n:"老骑士奶狗",img:"dgt",t:"一只白了胡子的老奶狗拄着剑坐在台阶上喘气。「年轻时爬到第三层就下去了，怕。」它笑了笑，「现在不怕了，就是腿不听使唤。叫我老铁吧。」",o:()=>[
  {t:"一起走",d:"老铁会和你同行",f:()=>{cp().rel=1;return"「好嘞。」它扶着剑站起来，「走慢点，等等老头子。」"}},
  {t:"劝它回家",d:"<span class='good'>+30 金币</span>（它硬塞给你的路费）",f:()=>{cp().gone=1;S.gold+=30;return"「也是，也是。」它把钱塞给你，「替我看看塔顶长什么样。」"}}]},
 c_iron1:{story:1,n:"老铁教你一招",img:"dgt",t:"古堡的院子里，老铁让你站好：「出拳的时候，腰要转过来。不对，再来。」它一遍遍地纠正你，像在教很多年前的自己。",o:()=>[
  {t:"认真学",d:"<span class='good'>升级一张牌</span>",f:async()=>{await upgradePick();cp().rel++;return"「对喽。」老铁点点头，「比我当年强。」"}}]},
 c_iron2:{story:1,n:"冻伤的腿",img:"dgt",t:"冰原上，老铁的腿冻得发紫，走一步停三步。「别管我，你先走。」它说。",o:()=>[
  {t:"陪它歇一会儿",d:"<span class='good'>回复 10 生命</span>，老铁更信任你了",f:()=>{S.hp=Math.min(S.max,S.hp+10);cp().rel++;return"你们靠着一块石头，看了很久的雪。老铁讲了它年轻时候的事，讲着讲着睡着了。"}},
  {t:"背它走一段",d:"<span class='bad'>失去 6 生命</span>，<span class='good'>最大生命 +5</span>",f:()=>{S.hp=Math.max(1,S.hp-6);S.max+=5;return"老铁在你背上嘟囔：「丢人，丢人……」可它一直没下来。"}}]},
 c_iron3:{story:1,n:"挡在前面",img:"dgt",t:"奶茶厂的锅炉突然炸开，滚烫的奶茶泼过来——老铁一把把你推开，自己挡在前面。它的盔甲烫得通红。",o:()=>[
  {t:"扶住它",d:"<span class='good'>最大生命 +5</span>",f:()=>{S.max+=5;S.hp+=5;return"「没事，没事，」老铁咧嘴笑，「这身铁皮，就是干这个用的。」"}}]},
 c_iron4:{story:1,n:"老铁的佩剑",img:"dgt",t:"星空之顶的台阶下，老铁坐了下来，再也站不起来了。「我就到这儿了。比上次高。」它把那把旧剑递给你，「剑是好剑，人老了。替我上去。」",o:()=>[
  {t:"接过佩剑",d:"<span class='good'>获得遗物「老铁的佩剑」</span>：每场战斗开始力气 +1",f:()=>{gainRelic("comp_sword");return"你回头的时候，老铁靠着栏杆，在看星星。"}}]},
 c_seven0:{story:1,n:"一颗纽扣",img:"i5",t:"泥沼的草丛里有一颗小小的布纽扣，上面绣着一个歪歪的「七」。长老说过，七年前，村里的小七一个人上了塔，再也没回来。",o:()=>[
  {t:"收好",d:"你会在塔里继续找到小七留下的痕迹",f:()=>{cp().rel=1;return"纽扣很旧了，但洗得很干净。"}}]},
 c_seven1:{story:1,n:"墙上的刻痕",img:"i5",t:"古堡的墙上刻着一行字：「小七到此一游」。旁边还有一串刻痕，一道一道，像是在数日子。数到第四十几道，就没有了。",o:()=>[
  {t:"在旁边刻上自己的名字",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"你刻完，退后一步看。两行字挨在一起，像是一起来过。"}}]},
 c_seven2:{story:1,n:"冰里的纸条",img:"i5",t:"一块冰里冻着一张纸条，字迹歪歪扭扭：「冷。想吃长老煮的粥。不想回去，回去就上不来了。」",o:()=>[
  {t:"把纸条收起来",d:"<span class='good'>回复 8 生命</span>（你也想起了长老的粥）",f:()=>{S.hp=Math.min(S.max,S.hp+8);return"你把纸条和那颗纽扣放在一起。"}}]},
 c_seven3:{story:1,n:"苦工名单",img:"i5",t:"奶茶厂的墙上贴着一张苦工名单。「七号」那一行被一道红线划掉了，旁边写着：「跑了。往上跑的。」",o:()=>[
  {t:"花 20 金币问工头",d:"<span class='bad'>-20 金币</span>",ok:S.gold>=20,f:()=>{S.gold-=20;cp().know=1;return"工头说：「那小子？跑的时候还回头冲我做鬼脸。往上，一直往上。」"}},
  {t:"继续往上",d:"",f:()=>"红线很新。"}]},
 c_seven4:{story:1,n:"数星星的小奶蛙",img:"i5",t:"星空之顶的台阶上，坐着一只小小的奶蛙，在数星星。它的衣服上少了一颗纽扣。它回过头：「……你是从村里来的吗？长老，还好吗？」",o:()=>[
  {t:"「长老一直在等你。」",d:"<span class='good'>获得遗物「小七的布娃娃」</span>：每场战斗开始回复 5 生命",f:()=>{gainRelic("comp_doll");return"小七哭了，哭完把布娃娃塞给你：「你先替我拿着。等你下来，我们一起回家。」"}}]}});

/* ===================== 4.10 抽卡包：每天 2 包，打通大魔王再加 1 包；抽到的牌解锁图鉴 ===================== */
function packDay(){const d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function packState(){M.pk=M.pk||{d:"",n:0,bonus:0,dust:0,total:0};if(M.pk.d!==packDay()){M.pk.d=packDay();M.pk.n=0}return M.pk}
function packLeft(){const k=packState();return Math.max(0,2-k.n)+(k.bonus||0)}
const PK_DUST={S:1,C:1,X:2,P:2,R:2,E:4,L:8,Q:8};
function packRoll(){const got=M.got||{};const base=[...POOL_HERO,...POOL_X].filter(k=>CARDS[k]);const by=r=>base.filter(k=>CARDS[k].r===r);const C=[...by("C"),...by("S")],R=[...by("R"),...by("X")],E=by("E"),L=by("L"),Q=by("Q"),P=POOL_PAL.filter(k=>CARDS[k]);
 const fresh=l=>{const f=l.filter(k=>!got[k]);return f.length&&rnd()<.55?f:l};const out=[];const take=l=>{let id,g=0;do{id=pick(fresh(l))}while(out.includes(id)&&g++<20);out.push(id)};
 take(C);take(C);take(rnd()<.12&&P.length?P:C);take(rnd()<.45?R:C);
 {const x=rnd();take(x<.03&&Q.length?Q:x<.11&&L.length?L:x<.40&&E.length?E:R)}
 return out.map(id=>({id,sh:rnd()<.05?pick(Object.keys(SHINY)):null}))}
function packScreen(){let el=$("#gacha");if(el)el.remove();el=document.createElement("div");el.id="gacha";$("#stage").appendChild(el);const left=packLeft();const k=packState();
 const all=[...POOL_HERO,...POOL_X,...POOL_PAL].filter(x=>CARDS[x]);const have=all.filter(x=>(M.got||{})[x]).length;
 el.innerHTML=`<div class="gpSky">${Array.from({length:40},(_,i)=>`<i style="left:${(i*137)%100}%;top:${(i*61)%100}%;animation-delay:${(i%7)*.5}s"></i>`).join("")}</div>
 <button class="gpX" id="gpX">×</button>
 <div class="gpInfo"><b>图鉴 ${have} / ${all.length}</b><span>星尘 ${k.dust||0} / 10</span></div>
 <div class="gpStage"><div class="gpPack ${left?"":"empty"}" id="gpPack">${packHTML()}</div></div>
 <div class="gpFoot">${left?`<b class="gpN">今天还能撕 <em>${left}</em> 包</b>`:`<b class="gpN">今天的卡包撕完了</b><small>明天再来，每天 2 包 · 打通大魔王再多 1 包</small>`}</div>`;
 $("#gpX").onclick=()=>{el.remove();titleScreen()};
 const pk=$("#gpPack");pk.onpointermove=e=>{if(pk.classList.contains("tearing")||document.documentElement.classList.contains("lite"))return;const r=pk.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;pk.style.setProperty("--ry",(x*26).toFixed(1)+"deg");pk.style.setProperty("--rx",(-y*18).toFixed(1)+"deg")};pk.onpointerleave=()=>{pk.style.setProperty("--ry","0deg");pk.style.setProperty("--rx","0deg")};
 if(left)pk.onclick=()=>packTear()}
function packHTML(){return`<div class="gpTop"><i class="gpZig"></i><span>NAIWA TOWER</span></div><div class="gpSeam"><i class="gpSlit"></i><u class="gpArrow">➜</u></div><div class="gpBody"><i class="gpMoon"></i><i class="gpTower"></i><img class="gpArt" src="${IMG("nw")}" draggable="false"><b class="gpLogo">奶蛙之塔</b><small class="gpSub">卡包 · 5 张</small><i class="gpSheen"></i></div>`}
function packTear(){const el=$("#gacha"),pk=$("#gpPack");if(!pk||pk.classList.contains("tearing"))return;pk.onclick=null;pk.classList.add("tearing");pk.style.setProperty("--ry","0deg");pk.style.setProperty("--rx","0deg");el.classList.add("tearMode");sfx("click");
 const seam=pk.querySelector(".gpSeam"),top=pk.querySelector(".gpTop"),slit=pk.querySelector(".gpSlit");let down=false,p=0,done=false;
 const setP=v=>{p=Math.max(p,Math.min(1,v));slit.style.width=(p*100)+"%";top.style.transform=`rotate(${-p*10}deg) translateY(${-p*14}px)`;top.style.transformOrigin="100% 100%"};
 const pos=e=>{const r=pk.getBoundingClientRect();return(e.clientX-r.left)/r.width};
 const finish=()=>{if(done)return;done=true;try{sxPlay("whoosh",.7,1.3);sxPlay("slash",.5,1.2,.03)}catch(e){}top.style.transition="transform .5s cubic-bezier(.3,.6,.4,1),opacity .5s";top.style.transform="translate(120px,-260px) rotate(38deg)";top.style.opacity="0";seam.style.opacity="0";const fl=document.createElement("i");fl.className="gpFlash";el.appendChild(fl);setTimeout(()=>fl.remove(),600);setTimeout(()=>packOpen(),520)};
 pk.onpointerdown=e=>{down=true;try{pk.setPointerCapture(e.pointerId)}catch(x){}setP(Math.max(.04,pos(e)*.3))};
 pk.onpointermove=e=>{if(!down||done)return;setP(pos(e));if(p>=.82)finish()};
 pk.onpointerup=pk.onpointercancel=()=>{down=false;if(done)return;if(p>=.5)return finish();let v=p;const tm=setInterval(()=>{v+=.09;setP(v);if(v>=1){clearInterval(tm);finish()}},22)}}
function packOpen(){const el=$("#gacha");if(!el)return;const k=packState();if(Math.max(0,2-k.n)>0)k.n++;else if(k.bonus>0)k.bonus--;else return packScreen();k.total=(k.total||0)+1;
 const cards=packRoll();let dust=0;const all=[...POOL_HERO,...POOL_X,...POOL_PAL];cards.forEach(c=>{c.isNew=!(M.got||{})[c.id];if(c.isNew)gotCard(c.id);else dust+=PK_DUST[CARDS[c.id].r]||1;seeCard(c.id);if(c.sh){try{shinyRec({id:c.id,sh:c.sh})}catch(e){}}});
 k.dust=(k.dust||0)+dust;let sh=0;while(k.dust>=10){k.dust-=10;sh++}if(sh){M.shards=(M.shards||0)+sh;M.shardsAll=(M.shardsAll||0)+sh}saveMeta();try{CLOUD.up&&setTimeout(()=>CLOUD.up(true),800)}catch(e){}
 const strip=x=>String(x).replace(/<[^>]+>/g,"");const front=c=>tcgHTML(c.id,false,c.sh?{}:null,all.indexOf(c.id),strip(CARDS[c.id].d(0)));
 const pk=$("#gpPack");if(pk)pk.classList.add("spent");
 const st=el.querySelector(".gpStage");const box=document.createElement("div");box.className="gpCards";box.innerHTML=cards.map((c,i)=>`<div class="gpCard r-${CARDS[c.id].r}${c.sh?" sh":""}" data-i="${i}" style="--i:${i};z-index:${10-i}"><div class="gpFlip"><div class="gpBack"><i></i><b>奶蛙之塔</b></div><div class="gpFront">${front(c)}${c.isNew?`<em class="gpNew">NEW</em>`:""}</div></div></div>`).join("");st.appendChild(box);
 el.querySelector(".gpFoot").innerHTML="";let cur=0;
 const next=()=>{const cd=box.querySelector(`.gpCard[data-i="${cur}"]`);if(!cd)return;const c=cards[cur],r=CARDS[c.id].r;
  if(!cd.classList.contains("open")){cd.classList.add("open");const big=["E","L","Q"].includes(r)||c.sh;try{sfx(big?"levelup":r==="R"||r==="X"?"relic":"click")}catch(e){}if(big){const g=document.createElement("i");g.className="gpBurst";g.style.setProperty("--c",r==="L"||r==="Q"?"#ffd23f":c.sh?"#9fe8ff":"#b98cff");cd.appendChild(g);setTimeout(()=>g.remove(),900)}return}
  cd.classList.add("gone");cur++;if(cur>=cards.length)setTimeout(()=>packSummary(cards,dust,sh),350);else{const nx=box.querySelector(`.gpCard[data-i="${cur}"]`);if(nx)nx.classList.add("top")}};
 box.querySelector('.gpCard[data-i="0"]').classList.add("top");box.onclick=next;setTimeout(()=>box.classList.add("in"),30)}
function packSummary(cards,dust,sh){const el=$("#gacha");if(!el)return;const all=[...POOL_HERO,...POOL_X,...POOL_PAL];const strip=x=>String(x).replace(/<[^>]+>/g,"");const left=packLeft();const k=packState();
 const st=el.querySelector(".gpStage");st.innerHTML=`<div class="gpSum">${cards.map((c,i)=>`<div class="gpS r-${CARDS[c.id].r}" style="--i:${i}" data-id="${c.id}">${tcgHTML(c.id,false,c.sh?{}:null,all.indexOf(c.id),strip(CARDS[c.id].d(0)))}${c.isNew?`<em class="gpNew">NEW</em>`:`<em class="gpDup">重复</em>`}${c.sh?`<em class="gpSh">闪</em>`:""}</div>`).join("")}</div>`;
 const nNew=cards.filter(c=>c.isNew).length;
 el.querySelector(".gpFoot").innerHTML=`<b class="gpN">新卡 <em>${nNew}</em> 张${dust?`　重复的化成星尘 +${dust}${sh?`，换到 <em>${sh}</em> 个记忆碎片`:`（${k.dust}/10 换 1 个记忆碎片）`}`:""}</b><div class="gpBtns">${left?`<button class="btn" id="gpAgain">再撕一包（还有 ${left} 包）</button>`:""}<button class="btn ghost" id="gpBack">返回</button></div>`;
 const have=all.filter(x=>CARDS[x]&&(M.got||{})[x]).length;const inf=el.querySelector(".gpInfo");if(inf)inf.innerHTML=`<b>图鉴 ${have} / ${all.filter(x=>CARDS[x]).length}</b><span>星尘 ${k.dust||0} / 10</span>`;
 if(left)$("#gpAgain").onclick=()=>{packScreen();setTimeout(()=>packTear(),60)};$("#gpBack").onclick=()=>packScreen();
 st.querySelectorAll(".gpS").forEach(c=>c.onclick=()=>{try{cardReveal([c.dataset.id],0)}catch(e){}})}
