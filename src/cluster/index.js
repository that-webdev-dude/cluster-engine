/**
 * cluster library
 * iClusterDev 2023
 */

// TOOLS
import Pool from "./utils/Pool";
import Vector from "./utils/Vector";
import Physics from "./utils/Physics";
import entity from "./utils/entity";
import math from "./utils/math";
// import tiledParser from "./utils/TiledParser";

// SHAPES
import Capsule from "./shapes/Capsule";
import Circle from "./shapes/Circle";
import Rect from "./shapes/Rect";
import Line from "./shapes/Line";
import Polygon from "./shapes/Polygon";

// CORE
import Assets from "./core/Assets";
import Camera from "./core/Camera";
import State from "./core/State";
import Game from "./core/Game";
import Text from "./core/Text";
import Timer from "./core/Timer";
import Sprite from "./core/Sprite";
import Texture from "./core/Texture";
import TileMap from "./core/TileMap";
import Container from "./core/Container";
import TileSprite from "./core/TileSprite";
import KeyControls from "./input/KeyControls";
import MouseControls from "./input/MouseControls";
import CanvasRenderer from "./renderers/CanvasRenderer";
import Trigger from "./core/Trigger";
import Debugger from "./core/Debugger";

// SOUND
import Audio from "./sound/Audio";
import Sound from "./sound/Sound";
import SoundPool from "./sound/SoundPool";
import SoundGroup from "./sound/SoundGroup";
import SoundBuffer from "./sound/SoundBuffer";

// FX
import Particle from "./fx/Particle";
import ParticleEmitter from "./fx/ParticleEmitter";

export default {
  // TOOLS
  Pool,
  Vector,
  Physics,
  entity,
  math,
  // TiledParser,

  // SHAPES
  Capsule,
  Circle,
  Rect,
  Line,
  Polygon,

  // CORE
  Assets,
  Camera,
  State,
  Game,
  Text,
  Timer,
  Sprite,
  Texture,
  Container,
  TileMap,
  TileSprite,
  KeyControls,
  MouseControls,
  CanvasRenderer,
  Trigger,
  Debugger,

  // SOUND
  Audio,
  Sound,
  SoundPool,
  SoundGroup,
  SoundBuffer,

  // FX
  Particle,
  ParticleEmitter,
};
