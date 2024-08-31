import * as Cluster from "../../../cluster";

export interface SystemError extends Cluster.Event {
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
