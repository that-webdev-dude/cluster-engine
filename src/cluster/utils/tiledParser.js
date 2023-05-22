/**
 * getLayerByName
 *
 * extract a specifuc tiled layer by name
 *
 * @param {Array} layers tiled exported array of layers
 * @param {String} name name of the raw layer
 * @returns tiled raw layer
 */
function getLayerByName(layers = [], name = "") {
  const layer = layers.find((l) => l.name === name);
  if (!layer) throw new Error(`Tiled error: missing layer ${name}`);
  return layer;
}

/**
 * tiledParser
 *
 * takes in input the Tiled level exported in JSON format.
 * returns an object containing the input to instantiate a new  TimeMap
 *
 * @param {*} tiledMapJSON JSON file exported from Tiled
 * @returns {Object} Object containing the metatada about the map
 */
function tiledParser(tiledMapJSON) {
  const {
    tileheight: tileH,
    tilewidth: tileW,
    height: mapH,
    width: mapW,
    layers,
    tilesets,
  } = tiledMapJSON;

  const tileMapInput = {};
  return tileMapInput;
}
export default tiledParser;
