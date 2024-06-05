import { Component } from "../../core/Component";

export class Visibility extends Component {
  visible: boolean;
  constructor(entity: string, visible: boolean = true) {
    super(entity);
    this.visible = visible;
  }
}
