import cluster from "../cluster/index";
const { Container } = cluster;

class Screen extends Container {
  constructor(game, input, globals = {}, transitions = {}) {
    super();
    this.transitions = transitions;
    this.globals = globals;
    this.input = input;
    this.game = game;
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default Screen;
