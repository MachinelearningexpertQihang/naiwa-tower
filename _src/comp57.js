/* ===================== 5.7 同伴、支线、梦、名人堂 =====================
   这一份文件在 ss55.js 之后加载，用的还是「包一层原函数」的写法：
   {const _x=fn; fn=function(){...; return _x.apply(this,arguments)}}
   所有新内容都在这里，方便以后找。 */

/* ---------- 0. 小工具 ---------- */
const C57={};
// 战斗/事件结束回到地图时，按顺序播放排队的对话（支线道谢、同伴后续）
function postQ(lines){if(!S)return;S.postQ=S.postQ||[];S.postQ.push(lines);saveRun()}
{const _om=openMap;openMap=function(){try{if(S&&S.postQ&&S.postQ.length&&!B){const q=S.postQ.shift();saveRun();const a=arguments;talk(q).then(()=>openMap.apply(this,a));return}}catch(e){console.warn(e)}return _om.apply(this,arguments)}}
// 同伴结局：记进存档（名人堂会用），同时给成就
function compEnd(id,key){try{M.compEnds=M.compEnds||{};const k=id+"_"+key;if(!M.compEnds[k]){M.compEnds[k]=Date.now();saveMeta()}ach("ce_"+k)}catch(e){}}

/* ---------- 1. 同伴：新同伴「桂嫂」 ---------- */
COMP.hen={n:"桂嫂",img:"ck",why:"丢了七个蛋的奶鸡，一路往上找",beats:["c_hen0","c_hen1","c_hen2","c_hen3","c_hen4"]};

/* ---------- 2. 同伴说话的小气泡 ---------- */
const COMP_LINES={
 iron:{tav:["酒倒一半。剑要握得稳。","年轻时我也在这种地方吹过牛。吹完第二天就下山了。","别看我，喝你的。……行，就一口。"],
  boss:["腰转过来。……别看我，看它。","这个比我年轻时见过的都大。没事，大的倒下来声音也大。","站稳。先挨一下，再还它两下。"],
  proto:["铁皮的？我年轻时候那身盔甲，也就比它新一点。","它的关节冻住了。打左腿，左腿慢。"],
  arena:["这地方……我来过。","沙子还是这个颜色。"],
  curser:["别听它说话。说话准的人，最会骗人。","书这么多，没一本是给人看的。"]},
 blue:{tav:["老板，记他账上。","押大！……我是说，你随意。","这家的骰子灌了铅，我闻得出来。"],
  boss:["我数到三你就上。一……我先躲一下。","赢了请我喝奶茶，输了……输了就别提了。","我押你赢。别问押了多少。"],
  proto:["怎么会有这种金属质感的奶蛙？这也太神奇了，不过就是破破烂烂的。","这一身铁皮能卖多少钱？……我就问问。"],
  arena:["赔率多少？……我就问问。","看台上那几个，我都欠过钱。"],
  curser:["这人看我的眼神，跟我债主一模一样。","它那本子上要是有我的名字，后面肯定写着『欠』。"]},
 fire:{tav:["老板，一杯热牛奶。……别笑！","我哥以前也爱来这种地方，他酒量可差了。","我请你！……等我找到我哥，让他请你。"],
  boss:["我先冲！你帮我看着包！","它好大……没事，我哥打过更大的。……应该打过。"],
  proto:["它身上也有补丁，跟我的包一样。","它是不是也在找谁？"],
  arena:["我哥要是在，肯定能打进前三！","这里的沙子好烫，我哥以前光着蹄子跑的。"],
  curser:["它在写什么？……它为什么写我的名字？","我不怕它。……你走前面。"]},
 bean:{tav:["老板，能借个炉子吗？给包裹热一热。","我送了十二年件，从没拆过一单。","这儿能寄信吗？……算了，我自己就是寄信的。"],
  boss:["收件人不是它吧？不是就好。打吧。","包裹给你拿着。……还是我拿着吧。"],
  proto:["它身上有个编号……第一任？这地址可真难找。","铁皮的，收件的时候要签字吗？"],
  arena:["这里收件地址怎么写？『斗场，躺着的那位』？","我送过一单到这儿。收件人那天输了，没人签。"],
  curser:["它身上好多诅咒……能寄吗？算了，不收。","这么多本子，寄出去得跑一百年。"]},
 hen:{tav:["老板，蛋怎么卖？……我就问问，不买。","你吃饱了没有？没吃饱我这儿还有米。","这一桌的鸡蛋饼……别让我看见。"],
  boss:["打它！往肚子打！我闻见它身上有蛋味！","你小心点。你也是谁家的孩子。"],
  proto:["铁皮做的？它也有娘吗？","它在冰上走了多少年了……脚都磨平了。"],
  arena:["这么多人看着，打赢了也不给蛋。","这地方的沙子，孵不出东西。"],
  curser:["它本子上写着我的蛋……它怎么知道有几个？","我不听它的。蛋是我下的，我说了算。"]}};
// 这个同伴现在能不能说话：没同行、走了、不在了、被拉走了，都不说
function compActive(){const c=S&&S.comp;if(!c||!COMP_LINES[c.id])return false;if(c.gone||c.dead||c.left||c.swept)return false;if(c.id==="fire"&&c.alive===0)return false;if(c.done<0)return false;if(!(c.rel>=1)&&c.id!=="blue")return false;return true}
let CB_Q=[],CB_ON=0;
// 一次只出一条，排队；同一句不会连着排两次
function compSay(text){if(!text||!S||(!S.comp&&typeof text!=="object"))return;if(CB_Q.some(x=>x===text||(x&&x.t&&text&&x.t===text.t)))return;CB_Q.push(text);if(!CB_ON)cbNext()}
function cbNext(){let t=CB_Q.shift();if(!t){CB_ON=0;return}CB_ON=1;let th=null;if(typeof t==="object"){th=t;t=t.t}const C=th?{img:th.img}:((S.comp&&COMP[S.comp.id])||{});document.querySelectorAll(".cmpB").forEach(x=>x.remove());const d=document.createElement("div");d.className="cmpB"+($("#event.on")?" ev":"")+(th?" think":"");d.innerHTML=`<div class="av"><img src="${IMG(C.img)}" alt=""></div><div class="bx">${th?"":`<span class="nm">${C.n}</span>`}${th?"（"+t+"）":t}</div>`;const st=$("#stage");if(!st){CB_ON=0;return}st.appendChild(d);requestAnimationFrame(()=>d.classList.add("on"));const ms=Math.max(2600,1400+t.length*120);setTimeout(()=>{d.classList.remove("on");setTimeout(()=>{d.remove();cbNext()},380)},ms)}
function compLine(kind,once){try{if(!compActive())return;const L=COMP_LINES[S.comp.id][kind];if(!L||!L.length)return;S.comp.said=S.comp.said||{};if(once){const k=kind+"_"+once;if(S.comp.said[k])return;S.comp.said[k]=1}const n=S.comp.said[kind]|0;S.comp.said[kind]=n+1;compSay(L[n%L.length])}catch(e){console.warn(e)}}
// 酒馆：进门说一句；替它还过钱的阿蓝，前两次会抢着付酒钱
{const _tv=tavernScreen;tavernScreen=function(){const r=_tv.apply(this,arguments);try{const c=S.comp;if(c&&c.id==="blue"&&c.blue==="paid"&&compActive()&&(c.treat|0)<2&&S.cur&&!S.cur.treated){S.cur.treated=1;c.treat=(c.treat|0)+1;S.gold+=20;renderTop();saveRun();setTimeout(()=>compSay("这次记我账上。真的记我账上。（阿蓝付了酒钱：+20 金币）"),700)}else setTimeout(()=>compLine("tav"),700)}catch(e){}return r}}
// 首领战：开打前说一句
{const _sc=startCombat;startCombat=function(kind){const r=_sc.apply(this,arguments);try{if(["B","K","F","C","O"].includes(kind))setTimeout(()=>compBoss(),1300)}catch(e){}return r}}
// SS 路线：每到一个节点说一句
function ssLine(){const a=S.act||0;return a===2?"proto":a===3?"arena":a===4?"curser":null}
{const _en=enterNode;enterNode=function(t,resumed,cur){const r=_en.apply(this,arguments);try{if(!resumed&&["X","H","P","D","U","J","L"].includes(t)){const k=ssLine();if(k)setTimeout(()=>compLine(k),900)}}catch(e){}return r}}

/* ---------- 3. 老铁 ---------- */
Object.assign(EVENTS,{
 c_iron2:{story:1,n:"冻伤的腿",img:"dgt",t:"冰原上，老铁的腿冻得发紫，走一步停三步。「别管我，你先走。」它说。",o:()=>[
  {t:"陪它歇一会儿",d:"<span class='good'>回复 10 生命</span>，老铁更信任你了",f:()=>{S.hp=Math.min(S.max,S.hp+10);cp().rel++;cp().hint=1;return"你们靠着一块石头，看了很久的雪。老铁讲了它年轻时候的事，讲到一半停住了：「我爹年轻时也上过塔。在奶茶厂那一层……算了，不说这个。」后来它靠着石头睡着了。"}},
  {t:"背它走一段",d:"<span class='bad'>失去 6 生命</span>，<span class='good'>最大生命 +5</span>",f:()=>{S.hp=Math.max(1,S.hp-6);S.max+=5;return"老铁在你背上嘟囔：「丢人，丢人……」可它一直没下来。"}}]},
 c_iron4:{story:1,n:"老铁的佩剑",img:"dgt",t:()=>{const d=cp().duel;if(d==="let")return"星空之顶的台阶边，插着一把剑。剑刃上全是磨过的痕迹，一道压着一道。";if(d==="together")return"台阶下，老铁拄着剑站着，站得笔直。「这次没坐下。」它说，「是站着送你的。」";return"星空之顶的台阶下，老铁坐了下来，再也站不起来了。「我就到这儿了。比上次高。」它把那把旧剑递给你，「剑是好剑，人老了。替我上去。」"},o:()=>{const d=cp().duel;
  if(d==="let")return[{t:"把剑拔出来",d:"<span class='good'>获得遗物「磨了四十年的剑」</span>：每场战斗开始力气 +2",f:()=>{gainRelic("comp_sword2");compEnd("iron","let");return"剑出鞘的时候很轻。你想起老铁说的那句：腰要转过来。"}}];
  if(d==="together")return[{t:"接过佩剑",d:"<span class='good'>获得遗物「老铁的佩剑」</span>：每场战斗开始力气 +1",f:()=>{gainRelic("comp_sword");compEnd("iron","tog");return"它把剑给了你，自己留着剑鞘。「剑跟你走。鞘我留着，回去给我爹坟上放一个。」"}}];
  return[{t:"接过佩剑",d:"<span class='good'>获得遗物「老铁的佩剑」</span>：每场战斗开始力气 +1",f:()=>{gainRelic("comp_sword");compEnd("iron","base");return"你回头的时候，老铁靠着栏杆，在看星星。"}}]}}});
// 斗场最后一场之前：带着老铁的话，它会拦住你
const IRON_IN=[["dgt","老铁","（老铁没往场上走。他站在门口，看着场中间那个背影，看了很久。）"],
 ["dgt","老铁","四十年前，我爹站的就是那个位置。"],
 ["dgt","老铁","我说我爬到第三层就下去了，是怕。……不是怕。是那年，我爹没从这里出来。我回去埋他，埋完，就再也没上来。"],
 ["dgt","老铁","（他把剑拔出来。剑刃上全是磨过的痕迹，一道压着一道。）"],
 ["dgt","老铁","这四十年，我每天都在磨它。这一场，让我来。"]];
function ironGate(){show("event");setBg("teaarena");$("#event").innerHTML=`<div class="evBox"><div class="phead"><span class="ribbon">斗场门口</span></div><div class="evPic"><img src="${IMG("dgt")}"></div><div class="evTxt"><p id="evP">老铁握着剑，等你开口。</p><div class="evOpts"><button class="evo" data-k="let"><b>不拦他</b><small>让老铁一个人上场</small></button><button class="evo" data-k="stop"><b>拦住他</b><small>你自己上场</small></button><button class="evo" data-k="together"><b>跟他一起上</b><small>老铁每回合帮你砍一刀</small></button></div></div></div>`;
 $$("#event .evo").forEach(b=>b.onclick=async()=>{if(b.dataset.busy)return;$$("#event .evo").forEach(x=>x.dataset.busy=1);sfx("click");const k=b.dataset.k,c=cp();c.duel=k;saveRun();
  if(k==="let"){c.dead=1;saveRun();await talk([["n1","","（你让开了。）"],["n1","","（老铁走上场的时候，腿还是一瘸一拐的。不灭的斗士转过身，看了他一眼。）"],["v_champ","不灭的斗士","……你握剑的样子，跟一个老家伙很像。"],["dgt","老铁","那是我爹。"],["n1","","（喇叭没有报幕。看台上一个人都没有。你只听见剑撞在盾上的声音，一下，又一下，一直响到天黑。）"],["n1","","（最后倒下的，是不灭的斗士。）"]]);
   postQ([["n1","","（那天晚上，老铁拄着剑走回来，在你旁边坐下，坐得很慢。）"],["dgt","老铁","爹，打完了。"],["n1","","（然后他就靠着墙睡着了。）"],["n1","","（第二天早上，你没能叫醒他。）"]]);S.dsq.g+=100;return dsqDone()}
  if(k==="stop"){c.gone=1;compEnd("iron","stop");saveRun();await talk([["n1","","（你挡在他前面。）"],["dgt","老铁","（老铁看着你，眼睛很红。）……你不懂。"],["dgt","老铁","我等了四十年。四十年，你懂吗？"],["n1","","（你没让。）"],["n1","","（过了很久，他把剑收回了鞘里，转身往外走。走到门口，他停了一下，没回头。）"],["dgt","老铁","替我上去吧。我上不去了。"]]);return C57.dsqStep()}
  await talk([["n1","","「一起。」"],["dgt","老铁","（老铁愣了一下，然后笑了。）这算哪门子单挑。"],["n1","","（可他还是往旁边挪了一步，给你让出半个位置。）"]]);return C57.dsqStep()})}
C57.dsqStep=dsqStep;
dsqStep=function(){try{const s=S.dsq,D=s&&DSQ[s.st],c=S.comp;if(D&&D.boss&&c&&c.id==="iron"&&compActive()&&!c.duel){show("event");setBg("teaarena");$("#event").innerHTML="";return talk(IRON_IN).then(ironGate)}}catch(e){console.warn(e)}return C57.dsqStep.apply(this,arguments)};
// 一起上：老铁每回合砍一刀，每三回合帮你挡一下
{const _st=startTurn;startTurn=async function(){const r=await _st.apply(this,arguments);try{if(B&&!B.over&&B.kind==="D"&&S.dsq&&DSQ[S.dsq.st]&&DSQ[S.dsq.st].boss&&S.comp&&S.comp.duel==="together"){const e=B.alive()[0];if(e){const d=7+Math.floor(B.turn/2);dealEnemy(e,d);toast(`老铁砍了一刀：<b>${d}</b>`);sfx("click")}if(B.turn%3===0){B.block(6,1);toast("老铁替你挡了一下：<b>6</b> 护盾")}}
 if(B&&!B.over&&S.comp&&S.comp.id==="hen"&&S.comp.chick&&compActive()){B.block(2,1)}
 if(B&&!B.over&&B.turn===1&&has("comp_chick")){B.layEgg({t:1,d:5,b:0,mini:1,nw:1});relicPulse("comp_chick")}}catch(e){console.warn(e)}return r}}
{const _dd=dsqDone;dsqDone=async function(){try{const c=S.comp;if(c&&c.id==="iron"&&c.duel==="together"&&compActive()){show("none");setBg("teaarena");await talk([["n1","","（不灭的斗士跪在地上，盾裂成了两半。他抬头看着老铁。）"],["v_champ","不灭的斗士","……你爹那场，上场前一晚也病了。他是撑着病打完的。"],["v_champ","不灭的斗士","最后一刀，也是这么砍的。"],["n1","","（老铁没说话。他把剑插在地上，对着斗士行了一个很旧的骑士礼。）"]])}
  if(c&&c.id==="blue"&&c.blue==="fought"&&compActive()){c.bet=1;S.gold+=200;postQ([["ct","阿蓝","（阿蓝抱着一大袋金币冲进来，跑的时候袋子漏了一路。）"],["ct","阿蓝","我赢了！！我这辈子第一次赢！！"],["ct","阿蓝","我押的你，全押！庄家脸都绿了！"],["n1","","（它把一半倒在你面前，剩下一半直接甩在庄家脸上。）"],["ct","阿蓝","三年的债！连本带息！"],["n1","","（+200 金币）"]])}}catch(e){console.warn(e)}return _dd.apply(this,arguments)}}

/* ---------- 4. 阿蓝 ---------- */
Object.assign(EVENTS,{
 c_blue3:{story:1,n:"债主来了",img:"ct",t:"奶茶厂门口，几只壮实的奶狗把阿蓝按在墙上：「欠了三年的钱，今天要么还，要么进厂里搬一辈子箱子！」阿蓝看着你，没有喊救命。",o:()=>[
  {t:"替它还 100 金币",d:"<span class='bad'>-100 金币</span>",ok:S.gold>=100,f:()=>{S.gold-=100;cp().freed=1;cp().blue="paid";return"奶狗们拿钱走了。阿蓝一直低着头，耳朵贴在脑袋上。过了半天它才开口：「……你图什么啊。三年了，第一次有人替我还钱。我妈都没替我还过。」"}},
  {t:"打跑它们",d:"<span class='bad'>失去 12 生命</span>",f:()=>{S.hp=Math.max(1,S.hp-12);cp().freed=1;cp().blue="fought";return"你们一路跑到楼梯口才停下。阿蓝笑得喘不上气：「看见没！看见没！」笑着笑着，它的脸色变了：「完了。他们老大，是地底下斗场的庄家。」"}},
  {t:"这是它自己的事",d:"<span class='bad'>阿蓝会被拉进奶茶厂</span>",f:()=>{cp().left=1;cp().blue="left";return"你从它身边走过去了。阿蓝没喊你。它被拖进厂门的时候，鞋掉了一只。"}}]},
 c_blue4:{story:1,n:"阿蓝的骰子",img:"ct",t:()=>{const b=cp().blue;if(b==="paid")return"阿蓝没在台阶下赌钱。它坐得很直，看起来有点不习惯。「我下去了。找份正经活，搬箱子也行，反正这回是给自己搬。」";if(b==="fought"&&cp().bet)return"阿蓝坐在台阶下，抱着空了一半的钱袋。「我不上去了。我这辈子就赌赢过这一次，得留着，别用光了。」";if(b==="fought")return"阿蓝缩在台阶背后，东张西望。「我还得躲一阵子。庄家的人鼻子比狗还灵。」";if(b==="left")return"台阶下没有人。地上放着一副骰子，下面压着一张皱巴巴的纸条，字写得歪歪扭扭：<br>「借你的 30，下辈子还。<br>　　那条围巾你留着。」";return"星空之顶的台阶下，阿蓝在等你。「我不上去了，我这种人，到了塔顶也是赌。」它把那副骰子塞给你，「这对骰子从来没让我赢过。给你，你运气好。」"},o:()=>{const b=cp().blue;
  return[{t:b==="left"?"捡起骰子":"收下骰子",d:"<span class='good'>获得遗物「幸运骰子」</span>：每场战斗多 10 金币",f:()=>{gainRelic("comp_dice");
   if(b==="paid"){compEnd("blue","paid");return"它把骰子塞给你：「这副骰子我留了十年，一次都没让我赢过。……它可能就是不喜欢我。你试试。」走了几步，它又回头：「那 30，我会还的！这回真的！」"}
   if(b==="fought"&&cp().bet){compEnd("blue","bet");return"「这对骰子归你了。我用不上了。」它拍拍钱袋，「我现在是有钱人。」"}
   if(b==="fought"){compEnd("blue","hide");return"它把骰子往你手里一塞，从台阶背后溜走了。「替我赢一把大的！」"}
   if(b==="left"){compEnd("blue","left");return"骰子还是温的。像是刚有人握过。"}
   return"「对了，那 30 块——」它挠挠头，「下次一定。」"}}]}}});
// 不管阿蓝的话：之后在奶茶厂打完一场，会看见它
{const _w=win;win=async function(){const r=await _w.apply(this,arguments);try{const c=S&&S.comp;if(c&&c.id==="blue"&&c.left&&!c.seenWork&&(S.act||0)===3&&B&&B.kind==="m"){c.seenWork=1;saveRun();setTimeout(()=>toast("搬箱子的苦工里，有一只是蓝色的。它低着头：「……别告诉别人你认识我。」"),1500)}
 if(S&&S.compFight){const f=S.compFight;delete S.compFight;C57.fightDone(f)}}catch(e){console.warn(e)}return r}}

/* ---------- 5. 小火 ---------- */
Object.assign(EVENTS,{
 c_fire3:{story:1,n:"奶茶厂的苦工",img:"hr",t:()=>cp().alive?"小火在传送带边停住了。一只瘦得皮包骨的大奶马正在搬箱子，脖子上有一道围巾勒过的旧印子。「……哥？」<br>大奶马把箱子捡起来，转过身去：「认错了。」<br>小火冲过去扯他的袖子，扯下来一截旧线头，红的。「你还说认错了！这是我织的！针脚歪成这样，除了我谁还织得出来！」<br>哥哥站着没动。过了很久，他说：「……你回去。我欠的还没还完。」":"传送带边，一只瘦得皮包骨的大奶马在搬箱子。它脖子上有一道围巾勒过的旧印子。你认得那道印子的宽窄。",o:()=>cp().alive?[
  {t:"打工头，把他抢出来",d:"<span class='bad'>和工头打一场精英战</span>",f:()=>{S.cur={t:"E",rs:S.rs};S.pendGrp=["scalddog"];S.compFight="fire";saveRun();startCombat("E");return null}},
  {t:"花 100 金币替他还债",d:"<span class='bad'>-100 金币</span>",ok:S.gold>=100,f:()=>{S.gold-=100;cp().freed=1;return"工头数着钱，不耐烦地挥挥手。哥哥看着账本上自己的名字被划掉。他没哭。小火哭得很大声。"}},
  {t:"让小火自己决定",d:"<span class='bad'>小火会留下来</span>",f:()=>{cp().gone=1;cp().stay=1;compEnd("fire","stay");M.fireStay=1;saveMeta();return"小火想了很久。然后它把背上那个比它还大的包，放在了传送带边上。「我留下来，跟他一起还。两个人，还得快一点。」哥哥想说什么，小火已经开始搬箱子了。"}}]:[
  {t:"把红围巾交给它",d:"<span class='good'>+1 记忆碎片</span>",f:()=>{M.shards=(M.shards||0)+1;saveMeta();cp().scarf=1;return"你把那条红围巾拿出来。大奶马看着围巾，看了很久，一句话都没说。他把围巾围上，放下箱子，跟着你走了。"}},
  {t:"什么都不说",d:"什么都不发生",f:()=>"你走过去的时候，它抬头看了你一眼。"}]},
 c_fire4:{story:1,n:"兄弟俩",img:"hr",t:()=>{const c=cp();if(c.freed)return"星空之顶的台阶下，小火和哥哥在等你。哥哥脖子上围着那条歪歪扭扭的红围巾。「我们不上去了。」小火说，「塔顶留给你。」";if(c.scarf)return"那只大奶马一路跟到了星空之顶。到了台阶下，他终于开口：「它织得真丑。」";return"星空之顶很冷。你想起那个说要请你喝奶茶的小奶马。"},o:()=>{const c=cp();
  if(c.freed)return[{t:"收下护身符",d:"<span class='good'>获得遗物「兄弟护符」</span>：受到致命伤时留住 1 点生命（一局一次）",f:()=>{gainRelic("comp_amulet");compEnd("fire","home");return"哥哥把一个旧护符递给你：「这个我戴着打过守关的。没打过。……你应该能打过。」兄弟俩挥着手，越来越小。"}}];
  if(c.scarf)return[{t:"陪他站一会儿",d:"<span class='good'>获得遗物「兄弟护符」</span>",f:()=>{gainRelic("comp_amulet");compEnd("fire","scarf");return"他把脸埋进围巾里，把护符塞给你，转身下去了。护符背面刻着两个名字，一个大，一个小。"}}];
  return[{t:"继续往上",d:"",f:()=>"你把手伸进包里，摸到了什么软软的东西。"}]}}});
C57.fightDone=function(f){const c=S.comp;if(!c)return;
 if(f==="fire"){c.freed=1;saveRun();postQ([["n1","","（工头倒下以后，你把他的钱箱砸开，翻出账本，把哥哥的名字划掉了。）"],["hr","小火","哥！走了！"],["n1","","（哥哥看着那本账，看着上面自己的名字被划掉。他没哭。小火哭得很大声。）"]])}
 if(f==="hen"){c.eggs=(c.eggs|0)+4;c.saved3=1;saveRun();postQ([["n1","","（锅底的火灭了。你把锅边那排蛋一个一个捧下来，壳还是烫的。）"],["ck","桂嫂","（桂嫂扑过来，一个一个地数。）一、二、三……四。四个。"],["ck","桂嫂","……裂了花纹的，也是我的蛋。"]])}};
// 让小火留下的那一局之后：再经过奶茶厂，传送带边有两只奶马朝你挥手
{const _om2=openMap;openMap=function(){try{if(S&&M.fireStay&&(S.act||0)===3&&!S.junc&&!S.flags.fireWave&&!(S.comp&&S.comp.id==="fire")){S.flags.fireWave=1;setTimeout(()=>toast("传送带边有两只奶马，一大一小。小的那只朝你挥了挥手。"),1200)}}catch(e){}return _om2.apply(this,arguments)}}

/* ---------- 6. 豆子：包裹是长老寄给小七的 ---------- */
Object.assign(EVENTS,{
 c_bean2:{story:1,n:"包裹凉了",img:"msx",t:"钟楼里冷得发抖。豆子摸了摸包裹，脸色变了：「凉了……寄件人说，里面的东西要趁热。」它看着你，「拆开看一眼，就一眼，行吗？」",o:()=>[
  {t:"打开看看",d:"<span class='good'>回复 10 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+10);cp().opened=1;return"包裹里是一壶粥，已经凉透了。下面压着一张字条。豆子没看字条。它把包裹重新包好，绳子系了三遍，系得很难看。然后它掏出小本子，在那一行旁边写了一个很小的「拆」字。"}},
  {t:"别拆",d:"豆子更信任你了",f:()=>{cp().rel++;return"「不拆。你送了十二年件，从没拆过一单。」豆子愣了一下，把包裹往怀里又抱紧了一点：「……对。对！不拆！」它把包裹揣进怀里，用自己捂着。"}}]},
 c_bean3:{story:1,n:"锅炉房",img:"msx",t:"豆子对着门牌找了半天，找到锅炉房，里面没有人。墙上贴着苦工名单，「七号」那一行被划掉了，旁边写着：「跑了。往上跑的。」<br>豆子盯着那行字看了很久，掏出小本子，把收件地址划掉，在下面写：「往上。」「收件人搬家了，」它说，「邮差就得追。」<br>刚走出锅炉房，传送带转得飞快。豆子一脚踩空，连人带包裹往炉子那头滑过去。「包裹！先抓包裹！」",o:()=>[
  {t:"抓住豆子",d:"<span class='bad'>失去 10 生命</span>",f:()=>{S.hp=Math.max(1,S.hp-10);return"你一把揪住它的尾巴，包裹从它怀里滑出去，又被你用脚勾了回来。豆子坐在地上大喘气：「……你先抓的我。」"}},
  {t:"抓住包裹",d:"<span class='bad'>豆子会被传送带带走</span>",f:()=>{cp().swept=1;return"你抓住了包裹。豆子在传送带那头冲你挥手，越滑越远：「送、送到啊——！」"}}]},
 c_bean4:{story:1,n:"收件人",img:"i5",t:()=>{const c=cp();if(c.swept)return"台阶上坐着一只小小的奶蛙，在数星星。它的衣服上少了一颗纽扣。你把包裹递过去：「寄件人，长老。」<br>小七打开，是一壶粥，还是温的。它抬头问：「送包裹的呢？」<br>你说，它掉进传送带了，最后一句是「送到啊」。小七捧着碗，喝得很慢。";if(c.opened)return"豆子把包裹交给小七的时候，手一直在抖。「对不起。它凉了。我……我拆过。」<br>小七打开，看见是粥，愣住了。然后它一口一口地喝，喝得很快，像怕别人抢。「凉的也是长老煮的。」它说。<br>豆子站在旁边，低着头，好久才说了一句：「下次我跑快点。」";return"台阶上坐着一只小小的奶蛙，在数星星。它的衣服上少了一颗纽扣。豆子掏出小本子，对着念：「收件人，小七。寄件人……长老。」<br>小七打开包裹。是一壶粥，还是温的。下面压着一张字条，字很大：「想上就上，饿了就回来。粥一直有。」<br>小七捧着碗，喝得很慢。喝完了，它抬头问豆子：「回村的路，你认得吗？」豆子把小本子翻到新的一页：「认得。回程不收钱。」"},o:()=>{const c=cp();
  if(c.opened&&!c.swept)return[{t:"陪它们坐一会儿",d:"<span class='good'>获得遗物「凉了的粥」</span>：每场首领战开始时回复 6 生命",f:()=>{gainRelic("comp_bento2");compEnd("bean","cold");return"豆子的小本子上，那个「拆」字被划掉了，又写上，又划掉。"}}];
  return[{t:c.swept?"在它旁边坐下":"看着它们走",d:"<span class='good'>获得遗物「长老的粥」</span>：每场首领战开始时回复 12 生命",f:()=>{gainRelic("comp_bento");if(c.swept){compEnd("bean","self");return"小七把空碗还给你：「替我谢谢它。」你说好。可你不知道该去哪儿谢。"}compEnd("bean","ok");return"一大一小两个背影，顺着台阶往下走。豆子走在前面，时不时回头等一下。"}}]}}});
Object.assign(RELICS,{comp_bento:Object.assign({},RELICS.comp_bento||{},{n:"长老的粥",img:"msx",r:"Q",d:"长老煮给小七的：每场首领战开始时回复 12 生命"}),
 comp_bento2:{n:"凉了的粥",img:"msx",r:"Q",d:"凉了也是长老煮的：每场首领战开始时回复 6 生命"},
 comp_sword2:{n:"磨了四十年的剑",img:"dgt",r:"Q",d:"老铁留下的：每场战斗开始力气 +2"},
 comp_chick:{n:"桂嫂的小鸡",img:"ck",r:"Q",d:"最能吃的那一只：每场战斗第一回合，下 1 颗小蛋"}});
{const _sc2=startCombat;startCombat=function(kind){const r=_sc2.apply(this,arguments);try{if(S&&has("comp_bento2")&&"BKFCW".includes(kind)){S.hp=Math.min(S.max,S.hp+6);relicPulse("comp_bento2");renderTop()}
 if(S&&S.comp&&S.comp.id==="hen"&&S.comp.warmAct===(S.act||0)&&!S.comp.hatched&&compActive()){S.hp=Math.max(1,S.hp-3);renderTop();toast("怀里焐着蛋，动作慢了一拍：失去 <b>3</b> 生命")}}catch(e){}return r}}
// 力气类遗物：沿用老铁佩剑的写法
{const _sc3=startCombat;startCombat=function(kind){const r=_sc3.apply(this,arguments);try{if(S&&has("comp_sword2"))setTimeout(()=>{if(B&&B.p){B.p.str=(B.p.str||0)+2;relicPulse("comp_sword2");renderBattle()}},60)}catch(e){}return r}}

/* ---------- 7. 桂嫂 ---------- */
Object.assign(EVENTS,{
 c_hen0:{story:1,n:"一地蛋壳",img:"ck",t:"泥里一路都是碎蛋壳。尽头站着一只奶鸡，正趴在地上，一片一片地捡。「七个。少了七个。」她抬头看你，眼睛是红的，嗓门却很大：「你看见是谁偷的没有？！」",o:()=>[
  {t:"一起找",d:"桂嫂会和你同行",f:()=>{cp().rel=1;cp().eggs=0;return"「好！」她把蛋壳兜进围裙里，「我叫桂嫂。你吃饭了没有？没吃先吃一口，找蛋要力气。」"}},
  {t:"各走各的",d:"这段故事就到这里",f:()=>{cp().gone=1;return"她没再理你，接着捡蛋壳。捡一片，数一遍。"}}]},
 c_hen1:{story:1,n:"伯爵的早餐",img:"ck",t:"伯爵的餐桌上摆着七个蛋杯，空的。桂嫂一个一个摸过去，摸到最后一个，杯底还温的。「刚拿走。」她说，「往上拿走了。」",o:()=>[
  {t:"追",d:"<span class='bad'>失去 8 生命</span>，<span class='good'>找回 1 个蛋</span>",f:()=>{S.hp=Math.max(1,S.hp-8);cp().eggs=(cp().eggs|0)+1;return"你在楼梯拐角追上了端盘子的管家。盘子里只剩一个蛋。桂嫂把它揣进怀里，捂了一路。"}},
  {t:"别追了，先歇口气",d:"<span class='good'>回复 8 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+8);return"桂嫂坐不住，绕着桌子走了三圈：「往上，反正是往上。」"}}]},
 c_hen2:{story:1,n:"冰里的蛋",img:"ck",t:"冰面下面冻着一个蛋。蛋壳上有一圈淡淡的花纹，桂嫂认得：「这是老三。它生下来就爱滚，滚到哪儿都找不着。」",o:()=>[
  {t:"把冰敲开",d:"<span class='bad'>最大生命 -4</span>，<span class='good'>找回 1 个蛋</span>",f:()=>{S.max=Math.max(1,S.max-4);S.hp=Math.min(S.hp,S.max);cp().eggs=(cp().eggs|0)+1;return"你敲了很久，手都敲麻了。蛋出来的时候，桂嫂一把抢过去，贴在脸上。"}},
  {t:"连冰带蛋抱着走，一路焐着",d:"<span class='bad'>这一层每场战斗开始失去 3 生命</span>，<span class='good'>下一层蛋会孵出来</span>",f:()=>{cp().warmAct=S.act||0;return"冰块化得很慢。你把它揣在怀里，冷得直哆嗦。桂嫂一直在旁边念叨：「慢点走，慢点走，别颠着它。」"}}]},
 c_hen3:{story:1,n:"茶叶蛋车间",img:"ck",t:()=>{const c=cp();let pre="";if(c.warmAct!=null&&!c.hatched){c.hatched=1;c.chick=1;c.eggs=(c.eggs|0)+1;pre="（你怀里一动。冰早化了，蛋壳裂开一道缝，钻出来一只湿漉漉的小鸡。它冲你叫了一声，从此每场战斗都站在你脚边帮你挡一下：每回合 2 护盾。）<br><br>"}return pre+"车间里的大锅冒着热气，锅边上摆着一排蛋，壳上已经裂出了花纹。桂嫂的嗓门第一次没了声音。"},o:()=>[
  {t:"冲进去",d:"<span class='bad'>和看锅的打一场精英战</span>，<span class='good'>赢了救下 4 个蛋</span>",f:()=>{S.cur={t:"E",rs:S.rs};S.pendGrp=["furnaceegg"];S.compFight="hen";saveRun();startCombat("E");return null}},
  {t:"你一个人进去，让她在外面等",d:"<span class='bad'>失去 15 生命</span>，<span class='good'>救下 2 个蛋</span>",f:()=>{S.hp=Math.max(1,S.hp-15);cp().eggs=(cp().eggs|0)+2;return"锅太烫了，你只来得及捧出两个。出来的时候，桂嫂站在门口，一动没动。她没问里面还剩几个。"}},
  {t:"来不及了",d:"什么都不发生",f:()=>"桂嫂站在锅边，站了很久。"}]},
 c_hen4:{story:1,n:"一窝",img:"ck",t:()=>{const n=cp().eggs|0;if(n>=5)return"台阶下，桂嫂身边围着一圈小鸡，叽叽喳喳的。她数了一遍，又数了一遍。「齐了。……不齐，少了两个。」她用翅膀擦了擦眼睛，「少两个，也是一窝。」";if(n>=1)return`桂嫂抱着 ${n} 个蛋坐在台阶下，一遍一遍地数，数到一半就停下来，从头再数。「够了。」她说，「够我回去了。」`;return"台阶下放着一个空篮子，篮底垫着干草，铺得整整齐齐。桂嫂没有在等你。<br>后来你听说，奶茶厂车间的锅边，有只奶鸡坐了很多天，谁赶都不走。"},o:()=>{const n=cp().eggs|0;
  if(n>=5)return[{t:"接过小鸡",d:"<span class='good'>获得遗物「桂嫂的小鸡」</span>：每场战斗第一回合下 1 颗小蛋",f:()=>{gainRelic("comp_chick");compEnd("hen","full");return"她把一只刚孵出来的小鸡塞给你：「这个跟你。它最能吃，跟你最像。」"}}];
  if(n>=1)return[{t:"陪她数一遍",d:"<span class='good'>最大生命 +6</span>",f:()=>{S.max+=6;S.hp+=6;compEnd("hen","some");return"你们一起数。数到最后一个，她的声音很小：「……这个是老七。它最小。」"}}];
  return[{t:"把篮子带上",d:"<span class='good'>+1 记忆碎片</span>",f:()=>{M.shards=(M.shards||0)+1;saveMeta();compEnd("hen","none");return"篮子很轻。干草上还留着一个圆圆的印子。"}}]}}});

/* ---------- 8. 支线：委托人回来道谢 ---------- */
const JTHX={
 m_rat:[["mst","小奶鼠","路……路真的干净了！我一路跑过来的，一次都没摔！"],["mst","小奶鼠","这个给你。我攒了好久的。……别嫌少。"]],
 m_smith:[["ct","奶猫铁匠","（它掂了掂你带回来的材料。）就是这个手感。"],["ct","奶猫铁匠","你的家伙我包了。下回路过，磨刀不要钱。"]],
 m_letter:[["msx","村里的信使","话带到了？首领怎么说？"],["msx","村里的信使","……『知道了』？就三个字？"],["msx","村里的信使","行吧。长老会懂的。他们那辈人说话都这样。"]],
 m_lost:[["hr","奶马妈妈","你就是带它过来的那位？"],["hr","奶马妈妈","它一路跟我说，你走路特别快，它差点跟不上。……谢谢你。真的。"]],
 m_hen:[["ck","奶鸡妈妈","路通了！孩子们，快出来！"],["ck","奶鸡妈妈","都排好！跟恩人说谢谢！"],["n1","","（一排小奶鸡整整齐齐地低下头：「谢——谢——」最后一只低得太狠，栽了个跟头。）"]],
 m_butler:[["e_v_xg","老仆人","钥匙……是这把，没错。"],["e_v_xg","老仆人","伯爵大人睡下以后，这座城堡就只剩我一个醒着的了。谢谢你陪我说了这么久的话。"]],
 m_snow:[["ckt","雪地奶鸡","风停了。你听，钟楼不响了。"],["ckt","雪地奶鸡","我在这儿守了一个冬天，第一次听见这么安静的雪。这个你拿着，路上冷。"]],
 m_worker:[["ckh","奶茶厂女工","工头趴下了？真趴下了？"],["ckh","奶茶厂女工","（她把头巾解下来，用力甩了两下。）今天提前下班！我请大家喝奶茶——不加料的那种！"]],
 m_star:[["e_ctar","观星的奶猫","你看那边。那三颗星星，刚才还被挡着。"],["e_ctar","观星的奶猫","我数了一辈子星星，总算有一晚数全了。这颗算你的。"]],
 escape:[["dgt","红奶狗看守","人抓回来了？好！……我这个月的工钱保住了。"],["dgt","红奶狗看守","下回你要是被关进来，我给你留个靠窗的。"]],
 letter:[["n1","","（收信的奶蛙拆开信，看了很久。）"],["n1","","「……他还记得我。」它把信折好，贴着心口揣着。"]],
 race:[["n1","","走错路的冒险者气喘吁吁地跑过来：「我、我先到的！……啊？你已经打完了？」它把赌注塞给你：「下回！下回我一定不拐错！」"]],
 bounty:[["ct","赏金猎人奶猫","三天。我追了它三天。"],["ct","赏金猎人奶猫","你一顿饭的工夫就放倒了。……赏金拿去，别跟别人说我追了三天。"]],
 medicine:[["ck","奶鸡妈妈","药送到了？小家伙喝了吗？"],["ck","奶鸡妈妈","……它睡着了，烧也退了。你坐，我给你煮个蛋。不是我的蛋，是买的。"]],
 spar:[["hr","练武的奶马","好！这一下我是真没躲开。"],["hr","练武的奶马","你出拳的时候腰会转，谁教你的？……一个老骑士？难怪。"]],
 herb:[["ppt","奶油摊老板","就是这个味道！"],["ppt","奶油摊老板","第一勺给你。不要钱，以后路过都不要钱。"]]};
{const _j=jsideTick1;jsideTick1=function(q,need){const was=q&&!q.done;const r=_j.apply(this,arguments);try{if(was&&q.done&&JTHX[q.k])postQ(JTHX[q.k])}catch(e){}return r}}
// 新的支线委托
Object.assign(JSIDE,{
 m_hen:{n:"帮奶鸡一家清路",d:"打倒 2 场小怪",need:"mob",cnt:2,pay:()=>{S.max+=4;S.hp+=4;S.gold+=30;return"奶鸡妈妈：最大生命 +4，+30 金币"}},
 m_butler:{n:"替老仆人找回钥匙",d:"打倒 1 只精英",need:"elite",pay:()=>{gainRelic(randRelic("C"));return"老仆人：一件普通遗物"}},
 m_snow:{n:"让钟楼的风停一停",d:"打倒这一层的首领",need:"boss",pay:()=>{S.max+=8;S.hp+=8;return"雪地奶鸡：最大生命 +8"}},
 m_worker:{n:"教训凶巴巴的工头",d:"打倒 1 只精英",need:"elite",pay:()=>{S.gold+=60;S.hp=Math.min(S.max,S.hp+15);return"奶茶厂女工：+60 金币，回复 15 生命"}},
 m_star:{n:"把挡住星星的家伙赶走",d:"打倒 3 场小怪",need:"mob",cnt:3,pay:()=>{const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,2);l.forEach(c=>c.u=(c.u|0)+1);if(l.length)upFx(l);return"观星的奶猫：随机升级 "+l.length+" 张牌"}}});
Object.assign(EVENTS,{
 mq_hen:{act:0,n:"堵在路上的奶鸡一家",img:"ck",t:"一只奶鸡妈妈张着翅膀，把一窝小鸡挡在身后。前面的路上全是晃来晃去的小怪。「孩子们要过河，可这条路……你行行好？」",o:()=>[
  {t:"帮它们清路",d:"<span class='good'>接下支线「帮奶鸡一家清路」</span>：再打倒 2 场小怪，<span class='good'>最大生命 +4，+30 金币</span>",f:()=>{jsideTake("m_hen");return"奶鸡妈妈冲身后喊：「都站好！别乱跑！等恩人回来！」"}},
  {t:"分它们一点干粮",d:"<span class='good'>回复 4 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+4);return"小鸡们围着你啄干粮渣。有一只啄到了你的脚。"}}]},
 mq_butler:{act:1,n:"找钥匙的老仆人",img:"e_v_xg",t:"一个老仆人提着灯，在走廊里来回走。「地窖的钥匙，被那只大家伙叼走了。伯爵醒来要是喝不到酒……」他叹了口气，「他已经很多年没醒了。可万一呢。」",o:()=>[
  {t:"帮他找回来",d:"<span class='good'>接下支线「替老仆人找回钥匙」</span>：打倒 1 只精英，<span class='good'>一件普通遗物</span>",f:()=>{jsideTake("m_butler");return"「劳驾。」他把灯往你手里一塞，「这条走廊很黑，你比我更用得上。」"}},
  {t:"陪他走一段",d:"<span class='good'>+2 经验</span>",f:async()=>{await gainXP(2);return"他给你讲伯爵年轻时候的事。讲到一半，灯芯爆了一下，他就不讲了。"}}]},
 mq_snow:{act:2,n:"守着钟楼的雪地奶鸡",img:"ckt",t:"钟楼下面，一只雪地奶鸡缩成一个球。「钟一响，风就刮。风一刮，我的窝就塌。」它抖了抖身上的雪，「楼上那个大家伙不倒，这钟就停不下来。」",o:()=>[
  {t:"答应它",d:"<span class='good'>接下支线「让钟楼的风停一停」</span>：打倒这一层的首领，<span class='good'>最大生命 +8</span>",f:()=>{jsideTake("m_snow");return"「真的？」它从雪里探出头，「那我等着。我很会等。」"}},
  {t:"帮它把窝垒高一点",d:"<span class='good'>回复 6 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+6);return"你们垒了一圈雪墙。风还是刮，但窝没塌。"}}]},
 mq_worker:{act:3,n:"奶茶厂的女工",img:"ckh",t:"一只裹着头巾的奶鸡蹲在管道后面揉手腕。「工头今天又加了两个钟头。谁慢一步，他就往锅里多扔一个人的工牌。」她看了看你，「你看着挺能打的。」",o:()=>[
  {t:"去教训一下工头",d:"<span class='good'>接下支线「教训凶巴巴的工头」</span>：打倒 1 只精英，<span class='good'>+60 金币，回复 15 生命</span>",f:()=>{jsideTake("m_worker");return"「工头那身围裙上全是油，抓不住的，你往他脚底下打。」"}},
  {t:"帮她揉揉手腕",d:"<span class='good'>+20 金币</span>（她硬塞的）",f:()=>{S.gold+=20;return"「别别别，手上全是糖浆。」她嘴上这么说，还是把手伸了过来。"}}]},
 mq_star:{act:4,n:"观星的奶猫",img:"e_ctar",t:"一只奶猫架着一个旧望远镜，望远镜对着天，它对着一群晃来晃去的小怪发愁。「它们老在镜头前面晃。三颗星星，我数了一辈子，从来没一次数全过。」",o:()=>[
  {t:"帮它把小怪赶走",d:"<span class='good'>接下支线「把挡住星星的家伙赶走」</span>：再打倒 3 场小怪，<span class='good'>随机升级 2 张牌</span>",f:()=>{jsideTake("m_star");return"「那我先数着别的。」它把眼睛贴回镜头上。"}},
  {t:"借望远镜看一眼",d:"<span class='good'>+2 经验</span>",f:async()=>{await gainXP(2);return"镜头里有一颗星星特别亮。奶猫说，那是村里泉水的方向。"}}]}});

/* ---------- 9. 坑人的家伙（按楼层） ---------- */
Object.assign(EVENTS,{
 sc_holy:{act:0,n:"卖圣水的",img:"mst",t:"一只披着草帘的奶鼠站在泥坑边吆喝：「圣水！沼泽圣者亲手开过光的圣水！喝一口，泥巴不沾身！」它手里的瓶子，看起来和旁边的泥坑一个颜色。",o:()=>[
  {t:"买一瓶（40 金币）",d:"<span class='bad'>-40 金币</span>",ok:S.gold>=40,f:()=>{S.gold-=40;S.hp=Math.max(1,S.hp-4);return"你喝了一口。是泥。你把剩下的倒回泥坑里，泥坑一点都没变。（失去 4 生命）"}},
  {t:"问它圣者叫什么名字",d:"<span class='good'>识破它</span>",f:()=>{S.gold+=25;return"「圣者就叫……圣者！」它答不上来，拔腿就跑，跑的时候掉了一个钱袋。（+25 金币）"}},
  {t:"走开",d:"",f:()=>"「不识货！」它在你身后喊。"}]},
 sc_antique:{act:1,n:"古董商",img:"e_v_xg",t:"走廊尽头摆着一张小桌子，一个戴单片眼镜的奶蛙在擦一只银杯。「伯爵家的传家宝。看这做工，看这包浆。今天跟你有缘，只要 70。」杯底有一行很小的字。",o:()=>[
  {t:"买下（70 金币）",d:"<span class='bad'>-70 金币</span>",ok:S.gold>=70,f:()=>{S.gold-=70;return rnd()<.25?(gainRelic(randRelic("C")),"你把杯子翻过来看了半天，居然是真的。古董商比你还吃惊。"):"你把杯子翻过来，杯底写着：「奶茶厂 · 赠品」。古董商已经不见了。"}},
  {t:"把杯子翻过来看看",d:"<span class='good'>识破它</span>",f:()=>{S.gold+=15;return"杯底写着「奶茶厂 · 赠品」。古董商咳嗽了一声，往你手里塞了点钱：「……这事别往外说。」（+15 金币）"}},
  {t:"不感兴趣",d:"",f:()=>"「有眼无珠。」他继续擦杯子，擦得更用力了。"}]},
 sc_warmer:{act:2,n:"卖暖宝宝的",img:"ckt",t:"风雪里，一只裹得只剩眼睛的奶鸡拉住你：「暖宝宝！一贴热一整天！最后三个了！」它往你手里塞了一个，摸起来……确实有点凉。",o:()=>[
  {t:"买三个（45 金币）",d:"<span class='bad'>-45 金币</span>",ok:S.gold>=45,f:()=>{S.gold-=45;S.hp=Math.max(1,S.hp-5);return"你撕开包装。里面是一块冰。三块都是。（失去 5 生命）"}},
  {t:"当着它的面撕开一个",d:"<span class='good'>识破它</span>",f:()=>{S.max+=2;S.hp+=2;return"里面是一块冰。它尴尬地把自己的真围巾解下来给你：「……这个是真的暖。」（最大生命 +2）"}},
  {t:"推开它",d:"",f:()=>"它在风里喊：「冻死你！」声音被风吹散了。"}]},
 sc_fee:{act:3,n:"收入厂费的",img:"e_dgy",t:"厂门口支着一张桌子，一只戴工牌的奶狗拍了拍桌面：「进厂参观，每位 50。不交？不交就进锅。」它的工牌是用纸画的，墨还没干。",o:()=>[
  {t:"交钱（50 金币）",d:"<span class='bad'>-50 金币</span>",ok:S.gold>=50,f:()=>{S.gold-=50;return"它收了钱，给你盖了一个章。章是用萝卜刻的。"}},
  {t:"指着它的工牌",d:"<span class='good'>识破它</span>，<span class='bad'>它会动手</span>",f:()=>{S.cur={t:"m",rs:S.rs};S.pendGrp=["porter","porter"];saveRun();startCombat("m");return null}},
  {t:"绕后门走",d:"<span class='bad'>失去 6 生命</span>",f:()=>{S.hp=Math.max(1,S.hp-6);return"后门全是管子，你被烫了好几下。"}}]},
 sc_robber:{act:2,n:"拦路的",img:"e_dga",t:"雪地里蹿出两只蒙着脸的奶狗：「打劫！钱留下，人过去！」其中一只的刀，是用冰块削的。",o:()=>[
  {t:"给钱（30 金币）",d:"<span class='bad'>-30 金币</span>",ok:S.gold>=30,f:()=>{S.gold-=30;return"它们数了数，又还了你 5 个：「……路上买点吃的。」"}},
  {t:"打",d:"<span class='bad'>和它们打一场</span>",f:()=>{S.cur={t:"m",rs:S.rs};S.pendGrp=["icehorse","bellrat"];saveRun();startCombat("m");return null}},
  {t:"等它的刀化掉",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"你们就这么站着。站了很久。刀化了。它们骂骂咧咧地走了。"}}]},
 sc_star:{act:4,n:"卖星星的",img:"e_ctar",t:"台阶边上，一只奶猫摆了一排玻璃瓶，每个瓶子里都有一点亮光。「星星！刚摘的！一瓶 60，带回去挂床头，一辈子不做噩梦。」",o:()=>[
  {t:"买一瓶（60 金币）",d:"<span class='bad'>-60 金币</span>",ok:S.gold>=60,f:()=>{S.gold-=60;return"走了没几步，瓶子里的光就飞出来了。是一只萤火虫。它绕着你转了一圈，往上飞走了。"}},
  {t:"打开一瓶看看",d:"<span class='good'>识破它</span>",f:async()=>{await gainXP(3);return"萤火虫飞出来了。奶猫叹了口气，把其他瓶子也打开了：「算了。本来也不是我的。」一瓶一瓶的光，往天上飘。（+3 经验）"}},
  {t:"走开",d:"",f:()=>"「星星都不要？」它小声嘀咕，「那你上来干什么。」"}]}});

// 坑人的家伙不能太常见：每一层只有 40% 的机会会出现，一局最多碰到 2 个
["sc_holy","sc_antique","sc_warmer","sc_fee","sc_robber","sc_star"].forEach(k=>{const E=EVENTS[k];if(!E)return;const o0=E.o;E.req=()=>{S.scamAct=S.scamAct||{};const a=S.act||0;if(S.scamAct[a]==null){S.scamAct[a]=rnd()<.4?1:0;saveRun()}return S.scamAct[a]===1&&Object.keys(S.scamSeen||{}).length<2&&!(S.scamSeen||{})[k]};E.o=()=>{S.scamSeen=S.scamSeen||{};S.scamSeen[k]=1;return o0()}});

/* ---------- 10. SS 路线加长 ---------- */
Object.assign(NODE,{L:{n:"SS 线索",ic:"v_evq",badge:1}});
const SSL={proto:["ssl_proto1","ssl_proto2"],arena:["ssl_arena1"],curser:["ssl_cs1","ssl_cs2"]};
Object.assign(EVENTS,{
 ssl_proto1:{ss:1,n:"翻倒的奶车",img:"v_proto",t:"一辆奶车翻在雪里，车上的货是往塔上送的贡品，早就冻成了块。车板底下压着一个小本子，第一页的字迹很工整：<br>「今天坐上去了。泉水涨了一指。大家都在笑。」<br>后面几页的字越来越歪，最后一页只有一个字：「冷。」",o:()=>[
  {t:"把本子收好",d:"<span class='good'>挑一张牌</span>",f:async()=>{await chooseReward(offerCards(3,"U",1),"本子里夹着的");S.flags.protoDiary=1;return"本子的封皮上，写着一个已经没人记得的名字。"}},
  {t:"烧了取暖",d:"<span class='good'>回复 15 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+15);return"纸烧得很快。火光里，你好像看见第一页那行字又亮了一下。"}}]},
 ssl_proto2:{ss:1,n:"齿轮声",img:"v_proto",t:"爪印的尽头是一个冰洞。洞壁上刻满了划痕，一道一道，像是在数什么。地上躺着一只摔坏的八音盒，发条还剩一点，转一下，响一个音。<br>长老说过：他小时候见过初号一次，那时候他还会笑。",o:()=>[
  {t:"把八音盒修好",d:"<span class='bad'>失去 6 生命</span>，<span class='good'>初号机开场少 10% 生命</span>",f:()=>{S.hp=Math.max(1,S.hp-6);S.flags.protoBox=1;return"你冻得手指都不听使唤，修了很久。最后，八音盒叮叮咚咚地响完了一整首。洞的深处，齿轮声停了一下。"}},
  {t:"拆了零件",d:"<span class='good'>+50 金币</span>",f:()=>{S.gold+=50;return"零件是好零件。你把空盒子放回原处，盖子合上的时候，「咔」了一声。"}}]},
 ssl_arena1:{ss:1,n:"退役的斗士",img:"v_mcolo",t:"通往斗场的地道里，坐着一只缺了一只耳朵的老奶狗，面前摆着半碗冷掉的奶茶。「去打不灭的？」它没抬头，「我跟它打过。第四百一十二场。」<br>「它那个人……不坏。只是它的对手，上场前一晚总会病一场。」它顿了顿，「四十年前有个老骑士，也是病着上的场。打到最后一刀，都没松手。」",o:()=>[
  {t:"听它讲完",d:"<span class='good'>随机升级 1 张牌</span>",f:()=>{const l=shuffle(S.deck.filter(c=>upOK(c))).slice(0,1);l.forEach(c=>c.u=(c.u|0)+1);if(l.length)upFx(l);return"它讲了很多场，每一场都记得对手的名字。讲完，它把那半碗奶茶推给你：「凉了。你喝吧，我喝不动了。」"}},
  {t:"请它喝一碗热的（20 金币）",d:"<span class='bad'>-20 金币</span>，<span class='good'>回复 20 生命</span>",ok:S.gold>=20,f:()=>{S.gold-=20;S.hp=Math.min(S.max,S.hp+20);return"它捧着碗，捧了很久才喝。「四十年了，」它说，「头一回有人请我。」"}}]},
 ssl_cs1:{ss:1,n:"被说中的人",img:"v_mhood",t:"走廊里坐着一只奶蛙，背靠着墙，脚边积了一层灰。「它说我会在这里等一辈子。」它说，「我就等了。」<br>「等什么？」<br>它想了很久：「……忘了。」",o:()=>[
  {t:"劝它走",d:"<span class='good'>最大生命 +5</span>",f:()=>{S.max+=5;S.hp+=5;return"它站起来的时候，腿已经不会弯了。你扶着它走了几步，它就自己走了。走得很慢，但没回头。"}},
  {t:"陪它坐一会儿",d:"<span class='good'>回复 12 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+12);return"你们谁都没说话。过了一阵，它小声说：「其实我也不太想走。走了，就说明它说错了。」"}}]},
 ssl_cs2:{ss:1,n:"井绳上的指印",img:"v_mhood",t:"书房后面堆着一截断掉的井绳，绳头上有一圈黑乎乎的指印。迷你奶茶杯凑过去闻了闻，整个杯子都抖了一下：「是那个味道。烧糊的糖。」<br>北井不是自己塌的。",o:()=>[
  {t:"带走井绳",d:"<span class='good'>灭却诅咒师开场少 2 层力气</span>",f:()=>{S.flags.csRope=1;return"证据不多，就这一截绳子。可你攥着它，心里很稳。"}},
  {t:"把指印擦掉",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"你擦了很久才擦干净。有些东西，知道了就够了，不用留着。"}}]}});
function ssNextL(){const k=ssLine();const L=SSL[k]||[];S.ssL=S.ssL||{};const i=S.ssL[k]|0;S.ssL[k]=i+1;return L[Math.min(i,L.length-1)]}
{const _en2=enterNode;enterNode=function(t,resumed,cur){if(t!=="L")return _en2.apply(this,arguments);S.cur=cur||{t,rs:S.rs};if(resumed&&cur)S.rs=cur.rs;saveRun();const ev=(cur&&cur.ev)||ssNextL();eventScreen(ev);setTimeout(()=>{const k=ssLine();if(k)compLine(k)},900)}}
// 路线：初号机 2 → 5 格，斗场 2 → 3 格，诅咒师 3 → 5 格；地图不够长就退回原来的短路线
injectProto=function(){if(!S||S.junc||!S.flags||!S.flags.ssProto||S.flags.protoDone||S.flags.protoRoute||S.dream||S.fin||(S.act||0)!==2)return;const msg="地图下半层出现了一条<b>彩色的隐藏路线</b>：SS 讨伐目标就在那里";if(!injectRoute(["X","L","m","L","H"],[null,null,null,null,["proto"]],"protoRoute",msg))injectRoute(["X","H"],[null,["proto"]],"protoRoute",msg)};
injectSS=function(){if(!S||S.junc||S.dream||S.fin||!S.flags||!S.map)return;const a=S.act||0;
 if(a===3&&S.flags.ssArena&&!S.flags.arenaDone&&!S.flags.arenaRoute){const m="地图下半层出现了一条<b>彩色的隐藏路线</b>：尽头是奶茶厂第一斗场";if(injectRoute(["L","P","D"],[null,null,null],"arenaRoute",m)||injectRoute(["P","D"],[null,null],"arenaRoute",m))openMap()}
 if(a===4&&S.flags.cupFriend&&!S.flags.curserDone&&!S.flags.csRoute){const go=()=>{setTimeout(async()=>{await talk(STORY.cs_smell);toast("地图下半层出现了一条<b>隐藏路线</b>：跟着迷你奶茶杯走")},400);openMap()};if(injectRoute(["U","L","m","L","J"],[null,null,["ss_minion","ss_minion","ss_minion"],null,["curser"]],"csRoute","")||injectRoute(["U","m","J"],[null,["ss_minion","ss_minion","ss_minion"],["curser"]],"csRoute",""))go()}};
// 线索带来的战斗加成
{const _sc4=startCombat;startCombat=function(kind){const r=_sc4.apply(this,arguments);try{setTimeout(()=>{if(!B||!B.enemies)return;if(kind==="H"&&S.flags.protoBox){B.enemies.forEach(e=>{e.hp=Math.round(e.hp*.9)});toast("八音盒响了一下。初号机慢了一拍：<b>生命 -10%</b>");renderBattle()}if(kind==="J"&&S.flags.csRope){B.enemies.forEach(e=>{if(e.id==="curser")e.str=(e.str||0)-2});toast("你攥着那截井绳：<b>灭却诅咒师力气 -2</b>");renderBattle()}},80)}catch(e){}return r}}

/* ---------- 11. 阿岳的梦：按顺序讲 ---------- */
Object.assign(EVENTS,{
 dream_fish:{dream:1,n:"泉边钓鱼",img:"bx",t:"梦里的泉水满得能照见月亮。两只年轻的奶蛙坐在石头上钓鱼。一只在削枣树枝，另一只在打瞌睡，鱼竿都快掉进水里了。<br>削树枝的那只抬头看见你：「你也来钓鱼？这根给你，我再削一根。」——是年轻的阿岳。<br>打瞌睡的那只醒了，揉揉眼睛：「阿岳，又来人了？你削的竿子，十根有九根是送人的。」",o:()=>[
  {t:"陪他们钓一会儿",d:"<span class='good'>回复 20 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+20);return"你们钓了一下午，什么都没钓到。渔夫说这水太满，鱼都不饿。阿岳说：没关系，泉水满着就好。他笑起来的样子，和塔顶那个人一点都不像。"}},
  {t:"问他为什么要上塔",d:"<span class='good'>挑一张稀有牌</span>",f:async()=>{await chooseReward(offerCards(3,"R",1),"阿岳教你的");return"「泉水一年比一年浅。总得有人上去看看。」他把鱼竿插进泥里。渔夫在旁边接了一句：「他去，我也去。他一个人认不得路。」"}},
  {t:"劝他别上去",d:"<span class='good'>最大生命 +5</span>",f:()=>{S.max+=5;S.hp+=5;return"他摇摇头：「总得有人去。」你知道他会去，你也知道他回不来。梦里的风吹过泉面，你什么都改变不了，可心里好像变结实了一点。"}}]},
 dream_farewell:{dream:1,n:"出发",img:"e_n1_old",t:"泉水已经见底了。那年大旱，阿岳和渔夫背着包，提着一盏灯，站在山脚下。渔夫回头看了一眼村子：「真走啊？」「真走。」<br>后面有人跑过来，是一只穿着练功服的年轻奶蛙，喘得说不出话。他一把拽住阿岳的袖子：「你一个人上去能干什么？等我练好了，我们一起去！」<br>阿岳把他的手掰开，掰得很慢：「你练好了再来。我在上面等你。」",o:()=>[
  {t:"站在修行奶蛙这边",d:"<span class='good'>升级一张牌</span>",f:async()=>{const ok=await upgradePick();return ok?"修行奶蛙冲你点了点头，好像终于有人懂他。可阿岳还是轻轻抽回了袖子。":null}},
  {t:"站在阿岳这边",d:"<span class='good'>+60 金币</span>",f:()=>{S.gold+=60;return"阿岳往你手里塞了一袋金币：「路上用。」修行奶蛙瞪了你一眼，站在山脚下，一直站到灯光看不见了。"}},
  {t:"什么都不说",d:"<span class='good'>移除一张牌</span>",f:async()=>{const r=await pickCards(S.deck,{title:"放下一张牌",sub:"有些东西，带不上去"});if(!r[0])return null;S.deck.splice(S.deck.indexOf(r[0]),1);return"你什么都没说。灯光往山上去了。修行奶蛙在原地站了很久，然后转身，往练功场的方向跑。"}}]},
 dream_lamp:{dream:1,n:"留灯",img:"bx",t:"第一层的泥沼里，渔夫的腿陷在泥里，拔出来一次，又陷进去一次。到第三次，他不拔了。「阿岳，」他说，「我走不动了。」<br>阿岳蹲下来，看了他很久。然后把那盏灯放在他手边：「你点着。我下山的时候，顺着灯回来。」<br>「然后呢？」「然后我们一起回家钓鱼。」<br>渔夫笑了：「鱼竿我帮你收着，别让它受潮。」",o:()=>[
  {t:"帮渔夫把灯护好",d:"<span class='good'>回复 15 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+15);return"你替他把灯芯拨亮了一点。很多年以后，这盏灯还亮着，只是莲花已经开满了他的头顶。"}},
  {t:"问渔夫：要是他回不来呢",d:"<span class='good'>挑一张牌</span>",f:async()=>{await chooseReward(offerCards(3,"U",1),"渔夫给你的");return"渔夫想了想：「那我就一直等。等着，约定就还算数。」"}},
  {t:"什么都不说",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"阿岳走了。渔夫一直看着那盏灯，没看他的背影。"}}]},
 dream_blanket:{dream:1,n:"一条毯子",img:"e_n1_old",t:"冰原上起了风。阿岳缩在石头后面，身上只盖着一条薄毯子。雪地那头有个影子，一瘸一拐地走过来，是那只修行奶蛙。他的练功服破了好几个洞，眉毛上全是冰。<br>「我练好了。」他说，牙齿在打架。<br>阿岳看了他半天，掀开毯子的一角。<br>两只奶蛙挤在一条毯子底下，说泉水满了以后要干什么。修行奶蛙说：「回村煮粥。熬一大锅，谁来都给一碗。」阿岳说：「第一碗给我。」「凭什么？」「我先上来的。」",o:()=>[
  {t:"往火堆里添一根柴",d:"<span class='good'>回复 10 生命，最大生命 +3</span>",f:()=>{S.max+=3;S.hp=Math.min(S.max,S.hp+13);return"火苗跳了一下。两个人都没注意到，柴是从哪儿来的。"}},
  {t:"把自己的围巾也盖上去",d:"<span class='bad'>失去 6 生命</span>，<span class='good'>获得一件遗物</span>",ok:S.hp>6,f:()=>{S.hp-=6;gainRelic(randRelic("C"));return"你冷得直哆嗦。可毯子底下，那两个人睡着了。"}},
  {t:"悄悄走开，让他们说话",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);return"走出很远，你还听得见他们在吵：一碗粥里该放几颗枣。"}}]},
 dream_prophet:{dream:1,n:"预言家",img:"v_curser",t:()=>"路边站着一个穿兜帽的人，像是一直在等阿岳。「明天，北井会塌。」它说。阿岳没理它。第二天，北井塌了。<br>后来，它又说中了一件，两件，十件……九十九件。每一次，阿岳背后都站着一道影子。没有人注意到它。连你都差点没看见。<br>修行奶蛙拽阿岳：「这人不对劲。」阿岳说：「它从来没说错过。」"+(S.flags&&S.flags.curserDone?"<br><br>兜帽底下，是一只很瘦、很老的奶蛙。你见过它跪在地上的样子。":"")+(S.flags&&S.flags.ayNote?"<br>你知道第一百件，是它说给阿岳的最后一件。":""),o:()=>[
  {t:"盯着那道影子看",d:"<span class='good'>获得一件稀有遗物</span>",f:()=>{gainRelic(randRelic("R"));return"影子转过头来，冲你笑了一下。它没有脸，可你知道它在笑。"}},
  {t:"想提醒阿岳",d:"<span class='bad'>失去 6 生命</span>，<span class='good'>+4 经验</span>",f:async()=>{S.hp=Math.max(1,S.hp-6);await gainXP(4);return"你喊了。声音传不出梦。"}},
  {t:"什么都不做",d:"",f:()=>"你看着阿岳跟着那个兜帽，一步一步往上走。"}]},
 dream_throne:{dream:1,n:"塔顶",img:"v_chairwill",t:"梦的这一角很冷。椅子就在那里。两只奶蛙站在它前面，满身是伤。兜帽的声音从什么地方传来：「只有坐上这把椅子的人，能让泉水回来。」<br>修行奶蛙往前走了一步。又一步。他的腿在抖。他说：「……不。」然后他转过身，往山下跑。跑得太快，连影子都没跟上。那道影子留在原地，慢慢站了起来，变成了另外一个样子。<br>阿岳看着他跑远，没有喊他。「回去煮粥吧，」他对着那个背影说，声音很轻，「我下山的时候，要喝。」<br>影子贴在他耳边：「你不坐，就让别人坐。你放心别人吗？」阿岳伸出手，扶住了扶手。",o:()=>[
  {t:"喊住他",d:"<span class='bad'>失去 8 生命</span>，<span class='good'>获得一件稀有遗物</span>",ok:S.hp>8,f:()=>{S.hp-=8;gainRelic(randRelic("R"));S.flags.dThrone=1;return"你喊得嗓子都哑了。他回头看了一眼——不是看你，是看山下的泉。你手里多了一样东西，像是他那时候掉下的。"}},
  {t:"静静看着",d:"<span class='good'>+3 经验</span>",f:async()=>{await gainXP(3);S.flags.dThrone=1;return"他不是贪心。他只是太想让泉水满回来了。"}},
  {t:"追上去，看看修行奶蛙",d:"<span class='good'>最大生命 +5</span>",f:()=>{S.max+=5;S.hp+=5;S.flags.dThrone=1;return"你在半山腰追上了他。他蹲在路边，抱着头，哭得很难看。哭完，他站起来，往村子的方向走。他没回头，一次都没有。"}}]},
 dream_light:{dream:1,n:"山下的灯",img:"bx",t:"椅子上看得很远。每天晚上，阿岳都能看见第一层的泥沼里亮着一点光。很小，但是一直亮着。<br>影子问他在看什么。阿岳说：「没什么。」<br>他看了很多年。",o:()=>[
  {t:"陪他看一会儿",d:"<span class='good'>回复 15 生命</span>",f:()=>{S.hp=Math.min(S.max,S.hp+15);return"那点光闪了一下，又亮了。阿岳的手指在扶手上敲了一下，像是在回答。"}},
  {t:"替他数那盏灯亮了多少年",d:"<span class='good'>+4 经验</span>",f:async()=>{await gainXP(4);return"你数不过来。你只知道，它一天都没灭过。"}}]}});
const DREAM_ORDER=["dream_fish","dream_farewell","dream_lamp","dream_blanket","dream_prophet","dream_throne","dream_light"];
// 梦里的事件格按顺序讲；一局没讲完，下一次进梦从断的地方接着讲
{const _es=eventScreen;eventScreen=function(force){try{if(force&&/^mq_/.test(force)&&EVENTS[force]&&EVENTS[force].act!=null&&EVENTS[force].act!==(S.act||0)){const ok=Object.keys(EVENTS).filter(k=>/^mq_/.test(k)&&(EVENTS[k].act==null||EVENTS[k].act===(S.act||0)));if(ok.length)force=pick(ok)}if(!force&&S&&S.dream&&!(S.cur&&S.cur.ev)){M.dreamSeen=M.dreamSeen||[];const next=DREAM_ORDER.find(k=>!(S.dreamDone||[]).includes(k)&&!(k==="dream_throne"&&S.flags.dThrone))||DREAM_ORDER.find(k=>!M.dreamSeen.includes(k))||pick(DREAM_ORDER);S.dreamDone=S.dreamDone||[];S.dreamDone.push(next);if(!M.dreamSeen.includes(next)){M.dreamSeen.push(next);saveMeta()}S.cur=S.cur||{};S.cur.ev=next;saveRun();return _es.call(this,next)}}catch(e){console.warn(e)}return _es.call(this,force)}}
// 塔顶那一幕：如果打年轻的阿岳之前还没看到，就在开打前补上（只讲，不选）
const THRONE_TALK=[["n1","","（梦的这一角很冷。椅子就在那里。两只奶蛙站在它前面，满身是伤。）"],["e_n1_old","年轻的修行奶蛙","（他往前走了一步，又一步。腿在抖。）……不。"],["n1","","（他转身往山下跑，跑得太快，连影子都没跟上。那道影子留在原地，慢慢站了起来。）"],["bx","年轻的阿岳","回去煮粥吧。……我下山的时候，要喝。"]];
{const _en3=enterNode;enterNode=function(t,resumed,cur){if(t==="K"&&S&&S.dream&&!S.flags.dThrone&&!resumed){S.flags.dThrone=1;saveRun();const a=arguments,self=this;show("none");return talk(THRONE_TALK).then(()=>_en3.apply(self,a))}return _en3.apply(this,arguments)}}
// 梦醒以后的尾声
try{if(STORY.dreamOut&&!STORY.dreamOut.__ep){STORY.dreamOut.push(["n1","","（梦开始散了。）"],["n1","","（你最后看见的，是很多年以后的村子。一只老奶蛙在灶台前熬粥，熬了一大锅。他盛出第一碗，放在门口的石头上。）"],["n1","","（那碗粥，一直放到凉。）"],["n1","","（第二天，他又盛了一碗。）"]);STORY.dreamOut.__ep=1}}catch(e){}

/* ---------- 12. 成就 ---------- */
const CE_LIST=[["iron","let","打完了","老铁一个人走上了斗场","老铁在斗场门口停了很久"],["iron","stop","他走了","在斗场门口拦住了老铁","老铁在斗场门口停了很久"],["iron","tog","站着送你","和老铁一起打完了第一千零一场","老铁在斗场门口停了很久"],["iron","base","比上次高","老铁陪你走到了星空之顶","带着老铁走到最后"],
 ["blue","paid","还清了","替阿蓝还清了债","奶茶厂门口，阿蓝没有喊救命"],["blue","bet","押对了","阿蓝把最后一个金币押在了你身上","打跑债主以后，去地底下的斗场看看"],["blue","hide","还在躲","阿蓝说它还得躲一阵子","打跑债主以后……"],["blue","left","下辈子还","台阶下只剩一副骰子","奶茶厂门口，阿蓝没有喊救命"],
 ["fire","home","回家","小火和哥哥一起回了家","奶茶厂的传送带边"],["fire","stay","一起还","小火留在了奶茶厂","奶茶厂的传送带边"],["fire","scarf","围巾","替小火把围巾交给了哥哥","冰原上那块奇怪的冰"],
 ["bean","ok","送到了","包裹送到时，粥还是温的","钟楼里，豆子问你能不能拆"],["bean","cold","凉了的粥","豆子在本子上写了一个「拆」字","钟楼里，豆子问你能不能拆"],["bean","self","替它送到","你替豆子把包裹送到了","奶茶厂的传送带转得飞快"],
 ["hen","full","一窝","桂嫂找回了一窝蛋","七个蛋，一个都别放过"],["hen","some","数不齐","桂嫂抱着几个蛋回了家","七个蛋，一个都别放过"],["hen","none","空篮子","台阶下只放着一个空篮子","七个蛋，一个都别放过"]];
ACH.push(...CE_LIST.map(([c,k,n,d,h])=>({id:"ce_"+c+"_"+k,n,d,ic:"star",hid:1,h})));

/* ---------- 13. 名人堂 ---------- */
function hofFirst(){const L=(M.trueEnds||[]).slice().sort((a,b)=>(a.t||0)-(b.t||0));const H=L[0]&&HEROES.find(h=>h.id===L[0].h);return H?IMG(H.img):IMG("m6")}
// 名人堂按钮：放在「长老的小院」下面，所有人都看得到
function addHofBtn(){try{const old=$("#tHof");if(old)old.remove();const y=$("#tYard");if(y&&!$("#tHof2")){const b=document.createElement("button");b.className="yardBtn hofBtn2";b.id="tHof2";const n=(M.trueEnds||[]).length;b.innerHTML=`<i class="ybPic"><img src="${n?hofFirst():IMG("hg")}" alt=""></i><span>名人堂${n?`<em>${n}</em>`:""}</span>`;if(!n)b.classList.add("cup");y.parentNode.insertBefore(b,y.nextSibling);b.onclick=()=>{sfx("click");hallOfFame()}}}catch(e){console.warn(e)}}
{const _ts=titleScreen;titleScreen=function(){const r=_ts.apply(this,arguments);addHofBtn();return r}}
addHofBtn();setTimeout(addHofBtn,300);
hallOfFame=function(){let tab=0;const draw=()=>{const L=(M.trueEnds||[]).slice().reverse();const best=M.lbBest||{};const bh=(M.lbHero||{})[2];const H2=bh&&HEROES.find(h=>h.id===bh);const ends=M.ends||{};const ce=M.compEnds||{};const ceN=CE_LIST.filter(([c,k])=>ce[c+"_"+k]).length;const dN=(M.dreamSeen||[]).length;
 const tabs=["我的纪录","结局","真结局"].map((t,i)=>`<button class="${i===tab?"on":""}" data-t="${i}">${t}</button>`).join("");let body="";
 if(tab===0){const ascMax=M.ascMax||0;body=`<div class="hofStats"><div><small>通关</small><b>${M.wins||0}</b><i>次</i></div><div><small>最高周目</small><b>${ascMax+1}</b><i>周目</i></div><div><small>最痛一击</small><b>${best[2]||0}</b><i>${H2?H2.n:"点"}</i></div><div><small>爬塔积分最高</small><b>${best[1]||0}</b><i>分</i></div><div><small>真结局</small><b>${(M.trueEnds||[]).length}</b><i>次</i></div><div><small>同伴结局</small><b>${ceN}</b><i>/ ${CE_LIST.length}</i></div><div><small>阿岳的梦</small><b>${dN}</b><i>/ ${DREAM_ORDER.length} 段</i></div><div><small>结局</small><b>${Object.keys(ends).length}</b><i>/ 5</i></div></div>`}
 if(tab===1){body=`<div class="hofEnds"><h4>结局</h4>${Object.keys(END_NAME).map(k=>`<div class="hofE ${ends[k]?"got":""}"><b>${ends[k]?END_NAME[k]:"？？？"}</b></div>`).join("")}<h4>同伴结局 · ${ceN} / ${CE_LIST.length}</h4>${CE_LIST.map(([c,k,n,d,h])=>{const got=ce[c+"_"+k];const C=COMP[c];return`<div class="hofE ${got?"got":""}"><img src="${IMG(C.img)}" alt=""><b>${C.n} · ${got?n:"？？？"}</b><small>${got?d:"「"+h+"」"}</small></div>`}).join("")}</div>`}
 if(tab===2){body=`<div class="hofList">${L.length?L.map(x=>{const H=HEROES.find(h=>h.id===x.h)||HEROES[0];const dt=new Date(x.t);return`<div class="hofRow"><img src="${IMG(H.img)}"><b>${H.n}</b><span>第 ${(x.a||0)+1} 周目 · ${DIFF[x.d]?DIFF[x.d].n:"普通"}</span><span>击败 ${x.k||0} · 牌组 ${x.deck||0}${x.mh?` · 最痛一击 ${x.mh}`:""}</span><small>${dt.getFullYear()}.${dt.getMonth()+1}.${dt.getDate()}</small></div>`}).join(""):`<p style="text-align:center;opacity:.7;margin-top:60px">还没有人走到这里。<br>第二次登顶以后，椅子会开口说话。</p>`}</div>`}
 ov(`<div class="ovHead"><span class="ribbon b">名人堂</span><small>你在这座塔里留下的东西</small></div><div class="hofTabs">${tabs}</div>${body}<div class="ovFoot"><button class="btn sm" id="ovX">返回</button></div>`);$$("#ov .hofTabs [data-t]").forEach(b=>b.onclick=()=>{tab=+b.dataset.t;sfx("click");draw()});$("#ovX").onclick=closeOv};draw()};

/* ---------- 14. 排行榜：真结局榜带上周目 ----------
   平台只存一个数字，所以把周目藏在最后两位：上传的分 = 真结局分 × 100 + 周目（0 起算）。
   显示时拆开。老的（没藏周目的）分数小于 100000，照原样显示。 */
{const _sb=LB.submit.bind(LB);LB.submit=function(b,score){if(+b===3&&+score>0&&+score<100000)score=Math.floor(+score)*100+Math.min(99,asc());return _sb(b,score)}}
LB.decode=function(b,s){s=+s||0;if(+b===3&&s>=100000)return{s:Math.floor(s/100),a:s%100};return{s,a:null}};
{const _rs=LB.resend.bind(LB);LB.resend=function(){try{if(M.lbBest&&M.lbBest[3]&&M.lbBest[3]<100000){const a=Math.max(0,...(M.trueEnds||[]).map(x=>x.a||0));M.lbBest[3]=M.lbBest[3]*100+Math.min(99,a);if(M.lbSync)delete M.lbSync[3];saveMeta()}}catch(e){}return _rs()}}
// 排行榜画出来以后，把第 3 个榜的分数拆成「分 + 周目」
{const _rk=rankScreen;rankScreen=async function(){const r=await _rk.apply(this,arguments);try{const fix=()=>{const on=$("#ov .lbTabs [data-b].on");if(!on||on.dataset.b!=="3")return;$$("#ov .lbS").forEach(el=>{if(el.dataset.fx)return;const n=parseInt(el.textContent);const d=LB.decode(3,n);if(d.a!=null){el.innerHTML=`${d.s} <small>分</small><i class="lbAsc">第 ${d.a+1} 周目</i>`}el.dataset.fx=1});const me=$("#ov .lbMe b");if(me&&!me.dataset.fx){const d=LB.decode(3,parseInt(me.textContent));me.dataset.fx=1;if(d.a!=null){me.textContent=d.s;me.insertAdjacentHTML("afterend",`<i class="lbAsc">第 ${d.a+1} 周目</i>`)}}};const o=new MutationObserver(fix);const ov=$("#ov");if(ov){o.observe(ov,{childList:true,subtree:true});setTimeout(()=>o.disconnect(),120000)}fix()}catch(e){}return r}}

/* ---------- 15. 同伴：见到首领、路上的事 ----------
   首领每个人挑性格对得上的写；路上的事大约一半的机会说一句，同一类一局里按顺序轮着说。 */
const COMP_BOSS={
 iron:{king:"这人……我年轻时候见过。那会儿他头上还没长莲花。",count:"贵族。打贵族要先打膝盖，他们站不惯。",bloodbeast:"冷的东西不怕砍，怕你不停。",iceking:"冰做的王冠，戴着不冷吗。",fourhead:"四个头，一张嘴吃饭。打中间那个。",lavagiant:"大个子。腿慢。绕着它走。",witch:"别看她眼睛。我爹说的。",tophat:"变戏法的。手比眼快，那就让眼更快。",fallen:"掉下来的东西，最想爬回去。",demon:"……替我好好看看他。我上次没看清。"},
 blue:{pearlqueen:"这壶得值多少钱啊……打碎了是不是就不值钱了？轻点打！",tophat:"变魔术的？我也会。看，钱没了。……哦，是真没了。",count:"伯爵！他家的勺子我认得！……不是我拿的。",king:"这老头身上全是荷叶，能卖吗？",cosmicegg:"这么大的蛋，煎出来够全塔吃一年。",snowking:"雪球大王？我小时候堆的比它好看。",fourhead:"四个头，一个头欠我十块，加起来就是四十。",shadow:"没有脸？那它借钱也不用还了。羡慕。",buddha:"金的！……是金的吧？你帮我咬一口试试。",demon:"就是他？……我能先躲起来再看吗。"},
 fire:{iceking:"它把我冻过！……不对，是那块冰。都一样！",boilerdragon:"它烧的是我哥搬的煤吗？",bloodbeast:"好大……我哥说，大的都怕痒。",king:"沼泽里的老爷爷！他会不会认识我哥？",witch:"她的扫把能借我骑一下吗？",count:"伯爵家有我哥的画！我要问问他！",lavagiant:"烫烫烫！我的包！",snowking:"我要把它堆成雪人！……它已经是雪人了？",cosmicegg:"蛋！好大的蛋！……它会孵出什么啊？",demon:"我哥……没爬到这儿。我替他看。"},
 bean:{fourhead:"四个头……那寄件人写哪个名字？",shadow:"没有脸的，没法签收。",king:"沼泽之王？我往这儿送过信。他没拆，一直揣着。",count:"伯爵家的信箱塞满了，从来没人取。",witch:"女巫的信，要用扫帚送吗？",pearlqueen:"茶壶也收信？那得找个长嘴的信封。",tophat:"帽子里能装多少封信？",iceking:"冻住的信，要捂化了才能看。",abyssdragon:"深渊底下，邮路不通。",demon:"这一单……地址就写这里吗？"},
 hen:{cosmicegg:"……这蛋是谁下的？我得找它妈妈谈谈。",snowking:"穿这么少，难怪脾气大。",count:"就是他！早饭吃蛋的就是他！",boilerdragon:"把火关小点！蛋都要煮老了！",fourhead:"四张嘴，吃饭得多费粮食。",witch:"她锅里煮的什么？……不是蛋吧？",lavagiant:"这么大个子，小时候肯定没少吃。",iceking:"冻得发紫了都，谁给它披件衣服。",pearlqueen:"茶叶蛋……是你煮的吧？！",demon:"你也是谁家的孩子。打完了，记得回家吃饭。"}};
const COMP_MORE={
 iron:{bwin:["嗯。腰转过来了。","还行。比我年轻时强一点。"],shop:["买刀，别买花哨的。"],chest:["打开。别指望太多。"],rest:["睡吧。我守着。……我也守不了多久，睡快点。"],low:["站着。倒下去就起不来了，我知道。"],big:["……这一下，像我爹。"],relic:["好东西。别显摆。"],scam:["这人眼神飘。别信。"]},
 blue:{bwin:["赢了！我押对了！……我没押，我就是说说。","这把我出了大力。我负责喊。"],shop:["你砍价，我望风。"],chest:["先给我看一眼！就一眼！"],rest:["睡觉不花钱，这是塔里唯一不花钱的事。"],low:["要不……咱们跑吧？我跑得可快了。"],big:["这一下能卖多少钱！"],relic:["这个归你，下一个归我。说好了啊。"],scam:["这个我熟。我以前就干这个。……别跟别人说。"]},
 fire:{bwin:["看见没！我就说我们能赢！","赢了！等我找到哥，我要讲给他听！"],shop:["我想买那个！……算了，钱要留着请我哥喝奶茶。"],chest:["我来开我来开！"],rest:["我哥说，篝火边上不能说丧气话。"],low:["你别倒下！你倒下我扛不动你！"],big:["哇！！再来一次！"],relic:["这个好亮！"],scam:["他骗人！跟我哥骗我说他不疼一个味儿。"]},
 bean:{bwin:["签收了。","这一单送完了，下一单。"],shop:["能开发票吗？……塔里没有发票？"],chest:["这包裹没有寄件人。……先打开吧。"],rest:["包裹放火边上热一热。"],low:["你倒了，我这单就送不到了。……你也送不到了。"],big:["这一下，加急件。"],relic:["这个有人寄过来吗？没有？那就是捡的。捡的也算。"],scam:["地址都写不对，还想骗人。"]},
 hen:{bwin:["饿了吧？来，吃一口。","打完了就好，打完了就好。"],shop:["贵！太贵了！老板，你也是有孩子的人吧？"],chest:["里面有吃的吗？没吃的就给你。"],rest:["睡吧，我给你掖掖被子。"],low:["快吃一口！我兜里还有米！"],big:["好！吃饱了就是有劲！"],relic:["收好了，别弄丢了。"],scam:["骗人骗到我头上？我在菜市场砍了三十年价！"]}};
for(const k in COMP_MORE)Object.assign(COMP_LINES[k],COMP_MORE[k]);
function compBoss(){try{if(!compActive()||!B||!B.enemies)return;const id=(B.enemies.find(e=>COMP_BOSS[S.comp.id][e.id])||{}).id;if(id){S.comp.said=S.comp.said||{};const k="b_"+id;if(!S.comp.said[k]){S.comp.said[k]=1;return compSay(COMP_BOSS[S.comp.id][id])}}compLine("boss")}catch(e){}}
function compMaybe(kind,p){try{if(compActive()&&rnd()<(p==null?.5:p))compLine(kind)}catch(e){}}
{const _f=shopScreen;shopScreen=function(){const r=_f.apply(this,arguments);setTimeout(()=>compMaybe("shop"),700);return r}}
{const _f=treasure;treasure=function(){const r=_f.apply(this,arguments);setTimeout(()=>compMaybe("chest",.6),500);return r}}
{const _f=restSite;restSite=function(){const r=_f.apply(this,arguments);setTimeout(()=>compMaybe("rest"),700);return r}}
{const _w=win;win=async function(){try{const k=B&&!B.over&&B.kind;if(["B","K","F","C","O","H","J"].includes(k))setTimeout(()=>{if(compActive())compLine("bwin")},1200)}catch(e){}return _w.apply(this,arguments)}}
{const _st=startTurn;startTurn=async function(){const r=await _st.apply(this,arguments);try{if(B&&!B.over&&S.hp>0&&S.hp<=S.max*.25&&!B.cLow){B.cLow=1;compMaybe("low",.8)}}catch(e){}return r}}
{const _de=dealEnemy;dealEnemy=function(t,d){const r=_de.apply(this,arguments);try{if(!PREV&&B&&!B.cBig&&d>=30&&B.myTurn!==false){B.cBig=1;compMaybe("big",.5)}}catch(e){}return r}}
{const _gr=gainRelic;gainRelic=function(id){const r=_gr.apply(this,arguments);try{const R=RELICS[id];if(R&&/^[RS]$/.test(R.r))compMaybe("relic",.5)}catch(e){}return r}}
{const _es2=eventScreen;eventScreen=function(force){const r=_es2.apply(this,arguments);try{const ev=(S&&S.cur&&S.cur.ev)||force;if(ev&&/^sc_/.test(ev))setTimeout(()=>compMaybe("scam",.8),900)}catch(e){}return r}}


/* ---------- 16. 主角的心里话（每个主角不一样） ---------- */
const HERO_THINK={
 naiwa:{act0:["泥巴好软……要是能在这儿睡一觉就好了。不行，不能睡。"],act1:["好大的房子……打扫起来得多累啊。"],act2:["冷。早知道把长老那条旧被子带上了。"],act3:["好甜的味道。……不能吃，这里的东西都不能乱吃。"],act4:["星星离得好近。村里看不见这么多。"],
  meet:["多一个人，路上就不那么安静了。","它看起来也挺累的。那就一起走吧。"],quest:["反正也是顺路。……应该是顺路吧。","帮一下又不会少块肉。"],thanks:["被人谢谢，脸有点烫。"],scam:["我就知道。我怎么每次都知道，还每次都买。"],caught:["这次没上当！……下次可能就上当了。"],low:["好困……不对，这不是困。"]},
 kungfu:{act0:["泥地，练步法正好。"],act1:["城堡里的人站姿都不稳。可以打。"],act2:["冷，正好练下盘。"],act3:["这里的人一直在动，却没有一个在练功。"],act4:["师父说过，站得越高，越要沉得住气。"],
  meet:["同行的人多一个，出拳要更收敛些。","它的步子很乱。……路上可以教它几招。"],quest:["路见不平。","师父没教过怎么拒绝别人。"],thanks:["举手之劳，不该收谢礼。……收都收了。"],scam:["师父说过：手快的人，心不一定正。我又忘了。"],caught:["呼吸乱了，眼神也乱了。这种人不用出手。"],low:["气还没断。还能出一拳。"]},
 knight:{act0:["骑士的靴子不该踩泥。……算了，没人看见。"],act1:["这里的骑士都忘了自己在守护什么。"],act2:["盔甲会冻在身上。那就不脱了。"],act3:["盔甲在这里会生锈的。……那就趁生锈前打完。"],act4:["一个骑士最远能走到哪里？就是这里了。"],
  meet:["有同伴的骑士，才算骑士。","我会保护它的。……它好像不需要。"],quest:["有人求助，骑士不能装作没听见。"],thanks:["骑士不需要谢礼。但这份心意，我收下了。"],scam:["我被骗，是因为我相信人。这不是缺点。……应该不是。"],caught:["骑士的眼睛，不是用来装饰的。"],low:["盔甲还没倒，我就还没倒。"]},
 mage:{act0:["泥巴里的魔力浓度……出乎意料地高。值得研究。"],act1:["城堡的法阵是反着画的。故意的？"],act2:["冰的结晶是六边形的。和书上一样。总算有一样一样的。"],act3:["这些管子在搬运某种东西。不是奶茶。"],act4:["星星的排列……和书上画的不一样。书上是错的？还是天在变？"],
  meet:["同伴会让这趟旅程变得不可预测。有意思。","多一个观察对象。"],quest:["一个可以验证的小委托。好。"],thanks:["道谢时的表情，和书上写的不太一样。更好一点。"],scam:["概率上讲，这次被骗是小概率事件。……第三次了。"],caught:["这个把戏我三岁就会拆穿了。"],low:["计算一下……不，现在不是计算的时候。"]},
 vamp:{act0:["泥。我的披风。我的鞋。"],act1:["真怀念。……不，一点都不怀念。"],act2:["冷对我没用。……就是有点冷。"],act3:["这里的甜味，比血还腻。"],act4:["月亮这么近。今晚的血月会很美。"],
  meet:["又一个跟着我的。……随它吧。","不是我想带上它。是它非要跟。"],quest:["不是我想帮。只是看不下去而已。"],thanks:["他们道谢的样子……还挺好看的。"],scam:["我被一个骗子骗了。这件事要是传出去，我就把这座塔咬穿。"],caught:["想骗吸血鬼？我活得比你的谎话长。"],low:["这点血……还不够我喝的。"]}};
function think(kind){try{if(!S)return;const H=HERO_THINK[S.hero]||HERO_THINK.naiwa;const L=H[kind];if(!L||!L.length)return;S.thk=S.thk||{};const n=S.thk[kind]|0;S.thk[kind]=n+1;const h=HEROES.find(x=>x.id===S.hero)||HEROES[0];compSay({t:L[n%L.length],img:h.img})}catch(e){}}
// 第一次进入每一层
{const _om3=openMap;openMap=function(){const r=_om3.apply(this,arguments);try{if(S&&!S.junc&&!S.dream&&!S.fin&&S.row<0&&!(S.postQ&&S.postQ.length)){S.thAct=S.thAct||{};const a=S.act||0;if(!S.thAct[a]){S.thAct[a]=1;saveRun();setTimeout(()=>think("act"+a),1600)}}if(S&&S.thinkAfter&&!(S.postQ&&S.postQ.length)){const k=S.thinkAfter;delete S.thinkAfter;setTimeout(()=>think(k),900)}}catch(e){}return r}}
// 遇到同伴
{const _es3=eventScreen;eventScreen=function(force){const r=_es3.apply(this,arguments);try{const ev=(S&&S.cur&&S.cur.ev)||force;if(ev&&/^c_(fire|blue|iron|bean|hen)0$/.test(ev))setTimeout(()=>think("meet"),1500)}catch(e){}return r}}
// 接下支线、办完支线
{const _jt=jsideTake;jsideTake=function(){const r=_jt.apply(this,arguments);try{if(r)setTimeout(()=>think("quest"),900)}catch(e){}return r}}
{const _j2=jsideTick1;jsideTick1=function(q,need){const was=q&&!q.done;const r=_j2.apply(this,arguments);try{if(was&&q.done)S.thinkAfter="thanks"}catch(e){}return r}}
// 被坑 / 识破：坑人事件的第一个选项是上当，写着「识破」的是识破
["sc_holy","sc_antique","sc_warmer","sc_fee","sc_robber","sc_star"].forEach(k=>{const E=EVENTS[k];if(!E)return;const o1=E.o;E.o=()=>o1().map((op,i)=>{const f0=op.f;return Object.assign({},op,{f:async()=>{const r=await f0();try{if(r!=null){if(i===0&&!/真的/.test(r))setTimeout(()=>think("scam"),900);else if(/识破/.test(op.d||""))setTimeout(()=>think("caught"),900)}}catch(e){}return r}})})});
// 快不行了（同伴不在的时候，主角自己想）
{const _st2=startTurn;startTurn=async function(){const r=await _st2.apply(this,arguments);try{if(B&&!B.over&&S.hp>0&&S.hp<=S.max*.25&&!B.tLow&&!compActive()){B.tLow=1;think("low")}}catch(e){}return r}}
