import { Game } from './js/game.js';
import { Defender, defenderTypes } from './js/defenders.js';

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

// Game Loop
function animate() {
    game.update();
    requestAnimationFrame(animate);
}

// Start loop
animate();

// UI Event Listeners
document.getElementById('startBtn').addEventListener('click', () => {
    game.start();
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.4;
    bgMusic.play().catch(e => console.log('Music play failed (add music.mp3 to the folder).', e));
});

document.getElementById('restartBtn').addEventListener('click', () => {
    game.start();
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
    } else {
        // Flash money display red
        const moneyDisplay = document.getElementById('moneyDisplay');
        moneyDisplay.style.color = '#ef4444';
        setTimeout(() => {
            moneyDisplay.style.color = '#10b981';
        }, 500);
    }
});

