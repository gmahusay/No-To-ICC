import { Game } from './js/game.js?v=6';
import { Defender, defenderTypes } from './js/defenders.js?v=3';
import { audio } from './js/audio.js?v=3';

// Setup Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize Game
const game = new Game(canvas, ctx);

// ── Draw mini character previews on the toolbar icon canvases ──
function initToolbarIcons() {
    const iconMap = {
        'icon-protester': 'protester',
        'icon-lawyer':    'lawyer',
        'icon-security':  'security'
    };

    for (const [canvasId, type] of Object.entries(iconMap)) {
        const iconCanvas = document.getElementById(canvasId);
        if (!iconCanvas) continue;
        const iconCtx = iconCanvas.getContext('2d');

        // Clear with transparent background
        iconCtx.clearRect(0, 0, 56, 56);

        // Create a temporary Defender and use its private draw method
        // We translate to the center of the canvas and scale down to fit
        iconCtx.save();
        iconCtx.translate(28, 32); // center, slightly lower to show full body
        iconCtx.scale(1.1, 1.1);   // slight scale up to fill the preview

        const dummy = Object.create(Defender.prototype);
        dummy.type = type;
        dummy.color = defenderTypes[type].color;
        dummy.cooldown = 0; // show ready state

        if (type === 'protester') dummy._drawProtester(iconCtx);
        else if (type === 'lawyer') dummy._drawLawyer(iconCtx);
        else dummy._drawSecurity(iconCtx);

        iconCtx.restore();
    }
}

initToolbarIcons();

// ── Draw Supreme Court Icon ──
function initPowerIcon() {
    const iconCanvas = document.getElementById('icon-power-bomb');
    if (!iconCanvas) return;
    const ctx = iconCanvas.getContext('2d');
    
    ctx.clearRect(0, 0, 48, 48);
    
    ctx.save();
    ctx.translate(24, 24);
    ctx.rotate(-Math.PI / 4);
    
    // Handle
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-3, -5, 6, 20);
    
    // Head
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12, -12, 24, 10);
    
    // Head ends
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.roundRect(-15, -11, 30, 8, 2);
    ctx.fill();
    
    ctx.restore();
    
    // Strike lines
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(12, 36); ctx.lineTo(6, 42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(36, 36); ctx.lineTo(42, 42); ctx.stroke();
}
initPowerIcon();

// Game Loop
function animate() {
    game.update();
    requestAnimationFrame(animate);
}

// Start loop
animate();

// UI Event Listeners
document.getElementById('startBtn').addEventListener('click', () => {
    audio.unmute();
    audio.resume();
    game.start();
    document.getElementById('power-toolbar').style.display = 'flex';
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.4;
    bgMusic.play().catch(e => console.log('Music play failed (add music.mp3 to the folder).', e));
});

document.getElementById('restartBtn').addEventListener('click', () => {
    audio.unmute();
    audio.resume();
    game.start();
    document.getElementById('power-toolbar').style.display = 'flex';
    
    // Reset Supreme Court Power Bomb
    scCooldownTimer = 0;
    if (scCooldownInterval) clearInterval(scCooldownInterval);
    if (scActiveCheckInterval) clearInterval(scActiveCheckInterval);
    updateScCooldownUI();
    document.getElementById('btn-supreme-court').classList.remove('disabled');

    const bgMusic = document.getElementById('bgMusic');
    bgMusic.currentTime = 0;
    bgMusic.volume = 0.4;
    bgMusic.play().catch(e => console.log('Music play failed (add music.mp3 to the folder).', e));
});

// Toolbar Interactions
let selectedDefenderType = null;
const towerBtns = document.querySelectorAll('.tower-btn');

towerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Deselect all
        towerBtns.forEach(b => b.classList.remove('selected'));
        // Select clicked
        btn.classList.add('selected');
        selectedDefenderType = btn.dataset.type;
    });
});

// Canvas Interactions (Placing Towers)
canvas.addEventListener('click', (e) => {
    if (game.state !== 'playing' || !selectedDefenderType) return;

    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const typeInfo = defenderTypes[selectedDefenderType];

    // Check if player has enough money before placing
    if (game.money >= typeInfo.cost) {
        const success = game.placeDefender(Defender, x, y, { id: selectedDefenderType, ...typeInfo });
        if (success) {
            audio.playPlace();
        }
    } else {
        // Flash money display red
        const moneyDisplay = document.getElementById('moneyDisplay');
        moneyDisplay.style.color = '#ef4444';
        setTimeout(() => {
            moneyDisplay.style.color = '#10b981';
        }, 500);
    }
});

// Power Bomb Interaction
let scCooldownTimer = 0;
let scCooldownInterval = null;
let scActiveCheckInterval = null;
const scBtn = document.getElementById('btn-supreme-court');
const scCooldownDisplay = document.getElementById('sc-cooldown');

scBtn.addEventListener('click', () => {
    if (game.state !== 'playing' || scBtn.classList.contains('disabled')) return;

    // Activate the Supreme Court effect
    game.activateSupremeCourt();

    scBtn.classList.add('disabled');

    // If there are no enemies, start cooldown immediately
    if (game.enemies.length === 0) {
        startScCooldown();
    } else {
        scCooldownDisplay.innerText = 'Active';
        if (scActiveCheckInterval) clearInterval(scActiveCheckInterval);
        
        // Wait until all enemies have reached the start (out of frame)
        scActiveCheckInterval = setInterval(() => {
            if (!game.isAnyEnemyRetreatingToStart()) {
                clearInterval(scActiveCheckInterval);
                startScCooldown();
            }
        }, 100);
    }
});

function startScCooldown() {
    scCooldownTimer = 60;
    updateScCooldownUI();

    if (scCooldownInterval) clearInterval(scCooldownInterval);
    scCooldownInterval = setInterval(() => {
        scCooldownTimer--;
        updateScCooldownUI();
        if (scCooldownTimer <= 0) {
            clearInterval(scCooldownInterval);
            scBtn.classList.remove('disabled');
        }
    }, 1000);
}

function updateScCooldownUI() {
    if (scCooldownTimer > 0) {
        scCooldownDisplay.innerText = `${scCooldownTimer}s`;
    } else {
        scCooldownDisplay.innerText = 'Ready';
    }
}

