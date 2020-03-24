const sharp = require('sharp');

const photoResize = async buffer => {
  return await sharp(buffer)
    .resize(400, 400)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();
};

module.exports = photoResize;
