class Debugger {
  static noLogs = 0;

  static slowMo = (input, game) => {
    if (input.keys.key("Digit1")) {
      game.speed = Math.min(game.speed + 0.25, 5);
      input.keys.key("Digit1", false);
    }
    if (input.keys.key("Digit2")) {
      game.speed = Math.max(0.25, game.speed - 0.25);
      input.keys.key("Digit2", false);
    }
    if (input.keys.key("Digit3")) {
      game.speed = 1;
      input.keys.key("Digit3", false);
    }
  };

  static dialog = (input, game) => {
    // need to hook this to a dialog component
    // import DebugDialog from "../dialogs/DebugDialog";
    if (input.keys.key("Digit0")) {
      if (!game.debugDialog) {
        game.debugDialog = game.scene.add(new DebugDialog(game));
      } else {
        game.scene.remove(game.debugDialog);
        game.debugDialog = null;
      }
      input.keys.key("Digit0", false);
    }
  };
}

export default Debugger;
