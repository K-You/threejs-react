import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');

class Tachi {

  constructor(ref) {
    this.initialize(ref);
  }

  initialize(ref) {
    
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera = new THREE.PerspectiveCamera( 75, ref.current.offsetWidth/ref.current.offsetHeight, 1.0, 1000 );
    this.camera.position.set(75,60,-40);
    this.renderer.setSize(ref.current.offsetWidth, ref.current.offsetHeight)
    // document.body.appendChild( this.renderer.domElement );
    ref.current.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    const loaderGltf = new GLTFLoader();
    loaderGltf.setPath('./resources/space/tachi/');
    loaderGltf.load('scene.gltf', (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      })
      gltf.scene.scale.setScalar(0.05, 0.05, 0.05);
      gltf.scene.position.set(0, 30, 0);
      this.scene.add( gltf.scene );
    });

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

    window.addEventListener('scroll', (e) => {
      this.onScroll(window.scrollY);
    })

    this._RAF()
  }

  onScroll(pos) {
    const a = 75;
    const b = -75;
    const amount = Math.min(pos / 1070.0, 1.0);
    const result = a+amount*(b-a)
    this.camera.position.set(result, 60, -40);
    this.controls.update();
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
    // if (this._mixers) {
    //   this._mixers.map(m => m.update(timeElapsedS));
    // }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }

}


export default Tachi;