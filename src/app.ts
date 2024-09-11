// Zombie Horde Game Requirements

// 1. Player Mechanics
// Control: Player is stationary in the center of the screen, controlled by mouse input.
// Weapon: Player has a gun to shoot incoming zombies.
// Health: Player dies immediately if any zombie reaches them.
// Input: Supports both mouse and keyboard inputs.

// 2. Zombie Mechanics
// Types: Zombies vary in speed.
// Spawning: Zombies spawn at random intervals and in waves.
// Behavior: Zombies move directly towards the player.

// 3. Gameplay Elements
// Levels: The game progresses through levels with increasing difficulty.
// Power-Ups: Power-ups can be collected, providing temporary advantages.
// Scoring: Score increases with each zombie killed.

// 4. Visual and Audio
// Art Style: Retro pixel art style.
// Camera Effects: Includes camera shakes for added intensity during gameplay.
// Sound: Sound effects for shooting, zombie deaths, and background music.

// 5. User Interface
// Main Menu: Includes start, options, and exit buttons.
// In-Game Indicators: Displays player's score, available power-ups, and any relevant game stats (like ammo count).

import * as Cluster from "./cluster";
import * as Scenes from "./demos/animation/scenes";
import * as Events from "./demos/animation/events";
import { store } from "./demos/animation/store";

const width = 800;
const height = 600;
const game = new Cluster.Game({
  height,
  width,
});

store.on<Events.GamePlayEvent>("game-play", () => {
  game.setScene(new Scenes.GamePlay());
});

store.on<Events.GameOverEvent>("game-over", () => {
  game.setScene(new Scenes.GameOver());
});

store.on<Events.GameTitleEvent>("game-title", () => {
  game.setScene(new Scenes.GameTitle());
});

export default () => {
  game.setScene(new Scenes.GamePlay());
  game.start();
};

// TODO: dispay doesn't resize. fix this
