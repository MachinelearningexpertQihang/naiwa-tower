/* SS 隐藏路线不会盖掉后门 / 镜之间 / 隐藏房间 / 酒馆（各 300 张随机地图） */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('file://'+process.env.NWT_FAST+'/index.html');await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{newRun();$('#ov').classList.remove('on');const res={};
 for(const [act,flagSet,kind] of [[3,{protoDone:1,ssArena:1},"ss4"],[4,{cupFriend:1,arenaDone:1},"ss5"],[2,{ssProto:1},"proto"]]){let lost=0,had=0,ok=0,sp=0;
  for(let i=0;i<300;i++){S.act=act;S.flags=Object.assign({},flagSet);S.hid={};S.row=-1;S.map=genMap();
   const fl=S.map.flat().filter(Boolean);const special=fl.filter(n=>["A","Y","Z","v","s","r"].includes(n.t)||n.story).map(n=>n.r+'_'+n.c+n.t);if(fl.some(n=>"AYZ".includes(n.t)))had++;
   if(kind==="proto")injectProto();else{const r0=injectRoute;injectSS()}
   const after=S.map.flat().filter(Boolean);const left=special.filter(k=>after.some(n=>n.r+'_'+n.c+n.t===k)).length;if(left<special.length)lost++;if(after.some(n=>n.hid))ok++}
  res[kind]={hadHidden:had,specialLost:lost,routeMade:ok}}return JSON.stringify(res)}));
console.log(er);await b.close()})();
