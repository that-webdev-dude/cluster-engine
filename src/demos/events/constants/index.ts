export const DISPLAY = {
  height: 600,
  width: 800,
} as const;

export const COLLISION_LAYERS = {
  default: 0 << 0,
  ball: 1 << 1,
  brick: 1 << 2,
  player: 1 << 3,
} as const;
