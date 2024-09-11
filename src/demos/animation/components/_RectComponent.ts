import * as Cluster from "../../../cluster";

interface RectOptions {
  width: number;
  height: number;
  radius?: number;
  stroke?: string;
  fill?: string;
}

/** Rect component
 * @tag Rect
 * @options width, height, stroke, fill, radius
 * @properties width, height, stroke, fill, radius
 */
class RectComponent extends Cluster.Component {
  width: number;
  height: number;
  radius: number;
  stroke: string;
  fill: string;

  constructor({ width, height, radius, stroke, fill }: RectOptions) {
    super("Rect");
    this.width = width;
    this.height = height;
    this.radius = radius || 0;
    this.stroke = stroke || "black";
    this.fill = fill || "black";
  }
}

export { RectComponent };
