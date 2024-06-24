import { Component } from "../../core/Component";

// Interface for component properties
export interface StatusOptions {
  dead: boolean;
}

// Status Component
export class StatusComponent implements Component {
  dead: boolean;

  constructor({ dead }: StatusOptions) {
    this.dead = dead;
  }
}
