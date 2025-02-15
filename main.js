import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import LocomotiveScroll from 'locomotive-scroll';


const scroll = new LocomotiveScroll();

let model;

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();



const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0015;
composer.addPass(rgbShiftPass);

new RGBELoader()
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture){
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    // scene.background = envMap;
    scene.environment = envMap; 
    texture.dispose();
    pmremGenerator.dispose();

    const loader = new GLTFLoader();
    loader.load(
      './DamagedHelmet.gltf',
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
      }, undefined, (error) => {
        console.error('An error happened', error);
      })
  })

window.addEventListener('mousemove', (e) => {
    if(model){
      gsap.to(model.rotation, {
        y: (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.15),
        x: (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.15),
        duration: 0.8 ,
        ease: "power2.out"
      });
    }
})

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  composer.setSize(window.innerWidth, window.innerHeight);
})

function animate(){
  window.requestAnimationFrame(animate);
  composer.render(); 
}
animate();
