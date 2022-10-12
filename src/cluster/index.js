// TOOLS
// import { Matrix, RotationMatrix } from "./utils/Matrix";
import Vector from "./utils/Vector";
import Physics from "./utils/Physics";
import entity from "./utils/entity";
import math from "./utils/math";

// SHAPES
import Capsule from "./shapes/Capsule";
import Circle from "./shapes/Circle";
import Rect from "./shapes/Rect";
import Line from "./shapes/Line";
import Polygon from "./shapes/Polygon";

import Game from "./core/Game";
import Text from "./core/Text";
import Sprite from "./core/Sprite";
import Texture from "./core/Texture";
import TileMap from "./core/TileMap";
import Container from "./core/Container";
import TileSprite from "./core/TileSprite";
import KeyControls from "./input/KeyControls";
import MouseControls from "./input/MouseControls";
import CanvasRenderer from "./renderers/CanvasRenderer";
import Camera from "./core/Camera";
import State from "./core/State";

export default {
  // TOOLS
  Vector,
  Physics,
  // Matrix,
  // RotationMatrix,
  entity,
  math,

  // SHAPES
  Capsule,
  Circle,
  Rect,
  Line,
  Polygon,

  Game,
  Text,
  Sprite,
  Texture,
  Container,
  TileMap,
  TileSprite,
  KeyControls,
  MouseControls,
  CanvasRenderer,
  Camera,
  State,
};
