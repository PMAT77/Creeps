import { gameState } from './game-state';

// 移动平滑系数
const MOVEMENT_SMOOTHING = 0.1;

/** 游戏实体类 */
export interface Position {
  x: number;
  y: number;
}

// 实体类型
export type EntityType = 'Creep' | 'Bullet' | 'Environment';

export default class Entity {
  // 唯一ID
  uniqId: string;
  // x轴位置
  x: Position['x'];
  // y轴位置
  y: Position['y'];
  // 宽度
  width: number;
  // 高度
  height: number;
  // 基础速度
  speed: number;
  // 实体类型
  type: EntityType;

  // 目的位置
  targetPos: Position;
  // 当前位置
  currentPos: Position;

  // 是否标记为删除
  isMarkForRemoval = false;

  constructor({ x, y, width, height, speed, type }: { x: Position['x'], y: Position['y'], width: number, height: number, speed: number, type: EntityType }) {
    this.uniqId = this.#createUUID(type);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.targetPos = { x: Number(x), y: Number(y) };
    this.currentPos = { x: Number(x), y: Number(y) };
    this.type = type;

    this.validateCoordinates(x, y);
  }

  /** 验证坐标有效性 */
  private validateCoordinates(x: number, y: number): void {
    if (isNaN(x) || isNaN(y)) {
      console.error('坐标初始化异常', { x, y });
      this.x = this.targetPos.x = 0;
      this.y = this.targetPos.y = 0;
    }
  }

  /** 实体中心点 */
  get centerPoint(): Position {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  /** 生成唯一id */
  #createUUID(type: EntityType): string {
    return `${type}_${crypto.randomUUID().slice(0, 8)}`;
  }

  /** 计算移动向量 */
  #calculateMovement(): Position {
    let dx = 0; // x轴移动向量
    let dy = 0; // y轴移动向量

    if (gameState.keys['w']) dy -= 1;
    if (gameState.keys['s']) dy += 1;
    if (gameState.keys['a']) dx -= 1;
    if (gameState.keys['d']) dx += 1;

    return this.normalizeMovementVector(dx, dy);
  }

  /** 归一化移动向量 */
  private normalizeMovementVector(dx: number, dy: number): Position {
    // 添加向量长度校验
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    // 当向量长度足够接近 0（而非严格等于 0）时，视为静止状态
    if (magnitude < Number.EPSILON) {
      return { x: 0, y: 0 }; // 返回零向量
    }

    // 增加数值安全校验
    const safeX = Number.isFinite(dx / magnitude) ? dx / magnitude : 0;
    const safeY = Number.isFinite(dy / magnitude) ? dy / magnitude : 0;

    // 设置最小移动阈值
    const MIN_DIRECTION = 0.0001;
    return {
      x: Math.abs(safeX) > MIN_DIRECTION ? safeX : 0,
      y: Math.abs(safeY) > MIN_DIRECTION ? safeY : 0
    };
  }

  /** 更新移动位置 */
  #updateMovement(canvas?: HTMLCanvasElement): void {
    const direction = this.#calculateMovement();
    this.targetPos.x += direction.x * this.speed;
    this.targetPos.y += direction.y * this.speed;

    if (canvas) {
      this.clampPosition(canvas);
    }

    this.smoothMovement();
  }

  /** 限制实体位置在画布内 */
  private clampPosition(canvas: HTMLCanvasElement): void {
    const canvasWidth = Number(canvas.clientWidth) || 1200;
    const canvasHeight = Number(canvas.clientHeight) || 800;

    this.targetPos.x = Math.max(0, Math.min(canvasWidth - this.width, this.targetPos.x));
    this.targetPos.y = Math.max(0, Math.min(canvasHeight - this.height, this.targetPos.y));
  }

  /** 平滑移动 */
  private smoothMovement(): void {
    this.currentPos.x += (this.targetPos.x - this.currentPos.x) * MOVEMENT_SMOOTHING;
    this.currentPos.y += (this.targetPos.y - this.currentPos.y) * MOVEMENT_SMOOTHING;
    [this.x, this.y] = [this.currentPos.x, this.currentPos.y];
  }

  /** 碰撞检测方法 */
  checkCollision(other: Entity): boolean {
    const thisCenter = this.centerPoint;
    const otherCenter = other.centerPoint;
    const distance = Math.hypot(
      thisCenter.x - otherCenter.x,
      thisCenter.y - otherCenter.y
    );
    return distance < (this.width / 2 + other.width / 2);
  }

  /** 碰撞处理（子类可重写） */
  handleCollision(other: Entity): void {
    // console.log('发生碰撞！', other);
  }

  update(canvas?: HTMLCanvasElement, deltaTime?: number): void {
    if (!canvas) return;
    this.#updateMovement(canvas);
    this.currentPos = { x: this.x, y: this.y };
  }

  draw(ctx: CanvasRenderingContext2D): void { }
}