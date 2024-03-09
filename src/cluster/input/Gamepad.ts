export class Gamepad {
  private _gamepadIndex: number | null = null;
  //   private _previousButtons: GamepadButton[] = [];

  constructor() {
    window.addEventListener(
      "gamepadconnected",
      this._connectHandler.bind(this)
    );
    window.addEventListener(
      "gamepaddisconnected",
      this._disconnectHandler.bind(this)
    );
  }

  private _connectHandler(event: GamepadEvent): void {
    this._gamepadIndex = event.gamepad.index;
    //     console.log(
    //       "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    //       event.gamepad.index,
    //       event.gamepad.id,
    //       event.gamepad.buttons.length,
    //       event.gamepad.axes.length
    //     );
  }

  private _disconnectHandler(event: GamepadEvent): void {
    this._gamepadIndex = null;
    //     console.log(
    //       "Gamepad disconnected from index %d: %s",
    //       event.gamepad.index,
    //       event.gamepad.id
    //     );
  }

  public get buttonA() {
    return this.isButtonPressed(0);
  }
  public get buttonB() {
    return this.isButtonPressed(1);
  }
  public get buttonX() {
    return this.isButtonPressed(2);
  }
  public get buttonY() {
    return this.isButtonPressed(3);
  }
  public get buttonBack() {
    return this.isButtonPressed(8);
  }
  public get buttonStart() {
    return this.isButtonPressed(9);
  }

  public get y(): number {
    if (this._gamepadIndex !== null) {
      const gamepad = navigator.getGamepads()[this._gamepadIndex];
      return gamepad ? gamepad.axes[1] : 0;
    }
    return 0;
  }
  public get x(): number {
    if (this._gamepadIndex !== null) {
      const gamepad = navigator.getGamepads()[this._gamepadIndex];
      return gamepad ? gamepad.axes[0] : 0;
    }
    return 0;
  }

  //   public update() {
  //     if (this._gamepadIndex !== null) {
  //       const gamepad = navigator.getGamepads()[this._gamepadIndex];
  //       if (gamepad) {
  //         // Update the previous buttons array with the current buttons state
  //         this._previousButtons = gamepad.buttons.map((button) => ({
  //           ...button,
  //         }));
  //       }
  //     }
  //   }

  public isButtonPressed(buttonIndex: number): boolean {
    if (this._gamepadIndex !== null) {
      const gamepad = navigator.getGamepads()[this._gamepadIndex];
      return gamepad ? gamepad.buttons[buttonIndex].pressed : false;
    }
    return false;
  }

  //   public wasButtonReleased(buttonIndex: number): boolean {
  //     if (
  //       this._gamepadIndex !== null &&
  //       this._previousButtons.length > buttonIndex
  //     ) {
  //       const gamepad = navigator.getGamepads()[this._gamepadIndex];
  //       if (gamepad) {
  //         // Check if the button was pressed in the previous state and is not pressed now
  //         return (
  //           this._previousButtons[buttonIndex].pressed &&
  //           !gamepad.buttons[buttonIndex].pressed
  //         );
  //       }
  //     }
  //     return false;
  //   }
}

export default Gamepad;
