
/* ==========================================
   DIWALI PRO SKYSHOT ENGINE
   High Quality | Occasional Fireworks
========================================== */

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

let rockets = [];
let particles = [];

const MAX_ROCKETS = 4;
const MAX_PARTICLES = 1000;

const COLORS = [
    "#ff1744",
    "#ff9100",
    "#ffea00",
    "#00e5ff",
    "#e040fb",
    "#00e676",
    "#ffffff",
    "#ff4081",
    "#ffd700",
    "#ff7043"
];

let animationId = null;
let lastFrame = 0;

const FPS = 45;
const FRAME_INTERVAL = 1000 / FPS;


// ==========================================
// 1. CANVAS SETUP
// ==========================================

function resizeCanvas() {

    const dpr = Math.min(
        window.devicePixelRatio || 1,
        1.5
    );

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ==========================================
// 2. ROCKET CLASS
// ==========================================

class SkyRocket {

    constructor(targetX, targetY) {

        this.x = width * (
            0.15 + Math.random() * 0.7
        );

        this.y = height + 10;

        this.targetX = targetX;
        this.targetY = targetY;

        this.gravity = 0.09;

        this.flightFrames = 65 + Math.random() * 20;

        this.vx = (
            this.targetX - this.x
        ) / this.flightFrames;

        this.vy = (
            this.targetY -
            this.y -
            0.5 * this.gravity *
            this.flightFrames ** 2
        ) / this.flightFrames;

        this.color = randomColor();

        this.trail = [];

        this.age = 0;
    }

    update() {

        this.age++;

        this.trail.push({
            x: this.x,
            y: this.y
        });

        if (this.trail.length > 9) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;

        this.vy += this.gravity;

        if (
            this.age >= this.flightFrames ||
            this.vy >= 0
        ) {

            createSkyExplosion(
                this.x,
                this.y,
                this.color
            );

            return false;
        }

        return true;
    }

    draw() {

        if (this.trail.length > 1) {

            ctx.beginPath();

            ctx.moveTo(
                this.trail[0].x,
                this.trail[0].y
            );

            for (let i = 1; i < this.trail.length; i++) {

                ctx.lineTo(
                    this.trail[i].x,
                    this.trail[i].y
                );
            }

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Rocket head

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            2.5,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// ==========================================
// 3. PARTICLE CLASS
// ==========================================


class SkyParticle {

    constructor(x, y, color, angle, speed, type) {

        this.x = x;
        this.y = y;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.color = color;
        this.type = type;

        this.alpha = 1;

        this.gravity = type === "willow" ? 0.065 : 0.045;

        this.friction = type === "willow" ? 0.992 : 0.982;

        this.size = Math.random() * 2 + 1;

        this.decay = type === "willow"
            ? 0.003 + Math.random() * 0.003
            : 0.007 + Math.random() * 0.009;

        this.twinkle = Math.random() > 0.45;

        this.trail = [];
    }

    update() {

        this.trail.push({
            x: this.x,
            y: this.y
        });

        if (this.trail.length > 4) {
            this.trail.shift();
        }

        this.vx *= this.friction;
        this.vy *= this.friction;

        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.alpha -= this.decay;
    }

    draw() {

        if (this.alpha <= 0) return;

        ctx.globalAlpha = this.alpha;

        if (this.type === "willow" && this.trail.length > 1) {

            ctx.beginPath();

            ctx.moveTo(
                this.trail[0].x,
                this.trail[0].y
            );

            for (let i = 1; i < this.trail.length; i++) {

                ctx.lineTo(
                    this.trail[i].x,
                    this.trail[i].y
                );
            }

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.3;
            ctx.stroke();
        }

        ctx.fillStyle = this.color;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}



// ==========================================
// 4. RANDOM COLOR
// ==========================================

function randomColor() {

    return COLORS[
        Math.floor(Math.random() * COLORS.length)
    ];
}


// ==========================================
// 5. CREATE FIREWORK EXPLOSION
// ==========================================


function createSkyExplosion(x, y, color) {
    playExplosionSound();
    playCrackleSound();

    if (particles.length >= MAX_PARTICLES) return;

    const types = [
        "peony",
        "chrysanthemum",
        "willow",
        "ring"
    ];

    const type = types[
        Math.floor(Math.random() * types.length)
    ];

    const available = MAX_PARTICLES - particles.length;

    const count = Math.min(
        type === "willow" ? 160 : 130,
        available
    );

    for (let i = 0; i < count; i++) {

        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 5 + 2;

        if (type === "ring") {

            angle = (Math.PI * 2 * i) / count;
            speed = 4 + Math.random();

        }

        if (type === "willow") {

            speed = Math.random() * 4 + 1.5;

        }

        particles.push(
            new SkyParticle(
                x,
                y,
                type === "willow" ? "#ffd700" : color,
                angle,
                speed,
                type
            )
        );
    }

    // Secondary golden crackling bursts

    if (
        (type === "willow" || type === "chrysanthemum") &&
        particles.length < MAX_PARTICLES - 30
    ) {

        for (let i = 0; i < 25; i++) {

            const angle = Math.random() * Math.PI * 2;

            particles.push(
                new SkyParticle(
                    x,
                    y,
                    "#fff1a8",
                    angle,
                    Math.random() * 3 + 1,
                    "spark"
                )
            );
        }
    }

    startSkyAnimation();
}



/* Golden sparkle helper */

function createGoldenRain(x, y) {

    const count = 35;

    for (let i = 0; i < count; i++) {

        if (particles.length >= MAX_PARTICLES) break;

        particles.push(
            new SkyParticle(
                x,
                y,
                "#ffd700",
                Math.random() * Math.PI * 2,
                Math.random() * 3 + 1,
                "willow"
            )
        );
    }

    startSkyAnimation();
}


// ==========================================
// 6. LAUNCH ROCKET
// ==========================================

function launchSkyshot(targetX, targetY) {

    if (rockets.length >= MAX_ROCKETS) return;

    const x = targetX ?? width * (
        0.12 + Math.random() * 0.76
    );

    const y = targetY ?? height * (
        0.16 + Math.random() * 0.38
    );

    rockets.push(
        new SkyRocket(x, y)
    );
    playRocketSound();

    startSkyAnimation();
}


// ==========================================
// 7. ANIMATION ENGINE
// ==========================================

function animateSky(timestamp) {

    animationId = null;

    if (timestamp - lastFrame < FRAME_INTERVAL) {

        animationId = requestAnimationFrame(animateSky);

        return;
    }

    lastFrame = timestamp;

    ctx.clearRect(0, 0, width, height);

    // Draw rockets

    rockets = rockets.filter(rocket => {

        const alive = rocket.update();

        if (alive) rocket.draw();

        return alive;
    });

    // Draw particles

    particles = particles.filter(particle => {

        particle.update();

        if (particle.alpha > 0) {

            particle.draw();

            return true;
        }

        return false;
    });

    ctx.globalAlpha = 1;

    // Stop rendering when nothing remains

    if (rockets.length > 0 || particles.length > 0) {

        animationId = requestAnimationFrame(animateSky);

    } else {

        ctx.clearRect(0, 0, width, height);

        lastFrame = 0;
    }
}


function startSkyAnimation() {

    if (animationId === null) {

        animationId = requestAnimationFrame(animateSky);
    }
}


// ==========================================
// 8. OCCASIONAL AUTOMATIC SKYSHOW
// ==========================================

let skyShowTimer = null;

let skyShowRunning = true;

function scheduleSkyshot() {

    if (!skyShowRunning) return;

    launchSkyshot();

    // Sometimes launch a second rocket

    if (Math.random() > 0.7) {

        setTimeout(() => {

            if (skyShowRunning) {
                launchSkyshot();
            }

        }, 450);
    }

    // Random interval between launches

    const nextDelay =
        2500 + Math.random() * 2000;

    skyShowTimer = setTimeout(
        scheduleSkyshot,
        nextDelay
    );
}



/* ==========================================
   GRAND FINALE FIREWORKS
========================================== */

const celebrateBtn = document.getElementById("celebrateBtn");

let finaleRunning = false;

function launchFinale() {

    if (finaleRunning) return;

    finaleRunning = true;

    // Phase 1: Initial rockets

    for (let i = 0; i < 4; i++) {

        setTimeout(() => {

            launchSkyshot(
                width * (0.15 + Math.random() * 0.7),
                height * (0.15 + Math.random() * 0.3)
            );

        }, i * 450);
    }

    // Phase 2: Multiple colorful fireworks

    setTimeout(() => {

        for (let i = 0; i < 4; i++) {

            setTimeout(() => {

                launchSkyshot(
                    width * (0.1 + Math.random() * 0.8),
                    height * (0.12 + Math.random() * 0.3)
                );

            }, i * 350);

        }

    }, 2200);

    // Phase 3: Grand finale

    setTimeout(() => {

        for (let i = 0; i < 4; i++) {

            setTimeout(() => {

                launchSkyshot(
                    width * (0.08 + Math.random() * 0.84),
                    height * (0.1 + Math.random() * 0.3)
                );

            }, i * 300);

        }

    }, 4500);

    // Reset button after finale

    setTimeout(() => {

        finaleRunning = false;

    }, 8500);

}


// Celebrate button

celebrateBtn.addEventListener("click", function() {

    launchFinale();

});



// ==========================================
// 10. MANUAL CLICK FIREWORKS
// ==========================================

window.addEventListener("click", function(event) {

    if (
        event.target.closest("button") ||
        event.target.closest("input") ||
        event.target.closest("textarea")
    ) {
        return;
    }

    launchSkyshot(
        event.clientX,
        event.clientY
    );
});


// ==========================================
// 11. START AUTOMATIC SKYSHOW
// ==========================================

window.addEventListener("load", function() {

    setTimeout(() => {

        if (skyShowRunning) {
            scheduleSkyshot();
        }

    }, 1500);

});


// ==========================================
// 12. SKYSHOW CONTROL
// ==========================================

function stopSkyShow() {

    skyShowRunning = false;

    clearTimeout(skyShowTimer);
}

function startSkyShow() {

    if (skyShowRunning) return;

    skyShowRunning = true;

    scheduleSkyshot();
}


/* ==========================================
   FIREWORKS SOUND EFFECTS ENGINE
========================================== */

let fireworksAudio = null;

let soundEnabled = false;

function initFireworksAudio() {

    const AudioClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioClass) return false;

    if (!fireworksAudio) {
        fireworksAudio = new AudioClass();
    }

    if (fireworksAudio.state === "suspended") {
        fireworksAudio.resume();
    }

    soundEnabled = true;

    return true;
}


// ==========================================
// ROCKET WHOOSH
// ==========================================

function playRocketSound() {

    if (!soundEnabled || !fireworksAudio) return;

    const oscillator = fireworksAudio.createOscillator();

    const gain = fireworksAudio.createGain();

    const now = fireworksAudio.currentTime;

    oscillator.type = "sawtooth";

    oscillator.frequency.setValueAtTime(180, now);

    oscillator.frequency.exponentialRampToValueAtTime(
        65,
        now + 0.45
    );

    gain.gain.setValueAtTime(0.025, now);

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.45
    );

    oscillator.connect(gain);

    gain.connect(fireworksAudio.destination);

    oscillator.start(now);

    oscillator.stop(now + 0.45);
}


// ==========================================
// EXPLOSION SOUND
// ==========================================

function playExplosionSound() {

    if (!soundEnabled || !fireworksAudio) return;

    const now = fireworksAudio.currentTime;

    const oscillator = fireworksAudio.createOscillator();

    const gain = fireworksAudio.createGain();

    oscillator.type = "triangle";

    oscillator.frequency.setValueAtTime(100, now);

    oscillator.frequency.exponentialRampToValueAtTime(
        35,
        now + 0.5
    );

    gain.gain.setValueAtTime(0.12, now);

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.5
    );

    oscillator.connect(gain);

    gain.connect(fireworksAudio.destination);

    oscillator.start(now);

    oscillator.stop(now + 0.5);
}


// ==========================================
// CRACKLING SOUND
// ==========================================

function playCrackleSound() {

    if (!soundEnabled || !fireworksAudio) return;

    const now = fireworksAudio.currentTime;

    for (let i = 0; i < 5; i++) {

        const oscillator = fireworksAudio.createOscillator();

        const gain = fireworksAudio.createGain();

        const start = now + i * 0.055;

        oscillator.type = "square";

        oscillator.frequency.value =
            900 + Math.random() * 1200;

        gain.gain.setValueAtTime(0.025, start);

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            start + 0.045
        );

        oscillator.connect(gain);

        gain.connect(fireworksAudio.destination);

        oscillator.start(start);

        oscillator.stop(start + 0.05);
    }
}


// ==========================================
// SOUND SETTINGS BUTTON
// ==========================================

const soundBtn = document.createElement("button");

soundBtn.id = "fireworksSoundBtn";

soundBtn.textContent = "🔇 Sound Effects Off";

soundBtn.style.cssText = `
    position: fixed;
    top: 75px;
    right: 7%;
    z-index: 30;
    padding: 10px 16px;
    border: 1px solid #ffd166;
    border-radius: 30px;
    background: rgba(30, 10, 50, 0.85);
    color: white;
    cursor: pointer;
    font-size: 13px;
`;

document.body.appendChild(soundBtn);

soundBtn.addEventListener("click", async function() {

    if (soundEnabled) {

        soundEnabled = false;

        soundBtn.textContent = "🔇 Sound Effects Off";

    } else {

        const success = initFireworksAudio();

        if (!success) {
            soundBtn.textContent = "Sound Not Supported";
            return;
        }

        soundEnabled = true;

        soundBtn.textContent = "🔊 Sound Effects On";
    }

});


// ==========================================
// SOUND ENGINE READY
// ==========================================

console.log("Fireworks sound engine ready!");

// ==========================================
// 13. DEBUG
// ==========================================

console.log(
    "%c🎆 DIWALI PRO SKYSHOT ENGINE READY",
    "color:#ffcc33;font-size:18px;font-weight:bold"
);




/* ==========================================
   PERSONALIZED DIWALI WISH GENERATOR
========================================== */

const generateBtn = document.getElementById("generateBtn");
const userName = document.getElementById("userName");
const userMessage = document.getElementById("userMessage");
const wishResult = document.getElementById("wishResult");
const whatsappBtn = document.getElementById("whatsappBtn");

let generatedWish = "";

if (generateBtn) {
    generateBtn.addEventListener("click", function () {

        const name = userName.value.trim();
        const customMessage = userMessage.value.trim();

        if (!name) {
            alert("Please enter your name first! 😊");
            userName.focus();
            return;
        }

        generatedWish = `
🪔✨ Happy Diwali! ✨🪔

Dear ${name},

${customMessage || "May this Diwali bring happiness, prosperity, success and endless joy into your life."}

May your home shine with love, laughter and beautiful memories.

Wishing you and your family a very Happy Diwali! 🎆

🪔 शुभ दीपावली! 🪔
        `.trim();

        wishResult.textContent = generatedWish;
        wishResult.style.display = "block";

        if (whatsappBtn) {
            whatsappBtn.style.display = "inline-block";
        }
    });
}

if (whatsappBtn) {
    whatsappBtn.addEventListener("click", function () {

        if (!generatedWish) {
            alert("Please generate your wish first!");
            return;
        }

        const whatsappURL =
            "https://wa.me/?text=" +
            encodeURIComponent(generatedWish);

        window.open(whatsappURL, "_blank");
    });
}
