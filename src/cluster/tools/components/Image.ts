import { Assets } from "../../core/Assets";
import { Component } from "../../core/Component";

export class Image extends Component {
  image: HTMLImageElement;
  constructor(entity: string, imageURL: string) {
    super(entity);
    this.image = Assets.image(imageURL);
  }
}
