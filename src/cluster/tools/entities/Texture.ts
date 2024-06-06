import { Entity } from "../../core/Entity";
import { Vector } from "../Vector";
import { Image } from "../components/Image";
import { Alpha } from "../components/Alpha";
import { Transform } from "../components/Transform";
import { Visibility } from "../components/Visibility";

type TextureOptions = Partial<{
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  alpha: number;
  visible: boolean;
  imageURL: string;
}>;

const defaults = {
  position: new Vector(0, 0),
  anchor: new Vector(),
  scale: new Vector(1, 1),
  pivot: new Vector(),
  angle: 0,
  alpha: 1,
  visible: true,
  imageURL: "",
};

export class Texture extends Entity {
  constructor(options: TextureOptions) {
    super();

    const { position, anchor, scale, pivot, angle, alpha, visible, imageURL } =
      { ...defaults, ...options };

    this.attach(new Transform(this.id, position, anchor, scale, pivot, angle));
    this.attach(new Alpha(this.id, alpha));
    this.attach(new Image(this.id, imageURL));
    this.attach(new Visibility(this.id, visible));
  }
}
