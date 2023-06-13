import cluster from "./cluster";

// cluster instances
// prettier-ignore
const { 
  Container,
  Rect,
  math,
  MouseControls,
  KeyControls, 
  Game 
} = cluster;

const game = new Game({
  width: 832,
  height: 640,
});

const input = {
  mouse: new MouseControls(),
  key: new KeyControls(),
};

export default () => {
  const sceneContainer = new Container();
  for (let i = 0; i < 100; i++) {
    const rectEntity = new Rect({
      width: math.rand(4, 32),
      height: math.rand(4, 32),
      style: { fill: "red" },
    });
    rectEntity.position = {
      x: math.rand(0, game.width - rectEntity.width),
      y: math.rand(0, game.height - rectEntity.height),
    };
    sceneContainer.add(rectEntity);
  }

  game.setScene(sceneContainer);

  game.run();
};
