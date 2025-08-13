// Initialisation de la scène
const scene = new THREE.Scene();
const container = document.getElementById("scene-container");

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 2;

// Création du rendu
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Gestion du redimensionnement de la fenêtre
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener('resize', onWindowResize);

// Ajout des contrôles de la caméra (souris)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Création de l'éclairage
const light = new THREE.AmbientLight(0x404040, 5);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Chargement des textures
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('images/jpg/earth.jpg');
const cloudTexture = textureLoader.load('images/png/cloud.png');

// Création de la sphère de la Terre
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 5
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Création de la sphère des nuages
const cloudGeometry = new THREE.SphereGeometry(1.003, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.8,
    shininess: 5
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Création des étoiles
const starCount = 5000;
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];

for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    sizeAttenuation: false
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Boucle d'animation
function animate() {
    requestAnimationFrame(animate);

    // Rotation des sphères
    earth.rotation.y += 0.001;
    clouds.rotation.y += 0.0015;
    
    // Pas de rotation des étoiles, elles restent fixes dans l'espace

    controls.update();
    renderer.render(scene, camera);
}

// Lancement de l'animation
animate();
