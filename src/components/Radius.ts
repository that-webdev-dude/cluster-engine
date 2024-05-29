import { Component } from "../cluster";

export class Radius extends Component {
  radius: number;
  constructor(entity: string, radius: number = 16) {
    super(entity);
    this.radius = radius;
  }
}
