// ThatWebdevDude - 2022

import math from "../utils/math";

class NodeBase {
  /**
   * NodeBase
   * Elementary element model of the pathfinder nodeMap
   * @param {{x: number, y: number }} position node xy map coordinates
   * @param {boolean} walkable node walkable flag
   */
  constructor(position = null, walkable = true) {
    this.walkable = walkable;
    this.position = position;
    this.neighbors = [];
    this.connection = null;
    this.initialize();
  }

  /**
   * F getter
   * computed F score from G + D
   */
  get F() {
    return this.G + this.H;
  }

  /**
   * G setter
   * @param {number} value
   */
  setG(value) {
    this.G = value;
  }

  /**
   * H setter
   * @param {number} value
   */
  setH(value) {
    this.H = value;
  }

  /**
   * connection setter
   * @param {NodeBase} nodeBase
   */
  setConnection(nodeBase) {
    this.connection = nodeBase;
  }

  /**
   * set this node base
   * to its initial values
   */
  initialize() {
    this.isStart = false;
    this.isTarget = false;
    this.connection = null;
    this.processed = false;
    this.G = 0;
    this.H = 0;
  }
}

class Pathfinder {
  /**
   * Pathfinder
   * Handles the in-game pathfinding using the A* algorithm.
   * @param {Array<{position: Object, walkable: boolean}>} nodeMap array of map positions and walkable flag
   * @return {Pathfinder}
   */
  constructor(nodeMap) {
    // prettier-ignore
    this.nodeMap = nodeMap.map(node => {
      const { position, walkable } = node
      return new NodeBase(
        position, 
        walkable || false
      )
    })

    this.#initialize();
  }

  /**
   * initialize()
   * cache the neighbor nodes for each
   * node belonging to this nodeMap
   * @return {void}
   * @private
   */
  #initialize() {
    this.nodeMap.forEach((node) => {
      node.neighbors = this.#neighbors(node);
    });
  }

  /**
   * reset()
   * re-initialise the used nodes
   * from the previous find
   * @returns {void}
   * @private
   */
  #reset() {
    this.nodeMap.forEach((node) => {
      node.initialize();
    });
  }

  /**
   * distance()
   * Computes the euclidean distance between the
   * two nodes passed in.
   * @param {NodeBase} node1 first node
   * @param {NodeBase} node2 second node
   * @returns {number} distance between the two nodes
   * @private
   */
  #distance(node1, node2) {
    const { position: pos1 } = node1;
    const { position: pos2 } = node2;
    return math.distance(pos1, pos2);
  }

  /**
   * neighbors()
   * returns an array of nodes sourrounding the
   * main node passed in as parameter.
   * the teturned nodes are walkable and not processed
   * @param {NodeBase} node main node
   * @returns {Array<NodeBase>} neighbor nodes
   * @private
   */
  #neighbors(mainNode) {
    const minX = mainNode.position.x - 1;
    const maxX = mainNode.position.x + 1;
    const minY = mainNode.position.y - 1;
    const maxY = mainNode.position.y + 1;
    return this.nodeMap
      .filter((node) => {
        const { x, y } = node.position;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      })
      .filter((node) => {
        return node.walkable && !node.processed;
      })
      .filter((node) => {
        return node !== mainNode;
      });
  }

  /**
   * getNode()
   * Returns the node at the specified mapPosition
   * @param {Object} mapPosition the xy map coordinates of the node to find
   * @returns {NodeBase} the node at the "mapPosition"
   * @private
   */
  #getNode(mapPosition) {
    return this.nodeMap.find((node) => {
      const { position } = node;
      return position.x === mapPosition.x && position.y === mapPosition.y;
    });
  }

  /**
   * find()
   * Finds the shortest path from the "startPosition"
   * to the "endPosition". Returns an arrey of map position coordinates
   * from the targetNode, backward to the starting node.
   * The returned coordinates are in map position.
   * @param {Object} startNode xy map position coordinates of the start point
   * @param {Object} targetNode xy map position coordinates of the end point
   * @returns {Array<{x,y}>} array of successive map points across the path
   * @public
   */
  find(startPosition, targetPosition) {
    const targetNode = this.#getNode(targetPosition);
    const startNode = this.#getNode(startPosition);
    startNode.isStart = true;
    targetNode.isTarget = true;

    if (!startNode.walkable || !targetNode.walkable) {
      return [];
    }

    let searchNodes = [startNode];
    let processedNodes = [];
    while (searchNodes.length > 0) {
      let currentNode = searchNodes[0];
      searchNodes.forEach((node) => {
        if (node.F < currentNode.F || (node.F === currentNode.F && node.H < currentNode.H)) {
          currentNode = node;
        }
      });

      currentNode.processed = true;
      searchNodes.shift();
      processedNodes.push(currentNode);

      if (currentNode.isTarget) {
        let currentPathNode = targetNode;
        let path = [startNode];
        let count = 100;
        while (currentPathNode !== startNode) {
          path.push(currentPathNode);
          currentPathNode = currentPathNode.connection;
          count--;
          if (count < 0) throw new Error("sdfsdf");
        }
        this.#reset();
        return path.map((node) => node.position);
      }

      // now search the neighbors
      const neighbors = currentNode.neighbors.filter((n) => !n.processed);
      neighbors.forEach((neighbor) => {
        let inSearch = searchNodes.includes(neighbor);
        let neighborCost = currentNode.G + this.#distance(currentNode, neighbor);
        if (!inSearch || neighborCost < neighbor.G) {
          neighbor.setG(neighborCost);
          neighbor.setConnection(currentNode);
          if (!inSearch) {
            neighbor.setH(this.#distance(neighbor, targetNode));
            searchNodes.push(neighbor);
          }
        }
      });
    }
  }

  /**
   * findAsync()
   */
  findAsync(startNode, targetNode) {
    return new Promise((resolve, reject) => {
      const path = this.find(startNode, targetNode);
      if (path) {
        resolve(path);
      } else {
        reject(new Error("Pathfinder: no path!"));
      }
    });
  }
}

export default Pathfinder;
