export class GAME_CONFIG {
  static readonly author = "that.webdev.dude";
  static readonly year = "2024";
  static readonly width = 640;
  static readonly height = 320;
  static readonly version = "0.0.1";
  static readonly title = "Cluster Game";
  static readonly fontStyle = '"Press Start 2P"';
  static readonly collisionLayer = {
    Default: 1 << 0,
    Spaceship: 1 << 1,
    Bullet: 1 << 2,
    Enemy: 1 << 3,
  };
}
