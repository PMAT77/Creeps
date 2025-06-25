import { gameState } from "./core";

// 移动平滑
const MOVEMENT_SMOOTHING_INPUT = document.querySelector('#MOVEMENT_SMOOTHING') as HTMLInputElement

var MOVEMENT_SMOOTHING = 0.1;
MOVEMENT_SMOOTHING_INPUT.value = '0.1'
MOVEMENT_SMOOTHING_INPUT.onchange = () => {
  MOVEMENT_SMOOTHING = Number(MOVEMENT_SMOOTHING_INPUT.value)
}

/** 位置接口 */
export interface Position {
  x: number;
  y: number;
}

/** 游戏实体类 */
export default class Entity {
  public markForRemoval = false; // 标记是否需要删除

  public targetPos: Position; // 目标位置 
  public currentPos: Position; // 当前位置


  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.targetPos = { x: Number(x), y: Number(y) };
    this.currentPos = { x: Number(x), y: Number(y) };

    if (isNaN(this.x) || isNaN(this.y)) {
      console.error('坐标初始化异常', { x, y });
      this.x = this.targetPos.x = 0;
      this.y = this.targetPos.y = 0;
    }
  }

  get centerPoint(): Position {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  /** 核心逻辑方法 */
  private calculateMovement(): Position {
    let dx = 0;
    let dy = 0;

    if (gameState.keys['w']) dy -= 1;
    if (gameState.keys['s']) dy += 1;
    if (gameState.keys['a']) dx -= 1;
    if (gameState.keys['d']) dx += 1;

    // 修复1：添加向量长度校验
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude < Number.EPSILON) {
      return { x: 0, y: 0 }; // 返回零向量
    }

    // 修复2：增加数值安全校验
    const safeX = Number.isFinite(dx / magnitude) ? dx / magnitude : 0;
    const safeY = Number.isFinite(dy / magnitude) ? dy / magnitude : 0;

    // 修复3：设置最小移动阈值
    const MIN_DIRECTION = 0.0001;
    return {
      x: Math.abs(safeX) > MIN_DIRECTION ? safeX : 0,
      y: Math.abs(safeY) > MIN_DIRECTION ? safeY : 0
    };
  }

  /** 更新移动位置 */
  private updateMovement(canvas?: HTMLCanvasElement): void {
    const canvasWidth = Number(canvas?.width) || 800;
    const canvasHeight = Number(canvas?.height) || 600;

    this.targetPos.x = Math.max(0, Math.min(canvasWidth - this.width, this.targetPos.x));
    this.targetPos.y = Math.max(0, Math.min(canvasHeight - this.height, this.targetPos.y));

    this.currentPos.x += (this.targetPos.x - this.currentPos.x) * MOVEMENT_SMOOTHING;
    this.currentPos.y += (this.targetPos.y - this.currentPos.y) * MOVEMENT_SMOOTHING;
    [this.x, this.y] = [this.currentPos.x, this.currentPos.y];
  }


  update(canvas?: HTMLCanvasElement, deltaTime?: number): void {
    try {
      const direction = this.calculateMovement();
      this.targetPos.x += direction.x * this.speed;
      this.targetPos.y += direction.y * this.speed;

      this.updateMovement(canvas);

    } catch (error) {
      console.error('Creep update error:', error);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void { }
}