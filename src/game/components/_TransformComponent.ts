import * as Cluster from "../../cluster";

interface TransformOptions {
  boundary?: "contain" | "wrap" | "bounce" | "die" | "stop" | "sleep" | "none";
  position?: Cluster.Vector;
  anchor?: Cluster.Vector;
  scale?: Cluster.Vector;
  pivot?: Cluster.Vector;
  angle?: number;
}

/** Transform component
 * @tag Transform
 * @options position, anchor, scale, pivot, angle (degrees), boundary
 * @options position, anchor, scale, pivot, angle (degrees), boundary
 * @boundary contain, wrap, bounce, die, stop, none
 */
class TransformComponent extends Cluster.Component {
  boundary: "contain" | "wrap" | "bounce" | "die" | "stop" | "sleep" | "none";
  position: Cluster.Vector;
  anchor: Cluster.Vector;
  scale: Cluster.Vector;
  pivot: Cluster.Vector;
  angle: number;

  constructor({
    boundary = "none",
    position = new Cluster.Vector(0, 0),
    anchor = new Cluster.Vector(0, 0),
    scale = new Cluster.Vector(1, 1),
    pivot = new Cluster.Vector(0, 0),
    angle = 0,
  }: TransformOptions = {}) {
    super("Transform");
    this.boundary = boundary;
    this.position = Cluster.Vector.from(position);
    this.anchor = Cluster.Vector.from(anchor);
    this.scale = Cluster.Vector.from(scale);
    this.pivot = Cluster.Vector.from(pivot);
    this.angle = angle;
  }
}

export { TransformComponent };
