import { Environment } from './environment';
import { Wall } from './wall';
import { gameState } from '../game-state';
import { Position } from '../entity';

export class Room {
    private environments: Environment[] = [];
    width: number;
    height: number;
    // 地形网格数据（0=空地，1=地块）
    terrainMapForWall = [
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
    ]

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /** 添加环境实体 */
    addEnvironment(env: Environment): void {
        this.environments.push(env);
    }

    /** 移除环境实体 */
    removeEnvironment(env: Environment): void {
        const index = this.environments.indexOf(env);
        if (index !== -1) {
            this.environments.splice(index, 1);
        }
    }

    /** 绘制房间墙体 */
    renderWalls(startPos: Position = { x: 0, y: 0 }): void {
        console.log('地形网格数据', this.terrainMapForWall)
        for (let i = 0; i < this.terrainMapForWall.length; i++) {
            for (let j = 0; j < this.terrainMapForWall[i].length; j++) {
                const element = this.terrainMapForWall[i][j];
                if (element) {
                    const wall = new Wall({
                        x: j * 40 + startPos.x,
                        y: i * 40 + startPos.y,
                        width: 40,
                        height: 40,
                        gridX: i,
                        gridY: j
                    });
                    this.addEnvironment(wall);
                    gameState.addEntity(wall);
                }
            }
        }
    }

    /** 获取房间内所有墙体 */
    getWalls(): Wall[] {
        return this.environments.filter(env => env instanceof Wall) as Wall[];
    }

    update(deltaTime: number): void {
        this.environments.forEach(env => env.update());
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.environments.forEach(env => env.draw(ctx));
    }
}