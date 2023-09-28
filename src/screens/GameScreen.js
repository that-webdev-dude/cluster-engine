import DebugDialog from "../dialogs/DebugDialog";
import Screen from "./Screen";
import cluster from "../cluster";

const { Container, Camera, Rect, Circle, Vector, math } = cluster;

/**
 * Adjusts the game speed based on user input.
 * @param {Object} input - The input object.
 * @param {KeyControls} input.keys - The KeyControls instance.
 * @param {Object} game - The game state object.
 * @param {number} game.speed - The current game speed.
 */
function slowmo(input, game) {
  if (input.keys.key("Digit1")) {
    game.speed = Math.min(game.speed + 0.25, 5);
    input.keys.key("Digit1", false);
  }
  if (input.keys.key("Digit2")) {
    game.speed = Math.max(0.25, game.speed - 0.25);
    input.keys.key("Digit2", false);
  }
  if (input.keys.key("Digit3")) {
    game.speed = 1;
    input.keys.key("Digit3", false);
  }
}

class Ball extends Circle {
  constructor(radius = 10, position = new Vector(), velocity = new Vector()) {
    const r = math.rand(0, 128);
    const g = math.rand(0, 0);
    const b = math.rand(0, 0);
    const a = math.randf();
    const color = `rgba(${r}, ${g}, ${b}, ${a})`;

    super({ radius: radius, style: { fill: color } });
    this.position = position;
    this.velocity = velocity;
    this.friction = 0.5;
  }

  update(dt, t) {
    const { position, velocity } = this;
    position.x += dt * velocity.x;
    position.y += dt * velocity.y;
  }
}

class GameScreen extends Screen {
  constructor(game, input) {
    super(game, input);
    // ...
    const balls = new Container();
    for (let i = 0; i <= 1; i++) {
      const radius = math.rand(10, 25);
      balls.add(
        new Ball(
          radius,
          new Vector(
            // math.rand(0, game.width - radius * 2),
            // math.rand(0, game.height - radius * 2)
            game.width / 2,
            game.height / 2
          ),

          new Vector(
            math.randOneFrom([-200, 200]),
            0
            // math.randOneFrom([-100, -50 - 25, 50, 25, 100]),
            // math.randOneFrom([-100, -50 - 25, 50, 25, 100])
          )
        )
      );
    }

    this.firstUpdate = true;
    this.balls = this.add(balls);
    this.debugDialog = this.add(new DebugDialog(game));
  }

  update(dt, t) {
    super.update(dt, t);
    const { balls, game, input } = this;

    // unoptimized bouncing detection
    balls.children.forEach((ball) => {
      if (
        ball.position.x <= 0 ||
        ball.position.x + ball.radius * 2 >= game.width
      ) {
        const vx = ball.velocity.x;
        const vy = ball.velocity.y;
        ball.velocity.set(-vx, vy);
      }

      if (
        ball.position.y <= 0 ||
        ball.position.y + ball.radius * 2 >= game.height
      ) {
        const vx = ball.velocity.x;
        const vy = ball.velocity.y;
        ball.velocity.set(vx, -vy);
      }
    });

    // unoptimized collision detection
    for (let i = 0; i < balls.children.length - 1; i++) {
      for (let j = i + 1; j < balls.children.length; j++) {
        let b1 = balls.children[i];
        let b2 = balls.children[j];
        if (math.distance(b1.position, b2.position) <= b1.radius + b2.radius) {
          let collisionDirection = b1.velocity.to(b2.velocity);
          let collisionNormal = collisionDirection.normal();
          // console.log(
          //   "file: GameScreen.js:87 ~ GameScreen ~ update ~ collisionNormal:",
          //   collisionNormal
          // );
        }
      }
    }

    slowmo(input, game);

    // DEBUG
    if (this.firstUpdate) {
      // ...
      this.firstUpdate = false;
    }
  }
}

export default GameScreen;
