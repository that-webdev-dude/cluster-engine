import Game from "../core/Game";
import Container from "../core/Container";

const TRANSITION_DEFAULTS = {
  toStart: () => {},
  toNext: () => {},
  toPrevious: () => {},
};

class Scene extends Container {
  public game: Game;
  public transitions: {
    toStart: () => void;
    toNext: () => void;
    toPrevious: () => void;
  };

  constructor(
    game: Game,
    transitions?: {
      toStart?: () => void;
      toNext?: () => void;
      toPrevious?: () => void;
    }
  ) {
    super();
    this.game = game;
    this.transitions = {
      toStart: transitions?.toStart || TRANSITION_DEFAULTS.toStart,
      toNext: transitions?.toNext || TRANSITION_DEFAULTS.toNext,
      toPrevious: transitions?.toPrevious || TRANSITION_DEFAULTS.toPrevious,
    };
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
  }
}

export default Scene;
