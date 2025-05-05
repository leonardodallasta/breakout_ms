const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

console.log(canvas);

const game = new Game(canvas, ctx);

const controls = new Controls(game);

document.addEventListener("keydown", controls.keyDownHandler.bind(controls), false);
document.addEventListener("keyup", controls.keyUpHandler.bind(controls), false);

game.startGame();