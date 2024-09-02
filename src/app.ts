// 1. Core Gameplay:
// The player controls a paddle (often called the "Vaus") at the bottom of the screen, which moves horizontally.
// The goal is to bounce a ball off the paddle and break all the bricks on the screen.
// The ball bounces off walls, the paddle, and bricks at various angles, depending on where it hits.
// The level is cleared when all bricks are destroyed.

// 2. Paddle Control:
// The paddle moves left and right at the bottom of the screen.
// The player uses this paddle to keep the ball in play; if the ball passes the paddle, the player loses a life.

// 3. Ball Physics:
// The ball starts with a fixed speed and angle.
// The ball's trajectory changes based on where it hits the paddle (e.g., hitting the edge of the paddle makes the ball bounce at a sharper angle).
// The speed of the ball may increase as levels progress or under certain conditions.

// 4. Bricks:
// Bricks are arranged in various patterns at the top of the screen.
// Most bricks are destroyed with a single hit, but some require multiple hits (e.g., silver or gold bricks).
// Some bricks are indestructible and act as obstacles.

// 5. Power-Ups:
// Certain bricks release power-ups when destroyed, which the player can catch with the paddle to gain various effects, such as:
// Expand Paddle (Enlarge the paddle's size).
// Laser (Allows the paddle to shoot lasers to destroy bricks).
// Multi-Ball (Splits the ball into multiple balls).
// Slow (Slows down the ball).
// Catch (Allows the paddle to catch and release the ball).
// Extra Life (Gives an additional life).
// Disrupt (Releases multiple balls).

// 6. Obstacles and Enemies:
// Some levels include obstacles that cannot be destroyed or move around, altering the ball's path.
// In later levels, enemy spaceships or creatures appear, which can deflect the ball or interfere with gameplay.
// 7. Levels and Progression:
// The game is divided into multiple levels, each with a unique layout of bricks.
// As the player progresses, levels may introduce new challenges, such as faster ball speeds or more complex brick arrangements.

// 8. Scoring:
// Points are awarded for breaking bricks, catching power-ups, and other actions.
// Higher scores are achieved by clearing levels quickly and efficiently, and by catching valuable power-ups.

// 9. Endgame:
// The game continues until the player loses all lives.
// The final level usually involves a boss fight with "DOH," a large enemy that must be defeated to win the game.

// 10. Difficulty:
// Difficulty increases as the player advances, with faster ball speeds, trickier brick arrangements, and fewer easy power-ups.
// The game requires quick reflexes, precise control of the paddle, and strategic use of power-ups.

import * as Cluster from "./cluster";
import * as Scenes from "./demos/events/scenes";

const width = 800;
const height = 600;
export default () => {
  const game = new Cluster.Game({
    height,
    width,
  });

  game.setScene(new Scenes.GamePlay());
  game.start();
};

// TODO: dispay doesn't resize. fix this
