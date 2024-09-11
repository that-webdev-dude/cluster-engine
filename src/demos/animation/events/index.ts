import * as Cluster from "../../../cluster";

export interface BoundaryCollisionEvent extends Cluster.Event {
  type: "boundary-collision";
  data: {
    entity: Cluster.Entity;
    collisionEdge: "top" | "right" | "bottom" | "left";
  };
}

export interface EntityDestroyedEvent extends Cluster.Event {
  type: "entity-destroyed";
  data: {
    entity: Cluster.Entity;
  };
}

export interface GamePlayEvent extends Cluster.Event {
  type: "game-play";
}

export interface GameOverEvent extends Cluster.Event {
  type: "game-over";
}

export interface GameTitleEvent extends Cluster.Event {
  type: "game-title";
}
