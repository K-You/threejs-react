import { DirectionalLight, PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { WEBGL } from 'three/examples/jsm/WebGL.js';


class Graphics {

  initialize(ref){
    if(!WEBGL.isWebGL2Available()) {
      return false;
    }

    this.renderer = new WebGLRenderer({
      antialias: true,
    });

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    ref.current.appendChild(this.renderer.domElement);

    this.stats = new Stats();
    ref.current.appendChild(this.stats.dom);

    window.addEventListener('resize', () => {
      this.onWindowResize();
    }, false);

    const fov = 80;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 10000.0;
    this.camera = new PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(10, 140, -90);

    this.scene = new Scene();

    this.createLights();

    const composer = new EffectComposer(this.renderer);
    this.composer = composer;
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    return true;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  createLights() {
    let light = new DirectionalLight(0xFFFFFF, 1, 100);
    light.position.set(100, 100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    // light.shadowCameraVisible = true;
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1.0;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = 200;
    light.shadow.camera.right = -200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    this.scene.add(light);

    light = new DirectionalLight(0x404040, 1, 100);
    light.position.set(-100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this.scene.add(light);

    light = new DirectionalLight(0x404040, 1, 100);
    light.position.set(100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this.scene.add(light);
  }

  addPostFX(passClass, params) {
    const pass = new passClass();
    for (const k in params) {
      pass[k] = params[k];
    }
    this.composer.addPass(pass);
    return pass;
  }

  get Scene() { 
    return this.scene;
  }

  render(timeInSeconds) {
    this.composer.render();
    this.stats.update();
  }
  
}

export const graphics = {
  Graphics,
  PostFX: {
    UnrealBloomPass: UnrealBloomPass,
    GlitchPass: GlitchPass,
  },
}