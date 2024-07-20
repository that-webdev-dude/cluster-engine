import { Component } from "../cluster";

// Component errors
enum ComponentErrors {
  rangeError = "[Fade] Duration must be greater than 0.",
}

// Component behaviors
type EasingBehavior = "easeIn" | "easeOut" | "easeInOut";

// Interface for component properties
export interface ComponentOptions {
  duration?: number;
  easing?: EasingBehavior;
  loop?: boolean;
}

// Component
export class Fade implements Component {
  elapsedTime: number = 0;
  complete: boolean = false;
  duration: number;
  easing: EasingBehavior;
  loop: boolean;

  constructor({
    duration = 1,
    easing = "easeIn",
    loop = false,
  }: ComponentOptions = {}) {
    if (duration <= 0) throw new RangeError(ComponentErrors.rangeError);

    this.duration = duration;
    this.easing = easing;
    this.loop = loop;
  }
}
