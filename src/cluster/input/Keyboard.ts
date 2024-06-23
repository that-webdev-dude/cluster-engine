// type KeyMap = {
//   [key: string]: boolean;
// };

// export class Keyboard {
//   private _keys: KeyMap;
//   private _preventDefaultKeys: Set<string>;
//   public active: boolean;

//   constructor() {
//     this._keys = {};
//     this._preventDefaultKeys = new Set([
//       "ArrowLeft",
//       "ArrowUp",
//       "ArrowRight",
//       "ArrowDown",
//       "Space",
//     ]);
//     this.active = true;

//     document.addEventListener("keydown", this._handleKeyDown.bind(this));
//     document.addEventListener("keyup", this._handleKeyUp.bind(this));
//   }

//   private _handleKeyDown(e: KeyboardEvent): void {
//     if (this._preventDefaultKeys.has(e.code)) {
//       e.preventDefault();
//     }
//     this._keys[e.code] = true;
//   }

//   private _handleKeyUp(e: KeyboardEvent): void {
//     if (!this.active) this.active = true;
//     if (this._preventDefaultKeys.has(e.code)) {
//       e.preventDefault();
//     }
//     this._keys[e.code] = false;
//   }

//   get action(): boolean {
//     return this.key("Space");
//   }

//   get pause(): boolean {
//     return this.key("KeyP");
//   }

//   get quit(): boolean {
//     return this.key("Escape");
//   }

//   get enter(): boolean {
//     return this.key("Enter");
//   }

//   get x(): number {
//     return (
//       (Number(this.key("KeyD")) || Number(this.key("ArrowRight"))) -
//       (Number(this.key("KeyA")) || Number(this.key("ArrowLeft")))
//     );
//   }

//   get y(): number {
//     return (
//       (Number(this.key("KeyS")) || Number(this.key("ArrowDown"))) -
//       (Number(this.key("KeyW")) || Number(this.key("ArrowUp")))
//     );
//   }

//   key(key: string, value?: boolean): boolean {
//     if (!this.active) return false;
//     if (value !== undefined) {
//       this._keys[key] = value;
//     }

//     return this._keys[key] || false;
//   }

//   reset(): void {
//     this._keys = {};
//   }
// }

// export default Keyboard;

type KeyMap = {
  [key: string]: boolean;
};

export class Keyboard {
  private static _keys: KeyMap = {};
  private static _preventDefaultKeys: Set<string> = new Set([
    "ArrowLeft",
    "ArrowUp",
    "ArrowRight",
    "ArrowDown",
    "Space",
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

  public static get action(): boolean {
    return Keyboard.key("Space");
  }

  public static get pause(): boolean {
    return Keyboard.key("KeyP");
  }

  public static get quit(): boolean {
    return Keyboard.key("Escape");
  }

  public static get enter(): boolean {
    return Keyboard.key("Enter");
  }

  public static get x(): number {
    return (
      (Number(Keyboard.key("KeyD")) || Number(Keyboard.key("ArrowRight"))) -
      (Number(Keyboard.key("KeyA")) || Number(Keyboard.key("ArrowLeft")))
    );
  }

  public static get y(): number {
    return (
      (Number(Keyboard.key("KeyS")) || Number(Keyboard.key("ArrowDown"))) -
      (Number(Keyboard.key("KeyW")) || Number(Keyboard.key("ArrowUp")))
    );
  }

  public static key(key: string, value?: boolean): boolean {
    if (!Keyboard.active) return false;
    if (value !== undefined) {
      Keyboard._keys[key] = value;
    }

    return Keyboard._keys[key] || false;
  }

  public static reset(): void {
    Keyboard._keys = {};
  }
}

export default Keyboard;
