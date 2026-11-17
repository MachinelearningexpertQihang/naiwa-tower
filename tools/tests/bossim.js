/* 11 个改过机制的首领 / 精英，各打 7 个回合 */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')er.push('C:'+m.text().slice(0,200))});
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,trainBase:1,train:{naiwa:1},wins:1}))});await p.reload();await p.waitForTimeout(1200);
const L=[["fourhead","B",3],["witch","B",1],["iceking","B",2],["youngyue","B",4],["cosmicegg","B",4],["bloodbeast","B",2],["curser","J",4],["curser2","J",4],["ss_champ","D",3],["ss_shield","D",3],["ss_archer","D",3]];
for(const [id,k,act] of L){
 await p.evaluate(([id,k,act])=>{gainXP=async()=>{};if(!S){newRun();$('#ov').classList.remove('on')}S.act=act;S.max=300;S.hp=300;S.map=genMap();S.fin=id==="curser2"?1:0;if(k==="B"){S.boss=id;startCombat("B")}else{S.pendGrp=[id];startCombat(k)}},[id,k,act]);
 await p.waitForTimeout(2600);await p.evaluate(()=>{$('#talk').classList.remove('on');$('#talk').onclick&&0});
 const log=[];
 for(let t=0;t<7;t++){const r=await p.evaluate(async()=>{if(!B||B.over)return 'over';$('#talk').classList.remove('on');busy=false;S.hp=Math.max(S.hp,150);try{await endTurn()}catch(e){return 'ERR '+e.message}const e=B.enemies[0];return `${e.hp}/${e.max} str${e.str||0} int:${e.intent&&e.intent.k}${e.intent&&e.intent.s?':'+e.intent.s:''} php${S.hp} neg${negKinds().join('')} n${B.alive().length}`});log.push(r);await p.waitForTimeout(300)}
 console.log(id,'\n  '+log.join('\n  '));
 await p.evaluate(()=>{if(B){B.over=1};B=null;$('#ov').classList.remove('on')});await p.waitForTimeout(300)}
console.log('ERR',er.slice(0,15));await b.close()})();
