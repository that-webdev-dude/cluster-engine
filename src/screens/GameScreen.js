import { Engine, World, Events, Runner, Render } from "../../vendor/matter";
import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Course from "../entities/Course";
import Penguin from "../entities/Penguin";
import Arrow from "../entities/Arrow";
import math from "../cluster/utils/math";

// class Path {
//   constructor() {
//     this.style = { fill: "blue" };
//     this.path = [
//       { x: 0, y: 0 },
//       { x: 25, y: 10 },
//       { x: 50, y: 10 },
//       { x: 75, y: 10 },
//       { x: 50, y: 100 },
//       { x: 25, y: 100 },
//     ];
//   }
// }

class Course2 extends Container {
  constructor(gameW, gameH) {
    super();
    const segments = 13;
    const segmentW = 64;
    let xOffset = 15;
    let yOffset = math.randOneFrom([32, 128, 256]);
    let minY = yOffset;
    let maxY = yOffset;
    let holeSegment = math.rand(segments - 7, segments);

    const terrainData = Array(segments)
      .fill(0)
      .map((_, i) => {
        const mustBeFlat = i <= 1 || i === holeSegment;
        if (!mustBeFlat) {
          // move up or down
          const drop = math.randOneFrom([32, 64, 152]);
          const dir = math.randOneFrom([-1, 0, 1]);

          // go down
          if (dir === 1 && yOffset - drop > 0) {
            yOffset -= drop;
          }

          // go up
          if (dir === -1 && yOffset + drop < 320) {
            yOffset += drop;
          }

          if (yOffset > maxY) maxY = yOffset;
          if (yOffset < minY) minY = yOffset;
        }

        return { x: i * segmentW, y: yOffset };
      });
    const tee = terrainData[0];
    const hole = terrainData[holeSegment];
    console.log("file: GameScreen.js ~ line 34 ~ Course2 ~ constructor ~ terrainData", terrainData);
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
    const course = new Course(new Vector(450, 300));
    const penguin = new Penguin(new Vector(this.width / 10, this.height / 2));

    this.course = this.add(course);
    this.penguin = this.add(penguin);
    this.arrow = this.add(arrow);

    // ++++++++++++++++++++++++++++
    // this.testpath = this.add(new Path());
    const course2 = new Course2();
    // ++++++++++++++++++++++++++++

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
