const Jimp = require('jimp');
const fs = require('fs');

function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + 
    Math.pow(c1.g - c2.g, 2) + 
    Math.pow(c1.b - c2.b, 2)
  );
}

async function makeTransparent(filepath, outpath, tolerance = 30) {
  try {
    if (!fs.existsSync(filepath)) {
       console.log("File not found:", filepath);
       return;
    }
    const image = await Jimp.read(filepath);
    
    // We generated these with a solid lime green background (#00FF00)
    const bgColor = { r: 0, g: 255, b: 0, a: 255 };

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      const pixelColor = { r, g, b };
      // Increase tolerance substantially for AI-generated greenscreen artifacts
      if (colorDistance(bgColor, pixelColor) < tolerance) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      }
    });

    await image.writeAsync(outpath);
    console.log(`Successfully applied transparency to ${outpath}`);
  } catch (e) {
    console.error(`Error processing ${filepath}:`, e.message);
  }
}

async function main() {
  const images = [
    'text_your_hand.png'
  ];

  for (const img of images) {
     await makeTransparent(`./assets/images/${img}`, `./assets/images/${img}`, 120);
  }
}

main();
