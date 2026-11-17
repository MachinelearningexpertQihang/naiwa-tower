/* 秘密房间每个选项、5.6 新随机事件、秘密房间出现率、寂静之海必出 */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='warning'||(m.type()==='error'&&!/Failed to load/.test(m.text())))er.push('C:'+m.text().slice(0,150))});
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,wins:2}))});await p.reload();await p.waitForTimeout(1200);
const out=await p.evaluate(async()=>{gainXP=async()=>{};chooseReward=async(c)=>{addCard(c[0]);return c[0]};pickCards=async(l)=>[l[0]];newRun();$('#ov').classList.remove('on');S.gold=300;const res=[];
 // secret rooms: walk every option path
 const clickPath=async(id,path)=>{S.cur={t:"W"};S.cur.sec={id,step:0};secRender();for(const i of path){await sleep(30);const bs=[...document.querySelectorAll('#event .evo')];if(!bs[i])return'nobtn';bs[i].click();await sleep(120)}return document.getElementById('evP').innerText.slice(0,30)};
 for(const id of Object.keys(SECRET)){const T=SECRET[id];for(let a=0;a<T.steps[0].o.length;a++){const o=T.steps[0].o[a];if(o.go!=null){const nx=T.steps[o.go];for(let c2=0;c2<nx.o.length;c2++)res.push(id+a+c2+':'+await clickPath(id,[a,c2]))}else res.push(id+a+':'+await clickPath(id,[a]))}}
 // vault greed loop
 S.cur={t:"W",sec:{id:"vault",step:0}};secRender();await sleep(50);document.querySelectorAll('#event .evo')[0].click();await sleep(100);for(let i=0;i<8;i++){const bs=[...document.querySelectorAll('#event .evo')];if(bs.length<2)break;bs[0].click();await sleep(100)}res.push('vault:'+document.getElementById('evP').innerText.slice(0,20));
 // events
 for(const k of ["ev_choir","ev_ghostchef","ev_icefish","ev_vending","ev_wish","ev_swap","ev_bigcat","ev_bard"]){const E=EVENTS[k];const os=E.o();for(let i=0;i<os.length;i++){S.cur={t:"q"};eventScreen(k);await sleep(30);const bs=[...document.querySelectorAll('#event .evo')];if(bs[i]&&!bs[i].disabled){bs[i].click();await sleep(100)}}res.push(k+':ok')}
 // W placement freq
 let w=0;for(let i=0;i<200;i++){S.act=1;if(genMap().flat().some(n=>n&&n.t==="W"))w++}res.push('Wrate '+w/200);
 // sea junction always at act index 2
 let sea=0;for(let i=0;i<10;i++){S.act=2;S.dream=0;S.fin=0;S.quest=null;S.flags={};await actClear();if(document.getElementById('eJunc'))sea++}res.push('sea '+sea+'/10');
 return res.join('\n')});
console.log(out);console.log('ERR',er.slice(0,10));await b.close()})();
