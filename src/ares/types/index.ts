import Vector from "../tools/Vector";

interface Positionable {
  x: number;
  y: number;
}

interface Renderable {
  position: Positionable;
  anchor: Positionable;
  scale: Positionable;
  pivot: Positionable;
  height: number;
  width: number;
  alpha: number;
  angle: number;
  dead: boolean;
  render: (context: CanvasRenderingContext2D) => void;
  update?: (delta: number, elapsed: number) => void;
}

interface Renderables {
  children: Array<Renderable | Renderables>;
  position: Positionable;
  size: number;
  // dead: boolean;
  update?: (delta: number, elapsed: number) => void;
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

export {
  Positionable,
  Renderable,
  Renderables,
  SpriteOptions,
  TileSpriteOptions,
};
