import { Component } from "../../core/Component";
import { Assets } from "../../core/Assets";

// Interface for component properties
export interface TextureOptions {
  imageURL: string;
}

// Texture Component
export class TextureComponent implements Component {
  image: HTMLImageElement;

  constructor({ imageURL }: TextureOptions) {
    if (!imageURL || typeof imageURL !== "string" || imageURL.trim() === "") {
      throw new TypeError(
        "[TextureComponent]: imageURL must be a non-empty string"
      );
    }

    this.image = Assets.image(imageURL);
    if (!this.image) {
      throw new Error(
        `[TextureComponent]: Failed to load image from ${imageURL}`
      );
    }
  }

  get width(): number {
    return this.image.width;
  }

  get height(): number {
    return this.image.height;
  }
}
