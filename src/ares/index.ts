// core
import Container from "./core/Container";
import TileSprite from "./core/TileSprite";
import Sprite from "./core/Sprite";
import Text from "./core/Text";
import Game from "./core/Game";
import Sound from "./core/Sound";
import Camera from "./core/Camera";
import Entity from "./core/Entity";
import { Circle, Rect } from "./core/Shape";

// tools
import Cmath from "./tools/Cmath";
import Pool from "./tools/Pool";
import Scene from "./tools/Scene";
import Vector from "./tools/Vector";

export type {
  Game,
  Container,
  Entity,
  // Rect,
  // Circle,
  // TileSprite,
  // Sprite,
  // Text,
  // Sound,
  // Camera,
  // Scene,
  // Cmath,
  // Vector,
};

export default {
  // core
  Container,
  TileSprite,
  Sprite,
  Circle,
  Rect,
  Text,
  Game,
  Sound,
  Camera,

  // tools
  Cmath,
  Pool,
  Scene,
  Vector,
};
