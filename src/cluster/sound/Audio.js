const hasWebAudio = !!window.AudioContext;
let context = null;
let master = null;

/**
 * TODO
 * extend this to have two separate channels
 * sfx channel
 * music channel
 * both connected to a master channel
 * to control all the relevant sfx & music
 * sounds independently
 */

export default {
  hasWebAudio,
  get master() {
    return master;
  },
  get context() {
    if (!context && hasWebAudio) {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 1;
      master.connect(context.destination);
    }
    return context;
  },
};
