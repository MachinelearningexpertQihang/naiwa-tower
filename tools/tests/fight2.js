/* 吸血鬼奶蛙打小怪、精英、首领各一场 */
const {chromium}=require('playwright');const S=require('path').join(process.env.NWT_OUT||'/tmp/nwt-test','/');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on("pageerror",e=>er.push(e.message+" | "+(e.stack||"").split("\n").slice(1,6).join(" ")));
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,train:{naiwa:1,kungfu:1,knight:1,mage:1}}))});await p.reload();await p.waitForTimeout(800);
for(const h of ['naiwa','kungfu','knight','mage','vamp']){for(const kind of ['m','E','B']){
 await p.evaluate(h=>{newRun();__dbg.S.hero=h;__dbg.S.hp=__dbg.S.max=300},h);await p.waitForTimeout(200);
 await p.evaluate(()=>{const o=$('#ov');o.classList.remove('on');o.innerHTML='';$('#talk').classList.remove('on')});
 await p.evaluate(k=>{if(k==='B')bossIntro();else __dbg.startCombat(k)},kind);
 let res='?';for(let t=0;t<400;t++){await p.waitForTimeout(60);
  const st=await p.evaluate(()=>{if($('#talk').classList.contains('on')){$('#talk').click();return 'talk'}if(!B)return 'nob';if(B.over)return 'over';if(document.querySelector('#reward.on,#ending.on,#map.on'))return 'done';if(busy||!B.myTurn)return 'wait';
   const al=B.alive();if(!al.length)return 'wait';const c=B.hand.find(c=>{const v=curCost(c);return v>=0&&v<=B.p.energy&&!['cur','sts'].includes(CARDS[c.id].type)&&CARDS[c.id].cost!==-2});if(c){playCard(c,al[0]);return 'play'}B.endWarn=B.turn;endTurn();return 'end'});
  if(['over','done','nob'].includes(st)){res=st+' turn'+(await p.evaluate(()=>B?B.turn:-1));break}}
 console.log(h,kind,res);await p.evaluate(()=>{const o=$('#ov');o.classList.remove('on');o.innerHTML=''});}}
console.log(er.slice(0,5));await b.close()})()
