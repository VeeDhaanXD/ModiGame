const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🖼️ Load images
const playerImg = new Image();
playerImg.src = "assets/item.webp"; // your MC

const villainImg = new Image();
villainImg.src = "assets/rhul.png"; // villain

const itemImg = new Image();
itemImg.src = "assets/img.jpg"; // power-up

const bgImg = new Image();
bgImg.src = "assets/bg.jpg"; // add any fun background image

// 🔊 Sounds
const sfxCollect = new Audio("assets/audio.mp3");
const sfxHit = new Audio("assets/sry.mp3");
const bgMusic = new Audio("assets/modi song org.mp3"); // background song
bgMusic.loop = true; // keep looping during play
bgMusic.volume = 0.5; // adjust volume if needed

// 🧍 Player setup
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  invincible: false,
};

let villains = [];
let items = [];
let score = 0;
let gameOver = false;

// Background scroll
let bgY1 = 0;
let bgY2 = -canvas.height;
let bgSpeed = 2;

// Restart button
let restartButton = {
  x: canvas.width / 2 - 60,
  y: canvas.height / 2 + 50,
  width: 120,
  height: 40,
  visible: false,
};

// 🎯 Mouse control
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.width / 2;
});


// 🎯 Mouse control (for PC)
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.width / 2;
});

// 📱 Mobile button controls
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let movingLeft = false;
let movingRight = false;

leftBtn.addEventListener("touchstart", () => (movingLeft = true));
leftBtn.addEventListener("touchend", () => (movingLeft = false));
rightBtn.addEventListener("touchstart", () => (movingRight = true));
rightBtn.addEventListener("touchend", () => (movingRight = false));

function handleMobileMovement() {
  const moveSpeed = 5; // adjust for sensitivity
  if (movingLeft && player.x > 0) player.x -= moveSpeed;
  if (movingRight && player.x + player.width < canvas.width) player.x += moveSpeed;
}






// 💥 Create villains
function createVillain() {
  const size = 50;
  const x = Math.random() * (canvas.width - size);
  villains.push({
    x,
    y: -size,
    width: size,
    height: size,
    speed: 3 + Math.random() * 2,
  });
}

// 💎 Create power-up items
function createItem() {
  const size = 35;
  const x = Math.random() * (canvas.width - size);
  items.push({
    x,
    y: -size,
    width: size,
    height: size,
    speed: 2 + Math.random() * 1.5,
  });
}

// 🔍 Collision check
function rectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// 💫 Activate temporary invincibility
function activateInvincibility() {
  player.invincible = true;
  playerImg.style = "filter: brightness(1.5)";
  setTimeout(() => {
    player.invincible = false;
  }, 5000); // 5 seconds
}

function update() {
  if (gameOver) return;
  handleMobileMovement(); // moves player using mobile buttons


  // Background scroll
  bgY1 += bgSpeed;
  bgY2 += bgSpeed;
  if (bgY1 >= canvas.height) bgY1 = -canvas.height;
  if (bgY2 >= canvas.height) bgY2 = -canvas.height;

  // Spawns
  if (Math.random() < 0.03) createVillain();
  if (Math.random() < 0.01) createItem();

  // Move villains
  for (let i = 0; i < villains.length; i++) {
    const v = villains[i];
    v.y += v.speed;

    if (!player.invincible && rectCollision(player, v)) {
  sfxHit.play();
  gameOver = true;
  restartButton.visible = true;
  bgMusic.pause();   // 🔇 Stop background song
  bgMusic.currentTime = 0; // rewind for next restart
}


    if (v.y > canvas.height) {
      villains.splice(i, 1);
      i--;
      score++;
    }
  }

  // Move items
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    it.y += it.speed;

    if (rectCollision(player, it)) {
      sfxCollect.play();
      score += 10;
      activateInvincibility(); // temporary shield
      items.splice(i, 1);
      i--;
    }

    if (it.y > canvas.height) {
      items.splice(i, 1);
      i--;
    }
  }

  draw();
  requestAnimationFrame(update);
}

// 🖌️ Draw game
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(bgImg, 0, bgY1, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, bgY2, canvas.width, canvas.height);

  // Player
  ctx.globalAlpha = player.invincible ? 0.6 : 1; // glow when invincible
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  ctx.globalAlpha = 1;

  // Villains
  villains.forEach((v) =>
    ctx.drawImage(villainImg, v.x, v.y, v.width, v.height)
  );

  // Items
  items.forEach((it) =>
    ctx.drawImage(itemImg, it.x, it.y, it.width, it.height)
  );

  // Score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  if (player.invincible) {
    ctx.fillStyle = "cyan";
    ctx.font = "16px Arial";
    ctx.fillText("Invincible!", 300, 30);
  }

  // Game Over
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 90, canvas.height / 2);

    // Restart button
    ctx.fillStyle = "#222";
    ctx.fillRect(
      restartButton.x,
      restartButton.y,
      restartButton.width,
      restartButton.height
    );

    ctx.strokeStyle = "white";
    ctx.strokeRect(
      restartButton.x,
      restartButton.y,
      restartButton.width,
      restartButton.height
    );

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Restart", restartButton.x + 25, restartButton.y + 27);
  }
}

// 🖱️ Restart button click
canvas.addEventListener("click", (e) => {
  if (!restartButton.visible) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  if (
    mx > restartButton.x &&
    mx < restartButton.x + restartButton.width &&
    my > restartButton.y &&
    my < restartButton.y + restartButton.height
  ) {
    restartGame();
  }
});

// 🔁 Restart game
function restartGame() {
  gameOver = false;
  villains = [];
  items = [];
  score = 0;
  restartButton.visible = false;
  player.invincible = false;
  bgMusic.play(); // 🎵 Start song again

  update();
}
bgMusic.play();
update();
