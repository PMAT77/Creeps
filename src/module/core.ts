import { Creep } from './creep';
import { Wall } from './environment/wall';
import { gameState } from './game-state';


// 游戏主类 - 封装相关功能
export class GameController {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private debugMode = true; // 新增调试模式状态

  constructor() {
    this.initialize();
  }

  private creepInitialEntities(): void {
    if (!this.ctx) return;
    if (!this.canvas || !this.ctx) return;

    const creep = new Creep(400, 400, 15, 15);
    creep.draw(this.ctx);
    gameState.addEntity(creep);
  }

  private envInitialEntities(): void {
    if (!this.ctx) return;
    if (!this.canvas || !this.ctx) return;

    const wall_01 = new Wall(400, 200, 40, 40)
    wall_01.draw(this.ctx!)
    gameState.addEntity(wall_01)

    const wall_02 = new Wall(440, 200, 40, 40)
    wall_02.draw(this.ctx!)
    gameState.addEntity(wall_02)

    const wall_03 = new Wall(480, 200, 40, 40)
    wall_03.draw(this.ctx!)
    gameState.addEntity(wall_03)

    const wall_04 = new Wall(440, 160, 40, 40)
    wall_04.draw(this.ctx!)
    gameState.addEntity(wall_04)
  }

  /** 初始化实体 */
  private async initialize(): Promise<void> {
    try {
      await this.waitForDOMReady();
      this.setupCanvas();
      this.setupEventListeners();
      this.creepInitialEntities();
      this.envInitialEntities();
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

    // 分批处理实体更新
    const BATCH_SIZE = 100;
    for (let i = 0; i < gameState.entities.length; i += BATCH_SIZE) {
      const newEntities = gameState.entities.filter(entity => {
        return !entity.isMarkForRemoval; // 保留未标记删除的实体
      });
      gameState.updateEntity(newEntities)
      const batch = gameState.entities.slice(i, i + BATCH_SIZE);
      batch.forEach(entity => {
        entity.update(this.canvas!, gameState.deltaTime); // 传递canvas参数
        entity.draw(this.ctx!);
      });
    }

    // 碰撞检测（双重循环优化版）
    for (let i = 0; i < gameState.entities.length; i++) {
      const entityA = gameState.entities[i];
      for (let j = i + 1; j < gameState.entities.length; j++) {
        const entityB = gameState.entities[j];
        if (entityA.checkCollision(entityB)) {
          entityA.handleCollision(entityB);
          entityB.handleCollision(entityA);
        }
      }
    }

    // 调试信息显示
    if (this.debugMode) {
      this.drawDebugInfo(performance.now() - startTime);
    }
    this.animationId = requestAnimationFrame(ts => this.gameLoop(ts));
  }
}
