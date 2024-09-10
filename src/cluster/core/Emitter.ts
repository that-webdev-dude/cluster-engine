export type EventListener<T extends Event> = (event: T) => void;

export interface Emitter {
  on<T extends Event>(eventType: string, listener: EventListener<T>): void;
  off<T extends Event>(eventType: string, listener: EventListener<T>): void;
  once<T extends Event>(eventType: string, listener: EventListener<T>): void;
  emit<T extends Event>(event: T): void;
  clear(): void;
  removeAllListeners(eventType?: string): void;
  eventNames(): string[];
}

// export interface Event {
//   type: string;
//   data: any;
//   critical: boolean;
// }

export class Event {
  type: string;
  data: any;

  constructor(type: string, data: any = null) {
    this.type = type;
    this.data = data;
  }
}

export class ImmediateEmitter implements Emitter {
  private listeners: Map<string, EventListener<Event>[]> = new Map();

  on<T extends Event>(eventType: string, listener: EventListener<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener as EventListener<Event>);
  }

  once<T extends Event>(eventType: string, listener: EventListener<T>): void {
    const onceListener: EventListener<T> = (event) => {
      this.off(eventType, onceListener);
      listener(event);
    };
    this.on(eventType, onceListener);
  }

  off<T extends Event>(eventType: string, listener: EventListener<T>): void {
    this.removeListener(eventType, listener);
  }

  addListener<T extends Event>(
    eventType: string,
    listener: EventListener<T>
  ): void {
    this.on(eventType, listener);
  }

  removeListener<T extends Event>(
    eventType: string,
    listener: EventListener<T>
  ): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener as EventListener<Event>);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
  }

  emit<T extends Event>(event: T): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  clear(): void {
    this.listeners.clear();
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.clear();
    }
  }

  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }
}

export class QueuedEmitter implements Emitter {
  private listeners: Map<string, EventListener<Event>[]> = new Map();
  private queue: Event[] = [];

  on<T extends Event>(eventType: string, listener: EventListener<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener as EventListener<Event>);
  }

  once<T extends Event>(eventType: string, listener: EventListener<T>): void {
    const onceListener: EventListener<T> = (event) => {
      this.off(eventType, onceListener);
      listener(event);
    };
    this.on(eventType, onceListener);
  }

  off<T extends Event>(eventType: string, listener: EventListener<T>): void {
    this.removeListener(eventType, listener);
  }

  addListener<T extends Event>(
    eventType: string,
    listener: EventListener<T>
  ): void {
    this.on(eventType, listener);
  }

  removeListener<T extends Event>(
    eventType: string,
    listener: EventListener<T>
  ): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener as EventListener<Event>);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
  }

  emit<T extends Event>(event: T): void {
    this.queue.push(event);
  }

  processEvents(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        const listeners = this.listeners.get(event.type);
        if (listeners) {
          listeners.forEach((listener) => listener(event));
        }
      }
    }
  }

  clear(): void {
    this.queue = [];
    this.listeners.clear();
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.clear();
    }
  }

  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }
}

export class EventEmitter implements Emitter {
  private immediateEmitter: ImmediateEmitter = new ImmediateEmitter();
  private queuedEmitter: QueuedEmitter = new QueuedEmitter();

  on<T extends Event>(
    eventType: string,
    listener: EventListener<T>,
    critical: boolean = false
  ): void {
    if (critical) {
      this.immediateEmitter.on(eventType, listener);
    } else {
      this.queuedEmitter.on(eventType, listener);
    }
  }

  once<T extends Event>(
    eventType: string,
    listener: EventListener<T>,
    critical: boolean = false
  ): void {
    if (critical) {
      this.immediateEmitter.once(eventType, listener);
    } else {
      this.queuedEmitter.once(eventType, listener);
    }
  }

  off<T extends Event>(
    eventType: string,
    listener: EventListener<T>,
    critical: boolean = false
  ): void {
    if (critical) {
      this.immediateEmitter.off(eventType, listener);
    } else {
      this.queuedEmitter.off(eventType, listener);
    }
  }

  addListener<T extends Event>(
    eventType: string,
    listener: EventListener<T>,
    critical: boolean = false
  ): void {
    this.on(eventType, listener, critical);
  }

  removeListener<T extends Event>(
    eventType: string,
    listener: EventListener<T>,
    critical: boolean = false
  ): void {
    this.off(eventType, listener, critical);
  }

  emit<T extends Event>(event: T, critical: boolean = false): void {
    if (critical) {
      this.immediateEmitter.emit(event);
    } else {
      this.queuedEmitter.emit(event);
    }
  }

  processEvents(): void {
    this.queuedEmitter.processEvents();
  }

  clear(): void {
    this.immediateEmitter.clear();
    this.queuedEmitter.clear();
  }

  removeAllListeners(eventType?: string): void {
    this.immediateEmitter.removeAllListeners(eventType);
    this.queuedEmitter.removeAllListeners(eventType);
  }

  eventNames(): string[] {
    return Array.from(
      new Set([
        ...this.immediateEmitter.eventNames(),
        ...this.queuedEmitter.eventNames(),
      ])
    );
  }
}
