import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
class BasicWorldDemo {

  constructor(ref) {
    this.initialize(ref);
  }


  initialize(ref) {

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
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(75,10,0);

    this.scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(100,100,100);
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
     './resources/ugly-pixelized-forest/posx.png',
     './resources/ugly-pixelized-forest/negx.png',
     './resources/ugly-pixelized-forest/posy.png',
     './resources/ugly-pixelized-forest/negy.png',
     './resources/ugly-pixelized-forest/posz.png',
     './resources/ugly-pixelized-forest/negz.png',
    ]);
    this.scene.background = texture;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xFFFFFF,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2,2,2),
      new THREE.MeshStandardMaterial({color: 0x808080})
    );
    box.position.set(0,1,0);
    box.castShadow = true;
    box.receiveShadow = true;
    this.scene.add(box);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  RAF(){
    requestAnimationFrame(() => {
      this.renderer.render(this.scene, this.camera);
      this.RAF();
    })
  }

  start() {
    this.RAF();
  }

  clear() {
    this.renderer.clear();
  }

}


export default BasicWorldDemo;