import { Assets, Component, Vector } from "../../cluster";

interface TransformOptions {
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
}
/** Transform component
 * @options position, anchor, scale, pivot, angle (degrees)
 */
class TransformComponent extends Component {
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;

  constructor({
    position = new Vector(0, 0),
    anchor = new Vector(0, 0),
    scale = new Vector(1, 1),
    pivot = new Vector(0, 0),
    angle = 0,
  }: TransformOptions = {}) {
    super("Transform");
    this.position = Vector.from(position);
    this.anchor = Vector.from(anchor);
    this.scale = Vector.from(scale);
    this.pivot = Vector.from(pivot);
    this.angle = angle;
  }
}

interface VelocityOptions {
  velocity: Vector;
}
/** Velocity component
 * @options velocity
 */
class VelocityComponent extends Component {
  velocity: Vector;

  constructor({ velocity }: VelocityOptions) {
    super("Velocity");
    this.velocity = Vector.from(velocity);
  }
}

interface TextureOptions {
  image: HTMLImageElement;
}
/** Texture component
 * @options imageURL
 */
class TextureComponent extends Component {
  image: HTMLImageElement;

  constructor({ image }: TextureOptions) {
    super("Texture");
    this.image = image;
  }
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
interface SpriteOptions {
  image: HTMLImageElement;
  frame?: number;
  width?: number;
  height?: number;
}
class SpriteComponent extends Component {
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
class RectComponent extends Component {
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
class TextComponent extends Component {
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
class AlphaComponent extends Component {
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
class ZindexComponent extends Component {
  zindex: number;

  constructor({ zindex }: ZindexOptions) {
    super("Zindex");
    this.zindex = zindex;
  }
}

interface HealthOptions {
  health: number;
}
/** Health component
 * @options health
 */
class HealthComponent extends Component {
  health: number;

  constructor({ health }: HealthOptions) {
    super("Health");
    this.health = health;
  }
}

interface BulletOptions {
  damage: number;
  speed: number;
  direction: Vector;
}
/** Bullet component
 * @options damage, speed, direction
 */
class BulletComponent extends Component {
  damage: number;
  speed: number;
  direction: Vector;

  constructor({ damage, speed, direction }: BulletOptions) {
    super("Bullet");
    this.damage = damage;
    this.speed = speed;
    this.direction = Vector.from(direction);
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
class EnemyComponent extends Component {
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
}
/** Player component
 * @options lives
 */
class PlayerComponent extends Component {
  lives: number;

  constructor({ lives }: PlayerOptions) {
    super("Player");
    this.lives = lives;
  }
}

// Component Classes
export {
  TransformComponent,
  VelocityComponent,
  TextureComponent,
  SpriteComponent,
  RectComponent,
  TextComponent,
  AlphaComponent,
  ZindexComponent,
  HealthComponent,
  BulletComponent,
  EnemyComponent,
  PlayerComponent,
};
