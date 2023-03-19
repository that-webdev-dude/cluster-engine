/**
 * Return an integer random number between min & max.
 * If max is "undefined" return a random number between 0 & min.
 * If min & max are "undefined" return a random number between 0 & 1.
 * @param {number} min lower limit
 * @param {number} max upper limit
 * @returns {number} integer random number between min:max or 0: min or 0:1
 */
function rand(min, max) {
  return Math.floor(randf(min, max));
}

/**
 * Generate a floating point random number between min & max.
 * If max is "undefined" return a random number between 0 & min.
 * If min & max are "undefined" return a random number between 0 & 1.
 * @param {number} min lower limit
 * @param {number} max upper limit
 * @returns {number} floating point random number between min:max or 0: min or 0:1
 */
function randf(min, max) {
  if (max == null) {
    max = min || 1;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

/**
 * Generate a boolean flag with given odds.
 * @param {number} odds number of odds (default is 2)
 * @returns {boolean} true with given "odds"
 */
function randOneIn(odds = 2) {
  return rand(0, odds) === 0;
}

/**
 * Pick a random element from an array.
 * @param {Array} items target array
 * @returns {*} picked array item
 */
function randOneFrom(items = []) {
  return items[rand(0, items.length)];
}

/**
 * Compute the euclidean distance between point a & b.
 * Points passed in must be Object type with x & y properties.
 * @param {Object} a x/y coordinate object
 * @param {Object} b x/y coordinate object
 * @returns {number} distance
 */
function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Compute the angle between two points a & b
 * @param {Object} a x/y coordinate object
 * @param {Object} b x/y coordinate object
 * @returns {number} angle between a & b in radians
 */
function angle(a, b) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  return Math.atan2(dx, dy);
}

/**
 * converts the angle value
 * from degrees to radians
 * @param {*} degrees
 * @returns {number} angle in radians
 */
function deg2rad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * converts the angle value
 * from radians to degree
 * @param {*} radians
 * @returns {number} angle in radians
 */
function rad2deg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Clamp the value to the provided min max limits
 * defined by min and max parameters
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number} clamped value
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/**
 * lerp - normalize the x parameter
 * between the min, max values
 * @param {number} x
 * @param {number} min
 * @param {number} max
 */
function lerp(x, min = 0, max = 1) {
  return (x - min) / (max - min);
}

/**
 * normalize - normalize the x parameter
 * between the min, max values
 * @param {number} x
 * @param {number} min
 * @param {number} max
 */
function normalize(x, min = 0, max = 1) {
  return lerp(x, min, max);
}

/**
 * easing functions collection
 */
const ease = {
  in(x, power) {
    if (power !== 1) {
      return Math.pow(x, power);
    } else {
      return x;
    }
  },

  out(x, power) {
    return 1 - this.in(1 - x, power);
  },

  quadIn(x) {
    return Math.pow(x, 2);
  },

  quadOut(x) {
    return 1 - this.quadIn(1 - x);
  },

  cubicIn(x) {
    return Math.pow(x, 3);
  },

  cubicOut(x) {
    return 1 - this.cubicIn(1 - x);
  },

  elasticOut(x) {
    // const c4 = (2 * Math.PI) / 3;
    // return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    // -----
    const p = 0.4;
    return Math.pow(2, -10 * x) * Math.sin(((x - p / 4) * (Math.PI * 2)) / p) + 1;
    // -----
    // return -1 * Math.pow(4, -8 * x) * Math.sin(((x * 6 - 1) * (2 * Math.PI)) / 2) + 1;
  },
};

export default {
  rand,
  randf,
  randOneIn,
  randOneFrom,
  distance,
  angle,
  rad2deg,
  deg2rad,
  clamp,
  lerp,
  normalize,
  ease,
};
