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

    if (!context)
      throw new Error("[Display Error]: Failed to get Canvas 2D context");

    if (parentElementId) {
      let appElement = document.querySelector(parentElementId) as HTMLElement;

      if (!appElement)
        throw new Error("[Display Error]: Failed to get HTML parent element");

      canvas.width = width;
      canvas.height = height;
      appElement.appendChild(canvas);
    }

    this.context = context;
    this.height = height;
    this.width = width;
    this.view = canvas;

    this._initialize();
  }

  private _initialize() {
    this.context.textBaseline = "top";
    this.context.imageSmoothingEnabled = true;
    document.addEventListener("keypress", (event) => {
      if (event.code === "KeyF") {
        this._toggleFullScreen();
      }
    });
  }

  private _toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.view.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}
