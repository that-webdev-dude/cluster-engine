import { Entity, Vector } from "../cluster";
import { Size } from "../xcomponents/Size";
import { Transform } from "../xcomponents/Transform";
import { ShapeStyle } from "../xcomponents/Style";

type RectOptions = Partial<{
  position: Vector;
  width: number;
  height: number;
  style: Partial<{
    fill: string;
    stroke: string;
  }>;
}>;

const defaults = {
  position: new Vector(),
  width: 32,
  height: 32,
  style: {
    fill: "red",
    stroke: "transparent",
  },
};

export class Rect extends Entity {
  constructor(options: RectOptions = {}) {
    super();
    const { position, width, height, style } = { ...defaults, ...options };
    const { fill, stroke } = style;
    this.attach(new Size(this.id, width, height));
    this.attach(new Transform(this.id, position));
    this.attach(new ShapeStyle(this.id, fill, stroke));
  }
}
