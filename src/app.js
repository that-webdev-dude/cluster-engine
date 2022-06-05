import { Engine } from "./cluster";

export default () => {
  // game setup
  // ...

  const gameLoop = new Engine(
    () => {
      // game update logic
    },
    () => {
      // game rendering
    }
  );
};
