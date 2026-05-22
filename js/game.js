import { drawMap, pathWaypoints } from './map.js';
import { spawnEnemy } from './enemies.js';
import { Projectile } from './projectiles.js';
import { GameOverAnimation } from './animation.js';

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.02;
        this.size = Math.random() * 3 + 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        this.state = 'start'; // 'start', 'playing', 'animating_gameover', 'gameover'
        this.money = 250;
        this.lives = 1; // 1 life, if target is reached, it's game over
        this.wave = 1;
        
        this.enemies = [];
        this.defenders = [];
        this.projectiles = [];
        this.particles = [];
        
        this.frames = 0;
        this.spawnTimer = 100;
        
        this.gameOverAnimation = null;
        
        this.updateHUD();
    }

    start() {
        this.state = 'playing';
        this.money = 250;
        this.lives = 1;
        this.wave = 1;
        this.enemies = [];
        this.defenders = [];
        this.projectiles = [];
        this.particles = [];
        this.frames = 0;
        this.spawnTimer = 100;
        this.updateHUD();
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }

    update() {
        if (this.state !== 'playing' && this.state !== 'animating_gameover') return;

        this.frames++;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Map
        const planeState = this.gameOverAnimation ? this.gameOverAnimation.state : null;
        drawMap(this.ctx, this.frames, this.state, planeState);

        if (this.state === 'playing') {
            // Spawn Enemies
            this.spawnTimer--;
            if (this.spawnTimer <= 0) {
                this.enemies.push(spawnEnemy(this.wave));
                this.spawnTimer = Math.max(30, 150 - (this.wave * 10)); // Spawn faster over waves
            }

            // Increase wave every ~20 seconds (1200 frames at 60fps)
            if (this.frames > 0 && this.frames % 1200 === 0) {
                this.wave++;
                this.updateHUD();
            }

            // Update and draw defenders
            for (let d of this.defenders) {
                d.update(this.enemies, this.projectiles, Projectile);
                d.draw(this.ctx);
            }

            // Update and draw projectiles
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                let p = this.projectiles[i];
                p.update();
                p.draw(this.ctx);
                if (p.hit) {
                    if (p.target) {
                        if (p.sourceType === 'protester') {
                            p.target.applyEffect('slow', 60);
                        } else if (p.sourceType === 'lawyer') {
                            p.target.applyEffect('stun', 30);
                        }
                    }
                    this.createBlastEffect(p.x, p.y, p.color);
                    this.projectiles.splice(i, 1);
                }
            }

            // Update and draw particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                let pt = this.particles[i];
                pt.update();
                pt.draw(this.ctx);
                if (pt.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }

            // Update and draw enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                let e = this.enemies[i];
                e.update();
                e.draw(this.ctx);
                
                // Dead enemy
                if (e.health <= 0) {
                    this.money += e.reward;
                    this.updateHUD();
                    this.enemies.splice(i, 1);
                } 
                // Reached Target
                else if (e.hasReachedTarget()) {
                    this.triggerGameOver();
                    this.enemies.splice(i, 1);
                }
            }
        } else if (this.state === 'animating_gameover') {
            // Freeze gameplay, just draw defenders and remaining enemies
            for (let d of this.defenders) d.draw(this.ctx);
            for (let e of this.enemies) e.draw(this.ctx);

            this.gameOverAnimation.update();
            this.gameOverAnimation.draw(this.ctx);

            if (this.gameOverAnimation.state === 'done') {
                this.state = 'gameover';
                document.getElementById('gameOverScreen').classList.remove('hidden');
            }
        }
    }

    createBlastEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    triggerGameOver() {
        this.lives--;
        this.updateHUD();
        this.state = 'animating_gameover';
        const targetPos = pathWaypoints[pathWaypoints.length - 1];
        this.gameOverAnimation = new GameOverAnimation(targetPos.x, targetPos.y);
    }

    placeDefender(DefenderClass, x, y, typeInfo) {
        if (this.state !== 'playing') return false;
        if (this.money >= typeInfo.cost) {
            this.money -= typeInfo.cost;
            this.defenders.push(new DefenderClass(x, y, typeInfo.id));
            this.updateHUD();
            return true;
        }
        return false;
    }

    updateHUD() {
        document.getElementById('moneyDisplay').innerText = `₱${this.money}`;
        document.getElementById('waveDisplay').innerText = this.wave;
        document.getElementById('livesDisplay').innerText = this.lives;
    }
}
