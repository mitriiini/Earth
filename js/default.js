import * as THREE from './three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
import { Pass } from './jsm/postprocessing/Pass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { MaskPass } from './jsm/postprocessing/MaskPass.js';
import { LuminosityHighPassShader } from './jsm/shaders/LuminosityHighPassShader.js';
import { CopyShader } from './jsm/shaders/CopyShader.js';


// Initialisation de la scène
const scene = new THREE.Scene();
const container = document.getElementById("scene-container");

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 2;
scene.add(camera);

// Création du rendu
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
container.appendChild(renderer.domElement);

// Gestion du redimensionnement de la fenêtre
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener('resize', onWindowResize);

// Ajout des contrôles de la caméra (souris)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 5;
controls.minDistance = 1.1;

// Création de l'éclairage
const ambientLight = new THREE.AmbientLight(0x404040, 5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Chargement des textures
const textureLoader = new THREE.TextureLoader();
const earthColor = textureLoader.load('images/jpg/color.jpg');
const earthNormal = textureLoader.load('images/jpg/normal.jpg');
const earthSpecular = textureLoader.load('images/jpg/specular.jpg');
const cloudTexture = textureLoader.load('images/jpg/cloud.jpg');

// Création de la sphère de la Terre
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthColor,
    normalMap: earthNormal,
    specularMap: earthSpecular,
    shininess: 10,
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Création de la sphère des nuages
const cloudGeometry = new THREE.SphereGeometry(1.003, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.8,
    shininess: 5,
    blending: THREE.AdditiveBlending
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

// Ajout de l'effet de bloom
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 0.5;
bloomPass.radius = 0.5;
composer.addPass(bloomPass);

// Gestion du survol de la souris
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');

function onMouseMove(event) {
    mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove);

// Boucle d'animation
function animate() {
    requestAnimationFrame(animate);

    // Rotation des sphères
    earth.rotation.y += 0.001;
    clouds.rotation.y += 0.0015;

    // Raycast pour la détection de la souris
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([earth, clouds]);

    if (intersects.length > 0) {
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY}px`;
    } else {
        tooltip.style.display = 'none';
    }
    
    controls.update();
    composer.render();
}

// Lancement de l'animation
animate();
