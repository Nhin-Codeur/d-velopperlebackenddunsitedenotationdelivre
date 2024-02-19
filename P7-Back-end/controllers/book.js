const Book = require('../models/book');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const originalImagePath = req.file.path;
    const outputPath = path.join(
        "images",
        path.basename(originalImagePath, path.extname(originalImagePath)) + ".webp"
    );


    if (req.file) {


        sharp.cache(false);
        sharp(originalImagePath)
            .toFormat("webp")
            .resize({
                width: 206,
                height: 260,
                fit: "contain"
            })
            .toFile('./images/' + req.file.filename.split('.')[0] + '.webp')
            .then(() => {
                if (fs.existsSync(originalImagePath)) {
                    fs.unlinkSync(originalImagePath);
                }
                req.file.path = outputPath;

            })
            .catch((error) => {
                console.error("Error converting image to webp:", error);

            });

    };
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0] + '.webp'}`
    });


    book.save()
        .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    console.log(req.body)
    console.log(bookObject);
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre modifié!' }))
                        .catch(error => res.status(401).json({ error }));
                });

            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllBooks = (req, res, next) => {
    Book.find().sort([['averageRating', -1]]).then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error.message
            });
        }
    );
};

exports.rateBook = (req, res, next) => {
    const grade = req.body.rating;
    const userId = req.auth.userId;
    const bookId = req.params.id;

    Book.findOne({ _id: bookId })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' });
            }

            // verifier si l'utilisateur à déjà noté ce livre
            let userRating = book.ratings.find(rating => rating.userId === userId);

            if (userRating) {
                return res.status(403).json({ message: 'Vous avez déjà noté ce livre' });
            }

            // ajouter nv note
            book.ratings.push({ userId, grade });

            // moyenne note
            console.log(book.ratings.length);
            let totalRatings = book.ratings.length;

            let sumRatings = book.ratings.reduce((accumulator, currentValue) => accumulator + currentValue.grade, 0);

            book.averageRating = sumRatings / totalRatings;

            return book.save();
        })
        .then(book => {
            res.status(200).json(book);
        }).catch(
            (error) => {
                res.status(400).json({
                    error: error.message
                });
            }
        );
}

exports.getThreeBest = (req, res, next) => {
    Book.find().sort([['averageRating', -1]]).limit(3).then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error.message
            });
        }
    );

}
