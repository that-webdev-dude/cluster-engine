import cluster from "../cluster/index";
const { Container } = cluster;

class Screen extends Container {
  constructor(game, input, state, transitions = {}) {
    super();
    this.game = game;
    this.input = input;
    this.state = state;
    this.transitions = transitions;
    this.firstUpdate = true;
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default Screen;
