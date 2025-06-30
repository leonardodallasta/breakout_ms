class PowerUp {
    constructor(x, y, type = "paddleSize") {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.width = 24;
        this.height = 24;
        this.type = type;
        this.dy = 2;
        this.active = true;
    }


    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.getColor();
        ctx.fillRect(this.x - 12, this.y - 12, 24, 24);
        ctx.strokeStyle = "#003366";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 12, this.y - 12, 24, 24);
        this.drawSymbol(ctx);
        ctx.restore();
    }

    drawSymbol(ctx) {
        const symbol = this.getSymbol();

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbol, this.x, this.y);
    }

    getSymbol() {
        switch (this.type) {
            case "paddleSize": return "⇔";
            case "extraLife": return "❤️";
            case "multiBall": return "🔵";
            default: return "?";
        }
    }

    getColor() {
        switch (this.type) {
            case "paddleSize": return "#00BFFF"; 
            case "extraLife": return "#FF5555";  
            case "multiBall": return "#A020F0";  
            default: return "#CCCCCC";          
        }
    }

    move() {
        this.y += this.dy;
    }
}
