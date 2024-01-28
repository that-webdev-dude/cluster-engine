import Game from "../core/Game";
import Container from "../core/Container";

const defaultTransitions = {
  toFirst: () => {},
  toLast: () => {},
  toNext: () => {},
  toPrevious: () => {},
  toSelected: () => {},
};

class Scene extends Container {
  public static firstFrame = true;
  public game: Game;
  public transitions: {
    toFirst: () => void;
    toLast: () => void;
    toNext: () => void;
    toPrevious: () => void;
    toSelected: () => void;
  };

  constructor(
    game: Game,
    transitions?: {
      toFirst?: () => void;
      toLast?: () => void;
      toNext?: () => void;
      toPrevious?: () => void;
      toSelected?: () => void;
    }
  ) {
    super();
    this.game = game;

    this.transitions = {
      toLast: transitions?.toLast || defaultTransitions.toLast,

      toNext: transitions?.toNext || defaultTransitions.toNext,

      toFirst: transitions?.toFirst || defaultTransitions.toFirst,

      toPrevious: transitions?.toPrevious || defaultTransitions.toPrevious,

      toSelected: transitions?.toSelected || defaultTransitions.toSelected,
    };
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
    if (Scene.firstFrame) {
      Scene.firstFrame = false;
    }
  }
}

export default Scene;
