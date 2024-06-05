import { Component } from "../../core/Component";

export class Message extends Component {
  text: string;
  constructor(entity: string, text: string = "") {
    super(entity);
    this.text = text;
  }
}
