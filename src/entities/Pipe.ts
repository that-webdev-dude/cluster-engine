import { Rect, Vector } from "../cluster";

export class Pipe extends Rect {
  scored: boolean = false;
  constructor(position: Vector, height: number) {
    super({
      position: position,
      velocity: new Vector(-300, 0),
      width: 100,
      height: height,
      style: {
        fill: "transparent",
        stroke: "white",
      },
    });
  }
}
