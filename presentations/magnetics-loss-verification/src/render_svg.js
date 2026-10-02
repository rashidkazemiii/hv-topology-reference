// Rasterise an SVG to PNG with sharp (librsvg): node render_svg.js in.svg out.png [scale]
const sharp = require("sharp");

const [, , input, output, scale = "2.5"] = process.argv;
sharp(input, { density: 72 * Number(scale) })
  .png()
  .toFile(output)
  .then((info) => console.log(`${output}: ${info.width}x${info.height}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
