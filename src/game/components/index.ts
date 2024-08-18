import * as Cluster from "../../cluster";
import * as Strategies from "../strategies";

interface TransformOptions {
  boundary?: "contain" | "wrap" | "bounce" | "die" | "stop" | "sleep" | "none";
  position?: Cluster.Vector;
  anchor?: Cluster.Vector;
  scale?: Cluster.Vector;
  pivot?: Cluster.Vector;
  angle?: number;
}
/** Transform component
 * @options position, anchor, scale, pivot, angle (degrees), boundary
 * @boundary contain, wrap, bounce, die, stop, none
 */
class TransformComponent extends Cluster.Component {
  boundary: "contain" | "wrap" | "bounce" | "die" | "stop" | "sleep" | "none";
  position: Cluster.Vector;
  anchor: Cluster.Vector;
  scale: Cluster.Vector;
  pivot: Cluster.Vector;
  angle: number;

  constructor({
    boundary = "none",
    position = new Cluster.Vector(0, 0),
    anchor = new Cluster.Vector(0, 0),
    scale = new Cluster.Vector(1, 1),
    pivot = new Cluster.Vector(0, 0),
    angle = 0,
  }: TransformOptions = {}) {
    super("Transform");
    this.boundary = boundary;
    this.position = Cluster.Vector.from(position);
    this.anchor = Cluster.Vector.from(anchor);
    this.scale = Cluster.Vector.from(scale);
    this.pivot = Cluster.Vector.from(pivot);
    this.angle = angle;
  }
}

interface VelocityOptions {
  velocity: Cluster.Vector;
}
/** Velocity component
 * @options velocity
 * @properties direction, velocity, magnitude
 */
class VelocityComponent extends Cluster.Component {
  velocity: Cluster.Vector;

  constructor({ velocity }: VelocityOptions) {
    super("Velocity");
    this.velocity = Cluster.Vector.from(velocity);
  }

  get direction() {
    return Cluster.Vector.normalize(this.velocity);
  }

  get magnitude() {
    return this.velocity.magnitude;
  }
}

interface SpriteOptions {
  image: HTMLImageElement;
  frame?: number;
  width?: number;
  height?: number;
}
/** Sprite component
 * @options image, frame, width, height
 * @default frame = 0, width = image.width, height = image.height
 * @note frame is the index of the sprite in the sprite sheet
 * @note width and height are the dimensions of the sprite
 * @note if width and height are not provided, they default to the image dimensions
 * @note if frame is not provided, it defaults to 0
 * @note if image is not provided, it defaults to a 1x1 transparent image
 */
class SpriteComponent extends Cluster.Component {
  image: HTMLImageElement;
  frame: number;
  width: number;
  height: number;

  constructor({ image, frame, width, height }: SpriteOptions) {
    super("Sprite");
    this.image = image;
    this.frame = frame || 0;
    this.width = width || this.image.width;
    this.height = height || this.image.height;
  }

  get indexToCoords() {
    const cols = this.image.width / this.width;
    const x = (this.frame % cols) * this.width;
    const y = Math.floor(this.frame / cols) * this.height;
    return { x, y };
  }

  get coordsToIndex() {
    const cols = this.image.width / this.width;
    const row = Math.floor(this.frame / cols);
    const col = this.frame % cols;
    return { row, col };
  }
}

interface RectOptions {
  width: number;
  height: number;
  stroke?: string;
  fill?: string;
}
/** Rect component
 * @options width, height, stroke, fill
 */
class RectComponent extends Cluster.Component {
  width: number;
  height: number;
  stroke: string;
  fill: string;

  constructor({ width, height, stroke, fill }: RectOptions) {
    super("Rect");
    this.width = width;
    this.height = height;
    this.stroke = stroke || "black";
    this.fill = fill || "black";
  }
}

interface TextOptions {
  text: string;
  font?: string;
  fill?: string;
  stroke?: string;
}
/** Text component
 * @options text, font, fill, stroke
 */
class TextComponent extends Cluster.Component {
  text: string;
  font: string;
  fill: string;
  stroke: string;

  constructor({ text, font, fill, stroke }: TextOptions) {
    super("Text");
    this.text = text;
    this.font = font || "16px Arial";
    this.fill = fill || "black";
    this.stroke = stroke || "black";
  }
}

interface AlphaOptions {
  alpha: number;
}
/** Alpha component
 * @options alpha
 */
class AlphaComponent extends Cluster.Component {
  alpha: number;

  constructor({ alpha }: AlphaOptions) {
    super("Alpha");
    this.alpha = alpha;
  }
}

interface ZindexOptions {
  zindex: number;
}
/** Zindex component
 * @options zindex
 */
class ZindexComponent extends Cluster.Component {
  zindex: number;

  constructor({ zindex }: ZindexOptions) {
    super("Zindex");
    this.zindex = zindex;
  }
}

interface BulletOptions {
  damage: number;
  speed: number;
  direction: Cluster.Vector;
}
/** Bullet component
 * @options damage, velocity
 */
class BulletComponent extends Cluster.Component {
  damage: number;
  speed: number;
  direction: Cluster.Vector;

  constructor({ damage, speed, direction }: BulletOptions) {
    super("Bullet");
    this.damage = damage;
    this.speed = speed;
    this.direction = Cluster.Vector.from(direction);
  }
}

interface EnemyOptions {
  health: number;
  speed: number;
  damage: number;
}
/** Enemy component
 * @options health, speed, damage
 */
class EnemyComponent extends Cluster.Component {
  health: number;
  speed: number;
  damage: number;

  constructor({ health, speed, damage }: EnemyOptions) {
    super("Enemy");
    this.health = health;
    this.speed = speed;
    this.damage = damage;
  }
}

interface PlayerOptions {
  lives: number;
  speed: number;
  health: number;
}
/** Player component
 * @options lives, speed, health
 */
class PlayerComponent extends Cluster.Component {
  lives: number;
  speed: number;
  health: number;

  constructor({ lives, speed, health }: PlayerOptions) {
    super("Player");
    this.lives = lives;
    this.speed = speed;
    this.health = health;
  }
}

interface ControllerOptions {
  up?: string;
  down?: string;
  left?: string;
  right?: string;
  action?: string;
  pause?: string;
  quit?: string;
}
/** Controller component
 * @options up, down, left, right, action, pause, quit
 * @properties key, up, down, left, right, action, pause, quit
 */
class ControllerComponent extends Cluster.Component {
  private _direction: Cluster.Vector = new Cluster.Vector(0, 0);
  private _up: string = "ArrowUp";
  private _down: string = "ArrowDown";
  private _left: string = "ArrowLeft";
  private _right: string = "ArrowRight";
  private _action: string = "Space";
  private _pause: string = "Escape";
  private _quit: string = "KeyQ";

  constructor({
    up,
    down,
    left,
    right,
    action,
    pause,
    quit,
  }: ControllerOptions = {}) {
    super("Controller");
    if (up) this._up = up;
    if (down) this._down = down;
    if (left) this._left = left;
    if (right) this._right = right;
    if (action) this._action = action;
    if (pause) this._pause = pause;
    if (quit) this._quit = quit;
  }

  get up() {
    return Cluster.Keyboard.key(this._up);
  }

  get down() {
    return Cluster.Keyboard.key(this._down);
  }

  get left() {
    return Cluster.Keyboard.key(this._left);
  }

  get right() {
    return Cluster.Keyboard.key(this._right);
  }

  get action() {
    return Cluster.Keyboard.key(this._action);
  }

  get pause() {
    return Cluster.Keyboard.key(this._pause);
  }

  get quit() {
    return Cluster.Keyboard.key(this._quit);
  }

  get x() {
    return Number(this.right) - Number(this.left);
  }

  get y() {
    return Number(this.down) - Number(this.up);
  }

  get direction() {
    return this._direction.set(this.x, this.y).normalize();
  }
}

/** EnhancedSpawner component
 * @options strategy, pool, limit, interval
 * @properties count, timer
 */
interface SpawnerOptions {
  strategy: Strategies.SpawnStrategyType;
  pool: Cluster.Pool<Cluster.Entity>;
  limit: number;
  interval: number;
}
class SpawnerComponent extends Cluster.Component {
  readonly strategy: Strategies.SpawnStrategyType;
  readonly interval: number = 0;
  readonly limit: number = 0;
  public count: number = 0;
  public timer: number = 0;
  readonly pool: Cluster.Pool<Cluster.Entity>;

  constructor({ limit, interval, strategy, pool }: SpawnerOptions) {
    super("Spawner");
    this.interval = interval;
    this.strategy = strategy;
    this.limit = limit;
    this.pool = pool;
  }
}

/** Collision component
 * @options layer, mask, resolvers
 * @properties layer, mask, resolvers
 */
type ResolverType = "bounce" | "die" | "stop" | "sleep" | "none";
interface CollisionResolver {
  type: ResolverType;
  mask: number;
  actions?: {
    name: string;
    data: number | string | boolean;
  }[];
}
interface CollisionData {
  main: Cluster.Entity;
  other: Cluster.Entity;
  overlap: Cluster.Vector;
  normal: Cluster.Vector;
  area: number;
}
interface CollisionHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}
interface CollisionOptions {
  layer: number;
  mask?: number;
  hitbox: CollisionHitbox;
  resolvers?: CollisionResolver[];
}
export class CollisionComponent extends Cluster.Component {
  readonly layer: number;
  readonly mask: number;
  readonly hitbox: CollisionHitbox;
  readonly resolvers: CollisionResolver[];
  readonly data: Map<ResolverType, CollisionData[]>;

  constructor({
    layer = 0,
    mask = 1,
    hitbox = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    resolvers = [],
  }: CollisionOptions) {
    super("Collision");
    this.layer = layer;
    this.mask = mask;
    this.hitbox = hitbox;
    this.resolvers = resolvers;
    this.data = new Map();
  }

  get hit() {
    return this.data.size > 0;
  }
}

// Cluster.Component Classes
export {
  TransformComponent,
  VelocityComponent,
  SpriteComponent,
  RectComponent,
  TextComponent,
  AlphaComponent,
  ZindexComponent,
  BulletComponent,
  EnemyComponent,
  PlayerComponent,
  ControllerComponent,
  SpawnerComponent,
};
