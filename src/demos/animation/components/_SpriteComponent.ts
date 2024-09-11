import * as Cluster from "../../../cluster";

interface SpriteOptions {
  image: HTMLImageElement;
  frame?: number;
  width?: number;
  height?: number;
}

/** Sprite component
 * the sprite component is used to store the sprite data of an entity
 * @tag Sprite
 * @options image, frame, width, height
 * @properties image, frame, width, height
 */
class SpriteComponent extends Cluster.Component {
  image: HTMLImageElement;
  frame: number;
  width: number;
  height: number;

  constructor({ image, frame, width, height }: SpriteOptions) {
    super("Sprite");
    this.image = image;
    this.frame = frame || 0;
    this.width = width || this.image.width;
    this.height = height || this.image.height;
  }

  get indexToCoords() {
    const cols = this.image.width / this.width;
    const x = (this.frame % cols) * this.width;
    const y = Math.floor(this.frame / cols) * this.height;
    return { x, y };
  }

  get coordsToIndex() {
    const cols = this.image.width / this.width;
    const row = Math.floor(this.frame / cols);
    const col = this.frame % cols;
    return { row, col };
  }
}

export { SpriteComponent };
