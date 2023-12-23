import { Circle, Vector } from "../ares";

interface IStarConfig {
  fill: string;
  size: number;
  alpha: number;
  speed: Vector;
  position: Vector;
}

class Star extends Circle {
  public size: number;
  public speed: Vector;

  constructor({
    fill = "white",
    size = 4,
    alpha = 1,
    speed = new Vector(),
    position = new Vector(),
    ...config
  }: IStarConfig) {
    super({
      radius: size / 2,
      alpha,
      fill,
      position,
    });
    this.size = size;
    this.speed = speed;
  }

  update(dt: number, t: number) {
    this.position.x += this.speed.x * dt;
    this.position.y += this.speed.y * dt;
  }
}

export default Star;
