import Game from "./core/Game";
import Container from "./core/Container";
import Text from "./core/Text";
import { Rect, Circle } from "./core/Shape";

// tools
import Scene from "./tools/Scene";
import Cmath from "./tools/Cmath";
import Vector from "./tools/Vector";

export type { Game, Container };

export default {
  // core
  Game,
  Container,
  Rect,
  Circle,
  Text,

  // tools
  Cmath,
  Scene,
  Vector,
};
