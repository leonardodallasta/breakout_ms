class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.drawFunctions = new Draw(this.ctx, this.canvas);
        this.ballRadius = 10;
        this.level = 1;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 30;
        this.dx = 5;
        this.dy = -5;
        this.paddleHeight = 10;
        this.paddleWidth = 100;
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
        this.rightPressed = false;
        this.leftPressed = false;
        this.brickSettings = {
            rowCount: 5,
            columnCount: 2,
            width: 75,
            height: 20,
            padding: 10,
            offsetTop: 30,
            offsetLeft: 30,
        };
        this.score = 0;
        this.lives = 3;
        this.highscore = 0;
        this.hitSound = new Audio("assets/Audio/hitb.mp3");
        this.loseSound = new Audio("assets/Audio/lose.mp3");
        this.winSound = new Audio("assets/Audio/win.mp3");
        this.fallSound = new Audio("assets/Audio/fall.mp3");
        this.brickHit = 0;
        this.bricks = [];
        this.isPaused = false;

        this.createBricks();
    }

    createBricks() {
        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickSettings.rowCount; r++) {
                this.bricks[c][r] = { x: 0, y: 0, status: 1, isBonus: 0 };
            }
        }
        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            this.bricks[c][Math.floor(Math.random() * 5)].isBonus = 1;
        }
    }

    setControls(rightPressed, leftPressed) {
        this.rightPressed = rightPressed;
        this.leftPressed = leftPressed;
    }

    startGame() {
        requestAnimationFrame(() => this.draw());
    }

    draw() {
        if (this.isPaused) {
            this.drawFunctions.drawText("Game Paused", this.canvas.width / 2 - 50, this.canvas.height / 2);
            return;
        }
        this.drawFunctions.clearCanvas();
        this.drawFunctions.drawBricks(
            this.bricks,
            this.brickSettings
        );
        this.drawFunctions.drawBall(this.x, this.y, this.ballRadius);
        this.drawFunctions.drawPaddle(this.paddleX, this.paddleWidth, this.paddleHeight);
        this.drawFunctions.drawText("Score: " + this.score, 8, 20);
        this.drawFunctions.drawText("High Score: " + this.highscore, this.canvas.width / 2 - 90, 20);
        this.drawFunctions.drawText("Lives: " + this.lives, this.canvas.width / 2 + 80, 20);
        this.drawFunctions.drawText("Level: " + this.level, this.canvas.width - 65, 20);
        this.collisionDetection();
        this.moveBall();
        requestAnimationFrame(() => this.draw());
    }

    collisionDetection() {
        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            for (let r = 0; r < this.brickSettings.rowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1) {
                    if (this.x > b.x && this.x < b.x + this.brickSettings.width && this.y > b.y && this.y < b.y + this.brickSettings.height) {
                        this.brickHit++;
                        this.hitSound.currentTime = 0;
                        this.hitSound.play();
                        this.dy = -this.dy;
                        b.status = 0;
                        if (b.isBonus === 0)
                            this.score++;
                        else
                            this.score += 5;
                        if (this.score > this.highscore) this.highscore = this.score;
                        if (this.brickHit === this.brickSettings.rowCount * this.brickSettings.columnCount) {
                            this.winSound.play();
                            this.level++;
                            this.dx += 1;
                            this.dy -= 1;
                            this.brickSettings.columnCount++;
                            setTimeout(() => {
                                alert("YOU WIN, CONGRATS!");
                                this.paddleWidth = this.paddleWidth - 15;
                                this.restart();
                            });
                            return;
                        }
                    }
                }
            }
        }
    }

    moveBall() {
        if (this.x + this.dx > this.canvas.width - this.ballRadius || this.x + this.dx < this.ballRadius) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy < this.ballRadius) {
            this.dy = -this.dy;
        } else if (this.y + this.dy > this.canvas.height - this.ballRadius) {
            if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
                this.dy = -this.dy;
                
                const relativePosition = (this.x - this.paddleX) / this.paddleWidth;
                
                let angleChange = (relativePosition - 0.5) * Math.PI / 3; 
                
                const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy) 
                this.dx = Math.sin(angleChange) * speed ;
                this.dy = -Math.cos(angleChange) * speed;
            } else {
                this.lives--;
                if (!this.lives) {
                    this.loseSound.play();
                    setTimeout(() => {
                        alert("GAME OVER");
                        this.dx = 5
                        this.dy = -5
                        this.score = 0
                        this.lives = 3
                        this.level = 1
                        this.paddleWidth = 100
                        this.restart();
                    }, 0);
                    return;
                } else {
                    this.fallSound.play();
                    this.x = this.canvas.width / 2;
                    this.y = this.canvas.height - 30;
                    this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
                }
            }
        }
    
        this.paddleMovement();
        this.x += this.dx;
        this.y += this.dy;
    }
    
    

    paddleMovement() {
        if (this.rightPressed && this.paddleX < this.canvas.width - this.paddleWidth) {
            this.paddleX += 7;
        } else if (this.leftPressed && this.paddleX > 0) {
            this.paddleX -= 7;
        }
    }

    restart() {
        this.createBricks();
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 30;
        this.brickHit = 0;
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
        this.rightPressed = false;
        this.leftPressed = false; 
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.draw();
        }
    }
}
