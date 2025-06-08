const key_code_right_arrow = 39;
const key_code_left_arrow = 37;

class Controls {
    constructor(game) {
        this.game = game;

        this.boundKeyDownHandler = this.keyDownHandler.bind(this);
        this.boundKeyUpHandler = this.keyUpHandler.bind(this);
        this.boundMouseMoveHandler = this.mouseMoveHandler.bind(this);

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
        document.removeEventListener("mousemove", this.boundMouseMoveHandler, false);
        
        document.addEventListener("keydown", this.boundKeyDownHandler, false);
        document.addEventListener("keyup", this.boundKeyUpHandler, false);
        
        this.dialogBox.style.display = "none";
        this.game.draw();
    }

    enableMouseControls() {
        document.removeEventListener("keydown", this.boundKeyDownHandler, false);
        document.removeEventListener("keyup", this.boundKeyUpHandler, false);

        document.addEventListener("mousemove", this.boundMouseMoveHandler, false);
        
        this.dialogBox.style.display = "none";
        this.game.draw();
    }

    keyDownHandler(e) {
        if (e.keyCode === key_code_right_arrow) {
            this.game.rightPressed = true;
        } else if (e.keyCode === key_code_left_arrow) {
            this.game.leftPressed = true;
        } else if (e.key === "Escape") {
            alert("PAUSED!");
        } else if (e.key === "p" || e.key === "P") {
            this.game.togglePause();
        }
    }

    keyUpHandler(e) {
        if (e.keyCode === key_code_right_arrow) {
            this.game.rightPressed = false;
        } else if (e.keyCode === key_code_left_arrow) {
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