import UI from "./ui";

export default class Console extends UI {

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'red';
    super.draw(ctx);
  }
}