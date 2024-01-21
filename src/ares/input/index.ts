import KeyboardInput from "./Keyboard";
import GamepadInput from "./Gamepad";
import MouseInput from "./Mouse";

// TODO: Add gamepad support

class Input {
  static Keyboard = KeyboardInput;
  static Gamepad = GamepadInput;
  static Mouse = MouseInput;
}

// TODO: make individual exports for KeyboardInput and MouseInput
export type { KeyboardInput, GamepadInput, MouseInput };
export default Input;
