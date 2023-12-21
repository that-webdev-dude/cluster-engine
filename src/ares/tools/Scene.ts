import Game from "../core/Game";
import Container from "../core/Container";

const TRANSITION_DEFAULTS = {
  toStart: () => {},
  toEnd: () => {},
  toNext: () => {},
  toPrevious: () => {},
};

class Scene extends Container {
  public game: Game;
  public transitions: {
    toStart: () => void;
    toEnd: () => void;
    toNext: () => void;
    toPrevious: () => void;
  };

  constructor(
    game: Game,
    transitions?: {
      toStart?: () => void;
      toEnd?: () => void;
      toNext?: () => void;
      toPrevious?: () => void;
    }
  ) {
    super();
    this.game = game;
    this.transitions = {
      toStart: transitions?.toStart || TRANSITION_DEFAULTS.toStart,
      toEnd: transitions?.toEnd || TRANSITION_DEFAULTS.toEnd,
      toNext: transitions?.toNext || TRANSITION_DEFAULTS.toNext,
      toPrevious: transitions?.toPrevious || TRANSITION_DEFAULTS.toPrevious,
    };

    // this.game.keyboard.active = false;
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
  }
}

export default Scene;
