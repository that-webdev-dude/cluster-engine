import { Component } from "../../core/Component";
import { Vector } from "../../tools/Vector";

interface HitboxOptions {
  position: Vector;
  size: Vector;
  exclude?: string[];
}

export class HitboxComponent implements Component {
  position: Vector;
  size: Vector;
  exclude: string[] = [];

  constructor(options: HitboxOptions) {
    this.position = options.position;
    this.size = options.size;
    this.exclude = options.exclude || [];
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get width() {
    return this.size.x;
  }

  get height() {
    return this.size.y;
  }
}
