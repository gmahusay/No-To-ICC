// js/animation.js
export class GameOverAnimation {
    constructor(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        
        this.state = 'approaching'; // 'approaching', 'landing', 'departing', 'done'
        this.planeX = -150;    // Start off-screen to the left
        this.planeY = -80;     // Start off-screen above
        this.planeSpeed = 4;
        
        this.scale = 0.3;
        this.timer = 0;
    }

    update() {
        if (this.state === 'approaching') {
            const dx = this.targetX - this.planeX;
            const dy = this.targetY - this.planeY;
            const dist = Math.hypot(dx, dy);
            
            if (dist < this.planeSpeed) {
                this.planeX = this.targetX;
                this.planeY = this.targetY;
                this.state = 'landing';
                this.timer = 60; // Wait 1 second at 60fps
            } else {
                this.planeX += (dx / dist) * this.planeSpeed;
                this.planeY += (dy / dist) * this.planeSpeed;
                this.scale = Math.min(1, this.scale + 0.005);
            }
        } else if (this.state === 'landing') {
            this.timer--;
            if (this.timer <= 0) {
                this.state = 'departing';
            }
        } else if (this.state === 'departing') {
            this.planeX += this.planeSpeed * 1.5; // Fly off to the right
            this.planeY -= this.planeSpeed * 0.5;
            this.scale = Math.max(0.2, this.scale - 0.01);
            
            if (this.planeX > 1000) {
                this.state = 'done';
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.planeX, this.planeY);
        ctx.scale(this.scale, this.scale);
        
        // Draw shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(0, 50, 40, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Airplane
        ctx.fillStyle = '#e2e8f0'; // Light slate
        
        // Fuselage
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cockpit window
        ctx.fillStyle = '#38bdf8'; // Sky blue
        ctx.beginPath();
        ctx.arc(35, -5, 5, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(10, -10);
        ctx.lineTo(-20, -50);
        ctx.lineTo(-30, -50);
        ctx.lineTo(-10, 0);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(-20, 50);
        ctx.lineTo(-30, 50);
        ctx.lineTo(-10, 0);
        ctx.fill();
        
        // Tail
        ctx.beginPath();
        ctx.moveTo(-40, -10);
        ctx.lineTo(-55, -30);
        ctx.lineTo(-65, -30);
        ctx.lineTo(-50, 0);
        ctx.fill();
        
        // If landing/departing, target is "inside" the plane
        if (this.state === 'landing') {
            // "Beaming up" effect
            ctx.fillStyle = 'rgba(250, 204, 21, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, 15);
            ctx.lineTo(20, 60);
            ctx.lineTo(-20, 60);
            ctx.fill();
        }

        ctx.restore();
    }
}
