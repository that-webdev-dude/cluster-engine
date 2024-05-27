import { Entity } from "../x";
import { Size } from "../xcomponents/Size";
import { Transform } from "../xcomponents/Transform";
import { ShapeStyle } from "../xcomponents/Style";

export class Rect extends Entity {
  constructor() {
    super();
    this.attach(new Size(this.id));
    this.attach(new Transform(this.id));
    this.attach(new ShapeStyle(this.id));
  }
}
