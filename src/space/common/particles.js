import { AdditiveBlending, BufferGeometry, Color, DynamicDrawUsage, Float32BufferAttribute, Points, ShaderMaterial, TextureLoader, Vector3 } from 'three';

const _VS = `
attribute float size;
varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
`;

  const _PS = `
uniform sampler2D pointTexture;
varying vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor * 4.0, 1.0);
  gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
}
`;

class ParticleSystem {
  constructor(game, params) {
    this.initialize(game, params);
  }

  initialize(game, params) {
    const uniforms = {
    pointTexture: {
            value: new TextureLoader().load(params.texture)
        }
    };
    this.material = new ShaderMaterial( {
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

    this.particleSystem = new Points(
        this.geometry, this.material);

    game.graphics.scene.add(this.particleSystem);

    this.liveParticles = [];
  }

  createParticle() {
    const p = {
      Position: new Vector3(0, 0, 0),
      Color: new Color(),
      Size: 1,
      Alive: true,
    };
    this.liveParticles.push(p);
    return p;
  }

  update() {
    this.liveParticles = this.liveParticles.filter(p => {
      return p.Alive;
    });

    const positions = [];
    const colors = [];
    const sizes = [];

    for (const p of this.liveParticles) {
      positions.push(p.Position.x, p.Position.y, p.Position.z);
      colors.push(p.Color.r, p.Color.g, p.Color.b);
      sizes.push(p.Size);
    }

    this.geometry.setAttribute(
        'position', new Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute(
        'color', new Float32BufferAttribute(colors, 3));
    this.geometry.setAttribute(
        'size', new Float32BufferAttribute(sizes, 1).setUsage(
            DynamicDrawUsage));

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }
}

export default ParticleSystem;