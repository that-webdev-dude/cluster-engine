type KeyMap = {
  [key: string]: boolean;
};

export class Keyboard {
  private static _keys: KeyMap = {};
  private static _preventDefaultKeys: Set<string> = new Set([
    // ...
  ]);
  public static active: boolean = true;

  static {
    document.addEventListener("keydown", Keyboard._handleKeyDown);
    document.addEventListener("keyup", Keyboard._handleKeyUp);
  }

  private static _handleKeyDown(e: KeyboardEvent): void {
    if (Keyboard._preventDefaultKeys.has(e.code)) {
      e.preventDefault();
    }
    Keyboard._keys[e.code] = true;
  }

  private static _handleKeyUp(e: KeyboardEvent): void {
    if (!Keyboard.active) Keyboard.active = true;
    if (Keyboard._preventDefaultKeys.has(e.code)) {
      e.preventDefault();
    }
    Keyboard._keys[e.code] = false;
  }

  public static key(key: string, value?: boolean): boolean {
    if (!Keyboard.active) return false;
    if (value !== undefined) {
      Keyboard._keys[key] = value;
    }

    return Keyboard._keys[key] || false;
  }

  public static x(): number {
    return (
      (Number(Keyboard.key("ArrowRight")) || Number(Keyboard.key("KeyD"))) -
      (Number(Keyboard.key("ArrowLeft")) || Number(Keyboard.key("KeyA")))
    );
  }

  public static y(): number {
    return (
      (Number(Keyboard.key("ArrowDown")) || Number(Keyboard.key("KeyS"))) -
      (Number(Keyboard.key("ArrowUp")) || Number(Keyboard.key("KeyW")))
    );
  }

  public static reset(): void {
    Keyboard._keys = {};
  }
}

export default Keyboard;
