import Entity from './entity';
import { Creep } from './creep';
import { Room } from './environment/room';
import { Wall } from './environment/wall';
import { gameState } from './game-state';
import { GameMap } from './environment/map';

// 创建地图
export const gameMap = new GameMap(800 * 4, 600 * 4, 'main');

// 游戏主类 - 封装相关功能
export class GameController {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private debugMode = true; // 新增调试模式状态

  constructor() {
    this.initialize();
  }

  /** 初始化玩家实例 */
  private creepInitialEntities(): void {
    if (!this.canvas || !this.ctx) return;

    const creep = new Creep(400, 400, 15, 15);
    creep.draw(this.ctx);
    gameState.addEntity(creep);
  }

  /** 初始化环境实例 */
  // private envInitialEntities(): void {
  //   if (!this.canvas || !this.ctx) return;

  //   // const wall_01 = new Wall(400, 200, 40, 40)
  //   // wall_01.draw(this.ctx!)
  //   // gameState.addEntity(wall_01)

  //   // const wall_02 = new Wall(440, 200, 40, 40)
  //   // wall_02.draw(this.ctx!)
  //   // gameState.addEntity(wall_02)
  // }

  /** 初始化地图 */
  private mapInitial() {
    // 创建房间
    const mainRoom = new Room(800, 600);
    // 绘制房间墙体
    mainRoom.renderWalls({ x: 400, y: 200 });

    // 将房间添加到地图
    gameMap.addRoom('main', mainRoom);
    gameMap.setCurrentRoom('main');
  }

  /** 初始化所有实例 */
  private async initialize(): Promise<void> {
    try {
      await this.waitForDOMReady();
      this.setupCanvas();
      this.setupEventListeners();

      this.mapInitial();
      // this.envInitialEntities();
      this.creepInitialEntities();
      this.animationId = requestAnimationFrame(ts => this.gameLoop(ts));
    } catch (error) {
      console.error('游戏初始化失败:', error);
    }
  }

  /** 等待DOM内容加载完成 */
  private async waitForDOMReady(): Promise<void> {
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        const timer = setTimeout(() => {
          console.warn('DOMContentLoaded 等待超时');
          resolve(null);
        }, 5000);
        document.addEventListener('DOMContentLoaded', () => {
          clearTimeout(timer);
          resolve(null);
        });
      });
    }
  }

  /** 设置游戏画布 */
  private setupCanvas(): void {
    const canvas = document.querySelector('#GameCanvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('无效的Canvas元素');
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: this.debugMode });
    if (!ctx) {
      throw new Error('无法获取2D渲染上下文');
    }

    // 配置抗锯齿和高清显示
    ctx.imageSmoothingEnabled = true;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    this.canvas = canvas;
    this.ctx = ctx;

    // 添加窗口大小变化监听
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleResize(): void {
    if (!this.canvas || !this.ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  /** 设置事件监听 */
  private setupEventListeners(): void {
    // 使用箭头函数确保this上下文正确
    const handleKeyDown = (e: KeyboardEvent) => {
      gameState.keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameState.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 添加清理函数
    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('beforeunload', cleanup);
    };

    window.addEventListener('beforeunload', cleanup);
  }

  /** 绘制调试信息 */
  private drawDebugInfo(frameTime: number): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = 'yellow';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`实体数量: ${gameState.entities.length}`, 10, 20);
    this.ctx.fillText(`帧耗时: ${frameTime.toFixed(2)}ms`, 10, 35);
    this.ctx.fillText(`FPS: ${(1000 / frameTime).toFixed(1)}`, 10, 50);
  }

  /** 停止游戏主循环 */
  private stopGameLoop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /** 游戏主循环 */
  private gameLoop(timestamp: number): void {
    gameState.updateDeltaTime(timestamp);

    if (!this.canvas || !this.ctx) {
      this.stopGameLoop();
      return;
    }

    // 性能监控
    const startTime = performance.now();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 过滤未标记删除的实体
    const entities = gameState.entities.filter(entity => !entity.isMarkForRemoval);
    gameState.updateEntity(entities);

    // 分批处理实体更新
    const BATCH_SIZE = 100;
    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
      const batch = entities.slice(i, i + BATCH_SIZE);
      batch.forEach(entity => {
        entity.update(this.canvas!, gameState.deltaTime);
        entity.draw(this.ctx!);
      });
    }

    // 碰撞检测（使用空间分区优化）
    this.spatialPartitionCollisionDetection(entities);

    // 调试信息显示
    if (this.debugMode) {
      this.drawDebugInfo(performance.now() - startTime);
    }
    this.animationId = requestAnimationFrame(ts => this.gameLoop(ts));
  }

  /** 空间分区碰撞检测 */
  private spatialPartitionCollisionDetection(entities: Entity[]): void {
    // 简单实现：将画布划分为多个网格单元
    const GRID_SIZE = 100;
    const grid: Record<string, Entity[]> = {};

    // 将实体分配到网格单元
    entities.forEach(entity => {
      const gridX = Math.floor(entity.x / GRID_SIZE);
      const gridY = Math.floor(entity.y / GRID_SIZE);
      const key = `${gridX},${gridY}`;
      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(entity);
    });

    // 检查每个网格单元及其相邻单元的实体碰撞
    for (const key in grid) {
      const [gridX, gridY] = key.split(',').map(Number);
      const entitiesInGrid = grid[key];

      // 检查当前网格内的实体碰撞
      for (let i = 0; i < entitiesInGrid.length; i++) {
        for (let j = i + 1; j < entitiesInGrid.length; j++) {
          const entityA = entitiesInGrid[i];
          const entityB = entitiesInGrid[j];
          if (entityA.checkCollision(entityB)) {
            entityA.handleCollision(entityB);
            entityB.handleCollision(entityA);
          }
        }
      }

      // 检查相邻网格内的实体碰撞
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const neighborKey = `${gridX + dx},${gridY + dy}`;
          if (grid[neighborKey]) {
            for (const entityA of entitiesInGrid) {
              for (const entityB of grid[neighborKey]) {
                if (entityA.checkCollision(entityB)) {
                  entityA.handleCollision(entityB);
                  entityB.handleCollision(entityA);
                }
              }
            }
          }
        }
      }
    }
  }
}
