// import Ball from "../entities/Ball";
// import Wall from "../entities/Wall";
import cluster from "../cluster/index";
// prettier-ignore
const { 
  Container, 
  Physics, 
  Vector, 
  math,
  entity,

  Text,

  Capsule,
  Circle,
  Rect,
  Line,
  Polygon,
} = cluster;

// class Capsule {
//   constructor(
//     { radius = 25, width = 100, height = 100, style = { fill: "red" }, position = new Vector() } = {
//       radius: 100,
//       width: 200,
//       height: 200,
//       style: { fill: "red" },
//       position: new Vector(),
//     }
//   ) {
//     this.radius = radius;
//     this.height = height;
//     this.width = width;
//     this.style = style;
//     this.position = position;

//     this.center = entity.center(this);
//     console.log("file: GamePlayScreen.js ~ line 31 ~ Capsule ~ this.center", this.center);
//   }

//   update(dt, t) {
//     // this.angle += 0.05;
//     // if (this.angle >= Math.PI * 2) this.angle = 0;
//   }
// }

class GamePlayScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();

    const gameW = game.width;
    const gameH = game.height;

    this.capsule = this.add(new Capsule());
    this.capsule.position = new Vector(0, 0);
    // console.log(
    //   "file: GamePlayScreen.js ~ line 54 ~ GamePlayScreen ~ constructor ~ this.capsule",
    //   this.capsule
    // );

    this.rect = this.add(new Rect({ width: 64, height: 63 }));
    this.rect.position = new Vector(100, 100);
    // console.log(
    //   "file: GamePlayScreen.js ~ line 57 ~ GamePlayScreen ~ constructor ~ this.rect",
    //   this.rect
    // );

    this.circle = this.add(new Circle());
    this.circle.position = new Vector(200, 200);
    // console.log(
    //   "file: GamePlayScreen.js ~ line 53 ~ GamePlayScreen ~ constructor ~ this.rect",
    //   this.circle
    // );

    this.poly = this.add(
      new Polygon({
        path: [
          { x: 0, y: 0 },
          { x: 320, y: 64 },
          { x: 0, y: 0 },
          { x: 640, y: 32 },
          { x: 0, y: 0 },
        ],
      })
    );

    // DEBUG! ----------------------------------------------------------------------
    // this.add(
    //   new Line({
    //     start: new Vector(),
    //     end: this.capsule.start,
    //     style: { stroke: "green" },
    //   })
    // );
    // this.add(
    //   new Line({
    //     start: new Vector(),
    //     end: this.capsule.end,
    //     style: { stroke: "blue" },
    //   })
    // );
    // this.add(
    //   new Line({
    //     start: new Vector(),
    //     end: this.capsule.position,
    //     style: { stroke: "cyan" },
    //   })
    // );
    // this.add(
    //   new Line({
    //     start: this.capsule.start,
    //     end: this.capsule.end,
    //     style: { stroke: "black" },
    //   })
    // );
    // END DEBUG! ------------------------------------------------------------------

    // add walls
    // const walls = new Container();
    // const edges = [
    //   [0, 0, gameW, 0],
    //   [gameW, 0, gameW, gameH],
    //   [gameW, gameH, 0, gameH],
    //   [0, gameH, 0, 0],
    // ].map((e) => {
    //   let [x1, y1, x2, y2] = e;
    //   return new Line({
    //     start: new Vector(x1, y1),
    //     end: new Vector(x2, y2),
    //     style: { stroke: "transparent" },
    //   });
    // });
    // edges.forEach((edge) => walls.add(edge));

    // // add player & balls
    // const balls = new Container();
    // const player = balls.add(
    //   new Ball({
    //     position: new Vector(100, 100),
    //     style: {
    //       stroke: "black",
    //     },
    //     input: input,
    //     radius: 64,
    //     mass: 1,
    //   })
    // );
    // for (let i = 0; i < 1; i++) {
    //   const bx = math.rand(0, gameW);
    //   const by = math.rand(0, gameH);
    //   const br = math.rand(16, 64);
    //   const bm = math.rand(1, 5);
    //   const b = new Ball({
    //     position: new Vector(bx, by),
    //     style: { fill: "#564BFF", stroke: "black" },
    //     radius: br,
    //     mass: bm,
    //   });
    //   balls.add(b);
    // }

    // this.player = player;
    // this.balls = this.add(balls);
    // this.walls = this.add(walls);
    // this.wall = walls.add(
    //   new Line({
    //     start: new Vector(100, 450),
    //     end: new Vector(600, 350),
    //     style: { stroke: "blue" },
    //   })
    // );
  }

  updateDebug() {
    // // bottom right indicator
    // let aStart = this.debugCircle.position.clone();
    // let aEnd = this.debugCircle.position.clone().add(
    //   this.player.velocity
    //     .clone()
    //     .normalize()
    //     .scale(this.player.velocity.magnitude * 5)
    // );
    // this.debugVel.path = [aStart, aEnd];
    // // player to wall
    // let b2wStart = this.player.position.clone();
    // let b2wEnd = this.player.position.clone().add(Physics.closestPoint_cw(this.player, this.wall));
    // this.debugWall.path = [b2wStart, b2wEnd];
  }

  update(dt, t) {
    super.update(dt, t);

    // this.capsule.position.x += 1;

    // let balls = this.balls.children;
    // let walls = this.walls.children;

    // for (let i = 0; i < balls.length; i++) {
    //   const a = balls[i];
    //   // circle to wall collision detection
    //   for (let k = 0; k < walls.length; k++) {
    //     const w = walls[k];
    //     if (Physics.collisionDetection_cw(a, w)) {
    //       Physics.penetrationResolution_cw(a, w);
    //       Physics.collisionResolution_cw(a, w);
    //     }
    //   }
    //   // circle to circle collision detection and resolution
    //   for (let j = i + 1; j < balls.length; j++) {
    //     const b = balls[j];
    //     if (Physics.collisionDetection_cc(a, b)) {
    //       Physics.penetrationResolution_cc(a, b);
    //       Physics.collisionResolution_cc(a, b);
    //     }
    //   }
    // }

    // debug

    this.updateDebug();
  }
}

export default GamePlayScreen;
