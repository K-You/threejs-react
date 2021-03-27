import { Vector3 } from 'three';

class ThirdPersonCamera {

  constructor({ target, camera }) {
    this.camera = camera;
    this.target = target;

    this.currentPosition = new Vector3();
    this.currentLookAt = new Vector3();
  }

  calculateIdealOffset() {
    const idealOffset = new Vector3(0, -20, -10);
    idealOffset.applyQuaternion(this.target.Rotation);
    idealOffset.add(this.target.Position);
    return idealOffset;
  }

  calculateIdealLookat() {
    const idealLookat = new Vector3(10, 20, 0);
    idealLookat.applyQuaternion(this.target.Rotation);
    idealLookat.add(this.target.Position);
    return idealLookat;
  }

  update(timeInSeconds) {
    const idealOffset = this.calculateIdealOffset();
    const idealLookAt = this.calculateIdealLookat();

    const t = 1.0 - Math.pow(0.001, timeInSeconds);

    this.currentPosition.lerp(idealOffset, t);
    this.currentLookAt.lerp(idealLookAt, t);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }


}


export default ThirdPersonCamera;