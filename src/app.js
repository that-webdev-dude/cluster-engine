// imports
import Matter from "../vendor/matter";

export default () => {
  const { Engine, Render, Runner, Bodies, Composite, World } = Matter;
  const height = 600;
  const width = 800;

  // game init !!!!!
  const engine = Engine.create();

  // bodies !!!!!
  // prettier-ignore
  const course =  Bodies.rectangle(
    width / 2, 
    height / 2, 
    width - 100, 
    48, 
    { isStatic: true } 
  );

  const balls = Array(50)
    .fill(0)
    .map((b) => {
      const radius = Math.random() * 25 + 5;
      const x = Math.random() * width;
      const y = Math.random() * -1000;
      const options = {
        restitution: 0.7,
      };

      return Bodies.circle(x, y, radius, options);
    });

  // world !!!!!
  World.add(engine.world, [course, ...balls]);
  Runner.run(engine);

  // debug render !!!!!
  const render = Render.create({
    element: document.querySelector("#app"),
    engine: engine,
    options: {
      width: width,
      height: height,
      showAngleIndicator: true,
    },
  });
  Render.run(render);
};
