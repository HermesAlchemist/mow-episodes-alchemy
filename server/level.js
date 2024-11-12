const fs = require('fs');
const path = require('path');

class Level {
  constructor() {
    // Load the tileset properties
    const tilesetData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'level.json'), 'utf8')
    );

    // Load the map data
    const mapData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../client/assets/maps/level.json'), 'utf8')
    );

    this.tileWidth = mapData.tilewidth;
    this.tileHeight = mapData.tileheight;
    this.width = mapData.width;
    this.height = mapData.height;

    // Create collision map
    this.collisionMap = this.createCollisionMap(tilesetData, mapData);
  }

  createCollisionMap(tilesetData, mapData) {
    // Create a 2D array filled with false
    const collisionMap = Array(mapData.height).fill().map(() => 
      Array(mapData.width).fill(false)
    );

    // Get collideable tile IDs
    const collideableTiles = new Set();
    tilesetData.tiles?.forEach(tile => {
      if (tile.properties?.some(prop => prop.name === 'collideable' && prop.value === true)) {
        collideableTiles.add(tile.id + 1); // Add 1 because Tiled uses 1-based indexing
      }
    });

    // Process both layers
    mapData.layers.forEach(layer => {
      const data = layer.data;
      for (let y = 0; y < mapData.height; y++) {
        for (let x = 0; x < mapData.width; x++) {
          const tileId = data[y * mapData.width + x];
          if (collideableTiles.has(tileId)) {
            collisionMap[y][x] = true;
          }
        }
      }
    });

    return collisionMap;
  }

  isColliding(x, y) {
    // Convert world coordinates to tile coordinates
    const tileX = Math.floor(x / this.tileWidth);
    const tileY = Math.floor((y + 24) / this.tileHeight);

    // Check bounds
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return true; // Collide with world boundaries
    }

    return this.collisionMap[tileY][tileX];
  }
}

module.exports = Level; 