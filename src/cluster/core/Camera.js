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
   * @param {Object} viewport the size of the camera screen { width, height }
   * @param {} worldSize the size of the game world { width, height }
   * @param {Object} tracker the size of the tracker box { width, height }
   */
  constructor(subject, viewport, worldSize = viewport, tracker = { width: 96, height: 96 }) {
    super();
    this.position = new Vector();
    this.offset = { x: 0, y: 0 };
    this.height = viewport.height;
    this.width = viewport.width;
    this.subject = null;
    this.tracker = tracker;
    this.worldSize = worldSize;

    // EFFECT: EASING
    this.easing = 0.03;

    // EFFECT: SHAKE
    this.shakePower = 0;
    this.shakeDecay = 0;
    this.shakeLast = new Vector();

    // EFFECT: FLASH
    this.flashDuration = 0;
    this.flashTime = 0;
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

  // EFFECT: FLASH
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

  focus(track = true) {
    const { position, width, height, offset, worldSize, subject, easing, tracker } = this;
    const centeredX = subject.position.x + offset.x - width / 2;
    const maxX = worldSize.width - width;
    let x = -math.clamp(centeredX, 0, maxX);
    // const x =
    //   Math.abs(centeredX + position.x) < tracker.width
    //     ? position.x
    //     : -math.clamp(centeredX, 0, maxX);

    const centeredY = subject.position.y + offset.y - height / 2;
    const maxY = worldSize.height - height;
    let y = -math.clamp(centeredY, 0, maxY);
    // const y =
    //   Math.abs(centeredY + position.y) < tracker.height
    //     ? position.y
    //     : -math.clamp(centeredY, 0, maxY);

    if (track) {
      if (Math.abs(centeredX + position.x) < tracker.width) x = position.x;
      if (Math.abs(centeredY + position.y) < tracker.height) y = position.y;
    }

    position.x = math.mix(position.x, x, easing);
    position.y = math.mix(position.y, y, easing);
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
