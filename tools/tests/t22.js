/* 完整流程：从第一层打到第四层通关，中间不能有报错 */
const {chromium}=require('playwright');const S=require('path').join(process.env.NWT_OUT||'/tmp/nwt-test','/');const D=S+'shots/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem("nwt-meta",JSON.stringify({tut:1}))});await p.reload();await p.waitForTimeout(300);
await p.evaluate(()=>{newRun()});await p.waitForTimeout(400);await p.click('#talk .tSkip');await p.waitForTimeout(2600);
const clr=async()=>{for(let i=0;i<6;i++){const done=await p.evaluate(()=>{if($("#talk").classList.contains("on")){$("#talk").click();return 0}const o=$("#ov");if(o.classList.contains("on")){const x=o.querySelector(".ovGrid .card,.perk,.pickRow .card,#pkY,#modOk:not([disabled]),.ovFoot .btn");if(x){x.click();return 0}}return 1});if(done)break;await p.waitForTimeout(150)}};
await clr();
// 事件：每个事件每个选项
const evs=await p.evaluate(()=>Object.keys(EVENTS));let n=0;
for(const ev of evs){const no=await p.evaluate(ev=>EVENTS[ev].o().length,ev);for(let k=0;k<no;k++){
 if(['claw','rpsfrog','memory'].includes(ev)&&k===0)continue;
 await p.evaluate(([ev,k])=>{const S=__dbg.S;S.gold=500;S.hp=S.max=200;S.act=EVENTS[ev].act??0;S.cur={t:'q',ev};eventScreen();const b=document.querySelectorAll('#event .evo')[k];if(b&&!b.disabled)b.click()},[ev,k]);await p.waitForTimeout(250);await clr();n++}}
console.log('event options',n);
// 宝箱/商队
await p.evaluate(()=>{closeOv();const S=__dbg.S;S.cur={t:'s',rs:S.rs};shopScreen("caravan")});await p.waitForTimeout(300);await p.screenshot({path:D+'h_caravan.png'});
await p.evaluate(()=>{const b=document.querySelector('#shop .shItem:not(.sold)');b&&b.click()});await p.waitForTimeout(200);
// 每一层过关
for(let a=0;a<5;a++){await p.evaluate(a=>{const S=__dbg.S;S.act=a;S.hp=S.max=300;S.map=genMap();S.sky=genSky();S.row=-1;S.atBoss=false;openMap()},a);await p.waitForTimeout(300);await p.screenshot({path:D+'h_map'+a+'.png'});
 await p.evaluate(a=>{const S=__dbg.S;S.cur={t:'B',rs:S.rs};S.atBoss=true;S.bossPick=null;pickBoss();startCombat('B')},a);await p.waitForTimeout(500);await clr();await p.waitForTimeout(300);await p.screenshot({path:D+'h_boss'+a+'.png'});
 await p.evaluate(()=>__dbg.win());await p.waitForTimeout(1500);await clr();await p.waitForTimeout(1200);await clr();await p.waitForTimeout(600);await clr();
 console.log('act',a,await p.evaluate(()=>({act:__dbg.S.act,scr:[...document.querySelectorAll('.scr.on')].map(x=>x.id).join(),kind:__dbg.B&&__dbg.B.kind,txt:(document.querySelector('#ending h1')||{}).textContent})));
 if(a===4){await p.waitForTimeout(500);await clr();await p.evaluate(()=>__dbg.win());await p.waitForTimeout(2500);for(let i=0;i<4;i++){await clr();await p.waitForTimeout(500)}await p.screenshot({path:D+'h_end.png'});console.log('end',await p.evaluate(()=>(document.querySelector('#ending h1')||{}).textContent))}}
console.log('ERR',errs.length,errs.slice(0,10));await b.close()})();
