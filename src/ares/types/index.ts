import Vector from "../tools/Vector";

// Renderable is an interface that defines the render method.
interface Renderable {
  render(context: CanvasRenderingContext2D): void;
}

// EntityOptions is an interface that defines the options that can be passed to an Entity.
type EntityOptions = {
  position?: Vector;
  anchor?: Vector;
  height?: number;
  width?: number;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
  dead?: boolean;
  alpha?: number;
  visible?: boolean;
};

// SpriteOptions is an interface that defines the options that can be passed to a Sprite.
type SpriteOptions = EntityOptions & {
  textureURL: string;
};

type TileSpriteOptions = SpriteOptions & {
  tileW: number;
  tileH: number;
};

// StyleOptions is an interface that defines the options that can be passed to a Shape.
type StyleOptions = {
  align?: CanvasTextAlign;
  font?: string;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
};

// RectOptions is an interface that defines the options that can be passed to a Rect.
type RectOptions = EntityOptions & {
  style?: StyleOptions;
};

// CircleOptions is an interface that defines the options that can be passed to a Circle.
type CircleOptions = EntityOptions & {
  radius: number;
  style?: StyleOptions;
};

// TextOptions is an interface that defines the options that can be passed to a Text.
type TextOptions = EntityOptions & {
  text?: string;
  style?: StyleOptions;
};

export {
  Renderable,
  EntityOptions,
  SpriteOptions,
  TileSpriteOptions,
  StyleOptions,
  RectOptions,
  CircleOptions,
  TextOptions,
};
