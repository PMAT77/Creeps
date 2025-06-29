import { Room } from './room';

export class GameMap {
    private rooms: Record<string, Room> = {};
    private currentRoomId: string;
    width: number;
    height: number;

    /** 构造函数 */
    constructor(width: number, height: number, currentRoomId: string = 'main') {
        this.currentRoomId = currentRoomId;
        this.width = width;
        this.height = height;
    }

    /** 添加房间 */
    addRoom(roomId: string, room: Room): void {
        this.rooms[roomId] = room;
    }

    /** 设置地图尺寸 */
    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    /** 切换房间 */
    setCurrentRoom(roomId: string): void {
        if (this.rooms[roomId]) {
            this.currentRoomId = roomId;
        }
    }

    /** 获取当前房间 */
    getCurrentRoom(): Room | undefined {
        return this.rooms[this.currentRoomId];
    }

    /** 地图更新 */
    update(deltaTime: number): void {
        this.getCurrentRoom()?.update(deltaTime);
    }

    /** 地图绘制 */
    draw(ctx: CanvasRenderingContext2D): void {
        this.getCurrentRoom()?.draw(ctx);
    }
}