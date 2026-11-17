/* 排行榜：超大分数被平台拒收时自动改按 9999 万上传，并显示上传结果 */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.addInitScript(()=>{window.__sub=[];window.toy={getRankList:async()=>[],getMyRank:async()=>null,submitScore:async o=>{__sub.push(o);if(o.score>1e8)throw {code:40001,message:"score too large"};return true}}});
await p.goto('file://'+process.env.NWT_REAL+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,lbBest:{2:123456789,1:880}}))});await p.reload();await p.waitForTimeout(1500);
await p.evaluate(()=>rankScreen());await p.waitForTimeout(300);await p.evaluate(()=>{[...document.querySelectorAll('#ov .lbTabs [data-b]')][1].click()});await p.waitForTimeout(1500);
await p.screenshot({path:(process.env.NWT_OUT||'/tmp/nwt-test')+'/'+'lb1.png'});console.log(await p.evaluate(()=>JSON.stringify({sub:__sub,log:M.lbLog})));console.log(er);await b.close()})();
