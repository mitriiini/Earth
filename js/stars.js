// js/stars.js

// Crée un nouvel élément canvas pour les étoiles
const starsCanvas = document.createElement("canvas");
const starsCtx = starsCanvas.getContext("2d"); // Obtient le contexte de dessin 2D
starsCanvas.id = "stars-canvas"; // Donne un ID pour le référencement CSS
document.body.appendChild(starsCanvas); // Ajoute le canvas au corps du document

// Fonction pour définir la taille du canvas des étoiles en fonction de la fenêtre
function setStarsCanvasSize() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
}
setStarsCanvasSize(); // Définit la taille initiale
window.addEventListener('resize', setStarsCanvasSize); // Met à jour la taille si la fenêtre est redimensionnée

const numStars = 2500; // Nombre d'étoiles considérablement augmenté pour un effet plus dense
const stars = []; // Tableau pour stocker les propriétés de chaque étoile

// Nouveau centre : beaucoup plus bas, hors de l'écran
const centerX = starsCanvas.width / 2;
const centerY = starsCanvas.height * 1.5; // Le centre est maintenant 0.5 fois la hauteur de l'écran en dessous (monté un peu)

// Rayon maximal pour la galaxie, calculé depuis le nouveau centre
// Cela assure que les étoiles peuvent atteindre les coins supérieurs de l'écran depuis un centre très bas
const maxGalaxyRadius = Math.sqrt(centerX * centerX + centerY * centerY) * 1.05; // Ajusté pour le nouveau centre

// --- Chargement des images des étoiles ---
const starImages = [];
let imagesLoadedCount = 0;
const totalImagesToLoad = 2;

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            imagesLoadedCount++;
            resolve(img);
        };
        img.onerror = () => {
            console.error(`Erreur de chargement de l'image : ${src}`);
            // Fournir une image de fallback simple si le chargement échoue
            const fallbackCanvas = document.createElement('canvas');
            fallbackCanvas.width = 10;
            fallbackCanvas.height = 10;
            const fbCtx = fallbackCanvas.getContext('2d');
            fbCtx.fillStyle = 'white';
            fbCtx.arc(5, 5, 5, 0, Math.PI * 2);
            fbCtx.fill();
            resolve(fallbackCanvas); // Résoudre avec un canvas blanc simple
        };
    });
}

// Charge les deux images d'étoiles
Promise.all([
    loadImage('images/png/stars1.png'),
    loadImage('images/png/stars2.png')
]).then(images => {
    starImages.push(...images);
    // Initialise les étoiles une fois que les images sont chargées
    for (let i = 0; i < numStars; i++) {
        stars.push(initializeStar());
    }
    // Lance l'animation seulement après le chargement des images
    animateStars();
}).catch(error => {
    console.error("Erreur lors du chargement de toutes les images d'étoiles:", error);
    // Fallback: Si aucune image ne peut être chargée, lancez l'animation sans elles ou avec des cercles
    for (let i = 0; i < numStars; i++) {
        stars.push(initializeStar()); // Les étoiles seront des cercles si starImages est vide
    }
    animateStars();
});

// Fonction pour initialiser une étoile avec des propriétés de galaxie
function initializeStar() {
    // Les angles sont définis pour que les étoiles se propagent vers le haut
    // Math.random() * Math.PI génère des angles de 0 à PI (0 à 180 degrés)
    // Ajouter Math.PI restreint les angles à la moitié inférieure du cercle (180 à 360 degrés)
    // ce qui, combiné avec le centre en bas, propulse les étoiles vers le haut.
    // L'ajout de Math.PI ici est essentiel pour que le mouvement "monte" depuis le centre bas.
    let angle = Math.random() * Math.PI + Math.PI;

    // Utilise Math.pow(Math.random(), 2) pour concentrer les étoiles plus près du nouveau centre (en bas)
    let distance = Math.pow(Math.random(), 2) * maxGalaxyRadius;

    // Ajoute une composante spirale subtile en ajustant l'angle en fonction de la distance
    // Ajustez ce facteur (0.08) pour modifier la "courbure" des bras spiraux
    angle += distance * 0.08;

    return {
        initialAngle: angle, // Angle de départ de l'étoile
        currentAngle: angle, // Angle actuel de l'étoile (qui va changer)
        distance: distance,  // Distance de l'étoile par rapport au nouveau centre (constante)

        // La taille de l'étoile sera influencée par son rayon, pour les images
        size: Math.random() * 3 + 1, // Taille fixe pour l'image (pas de zoom)
        opacity: Math.random() * 0.7 + 0.3, // Opacité initiale aléatoire pour le scintillement
        twinkleSpeed: Math.random() * 0.02 + 0.005, // Vitesse de scintillement

        // Vitesse de rotation de l'étoile. Les étoiles plus éloignées peuvent tourner plus lentement
        // pour un effet réaliste.
        rotationalSpeed: (Math.random() * 0.001 + 0.0001) * (1 - (distance / maxGalaxyRadius) * 0.5),

        // Choisit une image d'étoile aléatoirement parmi celles chargées
        image: starImages.length > 0 ? starImages[Math.floor(Math.random() * starImages.length)] : null // null si les images ne sont pas encore chargées
    };
}

// Fonction d'animation des étoiles
function animateStars() {
    // Efface le canvas des étoiles pour chaque nouvelle trame
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    // Dessine un fond noir sur tout le canvas des étoiles
    starsCtx.fillStyle = "black";
    starsCtx.fillRect(0, 0, starsCanvas.width, starsCanvas.height);

    // Dessine et met à jour chaque étoile
    stars.forEach((star) => {
        // Met à jour l'opacité pour l'effet de scintillement
        star.opacity += star.twinkleSpeed;
        // Inverse la direction du scintillement si l'opacité sort des limites
        if (star.opacity > 1 || star.opacity < 0.3) {
            star.twinkleSpeed *= -1;
        }

        // Met à jour l'angle de rotation de l'étoile
        star.currentAngle += star.rotationalSpeed;

        // Recalcule la position X et Y de l'étoile en fonction de son nouvel angle et de sa distance fixe
        // Les calculs utilisent maintenant le nouveau centre (centerX, centerY)
        const x = centerX + star.distance * Math.cos(star.currentAngle);
        const y = centerY + star.distance * Math.sin(star.currentAngle);

        // Applique l'opacité avant de dessiner l'image
        starsCtx.globalAlpha = star.opacity;

        if (star.image) {
            // Dessine l'image de l'étoile
            // La position est ajustée pour que le centre de l'image soit à (x,y)
            starsCtx.drawImage(star.image, x - star.size / 2, y - star.size / 2, star.size, star.size);
        } else {
            // Fallback: dessine un cercle blanc si l'image n'est pas disponible (par ex. non chargée)
            starsCtx.beginPath();
            starsCtx.arc(x, y, star.size / 2, 0, Math.PI * 2, false);
            starsCtx.fillStyle = `white`; // Utilise blanc direct car l'opacité est gérée par globalAlpha
            starsCtx.fill();
        }

        // Réinitialise l'opacité globale pour le prochain dessin
        starsCtx.globalAlpha = 1;
    });

    // Demande au navigateur d'appeler cette fonction à la prochaine trame d'animation
    requestAnimationFrame(animateStars);
}

// L'appel à animateStars() est maintenant déplacé dans le Promise.all pour s'assurer que les images sont chargées.
// Si vous voulez une animation d'étoiles de fallback (cercles) en cas d'échec de chargement d'image,
// vous pouvez appeler animateStars() directement ici, et la logique de fallback dans initializeStar() et animateStars()
// se chargera de dessiner des cercles.
