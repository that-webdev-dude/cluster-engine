type Callback = () => void;
type ProgressCallback = (remaining: number, total: number) => void;
type AssetMaker = (
  url: string,
  onAssetLoad: (e: Event | string) => void
) => any;

let cache: { [key: string]: any } = {};
let readyListeners: Callback[] = [];
let progressListeners: ProgressCallback[] = [];

let completed = false;
let remaining = 0;
let total = 0;

function done(): void {
  completed = true;
  readyListeners.forEach((cb) => cb());
}

function onAssetLoad(e: Event | string): void {
  if (completed) {
    console.warn("Warning: asset defined after preload.", e);
    return;
  }

  remaining--;
  progressListeners.forEach((cb) => cb(total - remaining, total));
  if (remaining === 0) {
    done();
  }
}

function load(url: string, maker: AssetMaker): any {
  let cacheKey = url;
  while (cacheKey.startsWith("../")) {
    cacheKey = url.slice(3);
  }
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }
  const asset = maker(url, onAssetLoad);
  remaining++;
  total++;

  cache[cacheKey] = asset;
  return asset;
}

const Assets = {
  get completed() {
    return completed;
  },

  onReady(cb: Callback): void | Callback {
    if (completed) {
      return cb();
    }

    readyListeners.push(cb);
    if (remaining === 0) {
      done();
    }
  },

  onProgress(cb: ProgressCallback): void {
    progressListeners.push(cb);
  },

  image(url: string): HTMLImageElement {
    return load(url, (url, onAssetLoad) => {
      const img = new Image();
      img.src = url;
      img.addEventListener("load", onAssetLoad, false);
      return img;
    });
  },

  sound(url: string): HTMLAudioElement {
    return load(url, (url, onAssetLoad) => {
      const audio = new Audio();
      audio.src = url;
      const onLoad = (e: Event) => {
        audio.removeEventListener("canplay", onLoad);
        onAssetLoad(e);
      };
      audio.addEventListener("canplay", onLoad, false);
      return audio.cloneNode() as HTMLAudioElement;
    });
  },

  soundBuffer(url: string, ctx: AudioContext): Promise<AudioBuffer> {
    return load(url, (url, onAssetLoad) =>
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then(
          (ab) =>
            new Promise((success) => {
              ctx.decodeAudioData(ab, (buffer) => {
                onAssetLoad(url);
                success(buffer);
              });
            })
        )
    );
  },

  font(name: string, url: string): Promise<void> {
    return load(url, (url, onAssetLoad) => {
      const fontFace = new FontFace(name, `url(${url})`);
      (document.fonts as any).add(fontFace);
      return fontFace.load().then(() => {
        onAssetLoad(url);
      });
    });
  },

  json(url: string): Promise<any> {
    return load(url, (url, onAssetLoad) =>
      fetch(url)
        .then((res) => res.json())
        .then((json) => {
          onAssetLoad(url);
          return json;
        })
    );
  },
};

export default Assets;
