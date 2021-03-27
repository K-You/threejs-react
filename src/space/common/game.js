import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GameAudio from './gameAudio.js';
import { graphics } from './graphics.js';

class Game {
  constructor(ref) {
    this.initialize(ref);
  }

  initialize(ref) {
    this.graphics = new graphics.Graphics(this);
    if(!this.graphics.initialize(ref)) {
      this.displayError('WebGL2 is not available');
      return;
    }

    this.gameAudio = new GameAudio(this);

    this.controls = this.createControls();
    this.previousRAF = null;

    this.onInitialize();
  }

  displayError(errorMessage) {
    const error = document.getElementById('error');
    error.innerHTML = errorMessage;
  }

  createControls() {
    const controls = new OrbitControls(this.graphics.camera, this.graphics.renderer.domElement);
    controls.target.set(0,0,0);
    controls.update();
    return controls;
  }

  raf() {
    requestAnimationFrame((t) => {
      if(this.previousRAF === null) {
        this.previousRAF = t;
      }
      this.render(t - this.previousRAF);
      this.previousRAF = t;
    })
  }

  render(timeInMs) {
    const timeInSeconds = timeInMs * 0.001;
    this.onStep(timeInSeconds);
    this.graphics.render(timeInSeconds);

    this.raf();
  }

  start() {
    this.raf();
  }

  clear() {
    this.gameAudio.dispose();
    this.graphics.renderer.clear();
  }
}


export const game = {
  Game
};
