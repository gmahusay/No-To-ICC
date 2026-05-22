export class Projectile {
    constructor(x, y, target, damage, color, sourceType) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.sourceType = sourceType;
        this.speed = 5;
        this.radius = 4;
        this.hit = false;
    }

    update() {
        if (!this.target || this.target.health <= 0) {
            this.hit = true; // Mark as done if target is dead/gone
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.speed + this.target.radius) {
            // Collision
            this.target.health -= this.damage;
            this.hit = true;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        // Glowing effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0; // reset
    }
}
