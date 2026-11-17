/* 两条 SS 线：死斗场五连战 → 迷你奶茶杯 → 书房 → 灭却诅咒师 → 最终之地二番战 */
const {chromium}=require('playwright');const D=process.argv[2]||'ss';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')er.push('C:'+m.text())});
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,trainBase:1,train:{naiwa:1},wins:1}))});await p.reload();await p.waitForTimeout(1200);
const W=ms=>p.waitForTimeout(ms);
const skipTalk=async(n=40)=>{for(let i=0;i<n;i++){const on=await p.evaluate(()=>$('#talk').classList.contains('on'));if(on){await p.evaluate(()=>{const s=$('#talk .tSkip');if(s)s.click();else $('#talk').click()});await W(150)}else{await W(150)}}};
const L=s=>console.log(s);
await p.evaluate(()=>{gainXP=async()=>{};newRun();$('#ov').classList.remove('on');S.act=3;S.flags.protoDone=1;S.map=genMap();S.row=-1;S.gold=200});
// tavern SS card
await p.evaluate(()=>{S.cur={t:"v"};tavernScreen()});await W(500);await skipTalk(12);L('qSS4 '+await p.evaluate(()=>!!$('#qSS4')));L('dice '+await p.evaluate(()=>!!$('#tvDice')));await p.screenshot({path:D+'/tav.png'});
await p.evaluate(()=>$('#qSS4').click());await W(400);await p.evaluate(()=>{const b=[...document.querySelectorAll('.shopConf button')].find(x=>/接下/.test(x.textContent));b&&b.click()});await W(900);L('ssArena '+await p.evaluate(()=>S.flags.ssArena));
// dice
await p.evaluate(()=>$('#tvDice').click());await W(300);await p.evaluate(()=>$('#dcGo').click());await W(900);await p.screenshot({path:D+'/dice.png'});await W(1500);L('dice played '+await p.evaluate(()=>S.cur.tav.dice+' gold '+S.gold));
await p.evaluate(()=>openMap());await W(1500);await skipTalk(8);L('nodes '+await p.evaluate(()=>S.map.flat().filter(n=>n&&"PD".includes(n.t)).map(n=>n.t+n.r).join(',')));await p.screenshot({path:D+'/map4.png'});
await p.evaluate(()=>enterNode("P"));await W(500);await p.screenshot({path:D+'/gate.png'});await p.evaluate(()=>$$('#event .evo')[1].click());await W(400);
await p.evaluate(()=>enterNode("D"));await W(600);await skipTalk(15);await p.screenshot({path:D+'/panel.png'});
for(let st=0;st<6;st++){const info=await p.evaluate(()=>({st:S.dsq&&S.dsq.st,rest:!!$('#dqA')}));L('step '+JSON.stringify(info));
 if(info.rest){await p.evaluate(()=>$('#dqA').click());await W(400);await p.evaluate(()=>$('#dqN').click());await W(400);continue}
 await p.evaluate(()=>{for(let i=0;i<3;i++)$('#dqHorn').click()});
 await p.evaluate(()=>$('#dqGo').click());await W(400);await skipTalk(25);await W(2500);await skipTalk(5);
 const en=await p.evaluate(()=>B&&B.enemies.map(e=>e.n+':'+e.hp).join(','));L(' fight '+en);
 if(st===5){await p.screenshot({path:D+'/champ.png'});L(' chip '+await p.evaluate(()=>{const e=B.enemies[0];return BM.ss_champ.chip(e)}));
  L(' break '+await p.evaluate(()=>{const e=B.enemies[0];B.myTurn=true;for(let i=0;i<8;i++)B.hit(e,10,1,1);return JSON.stringify({brkCd:e.brkCd,int:e.intent.k,turnDmg:e.turnDmg,hp:e.hp})}));await W(600);}
 await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await W(2500);
 await skipTalk(30);await W(600);const pick=await p.evaluate(()=>!!document.querySelector('#ov .pickRow .card'));if(pick){await p.screenshot({path:D+'/pick'+st+'.png'});await p.evaluate(()=>{const n=S.deck.length;document.querySelector('#ov .pickRow .card').click();window._dn=n});await W(800);L(' deck+ '+await p.evaluate(()=>S.deck.length-window._dn));await W(1200);await p.evaluate(()=>{document.querySelectorAll('[class*=eveal]').forEach(e=>e.remove());try{closeOv()}catch(e){}})}
 await skipTalk(10);await W(800)}
await W(800);await skipTalk(40);await W(1500);
L('after: '+await p.evaluate(()=>JSON.stringify({cup:S.flags.cupFriend,done:S.flags.arenaDone,glove:S.relics.includes('ss_glove'),dsq:S.dsq,gold:S.gold})));await p.screenshot({path:D+'/after.png'});
// act 4
await p.evaluate(()=>{$('#ov').classList.remove('on');S.cur=null;S.act=4;S.map=genMap();S.row=-1;S.flags.csRoute=0;openMap()});await W(800);await skipTalk(10);await W(500);
L('nodes5 '+await p.evaluate(()=>S.map.flat().filter(n=>n&&"UJ".includes(n.t)||n&&n.grp&&n.grp[0]==="ss_minion").map(n=>n.t+n.r).join(',')));await p.screenshot({path:D+'/map5.png'});
await p.evaluate(()=>enterNode("U"));await W(500);await p.screenshot({path:D+'/study.png'});await p.evaluate(()=>$$('#event .evo')[0].click());await W(500);L('aynote '+await p.evaluate(()=>S.flags.ayNote+' '+S.relics.includes('ss_note')));
await p.evaluate(()=>{S.pendGrp=["ss_minion","ss_minion","ss_minion"];startCombat("m")});await W(800);await skipTalk(10);await W(1500);await p.screenshot({path:D+'/minion.png'});await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await W(2000);await p.evaluate(()=>$('#ov').classList.remove('on'));
await p.evaluate(()=>enterNode("J"));await W(800);await skipTalk(20);await W(3000);await skipTalk(5);await p.screenshot({path:D+'/curser.png'});
L('curser '+await p.evaluate(()=>{const e=B.enemies.find(x=>x.id==='curser');return JSON.stringify({hp:e.hp,int:e.intent,full:B.fullCurse})}));
L(await p.evaluate(async()=>{const e=B.enemies.find(x=>x.id==='curser');const out=[];S.hp=S.max;for(let t=0;t<6;t++){e.turn=t;e.intent=ENEMY.curser.ai(e,t);await enemyAct(e);out.push(e.intent.k+(e.intent.s?':'+e.intent.s:'')+' hp'+S.hp+' st'+csStacks())}const m=B.enemies.filter(x=>/minion/.test(x.id)).length;const h0=e.hp;B.hit(e,20,1,1);return out.join(' | ')+' minions '+m+' dmg20->'+(h0-e.hp)}));
await p.screenshot({path:D+'/curser2.png'});
await p.evaluate(()=>{B.enemies.find(x=>x.id==='curser').hp=0;B.enemies.forEach(e=>e.hp=0);win()});await W(1500);await skipTalk(30);await W(1500);
L('csdone '+await p.evaluate(()=>S.flags.curserDone+' '+S.relics.includes('ss_orb')));
// final
L('fin '+await p.evaluate(()=>{S.fin=1;S.act=4;const m=finMap();return m.map(r=>{const n=r.find(Boolean);return n.t+(n.grp?n.grp[0]:'')+':'+n.nx}).join(' ')}));
await p.evaluate(()=>{$('#ov').classList.remove('on');S.map=finMap();openMap()});await W(800);await p.screenshot({path:D+'/finmap.png'});
await p.evaluate(()=>enterNode("J"));await W(800);await skipTalk(20);await W(3000);L('c2 '+await p.evaluate(()=>B.enemies.map(e=>e.n+e.hp).join(',')));await p.screenshot({path:D+'/c2.png'});
L('dream '+await p.evaluate(()=>STORY.dreamIn.length+' '+STORY.bs_youngyue.length+' spare '+STORY.spare.length));
await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await W(1500);await skipTalk(20);await W(1200);
// ach screen
await p.evaluate(()=>{$('#ov').classList.remove('on');achScreen()});await W(600);await p.evaluate(()=>{const c=[...document.querySelectorAll('.achC')].find(x=>/隐藏/.test(x.textContent));c&&c.click()});await W(500);await p.screenshot({path:D+'/ach.png'});
L('ach count '+await p.evaluate(()=>ACH.length));
console.log('ERR',er.slice(0,20));await b.close()})();
