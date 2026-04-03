const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, 'assets', 'images');

if (!fs.existsSync(assetsDir)) {
    console.error('Assets directory not found at', assetsDir);
    process.exit(1);
}

async function createPauseIcon() {
    const size = 64;
    const image = new Jimp(size, size, 0x00000000); // Transparent
    const color = 0xFFE082FF; // Gold/Parchment color (#ffe082)
    
    // Draw two vertical bars
    const barWidth = 12;
    const barHeight = 36;
    const spacing = 10;
    const startY = (size - barHeight) / 2;
    const startX1 = (size - (barWidth * 2 + spacing)) / 2;
    const startX2 = startX1 + barWidth + spacing;

    for (let x = 0; x < barWidth; x++) {
        for (let y = 0; y < barHeight; y++) {
            image.setPixelColor(color, startX1 + x, startY + y);
            image.setPixelColor(color, startX2 + x, startY + y);
        }
    }

    const outputPath = path.join(assetsDir, 'icon_pause.png');
    await image.writeAsync(outputPath);
    console.log('Created icon_pause.png');
}

async function createMovementIcon() {
    // Simple pixel boot/foot silhouette
    const size = 64;
    const image = new Jimp(size, size, 0x00000000);
    const color = 0xFFE082FF;

    // A very basic boot shape
    const pixels = [
        [28,20], [29,20], [30,20],
        [27,21], [28,21], [29,21], [30,21], [31,21],
        [27,22], [28,22], [29,22], [30,22], [31,22],
        [27,23], [28,23], [29,23], [30,23], [31,23],
        [27,24], [28,24], [29,24], [30,24], [31,24],
        [27,25], [28,25], [29,25], [30,25], [31,25],
        [27,26], [28,26], [29,26], [30,26], [31,26],
        [27,27], [28,27], [29,27], [30,27], [31,27],
        [27,28], [28,28], [29,28], [30,28], [31,28], [32,28], [33,28], [34,28],
        [27,29], [28,29], [29,29], [30,29], [31,29], [32,29], [33,29], [34,29], [35,29],
        [27,30], [28,30], [29,30], [30,30], [31,30], [32,30], [33,30], [34,30], [35,30], [36,30],
        [28,31], [29,31], [30,31], [31,31], [32,31], [33,31], [34,31], [35,31], [36,31]
    ];

    pixels.forEach(([x, y]) => {
        // scale it up a bit
        for(let dx=0; dx<2; dx++) {
            for(let dy=0; dy<2; dy++) {
                image.setPixelColor(color, x*1.5 + dx, y*1.5 + dy);
            }
        }
    });

    const outputPath = path.join(assetsDir, 'icon_movement.png');
    await image.writeAsync(outputPath);
    console.log('Created icon_movement.png');
}

async function createTacticalIcon() {
    // Simple brain-like blob
    const size = 64;
    const image = new Jimp(size, size, 0x00000000);
    const color = 0xFFE082FF;

    const drawCircle = (cx, cy, r) => {
        for (let x = cx - r; x <= cx + r; x++) {
            for (let y = cy - r; y <= cy + r; y++) {
                if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= r) {
                    image.setPixelColor(color, x, y);
                }
            }
        }
    };

    drawCircle(26, 30, 10);
    drawCircle(38, 30, 10);
    drawCircle(32, 25, 8);
    drawCircle(32, 35, 6);

    const outputPath = path.join(assetsDir, 'icon_tactical.png');
    await image.writeAsync(outputPath);
    console.log('Created icon_tactical.png');
}

async function createFearIcon() {
    // Simple eye silhouette
    const size = 32;
    const image = new Jimp(size, size, 0x00000000);
    const color = 0xFFE082FF;

    const drawCircle = (cx, cy, r) => {
        for (let x = cx - r; x <= cx + r; x++) {
            for (let y = cy - r; y <= cy + r; y++) {
                if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= r) {
                    image.setPixelColor(color, x, y);
                }
            }
        }
    };

    drawCircle(16, 16, 8); // Outer eye
    image.setPixelColor(0x000000FF, 16, 16); // Pupil

    const outputPath = path.join(assetsDir, 'icon_fear.png');
    await image.writeAsync(outputPath);
    console.log('Created icon_fear.png');
}

async function createShieldIcon() {
    // Simple shield shape
    const size = 32;
    const image = new Jimp(size, size, 0x00000000);
    const color = 0xFFE082FF;

    for (let x = 8; x < 24; x++) {
        for (let y = 6; y < 20; y++) {
            image.setPixelColor(color, x, y);
        }
    }
    // Bottom point
    for (let x = 12; x < 20; x++) {
        image.setPixelColor(color, x, 22);
    }

    const outputPath = path.join(assetsDir, 'icon_shield.png');
    await image.writeAsync(outputPath);
    console.log('Created icon_shield.png');
}

async function run() {
    await createPauseIcon();
    await createMovementIcon();
    await createTacticalIcon();
    await createFearIcon();
    await createShieldIcon();
    console.log('Finished creating icons.');
}

run();
