const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


const bookCtrl = require('../controllers/book');

router.get('/bestrating', bookCtrl.getThreeBest);
router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);


module.exports = router;