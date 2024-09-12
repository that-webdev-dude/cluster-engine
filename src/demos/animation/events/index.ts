import * as Cluster from "../../../cluster";

// animation events
export interface AnimationChangeEvent extends Cluster.Event {
  type: "animation-change";
  data: {
    entity: Cluster.Entity;
    animationName: string;
  };
}

// boundary events
export interface BoundaryCollisionEvent extends Cluster.Event {
  type: "boundary-collision";
  data: {
    entity: Cluster.Entity;
    collisionEdge: "top" | "right" | "bottom" | "left";
  };
}

// entity events
export interface EntityDestroyedEvent extends Cluster.Event {
  type: "entity-destroyed";
  data: {
    entity: Cluster.Entity;
  };
}

// game events
export interface GamePlayEvent extends Cluster.Event {
  type: "game-play";
}

export interface GameOverEvent extends Cluster.Event {
  type: "game-over";
}

export interface GameTitleEvent extends Cluster.Event {
  type: "game-title";
}
