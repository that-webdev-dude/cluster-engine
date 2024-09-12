import * as Cluster from "../../../cluster";

interface SpriteOptions {
  image: HTMLImageElement;
  frame?: number;
  width?: number;
  height?: number;
  animations?: {
    name: string;
    frames: { x: number; y: number }[];
    rate: number;
  }[];
}

/** Sprite component
 * the sprite component is used to store the sprite data of an entity
 * @tag Sprite
 * @options image, frame, width, height, animations
 * @properties image, frame, width, height, animations
 */
class SpriteComponent extends Cluster.Component {
  image: HTMLImageElement;
  frame: number;
  width: number;
  height: number;
  animations: Map<string, Cluster.AnimationItem>;
  currentAnimationName: string;

  constructor({ image, frame, width, height, animations }: SpriteOptions) {
    super("Sprite");
    this.image = image;
    this.frame = frame || 0;
    this.width = width || this.image.width;
    this.height = height || this.image.height;

    this.animations = new Map();
    this.currentAnimationName = "";
    if (animations && animations.length) {
      animations.forEach(({ name, frames, rate }) => {
        this.animations.set(name, new Cluster.AnimationItem(frames, rate));
      });
      this.currentAnimationName = animations[0].name;
    }
  }

  indexToCoords(index: number) {
    const cols = this.image.width / this.width;
    const x = (index % cols) * this.width;
    const y = Math.floor(index / cols) * this.height;
    return { x, y };
  }

  matrixToIndex(row: number, col: number) {
    return col * (this.image.width / this.width) + row;
  }
}

export { SpriteComponent };
