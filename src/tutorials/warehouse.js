import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');
const { SkeletonUtils } = require('three/examples/jsm/utils/SkeletonUtils');

class Warehouse {

  constructor(ref) {
    this.initialize(ref);
  }

  initialize(ref) {

    this.gui = new dat.GUI();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    ref.current.appendChild(this.renderer.domElement);
    
    window.addEventListener('resize', () => {
      this.onWindowResize();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 10000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(75,10,0);

    this.scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(0,150,0);
    light.target.position.set(0,0,0);
    light.castShadow = true;
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width=2048
    light.shadow.mapSize.height=2048;
    light.shadow.camera.near=1.0;
    light.shadow.camera.far=500;
    light.shadow.camera.left=200;
    light.shadow.camera.right=-200;
    light.shadow.camera.top=200;
    light.shadow.camera.bottom=-200;
    this.scene.add(light);

    light = new THREE.AmbientLight(0x404040);
    this.scene.add(light);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0,20,0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
     './resources/space/space-posx.jpeg',
     './resources/space/space-negx.jpeg',
     './resources/space/space-posy.jpeg',
     './resources/space/space-negy.jpeg',
     './resources/space/space-posz.jpeg',
     './resources/space/space-negz.jpeg',
    ]);
    this.scene.background = texture;

    this.mixers = [];

    this.addPlans();

    // this.addDrone();
    this.addTroopers();
    this.addTies();
  }

  addPlans(){
    let plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xAFAFAF,
          side: THREE.DoubleSide
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(0, 0, 0);
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xAFAFAF,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(0, 150, 0);
    plane.rotation.x = Math.PI / 2;
    this.scene.add(plane);

    plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 150, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xAFAFAF,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(0, 75, 500);
    plane.rotation.x = Math.PI;
    this.scene.add(plane);

    plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 150, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xAFAFAF,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(0, 75, -500);
    this.scene.add(plane);

    plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 150, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xAFAFAF,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(-500, 75, 0);
    plane.rotation.y = Math.PI / 2;
    this.scene.add(plane);

    plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 150, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xAFAFAF,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(500, 75, 0);
    plane.rotation.y = -Math.PI / 2;
    this.scene.add(plane);
  }

  addDrone(){
    const loaderGltf = new GLTFLoader();

    loaderGltf.setPath('./resources/buster_drone/');

    loaderGltf.load('scene.gltf', (drone) => {
      drone.scene.position.set(0, 30, 0);
      drone.scene.scale.setScalar(0.1, 0.1, 0.1);
      // drone.scene.traverse(c => {
      //   if(c.type === 'Mesh'){
      //     c.castShadow = true;
      //   }
      // })

      const mixer = new THREE.AnimationMixer(drone.scene);
      this.mixers.push(mixer);
      const start = mixer.clipAction(drone.animations[0]);
      start.play();
      this.scene.add(drone.scene);

      this.gui.add(drone.scene.position, 'x', -450, 450, 10);
      this.gui.add(drone.scene.position, 'y', 0, 100, 5);
      this.gui.add(drone.scene.position, 'z', -450, 450, 10);

      this.gui.add(drone.scene.rotation, 'x', -Math.PI, Math.PI, Math.PI/8);
      this.gui.add(drone.scene.rotation, 'y', -Math.PI, Math.PI, Math.PI/8);
      this.gui.add(drone.scene.rotation, 'z', -Math.PI, Math.PI, Math.PI/8);
    });
  }

  addTroopers(){
    const loaderGltf = new GLTFLoader();

    loaderGltf.setPath('./resources/sw/dancing_stormtrooper/');

    loaderGltf.load('scene.gltf', (trooper) => {
      trooper.scene.position.set(0, 0, 0);
      trooper.scene.scale.setScalar(2, 2, 2);
      trooper.scene.traverse(c => {
        c.castShadow = true;
      })
      trooper.scene.rotation.set(0, Math.PI / 2, 0);

      let z = -35;
      let x = -25;
      for(let i = 0; i < 121; i++) {
        const boid = SkeletonUtils.clone(trooper.scene);
        boid.receiveShadow = true;
        boid.position.y = 0;
        boid.position.x = x;
        boid.position.z = z;
        
        x = x + 5;
        if (x > 25) {
          x = -25;
          z = z + 5;
        }
        
        const mixer = new THREE.AnimationMixer(boid);
        this.mixers.push(mixer);
        const start = mixer.clipAction(trooper.animations[0]);
        start.play();
        this.scene.add(boid);
      }


    });
  }

  addTies(){
    const loaderGltf = new GLTFLoader();
    loaderGltf.setPath('./resources/sw/star_wars_tie_fighter/');
    
    loaderGltf.load('scene.gltf', (gltf) => {
      this.tie = gltf.scene;
      gltf.scene.traverse(c => {
        c.castShadow = true;
      })
      gltf.scene.scale.setScalar(3, 3, 3);
      gltf.scene.position.set(0, 15, 0);
      gltf.scene.rotation.set(0 , Math.PI/2, 0);

      let z = -450;
      let x = -400;
      for(let i = 0; i < 503; i++) {
        const boid = gltf.scene.clone();
        boid.receiveShadow = true;
        boid.position.y = 15;
        boid.position.x = x;
        boid.position.z = z;
        this.scene.add(boid);

        x = x + 40;
        
        if(x > - 20 && x < 20 && z > - 20 && z < 20) {
          x = 40;
        }
        if (x > 400) {
          x = -400;
          z = z + 40;
        }
        
      }
    });
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  RAF(){
    requestAnimationFrame((t) => {
      if ( this.previousRAF === null) {
        this.previousRAF = t;
      }

      this.renderer.render(this.scene, this.camera);
      this.step(t-this.previousRAF);
      this.previousRAF = t;

      this.RAF();
    })
  }

  step(timeElapsed){
    const timeElapsedSeconds = timeElapsed*0.001
    if(this.mixers) {
      this.mixers.map(m => { m.update(timeElapsedSeconds)});
    }
  }

  start() {
    this.RAF();
  }

  clear() {
    this.renderer.clear();
  }

}


export default Warehouse;