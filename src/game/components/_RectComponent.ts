import * as Cluster from "../../cluster";

interface RectOptions {
  width: number;
  height: number;
  stroke?: string;
  fill?: string;
}

/** Rect component
 * @tag Rect
 * @options width, height, stroke, fill
 * @properties width, height, stroke, fill
 */
class RectComponent extends Cluster.Component {
  width: number;
  height: number;
  stroke: string;
  fill: string;

  constructor({ width, height, stroke, fill }: RectOptions) {
    super("Rect");
    this.width = width;
    this.height = height;
    this.stroke = stroke || "black";
    this.fill = fill || "black";
  }
}

export { RectComponent };
