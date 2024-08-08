// import { Component } from "../cluster";
// import { Assets } from "../cluster";

// // Component errors
// enum ComponentErrors {
//   InvalidImageURL = "[Texture]: imageURL must be a non-empty string",
//   FailedImageLoad = "[Texture]: Failed to load image from",
// }

// // Interface for component properties
// export interface ComponentOptions {
//   imageURL: string;
// }

// // Texture Component
// export class Texture implements Component {
//   readonly type = "Texture";
//   image: HTMLImageElement;

//   constructor({ imageURL }: ComponentOptions) {
//     if (!imageURL || typeof imageURL !== "string" || imageURL.trim() === "") {
//       throw new TypeError(ComponentErrors.InvalidImageURL);
//     }

//     this.image = Assets.image(imageURL);
//     if (!this.image) {
//       throw new Error(`${ComponentErrors.FailedImageLoad} ${imageURL}`);
//     }
//   }

//   get width(): number {
//     return this.image.width;
//   }

//   get height(): number {
//     return this.image.height;
//   }
// }
