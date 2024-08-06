import { Component } from "../../cluster";
import { Vector } from "../../cluster";

// Component errors
enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {
  speed: number;
  input?: boolean;
  path?: Vector[];
}

// Transform Component
export class KinematicMotion implements Component {
  readonly type = "KinematicMotion";
  public speed: number;
  public input: boolean;
  public path: Vector[];
  public startPosition: Vector;
  public targetPosition: Vector;
  public pathVelocity: Vector;

  constructor({ speed = 0, input = false, path = [] }: ComponentOptions) {
    this.speed = speed;
    this.input = input;

    // to move along a path
    this.path = path;
    this.startPosition = path.length > 2 ? path[0] : new Vector(0, 0);
    this.targetPosition = path.length > 2 ? path[1] : new Vector(0, 0);
    this.pathVelocity = new Vector(0, 0);
  }

  get segmentLength(): number {
    return Vector.subtract(this.targetPosition, this.startPosition).magnitude;
  }

  get segmentDirection(): Vector {
    return Vector.subtract(this.targetPosition, this.startPosition).normalize();
  }

  get segmentVelocity(): Vector {
    return this.segmentDirection.scale(this.speed);
  }
}
