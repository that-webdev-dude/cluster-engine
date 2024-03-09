import Keyboard from "./Keyboard";
import Gamepad from "./Gamepad";
import Mouse from "./Mouse";

export class Input {
  static Keyboard = Keyboard;
  static Gamepad = Gamepad;
  static Mouse = Mouse;
}

export { Keyboard, Gamepad, Mouse };
export default Input;
