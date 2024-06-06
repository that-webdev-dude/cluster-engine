import { Component } from "../core/Component";
import { Assets } from "../core/Assets";
import { Vector } from "../tools/Vector";

// Interfaces for component properties
interface TransformProps {
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
}

interface VisibilityProps {
  visible?: boolean;
}

interface TransparencyProps {
  alpha?: number;
}

interface TextureProps {
  imageURL: string;
}

interface RadiusProps {
  value?: number;
}

interface SizeProps {
  width?: number;
  height?: number;
}

interface ShapeStyleProps {
  fill?: string;
  stroke?: string;
}

interface TextStyleProps {
  font?: string;
  fill?: string;
  stroke?: string;
}

interface TextProps {
  message?: string;
}

interface SpeedProps {
  value?: number;
}

// Transform Component
export class Transform extends Component {
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;

  constructor({ position, anchor, scale, pivot, angle }: TransformProps) {
    super();
    this.position = Vector.from(position);
    this.anchor = Vector.from(anchor);
    this.scale = Vector.from(scale);
    this.pivot = Vector.from(pivot);
    this.angle = angle;
  }
}

// Visibility Component
export class Visibility extends Component {
  visible: boolean;

  constructor({ visible = true }: VisibilityProps = {}) {
    super();
    this.visible = visible;
  }
}

// Transparency Component
export class Transparency extends Component {
  alpha: number;

  constructor({ alpha = 1 }: TransparencyProps = {}) {
    super();
    this.alpha = alpha;
  }
}

// Texture Component
export class Texture extends Component {
  image: HTMLImageElement;

  constructor({ imageURL }: TextureProps) {
    super();
    this.image = Assets.image(imageURL);
  }
}

// Radius Component
export class Radius extends Component {
  value: number;

  constructor({ value = 16 }: RadiusProps = {}) {
    super();
    this.value = value;
  }
}

// Size Component
export class Size extends Component {
  width: number;
  height: number;

  constructor({ width = 32, height = 32 }: SizeProps = {}) {
    super();
    this.width = width;
    this.height = height;
  }
}

// ShapeStyle Component
export class ShapeStyle extends Component {
  fill: string;
  stroke: string;

  constructor({ fill = "black", stroke = "black" }: ShapeStyleProps = {}) {
    super();
    this.fill = fill;
    this.stroke = stroke;
  }
}

// TextStyle Component
export class TextStyle extends Component {
  font: string;
  fill: string;
  stroke: string;

  constructor({
    font = '"Press Start 2P"',
    fill = "black",
    stroke = "black",
  }: TextStyleProps = {}) {
    super();
    this.font = font;
    this.fill = fill;
    this.stroke = stroke;
  }
}

// Input Component (Singleton)
export class Input extends Component {
  private static _instance: Input;
  keys: Map<string, boolean> = new Map();
  active: boolean = true;

  private constructor() {
    super();
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      this.keys.set(event.code, true);
    });
    document.addEventListener("keyup", (event: KeyboardEvent) => {
      this.keys.set(event.code, false);
    });
  }

  static get instance(): Input {
    if (!Input._instance) {
      Input._instance = new Input();
    }
    return Input._instance;
  }

  get left(): boolean {
    return this.keys.get("KeyA") || this.keys.get("ArrowLeft") || false;
  }
  get right(): boolean {
    return this.keys.get("KeyD") || this.keys.get("ArrowRight") || false;
  }
  get up(): boolean {
    return this.keys.get("KeyW") || this.keys.get("ArrowUp") || false;
  }
  get down(): boolean {
    return this.keys.get("KeyS") || this.keys.get("ArrowDown") || false;
  }
  get space(): boolean {
    return this.keys.get("Space") || false;
  }
  get action(): boolean {
    return this.keys.get("Space") || false;
  }
  get pause(): boolean {
    return this.keys.get("KeyP") || false;
  }
  get quit(): boolean {
    return this.keys.get("Escape") || false;
  }
  get x(): number {
    return this.right ? 1 : this.left ? -1 : 0;
  }
  get y(): number {
    return this.down ? 1 : this.up ? -1 : 0;
  }
}

// Text Component
export class Text extends Component {
  message: string;

  constructor({ message = "" }: TextProps = {}) {
    super();
    this.message = message;
  }
}

// Speed Component
export class Speed extends Component {
  value: number;

  constructor({ value = 0 }: SpeedProps = {}) {
    super();
    this.value = value;
  }
}
