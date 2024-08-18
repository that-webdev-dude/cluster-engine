import { store } from "../store";
import * as Cluster from "../../cluster";

/** ScoresComponent
 * @properties scores
 * @dependencies store
 */
export class ScoresComponent extends Cluster.Component {
  constructor() {
    super("Scores");
  }

  get scores() {
    return store.get("scores");
  }
}
