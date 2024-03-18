import { Cluster } from "./cluster/types/cluster.types";
import { Container, Vector, Entity, Line, Rect, Text } from "./cluster";

/**
 * represents an updateable line
 */
type DebugLine = Line & {
  update?: (dt: Cluster.Milliseconds, t: Cluster.Seconds) => void;
};

/**
 * represents an updateable rect
 */
type DebugRect = Rect & {
  update?: (dt: Cluster.Milliseconds, t: Cluster.Seconds) => void;
};

/**
 * represents an updateable text
 */
type DebugText = Text & {
  update?: (dt: Cluster.Milliseconds, t: Cluster.Seconds) => void;
};

/**
 * Debugger:
 * this class is a collection of methods that are used to debug the game
 */
export class Debugger {
  /**
   * this method is used to show a grid on the scene
   * @param scene the scene to add the grid to
   * @param width the width of the grid, usually the world size
   * @param height the height of the grid, usually the world size
   * @param size the size of the grid cells
   */
  static showGrid(
    scene: Container,
    width: number,
    height: number,
    size: number
  ) {
    for (let i = 0; i < width; i += size) {
      scene.add(
        new Line({
          start: new Vector(i, 0),
          end: new Vector(i, height),
          style: {
            stroke: "grey",
          },
        })
      );
    }
    for (let i = 0; i < height; i += size) {
      scene.add(
        new Line({
          start: new Vector(0, i),
          end: new Vector(width, i),
          style: { stroke: "grey" },
        })
      );
    }
  }

  /**
   * this method is used to show the bounding box of an entity
   * @param entity the entity to show the bounding box of
   * @param scene the scene to add the bounding box to
   */
  static showBoundingBox(entity: Entity, scene: Container, stroke = "green") {
    const rect = new Rect({
      position: new Vector(entity.boundingBox.x, entity.boundingBox.y),
      // velocity: entity.velocity,
      width: entity.boundingBox.width,
      height: entity.boundingBox.height,
      style: {
        stroke,
        fill: "transparent",
      },
    }) as DebugRect;
    rect.update = (dt, t) => {
      rect.position.x = entity.boundingBox.x;
      rect.position.y = entity.boundingBox.y;
      if (entity instanceof Line) {
        rect.width = entity.boundingBox.width;
        rect.height = entity.boundingBox.height;
      }
    };
    scene.add(rect);
  }
}
