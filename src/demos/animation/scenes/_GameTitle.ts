import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";
import * as Events from "../events";
import { store } from "../store";

export class GameTitle extends Cluster.Scene {
  constructor() {
    super();

    // entities

    // systems

    // listeners
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    store.processEvents();
  }
}
