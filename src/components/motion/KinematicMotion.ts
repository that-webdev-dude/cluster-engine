import { Component } from "../../cluster";
import { Vector } from "../../cluster";

// Component errors
enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {
  velocityX: number;
  velocityY: number;
  input: boolean;
}

// Transform Component
export class KinematicMotion implements Component {}
