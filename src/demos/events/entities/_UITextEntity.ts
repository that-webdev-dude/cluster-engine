import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { store } from "../store";

export class UITextEntity extends Cluster.Entity {
  constructor() {
    super();

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(300, 300),
    });

    const textComponent = new Components.TextComponent({
      text: `${store.get("count")}`,
      font: "24px Arial",
      fill: "white",
      align: "center",
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 2,
    });

    this.components.set("Transform", transformComponent);
    this.components.set("Text", textComponent);
    this.components.set("Zindex", zindexComponent);

    store.on(
      "count-incremented",
      (event: Events.CountIncrementedEvent) => {
        textComponent.text = `${event.data.count}`;
      },
      true
    );
  }
}
