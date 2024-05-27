import { Component } from "../x";

export class Radius extends Component {
  radius: number;
  constructor(entity: string, radius: number = 32) {
    super(entity);
    this.radius = radius;
  }
}
