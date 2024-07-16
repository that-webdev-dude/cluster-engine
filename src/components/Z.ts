import { Component } from "../cluster";
import { Vector } from "../cluster";

// Component errors
enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {}

// Transform Component
export class Template implements Component {
  // ...

  constructor({}: ComponentOptions = {}) {}
}
