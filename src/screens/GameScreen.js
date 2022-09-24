import { Engine, World, Events, Runner, Render } from "../../vendor/matter";
import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Course from "../entities/Course";
import Penguin from "../entities/Penguin";
import Arrow from "../entities/Arrow";
import math from "../cluster/utils/math";

class Path {
  constructor(positions, style) {
    this.path = positions;
    this.style = style;
  }
}

class GameScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();
    this.height = game.height;
    this.width = game.width;
    this.input = input;
    this.restart = onRestart;
    this.ready = false;

    const arrow = new Arrow();
    const course = new Course(new Vector(game.width / 2, game.height - 50));
    const penguin = new Penguin(new Vector(this.width / 10, this.height / 2));

    this.course = this.add(course);
    this.penguin = this.add(penguin);
    this.arrow = this.add(arrow);

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
    const { penguin, input, height, arrow } = this;

    // penguin off the edge
    if (penguin.position.y >= height) {
      this.restart();
    }

    // start stroke
    if (input.mouse.isPressed) {
      arrow.start(input.mouse.position);
    }

    if (this.ready) {
      if (input.mouse.isDown || input.mouse.isReleased) {
        const { angle, power } = arrow.drag(input.mouse.position);
        arrow.visible = true;
        if (input.mouse.isReleased) {
          this.ready = false;
          arrow.visible = false;
          penguin.fire(power * 0.021, (angle * Math.PI) / 180); // angle in radians
        }
      }
    }

    input.mouse.update();
  }
}

export default GameScreen;
