/* 5.6：新塔况的出牌偏向、新遗物、新天气月相牌、小院新成长 */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='warning'||(m.type()==='error'&&!/Failed to load/.test(m.text())))er.push('C:'+m.text().slice(0,160))});
await p.goto('file://'+process.env.NWT_FAST+'/index.html');
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,wins:2,lite:"off",up:{famEgg:2,famHorse:2,famChick:2,skyWx:2,skyMoon:1,skyStart:1,comboHeart:1,lastBreath:1,fastLearn:2,pocketM:3}}))});await p.reload();await p.waitForTimeout(1300);
const out=await p.evaluate(async()=>{const res=[];newRun();$('#ov').classList.remove('on');
 // mods: card bias
 for(const m of ["party","wxreport","moongod","curser","eggtower"]){S.mod=m;let hit=0,tot=0;for(let i=0;i<60;i++){offerCards(3,"C").forEach(c=>{tot++;if(modWants(c.id))hit++})}S.mod="sale";let base=0;for(let i=0;i<60;i++){offerCards(3,"C").forEach(c=>{if((S.mod=m,modWants(c.id)))base++;S.mod="sale"})}res.push(m+' bias '+Math.round(100*hit/tot)+'% vs '+Math.round(100*base/tot)+'%')}
 // relic + yard effects in a fight
 S.mod="lastegg";S.relics.push("r_saddle","r_horseshoe","r_carrot","r_featherpillow","r_rooster","r_henhouse","r_eggcarton","r_incubator","r_goldyolk","r_family","r_raingauge","r_icecrystal","r_kite","r_foglamp","r_stormcore","r_vane","r_seasons","r_moonvial");
 S.act=1;S.map=genMap();S.pendGrp=["butler","bride"];startCombat("m");await sleep(3000);$('#talk').classList.remove('on');B.alive().forEach(e=>{e.hp=e.max=999});
 res.push('eggs at start '+(B.eggs||[]).length+' wx '+B.wx);
 const play=async id=>{busy=false;B.myTurn=true;B.p.energy=9;const c=mk(id);B.hand.push(c);await playCard(c,B.alive()[0]);await sleep(400)};
 const h0=B.alive()[0].hp;const hid=Object.keys(CARDS).find(k=>CARDS[k].fam==="horse"&&CARDS[k].type==="atk"&&CARDS[k].tgt&&!CARDS[k].hero);res.push("horse "+hid+" "+CARDS[hid].d(0));await play(hid);res.push('horse card dmg '+(h0-B.alive()[0].hp));
 for(const id of Object.keys(CARDS).filter(k=>/^w_(drizzle|downpour|frostbite|blizzard|whirlwind|fogveil|thunderstep|moonrite)$/.test(k)))await play(id);
 res.push('after weather cards wx '+B.wx+' frost '+B.alive().map(e=>e.frost||0)+' wet '+B.alive().map(e=>e.wet||0)+' block '+B.p.block);
 for(let t=0;t<3;t++){try{await endTurn()}catch(e){res.push('ERR '+e.message)}await sleep(1500);busy=false}
 res.push('turn '+B.turn+' eggs '+(B.eggs||[]).length+' str '+B.p.str+' hp '+S.hp);
 S.hp=5;dmgPlayer(50,null,true);res.push('lastBreath hp '+S.hp);
 return res.join('\n')});
console.log(out);console.log('ERR',er.slice(0,10));await b.close()})();
