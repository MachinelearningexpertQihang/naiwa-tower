/* ===================== 奶蛙尖塔 · 原创配乐引擎 =====================
   全部用 WebAudio 实时合成，8 首原创曲子，不读任何音频文件。 */
const A={ctx:null,music:true,sfx:true,step:0,next:0,trk:null,cur:null};
try{const o=JSON.parse(localStorage.getItem("nwt-audio")||"{}");if(o.music===false)A.music=false;if(o.sfx===false)A.sfx=false}catch(e){}
const mtof=m=>440*Math.pow(2,(m-69)/12);
/* 4.2：手机切到后台再回来，声音常常会「哑掉」（状态显示还在播放其实没声音）。回来后第一次点屏幕时，把整套声音重新建一遍 */
function audioRebuild(){const old=A.ctx,cur=A.cur;A.ctx=null;try{old&&old.close&&old.close().catch(()=>{})}catch(e){}A.fxRev=null;try{if(typeof SX!=="undefined")SX.ok=0}catch(e){}const st=A.step;audioUnlock();A.cur=cur;A.step=st||0;if(A.ctx)A.next=A.ctx.currentTime+.1}
function audioUnlock(){if(A.ctx){if(document.hidden)return;if(A.wasBg){A.wasBg=0;A._sus=0;audioRebuild();return}if(A.ctx.state!=="running"){A.ctx.resume().catch(()=>{});clearTimeout(A._chk);A._chk=setTimeout(()=>{if(A.ctx&&A.ctx.state!=="running"&&!document.hidden)A.wasBg=1},400)}return}
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=new AC;A.ctx=c;
 const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;comp.connect(c.destination);
 A.out=c.createGain();A.out.gain.value=.9;A.out.connect(comp);
 A.fx=c.createGain();A.fx.gain.value=A.sfx?.6:0;A.fx.connect(A.out);
 A.bgmVol=.24;A.bgm=c.createGain();A.bgm.gain.value=A.music?A.bgmVol:0;A.bgm.connect(A.out);
 // 简单混响：两条反馈延迟
 A.rev=c.createGain();A.rev.gain.value=.22;const d1=c.createDelay(),d2=c.createDelay(),f1=c.createGain(),f2=c.createGain(),lp=c.createBiquadFilter();
 d1.delayTime.value=.137;d2.delayTime.value=.211;f1.gain.value=.38;f2.gain.value=.33;lp.type="lowpass";lp.frequency.value=2600;
 A.rev.connect(lp);lp.connect(d1);lp.connect(d2);d1.connect(f1);f1.connect(d1);d2.connect(f2);f2.connect(d2);d1.connect(A.bgm);d2.connect(A.bgm);
 const b=c.createBuffer(1,c.sampleRate,c.sampleRate),dd=b.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1;A.noise=b;
 c.onstatechange=()=>{if(A.ctx===c&&c.state!=="running"&&!A._sus)A.wasBg=1};
 if(c.resume)c.resume().catch(()=>{});A.next=c.currentTime+.1;if(!A.timer)A.timer=setInterval(sched,25);loadSF()}
document.addEventListener("visibilitychange",()=>{if(!A.ctx)return;if(document.hidden){A.hidAt=Date.now();A._sus=1;A.ctx.suspend&&A.ctx.suspend().catch(()=>{})}else{if(Date.now()-(A.hidAt||0)>800)A.wasBg=1;A.ctx.resume().then(()=>{A._sus=0}).catch(()=>{});A.next=Math.max(A.next,A.ctx.currentTime+.05)}});
addEventListener("pageshow",e=>{if(e.persisted&&A.ctx)A.wasBg=1});
/* 5.8.3：有的手机从后台回来不发 visibilitychange，或者声音被系统打断。三种办法都盯着：页面被冻住过（计时器断了一大截）、窗口失焦再回来、声音状态被系统改掉。下一次点屏幕就整套重建 */
setInterval(()=>{const n=Date.now();if(A.beat&&n-A.beat>2500&&A.ctx)A.wasBg=1;A.beat=n},1000);
addEventListener("blur",()=>{A.blurAt=Date.now()});addEventListener("focus",()=>{if(A.ctx&&A.blurAt&&Date.now()-A.blurAt>800)A.wasBg=1;A.blurAt=0});
addEventListener("pagehide",()=>{if(A.ctx)A.wasBg=1});
["pointerdown","touchend","click","keydown"].forEach(ev=>addEventListener(ev,audioUnlock,true));
function audioSave(){try{localStorage.setItem("nwt-audio",JSON.stringify({music:A.music,sfx:A.sfx}))}catch(e){}if(A.bgm)A.bgm.gain.value=A.music?(A.bgmVol||.24):0;if(A.fx)A.fx.gain.value=A.sfx?.6:0}

/* ---- 真实乐器采样（FluidR3 GM 音色库，Frank Wen，CC BY 3.0） ---- */
const SF={};let SF_N=4,SF_LOADING=0;
function loadSF(){if(SF_LOADING||!A.ctx)return;SF_LOADING=1;for(let i=0;i<SF_N;i++){const sc=document.createElement("script");sc.src="sf/sf"+i+".js?v="+(typeof VER!=="undefined"?VER:"1");sc.onload=()=>decodeSF();document.head.appendChild(sc)}}
function decodeSF(){const W=window.__NWT_SF||{};for(const inst in W){if(SF[inst])continue;SF[inst]={keys:[],buf:{}};const notes=W[inst];for(const m in notes){const bin=atob(notes[m]);const arr=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)arr[j]=bin.charCodeAt(j);
  const done=b=>{SF[inst].buf[m]=b;SF[inst].keys=Object.keys(SF[inst].buf).map(Number).sort((a,b)=>a-b)};try{const p=A.ctx.decodeAudioData(arr.buffer,done,()=>{});if(p&&p.then)p.then(done).catch(()=>{})}catch(e){}}delete W[inst]}}
function samp(inst,m,t,dur,vol,wet,dest){if(A.inS)vol*=A.vk;const I=SF[inst];if(!I||!I.keys.length||!A.ctx)return false;let k=I.keys[0];for(const x of I.keys)if(Math.abs(x-m)<Math.abs(k-m))k=x;const b=I.buf[k];if(!b)return false;
 const c=A.ctx,src=c.createBufferSource(),g=c.createGain();src.buffer=b;src.playbackRate.value=Math.pow(2,(m-k)/12);const end=Math.min(t+Math.max(.08,dur),t+b.duration/src.playbackRate.value);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.setValueAtTime(vol,Math.max(t+.01,end-.12));g.gain.linearRampToValueAtTime(0,end+.02);src.connect(g);g.connect(dest||A.bgm);const rv=dest?A.fxRev:A.rev;if(wet&&rv){const w=c.createGain();w.gain.value=wet;g.connect(w);w.connect(rv)}src.start(t);src.stop(end+.05);return true}
/* ---- 基础发声 ---- */
function tone(o){const c=A.ctx;if(!c)return;const t=o.t||c.currentTime,dur=o.dur||.15;
 const os=c.createOscillator(),g=c.createGain();os.type=o.type||"sine";os.frequency.setValueAtTime(o.f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+dur);
 if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=o.vibD||10;l.connect(lg);lg.connect(os.frequency);l.start(t+(o.vibDelay||0));l.stop(t+dur+.05)}
 const V=(o.vol||.3)*(A.inS?A.vk:1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(V,t+(o.att||.005));
 if(o.sus){g.gain.setValueAtTime(V,t+dur*o.sus)}g.gain.exponentialRampToValueAtTime(8e-4,t+dur);
 let n=os;if(o.filt){const f=c.createBiquadFilter();f.type=o.filt;f.frequency.value=o.ff||1e3;f.Q.value=o.q||1;os.connect(f);n=f}
 n.connect(g);g.connect(o.dest||A.fx);if(o.wet&&A.rev){const w=c.createGain();w.gain.value=o.wet;g.connect(w);w.connect(A.rev)}os.start(t);os.stop(t+dur+.05)}
function noise(o){const c=A.ctx;if(!c)return;const t=o.t||c.currentTime,dur=o.dur||.1;const s=c.createBufferSource();s.buffer=A.noise;
 const f=c.createBiquadFilter();f.type=o.filt||"bandpass";f.Q.value=o.q||1;f.frequency.setValueAtTime(o.f||1e3,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+dur);
 const g=c.createGain();g.gain.setValueAtTime((o.vol||.2)*(A.inS?A.vk:1),t);g.gain.exponentialRampToValueAtTime(8e-4,t+dur);s.connect(f);f.connect(g);g.connect(o.dest||A.fx);s.start(t,Math.random()*.5);s.stop(t+dur+.02)}
const SFX={boom(){const c=A.ctx;if(!c)return;const t=c.currentTime;tone({type:"sine",f:110,f2:32,t,dur:.55,vol:.6});noise({t,dur:.45,vol:.45,filt:"lowpass",f:1400,f2:160})}};

/* ---- 乐器 ---- */
const D=()=>A.bgm;
const INST={
 box:(m,t,l)=>{tone({type:"triangle",f:mtof(m),t,dur:l*1.6,vol:.17,dest:D(),wet:.5});tone({type:"sine",f:mtof(m+24),t,dur:l*.6,vol:.035,dest:D()})},
 pluck:(m,t,l)=>{tone({type:"triangle",f:mtof(m),t,dur:.35,vol:.2,dest:D(),wet:.35});tone({type:"sine",f:mtof(m)*3,t,dur:.08,vol:.04,dest:D()})},
 kalimba:(m,t,l)=>{tone({type:"sine",f:mtof(m),t,dur:.6,vol:.22,dest:D(),wet:.4});tone({type:"sine",f:mtof(m)*5.4,t,dur:.05,vol:.05,dest:D()})},
 square:(m,t,l)=>tone({type:"square",f:mtof(m),t,dur:l*.95,vol:.09,dest:D(),filt:"lowpass",ff:2400,sus:.6,wet:.2}),
 erhu:(m,t,l)=>tone({type:"sawtooth",f:mtof(m),t,dur:l*1.1,vol:.11,att:.04,dest:D(),filt:"lowpass",ff:1800,q:2,vib:5.5,vibD:mtof(m)*.012,vibDelay:.08,sus:.7,wet:.35}),
 brass:(m,t,l)=>{tone({type:"sawtooth",f:mtof(m),t,dur:l*1.05,vol:.11,att:.03,dest:D(),filt:"lowpass",ff:1100,sus:.7,wet:.25});tone({type:"sawtooth",f:mtof(m)*1.006,t,dur:l*1.05,vol:.06,att:.03,dest:D(),filt:"lowpass",ff:900,sus:.7})},
 bell:(m,t,l)=>{tone({type:"sine",f:mtof(m),t,dur:1.4,vol:.16,dest:D(),wet:.6});tone({type:"sine",f:mtof(m)*2.76,t,dur:.4,vol:.05,dest:D()});tone({type:"sine",f:mtof(m)*5.4,t,dur:.15,vol:.025,dest:D()})},
 organ:(m,t,l)=>{[1,2,3].forEach((h,i)=>tone({type:"sine",f:mtof(m)*h,t,dur:l*1.02,vol:[.12,.06,.035][i],att:.02,dest:D(),sus:.85,wet:.5}))},
 harpsi:(m,t,l)=>{tone({type:"square",f:mtof(m),t,dur:.28,vol:.07,dest:D(),filt:"lowpass",ff:3200,wet:.25});tone({type:"sawtooth",f:mtof(m)*2,t,dur:.12,vol:.03,dest:D(),filt:"highpass",ff:1200})},
 celesta:(m,t,l)=>{tone({type:"sine",f:mtof(m),t,dur:.9,vol:.18,dest:D(),wet:.55});tone({type:"sine",f:mtof(m)*4,t,dur:.18,vol:.04,dest:D(),wet:.4})},
 keys:(m,t,l)=>{tone({type:"sine",f:mtof(m),t,dur:l*1.1+.15,vol:.18,dest:D(),wet:.25,vib:4,vibD:2});tone({type:"triangle",f:mtof(m)*2,t,dur:.25,vol:.05,dest:D()})},
 synth:(m,t,l)=>{tone({type:"sawtooth",f:mtof(m),t,dur:l*.95,vol:.09,dest:D(),filt:"lowpass",ff:2600,q:4,sus:.6,wet:.2});tone({type:"sawtooth",f:mtof(m)*1.01,t,dur:l*.95,vol:.06,dest:D(),filt:"lowpass",ff:2000,sus:.6})},
 flute:(m,t,l)=>{tone({type:"sine",f:mtof(m),t,dur:l*1.2,vol:.16,att:.05,dest:D(),vib:5,vibD:mtof(m)*.008,vibDelay:.12,sus:.7,wet:.45});noise({t,dur:.08,vol:.02,f:mtof(m)*2,q:6,dest:D()})},
};
function bnote(m,t,d,v,fb){const S2=A.T&&A.T.s;if(S2&&S2.bass&&samp(S2.bass,m,t,Math.max(d,.2),Math.min(.9,v*2.6),.1))return;fb()}
const BASS={
 soft:(r,t,e,q)=>{if(e===0||e===4)bnote(r-12,t,q*3.5,.32,()=>tone({type:"sine",f:mtof(r-12),t,dur:q*3.5,vol:.32,dest:D(),filt:"lowpass",ff:400}))},
 walk:(r,t,e,q)=>{if(e%2===0){const m=r-12+[0,7,12,7][e/2];bnote(m,t,q*1.6,.24,()=>tone({type:"triangle",f:mtof(m),t,dur:q*1.6,vol:.24,dest:D(),filt:"lowpass",ff:700}))}},
 drive:(r,t,e,q)=>{const m=r-24+(e%2?12:0)+(e===7?7:0);bnote(m+12,t,q*.9,.13,()=>tone({type:"sawtooth",f:mtof(m),t,dur:q*.9,vol:.12,dest:D(),filt:"lowpass",ff:520,q:3}))},
 heavy:(r,t,e,q)=>{if(e!==3&&e!==7){bnote(r-12,t,q*.95,.16,()=>tone({type:"sawtooth",f:mtof(r-24),t,dur:q*.95,vol:.16,dest:D(),filt:"lowpass",ff:380,q:4}));tone({type:"sine",f:mtof(r-24),t,dur:q,vol:.16,dest:D()})}},
 none:()=>{}};
const kick=(t,v=.45)=>tone({type:"sine",f:150,f2:42,t,dur:.18,vol:v,dest:D()});
const snare=(t,v=.16)=>{noise({t,dur:.14,vol:v,filt:"highpass",f:1800,dest:D()});tone({type:"triangle",f:190,f2:140,t,dur:.08,vol:.1,dest:D()})};
const hat=(t,v=.05)=>noise({t,dur:.035,vol:v,filt:"highpass",f:7500,dest:D()});
const wood=(t,v=.12)=>tone({type:"sine",f:1250,t,dur:.06,vol:v,dest:D()});
const tom=(t,f,v=.25)=>tone({type:"sine",f,f2:f*.6,t,dur:.2,vol:v,dest:D()});
const DRUM={
 lofi:(t,e,bar)=>{if(e===0||e===5)kick(t,.3);if(e===4)snare(t,.08);if(e%2===0)hat(t,.03)},
 shaker:(t,e)=>{noise({t,dur:.05,vol:e%2?.03:.05,filt:"bandpass",f:6000,q:2,dest:D()});if(e===0)kick(t,.22)},
 drive:(t,e,bar)=>{if(e===0||e===3||e===4)kick(t);if(e===2||e===6)snare(t);hat(t,e%2?.03:.05);if(bar%4===3&&e>=6)tom(t,e===6?180:130)},
 boss:(t,e,bar)=>{if(e===0||e===3||e===5)kick(t,.55);if(e===4)snare(t,.22);if(e%2===1)hat(t,.04);if(bar%4===3&&e>=4)tom(t,[220,180,150,120][e-4],.3)},
 wood:(t,e,bar)=>{if(e===2||e===6||e===7)wood(t,e===7?.07:.12);if(e===0)kick(t,.25);if(e===4&&bar%2)noise({t,dur:.2,vol:.05,filt:"highpass",f:5000,dest:D()})},
 crickets:(t,e,bar)=>{if(e%4===1&&Math.random()<.6)for(let i=0;i<3;i++)tone({type:"sine",f:4200+Math.random()*300,t:t+i*.04,dur:.03,vol:.015,dest:D()})},
 doom:(t,e,bar)=>{if(e===0)kick(t,.75);if(e===3)kick(t,.45);if(e===4){kick(t,.6);snare(t,.18)}if(e===6&&bar%2)tom(t,110,.35);if(bar%4===3&&e>=4)tom(t,[160,130,110,90][e-4],.42);if(e%2===1)hat(t,.025);if(e===0&&bar%2===0)tone({type:"sine",f:41,t,dur:1.6,vol:.22,dest:D()})},
 factory:(t,e,bar)=>{if(e===0||e===4)kick(t,.42);if(e===2||e===6)snare(t,.14);if(e%2===1)tone({type:"square",f:2100,t,dur:.03,vol:.035,dest:D(),filt:"bandpass",ff:2400,q:8});if(e===7&&bar%2)noise({t,dur:.25,vol:.06,filt:"bandpass",f:800,f2:3000,q:3,dest:D()})},
 ice:(t,e,bar)=>{if(e===0||e===5)kick(t,.36);if(e===4)snare(t,.12);hat(t,e%2?.025:.045);if(e===7&&bar%2===1)tone({type:"sine",f:2637,t,dur:.4,vol:.04,dest:D(),wet:.5})},
 sparkle:(t,e,bar)=>{if(e%4===2&&Math.random()<.7)tone({type:"sine",f:mtof(88+[0,2,4,7,9][Math.floor(Math.random()*5)]),t,dur:.5,vol:.025,dest:D(),wet:.7});if(e===0&&bar%2===0)kick(t,.15)},
 waltz:(t,e,bar)=>{if(e===0)kick(t,.3);if(e===3||e===6)noise({t,dur:.08,vol:.05,filt:"highpass",f:4000,dest:D()})},
 none:()=>{}};
const CH=(r,q)=>{const iv={M:[0,4,7],m:[0,3,7],7:[0,4,7,10],m7:[0,3,7,10],M7:[0,4,7,11],sus:[0,5,7]}[q||"M"];return iv.map(i=>r+i)};

/* ---- 层主题曲 ---- */
const TR2={
 map1:{bpm:92,sw:0,lead:"organ",bass:"soft",dr:"waltz",pad:.05,ch:[[50,"m"],[46,"M"],[43,"m"],[45,"7"],[50,"m"],[53,"M"],[43,"m7"],[45,"7"]],
  mel:[62,0,65,69,0,74,72,69, 70,-1,-1,0,69,67,65,0, 67,0,70,74,0,77,76,74, 73,-1,-1,0,0,0,0,0, 74,0,77,81,0,79,77,76, 77,-1,74,0,72,-1,69,0, 70,0,74,72,70,69,67,65, 64,-1,-1,0,61,-1,-1,0]},
 battle1:{bpm:144,sw:0,lead:"harpsi",bass:"drive",dr:"drive",pad:.03,ch:[[50,"m"],[43,"m"],[45,"7"],[50,"m"]],
  mel:[74,73,74,77,74,73,74,0, 70,69,70,74,70,69,70,0, 69,0,73,76,79,0,76,73, 74,0,0,0,69,0,0,0, 77,76,77,81,77,76,77,0, 74,73,74,77,74,73,74,0, 73,74,76,77,79,77,76,73, 74,0,69,0,62,0,0,0]},
 map2:{bpm:76,sw:0,lead:"celesta",bass:"soft",dr:"none",pad:.06,bell:1,ch:[[52,"m"],[48,"M"],[43,"M"],[50,"M"],[52,"m"],[45,"m"],[47,"7"],[52,"m"]],
  mel:[76,0,0,79,0,0,83,0, 81,0,79,0,76,-1,-1,0, 72,0,0,76,0,0,79,0, 78,0,76,0,74,-1,-1,0, 76,0,79,0,83,0,88,0, 86,-1,84,0,83,0,81,0, 78,0,81,0,79,0,78,0, 76,-1,-1,-1,0,0,0,0]},
 battle2:{bpm:138,sw:0,lead:"square",bass:"drive",dr:"ice",pad:.03,bell:1,ch:[[52,"m"],[48,"M"],[50,"M"],[47,"7"]],
  mel:[76,0,79,0,83,0,79,76, 72,0,76,0,79,0,76,72, 74,0,78,0,81,0,78,74, 75,0,78,0,83,0,0,0, 88,0,86,83,0,79,83,0, 84,0,83,79,0,76,79,0, 81,79,78,0,74,0,78,0, 75,78,81,83,0,0,0,0]},
 map3:{bpm:112,sw:.2,lead:"keys",bass:"walk",dr:"factory",pad:.03,ch:[[53,"M"],[50,"m7"],[43,"m7"],[48,"7"]],
  mel:[72,0,69,72,0,74,0,77, 76,0,74,72,0,69,0,0, 70,0,74,77,0,74,70,0, 72,-1,-1,0,0,0,67,69, 72,0,77,0,76,74,72,0, 74,0,72,69,0,65,0,0, 67,0,70,74,72,70,67,64, 65,-1,-1,0,0,0,0,0]},
 battle3:{bpm:146,sw:0,lead:"synth",bass:"drive",dr:"factory",pad:0,ch:[[53,"m"],[49,"M"],[51,"M"],[48,"7"]],
  mel:[77,0,77,80,0,77,75,0, 73,0,73,77,0,75,73,72, 75,0,75,79,0,75,73,72, 72,0,76,0,79,0,76,0, 77,80,84,0,82,80,77,0, 80,77,73,0,75,73,77,0, 79,0,75,0,82,0,79,75, 76,0,72,0,76,79,84,0]},
 map4:{bpm:84,sw:0,lead:"flute",bass:"soft",dr:"sparkle",pad:.06,arp:1,ch:[[57,"M"],[54,"m"],[50,"M"],[52,"M"],[57,"M"],[49,"m"],[50,"M"],[52,"M"]],
  mel:[76,-1,-1,0,81,-1,80,0, 78,-1,76,0,73,-1,-1,0, 74,-1,78,0,81,-1,85,0, 83,-1,-1,-1,0,0,0,0, 88,-1,85,0,83,-1,81,0, 80,-1,81,0,83,-1,-1,0, 85,-1,83,0,81,-1,78,0, 80,-1,-1,-1,0,0,0,0]},
 battle4:{bpm:132,sw:0,lead:"brass",bass:"drive",dr:"drive",pad:.04,ch:[[57,"m"],[53,"M"],[48,"M"],[55,"M"]],
  mel:[81,0,0,84,0,83,81,0, 77,0,0,81,0,79,77,0, 76,0,79,84,0,83,79,0, 79,0,83,0,86,0,0,0, 88,0,86,84,0,83,81,0, 84,0,83,81,0,77,76,0, 77,79,81,0,83,0,84,0, 83,0,79,0,74,0,0,0]},
};
/* ---- 原创曲目（每首 64 个八分音符；0 = 休止，-1 = 延长） ---- */
const TR={
 // 标题「月下尖塔」：音乐盒，慢
 title:{bpm:80,sw:.12,lead:"box",bass:"soft",dr:"none",pad:.05,ch:[[57,"m"],[53,"M7"],[48,"M"],[55,"sus"],[57,"m"],[53,"M"],[50,"m7"],[52,"7"]],
  mel:[76,0,72,0,69,0,72,76, 77,0,76,72,0,0,69,0, 72,0,74,76,79,0,76,0, 74,0,72,74,71,0,0,0, 76,0,81,0,79,77,76,0, 77,0,74,72,74,0,0,0, 72,74,76,0,74,72,69,0, 71,0,68,0,69,0,0,0]},
 // 地图「泥沼漫步」：卡林巴 + 沙锤
 map:{bpm:100,sw:.18,lead:"kalimba",bass:"walk",dr:"shaker",pad:.03,ch:[[50,"M"],[47,"m"],[43,"M"],[45,"M"]],
  mel:[74,0,78,81,0,78,74,0, 71,0,74,78,76,0,0,0, 79,0,78,76,0,74,71,0, 76,0,74,0,73,0,0,0, 74,76,78,0,81,0,83,81, 78,0,76,74,0,71,74,0, 79,78,76,0,78,0,74,0, 73,0,76,0,74,0,0,0]},
 // 战斗「蛙拳」：方波 + 驱动鼓
 battle:{bpm:134,sw:0,lead:"square",bass:"drive",dr:"drive",pad:0,ch:[[52,"m"],[48,"M"],[50,"M"],[47,"7"]],
  mel:[76,0,76,79,0,76,74,0, 72,0,72,76,0,74,72,71, 74,0,74,78,0,74,72,71, 71,0,75,0,78,0,75,0, 76,79,83,0,81,79,76,0, 79,76,72,0,74,72,76,0, 78,0,74,0,81,0,78,74, 75,0,71,0,75,78,83,0]},
 // 精英「紫晶回廊」：铜管 + 和声小调
 elite:{bpm:140,sw:0,lead:"brass",bass:"drive",dr:"drive",pad:0,ch:[[50,"m"],[46,"M"],[43,"m"],[45,"7"]],
  mel:[74,0,77,0,81,0,77,74, 70,0,74,77,0,74,70,0, 79,0,77,74,0,70,67,0, 73,0,76,0,79,0,81,0, 86,0,84,81,0,77,74,0, 82,0,81,77,0,74,70,0, 79,77,74,0,77,74,70,0, 73,76,79,82,81,0,0,0]},
 // 首领「沼泽之王」：低音铜管 + 重鼓
 boss:{bpm:122,sw:0,lead:"brass",bass:"heavy",dr:"boss",pad:.04,ch:[[48,"m"],[44,"M"],[41,"m"],[43,"7"]],
  mel:[72,0,0,75,0,0,79,0, 80,0,79,0,75,0,72,0, 77,0,0,80,0,0,84,0, 83,0,79,0,74,0,71,0, 72,75,79,84,0,82,80,79, 80,0,77,0,75,0,72,0, 77,80,84,0,82,0,80,79, 79,0,83,0,86,0,0,0]},
 // 层末首领「塔顶不能没有人」：慢、低、弗里几亚小调，重鼓 + 低音嗡鸣
 final:{bpm:96,sw:0,lead:"brass",bass:"heavy",dr:"doom",pad:.07,ch:[[48,"m"],[49,"M"],[46,"m"],[43,"7"],[48,"m"],[49,"M"],[44,"M"],[43,"7"]],
  mel:[60,-1,-1,0,63,-1,61,0, 60,-1,-1,0,0,0,0,0, 58,-1,-1,0,61,-1,60,0, 58,-1,55,-1,0,0,0,0, 67,-1,-1,0,68,-1,67,0, 65,-1,63,-1,61,-1,0,0, 63,-1,61,0,60,-1,58,0, 55,-1,-1,-1,59,-1,-1,0]},
 // 商店「夜市灯笼」：二胡 + 木鱼（五声音阶）
 shop:{bpm:108,sw:.15,lead:"erhu",bass:"walk",dr:"wood",pad:0,ch:[[50,"M"],[45,"sus"],[47,"m"],[45,"M"]],
  mel:[74,-1,76,78,81,-1,78,76, 74,0,71,74,76,-1,0,0, 78,-1,81,83,81,78,76,0, 74,76,71,0,69,-1,0,0, 81,-1,83,81,78,0,76,78, 81,0,78,76,74,-1,0,0, 71,74,76,0,78,76,74,71, 69,0,71,0,74,-1,-1,0]},
 // 休息「篝火」：拨弦琶音 + 蟋蟀
 rest:{bpm:72,sw:.1,lead:"pluck",bass:"soft",dr:"crickets",pad:.04,arp:1,ch:[[48,"M7"],[45,"m7"],[41,"M7"],[43,"sus"]],
  mel:[0,0,0,0,76,0,0,0, 0,0,0,0,72,0,74,0, 0,0,0,0,69,0,0,0, 0,0,67,0,0,0,0,0, 0,0,0,0,79,0,76,0, 0,0,0,0,77,0,0,0, 0,0,76,0,74,0,72,0, 0,0,0,0,74,0,0,0]},
 // 事件「雾中」：钟声 + 长笛
 event:{bpm:88,sw:0,lead:"flute",bass:"soft",dr:"none",pad:.05,bell:1,ch:[[50,"m"],[48,"M"],[46,"M7"],[45,"sus"]],
  mel:[74,-1,-1,0,77,-1,76,0, 74,-1,72,0,69,-1,-1,0, 70,-1,72,0,74,-1,77,0, 76,-1,-1,-1,0,0,0,0, 81,-1,79,0,77,-1,76,0, 74,-1,76,0,77,-1,-1,0, 79,-1,77,0,76,-1,74,0, 73,-1,-1,-1,0,0,0,0]},
};
Object.assign(TR,TR2);
/* ---- 5.x 新曲 ---- */
Object.assign(TR,{
 // 隐藏房间「铁门后面」：快、低音鼓、铜管，一直往前推
 hidroom:{bpm:150,sw:0,lead:"brass",bass:"heavy",dr:"boss",pad:.03,ch:[[45,"m"],[45,"m"],[41,"M"],[43,"M"],[45,"m"],[48,"M"],[40,"7"],[40,"7"]],
  mel:[69,0,72,0,76,0,72,69, 77,0,76,0,72,0,0,0, 69,0,72,0,76,0,79,0, 76,-1,-1,0,74,0,72,0, 81,0,79,0,77,0,76,0, 77,0,76,0,74,0,72,0, 71,0,72,0,74,0,76,0, 68,-1,-1,-1,0,0,0,0]},
 // 酒馆「多倒一杯」：摇摆、行走低音、电钢琴
 tavern:{bpm:116,sw:.28,lead:"keys",bass:"walk",dr:"lofi",pad:.04,ch:[[48,"M7"],[45,"m7"],[50,"m7"],[43,"7"],[48,"M7"],[52,"m7"],[50,"m7"],[43,"7"]],
  mel:[76,0,79,0,81,-1,79,76, 74,0,0,72,0,0,0,0, 72,0,74,0,76,0,79,0, 77,-1,-1,0,0,0,74,0, 76,0,79,0,84,-1,83,81, 79,0,0,76,0,0,74,0, 72,0,74,76,77,0,74,71, 72,-1,-1,-1,0,0,0,0]},
 // 胜利「数战利品」：亮、短句、沙锤
 // 寂静之海「水底的路」：很慢，钢片琴 + 远处的钟，几乎没有鼓
 sea:{bpm:66,sw:0,lead:"celesta",bass:"soft",dr:"none",pad:.07,bell:1,ch:[[50,"m"],[46,"M7"],[43,"m7"],[45,"sus"],[50,"m"],[53,"M"],[48,"M"],[45,"7"]],
  mel:[74,-1,-1,0,0,0,77,0, 76,-1,-1,0,74,0,0,0, 69,-1,-1,0,0,0,72,0, 74,-1,-1,-1,0,0,0,0, 81,-1,-1,0,79,0,77,0, 76,-1,-1,0,72,0,0,0, 74,0,0,76,0,0,73,0, 74,-1,-1,-1,0,0,0,0]},
 // 海底守墓者：重鼓、管风琴、半音往下走
 seaboss:{bpm:120,sw:0,lead:"organ",bass:"heavy",dr:"doom",pad:.04,ch:[[50,"m"],[49,"M"],[48,"M"],[47,"m"],[46,"M"],[45,"7"],[50,"m"],[45,"7"]],
  mel:[74,0,0,73,0,0,72,0, 71,0,0,70,0,0,69,0, 74,0,77,0,81,0,80,0, 81,-1,-1,0,0,0,0,0, 86,0,0,85,0,0,84,0, 83,0,82,0,81,0,0,0, 77,0,76,0,74,0,73,0, 74,-1,-1,-1,0,0,0,0]},
 // 岔路「小路」：拨弦 + 木鱼，轻快
 junc:{bpm:100,sw:.15,lead:"pluck",bass:"walk",dr:"wood",pad:.04,ch:[[55,"M"],[52,"m"],[48,"M"],[50,"7"]],
  mel:[79,0,81,0,83,0,79,0, 76,0,0,79,0,0,0,0, 72,0,74,0,76,0,79,0, 78,-1,-1,0,0,0,0,0, 83,0,81,0,79,0,76,0, 74,0,76,0,79,0,0,0, 81,0,79,0,76,0,74,0, 79,-1,-1,-1,0,0,0,0]},
 // 镜之间「另一个你」：大键琴，左右手互相模仿
 mirror:{bpm:126,sw:0,lead:"harpsi",bass:"drive",dr:"ice",pad:.03,ch:[[52,"m"],[52,"m"],[48,"M"],[47,"7"]],
  mel:[76,79,83,79,76,79,83,0, 83,79,76,79,83,79,76,0, 72,76,79,76,72,76,79,0, 75,78,83,0,0,0,0,0, 88,86,84,83,81,79,78,0, 76,78,79,81,83,84,86,0, 84,83,81,79,78,76,75,0, 76,-1,-1,-1,0,0,0,0]},
 // 奶茶厂后门「流水线」：工厂节奏、方波，越来越密
 backdoor:{bpm:140,sw:0,lead:"square",bass:"drive",dr:"factory",pad:.02,ch:[[53,"m"],[51,"M"],[49,"M"],[48,"7"]],
  mel:[77,77,0,77,80,0,77,0, 75,75,0,75,79,0,75,0, 73,73,0,73,77,0,80,0, 79,0,76,0,72,0,0,0, 77,80,84,80,77,80,84,0, 75,79,82,79,75,79,82,0, 73,77,80,77,73,77,80,0, 79,-1,72,0,0,0,0,0]},
 // 主页「星空下的泉」：慢三拍，钢片琴 + 竖琴分解，很轻
 homemain:{bpm:84,sw:0,lead:"celesta",bass:"soft",dr:"waltz",pad:.07,arp:1,bell:1,ch:[[53,"M7"],[50,"m7"],[46,"M7"],[48,"sus"],[53,"M7"],[57,"m"],[46,"M"],[48,"7"]],
  mel:[77,-1,-1,81,-1,84,83,-1, 81,-1,-1,77,-1,-1,0,0, 74,-1,-1,77,-1,81,79,-1, 77,-1,-1,-1,-1,-1,0,0, 84,-1,-1,86,-1,88,86,-1, 84,-1,81,-1,79,-1,0,0, 81,-1,79,-1,77,-1,76,-1, 77,-1,-1,-1,-1,-1,0,0]},
 victory:{bpm:104,sw:.1,lead:"celesta",bass:"soft",dr:"shaker",pad:.05,arp:1,ch:[[53,"M"],[50,"m"],[46,"M"],[48,"M"],[53,"M"],[57,"m"],[46,"M"],[48,"sus"]],
  mel:[77,0,81,0,84,0,0,81, 82,0,81,0,77,0,0,0, 74,0,77,0,81,0,82,0, 84,-1,-1,0,0,0,0,0, 89,0,88,0,84,0,81,0, 82,0,84,0,86,0,0,0, 84,0,82,0,81,0,79,0, 77,-1,-1,-1,0,0,0,0]}
});
/* ---- 4.0 新曲 ---- */
Object.assign(TR,{
 // 梦境层「隔着水的回忆」：慢华尔兹，钢片琴 + 竖琴，全音阶带一点飘
 dream:{bpm:84,sw:0,lead:"celesta",bass:"soft",dr:"waltz",pad:.06,arp:1,bell:1,ch:[[52,"M7"],[54,"M"],[52,"M7"],[54,"M"],[49,"m7"],[54,"sus"],[52,"M7"],[47,"7"]],
  mel:[76,-1,-1,80,-1,83,82,-1, -1,80,-1,78,76,-1,-1,0, 78,-1,-1,82,-1,85,83,-1, -1,82,80,-1,78,-1,-1,0, 76,-1,80,83,-1,88,87,-1, 85,-1,83,-1,80,-1,78,-1, 76,-1,78,80,-1,82,83,-1, 80,-1,-1,-1,-1,-1,0,0]},
 // 最终之地「紫色裂隙」：低音管风琴 + 定音鼓，减和弦
 fin:{bpm:104,sw:0,lead:"organ",bass:"heavy",dr:"doom",pad:.06,ch:[[45,"m"],[46,"M"],[45,"m"],[44,"M"],[45,"m"],[41,"M"],[43,"m"],[44,"7"]],
  mel:[69,0,72,0,75,-1,74,0, 70,-1,-1,0,69,0,0,0, 69,0,72,0,77,-1,76,72, 68,-1,-1,-1,0,0,0,0, 81,-1,80,0,77,-1,76,0, 74,-1,72,0,70,-1,69,0, 72,0,75,0,79,-1,77,75, 76,-1,-1,-1,80,-1,-1,0]},
 // 魔椅之战「你自己的声音」：极慢的心跳低音 + 管风琴，越打越快（rage）
 chair:{bpm:88,sw:0,lead:"organ",bass:"heavy",dr:"doom",pad:.08,bell:1,ch:[[48,"m"],[48,"m"],[51,"M"],[50,"m"],[48,"m"],[44,"M"],[46,"M"],[43,"7"]],
  mel:[60,-1,-1,-1,63,-1,62,-1, 60,-1,-1,-1,0,0,0,0, 67,-1,-1,-1,68,-1,67,-1, 65,-1,63,-1,62,-1,0,0, 72,-1,-1,0,71,-1,-1,0, 68,-1,-1,0,67,-1,65,-1, 63,-1,62,-1,60,-1,59,-1, 60,-1,-1,-1,-1,-1,-1,0]},
 // 回忆关「旧照片」：八音盒 + 弦乐长音，像老唱片
 memo:{bpm:76,sw:.12,lead:"box",bass:"soft",dr:"none",pad:.05,arp:1,ch:[[53,"M"],[50,"m"],[46,"M"],[48,"7"]],
  mel:[77,-1,76,77,81,-1,-1,0, 79,-1,77,76,74,-1,-1,0, 72,-1,74,76,77,-1,79,0, 76,-1,-1,-1,0,0,0,0, 81,-1,79,81,84,-1,-1,0, 82,-1,81,79,77,-1,76,0, 74,-1,76,77,79,-1,76,0, 77,-1,-1,-1,0,0,0,0]},
 // 隐藏首领「铁皮之心」：机械感的方波琶音 + 工厂鼓
 proto:{bpm:132,sw:0,lead:"synth",bass:"drive",dr:"factory",pad:.03,ch:[[50,"m"],[50,"m"],[46,"M"],[48,"M"]],
  mel:[74,77,81,77,74,77,81,77, 74,77,81,86,84,81,77,74, 70,74,77,74,70,74,77,74, 72,76,79,84,83,79,76,72, 74,0,74,0,77,0,81,0, 82,-1,81,-1,79,-1,77,-1, 74,77,81,86,84,81,79,77, 76,-1,-1,-1,72,-1,-1,0]},
 // 谢幕「泉水回来了」：大调，竖琴 + 长笛，慢慢长大
 credits:{bpm:80,sw:.08,lead:"flute",bass:"soft",dr:"none",pad:.06,arp:1,bell:1,ch:[[48,"M"],[43,"M"],[45,"m"],[41,"M"],[48,"M"],[43,"M"],[41,"M"],[43,"sus"]],
  mel:[72,-1,-1,76,79,-1,-1,0, 79,-1,77,76,74,-1,-1,0, 76,-1,-1,72,69,-1,72,0, 77,-1,-1,-1,0,0,0,0, 84,-1,-1,83,81,-1,79,0, 76,-1,77,79,81,-1,-1,0, 77,-1,76,74,72,-1,74,0, 72,-1,-1,-1,-1,-1,0,0]}});

const ORCH={
 title:{lead:"music_box",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp"},
 map:{lead:"kalimba",bass:"acoustic_bass",arp:"acoustic_guitar_nylon",perc:"wood"},
 battle:{lead:"pizzicato_strings",dbl:"marimba",bass:"acoustic_bass",stab:"string_ensemble_1",perc:"taiko"},
 elite:{lead:"trumpet",bass:"cello",pad:"string_ensemble_1",perc:"timp"},
 boss:{lead:"french_horn",dbl:"trumpet",bass:"cello",pad:"string_ensemble_1",perc:"taiko"},
 final:{lead:"church_organ",dbl:"french_horn",bass:"cello",pad:"string_ensemble_1",perc:"timp",bells:1},
 shop:{lead:"fiddle",bass:"acoustic_bass",arp:"acoustic_guitar_nylon",perc:"wood"},
 rest:{lead:"orchestral_harp",bass:"cello",arp:"acoustic_guitar_nylon",pad:"string_ensemble_1"},
 event:{lead:"flute",bass:"cello",pad:"string_ensemble_1",bells:1},
 secret:{lead:"celesta",dbl:"music_box",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp",bells:1},
 map1:{lead:"church_organ",dbl:"harpsichord",bass:"cello",pad:"string_ensemble_1"},
 battle1:{lead:"harpsichord",bass:"cello",stab:"string_ensemble_1",perc:"timp"},
 map2:{lead:"celesta",dbl:"music_box",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp"},
 battle2:{lead:"pizzicato_strings",dbl:"celesta",bass:"acoustic_bass",stab:"string_ensemble_1",perc:"taiko",bells:1},
 map3:{lead:"acoustic_grand_piano",bass:"acoustic_bass",arp:"acoustic_guitar_nylon",perc:"wood"},
 battle3:{lead:"trumpet",dbl:"acoustic_grand_piano",bass:"acoustic_bass",stab:"acoustic_grand_piano",perc:"taiko"},
 map4:{lead:"flute",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp",bells:1},
 battle4:{lead:"french_horn",dbl:"trumpet",bass:"cello",pad:"string_ensemble_1",stab:"string_ensemble_1",perc:"timp"}};
Object.assign(ORCH,{
 dream:{lead:"celesta",dbl:"music_box",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp",bells:1},
 fin:{lead:"church_organ",dbl:"french_horn",bass:"cello",pad:"string_ensemble_1",perc:"timp",bells:1},
 chair:{lead:"church_organ",dbl:"cello",bass:"cello",pad:"string_ensemble_1",perc:"timp",bells:1},
 memo:{lead:"music_box",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp"},
 proto:{lead:"marimba",dbl:"pizzicato_strings",bass:"acoustic_bass",stab:"string_ensemble_1",perc:"taiko"},
 credits:{lead:"flute",dbl:"orchestral_harp",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp",bells:1}});
for(const k in ORCH)if(TR[k])TR[k].s=ORCH[k];

/* ---- 5.5 SS 线专属曲 ---- */
Object.assign(TR,{
 // 死斗场「空看台」：号角、重鼓，像对着空场子报幕
 dsq:{bpm:138,sw:0,lead:"brass",bass:"heavy",dr:"boss",pad:.03,ch:[[45,"m"],[43,"M"],[41,"M"],[40,"7"],[45,"m"],[43,"M"],[41,"M"],[40,"7"]],
  mel:[69,0,69,72,0,76,0,0, 74,0,72,0,71,0,69,0, 69,0,69,72,0,77,0,0, 76,-1,-1,0,0,0,0,0, 81,0,79,0,77,0,76,0, 77,0,76,0,74,0,72,0, 71,0,72,0,74,0,71,0, 69,-1,-1,-1,0,0,0,0]},
 // 不灭的斗士「第一千零一场」：机器一样的低音，铜管一下一下往下砸
 champ:{bpm:112,sw:0,lead:"brass",bass:"heavy",dr:"factory",pad:.04,ch:[[40,"m"],[40,"m"],[48,"M"],[47,"7"],[40,"m"],[45,"m"],[48,"M"],[47,"7"]],
  mel:[64,0,0,64,0,0,67,0, 66,0,0,64,0,0,62,0, 64,0,0,64,0,0,71,0, 70,-1,-1,0,0,0,0,0, 76,0,0,74,0,0,72,0, 71,0,0,72,0,0,74,0, 76,0,79,0,78,0,75,0, 76,-1,-1,-1,0,0,0,0]},
 // 预言家「已告知影」：八音盒，慢，半音往下滑
 curser:{bpm:84,sw:0,lead:"celesta",bass:"soft",dr:"waltz",pad:.06,bell:1,ch:[[50,"m"],[46,"M"],[43,"m"],[45,"7"],[50,"m"],[46,"M7"],[43,"m"],[45,"7"]],
  mel:[74,0,77,0,76,0,73,0, 74,-1,-1,0,0,0,0,0, 70,0,74,0,73,0,70,0, 69,-1,-1,0,0,0,0,0, 81,0,80,0,77,0,76,0, 74,0,73,0,70,0,69,0, 70,0,0,73,0,0,76,0, 74,-1,-1,-1,0,0,0,0]},
 // 秘密房间「没人来过的屋子」：「雾中」的旋律放慢一点，钢片琴和八音盒，轻轻摇摆
 secret:{bpm:80,sw:.18,lead:"celesta",bass:"soft",dr:"none",pad:.06,bell:1,arp:1,ch:[[50,"m7"],[48,"M7"],[46,"M7"],[45,"sus"],[50,"m7"],[43,"m7"],[46,"M7"],[45,"7"]],
  mel:[74,-1,-1,0,77,-1,76,0, 74,-1,72,0,69,-1,-1,0, 70,-1,72,0,74,-1,79,0, 77,-1,-1,-1,0,0,0,0, 81,-1,79,0,77,-1,76,0, 74,-1,76,0,77,-1,-1,0, 79,-1,81,0,82,-1,81,0, 74,-1,-1,-1,0,0,0,0]},
 // 二番战「深渊里没有结局」：同一段旋律，换成管风琴和重鼓
 curser2:{bpm:132,sw:0,lead:"organ",bass:"heavy",dr:"doom",pad:.05,ch:[[50,"m"],[46,"M"],[43,"m"],[45,"7"],[50,"m"],[46,"M7"],[43,"m"],[45,"7"]],
  mel:[74,0,77,0,76,0,73,0, 74,0,0,86,0,0,85,0, 70,0,74,0,73,0,70,0, 69,0,0,81,0,0,80,0, 81,0,80,0,77,0,76,0, 74,0,73,0,70,0,69,0, 70,0,73,0,76,0,79,0, 74,-1,-1,-1,0,0,0,0]}
});
const TVOL={"secret":1.3,"dsq":1.0,"champ":1.0,"curser":1.35,"curser2":0.95,"homemain":1.4,"sea":1.4,"seaboss":1.0,"junc":1.3,"mirror":1.05,"backdoor":1.0,"hidroom":1.0,"tavern":1.35,"victory":1.3,"title":1.36,"map":1.38,"battle":0.99,"elite":1.07,"boss":1.02,"final":0.94,"shop":1.45,"rest":1.43,"event":1.23,"map1":1.38,"battle1":0.98,"map2":1.35,"battle2":1.15,"map3":1.0,"battle3":1.23,"map4":1.08,"battle4":1.14,"dream":1.12,"fin":0.91,"chair":0.91,"memo":1.38,"proto":1.1,"credits":1.1};
function harmUnder(m,chord){let best=null;for(const c of chord)for(const o of [12,24,36]){const n=c+o;if(n<m-2&&n>=m-9&&(best===null||n>best))best=n}return best}
/* ---- 5.8 编曲：每首歌不再只是 8 小节循环 ----
   一轮 = 主歌 A → 变奏 A2 → 副歌 B →（快歌再来一遍副歌 B2）→ 间奏 Br，然后回到 A。
   副歌的和弦、旋律从原曲推出来；变奏加经过音；间奏只留长音，鼓停下。
   每个音有轻重（强拍重、弱拍轻，副歌整体更响），时间上有一点点误差，听起来像人在弹。
   也可以像 battle0 那样，直接手写 parts / order。 */
const ROLE_K={A:.86,A2:.95,B:1.08,B2:1.12,Br:.7};
function scaleOf(r0,minor){return(minor?[0,2,3,5,7,8,10,11]:[0,2,4,5,7,9,11]).map(x=>(r0+x)%12)}
function snapTo(n,pcs){for(let d=0;d<7;d++){if(pcs.includes(((n-d)%12+12)%12))return n-d;if(pcs.includes((n+d)%12))return n+d}return n}
function melVar(mel,sc){const m=mel.slice();for(let i=1;i<m.length-1;i++){if(m[i]!==0)continue;let p=i-1;while(p>0&&m[p]===-1)p--;const a=m[p],b=m[i+1];if(a>0&&b>0&&Math.abs(b-a)>=3&&(i%8)!==0)m[i]=snapTo(Math.round((a+b)/2),sc)}return m}
function mkSecs(T,order){const out=[];(order||[]).forEach(([k,role])=>{const P=T.parts[k];const sc=P.sc||T.sc||scaleOf(P.ch[0][0],/^m/.test(P.ch[0][1]));out.push({mel:role==="A2"||role==="B2"?melVar(P.mel,sc):P.mel,ch:P.ch,role,dr:P.dr,lead:P.lead})});return out}
function buildArr(T){if(T._arr)return T._arr;const secs=[];
 if(T.parts){if(T.parts.I&&!T._intro)T._intro=mkSecs(T,[["I","Br"]])[0];if(T.order2&&!T._arr2)T._arr2=mkSecs(T,T.order2);return T._arr=mkSecs(T,T.order)}
 const mel=T.mel,bars=Math.round(mel.length/(T.bl||8)),chs=[...Array(bars)].map((_,b)=>T.ch[b%T.ch.length]);const [r0,q0]=T.ch[0];const minor=/^m/.test(q0);const sc=scaleOf(r0,minor);
 const deg=minor?[[8,"M"],[10,"M"],[0,"m"],[7,"7"],[5,"m"],[8,"M"],[10,"M"],[7,"7"]]:[[5,"M"],[7,"M"],[4,"m"],[9,"m"],[5,"M"],[7,"M"],[0,"M"],[7,"7"]];
 const bch=deg.map(([d,ty])=>{let r=r0+d;if(r>r0+5)r-=12;return[r,ty]});
 const order=[4,5,6,7,0,1,2,3];const bmel=[];order.forEach((ob,nb)=>{const pcs=CH(bch[nb][0],bch[nb][1]).map(x=>x%12);for(let e=0;e<8;e++){const n=mel[(ob*8+e)%mel.length];bmel.push(n>0?(e===0||e===4?snapTo(n,pcs):snapTo(n,sc)):n)}});
 if(bmel[0]===-1)bmel[0]=snapTo(72,CH(bch[0][0],bch[0][1]).map(x=>x%12));
 const br=[];for(let b=0;b<4;b++)for(let e=0;e<8;e++){const n=mel[b*8+e];br.push(e===0||e===4?(n>0?n:-1):-1)}if(br[0]===-1)br[0]=CH(chs[0][0],chs[0][1])[2]+12;
 secs.push({mel,ch:chs,role:"A"},{mel:melVar(mel,sc),ch:chs,role:"A2"},{mel:bmel,ch:bch,role:"B"});
 if(240/T.bpm*28<48)secs.push({mel:melVar(bmel,sc),ch:bch,role:"B2"});
 secs.push({mel:br,ch:chs.slice(0,4),role:"Br"});return T._arr=secs}
function secAt(T,step){let S2=buildArr(T);if(A.rage&&T._arr2)S2=T._arr2;else if(T._intro){if(step<T._intro.mel.length)return[T._intro,step];step-=T._intro.mel.length}let tot=0;S2.forEach(x=>tot+=x.mel.length);let s=step%tot;for(const x of S2){if(s<x.mel.length)return[x,s];s-=x.mel.length}return[S2[0],0]}
function sched(h=.15){const c=A.ctx;if(!c)return;if(A.next<c.currentTime-.2)A.next=c.currentTime+.05;
 while(A.next<c.currentTime+h){const T=TR[A.cur];const q=60/(T?T.bpm*(A.rage?(T.order2?1.04:1.18):1):100)/2;
  if(T&&A.music&&(c.state==="running"||A.offline)){A.inS=1;try{
   if(!T.s&&ORCH[A.cur])T.s=ORCH[A.cur];
   const [X,s]=secAt(T,A.step);const BL=T.bl||8,HF=BL===6?3:4,M=X.mel,L=M.length,bar=Math.floor(s/BL),e=s%BL,role=X.role,full=role==="B"||role==="B2",br=role==="Br";
   const tg=A.next+(e%2?q*T.sw:0);const hum=()=>tg+(Math.random()-.5)*.014;const [r,ty]=X.ch[bar%X.ch.length];const chord=CH(r,ty);
   const acc=e===0?1:e===HF?.92:e%2===0?.84:.74;const RK=ROLE_K[role]||1;const vk=RK*acc*(.93+Math.random()*.12);
   A.T=T;const O=T.s||{};const m=M[s];
   A.vk=vk;if(m>0){let l=1;while(M[(s+l)%L]===-1&&l<8)l++;const t=hum();const LI=X.lead||O.lead;if(!(LI&&samp(LI,m,t,q*l,br?.6:.72,br?.45:.3)))INST[T.lead](m,t,q*l);
    if(O.dbl&&(full||role==="A2"||A.rage))samp(O.dbl,m+(O.dbl==="music_box"||O.dbl==="celesta"?12:0),t,q*l,full?.3:.22,.3);
    if(full||A.rage){const hm=harmUnder(m,chord);if(hm)tone({type:"triangle",f:mtof(hm),t,dur:q*l*.9,vol:.045,dest:D(),wet:.3})}}
   // 副旋律：变奏和副歌里，在每半小节放一个和弦内的长音，跟主旋律错开
   if((role==="A2"||full)&&(e===0||e===HF)){let p=s;while(p>0&&!(M[p]>0))p--;const ref=M[p]>0?M[p]:chord[2]+12;let cn=harmUnder(ref,chord);if(!cn)cn=chord[1]+12;if(e===HF){const pool=[];chord.forEach(x=>[12,24].forEach(o=>pool.push(x+o)));const alt=pool.filter(x=>x!==cn&&Math.abs(x-cn)<=5).sort((a,b)=>Math.abs(a-cn)-Math.abs(b-cn))[0];if(alt)cn=alt}const ci=O.ctr||(O.lead==="cello"?"orchestral_harp":"cello");A.vk=RK*.95;if(!samp(ci,cn,tg,q*4,.2,.3))tone({type:"triangle",f:mtof(cn),t:tg,dur:q*4,vol:.045,dest:D(),wet:.35})}
   A.vk=vk;
   if(A.rage&&!T.order2){hat(tg,.05);if(e===2||e===6)kick(tg,.4);if(e===7)snare(tg,.1);tone({type:"sawtooth",f:mtof(r+(e%2?7:0)),t:tg,dur:q*.8,vol:.035,dest:D(),filt:"lowpass",ff:900})}
   if(br){if(e===0)BASS.soft(r,tg,0,q)}else{BASS[T.bass](r,tg,e,q);(DRUM[X.dr||T.dr]||DRUM.none)(tg,e,bar);if(full&&e===0&&bar===0&&T.dr!=="none"&&T.dr!=="crickets")noise({t:tg,dur:.9,vol:.06,filt:"highpass",f:5000,dest:D()})}
   const padOn=O.pad&&SF[O.pad];if(e===0){if(padOn&&role!=="A")chord.forEach(n=>samp(O.pad,n,tg,q*BL+.1,br?.2:.16,.35));else if(padOn&&role==="A"&&bar%2===0)chord.forEach(n=>samp(O.pad,n,tg,q*BL*2,.1,.35));else if(T.pad&&!padOn)chord.forEach(n=>tone({type:"sine",f:mtof(n),t:tg,dur:q*BL+.2,vol:T.pad,att:.4,dest:D(),wet:.3}))}
   if(O.arp&&SF[O.arp]&&(role!=="A"||!(m>0))){const pat=[0,2,1,2,0,2,1,2];const n=chord[pat[e]%chord.length]+(e>=HF?12:0);if(e%2===0||T.bpm<100||full)samp(O.arp,n,hum(),q*2,br?.24:.2,.3)}
   else if(!O.arp&&(role==="A2"||br)&&e%2===0)tone({type:"triangle",f:mtof(chord[(e/2)%chord.length]+12),t:tg,dur:q*1.5,vol:.04,dest:D(),wet:.4});
   if(!br){if(O.stab&&SF[O.stab]&&(full||role==="A2")&&(e===2||e===5||(e===7&&bar%2)))chord.forEach(n=>samp(O.stab,n+12,tg,q*.6,.08,.15));
    if(O.perc==="taiko"&&SF.taiko_drum){if(e===0&&bar%2===0)samp("taiko_drum",48,tg,.8,.7,.2);if((full||bar%4===3)&&bar%4===3&&e>=4)samp("taiko_drum",[60,48,48,36][e-4],tg,.5,.5+.08*(e-4),.2)}
    if(O.perc==="timp"&&SF.timpani){if(e===0)samp("timpani",r-12,tg,1,.55,.25);if(bar%4===3&&e>=4)samp("timpani",r-12+(e%2?7:0),tg,.3,.35+.05*(e-4),.2)}
    if(O.perc==="wood"&&SF.woodblock&&(e===3||(e===6&&bar%2)))samp("woodblock",e===3?72:84,tg,.2,.35)}
   if(O.bells&&SF.tubular_bells&&e===0&&bar%4===0&&role!=="A")samp("tubular_bells",r+24,tg,2,.22,.6);
   if(T.arp&&!(O.arp&&SF[O.arp]))tone({type:"triangle",f:mtof(chord[e%chord.length]+(e>=HF?12:0)),t:tg,dur:q*2,vol:.07,dest:D(),wet:.4});
   if(T.bell&&e===0&&bar%2===0)INST.bell(r+24,tg,q)
  }catch(err){console.warn(err)}A.inS=0}
  A.next+=q;A.step++}}
function musicRage(on){const was=A.rage;A.rage=on?1:0;try{const T=TR[A.cur];if(T&&T.order2&&!!was!==!!A.rage){buildArr(T);A.step=0}}catch(e){}}
function playMusic(n){const map={swing:"map",tense:"battle",space:"event",country:"shop",home:"rest"};n=map[n]||n;const act=(typeof S!=="undefined"&&S&&S.act)||0;
 if(typeof S!=="undefined"&&S){if(S.fin&&(n==="map"||n==="battle"||n==="elite"||n==="rest"))n="fin";else if(S.dream&&(n==="map"||n==="battle"||n==="elite"||n==="shop"||n==="event"))n="dream"}
 if(typeof S!=="undefined"&&S&&S.arena&&(n==="battle"||n==="elite"||n==="map"))n="hidroom";if(typeof S!=="undefined"&&S&&S.junc&&(n==="map"||n==="battle"||n==="elite"||n==="event"))n=S.act===3?"sea":"junc";if(typeof B!=="undefined"&&B&&!B.over&&(n==="battle"||n==="elite")){if(B.kind==="Y")n="mirror";else if(B.kind==="Z")n="backdoor";else if(B.kind==="O")n="seaboss"}if((n==="map"||n==="battle")&&act&&TR[n+act])n=n+act;if(n==="battle"&&!act&&TR.battle0)n="battle0";if(A.cur===n)return;
 const nv=.24*(TVOL[n]||1);A.bgmVol=nv;const go=()=>{A.rage=0;A.cur=n;A.step=0;if(A.ctx)A.next=A.ctx.currentTime+.08};
 const c=A.ctx;if(!c||!A.bgm||!A.music||!A.cur){if(A.bgm&&A.music)A.bgm.gain.value=nv;go();return}
 /* 换曲：旧曲 0.35 秒淡出，新曲 0.6 秒淡入 */
 const g=A.bgm.gain,t=c.currentTime,v=nv;try{g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(0,t+.35);g.linearRampToValueAtTime(v,t+.95)}catch(e){}
 clearTimeout(A._sw);A.cur=null;A._sw=setTimeout(go,340)}

/* ---- 5.8：第一层战斗「青苔小径」——慢一点、软一点，长笛 + 竖琴 + 弦乐铺底，手鼓和木鱼 ---- */
DRUM.hand=(t,e,bar)=>{if(e===0)kick(t,.24);if(e===5)kick(t,.15);noise({t,dur:.045,vol:e%2?.022:.034,filt:"bandpass",f:6500,q:1.5,dest:D()});if(e===4)noise({t,dur:.09,vol:.05,filt:"bandpass",f:900,q:1.2,dest:D()});if(bar%4===3&&e===6)tom(t,170,.12)};
TR.battle0={bpm:112,sw:.08,lead:"flute",bass:"walk",dr:"hand",pad:.03,
 parts:{
  A:{ch:[[53,"M"],[50,"m"],[46,"M"],[48,"M"],[53,"M"],[45,"m"],[46,"M"],[48,"7"]],
   mel:[72,-1,69,72,74,-1,72,-1, 69,-1,65,67,69,-1,-1,0, 70,-1,74,72,70,-1,69,-1, 67,-1,69,70,72,-1,-1,0, 72,-1,77,76,74,-1,72,-1, 69,-1,72,69,76,-1,-1,0, 74,72,70,-1,69,67,65,-1, 67,-1,-1,0,64,-1,67,-1]},
  B:{ch:[[50,"m"],[46,"M"],[53,"M"],[48,"M"],[50,"m"],[43,"m"],[46,"M"],[48,"7"]],
   mel:[65,-1,67,69,70,-1,69,-1, 65,-1,-1,0,62,-1,65,-1, 69,-1,72,-1,70,69,67,-1, 64,-1,-1,0,67,-1,-1,0, 69,-1,70,72,74,-1,72,-1, 70,-1,67,-1,74,-1,70,-1, 70,72,74,-1,77,-1,74,-1, 72,-1,-1,-1,0,0,0,0]},
  C:{ch:[[46,"M"],[48,"M"],[45,"m"],[50,"m"],[46,"M"],[48,"M"],[53,"M"],[53,"M"]],
   mel:[77,-1,-1,74,77,-1,79,-1, 76,-1,-1,72,76,-1,79,-1, 81,-1,79,76,72,-1,76,-1, 74,-1,-1,-1,0,72,74,76, 77,-1,-1,74,77,-1,82,-1, 81,-1,79,-1,76,-1,72,-1, 77,-1,76,-1,74,-1,72,-1, 77,-1,-1,-1,0,0,0,0]},
  D:{ch:[[50,"m"],[46,"M"],[43,"m"],[48,"sus"]],
   mel:[74,-1,-1,-1,72,-1,-1,-1, 70,-1,-1,-1,69,-1,-1,-1, 67,-1,-1,-1,70,-1,-1,-1, 72,-1,-1,-1,0,0,0,0]}},
 order:[["A","A"],["A","A2"],["B","A2"],["C","B"],["D","Br"],["C","B2"]]};
TVOL.battle0=1.4;
Object.assign(ORCH,{battle0:{lead:"flute",dbl:"orchestral_harp",ctr:"cello",bass:"acoustic_bass",pad:"string_ensemble_1",arp:"orchestral_harp",perc:"wood"},
 hidroom:{lead:"trumpet",dbl:"french_horn",bass:"cello",pad:"string_ensemble_1",perc:"taiko"},
 tavern:{lead:"acoustic_grand_piano",dbl:"fiddle",bass:"acoustic_bass",arp:"acoustic_guitar_nylon",perc:"wood"},
 sea:{lead:"celesta",dbl:"music_box",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp",bells:1},
 seaboss:{lead:"french_horn",dbl:"church_organ",bass:"cello",pad:"string_ensemble_1",perc:"timp"},
 junc:{lead:"kalimba",dbl:"marimba",bass:"acoustic_bass",arp:"acoustic_guitar_nylon",perc:"wood"},
 mirror:{lead:"harpsichord",dbl:"celesta",bass:"cello",pad:"string_ensemble_1",perc:"timp"},
 backdoor:{lead:"marimba",dbl:"trumpet",bass:"acoustic_bass",stab:"string_ensemble_1",perc:"taiko"},
 homemain:{lead:"flute",dbl:"music_box",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp",bells:1},
 victory:{lead:"trumpet",dbl:"orchestral_harp",bass:"acoustic_bass",pad:"string_ensemble_1",arp:"acoustic_guitar_nylon"},
 dsq:{lead:"trumpet",dbl:"french_horn",bass:"cello",stab:"string_ensemble_1",perc:"taiko"},
 champ:{lead:"french_horn",dbl:"cello",bass:"cello",pad:"string_ensemble_1",perc:"timp"},
 curser:{lead:"harpsichord",dbl:"celesta",bass:"cello",pad:"string_ensemble_1",bells:1},
 curser2:{lead:"church_organ",dbl:"french_horn",bass:"cello",pad:"string_ensemble_1",perc:"timp",bells:1}});
for(const k in ORCH)if(TR[k])TR[k].s=ORCH[k];
/* ---- 5.8：战斗曲全部手写——原来的 8 小节当主歌 A，另写第二段 B、副歌 C、间奏 D ---- */
(function(){const H=(r)=>r.split("|").map(x=>x.trim().split(/[ ,]+/).map(Number)).flat();
 const C=s=>s.split(" ").map(x=>{const m=x.match(/^(\d\d)(.*)$/);return[+m[1],m[2]||"M"]});
 const W={
  battle1:{B:["46 41 43m 457 50m 46 43m 457","74 -1 70 -1 72 74 77 -1|77 -1 72 -1 69 -1 72 -1|74 -1 70 -1 67 -1 70 74|73 -1 -1 -1 76 -1 73 -1|77 -1 74 -1 69 -1 74 77|82 -1 81 79 77 -1 74 -1|79 -1 77 76 74 -1 70 -1|73 -1 -1 -1 0 69 73 76"],
   C:["50m 48 46 457 50m 48 46 457","81 -1 77 81 86 -1 81 77|79 -1 76 79 84 -1 79 76|77 -1 74 77 82 -1 77 74|76 77 79 81 79 77 76 73|74 77 81 86 -1 84 82 81|79 76 72 76 79 -1 84 -1|82 81 79 77 79 77 76 74|73 -1 76 -1 69 -1 0 0"],
   D:["43m 50m 46 45sus","70 -1 -1 -1 74 -1 -1 -1|77 -1 -1 -1 74 -1 -1 -1|74 -1 -1 -1 77 -1 -1 -1|76 -1 -1 -1 73 -1 -1 -1"]},
  battle2:{B:["45m 52m 48 50 43 52m 45m 477","72 -1 71 69 76 -1 72 -1|71 -1 67 -1 64 -1 67 71|72 -1 76 -1 79 -1 76 72|74 -1 -1 78 -1 -1 74 -1|79 -1 74 -1 71 -1 74 79|76 -1 -1 -1 71 72 74 76|72 -1 69 72 76 -1 81 -1|78 -1 -1 -1 75 -1 71 -1"],
   C:["48 50 47m 52m 48 50 477 52m","84 -1 83 -1 79 -1 76 -1|81 -1 78 -1 74 -1 78 81|83 -1 -1 78 83 -1 86 -1|88 -1 -1 -1 83 -1 79 -1|84 -1 83 79 76 -1 79 84|86 -1 84 81 78 -1 81 86|87 -1 83 -1 78 -1 75 -1|76 -1 -1 -1 0 0 0 0"],
   D:["45m 48 52m 47sus","81 -1 -1 -1 76 -1 -1 -1|79 -1 -1 -1 76 -1 -1 -1|71 -1 -1 -1 79 -1 -1 -1|78 -1 -1 -1 0 0 0 0"]},
  battle3:{B:["49 51 53m 53m 49 51 487 487","73 -1 77 -1 80 -1 77 73|75 -1 79 -1 82 -1 79 75|77 -1 80 -1 84 -1 80 -1|77 -1 -1 -1 0 72 75 77|80 -1 77 73 -1 77 80 -1|82 -1 79 75 -1 79 82 -1|84 -1 82 80 79 -1 76 -1|72 -1 -1 -1 0 0 0 0"],
   C:["53m 44 46m 487 53m 44 46m 487","77 0 77 80 0 84 0 82|80 0 80 84 0 87 0 84|82 0 82 85 0 89 0 85|84 -1 82 -1 79 -1 76 -1|77 0 77 80 0 84 0 82|80 0 84 0 87 0 84 80|82 80 77 -1 79 76 72 -1|76 -1 79 -1 84 -1 0 0"],
   D:["49 46m 51 487","77 -1 -1 -1 73 -1 -1 -1|77 -1 -1 -1 82 -1 -1 -1|79 -1 -1 -1 75 -1 -1 -1|76 -1 -1 -1 0 0 0 0"]},
  battle4:{B:["50m 45m 53 527 50m 45m 55 527","77 -1 74 -1 69 -1 74 77|76 -1 72 -1 69 -1 -1 -1|72 -1 77 -1 81 -1 79 77|80 -1 -1 -1 76 -1 -1 -1|81 -1 77 -1 74 -1 77 81|84 -1 81 -1 76 -1 81 84|86 -1 83 -1 79 -1 83 86|88 -1 -1 -1 0 0 0 0"],
   C:["53 55 52m 57m 53 55 527 57m","84 -1 -1 81 84 -1 88 -1|86 -1 -1 83 79 -1 83 -1|83 -1 -1 79 76 -1 79 83|81 -1 -1 -1 -1 -1 0 0|84 -1 86 -1 88 -1 89 -1|91 -1 -1 89 88 -1 86 -1|88 -1 86 -1 83 -1 80 -1|81 -1 -1 -1 0 0 0 0"],
   D:["53 48 50m 52sus","77 -1 -1 -1 81 -1 -1 -1|79 -1 -1 -1 76 -1 -1 -1|77 -1 -1 -1 74 -1 -1 -1|76 -1 -1 -1 0 0 0 0"]},
  elite:{B:["41 48 50m 457 41 48 46 457","72 -1 77 -1 81 -1 77 72|76 -1 79 -1 84 -1 79 76|77 -1 74 77 81 -1 77 74|73 -1 76 -1 79 -1 -1 -1|81 -1 77 -1 72 -1 77 81|84 -1 79 -1 76 -1 79 84|82 -1 81 -1 77 -1 74 -1|76 -1 -1 -1 73 -1 -1 -1"],
   C:["50m 48 46 457 43m 457 50m 50m","86 -1 -1 81 86 -1 89 -1|88 -1 -1 84 79 -1 84 -1|86 -1 -1 82 77 -1 82 86|85 -1 -1 -1 81 -1 76 -1|82 -1 79 -1 74 -1 79 82|85 -1 81 -1 76 -1 81 85|86 -1 81 -1 77 -1 74 -1|74 -1 -1 -1 0 0 0 0"],
   D:["43m 50m 46 45sus","74 -1 -1 -1 70 -1 -1 -1|74 -1 -1 -1 77 -1 -1 -1|77 -1 -1 -1 74 -1 -1 -1|76 -1 -1 -1 0 0 0 0"]}};
 for(const k in W){const T=TR[k];if(!T)continue;const Ach=[...Array(8)].map((_,i)=>T.ch[i%T.ch.length]);T.parts={A:{ch:Ach,mel:T.mel}};for(const p of ["B","C","D"]){const [c,m]=W[k][p];T.parts[p]={ch:C(c),mel:H(m)}}
  T.order=[["A","A"],["A","A2"],["B","A2"],["C","B"],["D","Br"],["C","B2"]];delete T._arr}})();
/* ---- 5.8：地图曲（五层 + 两个隐藏层）也手写第二段 B、副歌 C、间奏 D；慢歌一轮少走一遍副歌 ---- */
(function(){const H=(r)=>r.split("|").map(x=>x.trim().split(/[ ,]+/).map(Number)).flat();
 const C=s=>s.split(" ").map(x=>{const m=x.match(/^(\d\d)(.*)$/);return[+m[1],m[2]||"M"]});
 const W={
  map:{B:["43 50 52m 45 43 50 47m 457","71 -1 74 -1 79 -1 78 76|74 -1 -1 0 69 -1 74 -1|76 -1 79 -1 76 -1 71 -1|73 -1 -1 0 76 -1 -1 0|79 -1 78 79 83 -1 79 -1|78 -1 74 -1 69 -1 74 78|74 -1 73 -1 71 -1 74 -1|73 -1 -1 -1 0 0 0 0"],
   C:["47m 43 50 45 47m 43 52m 457","78 -1 81 -1 83 -1 81 78|79 -1 -1 0 74 -1 79 -1|81 -1 78 -1 74 -1 78 81|76 -1 -1 -1 0 73 74 76|78 -1 81 -1 86 -1 83 81|83 -1 79 -1 74 -1 79 83|81 -1 79 -1 78 -1 76 -1|76 -1 -1 -1 0 0 0 0"],
   D:["43 50 52m 45sus","74 -1 -1 -1 71 -1 -1 -1|69 -1 -1 -1 74 -1 -1 -1|71 -1 -1 -1 67 -1 -1 -1|69 -1 -1 -1 0 0 0 0"]},
  map1:{B:["46 41 43m 457 50m 46 43m 457","70 -1 74 -1 77 -1 74 -1|72 -1 -1 0 69 -1 65 -1|67 -1 70 -1 74 -1 70 -1|69 -1 -1 -1 73 -1 -1 0|74 -1 77 -1 81 -1 77 -1|82 -1 -1 0 77 -1 74 -1|79 -1 77 -1 74 -1 70 -1|73 -1 -1 -1 0 0 0 0"],
   C:["50m 48 46 45 43m 50m 457 50m","77 -1 -1 -1 74 -1 77 -1|79 -1 -1 -1 76 -1 72 -1|77 -1 -1 -1 74 -1 70 -1|73 -1 76 -1 81 -1 -1 0|82 -1 -1 -1 79 -1 74 -1|81 -1 -1 -1 77 -1 74 -1|76 -1 73 -1 69 -1 73 76|74 -1 -1 -1 0 0 0 0"],
   D:["46 43m 50m 45sus","70 -1 -1 -1 -1 -1 -1 -1|67 -1 -1 -1 70 -1 -1 -1|69 -1 -1 -1 74 -1 -1 -1|73 -1 -1 -1 0 0 0 0"]},
  map2:{B:["45m 52m 48 47 45m 52m 50 477","72 -1 -1 76 -1 -1 81 -1|79 -1 -1 76 -1 -1 71 -1|72 -1 -1 76 -1 -1 79 -1|78 -1 -1 -1 75 -1 -1 0|81 -1 -1 79 -1 -1 76 -1|79 -1 -1 -1 71 -1 -1 0|74 -1 78 -1 81 -1 78 -1|75 -1 -1 -1 0 0 0 0"],
   C:["48 50 43 47m 48 50 477 52m","84 -1 -1 83 -1 -1 79 -1|81 -1 -1 78 -1 -1 74 -1|79 -1 -1 83 -1 -1 86 -1|83 -1 -1 -1 78 -1 -1 0|84 -1 88 -1 86 -1 84 -1|83 -1 81 -1 78 -1 74 -1|75 -1 78 -1 81 -1 78 -1|76 -1 -1 -1 0 0 0 0"],
   D:["48 43 45m 47sus","76 -1 -1 -1 -1 -1 -1 -1|74 -1 -1 -1 -1 -1 -1 -1|72 -1 -1 -1 76 -1 -1 -1|78 -1 -1 -1 0 0 0 0"]},
  map3:{B:["46 45m 50m 487 46 41 43m7 487","74 -1 72 70 -1 74 77 -1|76 -1 72 -1 69 -1 72 76|77 -1 74 -1 69 74 77 -1|76 -1 -1 0 72 -1 70 -1|74 0 77 0 81 -1 77 74|72 -1 69 -1 65 -1 69 72|70 -1 74 -1 77 -1 74 70|72 -1 -1 -1 0 0 0 0"],
   C:["41 50m 46 487 45m 50m 43m7 487","77 -1 -1 76 77 -1 81 -1|79 -1 77 -1 74 -1 -1 0|77 -1 -1 74 77 -1 82 -1|81 -1 79 -1 76 -1 -1 0|76 -1 79 -1 81 -1 84 -1|81 -1 77 -1 74 -1 77 81|79 -1 77 -1 74 -1 70 -1|72 -1 -1 -1 0 0 0 0"],
   D:["46 45m 43m7 48sus","74 -1 -1 -1 70 -1 -1 -1|72 -1 -1 -1 76 -1 -1 -1|74 -1 -1 -1 70 -1 -1 -1|72 -1 -1 -1 0 0 0 0"]},
  map4:{B:["50 52 49m 54m 50 52 57 52","78 -1 -1 81 -1 -1 86 -1|83 -1 -1 -1 80 -1 76 -1|80 -1 -1 76 -1 -1 73 -1|78 -1 -1 -1 0 0 0 0|81 -1 -1 78 -1 -1 74 -1|76 -1 80 -1 83 -1 -1 0|85 -1 -1 83 81 -1 76 -1|80 -1 -1 -1 0 0 0 0"],
   C:["54m 50 57 52 54m 50 52 57","85 -1 -1 -1 81 -1 78 -1|86 -1 -1 -1 81 -1 78 -1|88 -1 -1 -1 85 -1 81 -1|83 -1 -1 -1 80 -1 -1 0|85 -1 88 -1 90 -1 88 -1|86 -1 85 -1 83 -1 81 -1|83 -1 -1 -1 80 -1 83 -1|81 -1 -1 -1 0 0 0 0"],
   D:["50 49m 54m 52sus","78 -1 -1 -1 -1 -1 -1 -1|76 -1 -1 -1 -1 -1 -1 -1|73 -1 -1 -1 78 -1 -1 -1|76 -1 -1 -1 0 0 0 0"]},
  junc:{B:["48 43 52m 50 48 43 45m 507","76 -1 72 -1 67 -1 72 76|74 -1 -1 0 71 -1 67 -1|71 -1 74 -1 79 -1 76 -1|78 -1 -1 -1 74 -1 -1 0|79 -1 76 -1 72 -1 76 79|83 -1 79 -1 74 -1 -1 0|81 -1 79 -1 76 -1 72 -1|74 -1 -1 -1 0 0 0 0"],
   C:["52m 48 43 50 52m 48 507 43","79 -1 83 -1 88 -1 83 79|84 -1 -1 0 79 -1 76 -1|83 -1 79 -1 74 -1 79 83|81 -1 -1 -1 0 78 79 81|83 -1 88 -1 86 -1 83 -1|84 -1 83 -1 79 -1 76 -1|78 -1 81 -1 84 -1 81 -1|79 -1 -1 -1 0 0 0 0"],
   D:["48 52m 45m 50sus","76 -1 -1 -1 72 -1 -1 -1|71 -1 -1 -1 76 -1 -1 -1|72 -1 -1 -1 69 -1 -1 -1|74 -1 -1 -1 0 0 0 0"]},
  sea:{B:["46 41 43m 45sus 50m 46 48 457","77 -1 -1 -1 74 -1 -1 0|72 -1 -1 -1 69 -1 -1 0|70 -1 -1 74 -1 -1 79 -1|76 -1 -1 -1 -1 -1 0 0|81 -1 -1 -1 77 -1 -1 0|74 -1 -1 -1 77 -1 -1 0|76 -1 -1 -1 72 -1 -1 0|73 -1 -1 -1 0 0 0 0"],
   C:["43m 46 50m 48 43m 46 457 50m","79 -1 -1 -1 82 -1 -1 0|81 -1 -1 -1 77 -1 -1 0|77 -1 -1 -1 81 -1 -1 0|79 -1 -1 -1 76 -1 -1 0|74 -1 -1 -1 79 -1 -1 0|77 -1 -1 -1 74 -1 -1 0|73 -1 -1 -1 76 -1 -1 0|74 -1 -1 -1 0 0 0 0"],
   D:["46 43m 50m 45sus","70 -1 -1 -1 -1 -1 -1 -1|67 -1 -1 -1 -1 -1 -1 -1|69 -1 -1 -1 -1 -1 -1 -1|69 -1 -1 -1 0 0 0 0"]}};
 for(const k in W){const T=TR[k];if(!T)continue;const Ach=[...Array(8)].map((_,i)=>T.ch[i%T.ch.length]);T.parts={A:{ch:Ach,mel:T.mel}};for(const p of ["B","C","D"]){const [c,m]=W[k][p];T.parts[p]={ch:C(c),mel:H(m)}}
  T.order=T.bpm<90?[["A","A"],["B","A2"],["C","B"],["D","Br"]]:[["A","A"],["A","A2"],["B","A2"],["C","B"],["D","Br"],["C","B2"]];delete T._arr}})();

/* ---- 5.8 第二版：第 2～5 层战斗曲和精英战曲从头重写，每层一种风格 ---- */
BASS.waltz=(r,t,e,q)=>{if(e===0)bnote(r-12,t,q*1.8,.3,()=>tone({type:"sine",f:mtof(r-12),t,dur:q*1.8,vol:.3,dest:D(),filt:"lowpass",ff:500}));else if(e===2||e===4)bnote(r-5,t,q*.9,.12,()=>tone({type:"triangle",f:mtof(r-5),t,dur:q*.9,vol:.1,dest:D(),filt:"lowpass",ff:800}))};
DRUM.waltz3=(t,e,bar)=>{if(e===0)kick(t,.2);if(e===2||e===4)noise({t,dur:.06,vol:.03,filt:"highpass",f:5000,dest:D()});if(bar%4===3&&e===5)noise({t,dur:.3,vol:.04,filt:"highpass",f:6000,dest:D()})};
DRUM.frost=(t,e,bar)=>{if(e===0)kick(t,.18);if(e===4&&bar%2)kick(t,.12);if(e%2===1)noise({t,dur:.03,vol:.02,filt:"highpass",f:8000,dest:D()});if(e===6&&bar%2===0)tone({type:"sine",f:2637,t,dur:.5,vol:.03,dest:D(),wet:.6})};
DRUM.machine=(t,e,bar)=>{if(e===0||e===5)kick(t,.26);if(e===2||e===6)noise({t,dur:.12,vol:.05,filt:"bandpass",f:2500,q:.8,dest:D()});if(e%2===1)noise({t,dur:.03,vol:.022,filt:"highpass",f:7000,dest:D()});if(e===3)tone({type:"square",f:1800,t,dur:.025,vol:.02,dest:D(),filt:"bandpass",ff:2000,q:8});if(e===7&&bar%2)noise({t,dur:.18,vol:.035,filt:"bandpass",f:600,f2:2000,q:3,dest:D()})};
DRUM.epic=(t,e,bar)=>{if(e===0)kick(t,.3);if(e===4)kick(t,.2);if(e===4&&bar%2)snare(t,.07);if(bar%4===3&&e>=4)tom(t,[200,170,140,110][e-4],.16)};
DRUM.tight=(t,e,bar)=>{if(e===0||e===3)kick(t,.3);if(e===4)snare(t,.09);if(e%2===1)hat(t,.022);if(bar%4===3&&e>=6)tom(t,e===6?180:140,.14)};
(function(){const H=r=>r.split("|").map(x=>x.trim().split(/[ ,]+/).map(Number)).flat();const C=s=>s.split(" ").map(x=>{const m=x.match(/^(\d\d)(.*)$/);return[+m[1],m[2]||"M"]});
 const P=o=>{const r={};for(const k in o)r[k]={ch:C(o[k][0]),mel:H(o[k][1])};return r};const ORD=[["A","A"],["A","A2"],["B","A2"],["C","B"],["D","Br"],["C","B2"]];
 // 第二层 古堡「月下圆舞」：三拍子，管风琴 + 大提琴 + 弦乐，竖琴副旋律
 TR.battle1={bpm:138,bl:6,sw:0,lead:"organ",bass:"waltz",dr:"waltz3",pad:.04,order:ORD,parts:P({
  A:["50m 43m 48 41 46 43m 457 50m","74 -1 -1 77 -1 74|70 -1 -1 74 -1 79|76 -1 -1 72 -1 76|77 -1 -1 -1 -1 0|74 -1 77 -1 82 -1|79 -1 -1 77 76 74|73 -1 76 -1 79 -1|77 -1 -1 74 -1 0"],
  B:["41 48 50m 45 46 41 43m 457","72 -1 -1 69 -1 72|76 -1 -1 72 -1 67|69 -1 -1 74 -1 77|76 -1 -1 -1 -1 0|77 -1 -1 74 -1 70|72 -1 -1 77 -1 81|79 -1 77 -1 74 -1|73 -1 -1 -1 -1 0"],
  C:["50m 46 43m 457 50m 46 43m 457","81 -1 -1 77 -1 74|82 -1 -1 77 -1 74|79 -1 82 -1 86 -1|85 -1 -1 81 -1 0|86 -1 -1 81 -1 77|82 -1 81 -1 77 -1|79 -1 77 -1 74 73|74 -1 -1 -1 -1 0"],
  D:["43m 50m 51 45sus","70 -1 -1 -1 -1 -1|69 -1 -1 -1 -1 -1|67 -1 -1 70 -1 -1|69 -1 -1 -1 -1 0"]})};
 // 第三层 冰原「霜晶」：钢片琴 + 八音盒 + 竖琴，空旷，鼓很轻
 TR.battle2={bpm:120,sw:0,lead:"celesta",bass:"soft",dr:"frost",pad:.05,bell:1,order:ORD,parts:P({
  A:["52m 48 43 50 52m 45m 477 52m","79 -1 76 -1 71 -1 76 -1|79 -1 -1 -1 84 -1 -1 0|83 -1 79 -1 74 -1 79 -1|81 -1 -1 -1 78 -1 -1 0|76 -1 79 -1 83 -1 88 -1|84 -1 -1 -1 81 -1 76 -1|78 -1 75 -1 71 -1 75 78|76 -1 -1 -1 -1 -1 0 0"],
  B:["48 50 47m 52m 48 50 52m 477","72 -1 -1 76 -1 -1 79 -1|78 -1 -1 74 -1 -1 69 -1|71 -1 -1 74 -1 -1 78 -1|76 -1 -1 -1 -1 -1 0 0|84 -1 -1 79 -1 -1 76 -1|81 -1 -1 78 -1 -1 74 -1|79 -1 78 -1 76 -1 71 -1|75 -1 -1 -1 -1 -1 0 0"],
  C:["43 50 52m 48 43 50 48 477","86 -1 -1 83 -1 -1 79 -1|86 -1 -1 81 -1 -1 78 -1|88 -1 -1 83 -1 -1 79 -1|84 -1 -1 -1 79 -1 -1 0|83 -1 86 -1 91 -1 86 -1|90 -1 -1 86 -1 -1 81 -1|88 -1 84 -1 79 -1 76 -1|78 -1 -1 -1 0 0 0 0"],
  D:["45m 52m 48 47sus","76 -1 -1 -1 -1 -1 -1 -1|79 -1 -1 -1 -1 -1 -1 -1|76 -1 -1 -1 72 -1 -1 -1|78 -1 -1 -1 0 0 0 0"]})};
 // 第四层 奶茶厂「三点半的流水线」：摇摆爵士，钢琴 + 低音提琴，机器声当鼓
 TR.battle3={bpm:132,sw:.3,lead:"keys",bass:"walk",dr:"machine",pad:0,order:ORD,parts:P({
  A:["41 50m7 43m7 487 45m7 507 43m7 487","72 -1 69 72 0 77 -1 76|74 -1 72 -1 69 -1 0 0|70 -1 74 77 0 79 -1 77|76 -1 -1 -1 0 72 74 75|76 -1 72 76 0 79 -1 76|78 -1 74 -1 72 -1 0 0|77 -1 74 70 0 74 -1 72|70 -1 -1 -1 0 0 0 0"],
  B:["46 46m7 41 507 43m7 487 41 487","74 -1 77 -1 81 -1 77 74|73 -1 -1 -1 0 70 72 73|72 -1 69 -1 65 -1 0 0|66 -1 69 72 0 74 -1 72|70 -1 -1 74 -1 77 -1 74|76 -1 -1 -1 0 79 77 76|77 -1 72 -1 69 -1 0 0|0 0 67 69 70 72 74 76"],
  C:["41 457 50m 417 46 46m7 41 487","81 -1 -1 77 -1 79 81 -1|81 -1 79 -1 76 -1 73 -1|77 -1 -1 74 -1 77 81 -1|84 -1 -1 -1 0 82 81 79|77 -1 74 -1 77 -1 82 -1|80 -1 77 -1 73 -1 0 0|77 -1 81 -1 84 -1 81 -1|79 -1 -1 -1 0 0 0 0"],
  D:["50m7 43m7 46m7 48sus","74 -1 -1 -1 72 -1 -1 -1|70 -1 -1 -1 74 -1 -1 -1|73 -1 -1 -1 70 -1 -1 -1|72 -1 -1 -1 0 0 0 0"]})};
 // 第五层 星空之顶「往上」：圆号 + 弦乐，和弦一路往上走
 TR.battle4={bpm:118,sw:0,lead:"brass",bass:"soft",dr:"epic",pad:.05,order:ORD,parts:P({
  A:["50 52m 54m 43 45 47m 43 45","74 -1 -1 -1 78 -1 81 -1|79 -1 -1 -1 76 -1 79 -1|81 -1 -1 -1 78 -1 73 -1|74 -1 -1 -1 -1 -1 0 0|76 -1 -1 -1 81 -1 85 -1|86 -1 -1 -1 83 -1 78 -1|79 -1 -1 83 -1 -1 86 -1|85 -1 -1 -1 -1 -1 0 0"],
  B:["47m 43 50 45 47m 43 52m 45","74 -1 71 -1 74 -1 78 -1|79 -1 -1 -1 74 -1 -1 0|78 -1 74 -1 78 -1 81 -1|81 -1 -1 -1 76 -1 -1 0|83 -1 78 -1 83 -1 86 -1|86 -1 -1 -1 83 -1 79 -1|79 -1 81 -1 83 -1 79 -1|81 -1 -1 -1 -1 -1 0 0"],
  C:["43 45 47m 50 43 45 50 50","86 -1 -1 -1 83 -1 86 -1|88 -1 -1 -1 85 -1 88 -1|90 -1 -1 -1 86 -1 83 -1|86 -1 -1 -1 -1 -1 0 0|83 -1 86 -1 91 -1 -1 -1|88 -1 85 -1 81 -1 -1 -1|86 -1 -1 -1 -1 -1 -1 -1|-1 -1 -1 -1 0 0 0 0"],
  D:["52m 54m 43 45sus","79 -1 -1 -1 -1 -1 -1 -1|81 -1 -1 -1 -1 -1 -1 -1|83 -1 -1 -1 -1 -1 -1 -1|85 -1 -1 -1 0 0 0 0"]})};
 // 精英战「绷紧的弦」：小提琴 + 拨弦，比普通战斗紧，但收着
 TR.elite={bpm:136,sw:0,lead:"erhu",bass:"drive",dr:"tight",pad:.03,order:ORD,parts:P({
  A:["48m 44 51 437 48m 53m 437 48m","72 -1 75 -1 79 -1 75 72|80 -1 -1 -1 75 -1 72 -1|75 -1 79 -1 82 -1 79 75|74 -1 -1 -1 71 -1 74 -1|79 -1 75 79 84 -1 79 -1|80 -1 77 80 84 -1 80 -1|79 -1 77 -1 74 -1 71 -1|72 -1 -1 -1 0 0 0 0"],
  B:["53m 48m 44 51 53m 48m 50m 437","77 -1 -1 80 -1 -1 84 -1|79 -1 -1 75 -1 -1 72 -1|75 -1 -1 80 -1 -1 84 -1|82 -1 -1 -1 79 -1 -1 0|80 -1 -1 77 -1 -1 72 -1|75 -1 -1 79 -1 -1 84 -1|80 -1 -1 77 -1 -1 74 -1|71 -1 -1 -1 74 -1 77 79"],
  C:["44 46 48m 48m 44 46 437 48m","84 -1 -1 80 84 -1 87 -1|86 -1 -1 82 86 -1 89 -1|87 -1 86 -1 84 -1 79 -1|84 -1 -1 -1 0 79 82 84|87 -1 -1 84 80 -1 84 87|89 -1 -1 86 82 -1 86 89|86 -1 83 -1 79 -1 74 -1|84 -1 -1 -1 0 0 0 0"],
  D:["44 53m 51 43sus","80 -1 -1 -1 -1 -1 -1 -1|77 -1 -1 -1 80 -1 -1 -1|79 -1 -1 -1 75 -1 -1 -1|74 -1 -1 -1 0 0 0 0"]})};
 Object.assign(ORCH,{battle1:{lead:"church_organ",dbl:"cello",ctr:"orchestral_harp",bass:"cello",pad:"string_ensemble_1",perc:"timp"},
  battle2:{lead:"celesta",dbl:"music_box",ctr:"orchestral_harp",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp",bells:1},
  battle3:{lead:"acoustic_grand_piano",ctr:"cello",bass:"acoustic_bass",stab:"acoustic_grand_piano"},
  battle4:{lead:"french_horn",dbl:"string_ensemble_1",ctr:"cello",bass:"cello",pad:"string_ensemble_1",arp:"orchestral_harp",perc:"timp",bells:1},
  elite:{lead:"fiddle",dbl:"pizzicato_strings",ctr:"cello",bass:"acoustic_bass",stab:"string_ensemble_1",perc:"taiko"}});
 ["battle1","battle2","battle3","battle4","elite"].forEach(k=>{TR[k].s=ORCH[k]});Object.assign(TVOL,{battle1:1.05,battle2:1.35,battle3:1.2,battle4:1.05,elite:1.1})})();

/* ---- 5.8 首领曲：前奏两小节 → 主题；首领血量过半，切到专门写的第二段（不再只是加速）。
   阿岳的主题（梦里钓鱼那段）出现在大魔王、魔椅、最终之地里；初号机的间奏是八音盒。 ---- */
(function(){const H=r=>r.split("|").map(x=>x.trim().split(/[ ,]+/).map(Number)).flat();const C=s=>s.split(" ").map(x=>{const m=x.match(/^(\d\d)(.*)$/);return[+m[1],m[2]||"M"]});
 const O1=[["A","A"],["B","A2"],["A","A2"],["D","Br"]],O2=[["E","B"],["A","B2"],["E","B2"],["D","Br"]];
 const W={
  boss:{I:["48m 437","60 -1 -1 -1 -1 -1 -1 -1|59 -1 -1 -1 62 -1 65 67"],
   B:["44 46 48m 48m 41m 44 437 437","75 -1 -1 72 75 -1 80 -1|77 -1 -1 74 77 -1 82 -1|79 -1 75 -1 72 -1 75 79|84 -1 -1 -1 0 79 80 82|80 -1 77 -1 72 -1 77 80|84 -1 80 -1 75 -1 72 -1|74 -1 71 -1 67 -1 71 74|79 -1 -1 -1 0 0 0 0"],
   D:["44 41m 48m 43sus","72 -1 -1 -1 -1 -1 -1 -1|68 -1 -1 -1 72 -1 -1 -1|75 -1 -1 -1 72 -1 -1 -1|74 -1 -1 -1 0 0 0 0"],
   E:["48m 46 44 437 48m 46 44 437","84 84 82 84 0 87 86 84|82 82 79 82 0 86 84 82|80 80 77 80 0 84 82 80|79 -1 83 -1 86 -1 83 79|84 84 82 84 0 87 86 84|86 86 84 86 0 89 87 86|87 -1 84 -1 80 -1 77 -1|79 -1 -1 -1 83 -1 86 -1"]},
  proto:{I:["50m 50m","74 0 74 0 74 0 74 0|74 0 77 0 81 0 86 0"],
   B:["46 48 50m 45m 46 48 457 457","70 74 77 74 70 74 77 74|72 76 79 76 72 76 79 76|74 77 81 77 86 81 77 74|72 69 76 72 69 76 72 69|70 74 77 82 81 77 74 70|72 76 79 84 82 79 76 72|73 76 79 81 79 76 73 69|73 -1 -1 -1 0 0 0 0"],
   D:["50m 46 43m 45","74 -1 77 -1 81 -1 79 77|77 -1 74 -1 70 -1 -1 -1|70 -1 74 -1 79 -1 77 74|73 -1 -1 -1 76 -1 -1 0","music_box"],
   E:["50m 48 46 45 50m 48 46 457","86 0 86 84 81 0 81 77|84 0 84 81 79 0 79 76|82 0 82 77 74 0 74 70|76 0 79 0 81 0 85 0|86 0 86 84 81 0 81 77|84 0 88 0 91 0 88 84|82 81 79 77 74 -1 77 -1|76 -1 73 -1 69 -1 0 0"]},
  seaboss:{I:["50m 45","62 -1 -1 -1 -1 -1 -1 -1|61 -1 -1 -1 -1 -1 -1 -1"],
   B:["46 43m 50m 45 46 43m 457 457","77 -1 -1 -1 74 -1 70 -1|79 -1 -1 -1 74 -1 70 -1|77 -1 -1 -1 81 -1 -1 -1|76 -1 -1 -1 73 -1 -1 -1|82 -1 -1 -1 77 -1 74 -1|79 -1 -1 -1 82 -1 86 -1|85 -1 -1 -1 81 -1 76 -1|73 -1 -1 -1 0 0 0 0"],
   D:["50m 46 43m 45sus","74 -1 -1 -1 -1 -1 -1 -1|77 -1 -1 -1 -1 -1 -1 -1|79 -1 -1 -1 -1 -1 -1 -1|76 -1 -1 -1 0 0 0 0"],
   E:["50m 49 48 47m 46 45 50m 457","86 -1 81 -1 86 -1 89 -1|85 -1 80 -1 85 -1 88 -1|84 -1 79 -1 84 -1 88 -1|83 -1 78 -1 83 -1 86 -1|82 -1 77 -1 82 -1 86 -1|81 -1 76 -1 79 -1 85 -1|86 -1 -1 -1 81 -1 77 -1|76 -1 -1 -1 73 -1 -1 -1"]},
  dsq:{I:["45m 407","69 0 0 69 0 0 69 0|64 0 0 64 0 68 71 74"],
   B:["41 43 45m 45m 41 43 407 407","72 -1 77 -1 81 -1 77 72|74 -1 79 -1 83 -1 79 74|76 -1 81 -1 84 -1 81 76|81 -1 -1 -1 0 76 77 79|81 -1 77 -1 72 -1 77 81|83 -1 79 -1 74 -1 79 83|80 -1 76 -1 71 -1 74 76|80 -1 -1 -1 0 0 0 0"],
   D:["41 45m 43 40sus","77 -1 -1 -1 -1 -1 -1 -1|76 -1 -1 -1 -1 -1 -1 -1|74 -1 -1 -1 79 -1 -1 -1|76 -1 -1 -1 0 0 0 0"],
   E:["45m 41 43 40 45m 41 407 45m","81 81 0 81 84 0 88 0|77 77 0 77 81 0 84 0|79 79 0 79 83 0 86 0|88 -1 -1 -1 83 -1 80 -1|81 81 0 81 84 0 88 0|89 -1 88 -1 84 -1 81 -1|83 -1 80 -1 76 -1 80 83|81 -1 -1 -1 0 0 0 0"]},
  champ:{I:["40m 40m","52 -1 -1 -1 -1 -1 -1 -1|52 0 0 52 0 0 55 0"],
   B:["48 50 47m 52m 48 50 477 477","72 -1 -1 76 -1 -1 79 -1|78 -1 -1 74 -1 -1 69 -1|71 -1 -1 74 -1 -1 78 -1|76 -1 -1 -1 0 0 0 0|79 -1 -1 76 -1 -1 72 -1|81 -1 -1 78 -1 -1 74 -1|75 -1 78 -1 81 -1 78 -1|75 -1 -1 -1 0 0 0 0"],
   D:["48 43 45m 47sus","76 -1 -1 -1 -1 -1 -1 -1|74 -1 -1 -1 -1 -1 -1 -1|72 -1 -1 -1 -1 -1 -1 -1|71 -1 -1 -1 0 0 0 0"],
   E:["52m 48 50 47 52m 48 477 52m","76 0 76 0 79 0 83 0|84 -1 83 -1 79 -1 76 -1|78 0 78 0 81 0 86 0|83 -1 -1 -1 78 -1 75 -1|76 0 76 0 79 0 83 0|88 -1 -1 -1 84 -1 79 -1|87 -1 83 -1 78 -1 75 -1|76 -1 -1 -1 0 0 0 0"]},
  curser:{I:["50m 457","74 -1 -1 -1 -1 -1 -1 -1|73 -1 -1 -1 -1 -1 -1 0"],
   B:["46 43m 41 45 46 43m 457 50m","77 -1 74 -1 70 -1 74 77|79 -1 -1 -1 74 -1 70 -1|72 -1 69 -1 65 -1 69 72|76 -1 -1 -1 73 -1 -1 0|82 -1 77 -1 74 -1 77 82|79 -1 -1 -1 82 -1 86 -1|85 -1 81 -1 76 -1 73 -1|74 -1 -1 -1 0 0 0 0"],
   D:["43m 50m 46 45sus","70 -1 -1 -1 -1 -1 -1 -1|74 -1 -1 -1 -1 -1 -1 -1|77 -1 -1 -1 -1 -1 -1 -1|76 -1 -1 -1 0 0 0 0"],
   E:["50m 46 43m 457 50m 46 43m 457","86 0 85 0 86 0 89 0|86 -1 82 -1 77 -1 74 -1|82 0 81 0 82 0 86 0|85 -1 81 -1 76 -1 73 -1|86 0 89 0 93 0 89 0|86 -1 82 -1 77 -1 82 -1|79 -1 82 -1 86 -1 82 -1|85 -1 -1 -1 0 0 0 0"]},
  final:{I:["48m 437","60 -1 -1 -1 -1 -1 -1 -1|59 -1 -1 -1 -1 -1 -1 -1"],
   B:["44 46 48m 48m 41m 44 437 437","63 -1 -1 -1 65 -1 67 -1|70 -1 -1 -1 67 -1 65 -1|67 -1 -1 -1 63 -1 60 -1|67 -1 -1 -1 -1 -1 0 0|68 -1 -1 -1 65 -1 60 -1|63 -1 -1 -1 68 -1 72 -1|71 -1 -1 -1 67 -1 62 -1|67 -1 -1 -1 0 0 0 0"],
   D:["48m 41m 44 437","72 -1 -1 75 -1 79 77 -1|-1 75 -1 74 72 -1 -1 0|75 -1 -1 79 -1 84 82 -1|79 -1 -1 -1 0 0 0 0","celesta"],
   E:["48m 44 41m 437 48m 44 46 437","72 -1 -1 75 -1 79 77 -1|-1 75 -1 74 72 -1 -1 0|77 -1 -1 80 -1 84 82 -1|-1 79 -1 77 74 -1 -1 0|84 -1 -1 87 -1 91 89 -1|-1 87 -1 86 84 -1 -1 0|82 -1 -1 79 -1 77 74 -1|79 -1 -1 -1 83 -1 -1 0"]},
  fin:{I:["45m 447","57 -1 -1 -1 -1 -1 -1 -1|56 -1 -1 -1 -1 -1 -1 -1"],
   B:["41 43 45m 45m 50m 41 407 407","72 -1 -1 69 72 -1 77 -1|74 -1 -1 71 74 -1 79 -1|76 -1 72 -1 69 -1 72 76|81 -1 -1 -1 0 76 77 79|77 -1 74 -1 69 -1 74 77|81 -1 77 -1 72 -1 69 -1|71 -1 68 -1 64 -1 68 71|76 -1 -1 -1 0 0 0 0"],
   D:["45m 41 43 40","69 -1 -1 72 -1 76 74 -1|-1 72 -1 71 69 -1 -1 0|72 -1 -1 76 -1 81 79 -1|76 -1 -1 -1 0 0 0 0","celesta"],
   E:["45m 41 50m 407 45m 41 43 407","81 -1 -1 84 -1 88 86 -1|-1 84 -1 83 81 -1 -1 0|86 -1 -1 89 -1 93 91 -1|-1 88 -1 86 83 -1 -1 0|81 -1 84 -1 88 -1 93 -1|89 -1 88 -1 84 -1 81 -1|83 -1 86 -1 91 -1 86 -1|88 -1 -1 -1 0 0 0 0"]}};
 // 魔椅：阿岳的主题倒过来；二番战的诅咒师：同一段旋律，被深渊染过
 W.chair={I:["48m 48m","48 -1 -1 -1 -1 -1 -1 -1|47 -1 -1 -1 -1 -1 -1 -1"],B:W.final.B,D:["48m 41m 44 437","72 -1 -1 69 -1 65 67 -1|-1 69 -1 70 72 -1 -1 0|75 -1 -1 72 -1 68 70 -1|71 -1 -1 -1 0 0 0 0","celesta"],
  E:["48m 44 46 437 48m 51 44 437","79 -1 80 -1 79 -1 75 -1|72 -1 -1 -1 75 -1 77 -1|79 -1 82 -1 80 -1 79 -1|77 -1 -1 -1 74 -1 71 -1|72 -1 75 -1 79 -1 84 -1|82 -1 79 -1 75 -1 70 -1|72 -1 -1 -1 77 -1 75 -1|74 -1 -1 -1 71 -1 -1 0"]};
 W.curser2=Object.assign({},W.curser,{I:["50m 457","62 -1 -1 -1 -1 -1 -1 -1|61 -1 -1 -1 -1 -1 -1 -1"]});
 for(const k in W){const T=TR[k];if(!T)continue;const Ach=[...Array(8)].map((_,i)=>T.ch[i%T.ch.length]);T.parts={A:{ch:Ach,mel:T.mel}};for(const p in W[k]){const [c,m,ld]=W[k][p];T.parts[p]={ch:C(c),mel:H(m),lead:ld}}
  T.order=O1;T.order2=O2;delete T._arr;delete T._arr2;delete T._intro}})();
