/* 排行榜：云存档里记着的最好成绩会被拿回来并补传 */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.addInitScript(()=>{window.__sub=[];const cloudM={runs:1,lbBest:{2:155000000}};const s=JSON.stringify({v:1,t:1,m:cloudM,s:null});
 window.toy={getRankList:async()=>[],getMyRank:async()=>null,submitScore:async o=>{__sub.push(o);return true},getCloudStorage:async keys=>{if(keys[0]==="tw_m")return{tw_m:JSON.stringify({v:1,n:1})};return{tw_0:s}},setCloudStorage:async()=>true}});
await p.goto('file://'+process.env.NWT_REAL+'/index.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nwt-meta',JSON.stringify({tut:1,runs:50,wins:3}))});await p.reload();await p.waitForTimeout(9000);
console.log(await p.evaluate(()=>JSON.stringify({cloud:CLOUD.st,best:M.lbBest,sub:__sub})));console.log(er);await b.close()})();
