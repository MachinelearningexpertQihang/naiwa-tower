// 逐帧渲染：给页面一个时间点，截一帧
const {chromium}=require('playwright');const fs=require('fs');const http=require('http');const path=require('path');
const ROOT=path.join(__dirname,'web');const args=process.argv.slice(2);const stills=args[0]==='--stills'?args[1].split(',').map(Number):null;
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png'};
const srv=http.createServer((q,s)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);s.end();return}s.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});s.end(d)})}).listen(8765);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__ready,null,{timeout:60000});
const out=path.join(__dirname,stills?'stills':'frames');fs.mkdirSync(out,{recursive:true});
const ts=stills||[...Array(30*30).keys()].map(i=>i/30);
for(let i=0;i<ts.length;i++){await p.evaluate(t=>window.renderAt(t),ts[i]);await p.screenshot({path:path.join(out,(stills?'s_'+ts[i]:String(i).padStart(4,'0'))+'.jpg'),type:'jpeg',quality:92});if(!stills&&i%150===0)console.log('frame',i)}
console.log(er.slice(0,5));await b.close();srv.close()})();
