import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');

class Particles {

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
          color: 0x222222,
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);


    const loaderGltf = new GLTFLoader();
    loaderGltf.setPath('./resources/space/tachi/');
    loaderGltf.load('scene.gltf', (tachi) => {
      tachi.scene.traverse(c => {
        c.castShadow = true;
      })
      tachi.scene.scale.setScalar(0.02, 0.02, 0.02);
      tachi.scene.position.set(0, 50, 0);
      tachi.scene.rotation.x = Math.PI/2;
      this.scene.add( tachi.scene );
      this.tachi = tachi.scene;
    });

    this.flame = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 3, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 'red'
      })
    );
    this.flame.position.y = 50-25;
    // this.flame.rotation.x = Math.PI;
    this.scene.add(this.flame);


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

    this._particles = new ParticleSystem({
      parent : this.scene,
      camera : this.camera,
      window: ref.current
    })


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

    const timer = Date.now() * 0.0001;

    // if(this.tachi){
    //   this.tachi.position.y = (this.tachi.position.y + (timer * 0.000000001)) % 200 ;
    // }
    if (this.flame) {
    //   this.flame.position.y = (this.flame.position.y + (timer * 0.000000001)) % 200;
      this.flame.rotation.y = timer * 180;
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }

}

const _VS = `
uniform float pointMultiplier;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = pointMultiplier / gl_Position.w;
}`;

const _FS = `
uniform sampler2D diffuseTexture;
void main() {
  gl_FragColor = texture2D(diffuseTexture, gl_PointCoord);
}`;

class ParticleSystem {
  constructor(params) {
    const uniforms = {
      diffuseTexture : {
        value: new THREE.TextureLoader().load('./resources/fire.png')
      },
      pointMultiplier: {
        value: params.window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
      }
    };

    console.log(uniforms);

    this._materiel = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: _VS,
      fragmentShader: _FS,
      // blending: THREE.AdditiveBlending,
      depthTest: true, 
      depthWrite: false,
      transparent: true,
      vertexColors: true
    })

    this._camera = params.camera;
    this._particles = [];
    
    this._geometry = new THREE.BufferGeometry();
    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));

    this._points = new THREE.Points(this._geometry, this._material);

    params.parent.add(this._points);

    this._AddParticles();
    this._UpdateGeometry();  
  }

  _AddParticles(){
    for(let i=0;i<10; i++){
      this._particles.push({
        position: new THREE.Vector3(
          (Math.random() * 2 - 1) * 1.0,
          10+ (Math.random() * 2 - 1) * 1.0,
          (Math.random() * 2 - 1) * 1.0),
      });
    }
  }

  _UpdateGeometry(){
    const positions = [];
    for (let p of this._particles){
      positions.push(p.position.x, p.position.y, p.position.z);
    }

    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this._geometry.attributes.position.needsUpdate = true;
  }
}


export default Particles;