import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

export class Text extends Entity implements Cluster.TextType {
  public text: string;
  public style: Cluster.TextStyle;

  constructor(options: Cluster.TextOptions) {
    const { text = "text", style = {}, ...optionals } = options;
    super(Cluster.EntityTag.TEXT, optionals as Cluster.EntityOptions);
    this.text = text;
    this.style = style;
  }
}
