/* 性能：主页 6 秒的帧率和样式计算时间（CPU 降速 4 倍） */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('file://'+process.env.NWT_REAL+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,wins:2}))});await p.reload();await p.waitForTimeout(2000);
if(process.env.LITE)await p.evaluate(()=>document.documentElement.classList.add('lite'));
const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const an=await p.evaluate(()=>document.getAnimations().map(a=>{const t=a.effect&&a.effect.target;const props=a.effect&&a.effect.getKeyframes?[...new Set(a.effect.getKeyframes().flatMap(k=>Object.keys(k).filter(x=>!['offset','easing','composite','computedOffset'].includes(x))))].join('/'):'';return (a.animationName||'waapi')+'@'+(t?(t.id||String(t.className).split(' ')[0]||t.tagName):'?')+'['+props+']'}).join('\n'));
await p.evaluate(()=>{window.__fr=[];let last=performance.now();const f=t=>{__fr.push(t-last);last=t;if(__fr.length<600)requestAnimationFrame(f)};requestAnimationFrame(f)});await cdp.send('Performance.enable');const m0=(await cdp.send('Performance.getMetrics')).metrics;await p.waitForTimeout(6000);const m1=(await cdp.send('Performance.getMetrics')).metrics;const g=(m,k)=>m.find(x=>x.name===k).value;
const r=await p.evaluate(()=>{const f=__fr.slice(3);return{fps:Math.round(1000*f.length/f.reduce((a,b)=>a+b,0)),over50:f.filter(x=>x>50).length}});
console.log(JSON.stringify(r),['RecalcStyleDuration','LayoutDuration','TaskDuration','RecalcStyleCount','LayoutCount'].map(k=>k+'='+(Math.round((g(m1,k)-g(m0,k))*1000)/1000)).join(' '));if(!process.env.Q)console.log(an);console.log(er);await b.close()})();
