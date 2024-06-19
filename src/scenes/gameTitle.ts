import { Scene, Container, Entity, System } from "../cluster";
import { Systems } from "../cluster/ecs";
import { store, GameScene } from "../store/store";
import { TitleBackground } from "../entities/Background";
import { UITitle } from "../entities/UITitle";

const entities = new Container<Entity>();
entities.add(new TitleBackground());
entities.add(new UITitle());

const systems = new Container<System>();
systems.add(new Systems.Input(entities));
systems.add(new Systems.Render(entities));

const setGamePlay = (event: Event) => {
  event.preventDefault();
  document.removeEventListener("keydown", setGamePlay);
  store.dispatch("setScene", GameScene.PLAY);
  store.dispatch("reset");
};

document.addEventListener("keydown", setGamePlay);

const gameTitle = new Scene({
  name: "gameTitle",
  entities,
  systems,
  store,
});

export { gameTitle };
