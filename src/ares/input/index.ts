import KeyboardInput from "./Keyboard";
import MouseInput from "./Mouse";

// TODO: Add gamepad support

class Input {
  static Keyboard = KeyboardInput;
  static Mouse = MouseInput;
}

// TODO: make individual exports for KeyboardInput and MouseInput
export type { KeyboardInput, MouseInput };
export default Input;
