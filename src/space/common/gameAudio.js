import { AudioListener, AudioLoader } from 'three';

class GameAudio {
  constructor(game) {
    this.musicListener = new AudioListener();
    this.explosionListener = new AudioListener();
    this.blasterListener = new AudioListener();
    
    game.graphics.camera.add(this.musicListener);
    game.graphics.camera.add(this.explosionListener);
    game.graphics.camera.add(this.blasterListener);

    this.game = game;

    this.audioLoader = new AudioLoader();
    this.initialize();
  }

  initialize() {
    // const sound = new Audio(this.musicListener);
    // this.audioLoader.load('../resources/music.mp3', (buffer) => {
    //   sound.setBuffer(buffer);
    //   sound.setLoop(true);
    //   sound.setVolume(0.05);
    // sound.play();
    // })

    this.audioLoader.load('./resources/space/explosion.m4a', (buffer) => {
      this.explosionBuffer = buffer;
    });

    this.audioLoader.load('./resources/space/laser.m4a', (buffer) => {
      this.blasterBuffer = buffer;
    });
  }

  dispose() {
    this.game.graphics.camera.remove(this.musicListener);
    this.game.graphics.camera.remove(this.explosionListener);
    this.game.graphics.camera.remove(this.blasterListener);
  }


}

export default GameAudio;