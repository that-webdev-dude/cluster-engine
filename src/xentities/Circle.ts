import { Entity } from "../x";
import { Radius } from "../xcomponents/Radius";
import { Transform } from "../xcomponents/Transform";
import { ShapeStyle } from "../xcomponents/Style";

export class Circle extends Entity {
  constructor() {
    super();
    this.attach(new Radius(this.id));
    this.attach(new Transform(this.id));
    this.attach(new ShapeStyle(this.id));
  }
}
