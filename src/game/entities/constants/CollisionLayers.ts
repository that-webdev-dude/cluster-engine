export const CollisionLayers = {
  default: 1 << 0,
  SpaceshipBullet: 1 << 1,
  EnemyBullet: 1 << 2,
  Spaceship: 1 << 3,
  Enemy: 1 << 4,
} as const;
