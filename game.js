const canvas=document.getElementById("board"),ctx=canvas.getContext("2d");
const N=24, cell=canvas.width/N;
let snake,dir,nextDir,items,portal,enemy,gameRunning=false,paused=false,energy=3,turn=0,gold=25,hp=100,maxHp=100,lengthBase=5,deck,hand,run=1,floor=1,roomCleared=false;
const cards=[
 {id:"slash",name:"VOID SLASH",cost:1,desc:"Deal 12 damage. +2 if length ≥ 10.",fn(){damageEnemy(12+(snake.length>=10?2:0))}},
 {id:"grow",name:"GROW",cost:1,desc:"Add 2 body segments.",fn(){grow(2);log("The serpent grows.")}},
 {id:"guard",name:"SCALE ARMOR",cost:1,desc:"Gain 8 armor this room.",fn(){player.armor=(player.armor||0)+8;log("Scales harden.")}},
 {id:"dash",name:"PHASE DASH",cost:1,desc:"Move 3 cells in your current direction.",fn(){for(let i=0;i<3;i++) move(true)}},
 {id:"venom",name:"VENOM",cost:2,desc:"Deal 8 damage and poison the enemy.",fn(){damageEnemy(8);if(enemy)enemy.poison=3;log("Venom takes hold.")}},
 {id:"molt",name:"MOLT",cost:1,desc:"Lose 1 segment. Restore 14 HP.",fn(){if(snake.length>3){snake.pop();heal(14)}}}
];
let player={armor:0};
function reset(){
 snake=[{x:12,y:13},{x:11,y:13},{x:10,y:13},{x:9,y:13},{x:8,y:13}];dir={x:1,y:0};nextDir=dir;items=[];portal=null;enemy=null;energy=3;turn=0;roomCleared=false;player.armor=0;
 deck=[...cards.slice(0,5),cards[5],cards[1],cards[0]];hand=[];gold=25;hp=100;floor=1;run++;spawnRoom();draw();updateUI();log("New run initialized.");
}
function spawnRoom(){
 items=[]; portal=null; enemy=null;
 const types=["shard","shard","battle","portal","shard","battle","elite","shop"];
 const type=types[Math.floor(Math.random()*types.length)];
 if(type==="shard") for(let i=0;i<3;i++) items.push({x:rand(2,N-3),y:rand(2,N-3),type:"shard"});
 if(type==="battle"||type==="elite") spawnEnemy(type==="elite");
 if(type==="portal"){portal={x:rand(3,N-4),y:rand(3,N-4)};items.push({x:rand(2,N-3),y:rand(2,N-3),type:"shard"});}
 if(type==="shop") items.push({x:rand(3,N-4),y:rand(3,N-4),type:"shop"});
 const names={shard:"THE VERDANT MAZE",battle:"BLOOD CIRCUIT",portal:"FOLD IN SPACE",elite:"HOLLOW CHAMPION",shop:"CARAVAN OF TEETH"};
 document.getElementById("roomTitle").textContent=names[type];document.getElementById("roomType").textContent=type.toUpperCase();
}
function spawnEnemy(elite=false){enemy={x:rand(4,N-5),y:rand(4,N-5),hp:elite?55:28,max:elite?55:28,name:elite?"HOLLOW CHAMPION":"GRAZER",elite};}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function same(a,b){return a.x===b.x&&a.y===b.y}
function occupied(p){return snake.some(s=>same(s,p))}
function move(force=false){
 if(!gameRunning||paused)return;
 if((nextDir.x!==-dir.x||nextDir.y!==-dir.y))dir=nextDir;
 const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
 if(head.x<0||head.x>=N||head.y<0||head.y>=N||snake.slice(0,-1).some(s=>same(s,head))){hit(12);return}
 snake.unshift(head);snake.pop();turn++;
 collect(); enemyTurn(); draw(); updateUI();
 if(turn%18===0){energy=Math.min(3,energy+1);drawHand()}
}
function collect(){
 for(let i=items.length-1;i>=0;i--)if(same(snake[0],items[i])){
  const it=items[i];items.splice(i,1);
  if(it.type==="shard"){gold+=5;grow(1);log("+5 gold / +1 length");}
  if(it.type==="shop"){gold+=10;log("The caravan rewards your courage.");}
 }
 if(portal&&same(snake[0],portal)){floor++;log("Portal traversed. Floor "+floor+".");spawnRoom();reward();drawHand();}
 if(enemy&&same(snake[0],enemy)){damageEnemy(Math.max(3,snake.length-2));}
 if(enemy&&enemy.hp<=0){gold+=enemy.elite?35:15;log("Enemy defeated.");enemy=null;reward();drawHand();}
}
function enemyTurn(){if(!enemy)return; if(enemy.poison){enemy.hp-=3;enemy.poison--} if(enemy.hp<=0)return; if(turn%2===0)hit(enemy.elite?8:5)}
function hit(dmg){let blocked=Math.min(player.armor,dmg);player.armor-=blocked;dmg-=blocked;if(dmg>0)hp-=dmg;log("You take "+dmg+" damage.");if(hp<=0){hp=0;gameRunning=false;document.getElementById("status").textContent="DEAD";showOverlay("RUN ENDED","Your serpent has fallen.","TRY AGAIN")}}
function heal(n){hp=Math.min(maxHp,hp+n);log("+"+n+" HP")}
function grow(n){for(let i=0;i<n;i++)snake.push({...snake[snake.length-1]});}
function damageEnemy(n){if(!enemy){log("No enemy to attack.");return}enemy.hp=Math.max(0,enemy.hp-n);log("Dealt "+n+" damage.")}
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle="#080d13";ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.strokeStyle="#14202b";ctx.lineWidth=1;
 for(let i=0;i<=N;i++){ctx.beginPath();ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,canvas.height);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*cell);ctx.lineTo(canvas.width,i*cell);ctx.stroke()}
 items.forEach(it=>{ctx.font=(cell*.55)+"px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=it.type==="shard"?"#f4c96b":"#6fc7ff";ctx.fillText(it.type==="shard"?"✦":"⌂",(it.x+.5)*cell,(it.y+.5)*cell)});
 if(portal){ctx.fillStyle="#b88cff";ctx.beginPath();ctx.arc((portal.x+.5)*cell,(portal.y+.5)*cell,cell*.32,0,Math.PI*2);ctx.fill();ctx.fillStyle="#080d13";ctx.beginPath();ctx.arc((portal.x+.5)*cell,(portal.y+.5)*cell,cell*.16,0,Math.PI*2);ctx.fill()}
 if(enemy){ctx.fillStyle="#ff6e78";ctx.beginPath();ctx.arc((enemy.x+.5)*cell,(enemy.y+.5)*cell,cell*.34,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("⚔",(enemy.x+.5)*cell,(enemy.y+.5)*cell+1)}
 snake.forEach((s,i)=>{ctx.fillStyle=i===0?"#dfffee":"#58d99d";ctx.beginPath();ctx.roundRect(s.x*cell+2,s.y*cell+2,cell-4,cell-4,5);ctx.fill();if(i===0){ctx.fillStyle="#07100c";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("•",(s.x+.5)*cell,(s.y+.5)*cell)}})
}
function drawHand(){
 hand=[];for(let i=0;i<3;i++)hand.push(deck[Math.floor(Math.random()*deck.length)]);
 document.getElementById("hand").innerHTML=hand.map((c,i)=>`<button class="card ${energy<c.cost?"disabled":""}" data-i="${i}"><span class="cost">${c.cost}</span><b>${c.name}</b><p>${c.desc}</p></button>`).join("");
 document.querySelectorAll(".card").forEach(b=>b.onclick=()=>playCard(+b.dataset.i));
}
function playCard(i){const c=hand[i];if(!c||energy<c.cost||!gameRunning)return;energy-=c.cost;c.fn();draw();drawHand();updateUI()}
function reward(){
 if(roomCleared)return;roomCleared=true;
 const choices=[cards[Math.floor(Math.random()*cards.length)],cards[Math.floor(Math.random()*cards.length)],cards[Math.floor(Math.random()*cards.length)]];
 document.getElementById("rewards").innerHTML=choices.map((c,i)=>`<button class="reward" data-i="${i}"><h3>${c.name}</h3><p>${c.desc}</p><small>COST ${c.cost}</small></button>`).join("");
 document.getElementById("rewardModal").classList.remove("hidden");
 document.querySelectorAll(".reward").forEach(b=>b.onclick=()=>{deck.push(choices[+b.dataset.i]);document.getElementById("rewardModal").classList.add("hidden");roomCleared=false;log("Card added: "+choices[+b.dataset.i].name);updateUI()});
}
document.getElementById("skipReward").onclick=()=>{document.getElementById("rewardModal").classList.add("hidden");roomCleared=false};
function updateUI(){
 document.getElementById("hp").textContent=`${hp} / ${maxHp}`;document.getElementById("hpBar").style.width=(hp/maxHp*100)+"%";
 document.getElementById("length").textContent=snake.length;document.getElementById("armor").textContent=player.armor;document.getElementById("energy").textContent=energy;
 document.getElementById("gold").textContent=gold;document.getElementById("floor").textContent=String(floor).padStart(2,"0");document.getElementById("run").textContent=String(run).padStart(2,"0");
 document.getElementById("deckCount").textContent=deck.length;
 const e=document.getElementById("encounter");e.className=enemy?"encounter enemy":"encounter empty";
 e.innerHTML=enemy?`<div class="enemy-name">${enemy.elite?"⬡ ":"⚔ "}${enemy.name}</div><div>${enemy.elite?"Elite encounter.":"A hostile creature blocks your path."}</div><div class="enemy-hp"><i style="width:${enemy.hp/enemy.max*100}%"></i></div><small>${enemy.hp} / ${enemy.max} HP</small>`:"No enemy detected.";
}
function log(t){const el=document.getElementById("log");el.innerHTML=`<div>${t}</div>`+el.innerHTML}
function showOverlay(title,text,button){document.querySelector("#overlay h2").textContent=title;document.querySelector("#overlay p").textContent=text;document.getElementById("start").textContent=button;document.getElementById("overlay").classList.remove("hidden")}
function start(){gameRunning=true;paused=false;document.getElementById("overlay").classList.add("hidden");document.getElementById("status").textContent="RUNNING";drawHand();draw();updateUI();log("Run started.")}
document.addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key.toLowerCase()==="w")nextDir={x:0,y:-1};if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")nextDir={x:0,y:1};if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")nextDir={x:-1,y:0};if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")nextDir={x:1,y:0};if(e.code==="Space"){e.preventDefault();playCard(0)}if(e.key.toLowerCase()==="r"){reset();start()}});
document.getElementById("start").onclick=()=>{reset();start()};document.getElementById("newRun").onclick=()=>{reset();start()};
reset();gameRunning=false;showOverlay("THE RUN BEGINS","Collect shards, survive encounters and build a deck around your growing body.","START RUN");draw();updateUI();
setInterval(()=>{if(gameRunning&&!paused)move()},170);
