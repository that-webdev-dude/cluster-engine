import KeyboardInput from "./Keyboard";
import MouseInput from "./Mouse";

class Input {
  static Keyboard = KeyboardInput;
  static Mouse = MouseInput;
}

export type { KeyboardInput, MouseInput };
export default Input;

// export type {KeyboardInput, MouseInput};
// export { KeyboardInput, MouseInput };
