import { Color, Group, Mesh, MeshStandardMaterial, PositionalAudio, Ray, Vector3 } from 'three';
import ThirdPersonCamera from './common/camera.js';
import math from './common/math.js';

const BOID_FORCE_ORIGIN = 10;
const BOID_FORCE_ALIGNMENT = 10;
const BOID_FORCE_SEPARATION = 20;
const BOID_FORCE_COLLISION = 50;
const BOID_FORCE_COHESION = 6;
const BOID_FORCE_WANDER = 5;

class SpaceBoid {
  constructor(game, params){

    this.mesh = new Mesh(
      params.geometry,
      new MeshStandardMaterial({color: 0x808080})
    );

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;

    this.group = new Group();
    this.group.add(this.mesh);
    this.group.position.set(
      math.rand_range(-250, 250),
      math.rand_range(-250, 250),
      math.rand_range(-250, 250),
    );

    this.direction = new Vector3(
      math.rand_range(-1, 1),
      math.rand_range(-1, 1),
      math.rand_range(-1, 1)
    );

    this.velocity = this.direction.clone();

    const speedMultiplier = math.rand_range(params.speedMin, params.speedMax);
    this.maxSteeringForce = params.maxSteeringForce * speedMultiplier;
    this.maxSpeed  = params.speed * speedMultiplier;
    this.acceleration = params.acceleration * speedMultiplier;

    const scale = 1.0 / speedMultiplier;
    this.radius = scale;
    this.mesh.scale.setScalar(scale * params.scale);

    this.game = game;
    game.graphics.Scene.add(this.group);

    this.visibilityIndex = game.visibilityGrid.updateItem(this.mesh.uuid, this);

    if(params.isFollowed){
      this.isFollowed = true;
      game.thirdPersonCamera = new ThirdPersonCamera({
        camera: game.graphics.camera,
        target: this
      });
    }

    this.wanderAngle = 0;
    this.seekGoal = params.seekGoal;
    this.fireCooldown = 0.0;
    this.params = params;
  }

  get Color() {
    return this.col
  }

  get Position() {
    return this.group.position;
  }

  get Velocity() {
    return this.velocity;
  }

  get Direction() {
    return this.direction;
  }

  get Radius() {
    return this.radius;
  }

  get Rotation() {
    return this.group.quaternion;
  }

  step(timeInSeconds) {
    const local = this.game.visibilityGrid.getLocalEntities(this.Position, 15);

    this.applySteering(timeInSeconds, local);

    const frameVelocity = this.velocity.clone();
    frameVelocity.multiplyScalar(timeInSeconds);
    
    this.group.position.add(frameVelocity);
    this.group.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), this.Direction);

    this.visibilityIndex = this.game.visibilityGrid.updateItem(this.mesh.uuid, this, this.visibilityIndex);
    
    if (this.game.thirdPersonCamera) {
      this.game.thirdPersonCamera.update(timeInSeconds);
    }
  }

  applySteering(timeInSeconds, local) {
    const allies = local.filter((e) => {
      return this.seekGoal.equals(e.seekGoal);
    });

    const enemies = local.filter((e) => {
      return !this.seekGoal.equals(e.seekGoal);
    });

    this.fireCooldown -= timeInSeconds;
    if (enemies.length > 0 && this.fireCooldown <= 0) {
      const p = this.game.blasters.createParticle();
      this.createBlasterSoundEffect(this);
      p.Start = this.Position.clone();
      p.End = this.Position.clone();
      p.Velocity = this.Direction.clone().multiplyScalar(300);
      p.Length = 50;
      p.Colors = [this.params.color.clone(), new Color(0.0, 0.0, 0.0)];
      p.Life = 2.0;
      p.TotalLife = 2.0;
      p.Width = 0.25;

      
      if(Math.random() < 0.025) {
        this.destroyStarship(enemies[0]);
      }
      this.fireCooldown = 0.25;
    }

    const separationVelocity = this.applySeparation(local);
    const alignmentVelocity = this.applyAlignment(allies);
    const cohesionVelocity = this.applyCohesion(allies);
    const originVelocity = this.applySeek(this.seekGoal);
    const wanderVelocity = this.applyWander();
    const collisionVelocity = this.applyCollisionAvoidance();

    const steeringForce = new Vector3(0, 0, 0);
    steeringForce.add(separationVelocity);
    steeringForce.add(alignmentVelocity);
    steeringForce.add(cohesionVelocity);
    steeringForce.add(originVelocity);
    steeringForce.add(wanderVelocity);
    steeringForce.add(collisionVelocity);

    steeringForce.multiplyScalar(this.acceleration * timeInSeconds);

    if (steeringForce.length > this.maxSteeringForce) {
      steeringForce.normalize();
      steeringForce.multiplyScalar(this.maxSteeringForce);
    }

    this.velocity.add(steeringForce);
    if (this.velocity.length > this.maxSpeed) {
      this.velocity.normalize();
      this.velocity.multiplyScalar(this.maxSpeed);
    }

    this.direction = this.velocity.clone();
    this.direction.normalize();
  }

  destroyStarship(starship) {
    this.game.explosionSystem.splode(starship.Position);
    this.createExplosionSoundEffect(starship);
  }

  createExplosionSoundEffect(starship) {
    const sound = new PositionalAudio(this.game.gameAudio.explosionListener);

    if(this.game.gameAudio.explosionBuffer) {
      sound.setBuffer(this.game.gameAudio.explosionBuffer);
      sound.setRefDistance(10);
      sound.setVolume(0.8);
      sound.offset = 4;
      sound.play();
    }
    
    starship.mesh.add(sound);
  }
  
  createBlasterSoundEffect(starship) {
    const sound = new PositionalAudio(this.game.gameAudio.blasterListener);

    if(this.game.gameAudio.blasterBuffer) {
      sound.setBuffer(this.game.gameAudio.blasterBuffer);
      sound.setRefDistance(10);
      sound.setVolume(0.8);
      sound.offset = 3;
      sound.duration = 1;
      sound.play();
    }
    
    starship.mesh.add(sound);
  }

  applySeparation(local) {
    if (local.length === 0) {
      return new Vector3(0,0,0);
    }

    const forceVector = new Vector3(0,0,0);
    for (let e of local) {
      const distanceToEntity = Math.max(
        e.Position.distanceTo(this.Position) - 1.5 * (this.Radius + e.Radius),
        0.001
      );
      const directionFromEntity = new Vector3().subVectors(
        this.Position, e.Position
      );
      const multiplier = (BOID_FORCE_SEPARATION / distanceToEntity);
      directionFromEntity.normalize();
      forceVector.add(directionFromEntity.multiplyScalar(multiplier));
    }
    return forceVector;
  }

  applyAlignment(allies) {
    const forceVector = new Vector3(0,0,0);
    for (let e of allies) {
      const entityDirection = e.Direction;
      forceVector.add(entityDirection);
    }
    
    forceVector.normalize();
    forceVector.multiplyScalar(BOID_FORCE_ALIGNMENT);
    
    return forceVector;
  }

  applyCohesion(allies) {
    const forceVector = new Vector3(0,0,0);
    for (let e of allies) {
      const entityDirection = e.Direction;
      forceVector.add(entityDirection);
    }
    
    forceVector.normalize();
    forceVector.multiplyScalar(BOID_FORCE_COHESION);
    
    return forceVector;
  }

  applySeek(destination) {
    const distance = Math.max(0,((this.Position.distanceTo(destination) - 50) / 500)) ** 2;
    const direction = destination.clone().sub(this.Position);
    direction.normalize();

    const forceVector = direction.multiplyScalar(BOID_FORCE_ORIGIN * distance);
    return forceVector;
  }

  applyWander() {
    this.wanderAngle += 0.1 * math.rand_range(-2 * Math.PI, 2 * Math.PI);
    const randomPointOnCircle = new Vector3(
      Math.cos(this.wanderAngle),
      0,
      Math.sin(this.wanderAngle)
    );
    const pointAhead = this.direction.clone();
    pointAhead.multiplyScalar(5);
    pointAhead.add(randomPointOnCircle);
    pointAhead.normalize();
    
    return pointAhead.multiplyScalar(BOID_FORCE_WANDER);
  }

  applyCollisionAvoidance() {
    const colliders = this.game.visibilityGrid.getGlobalItems();

    const ray = new Ray(this.Position, this.Direction);
    const force = new Vector3(0,0,0);

    for (const c of colliders) {
      if (c.Position.distanceTo(this.Position) > c.QuickRadius) {
        continue;
      }

      const result = ray.intersectBox(c.AABB, new Vector3());
      if (result) {
        const distanceToCollision = result.distanceTo(this.Position);
        if (distanceToCollision < 2) {
          // let a = 0;
          
        }
        const dirToCenter = c.Position.clone().sub(this.Position).normalize();
        const dirToCollision = result.clone().sub(this.Position).normalize();
        const steeringDirection = dirToCollision.sub(dirToCenter).normalize();
        steeringDirection.multiplyScalar(BOID_FORCE_COLLISION);
        force.add(steeringDirection);
      }
    }

    return force;
  }

}

export default SpaceBoid;