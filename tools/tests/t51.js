/* 镜之间、后门（奶茶厂） */
const {chromium}=require('playwright');const S=require('path').join(process.env.NWT_OUT||'/tmp/nwt-test','/');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));p.on('dialog',d=>d.dismiss());
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,trainBase:1,train:{naiwa:1}}))});await p.reload();await p.waitForTimeout(1000);
await p.evaluate(()=>{newRun();const o=$('#ov');o.classList.remove('on');o.innerHTML='';$('#talk').classList.remove('on');S.act=1});
// NPC screens
//npc removed
await p.evaluate(()=>{S.hero='naiwa';S.act=1});
// hidden map placement
console.log('hid',await p.evaluate(()=>{let c=0;for(let i=0;i<40;i++){S.hid={};const g=genMap();if(g.flat().some(n=>n&&'AYZ'.includes(n.t)))c++}return c+'/40'}));
// arena
await p.evaluate(()=>{arenaStart()});await p.waitForTimeout(300);await p.evaluate(()=>{const o=$('#ov');o.classList.remove('on');o.innerHTML=''});await p.click('#hGo');await p.waitForTimeout(2500);
for(let w=0;w<4;w++){for(let k=0;k<40;k++){const ok=await p.evaluate(()=>B&&!B.over&&B.myTurn);if(ok)break;await p.evaluate(()=>{$('#talk').classList.remove('on');const pk=document.querySelector('#ov .perkRow button,#ov .perk');if(pk)pk.click();const g=document.querySelector('#arGo');if(g)g.click()});await p.waitForTimeout(300)}
 await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});
 for(let k=0;k<40;k++){await p.waitForTimeout(300);const r=await p.evaluate(()=>{const pk=document.querySelector('#ov .perkRow button,#ov .perk');if(pk)pk.click();return !!document.querySelector('#arGo')||$('#map').classList.contains('on')});if(r)break}
 console.log('wave',w+1,JSON.stringify(await p.evaluate(()=>({arena:S.arena,panel:!!document.querySelector('#arGo'),map:$('#map').classList.contains('on'),gold:S.gold,relics:S.relics.length,deck:S.deck.length}))))}
console.log('arena relics',await p.evaluate(()=>S.relics.length),'deck',await p.evaluate(()=>S.deck.length));
// arena lose
await p.evaluate(()=>{S.arena={w:1,g:50,c:1};startCombat('m')});await p.waitForTimeout(2000);await p.evaluate(()=>{S.hp=0;lose()});await p.waitForTimeout(1500);console.log('arena lose',JSON.stringify(await p.evaluate(()=>({hp:S.hp,arena:S.arena,map:$('#map').classList.contains('on')}))));
// mirror
await p.evaluate(()=>{mirrorStart()});await p.evaluate(()=>{const o=$('#ov');o.classList.remove('on');o.innerHTML=''});await p.click('#hGo');await p.waitForTimeout(2500);console.log('mirror enemy',await p.evaluate(()=>B.enemies.map(e=>e.n+' '+e.hp+' '+JSON.stringify(e.intent)).join('|')));await p.screenshot({path:(process.env.NWT_OUT||'/tmp/nwt-test')+'/'+'t51_mirror.png'});
await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await p.waitForTimeout(2500);const d0=await p.evaluate(()=>S.deck.length);await p.evaluate(()=>{const o=$('#ov');o.classList.remove('on');o.innerHTML=''});await p.click('#mrCp');await p.waitForTimeout(800);await p.evaluate(()=>{const c=document.querySelector('#ov .card');c&&c.click()});await p.waitForTimeout(400);await p.evaluate(()=>{const b=[...document.querySelectorAll('#ov button')].find(x=>/确定|选好|确认/.test(x.textContent));b&&b.click()});await p.waitForTimeout(1500);console.log('mirror copy',d0,'->',await p.evaluate(()=>S.deck.length),'reward',await p.evaluate(()=>$('#reward').classList.contains('on')));
// Z
await p.evaluate(()=>{S.act=3;zStart()});await p.evaluate(()=>{const o=$('#ov');o.classList.remove('on');o.innerHTML=''});await p.click('#hGo');await p.waitForTimeout(2500);
for(let i=0;i<4;i++){await p.evaluate(()=>{B.enemies.forEach(e=>{if(e.hp>0){e.hp=0;killEnemy(e)}});win()});await p.waitForTimeout(400)}
console.log('Z kills',await p.evaluate(()=>B.zKills),'alive',await p.evaluate(()=>B.alive().length));
await p.evaluate(()=>{B.turn=5;startTurn()});await p.waitForTimeout(3000);console.log('Z end reward',await p.evaluate(()=>$('#reward').classList.contains('on')),'gold',await p.evaluate(()=>S.gold));
// lore codex

console.log('errors',er);await b.close()})()
