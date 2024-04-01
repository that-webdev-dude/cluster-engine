import { Vector } from "../tools/Vector";
import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

export class Rect
  extends Entity
  implements Cluster.EntityType<Cluster.RectOptions>
{
  // // Rect utilities
  // /**
  //  * expands the Rect by the given amount and returns a new expanded Rect
  //  * @param rect
  //  * @param amountX
  //  * @param amountY
  //  * @returns
  //  */
  // static expand(rect: Rect, amountX: number, amountY: number) {
  //   return new Rect({
  //     position: new Vector(
  //       rect.position.x - amountX / 2,
  //       rect.position.y - amountY / 2
  //     ),
  //     width: rect.width + amountX,
  //     height: rect.height + amountY,
  //     hitbox: {
  //       x: rect.hitbox.x,
  //       y: rect.hitbox.y,
  //       width: rect.hitbox.width + amountX,
  //       height: rect.hitbox.height + amountY,
  //     },
  //   });
  // }

  // /**
  //  * shrinks the Rect by the given amount and returns a new shrunken Rect
  //  * @param rect
  //  * @param amountX
  //  * @param amountY
  //  * @returns
  //  */
  // static shrink(rect: Rect, amountX: number, amountY: number) {
  //   return new Rect({
  //     position: new Vector(
  //       rect.position.x + amountX / 2,
  //       rect.position.y + amountY / 2
  //     ),
  //     width: rect.width - amountX,
  //     height: rect.height - amountY,
  //     hitbox: {
  //       x: rect.hitbox.x,
  //       y: rect.hitbox.y,
  //       width: rect.hitbox.width - amountX,
  //       height: rect.hitbox.height - amountY,
  //     },
  //   });
  // }

  readonly tag = Cluster.EntityTag.RECT; // Discriminant property
  public hitbox: Cluster.Box;
  public height: number;
  public width: number;
  public style: Cluster.ShapeStyle;

  constructor(options: Cluster.RectOptions) {
    super(Cluster.EntityTag.RECT, options);
    this.height = options.height;
    this.width = options.width;
    this.style = options.style || {};

    // hitbox
    this.hitbox = options.hitbox || {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  get center() {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  get boundingBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
}
