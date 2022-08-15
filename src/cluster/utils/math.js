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
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return Math.atan2(dx, dy);
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

export default {
  rand,
  randf,
  randOneIn,
  randOneFrom,
  distance,
  angle,
  clamp,
};
