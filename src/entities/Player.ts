import { Game, Vector, Scene } from "../cluster";
import { Rect } from "../entities/Rect";

export class Player extends Rect {
  constructor() {
    super({
      position: new Vector(400, 400),
      width: 32,
      height: 32,
      style: {
        fill: "lightcoral",
        stroke: "transparent",
      },
    });
  }
}
