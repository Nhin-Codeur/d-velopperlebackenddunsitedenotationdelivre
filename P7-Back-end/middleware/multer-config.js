const multer = require('multer');
const sharp = require('sharp');


const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: async (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').split('.')[0];

        const fileResized = sharp(file).resize(206, 260).toFile('output.webp');
        ;
        const extension = MIME_TYPES[fileResized.mimetype];
        callback(null);
    }
});

module.exports = multer({ storage: storage }).single('image');