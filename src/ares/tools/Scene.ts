import Game from "../core/Game";
import Container from "../core/Container";

class Scene extends Container {
  public game: Game;

  constructor(game: Game) {
    super();
    this.game = game;
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
  }
}

export default Scene;
