export class GAME_GLOBALS {
  static elapsedTime = 0;
  static isWin = false;

  static reset = () => {
    GAME_GLOBALS.elapsedTime = 0;
  };
}
