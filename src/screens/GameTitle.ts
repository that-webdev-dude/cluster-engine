// import { Game } from "../ares";
// import ares from "../ares";

// interface Transitions {
//   onEnter?: () => void;
//   onExit?: () => void;
// }

// interface Globals {}

// const { Scene, Vector, Rect, Circle } = ares;

// // Function to interpolate between two colors
// function interpolateColor(
//   color1: number[],
//   color2: number[],
//   factor: number = 0.5
// ): number[] {
//   const result = color1.slice();
//   for (let i = 0; i < 3; i++) {
//     result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
//   }
//   return result;
// }

// // Convert a RGB array to a hex string
// function rgbToHex(rgb: number[]): string {
//   return (
//     "#" + rgb.map((value) => ("0" + value.toString(16)).slice(-2)).join("")
//   );
// }

// class GameTitle extends Scene {
//   private _transitions: Transitions;
//   private _globals;
//   private _background;
//   private _text;

//   constructor(
//     game: Game,
//     globals: Globals = {},
//     transitions: Transitions = {}
//   ) {
//     super(game);
//     this._globals = globals;
//     this._transitions = transitions;

//     this._background = new Rect({
//       width: game.width,
//       height: game.height,
//       fill: "black",
//     });

//     // const updateableRect = new UpdateableRect();
//     const rect = new Rect({
//       width: 100,
//       height: 100,
//     });

//     const circle = new Circle({
//       position: new Vector(100, 100),
//       radius: 20,
//       fill: "red",
//     });

//     this._text = new Text({
//       text: "Hello World!",
//       align: "left",
//       fill: "white",
//       font: '20px "Press Start 2P"',
//       position: new Vector(200, 200),
//     });

//     // this.add(updateableRect);
//     this.add(this._background);
//     this.add(this._text);
//     this.add(rect);
//     this.add(circle);

//     this._transitions.onEnter && this._transitions.onEnter();
//   }

//   update(dt: number, t: number): void {
//     super.update(dt, t);
//     const color: number[] = interpolateColor(
//       [100, 131, 195],
//       [70, 35, 122],
//       (Math.sin((t / 0.5) * Math.PI) + 1) / 2
//     );
//     this._text.fill = rgbToHex(color);
//   }
// }

// export default GameTitle;
