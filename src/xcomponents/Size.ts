import { Component } from "../cluster";

export class Size extends Component {
  width: number;
  height: number;
  constructor(entity: string, width: number = 32, height: number = 32) {
    super(entity);
    this.width = width;
    this.height = height;
  }
}
