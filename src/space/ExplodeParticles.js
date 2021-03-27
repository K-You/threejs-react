import { Color, Vector3 } from 'three';
import math from './common/math.js';
import ParticleSystem from './common/particles.js';

class ExplodeParticles {
  constructor(game){
    this.particleSystem = new ParticleSystem(game, {texture: "./resources/space/blaster.jpeg"});
    this.particles = [];
    this.game = game;

  }

  splode(origin) {
    for(let i=0; i < 128; i++) {
      const p = this.particleSystem.createParticle();

      p.Position.copy(origin);
      p.Velocity = new Vector3(
        math.rand_range(-1, 1),
        math.rand_range(-1, 1),
        math.rand_range(-1, 1),
      );
      p.Velocity.normalize();
      p.Velocity.multiplyScalar(125);
      p.TotalLife = 2.0;
      p.Life = p.TotalLife;
      p.Colors = [new Color(0xFF8000), new Color(0x800000)];
      p.Sizes = [3, 12];
      p.Size = p.Sizes[0];
      this.particles.push(p);
    }
  }
  
  update(timeInSeconds) {
    this.particles = this.particles.filter(p => {
      return p.Alive;
    });
    for (const p of this.particles) {
      p.Life -= timeInSeconds;
      if (p.Life <= 0) {
        p.Alive = false;
      }
      p.Position.add(p.Velocity.clone().multiplyScalar(timeInSeconds));
      p.Velocity.multiplyScalar(0.75);
      p.Size = math.lerp(p.Life / p.TotalLife, p.Sizes[0], p.Sizes[1]);
      p.Color.copy(p.Colors[0]);
      p.Color.lerp(p.Colors[1], 1.0 - p.Life / p.TotalLife);
    }
    this.particleSystem.update();
  }
}

export default ExplodeParticles;