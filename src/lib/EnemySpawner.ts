// EnemySpawner.ts
import {
  CurvedMovement,
  Enemy,
  EnemyFrame,
  LinearMovement,
} from "../entities/Enemy";
import { Game, Vector, Container, Cmath } from "../ares";

class EnemySpawner {
  private _game: Game;
  private _enemies: Container;
  private _spawnInterval: number;
  private _lastSpawnTime: number;

  constructor(game: Game, enemies: Container, spawnInterval: number = 1000) {
    this._game = game;
    this._enemies = enemies;
    this._spawnInterval = spawnInterval;
    this._lastSpawnTime = 0;
  }

  update(dt: number, t: number) {
    this._lastSpawnTime += dt * 1000; // Convert dt to milliseconds

    if (this._lastSpawnTime >= this._spawnInterval) {
      this._lastSpawnTime = 0;
      this.spawnEnemy();
    }
  }

  private spawnEnemy() {
    // random wave
    const posX = this._game.width + Enemy.WIDTH * 2;
    const posY = Cmath.rand(Enemy.HEIGHT, this._game.height - Enemy.HEIGHT * 2);
    const velX = Cmath.rand(-200, -100);
    const enemy = new Enemy({
      position: new Vector(posX, posY),
      health: 1,
      cannon: true,
      frame: EnemyFrame.VENOM6,
      movement: new CurvedMovement(new Vector(velX, 0), 2, 5, 1),
    });
    this._enemies.add(enemy);

    //     sin wave
    //     const posX = this._game.width + Enemy.WIDTH * 2;
    //     const posY = this._game.height / 2 - Enemy.HEIGHT;
    //     const velX = Cmath.rand(-200, -100);
    //     const enemy = new Enemy({
    //       position: new Vector(posX, posY),
    //       health: 1,
    //       cannon: true,
    //       frame: EnemyFrame.VENOM1,
    //       movement: new CurvedMovement(new Vector(-200, 0), 5, 1, 1),
    //     });
    //     this._enemies.add(enemy);
  }
}

export default EnemySpawner;
