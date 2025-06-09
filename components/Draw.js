class Draw {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.defaultFillColor = "#C25800";
        this.defaultBorderColor = "#663300";
        this.defaultBorderWidth = 2;
        this.defaultTextColor = "#0095DD";
        this.defaultFont = "16px Arial";
        this.buttonFont = "bold 18px Arial";
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBall(x, y, ballRadius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.defaultFillColor;
        this.ctx.fill();
        this.ctx.strokeStyle = this.defaultBorderColor;
        this.ctx.lineWidth = this.defaultBorderWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawPaddle(paddleX, paddleWidth, paddleHeight) {
        this.ctx.beginPath();
        this.ctx.rect(paddleX, this.canvas.height - paddleHeight, paddleWidth, paddleHeight);
        this.ctx.fillStyle = this.defaultFillColor;
        this.ctx.fill();
        this.ctx.strokeStyle = this.defaultBorderColor;
        this.ctx.lineWidth = this.defaultBorderWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawBricks(bricks, brickSettings) {
        const brickColumnCount = brickSettings.columnCount;
        const brickRowCount = brickSettings.rowCount;
        const brickWidth = brickSettings.width;
        const brickHeight = brickSettings.height;
        const brickPadding = brickSettings.padding;
        const brickOffsetTop = brickSettings.offsetTop;
        const brickOffsetLeft = brickSettings.offsetLeft;

        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = r * (brickWidth + brickPadding) + brickOffsetLeft;
                    const brickY = c * (brickHeight + brickPadding) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;

                    this.ctx.beginPath();
                    this.ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    this.ctx.fillStyle = bricks[c][r].isBonus === 0 ? this.defaultFillColor : "#FF8C00";
                    this.ctx.fill();
                    this.ctx.strokeStyle = this.defaultBorderColor;
                    this.ctx.lineWidth = this.defaultBorderWidth;
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        }
    }

    drawText(text, x, y) {
        this.ctx.font = this.defaultFont;
        this.ctx.fillStyle = this.defaultTextColor;
        this.ctx.fillText(text, x, y);
    }

    drawMenu(soundOn) {
        const width = 300;
        const height = 180;
        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2;

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = this.buttonFont;
        this.ctx.fillText("Game Paused", x + 75, y + 40);
        this.ctx.fillText("Press ESC to Resume", x + 45, y + 80);
        this.ctx.fillText(`Sound: ${soundOn ? "On" : "Off"}`, x + 90, y + 130);
        this.ctx.font = this.defaultFont;
    }
}
