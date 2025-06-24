import { gameState } from "./core";
import Entity, { Position } from "./entity";

// 转向速度
const ROTATION_SPEED_INPUT = document.querySelector('#ROTATION_SPEED') as HTMLInputElement

var ROTATION_SPEED = 0.15
ROTATION_SPEED_INPUT.value = '0.15'
ROTATION_SPEED_INPUT.onchange = () => {
  ROTATION_SPEED = Number(ROTATION_SPEED_INPUT.value)
}

const COMPONENT_SPECS = {
  work: {
    color: '#fbe67f',
    radiusOffset: 5,
    arcRange: [0, Math.PI / 2],
    lineWidth: 6,
    rotationOffset: -Math.PI / 2 - Math.PI / 4
  },
  attack: {
    color: '#e54b4a',
    radiusOffset: 5.5,
    arcRange: [0, Math.PI / 18],
    lineWidth: 7,
    rotationOffset: Math.PI / 2 - Math.PI / 18 / 2
  }
};

export class Creep extends Entity {
  private targetRotation = 0; // 目标角度 
  private currentRotation = 0; // 当前角度   

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    public health: number = 100,
    public speed: number = 2,
  ) {
    super(x, y, width, height);

    // 转向速度
    const SPEED_INPUT = document.querySelector('#SPEED_INPUT') as HTMLInputElement

    SPEED_INPUT.value = '2'
    SPEED_INPUT.onchange = () => {
      this.speed = Number(SPEED_INPUT.value)
    }
  }

  /** 核心逻辑方法 */
  private calculateMovementSub(): Position {
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

  /** 更新旋转角度 */
  private updateRotation(direction: Position): void {
    // 修正方向键检测逻辑
    const directionalKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const hasDirectionalInput = directionalKeys.some(k => gameState.keys[k]);

    // 确保移动转向逻辑正确触发
    if (!hasDirectionalInput) {
      if (direction.x !== 0 || direction.y !== 0) {
        this.targetRotation = Math.atan2(direction.y, direction.x);
      } else {
        // 保留当前旋转角度当完全静止时
        this.targetRotation = this.currentRotation;
      }
    }

    // 优化角度差计算（使用最短路径）
    const rawDiff = this.targetRotation - this.currentRotation;
    const angleDiff = Math.atan2(Math.sin(rawDiff), Math.cos(rawDiff));
    // 平滑旋转过渡
    this.currentRotation += angleDiff * ROTATION_SPEED;
    // 规范化角度范围
    this.currentRotation = ((this.currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  }

  /** 独立转向控制方法 */
  private updateDirectionalRotation() {
    const { keys } = gameState;

    if (keys.ArrowUp) this.targetRotation = -Math.PI / 2;
    if (keys.ArrowDown) this.targetRotation = Math.PI / 2;
    if (keys.ArrowLeft) this.targetRotation = Math.PI;
    if (keys.ArrowRight) this.targetRotation = 0;

    if (keys.ArrowRight && keys.ArrowUp) this.targetRotation = -Math.PI / 4;
    if (keys.ArrowRight && keys.ArrowDown) this.targetRotation = Math.PI / 4;
    if (keys.ArrowLeft && keys.ArrowUp) this.targetRotation = Math.PI + Math.PI / 4;
    if (keys.ArrowLeft && keys.ArrowDown) this.targetRotation = Math.PI - Math.PI / 4;
  }

  /** 旋转 */
  private applyRotation(ctx: CanvasRenderingContext2D): void {
    const center = this.centerPoint;
    ctx.translate(center.x, center.y);
    ctx.rotate(this.currentRotation - Math.PI / 2);
    ctx.translate(-center.x, -center.y);
  }

  /** 绘制组件 */
  private drawComponent(ctx: CanvasRenderingContext2D, type: keyof typeof COMPONENT_SPECS): void {
    const { color, radiusOffset, arcRange, lineWidth, rotationOffset } = COMPONENT_SPECS[type];
    const center = this.centerPoint;

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotationOffset);
    ctx.translate(-center.x, -center.y);

    ctx.beginPath();
    ctx.arc(center.x, center.y, this.width / 2 + radiusOffset, arcRange[0], arcRange[1]);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.restore();
  }

  get centerPoint(): Position {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  update(canvas?: HTMLCanvasElement): void {
    try {
      const direction = this.calculateMovementSub();
      this.updateDirectionalRotation(); // 新增转向控制
      this.updateRotation(direction);

      super.update(canvas);
    } catch (error) {
      console.error('Creep update error:', error);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    try {
      this.applyRotation(ctx);

      super.draw(ctx);

      Object.keys(COMPONENT_SPECS).forEach(k =>
        this.drawComponent(ctx, k as keyof typeof COMPONENT_SPECS)
      );
    } finally {
      ctx.restore();
    }
  }
}