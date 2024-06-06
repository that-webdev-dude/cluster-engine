import { Component } from "../../core/Component";

export class Speed extends Component {
  speed: number;
  constructor(entity: string, speed: number = 0) {
    super(entity);
    this.speed = speed;
  }
}
