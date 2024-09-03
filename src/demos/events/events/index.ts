import * as Cluster from "../../../cluster";

// generic events
export interface EntityEvent extends Cluster.Event {
  data: {
    entity: Cluster.Entity;
  };
}

export interface SystemErrorEvent extends Cluster.Event {
  type: "system-error";
  data: {
    origin: string; // The name of the system that threw the error;
    error: any;
  };
}

export interface EntityCreatedEvent extends Cluster.Event {
  type: "entity-created";
  data: {
    entity: Cluster.Entity;
  };
}

export interface EntityDestroyedEvent extends Cluster.Event {
  type: "entity-destroyed";
  data: {
    entity: Cluster.Entity;
  };
}

export interface EntityHitEvent extends Cluster.Event {
  type: "entity-hit";
  data: {
    entityA: Cluster.Entity;
    entityB: Cluster.Entity;
  };
}

export interface CountIncrementedEvent extends Cluster.Event {
  type: "count-incremented";
  data: {
    count: number;
  };
}

export interface CountDecrementedEvent extends Cluster.Event {
  type: "count-decremented";
  data: {
    count: number;
  };
}

export interface CountResetEvent extends Cluster.Event {
  type: "count-reset";
  data: {
    count: number;
  };
}
