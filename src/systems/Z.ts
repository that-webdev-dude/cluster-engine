// import { Container, Entity, System, Cmath } from "../cluster";

// // system dependencies
// const SystemComponents = {};

// // system errors
// enum SystemErrors {}

// // system cache
// let SystemCache = {
//   entities: new Container<Entity>(),
// };

// export class Template implements System {
//   systemType(): string {
//     return "Template";
//   }

//   systemComponents(): string[] {
//     return [];
//   }

//   update(entities: Container<Entity>): void {
//     if (!entities.size) return;

//     SystemCache.entities = entities.filter((entity) => true);

//     SystemCache.entities.forEach((entity) => {
//       // ...
//     });

//     SystemCache.entities.clear();
//   }
// }
