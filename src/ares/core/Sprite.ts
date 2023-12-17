import { IEntityConfig } from "./Entity";
import Assets from "./Assets";
import Entity from "./Entity";
import Vector from "../tools/Vector";

type SpriteConfig = IEntityConfig & { textureURL: string };

class Sprite extends Entity {
  image: HTMLImageElement;

  constructor(config: IEntityConfig & { textureURL: string }) {
    const { textureURL, ...superConfig } = config;
    super({ ...superConfig, position: new Vector(0, 0) });
    this.image = Assets.image(textureURL);
  }

  get width(): number {
    return this.image.width * this.scale.x;
  }

  get height(): number {
    return this.image.height * this.scale.y;
  }

  public update(dt: number, t: number): void {
    // do nothing
  }

  public render(context: CanvasRenderingContext2D): void {
    context.drawImage(this.image, 0, 0);
  }
}

export type { SpriteConfig };
export default Sprite;
