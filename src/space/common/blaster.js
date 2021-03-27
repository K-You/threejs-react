import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Float32BufferAttribute, Mesh, ShaderMaterial, TextureLoader, Vector3 } from 'three';

const _VS = `
varying vec2 v_UV;
varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
  v_UV = uv;
}
`;

  const _PS = `
uniform sampler2D texture;
varying vec2 v_UV;
varying vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, 1.0) * texture2D(texture, v_UV);
}
`;

class BlasterSystem {
  constructor(game, params) {
    this.initialize(game, params);
  }

  initialize(game, params) {
    const uniforms = {
    texture: {
            value: new TextureLoader().load(params.texture)
        }
    };
    this._material = new ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _PS,

        blending: AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    } );

    this.geometry = new BufferGeometry();

    this.particleSystem = new Mesh(
        this.geometry, this.material);

    game.graphics.scene.add(this.particleSystem);

    this.game = game;

    this.liveParticles = [];
  }

  createParticle() {
    const p = {
      Start: new Vector3(0, 0, 0),
      End: new Vector3(0, 0, 0),
      Color: new Color(),
      Size: 1,
      Alive: true,
    };
    this.liveParticles.push(p);
    return p;
  }

  update(timeInSeconds) {
    for (const p of this.liveParticles) {
      p.Life -= timeInSeconds;
      p.End.add(p.Velocity.clone().multiplyScalar(timeInSeconds));

      const segment = p.End.clone().sub(p.Start);
      if (segment.length() > p.Length) {
        const dir = p.Velocity.clone().normalize();
        p.Start = p.End.clone().sub(dir.multiplyScalar(p.Length));
      }
    }

    this.liveParticles = this.liveParticles.filter(p => {
      return p.Alive;
    });

    this.generateBuffers();
  }

  generateBuffers() {
    const indices = [];
    const positions = [];
    const colors = [];
    const uvs = [];

    const square = [0, 1, 2, 2, 3, 0];
    let indexBase = 0;

    for (const p of this.liveParticles) {
      indices.push(...square.map(i => i + indexBase));
      indexBase += 4;

      const v1 = p.End.clone().applyMatrix4(
          this.particleSystem.modelViewMatrix);
      const v2 = p.Start.clone().applyMatrix4(
          this.particleSystem.modelViewMatrix);
      const dir = new Vector3().subVectors(v1, v2);
      dir.z = 0;
      dir.normalize();

      const up = new Vector3(-dir.y, dir.x, 0);

      const dirWS = up.clone().transformDirection(
          this.game.graphics.camera.matrixWorld);
      dirWS.multiplyScalar(p.Width);

      const p1 = new Vector3().copy(p.Start);
      p1.add(dirWS);

      const p2 = new Vector3().copy(p.Start);
      p2.sub(dirWS);

      const p3 = new Vector3().copy(p.End);
      p3.sub(dirWS);

      const p4 = new Vector3().copy(p.End);
      p4.add(dirWS);

      positions.push(p1.x, p1.y, p1.z);
      positions.push(p2.x, p2.y, p2.z);
      positions.push(p3.x, p3.y, p3.z);
      positions.push(p4.x, p4.y, p4.z);

      uvs.push(0.0, 0.0);
      uvs.push(1.0, 0.0);
      uvs.push(1.0, 1.0);
      uvs.push(0.0, 1.0);

      const c = p.Colors[0].lerp(
          p.Colors[1], 1.0 - p.Life / p.TotalLife);
      for (let i = 0; i < 4; i++) {
        colors.push(c.r, c.g, c.b);
      }
    }

    this.geometry.setAttribute(
        'position', new Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute(
        'uv', new Float32BufferAttribute(uvs, 2));
    this.geometry.setAttribute(
        'color', new Float32BufferAttribute(colors, 3));
    this.geometry.setIndex(
        new BufferAttribute(new Uint32Array(indices), 1));

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.uv.needsUpdate = true;
  }
}

export default BlasterSystem;