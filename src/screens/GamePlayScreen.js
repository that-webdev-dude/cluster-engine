import Container from "../cluster/core/Container";

class Path {
  constructor(positions, style) {
    this.path = positions;
    this.style = style;
  }
}

class GamePlayScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();
  }

  update(dt, t) {}
}

export default GamePlayScreen;
