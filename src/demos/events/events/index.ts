import * as Cluster from "../../../cluster";

export interface BoundaryCollisionEvent {
  type: "boundary-collision";
  data: {
    entity: Cluster.Entity;
    collisionEdge: "top" | "right" | "bottom" | "left";
  };
}

export interface EntityDestroyedEvent {
  type: "entity-destroyed";
  data: {
    entity: Cluster.Entity;
  };
}
