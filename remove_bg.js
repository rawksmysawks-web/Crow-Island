const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

async function processIcon() {
  const sourcePath = 'C:\\Users\\rawks\\.gemini\\antigravity\\brain\\a46703c1-b6f6-40c2-b38b-fe062a34c90d\\icon_fear_v3_1775217968818.png';
  const targetPath = path.join(__dirname, 'assets/images/icon_fear_pixel.png');
  
  // Read the generated artifact
  const image = await Jimp.read(sourcePath);
  
  // Get color of top-left pixel (which should be the solid green bg)
  const targetColor = image.getPixelColor(0, 0);
  
  const queue = [{ x: 0, y: 0 }];
  const visited = new Set();
  
  function getColorDist(c1, c2) {
    const rgba1 = Jimp.intToRGBA(c1);
    const rgba2 = Jimp.intToRGBA(c2);
    // Ignore alpha for fuzz
    return Math.sqrt(
      Math.pow(rgba1.r - rgba2.r, 2) +
      Math.pow(rgba1.g - rgba2.g, 2) +
      Math.pow(rgba1.b - rgba2.b, 2)
    );
  }

  // 15% distance max for edge-smoothing
  const fuzzThreshold = 255 * 0.15 * Math.sqrt(3);

  while (queue.length > 0) {
    const { x, y } = queue.shift();
    const key = `${x},${y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    if (x < 0 || x >= image.bitmap.width || y < 0 || y >= image.bitmap.height) continue;
    
    const currentColor = image.getPixelColor(x, y);
    
    if (getColorDist(currentColor, targetColor) <= fuzzThreshold) {
      image.setPixelColor(0x00000000, x, y); // Set transparent
      queue.push({ x: x + 1, y });
      queue.push({ x: x - 1, y });
      queue.push({ x, y: y + 1 });
      queue.push({ x, y: y - 1 });
    }
  }
  
  // Save directly to the repo, overwriting the old fear icon
  await image.writeAsync(targetPath);
  console.log('Background removed successfully and saved to', targetPath);
}

processIcon().catch(console.error);
