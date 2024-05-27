import { Component, Vector } from "../x";

export class Transform extends Component {
  position: Vector;
  constructor(entity: string, position: Vector = new Vector()) {
    super(entity);
    this.position = position;
  }
}
