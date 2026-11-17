/* 性能：2 费 / 3 费攻击牌的帧率（参数：版本目录 卡牌id 次数 间隔毫秒） */
const {chromium}=require('playwright');const DIST=process.argv[2],CARD=process.argv[3],N=+process.argv[4]||4,GAP=+process.argv[5]||2200;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('file://'+(DIST||process.env.NWT_REAL)+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,trainBase:1,train:{kungfu:1},memo:{naiwa:1,kungfu:1}}))});await p.reload();await p.waitForTimeout(1000);
await p.evaluate(()=>{gainXP=async()=>{};newRun('kungfu',0);const o=$('#ov');o.classList.remove('on');o.innerHTML='';$('#talk').classList.remove('on');S.act=1;S.pendGrp=["butler","bride","scream"];startCombat('m')});await p.waitForTimeout(2600);
await p.evaluate(()=>{$('#talk').classList.remove('on');document.querySelectorAll('.stTip,#memoTip,.tipBox').forEach(e=>e.remove());B.alive().forEach(e=>{e.hp=e.max=99999});for(let i=0;i<5;i++)B.pool.push({f:"frog",ice:0})});
const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>__lt.push(Math.round(e.duration)))).observe({type:'longtask'});window.__fr=[];let last=performance.now();const f=t=>{__fr.push(t-last);last=t;if(__fr.length<4000)requestAnimationFrame(f)};requestAnimationFrame(f)});
for(let i=0;i<N;i++){await p.evaluate(id=>{busy=false;B.myTurn=true;B.p.energy=9;B.played=6;const c=mk(id);B.hand.push(c);playCard(c,B.alive()[0])},CARD);await p.waitForTimeout(GAP)}
const r=await p.evaluate(()=>{const f=__fr.slice(3);const s=[...f].sort((a,b)=>b-a);return{fps:Math.round(1000*f.length/f.reduce((a,b)=>a+b,0)),worst:s.slice(0,5).map(Math.round),over50:f.filter(x=>x>50).length,over100:f.filter(x=>x>100).length,long:__lt.length,longSum:__lt.reduce((a,b)=>a+b,0)}});
console.log(CARD,DIST.split('/').pop(),JSON.stringify(r),er.slice(0,2));await b.close()})()
