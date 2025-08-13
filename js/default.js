const canvas = document.getElementById("milkyway");
const ctx = canvas.getContext("2d");

let width, height;
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const starCount = 5000;
const stars = [];

// Vitesse globale légèrement augmentée
const globalSpeed = 0.0004; 

for (let i = 0; i < starCount; i++) {
    const distance = Math.random() * (Math.max(width, height) / 1.2);
    const angle = Math.random() * Math.PI * 2;

    let size, speed;
    const rand = Math.random();

    if (rand < 0.05) {
        // 5% grosses étoiles → vitesse moitié encore
        size = Math.random() * 0.8 + 0.2;
        speed = globalSpeed / 2;
    } else if (rand < 0.80) {
        // 75% petites
        size = Math.random() * 0.2 + 0.1;
        speed = globalSpeed;
    } else {
        // 20% minuscules
        size = Math.random() * 0.05 + 0.05;
        speed = globalSpeed;
    }

    const colors = ["#ffffff", "#ffd27f", "#7fcfff", "#ff7f7f", "#b07fff"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    stars.push({ distance, angle, size, color, speed });
}

// Ajouter 3 étoiles spéciales
for (let i = 0; i < 3; i++) {
    const distance = Math.random() * (Math.max(width, height) / 1.2);
    const angle = Math.random() * Math.PI * 2;
    const size = (Math.random() * 0.8 + 0.2) * 2; // x2 par rapport aux grosses
    const speed = globalSpeed / 4; // encore plus lent

    const colors = ["#ffffff", "#ffd27f", "#7fcfff", "#ff7f7f", "#b07fff"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    stars.push({ distance, angle, size, color, speed });
}

// Charger l'image de la Terre
const earthImg = new Image();
earthImg.src = "images/png/terre.png";

let earthAngle = 0;
const earthRotationSpeed = 0.0001; // très lent
const earthScale = 0.3; // réduire la taille de la Terre

// Charger l'audio mais ne pas jouer encore
const bgMusic = new Audio("audio/music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

// Déclencher la musique sur clic ou touche
function startMusic() {
    bgMusic.play().catch(e => {
        console.log("Impossible de jouer la musique :", e);
    });
    window.removeEventListener("click", startMusic);
    window.removeEventListener("keydown", startMusic);
}
window.addEventListener("click", startMusic);
window.addEventListener("keydown", startMusic);

function draw() {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const starCenterY = height / 2 + 400; // étoiles en bas
    const earthCenterY = height / 2; // Terre au centre exact

    // Dessiner les étoiles
    stars.forEach(star => {
        star.angle += star.speed;

        const x = centerX + Math.cos(star.angle) * star.distance;
        const y = starCenterY + Math.sin(star.angle) * star.distance;

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
    });

    // Dessiner la Terre au centre avec taille réduite
    if (earthImg.complete) {
        ctx.save();
        ctx.translate(centerX, earthCenterY);
        ctx.rotate(earthAngle);
        ctx.drawImage(
            earthImg,
            -earthImg.width / 2 * earthScale,
            -earthImg.height / 2 * earthScale,
            earthImg.width * earthScale,
            earthImg.height * earthScale
        );
        ctx.restore();
    }

    earthAngle += earthRotationSpeed; // rotation lente

    requestAnimationFrame(draw);
}

earthImg.onload = draw;
