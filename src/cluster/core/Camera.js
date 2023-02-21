import math from "../utils/math";
import Vector from "../utils/Vector";
import Container from "./Container";
import Rect from "../shapes/Rect";

class Camera extends Container {
  /**
   * Container of all the "filmable" game elements.
   * All of the game items (except the UI components).
   * @constructor
   * @param {*} subject what the camera should follow
   * @param {Object} viewport the size of the camera screen { ..., width, height }
   * @param {} worldSize the size of the game world { ..., width, height }
   */
  constructor(subject, viewport, worldSize = viewport) {
    super();
    this.position = new Vector();
    this.offset = { x: 0, y: 0 };
    this.height = viewport.height;
    this.width = viewport.width;
    this.subject = null;
    this.worldSize = worldSize;

    // EFFECT: SHAKE
    this.shakePower = 0;
    this.shakeDecay = 0;
    this.shakeLast = new Vector();

    // EFFECT: FLASH
    this.flashTime = 0;
    this.flashDuration = 0;
    this.flashRect = null;

    this.setSubject(subject);
  }

  // EFFECT: SHAKE
  shake(power = 8, length = 0.5) {
    this.shakePower = power;
    this.shakeDecay = power / length;
  }

  // EFFECT: SHAKE
  _shake(dt) {
    const { position, shakePower, shakeLast } = this;
    if (shakePower <= 0) {
      return;
    }
    // do shake!
    // prettier-ignore
    shakeLast.set(
      math.randf(-shakePower, shakePower), 
      math.randf(-shakePower, shakePower)
    );

    position.add(shakeLast);
    this.shakePower -= this.shakeDecay * dt;
  }

  // EFFECT: SHAKE
  _unshake() {
    const { position, shakeLast } = this;
    position.subtract(shakeLast);
  }

  // EFFECT: FLASH
  flash(duration = 0.5, color = "white") {
    if (!this.flashRect) {
      const { width, height } = this;
      this.flashRect = this.add(
        new Rect({
          width,
          height,
          style: { fill: color },
        })
      );
    }
    this.flashTime = duration;
    this.flashDuration = duration;
  }

  _flash(dt) {
    const { flashRect, flashDuration, position } = this;
    if (!flashRect) return;
    const time = (this.flashTime -= dt);
    if (time <= 0) {
      this.remove(flashRect);
      this.flashRect = null;
    } else {
      flashRect.alpha = time / flashDuration;
      flashRect.position = Vector.from(position).multiply(-1);
    }
  }

  setSubject(entity) {
    this.subject = entity && entity.position ? entity : this.position;
    this.offset = { x: 0, y: 0 };
    if (entity && entity.width) {
      this.offset.y += entity.height / 2;
      this.offset.x += entity.width / 2;
    }
    if (entity && entity.anchor) {
      this.offset.x -= entity.anchor.x;
      this.offset.y -= entity.anchor.y;
    }
  }

  focus() {
    const { position, width, height, offset, worldSize, subject } = this;
    const centeredX = subject.position.x + offset.x - width / 2;
    const maxX = worldSize.width - width;
    const x = -math.clamp(centeredX, 0, maxX);

    const centeredY = subject.position.y + offset.y - height / 2;
    const maxY = worldSize.height - height;
    const y = -math.clamp(centeredY, 0, maxY);

    position.x = x;
    position.y = y;
  }

  update(dt, t) {
    this._unshake();
    super.update(dt, t);
    if (this.subject) {
      this.focus();
    }
    this._shake(dt);
    this._flash(dt);
  }
}

export default Camera;
