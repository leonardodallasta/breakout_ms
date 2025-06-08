class Controls {
    constructor(game) {
        this.game = game;
        this.dialogBox = document.createElement("div");
        this.dialogBox.textContent = "Choose Controls";
        this.dialogBox.classList.add("no-close");
        this.dialogBox.style.display = "none";
        this.dialogBox.style.width = "400px";
        document.body.appendChild(this.dialogBox);

        const keyboardButton = document.createElement("button");
        keyboardButton.textContent = "Keyboard";
        keyboardButton.addEventListener("click", () => this.enableKeyboardControls());
        this.dialogBox.appendChild(keyboardButton);

        const mouseButton = document.createElement("button");
        mouseButton.textContent = "Mouse";
        mouseButton.addEventListener("click", () => this.enableMouseControls());
        this.dialogBox.appendChild(mouseButton);

        this.createPauseMenu();
    }

    showDialog() {
        this.dialogBox.style.display = "block";
    }

    enableKeyboardControls() {
        document.addEventListener("keydown", this.keyDownHandler.bind(this), false);
        document.addEventListener("keyup", this.keyUpHandler.bind(this), false);
        this.dialogBox.style.display = "none";
        this.game.draw();
    }

    enableMouseControls() {
        document.addEventListener("mousemove", this.mouseMoveHandler.bind(this), false);
        document.removeEventListener("keydown", this.removeKeyboard, false);
        document.removeEventListener("keyup", this.removeKeyup, false);
        this.dialogBox.style.display = "none";
        this.game.draw();
    }

    keyDownHandler(e) {
        switch (e.key) {
            case "ArrowRight":
            case "Right":
                this.game.rightPressed = true;
                break;
            case "ArrowLeft":
            case "Left":
                this.game.leftPressed = true;
                break;
            case "Escape":
                this.togglePauseMenu();
                break;
        }
    }

    keyUpHandler(e) {
        switch (e.key) {
            case "ArrowRight":
            case "Right":
                this.game.rightPressed = false;
                break;
            case "ArrowLeft":
            case "Left":
                this.game.leftPressed = false;
                break;
        }
    }

    mouseMoveHandler(e) {
        const relativeX = e.clientX - this.game.canvas.offsetLeft;
        if (relativeX > 0 && relativeX < this.game.canvas.width) {
            this.game.paddleX = relativeX - this.game.paddleWidth / 2;
        }
    }

    createPauseMenu() {
        this.pauseMenu = document.createElement("div");
        this.pauseMenu.style.position = "absolute";
        this.pauseMenu.style.top = "50%";
        this.pauseMenu.style.left = "50%";
        this.pauseMenu.style.transform = "translate(-50%, -50%)";
        this.pauseMenu.style.padding = "30px";
        this.pauseMenu.style.backgroundColor = "#fff";
        this.pauseMenu.style.border = "2px solid #000";
        this.pauseMenu.style.display = "none";
        this.pauseMenu.style.zIndex = "1000";
        this.pauseMenu.style.textAlign = "center";
        this.pauseMenu.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
        document.body.appendChild(this.pauseMenu);

        const title = document.createElement("h2");
        title.textContent = "Game paused";
        this.pauseMenu.appendChild(title);

        const resumeButton = document.createElement("button");
        resumeButton.textContent = "Continue";
        resumeButton.style.margin = "10px";
        resumeButton.addEventListener("click", () => {
            this.hidePauseMenu();
            this.game.togglePause();
        });
        this.pauseMenu.appendChild(resumeButton);

        this.soundButton = document.createElement("button");
        this.soundButton.style.margin = "10px";
        this.soundButton.addEventListener("click", () => {
            this.game.toggleSound();
            this.updateSoundButton();
        });
        this.pauseMenu.appendChild(this.soundButton);

        this.updateSoundButton();
    }

    togglePauseMenu() {
        if (this.pauseMenu.style.display === "none") {
            this.showPauseMenu();
            if (!this.game.isPaused) this.game.togglePause();
        } else {
            this.hidePauseMenu();
            if (this.game.isPaused) this.game.togglePause();
        }
    }

    showPauseMenu() {
        this.updateSoundButton();
        this.pauseMenu.style.display = "block";
    }

    hidePauseMenu() {
        this.pauseMenu.style.display = "none";
    }

    updateSoundButton() {
        if (this.game.soundEnabled) {
            this.soundButton.textContent = "Mute sound";
        } else {
            this.soundButton.textContent = "Unmute sound";
        }
    }

}
