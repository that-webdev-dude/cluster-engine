import Text from "../cluster/core/Text.js";
import Rect from "../cluster/shapes/Rect.js";
import Dialog from "./Dialog.js";

class DebugDialog extends Dialog {
  constructor(game) {
    super(
      game.width / 3,
      game.height,
      () => {},
      () => {}
    );

    this.game = game;
    this.margin = 24;
    this.family = "monospace";
    this.color = "white";
    this.align = "left";
    this.size = 16;
    this.firstUpdate = true;

    this.titleInfo = this.#setText(``);
    this.versionInfo = this.#setText(``);
    this.speedInfo = this.#setText(``);
    this.sizeInfo = this.#setText(``);

    this.background = this.add(
      new Rect({
        width: this.width,
        height: this.height,
        style: { fill: "rgba(0,0,0,0.50)" },
      })
    );

    this.add(this.titleInfo);
    this.add(this.versionInfo);
    this.add(this.speedInfo);
    this.add(this.sizeInfo);

    this.children.forEach((child, index) => {
      if (child.text) {
        child.position.set(this.margin, index * this.margin);
      }
    });
  }

  #setText(textString = ``) {
    return new Text(textString, {
      font: `${this.size}px ${this.family}`,
      fill: this.color,
      align: this.align,
    });
  }

  update(dt, t) {
    const { game } = this;
    this.titleInfo.text = `title: ${game.title}`;
    this.versionInfo.text = `version: ${game.version}`;
    this.speedInfo.text = `speed: ${game.speed} - FPS: ${game.updateFPS}`;
    // this.renderInfo.text = `rendering refresh rate: ${game.refreshFPS}`;
    this.sizeInfo.text = `size: ${game.width} x ${game.height}`;

    if (this.firstUpdate) {
      this.firstUpdate = false;
      this.children.forEach((child, index) => {
        if (child.text) {
          child.position.set(this.margin, index * this.margin);
        }
      });
    }
  }
}

export default DebugDialog;
