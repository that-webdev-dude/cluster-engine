import Screen from "./Screen";
import cluster from "../cluster";
import Background from "../entities/Background";
import sountrackURL from "../sounds/title_soundtrack.mp3";
import backgroundImageURL from "../images/background.png";
import audioBtnImageURL from "../images/audio_btn.png";

const { Text, Vector, Texture, Timer, Sound, math } = cluster;

class GameTitle extends Screen {
  constructor(game, input, globals = {}, transitions = {}) {
    super(game, input, globals, transitions);

    // background
    this.add(
      new Background({
        texture: new Texture(backgroundImageURL),
        displayW: game.width,
        displayH: game.height,
        velocity: new Vector(-100, 0),
      })
    );

    // title text
    this.titleText = this.add(
      new Text("SPACE SHMUP", {
        fill: "white",
        font: '40px "Press Start 2P"',
      })
    );
    this.titleText.position = new Vector(game.width / 2, -100);
    this.add(
      new Timer(1, (p) => {
        this.titleText.position.y = 320 * math.ease.elasticOut(p) - 96;
      })
    );

    // press start text
    this.pressStartText = this.add(
      new Text("Press Start", {
        fill: "red",
        font: '16px "Press Start 2P"',
      })
    );
    this.pressStartText.alpha = 0;
    this.pressStartText.position = new Vector(
      game.width / 2,
      game.height / 2 - 24
    );

    // footer text
    this.footerText = this.add(
      new Text("CGames", {
        fill: "white",
        font: '12px "Press Start 2P"',
      })
    );
    this.footerText.alpha = 0.5;
    this.footerText.position = new Vector(game.width / 2, game.height - 32);

    // audio button
    this.audioBtn = this.add(
      new cluster.Sprite(new cluster.Texture(audioBtnImageURL))
    );
    this.audioBtn.alpha = 0.25;
    this.audioBtn.position = new Vector(
      game.width - this.audioBtn.width - 32,
      32
    );

    // soundtrack
    this.soundtrack = new Sound(sountrackURL, { volume: 1, loop: true });
  }

  update(dt, t) {
    super.update(dt, t);
    this.pressStartText.alpha = Math.sin(t / 0.25) * 0.5 + 0.5;
    if (this.input.keys.action) {
      this.transitions.onPlay();
    }

    if (this.input.mouse.isPressed) {
      const { position } = this.input.mouse;
      const btnMinX = this.audioBtn.position.x;
      const btnMaxX = this.audioBtn.position.x + this.audioBtn.width;
      const btnMinY = this.audioBtn.position.y;
      const btnMaxY = this.audioBtn.position.y + this.audioBtn.height;
      const { x, y } = position;
      if (
        !this.audioBtn.active &&
        x >= btnMinX &&
        x <= btnMaxX &&
        y >= btnMinY &&
        y <= btnMaxY
      ) {
        this.audioBtn.alpha = 0.75;
        this.audioBtn.active = true;
        this.soundtrack.play();
      } else if (
        this.audioBtn.active &&
        x >= btnMinX &&
        x <= btnMaxX &&
        y >= btnMinY &&
        y <= btnMaxY
      ) {
        this.audioBtn.alpha = 0.25;
        this.audioBtn.active = false;
        this.soundtrack.stop();
      }
    }
    this.input.mouse.update();
  }
}

export default GameTitle;
