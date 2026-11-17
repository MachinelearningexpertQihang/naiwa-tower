/* 屏幕适配：几种屏幕比例下 #stage 的位置和大小，并截图 */
const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();for(const [w,h] of [[1000,461],[1024,768],[844,390],[1280,720]]){const p=await b.newPage({viewport:{width:w,height:h}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('file://'+process.env.NWT_REAL+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,wins:2}))});await p.reload();await p.waitForTimeout(1200);
await p.evaluate(()=>{newRun();$('#ov').classList.remove('on');S.map=genMap();openMap()});await p.waitForTimeout(1500);await p.evaluate(()=>{$('#talk').classList.remove('on')});
const r=await p.evaluate(()=>{const q=$('#stage').getBoundingClientRect();return [Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)].join(',')});console.log(w,h,r,er);await p.screenshot({path:(process.env.NWT_OUT||'/tmp/nwt-test')+'/'+`fit_${w}.png`});await p.close()}await b.close()})();
