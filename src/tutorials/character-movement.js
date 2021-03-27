import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class CharacterMovement {

  constructor(ref) {
    this.initialize(ref);
  }


  initialize(ref) {

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
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
    this.camera.position.set(75,20,0);

    this.scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20,100,10);
    light.target.position.set(0,0,0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width=2048
    light.shadow.mapSize.height=2048;
    light.shadow.camera.near=1.0;
    light.shadow.camera.far=500;
    light.shadow.camera.left=100;
    light.shadow.camera.right=-100;
    light.shadow.camera.top=100;
    light.shadow.camera.bottom=-100;
    this.scene.add(light);

    light = new THREE.AmbientLight(0xFFFFFF, 4.0);
    this.scene.add(light);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0,20,0);
    controls.update();


    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 1, 1),
      new THREE.MeshStandardMaterial({
          color: 0xFFFFFF,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    // this.loadModel();
    this.mixers = [];
    this.loadAnimatedModel({x: -10});
    this.loadAnimatedModel({x: 10});
    this.loadAnimatedModel({z: 10});
  }

  loadAnimatedModel(offset) {
    const loader = new FBXLoader();
    loader.load('./resources/eve_j_gonzales.fbx', (fbx) => {
      fbx.scale.setScalar(0.1);

      fbx.traverse(c => {
        c.castShadow = true;
      });

      if(offset.x) {
        fbx.position.x = offset.x;
      }
      if(offset.y) {
        fbx.position.y = offset.y;
      }
      if(offset.z) {
        fbx.position.z = offset.z;
      }

      // const params = {
      //   target: fbx,
      //   camera: this.camera,
      // }
      // this.controls = new BasicCharacterControls(params);

      const anim = new FBXLoader();
      anim.load('./resources/Samba Dancing.fbx', (anim) => {
        const mixer = new THREE.AnimationMixer(fbx);
        this.mixers.push(mixer)
        const idle = mixer.clipAction(anim.animations[0]);
        idle.play();
      });
      // anim.load('./resources/Walking.fbx', (anim) => {
      //   this.mixer = new THREE.AnimationMixer(fbx);
      //   this.walking = this.mixer.clipAction(anim.animations[0]);
      // });
      this.scene.add(fbx);
    })
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load('./resources/Atlas_V_401.glb', (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
      this.scene.add(gltf.scene);
      gltf.scene.position.y = 28;
      this.rocket = gltf.scene;
    })

    loader.load('./resources/rectangle-moche.glb', (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
      this.scene.add(gltf.scene);
      gltf.scene.position.z = 28;
      this.rectangle = gltf.scene;
    })
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  RAF(){
    if(this.isPlaying){
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
  }

  step(timeElapsed){
    const timeElapsedSeconds = timeElapsed*0.001
    if(this.mixers) {
      this.mixers.map(m => { m.update(timeElapsedSeconds)});
    }
    // if (this.controls) {
    //   this.controls.update(timeElapsedSeconds);
    // }
  }

  start() {
    this.isPlaying = true;
    this.RAF();
  }

  clear() {
    this.isPlaying = false;
    this.renderer.clear();
  }

}


export default CharacterMovement;