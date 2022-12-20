const cache = {};
const readyListeners = [];
const progressListeners = [];

let completed = false;
let remaining = 0;
let total = 0;

const load = (url, maker) => {
  if (cache[url]) return cache[url];
  const asset = maker(url, onAssetLoad);
  remaining++;
  total++;
  cache[url] = asset;
  return asset;
};

const onAssetLoad = (e) => {
  if (completed) {
    console.warn("Warning: asset defined after preload!", e.target);
    return;
  }
  // update listeners with the new state
  remaining--;
  progressListeners.forEach((cb) => cb(total - remaining, total));

  // sets the completed flag to true
  // calls the onReady Listeners
  if (remaining === 0) {
    done();
  }
};

function done() {
  completed = true;
  readyListeners.forEach((cb) => cb());
}

const Assets = {
  onReady(cb) {
    if (remaining === 0) {
      readyListeners.push(cb);
      done();
    } else {
      readyListeners.push(cb);
    }
    // readyListeners.push(cb);
    // if (remaining === 0) {
    //   done();
    // }
  },

  onProgress(cb) {
    progressListeners.push(cb);
  },

  // load an image
  image(url) {
    return load(url, (url, onAssetLoad) => {
      const img = new Image();
      img.src = url;
      img.addEventListener("load", onAssetLoad, false);
      return img;
    });
  },

  // load a sound
  sound(url) {
    return load(url, (url, onAssetLoad) => {
      const audio = new Audio();
      audio.src = url;
      const onLoad = (e) => {
        audio.removeEventListener("canplay", onLoad);
        onAssetLoad(e);
      };
      audio.addEventListener("canplay", onLoad, false);
      return audio;
    }).cloneNode();
  },

  // load a sound buffer
  soundBuffer(url, audioContext) {
    return load(url, async (url, onAssetLoad) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const soundBuffer = await audioContext.decodeAudioData(arrayBuffer);
      onAssetLoad(url);
      return soundBuffer;
      // fetch(url)
      //   .then((res) => res.arrayBuffer())
      //   .then((ab) => {
      //     return new Promise((resolve, reject) => {
      //       audioContext.decodeAudioData(ab, (buffer) => {
      //         onAssetLoad(url);
      //         resolve(buffer);
      //       });
      //     });
      //   });
    });
  },
};

export default Assets;
