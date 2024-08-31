import * as Cluster from "../../../cluster";

interface TextOptions {
  text: string;
  font?: string;
  fill?: string;
  stroke?: string;
  align?: CanvasTextAlign;
}

/** Text component
 * @tag Text
 * @options text, font, fill, stroke, align
 * @properties text, font, fill, stroke, align
 */
class TextComponent extends Cluster.Component {
  text: string;
  font: string;
  fill: string;
  stroke: string;
  align: CanvasTextAlign;

  constructor({ text, font, fill, stroke, align }: TextOptions) {
    super("Text");
    this.text = text;
    this.font = font || "16px Arial";
    this.fill = fill || "black";
    this.stroke = stroke || "black";
    this.align = align || "center";
  }
}

export { TextComponent };
