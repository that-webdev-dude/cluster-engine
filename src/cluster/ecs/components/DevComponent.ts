import { Component } from "../../core/Component";
import { Entity } from "../../core/Entity";
import { Vector } from "../../tools/Vector";
import { Components } from "..";
import { SpeedComponent } from "./SpeedComponent";

interface DevOptions {
  interval: number;
  entities: Entity[];
}

export class DevComponent implements Component {
  constructor(options: DevOptions) {}
}
