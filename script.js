const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

const gravity = 0.6;

// --- Player ---
class Player {
  constructor() {
    this.width = 30;
    this.height = 50;
    this.x = 50;
    this.y = canvas.height - this.height;
    this.vx = 0;
    this.vy = 0;
    this.speed = 4;
    this.jumping = false;
    this.facing = 1; // 1 = right, -1 = left
    this.swinging = false;
    this.swingTimer = 0;
  }
  update() {
    if(keys["a"] || keys["arrowleft"]) { this.vx = -this.speed; this.facing=-1;}
    else if(keys["d"] || keys["arrowright"]) { this.vx = this.speed; this.facing=1;}
    else this.vx = 0;

    if((keys["w"] || keys["arrowup"] || keys[" "]) && !this.jumping) {
      this.vy = -12;
      this.jumping = true;
    }

    // Swing sword
    if(keys["g"] && !this.swinging){
      this.swinging = true;
      this.swingTimer = 10; // frames
    }

    if(this.swinging){
      this.swingTimer--;
      if(this.swingTimer<=0) this.swinging=false;
    }

    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    if(this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.vy = 0;
      this.jumping = false;
    }
  }
  draw() {
    // Player body
    ctx.fillStyle = "red";
    ctx.fillRect(this.x,this.y,this.width,this.height);

    // Sword
    if(this.swinging){
      ctx.fillStyle = "silver";
      if(this.facing==1){
        ctx.fillRect(this.x+this.width,this.y+10,20,5);
      } else {
        ctx.fillRect(this.x-20,this.y+10,20,5);
      }
    }
  }
}

// --- Platform ---
class Platform {
  constructor(x,y,w,h){
    this.x=x; this.y=y; this.width=w; this.height=h;
  }
  draw(){ ctx.fillStyle="green"; ctx.fillRect(this.x,this.y,this.width,this.height);}
}

// --- Boss ---
class Boss {
  constructor(){
    this.width=60; this.height=80;
    this.x=canvas.width-200;
    this.y=canvas.height - this.height - 50;
    this.health=10;
    this.alive=true;
  }
  draw(){
    if(!this.alive) return;
    ctx.fillStyle="purple";
    ctx.fillRect(this.x,this.y,this.width,this.height);
  }
}

// --- Levels ---
const levels = [
  [{x:0,y:350,w:800,h:50},{x:200,y:300,w:100,h:20},{x:400,y:250,w:100,h:20}],
  [{x:0,y:350,w:800,h:50},{x:150,y:280,w:80,h:20},{x:350,y:230,w:80,h:20},{x:600,y:180,w:100,h:20}],
  [{x:0,y:350,w:800,h:50},{x:120,y:300,w:60,h:20},{x:300,y:250,w:60,h:20},{x:500,y:200,w:60,h:20},{x:700,y:150,w:80,h:20}],
  [{x:0,y:350,w:800,h:50},{x:100,y:300,w:50,h:20},{x:250,y:260,w:50,h:20},{x:400,y:220,w:50,h:20},{x:550,y:180,w:50,h:20},{x:700,y:140,w:80,h:20}],
  [{x:0,y:350,w:800,h:50},{x:150,y:300,w:50,h:20},{x:300,y:260,w:50,h:20},{x:450,y:220,w:50,h:20},{x:600,y:180,w:50,h:20},{x:750,y:140,w:50,h:20}] // boss
];

let currentLevel=0;
let player=new Player();
let platforms=[];
let boss=null;

function loadLevel(n){
  platforms=[];
  levels[n].forEach(p=>platforms.push(new Platform(p.x,p.y,p.w,p.h)));
  player.x=50;
  player.y=canvas.height - player.height;
  player.vx=0; player.vy=0;
  if(n===4){
    boss = new Boss();
    document.getElementById("bossHealthContainer").style.display="block";
    document.getElementById("bossHealth").innerText=boss.health;
  } else {
    boss=null;
    document.getElementById("bossHealthContainer").style.display="none";
  }
  document.getElementById("message").innerText="Level "+(n+1);
}

loadLevel(currentLevel);

function checkCollision(){
  platforms.forEach(p=>{
    if(player.x + player.width > p.x && player.x < p.x + p.width &&
       player.y + player.height > p.y && player.y + player.height < p.y + p.height + player.vy) {
         player.y = p.y - player.height;
         player.vy=0;
         player.jumping=false;
       }
  });
}

function checkBossHit(){
  if(!boss || !boss.alive) return;
  if(player.swinging){
    let swordX = player.facing===1?player.x+player.width:player.x-20;
    let swordY = player.y+10;
    if(swordX < boss.x + boss.width && swordX+20 > boss.x &&
       swordY < boss.y + boss.height && swordY+5 > boss.y){
         boss.health--;
         document.getElementById("bossHealth").innerText=boss.health;
         player.swinging=false;
         if(boss.health<=0){
           boss.alive=false;
           document.getElementById("message").innerText="🎉 You beat the boss! Your code: CODE1234 🎉";
         }
       }
  }
}

function checkLevelComplete(){
  if(currentLevel<4){
    if(player.x>canvas.width){
      currentLevel++;
      loadLevel(currentLevel);
    }
  }
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  player.update();
  checkCollision();
  checkBossHit();
  checkLevelComplete();
  player.draw();
  platforms.forEach(p=>p.draw());
  if(boss) boss.draw();
  requestAnimationFrame(animate);
}

animate();
