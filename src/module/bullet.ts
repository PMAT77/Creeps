import { gameState } from "./core";
import Entity from "./entity";

export default class Bullet extends Entity {
  private readonly maxLifeTime: number; // 子弹最大存在时间
  private lifeTime: number; // 子弹已存在时间
  private damage: number; // 子弹伤害
  private velocity: { x: number; y: number }; // 子弹速度向量

  constructor(
    x: number,
    y: number,
    direction: { x: number; y: number },
    speed: number = 4,
    radius: number = 3,
    damage: number = 10,
    lifeTime: number = 4
  ) {
    super(x, y - radius, radius * 2, radius * 2);

    // 标准化方向向量
    const magnitude = Math.hypot(direction.x, direction.y);
    this.velocity = {
      x: (direction.x / magnitude) * speed,
      y: (direction.y / magnitude) * speed
    };

    this.damage = damage;
    this.maxLifeTime = lifeTime;
    this.lifeTime = 0;
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

  update(canvas?: HTMLCanvasElement): void {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.lifeTime += gameState.deltaTime;

    if (this.lifeTime >= this.maxLifeTime) {
      this.markForRemoval = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx);

    this.drawBody(ctx)
  }
}