import { Display } from "./cluster";
import { Engine } from "./cluster";

export default () => {
  const display = new Display({
    canvas: document.querySelector("#display"),
  });
};
