class Controls {
    constructor(game) {
        console.log(document.createElement("div"));
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
        if (e.keyCode === 39) {
            this.game.rightPressed = true;
        } else if (e.keyCode === 37) {
            this.game.leftPressed = true;
        } else if (e.key === "Escape") {
            alert("PAUSED!");
        }
        else if (e.key === "p" || e.key === "P") {
            this.game.togglePause();
        }
    }

    keyUpHandler(e) {
        if (e.keyCode === 39) {
            this.game.rightPressed = false;
        } else if (e.keyCode === 37) {
            this.game.leftPressed = false;
        }
    }

    mouseMoveHandler(e) {
        const relativeX = e.clientX - this.game.canvas.offsetLeft;
        if (relativeX > 0 && relativeX < this.game.canvas.width) {
            this.game.paddleX = relativeX - this.game.paddleWidth / 2;
        }
    }
}