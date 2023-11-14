import Vector from "../tools/Vector";
import Container from "./Container";

interface Entity {
  position: Vector;
  height: number;
  width: number;
  dead: boolean;
  update: (dt: number, t: number, parent?: Container) => void;
}

export default Entity;
