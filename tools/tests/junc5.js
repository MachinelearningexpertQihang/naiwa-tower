/* 岔路层（x.5 层）进出 */
const {chromium}=require('playwright');const S=require('path').join(process.env.NWT_OUT||'/tmp/nwt-test','/');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('file://'+process.env.NWT_REAL+'/index.html');await p.evaluate(()=>{localStorage.setItem('nwt-meta',JSON.stringify({tut:1,train:{naiwa:1},stSeen:{str:1,dex:1,vuln:1,weak:1,mana:1}}))});await p.reload();await p.waitForTimeout(1500);
const talkThrough=async()=>{for(let i=0;i<30;i++){await p.waitForTimeout(150);const t=await p.evaluate(()=>{if($('#talk').classList.contains('on')){$('#talk').click();return 1}return 0});if(!t)break}};
await p.evaluate(()=>{newRun("naiwa",0);closeOv();$('#talk').classList.remove('on');S.flags.juncForce=1;S.boss="king";actClear()});await p.waitForTimeout(600);
await p.evaluate(()=>$('#eJunc').click());await talkThrough();await p.waitForTimeout(800);
await p.evaluate(()=>{S.row=S.map.length-2;S.col=S.map[S.row].findIndex(Boolean);openMap()});await p.waitForTimeout(600);await p.screenshot({path:S+'j7.png'});
const before=await p.evaluate(()=>({g:S.gold,d:S.deck.length,r:S.relics.length,sh:M.shards}));
await p.evaluate(()=>document.querySelector('.mn.lastE').click());await p.waitForTimeout(1500);await p.evaluate(()=>{closeOv();document.querySelectorAll('#stIntro').forEach(x=>x.remove())});
await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await p.waitForTimeout(1500);await p.screenshot({path:S+'j8.png'});
for(let i=0;i<10;i++){const st=await p.evaluate(()=>{if($('#rwGo')&&$('#reward').classList.contains('on')){$('#rwGo').click();return 'go'}const c=document.querySelector('#ov.on .lvC, #ov.on .pkCard, #ov.on [data-perk], #ov.on .perk');if(c){c.click();return 'perk'}const b=document.querySelector('#ov.on button');if(b){b.click();return 'btn'}return 'w'});if(st==='go')break;await p.waitForTimeout(500)}await p.waitForTimeout(400);await p.evaluate(()=>{const y=$('#cYes');if(y)y.click()});await p.waitForTimeout(1200);await p.screenshot({path:S+'j9.png'});
await p.evaluate(()=>{const c=document.querySelector('#ov .pickRow .card');if(c)c.click()});await p.waitForTimeout(900);await talkThrough();await p.waitForTimeout(600);
console.log(before,await p.evaluate(()=>({g:S.gold,d:S.deck.length,r:S.relics.length,sh:M.shards,junc:S.junc,rows:S.map.length,scr:[...document.querySelectorAll('.scr.on')].map(x=>x.id)})),er);await b.close()})()
