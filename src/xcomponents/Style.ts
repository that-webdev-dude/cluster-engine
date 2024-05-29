import { Component } from "../cluster";

export class ShapeStyle extends Component {
  fill: string;
  stroke: string;
  constructor(id: string, fill: string = "black", stroke: string = "black") {
    super(id);
    this.fill = fill;
    this.stroke = stroke;
  }
}
