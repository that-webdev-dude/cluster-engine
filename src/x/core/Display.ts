type RendererOptions = {
  parentElementId?: string;
  height?: number;
  width?: number;
};

export class Display {
  readonly height: number;
  readonly width: number;
  readonly view: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;

  constructor({
    parentElementId = "",
    height = 640,
    width = 832,
  }: RendererOptions = {}) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Failed to get 2D context");

    if (parentElementId) {
      let appElement = document.querySelector(parentElementId) as HTMLElement;
      canvas.width = width;
      canvas.height = height;
      appElement.appendChild(canvas);
    }

    this.context = context;
    this.height = height;
    this.width = width;
    this.view = canvas;

    this.initialize();
  }

  initialize() {
    // set device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    this.view.width = this.width * dpr;
    this.view.height = this.height * dpr;
    this.view.style.width = `${this.width}px`;
    this.view.style.height = `${this.height}px`;
    this.context.scale(dpr, dpr);

    this.context.textBaseline = "top";
    this.context.imageSmoothingEnabled = true;
    document.addEventListener("keypress", (event) => {
      if (event.code === "KeyF") {
        this.toggleFullScreen();
      }
    });
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.view.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}
