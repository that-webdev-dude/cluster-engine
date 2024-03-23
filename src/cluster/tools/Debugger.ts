import { Container } from "../core/Container";
import { Entity } from "../core/Entity";
import { Line } from "../entities/Line";
import { Rect } from "../entities/Rect";
import { Text } from "../entities/Text";
import { Vector } from "./Vector";

// debugger
type Debuggable = (Line | Rect | Text) & {
  update?: (dt: number, t: number) => void;
};
export class Debugger extends Container {
  private static loggerCursor = 0;

  showEntityVelocityLine(entity: Entity, scale: number = 1) {
    const dbLine = new Line({
      start: new Vector(),
      end: new Vector(),
      style: {
        stroke: "red",
      },
    }) as Debuggable;
    dbLine.update = (dt, t) => {
      if (dbLine instanceof Line) {
        dbLine.start.set(entity.center.x, entity.center.y);
        dbLine.end.set(
          entity.center.x + entity.velocity.x * scale,
          entity.center.y + entity.velocity.y * scale
        );
      }
    };
    this.add(dbLine);
  }

  showEntityAccelerationLine(entity: Entity, scale: number = 1) {
    const dbLine = new Line({
      start: new Vector(),
      end: new Vector(),
      style: {
        stroke: "blue",
      },
    }) as Debuggable;
    dbLine.update = (dt, t) => {
      if (dbLine instanceof Line) {
        dbLine.start.set(entity.center.x, entity.center.y);
        dbLine.end.set(
          entity.center.x + entity.acceleration.x * scale,
          entity.center.y + entity.acceleration.y * scale
        );
      }
    };
    this.add(dbLine);
  }

  logEntityVelocity(entity: Entity) {
    const dbText = new Text({
      position: new Vector(10, (Debugger.loggerCursor += 20)),
      text: `vx: 0 vy: 0`,
      style: {
        fill: "white",
        font: "12px sans-serif",
        align: "left",
      },
    }) as Debuggable;
    dbText.update = (dt, t) => {
      if (dbText instanceof Text) {
        dbText.text = `vx: ${entity.velocity.x.toFixed(
          2
        )} vy: ${entity.velocity.y.toFixed(2)}`;
      }
    };
    this.add(dbText);
  }

  logEntityAcceleration(entity: Entity) {
    const dbText = new Text({
      position: new Vector(10, (Debugger.loggerCursor += 20)),
      text: `ax: 0 ay: 0`,
      style: {
        fill: "white",
        font: "12px sans-serif",
        align: "left",
      },
    }) as Debuggable;
    dbText.update = (dt, t) => {
      if (dbText instanceof Text) {
        dbText.text = `ax: ${entity.acceleration.x.toFixed(
          2
        )} ay: ${entity.acceleration.y.toFixed(2)}`;
      }
    };
    this.add(dbText);
  }
}
