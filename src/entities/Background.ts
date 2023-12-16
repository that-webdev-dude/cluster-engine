import { Rect } from "../ares";

type BackgroundConfig = {
  width: number;
  height: number;
};

class Background extends Rect {
  constructor(config: BackgroundConfig) {
    const { width, height } = config;
    super({ width, height, fill: "#000" });
  }
}

export default Background;
