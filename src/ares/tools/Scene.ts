import Game from "../core/Game";
import Container from "../core/Container";

const TRANSITION_DEFAULTS = {
  toNext: () => {},
  toPrevious: () => {},
};

class Scene extends Container {
  public game: Game;
  public transitions: {
    toNext: () => void;
    toPrevious: () => void;
  };

  constructor(
    game: Game,
    transitions?: {
      toNext?: () => void;
      toPrevious?: () => void;
    }
  ) {
    super();
    this.game = game;
    this.transitions = {
      toNext: transitions?.toNext || TRANSITION_DEFAULTS.toNext,
      toPrevious: transitions?.toPrevious || TRANSITION_DEFAULTS.toPrevious,
    };
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
  }
}

export default Scene;
