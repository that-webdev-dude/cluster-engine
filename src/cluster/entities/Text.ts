import { Vector } from "../tools/Vector";
import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

// implementation of a Text Entity class
export class Text
  extends Entity
  implements Cluster.EntityType<Cluster.TextOptions>
{
  readonly tag = Cluster.EntityTag.TEXT; // Discriminant property
  text: string;
  style: Cluster.TextStyle;

  constructor(options: Cluster.TextOptions) {
    super(Cluster.EntityTag.TEXT, options);
    this.text = options.text;
    this.style = options.style || {};
  }

  // TODO
  // need to measure the text width and height
  get width() {
    return 0;
  }

  // TODO
  // need to measure the text width and height
  get height() {
    return 0;
  }

  // TODO
  // need to measure the text width and height
  get center() {
    return new Vector(0, 0);
  }
}
