import { Container } from "../core/Container";
import { Entity } from "../core/Entity";
import { Line } from "../entities/Line";
import { Rect } from "../entities/Rect";
import { Text } from "../entities/Text";
import { Sprite } from "../entities/Sprite";
import { Vector } from "./Vector";
import { Cmath } from "./Cmath";

type Updateable = {
  update?: (dt: number, t: number) => void;
};
type UpdateableText = Text & Updateable;
class EntityLogger {
  private static textFontSize: number = 14;
  private static textFont: string = "Courier New"; // "Courier New";
  private static textFill: string = "LightGreen";
  private static textAlign: CanvasTextAlign = "left";
  private static cursorStep: number = 24;
  private static cursor: Vector = new Vector(48, 32);
  private static container: Container = new Container();

  private static createText(
    position: Vector,
    message?: string
  ): UpdateableText {
    return new Text({
      position: position,
      text: message || "",
      style: {
        fill: EntityLogger.textFill,
        font: `${EntityLogger.textFontSize}px ${EntityLogger.textFont}`,
        align: EntityLogger.textAlign,
      },
    }) as UpdateableText;
  }

  static logEntityPosition(entity: Entity) {
    const text = EntityLogger.createText(
      new Vector(EntityLogger.cursor.x, EntityLogger.cursor.y)
    );
    text.update = (dt, t) => {
      text.text = `px: ${entity.position.x.toFixed(
        2
      )} py: ${entity.position.y.toFixed(2)}`;
    };
    EntityLogger.cursor.y += EntityLogger.cursorStep;
    return text;
  }

  static logEntityVelocity(entity: Entity) {
    const text = EntityLogger.createText(
      new Vector(EntityLogger.cursor.x, EntityLogger.cursor.y)
    );
    text.update = (dt, t) => {
      text.text = `vx: ${entity.velocity.x.toFixed(
        2
      )} vy: ${entity.velocity.y.toFixed(2)}`;
    };
    EntityLogger.cursor.y += EntityLogger.cursorStep;
    return text;
  }

  static logEntityAcceleration(entity: Entity) {
    const text = EntityLogger.createText(
      new Vector(EntityLogger.cursor.x, EntityLogger.cursor.y)
    );
    text.update = (dt, t) => {
      text.text = `ax: ${entity.acceleration.x.toFixed(
        2
      )} ay: ${entity.acceleration.y.toFixed(2)}`;
    };
    EntityLogger.cursor.y += EntityLogger.cursorStep;
    return text;
  }

  static LogEntityDirection(entity: Entity) {
    const text = EntityLogger.createText(
      new Vector(EntityLogger.cursor.x, EntityLogger.cursor.y)
    );
    text.update = (dt, t) => {
      text.text = `dx: ${entity.direction.x.toFixed(
        2
      )} dy: ${entity.direction.y.toFixed(2)}`;
    };
    EntityLogger.cursor.y += EntityLogger.cursorStep;
    return text;
  }

  static logEntitySize(entity: Entity) {
    const text = EntityLogger.createText(
      new Vector(EntityLogger.cursor.x, EntityLogger.cursor.y)
    );
    text.update = (dt, t) => {
      text.text = `w: ${entity.width.toFixed(2)} h: ${entity.height.toFixed(
        2
      )}`;
    };
    EntityLogger.cursor.y += EntityLogger.cursorStep;
    return text;
  }

  static LogEntity(entity: Entity) {
    this.container.add(EntityLogger.logEntitySize(entity));
    this.container.add(EntityLogger.logEntityPosition(entity));
    this.container.add(EntityLogger.logEntityVelocity(entity));
    this.container.add(EntityLogger.logEntityAcceleration(entity));
    this.container.add(EntityLogger.LogEntityDirection(entity));
    return this.container;
  }

  static logMessage(message: string, fill: string = "white") {
    const text = EntityLogger.createText(
      new Vector(EntityLogger.cursor.x, EntityLogger.cursor.y),
      message
    );
    EntityLogger.cursor.y += EntityLogger.cursorStep;
    return text;
  }

  static logMultiLineMessage(message: string, fill: string = "white") {
    const text = EntityLogger.createText(
      new Vector(EntityLogger.cursor.x, EntityLogger.cursor.y),
      message
    );
    EntityLogger.cursor.y += EntityLogger.cursorStep;
    return text;
  }
}

// debugger
type Debuggable = (Line | Rect | Text | Sprite) & Updateable;
export class Debugger extends Container {
  static Logger = EntityLogger;

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
  LogEntityPosition(entity: Entity) {
    this.add(EntityLogger.logEntityPosition(entity));
  }

  logEntityVelocity(entity: Entity) {
    this.add(EntityLogger.logEntityVelocity(entity));
  }

  logEntityAcceleration(entity: Entity) {
    this.add(EntityLogger.logEntityAcceleration(entity));
  }

  LogEntitySize(entity: Entity) {
    this.add(EntityLogger.logEntitySize(entity));
  }

  LogEntity(entity: Entity) {
    this.add(EntityLogger.LogEntity(entity));
  }

  LogMessage(message: string, fill: string = "white"): UpdateableText {
    let messageText = EntityLogger.logMessage(message, fill);
    this.add(messageText);
    return messageText;
  }

  LogMultiLineMessage(message: string, fill: string = "white") {
    this.add(EntityLogger.logMultiLineMessage(message, fill));
  }

  // dummy level utilities
  static Level = class {
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
