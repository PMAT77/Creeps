import Bullet from "./bullet";

/**
 * 回弹子弹
 */
class ReBoundBullet extends Bullet {
  constructor(
    x: number,
    y: number,
    direction: { x: number; y: number },
    speed: number = 5,
    damage: number = 10,
    maxLifeTime: number = 1000,
    lifeTime: number = 0,
    reboundCount: number = 2,
  ) {
    super(x, y, direction, speed, damage, maxLifeTime, lifeTime);
    // this.reboundCount = reboundCount;
  }
}