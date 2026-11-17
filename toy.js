/* ===================== B站 Toy 平台适配 =====================
   云存档：toy.getCloudStorage / toy.setCloudStorage（抓奶蛙已验证）
   成就全服统计：平台「共享存档」，接口名自动检测；不可用时只显示本地数据
   没有平台（直接打开网页）时全部自动跳过，游戏照常运行 */
const TOY={ok:false,
 async wait(){if(!window.toy&&!document.querySelector('script[src*="toy-sdk"]'))return(this.ok=false);for(let i=0;i<60&&!window.toy;i++)await new Promise(r=>setTimeout(r,300));this.ok=!!window.toy;
  if(this.ok){try{if(toy.setContainerMode)toy.setContainerMode({orientation:"landscape"})}catch(e){}}return this.ok},
 keys(){const t=window.toy;if(!t)return[];const s=new Set();let o=t;for(let i=0;i<3&&o;i++){try{Object.getOwnPropertyNames(o).forEach(k=>s.add(k))}catch(e){}o=Object.getPrototypeOf(o)}return[...s].filter(k=>{try{return typeof t[k]==="function"&&k!=="constructor"}catch(e){return false}})},
 fn(list,re){const t=window.toy;if(!t)return null;for(const n of list)if(typeof t[n]==="function")return n;return re?this.keys().find(k=>re.test(k))||null:null},
 lim(e){return !!(e&&(e.code===307044||String(e.message||"").indexOf("307044")>=0))},
 timeout(p,ms){return Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error("timeout")),ms))])}};

/* ---------- 存档保护 ----------
   1) 进度比较按「进度量」而不是保存时间：新设备 / 缓存被清时的空进度，永远不会盖掉云端
   2) 本地再存一份 IndexedDB 备份：localStorage 被清了也能找回
   3) 云存档连接失败会重试；关键节点几秒内就上传；切后台 / 关闭时立刻上传 */
function nwProg(m){if(!m)return 0;const n=o=>o&&typeof o==="object"?Object.keys(o).length:0;let p=(m.runs||0)*10+(m.deaths||0)*10+(m.wins||0)*50+n(m.got)*2+n(m.ach)*5+n(m.boss)*5+(m.shardsAll||0)+(m.kills||0)/10;try{Object.values(m.mast||{}).forEach(v=>p+=(+v||0)/5)}catch(e){}return Math.round(p)}
const NWB={t:0,
 open(){return new Promise((res,rej)=>{try{const r=indexedDB.open("nwt-backup",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})},
 // 要存的东西：进度 m、这一局 s（局外为 null）
 snap(){let m=null,s=null;try{m=JSON.stringify(M)}catch(e){}try{s=(typeof S!=="undefined"&&S&&!S.noSave)?JSON.stringify(S):(typeof S!=="undefined"&&!S?null:(window.__nwbRun||localStorage.getItem("nwt-run")))}catch(e){s=window.__nwbRun||null}if(!m)try{m=localStorage.getItem("nwt-meta")}catch(e){}return m?{t:Date.now(),m,s}:null},
 // 备份写两处：IndexedDB 和 Cache Storage。哪一处能写就写哪一处，返回是否至少写进了一处
 save(){clearTimeout(this.t);this.t=0;const o=this.snap();if(!o)return Promise.resolve(false);
  const a=this.open().then(db=>new Promise(res=>{const tx=db.transaction("kv","readwrite");tx.objectStore("kv").put(o,"s");tx.oncomplete=()=>{db.close();res(true)};tx.onerror=tx.onabort=()=>{db.close();res(false)}})).catch(()=>false);
  const b=(async()=>{try{if(!window.caches)return false;const c=await caches.open("nwt-backup");await c.put("nwt-save.json",new Response(JSON.stringify(o),{headers:{"content-type":"application/json"}}));return true}catch(e){return false}})();
  return Promise.all([a,b]).then(r=>r[0]||r[1])},
 soon(){if(!this.t)this.t=setTimeout(()=>this.save(),1500)},
 load1(){return this.open().then(db=>new Promise(res=>{const tx=db.transaction("kv","readonly");const r=tx.objectStore("kv").get("s");r.onsuccess=()=>{res(r.result||null);db.close()};r.onerror=()=>{res(null);db.close()}})).catch(()=>null)},
 async load2(){try{if(!window.caches)return null;const c=await caches.open("nwt-backup");const r=await c.match("nwt-save.json");return r?await r.json():null}catch(e){return null}},
 // 两处备份里取比较新的那一份
 async load(){const [a,b]=await Promise.all([this.load1(),this.load2()]);if(a&&b)return (b.t||0)>(a.t||0)?b:a;return a||b},
 async restore(){const o=await TOY.timeout(this.load(),3000).catch(()=>null);if(!o||!o.m)return false;let bm=null;try{bm=JSON.parse(o.m)}catch(e){return false}let changed=false;
  if(nwProg(bm)>nwProg(M)){Object.keys(M).forEach(k=>delete M[k]);Object.assign(M,bm);try{localStorage.setItem("nwt-meta",o.m)}catch(e){}changed=true}
  // 这一局：本机存储里没有（写不进去或者被清掉了），就用备份里的
  let lr=null,ended=null;try{lr=localStorage.getItem("nwt-run");ended=localStorage.getItem("nwt-run-end")}catch(e){}
  if(o.s&&!lr&&!ended&&!window.__nwbRun){try{const r=JSON.parse(o.s);if(r&&r.v===2){window.__nwbRun=o.s;try{localStorage.setItem("nwt-run",o.s)}catch(e){}changed=true}}catch(e){}}
  return changed}};
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{})}catch(e){}

/* ---------- 云存档 ---------- */
const CLOUD={st:"off",dirty:false,busy:false,last:[],back:0,fail:0,lastUp:0,timer:0,tries:0,pend:null,
 has(){return !!(window.toy&&toy.getCloudStorage&&toy.setCloudStorage)},
 pack(){let run=(typeof S!=="undefined"&&S&&!S.noSave)?S:null;if(!run){try{run=loadRun()}catch(e){run=null}}const s=JSON.stringify({v:1,t:Date.now(),m:M,s:run||null}).replace(/[\u007f-￿]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));const ch=[];for(let i=0;i<s.length;i+=1000)ch.push(s.slice(i,i+1000));return ch},
 idle(){return typeof S==="undefined"||!S},
 async init(){if(this.st!=="off"&&this.st!=="retry")return;this.st="wait";
  try{if(await NWB.restore()&&this.idle()&&typeof titleScreen==="function"&&$("#title").classList.contains("on")){titleScreen();if(typeof toast==="function")toast("已从本机备份找回你的存档")}}catch(e){}
  if(!await TOY.wait()||!this.has()){this.st="none";return}
  let o=null,meta=null;
  try{const r=await TOY.timeout(toy.getCloudStorage(["tw_m"]),8000);meta=r&&r.tw_m?JSON.parse(r.tw_m):null;
   if(meta&&meta.n&&meta.n<=120){const keys=[...Array(meta.n)].map((_,i)=>"tw_"+i);const r2=await TOY.timeout(toy.getCloudStorage(keys),10000);
    const parts=keys.map(k=>(r2&&r2[k])||"");try{o=JSON.parse(parts.join(""))}catch(e){o=null}if(o&&o.m)this.last=parts}}
  catch(e){if(TOY.lim(e)){this.st="off";setTimeout(()=>this.init(),30000);return}
   this.tries++;if(this.tries<5){this.st="retry";setTimeout(()=>{if(this.st==="retry")this.init()},[3000,8000,20000,60000][this.tries-1]);return}this.st="nologin";return}
  this.tries=0;
  if(o&&o.m){const cp=nwProg(o.m),lp=nwProg(M);try{const cb=o.m.lbBest||{};M.lbBest=M.lbBest||{};let ch=0;for(const k in cb)if((+cb[k]||0)>(M.lbBest[k]||0)){M.lbBest[k]=+cb[k];ch=1}if(ch)saveMeta()}catch(e){}
   if(cp>lp){if(this.idle())this.apply(o);else{this.pend=o;this.st="ask";this.askLater();return}}
   else if(o.s&&o.s.v===2&&this.idle()){let lr=null;try{lr=JSON.parse(localStorage.getItem("nwt-run")||"null")}catch(e){}
    if(!lr&&window.__nwbRun){try{lr=JSON.parse(window.__nwbRun)}catch(e){}}if(!lr&&cp===lp||lr&&(o.s.ts||0)>(lr.ts||0)+3000){const j=JSON.stringify(o.s);window.__nwbRun=j;try{localStorage.setItem("nwt-run",j);localStorage.removeItem("nwt-run-end")}catch(e){}if($("#title").classList.contains("on"))titleScreen()}}}
  this.st="on";this.hot();setTimeout(()=>{try{LB.resend()}catch(e){}},4000)},
 apply(o){const old=JSON.parse(JSON.stringify(M));Object.keys(M).forEach(k=>delete M[k]);Object.assign(M,nwMergeMeta(o.m,old));try{localStorage.setItem("nwt-meta",JSON.stringify(M))}catch(e){}if(o.s&&o.s.v===2){let lr=null;try{lr=JSON.parse(localStorage.getItem("nwt-run")||window.__nwbRun||"null")}catch(e){}if(!lr||(o.s.ts||0)>=(lr.ts||0)){const j=JSON.stringify(o.s);window.__nwbRun=j;try{localStorage.setItem("nwt-run",j);localStorage.removeItem("nwt-run-end")}catch(e){}}}
  NWB.save();if(typeof titleScreen==="function"&&$("#title").classList.contains("on"))titleScreen();if(typeof toast==="function")toast("已从云端找回你的存档")},
 askLater(){const go=()=>{if(this.st!=="ask"||!this.pend)return;if(!this.idle()||!$("#title").classList.contains("on")||$("#ov").classList.contains("on")){setTimeout(go,1500);return}
   const o=this.pend;this.pend=null;this.apply(o);this.st="on";this.hot()};go()},
 sched(ms,force){const due=Date.now()+ms;if(this.timer&&this.due<=due)return;clearTimeout(this.timer);this.due=due;this.timer=setTimeout(()=>{this.timer=0;this.up(force)},ms)},
 hot(){if(this.st!=="on")return;this.dirty=true;this.sched(Math.max(2000,this.lastUp+8000-Date.now(),this.back||0),true)},
 mark(){if(this.st!=="on")return;this.dirty=true;this.sched(Math.max(5000,this.lastUp+25000-Date.now(),this.back||0),false)},
 async up(force){if(this.st!=="on"||this.busy||!this.dirty)return;if(!force&&Date.now()-this.lastUp<8000){this.mark();return}
  this.busy=true;this.dirty=false;
  try{const ch=this.pack();if(ch.length>120){this.st="big";return}const items={};ch.forEach((c,i)=>{if(this.last[i]!==c)items["tw_"+i]=c});
   items.tw_m=JSON.stringify({v:1,n:ch.length,t:Date.now(),p:nwProg(M)});await TOY.timeout(toy.setCloudStorage(items),10000);this.last=ch;this.lastUp=Date.now();this.back=0;this.fail=0}
  catch(e){this.dirty=true;if(TOY.lim(e))this.back=Math.min((this.back||15000)*2,600000);else{this.fail++;this.back=15000*this.fail}if(this.fail>=6)this.st="nologin";else this.mark()}
  finally{this.busy=false}},
 txt(){const t=this.lastUp?new Date(this.lastUp):null;return{on:"☁ 云存档已开启"+(t?"　上次同步 "+t.getHours()+":"+String(t.getMinutes()).padStart(2,"0"):""),wait:"☁ 正在连接云存档",retry:"☁ 正在重新连接云存档",ask:"☁ 云端有进度更多的存档，回到主页会自动恢复",nologin:"☁ 登录 B站 后可开启云存档（现在只存在这台设备上）",big:"☁ 存档太大，暂时只存本地",none:"",off:""}[this.st]||""}};
const nwFlush=()=>{try{if(typeof S!=="undefined"&&S&&typeof saveRun==="function")saveRun()}catch(e){}NWB.save();if(CLOUD.dirty)CLOUD.up(true)};
document.addEventListener("visibilitychange",()=>{if(document.hidden)nwFlush();else if(CLOUD.st==="nologin"){CLOUD.st="off";CLOUD.tries=0;CLOUD.fail=0;CLOUD.init()}});
addEventListener("pagehide",nwFlush);

/* ---------- 成就全服统计 ----------
   官方 SDK 的共享存档只在「同一玩家的多个 Toy」之间共享，不跨玩家，排行榜也不返回总人数，
   所以全服百分比暂时做不了；这里保留空实现，成就只记在本地并跟随云存档同步。 */
const GSTAT={detect(){return null},load(){return Promise.resolve(null)},add(){return Promise.resolve()},pct(){return null},txt(){return""}};

/* ---------- 全服排行榜（和抓奶蛙同一套 Toy 接口） ----------
   board 1：爬塔积分；board 2：最痛一击（单次最高伤害） */
const LB={cache:{},
 ok(){return !!(window.toy&&toy.getRankList&&toy.submitScore)},
 BOARDS:{1:{n:"爬塔积分",u:"分",d:"爬得越高、首领打得越多、难度越高，分越高"},2:{n:"最痛一击",u:"点",d:"一局里打出的单次最高伤害（平台收不下的超大数字，会改按 9999 万上榜）"},3:{n:"真结局",u:"分",d:"只有走到真结局才会上榜：难度越高、周目越多、用的回合越少、最后剩的血越多，分越高"}},
 score(win){if(!S)return 0;const fl=(S.act||0)*(ROWS+1)+Math.max(0,S.row)+1;const mul={easy:.5,normal:1,hard:1.6}[S.diff||"normal"]||1;return Math.round((fl*10+(S.stats.endb||0)*50+(win?300:0)+(S.endKey==="true"?500:0))*mul+asc()*80)},
 trueScore(){if(!S)return 0;const mul={easy:.5,normal:1,hard:1.6}[S.diff||"normal"]||1;return Math.round(1000*mul+asc()*150+Math.max(0,400-((S.stats&&S.stats.turns)||0))+Math.round(300*Math.max(0,S.hp)/Math.max(1,S.max)))},
 CAP:99999999,
 submit(b,score){score=Math.floor(+score||0);if(!isFinite(score))score=Number.MAX_SAFE_INTEGER;score=Math.min(Number.MAX_SAFE_INTEGER,score);if(score<=0)return false;M.lbBest=M.lbBest||{};let rec=false;if(score>(M.lbBest[b]||0)){rec=true;M.lbBest[b]=score;M.lbHero=M.lbHero||{};try{M.lbHero[b]=S&&S.hero}catch(e){}saveMeta()}if(!this.ok())return rec;this.send(b,score,0);return rec},
 send(b,score,n){M.lbPend=M.lbPend||{};if(score>(M.lbPend[b]||0))M.lbPend[b]=score;saveMeta();TOY.timeout(toy.submitScore({board:b,score}),10000).then(()=>{M.lbLog=M.lbLog||{};M.lbLog[b]={ok:1,s:score,t:Date.now()};if(M.lbPend&&M.lbPend[b]<=score){delete M.lbPend[b]}saveMeta();for(const k in this.cache)if(k.indexOf(b+"|")===0)delete this.cache[k]}).catch(e=>{try{M.lbLog=M.lbLog||{};M.lbLog[b]={ok:0,s:score,t:Date.now(),e:String((e&&(e.code||e.message))||e).slice(0,60)};saveMeta()}catch(x){}if(score>this.CAP){if(M.lbPend&&M.lbPend[b]===score)delete M.lbPend[b];this.send(b,this.CAP,n);return}if(n<3)setTimeout(()=>this.send(b,score,n+1),[5000,20000,60000][n])})},
 resend(){if(!this.ok())return;M.lbPend=M.lbPend||{};for(const b in M.lbPend)this.send(+b,M.lbPend[b],0);for(const b in (M.lbBest||{}))if(!M.lbPend[b]&&!(M.lbSync||{})[b]){M.lbSync=M.lbSync||{};M.lbSync[b]=1;this.send(+b,M.lbBest[b],0)}},
 onRunEnd(win){try{const r=[];if(this.submit(1,this.score(win)))r.push("爬塔积分 "+this.score(win));const mh=(S&&S.stats&&S.stats.maxHit)||0;if(this.submit(2,mh))r.push("最痛一击 "+mh);if(S&&S.endKey==="true"){const t=this.trueScore();if(this.submit(3,t))r.push("真结局 "+t)}if(r.length)setTimeout(()=>{toast(`<b>新纪录！</b>${r.join("　")}`);sfx("relic")},1200)}catch(e){}},
 async get(b,per){const k=b+"|"+per,c=this.cache[k];if(c&&Date.now()-c.t<60000)return c;const o={t:Date.now(),list:[],me:null};
  try{const R=await Promise.all([TOY.timeout(toy.getRankList({board:b,period:per,limit:50}),8000).then(x=>x||[],()=>null),toy.getMyRank?TOY.timeout(toy.getMyRank({board:b,period:per}),8000).catch(()=>null):Promise.resolve(null)]);if(R[0]===null)o.err=1;else o.list=R[0];o.me=R[1]}catch(e){o.err=1}if(!o.err)this.cache[k]=o;return o}};
function cleanName(s){return String(s||"奶蛙").replace(/[<>&"]/g,"").slice(0,12)}
async function rankScreen(){let b=1,per="week";try{LB.resend()}catch(e){}
 const draw=async()=>{const B0=LB.BOARDS[b];ov(`<div class="lbBox"><div class="mgHead"><span class="ribbon b">排行榜</span></div><div class="lbTabs">${Object.entries(LB.BOARDS).map(([k,v])=>`<button class="${+k===b?"on":""}" data-b="${k}">${v.n}</button>`).join("")}<span class="lbSep"></span>${[["week","本周"],["all","总榜"]].map(([k,v])=>`<button class="${k===per?"on":""}" data-p="${k}">${v}</button>`).join("")}</div><p class="lbDesc">${B0.d}</p><div class="lbList" id="lbList"><p class="lbMsg">${LB.ok()?"正在读取全服排名……":"全服排行榜要在 B站 Toy 里打开才能看到。"}</p></div><div class="lbMe">我的最好成绩：<b>${(M.lbBest||{})[b]||0}</b> ${B0.u}${(()=>{const h=(M.lbHero||{})[b];const H=h&&HEROES.find(x=>x.id===h);return H?`（${H.n}）`:""})()}${(()=>{const L=(M.lbLog||{})[b];if(!L)return"";const d=new Date(L.t);const tm=`${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;return`<br><small class="lbLog">上次上传 ${L.s}：${L.ok?"成功":"失败（"+L.e+"）"}　${tm}</small>`})()}${(M.lbBest||{})[b]&&LB.ok()?`　<button class="btn sm ghost" id="lbRe">重新上传</button>`:""}</div><div class="ovFoot"><button class="btn sm" id="ovX">返回</button></div></div>`);
  $$("#ov .lbTabs [data-b]").forEach(x=>x.onclick=()=>{b=+x.dataset.b;sfx("click");draw()});$$("#ov .lbTabs [data-p]").forEach(x=>x.onclick=()=>{per=x.dataset.p;sfx("click");draw()});$("#ovX").onclick=closeOv;{const rb=$("#lbRe");if(rb)rb.onclick=()=>{sfx("click");rb.disabled=true;rb.textContent="上传中…";LB.send(b,M.lbBest[b],3);setTimeout(()=>{for(const k in LB.cache)delete LB.cache[k];draw()},4000)}}
  if(!LB.ok())return;const o=await LB.get(b,per);const el=$("#lbList");if(!el)return;
  if(o.err){el.innerHTML=`<p class="lbMsg">全服榜暂时连不上，稍后再试。</p>`;return}
  if(!o.list.length){el.innerHTML=`<p class="lbMsg">还没有人上榜。打一局，你就是第一名。</p>`;return}
  el.innerHTML=o.list.map((r,i)=>{const nm=cleanName(r.nickname),a=r.avatar?(String(r.avatar).indexOf("//")===0?"https:"+r.avatar:r.avatar):"";return`<div class="lbRow ${i<3?"top"+(i+1):""}"><b class="lbR">${r.rank||i+1}</b><span class="lbAv">${a?`<img referrerpolicy="no-referrer" src="${a.replace(/"/g,"")}" onerror="this.remove()">`:nm.slice(0,1)}</span><span class="lbN">${nm}</span><b class="lbS">${r.score} <small>${B0.u}</small></b></div>`}).join("");
  const me=$("#ov .lbMe");if(me&&o.me&&o.me.ranked)me.innerHTML+=`　全服第 <b>${o.me.rank}</b> 名`};
 draw()}
/* 5.2 云存档合并：熟练度、首领记录、收集这类只增不减的东西取两边较大的，不会被另一台设备的旧进度盖掉 */
function nwMergeMeta(a,b){const m=JSON.parse(JSON.stringify(a||{}));if(!b)return m;
 ["runs","wins","deaths","kills","shardsAll","playMs","best","palN"].forEach(k=>{if(typeof b[k]==="number")m[k]=Math.max(m[k]||0,b[k])});
 const maxMap=k=>{if(b[k]&&typeof b[k]==="object"){m[k]=m[k]||{};for(const x in b[k]){const v=b[k][x];if(typeof v==="number")m[k][x]=Math.max(m[k][x]||0,v);else if(!(x in m[k]))m[k][x]=v}}};
 ["mast","got","ach","pals","up","seen","lbBest"].forEach(maxMap);
 if(b.boss){m.boss=m.boss||{};for(const x in b.boss){const r=m.boss[x]=m.boss[x]||{},o=b.boss[x]||{};for(const y in o){if(typeof o[y]==="number")r[y]=Math.max(r[y]||0,o[y]);else if(!(y in r))r[y]=o[y]}}}
 if(Array.isArray(b.trueEnds)){const L=m.trueEnds=Array.isArray(m.trueEnds)?m.trueEnds:[];b.trueEnds.forEach(e=>{if(!L.some(x=>x&&e&&x.t===e.t))L.push(e)})}
 return m}
