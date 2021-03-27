import { Quaternion, Vector3 } from 'three';

class BasicCharacterControls {

  constructor(params) {
    this.init(params);
  }


  init(params){
    this.params = params;
    this.move = {
      forward : false,
      backward : false,
      left : false,
      right : false,
    }
    this.deceleration = new Vector3(-0.0005, -0.001, -5.0);
    this.acceleration = new Vector3(1, 0.25, 50.0);
    this.velocity = new Vector3(0,0,0);

    document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
  }

  onKeyDown(event) {
    switch(event.keyCode){
      case 87: // w
        this.move.forward = true;
        break;
      case 65: // a
        this.move.left = true;
        break;
      case 83:// s
        this.move.backward = true;
        break;
      case 68: // d
        this.move.right = true;
        break;
      default:
        break;
    }
  }

  onKeyUp(event) {
    switch(event.keyCode){
      case 87: // w
        this.move.forward = false;
        break;
      case 65: // a
        this.move.left = false;
        break;
      case 83:// s
        this.move.backward = false;
        break;
      case 68: // d
        this.move.right = false;
        break;
      default:
        break;
    }
  }

  update(timeInSeconds) {
    const velocity = this.velocity;
    const frameDeceleration = new Vector3(
      velocity.x * this.deceleration.x,
      velocity.y * this.deceleration.y,
      velocity.z * this.deceleration.z,
    );
    frameDeceleration.multiplyScalar(timeInSeconds);
    frameDeceleration.z = Math.sign(frameDeceleration.z) * Math.min(Math.abs(frameDeceleration.z), Math.abs(velocity.z));

    velocity.add(frameDeceleration);

    const controlObject = this.params.target;
    const Q = new Quaternion();
    const A = new Vector3();
    const R = controlObject.quaternion.clone();

    if(this.move.forward) {
      velocity.z += this.acceleration.z * timeInSeconds;
    }
    if(this.move.backward) {
      velocity.z -= this.acceleration.z * timeInSeconds;
    }


    if (this.move.left) {
      A.set(0, 1, 0);
      Q.setFromAxisAngle(A, 4.0 * Math.PI * timeInSeconds * this.acceleration.y);
      R.multiply(Q);
    }
    if (this.move.right) {
      A.set(0, 1, 0);
      Q.setFromAxisAngle(A, 4.0 * -Math.PI * timeInSeconds * this.acceleration.y);
      R.multiply(Q);
    }

    controlObject.quaternion.copy(R);

    const oldPosition = new Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    oldPosition.copy(controlObject.position);
  }
}

export default BasicCharacterControls;