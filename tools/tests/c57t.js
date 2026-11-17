/* 5.7：同伴气泡、同伴结局、支线道谢、坑人事件、SS 加长、阿岳的梦顺序、名人堂、真结局榜周目 */
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.NWT_OUT||'.')+'/c57';fs.mkdirSync(D,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))er.push('C:'+m.text())});
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,trainBase:1,train:{naiwa:1},wins:2,trueEnds:[{h:"mage",t:1700000000000,a:1,d:"hard",k:90,deck:28,mh:812}]}))});await p.reload();await p.waitForTimeout(1500);
const W=ms=>p.waitForTimeout(ms);const L=s=>console.log(s);const bad=[];const ok=(c,m)=>{if(!c){bad.push(m);L('  ✗ '+m)}else L('  ✓ '+m)};
const skipTalk=async(n=40)=>{for(let i=0;i<n;i++){const on=await p.evaluate(()=>$('#talk').classList.contains('on'));if(on){await p.evaluate(()=>{const s=$('#talk .tSkip');if(s)s.click();else $('#talk').click()});await W(120)}else await W(100)}};
const evClick=async(re)=>{await p.evaluate(r=>{const b=[...document.querySelectorAll('#event .evo')].find(x=>new RegExp(r).test(x.textContent));if(b)b.click();else throw new Error('no option '+r)},re.source||re);await W(400)};
const evText=()=>p.evaluate(()=>($('#evP')||{}).textContent||'');
// 名人堂
L('名人堂');ok(await p.evaluate(()=>!!$('#tHof2')&&!$('#tHof')),'名人堂按钮在、旧按钮没了');await p.screenshot({path:D+'/title.png'});
await p.evaluate(()=>$('#tHof2').click());await W(400);await p.screenshot({path:D+'/hof0.png'});
for(const t of [1,2]){await p.evaluate(t=>$$('#ov .hofTabs [data-t]')[t].click(),t);await W(300);await p.screenshot({path:D+'/hof'+t+'.png'})}
ok(await p.evaluate(()=>/最痛一击 812/.test($('#ov').textContent)),'真结局一行有最痛一击');await p.evaluate(()=>closeOv());
// 排行榜编码
L('排行榜');ok(await p.evaluate(()=>{newRun();$('#ov').classList.remove('on');S.diff="hard";LB.submit(3,1800);const v=M.lbBest[3];const d=LB.decode(3,v);return v===180000+asc()&&d.s===1800}),'真结局分藏了周目，能拆回来');
// 气泡：酒馆
L('气泡');await p.evaluate(()=>{gainXP=async()=>{};S.act=1;S.gold=200;S.comp={id:"blue",done:1,rel:1,alive:1};S.cur={t:"v"};tavernScreen();$('#talk').classList.remove('on')});await W(1200);
ok(await p.evaluate(()=>!!$('.cmpB.on')),'酒馆里阿蓝说话');await p.screenshot({path:D+'/bubble_tav.png'});
// 阿蓝：不管它
L('阿蓝');await p.evaluate(()=>{S.act=3;S.comp={id:"blue",done:2,rel:1};eventScreen("c_blue3")});await W(300);await evClick(/自己的事/);
await p.evaluate(()=>eventScreen("c_blue4"));await W(300);ok(/下辈子还/.test(await evText()),'台阶下只剩骰子');await evClick(/捡起骰子/);ok(await p.evaluate(()=>!!M.compEnds.blue_left&&S.relics.includes("comp_dice")),'阿蓝结局记下');
// 老铁：一起上
L('老铁 一起上');await p.evaluate(()=>{S.act=3;S.relics=[];S.comp={id:"iron",done:3,rel:2};S.flags.ssArena=1;S.dsq={st:5,g:100,hpFull:1};S.cur={t:"D",rs:S.rs};dsqStep()});await W(300);await skipTalk(10);
ok(await p.evaluate(()=>$$('#event .evo').length===3),'斗场门口三个选项');await p.screenshot({path:D+'/iron_gate.png'});
await evClick(/一起上/);await skipTalk(6);await W(300);ok(await p.evaluate(()=>!!$('#dqGo')),'回到斗场面板');
await p.evaluate(()=>$('#dqGo').click());await W(800);await skipTalk(20);await W(1500);
const hp0=await p.evaluate(()=>B&&B.enemies[0]&&B.enemies[0].hp);await p.evaluate(async()=>{await startTurn()});await W(400);const hp1=await p.evaluate(()=>B&&B.enemies[0]&&B.enemies[0].hp);
ok(hp1<hp0,'老铁每回合砍一刀 '+hp0+'→'+hp1);await p.screenshot({path:D+'/iron_battle.png'});
await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await W(2000);await skipTalk(40);ok(await p.evaluate(()=>S.flags.arenaDone===1),'斗场打完');
await p.evaluate(()=>eventScreen("c_iron4"));await W(300);ok(/站着送你/.test(await evText()),'星空之顶：站着送你');await evClick(/接过佩剑/);ok(await p.evaluate(()=>!!M.compEnds.iron_tog),'老铁结局记下');
// 老铁：不拦
L('老铁 不拦');await p.evaluate(()=>{S.act=3;S.flags.arenaDone=0;S.comp={id:"iron",done:3,rel:2};S.dsq={st:5,g:100,hpFull:1};S.cur={t:"D",rs:S.rs};dsqStep()});await W(300);await skipTalk(10);await evClick(/不拦他/);await skipTalk(50);await W(800);
ok(await p.evaluate(()=>S.flags.arenaDone===1&&S.comp.dead===1),'老铁替你打完');ok(await p.evaluate(()=>(S.postQ||[]).length>=1),'回地图时有后续');
await p.evaluate(()=>{S.map=genMap();S.row=-1;openMap()});await W(600);ok(await p.evaluate(()=>$('#talk').classList.contains('on')),'回地图放后续');await skipTalk(10);
await p.evaluate(()=>eventScreen("c_iron4"));await W(300);await evClick(/拔出来/);ok(await p.evaluate(()=>S.relics.includes("comp_sword2")),'磨了四十年的剑');
// 小火：抢人
L('小火');await p.evaluate(()=>{S.act=3;S.comp={id:"fire",done:2,rel:2,alive:1};S.cur={t:"q"};eventScreen("c_fire3")});await W(300);await evClick(/打工头/);await W(1200);
ok(await p.evaluate(()=>B&&B.enemies.some(e=>e.id==="scalddog")),'工头精英战');await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await W(1800);ok(await p.evaluate(()=>S.comp.freed===1),'哥哥抢出来了');
await p.evaluate(()=>{S.postQ=[];eventScreen("c_fire4")});await W(300);await evClick(/护身符/);ok(await p.evaluate(()=>!!M.compEnds.fire_home),'小火：回家');
// 豆子：拆过
L('豆子');await p.evaluate(()=>{S.act=2;S.comp={id:"bean",done:1,rel:2};eventScreen("c_bean2")});await W(300);await evClick(/打开看看/);await p.evaluate(()=>eventScreen("c_bean4"));await W(300);ok(/凉的也是长老煮的/.test(await evText()),'小七喝凉粥');await evClick(/陪它们/);ok(await p.evaluate(()=>S.relics.includes("comp_bento2")&&!!M.compEnds.bean_cold),'豆子：凉了的粥');
// 桂嫂：一窝
L('桂嫂');await p.evaluate(()=>{S.act=0;S.comp={id:"hen",done:-1,alive:1};eventScreen("c_hen0")});await W(300);await evClick(/一起找/);
await p.evaluate(()=>{S.act=1;eventScreen("c_hen1")});await W(300);await evClick(/^追/);
await p.evaluate(()=>{S.act=2;eventScreen("c_hen2")});await W(300);await evClick(/焐着/);
await p.evaluate(()=>{S.act=3;S.cur={t:"q"};eventScreen("c_hen3")});await W(300);ok(/钻出来一只/.test(await evText()),'焐的蛋孵出来了');await p.screenshot({path:D+'/hen3.png'});await evClick(/冲进去/);await W(1200);
await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await W(1800);ok(await p.evaluate(()=>S.comp.eggs),'蛋数 '+await p.evaluate(()=>S.comp.eggs));
await p.evaluate(()=>{S.postQ=[];S.act=4;eventScreen("c_hen4")});await W(300);await evClick(/接过小鸡/);ok(await p.evaluate(()=>!!M.compEnds.hen_full&&S.relics.includes("comp_chick")),'桂嫂：一窝');
// 支线道谢
L('支线');await p.evaluate(()=>{S.postQ=[];S.mside=null;jsideTake("m_hen");jsideTick("mob");jsideTick("mob")});ok(await p.evaluate(()=>S.mside.done===1&&S.postQ.length===1),'奶鸡一家回来道谢');
await p.evaluate(()=>{S.map=genMap();S.row=-1;openMap()});await W(600);await p.screenshot({path:D+'/thanks.png'});await skipTalk(10);
ok(await p.evaluate(()=>{S.act=4;S.cur={t:"q"};eventScreen("mq_rat");return true}),'mq 换层不报错');
// 坑人事件
L('坑人');for(const [k,a] of [["sc_holy",0],["sc_antique",1],["sc_warmer",2],["sc_star",4]]){await p.evaluate(([k,a])=>{S.act=a;S.gold=200;eventScreen(k)},[k,a]);await W(300);await evClick(/识破|翻过来|撕开|问它|打开一瓶/);ok(/继续前进/.test(await p.evaluate(()=>$('#event').textContent)),k)}
await p.evaluate(()=>{S.act=3;eventScreen("sc_fee")});await W(300);await p.screenshot({path:D+'/scam.png'});await evClick(/工牌/);await W(900);ok(await p.evaluate(()=>B&&B.kind==="m"),'识破收费的会打起来');await p.evaluate(()=>{B.enemies.forEach(e=>e.hp=0);win()});await W(1500);
// SS 路线
L('SS 路线');await p.evaluate(()=>{S.act=2;S.flags={ssProto:1};S.map=genMap();S.row=-1;injectProto()});ok(await p.evaluate(()=>S.map.flat().filter(n=>n&&n.hid).map(n=>n.t).join("")==="XLmLH"),'初号机路线 5 格: '+await p.evaluate(()=>S.map.flat().filter(n=>n&&n.hid).map(n=>n.t).join("")));
await p.evaluate(()=>{S.comp={id:"blue",done:2,rel:1};S.ssL={};enterNode("L")});await W(1200);ok(/翻倒的奶车/.test(await p.evaluate(()=>$('#event').textContent)),'第一段线索');await p.screenshot({path:D+'/ssl.png'});
await p.evaluate(()=>{S.act=4;S.flags={cupFriend:1};S.map=genMap();S.row=-1;injectSS()});await skipTalk(10);ok(await p.evaluate(()=>S.map.flat().filter(n=>n&&n.hid).map(n=>n.t).join("")==="ULmLJ"),'诅咒师路线 5 格');
await p.evaluate(()=>{S.act=3;S.flags={ssArena:1,protoDone:1};S.map=genMap();S.row=-1;injectSS()});ok(await p.evaluate(()=>S.map.flat().filter(n=>n&&n.hid).map(n=>n.t).join("")==="LPD"),'斗场路线 3 格');
// 梦
L('梦');const seq=[];await p.evaluate(()=>{S.dream=1;S.flags={};S.dreamDone=[];S.comp=null});for(let i=0;i<7;i++){await p.evaluate(()=>{S.cur={t:"q"};eventScreen()});await W(200);seq.push(await p.evaluate(()=>$('#event .ribbon').textContent));await p.evaluate(()=>{S.cur=null})}
L('  '+seq.join(' → '));ok(seq.join(',')==="泉边钓鱼,出发,留灯,一条毯子,预言家,塔顶,山下的灯",'梦按顺序讲');
await p.evaluate(()=>{S.dream=0});
ok(await p.evaluate(()=>STORY.dreamOut.some(x=>/又盛了一碗/.test(x[2]))),'梦醒尾声');
L('errors '+JSON.stringify(er));L(bad.length?'ERR '+bad.length+' '+JSON.stringify(bad):'ALL OK');await b.close()})();
