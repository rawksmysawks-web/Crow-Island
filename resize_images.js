const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mappings = {
    'event_it_comes_v2_1775210494795.png': { dest: 'events/event_it_comes.png', size: [128, 128] },
    'icon_fear_pixel_1775210511030.png': { dest: 'icon_fear_pixel.png', size: [64, 64] },
    'card_art_light_v2_1775210527730.png': { dest: 'cards/card_art_light.png', size: [300, 120] },
    'card_art_movement_v2_1775210543563.png': { dest: 'cards/card_art_movement.png', size: [300, 120] },
    'card_art_shelter_v2_1775210556142.png': { dest: 'cards/card_art_shelter.png', size: [300, 120] },
    'card_art_panic_v2_1775210570656.png': { dest: 'cards/card_art_panic.png', size: [300, 120] },
    'event_stumble_pixel_1775211731551.png': { dest: 'events/event_stumble.png', size: [128, 128] },
    'event_rustling_pixel_1775212137189.png': { dest: 'events/event_rustling.png', size: [128, 128] }
};

const srcDir = 'C:\\Users\\rawks\\.gemini\\antigravity\\brain\\a46703c1-b6f6-40c2-b38b-fe062a34c90d\\';
const outDir = 'C:\\Users\\rawks\\.gemini\\antigravity\\scratch\\crow-island-v2\\assets\\images\\';

async function run() {
    for (const [srcName, cfg] of Object.entries(mappings)) {
        const destPath = path.join(outDir, cfg.dest);
        const subDir = path.dirname(destPath);
        
        if (!fs.existsSync(subDir)) {
            fs.mkdirSync(subDir, { recursive: true });
        }

        await sharp(path.join(srcDir, srcName))
            .resize(cfg.size[0], cfg.size[1], {
                fit: 'cover',
                position: 'center'
            })
            .toFile(destPath);
        console.log(`Resized ${cfg.dest}`);
    }
}
run().catch(console.error);
