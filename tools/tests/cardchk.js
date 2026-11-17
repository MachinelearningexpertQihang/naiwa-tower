/* 把所有卡牌的说明文字都算一遍，再把新卡逐张打出去 */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('file://'+process.env.NWT_REAL+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,trainBase:1,train:{naiwa:1}}))});await p.reload();await p.waitForTimeout(1200);
const r=await p.evaluate(async()=>{const bad=[];for(const k of Object.keys(CARDS)){for(const u of [0,1,2,3]){try{const t=String(CARDS[k].d(u));if(/undefined|NaN/.test(t))bad.push(k+':'+u+':'+t)}catch(e){bad.push(k+' '+e.message)}}}
// play every new card in a fight
newRun('egg',0);$('#ov').classList.remove('on');$('#talk').classList.remove('on');startCombat('m');await new Promise(r=>setTimeout(r,1500));$('#talk').classList.remove('on');
const ids=['e_hatch0','e_nestpow','e_hatchery','e_thousand','e_eggrain','e_guardnest','e_burst','e_omelet','e_quail','e_eggbomb','e_eggfort','e_salted','h_charge2','h_trample','h_gallop','h_stampede3','c_peckstorm','c_featherwall','c_rooster','dog_pack2','dog_howl','dog_fetch','d_tangle','d_shroom','d_freeze','d_mark','d_break','x_meteor','x_bigslam','w_hidemoon','w_halfmoon','w_rain','w_snow','w_wind'];
const perr=[];for(const id of ids){try{B.alive().forEach(e=>{e.hp=e.max=999});busy=false;B.myTurn=true;B.p.energy=9;const c=mk(id);B.hand.push(c);await playCard(c,CARDS[id].tgt?B.alive()[0]:undefined)}catch(e){perr.push(id+' '+e.message)}}
return {bad,perr,eggs:(B.eggs||[]).length,pool:POOL_HERO.length}});
console.log(JSON.stringify(r));console.log('ERR',er.slice(0,5));await b.close()})();
