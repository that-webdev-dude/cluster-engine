// TOOLS
import Vector from "./utils/Vector";
// import Physics from "./utils/Physics";
import entity from "./utils/entity";
import math from "./utils/math";

// SHAPES
import Capsule from "./shapes/Capsule";
import Circle from "./shapes/Circle";
import Rect from "./shapes/Rect";
import Line from "./shapes/Line";
import Polygon from "./shapes/Polygon";

// CORE
import Camera from "./core/Camera";
import State from "./core/State";
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

// DEBUG
import Logger from "./debug/Logger";
import VectorViewer from "./debug/VectorViewer";

export default {
  // TOOLS
  Vector,
  // Physics,
  entity,
  math,

  // SHAPES
  Capsule,
  Circle,
  Rect,
  Line,
  Polygon,

  // CORE
  Camera,
  State,
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

  // DEBUG
  Logger,
  VectorViewer,
};
