import ares from "../ares";
import { Game } from "../ares";
const { Container } = ares;

class Screen extends Container {
  public game: Game;
  public globals: any;
  public transitions: any;

  constructor(game: Game, globals = {}, transitions = {}) {
    super();
    this.transitions = transitions;
    this.globals = globals;
    this.game = game;
  }

  update(dt: number, t: number) {
    super.update(dt, t);
  }
}

export default Screen;
