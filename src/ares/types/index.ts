import Vector from "../tools/Vector";

// Renderable
// interface that defines the render method.
interface Renderable {
  render(context: CanvasRenderingContext2D): void;
}

// EntityOptions
// interface that defines the options that can be passed to an Entity.
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

// SpriteOptions
// interface that defines the options that can be passed to a Sprite.
type SpriteOptions = EntityOptions & {
  textureURL: string;
  height?: number;
  width?: number;
};

// TileSpriteOptions
// interface that defines the options that can be passed to a TileSprite.
type TileSpriteOptions = SpriteOptions & {
  tileW: number;
  tileH: number;
};

// StyleOptions
// interface that defines the options that can be passed to a Shape.
type StyleOptions = {
  align?: CanvasTextAlign;
  font?: string;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
};

// RectOptions
// interface that defines the options that can be passed to a Rect.
type RectOptions = EntityOptions & {
  style?: StyleOptions;
};

// CircleOptions
// interface that defines the options that can be passed to a Circle.
type CircleOptions = EntityOptions & {
  radius: number;
  style?: StyleOptions;
};

// TextOptions
// interface that defines the options that can be passed to a Text.
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
