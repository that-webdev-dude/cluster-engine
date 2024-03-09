import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

export class Text extends Entity implements Cluster.TextType {
  public text: string;
  constructor(options: Cluster.TextOptions) {
    const { text = "text", ...optionals } = options;
    super(Cluster.EntityTag.TEXT, optionals as Cluster.EntityOptions);
    this.text = text;
  }
}
