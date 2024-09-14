import * as Cluster from "../../../cluster";

interface TrackerOptions {
  subject: Cluster.Entity;
}

/** Tracker component
 * the tracker component is used to store the subject position of an entity
 * @tag Tracker
 * @options subject
 * @properties subject
 */
class TrackerComponent extends Cluster.Component {
  subject: Cluster.Entity;

  constructor({ subject }: TrackerOptions) {
    super("Tracker");
    this.subject = subject;
  }
}

export { TrackerComponent };
