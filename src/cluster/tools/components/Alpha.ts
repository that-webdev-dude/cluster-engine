import { Component } from "../../core/Component";

export class Alpha extends Component {
  alpha: number;
  constructor(entity: string, alpha: number = 1) {
    super(entity);
    this.alpha = alpha;
  }
}
