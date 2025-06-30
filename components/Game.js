class Particle {
    constructor(x, y, explosionType = 'random') {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.type = explosionType;

        if (explosionType === 'bomb') {
            const bombColors = ['rgb(255, 69, 0)', 'rgb(255, 140, 0)', 'rgb(255, 215, 0)', 'rgb(105, 105, 105)', 'rgb(255, 255, 255)'];
            this.color = bombColors[Math.floor(Math.random() * bombColors.length)];
        } else if (explosionType === 'spark') {
            const sparkColors = ['#FFD700', '#FFFF00', '#FFA500', '#FFFFFF'];
            this.color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
            this.speedY = -Math.random() * 2 - 1;
            this.speedX = (Math.random() - 0.5) * 3;
            this.size = Math.random() * 2 + 0.5;
            this.decay = 0.05;
        } 
        else if (explosionType === 'powerupCascade') {
            const magicColors = ['#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5', '#ff8b94'];
            this.color = magicColors[Math.floor(Math.random() * magicColors.length)];
            this.speedY = -Math.random() * 2.5 - 1; 
            this.speedX = (Math.random() - 0.5) * 2;
            this.size = Math.random() * 3 + 2;
            this.decay = Math.random() * 0.01 + 0.015;
            this.gravity = 0.05;
        }
        else if (explosionType === 'powerup') {
            const magicColors = ['#7CFC00', '#00FFFF', '#FF00FF', '#4B0082', '#00FF7F', '#9400D3', '#ADD8E6', '#FFFFFF'];
            this.color = magicColors[Math.floor(Math.random() * magicColors.length)];
            this.speedX = (Math.random() - 0.5) * 6;
            this.speedY = (Math.random() - 0.5) * 6;
            this.size = Math.random() * 4 + 1;
            this.decay = Math.random() * 0.015 + 0.005;
        } else {
            this.color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
        }
    }

    update() {
        if (this.type === 'powerupCascade') {
            this.speedY += this.gravity;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
    }

    isAlive() {
        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;

        if (this.type === 'powerupCascade' || this.type === 'powerup') {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.drawFunctions = new Draw(this.ctx, this.canvas);
        this.powerUps = [];
        this.originalPaddleWidth = 100;
        this.paddleResizeTimeout = null;

        this.DEFAULT_BRICK_ROWS = 5;
        this.DEFAULT_BRICK_COLUMNS = 2;

        this.brickSettings = {
            rowCount: this.DEFAULT_BRICK_ROWS,
            columnCount: this.DEFAULT_BRICK_COLUMNS,
            width: 75,
            height: 20,
            padding: 10,
            offsetTop: 50,
            offsetLeft: 30,
        };

        this.hitSound = new Audio("assets/Audio/hitb.mp3");
        this.loseSound = new Audio("assets/Audio/lose.mp3");
        this.winSound = new Audio("assets/Audio/win.mp3");
        this.fallSound = new Audio("assets/Audio/fall.mp3");
        this.powerUpSound = new Audio("assets/Audio/powerup.mp3");

        this.soundEnabled = true;
        this.highscore = 0;
        this.initializeGameSettings();
        this.bricks = [];
        this.createBricks();
        this.particles = [];
    }

    initializeGameSettings() {
        this.ballRadius = 10;
        this.level = 1;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 30;
        this.dx = 5;
        this.dy = -5;
        this.paddleHeight = 10;
        this.paddleWidth = this.originalPaddleWidth;
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
        this.rightPressed = false;
        this.leftPressed = false;
        this.score = 0;
        this.lives = 3;
        this.brickHit = 0;
        this.isPaused = false;
        this.isPaddleExtended = false;
        this.extraBalls = [];
        this.isLevelComplete = false;
    }

    getBrickPosition(c, r) {
        const x = c * (this.brickSettings.width + this.brickSettings.padding) + this.brickSettings.offsetLeft;
        const y = r * (this.brickSettings.height + this.brickSettings.padding) + this.brickSettings.offsetTop;
        return { x, y };
    }

    createBricks() {
        this.bricks = [];
        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickSettings.rowCount; r++) {
                const { x, y } = this.getBrickPosition(c, r);
                this.bricks[c][r] = { x, y, status: 1, isBonus: 0 };
            }
        }

        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            const randomRow = Math.floor(Math.random() * this.brickSettings.rowCount);
            if (this.bricks[c] && this.bricks[c][randomRow]) {
                this.bricks[c][randomRow].isBonus = 1;
            }
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
        } else if (this.isLevelComplete) {
            this.drawFunctions.clearCanvas();
            this.ctx.save();
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.drawFunctions.drawText(`Level ${this.level - 1} Complete!`, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        } else {
            this.drawScene();
            this.drawPowerUps();
            this.collisionDetection();
            this.checkPowerUpCollision();
            this.moveBall();
            this.moveExtraBalls();
            this.updateParticles();
            this.drawParticles();
        }

        requestAnimationFrame(() => this.draw());
    }

    drawScene() {
        this.drawFunctions.clearCanvas();
        this.drawFunctions.drawBricks(this.bricks, this.brickSettings);
        this.drawFunctions.drawBall(this.x, this.y, this.ballRadius);
        this.drawFunctions.drawPaddle(this.paddleX, this.paddleWidth, this.paddleHeight);

        this.ctx.save();
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#0095DD";
        this.ctx.textBaseline = 'top';

        this.ctx.textAlign = 'left';
        this.ctx.fillText("Score: " + this.score, 8, 10);

        this.ctx.textAlign = 'center';
        this.ctx.fillText("High Score: " + this.highscore, this.canvas.width / 2, 10);

        this.ctx.textAlign = 'right';
        this.ctx.fillText("Level: " + this.level, this.canvas.width - 8, 10);
        this.ctx.fillText("Lives: " + this.lives, this.canvas.width - 8, 30);
        this.ctx.restore();
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
                }
            }
            
            ball.x += ball.dx;
            ball.y += ball.dy;

            this.drawFunctions.drawBall(ball.x, ball.y, ball.radius);

            for (let c = 0; c < this.brickSettings.columnCount; c++) {
                for (let r = 0; r < this.brickSettings.rowCount; r++) {
                    const b = this.bricks[c][r];
                    if (b.status !== 1) continue;
                    if (ball.x > b.x && ball.x < b.x + this.brickSettings.width && ball.y > b.y && ball.y < b.y + this.brickSettings.height) {
                        b.status = 0;
                        this.brickHit++;
                        this.playSound(this.hitSound);
                        ball.dy = -ball.dy;
                        this.score++;
                        if (this.score > this.highscore) this.highscore = this.score;
                        if (this.brickHit === this.brickSettings.rowCount * this.brickSettings.columnCount) {
                            this.winLevel();
                        }
                    }
                }
            }
        }
        this.extraBalls = this.extraBalls.filter(b => b.active);
    }

    collisionDetection() {
        for (let c = 0; c < this.brickSettings.columnCount; c++) {
            for (let r = 0; r < this.brickSettings.rowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status !== 1 || !this.isBallCollidingWithBrick(b)) continue;

                this.brickHit++;
                this.playSound(this.hitSound);
                this.dy = -this.dy;
                b.status = 0;

                const centerX = b.x + this.brickSettings.width / 2;
                const centerY = b.y + this.brickSettings.height / 2;
                const explosionType = Math.random() < 0.5 ? 'bomb' : 'random';
                for (let i = 0; i < 20; i++) {
                    this.particles.push(new Particle(centerX, centerY, explosionType));
                }

                if (b.isBonus === 1) {
                    const types = ["paddleSize", "extraLife", "multiBall"];
                    const randomType = types[Math.floor(Math.random() * types.length)];
                    this.powerUps.push(new PowerUp(this.x, this.y, randomType));
                }

                this.score += b.isBonus ? 5 : 1;
                if (this.score > this.highscore) this.highscore = this.score;

                if (this.brickHit === this.brickSettings.rowCount * this.brickSettings.columnCount) {
                    this.winLevel();
                    return;
                }
            }
        }
    }
    
    winLevel() {
        this.playSound(this.winSound);
        this.level++;
        this.isLevelComplete = true;
        
        if (this.brickSettings.columnCount < 10) {
            this.brickSettings.columnCount++;
        }
        
        setTimeout(() => {
            if (this.paddleWidth > 50) this.paddleWidth -= 15;
            this.isLevelComplete = false;
            this.resetForNextLevel();
        }, 2000);
    }

    updateParticles() {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.isAlive());
    }

    drawParticles() {
        this.particles.forEach(p => p.draw(this.ctx));
    }

    playSound(sound) {
        if (!this.soundEnabled) return;
        sound.currentTime = 0;
        sound.play().catch(error => console.log("Erro ao tocar som:", error));
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
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
        this.dx = 5 + (this.level - 1);
        this.dy = -5 - (this.level - 1);
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
    }

    handleBallBottomCollision() {
        if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
            this.bounceBallOffPaddle();
        } else {
            this.lives--;
            if (!this.lives) {
                this.playSound(this.loseSound);
                alert("GAME OVER");
                this.highscore = Math.max(this.score, this.highscore);
                this.restart();
            } else {
                this.playSound(this.fallSound);
                this.resetBallPosition();
            }
        }
    }

    bounceBallOffPaddle() {
        this.dy = -this.dy;
        const ballOffset = this.x - this.paddleX;
        const paddleCenter = this.paddleWidth / 2;
        const relativePosition = (ballOffset - paddleCenter) / paddleCenter;
        this.dx = relativePosition * 5;

        this.playSound(this.hitSound);

        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(this.x, this.canvas.height - this.paddleHeight - 5, 'spark'));
        }
    }

    paddleMovement() {
        if (this.rightPressed && this.paddleX < this.canvas.width - this.paddleWidth) {
            this.paddleX += 10;
        } else if (this.leftPressed && this.paddleX > 0) {
            this.paddleX -= 10;
        }
    }

    applyPaddleSizePowerUp() {
        this.paddleWidth += 40;
        if (this.paddleWidth > this.canvas.width * 0.8) {
            this.paddleWidth = this.canvas.width * 0.8;
        }
        this.isPaddleExtended = true;

        if (this.paddleResizeTimeout) {
            clearTimeout(this.paddleResizeTimeout);
        }

        this.paddleResizeTimeout = setTimeout(() => {
            this.paddleWidth = this.originalPaddleWidth;
            this.isPaddleExtended = false;
        }, 10000);
    }

    checkPowerUpCollision() {
        for (const powerUp of this.powerUps) {
            if (powerUp.active &&
                powerUp.y + powerUp.height > this.canvas.height - this.paddleHeight &&
                powerUp.x > this.paddleX &&
                powerUp.x < this.paddleX + this.paddleWidth
            ) {
                powerUp.active = false;
                this.playSound(this.powerUpSound);

                const paddleTopY = this.canvas.height - this.paddleHeight;
                for (let i = 0; i < 40; i++) {
                    const particleX = this.paddleX + Math.random() * this.paddleWidth;
                    this.particles.push(new Particle(particleX, paddleTopY, 'powerupCascade'));
                }

                switch (powerUp.type) {
                    case "paddleSize":
                        this.applyPaddleSizePowerUp();
                        break;
                    case "extraLife":
                        this.lives++;
                        break;
                    case "multiBall":
                        this.spawnExtraBall();
                        break;
                }
            }
        }
    }

    spawnExtraBall() {
        const extraBall = {
            x: this.x,
            y: this.y,
            dx: -this.dx,
            dy: this.dy,
            radius: this.ballRadius,
            active: true
        };
        this.extraBalls.push(extraBall);
    }

    restart() {
        this.initializeGameSettings();
        this.brickSettings.columnCount = this.DEFAULT_BRICK_COLUMNS;
        this.createBricks();
    }

    resetForNextLevel() {
        this.brickHit = 0;
        this.createBricks();
        this.resetBallPosition();
        this.extraBalls = [];
        this.particles = [];
        this.powerUps = [];
    }
}
