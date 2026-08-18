/* ============================================================
   LEVEL 2 — interactive logic
   ============================================================ */

const bgMusic = document.getElementById("bgMusic");

/* ---------- CURSOR TRAIL (desktop/mouse only — no ghost dots on touch taps) ---------- */
const trail = document.getElementById("cursorTrail");
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
if (hasFinePointer) {
  let trailTimeout;
  window.addEventListener("pointermove", (e) => {
    trail.style.left = e.clientX + "px";
    trail.style.top = e.clientY + "px";
    trail.style.opacity = "1";
    clearTimeout(trailTimeout);
    trailTimeout = setTimeout(() => (trail.style.opacity = "0"), 400);
  });
} else {
  trail.style.display = "none";
}

/* ---------- SAVE FILE GIMMICK (localStorage) ---------- */
const bootKicker = document.getElementById("bootKicker");
try {
  const last = localStorage.getItem("level2_lastVisit");
  if (last) {
    const days = Math.max(0, Math.round((Date.now() - parseInt(last, 10)) / 86400000));
    bootKicker.textContent = days === 0
      ? `WELCOME BACK — SAVE FILE RESUMED (EARLIER TODAY)`
      : `WELCOME BACK — SAVE FILE RESUMED (${days} DAY${days === 1 ? "" : "S"} AGO)`;
  }
} catch (e) { /* localStorage unavailable, ignore silently */ }

/* ---------- BOOT / START ---------- */
document.getElementById("startBtn").addEventListener("click", () => {
  try { localStorage.setItem("level2_lastVisit", Date.now().toString()); } catch (e) {}
  bgMusic.play().catch(() => {});
  document.getElementById("boot").style.display = "none";
  document.querySelector(".hud").classList.add("visible");
  document.getElementById("pageContent").scrollIntoView({ behavior: "smooth" });
});

/* ---------- HUD SCROLL FILL ---------- */
const hudFill = document.getElementById("hudFill");
const hudHeart = document.getElementById("hudHeart");
const hudPct = document.getElementById("hudPct");
function updateHud() {
  const content = document.getElementById("pageContent");
  const start = content.offsetTop;
  const total = content.offsetHeight - window.innerHeight;
  const scrolled = Math.min(Math.max(window.scrollY - start, 0), total);
  const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
  hudFill.style.width = pct + "%";
  hudHeart.style.left = pct + "%";
  hudPct.textContent = String(pct).padStart(2, "0");
}
window.addEventListener("scroll", updateHud, { passive: true });
window.addEventListener("resize", updateHud);

/* ---------- JOURNEY MAP MODAL ---------- */
const journeyData = [
  { tag: "1-1 · THE START", img: "assets/moment1.jpg", caption: "Where a random hello somehow turned into forever. [I can still remember when you asked me: do you only love winter? and that was the start of something so beautiful that i think about every second for 2 years now. And i will Forever ]" },
  { tag: "1-2 · FIRST-VIDEO-CALL", img: "assets/first2.jpg", caption: "[Wallahi i remeber you were crying and i said dont cry or i would video call you i thought you would stop crying and we will not do video call but then you said ok lets do video call i swear i can not forget it. It was one of the most beautiful moment of my life]" },
  { tag: "1-3 · FIRST NEW YEAR", img: "assets/first1.jpg", caption: "Our first countdown, First new year together, Miles apart 9940KM Away from each other but somehow more together then billions of people in this world" },
  { tag: "1-4 · YOUR BIRTHDAY", img: "assets/memory1.jpg", caption:  "The day I got to celebrate the whole reason for all of our story. [I mean it when i say this i am so thankfull to Allah and your parents that they made you because you seriously are The love of my life. and this gift is a proof that our love can cross seas and inshallah it will💍.]" },
  { tag: "The start of level 2 ", img: "assets/everything.jpg", caption: "Two years later, and you are the best thing that happenend in my life. [AND YOU WILL FOREVER BE]" },
];
const modalOverlay = document.getElementById("modalOverlay");
const modalImg = document.getElementById("modalImg");
const modalTag = document.getElementById("modalTag");
const modalCaption = document.getElementById("modalCaption");

document.querySelectorAll(".node-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const idx = parseInt(btn.parentElement.dataset.node, 10);
    const d = journeyData[idx];
    modalImg.src = d.img;
    modalTag.textContent = d.tag;
    modalCaption.textContent = d.caption;
    modalOverlay.classList.add("open");
  });
});
document.getElementById("modalClose").addEventListener("click", () => modalOverlay.classList.remove("open"));
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove("open"); });

/* ---------- MEMORY MATCH GAME ---------- */
const matchImages = ["assets/moment2.jpg", "assets/first1.jpg", "assets/memory2.jpg"];
let matchDeck = [...matchImages, ...matchImages]
  .map((src) => ({ src, id: Math.random() }))
  .sort(() => Math.random() - 0.5);

const matchGrid = document.getElementById("matchGrid");
const matchStatus = document.getElementById("matchStatus");
const matchWin = document.getElementById("matchWin");
let flippedCards = [];
let matchedCount = 0;
let lockBoard = false;

matchDeck.forEach((card, i) => {
  const el = document.createElement("div");
  el.className = "match-card";
  el.dataset.src = card.src;
  el.dataset.index = i;
  el.innerHTML = `
    <div class="match-card-inner">
      <div class="match-face match-front">♥</div>
      <div class="match-face match-back"><img src="${card.src}" alt=""></div>
    </div>`;
  el.addEventListener("click", () => flipCard(el));
  matchGrid.appendChild(el);
});

function flipCard(el) {
  if (lockBoard || el.classList.contains("flipped") || el.classList.contains("matched")) return;
  el.classList.add("flipped");
  flippedCards.push(el);
  if (flippedCards.length === 2) {
    lockBoard = true;
    const [a, b] = flippedCards;
    if (a.dataset.src === b.dataset.src) {
      setTimeout(() => {
        a.classList.add("matched");
        b.classList.add("matched");
        matchedCount++;
        flippedCards = [];
        lockBoard = false;
        if (matchedCount === matchImages.length) {
          matchWin.textContent = "well now know you know some of my favorite moments by heart 💗";
        } else {
          matchStatus.textContent = `${matchedCount} of ${matchImages.length} pairs found`;
        }
      }, 500);
    } else {
      setTimeout(() => {
        a.classList.remove("flipped");
        b.classList.remove("flipped");
        flippedCards = [];
        lockBoard = false;
      }, 800);
    }
  }
}

/* ---------- GIFT BOX GAME (rigged: always bracelet or earring) ---------- */
const giftPool = ["necklace", "ring", "bracelet", "earring", "empty"];
const giftMeta = {
  necklace: { icon: "📿", label: "necklace" },
  ring: { icon: "💍", label: "ring" },
  bracelet: { icon: "💫", label: "bracelet" },
  earring: { icon: "💎", label: "earring" },
  empty: { icon: "🤍", label: "just my love" },
};
let giftAssign = [...giftPool].sort(() => Math.random() - 0.5); // box i -> item
let giftLocked = false;
const giftRow = document.getElementById("giftRow");
const giftResult = document.getElementById("giftResult");

giftAssign.forEach((item, i) => {
  const box = document.createElement("button");
  box.className = "gift-box";
  box.dataset.index = i;
  box.innerHTML = `🎁<span class="gift-box-label"></span>`;
  box.addEventListener("click", () => pickGift(i, box));
  giftRow.appendChild(box);
});

// brief shuffle animation for flavor before it's interactive
document.querySelectorAll(".gift-box").forEach((box, i) => {
  setTimeout(() => box.classList.add("shuffle"), i * 120);
  setTimeout(() => box.classList.remove("shuffle"), i * 120 + 500);
});

function pickGift(index, boxEl) {
  if (giftLocked) return;
  giftLocked = true;

  const win = Math.random() < 0.5 ? "bracelet" : "earring";
  const swapIndex = giftAssign.indexOf(win);
  [giftAssign[index], giftAssign[swapIndex]] = [giftAssign[swapIndex], giftAssign[index]];

  document.querySelectorAll(".gift-box").forEach((box, i) => {
    const item = giftMeta[giftAssign[i]];
    box.classList.add("opened");
    box.innerHTML = `${item.icon}<span class="gift-box-label">${item.label}</span>`;
    if (i === index) box.classList.add("winner");
  });

  giftResult.textContent = `you picked... ${giftMeta[win].label} 💕 (don't worry, it's a real one — coming soon insha Allah)`;
}

/* ---------- STEAL YOUR HEART (Yes grows / No runs) ---------- */
const stealZone = document.getElementById("stealZone");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const stealCaption = document.getElementById("stealCaption");
let noAttempts = 0;
const stealLines = [
  "nice try 😏",
  "you look cuter when you resist,😘 ",
  "the yes button is getting confident 😌",
  "at this point it's basically decided that i am getting a picture 🥳😋",
  "Ummmmaaaaah just messing with you  or maybe not 👀🙂‍↔️",
];

function dodgeNo() {
  const zoneRect = stealZone.getBoundingClientRect();
  const btnW = noBtn.offsetWidth, btnH = noBtn.offsetHeight;
  const maxX = zoneRect.width - btnW;
  const maxY = zoneRect.height - btnH;
  const newLeft = Math.random() * maxX;
  const newTop = Math.random() * maxY;
  noBtn.style.left = newLeft + btnW / 2 + "px";
  noBtn.style.top = newTop + btnH / 2 + "px";

  noAttempts = Math.min(noAttempts + 1, stealLines.length - 1);
  stealCaption.textContent = stealLines[noAttempts];

  const scale = Math.min(1 + noAttempts * 0.18, 2.4);
  yesBtn.style.transform = `translate(-50%,-50%) scale(${scale})`;
  const shrink = Math.max(1 - noAttempts * 0.08, 0.55);
  noBtn.style.transform = `translate(-50%,-50%) scale(${shrink})`;
}

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("click", (e) => { e.preventDefault(); dodgeNo(); });
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); dodgeNo(); }, { passive: false });

yesBtn.addEventListener("click", () => {
  stealCaption.textContent = "Smartest decision you've made all year 💗";
  yesBtn.style.transform = "translate(-50%,-50%) scale(2.6)";
  noBtn.style.opacity = "0";
});

/* ---------- VAULT LOCK ---------- */
const lockBtn = document.getElementById("lockBtn");
const dots = [document.getElementById("dot1"), document.getElementById("dot2"), document.getElementById("dot3")];
const vaultContent = document.getElementById("vaultContent");
let lockClicks = 0;
lockBtn.addEventListener("click", () => {
  if (lockClicks >= 3) return;
  dots[lockClicks].classList.add("on");
  lockClicks++;
  lockBtn.classList.remove("shake");
  void lockBtn.offsetWidth;
  lockBtn.classList.add("shake");
  if (lockClicks === 3) {
    lockBtn.textContent = "🔓";
    vaultContent.classList.add("open");
  }
});

const recording = document.getElementById("myRecording");
const playRecBtn = document.getElementById("playRecording");
playRecBtn.addEventListener("click", () => {
  if (!recording.paused) {
    recording.pause();
    recording.currentTime = 0;
    bgMusic.play().catch(() => {});
    playRecBtn.textContent = "▶ play voice note";
  } else {
    bgMusic.pause();
    recording.play().catch(() => {});
    playRecBtn.textContent = "🔊 playing… no skipping";
  }
});
recording.addEventListener("ended", () => {
  bgMusic.play().catch(() => {});
  playRecBtn.textContent = "▶ play voice note";
});

/* ---------- FIREWORKS (final section) ---------- */
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function random(min, max) { return Math.random() * (max - min) + min; }
class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.radius = random(2, 4);
    this.vel = { x: random(-3, 3), y: random(-7, -2) };
    this.alpha = 1;
  }
  update() { this.x += this.vel.x; this.y += this.vel.y; this.vel.y += 0.05; this.alpha -= 0.018; }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}
let particles = [];
let fireworksRunning = false;
function burst() {
  const colors = ["#ff6f9c", "#e8c27a", "#ffffff", "#b23e63"];
  const x = random(canvas.width * 0.2, canvas.width * 0.8);
  const y = random(canvas.height * 0.15, canvas.height * 0.5);
  for (let j = 0; j < 26; j++) particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
}
function animateFireworks() {
  if (!fireworksRunning) return;
  ctx.fillStyle = "rgba(11,7,16,0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => { p.update(); p.draw(); if (p.alpha <= 0) particles.splice(i, 1); });
  requestAnimationFrame(animateFireworks);
}
let fireworksInterval;
const finalObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !fireworksRunning) {
      fireworksRunning = true;
      resizeCanvas();
      animateFireworks();
      burst();
      fireworksInterval = setInterval(burst, 900);
    } else if (!entry.isIntersecting && fireworksRunning) {
      fireworksRunning = false;
      clearInterval(fireworksInterval);
      particles = [];
    }
  });
}, { threshold: 0.4 });
finalObserver.observe(document.getElementById("final"));

/* ---------- NEW GAME + ---------- */
document.getElementById("newGameBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
