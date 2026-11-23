/* 真结局流程：宽恕 → 魔椅 → 阿岳的梦 → 最终之地 → 名人堂 */
const {chromium}=require('playwright');const S=require('path').join(process.env.NWT_OUT||'/tmp/nwt-test','/');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.goto('file://'+process.env.NWT_REAL+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,wins:1,train:{naiwa:1},memo:{naiwa:1}}))});await p.reload();await p.waitForTimeout(800);
const talkThrough=async(n=60)=>{let idle=0;for(let i=0;i<n;i++){await p.waitForTimeout(150);const t=await p.evaluate(()=>{if($('#talk').classList.contains('on')){$('#talk').click();return 1}return 0});if(t)idle=0;else if(++idle>8)break}};
await p.evaluate(()=>{newRun('naiwa',0)});for(let i=0;i<60;i++){await p.waitForTimeout(150);const st=await p.evaluate(()=>{if($('#talk').classList.contains('on')){$('#talk').click();return 't'}if($('#map').classList.contains('on'))return 'map';const b=document.querySelector('#ov.on .evo')||document.querySelector('#ov.on button');if(b){b.click();return 'b'}return 'w'});if(st==='map')break}
console.log('tr',await p.evaluate(()=>S.tr));
await p.evaluate(()=>{closeOv();S.act=4;S.hp=S.max=200;chairStart()});await talkThrough(30);await p.waitForTimeout(2500);
await p.screenshot({path:S+'te_chair.png'});console.log('kind',await p.evaluate(()=>B&&B.kind));
// end turns until chairEnd
for(let k=0;k<20;k++){const st=await p.evaluate(()=>{if(!B)return 'noB';if(B.myTurn&&!busy){const e=B.alive()[0];if(e){e.block=0;dealEnemy(e,99999)}afterAction();return 'kill'}return 'wait'});if(st==='noB')break;await p.waitForTimeout(1500)}
await talkThrough(40);await p.waitForTimeout(600);await p.screenshot({path:S+'te_dream.png'});console.log('dream',await p.evaluate(()=>S.dream+' relics '+S.relics.join(',')));
await p.click('#eNext').catch(()=>{});await talkThrough(20);await p.waitForTimeout(900);await p.screenshot({path:S+'te_dreammap.png'});
await p.evaluate(()=>{S.cur={t:'s'};shopScreen()});await p.waitForTimeout(500);await p.screenshot({path:S+'te_dreamshop.png'});
await p.evaluate(()=>{dreamClear()});await talkThrough(30);await p.waitForTimeout(500);await p.click('#eNext').catch(()=>{});await talkThrough(20);await p.waitForTimeout(900);await p.screenshot({path:S+'te_finmap.png'});
console.log('fin',await p.evaluate(()=>S.fin+' boss '+curBoss()+' rows '+S.map.length));
await p.evaluate(()=>{S.row=0;S.col=3;S.pendGrp=['bishop'];enterNode('C')});await p.waitForTimeout(2500);await p.screenshot({path:S+'te_corrupt.png'});
await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=1);const c=mk('strike');B.p.energy=5;B.hand.push(c);playCard(c,B.alive()[0])});await p.waitForTimeout(4000);await talkThrough(20);
console.log('after C',await p.evaluate(()=>$('#reward').classList.contains('on')));
await p.evaluate(()=>{trueFinale()});await talkThrough(40);await p.waitForTimeout(2500);await p.screenshot({path:S+'te_credits.png'});
await p.evaluate(()=>{const s=document.querySelector('.crSkip');if(s)s.click()});await p.waitForTimeout(1500);await p.screenshot({path:S+'te_end.png'});
console.log('trueEnds',await p.evaluate(()=>JSON.stringify(M.trueEnds)));
await p.evaluate(()=>{titleScreen()});await p.waitForTimeout(800);await p.evaluate(()=>hallOfFame());await p.waitForTimeout(400);await p.screenshot({path:S+'te_hof.png'});
console.log(er);await b.close()})()
