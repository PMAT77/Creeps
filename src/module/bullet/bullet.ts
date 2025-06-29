import { Creep } from "../creep";
import Entity from "../entity";
import { gameState } from "../game-state";

// 修改子弹类，添加发射者属性
export default class Bullet extends Entity {
  private readonly maxLifeTime: number; // 子弹最大存在时间
  private lifeTime: number; // 子弹已存在时间
  private velocity: { x: number; y: number }; // 子弹速度向量
  private shooter: Creep; // 发射者信息

  damage: number; // 子弹伤害

  constructor(
    x: number,
    y: number,
    direction: { x: number; y: number },
    shooter: Creep,
    speed: number = 5,
    radius: number = 2.5,
    damage: number = 10,
    lifeTime: number = 4
  ) {
    super({ x, y: y - radius, width: radius * 2, height: radius * 2, speed, type: 'Bullet' });

    // 标准化方向向量
    const magnitude = Math.hypot(direction.x, direction.y);
    this.velocity = {
      x: (direction.x / magnitude) * speed,
      y: (direction.y / magnitude) * speed
    };

    this.damage = damage;
    this.maxLifeTime = lifeTime;
    this.lifeTime = 0;
    this.shooter = shooter;
  }

  // 添加获取发射者方法
  getShooter(): Creep {
    return this.shooter;
  }

  private drawBody(ctx: CanvasRenderingContext2D) {
    const center = this.centerPoint;

    ctx.save();

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

  handleCollision(other: Entity): void {
    if (this.getShooter().type !== 'Creep') {
      this.isMarkForRemoval = true;
    }
  }

  update(canvas?: HTMLCanvasElement): void {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.lifeTime += gameState.deltaTime;

    if (this.lifeTime >= this.maxLifeTime) {
      this.isMarkForRemoval = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx);

    this.drawBody(ctx);
  }
}