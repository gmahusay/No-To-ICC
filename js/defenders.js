import { audio } from './audio.js';

export const defenderTypes = {
    protester: { cost: 50, range: 100, damage: 20, fireRate: 60, color: '#3b82f6', radius: 15 },
    lawyer: { cost: 100, range: 150, damage: 40, fireRate: 90, color: '#8b5cf6', radius: 18 },
    security: { cost: 200, range: 120, damage: 80, fireRate: 120, color: '#eab308', radius: 20 }
};

export class Defender {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        const config = defenderTypes[type];
        this.range = config.range;
        this.damage = config.damage;
        this.fireRate = config.fireRate;
        this.color = config.color;
        this.radius = config.radius;
        
        this.cooldown = 0;
        this.target = null;
    }

    draw(ctx) {
        // Draw Range Indicator (Subtle ring)
        ctx.save();
        ctx.strokeStyle = `${this.color}44`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 18, 13, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'protester') {
            this._drawProtester(ctx);
        } else if (this.type === 'lawyer') {
            this._drawLawyer(ctx);
        } else {
            this._drawSecurity(ctx);
        }

        ctx.restore();

        // Ready-to-fire indicator
        if (this.cooldown <= 0) {
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#10b981';
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(this.x + 12, this.y - 14, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /* ─── Protester: Civilian with picket sign & megaphone ─── */
    _drawProtester(ctx) {
        const c = '#3b82f6';

        // Legs
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(-5, 8, 4, 10);
        ctx.fillRect(1, 8, 4, 10);

        // Shoes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-6, 16, 5, 4);
        ctx.fillRect(1, 16, 5, 4);

        // T-Shirt body
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(-8, -2, 16, 12, 3);
        ctx.fill();

        // "NO" text on shirt
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NO!', 0, 8);

        // Left arm (raised holding sign)
        ctx.fillStyle = c;
        ctx.fillRect(-13, -8, 5, 8);

        // Right arm (holding megaphone)
        ctx.fillStyle = c;
        ctx.fillRect(8, 0, 5, 6);

        // Hands
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(-10, -10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(14, 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Picket sign pole
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(-10, -32);
        ctx.stroke();

        // Sign board
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(-20, -32, 22, 16);
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1;
        ctx.strokeRect(-20, -32, 22, 16);

        // Sign text
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NO TO', -9, -22);
        ctx.fillText('ICC!', -9, -15);

        // Megaphone body
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(13, 0);
        ctx.lineTo(22, -5);
        ctx.lineTo(22, 8);
        ctx.lineTo(13, 6);
        ctx.fill();
        // Megaphone handle
        ctx.fillStyle = '#b45309';
        ctx.fillRect(13, 1, 3, 5);

        // Head (skin)
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, -9, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (determined)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-4, -11, 3, 2);
        ctx.fillRect(1, -11, 3, 2);

        // Eyebrows (angled — angry)
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-5, -13); ctx.lineTo(-2, -12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, -13); ctx.lineTo(2, -12); ctx.stroke();

        // Mouth (yelling)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -6, 3, 0, Math.PI);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(0, -17, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ─── Lawyer: Suit + briefcase + legal paper ─── */
    _drawLawyer(ctx) {
        const c = '#8b5cf6';

        // Legs
        ctx.fillStyle = '#3730a3';
        ctx.fillRect(-5, 8, 4, 10);
        ctx.fillRect(1, 8, 4, 10);

        // Shoes
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-6, 16, 5, 4);
        ctx.fillRect(1, 16, 5, 4);

        // Suit jacket
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.roundRect(-8, -2, 16, 12, 3);
        ctx.fill();

        // Shirt
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-2, -1, 4, 9);

        // Tie
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(-1, -1);
        ctx.lineTo(1, -1);
        ctx.lineTo(2, 8);
        ctx.lineTo(0, 9);
        ctx.lineTo(-2, 8);
        ctx.fill();

        // Left arm (raised holding document)
        ctx.fillStyle = '#312e81';
        ctx.fillRect(-13, -6, 5, 8);

        // Right arm (down holding briefcase)
        ctx.fillStyle = '#312e81';
        ctx.fillRect(8, 0, 5, 8);

        // Hands
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(-10, -8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(11, 9, 3, 0, Math.PI * 2);
        ctx.fill();

        // Legal document
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(-20, -22, 14, 16);
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 1;
        ctx.strokeRect(-20, -22, 14, 16);
        // Lines on doc
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-18, -19 + i * 3.5);
            ctx.lineTo(-8, -19 + i * 3.5);
            ctx.stroke();
        }
        // ICC stamp
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ICC', -13, -9);

        // Big X over it
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-19, -21); ctx.lineTo(-7, -7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-7, -21); ctx.lineTo(-19, -7); ctx.stroke();

        // Briefcase body
        ctx.fillStyle = '#92400e';
        ctx.fillRect(7, 10, 14, 10);
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(7, 10, 14, 10);
        // Briefcase handle
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.quadraticCurveTo(14, 6, 18, 10);
        ctx.stroke();
        // Briefcase latch
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(12, 14, 4, 3);

        // Head
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, -9, 8, 0, Math.PI * 2);
        ctx.fill();

        // Glasses (round)
        ctx.strokeStyle = '#4c1d95';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(-4, -11, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(4, -11, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1, -11); ctx.lineTo(1, -11); ctx.stroke();

        // Mouth (confident smile)
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -5, 3, 0, Math.PI);
        ctx.stroke();

        // Hair (side-parted)
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(-1, -17, 8, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ─── Security: Tactical vest, sunglasses, fists up ─── */
    _drawSecurity(ctx) {
        const c = '#eab308';

        // Legs (tactical)
        ctx.fillStyle = '#292524';
        ctx.fillRect(-6, 8, 5, 11);
        ctx.fillRect(1, 8, 5, 11);

        // Knee pads
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-6, 13, 5, 4);
        ctx.fillRect(1, 13, 5, 4);

        // Boots
        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(-7, 17, 6, 4);
        ctx.fillRect(1, 17, 6, 4);

        // Tactical vest body
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.roundRect(-10, -4, 20, 14, 3);
        ctx.fill();

        // Vest pouches
        ctx.fillStyle = '#292524';
        ctx.fillRect(-9, 0, 6, 5);
        ctx.fillRect(3, 0, 6, 5);

        // Vest insignia
        ctx.fillStyle = c;
        ctx.font = 'bold 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SEC', 0, 8);

        // Yellow shoulder pads
        ctx.fillStyle = c;
        ctx.fillRect(-13, -4, 4, 5);
        ctx.fillRect(9, -4, 4, 5);

        // Arms (muscular — raised in guard stance)
        ctx.fillStyle = '#292524';
        ctx.fillRect(-16, -2, 6, 8);
        ctx.fillRect(10, -2, 6, 8);

        // Fists
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.roundRect(-18, 4, 7, 7, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(11, 4, 7, 7, 2);
        ctx.fill();

        // Knuckles
        ctx.fillStyle = '#374151';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-16 + i * 2, 4, 1.5, 2);
            ctx.fillRect(13 + i * 2, 4, 1.5, 2);
        }

        // Neck
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(-3, -6, 6, 3);

        // Head
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(0, -11, 9, 0, Math.PI * 2);
        ctx.fill();

        // Tactical sunglasses
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.roundRect(-8, -15, 16, 5, 2);
        ctx.fill();
        // Lens tint
        ctx.fillStyle = 'rgba(234,179,8,0.3)';
        ctx.beginPath();
        ctx.roundRect(-7, -14, 14, 3, 1);
        ctx.fill();

        // Jaw (strong)
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(-5, -4, 10, 3);

        // Mouth (stern line)
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-3, -5);
        ctx.lineTo(3, -5);
        ctx.stroke();

        // Crew cut hair
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-9, -20, 18, 6);
        ctx.beginPath();
        ctx.arc(0, -20, 9, Math.PI, 0);
        ctx.fill();

        // Ear comms
        ctx.fillStyle = '#d4d4d4';
        ctx.beginPath();
        ctx.arc(-9, -12, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4d4d4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-9, -10);
        ctx.lineTo(-14, -5);
        ctx.stroke();
    }

    update(enemies, projectiles, ProjectileClass) {
        if (this.cooldown > 0) {
            this.cooldown--;
        }

        // Find Target if none or current is out of range/dead
        if (!this.target || this.target.health <= 0 || this.distanceTo(this.target) > this.range) {
            this.target = this.findTarget(enemies);
        }

        // Shoot at target
        if (this.target && this.cooldown <= 0) {
            this.shoot(projectiles, ProjectileClass);
            this.cooldown = this.fireRate;
        }
    }

    findTarget(enemies) {
        let closest = null;
        let minDistance = Infinity;

        for (let enemy of enemies) {
            const dist = this.distanceTo(enemy);
            if (dist <= this.range && dist < minDistance) {
                minDistance = dist;
                closest = enemy;
            }
        }
        return closest;
    }

    distanceTo(entity) {
        return Math.hypot(this.x - entity.x, this.y - entity.y);
    }

    shoot(projectiles, ProjectileClass) {
        // Calculate angle to target
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        
        // Spawn projectile
        const projX = this.x + Math.cos(angle) * this.radius;
        const projY = this.y + Math.sin(angle) * this.radius;
        
        projectiles.push(new ProjectileClass(projX, projY, this.target, this.damage, this.color, this.type));

        // Play shot sound effect
        if (this.type === 'protester') {
            audio.playProtesterShot();
        } else if (this.type === 'lawyer') {
            audio.playLawyerShot();
        } else if (this.type === 'security') {
            audio.playSecurityShot();
        }
    }
}
