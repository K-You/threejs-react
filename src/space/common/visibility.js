import { Vector3 } from 'three';
import math from './math.js';

class VisibilityGrid {
  constructor(bounds, dimensions) {
    const [x, y] = dimensions;
    this.cells = [...Array(x)].map(_ => [...Array(y)].map(_ => ({}))); 
    this.dimensions = dimensions;
    this.bounds = bounds;

    this.cellSize = bounds[1].clone().sub(bounds[0]);
    this.cellSize.multiply(new Vector3(1.0 / dimensions[0], 0, 1.0 / dimensions[1]));

    this.globalItems = [];
  }

  addGlobalItem(entity) {
    this.globalItems.push(entity);
  }

  getGlobalItems() {
    return [...this.globalItems];
  }

  updateItem(uuid, entity, previous=null) {
    const [x,y] = this.getCellIndex(entity.Position);

    if(previous){
      const [prevX, prevY] = previous;
      if(prevX === x && prevY === y) {
        return [x,y];
      }
      delete this.cells[prevX][prevY][uuid];
    }
    this.cells[x][y][uuid] = entity;
    return [x,y];
  }

  getLocalEntities(position, radius) {
    const [x,y] = this.getCellIndex(position);

    const cellSize = Math.min(this.cellSize.x, this.cellSize.z);
    const cells = Math.ceil(radius / cellSize);

    let local = [];
    const xMin = Math.max(x - cells, 0);
    const yMin = Math.max(y - cells, 0);
    const xMax = Math.min(this.dimensions[0] - 1, x+cells);
    const yMax = Math.min(this.dimensions[1] - 1, y+cells);

    for(let xi = xMin; xi<=xMax; xi++){
      for(let yi = yMin; yi<=yMax; yi++){
        local.push(...Object.values(this.cells[xi][yi]));
      }
    }

    local = local.filter((e) => {
      const distance = e.Position.distanceTo(position);
      return distance !== 0.0 && distance < radius;
    });

    return local;
  }

  getCellIndex(position) {
    const x = math.sat((this.bounds[0].x - position.x) / (this.bounds[0].x - this.bounds[1].x));
    const y = math.sat((this.bounds[0].z - position.z) / (this.bounds[0].z - this.bounds[1].z));

    const xIndex = Math.floor(x * (this.dimensions[0] - 1));
    const yIndex = Math.floor(y * (this.dimensions[1] - 1));

    return [xIndex, yIndex];
  }
}

export const visibility = {
  VisibilityGrid
}