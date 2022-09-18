import { Engine, World, Events, Runner, Render } from "../../vendor/matter";
import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Course from "../entities/Course";
import Penguin from "../entities/Penguin";

class GameScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();
    this.height = game.height;
    this.width = game.width;
    this.input = input;
    this.restart = onRestart;
    this.ready = false;

    const course = new Course(new Vector(450, 300));
    const penguin = new Penguin(new Vector(this.width / 2, this.height / 2));

    this.course = this.add(course);
    this.penguin = this.add(penguin);

    // matterjs engine setup
    this.engine = Engine.create({ enableSleeping: true });
    World.add(this.engine.world, [penguin.body, course.body]);
    Runner.run(this.engine);

    // game events
    Events.on(penguin.body, "sleepStart", () => {
      this.ready = true;
    });

    // debug matter renderer
    // const render = Render.create({
    //   element: document.querySelector("#app"),
    //   engine: this.engine,
    //   options: {
    //     width: this.width,
    //     height: this.height,
    //     showAngleIndicator: true,
    //   },
    // });
    // Render.run(render);
  }

  update(dt, t) {
    super.update(dt, t);
    const { penguin, input, height, ready } = this;

    // penguin off the edge
    if (penguin.position.y >= height) {
      this.restart();
    }

    // player taken a shot
    if (input.mouse.isReleased && this.ready) {
      const power = 0.01;
      const angle = -Math.PI / 1.75;
      penguin.fire(power, angle);
      this.ready = false;
    }

    input.mouse.update();
  }
}

export default GameScreen;
