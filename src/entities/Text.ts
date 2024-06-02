import { Entity, Vector } from "../cluster";
import { Transform } from "../components/Transform";
import { Message } from "../components/Message";
import { Alpha } from "../components/Alpha";
import { Visibility } from "../components/Visibility";
import { TextStyle } from "../components/Style";

type TextOptions = Partial<{
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  text: string;
  alpha: number;
  visible: boolean;
  style: {
    font: string;
    fill: string;
    stroke: string;
  };
}>;

const defaults = {
  position: new Vector(),
  anchor: new Vector(),
  scale: new Vector(1, 1),
  pivot: new Vector(),
  angle: 0,
  text: "text",
  alpha: 1,
  visible: true,
  style: {
    font: '24px "Press Start 2P"',
    fill: "lightblue",
    stroke: "transparent",
  },
};

export class Text extends Entity {
  constructor(options: TextOptions = {}) {
    super();
    const {
      position,
      anchor,
      scale,
      pivot,
      angle,
      text,
      alpha,
      visible,
      style,
    } = {
      ...defaults,
      ...options,
    };
    const { font, fill, stroke } = style;

    this.attach(new Message(this.id, text));
    this.attach(new Transform(this.id, position, anchor, scale, pivot, angle));
    this.attach(new Alpha(this.id, alpha));
    this.attach(new Visibility(this.id, visible));
    this.attach(new TextStyle(this.id, font, fill, stroke));
  }
}
