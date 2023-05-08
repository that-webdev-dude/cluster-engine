// TOOLS
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

// CORE
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

// DEBUG
import Logger from "./debug/Logger";
import VectorViewer from "./debug/VectorViewer";

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
  Vector,
  Physics,
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

  // DEBUG
  Logger,
  VectorViewer,

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
