/* ===================== 奶蛙之塔 · 音效引擎 4.0 =====================
   三层做法：
   1. 真实采样（Kenney CC0）：每种声音 3~5 个变体轮着放，音高微微浮动，连打不像复读机
   2. 合成的「身体」：低频闷响、清脆的环、噼啪火星，按伤害大小加料
   3. 乐器采样（和配乐同一套音色）：三连、回血、胜利这类「有旋律」的提示音，和背景音乐是一个调
   另外：同一个声音 30 毫秒内最多叠两层（群体攻击不会爆音）；敌人在右、主角在左，带一点左右声像；
   重击、首领登场时配乐会自动让一下。 */
const SX={buf:{},ok:0,n:{},last:{},gate:{}};
function sxLoad(){if(SX.ok||!A.ctx||!window.__NWT_SX)return;SX.ok=1;const W=window.__NWT_SX;
 for(const k in W){const m=/^([a-zA-Z]+)(\d)$/.exec(k);if(m)SX.n[m[1]]=Math.max(SX.n[m[1]]||0,+m[2]+1);
  try{const bin=atob(W[k]);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);const p=A.ctx.decodeAudioData(a.buffer,b=>{SX.buf[k]=b},()=>{});if(p&&p.then)p.then(b=>{SX.buf[k]=b}).catch(()=>{})}catch(e){}}
 // 音效自己的小混响（配乐关掉时也有）
 try{const c=A.ctx;A.fxRev=c.createGain();A.fxRev.gain.value=1;const d1=c.createDelay(),d2=c.createDelay(),f1=c.createGain(),f2=c.createGain(),lp=c.createBiquadFilter(),o=c.createGain();d1.delayTime.value=.083;d2.delayTime.value=.127;f1.gain.value=.32;f2.gain.value=.28;lp.type="lowpass";lp.frequency.value=3200;o.gain.value=.5;
  A.fxRev.connect(lp);lp.connect(d1);lp.connect(d2);d1.connect(f1);f1.connect(d1);d2.connect(f2);f2.connect(d2);d1.connect(o);d2.connect(o);o.connect(A.fx)}catch(e){}}
function sxKey(k){if(SX.buf[k])return k;const n=SX.n[k];if(!n)return null;let i=Math.floor(Math.random()*n);if(n>1&&i===SX.last[k])i=(i+1)%n;SX.last[k]=i;return SX.buf[k+i]?k+i:null}
/* k 采样名（带变体的自动轮换）；vol 音量；rate 音高倍数；dt 延迟秒；o:{pan 左右,wet 混响,jit 音高浮动,lp 低通} */
function sxPlay(k,vol=.6,rate=1,dt=0,o){if(!A.ctx||!A.sfx)return false;sxLoad();const key=sxKey(k);if(!key)return false;const c=A.ctx;o=o||{};
 const at=c.currentTime+dt,g0=SX.gate[k];if(g0&&Math.abs(at-g0.t)<.03){g0.n++;if(g0.n>2)return false;dt+=.024*g0.n;vol*=.72}else SX.gate[k]={t:at,n:0};
 try{const src=c.createBufferSource();src.buffer=SX.buf[key];const jit=o.jit==null?.06:o.jit;src.playbackRate.value=rate*(1-jit+Math.random()*jit*2);
  const g=c.createGain();g.gain.value=vol*((window.__NWT_SXG||{})[key]||1);let node=src;
  if(o.lp){const f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=o.lp;node.connect(f);node=f}
  node.connect(g);let out=g;if(o.pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=o.pan;g.connect(p);out=p}
  out.connect(A.fx||A.out||c.destination);if(o.wet&&A.fxRev){const w=c.createGain();w.gain.value=o.wet;out.connect(w);w.connect(A.fxRev)}
  src.start(c.currentTime+dt)}catch(e){return false}return true}
/* 配乐让位：amt 降到原来的几成，ms 多久恢复 */
function duck(amt=.55,ms=320){const c=A.ctx;if(!c||!A.bgm||!A.music)return;const g=A.bgm.gain,t=c.currentTime,base=A.bgmVol||.22;try{g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(base*amt,t+.03);g.linearRampToValueAtTime(base,t+.03+ms/1000)}catch(e){}}
/* 用乐器采样弹一串音（还没加载完就返回 false，调用的人自己用合成音兜底） */
function mel(inst,notes,gap,vol,o){if(!A.ctx||typeof samp!=="function"||typeof SF==="undefined"||!SF[inst]||!SF[inst].keys.length)return false;o=o||{};const t=A.ctx.currentTime+(o.dt||0);
 notes.forEach((m,i)=>{if(m>0)samp(inst,m,t+i*gap,o.dur||Math.max(.25,gap*3),vol*(o.cresc?(.6+.4*i/Math.max(1,notes.length-1)):1),o.wet==null?.25:o.wet,A.fx)});return true}
const _t=()=>A.ctx?A.ctx.currentTime:0;const _ok=()=>!!(A.ctx&&A.sfx);
function crackle(n,vol=.1,dt=0){if(!_ok())return;const t=_t()+dt;for(let i=0;i<n;i++)noise({t:t+.03+Math.random()*.22,dur:.015+Math.random()*.02,vol:vol*(.6+Math.random()*.6),filt:"highpass",f:3500+Math.random()*3000})}
function bubbles(n,dt=0){if(!_ok())return;const t=_t()+dt;for(let i=0;i<n;i++){const f=280+Math.random()*260;tone({type:"sine",f,f2:f*2.3,t:t+i*.045+Math.random()*.02,dur:.06,vol:.09})}}
function ring(f,dur=.14,vol=.04,dt=0){if(!_ok())return;const t=_t()+dt;tone({type:"sine",f,t,dur,vol});tone({type:"sine",f:f*1.34,t,dur:dur*.7,vol:vol*.6})}
function thump(f=140,f2=60,dur=.1,vol=.16,dt=0){if(!_ok())return;tone({type:"sine",f,f2,t:_t()+dt,dur,vol})}

/* 手机喇叭放不出 200Hz 以下的声音，所以每一下打击都要有一层「中频的脆响」：
   smack 是拍击声（书本拍桌子的采样），crack 是合成的短促噪声，低频的闷响只是垫在下面加分量 */
function smack(vol=.4,rate=1,dt=0,P){if(!_ok())return;sxPlay("place",vol,rate,dt,P)}
function crack(vol=.14,dt=0,f=2200){if(!_ok())return;noise({t:_t()+dt,dur:.035,vol,filt:"bandpass",f,f2:f*.6,q:.8})}
/* ---------- 打中敌人：K 出手方式，o:{d 伤害,crit 暴击} ---------- */
function hitSound(K,big,o){if(!A.ctx||!A.sfx)return;sxLoad();o=o||{};const d=o.d==null?(big?20:9):o.d;const L=d<6&&!big,X=d>=30;const P={pan:.22,wet:big?.18:0};const v=L?.88:1;const HR=(typeof S!=="undefined"&&S&&S.hero)||"naiwa";
 const KF=K==="fist"&&typeof S!=="undefined"&&S&&S.hero==="kungfu";
 if(K==="fist"){if(L&&KF){sxPlay("punch",.7,.95,0,P);sxPlay("thud",.45,.85,0,P);thump(140,60,.12,.14)}else if(L){sxPlay("tick",.55,1.1,0,P);sxPlay("thud",.42,1.05,0,P);if(HR==="naiwa")thump(170,90,.08,.1)}else if(!big){sxPlay("punch",.75,KF?.9:1,0,P);smack(.4,KF?.85:1,0,P);thump(KF?125:150,KF?50:70,KF?.16:.09,KF?.2:.12);if(KF)sxPlay("punchH",.5,.9,.006,P)}else{sxPlay("punchH",.8,.96,0,P);sxPlay("punch",.55,.86,.008,P);smack(.55,.8,0,P);crack(.2);thump(125,45,.2,.26)}}
 else if(K==="blade"){if(!big){sxPlay("slash",.8*v,1.05,0,P);sxPlay("blade",.5*v,1,.015,P);ring(2300,.12,.035,.02)}else{sxPlay("slash",.95,.9,0,P);sxPlay("clank",.6,.85,.03,P);sxPlay("blade",.6,.85,.02,P);ring(1800,.22,.05,.03);thump(110,50,.18,.22,.03)}}
 else if(K==="claw"){sxPlay("slash",.62*v,1.35,0,P);sxPlay("slash",.5*v,1.52,.045,P);sxPlay("hit",.5*v,1.15,.03,P);if(big){sxPlay("punch",.5,.9,.03,P);thump(130,55,.16,.2,.03)}}
 else if(K==="fire"){sxPlay("boomx",(big?.7:.5)*v,big?1:1.25,0,P);sxPlay("firew",.3*v,1.2,.02,P);crackle(big?7:4,.09*v);crack(.12*v,0,1500)}
 else if(K==="ice"){sxPlay(big?"glassH":"glass",.95*v,big?.9:1.1,0,P);if(!mel("celesta",[96,103,108].map(m=>m+[0,2,4][Math.floor(Math.random()*3)]),.03,.5,{wet:.5}))[0,1,2].forEach(i=>tone({type:"sine",f:mtof(96+[0,4,7,11][Math.floor(Math.random()*4)]),t:_t()+i*.03,dur:.25,vol:.06}));if(big){sxPlay("punch",.5,.9,.01,P);thump(120,50,.16,.18)}}
 else if(K==="thunder"){noise({t:_t(),dur:.05,vol:.36*v,filt:"highpass",f:2500});sxPlay("boomx",.45*v,1.5,.01,P);noise({t:_t()+.04,dur:.5,vol:.2*v,filt:"lowpass",f:900,f2:150,q:.5});crack(.16*v,.01,1800)}
 else if(K==="water"){noise({t:_t(),dur:.24,vol:.42*v,filt:"bandpass",f:2400,f2:500,q:.6});bubbles(big?5:3,.03);sxPlay("tick",.5*v,.9,0,P);if(big)sxPlay("punch",.45,.9,.01,P)}
 else if(K==="earth"){sxPlay("rock",.5*v,.9,0,P);sxPlay("knock",.7*v,.7,0,P);crack(.2*v,0,900);crackle(big?6:3,.07);if(big){sxPlay("punchH",.55,.7,.01,P);thump(80,40,.22,.22)}}
 else if(K==="star"){if(!mel("celesta",[91,95,98],.03,.55,{wet:.5}))sxPlay("gem",.5,1.5);sxPlay("tick",.5*v,1.3,0,P);if(big)sxPlay("punch",.45,1.1,.01,P)}
 else{sxPlay("tick",.5,1.1+Math.random()*.1,0,P);sxPlay("thud",.28,1.1,0,P)}
 if(K==="fist"&&HR==="naiwa"&&!L){sxPlay("thud",.5,.78,.01,P);thump(105,48,.2,.2,.01)}if(K==="blade"&&d>=14&&!big){sxPlay("clank",.4,.95,.02,P);thump(120,55,.14,.16,.02)}if(K==="claw"&&d>=14&&!big){sxPlay("punch",.4,1,.03,P);thump(135,60,.12,.14,.03)}if(X||(big&&(K==="fire"||K==="thunder"||K==="earth")))sxPlay("sub",X?.55:.35,1,.01);
 if(o.crit){sxPlay("crit",.55,1.15,.012,P);crack(.2,0,4000);duck(.75,200)}else if(X)duck(.7,260)}
/* 被护盾挡住 */
function blockSound(enemySide){if(!_ok())return;sxPlay("clank",.7,1.05+Math.random()*.1,0,{pan:enemySide?.22:-.22});ring(1500,.1,.04)}

/* ---------- 其他全部音效 ---------- */
function sfx(n){if(!A.ctx||!A.sfx)return;sxLoad();const t=_t();const hs=(typeof B!=="undefined"&&B&&B.hitStreak)||0;
 switch(n){
 /* 界面 */
 case"click":sxPlay("click",.6)||tone({type:"sine",f:740,t,dur:.06,vol:.08});break;
 case"card":sxPlay("flip",.5,1.05)||noise({t,dur:.12,vol:.18,f:1800,f2:5000,q:.6});noise({t,dur:.09,vol:.05,f:2400,f2:5200,q:.7});break;
 case"draw":sxPlay("place",.2,1.2)||noise({t,dur:.06,vol:.08,f:3000,q:.8});break;
 case"coin":sxPlay("coins",.45);if(!mel("celesta",[88,95],.07,.42,{wet:.3})){tone({type:"square",f:988,t,dur:.07,vol:.05});tone({type:"square",f:1319,t:t+.07,dur:.2,vol:.05})}break;
 case"relic":sxPlay("gem",.42);if(!mel("music_box",[79,83,86,91,95],.055,.5,{wet:.45}))[79,83,86,91].forEach((m,i)=>tone({type:"sine",f:mtof(m),t:t+i*.05,dur:.5,vol:.09}));break;
 case"turn":sxPlay("knock",.36);sxPlay("knock",.3,1.26,.09);mel("orchestral_harp",[72,79],.06,.3,{dt:.02})||[72,76,79].forEach((m,i)=>tone({type:"triangle",f:mtof(m),t:t+i*.05,dur:.25,vol:.07}));break;
 case"enemy":if(!mel("timpani",[41,36],.17,1.1,{dur:.6,wet:.2}))[57,53].forEach((m,i)=>tone({type:"sawtooth",f:mtof(m),t:t+i*.1,dur:.2,vol:.06,filt:"lowpass",ff:900}));break;
 /* 状态 */
 case"heal":if(!mel("orchestral_harp",[67,71,74,79,83],.06,1,{wet:.4,cresc:1}))[67,71,74,79].forEach((m,i)=>tone({type:"sine",f:mtof(m),t:t+i*.07,dur:.35,vol:.1}));noise({t,dur:.3,vol:.025,filt:"highpass",f:5200});break;
 case"buff":if(!mel("celesta",[76,81,88],.05,.8,{wet:.35,cresc:1})){tone({type:"sine",f:440,f2:880,t,dur:.3,vol:.1});tone({type:"triangle",f:660,f2:1320,t:t+.05,dur:.3,vol:.05})}break;
 case"debuff":if(!mel("marimba",[58,57,51],.075,.75,{wet:.2}))tone({type:"sawtooth",f:500,f2:200,t,dur:.3,vol:.08,filt:"lowpass",ff:1500});noise({t,dur:.2,vol:.06,filt:"lowpass",f:600,f2:200});break;
 case"block":sxPlay("clank",.5,1.25,0,{pan:-.2})||tone({type:"triangle",f:880,t,dur:.18,vol:.1});tone({type:"sine",f:1320,t:t+.02,dur:.16,vol:.05});tone({type:"sine",f:1980,t:t+.02,dur:.1,vol:.03});break;
 case"hurt":sxPlay("body",.55,1,0,{pan:-.22})||noise({t,dur:.15,vol:.25,f:700});smack(.5,.85,0,{pan:-.22});noise({t,dur:.1,vol:.14,filt:"bandpass",f:1300,f2:600,q:.7});thump(120,55,.16,.2);duck(.75,220);break;
 case"mud":sxPlay("slime",.5,.95)||noise({t,dur:.25,vol:.25,filt:"lowpass",f:600,f2:150});thump(140,70,.2,.16);break;
 case"poison":sxPlay("slime",.5,1.35);bubbles(2);break;
 case"sizzle":noise({t,dur:.2,vol:.16,filt:"highpass",f:3000});crackle(4,.12);break;
 case"bleed":sxPlay("tick",.45,1.3,0,{pan:.2});noise({t,dur:.06,vol:.1,filt:"bandpass",f:1800,q:2});break;
 case"inj":sxPlay("tick",.45,.8,0,{pan:.2});sxPlay("thud",.3,.8,0,{pan:.2});thump(95,50,.12,.12);break;
 case"dodge":sxPlay("whoosh",.45,1.65);break;
 case"throw":sxPlay("whoosh",.4,1.5);break;
 case"egg":sxPlay("glass",.45,1.55);[0,1].forEach(i=>tone({type:"sine",f:2400,f2:3300,t:t+.12+i*.09,dur:.05,vol:.1}));break;
 /* 不带出手方式的伤害（流血、遗物、泥巴…） */
 case"hit":sxPlay("tick",.5,1.05,0,{pan:.2})||tone({type:"sine",f:190,f2:90,t,dur:.08,vol:.16});sxPlay("thud",.3,1.05,0,{pan:.2});break;
 case"bighit":sxPlay("punchH",.62,.88,0,{pan:.2});sxPlay("punch",.5,.9,0,{pan:.2});smack(.45,.85,0,{pan:.2});thump(130,50,.18,.2);break;
 case"boom":sxPlay("boomx",.7);sxPlay("sub",.45,1,.01);crackle(5,.08,.05);duck(.5,380);break;
 /* 消除 */
 case"tri":sxPlay("tri",.3);if(!mel("marimba",[72,76,79,84],.055,.5,{wet:.3}))[72,76,79,84,88].forEach((m,i)=>tone({type:"triangle",f:mtof(m),t:t+i*.06,dur:.4,vol:.12}));mel("celesta",[88],.01,.4,{dt:.22,wet:.5});break;
 case"tri2":{const lv=Math.min(6,(typeof B!=="undefined"&&B&&B._lvSfx)||2),b=72+lv*2;sxPlay("tri",.3,1+lv*.04);thump(95,45,.3,.3);
  if(!mel("marimba",[0,4,7,12,16].map(m=>b+m),.045,.52,{wet:.3,cresc:1}))[0,4,7,12,16].forEach((m,i)=>tone({type:"triangle",f:mtof(b-2+m),t:t+.04+i*.045,dur:.45,vol:.12}));
  mel("celesta",[b+24],.01,.42,{dt:.25,wet:.5});if(lv>=3){mel("taiko_drum",[48],.01,.6,{dur:.6});duck(.7,300)}if(lv>=5)sxPlay("sub",.35,1,.02);break}
 case"combo":{sxPlay("combo",.28,1+Math.min(.6,hs*.05));const k=Math.min(16,hs||2);tone({type:"triangle",f:mtof(67+k),t,dur:.09,vol:.08});break}
 /* 大场面 */
 case"kill":sxPlay("punch",.5,1.2,0,{pan:.22});smack(.4,1.3,0,{pan:.22});sxPlay("kill",.4,1,0,{pan:.22});break;
 case"bigkill":sxPlay("bigkill",.6,1,0,{pan:.2,wet:.3});sxPlay("boomx",.5,.9,0,{pan:.2});crack(.2);smack(.5,.7,0,{pan:.2});duck(.5,700);break;
 case"cutin":sxPlay("whoosh",.6,.7);noise({t,dur:.38,vol:.26,filt:"bandpass",f:300,f2:5200,q:.9});sxPlay("punchH",.7,.8,.3);thump(70,40,.5,.45,.3);
  if(!mel("trumpet",[62,69,74],.001,.36,{dt:.3,dur:.5,wet:.3}))[0,7,12,19].forEach(m=>tone({type:"sawtooth",f:mtof(62+m),t:t+.32,dur:.6,vol:.05,filt:"lowpass",ff:2600}));mel("taiko_drum",[48],.01,.7,{dt:.3,dur:.7});duck(.45,600);break;
 case"bossIn":sxPlay("bell",.5,.5,0,{wet:.3});sxPlay("sub",.5,.9,.05);tone({type:"sine",f:58,f2:46,t,dur:1.7,vol:.28});
  if(mel("timpani",[36,36,36,36,36,36,36,36,36,36],.1,.55,{dur:.3,cresc:1,wet:.2})){mel("cello",[36],.01,.5,{dur:2,dt:.05});mel("tubular_bells",[48],.01,.4,{dt:1,dur:2,wet:.5})}
  else[0,7,12].forEach(m=>tone({type:"sawtooth",f:mtof(36+m),t:t+.08,dur:1.9,vol:.045,filt:"lowpass",ff:520}));duck(.3,1800);break;
 case"form":noise({t,dur:1.3,vol:.42,filt:"bandpass",f:300,f2:4200,q:1.2});tone({type:"sawtooth",f:110,f2:224,t,dur:1.3,vol:.14,filt:"lowpass",ff:1200});mel("timpani",[36,36,36,36,36,36,36,36,36,36,36,36],.1,.5,{dur:.25,cresc:1});duck(.4,1500);break;
 case"formHit":sxPlay("sub",.6);sxPlay("boomx",.42,.72,.01);sxPlay("bell",.4,.55,.02,{wet:.4});mel("tubular_bells",[43],.01,.45,{dur:2.5,wet:.5});duck(.4,900);break;
 case"win":sxPlay("gem",.3);if(mel("trumpet",[67,72,76,79],.11,1,{dur:.22,wet:.3})){mel("trumpet",[84],.01,1.1,{dt:.44,dur:.9,wet:.35});mel("french_horn",[60,64,67],.001,.6,{dt:.44,dur:.9,wet:.3});mel("timpani",[48],.01,.8,{dur:.5});mel("timpani",[36],.01,.9,{dt:.44,dur:.9});mel("orchestral_harp",[60,64,67,72,76,79,84,88],.028,.5,{dt:.4,wet:.4})}
  else[72,76,79,84].forEach((m,i)=>tone({type:"triangle",f:mtof(m),t:t+i*.12,dur:.5,vol:.14}));duck(.4,1300);break;
 case"lose":if(!mel("cello",[57,55,53,52],.32,1.4,{dur:.6,wet:.4}))[62,61,60,59].forEach((m,i)=>tone({type:"sawtooth",f:mtof(m-12),t:t+i*.3,dur:.35,vol:.12,filt:"lowpass",ff:1000}));mel("timpani",[40],.01,.8,{dur:1});duck(.3,1600);break;
 case"levelup":sxPlay("levelup",.45);mel("orchestral_harp",[60,62,64,67,69,72,74,76,79,81,84,88],.03,.34,{wet:.4,cresc:1});mel("french_horn",[67,72],.16,.4,{dt:.2,dur:.5,wet:.3});break;
 case"catchOk":sxPlay("gem",.4);mel("marimba",[72,76,79,84,88],.06,.5,{wet:.3})||sfx("relic");break;
 case"catchFail":sxPlay("slash",.5,1.3);tone({type:"triangle",f:520,f2:260,t:t+.05,dur:.25,vol:.12});break;
 case"laugh":for(let i=0;i<6;i++){const d=i*.13,f=[320,360,330,370,300,340][i];tone({type:"sawtooth",f,f2:f*.8,t:t+d,dur:.1,vol:.24,filt:"bandpass",ff:900});tone({type:"triangle",f:f*2.2,f2:f*1.8,t:t+d,dur:.08,vol:.13});noise({t:t+d,dur:.05,vol:.14,filt:"bandpass",f:1800,q:2})}break;
 /* 出手：挥出去的那一下（打中的声音在 hitSound） */
 case"atk_naiwa":sxPlay("whoosh",.45,.85,0,{pan:-.15});break;
 case"atk_kungfu":sxPlay("whoosh",.62,.95+Math.min(.35,((typeof B!=="undefined"&&B&&B.combo)||0)*.05),0,{pan:-.15});break;
 case"atk_knight":sxPlay("schwing",.95,1,0,{pan:-.15})||sxPlay("whoosh",.45,1.1);break;
 case"atk_vamp":sxPlay("whoosh",.5,.68,0,{pan:-.15});tone({type:"sine",f:420,f2:130,t,dur:.12,vol:.06});break;
 case"atk_mage":sxPlay("whoosh",.35,1.2,0,{pan:-.15});tone({type:"sine",f:880,f2:1320,t,dur:.15,vol:.05});break;
 /* 法术出手 */
 case"sp_fire":sxPlay("firew",.42,1.1,0,{pan:-.1});crackle(4,.08);thump(90,50,.3,.14);break;
 case"sp_ice":if(!mel("celesta",[96,100,103,108],.04,.65,{wet:.5}))[96,100,103,108].forEach((m,i)=>tone({type:"sine",f:mtof(m),t:t+i*.04,dur:.35,vol:.08}));noise({t,dur:.2,vol:.12,filt:"highpass",f:5000});break;
 case"sp_thunder":noise({t,dur:.06,vol:.32,filt:"highpass",f:2000});noise({t:t+.05,dur:.45,vol:.2,filt:"lowpass",f:900,f2:120,q:.5});tone({type:"sawtooth",f:70,f2:40,t:t+.04,dur:.4,vol:.09,filt:"lowpass",ff:400});break;
 case"sp_arc":if(!mel("music_box",[76,83,88,95],.035,.6,{wet:.45}))[76,83,88,95].forEach((m,i)=>tone({type:"triangle",f:mtof(m),t:t+i*.035,dur:.25,vol:.06}));tone({type:"sine",f:440,f2:1760,t,dur:.3,vol:.04});break;
 case"sp_water":noise({t,dur:.28,vol:.36,filt:"bandpass",f:1800,f2:420,q:.6});bubbles(5);break;
 case"sp_earth":sxPlay("rock",.4,.8);sxPlay("knock",.55,.75);crackle(3,.06);thump(80,45,.28,.16);break;
 }}
