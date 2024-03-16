import { Container, Vector, Line, Entity, Rect } from "./cluster";

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
  static showBoundingBox(entity: Entity, scene: Container) {
    scene.add(
      new Rect({
        position: new Vector(entity.boundingBox.x, entity.boundingBox.y),
        width: entity.boundingBox.width,
        height: entity.boundingBox.height,
        style: { fill: "transparent", stroke: "red" },
      })
    );
  }
}
