import { Game } from "../ares";
import ares from "../ares";

interface Transitions {
  onEnter?: () => void;
  onExit?: () => void;
}

interface Globals {}

const { Scene, Primitive, Vector } = ares;

// Function to interpolate between two colors
function interpolateColor(
  color1: number[],
  color2: number[],
  factor: number = 0.5
): number[] {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
}

// Convert a RGB array to a hex string
function rgbToHex(rgb: number[]): string {
  return (
    "#" + rgb.map((value) => ("0" + value.toString(16)).slice(-2)).join("")
  );
}

class GameTitle extends Scene {
  private _transitions;
  private _globals;
  private _background;
  private _titleText;

  constructor(
    game: Game,
    globals: Globals = {},
    transitions: Transitions = {}
  ) {
    super(game);
    this._globals = globals;
    this._transitions = transitions;

    const background = new Primitive.Rect({
      width: game.width,
      height: game.height,
      style: { fill: "black" },
    });

    const titleText = new Primitive.Text({
      position: new Vector(game.width / 2, game.height / 2 - 100),
      text: "ARES",
      style: {
        fill: "white",
        font: '48px "Press Start 2P"',
        align: "center",
      },
    });

    this._background = background;
    this._titleText = titleText;

    this.add(this._background);
    this.add(this._titleText);
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
    const color: number[] = interpolateColor(
      [100, 131, 195],
      [70, 35, 122],
      (Math.sin((t / 1.5) * Math.PI) + 1) / 2
    );
    this._background.style.fill = rgbToHex(color);
  }
}

export default GameTitle;
