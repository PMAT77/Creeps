import { gameMap } from "../core";
import Entity from "../entity";
import { Environment } from "./environment";

export class Wall extends Environment {
  private cellSize: number = this.width;
  private cornerRadius: number = this.cellSize / 4;

  private gridX: number = 0;
  private gridY: number = 0;

  constructor({ x, y, width, height, gridX, gridY }: { x: number, y: number, width: number, height: number, gridX: number, gridY: number }) {
    super({ x, y, width, height, envType: 'Wall', traversable: false, destroyable: true });

    this.gridX = gridX;
    this.gridY = gridY;
  }

  // drawWall(ctx: CanvasRenderingContext2D): void {
  //   ctx.save()
  //   // 设置阴影属性
  //   ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'; // 半透明黑色阴影
  //   ctx.shadowBlur = 15;                     // 模糊半径10px
  //   ctx.shadowOffsetX = 0;                   // 向右偏移5px
  //   ctx.shadowOffsetY = 0;

  //   ctx.strokeStyle = '#080906';
  //   ctx.lineWidth = 3;

  //   const gradient = ctx.createRadialGradient(
  //     this.centerPoint.x, this.centerPoint.y, this.cellSize / 4,
  //     this.centerPoint.x, this.centerPoint.y, this.cellSize
  //   );
  //   gradient.addColorStop(0, '#1f1f1f');
  //   gradient.addColorStop(1, '#1d1d1d');
  //   ctx.fillStyle = gradient;

  //   ctx.beginPath();
  //   ctx.moveTo(this.x + this.cornerRadius, this.y);
  //   ctx.lineTo(this.x + this.width - this.cornerRadius, this.y);
  //   ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.cornerRadius, this.cornerRadius);
  //   ctx.lineTo(this.x + this.width, this.y + this.height - this.cornerRadius); // 右边线
  //   ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - this.cornerRadius, this.y + this.height, this.cornerRadius); // 右下角圆弧
  //   ctx.lineTo(this.x + this.cornerRadius, this.y + this.height); // 下边线
  //   ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - this.cornerRadius, this.cornerRadius); // 左下角圆弧
  //   ctx.lineTo(this.x, this.y + this.cornerRadius); // 左边线
  //   ctx.arcTo(this.x, this.y, this.x + this.cornerRadius, this.y, this.cornerRadius); // 左上角圆弧
  //   ctx.closePath(); // 闭合路径
  //   ctx.stroke();

  //   ctx.fill();

  //   ctx.restore();
  // }
  // drawWall(ctx: CanvasRenderingContext2D): void {
  //   ctx.save();

  //   // 优化边框样式（更细、更暗）
  //   ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
  //   ctx.lineWidth = 1; // 减细边框

  //   // 优化径向渐变（扩大内圆半径，减少对比度）
  //   const gradient = ctx.createRadialGradient(
  //     this.centerPoint.x, this.centerPoint.y, this.cellSize / 3, // 增大内圆半径
  //     this.centerPoint.x, this.centerPoint.y, this.cellSize
  //   );
  //   gradient.addColorStop(0, '#1d1d1d'); // 稍亮的内部
  //   gradient.addColorStop(1, '#1a1a1a'); // 稍暗的边缘

  //   ctx.fillStyle = gradient;

  //   // 绘制圆角矩形
  //   ctx.beginPath();
  //   ctx.moveTo(this.x + this.cornerRadius, this.y);
  //   ctx.lineTo(this.x + this.width - this.cornerRadius, this.y);
  //   ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.cornerRadius, this.cornerRadius);
  //   ctx.lineTo(this.x + this.width, this.y + this.height - this.cornerRadius);
  //   ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - this.cornerRadius, this.y + this.height, this.cornerRadius);
  //   ctx.lineTo(this.x + this.cornerRadius, this.y + this.height);
  //   ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - this.cornerRadius, this.cornerRadius);
  //   ctx.lineTo(this.x, this.y + this.cornerRadius);
  //   ctx.arcTo(this.x, this.y, this.x + this.cornerRadius, this.y, this.cornerRadius);
  //   ctx.closePath();

  //   // 先填充再描边（顺序很重要）
  //   ctx.fill();

  //   // 只在边缘墙体绘制边框（避免内部重复）
  //   if (this.isEdgeWall()) {
  //     ctx.stroke();
  //   }

  //   ctx.restore();
  // }

  // /** 判断是否为边缘墙体 */
  // isEdgeWall(): boolean {
  //   // 示例逻辑：检查相邻位置是否有墙体 
  //   return (
  //     !this.hasNeighbor(0, -1) || // 上
  //     !this.hasNeighbor(1, 0) ||  // 右
  //     !this.hasNeighbor(0, 1) ||  // 下
  //     !this.hasNeighbor(-1, 0)    // 左
  //   );
  // }

  // 检查指定方向是否有相邻墙体
  hasNeighbor(dx: number, dy: number): boolean {
    const neighborX = this.gridX + dx;
    const neighborY = this.gridY + dy;

    const room = gameMap.getCurrentRoom()
    if (!room) return false

    // 边界检查
    if (neighborX < 0 || neighborX >= room.terrainMapForWall[0].length || neighborY < 0 || neighborY >= room.terrainMapForWall.length) {
      return false;
    }

    // 检查地图数据中指定位置是否有墙体
    return gameMap.getCurrentRoom()?.terrainMapForWall[neighborX][neighborY] === 1;
  }

  drawWall(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 优化边框样式
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 1.5;

    // 优化径向渐变
    const gradient = ctx.createRadialGradient(
      this.centerPoint.x, this.centerPoint.y, this.cellSize / 4,
      this.centerPoint.x, this.centerPoint.y, this.cellSize
    );
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#1d1d1d');

    ctx.fillStyle = gradient;

    // 获取相邻墙壁信息
    const neighbors = this.getNeighborInfo();

    // 根据相邻墙壁计算四个角的圆角半径
    const cornerRadii = this.calculateCornerRadii(neighbors);

    // 绘制带智能圆角的墙壁
    ctx.beginPath();


    ctx.closePath();

    // 填充墙壁
    ctx.fill();

    // 智能绘制边框（只在需要的边缘绘制）
    // this.drawSmartStroke(ctx, neighbors);

    ctx.restore();
  }

  /** 获取相邻墙壁信息 */
  getNeighborInfo(): {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
    topLeft: boolean;
    topRight: boolean;
    bottomLeft: boolean;
    bottomRight: boolean;
  } {
    return {
      top: this.hasNeighbor(0, -1),
      right: this.hasNeighbor(1, 0),
      bottom: this.hasNeighbor(0, 1),
      left: this.hasNeighbor(-1, 0),
      topLeft: this.hasNeighbor(-1, -1),
      topRight: this.hasNeighbor(1, -1),
      bottomLeft: this.hasNeighbor(-1, 1),
      bottomRight: this.hasNeighbor(1, 1)
    };
  }

  /** 计算四个角的圆角半径 */
  calculateCornerRadii(neighbors: ReturnType<typeof this.getNeighborInfo>): {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  } {
    const baseRadius = this.cornerRadius;

    return {
      topLeft: neighbors.top && neighbors.left ?
        (neighbors.topLeft ? baseRadius : 0) : baseRadius,
      topRight: neighbors.top && neighbors.right ?
        (neighbors.topRight ? baseRadius : 0) : baseRadius,
      bottomLeft: neighbors.bottom && neighbors.left ?
        (neighbors.bottomLeft ? baseRadius : 0) : baseRadius,
      bottomRight: neighbors.bottom && neighbors.right ?
        (neighbors.bottomRight ? baseRadius : 0) : baseRadius
    };
  }

  /** 智能绘制边框，只在边缘绘制 */
  // drawSmartStroke(ctx: CanvasRenderingContext2D, neighbors: ReturnType<typeof this.getNeighborInfo>): void {
  //   // 计算四个角的圆角半径，用于确定边框的起点和终点
  //   const cornerRadii = this.calculateCornerRadii(neighbors);

  //   // 存储每个边的绘制状态和端点
  //   const edges = {
  //     top: { draw: !neighbors.top, start: 0, end: 0 },
  //     right: { draw: !neighbors.right, start: 0, end: 0 },
  //     bottom: { draw: !neighbors.bottom, start: 0, end: 0 },
  //     left: { draw: !neighbors.left, start: 0, end: 0 }
  //   };

  //   // 设置上边的起点和终点
  //   if (edges.top.draw) {
  //     edges.top.start = this.x + cornerRadii.topLeft;
  //     edges.top.end = this.x + this.width - cornerRadii.topRight;
  //   }

  //   // 设置右边的起点和终点
  //   if (edges.right.draw) {
  //     edges.right.start = this.y + cornerRadii.topRight;
  //     edges.right.end = this.y + this.height - cornerRadii.bottomRight;
  //   }

  //   // 设置下边的起点和终点
  //   if (edges.bottom.draw) {
  //     edges.bottom.start = this.x + this.width - cornerRadii.bottomRight;
  //     edges.bottom.end = this.x + cornerRadii.bottomLeft;
  //   }

  //   // 设置左边的起点和终点
  //   if (edges.left.draw) {
  //     edges.left.start = this.y + this.height - cornerRadii.bottomLeft;
  //     edges.left.end = this.y + cornerRadii.topLeft;
  //   }

  //   ctx.beginPath();

  //   // 跟踪上一个绘制的边，用于连接线条
  //   let lastDrawnEdge = null;

  //   // 按照顺时针方向绘制边框：上 -> 右 -> 下 -> 左
  //   for (const [edgeName, edge] of Object.entries(edges) as [keyof typeof edges, typeof edges.top][]) {
  //     if (!edge.draw) continue;

  //     let x1, y1, x2, y2;

  //     switch (edgeName) {
  //       case 'top':
  //         x1 = edge.start;
  //         y1 = this.y;
  //         x2 = edge.end;
  //         y2 = this.y;
  //         break;

  //       case 'right':
  //         x1 = this.x + this.width;
  //         y1 = edge.start;
  //         x2 = this.x + this.width;
  //         y2 = edge.end;
  //         break;

  //       case 'bottom':
  //         x1 = edge.start;
  //         y1 = this.y + this.height;
  //         x2 = edge.end;
  //         y2 = this.y + this.height;
  //         break;

  //       case 'left':
  //         x1 = this.x;
  //         y1 = edge.start;
  //         x2 = this.x;
  //         y2 = edge.end;
  //         break;
  //     }

  //     // 如果不是第一条边，尝试从上一条边的终点连接到当前边的起点
  //     if (lastDrawnEdge && this.shouldConnectEdges(lastDrawnEdge, edgeName, neighbors)) {
  //       ctx.lineTo(x1, y1);
  //     } else {
  //       ctx.moveTo(x1, y1);
  //     }

  //     ctx.lineTo(x2, y2);
  //     lastDrawnEdge = edgeName;
  //   }

  //   ctx.stroke();
  // }

  /** 判断两条边是否应该连接 */
  // shouldConnectEdges(edge1: keyof ReturnType<typeof this.getNeighborInfo>,
  //   edge2: keyof ReturnType<typeof this.getNeighborInfo>,
  //   neighbors: ReturnType<typeof this.getNeighborInfo>): boolean {

  //   // 相邻的边应该连接
  //   const adjacentEdges = {
  //     top: ['right', 'left'],
  //     right: ['top', 'bottom'],
  //     bottom: ['right', 'left'],
  //     left: ['top', 'bottom']
  //   };

  //   // 如果两条边相邻，检查它们共享的角落是否有圆角
  //   if (adjacentEdges[edge1].includes(edge2)) {
  //     const cornerChecks = {
  //       'top-right': () => neighbors.top && neighbors.right && neighbors.topRight,
  //       'top-left': () => neighbors.top && neighbors.left && neighbors.topLeft,
  //       'bottom-right': () => neighbors.bottom && neighbors.right && neighbors.bottomRight,
  //       'bottom-left': () => neighbors.bottom && neighbors.left && neighbors.bottomLeft
  //     };

  //     const cornerKey = `${edge1}-${edge2}` as keyof typeof cornerChecks;
  //     if (cornerChecks[cornerKey]) {
  //       return cornerChecks[cornerKey]();
  //     }
  //     return true;
  //   }

  //   return false;
  // }

  handleCollision(other: Entity): void {
    super.handleCollision(other);
    // console.log('被击中了', this)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx);

    this.drawWall(ctx)
  }
}