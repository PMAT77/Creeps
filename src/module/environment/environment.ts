import Entity from "../entity";

/** 环境类型 */
type EnvironmentType = 'Terrain' | 'Trap' | 'Wall' | 'Liquid'

/** 环境类 */
export class Environment extends Entity {
  envType: EnvironmentType;

  // 是否激活
  isActive: boolean;
  // 是否被破坏
  destroyable: boolean;
  // 是否可通行
  traversable: boolean;

  constructor({ x, y, width, height, envType, destroyable = false, traversable = false }: { x: number, y: number, width: number, height: number, envType: EnvironmentType, destroyable?: boolean, traversable?: boolean }) {
    super({ x, y, width, height, speed: 0, type: 'Environment' })

    this.envType = envType;
    this.destroyable = destroyable;
    this.traversable = traversable;
  }

  /** 环境激活时触发 */
  onActivated() {

  }

  /** 环境被破坏时触发 */
  onDestroyed() {

  }

  /** 玩家与环境发生碰撞时触发 */
  onPlayerCollision() {

  }

  /** 环境更新 */
  update(canvas?: HTMLCanvasElement, deltaTime?: number): void {
    // 环境更新逻辑
  }

  /** 环境绘制 */
  draw(ctx: CanvasRenderingContext2D): void {
    // 环境绘制逻辑
  }
}