class TiledParserTools {
  /**
   * getLayerbyName
   * @param {Array} layers Tiled layers array
   * @param {string} name layer name
   * @returns the layer raw data
   */
  static getLayerbyName(layers = [], name = "") {
    const layer = layers.find((l) => l.name === name);
    if (!layer)
      throw new Error(
        `Error: TiledParser ~ getLayerbyName ~ Layer ${name} is missing`
      );
    return layer;
  }

  /**
   * getTilesetByGID
   * @param {Object} tiledData
   * @param {number} tileGID tile grid index (according to Tiled convention)
   * @returns the tileset raw object
   */
  static getTilesetByGID(tiledData, tileGID) {
    const { tilesets } = tiledData;
    const tileset = tilesets.find((ts) => {
      const { firstgid, tilecount } = ts;
      return tileGID >= firstgid && tileGID < firstgid + tilecount;
    });
    if (!tileset) {
      throw new Error(
        `Error: TiledParser ~ getTilesetByGID ~ No tileset found based on tileGID: ${tileGID}`
      );
    } else {
      return tileset;
    }
  }

  /**
   * getTilePropertiesByGID
   * @param {Object} tiledData the raw tiled data
   * @param {number} tileGID the tile grid index
   * @returns the object containing a key-value representation of the tile properties
   */
  static getTilePropertiesByGID(tiledData, tileGID) {
    const tileset = this.getTilesetByGID(tiledData, tileGID);
    const { tiles, firstgid } = tileset;
    if (!tiles) {
      return {};
    } else {
      const tileIndex = tileGID - firstgid;
      const tile = tiles.find((t) => t.id === tileIndex);
      if (!tile) {
        console.warn(
          `Warning: TiledParser ~ getTilePropertiesByGID ~ tileGID ${tileGID} NOT found`
        );
        return {
          id: tileIndex,
          gid: tileGID,
        };
      } else {
        const tileProperties = {};
        const { properties } = tile;
        properties.forEach((property) => {
          tileProperties[property.name] = property.value;
        });
        return {
          id: tileIndex,
          gid: tileGID,
          ...tileProperties,
        };
      }
    }
  }

  /**
   * getTileCoordinatesByGID
   * @param {Object} tiledData the raw tiled data
   * @param {number} tileGID the tile grid index
   * @returns the xy coordinates of the tile within the texture matrix
   */
  static getTileCoordinatesByGID(tiledData, tileGID) {
    const tileset = this.getTilesetByGID(tiledData, tileGID);
    const { columns, firstgid } = tileset;
    const tileIndex = tileGID - firstgid;
    return {
      y: Math.floor(tileIndex / columns),
      x: tileIndex % columns,
    };
  }

  /**
   * parseTile
   * @param {Object} tiledData the raw tiled data
   * @param {number} tileGID the tile grid index
   * @returns the parsed tile object
   */
  static parseTile(tiledData, tileGID) {
    const tileCoordinates = this.getTileCoordinatesByGID(tiledData, tileGID);
    const tileProperties = this.getTilePropertiesByGID(tiledData, tileGID);
    return {
      ...tileCoordinates,
      ...tileProperties,
    };
  }
}

class TiledParser {
  /**
   * parseLevel
   * @param {Object} tiledData the raw tiled data
   * @returns object of a TileMap initialization properties
   */
  static parseLevel(tiledData) {
    const {
      tileheight: tileH,
      tilewidth: tileW,
      height: mapH,
      width: mapW,
      layers,
    } = tiledData;

    const { data } = TiledParserTools.getLayerbyName(layers, "level");
    const tiles = data.map((tileGID) => {
      return TiledParserTools.parseTile(tiledData, tileGID);
    });

    return { mapW, mapH, tileW, tileH, tiles };
  }

  /**
   * parseSpawns
   * @param {Object} tiledData the raw tiled data
   * @returns the spawns data
   */
  static parseSpawns(tiledData) {
    const { layers } = tiledData;
    const { objects } = TiledParserTools.getLayerbyName(layers, "spawns");
    return objects.map((obj) => {
      const { name, x, y } = obj;
      return {
        name,
        x,
        y,
      };
    });
  }
}

export default TiledParser;
