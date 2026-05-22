export const cellSize = 50;
export const mapWidth = 800;
export const mapHeight = 600;

// Path defined as an array of waypoints (center of the path)
export const pathWaypoints = [
    {x: -50, y: 125}, // Start slightly offscreen
    {x: 225, y: 125},
    {x: 225, y: 475},
    {x: 575, y: 475},
    {x: 575, y: 275},
    {x: 750, y: 275}  // End AT the target figure
];

// Load background image
const bgImage = new Image();
bgImage.src = 'senate_map_bg1.png';
let bgLoaded = false;
bgImage.onload = () => bgLoaded = true;

export function drawMap(ctx, frames = 0, gameState = 'start', planeState = null) {
    // Fill background
    if (bgLoaded) {
        ctx.drawImage(bgImage, 0, 0, mapWidth, mapHeight);
        // Slightly dim the background so the path and characters stand out better
        ctx.fillStyle = 'rgba(15, 23, 42, .1)';
        ctx.fillRect(0, 0, mapWidth, mapHeight);
    } else {
        ctx.fillStyle = '#fff'; // Slate 800 
        ctx.fillRect(0, 0, mapWidth, mapHeight);
    }

    // Draw the path
    ctx.strokeStyle = 'rgba(255, 255, 255, 0)'; // Slate 700
    ctx.lineWidth = cellSize; // Path width equal to cell size
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    
    ctx.beginPath();
    ctx.moveTo(pathWaypoints[0].x, pathWaypoints[0].y);
    for (let i = 1; i < pathWaypoints.length; i++) {
        ctx.lineTo(pathWaypoints[i].x, pathWaypoints[i].y);
    }
    ctx.stroke();
    
    // Draw grid overlay for placement aesthetics
    ctx.strokeStyle = 'rgba(255, 255, 255, 0)';
    ctx.lineWidth = 1;
    for(let y = 0; y < mapHeight; y += cellSize) {
        ctx.beginPath(); 
        ctx.moveTo(0, y); 
        ctx.lineTo(mapWidth, y); 
        ctx.stroke();
    }
    for(let x = 0; x < mapWidth; x += cellSize) {
        ctx.beginPath(); 
        ctx.moveTo(x, 0); 
        ctx.lineTo(x, mapHeight); 
        ctx.stroke();
    }
    
    // Draw Target Area (The Senator/President)
    const platformX = 750;
    const platformY = 275;

    let drawSenator = true;
    let senatorX = platformX;
    let senatorY = platformY;

    if (planeState === 'departing' || planeState === 'done') {
        drawSenator = false; // Removed
    }

    if (gameState === 'playing' || gameState === 'animating_gameover') {
        // Pacing back and forth (worried)
        senatorX += Math.sin(frames * 0.1) * 8;
    }

    // Target Platform
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.arc(platformX, platformY + 20, 28, 0, Math.PI * 2);
    ctx.fill();

    if (drawSenator) {
        // Glowing aura pulse effect
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.beginPath();
        ctx.arc(senatorX, senatorY, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore(); // shadow reset

        // Target Figure body (Barong Tagalog)
        ctx.fillStyle = '#f8fafc'; // off-white fabric
        ctx.fillRect(senatorX - 9, senatorY + 3, 18, 15);
        
        // Barong Tagalog embroidery (subtle line down the center)
        ctx.fillStyle = '#cbd5e1'; // light slate for embroidery texture
        ctx.fillRect(senatorX - 2, senatorY + 3, 4, 15);
        
        // Target Figure head (Bald)
        ctx.fillStyle = '#fcd34d'; // skin tone
        ctx.beginPath();
        ctx.arc(senatorX, senatorY - 5, 9, 0, Math.PI * 2);
        ctx.fill();
        
        // Add face (eyes and mouth)
        ctx.fillStyle = '#1c1917'; // dark color for features
        // Left eye
        ctx.beginPath();
        ctx.arc(senatorX - 3, senatorY - 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.arc(senatorX + 3, senatorY - 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Mouth (frown or trembling)
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (planeState === 'landing' || gameState === 'playing' || gameState === 'animating_gameover') {
            ctx.arc(senatorX, senatorY - 1, 3, Math.PI + 0.5, -0.5, false); // sad frown
        } else {
            ctx.arc(senatorX, senatorY - 2, 3, Math.PI, 0, false); // normal frown
        }
        ctx.stroke();

        // Tears if plane is landing
        if (planeState === 'landing') {
            ctx.fillStyle = '#38bdf8'; // blue tear
            ctx.beginPath(); ctx.ellipse(senatorX - 4, senatorY - 3, 1, 2, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(senatorX + 4, senatorY - 3, 1, 2, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(senatorX - 3, senatorY, 1, 2, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(senatorX + 3, senatorY, 1, 2, 0, 0, Math.PI*2); ctx.fill();
        }

        // Sweat drop if worried
        if (gameState === 'playing' && !planeState) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(senatorX + 6, senatorY - 9, 1.5, 2.5, Math.PI/4, 0, Math.PI*2);
            ctx.fill();
        }
        
        // Add a slight shine to the bald head
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(senatorX - 4, senatorY - 9, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SENATOR', senatorX, senatorY + 40);
    }
}
