import { Component } from "../cluster";

export class Message extends Component {
  text: string;
  constructor(entity: string, text: string = "") {
    super(entity);
    this.text = text;
  }
}
