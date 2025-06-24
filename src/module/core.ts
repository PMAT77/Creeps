import Console from '../layout/ui/console';
import { Creep } from './creep';
import Entity from './entity';

// export interface Resource {
//   [key: string]: HTMLImageElement
// }

// export interface ResourceLoader {
//   assets: Resource;
//   loadingCount: number;
//   loadedCount: number;
//   loadImage(key: string, src: string): void;
//   checkCompletion(): void;
// }

export interface GameState {
  isRunning: boolean;
  entities: Entity[];
  keys: { [key: string]: boolean };
  deltaTime: number;
  lastFrameTime: number;
  updateDeltaTime: () => void;
}

export const gameState: GameState = {
  isRunning: false,
  entities: [],
  keys: {},
  deltaTime: 0,
  lastFrameTime: performance.now(),
  updateDeltaTime() {
    const now = performance.now();
    // 修复1：确保时间差计算基于相邻两帧
    this.deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now; // 必须更新最后帧时间
  }
}

// 游戏主类 - 封装相关功能
export class GameController {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;

  constructor() {
    this.initialize();
  }

  // 新增调试模式状态
  private debugMode = true;

  private async initialize(): Promise<void> {
    try {
      await this.waitForDOMReady();
      this.setupCanvas();
      this.setupEventListeners();
      this.spawnInitialEntities();
      this.animationId = requestAnimationFrame(ts => this.gameLoop(ts));
    } catch (error) {
      console.error('游戏初始化失败:', error);
      this.showErrorModal('游戏初始化失败，请刷新页面重试');
    }
  }

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

  private spawnInitialEntities(): void {
    if (!this.ctx) return;
    if (!this.canvas || !this.ctx) return;

    const creep = new Creep(400, 400, 15, 15);
    creep.draw(this.ctx);
    gameState.entities.push(creep);
  }

  private renderUI(ctx) {
    const consoleUI = new Console(0, 0, 200, 100);
    consoleUI.draw(ctx);
  }

  private gameLoop(timestamp: number): void {
    gameState.updateDeltaTime();

    if (!this.canvas || !this.ctx) {
      this.stopGameLoop();
      return;
    }

    // 性能监控
    const startTime = performance.now();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 渲染UI界面
    // this.renderUI(this.ctx)

    // 分批处理实体更新
    const BATCH_SIZE = 100;
    for (let i = 0; i < gameState.entities.length; i += BATCH_SIZE) {
      const batch = gameState.entities.slice(i, i + BATCH_SIZE);
      batch.forEach(entity => {
        entity.update(this.canvas!);
        entity.draw(this.ctx!);
      });
    }

    // 调试信息显示
    if (this.debugMode) {
      this.drawDebugInfo(performance.now() - startTime);
    }

    this.animationId = requestAnimationFrame(ts => this.gameLoop(ts));
  }

  private drawDebugInfo(frameTime: number): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = 'yellow';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`实体数量: ${gameState.entities.length}`, 10, 20);
    this.ctx.fillText(`帧耗时: ${frameTime.toFixed(2)}ms`, 10, 35);
    this.ctx.fillText(`FPS: ${(1000 / frameTime).toFixed(1)}`, 10, 50);
  }

  private stopGameLoop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private showErrorModal(message: string): void {
    // 创建错误提示模态框
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '20%';
    modal.style.left = '50%';
    modal.style.transform = 'translateX(-50%)';
    modal.style.padding = '20px';
    modal.style.background = 'rgba(255, 50, 50, 0.9)';
    modal.style.color = 'white';
    modal.style.borderRadius = '8px';
    modal.textContent = message;
    document.body.appendChild(modal);
  }
}