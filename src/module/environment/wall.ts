import { Environment } from "./environment";

export class Wall extends Environment {
  // 地形网格数据（0=空地，1=地块）
  // terrainMapForWall = [
  //   [1, 1, 0, 0],
  //   [1, 1, 1, 0],
  //   [0, 1, 1, 1],
  //   [0, 0, 1, 0]
  // ]
  // private cellSize: number;
  private cornerRadius: number;

  constructor(x: number, y: number, width: number, height: number) {
    super({ x, y, width, height, envType: 'Wall', traversable: false, destroyable: true });
  }

  drawWall(x: number, y: number, terrainMap: number[][], offsetX: number, offsetY: number): void {
    const cellSize = this.width;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx);
  }
}