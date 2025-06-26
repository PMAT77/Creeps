import Entity from "./entity";

export default class GameState {
  // 游戏是否运行
  #isRunning = false;
  // 游戏是否暂停
  #isPaused = false;
  // 实体列表
  #entities: Entity[] = [];
  // 键位映射
  #keys: { [key: string]: boolean } = {};
  // 时间增量
  #deltaTime = 0;
  #lastTime = 0;

  get isRunning(): boolean {
    return this.#isRunning;
  }
  get isPaused(): boolean {
    return this.#isPaused;
  }

  get keys(): { [key: string]: boolean } {
    return this.#keys;
  }

  get entities(): Entity[] {
    return this.#entities;
  }

  get deltaTime() {
    return this.#deltaTime;
  }

  get currentTime() {
    return this.#lastTime;
  }

  /** 往实体列表中新增实体 */
  addEntity<T extends Entity>(entity: T) {
    this.#entities.push(entity);
  }

  /** 从实体列表中移除实体 */
  removeEntity(entity: Entity) {
    const index = this.#entities.indexOf(entity);
    if (index > -1) {
      this.#entities.splice(index, 1);
    }
  }

  /** 根据uniqId查询实体 */
  findEntity(uniqId: string): Entity | null {
    return this.#entities.find(entity => entity.uniqId === uniqId) || null;
  }

  updateEntity(entities: Entity[]) {
    this.#entities = entities;
  }

  onKeyDown(key: string) {
    this.#keys[key] = true;
  }

  onKeyUp(key: string) {
    this.#keys[key] = false;
  }

  /** 更新时间增量 */
  updateDeltaTime(currentTime: number) {
    this.#deltaTime = (currentTime - this.#lastTime) / 1000;
    this.#lastTime = currentTime;
  }
}