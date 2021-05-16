import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class BlankCanvas {

  constructor(ref) {
    this.initialize(ref);
  }

  initialize(ref) {
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera = new THREE.PerspectiveCamera( 75, ref.current.offsetWidth/ref.current.offsetHeight, 1.0, 1000 );
    this.camera.position.set(75,20,0);
    this.renderer.setSize(ref.current.offsetWidth, ref.current.offsetHeight)

    ref.current.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xFFFFFF,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    const BOIDS_NUMBER = 100;
    for(let i = 0; i < BOIDS_NUMBER; i++) {
      const boid = new THREE.Mesh(
        new THREE.ConeGeometry(2, 5, 8),
        new THREE.MeshStandardMaterial({
            color: 'red',
          }));
      boid.rotation.x = -Math.PI / 2;
      boid.castShadow = true;
      boid.receiveShadow = true;
      boid.position.y = 5;

      boid.position.x = (i*4)%50 ;
      boid.position.z = i%2? (i*20)%50 : (i*20)%50-45;
      if (i < BOIDS_NUMBER/2) {
        boid.position.x = (i*4)%50-47;
      }

      
      this.scene.add(boid);
    }

    


    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0,0,0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this.scene.add(light);

    light = new THREE.AmbientLight(0xFFFFFF, 4.0);
    this.scene.add(light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0,20,0);
    this.controls.update();


    this._RAF()
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this.renderer.render(this.scene, this.camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }

}


export default BlankCanvas;