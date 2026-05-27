import { pathWaypoints } from './map.js?v=3';

export class Enemy {
    constructor(type, x, y, health, speed, color, reward) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.color = color;
        this.reward = reward;
        this.radius = 15;
        this.waypointIndex = 1; // Target the second waypoint initially
        this.distanceTraveled = 0; // For walking animation
        
        // Status Effects
        this.originalSpeed = speed;
        this.slowTimer = 0;
        this.stunTimer = 0;
        this.retreating = false;
        this.isRetreatingToStart = false;
        this.offScreenWaitTimer = 0;
    }

    applyEffect(type, duration) {
        if (type === 'slow') {
            this.slowTimer = Math.max(this.slowTimer, duration);
        } else if (type === 'stun') {
            this.stunTimer = Math.max(this.stunTimer, duration);
        } else if (type === 'retreat') {
            this.retreating = true;
            this.isRetreatingToStart = true;
        }
    }

    update() {
        if (this.waypointIndex >= pathWaypoints.length) {
            return; // Reached the end
        }

        if (this.stunTimer > 0) {
            this.stunTimer--;
            return; // Stunned, cannot move
        }

        let currentSpeed = this.originalSpeed;
        if (this.slowTimer > 0) {
            this.slowTimer--;
            currentSpeed *= 0.5; // 50% slower
        }

        if (this.offScreenWaitTimer > 0) {
            this.offScreenWaitTimer--;
            if (this.offScreenWaitTimer <= 0) {
                this.retreating = false;
                this.waypointIndex = 1;
            }
            return;
        }

        if (this.retreating) {
            // Target the previous waypoint
            let prevIndex = this.waypointIndex - 1;
            if (prevIndex < 0) prevIndex = 0;
            
            const target = pathWaypoints[prevIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance < currentSpeed) {
                this.x = target.x;
                this.y = target.y;
                this.distanceTraveled -= distance;
                
                if (this.waypointIndex > 1) {
                    this.waypointIndex--;
                } else if (this.waypointIndex === 1 && prevIndex === 0) {
                    // Reached the start position! Hide and wait 2 seconds (120 frames)
                    this.offScreenWaitTimer = 120;
                    this.isRetreatingToStart = false; // Out of frame now
                }
            } else {
                this.x += (dx / distance) * currentSpeed;
                this.y += (dy / distance) * currentSpeed;
                this.distanceTraveled -= currentSpeed;
            }
            return; // Skip normal movement
        }

        const target = pathWaypoints[this.waypointIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < currentSpeed) {
            this.x = target.x;
            this.y = target.y;
            this.distanceTraveled += distance;
            this.waypointIndex++;
        } else {
            this.x += (dx / distance) * currentSpeed;
            this.y += (dy / distance) * currentSpeed;
            this.distanceTraveled += currentSpeed;
        }
    }

    draw(ctx) {
        if (this.offScreenWaitTimer > 0) return; // Don't draw if hiding off-screen

        ctx.save();
        ctx.translate(this.x, this.y);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 18, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'Operative Scout') {
            this._drawScout(ctx);
        } else if (this.type === 'Operative Agent') {
            this._drawAgent(ctx);
        } else if (this.type === 'Boss Trillanes') {
            this._drawTrillanes(ctx);
        } else {
            this._drawCommander(ctx);
        }

        ctx.restore();

        // Health Bar (drawn in world space, above the figure)
        const healthPercent = this.health / this.maxHealth;
        const bw = 34, bh = 5;
        // Bar background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - bw / 2 - 1, this.y - 34, bw + 2, bh + 2);
        // Red bg
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(this.x - bw / 2, this.y - 33, bw, bh);
        // Green fill
        ctx.fillStyle = '#10b981';
        ctx.fillRect(this.x - bw / 2, this.y - 33, bw * healthPercent, bh);

        // Status Indicators
        if (this.stunTimer > 0) {
            ctx.fillStyle = '#fde047'; // yellow for stun
            ctx.beginPath();
            ctx.arc(this.x, this.y - 42, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.slowTimer > 0) {
            ctx.fillStyle = '#93c5fd'; // light blue for slow
            ctx.beginPath();
            ctx.arc(this.x, this.y - 42, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.retreating) {
            ctx.fillStyle = '#c084fc'; // purple for retreat
            ctx.beginPath();
            ctx.arc(this.x, this.y - 42, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Type label
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.replace('Operative ', ''), this.x, this.y - 38);
    }

    /* ─── Scout: Police officer with cap & badge ─── */
    _drawScout(ctx) {
        const c = this.color; // '#3b82f6' blue

        const leftLegY = Math.sin(this.distanceTraveled * 0.3) * 3;
        const rightLegY = -leftLegY;

        // Legs
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(-5, 8 + leftLegY, 4, 10);
        ctx.fillRect(1, 8 + rightLegY, 4, 10);

        // Boots
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-6, 16 + leftLegY, 5, 4);
        ctx.fillRect(1, 16 + rightLegY, 5, 4);

        // Body / Uniform
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(-8, -2, 16, 12, 3);
        ctx.fill();

        // Badge
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-2, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(-2, 4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.fillStyle = c;
        ctx.fillRect(-13, -1, 5, 8);
        ctx.fillRect(8, -1, 5, 8);

        // Hands
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(-10, 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(11, 8, 3, 0, Math.PI * 2);
        ctx.fill();

        // Head (skin)
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, -9, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-4, -11, 3, 2);
        ctx.fillRect(1, -11, 3, 2);

        // Mouth
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-2, -6, 4, 1.5);

        // Police Cap brim
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(-10, -17, 20, 4);
        // Cap top
        ctx.beginPath();
        ctx.ellipse(0, -19, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cap badge star
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', 0, -16);
    }

    /* ─── Agent: Suited agent with sunglasses ─── */
    _drawAgent(ctx) {
        const c = this.color; // '#f59e0b' amber

        const leftLegY = Math.sin(this.distanceTraveled * 0.3) * 3;
        const rightLegY = -leftLegY;

        // Legs (dark trousers)
        ctx.fillStyle = '#292524';
        ctx.fillRect(-5, 8 + leftLegY, 4, 10);
        ctx.fillRect(1, 8 + rightLegY, 4, 10);

        // Shoes
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-6, 16 + leftLegY, 5, 4);
        ctx.fillRect(1, 16 + rightLegY, 5, 4);

        // Suit jacket
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.roundRect(-8, -2, 16, 12, 3);
        ctx.fill();

        // Shirt / tie
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-2, -1, 4, 9);
        ctx.fillStyle = c;
        ctx.fillRect(-1, -1, 2, 9);

        // Arms (jacket)
        ctx.fillStyle = '#292524';
        ctx.fillRect(-13, -1, 5, 8);
        ctx.fillRect(8, -1, 5, 8);

        // Hands
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(-10, 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(11, 8, 3, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, -9, 8, 0, Math.PI * 2);
        ctx.fill();

        // Sunglasses frame
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-7, -13, 6, 4);
        ctx.fillRect(1, -13, 6, 4);
        ctx.fillRect(-1, -12, 2, 2); // bridge

        // Mouth (smirk)
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, -6, 4, 1.5);

        // Earpiece wire
        ctx.strokeStyle = '#d4d4d4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, -10);
        ctx.lineTo(13, -6);
        ctx.lineTo(13, 2);
        ctx.stroke();

        // Hair (slicked)
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(0, -17, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ─── Commander: Armored boss with helmet & star ─── */
    _drawCommander(ctx) {
        const c = this.color; // '#9333ea' purple

        const leftLegY = Math.sin(this.distanceTraveled * 0.3) * 3;
        const rightLegY = -leftLegY;

        // Legs (armored)
        ctx.fillStyle = '#581c87';
        ctx.fillRect(-6, 8 + leftLegY, 5, 10);
        ctx.fillRect(1, 8 + rightLegY, 5, 10);

        // Boots (heavy)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-7, 16 + leftLegY, 6, 5);
        ctx.fillRect(1, 16 + rightLegY, 6, 5);

        // Body armor
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(-10, -4, 20, 14, 4);
        ctx.fill();

        // Armor highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(-8, -2, 16, 5, 2);
        ctx.fill();

        // Commander star insignia
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', 0, 6);

        // Arms (armored)
        ctx.fillStyle = '#7e22ce';
        ctx.fillRect(-15, -3, 6, 9);
        ctx.fillRect(9, -3, 6, 9);

        // Gauntlets
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(-12, 7, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12, 7, 4, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(-3, -6, 6, 3);

        // Helmet
        ctx.fillStyle = '#7e22ce';
        ctx.beginPath();
        ctx.arc(0, -13, 10, Math.PI, 0, false); // dome top
        ctx.fill();
        ctx.fillRect(-10, -14, 20, 6); // visor band

        // Visor
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, -12, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Visor glow
        ctx.fillStyle = 'rgba(245,158,11,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, -12, 9, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Helmet ridge
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-1, -23, 2, 10);
    }

    /* ─── Boss Trillanes: Final Boss with jacket and shades ─── */
    _drawTrillanes(ctx) {
        const leftLegY = Math.sin(this.distanceTraveled * 0.25) * 3;
        const rightLegY = -leftLegY;

        // Legs (dark trousers)
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-6, 8 + leftLegY, 5, 10);
        ctx.fillRect(1, 8 + rightLegY, 5, 10);

        // Shoes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-7, 16 + leftLegY, 6, 4);
        ctx.fillRect(1, 16 + rightLegY, 6, 4);

        // Jacket (open)
        ctx.fillStyle = '#334155'; // slate grey jacket
        ctx.beginPath();
        ctx.roundRect(-10, -4, 20, 14, 3);
        ctx.fill();
        
        // Shirt (white) in the middle
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-4, -4, 8, 14);
        
        // Tie (red)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-1, -4, 2, 8);

        // Arms (Jacket sleeves)
        ctx.fillStyle = '#334155';
        ctx.fillRect(-14, -3, 6, 10);
        ctx.fillRect(8, -3, 6, 10);

        // Hands
        ctx.fillStyle = '#fca5a5'; // skin tone
        ctx.beginPath();
        ctx.arc(-11, 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(11, 8, 3, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(0, -11, 9, 0, Math.PI * 2);
        ctx.fill();

        // Hair (short, neat)
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, -14, 8, Math.PI, 0, false);
        ctx.fill();

        // Shades
        ctx.fillStyle = '#0f172a'; // dark lenses
        ctx.beginPath();
        ctx.ellipse(-3, -12, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(3, -12, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bridge
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-1, -13);
        ctx.lineTo(1, -13);
        ctx.stroke();

        // Mouth (stern line)
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-3, -6);
        ctx.lineTo(3, -6);
        ctx.stroke();
    }

    hasReachedTarget() {
        // Assuming the last waypoint is the target
        return this.waypointIndex >= pathWaypoints.length - 1;
    }
}

export function spawnEnemy(wave) {
    const startPos = pathWaypoints[0];
    
    // Determine enemy type based on wave (simple progression)
    const rand = Math.random();
    
    if (wave >= 10 && rand < 0.15) {
        // Final Boss Trillanes
        return new Enemy('Boss Trillanes', startPos.x, startPos.y, 400 + (wave * 50), 0.6, '#dc2626', 100);
    } else if (wave > 5 && rand < 0.2) {
        // Operative Commander (Boss-like)
        return new Enemy('Operative Commander', startPos.x, startPos.y, 100 + (wave * 20), 0.8, '#9333ea', 20);
    } else if (wave > 2 && rand < 0.5) {
        // Operative Agent (Fast, lower health)
        return new Enemy('Operative Agent', startPos.x, startPos.y, 40 + (wave * 10), 1.8, '#f59e0b', 15);
    } else {
        // Operative Scout (Standard)
        return new Enemy('Operative Scout', startPos.x, startPos.y, 60 + (wave * 10), 1.2, '#3b82f6', 10);
    }
}
