import { Container } from "../core/Container";
import { Entity } from "../core/Entity";
import { Line } from "../entities/Line";
import { Rect } from "../entities/Rect";
import { Text } from "../entities/Text";
import { Vector } from "./Vector";
import { Cmath } from "./Cmath";

// debugger
type Debuggable = (Line | Rect | Text) & {
  update?: (dt: number, t: number) => void;
};
export class Debugger extends Container {
  private static loggerCursor = 32;

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

  showRectHitbox(rect: Rect) {
    const dbRect = new Rect({
      position: new Vector(),
      width: rect.hitbox.width,
      height: rect.hitbox.height,
      style: {
        fill: "red",
        stroke: "reansparent",
      },
      alpha: 0.5,
    }) as Debuggable;
    dbRect.update = (dt, t) => {
      if (dbRect instanceof Rect) {
        dbRect.position.set(
          rect.position.x + rect.hitbox.x,
          rect.position.y + rect.hitbox.y
        );
      }
    };
    this.add(dbRect);
  }

  // logs
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

  LogMessage(message: string, fill: string = "white") {
    const dbText = new Text({
      position: new Vector(10, (Debugger.loggerCursor += 16)),
      text: message,
      style: {
        fill: fill,
        font: "12px sans-serif",
        align: "left",
      },
    }) as Debuggable;
    this.add(dbText);
  }

  LogMultiLineMessage(message: string, fill: string = "white") {
    const dbText = new Text({
      position: new Vector(10, (Debugger.loggerCursor += 16)),
      text: message,
      style: {
        fill: fill,
        font: "12px sans-serif",
        align: "left",
      },
    }) as Debuggable;
    this.add(dbText);
  }

  // dummy level utilities
  Level = class {
    private static container: Container;

    private static getRect: (width: number, height: number) => Rect = (
      width,
      height
    ) =>
      new Rect({
        position: new Vector(0, 0),
        width: width,
        height: height,
        style: {
          fill: "transparent",
          stroke: "white",
        },
      });

    private static createFloorOfTargets() {
      let size = 32;
      let width = Cmath.rand(3, 10) * size;
      let x = Cmath.rand(1, 20) * size;
      let y = Cmath.rand(1, 16) * size;
      for (let i = 0; i < width / size; i++) {
        let target = this.getRect(size, size);
        target.position.set(x + i * size, y);
        this.container.add(target);
      }
      return this;
    }

    private static createWallOfTargets() {
      let size = 32;
      let height = Cmath.rand(3, 10) * size;
      let x = Cmath.rand(1, 20) * size;
      let y = Cmath.rand(1, 16) * size;
      for (let i = 0; i < height / size; i++) {
        let target = this.getRect(size, size);
        target.position.set(x, y + i * size);
        this.container.add(target);
      }
      return this;
    }

    private static createRandomTargets() {
      let size = 32;
      let n = Cmath.rand(1, 10);
      for (let i = 0; i < n; i++) {
        let target = this.getRect(size, size);
        target.position.set(Cmath.rand(1, 20) * size, Cmath.rand(1, 10) * size);
        this.container.add(target);
      }
      return this;
    }

    static create(container: Container): Container {
      this.container = container;
      let nWalls = Cmath.rand(1, 5);
      let nFloors = Cmath.rand(1, 8);
      for (let i = 0; i < nWalls; i++) {
        this.createWallOfTargets();
      }
      for (let i = 0; i < nFloors; i++) {
        this.createFloorOfTargets();
      }
      this.createRandomTargets();
      return container;
    }
  };
}
