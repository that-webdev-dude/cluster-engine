import math from "../utils/math";
import Container from "./Container";

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
    this.position = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.height = viewport.height;
    this.width = viewport.width;
    this.subject = null;
    this.worldSize = worldSize;

    this.setSubject(subject);
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
    super.update(dt, t);
    if (this.subject) {
      this.focus();
    }
  }
}

export default Camera;
