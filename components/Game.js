class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.drawFunctions = new Draw(this.ctx, this.canvas);
        this.powerUps = [];
        this.paddleWidth = 100;
        this.originalPaddleWidth = this.paddleWidth;
        this.paddleResizeTimeout = null;


        this.DEFAULT_BRICK_ROWS = 5;
        this.DEFAULT_BRICK_COLUMNS = 2;

        this.brickSettings = {
            rowCount: this.DEFAULT_BRICK_ROWS,
            columnCount: this.DEFAULT_BRICK_COLUMNS,
            width: 75,
            height: 20,
            padding: 10,
            offsetTop: 30,
            offsetLeft: 30,
        };

        this.hitSound = new Audio("assets/Audio/hitb.mp3");
        this.loseSound = new Audio("assets/Audio/lose.mp3");
        this.winSound = new Audio("assets/Audio/win.mp3");
        this.fallSound = new Audio("assets/Audio/fall.mp3");
        this.powerUpSound = new Audio("assets/Audio/powerup.mp3");

        this.soundEnabled = true;
        this.initializeGameSettings();
        this.bricks = [];
        this.createBricks();
    }

    initializeGameSettings() {
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
        this.score = 0;
        this.lives = 3;
        this.highscore = 0;
        this.brickHit = 0;
        this.isPaused = false;
        this.isPaddleExtended = false;
    }

    getBrickPosition(c, r) {
        const x = c * (this.brickSettings.width + this.brickSettings.padding) + this.brickSettings.offsetLeft;
        const y = r * (this.brickSettings.height + this.brickSettings.padding) + this.brickSettings.offsetTop;
        return { x, y };
    }

    createBricks() {
        const MAX_RANDOM_ROW = this.DEFAULT_BRICK_ROWS;

        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickSettings.rowCount; r++) {
                const { x, y } = this.getBrickPosition(c, r);
                this.bricks[c][r] = { x, y, status: 1, isBonus: 0 };
            }
        }

        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            const randomRow = Math.floor(Math.random() * MAX_RANDOM_ROW);
            this.bricks[c][randomRow].isBonus = 1;
        }
    }

    isBallCollidingWithBrick(brick) {
        return this.x > brick.x &&
               this.x < brick.x + this.brickSettings.width &&
               this.y > brick.y &&
               this.y < brick.y + this.brickSettings.height;
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

        this.drawScene();
        this.drawPowerUps();
        this.collisionDetection();
        this.checkPowerUpCollision();
        this.moveBall();
        this.moveExtraBalls();
        requestAnimationFrame(() => this.draw());
    }

    drawScene() {
        this.drawFunctions.clearCanvas();
        this.drawFunctions.drawBricks(this.bricks, this.brickSettings);
        this.drawFunctions.drawBall(this.x, this.y, this.ballRadius);
        this.drawFunctions.drawPaddle(this.paddleX, this.paddleWidth, this.paddleHeight);
        this.drawFunctions.drawText("Score: " + this.score, 8, 20);
        this.drawFunctions.drawText("High Score: " + this.highscore, this.canvas.width / 2 - 90, 20);
        this.drawFunctions.drawText("Lives: " + this.lives, this.canvas.width / 2 + 80, 20);
        this.drawFunctions.drawText("Level: " + this.level, this.canvas.width - 65, 20);
    }

    drawPowerUps() {
        for (const powerUp of this.powerUps) {
            powerUp.draw(this.ctx);
            powerUp.move();

            if (powerUp.y > this.canvas.height) {
                powerUp.active = false;
            }
        }
    
        this.powerUps = this.powerUps.filter(p => p.active);
    }    

    moveExtraBalls() {
        if (!this.extraBalls) return;
    
        for (const ball of this.extraBalls) {
            if (!ball.active) continue;
    
            if (ball.x + ball.dx > this.canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
                ball.dx = -ball.dx;
            }
    
            if (ball.y + ball.dy < ball.radius) {
                ball.dy = -ball.dy;
            } else if (ball.y + ball.dy > this.canvas.height - ball.radius) {
                if (ball.x > this.paddleX && ball.x < this.paddleX + this.paddleWidth) {
                    ball.dy = -ball.dy;
                } else {
                    ball.active = false;
                    continue;
                }
            }

            ball.x += ball.dx;
            ball.y += ball.dy;
  
            this.drawFunctions.drawBall(ball.x, ball.y, ball.radius);
   
            for (let c = 0; c < this.brickSettings.columnCount; c++) {
                for (let r = 0; r < this.brickSettings.rowCount; r++) {
                    const b = this.bricks[c][r];
                    if (b.status !== 1) continue;
                    if (
                        ball.x > b.x &&
                        ball.x < b.x + this.brickSettings.width &&
                        ball.y > b.y &&
                        ball.y < b.y + this.brickSettings.height
                    ) {
                        b.status = 0;
                        this.brickHit++;
                        this.playSound(this.hitSound);
                        ball.dy = -ball.dy;
    
                        if (b.isBonus === 1) {
                            const types = ["paddleSize", "extraLife", "multiBall"];
                            const randomType = types[Math.floor(Math.random() * types.length)];
                            const powerUp = new PowerUp(ball.x, ball.y, randomType);
                            this.powerUps.push(powerUp);
                        }
    
                        this.score += b.isBonus ? 5 : 1;
                        if (this.score > this.highscore) this.highscore = this.score;
                    }
                }
            }
        }
    
        this.extraBalls = this.extraBalls.filter(b => b.active);
    }    

    collisionDetection() {
        const totalBricks = this.brickSettings.rowCount * this.brickSettings.columnCount;

        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            for (let r = 0; r < this.brickSettings.rowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status !== 1 || !this.isBallCollidingWithBrick(b)) continue;

                this.brickHit++;
                this.playSound(this.hitSound);
                this.dy = -this.dy;
                b.status = 0;

                if (b.isBonus === 1) {
                    const types = ["paddleSize", "extraLife", "multiBall"];
                    const randomType = types[Math.floor(Math.random() * types.length)];
                    const powerUp = new PowerUp(this.x, this.y, randomType);

                    this.powerUps.push(powerUp);
                }                

                this.score += b.isBonus ? 5 : 1;
                if (this.score > this.highscore) this.highscore = this.score;

                if (this.brickHit === totalBricks) {
                    this.playSound(this.winSound);
                    this.level++;
                    this.dx += 1;
                    this.dy -= 1;
                    this.brickSettings.columnCount++;
                    setTimeout(() => {
                        alert("YOU WIN, CONGRATS!");
                        this.paddleWidth -= 15;
                        this.restart();
                    });
                    return;
                }
            }
        }
    }

    playSound(sound) {
        if (!this.soundEnabled) return;
        sound.currentTime = 0;
        sound.play();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    moveBall() {
        const hitRightWall = this.x + this.dx > this.canvas.width - this.ballRadius;
        const hitLeftWall = this.x + this.dx < this.ballRadius;

        if (hitRightWall || hitLeftWall) this.dx = -this.dx;

        if (this.y + this.dy < this.ballRadius) {
            this.dy = -this.dy;
        } else if (this.y + this.dy > this.canvas.height - this.ballRadius) {
            this.handleBallBottomCollision();
        }

        this.paddleMovement();
        this.x += this.dx;
        this.y += this.dy;
    }

    resetBallPosition() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 30;
        this.dx = 5;
        this.dy = -5;
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
    }    

    handleBallBottomCollision() {
        if (!this.isPaddleExtended) {
            this.paddleWidth = this.originalPaddleWidth;
        }
        
        if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
            this.bounceBallOffPaddle();
        } else {
            this.lives--;
            if (!this.lives) {
                this.loseSound.play();
                setTimeout(() => {
                    alert("GAME OVER");
                    this.dx = 5;
                    this.dy = -5;
                    this.score = 0;
                    this.lives = 3;
                    this.level = 1;
                    this.paddleWidth = this.originalPaddleWidth;
                    this.restart();
                }, 0);
            } else {
                this.fallSound.play();
                this.resetBallPosition();
            }
        }
    }    

    bounceBallOffPaddle() {
        this.dy = -this.dy;
        const ballOffset = this.x - this.paddleX;
        const paddleCenter = this.paddleWidth / 2;
        const relativePosition = (ballOffset - paddleCenter) / this.paddleWidth;
        let angleChange = relativePosition * Math.PI / 3;
        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        this.dx = Math.sin(angleChange) * speed;
        this.dy = -Math.cos(angleChange) * speed;
    }

    resetGameState() {
        this.dx = 5;
        this.dy = -5;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.paddleWidth = 100;
    }

    applyPaddleSizePowerUp() {
        this.paddleWidth += 30;
    
        if (this.paddleWidth > this.canvas.width * 0.9) {
            this.paddleWidth = this.canvas.width * 0.9;
        }
    
        this.isPaddleExtended = true;
    
        if (this.paddleResizeTimeout) {
            clearTimeout(this.paddleResizeTimeout);
        }
    
        this.paddleResizeTimeout = setTimeout(() => {
            this.paddleWidth = this.originalPaddleWidth;
            this.isPaddleExtended = false;
            console.log("Barra voltou ao tamanho original.");
        }, 5000);
    
        console.log("Power-up coletado: paddleSize (barra aumentada por 5s)");
    }
    
    checkPowerUpCollision() {
        for (const powerUp of this.powerUps) {
            if (!powerUp.active) continue;
    
            const powerUpBottom = powerUp.y + powerUp.radius;
            const paddleTop = this.canvas.height - this.paddleHeight;
    
            if (
                powerUpBottom >= paddleTop &&
                powerUp.x > this.paddleX &&
                powerUp.x < this.paddleX + this.paddleWidth
            ) {
                powerUp.active = false;
                this.powerUpSound.currentTime = 0;
                this.powerUpSound.play();
    
                switch (powerUp.type) {
                    case "paddleSize":
                        this.applyPaddleSizePowerUp();
                        break;
                    case "extraLife":
                        this.lives++;
                        console.log("Power-up coletado: +1 vida!");
                        break;
                    case "multiBall":
                        this.spawnExtraBall();
                        console.log("Power-up coletado: multiBall!");
                        break;
                }
            }
        }
    }    

    spawnExtraBall() {
        const extraBall = {
            x: this.x,
            y: this.y,
            dx: -this.dx, // direção oposta para variar
            dy: -this.dy,
            radius: this.ballRadius,
            active: true
        };
    
        if (!this.extraBalls) {
            this.extraBalls = [];
        }
    
        this.extraBalls.push(extraBall);
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
        this.extraBalls = [];
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.draw();
        }
    }
}
