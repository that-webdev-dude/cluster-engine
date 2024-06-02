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

export class TextStyle extends Component {
  font: string;
  fill: string;
  stroke: string;
  constructor(
    id: string,
    font: string = '"Press Start 2P"',
    fill: string = "black",
    stroke: string = "black"
  ) {
    super(id);
    this.font = font;
    this.fill = fill;
    this.stroke = stroke;
  }
}
