import { Vector } from "../tools/Vector";
import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

/**
 * Temporary OffscreenCanvas context to measure text width and height
 */
const context = new OffscreenCanvas(1, 1).getContext("2d");

/**
 * extract the text metrics from a canvas context
 * @param text the text to measure
 * @param style the style of the text
 * @returns the text metrics
 */
const getTextMetrics = (text: string, style: Cluster.TextStyle) => {
  if (context) {
    context.font = style.font as string;
    const metrics = context.measureText(text);
    return metrics;
  }
  return null;
};

/**
 * measures the width of a text
 * @param text the text to measure
 * @param style the style of the text
 * @returns the width of the text
 */
const textWidth = (text: string, style: Cluster.TextStyle) => {
  const metrics = getTextMetrics(text, style);
  return metrics ? metrics.width : 0;
};

/**
 * measures the height of a text
 * @param text the text to measure
 * @param style the style of the text
 * @returns the height of the text
 */
const textHeight = (text: string, style: Cluster.TextStyle) => {
  const metrics = getTextMetrics(text, style);
  return metrics
    ? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    : 0;
};

// implementation of a Text Entity class
export class Text
  extends Entity
  implements Cluster.EntityType<Cluster.TextOptions>
{
  readonly tag = Cluster.EntityTag.TEXT; // Discriminant property
  text: string;
  style: Cluster.TextStyle;

  constructor(options: Cluster.TextOptions) {
    super(Cluster.EntityTag.TEXT, options);
    this.text = options.text;
    this.style = options.style || {};
  }

  // TODO
  // need to measure the text width and height
  get width() {
    return textWidth(this.text, this.style);
  }

  // TODO
  // need to measure the text width and height
  get height() {
    return textHeight(this.text, this.style);
  }

  // TODO
  // need to measure the text width and height
  get center() {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  // TODO
  // need to measure the text width and height
  get boundingBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
}
