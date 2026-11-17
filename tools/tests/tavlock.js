/* 酒馆连点：猜拳、陈年忘忧酒一次只能弹一个窗口 */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,trainBase:1,train:{naiwa:1},wins:1}))});await p.reload();await p.waitForTimeout(1200);
await p.evaluate(()=>{newRun();$('#ov').classList.remove('on');S.act=1;S.gold=40;S.relics=["cup","ring","herb","cotton"];S.cur={t:"v"};tavernScreen();$('#talk').classList.remove('on')});await p.waitForTimeout(500);
console.log(await p.evaluate(async()=>{window.SHOP_LOCK=0;for(let i=0;i<5;i++)$('#tvForgetR').click();await sleep(100);const n1=document.querySelectorAll('.shopConf').length;document.querySelector('.rlOpt').click();await sleep(300);const r1=S.relics.length+' gold '+S.gold;
 window.SHOP_LOCK=0;for(let i=0;i<5;i++)$('#tvRps').click();await sleep(100);const n2=document.querySelectorAll('.shopConf').length;return 'forgetOverlays '+n1+' relics '+r1+' rpsOverlays '+n2}));
console.log(er);await b.close()})();
