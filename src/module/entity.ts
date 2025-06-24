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
  private targetPos: Position; // 目标位置 
  private currentPos: Position; // 当前位置

  // 新增呼吸效果属性
  private breathPhase = 0;
  private baseSize: number;
  private readonly breathAmplitude = 0.3;
  private readonly breathSpeed = 6;

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

    this.baseSize = width;

    this.targetPos = { x: Number(x), y: Number(y) };
    this.currentPos = { x: Number(x), y: Number(y) };

    // 修复3：防御性数值检查
    if (isNaN(this.x) || isNaN(this.y)) {
      console.error('坐标初始化异常', { x, y });
      this.x = this.targetPos.x = 0;
      this.y = this.targetPos.y = 0;
    }
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

  /** 更新单位位置 */
  private updateMovement(canvas?: HTMLCanvasElement): void {
    const canvasWidth = Number(canvas?.width) || 800;
    const canvasHeight = Number(canvas?.height) || 600;

    this.targetPos.x = Math.max(0, Math.min(canvasWidth - this.width, this.targetPos.x));
    this.targetPos.y = Math.max(0, Math.min(canvasHeight - this.height, this.targetPos.y));

    this.currentPos.x += (this.targetPos.x - this.currentPos.x) * MOVEMENT_SMOOTHING;
    this.currentPos.y += (this.targetPos.y - this.currentPos.y) * MOVEMENT_SMOOTHING;
    [this.x, this.y] = [this.currentPos.x, this.currentPos.y];
  }

  /** 是否处于 Idle 状态 */
  private isIdle(): boolean {
    return Math.abs(this.targetPos.x - this.currentPos.x) < 0.1 &&
      Math.abs(this.targetPos.y - this.currentPos.y) < 0.1;
  }

  get centerPoint(): Position {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  update(canvas?: HTMLCanvasElement): void {
    try {
      // 新增呼吸动画更新
      if (this.isIdle()) {
        this.breathPhase += gameState.deltaTime * this.breathSpeed;
      }

      const direction = this.calculateMovement();
      this.targetPos.x += direction.x * this.speed;
      this.targetPos.y += direction.y * this.speed;

      this.updateMovement(canvas);

    } catch (error) {
      console.error('Creep update error:', error);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const center = this.centerPoint;

    ctx.save();
    // 应用呼吸缩放（保持中心点）
    const scale = 1 + Math.sin(this.breathPhase) * this.breathAmplitude / this.baseSize;
    ctx.translate(center.x, center.y);
    ctx.scale(scale, scale)
    ctx.translate(-center.x, -center.y);

    // 中心能量容器
    ctx.beginPath();
    ctx.arc(center.x, center.y, this.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#555555';
    ctx.fill();

    // 能量容器壁
    ctx.beginPath();
    ctx.arc(center.x, center.y, this.width / 2 + 1, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // 肌肉
    ctx.beginPath();
    ctx.arc(center.x, center.y, this.width / 2 + 3, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#222222';
    ctx.stroke();

    // 皮肤
    ctx.beginPath();
    ctx.arc(center.x, center.y, this.width / 2 + 6, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#555555';
    ctx.stroke();

    ctx.restore();
  }
}